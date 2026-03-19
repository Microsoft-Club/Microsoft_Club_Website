import { useEffect, useState } from 'react';
import WindowCard from '../components/WindowCard';
import { api } from '../services/api';
import type { Podcast } from '../services/api';

const extractYouTubeVideoId = (url: string): string | null => {
  try {
    const u = new URL(url);
    // youtu.be/<id>
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      return id || null;
    }

    // youtube.com/watch?v=<id>
    if (u.hostname.includes('youtube.com')) {
      const videoIdFromQuery = u.searchParams.get('v');
      if (videoIdFromQuery) return videoIdFromQuery;

      // youtube.com/embed/<id> or /shorts/<id>
      const parts = u.pathname.split('/').filter(Boolean);
      const embedIndex = parts.indexOf('embed');
      if (embedIndex !== -1 && parts[embedIndex + 1]) {
        return parts[embedIndex + 1];
      }
      const shortsIndex = parts.indexOf('shorts');
      if (shortsIndex !== -1 && parts[shortsIndex + 1]) {
        return parts[shortsIndex + 1];
      }
    }
  } catch {
    // If URL parsing fails, try a simple v=... match.
    const match = url.match(/[?&]v=([^&]+)/);
    return match?.[1] || null;
  }

  return null;
};

const toYoutubeEmbedUrl = (url: string): string | null => {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
};

const Podcasts = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const res = await api.get<Podcast[]>('/api/podcasts');
        setPodcasts(res.data);
      } catch {
        setError('Failed to load podcasts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-sm md:text-base mb-2">Logikal Podcast</h1>
      {loading && <p className="text-sm">Loading podcasts...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="grid-layout">
          {podcasts.map((episode) => (
            <WindowCard key={episode.id} title={episode.title}>
              <div className="aspect-video bg-black mb-3">
                {(() => {
                  const videoId = extractYouTubeVideoId(episode.youtubeLink);
                  const embedUrl = toYoutubeEmbedUrl(episode.youtubeLink);

                  if (activeVideoId === videoId && embedUrl) {
                    return (
                      <iframe
                        className="w-full h-full"
                        src={embedUrl}
                        title={episode.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                    );
                  }

                  if (videoId) {
                    return (
                      <button
                        type="button"
                        className="w-full h-full relative"
                        onClick={() => setActiveVideoId(videoId)}
                        aria-label={`Play ${episode.title}`}
                      >
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                          alt={`Thumbnail for ${episode.title}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="w-10 h-10 rounded-full bg-black/70 border-2 border-white text-white flex items-center justify-center text-sm font-bold">
                            ▶
                          </span>
                        </span>
                      </button>
                    );
                  }

                  // Fallback: if we can't parse the link, show a disabled state.
                  return (
                    <div className="w-full h-full flex items-center justify-center text-xs text-white/80 px-2 text-center">
                      Invalid YouTube link
                    </div>
                  );
                })()}
              </div>
              <p className="text-sm font-semibold mb-1">{episode.guest}</p>
              <p className="text-xs text-gray-700 mb-1">
                Date: {new Date(episode.date).toLocaleDateString()}
              </p>
              <p className="text-sm">{episode.description}</p>
            </WindowCard>
          ))}
          {!podcasts.length && (
            <p className="text-sm col-span-full">No podcast episodes yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Podcasts;

