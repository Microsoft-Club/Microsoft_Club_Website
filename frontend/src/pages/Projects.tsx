import { useEffect, useState } from 'react';
import WindowCard from '../components/WindowCard';
import PixelButton from '../components/PixelButton';
import type { Project } from '../services/api';
import { api } from '../services/api';

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-sm md:text-base mb-2">Projects</h1>
      {loading && <p className="text-sm">Loading projects...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="grid-layout">
          {projects.map((project) => (
            <WindowCard key={project.id} title={project.title}>
              <p className="text-sm mb-1">
                Tech: {project.techStack?.join(', ') || '—'}
              </p>
              <p className="text-sm mb-3">{project.description}</p>
              <div className="flex gap-2 flex-wrap">
                {project.githubLink && (
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <PixelButton label="GitHub" />
                  </a>
                )}
                {project.demoLink && (
                  <a href={project.demoLink} target="_blank" rel="noreferrer">
                    <PixelButton label="Demo" />
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

