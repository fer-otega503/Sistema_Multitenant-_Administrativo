const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// 📊 GET /api/dashboard/metrics - Retorna las métricas de Ventas e Inventario para el Dashboard
router.get('/metrics', dashboardController.getDashboardMetrics);

module.exports = router;
