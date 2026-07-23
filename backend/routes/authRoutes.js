const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');

// 🔓 Ruta pública: Inicio de sesión (recibe tenant_id en body o header)
router.post('/login', tenantMiddleware, authController.login);

// 🔒 Ruta protegida: Registro de nuevos usuarios (Requiere Token JWT activo, rol de 'Admin' y aislamiento de esquema)
router.post(
  '/registro',
  authMiddleware,
  checkRole(['Admin']),
  tenantMiddleware,
  authController.registrarUsuario
);

// 🔓 Ruta para autoregistro inicial (si aplica cuando se crea una empresa por primera vez)
router.post('/registro-inicial', tenantMiddleware, authController.registrarUsuario);

module.exports = router;