const prisma = require('../prisma/client');

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const ensureUniqueSlug = async (baseSlug, excludeId = null) => {
  if (!baseSlug) return null;

  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await prisma.event.findFirst({
      where: {
        slug: candidate,
        ...(excludeId != null ? { NOT: { id: Number(excludeId) } } : {}),
      },
      select: { id: true },
    });

    if (!existing) return candidate;
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
};

const resolveSlug = async ({ slug, title, excludeId = null }) => {
  const raw = slug !== undefined ? slug : title;
  const base = slugify(raw);
  if (!base) return null;
  return ensureUniqueSlug(base, excludeId);
};

const clearOtherFeatured = async (keepId, tx = prisma) => {
  await tx.event.updateMany({
    where: {
      featured: true,
      ...(keepId != null ? { NOT: { id: Number(keepId) } } : {}),
    },
    data: { featured: false },
  });
};

const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: [{ featured: 'desc' }, { date: 'desc' }],
    });
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFeaturedEvent = async (_req, res) => {
  try {
    const event = await prisma.event.findFirst({
      where: { featured: true },
      orderBy: { date: 'desc' },
    });

    if (!event) {
      return res.status(404).json({ message: 'No featured event' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get featured event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getEventById = async (req, res) => {
  const { id } = req.params;

  try {
    const numericId = Number(id);
    const event = Number.isInteger(numericId) && String(numericId) === id
      ? await prisma.event.findUnique({ where: { id: numericId } })
      : await prisma.event.findUnique({ where: { slug: id } });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event by id error:', error);
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
      featured,
      slug,
      location,
    } = req.body || {};

    const resolvedSlug = await resolveSlug({ slug, title });
    const isFeatured = Boolean(featured);

    const event = await prisma.$transaction(async (tx) => {
      if (isFeatured) {
        await clearOtherFeatured(null, tx);
      }

      return tx.event.create({
        data: {
          title,
          description,
          date: new Date(date),
          type,
          images: Array.isArray(images) ? images : [],
          speakers: Array.isArray(speakers) ? speakers : [],
          registrationLink: registrationLink || null,
          featured: isFeatured,
          slug: resolvedSlug,
          location: location || null,
        },
      });
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
      featured,
      slug,
      location,
    } = req.body || {};

    const existing = await prisma.event.findUnique({
      where: { id: Number(id) },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const data = {
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
      ...(location !== undefined ? { location: location || null } : {}),
    };

    if (featured !== undefined) {
      data.featured = Boolean(featured);
    }

    if (slug !== undefined || title !== undefined) {
      data.slug = await resolveSlug({
        slug: slug !== undefined ? slug : existing.slug || existing.title,
        title: title !== undefined ? title : existing.title,
        excludeId: id,
      });
    }

    const event = await prisma.$transaction(async (tx) => {
      if (data.featured === true) {
        await clearOtherFeatured(id, tx);
      }

      return tx.event.update({
        where: { id: Number(id) },
        data,
      });
    });

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
  getFeaturedEvent,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
