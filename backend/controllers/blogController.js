const prisma = require('../prisma/client');
const { uploadBufferToR2 } = require('../services/r2Service');

const getUploadedImageUrl = (result) => {
  if (result.storage !== 'local-fallback') {
    return result.url;
  }

  if (
    process.env.NODE_ENV === 'production' ||
    process.env.ALLOW_LOCAL_IMAGE_UPLOADS !== 'true'
  ) {
    return null;
  }

  const backendUrl = (
    process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`
  ).replace(/\/+$/, '');

  const encodedKey = result.key
    .split('/')
    .map(encodeURIComponent)
    .join('/');

  return `${backendUrl}/uploads/${encodedKey}`;
};

const optionalSocialUrl = (value, domain) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') return false;

  const trimmed = value.trim();
  if (!trimmed) return null;

  return isSocialProfileUrl(trimmed, domain) ? trimmed : false;
};

const isSocialProfileUrl = (value, domain) => {
  if (typeof value !== 'string') return false;

  try {
    const url = new URL(value.trim());
    return (
      url.protocol === 'https:' &&
      (url.hostname === domain || url.hostname.endsWith(`.${domain}`))
    );
  } catch {
    return false;
  }
};

const uploadBlogAuthorImage = async (req, res) => {
  const blogId = Number(req.params.id);

  if (!Number.isSafeInteger(blogId) || blogId <= 0) {
    return res.status(400).json({ message: 'Invalid blog ID.' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded.' });
  }

  try {
    const blog = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found.' });
    }

    const result = await uploadBufferToR2(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      'blogs',
      `author-${blogId}`
    );

    // The existing service can save locally if R2 isn't available.
    // Don't save its R2-looking URL to the database in that case.
   const imageUrl = getUploadedImageUrl(result);

    if (!imageUrl) {
      return res.status(503).json({
        message: 'Image upload requires Cloudflare R2, or enable local uploads for development.',
      });
    }

    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: { authorImage: imageUrl },
    });

    return res.json({ authorImage: updatedBlog.authorImage });
  } catch (error) {
    console.error('Upload blog author image error:', error);
    return res.status(500).json({ message: 'Failed to upload author image.' });
  }
};

const getBlogs = async (req, res) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(blogs);
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getBlogById = async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: Number(id) },
    });
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createBlog = async (req, res) => {
  try {
    const { title, content, author, tags, instagramUrl, linkedinUrl, authorImage } =
      req.body || {};

    const contentText =
      typeof content === 'string'
        ? content.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').trim()
        : '';

    if (
      typeof title !== 'string' ||
      !title.trim() ||
      !contentText ||
      typeof author !== 'string' ||
      !author.trim()
    ) {
      return res.status(400).json({
        message: 'Title, content, and author are required.',
      });
    }

    const isHttpUrl = (value) => {
      if (typeof value !== 'string' || !value.trim()) return false;

      try {
        const url = new URL(value.trim());
        return url.protocol === 'https:' || url.protocol === 'http:';
      } catch {
        return false;
      }
    };

    const instagram = optionalSocialUrl(instagramUrl, 'instagram.com');
    const linkedin = optionalSocialUrl(linkedinUrl, 'linkedin.com');

    if (instagram === false || linkedin === false) {
      return res.status(400).json({
        message: 'Instagram and LinkedIn links must be valid HTTPS profile URLs.',
      });
    }

    let authorImageUrl;

    if (req.file) {
      const result = await uploadBufferToR2(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        'blogs',
        'blog-author'
      );

      authorImageUrl = getUploadedImageUrl(result);

      if (!authorImageUrl) {
        return res.status(503).json({
          message: 'Image upload requires Cloudflare R2, or enable local uploads for development.',
        });
      }
    } else if (isHttpUrl(authorImage)) {
      authorImageUrl = authorImage.trim();
    } else {
      return res.status(400).json({
        message: 'Upload an author image or provide a valid image URL.',
      });
    }


    const tagsArr = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
        ? tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [];

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        author,
        authorImage: authorImageUrl,
        instagramUrl: instagram,
        linkedinUrl: linkedin,
        tags: tagsArr,
      },
    });

    return res.status(201).json(blog);
  } catch (error) {
    console.error('Create blog error:', error);
    return res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

const updateBlog = async (req, res) => {
  const { id } = req.params;
  try {
    const { title, content, author, tags, instagramUrl, linkedinUrl, authorImage } = req.body || {};
    const tagsArr = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;
 
      const instagram = optionalSocialUrl(instagramUrl, 'instagram.com');
      const linkedin = optionalSocialUrl(linkedinUrl, 'linkedin.com');

      if (instagram === false || linkedin === false) {
        return res.status(400).json({
          message: 'Instagram and LinkedIn links must be valid HTTPS profile URLs.',
        });
      }

      let authorImageUrl;

      if (authorImage !== undefined) {
        if (typeof authorImage !== 'string' || !authorImage.trim()) {
          return res.status(400).json({
            message: 'Provide a valid author image URL.',
          });
        }

        try {
          const parsedUrl = new URL(authorImage.trim());
          if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            throw new Error('Unsupported protocol');
          }
          authorImageUrl = authorImage.trim();
        } catch {
          return res.status(400).json({
            message: 'Author image must be a valid HTTP or HTTPS URL.',
          });
        }
      }

    const blog = await prisma.blog.update({
      where: { id: Number(id) },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(author !== undefined ? { author } : {}),
        ...(tagsArr !== undefined ? { tags: tagsArr } : {}),
        ...(instagram !== undefined ? { instagramUrl: instagram } : {}),
        ...(linkedin !== undefined ? { linkedinUrl: linkedin } : {}),
        ...(authorImageUrl !== undefined ? { authorImage: authorImageUrl } : {}),
      },
    });
    res.json(blog);
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

const deleteBlog = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.blog.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Blog deleted' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  uploadBlogAuthorImage,
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};

