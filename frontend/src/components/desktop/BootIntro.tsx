import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { CursorArt, DesktopArt, MsFlag, type ArtName } from './DesktopArt';
import WindowControls from './WindowControls';

const SEEN_KEY = 'mcg-intro-seen';
const BLOCK_COUNT = 14;
const TILE_COLS = 6;
const TILE_ROWS = 8;
const TILE_STEP_S = 0.012;

type BootTiming = {
  wipeInS: number;
  leaveAtMs: number;
  wipeOutS: number;
  doneAtMs: number;
  blocksStartS: number;
  blockStepS: number;
};

/** Laptop plays the full ~7s desktop story; phones get a ~3.7s cut (window, stamp, one popup, wipe). */
const TIMING: Record<'full' | 'compact', BootTiming> = {
  full: { wipeInS: 5.6, leaveAtMs: 6250, wipeOutS: 6.3, doneAtMs: 7100, blocksStartS: 2.35, blockStepS: 0.085 },
  compact: { wipeInS: 2.6, leaveAtMs: 3050, wipeOutS: 3.1, doneAtMs: 3700, blocksStartS: 0.55, blockStepS: 0.06 },
};

const bootIcons: { art: ArtName; label: string }[] = [
  { art: 'globe', label: 'club.exe' },
  { art: 'floppy', label: 'events' },
  { art: 'folder', label: 'projects' },
  { art: 'docs', label: 'blogs' },
  { art: 'music', label: 'logikal' },
  { art: 'clip', label: 'helper' },
];

export const shouldPlayIntro = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (new URLSearchParams(window.location.search).has('intro')) return true;
  try {
    return sessionStorage.getItem(SEEN_KEY) !== '1';
  } catch {
    return false;
  }
};

const markSeen = () => {
  try {
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    // Without storage the intro may replay next visit; harmless.
  }
};

const seededOrder = (count: number): number[] => {
  const order = Array.from({ length: count }, (_, i) => i);
  let seed = 7;
  for (let i = count - 1; i > 0; i -= 1) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

type BootIntroProps = { onDone: () => void; compact?: boolean };

const BootIntro = ({ onDone, compact = false }: BootIntroProps) => {
  const [isLeaving, setIsLeaving] = useState(false);
  const timing = TIMING[compact ? 'compact' : 'full'];

  const finish = useCallback(() => {
    markSeen();
    onDone();
  }, [onDone]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const leaveId = window.setTimeout(() => setIsLeaving(true), timing.leaveAtMs);
    const doneId = window.setTimeout(finish, timing.doneAtMs);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(leaveId);
      window.clearTimeout(doneId);
      document.removeEventListener('keydown', onKey);
    };
  }, [finish, timing]);

  const tiles = useMemo(() => {
    const order = seededOrder(TILE_COLS * TILE_ROWS);
    return order.map((rank, i) => {
      const row = Math.floor(i / TILE_COLS);
      const col = i % TILE_COLS;
      const isBlue = (row + col + (rank % 3 === 0 ? 1 : 0)) % 2 === 0;
      return {
        key: i,
        style: {
          background: isBlue ? '#3498DB' : '#F1C40F',
          animation: `tile-in 0.01s linear ${timing.wipeInS + rank * TILE_STEP_S}s both, tile-out 0.01s linear ${timing.wipeOutS + rank * TILE_STEP_S}s forwards`,
        } as CSSProperties,
      };
    });
  }, [timing]);

  const cursorStyle = { '--cx': '58px', '--cy': '66px' } as CSSProperties;

  return (
    <div className={`boot${compact ? ' boot--compact' : ''}${isLeaving ? ' is-leaving' : ''}`} onClick={finish} role="presentation">
      <button type="button" className="bevel boot-skip" onClick={finish}>
        Skip intro
      </button>

      {!compact && (
        <>
          <div className="boot-icons" aria-hidden="true">
            {bootIcons.map((icon, i) => (
              <div key={icon.label} className={`dicon${i === 0 ? ' boot-click' : ''}`}>
                <DesktopArt name={icon.art} />
                <span className="dicon-label">{icon.label}</span>
              </div>
            ))}
          </div>

          <div className="boot-cursor" style={cursorStyle} aria-hidden="true">
            <CursorArt />
          </div>
        </>
      )}

      <div className="boot-win" aria-hidden="true">
        <div className="win-stack">
          <div className="win win--framed">
            <div className="win-bar win-bar--blue">
              <p className="win-title">club.exe</p>
              <WindowControls />
            </div>
            <div className="win-frame">
              <div className="win-panel" style={{ position: 'relative', minHeight: 'clamp(200px, 34vh, 280px)' }}>
                <div className="boot-loading" style={{ position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', gap: 14, padding: 24, textAlign: 'center' }}>
                  <p style={{ margin: 0, font: '700 20px var(--ui)', letterSpacing: '0.04em' }}>Connecting to GIKI…</p>
                  <div className="blocks" style={{ width: 'min(360px, 64vw)' }}>
                    {Array.from({ length: BLOCK_COUNT }, (_, i) => (
                      <span key={i} style={{ animationDelay: `${timing.blocksStartS + i * timing.blockStepS}s` }} />
                    ))}
                  </div>
                </div>
                <div className="boot-stamp">
                  <div>
                    <b>Microsoft Club</b>
                    <em>GIKI</em>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="win boot-pop"
        style={compact ? { left: '8vw', bottom: '9vh', animationDelay: '1.95s' } : { right: '5vw', top: '12vh', animationDelay: '4.3s' }}
        aria-hidden="true"
      >
        <div className="win-bar win-bar--lime">
          <p className="win-title">System message</p>
          <WindowControls />
        </div>
        <div className="win-body" style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 14px', font: '800 22px/1.1 var(--display)' }}>New members detected</p>
          <span className="btn btn--blue btn--sm">Batch 2026</span>
        </div>
      </div>

      {!compact && (
      <>
      <div className="win boot-pop" style={{ left: '4vw', bottom: '15vh', animationDelay: '4.75s' }} aria-hidden="true">
        <div className="win-bar win-bar--yellow">
          <p className="win-title">Error</p>
          <WindowControls />
        </div>
        <div className="win-body">
          <p style={{ margin: '0 0 14px', font: '800 22px/1.1 var(--display)' }}>Boredom.exe not found</p>
          <span className="btn btn--coral btn--sm">Continue</span>
        </div>
      </div>

      <div className="boot-pop" style={{ right: '9vw', bottom: '20vh', width: 72, animationDelay: '5.15s' }} aria-hidden="true">
        <DesktopArt name="warning" className="dicon-art" />
      </div>

      <div className="taskbar" aria-hidden="true">
        <span className="bevel"><MsFlag />Start</span>
        <span className="bevel task-btn win-enter" style={{ animationDelay: '1.9s' }}>
          <i className="icon-globe" />
          <span>club.exe</span>
        </span>
        <span className="tray"><span className="bevel clock">12:00 AM</span></span>
      </div>
      </>
      )}

      <div className="tiles" aria-hidden="true">
        {tiles.map((tile) => (
          <span key={tile.key} style={tile.style} />
        ))}
      </div>
    </div>
  );
};

export default BootIntro;
