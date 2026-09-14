export default function LoadError({ message, loading, onRetry }: {
  message: string;
  loading: boolean;
  onRetry: () => void;
}) {
  return (
    <div style={{ padding: '28px 20px', border: '1px solid rgba(255,75,75,0.2)', borderRadius: '24px', background: 'rgba(255,75,75,0.04)', textAlign: 'center' }}>
      <p role="alert" style={{ color: '#ff8080', lineHeight: 1.6, margin: '0 0 16px' }}>{message}</p>
      <button type="button" disabled={loading} onClick={onRetry} style={{ background: '#10b981', color: '#000', border: 'none', borderRadius: '12px', padding: '12px 24px', fontWeight: 700, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1 }}>
        {loading ? 'Retrying...' : 'Try again'}
      </button>
    </div>
  );
}
