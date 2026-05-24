export default function Pricing() {
  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '12px', padding: '4px 12px', borderRadius: '6px' }}>
          Simple, transparent pricing
        </span>
        <h1 style={{ fontSize: '32px', fontWeight: '500', margin: '16px 0 8px' }}>
          Pay for what you actually use
        </h1>
        <p style={{ color: '#6B7280' }}>Track, prove, and optimize your AI systems. No setup fees. No hidden costs.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        
        {/* Free */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF' }}>Free</p>
          <div style={{ fontSize: '36px', fontWeight: '500' }}>$0 <span style={{ fontSize: '14px', color: '#9CA3AF', fontWeight: '400' }}>/month</span></div>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>Perfect for side projects and early-stage testing.</p>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            {['Up to 1,000 tracked API requests/mo', 'Live PoU score dashboard', 'Cache efficiency metrics', 'Latency tracking', 'Public badge for README'].map(f => (
              <li key={f} style={{ fontSize: '14px', color: '#374151' }}>✓ {f}</li>
            ))}
          </ul>
          <a href="https://ai-pou-tracker.vercel.app" style={{ display: 'block', textAlign: 'center', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '10px', fontSize: '14px', textDecoration: 'none', color: '#374151' }}>
            Get started free
          </a>
        </div>

        {/* Pro */}
        <div style={{ border: '2px solid #60A5FA', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF', margin: 0 }}>Pro</p>
            <span style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '11px', padding: '3px 8px', borderRadius: '6px' }}>Most popular</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: '500' }}>$19 <span style={{ fontSize: '14px', color: '#9CA3AF', fontWeight: '400' }}>/month</span></div>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>For teams shipping AI features to production.</p>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            {['Unlimited tracked requests', 'Team dashboard (up to 5 seats)', 'AI cost savings reports', 'Fallback pattern analytics', 'Email alerts on degradation', 'Priority support'].map(f => (
              <li key={f} style={{ fontSize: '14px', color: '#374151' }}>✓ {f}</li>
            ))}
          </ul>
          <a href="https://ai-pou-tracker.vercel.app" style={{ display: 'block', textAlign: 'center', background: '#2563EB', color: 'white', borderRadius: '8px', padding: '10px', fontSize: '14px', textDecoration: 'none' }}>
            Start free trial
          </a>
        </div>

        {/* Enterprise */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF' }}>Enterprise</p>
          <div style={{ fontSize: '36px', fontWeight: '500' }}>Custom</div>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>For orgs with compliance needs and dedicated infra.</p>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            {['Everything in Pro', 'Unlimited team seats', 'Dedicated Upstash Redis instance', 'White-label dashboard', 'SLA guarantee', 'Custom integrations'].map(f => (
              <li key={f} style={{ fontSize: '14px', color: '#374151' }}>✓ {f}</li>
            ))}
          </ul>
          <a href="mailto:hello@ai-pou-tracker.com" style={{ display: 'block', textAlign: 'center', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '10px', fontSize: '14px', textDecoration: 'none', color: '#374151' }}>
            Contact us
          </a>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: '13px', color: '#9CA3AF' }}>
        All plans include persistent tracking via Upstash Redis. Cancel any time.
      </p>
    </main>
  )
}