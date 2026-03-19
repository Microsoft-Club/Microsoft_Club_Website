const express = require('express');
const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getEvents);
router.post('/', authMiddleware, createEvent);
router.put('/:id', authMiddleware, updateEvent);
router.delete('/:id', authMiddleware, deleteEvent);

module.exports = router;

