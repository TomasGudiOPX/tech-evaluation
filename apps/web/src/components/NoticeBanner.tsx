interface NoticeBannerProps {
  notice: string;
  error: string;
  onClear?: () => void;
}

export function NoticeBanner({ notice, error, onClear }: NoticeBannerProps) {
  if (!notice && !error) return null;

  const isError = Boolean(error);
  const message = error || notice;

  return (
    <div className="banner-container">
      <section className={`banner ${isError ? 'banner-error' : 'banner-info'}`} aria-live="polite">
        <div className="banner-content">
          <span className="banner-icon">
            {isError ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            )}
          </span>
          <span className="banner-text">{message}</span>
        </div>
        {onClear && (
          <button className="banner-close" onClick={onClear} type="button" aria-label="Dismiss banner">
            &times;
          </button>
        )}
      </section>
    </div>
  );
}
