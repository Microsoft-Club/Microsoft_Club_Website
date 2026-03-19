const express = require('express');
const {
  getPodcasts,
  createPodcast,
  updatePodcast,
  deletePodcast,
} = require('../controllers/podcastController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getPodcasts);
router.post('/', authMiddleware, createPodcast);
router.put('/:id', authMiddleware, updatePodcast);
router.delete('/:id', authMiddleware, deletePodcast);

module.exports = router;

