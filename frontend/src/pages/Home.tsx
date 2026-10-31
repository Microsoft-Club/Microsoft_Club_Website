import { useEffect, useState } from 'react';
import WindowCard from '../components/WindowCard';
import EventImageCarousel from '../components/EventImageCarousel';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Event } from '../services/api';

const eventPath = (event: Event) => `/events/${event.slug || event.id}`;

const Home = () => {
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await api.get<Event>('/api/events/featured');
        setFeaturedEvent(res.data);
      } catch {
        setFeaturedEvent(null);
      } finally {
        setFeaturedLoading(false);
      }
    };

    loadFeatured();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <section className="order-1 md:order-2 flex justify-center">
        <div className="retro-window retro-window-highlight bg-white max-w-xl w-full">
          <div className="retro-window-header">
            <span className="retro-window-title">Inductions 2026</span>
            <div className="retro-window-controls">
              <span className="retro-dot" />
              <span className="retro-dot" />
              <span className="retro-dot" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
            <div className="flex items-start gap-3">
              <div>
                <p className="font-heading text-xs font-bold mb-1">
                  Applications closed
                </p>
                <p className="text-xs text-gray-700">
                  Microsoft Club GIKI Inductions 2026 have concluded. Thanks to
                  everyone who applied — follow us for future openings.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <Link
                to="/inductions"
                className="pixel-button bg-gray-800 text-white"
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="order-2 md:order-1 grid-layout">
        <WindowCard
          title="Featured Event"
          imageSlot={
            featuredEvent?.images?.length ? (
              <EventImageCarousel
                images={featuredEvent.images}
                eventTitle={featuredEvent.title}
              />
            ) : undefined
          }
        >
          {featuredLoading && (
            <p className="text-sm">Loading featured event...</p>
          )}
          {!featuredLoading && featuredEvent && (
            <>
              <p className="font-heading text-sm font-bold mb-1">
                {featuredEvent.title}
              </p>
              <p className="text-xs text-gray-700 mb-2">
                {new Date(featuredEvent.date).toLocaleDateString()}
                {featuredEvent.location ? ` · ${featuredEvent.location}` : ''}
              </p>
              <p className="mb-3 text-sm">
                {featuredEvent.description.length > 160
                  ? `${featuredEvent.description.slice(0, 160).trimEnd()}...`
                  : featuredEvent.description}
              </p>
              <Link
                to={eventPath(featuredEvent)}
                className="pixel-button bg-purpleAccent text-white"
              >
                View Event
              </Link>
            </>
          )}
          {!featuredLoading && !featuredEvent && (
            <>
              <p className="mb-3 text-sm">
                Stay tuned for the next Microsoft Club GIKI event. Join us for
                talks, workshops, and more.
              </p>
              <Link to="/events" className="pixel-button">
                View Events
              </Link>
            </>
          )}
        </WindowCard>

        <WindowCard title="Latest Projects">
          <p className="mb-3 text-sm">
            Explore projects built by club members across different tech
            stacks.
          </p>
          <Link to="/projects" className="pixel-button">
            View Projects
          </Link>
        </WindowCard>

        <WindowCard title="Logikal Podcast">
          <p className="mb-3 text-sm">
            Listen to Logikal, our podcast featuring guests from industry and
            academia.
          </p>
          <Link to="/podcasts" className="pixel-button">
            Listen Now
          </Link>
        </WindowCard>
      </section>
    </div>
  );
};

export default Home;
