const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

// 1. Configura los middlewares básicos
app.use(cors());
app.use(express.json());

// 3. Endpoint de prueba GET /api/status
app.get('/api/status', (req, res) => {
  res.json({ mensaje: 'Servidor Express multitenant funcionando correctamente' });
});

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
