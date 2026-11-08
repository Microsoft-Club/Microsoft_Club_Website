const express = require('express');
const {
  getEvents,
  getFeaturedEvent,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getEvents);
router.get('/featured', getFeaturedEvent);
router.get('/:id', getEventById);
router.post('/', authMiddleware, requireRole('Marketing'), createEvent);
router.put('/:id', authMiddleware, requireRole('Marketing'), updateEvent);
router.delete('/:id', authMiddleware, requireRole('Marketing'), deleteEvent);

module.exports = router;
