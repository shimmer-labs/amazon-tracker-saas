export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Amazon Tracker</h1>
          <div className="flex gap-4">
            <a 
              href="/login" 
              className="text-gray-300 hover:text-white transition"
            >
              Sign In
            </a>
            <a 
              href="/login" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Amazon Competitor Tracker
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Monitor competitor prices, Buy Box winners, and sales rank changes automatically
          </p>
          <a 
            href="/login"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
          >
            Get Started Free
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="text-blue-400 text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">Price Tracking</h3>
            <p className="text-gray-400">
              Track competitor prices and get alerts when they change
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="text-blue-400 text-3xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-white mb-2">Buy Box Monitor</h3>
            <p className="text-gray-400">
              See who wins the Buy Box and when it changes hands
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="text-blue-400 text-3xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-white mb-2">Sales Rank</h3>
            <p className="text-gray-400">
              Monitor BSR changes to gauge product velocity
            </p>
          </div>
        </div>

        <div className="mt-20 bg-gray-800 p-8 rounded-lg border border-gray-700">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Simple Pricing</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">Free</h3>
              <p className="text-3xl font-bold text-white mb-4">$0<span className="text-sm text-gray-400">/mo</span></p>
              <ul className="text-gray-400 space-y-2 mb-6">
                <li>✓ 3 products</li>
                <li>✓ Weekly scraping</li>
                <li>✓ Price history</li>
              </ul>
            </div>

            <div className="bg-blue-900/20 p-6 rounded-lg border-2 border-blue-600 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                Popular
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Pro</h3>
              <p className="text-3xl font-bold text-white mb-4">$29<span className="text-sm text-gray-400">/mo</span></p>
              <ul className="text-gray-400 space-y-2 mb-6">
                <li>✓ 25 products</li>
                <li>✓ Daily scraping</li>
                <li>✓ Price history</li>
                <li>✓ Email alerts</li>
              </ul>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">Business</h3>
              <p className="text-3xl font-bold text-white mb-4">$99<span className="text-sm text-gray-400">/mo</span></p>
              <ul className="text-gray-400 space-y-2 mb-6">
                <li>✓ 100 products</li>
                <li>✓ 4x daily scraping</li>
                <li>✓ Price history</li>
                <li>✓ Email alerts</li>
                <li>✓ Priority support</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}