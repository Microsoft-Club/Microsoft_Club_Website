const prisma = require('../prisma/client');
const { uploadBufferToR2 } = require('../services/r2Service');

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
    if (result.storage === 'local-fallback') {
      return res.status(503).json({
        message: 'Upload did not reach Cloudflare R2; the blog image was not updated.',
      });
    }

    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: { authorImage: result.url },
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
    const { title, content, author, tags, instagramUrl, linkedinUrl } =
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

    if (!req.file) {
      return res.status(400).json({ message: 'Author image is required.' });
    } 

    const instagram = optionalSocialUrl(instagramUrl, 'instagram.com');
    const linkedin = optionalSocialUrl(linkedinUrl, 'linkedin.com');

    if (instagram === false || linkedin === false) {
      return res.status(400).json({
        message: 'Instagram and LinkedIn links must be valid HTTPS profile URLs.',
      });
    }

    const result = await uploadBufferToR2(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      'blogs',
      'blog-author'
    );

    if (result.storage === 'local-fallback') {
      return res.status(503).json({
        message: 'Image upload did not reach Cloudflare R2; blog was not created.',
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
        authorImage: result.url,
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
    const { title, content, author, tags, instagramUrl, linkedinUrl } = req.body || {};
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

    const blog = await prisma.blog.update({
      where: { id: Number(id) },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(author !== undefined ? { author } : {}),
        ...(tagsArr !== undefined ? { tags: tagsArr } : {}),
        ...(instagram !== undefined ? { instagramUrl: instagram } : {}),
        ...(linkedin !== undefined ? { linkedinUrl: linkedin } : {}),
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

