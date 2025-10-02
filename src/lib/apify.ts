import { ApifyClient } from 'apify-client'

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
})

export async function scrapeProducts(asins: string[], marketplace = 'US') {
  const actorId = process.env.APIFY_ACTOR_ID!
  
  const run = await client.actor(actorId).call({
    asins,
    marketplace,
    trackBuyBox: true,
  })
  
  const { items } = await client.dataset(run.defaultDatasetId).listItems()
  return items
}