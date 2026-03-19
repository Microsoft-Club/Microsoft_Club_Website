const prisma = require('../prisma/client');

const getPodcasts = async (req, res) => {
  try {
    const podcasts = await prisma.podcast.findMany({
      orderBy: { date: 'desc' },
    });
    res.json(podcasts);
  } catch (error) {
    console.error('Get podcasts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createPodcast = async (req, res) => {
  try {
    const { title, description, youtubeLink, guest, date } = req.body || {};
    const podcast = await prisma.podcast.create({
      data: {
        title,
        description,
        youtubeLink,
        guest,
        date: new Date(date),
      },
    });
    res.status(201).json(podcast);
  } catch (error) {
    console.error('Create podcast error:', error);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

const updatePodcast = async (req, res) => {
  const { id } = req.params;
  try {
    const { title, description, youtubeLink, guest, date } = req.body || {};
    const podcast = await prisma.podcast.update({
      where: { id: Number(id) },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(youtubeLink !== undefined ? { youtubeLink } : {}),
        ...(guest !== undefined ? { guest } : {}),
        ...(date !== undefined ? { date: new Date(date) } : {}),
      },
    });
    res.json(podcast);
  } catch (error) {
    console.error('Update podcast error:', error);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

const deletePodcast = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.podcast.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Podcast deleted' });
  } catch (error) {
    console.error('Delete podcast error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPodcasts,
  createPodcast,
  updatePodcast,
  deletePodcast,
};

