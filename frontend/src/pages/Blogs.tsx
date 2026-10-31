import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import WindowCard from '../components/WindowCard';
import Seo from '../components/Seo';
import { api } from '../services/api';
import type { Blog } from '../services/api';

const Blogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await api.get<Blog[]>('/api/blogs');
        setBlogs(res.data);
      } catch {
        setError('Failed to load blogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="space-y-4">
      <Seo
        title="Blogs"
        description="Articles and insights from Microsoft Club GIKI members on tech, community, and campus life."
        path="/blogs"
      />
      <h1 className="font-heading text-sm md:text-base mb-2">Blogs</h1>
      {loading && <p className="text-sm">Loading blogs...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="grid-layout">
          {blogs.map((blog) => (
            <WindowCard key={blog.id} title={blog.title}>
              <p className="text-xs text-gray-700 mb-1">By {blog.author}</p>
              <p className="text-sm mb-3">
                {blog.content.replace(/<[^>]*>/g, '').length > 160
                  ? `${blog.content.replace(/<[^>]*>/g, '').slice(0, 160)}...`
                  : blog.content.replace(/<[^>]*>/g, '')}
              </p>
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {blog.tags.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 border border-black bg-lightBg"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <Link
                to={`/blogs/${blog.id}`}
                className="underline text-sm font-semibold"
              >
                Read more
              </Link>
            </WindowCard>
          ))}
          {!blogs.length && (
            <p className="text-sm text-gray-600 col-span-full">
              No blogs yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Blogs;

