const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); // 🔌 Importamos el paquete de rutas de seguridad que creamos por separado
const analyticsRoutes = require('./routes/analyticsRoutes'); // 🔌 Importamos el puente hacia el servicio Python
const tenantRoutes = require('./routes/tenantRoutes'); // 🔌 Importamos las rutas de inquilinos
const dashboardRoutes = require('./routes/dashboardRoutes'); // 🔌 Importamos las rutas del dashboard
const ventasRoutes = require('./routes/ventasRoutes'); // 🔌 Importamos las rutas de ventas
const inventarioRoutes = require('./routes/inventarioRoutes'); // 🔌 Importamos las rutas de inventario
const empleadosRoutes  = require('./routes/empleadosRoutes');  // 🔌 Importamos las rutas de empleados

const app = express();

// ------------------------------------------
// ⚙️ CONFIGURACIONES BÁSICAS (Middlewares)
// ------------------------------------------
app.use(cors()); // Permite que React se conecte al backend sin bloqueos
app.use(express.json()); // Hace que nuestro servidor entienda datos en formato JSON

// ------------------------------------------
// 🔌 CONEXIÓN DE LAS RUTAS MODULARES
// ------------------------------------------
// Esto le dice a Express que todo lo que esté en 'authRoutes' empezará con '/api/auth'
// Ejemplos: /api/auth/login  y  /api/auth/usuarios
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes); // Montamos las rutas analíticas
app.use('/api/tenants', tenantRoutes); // Montamos las rutas de registro de negocios
app.use('/api/dashboard', dashboardRoutes); // Montamos las rutas del dashboard de métricas
app.use('/api/ventas', ventasRoutes); // Montamos las rutas de consulta de ventas
app.use('/api/inventario', inventarioRoutes); // Montamos las rutas del inventario de productos
app.use('/api/empleados',  empleadosRoutes);  // Montamos las rutas de gestión de empleados

// ------------------------------------------
// 🔍 ENDPOINTS DE PRUEBA (Los de control inicial)
// ------------------------------------------
app.get('/api/status', (req, res) => {
  res.json({ mensaje: 'Servidor Express multitenant funcionando correctamente' });
});

// Nota: Quitamos la ruta de /api/productos de aquí porque ya se maneja de forma segura 
// y aislada dentro del sistema modular en sus respectivos controladores.

// ------------------------------------------
// 🌱 RUTA TEMPORAL DE SEEDING
// ------------------------------------------
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

app.get('/api/ejecutar-seed', async (req, res) => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  let client;
  try {
    client = await pool.connect();
    const SCHEMA_NAME = 'ferreteria';

    // 1. Crear esquema y tablas principales
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA_NAME}";`);
    await client.query(`SET search_path TO "${SCHEMA_NAME}";`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "${SCHEMA_NAME}".users (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(50) NOT NULL
      );
    `);

    // 2. Insertar al usuario Administrador
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admins123456789', salt);

    await client.query(`
      INSERT INTO "${SCHEMA_NAME}".users (nombre, email, password, rol)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE
        SET nombre = EXCLUDED.nombre,
            password = EXCLUDED.password,
            rol = EXCLUDED.rol;
    `, ['Admin Ferretería', 'admin1234@gmail.com', hashedPassword, 'Gestor']);

    res.json({
      exito: true,
      mensaje: '✅ Base de datos sembrada correctamente con el usuario administrador.',
      credenciales: {
        email: 'admin1234@gmail.com',
        password: 'admins123456789',
        rol: 'Gestor',
        tenant: 'ferreteria'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ exito: false, error: error.message });
  } finally {
    if (client) client.release();
    await pool.end();
  }
});

// ------------------------------------------
// 🚀 ENCENDIDO DEL MOTOR
// ------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🧠 Cerebro del Servidor ejecutándose limpiamente en el puerto ${PORT}`);
});
