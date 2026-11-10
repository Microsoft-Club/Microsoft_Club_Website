const jwt = require('jsonwebtoken');

// Verifies the JWT and puts { id, email, role } on req.admin
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Allows only the listed roles. "General" (overall admin) can always pass.
// Usage: router.post('/', authMiddleware, requireRole('Logikal'), handler)
const requireRole = (...allowedRoles) => (req, res, next) => {
  const role = req.admin && req.admin.role;

  if (role === 'General' || allowedRoles.includes(role)) {
    return next();
  }

  return res
    .status(403)
    .json({ message: 'You do not have permission to perform this action' });
};

module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.requireRole = requireRole;
