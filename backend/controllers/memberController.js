const prisma = require('../prisma/client');

const toOptionalInt = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
};

const getMembers = async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
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
      displayOrder,
    } = req.body || {};

    const member = await prisma.member.create({
      data: {
        name,
        role,
        tenure,
        image: image || null,
        linkedin: linkedin || null,
        displayOrder: toOptionalInt(displayOrder),
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
      displayOrder,
    } = req.body || {};

    const member = await prisma.member.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(role !== undefined ? { role } : {}),
        ...(tenure !== undefined ? { tenure } : {}),
        ...(image !== undefined ? { image: image || null } : {}),
        ...(linkedin !== undefined ? { linkedin: linkedin || null } : {}),
        ...(displayOrder !== undefined
          ? { displayOrder: toOptionalInt(displayOrder) }
          : {}),
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

