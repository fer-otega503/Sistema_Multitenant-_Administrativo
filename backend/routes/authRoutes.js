const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Traemos la lógica
const { verificarToken, esAdmin } = require('../middleware/auth'); // Traemos los guardianes

// Ruta pública: Cualquiera puede intentar loguearse
router.post('/login', authController.login);

// Ruta protegida: Solo si estás logueado y además eres Admin puedes registrar usuarios
router.post('/usuarios', verificarToken, esAdmin, authController.registrarUsuario);

module.exports = router;