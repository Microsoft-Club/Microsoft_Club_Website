import { useEffect, useState } from 'react';
import WindowCard from '../components/WindowCard';
import PixelButton from '../components/PixelButton';
import { api } from '../services/api';
import type { Event } from '../services/api';

const EventImage = ({ src, alt }: { src: string; alt: string }) => {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-16 object-cover border border-black"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

const resolveImageUrl = (rawUrl?: string): string => {
  if (!rawUrl) return '';
  const cleaned = rawUrl.trim().replace(/^['"]+|['"]+$/g, '').replace(/\\/g, '/');
  if (!cleaned) return '';
  if (/^https?:\/\//i.test(cleaned)) {
    try {
      const url = new URL(cleaned);
      url.pathname = url.pathname
        .replace(/\/(frontend\/)?public\//i, '/')
        .replace(/\/{2,}/g, '/');
      // Rewrite GitHub Pages URLs to current origin so images load on custom domain
      const ghPagesMatch = url.hostname.match(/^[\w-]+\.github\.io$/i);
      if (ghPagesMatch && typeof window !== 'undefined') {
        return `${window.location.origin}${url.pathname.replace(/^\/[^/]+\//, '/')}`;
      }
      return url.toString();
    } catch {
      return cleaned;
    }
  }
  const withoutPublicPrefix = cleaned.replace(/^\/?(frontend\/)?public\//i, '');
  const normalizedPath = withoutPublicPrefix.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${normalizedPath}`.replace(/([^:]\/)\/+/g, '$1');
};

type Filter = 'all' | 'upcoming' | 'past';

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            <WindowCard key={event.id} title={event.title}>
              <p className="text-sm mb-1">
                Date: {new Date(event.date).toLocaleDateString()}
              </p>
              <p className="text-sm mb-3">{event.description}</p>
              {event.images && event.images.length > 0 && (
                <div className="mb-3">
                  <div className="grid grid-cols-3 gap-2">
                    {event.images.slice(0, 3).map((rawSrc, idx) => {
                      const src = resolveImageUrl(rawSrc);
                      if (!src) return null;
                      return (
                        <EventImage
                          key={`${rawSrc}-${idx}`}
                          src={src}
                          alt={`${event.title} photo ${idx + 1}`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
              {event.registrationLink && (
                <a
                  href={event.registrationLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  <PixelButton label="Register" />
                </a>
              )}
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

