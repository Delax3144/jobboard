import styles from "./LoadError.module.css";
export default function LoadError({ message, loading, onRetry }: {
  message: string;
  loading: boolean;
  onRetry?: () => void;
}) {
  return (
    <div className={styles.error}>
      <p role="alert" className={styles.message}>{message}</p>
      {onRetry && <button type="button" disabled={loading} onClick={onRetry} className={styles.retry}>
        {loading ? 'Retrying...' : 'Try again'}
      </button>}
    </div>
  );
}
