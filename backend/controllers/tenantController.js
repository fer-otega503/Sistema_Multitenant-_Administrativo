const { createTenantSchema } = require('../init-db');

/**
 * Registra un nuevo inquilino (tenant) y su administrador principal.
 * Crea dinámicamente la base de datos/esquema y sus tablas base en PostgreSQL.
 */
const registerTenant = async (req, res) => {
  const { nombre_negocio, nombre, email, password } = req.body;

  // Validación de campos obligatorios
  if (!nombre_negocio || !nombre || !email || !password) {
    return res.status(400).json({
      error: 'Todos los campos son obligatorios: nombre_negocio, nombre, email, password.'
    });
  }

  // Sanitización básica en longitud y caracteres válidos para el esquema
  const isValidSchemaName = /^[a-zA-Z0-9_]+$/.test(nombre_negocio);
  if (!isValidSchemaName) {
    return res.status(400).json({
      error: 'El nombre del negocio sólo debe contener letras, números o guiones bajos.'
    });
  }

  try {
    // Inicializar el esquema y sembrar al administrador principal
    await createTenantSchema(nombre_negocio.toLowerCase().trim(), {
      nombre,
      email,
      password
    });

    res.status(201).json({
      mensaje: '¡Negocio registrado e inicializado exitosamente!',
      negocio: nombre_negocio.toLowerCase().trim(),
      administrador: {
        nombre,
        email,
        rol: 'Administrador'
      }
    });
  } catch (error) {
    console.error('Error al registrar el negocio:', error);
    
    // Controlar errores comunes de duplicados
    if (error.code === '23505') {
      return res.status(400).json({
        error: 'El usuario ya se encuentra registrado para este negocio.'
      });
    }

    res.status(500).json({
      error: 'Error interno al registrar el negocio y crear la estructura de base de datos.',
      details: error.message
    });
  }
};

module.exports = {
  registerTenant
};
