import { Link } from 'react-router-dom';
import type { Event } from '../../services/api';
import { eventPath, isRegistrationOpen, isUpcoming } from '../../utils/events';
import { safeExternalUrl } from '../../utils/url';

const dayFmt = new Intl.DateTimeFormat('en-US', { day: '2-digit' });
const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'short' });
const fullFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

type EventRowProps = { event: Event };

const EventRow = ({ event }: EventRowProps) => {
  const date = new Date(event.date);
  const hasDate = !Number.isNaN(date.getTime());
  const registerUrl = safeExternalUrl(event.registrationLink);
  const upcoming = isUpcoming(event);

  return (
    <li className="job">
      <div className="datebox" aria-hidden="true">
        <b>{hasDate ? dayFmt.format(date) : '--'}</b>
        <small>{hasDate ? monthFmt.format(date) : 'TBA'}</small>
      </div>
      <div className="min-w-0">
        <h3>
          <Link to={eventPath(event)}>{event.title}</Link>
        </h3>
        <div className="job-meta">
          {hasDate && <time dateTime={date.toISOString()}>{fullFmt.format(date)}</time>}
          {event.location && (
            <span className="inline-flex items-center gap-1">
              <i className="icon-location" aria-hidden="true" />
              {event.location}
            </span>
          )}
          <span className={`tag ${upcoming ? 'tag--lime' : 'tag--gray'}`}>{upcoming ? 'Upcoming' : 'Past'}</span>
          {event.featured && <span className="tag tag--yellow">Featured</span>}
        </div>
        {event.description && <p>{event.description}</p>}
      </div>
      <div className="job-actions">
        {registerUrl && isRegistrationOpen(event) && (
          <a href={registerUrl} target="_blank" rel="noopener noreferrer" className="btn btn--coral">
            Register
            <i className="icon-arrow-right" aria-hidden="true" />
          </a>
        )}
        <Link to={eventPath(event)} className="btn btn--white" aria-label={`Details for ${event.title}`}>
          Details
        </Link>
      </div>
    </li>
  );
};

type EventBoardProps = { events: Event[] };

const EventBoard = ({ events }: EventBoardProps) => (
  <ul className="board-list">
    {events.map((event) => (
      <EventRow key={event.id} event={event} />
    ))}
  </ul>
);

export default EventBoard;
