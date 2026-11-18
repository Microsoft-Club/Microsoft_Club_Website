import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import WindowCard from '../components/WindowCard';
import PixelButton from '../components/PixelButton';
import EventImageCarousel from '../components/EventImageCarousel';
import Seo from '../components/Seo';
import { api } from '../services/api';
import type { Event } from '../services/api';

type Filter = 'all' | 'upcoming' | 'past';

const MAX_DESCRIPTION_CHARS = 120;

const eventPath = (event: Event) => `/events/${event.slug || event.id}`;

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<
    Record<string, boolean>
  >({});

  const toggleDescription = (eventId: number) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const getDescriptionPreview = (description: string) => {
    if (description.length <= MAX_DESCRIPTION_CHARS) return description;
    return `${description.slice(0, MAX_DESCRIPTION_CHARS).trimEnd()}...`;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get<Event[]>('/api/events');
        setEvents(res.data);
      } catch {
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents =
    filter === 'all'
      ? events
      : events.filter((e) => e.type === filter);

  return (
    <div className="space-y-4">
      <Seo
        title="Events"
        description="Upcoming and past Microsoft Club GIKI events, workshops, and hackathons at Ghulam Ishaq Khan Institute."
        path="/events"
      />
      <h1 className="font-heading text-sm md:text-base mb-2">Events</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        <PixelButton
          label="All"
          onClick={() => setFilter('all')}
          className={`${filter === 'all' ? 'bg-primary text-white' : ''} min-w-[88px]`}
        />
        <PixelButton
          label="Upcoming"
          onClick={() => setFilter('upcoming')}
          className={`${filter === 'upcoming' ? 'bg-primary text-white' : ''} min-w-[88px]`}
        />
        <PixelButton
          label="Past"
          onClick={() => setFilter('past')}
          className={`${filter === 'past' ? 'bg-primary text-white' : ''} min-w-[88px]`}
        />
      </div>
      {loading && <p className="text-sm">Loading events...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="grid-layout">
          {filteredEvents.map((event) => (
            <WindowCard
              key={event.id}
              title={event.title}
              imageSlot={
                event.images?.length ? (
                  <EventImageCarousel
                    images={event.images}
                    eventTitle={event.title}
                  />
                ) : (
                  <div
                    className="aspect-video bg-gray-100 border-b border-black flex items-center justify-center"
                    aria-hidden
                  >
                    <span className="text-xs text-gray-400">
                      No event image
                    </span>
                  </div>
                )
              }
            >
              {event.featured && (
                <p className="mb-2 inline-flex px-2 py-0.5 border-2 border-black bg-yellow-100 font-heading text-[10px] shadow-retro">
                  Featured
                </p>
              )}
              <p className="text-sm mb-1">
                Date: {new Date(event.date).toLocaleDateString()}
                {event.location ? ` · ${event.location}` : ''}
              </p>
              {(() => {
                const description = event.description ?? '';
                const isExpanded = expandedDescriptions[event.id] ?? false;
                const shouldTruncate =
                  description.length > MAX_DESCRIPTION_CHARS;
                const text = shouldTruncate
                  ? isExpanded
                    ? description
                    : getDescriptionPreview(description)
                  : description;

                return (
                  <div className="mb-3">
                    <p className="text-sm">{text}</p>
                    {shouldTruncate && (
                      <PixelButton
                        type="button"
                        label={isExpanded ? 'Read less' : 'Read more'}
                        onClick={() => toggleDescription(event.id)}
                        className="mt-2 self-start"
                      />
                    )}
                  </div>
                );
              })()}
              <div className="flex flex-wrap gap-2">
                <Link to={eventPath(event)} className="pixel-button">
                  View details
                </Link>
                {event.registrationLink && (
                  <a
                    href={event.registrationLink}
                    target="_blank"
                    rel="noreferrer"
                    className="pixel-button bg-purpleAccent text-white"
                  >
                    {new Date(event.date) >=
                    new Date(new Date().setHours(0, 0, 0, 0))
                      ? 'Register'
                      : 'Link'}
                  </a>
                )}
              </div>
            </WindowCard>
          ))}
          {!filteredEvents.length && (
            <p className="text-sm col-span-full">
              No events found for this filter.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Events;
