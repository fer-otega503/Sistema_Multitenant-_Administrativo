const { authMiddleware, checkRole } = require('./authMiddleware');

module.exports = {
  verificarToken: authMiddleware,
  esAdmin: checkRole(['Admin']),
  authMiddleware,
  checkRole
};