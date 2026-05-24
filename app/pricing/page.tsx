export default function PricingPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <span className="inline-block bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-md mb-4">
          Simple, transparent pricing
        </span>
        <h1 className="text-3xl font-medium text-gray-900 mb-3">
          Pay for what you actually use
        </h1>
        <p className="text-gray-500 text-base">
          Track, prove, and optimize your AI systems. No setup fees. No hidden costs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Free Tier */}
        <div className="border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-medium">Free</p>
          <div className="text-4xl font-medium text-gray-900">$0 <span className="text-sm font-normal text-gray-400">/ month</span></div>
          <p className="text-sm text-gray-500">Perfect for side projects and early-stage testing.</p>
          <ul className="flex flex-col gap-2 flex-1 text-sm text-gray-700">
            <li>✓ Up to 1,000 tracked API requests/mo</li>
            <li>✓ Live PoU score dashboard</li>
            <li>✓ Cache efficiency metrics</li>
            <li>✓ Latency tracking</li>
            <li>✓ Public badge for README</li>
          </ul>
          <a href="https://ai-pou-tracker.vercel.app" className="block text-center border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition">
            Get started free
          </a>
        </div>

        {/* Pro Tier */}
        <div className="border-2 border-blue-400 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-medium">Pro</p>
            <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-md">Most popular</span>
          </div>
          <div className="text-4xl font-medium text-gray-900">$19 <span className="text-sm font-normal text-gray-400">/ month</span></div>
          <p className="text-sm text-gray-500">For teams shipping AI features to production.</p>
          <ul className="flex flex-col gap-2 flex-1 text-sm text-gray-700">
            <li>✓ Unlimited tracked requests</li>
            <li>✓ Team dashboard (up to 5 seats)</li>
            <li>✓ AI cost savings reports</li>
            <li>✓ Fallback pattern analytics</li>
            <li>✓ Email alerts on degradation</li>
            <li>✓ Priority support</li>
          </ul>
          <a href="https://ai-pou-tracker.vercel.app" className="block text-center bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 transition">
            Start free trial
          </a>
        </div>

        {/* Enterprise Tier */}
        <div className="border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-medium">Enterprise</p>
          <div className="text-4xl font-medium text-gray-900">Custom</div>
          <p className="text-sm text-gray-500">For orgs with compliance needs and dedicated infra.</p>
          <ul className="flex flex-col gap-2 flex-1 text-sm text-gray-700">
            <li>✓ Everything in Pro</li>
            <li>✓ Unlimited team seats</li>
            <li>✓ Dedicated Upstash Redis instance</li>
            <li>✓ White-label dashboard</li>
            <li>✓ SLA guarantee</li>
            <li>✓ Custom integrations</li>
          </ul>
          <a href="mailto:hello@ai-pou-tracker.com" className="block text-center border border-gray-300 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 transition">
            Contact us
          </a>
        </div>
      </div>

      <p className="text-center text-sm text-gray-400">
        All plans include persistent tracking via Upstash Redis. Cancel any time.
      </p>
    </main>
  )
}