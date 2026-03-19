import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelButton from '../components/PixelButton';
import WindowCard from '../components/WindowCard';
import { api } from '../services/api';
import type { Event, Podcast, Member, Project, Blog } from '../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const email = localStorage.getItem('mcg_admin_email');

  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [formState, setFormState] = useState<Partial<Event>>({
    title: '',
    description: '',
    date: '',
    type: 'upcoming',
    registrationLink: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagesText, setImagesText] = useState('');

  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loadingPodcasts, setLoadingPodcasts] = useState(false);
  const [podcastForm, setPodcastForm] = useState<Partial<Podcast>>({
    title: '',
    description: '',
    youtubeLink: '',
    guest: '',
    date: '',
  });
  const [editingPodcastId, setEditingPodcastId] = useState<number | null>(null);
  const [podcastError, setPodcastError] = useState<string | null>(null);
  const [savingPodcast, setSavingPodcast] = useState(false);

  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberForm, setMemberForm] = useState<Partial<Member>>({
    name: '',
    role: '',
    tenure: '',
    image: '',
    linkedin: '',
    isCurrent: true,
  });
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [savingMember, setSavingMember] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectForm, setProjectForm] = useState<{
    title: string;
    description: string;
    techStackText: string;
    githubLink: string;
    demoLink: string;
    contributorsText: string;
  }>({
    title: '',
    description: '',
    techStackText: '',
    githubLink: '',
    demoLink: '',
    contributorsText: '',
  });
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [savingProject, setSavingProject] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [blogForm, setBlogForm] = useState<{
    title: string;
    author: string;
    content: string;
    tagsText: string;
  }>({
    title: '',
    author: '',
    content: '',
    tagsText: '',
  });
  const [editingBlogId, setEditingBlogId] = useState<number | null>(null);
  const [savingBlog, setSavingBlog] = useState(false);
  const [blogError, setBlogError] = useState<string | null>(null);

  // Accordion toggles to keep the dashboard usable as lists grow.
  const [eventsListOpen, setEventsListOpen] = useState(true);
  const [episodesListOpen, setEpisodesListOpen] = useState(true);
  const [membersListOpen, setMembersListOpen] = useState(true);
  const [projectsListOpen, setProjectsListOpen] = useState(true);
  const [blogsListOpen, setBlogsListOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('mcg_admin_token');
    localStorage.removeItem('mcg_admin_email');
    navigate('/admin/login');
  };

  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await api.get<Event[]>('/api/events');
      setEvents(res.data);
    } catch {
      setError('Failed to load events.');
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadEvents();
    loadPodcasts();
    loadMembers();
    loadProjects();
    loadBlogs();
  }, []);

  const loadPodcasts = async () => {
    setLoadingPodcasts(true);
    try {
      const res = await api.get<Podcast[]>('/api/podcasts');
      setPodcasts(res.data);
    } catch {
      setPodcastError('Failed to load podcasts.');
    } finally {
      setLoadingPodcasts(false);
    }
  };

  const loadMembers = async () => {
    setLoadingMembers(true);
    try {
      const res = await api.get<Member[]>('/api/members');
      setMembers(res.data);
    } catch {
      setMemberError('Failed to load members.');
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await api.get<Project[]>('/api/projects');
      setProjects(res.data);
    } catch {
      setProjectError('Failed to load projects.');
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadBlogs = async () => {
    setLoadingBlogs(true);
    try {
      const res = await api.get<Blog[]>('/api/blogs');
      setBlogs(res.data);
    } catch {
      setBlogError('Failed to load blogs.');
    } finally {
      setLoadingBlogs(false);
    }
  };

  const resetForm = () => {
    setFormState({
      title: '',
      description: '',
      date: '',
      type: 'upcoming',
      registrationLink: '',
    });
    setImagesText('');
    setEditingId(null);
  };

  const resetMemberForm = () => {
    setMemberForm({
      name: '',
      role: '',
      tenure: '',
      image: '',
      linkedin: '',
      isCurrent: true,
    });
    setEditingMemberId(null);
  };

  const resetProjectForm = () => {
    setProjectForm({
      title: '',
      description: '',
      techStackText: '',
      githubLink: '',
      demoLink: '',
      contributorsText: '',
    });
    setEditingProjectId(null);
  };

  const resetBlogForm = () => {
    setBlogForm({
      title: '',
      author: '',
      content: '',
      tagsText: '',
    });
    setEditingBlogId(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        title: formState.title || '',
        description: formState.description || '',
        date: formState.date || new Date().toISOString(),
        type: formState.type || 'upcoming',
        registrationLink: formState.registrationLink || undefined,
        images: imagesText
          ? imagesText
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      };

      if (editingId !== null) {
        await api.put(`/api/events/${editingId}`, payload);
      } else {
        await api.post('/api/events', payload);
      }

      await loadEvents();
      resetForm();
    } catch {
      setError('Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  const handleBlogSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSavingBlog(true);
    setBlogError(null);

    try {
      const payload = {
        title: blogForm.title || '',
        author: blogForm.author || '',
        content: blogForm.content || '',
        tags: blogForm.tagsText
          ? blogForm.tagsText
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      };

      if (editingBlogId !== null) {
        await api.put(`/api/blogs/${editingBlogId}`, payload);
      } else {
        await api.post('/api/blogs', payload);
      }

      await loadBlogs();
      resetBlogForm();
    } catch {
      setBlogError('Failed to save blog.');
    } finally {
      setSavingBlog(false);
    }
  };

  const handleMemberSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSavingMember(true);
    setMemberError(null);

    try {
      const payload = {
        name: memberForm.name || '',
        role: memberForm.role || '',
        tenure: memberForm.tenure || '',
        image: memberForm.image || '',
        linkedin: memberForm.linkedin || '',
        isCurrent: memberForm.isCurrent ?? true,
      };

      if (editingMemberId !== null) {
        await api.put(`/api/members/${editingMemberId}`, payload);
      } else {
        await api.post('/api/members', payload);
      }

      await loadMembers();
      resetMemberForm();
    } catch {
      setMemberError('Failed to save member.');
    } finally {
      setSavingMember(false);
    }
  };

  const handleProjectSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProject(true);
    setProjectError(null);

    try {
      const techStack = projectForm.techStackText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const contributors = projectForm.contributorsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: projectForm.title || '',
        description: projectForm.description || '',
        techStack,
        githubLink: projectForm.githubLink || '',
        demoLink: projectForm.demoLink || '',
        contributors,
      };

      if (editingProjectId !== null) {
        await api.put(`/api/projects/${editingProjectId}`, payload);
      } else {
        await api.post('/api/projects', payload);
      }

      await loadProjects();
      resetProjectForm();
    } catch {
      setProjectError('Failed to save project.');
    } finally {
      setSavingProject(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingId(event.id);
    setFormState({
      title: event.title,
      description: event.description,
      date: event.date.slice(0, 10),
      type: event.type,
      registrationLink: event.registrationLink,
    });
    setImagesText((event.images || []).join(', '));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api.delete(`/api/events/${id}`);
      await loadEvents();
    } catch {
      setError('Failed to delete event.');
    }
  };

  const handleEditMember = (member: Member) => {
    setEditingMemberId(member.id);
    setMemberForm({
      name: member.name,
      role: member.role,
      tenure: member.tenure,
      image: member.image || '',
      linkedin: member.linkedin || '',
      isCurrent: member.isCurrent,
    });
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm('Delete this member?')) return;
    try {
      await api.delete(`/api/members/${id}`);
      await loadMembers();
    } catch {
      setMemberError('Failed to delete member.');
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProjectId(project.id);
    setProjectForm({
      title: project.title,
      description: project.description,
      techStackText: (project.techStack || []).join(', '),
      githubLink: project.githubLink || '',
      demoLink: project.demoLink || '',
      contributorsText: (project.contributors || []).join(', '),
    });
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm('Delete this project?')) return;
    try {
      await api.delete(`/api/projects/${id}`);
      await loadProjects();
    } catch {
      setProjectError('Failed to delete project.');
    }
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlogId(blog.id);
    setBlogForm({
      title: blog.title,
      author: blog.author,
      content: blog.content,
      tagsText: (blog.tags || []).join(', '),
    });
  };

  const handleDeleteBlog = async (id: number) => {
    if (!confirm('Delete this blog post?')) return;
    try {
      await api.delete(`/api/blogs/${id}`);
      await loadBlogs();
    } catch {
      setBlogError('Failed to delete blog.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold mb-2">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          {email && (
            <span className="text-xs text-gray-600">Logged in as {email}</span>
          )}
          <PixelButton label="Logout" onClick={handleLogout} />
        </div>
      </div>

      <WindowCard title="Events Manager">
        <div className="grid gap-6 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">
              {editingId ? 'Edit Event' : 'Create Event'}
            </h2>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div>
              <label className="block text-xs font-medium mb-1">Title</label>
              <input
                type="text"
                value={formState.title || ''}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, title: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Description
              </label>
              <textarea
                value={formState.description || ''}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, description: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs min-h-[60px]"
                required
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={formState.date || ''}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, date: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1">Type</label>
                <select
                  value={formState.type || 'upcoming'}
                  onChange={(e) =>
                    setFormState((s) => ({
                      ...s,
                      type: e.target.value as Event['type'],
                    }))
                  }
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Registration Link (optional)
              </label>
              <input
                type="url"
                value={formState.registrationLink || ''}
                onChange={(e) =>
                  setFormState((s) => ({
                    ...s,
                    registrationLink: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Event Photos (optional, comma-separated URLs)
              </label>
              <input
                type="text"
                value={imagesText}
                onChange={(e) => setImagesText(e.target.value)}
                placeholder="https://..., https://..."
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              />
            </div>
            <div className="flex gap-2">
              <PixelButton
                type="submit"
                label={saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                className="justify-center flex-1"
                disabled={saving}
              />
              {editingId && (
                <PixelButton
                  type="button"
                  label="Cancel"
                  className="justify-center flex-1 bg-gray-300 text-black"
                  onClick={resetForm}
                />
              )}
            </div>
          </form>

          <div className="space-y-2">
            <button
              type="button"
              className="w-full flex items-center justify-between text-xs font-semibold bg-lightBg border border-black px-2 py-1"
              onClick={() => setEventsListOpen((v) => !v)}
            >
              <span>Existing Events</span>
              <span className="text-[10px]">{eventsListOpen ? 'Hide' : 'Show'}</span>
            </button>

            {eventsListOpen && (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {loadingEvents && <p className="text-xs">Loading events...</p>}
                {!loadingEvents && !events.length && (
                  <p className="text-xs text-gray-600">No events yet.</p>
                )}
                {!loadingEvents &&
                  events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start justify-between gap-2 border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                    >
                      <div>
                        <p className="font-semibold">{event.title}</p>
                        <p className="text-gray-600">
                          {new Date(event.date).toLocaleDateString()} •{' '}
                          {event.type}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          className="underline text-blue-600"
                          onClick={() => handleEdit(event)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="underline text-red-600"
                          onClick={() => handleDelete(event.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </WindowCard>

      <WindowCard title="Logikal Podcast Manager">
        <div className="grid gap-6 md:grid-cols-2">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSavingPodcast(true);
              setPodcastError(null);
              try {
                const payload = {
                  title: podcastForm.title || '',
                  description: podcastForm.description || '',
                  youtubeLink: podcastForm.youtubeLink || '',
                  guest: podcastForm.guest || '',
                  date:
                    podcastForm.date ||
                    new Date().toISOString().slice(0, 10),
                };
                if (editingPodcastId !== null) {
                  await api.put(
                    `/api/podcasts/${editingPodcastId}`,
                    payload
                  );
                } else {
                  await api.post('/api/podcasts', payload);
                }
                await loadPodcasts();
                setPodcastForm({
                  title: '',
                  description: '',
                  youtubeLink: '',
                  guest: '',
                  date: '',
                });
                setEditingPodcastId(null);
              } catch {
                setPodcastError('Failed to save podcast.');
              } finally {
                setSavingPodcast(false);
              }
            }}
            className="space-y-3"
          >
            <h2 className="font-semibold text-sm">
              {editingPodcastId ? 'Edit Episode' : 'Create Episode'}
            </h2>
            {podcastError && (
              <p className="text-xs text-red-600">{podcastError}</p>
            )}
            <div>
              <label className="block text-xs font-medium mb-1">Title</label>
              <input
                type="text"
                value={podcastForm.title || ''}
                onChange={(e) =>
                  setPodcastForm((s) => ({ ...s, title: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Guest</label>
              <input
                type="text"
                value={podcastForm.guest || ''}
                onChange={(e) =>
                  setPodcastForm((s) => ({ ...s, guest: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                required
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={podcastForm.date || ''}
                  onChange={(e) =>
                    setPodcastForm((s) => ({ ...s, date: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1">
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={podcastForm.youtubeLink || ''}
                  onChange={(e) =>
                    setPodcastForm((s) => ({
                      ...s,
                      youtubeLink: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Description
              </label>
              <textarea
                value={podcastForm.description || ''}
                onChange={(e) =>
                  setPodcastForm((s) => ({
                    ...s,
                    description: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs min-h-[60px]"
                required
              />
            </div>
            <div className="flex gap-2">
              <PixelButton
                type="submit"
                label={
                  savingPodcast
                    ? 'Saving...'
                    : editingPodcastId
                    ? 'Update'
                    : 'Create'
                }
                className="justify-center flex-1"
                disabled={savingPodcast}
              />
              {editingPodcastId && (
                <PixelButton
                  type="button"
                  label="Cancel"
                  className="justify-center flex-1 bg-gray-300 text-black"
                  onClick={() => {
                    setEditingPodcastId(null);
                    setPodcastForm({
                      title: '',
                      description: '',
                      youtubeLink: '',
                      guest: '',
                      date: '',
                    });
                  }}
                />
              )}
            </div>
          </form>

          <div className="space-y-2">
            <button
              type="button"
              className="w-full flex items-center justify-between text-xs font-semibold bg-lightBg border border-black px-2 py-1"
              onClick={() => setEpisodesListOpen((v) => !v)}
            >
              <span>Episodes</span>
              <span className="text-[10px]">
                {episodesListOpen ? 'Hide' : 'Show'}
              </span>
            </button>

            {episodesListOpen && (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {loadingPodcasts && <p className="text-xs">Loading episodes...</p>}
                {!loadingPodcasts && !podcasts.length && (
                  <p className="text-xs text-gray-600">No episodes yet.</p>
                )}
                {!loadingPodcasts &&
                  podcasts.map((episode) => (
                    <div
                      key={episode.id}
                      className="flex items-start justify-between gap-2 border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                    >
                      <div>
                        <p className="font-semibold">{episode.title}</p>
                        <p className="text-gray-600">
                          {new Date(episode.date).toLocaleDateString()} •{' '}
                          {episode.guest}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          className="underline text-blue-600"
                          onClick={() => {
                            setEditingPodcastId(episode.id);
                            setPodcastForm({
                              title: episode.title,
                              description: episode.description,
                              youtubeLink: episode.youtubeLink,
                              guest: episode.guest,
                              date: episode.date.slice(0, 10),
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="underline text-red-600"
                          onClick={async () => {
                            if (!confirm('Delete this episode?')) return;
                            try {
                              await api.delete(`/api/podcasts/${episode.id}`);
                              await loadPodcasts();
                            } catch {
                              setPodcastError('Failed to delete podcast.');
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </WindowCard>

      <WindowCard title="Members Manager">
        <div className="grid gap-6 md:grid-cols-2">
          <form onSubmit={handleMemberSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">
              {editingMemberId ? 'Edit Member' : 'Create Member'}
            </h2>
            {memberError && <p className="text-xs text-red-600">{memberError}</p>}

            <div>
              <label className="block text-xs font-medium mb-1">Name</label>
              <input
                type="text"
                value={memberForm.name || ''}
                onChange={(e) =>
                  setMemberForm((s) => ({ ...s, name: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Role</label>
              <input
                type="text"
                value={memberForm.role || ''}
                onChange={(e) =>
                  setMemberForm((s) => ({ ...s, role: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Tenure</label>
              <input
                type="text"
                value={memberForm.tenure || ''}
                onChange={(e) =>
                  setMemberForm((s) => ({ ...s, tenure: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Image URL (optional)
              </label>
              <input
                type="url"
                value={memberForm.image || ''}
                onChange={(e) =>
                  setMemberForm((s) => ({ ...s, image: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                LinkedIn URL (optional)
              </label>
              <input
                type="url"
                value={memberForm.linkedin || ''}
                onChange={(e) =>
                  setMemberForm((s) => ({ ...s, linkedin: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={memberForm.isCurrent ?? false}
                onChange={(e) =>
                  setMemberForm((s) => ({ ...s, isCurrent: e.target.checked }))
                }
              />
              <label className="text-xs font-medium">Current EC</label>
            </div>

            <div className="flex gap-2">
              <PixelButton
                type="submit"
                label={savingMember ? 'Saving...' : editingMemberId ? 'Update' : 'Create'}
                className="justify-center flex-1"
                disabled={savingMember}
              />
              {editingMemberId && (
                <PixelButton
                  type="button"
                  label="Cancel"
                  className="justify-center flex-1 bg-gray-300 text-black"
                  onClick={resetMemberForm}
                />
              )}
            </div>
          </form>

          <div className="space-y-2">
            <button
              type="button"
              className="w-full flex items-center justify-between text-xs font-semibold bg-lightBg border border-black px-2 py-1"
              onClick={() => setMembersListOpen((v) => !v)}
            >
              <span>Existing Members</span>
              <span className="text-[10px]">
                {membersListOpen ? 'Hide' : 'Show'}
              </span>
            </button>

            {membersListOpen && (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {loadingMembers && (
                  <p className="text-xs">Loading members...</p>
                )}
                {!loadingMembers && !members.length && (
                  <p className="text-xs text-gray-600">No members yet.</p>
                )}
                {!loadingMembers &&
                  members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-start justify-between gap-2 border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                    >
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-gray-600">
                          {member.role} • {member.tenure}
                        </p>
                        <p className="text-[10px] mt-1">
                          {member.isCurrent ? 'Current' : 'Alumni'}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          className="underline text-blue-600"
                          onClick={() => handleEditMember(member)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="underline text-red-600"
                          onClick={() => handleDeleteMember(member.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </WindowCard>

      <WindowCard title="Projects Manager">
        <div className="grid gap-6 md:grid-cols-2">
          <form onSubmit={handleProjectSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">
              {editingProjectId ? 'Edit Project' : 'Create Project'}
            </h2>
            {projectError && <p className="text-xs text-red-600">{projectError}</p>}

            <div>
              <label className="block text-xs font-medium mb-1">Title</label>
              <input
                type="text"
                value={projectForm.title}
                onChange={(e) =>
                  setProjectForm((s) => ({ ...s, title: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Description
              </label>
              <textarea
                value={projectForm.description}
                onChange={(e) =>
                  setProjectForm((s) => ({ ...s, description: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs min-h-[60px]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Tech Stack (comma-separated)
              </label>
              <input
                type="text"
                value={projectForm.techStackText}
                onChange={(e) =>
                  setProjectForm((s) => ({
                    ...s,
                    techStackText: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Contributors (comma-separated)
              </label>
              <input
                type="text"
                value={projectForm.contributorsText}
                onChange={(e) =>
                  setProjectForm((s) => ({
                    ...s,
                    contributorsText: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                GitHub Link (optional)
              </label>
              <input
                type="url"
                value={projectForm.githubLink}
                onChange={(e) =>
                  setProjectForm((s) => ({ ...s, githubLink: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Demo Link (optional)
              </label>
              <input
                type="url"
                value={projectForm.demoLink}
                onChange={(e) =>
                  setProjectForm((s) => ({ ...s, demoLink: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              />
            </div>

            <div className="flex gap-2">
              <PixelButton
                type="submit"
                label={savingProject ? 'Saving...' : editingProjectId ? 'Update' : 'Create'}
                className="justify-center flex-1"
                disabled={savingProject}
              />
              {editingProjectId && (
                <PixelButton
                  type="button"
                  label="Cancel"
                  className="justify-center flex-1 bg-gray-300 text-black"
                  onClick={resetProjectForm}
                />
              )}
            </div>
          </form>

          <div className="space-y-2">
            <button
              type="button"
              className="w-full flex items-center justify-between text-xs font-semibold bg-lightBg border border-black px-2 py-1"
              onClick={() => setProjectsListOpen((v) => !v)}
            >
              <span>Existing Projects</span>
              <span className="text-[10px]">
                {projectsListOpen ? 'Hide' : 'Show'}
              </span>
            </button>

            {projectsListOpen && (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {loadingProjects && (
                  <p className="text-xs">Loading projects...</p>
                )}
                {!loadingProjects && !projects.length && (
                  <p className="text-xs text-gray-600">No projects yet.</p>
                )}
                {!loadingProjects &&
                  projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-start justify-between gap-2 border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                    >
                      <div>
                        <p className="font-semibold">{project.title}</p>
                        <p className="text-gray-600">
                          Tech: {project.techStack?.join(', ') || '—'}
                        </p>
                        <p className="text-[10px] mt-1">
                          Contributors: {project.contributors?.join(', ') || '—'}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          className="underline text-blue-600"
                          onClick={() => handleEditProject(project)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="underline text-red-600"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </WindowCard>

      <WindowCard title="Blogs Manager">
        <div className="grid gap-6 md:grid-cols-2">
          <form onSubmit={handleBlogSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">
              {editingBlogId ? 'Edit Blog' : 'Create Blog'}
            </h2>
            {blogError && <p className="text-xs text-red-600">{blogError}</p>}

            <div>
              <label className="block text-xs font-medium mb-1">Title</label>
              <input
                type="text"
                value={blogForm.title}
                onChange={(e) =>
                  setBlogForm((s) => ({ ...s, title: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Author</label>
              <input
                type="text"
                value={blogForm.author}
                onChange={(e) =>
                  setBlogForm((s) => ({ ...s, author: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={blogForm.tagsText}
                onChange={(e) =>
                  setBlogForm((s) => ({ ...s, tagsText: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Content</label>
              <div className="bg-white border border-black">
                <ReactQuill
                  theme="snow"
                  value={blogForm.content}
                  onChange={(value) =>
                    setBlogForm((s) => ({ ...s, content: value }))
                  }
                  className="min-h-[180px]"
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      ['link'],
                      ['clean'],
                    ],
                  }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <PixelButton
                type="submit"
                label={savingBlog ? 'Saving...' : editingBlogId ? 'Update' : 'Create'}
                className="justify-center flex-1"
                disabled={savingBlog}
              />
              {editingBlogId && (
                <PixelButton
                  type="button"
                  label="Cancel"
                  className="justify-center flex-1 bg-gray-300 text-black"
                  onClick={resetBlogForm}
                />
              )}
            </div>
          </form>

          <div className="space-y-2">
            <button
              type="button"
              className="w-full flex items-center justify-between text-xs font-semibold bg-lightBg border border-black px-2 py-1"
              onClick={() => setBlogsListOpen((v) => !v)}
            >
              <span>Existing Blogs</span>
              <span className="text-[10px]">{blogsListOpen ? 'Hide' : 'Show'}</span>
            </button>

            {blogsListOpen && (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {loadingBlogs && <p className="text-xs">Loading blogs...</p>}
                {!loadingBlogs && !blogs.length && (
                  <p className="text-xs text-gray-600">No blogs yet.</p>
                )}
                {!loadingBlogs &&
                  blogs.map((blog) => (
                    <div
                      key={blog.id}
                      className="flex items-start justify-between gap-2 border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                    >
                      <div>
                        <p className="font-semibold">{blog.title}</p>
                        <p className="text-gray-600">
                          {blog.author}
                        </p>
                        {blog.tags && blog.tags.length > 0 && (
                          <p className="text-[10px] mt-1">
                            Tags: {blog.tags.slice(0, 3).join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          className="underline text-blue-600"
                          onClick={() => handleEditBlog(blog)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="underline text-red-600"
                          onClick={() => handleDeleteBlog(blog.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </WindowCard>
    </div>
  );
};

export default Dashboard;

