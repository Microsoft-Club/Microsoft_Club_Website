import { useEffect, useRef, useState, type CSSProperties, type TransitionEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Event } from '../../services/api';
import { eventPath, isUpcoming } from '../../utils/events';
import { resolveImageUrl } from '../../utils/image';
import '../../styles/shelf.css';

const SPINES: { bg: string; ink: string }[] = [
  { bg: '#E74C3C', ink: '#000000' },
  { bg: '#3498DB', ink: '#000000' },
  { bg: '#F1C40F', ink: '#000000' },
  { bg: '#1C3A47', ink: '#FFFFFF' },
  { bg: 'var(--lime)', ink: '#000000' },
  { bg: '#FFFFFF', ink: '#000000' },
  { bg: '#95A5A6', ink: '#000000' },
];
const HEIGHTS = [100, 84, 93, 76, 97, 88, 80, 95];
const WIDTHS = [58, 46, 66, 50, 54, 72, 48];
const LEAN_EVERY = 5;
const LEAN_DEG = -5;
const LEAN_GAP_PX = 30;
const EDGE_PX = 8;

const revealInRow = (li: HTMLLIElement) => {
  const row = li.parentElement;
  if (!row || row.scrollWidth <= row.clientWidth) return;
  const left = li.offsetLeft;
  const right = left + li.offsetWidth;
  if (left < row.scrollLeft) {
    row.scrollTo({ left: left - EDGE_PX, behavior: 'smooth' });
  } else if (right > row.scrollLeft + row.clientWidth) {
    row.scrollTo({ left: right - row.clientWidth + EDGE_PX, behavior: 'smooth' });
  }
};

const monthYearFmt = new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' });
const longFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const dayFmt = new Intl.DateTimeFormat('en-US', { day: '2-digit' });
const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'long' });

const titleSize = (title: string, width: number) => {
  const byLength = title.length > 26 ? 15 : title.length > 16 ? 18 : 23;
  return Math.min(byLength, width * 0.42);
};

const spineStyle = (index: number, title: string): CSSProperties => {
  const palette = SPINES[index % SPINES.length];
  const width = WIDTHS[(index * 3) % WIDTHS.length];
  const isLeaning = index % LEAN_EVERY === LEAN_EVERY - 1;
  return {
    '--c': palette.bg,
    '--ct': palette.ink,
    '--w': `${width}px`,
    '--h': `${HEIGHTS[index % HEIGHTS.length]}%`,
    '--fs': `${titleSize(title, width)}px`,
    '--lean': isLeaning ? `${LEAN_DEG}deg` : '0deg',
    '--lean-gap': isLeaning ? `${LEAN_GAP_PX}px` : '0px',
  } as CSSProperties;
};

type BookProps = {
  event: Event;
  index: number;
  isOpen: boolean;
  onOpen: () => void;
};

const Book = ({ event, index, isOpen, onOpen }: BookProps) => {
  const date = new Date(event.date);
  const hasDate = !Number.isNaN(date.getTime());
  const image = resolveImageUrl(event.images?.[0]);
  const coverId = `book-cover-${event.id}`;
  const upcoming = isUpcoming(event);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (isOpen && ref.current && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealInRow(ref.current);
    }
  }, [isOpen]);

  const handleCoverTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (isOpen && e.propertyName === 'width' && e.target === e.currentTarget && ref.current) {
      revealInRow(ref.current);
    }
  };

  return (
    <li ref={ref} className={`book${isOpen ? ' is-open' : ''}`} style={spineStyle(index, event.title)} onMouseEnter={onOpen}>
      <button
        type="button"
        className="book-spine"
        aria-expanded={isOpen}
        aria-controls={coverId}
        aria-label={`${event.title}${hasDate ? `, ${longFmt.format(date)}` : ''}`}
        onClick={onOpen}
        onFocus={onOpen}
      >
        <span className="spine-date" aria-hidden="true">{hasDate ? monthYearFmt.format(date) : 'TBA'}</span>
        <span className="spine-title" aria-hidden="true">{event.title}</span>
        <span className="spine-mark" aria-hidden="true" />
      </button>

      <div id={coverId} className="book-cover" aria-hidden={!isOpen} onTransitionEnd={handleCoverTransitionEnd}>
        <div className="book-cover-inner">
          {image ? (
            <img className="cover-img" src={image} alt="" loading="lazy" />
          ) : (
            <div className="cover-img cover-type" aria-hidden="true">
              <b>{hasDate ? dayFmt.format(date) : '--'}</b>
              <span>{hasDate ? monthFmt.format(date) : 'Date TBA'}</span>
            </div>
          )}
          <div className="cover-body">
            {hasDate && <time className="cover-date" dateTime={date.toISOString()}>{longFmt.format(date)}</time>}
            <h3 className="cover-title">{event.title}</h3>
            <div className="cover-tags">
              <span className={`tag ${upcoming ? 'tag--lime' : 'tag--gray'}`}>{upcoming ? 'Upcoming' : 'Past'}</span>
              {event.featured && <span className="tag tag--yellow">Featured</span>}
              {event.location && <span className="cover-loc">{event.location}</span>}
            </div>
            <Link to={eventPath(event)} className="btn btn--blue btn--sm cover-cta" tabIndex={isOpen ? 0 : -1}>
              Details
              <i className="icon-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
};

type EventShelfProps = { events: Event[] };

const EventShelf = ({ events }: EventShelfProps) => {
  // Every book starts on the shelf; one opens on hover/focus/tap and goes back when the pointer or focus leaves.
  const [openId, setOpenId] = useState<number | undefined>(undefined);
  const close = () => setOpenId(undefined);

  return (
    <div className="shelf">
      <p className="shelf-hint">Hover or tap a spine to pull it off the shelf.</p>
      <ul
        className="shelf-row"
        aria-label="Events shelf"
        onMouseLeave={close}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) close();
        }}
      >
        {events.map((event, index) => (
          <Book
            key={event.id}
            event={event}
            index={index}
            isOpen={openId === event.id}
            onOpen={() => setOpenId(event.id)}
          />
        ))}
      </ul>
      <div className="shelf-plank" aria-hidden="true" />
    </div>
  );
};

export default EventShelf;
