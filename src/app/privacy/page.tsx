export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <a href="/" className="text-xl font-bold">Amazon Tracker</a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: October 2, 2025</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p className="font-semibold mb-2">Account Information:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email address</li>
              <li>Password (encrypted)</li>
              <li>Payment information (processed by Stripe, not stored on our servers)</li>
            </ul>
            <p className="font-semibold mt-4 mb-2">Usage Data:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Product ASINs you choose to track</li>
              <li>Pricing and product data collected on your behalf</li>
              <li>Service usage patterns and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide and improve the Service</li>
              <li>To process payments and manage subscriptions</li>
              <li>To send service-related notifications</li>
              <li>To respond to support requests</li>
              <li>To detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Data Storage and Security</h2>
            <p>We use industry-standard security measures to protect your data:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Data is stored on secure servers (Supabase)</li>
              <li>Passwords are encrypted using bcrypt</li>
              <li>Payment processing is handled by Stripe (PCI DSS compliant)</li>
              <li>Data is transmitted over encrypted connections (HTTPS)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>Supabase:</strong> Database and authentication</li>
              <li><strong>Vercel:</strong> Hosting</li>
              <li><strong>Apify:</strong> Data collection infrastructure</li>
            </ul>
            <p className="mt-2">Each service has its own privacy policy governing their use of your data.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Data Retention</h2>
            <p>We retain your data for as long as your account is active. If you delete your account, we will delete your personal information within 30 days, though some data may be retained for legal or accounting purposes.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Cookies and Tracking</h2>
            <p>We use essential cookies for authentication and session management. We do not use third-party advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Children&apos;s Privacy</h2>
            <p>The Service is not intended for users under 18. We do not knowingly collect information from children.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. International Data Transfers</h2>
            <p>Your data may be processed in the United States or other countries where our service providers operate. By using the Service, you consent to this transfer.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Changes to Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through the Service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Contact Us</h2>
            <p>For privacy-related questions or to exercise your rights, contact us at:</p>
            <p className="mt-2">Email: privacy@shimmerlabs.com</p>
          </section>
        </div>
      </div>
    </div>
  )
}