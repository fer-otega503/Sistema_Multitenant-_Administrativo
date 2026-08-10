const express = require('express');
const router = express.Router();
const { getVentaDetalle, getCajas, crearVenta } = require('../controllers/ventasController');

// 🛒 GET /api/ventas/cajas
router.get('/cajas', getCajas);

// 🛒 GET /api/ventas/detalle?sell_id=X&no_caja=Y
router.get('/detalle', getVentaDetalle);
// 🛒 POST /api/ventas
router.post('/', crearVenta);

module.exports = router;
