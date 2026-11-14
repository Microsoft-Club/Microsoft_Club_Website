const express = require('express');
const multer = require('multer');
const {
  uploadBlogAuthorImage,
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

const handleUpload = (field) => (req, res, next) => {
  upload.single(field)(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message:
          err.code === 'LIMIT_FILE_SIZE'
            ? 'File size exceeds 10MB limit.'
            : err.message || 'File upload error.',
      });
    }
    next();
  });
};

router.get('/', getBlogs);
router.post(
  '/:id/author-image',
  authMiddleware,
  handleUpload('image'),
  uploadBlogAuthorImage
);
router.get('/:id', getBlogById);
router.post('/', authMiddleware, handleUpload('image'), createBlog);
router.put('/:id', authMiddleware, updateBlog);
router.delete('/:id', authMiddleware, deleteBlog);

module.exports = router;

