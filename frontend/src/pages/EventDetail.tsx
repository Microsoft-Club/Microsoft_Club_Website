import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import WindowCard from '../components/WindowCard';
import EventImageCarousel from '../components/EventImageCarousel';
import { api } from '../services/api';
import type { Event } from '../services/api';

const EventDetail = () => {
  const params = useParams();
  const idOrSlug = params.idOrSlug ?? null;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!idOrSlug) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<Event>(`/api/events/${idOrSlug}`);
        setEvent(res.data);
      } catch {
        setError('Failed to load event.');
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [idOrSlug]);

  const isUpcoming =
    event != null &&
    new Date(event.date) >= new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <Link to="/events" className="pixel-button bg-gray-800 text-white">
          Back to Events
        </Link>
        {event?.featured && (
          <span className="inline-flex items-center px-2 py-1 border-2 border-black bg-yellow-100 font-heading text-[10px] shadow-retro">
            Featured Event
          </span>
        )}
      </div>

      <WindowCard
        title={event ? event.title : 'Event'}
        imageSlot={
          event?.images?.length ? (
            <EventImageCarousel
              images={event.images}
              eventTitle={event.title}
              className="relative aspect-[16/9] md:aspect-[2/1] bg-black"
            />
          ) : undefined
        }
      >
        {loading && <p className="text-sm">Loading event...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && event && (
          <article className="space-y-5">
            <header className="space-y-2">
              <h1 className="font-heading text-lg sm:text-xl md:text-2xl font-bold tracking-wide">
                {event.title}
              </h1>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="px-2 py-1 border-2 border-black bg-white shadow-retro">
                  {new Date(event.date).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span className="px-2 py-1 border-2 border-black bg-lightBg shadow-retro capitalize">
                  {event.type}
                </span>
                {event.location && (
                  <span className="px-2 py-1 border-2 border-black bg-white shadow-retro">
                    {event.location}
                  </span>
                )}
              </div>
            </header>

            <section className="space-y-2">
              <h2 className="font-heading text-sm font-bold">About</h2>
              <p className="text-sm leading-6 whitespace-pre-wrap">
                {event.description}
              </p>
            </section>

            {event.speakers && event.speakers.length > 0 && (
              <section className="space-y-2">
                <h2 className="font-heading text-sm font-bold">Speakers</h2>
                <ul className="flex flex-wrap gap-2">
                  {event.speakers.map((speaker) => (
                    <li
                      key={speaker}
                      className="px-2 py-1 border-2 border-black bg-white text-xs shadow-retro"
                    >
                      {speaker}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="flex flex-wrap gap-2 pt-2 border-t-2 border-black">
              {event.registrationLink && (
                <a
                  href={event.registrationLink}
                  target="_blank"
                  rel="noreferrer"
                  className="pixel-button bg-purpleAccent text-white"
                >
                  {isUpcoming ? 'Register' : 'Event Link'}
                </a>
              )}
              <Link to="/events" className="pixel-button">
                All Events
              </Link>
            </div>
          </article>
        )}
      </WindowCard>
    </div>
  );
};

export default EventDetail;
