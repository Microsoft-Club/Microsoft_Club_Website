import { useEffect, useRef, useState } from 'react';
import WindowCard from '../components/WindowCard';
import PixelButton from '../components/PixelButton';
import Seo from '../components/Seo';
import type { Project } from '../services/api';
import { api } from '../services/api';
import { resolveImageUrl } from '../utils/image';

const ProjectImage = ({ src, alt }: { src: string; alt: string }) => {
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

const ProjectImageCarousel = ({
  images,
  projectTitle,
}: {
  images: string[];
  projectTitle: string;
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
            <ProjectImage
              src={src}
              alt={`${projectTitle} photo ${idx + 1}`}
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

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProjectIds, setExpandedProjectIds] = useState<Set<number>>(
    new Set()
  );
  const DESCRIPTION_PREVIEW_LIMIT = 140;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get<Project[]>('/api/projects');
        setProjects(res.data);
      } catch {
        setError('Failed to load projects.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const toggleProjectDescription = (projectId: number) => {
    setExpandedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <Seo
        title="Projects"
        description="Explore projects built by Microsoft Club GIKI members across web, AI, cloud, and more."
        path="/projects"
      />
      <h1 className="font-heading text-sm md:text-base mb-2">Projects</h1>
      {loading && <p className="text-sm">Loading projects...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="grid-layout">
          {projects.map((project) => (
            <WindowCard
              key={project.id}
              title={project.title}
              imageSlot={
                project.images?.length ? (
                  <ProjectImageCarousel
                    images={project.images}
                    projectTitle={project.title}
                  />
                ) : undefined
              }
            >
              {(() => {
                const isExpanded = expandedProjectIds.has(project.id);
                const hasLongDescription =
                  project.description.length > DESCRIPTION_PREVIEW_LIMIT;
                const displayedDescription =
                  hasLongDescription && !isExpanded
                    ? `${project.description.slice(0, DESCRIPTION_PREVIEW_LIMIT).trim()}...`
                    : project.description;

                return (
                  <>
                    <p className="text-sm mb-1">
                      Tech: {project.techStack?.join(', ') || '—'}
                    </p>
                    <p className="text-sm mb-1">
                      Contributors: {project.contributors?.join(', ') || '—'}
                    </p>
                    <p className="text-sm">{displayedDescription}</p>
                    {hasLongDescription && (
                      <PixelButton
                        type="button"
                        label={isExpanded ? 'Read less' : 'Read more'}
                        className="mt-2 mb-3 self-start"
                        onClick={() => toggleProjectDescription(project.id)}
                      />
                    )}
                    {!hasLongDescription && <div className="mb-3" />}
                  </>
                );
              })()}
              <div className="flex gap-2 flex-wrap">
                {!!project.githubLink?.trim() && (
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noreferrer"
                    className="pixel-button"
                  >
                    GitHub
                  </a>
                )}
                {!!project.demoLink?.trim() && (
                  <a
                    href={project.demoLink}
                    target="_blank"
                    rel="noreferrer"
                    className="pixel-button"
                  >
                    Demo
                  </a>
                )}
              </div>
            </WindowCard>
          ))}
          {!projects.length && (
            <p className="text-sm col-span-full">No projects found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Projects;

