import { Link } from 'react-router-dom';
import WindowCard from '../WindowCard';
import LoadState from './LoadState';
import type { LoadStatus } from '../../hooks/useApiList';
import type { Event } from '../../services/api';
import { eventPath, isUpcoming, pickFeaturedEvent as pickEvent } from '../../utils/events';
import { resolveImageUrl } from '../../utils/image';
import { safeExternalUrl } from '../../utils/url';

export const BLOCKS = 14;
const COUNTDOWN_WINDOW_DAYS = 30;
const DAY_MS = 86_400_000;

const longFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

const daysUntil = (date: Date) => {
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const day = new Date(new Date(date).setHours(0, 0, 0, 0));
  return Math.round((day.getTime() - today.getTime()) / DAY_MS);
};

type Progress = { filled: number; tag: string; eta: string };

/** Installer-style progress for an event: full blocks once it has happened, filling up over the last 30 days before it. */
export const progressFor = (event: Event, upcoming: boolean): Progress => {
  const date = new Date(event.date);
  if (!upcoming) {
    return { filled: BLOCKS, tag: 'Installed', eta: `Wrapped up on ${longFmt.format(date)}.` };
  }
  const days = daysUntil(date);
  if (days <= 0) return { filled: BLOCKS - 1, tag: 'Happening today', eta: `Happening today, ${longFmt.format(date)}.` };
  const remaining = Math.min(days, COUNTDOWN_WINDOW_DAYS) / COUNTDOWN_WINDOW_DAYS;
  const filled = Math.max(1, Math.round(BLOCKS * (1 - remaining)));
  const when = days === 1 ? 'tomorrow' : `in ${days} days`;
  return {
    filled,
    tag: `Starts ${when}`,
    eta: `Estimated time remaining: ${days === 1 ? '1 day' : `${days} days`} (${longFmt.format(date)}).`,
  };
};

const InstallerBody = ({ event, upcoming }: { event: Event; upcoming: boolean }) => {
  const image = resolveImageUrl(event.images?.[0]);
  const registerUrl = upcoming ? safeExternalUrl(event.registrationLink) : undefined;
  const { filled, tag, eta } = progressFor(event, upcoming);

  return (
    <>
      {image && (
        <img
          src={image}
          alt=""
          loading="lazy"
          className="block w-full aspect-[16/9] object-cover border-retro border-black rounded-md mb-4"
        />
      )}
      <span className={`tag ${upcoming ? 'tag--lime' : 'tag--gray'} mb-3`}>
        <i className={upcoming ? 'icon-clock' : 'icon-check'} aria-hidden="true" />
        {tag}
      </span>
      <h2 className="m-0 mb-2 text-[26px] leading-tight font-extrabold">{event.title}</h2>
      {event.location && (
        <p className="m-0 mb-2 text-ink-soft inline-flex items-center gap-1">
          <i className="icon-location" aria-hidden="true" />
          {event.location}
        </p>
      )}
      {event.description && <p className="m-0 mb-4 text-ink-soft line-clamp-2">{event.description}</p>}
      <div className="blocks" role="img" aria-label={`${filled} of ${BLOCKS} steps installed`}>
        {Array.from({ length: BLOCKS }, (_, i) => (
          <span key={i} className={i < filled ? '' : 'off'} />
        ))}
      </div>
      <p className="eta">{eta}</p>
      <div className="actions">
        {registerUrl ? (
          <a href={registerUrl} target="_blank" rel="noopener noreferrer" className="btn btn--coral flex-1">
            Register
            <i className="icon-arrow-right" aria-hidden="true" />
          </a>
        ) : (
          <Link to={eventPath(event)} className="btn btn--blue flex-1">
            {upcoming ? 'Details' : 'See recap'}
          </Link>
        )}
        <Link to="/events" className="btn btn--white flex-1">
          All events
        </Link>
      </div>
    </>
  );
};

type NextEventInstallerProps = {
  events: Event[];
  status: LoadStatus;
  onRetry: () => void;
  className?: string;
};

const NextEventInstaller = ({ events, status, onRetry, className }: NextEventInstallerProps) => {
  const event = status === 'ready' ? pickEvent(events) : undefined;
  const upcoming = event ? isUpcoming(event) : false;
  const title = event ? `${upcoming ? 'Installing' : 'Installed'}: ${event.title}` : 'Installing: next event';

  return (
    <WindowCard title={title} titleBg={upcoming ? 'yellow' : 'lime'} className={className} bodyClassName={event ? '' : 'p-0'}>
      <LoadState status={status} isEmpty={!event} what="the next event" onRetry={onRetry} emptyText="No events scheduled yet. Check back soon." />
      {event && <InstallerBody event={event} upcoming={upcoming} />}
    </WindowCard>
  );
};

export default NextEventInstaller;
