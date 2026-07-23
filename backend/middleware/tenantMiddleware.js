const pool = require('../db');

/**
 * Middleware de Aislamiento de Esquema (tenantMiddleware)
 * Extrae el tenant_id (nombre del esquema de PostgreSQL, ej. 'schema_ferreteria')
 * desde el token JWT (req.usuario.tenant_id), body o header X-Tenant-ID.
 * 
 * Executa "SET search_path TO <tenant_id>" en un cliente de la pool dedicado
 * para aislar todas las consultas de la petición a ese esquema específico.
 */
const tenantMiddleware = async (req, res, next) => {
  try {
    // Obtener tenant_id del token (si ya está autenticado), del body o encabezado
    const tenantId = req.usuario?.tenant_id || req.body?.tenant_id || req.headers['x-tenant-id'];

    if (!tenantId) {
      return res.status(400).json({
        error: 'Identificador de inquilino (tenant_id) no proporcionado.'
      });
    }

    // 🛡️ Sanitización y validación estricta para evitar SQL Injection en nombres de esquemas
    const isValidSchema = /^[a-zA-Z0-9_]+$/.test(tenantId);
    if (!isValidSchema) {
      return res.status(400).json({
        error: 'El nombre del esquema (tenant_id) es inválido o contiene caracteres no permitidos.'
      });
    }

    // Adquirir un cliente dedicado de la pool de PostgreSQL para esta petición
    const client = await pool.connect();

    // Configurar dinámicamente el search_path hacia el esquema del inquilino
    await client.query(`SET search_path TO "${tenantId}", public;`);

    // Adjuntar el cliente de BD configurado y el tenant_id al objeto req
    req.db = client;
    req.tenant_id = tenantId;

    // 🔄 Garantizar la liberación del cliente al finalizar la respuesta HTTP
    res.on('finish', () => {
      if (req.db) {
        req.db.release();
      }
    });

    next();
  } catch (error) {
    console.error('Error en tenantMiddleware:', error);
    if (req.db) {
      req.db.release();
    }
    res.status(500).json({
      error: 'Error interno al aislar el esquema del inquilino en PostgreSQL.'
    });
  }
};

module.exports = tenantMiddleware;
