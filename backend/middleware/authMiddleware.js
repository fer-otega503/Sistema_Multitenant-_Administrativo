const jwt = require('jsonwebtoken');

/**
 * Middleware de Seguridad (authMiddleware)
 * Valida el token JWT enviado en el encabezado Authorization (Bearer Token).
 * Extrae la información del usuario, incluyendo su rol y tenant_id.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extrae el token tras 'Bearer '

  if (!token) {
    return res.status(401).json({
      error: 'Acceso denegado. No se proporcionó un token de autenticación.'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'clave_secreta_multitenant'
    );

    // Adjuntar los datos decodificados (id, email, rol, tenant_id) al objeto req.usuario
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido o expirado. Inicie sesión nuevamente.'
    });
  }
};

/**
 * Middleware opcional para restringir acceso según el rol del usuario (ej. Admin, Empleado)
 */
const checkRole = (rolesPermitidos = []) => {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        error: `Acceso denegado. Permisos insuficientes. Se requiere rol: ${rolesPermitidos.join(' o ')}`
      });
    }
    next();
  };
};

module.exports = { authMiddleware, checkRole };
