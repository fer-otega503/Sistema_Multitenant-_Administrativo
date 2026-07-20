const express = require('express');
const cors = require('cors');
<<<<<<< HEAD
const pool = require('./db');

const app = express();

// 1. Configura los middlewares básicos
app.use(cors());
app.use(express.json());

// 3. Endpoint de prueba GET /api/status
=======
const authRoutes = require('./routes/authRoutes'); // 🔌 Importamos el paquete de rutas de seguridad que creamos por separado

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

// ------------------------------------------
// 🔍 ENDPOINTS DE PRUEBA (Los de control inicial)
// ------------------------------------------
>>>>>>> origin/master
app.get('/api/status', (req, res) => {
  res.json({ mensaje: 'Servidor Express multitenant funcionando correctamente' });
});

<<<<<<< HEAD
// 4. Endpoint de prueba GET /api/test-db
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al probar la base de datos:', error);
    res.status(500).json({ error: 'Error al conectar a la base de datos' });
  }
});

// 5. Levanta el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
=======
// Nota: Quitamos la ruta de /api/productos de aquí porque ya se maneja de forma segura 
// y aislada dentro del sistema modular en sus respectivos controladores.

// ------------------------------------------
// 🚀 ENCENDIDO DEL MOTOR
// ------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🧠 Cerebro del Servidor ejecutándose limpiamente en el puerto ${PORT}`);
});
>>>>>>> origin/master
