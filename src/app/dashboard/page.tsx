'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import PriceChart from '@/components/PriceChart'

const TIER_LIMITS = {
  free: 3,
  pro: 25,
  business: 100
}

const TIER_FREQUENCY = {
  free: 'Weekly',
  pro: 'Daily',
  business: '4x Daily'
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newAsin, setNewAsin] = useState('')
  const [newNickname, setNewNickname] = useState('')
  const [marketplace, setMarketplace] = useState('US')
  const [adding, setAdding] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }
    
    setUser(user)
    
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    setProfile(profileData)
    loadProducts(user.id)
  }

  async function loadProducts(userId: string) {
    const { data: products, error } = await supabase
      .from('tracked_products')
      .select(`
        *,
        product_snapshots (
          price,
          currency,
          rating,
          review_count,
          bsr_rank,
          bsr_category,
          in_stock,
          buy_box_winner,
          title,
          scraped_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    console.log('Load products error:', error)
    console.log('Products data:', products)
    
    const productsWithSnapshots = products?.map(product => {
      const snapshots = product.product_snapshots || []
      console.log(`Product ${product.asin} has ${snapshots.length} snapshots`)
      
      const sortedSnapshots = snapshots.sort((a: any, b: any) => 
        new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime()
      )
      
      return {
        ...product,
        latest_snapshot: sortedSnapshots[0] || null,
        all_snapshots: sortedSnapshots
      }
    })
    
    setProducts(productsWithSnapshots || [])
    setLoading(false)
  }

  async function handleDeleteProduct(productId: string, productAsin: string) {
    if (!confirm(`Are you sure you want to stop tracking ${productAsin}? All historical data will be deleted.`)) {
      return
    }
    
    const { error } = await supabase
      .from('tracked_products')
      .delete()
      .eq('id', productId)
    
    if (error) {
      alert('Error deleting product: ' + error.message)
    } else {
      if (user) {
        loadProducts(user.id)
      }
    }
  }

  async function handleUpgrade(tier: 'pro' | 'business') {
    if (!user) return
    
    const priceId = tier === 'pro' 
      ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO 
      : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS
    
    console.log('PriceId:', priceId)
    console.log('UserId:', user.id)
    
    if (!priceId) {
      alert('Price ID not configured. Check environment variables.')
      return
    }
    
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        priceId, 
        userId: user.id 
      })
    })
    
    const result = await response.json()
    console.log('Response:', result)
    
    if (result.url) {
      window.location.href = result.url
    } else {
      alert('Error: ' + (result.error || 'Unknown error'))
    }
  }

  async function handleScrapeNow() {
    if (!user) return
    
    setLoading(true)
    
    const response = await fetch(`/api/scrape?userId=${user.id}`, {
      method: 'GET',
    })
    
    const result = await response.json()
    console.log('Scrape result:', result)
    
    alert(result.message || result.error || 'Scrape complete!')
    setLoading(false)
    loadProducts(user.id)
  }

  async function handleAddProduct() {
    if (!newAsin.trim() || !user) return
    
    const tier = profile?.subscription_tier || 'free'
    const limit = TIER_LIMITS[tier as keyof typeof TIER_LIMITS]
    
    if (products.length >= limit) {
      alert(`You've reached your ${tier} tier limit of ${limit} products. Upgrade to add more.`)
      return
    }
    
    setAdding(true)
    
    try {
      const { data, error } = await supabase
        .from('tracked_products')
        .insert({
          user_id: user.id,
          asin: newAsin.trim(),
          marketplace,
          nickname: newNickname.trim() || null
        })
        .select()
      
      if (error) {
        console.error('Insert error:', error)
        alert('Error adding product: ' + error.message)
      } else {
        setShowAddModal(false)
        setNewAsin('')
        setNewNickname('')
        await loadProducts(user.id)
      }
    } catch (err: any) {
      console.error('Caught error:', err)
      alert('Error: ' + err.message)
    }
    
    setAdding(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>
  }

  const tier = profile?.subscription_tier || 'free'
  const limit = TIER_LIMITS[tier as keyof typeof TIER_LIMITS]
  const frequency = TIER_FREQUENCY[tier as keyof typeof TIER_FREQUENCY]
  const atLimit = products.length >= limit

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Amazon Tracker</h1>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-400 hover:text-white"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Tracked Products</h2>
            <p className="text-sm text-gray-400 mt-1">
              {products.length} / {limit} products · {frequency} scraping · 
              <span className="capitalize ml-1 text-blue-400">{tier} tier</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleScrapeNow}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Scrape Now
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              disabled={atLimit}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Product
            </button>
          </div>
        </div>

        {atLimit && (
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <p className="text-yellow-200">
              You've reached your {tier} tier limit of {limit} products. 
              <button 
                onClick={() => handleUpgrade('pro')}
                className="ml-2 underline hover:text-yellow-100"
              >
                Upgrade to Pro ($29/mo)
              </button>
            </p>
          </div>
        )}

        {products.length === 0 ? (
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-400 mb-4">No products tracked yet</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => {
              const snapshot = product.latest_snapshot
              
              return (
                <div key={product.id} className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-xl">{product.asin}</p>
                        <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">
                          {product.marketplace}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{product.nickname || 'No nickname'}</p>
                      {snapshot?.title && (
                        <p className="text-sm text-gray-500 mt-2">{snapshot.title.substring(0, 80)}...</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(product.id, product.asin)}
                      className="text-gray-400 hover:text-red-400 transition ml-4"
                      title="Delete product"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  {snapshot ? (
                    <>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                        <div>
                          <p className="text-xs text-gray-500">Price</p>
                          <p className="text-lg font-bold text-green-400">
                            ${snapshot.price?.toFixed(2) || 'N/A'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500">Rating</p>
                          <p className="text-lg font-semibold">
                            {snapshot.rating || 'N/A'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500">Reviews</p>
                          <p className="text-lg font-semibold">
                            {snapshot.review_count?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500">Buy Box</p>
                          <p className="text-sm font-medium truncate">
                            {snapshot.buy_box_winner || 'N/A'}
                          </p>
                        </div>
                        
                        {snapshot.bsr_rank && (
                          <div className="col-span-2">
                            <p className="text-xs text-gray-500">Best Sellers Rank</p>
                            <p className="text-sm">
                              #{snapshot.bsr_rank.toLocaleString()} in {snapshot.bsr_category}
                            </p>
                          </div>
                        )}
                        
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">Last updated</p>
                          <p className="text-xs text-gray-400">
                            {new Date(snapshot.scraped_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      {product.all_snapshots?.length > 1 && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <p className="text-xs text-gray-500 mb-2">Price History</p>
                          <PriceChart snapshots={product.all_snapshots} />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="pt-4 border-t border-gray-700 text-center text-gray-500 text-sm">
                      No data yet - automatic scraping runs {frequency.toLowerCase()}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Add Product to Track</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">ASIN</label>
              <input
                type="text"
                value={newAsin}
                onChange={(e) => setNewAsin(e.target.value)}
                placeholder="B0BSHF7WHW"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Nickname (optional)</label>
              <input
                type="text"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                placeholder="My competitor's product"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Marketplace</label>
              <select
                value={marketplace}
                onChange={(e) => setMarketplace(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="US">Amazon.com (US)</option>
                <option value="UK">Amazon.co.uk (UK)</option>
                <option value="DE">Amazon.de (Germany)</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                disabled={adding || !newAsin.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {adding ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}