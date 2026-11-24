import type { CSSProperties, ReactElement } from 'react';

const S = { stroke: '#000', strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

export type ArtName =
  | 'globe'
  | 'calendar'
  | 'idcard'
  | 'folder'
  | 'music'
  | 'docs'
  | 'exe'
  | 'lock'
  | 'clip'
  | 'floppy'
  | 'trash'
  | 'warning'
  | 'envelope';

const art: Record<ArtName, ReactElement> = {
  globe: (
    <>
      <circle cx="32" cy="32" r="24" fill="#3498DB" {...S} />
      <ellipse cx="32" cy="32" rx="11" ry="24" fill="none" {...S} />
      <path d="M8 32h48M12 20h40M12 44h40M32 8v48" fill="none" {...S} />
    </>
  ),
  calendar: (
    <>
      <rect x="8" y="12" width="48" height="44" rx="4" fill="#FFFFFF" {...S} />
      <path d="M8 16a4 4 0 0 1 4-4h40a4 4 0 0 1 4 4v8H8z" fill="#E74C3C" {...S} />
      <path d="M20 6v12M44 6v12" fill="none" {...S} />
      <rect x="16" y="31" width="8" height="7" fill="#000" />
      <rect x="28" y="31" width="8" height="7" fill="#000" />
      <rect x="40" y="31" width="8" height="7" style={{ fill: 'var(--lime)' }} stroke="#000" strokeWidth="2" />
      <rect x="16" y="42" width="8" height="7" fill="#000" />
      <rect x="28" y="42" width="8" height="7" fill="#000" />
    </>
  ),
  idcard: (
    <>
      <rect x="6" y="14" width="52" height="38" rx="4" fill="#FFFFFF" {...S} />
      <circle cx="22" cy="29" r="6" style={{ fill: 'var(--lime)' }} {...S} />
      <path d="M12 46c1.5-6 5.5-9 10-9s8.5 3 10 9" style={{ fill: 'var(--lime)' }} {...S} />
      <path d="M38 26h13M38 34h13M38 42h8" fill="none" {...S} />
      <rect x="26" y="8" width="12" height="9" rx="2" fill="#3498DB" {...S} />
    </>
  ),
  folder: (
    <>
      <path d="M6 18a3 3 0 0 1 3-3h15l5 6h26a3 3 0 0 1 3 3v26a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" fill="#F1C40F" {...S} />
      <path d="M14 24h38v6H14z" fill="#FFFFFF" {...S} />
      <path d="M6 30h52l-4 23H10z" fill="#F1C40F" {...S} />
    </>
  ),
  music: (
    <>
      <rect x="8" y="8" width="48" height="48" rx="4" fill="#FFFFFF" {...S} />
      <rect x="15" y="15" width="34" height="34" rx="3" fill="#3498DB" {...S} />
      <path d="M27 40V22l13-3v18" fill="none" {...S} />
      <circle cx="24" cy="40" r="4" fill="#000" />
      <circle cx="37" cy="37" r="4" fill="#000" />
    </>
  ),
  docs: (
    <>
      <path d="M22 6h22l10 10v32H22z" fill="#FFFFFF" {...S} />
      <path d="M10 16h22l10 10v32H10z" fill="#FFFFFF" {...S} />
      <path d="M32 16v10h10" fill="none" {...S} />
      <path d="M16 34h20M16 41h20M16 48h14" fill="none" {...S} />
    </>
  ),
  exe: (
    <>
      <path d="M14 4h26l12 12v34H14z" fill="#FFFFFF" {...S} />
      <path d="M40 4v12h12" fill="none" {...S} />
      <path d="M33 37c-7-4.5-11-8-11-12a5 5 0 0 1 11-1 5 5 0 0 1 11 1c0 4-4 7.5-11 12z" fill="#E74C3C" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="10" y="48" width="44" height="12" rx="3" fill="#FFFFFF" {...S} />
      <text x="32" y="57.5" textAnchor="middle" fontFamily="Barlow, sans-serif" fontWeight="800" fontSize="9" fill="#000">.EXE</text>
    </>
  ),
  lock: (
    <>
      <path d="M20 28v-8a12 12 0 0 1 24 0v8" fill="none" stroke="#000" strokeWidth="5" strokeLinecap="round" />
      <rect x="12" y="27" width="40" height="30" rx="4" fill="#F1C40F" {...S} />
      <circle cx="32" cy="39" r="4" fill="#000" />
      <path d="M32 41v7" stroke="#000" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  clip: (
    <>
      <path d="M26 54V18a8 8 0 0 1 16 0v30a5 5 0 0 1-10 0V22" fill="none" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" />
      <path d="M26 54V18a8 8 0 0 1 16 0v30a5 5 0 0 1-10 0V22" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />
      <circle cx="29" cy="22" r="3" fill="#FFFFFF" stroke="#000" strokeWidth="2" />
      <circle cx="39" cy="22" r="3" fill="#FFFFFF" stroke="#000" strokeWidth="2" />
      <circle cx="29.5" cy="22.5" r="1.2" fill="#000" />
      <circle cx="39.5" cy="22.5" r="1.2" fill="#000" />
    </>
  ),
  floppy: (
    <>
      <path d="M8 8h40l8 8v40H8z" fill="#E74C3C" {...S} />
      <rect x="18" y="8" width="24" height="16" fill="#FFFFFF" {...S} />
      <rect x="33" y="11" width="5" height="10" fill="#000" />
      <rect x="15" y="34" width="34" height="22" rx="2" fill="#FFFFFF" {...S} />
    </>
  ),
  trash: (
    <>
      <path d="M14 18h36l-4 38H18z" fill="#3498DB" {...S} />
      <rect x="10" y="12" width="44" height="7" rx="2" fill="#3498DB" {...S} />
      <path d="M26 8h12v4H26zM25 26l1 24M32 26v24M39 26l-1 24" fill="none" {...S} />
    </>
  ),
  envelope: (
    <>
      <rect x="6" y="14" width="52" height="38" rx="4" fill="#FFFFFF" {...S} />
      <path d="M6 18l26 18 26-18" fill="none" {...S} />
      <path d="M6 50l19-17M58 50 39 33" fill="none" {...S} />
      <circle cx="50" cy="16" r="8" fill="#E74C3C" {...S} />
      <path d="M50 12v5" stroke="#000" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="20.5" r="1.5" fill="#000" />
    </>
  ),
  warning: (
    <>
      <path d="M32 8 58 54H6z" fill="#F1C40F" {...S} />
      <path d="M32 24v16" stroke="#000" strokeWidth="5" strokeLinecap="round" />
      <circle cx="32" cy="47" r="3" fill="#000" />
    </>
  ),
};

type DesktopArtProps = { name: ArtName; className?: string; style?: CSSProperties };

export const DesktopArt = ({ name, className = 'dicon-art', style }: DesktopArtProps) => (
  <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden="true" focusable="false">
    {art[name]}
  </svg>
);

export const MsFlag = () => (
  <span className="ms-flag" aria-hidden="true">
    <i style={{ background: '#E74C3C' }} />
    <i style={{ background: '#BADA55' }} />
    <i style={{ background: '#3498DB' }} />
    <i style={{ background: '#F1C40F' }} />
  </span>
);

export const CursorArt = ({ className, style }: { className?: string; style?: CSSProperties }) => (
  <svg viewBox="0 0 32 32" className={className} style={style} aria-hidden="true">
    <path d="M5 3v23l6-6 4.5 9 4-2-4.5-8.5H23z" fill="#FFFFFF" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);
