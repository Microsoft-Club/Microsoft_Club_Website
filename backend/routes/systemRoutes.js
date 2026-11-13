const express = require('express');
const { getHomeFeed } = require('../controllers/systemController');

const router = express.Router();

router.get('/', getHomeFeed);

module.exports = router;
