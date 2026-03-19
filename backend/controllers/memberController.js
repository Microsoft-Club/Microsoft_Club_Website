const prisma = require('../prisma/client');

const getMembers = async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createMember = async (req, res) => {
  try {
    const {
      name,
      role,
      tenure,
      image,
      linkedin,
      isCurrent,
    } = req.body || {};

    const member = await prisma.member.create({
      data: {
        name,
        role,
        tenure,
        image: image || null,
        linkedin: linkedin || null,
        isCurrent:
          isCurrent === true ||
          isCurrent === 'true' ||
          isCurrent === 1 ||
          isCurrent === '1',
      },
    });
    res.status(201).json(member);
  } catch (error) {
    console.error('Create member error:', error);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

const updateMember = async (req, res) => {
  const { id } = req.params;
  try {
    const {
      name,
      role,
      tenure,
      image,
      linkedin,
      isCurrent,
    } = req.body || {};

    const member = await prisma.member.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(role !== undefined ? { role } : {}),
        ...(tenure !== undefined ? { tenure } : {}),
        ...(image !== undefined ? { image: image || null } : {}),
        ...(linkedin !== undefined ? { linkedin: linkedin || null } : {}),
        ...(isCurrent !== undefined
          ? {
              isCurrent:
                isCurrent === true ||
                isCurrent === 'true' ||
                isCurrent === 1 ||
                isCurrent === '1',
            }
          : {}),
      },
    });
    res.json(member);
  } catch (error) {
    console.error('Update member error:', error);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

const deleteMember = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.member.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Member deleted' });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
};

