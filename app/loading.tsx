export default function RootLoading() {
  return (
    <div style={{ background: 'var(--ash-950)', minHeight: '100vh' }}>
      <div
        className="container"
        style={{ paddingTop: '4.5rem', paddingBottom: '4rem' }}
      >
        <div
          className="skeleton"
          style={{ height: '16px', width: '160px', borderRadius: '6px', marginBottom: '1.25rem' }}
        />
        <div
          className="skeleton"
          style={{ height: '56px', width: 'min(520px, 100%)', borderRadius: '10px', marginBottom: '1rem' }}
        />
        <div
          className="skeleton"
          style={{ height: '20px', width: 'min(420px, 90%)', borderRadius: '6px', marginBottom: '2.5rem' }}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, idx) => (
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
                <div className="skeleton" style={{ height: '12px', width: '64px', borderRadius: '4px', marginBottom: '0.5rem' }} />
                <div className="skeleton" style={{ height: '18px', width: '85%', borderRadius: '4px', marginBottom: '0.75rem' }} />
                <div className="skeleton" style={{ height: '20px', width: '45%', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
