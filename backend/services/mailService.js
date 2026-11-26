const nodemailer = require('nodemailer');

const DEFAULT_SMTP_PORT = 587;

let transporter;

const readConfig = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CONTACT_TO_EMAIL) return null;
  const port = Number(SMTP_PORT) || DEFAULT_SMTP_PORT;
  return {
    host: SMTP_HOST,
    port,
    secure: SMTP_SECURE ? SMTP_SECURE === 'true' : port === 465,
    user: SMTP_USER,
    pass: SMTP_PASS,
    to: CONTACT_TO_EMAIL,
    from: CONTACT_FROM_EMAIL || SMTP_USER,
  };
};

const isMailConfigured = () => readConfig() !== null;

const sendContactMail = async ({ name, email, subject, message }) => {
  const config = readConfig();
  if (!config) throw new Error('Mail service is not configured');

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
    });
  }

  await transporter.sendMail({
    from: `"Microsoft Club GIKI website" <${config.from}>`,
    to: config.to,
    replyTo: { name, address: email },
    subject: `[Website] ${subject}`,
    text: `From: ${name} <${email}>\n\n${message}\n\n— Sent from the contact form on mlsaclubgiki.tech`,
  });
};

module.exports = { isMailConfigured, sendContactMail };
