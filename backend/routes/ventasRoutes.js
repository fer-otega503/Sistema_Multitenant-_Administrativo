const express = require('express');
const router = express.Router();
const { getVentaDetalle } = require('../controllers/ventasController');

// 🛒 GET /api/ventas/detalle?sell_id=X&no_caja=Y
router.get('/detalle', getVentaDetalle);

module.exports = router;
