export default function CatalogLoading() {
  return (
    <div style={{ background: 'var(--ash-950)', minHeight: '100vh' }}>
      <div
        style={{
          padding: '3.25rem 0 2.5rem',
          borderBottom: '1px solid var(--border)',
          background: 'var(--ash-900)',
        }}
      >
        <div className="container">
          <div className="skeleton" style={{ height: '14px', width: '120px', borderRadius: '4px', marginBottom: '0.75rem' }} />
          <div className="skeleton" style={{ height: '40px', width: '280px', borderRadius: '8px', marginBottom: '0.75rem' }} />
          <div className="skeleton" style={{ height: '18px', width: 'min(460px, 100%)', borderRadius: '4px' }} />
        </div>
      </div>

      <div className="container" style={{ paddingTop: '3.5rem', paddingBottom: '5rem' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                borderRadius: '12px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                overflow: 'hidden',
              }}
            >
              <div className="skeleton" style={{ aspectRatio: '4/3', width: '100%' }} />
              <div style={{ padding: '1rem' }}>
                <div className="skeleton" style={{ height: '12px', width: '60px', borderRadius: '4px', marginBottom: '0.5rem' }} />
                <div className="skeleton" style={{ height: '18px', width: '80%', borderRadius: '4px', marginBottom: '0.75rem' }} />
                <div className="skeleton" style={{ height: '20px', width: '40%', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
