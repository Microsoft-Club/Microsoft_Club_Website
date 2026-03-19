const prisma = require('../prisma/client');

const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'desc' },
    });
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      type,
      images,
      speakers,
      registrationLink,
    } = req.body || {};

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        type,
        images: Array.isArray(images) ? images : [],
        speakers: Array.isArray(speakers) ? speakers : [],
        registrationLink: registrationLink || null,
      },
    });
    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const {
      title,
      description,
      date,
      type,
      images,
      speakers,
      registrationLink,
    } = req.body || {};

    const event = await prisma.event.update({
      where: { id: Number(id) },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(date !== undefined ? { date: new Date(date) } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(images !== undefined
          ? { images: Array.isArray(images) ? images : [] }
          : {}),
        ...(speakers !== undefined
          ? { speakers: Array.isArray(speakers) ? speakers : [] }
          : {}),
        ...(registrationLink !== undefined
          ? { registrationLink: registrationLink || null }
          : {}),
      },
    });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.event.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Event deleted' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};

