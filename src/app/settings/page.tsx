'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function Settings() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true)
  const [priceDropThreshold, setPriceDropThreshold] = useState(5)
  const [saving, setSaving] = useState(false)
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
    
    if (profileData) {
      setProfile(profileData)
      setEmailAlertsEnabled(profileData.email_alerts_enabled ?? true)
      setPriceDropThreshold(profileData.price_drop_threshold ?? 5)
    }
  }

  async function handleSaveSettings() {
    if (!user) return
    
    setSaving(true)
    
    const { error } = await supabase
      .from('profiles')
      .update({
        email_alerts_enabled: emailAlertsEnabled,
        price_drop_threshold: priceDropThreshold
      })
      .eq('id', user.id)
    
    if (error) {
      toast.error('Failed to save settings')
    } else {
      toast.success('Settings saved!')
    }
    
    setSaving(false)
  }

  async function handleManageBilling() {
    if (!user) return
    
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    })
    
    const { url, error } = await response.json()
    
    if (url) {
      window.location.href = url
    } else {
      toast.error(error || 'Failed to open billing portal')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Settings</h1>
          <a href="/dashboard" className="text-sm text-gray-400 hover:text-white">
            Back to Dashboard
          </a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-2xl font-bold mb-6">Email Alert Settings</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Alerts</p>
                <p className="text-sm text-gray-400">Receive notifications when prices drop</p>
              </div>
              <button
                onClick={() => setEmailAlertsEnabled(!emailAlertsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  emailAlertsEnabled ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    emailAlertsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block font-medium mb-2">
                Price Drop Threshold: {priceDropThreshold}%
              </label>
              <p className="text-sm text-gray-400 mb-4">
                Only send alerts when price drops by at least this percentage
              </p>
              <input
                type="range"
                min="1"
                max="50"
                value={priceDropThreshold}
                onChange={(e) => setPriceDropThreshold(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1%</span>
                <span>50%</span>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Subscription & Billing</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Current Plan</p>
              <p className="text-lg font-semibold capitalize">{profile?.subscription_tier || 'Free'} Tier</p>
            </div>

            <button
              onClick={handleManageBilling}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Manage Subscription & Billing
            </button>
            
            <p className="text-xs text-gray-500">
              Update payment method, view invoices, or cancel your subscription
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}