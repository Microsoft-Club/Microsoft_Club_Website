const express = require('express');
const {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
} = require('../controllers/memberController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getMembers);
router.post('/', authMiddleware, createMember);
router.put('/:id', authMiddleware, updateMember);
router.delete('/:id', authMiddleware, deleteMember);

module.exports = router;

