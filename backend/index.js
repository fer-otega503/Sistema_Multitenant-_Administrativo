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
app.get('/api/ejecutar-seed', async (req, res) => {
  const { Pool } = require('pg');
  const bcrypt = require('bcryptjs');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  let client;
  try {
    client = await pool.connect();
    const SCHEMA = 'ferreteria';

    console.log(`🏗️ Creando esquema ${SCHEMA}...`);
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}";`);
    await client.query(`SET search_path TO "${SCHEMA}";`);

    // ─────────────────────────────────────────────
    // 1. TABLA: users (id PK, email UK)
    // ─────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS "${SCHEMA}".users (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(50) NOT NULL
      );
    `);

    // ─────────────────────────────────────────────
    // 2. TABLA: products (id PK, codigo UK)
    // ─────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS "${SCHEMA}".products (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(50) UNIQUE,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        costo DECIMAL(10, 2) NOT NULL,
        precio_venta DECIMAL(10, 2) NOT NULL,
        unidad VARCHAR(20) NOT NULL,
        stock DECIMAL(10, 2) DEFAULT 0
      );
    `);

    // ─────────────────────────────────────────────
    // 3. TABLA: sells (id PK)
    // ─────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS "${SCHEMA}".sells (
        id SERIAL PRIMARY KEY,
        no_caja VARCHAR(20) NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ─────────────────────────────────────────────
    // 4. TABLA: sell_details (id PK, sell_id FK Cascade, product_id FK)
    // ─────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS "${SCHEMA}".sell_details (
        id SERIAL PRIMARY KEY,
        sell_id INT NOT NULL,
        product_id INT NOT NULL,
        cantidad DECIMAL(10, 2) NOT NULL,
        precio_unitario DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (sell_id) REFERENCES "${SCHEMA}".sells(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES "${SCHEMA}".products(id)
      );
    `);

    // ─────────────────────────────────────────────
    // 5. INSERTAR USUARIO ADMIN
    // ─────────────────────────────────────────────
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admins123456789', salt);
    await client.query(`
      INSERT INTO "${SCHEMA}".users (nombre, email, password, rol)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE
        SET nombre = EXCLUDED.nombre,
            password = EXCLUDED.password,
            rol = EXCLUDED.rol;
    `, ['Admin Ferretería', 'admin1234@gmail.com', hashedPassword, 'Gestor']);

    // ─────────────────────────────────────────────
    // 6. INSERTAR PRODUCTOS
    // ─────────────────────────────────────────────
    await client.query(`
      INSERT INTO "${SCHEMA}".products
        (codigo, nombre, descripcion, costo, precio_venta, unidad, stock)
      VALUES
        ('2026001', 'Martillo de uña', 'Martillo Truper de 16 oz con mango de madera', 85.00, 150.00, 'PZ', 25.00),
        ('2026002', 'Clavo estándar 2"', 'Clavos para madera, venta por kilo', 30.00, 55.00, 'KG', 50.00),
        ('2026003', 'Cemento Cruz Azul', 'Bulto de cemento gris 50kg', 180.00, 220.00, 'PZ', 100.00),
        ('2026004', 'Cable de cobre cal. 12', 'Rollo de cable THW 100m color rojo', 600.00, 950.00, 'PZ', 10.00),
        ('2026005', 'Tornillo pija 1"', 'Tornillo pija cabeza plana', 0.50, 1.50, 'PZ', 500.00),
        ('2026006', 'Lija de agua #220', 'Hoja de lija de agua grano 220', 5.00, 12.00, 'PZ', 200.00),
        ('2026007', 'Pintura vinílica blanca', 'Cubeta 20L pintura vinílica interior/exterior', 320.00, 480.00, 'PZ', 15.00),
        ('FER-008', 'Flexómetro 5m', 'Cinta métrica de 5 metros con cuerpo antidesliz', 45.00, 85.00, 'PZ', 30.00)
      ON CONFLICT (codigo) DO NOTHING;
    `);

    // ─────────────────────────────────────────────
    // 7. INSERTAR VENTAS Y DETALLES (Para gráficas en el Dashboard)
    // ─────────────────────────────────────────────
    await client.query(`
      INSERT INTO "${SCHEMA}".sells (id, no_caja, total)
      VALUES
        (1, 'CAJA-01',  370.00),
        (2, 'CAJA-02', 1170.00),
        (3, 'CAJA-01',  492.00),
        (4, 'CAJA-02',  220.00)
      ON CONFLICT DO NOTHING;
    `);

    await client.query(`
      INSERT INTO "${SCHEMA}".sell_details
        (sell_id, product_id, cantidad, precio_unitario)
      VALUES
        (1, 1, 1.00, 150.00),
        (1, 2, 4.00,  55.00),
        (2, 3, 1.00, 220.00),
        (2, 4, 1.00, 950.00),
        (3, 5, 8.00,   1.50),
        (3, 8, 4.00,  85.00),
        (4, 3, 1.00, 220.00)
      ON CONFLICT DO NOTHING;
    `);

    // Sincronizar secuencias para que al agregar productos o ventas nuevas no marque error de PK duplicada
    await client.query(`SELECT setval(pg_get_serial_sequence('"${SCHEMA}".products', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "${SCHEMA}".products;`);
    await client.query(`SELECT setval(pg_get_serial_sequence('"${SCHEMA}".sells', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "${SCHEMA}".sells;`);

    res.json({
      exito: true,
      mensaje: '✅ Base de datos recreada exactamente según el diagrama ER.',
      tablas_creadas: ['users', 'products', 'sells', 'sell_details'],
      credenciales: {
        email: 'admin1234@gmail.com',
        password: 'admins123456789',
        rol: 'Gestor'
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
