const pillars = [
  {
    code: '01',
    title: 'Tested Hardware',
    detail: 'Every laptop & desktop stress-checked in-store',
  },
  {
    code: '02',
    title: 'Store Warranty',
    detail: 'Backed by our Ikeja service desk',
  },
  {
    code: '03',
    title: 'Fast Dispatch',
    detail: 'Ikeja pickup, Lagos & interstate delivery',
  },
  {
    code: '04',
    title: 'Verified Payments',
    detail: 'Paystack checkout & live order tracking',
  },
];

export default function TrustStrip() {
  return (
    <section
      aria-label="Store assurances"
      style={{
        background: 'var(--ash-900)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)]">
          {pillars.map((item) => (
            <div
              key={item.code}
              className="py-4 sm:py-5 sm:px-5 first:sm:pl-0 last:sm:pr-0 flex items-start gap-3"
            >
              <span
                className="tabular-nums text-[0.7rem] font-semibold tracking-[0.14em] uppercase pt-0.5 shrink-0"
                style={{ color: 'var(--gold-400)' }}
              >
                {item.code}
              </span>
              <div className="min-w-0">
                <div
                  className="text-sm font-semibold leading-snug"
                  style={{ color: 'var(--heading)' }}
                >
                  {item.title}
                </div>
                <p
                  className="text-xs mt-0.5 leading-relaxed"
                  style={{ color: 'var(--ash-400)' }}
                >
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
