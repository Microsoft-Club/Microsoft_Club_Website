import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import WindowCard from '../components/WindowCard';
import { api } from '../services/api';
import type { Blog } from '../services/api';

const ALLOWED_BLOG_TAGS = new Set([
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'ol',
  'ul',
  'li',
  'h1',
  'h2',
  'h3',
  'blockquote',
  'a',
]);

const sanitizeBlogHtml = (html: string) => {
  const parsed = new DOMParser().parseFromString(html, 'text/html');

  parsed.body.querySelectorAll('*').forEach((element) => {
    const tagName = element.tagName.toLowerCase();

    if (!ALLOWED_BLOG_TAGS.has(tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      const isSafeLink =
        tagName === 'a' &&
        attribute.name === 'href' &&
        (() => {
          try {
            const protocol = new URL(attribute.value, window.location.origin).protocol;
            return ['http:', 'https:', 'mailto:'].includes(protocol);
          } catch {
            return false;
          }
        })();

      if (!isSafeLink) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  return parsed.body.innerHTML;
};

const BlogDetail = () => {
  const params = useParams();
  const id = params.id ? Number(params.id) : null;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;
      try {
        const res = await api.get<Blog>(`/api/blogs/${id}`);
        setBlog(res.data);
      } catch {
        setError('Failed to load blog post.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  return (
    <div className="space-y-4">
      <WindowCard title="Notepad - Blog Post">
        {loading && <p className="text-sm">Loading...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && blog && (
          <article className="font-body">
            <div className="bg-[#fef9c3] border-retro border-black rounded-retro shadow-retro p-5 md:p-6">
              <p className="text-xs text-gray-800 mb-3">
                By {blog.author} •{' '}
                {blog.createdAt
                  ? new Date(blog.createdAt).toLocaleDateString()
                  : '—'}
              </p>
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {blog.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 border border-black bg-white"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div
                className="text-sm leading-6 text-black [&_p]:mb-3 [&_ul]:list-disc [&_li]:ml-5 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_blockquote]:border-l-4 [&_blockquote]:border-black [&_blockquote]:pl-3 [&_a]:underline [&_a]:underline-offset-2"
                dangerouslySetInnerHTML={{
                  __html: blog.content ? sanitizeBlogHtml(blog.content) : '',
                }}
              />
            </div>
          </article>
        )}
      </WindowCard>
    </div>
  );
};

export default BlogDetail;

