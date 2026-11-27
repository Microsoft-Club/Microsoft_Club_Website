const prisma = require('../prisma/client');

const getHomeFeed = async (_req, res) => {
  try {
    const [latestEvent, latestBlog, latestProject, latestPodcast] =
      await Promise.all([
        prisma.event.findFirst({
          orderBy: { date: 'desc' },
        }),
        prisma.blog.findFirst({
          orderBy: { createdAt: 'desc' },
        }),
        prisma.project.findFirst({
          orderBy: { createdAt: 'desc' },
        }),
        prisma.podcast.findFirst({
          orderBy: { date: 'desc' },
        }),
      ]);

    res.json({
      event: latestEvent,
      blog: latestBlog,
      project: latestProject,
      podcast: latestPodcast,
    });
  } catch (error) {
    console.error('Get home feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getHomeFeed,
};
