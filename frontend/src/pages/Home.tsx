import { Link } from 'react-router-dom';
import WindowCard from '../components/WindowCard';
import Seo, { organizationJsonLd } from '../components/Seo';
import DesktopIcons from '../components/desktop/DesktopIcons';
import { DesktopArt } from '../components/desktop/DesktopArt';
import societyGroupPhoto from '../assets/society-group.webp';
import EventShelf from '../components/board/EventShelf';
import LoadState from '../components/board/LoadState';
import { useCallback, useEffect, useState } from 'react';
import { useApiList, type LoadStatus } from '../hooks/useApiList';
import NextEventInstaller from '../components/board/NextEventInstaller';
import ContactWindow from '../components/board/ContactWindow';
import { api, type Blog, type Event, type Podcast, type Project } from '../services/api';
import { sortEventsForBoard } from '../utils/events';
import { safeExternalUrl } from '../utils/url';
import { useIsPhone } from '../hooks/useIsPhone';
import { socialLinks } from '../components/desktop/desktopApps';
import WindowControls from '../components/desktop/WindowControls';

// 16 books fill the plank at common laptop widths (12 left ~300px empty at 1440px).
const HOME_SHELF_COUNT = 16;
const HOME_PROJECT_COUNT = 4;

/** The whole society in one photo, framed like a picture on the desktop. */
const HeroPhoto = () => (
  <figure className="hero-photo">
    <img
      src={societyGroupPhoto}
      alt="Microsoft Club GIKI members together at a club gathering"
      width={1200}
      height={680}
    />
  </figure>
);

type EventsProps = { events: Event[]; status: LoadStatus; onRetry: () => void };

const Hero = ({ events, status, onRetry }: EventsProps) => (
  <section className="hero-grid" aria-labelledby="home-title">
    <WindowCard title="club.exe" titleBg="blue" framed className="hero-welcome" bodyClassName="hero-panel">
      <div className="hero-copy">
        <h1 id="home-title">Microsoft Club GIKI</h1>
        <p className="lede">
          Student tech community at Ghulam Ishaq Khan Institute. Workshops, hackathons, projects, and the Logikal podcast.
        </p>
        <div className="actions">
          <Link to="/inductions" className="btn btn--blue">
            Join the club
            <i className="icon-arrow-right" aria-hidden="true" />
          </Link>
          <Link to="/events" className="btn btn--white">
            Browse events
          </Link>
        </div>
      </div>
      <HeroPhoto />
    </WindowCard>

    <NextEventInstaller events={events} status={status} onRetry={onRetry} className="hero-installer" />
  </section>
);

const EventsWindow = ({ events: items, status, onRetry: retry }: EventsProps) => {
  const events = sortEventsForBoard(items).slice(0, HOME_SHELF_COUNT);

  return (
    <section className="win" aria-labelledby="home-events">
      <div className="win-bar win-bar--lime">
        <p className="win-title">events.shelf</p>
      </div>
      <div className="board-head">
        <h2 id="home-events">What’s on</h2>
        {status === 'ready' && <span className="count">{items.length} events</span>}
        <Link to="/events" className="btn btn--white btn--sm ml-auto">
          All events
          <i className="icon-arrow-right" aria-hidden="true" />
        </Link>
      </div>
      <LoadState status={status} isEmpty={!events.length} what="events" onRetry={retry} emptyText="No events posted yet. Check back soon." />
      {status === 'ready' && events.length > 0 && <EventShelf events={events} />}
    </section>
  );
};

const dateFmt = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

type HomeFeed = {
  event: Event | null;
  blog: Blog | null;
  project: Project | null;
  podcast: Podcast | null;
};

const asList = <T,>(payload: unknown): T[] => (Array.isArray(payload) ? payload : []);

const newest = <T,>(items: T[], dateOf: (item: T) => string | undefined): T | null =>
  [...items].sort((a, b) => +new Date(dateOf(b) ?? 0) - +new Date(dateOf(a) ?? 0))[0] ?? null;

/** Prefer GET /api/system. The live API is still main, so fall back to the public lists until that route is deployed. */
const loadHomeFeed = async (signal: AbortSignal): Promise<HomeFeed> => {
  try {
    const res = await api.get<HomeFeed>('/api/system', { signal });
    if (res.data && typeof res.data === 'object' && ('event' in res.data || 'blog' in res.data)) return res.data;
  } catch (err) {
    if (signal.aborted) throw err;
  }

  const [events, blogs, projects, podcasts] = await Promise.all([
    api.get<Event[]>('/api/events', { signal }),
    api.get<Blog[]>('/api/blogs', { signal }),
    api.get<Array<Project & { createdAt?: string }>>('/api/projects', { signal }),
    api.get<Podcast[]>('/api/podcasts', { signal }),
  ]);

  return {
    event: newest(asList<Event>(events.data), (item) => item.date),
    blog: newest(asList<Blog>(blogs.data), (item) => item.createdAt),
    project: newest(asList<Project & { createdAt?: string }>(projects.data), (item) => item.createdAt),
    podcast: newest(asList<Podcast>(podcasts.data), (item) => item.date),
  };
};

const eventPath = (event: Event) => `/events/${event.slug || event.id}`;
const blogPath = (blog: Blog) => `/blogs/${blog.slug || blog.id}`;

type ActivityLink = { to: string; art: 'calendar' | 'docs' | 'folder' | 'music'; label: string; title: string; detail: string };

