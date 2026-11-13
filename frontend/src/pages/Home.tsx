import { useEffect, useState } from 'react';
import WindowCard from '../components/WindowCard';
import EventImageCarousel from '../components/EventImageCarousel';
import LogikHero from '../components/LogikHero';
import Seo, { organizationJsonLd } from '../components/Seo';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { resolveImageUrl } from '../utils/image';
import type { Event, Blog, Project, Podcast } from '../services/api';

type HomeFeed = {
  event: Event | null;
  blog: Blog | null;
  project: Project | null;
  podcast: Podcast | null;
};

const eventPath = (event: Event) => `/events/${event.slug || event.id}`;

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max).trimEnd()}...` : text;

const extractYouTubeVideoId = (url: string): string | null => {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') {
      return u.pathname.split('/').filter(Boolean)[0] || null;
    }
    if (u.hostname.includes('youtube.com')) {
      const fromQuery = u.searchParams.get('v');
      if (fromQuery) return fromQuery;
      const parts = u.pathname.split('/').filter(Boolean);
      const embedIndex = parts.indexOf('embed');
      if (embedIndex !== -1 && parts[embedIndex + 1]) return parts[embedIndex + 1];
      const shortsIndex = parts.indexOf('shorts');
      if (shortsIndex !== -1 && parts[shortsIndex + 1]) return parts[shortsIndex + 1];
    }
  } catch {
    const match = url.match(/[?&]v=([^&]+)/);
    return match?.[1] || null;
  }
  return null;
};

const Home = () => {
  const [feed, setFeed] = useState<HomeFeed | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const res = await api.get<HomeFeed>('/api/system');
        setFeed(res.data);
      } catch {
        setFeed(null);
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, []);

  const latestEvent = feed?.event ?? null;
  const latestProject = feed?.project ?? null;
  const latestBlog = feed?.blog ?? null;
  const latestPodcast = feed?.podcast ?? null;
  const showUpcomingHeadline = latestEvent?.type === 'upcoming';

  const podcastVideoId = latestPodcast
    ? extractYouTubeVideoId(latestPodcast.youtubeLink)
    : null;
  const podcastThumbnail = podcastVideoId
    ? `https://i.ytimg.com/vi/${podcastVideoId}/hqdefault.jpg`
    : null;

  const projectImage = latestProject?.images?.[0]
    ? resolveImageUrl(latestProject.images[0])
    : '';

  return (
    <>
      <Seo
        title="Microsoft Club GIKI | Tech Community at GIKI"
        description="Microsoft Club GIKI is a student tech community at Ghulam Ishaq Khan Institute. Explore events, projects, the Logikal podcast, and Microsoft Learn Student Ambassador activities."
        path="/"
        jsonLd={organizationJsonLd}
      />

      {showUpcomingHeadline && latestEvent && (
        <section
          className="w-full border-y-2 border-black bg-primaryDark text-white overflow-hidden"
          aria-label="Upcoming event headline"
        >
          <style>{`
            @keyframes home-headline-marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .home-headline-track {
              display: flex;
              width: max-content;
              animation: home-headline-marquee 28s linear infinite;
            }
            .home-headline-track:hover {
              animation-play-state: paused;
            }
          `}</style>
          <Link
            to={eventPath(latestEvent)}
            className="block overflow-hidden py-1.5 md:py-2 no-underline text-white hover:text-white"
          >
            <div className="home-headline-track font-heading text-[10px] md:text-xs tracking-wide uppercase">
              {[0, 1].map((copy) => (
                <span
                  key={copy}
                  className="flex shrink-0 items-center gap-8 px-8 whitespace-nowrap"
                >
                  <span className="text-yellow-300">Upcoming</span>
                  <span aria-hidden>•</span>
                  <span>{latestEvent.title}</span>
                  <span aria-hidden>•</span>
                  <span>
                    {new Date(latestEvent.date).toLocaleDateString()}
                    {latestEvent.location
                      ? ` · ${latestEvent.location}`
                      : ''}
                  </span>
                  <span aria-hidden>•</span>
                  <span>Click to view event</span>
                  <span aria-hidden>•</span>
                </span>
              ))}
            </div>
          </Link>
        </section>
      )}

      <LogikHero />

      <div
        id="home-content"
        className="page-container flex flex-col gap-6 scroll-mt-20"
      >
        <section>
          <WindowCard
            title="Latest Event"
            className="w-full"
            imageSlot={
              latestEvent?.images?.length ? (
                <EventImageCarousel
                  images={latestEvent.images}
                  eventTitle={latestEvent.title}
                  className="relative aspect-[21/9] min-h-[14rem] md:min-h-[18rem] bg-black"
                />
              ) : undefined
            }
          >
            {loading && <p className="text-sm">Loading latest activity...</p>}
            {!loading && latestEvent && (
              <>
                <p className="font-heading text-sm md:text-base font-bold mb-1">
                  {latestEvent.title}
                </p>
                <p className="text-xs text-gray-700 mb-2">
                  {new Date(latestEvent.date).toLocaleDateString()}
                  {latestEvent.location ? ` · ${latestEvent.location}` : ''}
                  {latestEvent.type ? ` · ${latestEvent.type}` : ''}
                </p>
                <p className="mb-3 text-sm">
                  {truncate(latestEvent.description, 200)}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={eventPath(latestEvent)}
                    className="pixel-button bg-purpleAccent text-white"
                  >
                    View Event
                  </Link>
                  <Link to="/events" className="pixel-button">
                    See more events
                  </Link>
                </div>
              </>
            )}
            {!loading && !latestEvent && (
              <>
                <p className="mb-3 text-sm">
                  Stay tuned for the next Microsoft Club GIKI event. Join us for
                  talks, workshops, and more.
                </p>
                <Link to="/events" className="pixel-button">
                  See more events
                </Link>
              </>
            )}
          </WindowCard>
        </section>

        <section className="grid-layout">
          <WindowCard
            title="Latest Project"
            imageSlot={
              projectImage ? (
                <div className="relative aspect-video bg-black">
                  <img
                    src={projectImage}
                    alt={latestProject?.title || 'Project'}
                    className="w-full h-full min-h-[10rem] object-cover"
                    loading="lazy"
                  />
                </div>
              ) : undefined
            }
          >
            {loading && <p className="text-sm">Loading...</p>}
            {!loading && latestProject && (
              <>
                <p className="font-heading text-sm font-bold mb-1">
                  {latestProject.title}
                </p>
                <p className="text-xs text-gray-700 mb-2">
                  {latestProject.techStack?.length
                    ? latestProject.techStack.join(', ')
                    : 'Club project'}
                </p>
                <p className="mb-3 text-sm">
                  {truncate(latestProject.description, 140)}
                </p>
                <Link to="/projects" className="pixel-button">
                  See more projects
                </Link>
              </>
            )}
            {!loading && !latestProject && (
              <>
                <p className="mb-3 text-sm">
                  Explore projects built by club members across different tech
                  stacks.
                </p>
                <Link to="/projects" className="pixel-button">
                  See more projects
                </Link>
              </>
            )}
          </WindowCard>

          <WindowCard title="Latest Blog">
            {loading && <p className="text-sm">Loading...</p>}
            {!loading && latestBlog && (
              <>
                <p className="font-heading text-sm font-bold mb-1">
                  {latestBlog.title}
                </p>
                <p className="text-xs text-gray-700 mb-2">
                  By {latestBlog.author}
                </p>
                <p className="mb-3 text-sm">
                  {truncate(stripHtml(latestBlog.content), 140)}
                </p>
                {latestBlog.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {latestBlog.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 border border-black bg-lightBg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/blogs/${latestBlog.id}`}
                    className="pixel-button bg-purpleAccent text-white"
                  >
                    Read post
                  </Link>
                  <Link to="/blogs" className="pixel-button">
                    See more blogs
                  </Link>
                </div>
              </>
            )}
            {!loading && !latestBlog && (
              <>
                <p className="mb-3 text-sm">
                  Articles and insights from Microsoft Club GIKI members.
                </p>
                <Link to="/blogs" className="pixel-button">
                  See more blogs
                </Link>
              </>
            )}
          </WindowCard>

          <WindowCard
            title="Latest Podcast"
            imageSlot={
              podcastThumbnail ? (
                <div className="relative aspect-video bg-black">
                  <img
                    src={podcastThumbnail}
                    alt={latestPodcast?.title || 'Podcast'}
                    className="w-full h-full min-h-[10rem] object-cover"
                    loading="lazy"
                  />
                </div>
              ) : undefined
            }
          >
            {loading && <p className="text-sm">Loading...</p>}
            {!loading && latestPodcast && (
              <>
                <p className="font-heading text-sm font-bold mb-1">
                  {latestPodcast.title}
                </p>
                <p className="text-xs text-gray-700 mb-2">
                  Guest: {latestPodcast.guest}
                  {' · '}
                  {new Date(latestPodcast.date).toLocaleDateString()}
                </p>
                <p className="mb-3 text-sm">
                  {truncate(latestPodcast.description, 140)}
                </p>
                <Link to="/podcasts" className="pixel-button">
                  See more podcasts
                </Link>
              </>
            )}
            {!loading && !latestPodcast && (
              <>
                <p className="mb-3 text-sm">
                  Listen to Logikal, our podcast featuring guests from industry
                  and academia.
                </p>
                <Link to="/podcasts" className="pixel-button">
                  See more podcasts
                </Link>
              </>
            )}
          </WindowCard>
        </section>

        <section>
          <WindowCard title="About">
            <h2 className="font-heading text-sm md:text-base mb-3">
              Microsoft Club GIKI
            </h2>
            <p className="text-sm leading-6 text-gray-800">
              Microsoft Club GIKI is the student tech community at Ghulam Ishaq
              Khan Institute (GIKI). As Microsoft Learn Student Ambassadors, we
              host workshops, hackathons, community projects, and the Logikal
              podcast — helping students learn, build, and lead with technology.
            </p>
          </WindowCard>
        </section>

        <section className="flex justify-center">
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
      </div>
    </>
  );
};

export default Home;
