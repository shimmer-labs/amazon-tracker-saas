import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ApifyClient } from 'apify-client'
import { sendPriceDropAlert } from '@/lib/email'

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('=== DAILY CRON START ===')
    
    const { data: products } = await supabase
      .from('tracked_products')
      .select(`
        *,
        profiles!inner(email, subscription_tier, email_alerts_enabled, price_drop_threshold)
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
          // Get previous snapshot before inserting new one
          const { data: previousSnapshots } = await supabase
            .from('product_snapshots')
            .select('price')
            .eq('tracked_product_id', product.id)
            .order('scraped_at', { ascending: false })
            .limit(1)
          
          // Insert new snapshot
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
          
          // Check for price drop
          if (previousSnapshots && previousSnapshots.length > 0) {
            const oldPrice = previousSnapshots[0].price
            const newPrice = item.price
            
            if (oldPrice && newPrice && newPrice < oldPrice) {
              const percentageChange = ((oldPrice - newPrice) / oldPrice) * 100
              
              const profile = product.profiles
              
              if (profile?.email_alerts_enabled && percentageChange >= (profile.price_drop_threshold || 5)) {
                // Check if we already sent an alert recently
                const { data: recentAlert } = await supabase
                  .from('price_alerts')
                  .select('id')
                  .eq('tracked_product_id', product.id)
                  .eq('alert_type', 'price_drop')
                  .gte('sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
                  .maybeSingle()
                
                if (!recentAlert) {
                  console.log(`Sending price drop alert for ${item.asin}: ${oldPrice} -> ${newPrice}`)
                  
                  await sendPriceDropAlert({
                    userEmail: profile.email,
                    productAsin: item.asin,
                    productTitle: item.title || 'Unknown Product',
                    oldPrice,
                    newPrice,
                    percentageChange,
                    marketplace: product.marketplace
                  })
                  
                  await supabase.from('price_alerts').insert({
                    tracked_product_id: product.id,
                    alert_type: 'price_drop',
                    old_value: oldPrice,
                    new_value: newPrice
                  })
                }
              }
            }
          }
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