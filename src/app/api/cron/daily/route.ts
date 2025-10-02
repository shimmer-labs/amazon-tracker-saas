import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApifyClient } from 'apify-client'

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
})

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('=== DAILY CRON START ===')
    
    // Get products from free, pro, and business users
    const { data: products } = await supabase
      .from('tracked_products')
      .select(`
        *,
        profiles!inner(email, subscription_tier)
      `)
      .in('profiles.subscription_tier', ['free', 'pro', 'business'])
    
    console.log(`Found ${products?.length || 0} products for daily scrape`)
    
    if (!products || products.length === 0) {
      return NextResponse.json({ message: 'No products to scrape' })
    }
    
    const byMarketplace: Record<string, any[]> = {}
    products.forEach(p => {
      if (!byMarketplace[p.marketplace]) byMarketplace[p.marketplace] = []
      byMarketplace[p.marketplace].push(p)
    })
    
    let totalScraped = 0
    
    for (const [marketplace, marketplaceProducts] of Object.entries(byMarketplace)) {
      const asins = marketplaceProducts.map(p => p.asin)
      console.log(`Scraping ${asins.length} ASINs from ${marketplace}`)
      
      const run = await apifyClient.actor(process.env.APIFY_ACTOR_ID!).call({
        asins,
        marketplace,
        trackBuyBox: true,
      })
      
      const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems()
      
      for (const item of items) {
        const product = marketplaceProducts.find(p => p.asin === item.asin)
        
        if (product) {
          await supabase.from('product_snapshots').insert({
            tracked_product_id: product.id,
            asin: item.asin,
            title: item.title,
            price: item.price,
            currency: item.currency,
            rating: item.rating,
            review_count: item.reviewCount,
            bsr_rank: item.bsr?.rank,
            bsr_category: item.bsr?.category,
            in_stock: item.inStock,
            buy_box_winner: item.buyBoxWinner,
            scraped_at: item.scrapedAt,
          })
          totalScraped++
        }
      }
    }
    
    console.log(`=== DAILY CRON COMPLETE: ${totalScraped} products ===`)
    
    return NextResponse.json({ 
      success: true, 
      productsScraped: totalScraped,
      frequency: 'daily'
    })
    
  } catch (error: any) {
    console.error('Daily cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}