const prisma = require('../prisma/client');

const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      techStack,
      githubLink,
      demoLink,
      contributors,
      images,
    } = req.body || {};

    const techStackArr = Array.isArray(techStack)
      ? techStack
      : typeof techStack === 'string'
      ? techStack.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const contributorsArr = Array.isArray(contributors)
      ? contributors
      : typeof contributors === 'string'
      ? contributors.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const imagesArr = Array.isArray(images)
      ? images
      : typeof images === 'string'
      ? images.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const project = await prisma.project.create({
      data: {
        title,
        description,
        techStack: techStackArr,
        githubLink: githubLink || null,
        demoLink: demoLink || null,
        contributors: contributorsArr,
        images: imagesArr,
      },
    });
    res.status(201).json(project);
  } catch (error) {
    console.log('Create project error:', error);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

const updateProject = async (req, res) => {
  const { id } = req.params;
  try {
    const {
      title,
      description,
      techStack,
      githubLink,
      demoLink,
      contributors,
      images,
    } = req.body || {};

    const techStackArr = Array.isArray(techStack)
      ? techStack
      : typeof techStack === 'string'
      ? techStack.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const contributorsArr = Array.isArray(contributors)
      ? contributors
      : typeof contributors === 'string'
      ? contributors.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const imagesArr = Array.isArray(images)
      ? images
      : typeof images === 'string'
      ? images.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const project = await prisma.project.update({
      where: { id: Number(id) },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(techStack !== undefined ? { techStack: techStackArr } : {}),
        ...(githubLink !== undefined ? { githubLink: githubLink || null } : {}),
        ...(demoLink !== undefined ? { demoLink: demoLink || null } : {}),
        ...(contributors !== undefined
          ? { contributors: contributorsArr }
          : {}),
        ...(images !== undefined ? { images: imagesArr } : {}),
      },
    });
    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

const deleteProject = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.project.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};