const activityLinks = (feed: HomeFeed): ActivityLink[] => {
  const links: ActivityLink[] = [];
  if (feed.event) {
    links.push({
      to: eventPath(feed.event),
      art: 'calendar',
      label: 'Latest event',
      title: feed.event.title,
      detail: dateFmt.format(new Date(feed.event.date)),
    });
  }
  if (feed.blog) {
    links.push({
      to: blogPath(feed.blog),
      art: 'docs',
      label: 'Latest blog',
      title: feed.blog.title,
      detail: feed.blog.author ? `By ${feed.blog.author}` : 'Blog',
    });
  }
  if (feed.project) {
    links.push({
      to: '/projects',
      art: 'folder',
      label: 'Latest project',
      title: feed.project.title,
      detail: feed.project.techStack?.slice(0, 3).join(' · ') || 'Project',
    });
  }
  if (feed.podcast) {
    links.push({
      to: `/podcasts/${feed.podcast.id}`,
      art: 'music',
      label: 'Latest podcast',
      title: feed.podcast.title,
      detail: feed.podcast.guest ? `With ${feed.podcast.guest}` : dateFmt.format(new Date(feed.podcast.date)),
    });
  }
  return links;
};

/** Latest event, blog, project, and podcast from GET /api/system. */
const ActivityWindow = () => {
  const [feed, setFeed] = useState<HomeFeed | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    loadHomeFeed(controller.signal)
      .then((next) => {
        setFeed(next);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        console.error('Failed to load home activity', err);
        setStatus('error');
      });
    return () => controller.abort();
  }, [attempt]);

  const links = feed ? activityLinks(feed) : [];

  return (
    <WindowCard title="activity.log" titleBg="yellow" bodyClassName="p-0">
      <LoadState status={status} isEmpty={!links.length} what="the latest activity" onRetry={retry} emptyText="No club activity posted yet." />
      {status === 'ready' && links.length > 0 && (
        <ul className="files">
          {links.map((item) => (
            <li key={item.label}>
              <Link to={item.to}>
                <DesktopArt name={item.art} className="" />
                <span className="min-w-0">
                  <strong>{item.title}</strong>
                  <small>{item.label} · {item.detail}</small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </WindowCard>
  );
};

const PodcastWindow = () => {
  const { items, status, retry } = useApiList<Podcast>('/api/podcasts');
  const latest = [...items].sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
  const watchUrl = safeExternalUrl(latest?.youtubeLink);

  return (
    <WindowCard title="logikal.mp3" titleBg="coral" bodyClassName={status === 'ready' && latest ? '' : 'p-0'}>
      <LoadState status={status} isEmpty={!latest} what="episodes" onRetry={retry} />
      {status === 'ready' && latest && (
        <div className="player">
          <div className="cover" aria-hidden="true">
            <DesktopArt name="music" className="" />
          </div>
          <div className="min-w-0">
            <p className="m-0 text-sm font-bold uppercase tracking-wider text-ink-soft">Latest episode</p>
            <h2 className="m-0 mt-1 mb-1 text-[22px] leading-tight font-bold">{latest.title}</h2>
            <p className="m-0 mb-4 text-ink-soft">
              {latest.guest ? `With ${latest.guest} · ` : ''}
              {dateFmt.format(new Date(latest.date))}
            </p>
            <div className="actions">
              {watchUrl && (
                <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="btn btn--coral btn--sm">
                  <i className="icon-control-play" aria-hidden="true" />
                  Watch
                </a>
              )}
              <Link to="/podcasts" className="btn btn--white btn--sm">
                All episodes
              </Link>
            </div>
          </div>
        </div>
      )}
    </WindowCard>
  );
};

const ProjectsWindow = () => {
  const { items, status, retry } = useApiList<Project>('/api/projects');
  const projects = items.slice(0, HOME_PROJECT_COUNT);

  return (
    <WindowCard title="projects/" titleBg="blue" bodyClassName="p-0">
      <LoadState status={status} isEmpty={!projects.length} what="projects" onRetry={retry} />
      {status === 'ready' && projects.length > 0 && (
        <ul className="files">
          {projects.map((project) => (
            <li key={project.id}>
              <Link to="/projects">
                <DesktopArt name="folder" className="" />
                <span className="min-w-0">
                  <strong>{project.title}</strong>
                  <small>{project.techStack?.slice(0, 3).join(' · ') || project.description}</small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </WindowCard>
  );
};


/** Phone-only: the "Rather DM?" links get their own window under the mail form. */
const DmWindow = () => (
  <section className="win" aria-labelledby="dm-title">
    <div className="win-bar win-bar--yellow">
      <p className="win-title">dm.app</p>
      <WindowControls />
    </div>
    <div className="win-body">
      <h2 id="dm-title" className="dm-title">Rather DM?</h2>
      <ul className="dm-links">
        {socialLinks.map((link) => (
          <li key={link.href}>
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              <i className={link.icon} aria-hidden="true" />
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

const Home = () => {
  const { items: events, status, retry } = useApiList<Event>('/api/events');
  // Phones show the same windows as the laptop; the bottom dock replaces the "my computer" shortcuts.
  const isPhone = useIsPhone();

  return (
    <div className="home">
      <Seo
        title="Microsoft Club GIKI | Tech Community at GIKI"
        description="Microsoft Club GIKI is a student tech community at Ghulam Ishaq Khan Institute. Explore events, projects, the Logikal podcast, and Microsoft Learn Student Ambassador activities."
        path="/"
        jsonLd={organizationJsonLd}
      />
      <Hero events={events} status={status} onRetry={retry} />
      <ActivityWindow />
      {!isPhone && (
        <div className="only-compact">
          <WindowCard title="my computer" titleBg="navy">
            <DesktopIcons layout="grid" label="Club apps" />
          </WindowCard>
        </div>
      )}
      <EventsWindow events={events} status={status} onRetry={retry} />
      <div className="pair">
        <PodcastWindow />
        <ProjectsWindow />
      </div>
      <ContactWindow />
      {isPhone && <DmWindow />}
    </div>
  );
};

export default Home;
