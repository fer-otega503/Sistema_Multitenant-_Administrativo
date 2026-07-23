const express = require('express');
const router = express.Router();

/**
 * Endpoint de proxy para el servicio de analítica en Python (FastAPI).
 * El frontend consultará esta ruta, y el backend en Node se encargará de
 * realizar la petición a Python.
 */
router.get('/status', async (req, res) => {
  try {
    // URL del backend en Python (por defecto FastAPI corre en el 8000)
    const pythonApiUrl = 'http://127.0.0.1:8000/api/analytics/status';
    
    // Usamos el fetch nativo de Node.js (Node 18+)
    const response = await fetch(pythonApiUrl);
    
    if (!response.ok) {
      throw new Error(`Error del servidor Python: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Retornamos la data proveniente del backend en Python al Frontend
    res.json(data);
  } catch (error) {
    console.error('Error al contactar con el Analytics Service (Python):', error.message);
    res.status(503).json({
      error: 'Servicio analítico no disponible en este momento.',
      details: error.message
    });
  }
});

module.exports = router;
