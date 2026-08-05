const express = require('express');
const router = express.Router();
const {
  getProductos,
  crearProducto,
  editarProducto,
  eliminarProductos,
} = require('../controllers/inventarioController');

// 📦 GET    /api/inventario/productos         → Listar todos (filtrar con ?codigo=)
router.get('/productos', getProductos);

// 📦 POST   /api/inventario/productos         → Crear producto
router.post('/productos', crearProducto);

// 📦 PUT    /api/inventario/productos/:id     → Editar producto por ID
router.put('/productos/:id', editarProducto);

// 📦 DELETE /api/inventario/productos         → Eliminar por IDs (body: { ids: [] })
router.delete('/productos', eliminarProductos);

module.exports = router;
