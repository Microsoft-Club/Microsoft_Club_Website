const prisma = require('../prisma/client');

const ALLOWED_BATCHES = new Set(['Batch 35', 'Batch 36']);
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 32;
const MAX_FACULTY_LENGTH = 120;

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

/**
 * Public: Freshers submit their info to the waiting list
 */
const createEntry = async (req, res) => {
  try {
    const body =
      req.body && typeof req.body === 'object' && !Array.isArray(req.body)
        ? req.body
        : {};
    const { name, email, phone, batch, faculty } = body;

    if (!isNonEmptyString(name)) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (!isNonEmptyString(email)) {
      return res.status(400).json({ message: 'GIKI email is required' });
    }

    if (!isNonEmptyString(phone)) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    if (!isNonEmptyString(batch) || !ALLOWED_BATCHES.has(batch.trim())) {
      return res.status(400).json({
        message: 'Batch must be Batch 35 or Batch 36',
      });
    }

    if (!isNonEmptyString(faculty)) {
      return res.status(400).json({ message: 'Faculty is required' });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanBatch = batch.trim();
    const cleanFaculty = faculty.trim();
    const gikiEmailRegex = /^u\d{7}@giki\.edu\.pk$/;

    if (cleanName.length > MAX_NAME_LENGTH) {
      return res.status(400).json({ message: 'Name is too long' });
    }

    if (cleanEmail.length > MAX_EMAIL_LENGTH) {
      return res.status(400).json({ message: 'Email address is too long' });
    }

    if (!gikiEmailRegex.test(cleanEmail)) {
      const localPart = cleanEmail.endsWith('@giki.edu.pk')
        ? cleanEmail.slice(0, -'@giki.edu.pk'.length)
        : '';
      const registrationNumber = localPart.startsWith('u') ? localPart.slice(1) : '';
      if (
        localPart.startsWith('u') &&
        (!/^\d+$/.test(registrationNumber) || registrationNumber.length !== 7)
      ) {
        return res.status(400).json({
          message:
            'Registration number must look like 2026123, for example u2026123@giki.edu.pk.',
        });
      }

      return res.status(400).json({
        message:
          'Enter a valid GIKI email as u + registration number, for example u2026123@giki.edu.pk.',
      });
    }

    const phoneDigits = cleanPhone.replace(/\D/g, '');
    if (cleanPhone.length > MAX_PHONE_LENGTH || phoneDigits.length > MAX_PHONE_LENGTH) {
      return res.status(400).json({ message: 'Phone number is too long' });
    }

    const isLocalMobile = /^03\d{9}$/.test(phoneDigits);
    const isIntlMobile = /^923\d{9}$/.test(phoneDigits);
    if (!isLocalMobile && !isIntlMobile) {
      return res.status(400).json({
        message:
          'Enter a valid 11-digit Pakistani phone number using digits only, for example 03189665400.',
      });
    }

    if (cleanFaculty.length > MAX_FACULTY_LENGTH) {
      return res.status(400).json({ message: 'Faculty is too long' });
    }

    // Check for duplicate registration
    const existing = await prisma.waitingListEntry.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return res.status(409).json({
        message: 'This email is already registered on the waiting list.',
      });
    }

    const entry = await prisma.waitingListEntry.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        phone: phoneDigits,
        batch: cleanBatch,
        faculty: cleanFaculty,
      },
    });

    res.status(201).json({
      message: 'Successfully joined the waiting list!',
      entry,
    });
  } catch (error) {
    console.error('Create waiting list entry error:', error);
    if (error?.code === 'P2002') {
      return res.status(409).json({
        message: 'This email is already registered on the waiting list.',
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Admin: Get all waiting list entries
 */
const getEntries = async (req, res) => {
  try {
    const { batch, search } = req.query;

    const where = {};
    if (typeof batch === 'string' && batch !== 'all') {
      where.batch = batch;
    }

    if (typeof search === 'string' && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { faculty: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ];
    }

    const entries = await prisma.waitingListEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(entries);
  } catch (error) {
    console.error('Get waiting list entries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Admin: Delete a waiting list entry
 */
const deleteEntry = async (req, res) => {
  const numericId = parseInt(req.params.id, 10);
  if (isNaN(numericId)) {
    return res.status(400).json({ message: 'Invalid entry ID' });
  }

  try {
    await prisma.waitingListEntry.delete({
      where: { id: numericId },
    });
    res.json({ message: 'Waiting list entry deleted' });
  } catch (error) {
    console.error('Delete waiting list entry error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Entry not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createEntry,
  getEntries,
  deleteEntry,
};
