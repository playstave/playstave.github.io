/**
 * A simple, original line drawing of a bowed string instrument (body, f-holes,
 * neck, scroll). One shape scaled by size, so the four instruments read as
 * one family: violin smallest, double bass biggest.
 */
export function InstrumentPicture({ size = 1, label }: { size?: number; label?: string }) {
  const h = 30 + size * 27; // violin 57 … double bass 95 (fits a 96px box)
  return (
    <svg viewBox="0 0 60 140" height={h} width={(h * 60) / 140} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}
      fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* scroll and pegbox */}
      <path d="M30 6c-4 0-6 3-5 6 1 2 4 2 5 0" />
      <path d="M27 12v18h6V12" />
      {/* neck / fingerboard */}
      <path d="M28 30v38M32 30v38" />
      {/* body: upper bout, waist (C-bouts), lower bout */}
      <path d="M30 60c-10 0-17 4-17 13 0 6 4 8 4 12s-6 7-6 18c0 14 9 26 19 26s19-12 19-26c0-11-6-14-6-18s4-6 4-13c0-9-7-13-17-13z" />
      {/* f-holes */}
      <path d="M22 88c2 4-2 10 0 16M38 88c-2 4 2 10 0 16" strokeWidth="1.6" />
      {/* bridge and tailpiece */}
      <path d="M24 100h12" />
      <path d="M28 104l-1 16h6l-1-16" strokeWidth="1.6" />
    </svg>
  );
}
