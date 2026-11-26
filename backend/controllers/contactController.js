const { isMailConfigured, sendContactMail } = require('../services/mailService');

const LIMITS = { name: 120, email: 254, subject: 150, message: 3000 };
const MIN_MESSAGE_LENGTH = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const asText = (value) => (typeof value === 'string' ? value.trim() : '');
const oneLine = (value) => value.replace(/[\r\n]+/g, ' ');

const validate = ({ name, email, subject, message }) => {
  if (!name) return 'Please enter your name.';
  if (name.length > LIMITS.name) return 'Name is too long.';
  if (!email || email.length > LIMITS.email || !EMAIL_REGEX.test(email)) return 'Please enter a valid email address.';
  if (subject.length > LIMITS.subject) return 'Subject is too long.';
  if (message.length < MIN_MESSAGE_LENGTH) return 'Message is too short — say a little more.';
  if (message.length > LIMITS.message) return `Message is too long (max ${LIMITS.message} characters).`;
  return null;
};

const sendMessage = async (req, res) => {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};

  // Honeypot: real visitors never fill this hidden field.
  if (asText(body.website)) {
    return res.status(200).json({ message: 'Message sent.' });
  }

  const input = {
    name: oneLine(asText(body.name)),
    email: asText(body.email).toLowerCase(),
    subject: oneLine(asText(body.subject)) || 'New message',
    message: asText(body.message),
  };

  const problem = validate(input);
  if (problem) return res.status(400).json({ message: problem });

  if (!isMailConfigured()) {
    console.error('Contact form used but SMTP_* / CONTACT_TO_EMAIL env vars are missing');
    return res.status(503).json({ message: 'Messaging is not set up yet. Please reach us on Instagram or WhatsApp.' });
  }

  try {
    await sendContactMail(input);
    return res.status(200).json({ message: 'Message sent.' });
  } catch (error) {
    console.error('Contact mail failed:', error);
    return res.status(502).json({ message: 'Couldn’t send your message right now. Please try again in a few minutes.' });
  }
};

module.exports = { sendMessage };
