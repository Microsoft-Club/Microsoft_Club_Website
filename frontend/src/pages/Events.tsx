import { useEffect, useState } from 'react';
import WindowCard from '../components/WindowCard';
import PixelButton from '../components/PixelButton';
import { api } from '../services/api';
import type { Event } from '../services/api';

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
      <div className="flex gap-2 mb-4">
        <PixelButton
          label="All"
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-primary text-white' : ''}
        />
        <PixelButton
          label="Upcoming"
          onClick={() => setFilter('upcoming')}
          className={filter === 'upcoming' ? 'bg-primary text-white' : ''}
        />
        <PixelButton
          label="Past"
          onClick={() => setFilter('past')}
          className={filter === 'past' ? 'bg-primary text-white' : ''}
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
                    {event.images.slice(0, 3).map((src, idx) => (
                      <img
                        key={`${src}-${idx}`}
                        src={src}
                        alt={`${event.title} photo ${idx + 1}`}
                        className="w-full h-16 object-cover border border-black"
                        loading="lazy"
                      />
                    ))}
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

