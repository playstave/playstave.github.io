import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

/** Last-resort error screen — rendered outside the shell, so it uses plain links. */
export function RouteError() {
  const err = useRouteError();
  console.error(err);
  const detail = isRouteErrorResponse(err) ? `${err.status} ${err.statusText}` : err instanceof Error ? err.message : 'Unknown error';
  return (
    <main style={{ maxWidth: 560, margin: '15vh auto', padding: '0 16px' }}>
      <p className="eyebrow">Something went wrong</p>
      <h1 style={{ fontSize: '2.25rem', margin: '8px 0 12px' }}>Stave hit a wrong note</h1>
      <p className="prose">The page could not be shown. Your progress is safe. Try reloading, or go back to the home page.</p>
      <p className="muted" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, marginTop: 12 }}>{detail}</p>
      <p style={{ marginTop: 24, display: 'flex', gap: 16 }}><a href="/">Home</a><a href="" onClick={() => window.location.reload()}>Reload</a></p>
    </main>
  );
}
