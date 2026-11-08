const express = require('express');
const {
  createEntry,
  getEntries,
  deleteEntry,
} = require('../controllers/waitingListController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route: freshers join waiting list
router.post('/', createEntry);

// Admin-only routes: view and manage waiting list
router.get('/', authMiddleware, requireRole('Inductions'), getEntries);
router.delete('/:id', authMiddleware, requireRole('Inductions'), deleteEntry);

module.exports = router;
