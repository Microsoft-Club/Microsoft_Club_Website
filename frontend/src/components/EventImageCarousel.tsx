import { useEffect, useRef, useState } from 'react';
import { resolveImageUrl } from '../utils/image';

const EventImage = ({
  src,
  alt,
  className = 'w-full h-full min-h-[10rem] object-cover',
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

const AUTO_SWIPE_INTERVAL_MS = 4000;

type EventImageCarouselProps = {
  images: string[];
  eventTitle: string;
  className?: string;
};

const EventImageCarousel = ({
  images,
  eventTitle,
  className = 'relative aspect-video bg-black',
}: EventImageCarouselProps) => {
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
    <div className={className}>
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

export default EventImageCarousel;
