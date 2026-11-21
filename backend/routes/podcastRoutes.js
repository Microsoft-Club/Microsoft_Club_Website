const express = require('express');
const {
  getPodcasts,
  getPodcastById,
  createPodcast,
  updatePodcast,
  deletePodcast,
} = require('../controllers/podcastController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getPodcasts);
router.get('/:id', getPodcastById);
router.post('/', authMiddleware, requireRole('Logikal'), createPodcast);
router.put('/:id', authMiddleware, requireRole('Logikal'), updatePodcast);
router.delete('/:id', authMiddleware, requireRole('Logikal'), deletePodcast);

module.exports = router;