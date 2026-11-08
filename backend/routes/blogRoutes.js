const express = require('express');
const {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getBlogs);
router.get('/:id', getBlogById);
router.post('/', authMiddleware, requireRole('Marketing'), createBlog);
router.put('/:id', authMiddleware, requireRole('Marketing'), updateBlog);
router.delete('/:id', authMiddleware, requireRole('Marketing'), deleteBlog);

module.exports = router;

