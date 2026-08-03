const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');

// 🔌 POST /api/tenants/register - Registra una nueva empresa/inquilino
router.post('/register', tenantController.registerTenant);

module.exports = router;
