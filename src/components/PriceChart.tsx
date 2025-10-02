'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface PriceChartProps {
  snapshots: Array<{
    price: number
    scraped_at: string
  }>
}

export default function PriceChart({ snapshots }: PriceChartProps) {
  const data = snapshots
    .filter(s => s.price)
    .map(s => ({
      date: new Date(s.scraped_at).toLocaleDateString(),
      price: s.price
    }))
    .reverse()

  if (data.length < 2) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        Not enough data for chart (need at least 2 data points)
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
        <YAxis stroke="#9CA3AF" fontSize={12} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
          labelStyle={{ color: '#9CA3AF' }}
        />
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke="#10B981" 
          strokeWidth={2}
          dot={{ fill: '#10B981' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}