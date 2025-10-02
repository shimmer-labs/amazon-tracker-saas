'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'shimmerlogan+2@gmail.com' // Your admin email

export default function Admin() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.email !== ADMIN_EMAIL) {
      router.push('/dashboard')
      return
    }
    
    setAuthorized(true)
    loadStats()
  }

  async function loadStats() {
    // ... rest of your existing loadStats code
    const { data: profiles } = await supabase
      .from('profiles')
      .select('subscription_tier')
    
    const tierCounts = {
      free: profiles?.filter(p => p.subscription_tier === 'free').length || 0,
      pro: profiles?.filter(p => p.subscription_tier === 'pro').length || 0,
      business: profiles?.filter(p => p.subscription_tier === 'business').length || 0,
    }

    const { count: productCount } = await supabase
      .from('tracked_products')
      .select('*', { count: 'exact', head: true })

    const { count: snapshotCount } = await supabase
      .from('product_snapshots')
      .select('*', { count: 'exact', head: true })

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { count: recentSnapshots } = await supabase
      .from('product_snapshots')
      .select('*', { count: 'exact', head: true })
      .gte('scraped_at', thirtyDaysAgo)

    const mrr = (tierCounts.pro * 29) + (tierCounts.business * 99)
    const estimatedApifyCost = (recentSnapshots || 0) * 0.005
    const profit = mrr - estimatedApifyCost

    setStats({
      tierCounts,
      productCount,
      snapshotCount,
      recentSnapshots,
      mrr,
      estimatedApifyCost,
      profit
    })
    
    setLoading(false)
  }

  if (!authorized || loading) {
    return <div className="min-h-screen bg-gray-900 text-white p-8">Loading...</div>
  }

  return (
    // ... rest of your existing JSX
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <a href="/dashboard" className="text-sm text-gray-400 hover:text-white">
            Back to Dashboard
          </a>
        </div>
        
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Free Users</p>
            <p className="text-4xl font-bold">{stats.tierCounts.free}</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Pro Users</p>
            <p className="text-4xl font-bold text-blue-400">{stats.tierCounts.pro}</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Business Users</p>
            <p className="text-4xl font-bold text-purple-400">{stats.tierCounts.business}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Monthly Recurring Revenue</p>
            <p className="text-4xl font-bold text-green-400">${stats.mrr}</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Est. Monthly Profit</p>
            <p className="text-4xl font-bold text-green-400">${stats.profit.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">MRR - Apify costs</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Tracked Products</p>
            <p className="text-3xl font-bold">{stats.productCount}</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Scrapes (30d)</p>
            <p className="text-3xl font-bold">{stats.recentSnapshots}</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Est. Apify Cost (30d)</p>
            <p className="text-3xl font-bold text-red-400">${stats.estimatedApifyCost.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-8 bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
          <p className="text-yellow-200 text-sm">
            <strong>Note:</strong> Apify costs are estimated at $0.005 per scrape. Check actual usage in your Apify dashboard at https://console.apify.com/billing
          </p>
        </div>
      </div