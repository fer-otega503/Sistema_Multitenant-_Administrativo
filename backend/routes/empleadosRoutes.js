const express = require('express');
const router = express.Router();
const {
  getEmpleados,
  crearEmpleado,
  editarEmpleado,
  eliminarEmpleado,
} = require('../controllers/empleadosController');

// 👤 GET    /api/empleados          → Listar todos (filtrar con ?nombre=)
router.get('/', getEmpleados);

// 👤 POST   /api/empleados          → Crear empleado
router.post('/', crearEmpleado);

// 👤 PUT    /api/empleados/:id      → Editar empleado
router.put('/:id', editarEmpleado);

// 👤 DELETE /api/empleados/:id      → Eliminar empleado
router.delete('/:id', eliminarEmpleado);

module.exports = router;
