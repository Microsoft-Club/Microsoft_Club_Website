import { Link } from 'react-router-dom';
import type { Event } from '../../services/api';
import { eventPath, isUpcoming } from '../../utils/events';
import { resolveImageUrl } from '../../utils/image';
import { DesktopArt } from '../desktop/DesktopArt';
import WindowControls from '../desktop/WindowControls';
import { BLOCKS, progressFor } from './NextEventInstaller';

/** Title-bar colours cycle through the club palette; each placeholder thumb uses a contrasting partner. */
const TONES = ['blue', 'lime', 'yellow', 'coral'] as const;
const THUMB_FOR: Record<(typeof TONES)[number], (typeof TONES)[number]> = {
  blue: 'coral',
  lime: 'yellow',
  yellow: 'blue',
  coral: 'lime',
};

const SUBTITLE_MAX = 70;
const dateFmt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

/** First sentence of the description, kept short enough for one or two lines on a phone. */
const subtitleFor = (description?: string): string => {
  const text = (description ?? '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  const firstSentence = text.split(/(?<=[.!?])\s/)[0];
  return firstSentence.length > SUBTITLE_MAX ? `${firstSentence.slice(0, SUBTITLE_MAX).trimEnd()}…` : firstSentence;
};

type PhoneEventCardProps = { event: Event; index: number };

/** One event as a mini "installer" window: coloured title bar, poster, status tag and block progress. */
const PhoneEventCard = ({ event, index }: PhoneEventCardProps) => {
  const tone = TONES[index % TONES.length];
  const date = new Date(event.date);
  const hasDate = !Number.isNaN(date.getTime());
  const upcoming = isUpcoming(event);
  const image = resolveImageUrl(event.images?.[0]);
  const subtitle = subtitleFor(event.description);
  const { filled, tag } = progressFor(event, upcoming);

  return (
    <li>
      <Link to={eventPath(event)} className={`ev-card ev-card--${tone}`}>
        <span className={`win-bar win-bar--${tone} ev-card-bar`}>
          <span className="win-title">
            {upcoming ? 'Installing' : 'Installed'}: {hasDate ? dateFmt.format(date) : 'Date TBA'}
          </span>
          <WindowControls />
        </span>
        <span className="ev-card-body">
          {image ? (
            <img className="ev-card-thumb" src={image} alt="" loading="lazy" />
          ) : (
            <span className={`ev-card-thumb ev-card-thumb--${THUMB_FOR[tone]}`} aria-hidden="true">
              <DesktopArt name="calendar" className="" />
            </span>
          )}
          <span className="ev-card-text">
            <span className={`tag ${upcoming ? 'tag--lime' : 'tag--gray'} ev-card-tag`}>
              <i className={upcoming ? 'icon-clock' : 'icon-check'} aria-hidden="true" />
              {tag}
            </span>
            <strong>{event.title}</strong>
            {subtitle && <small>{subtitle}</small>}
          </span>
        </span>
        <span className="blocks ev-card-blocks" role="img" aria-label={`${filled} of ${BLOCKS} steps installed`}>
          {Array.from({ length: BLOCKS }, (_, i) => (
            <span key={i} className={i < filled ? '' : 'off'} />
          ))}
        </span>
      </Link>
    </li>
  );
};

type PhoneEventListProps = { events: Event[] };

/** Phone layout for the Events page: a stack of installer-window cards (see phone.css). */
const PhoneEventList = ({ events }: PhoneEventListProps) => (
  <ul className="ev-list">
    {events.map((event, index) => (
      <PhoneEventCard key={event.id} event={event} index={index} />
    ))}
  </ul>
);

export default PhoneEventList;
