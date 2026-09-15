const express = require('express');
const multer = require('multer');
const {
  getMembers,
  uploadMemberImage,
  createMember,
  updateMember,
  deleteMember,
} = require('../controllers/memberController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WEBP, GIF) are allowed.'));
    }
  },
});

// Handle multer errors gracefully
const handleUpload = (field) => (req, res, next) => {
  upload.single(field)(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size exceeds 10MB limit.' });
      }
      return res.status(400).json({ message: err.message || 'File upload error.' });
    }
    next();
  });
};

router.get('/', getMembers);
router.post('/upload-image', authMiddleware, handleUpload('image'), uploadMemberImage);
router.post('/', authMiddleware, handleUpload('image'), createMember);
router.put('/:id', authMiddleware, handleUpload('image'), updateMember);
router.delete('/:id', authMiddleware, deleteMember);

module.exports = router;
