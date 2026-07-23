const express = require('express');
const cors = require('cors');
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
app.get('/api/status', (req, res) => {
  res.json({ mensaje: 'Servidor Express multitenant funcionando correctamente' });
});

// Nota: Quitamos la ruta de /api/productos de aquí porque ya se maneja de forma segura 
// y aislada dentro del sistema modular en sus respectivos controladores.

// ------------------------------------------
// 🚀 ENCENDIDO DEL MOTOR
// ------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🧠 Cerebro del Servidor ejecutándose limpiamente en el puerto ${PORT}`);
});
