import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">
          Amazon Competitor Tracker
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Monitor competitor prices, Buy Box winners, and sales rank changes automatically
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign In
          </Link>
          <Link 
            href="/signup"
            className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  )
}