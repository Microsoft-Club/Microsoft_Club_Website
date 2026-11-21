import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import WindowCard from '../components/WindowCard';
import Seo from '../components/Seo';
import { api } from '../services/api';
import type { Podcast } from '../services/api';
import { toYoutubeEmbedUrl } from '../utils/youtube';

const PodcastDetail = () => {
  const { id } = useParams();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPodcast = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<Podcast>(`/api/podcasts/${id}`);
        setPodcast(res.data);
      } catch {
        setError('Failed to load episode.');
        setPodcast(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPodcast();
  }, [id]);

  const embedUrl = podcast ? toYoutubeEmbedUrl(podcast.youtubeLink) : null;

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <Seo
        title={podcast?.title || 'Podcast Episode'}
        description={
          podcast?.description
            ? podcast.description.slice(0, 160)
            : 'Listen to Logikal, the Microsoft Club GIKI podcast.'
        }
        path={id ? `/podcasts/${id}` : '/podcasts'}
      />
      <Link to="/podcasts" className="pixel-button bg-gray-800 text-white inline-block">
        Back to Podcasts
      </Link>
      <WindowCard title={podcast ? podcast.title : 'Podcast Episode'}>
        {loading && <p className="text-sm">Loading episode...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && podcast && (
          <article className="space-y-4">
            <div className="aspect-video bg-black">
              {embedUrl ? (
                <iframe
                  className="w-full h-full"
                  src={embedUrl}
                  title={podcast.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-white/80">
                  Invalid YouTube link
                </div>
              )}
            </div>
            <p className="text-sm font-semibold">{podcast.guest}</p>
            <p className="text-xs text-gray-700">
              Date: {new Date(podcast.date).toLocaleDateString()}
            </p>
            <p className="text-sm leading-6 whitespace-pre-wrap">{podcast.description}</p>
          </article>
        )}
      </WindowCard>
    </div>
  );
};

export default PodcastDetail;