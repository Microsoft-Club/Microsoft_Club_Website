import type { LoadStatus } from '../../hooks/useApiList';

type LoadStateProps = {
  status: LoadStatus;
  isEmpty: boolean;
  what: string;
  onRetry: () => void;
  emptyText?: string;
};

const LoadState = ({ status, isEmpty, what, onRetry, emptyText }: LoadStateProps) => {
  if (status === 'loading') {
    return (
      <div className="win-body" role="status">
        <p className="m-0 mb-3 font-bold">Loading {what}…</p>
        <div className="blocks max-w-xs" aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} className={i < 6 ? '' : 'off'} />
          ))}
        </div>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="win-body flex flex-wrap items-center gap-4" role="alert">
        <p className="m-0 font-bold">Couldn’t load {what}. Check your connection and try again.</p>
        <button type="button" className="btn btn--yellow btn--sm" onClick={onRetry}>
          <i className="icon-refresh" aria-hidden="true" />
          Retry
        </button>
      </div>
    );
  }
  if (isEmpty) {
    return <p className="win-body m-0">{emptyText ?? `No ${what} yet.`}</p>;
  }
  return null;
};

export default LoadState;
