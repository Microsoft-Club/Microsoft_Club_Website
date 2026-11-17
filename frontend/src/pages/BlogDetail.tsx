import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import WindowCard from '../components/WindowCard';
import Seo from '../components/Seo';
import { api } from '../services/api';
import type { Blog } from '../services/api';
import { resolveImageUrl } from '../utils/image';

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

const getSafeSocialUrl = (value: string | null, domain: string) => {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (
      url.protocol === 'https:' &&
      (url.hostname === domain || url.hostname.endsWith(`.${domain}`))
    ) {
      return url.toString();
    }
  } catch {
    return null;
  }

  return null;
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

  const plainText = blog
    ? blog.content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    : '';
  const instagramUrl = blog
    ? getSafeSocialUrl(blog.instagramUrl, 'instagram.com')
    : null;
  const linkedinUrl = blog
    ? getSafeSocialUrl(blog.linkedinUrl, 'linkedin.com')
    : null;

  return (
    <div className="space-y-4">
      <Seo
        title={blog?.title || 'Blog Post'}
        description={
          plainText
            ? plainText.slice(0, 160)
            : 'Read posts from Microsoft Club GIKI.'
        }
        path={id ? `/blogs/${id}` : '/blogs'}
      />
      <WindowCard title="Notepad - Blog Post">
        {loading && <p className="text-sm">Loading...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && blog && (
          <article className="font-body">
            <div className="bg-[#fef9c3] border-retro border-black rounded-retro shadow-retro p-5 md:p-6">
              <h1 className="font-heading text-base md:text-lg mb-4">
                {blog.title}
              </h1>
              <div className="mb-4 flex items-center gap-3">
                <img
                  src={resolveImageUrl(
                    blog.authorImage || '/blog-author-placeholder.svg'
                  )}
                  alt={`${blog.author} author photo`}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = resolveImageUrl(
                      '/blog-author-placeholder.svg'
                    );
                  }}
                  className="h-12 w-12 rounded-full border border-black object-cover"
                />
                <div>
                  <p className="text-xs text-gray-800">
                    By {blog.author} •{' '}
                    {blog.createdAt
                      ? new Date(blog.createdAt).toLocaleDateString()
                      : '—'}
                  </p>
                  {(instagramUrl || linkedinUrl) && (
                    <div className="mt-1 flex gap-3 text-xs">
                      {instagramUrl && (
                        <a
                          href={instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          Instagram
                        </a>
                      )}
                      {linkedinUrl && (
                        <a
                          href={linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          LinkedIn
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
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

