const express = require('express');
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getProjects);
router.post('/', authMiddleware, requireRole(), createProject);
router.put('/:id', authMiddleware, requireRole(), updateProject);
router.delete('/:id', authMiddleware, requireRole(), deleteProject);

module.exports = router;

