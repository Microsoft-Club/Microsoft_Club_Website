const prisma = require('../prisma/client');

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
    const { title, content, author, tags } = req.body || {};
    const tagsArr = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        author,
        tags: tagsArr,
      },
    });
    res.status(201).json(blog);
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

const updateBlog = async (req, res) => {
  const { id } = req.params;
  try {
    const { title, content, author, tags } = req.body || {};
    const tagsArr = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    const blog = await prisma.blog.update({
      where: { id: Number(id) },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(author !== undefined ? { author } : {}),
        ...(tagsArr !== undefined ? { tags: tagsArr } : {}),
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
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};

