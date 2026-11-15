import { ButtonLink, PageHeader } from '../components/ui';

export function NotFound() {
  return (
    <div data-not-found>
      <PageHeader eyebrow="404" title="This page is a rest" lede="Nothing is written here. The link may be old, or the address may have a typo." />
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <ButtonLink to="/">Go home</ButtonLink>
        <ButtonLink to="/learn" variant="secondary">Browse the curriculum</ButtonLink>
      </div>
    </div>
  );
}
