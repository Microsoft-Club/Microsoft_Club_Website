const express = require('express');
const rateLimit = require('../middleware/rateLimit');
const { sendMessage } = require('../controllers/contactController');

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const MAX_MESSAGES_PER_WINDOW = 5;

const router = express.Router();

router.post(
  '/',
  rateLimit({
    windowMs: FIFTEEN_MINUTES_MS,
    max: MAX_MESSAGES_PER_WINDOW,
    message: 'Too many messages. Please wait a few minutes and try again.',
  }),
  sendMessage
);

module.exports = router;
