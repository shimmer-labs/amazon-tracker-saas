import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApifyClient } from 'apify-client'

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    console.log('=== SCRAPE START ===')
    console.log('User ID:', userId)
    
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }
    
    const { data: products } = await supabase
      .from('tracked_products')
      .select('*')
      .eq('user_id', userId)
    
    console.log('Products:', products?.length)
    
    if (!products || products.length === 0) {
      return NextResponse.json({ message: 'No products to scrape' })
    }
    
    const asins = products.map(p => p.asin)
    console.log('Calling Apify for ASINs:', asins)
    
    const run = await apifyClient.actor(process.env.APIFY_ACTOR_ID!).call({
      asins,
      marketplace: 'US',
      trackBuyBox: true,
    })
    
    console.log('Apify run:', run.id)
    
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems()
    console.log('Items:', items.length)
    
    for (const item of items) {
      const product = products.find(p => p.asin === item.asin)
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
          image_url: item.imageUrl,
          scraped_at: item.scrapedAt,
        })
      }
    }
    
    return NextResponse.json({ success: true, message: `Scraped ${items.length} products!` })
    
  } catch (error: any) {
    console.error('Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}