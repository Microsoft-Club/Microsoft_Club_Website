import { useEffect, useRef, useState } from 'react';
import WindowCard from '../components/WindowCard';
import PixelButton from '../components/PixelButton';
import { api } from '../services/api';
import type { Event } from '../services/api';

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

const EventImage = ({ src, alt }: { src: string; alt: string }) => {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full min-h-[10rem] object-cover"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

const AUTO_SWIPE_INTERVAL_MS = 4000;

const EventImageCarousel = ({
  images,
  eventTitle,
}: {
  images: string[];
  eventTitle: string;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const validImages = images
    .map((raw) => resolveImageUrl(raw))
    .filter((src): src is string => !!src);
  if (validImages.length === 0) return null;

  const isMulti = validImages.length > 1;
  const count = validImages.length;

  useEffect(() => {
    if (!isMulti || !scrollRef.current) return;
    const el = scrollRef.current;
    const scrollToIndex = (idx: number) => {
      const next = idx % count;
      setCurrentIndex(next);
      el.scrollTo({ left: el.clientWidth * next, behavior: 'smooth' });
    };
    const interval = setInterval(
      () => scrollToIndex(currentIndex + 1),
      AUTO_SWIPE_INTERVAL_MS
    );
    return () => clearInterval(interval);
  }, [isMulti, count, currentIndex]);

  const handleScroll = () => {
    if (!scrollRef.current || !isMulti) return;
    const el = scrollRef.current;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setCurrentIndex(Math.min(idx, count - 1));
  };

  const goToSlide = (idx: number) => {
    if (!scrollRef.current) return;
    setCurrentIndex(idx);
    scrollRef.current.scrollTo({
      left: scrollRef.current.clientWidth * idx,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative aspect-video bg-black">
      <div
        ref={scrollRef}
        className={`flex h-full w-full ${
          isMulti ? 'overflow-x-auto scroll-snap-swipe' : ''
        }`}
        onScroll={handleScroll}
      >
        {validImages.map((src, idx) => (
          <div
            key={`${src}-${idx}`}
            className="h-full w-full flex-shrink-0"
            style={isMulti ? { scrollSnapAlign: 'start' } : undefined}
          >
            <EventImage
              src={src}
              alt={`${eventTitle} photo ${idx + 1}`}
            />
          </div>
        ))}
      </div>
      {isMulti && (
        <>
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium">
            {currentIndex + 1} / {count}
          </div>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
            {validImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`h-2 w-2 rounded-full border border-white/50 transition-all ${
                  idx === currentIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

type Filter = 'all' | 'upcoming' | 'past';

const MAX_DESCRIPTION_CHARS = 120;

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<
    Record<string, boolean>
  >({});

  const toggleDescription = (eventId: string) => {
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
              <p className="text-sm mb-1">
                Date: {new Date(event.date).toLocaleDateString()}
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
              {event.registrationLink && (
                <a
                  href={event.registrationLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  <PixelButton
                    label={
                      String(event.type).toLowerCase() === 'upcoming'
                        ? 'Register'
                        : 'Link'
                    }
                  />
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

