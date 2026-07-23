const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Registro de Usuarios (Admin o Empleado)
 * Guarda la contraseña de forma segura usando bcryptjs en el esquema del tenant.
 */
const registrarUsuario = async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios: nombre, email, password, rol'
    });
  }

  const rolesPermitidos = ['Admin', 'Empleado'];
  if (!rolesPermitidos.includes(rol)) {
    return res.status(400).json({
      error: `Rol inválido. Debe ser uno de los siguientes: ${rolesPermitidos.join(', ')}`
    });
  }

  try {
    // 🔐 Hashear la contraseña con bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Consulta aislada al esquema definido previamente en req.db por tenantMiddleware
    const query = `
      INSERT INTO users (nombre, email, password, rol)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre, email, rol;
    `;

    const result = await req.db.query(query, [
      nombre,
      email.toLowerCase().trim(),
      hashedPassword,
      rol
    ]);

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      tenant_id: req.tenant_id,
      usuario: result.rows[0]
    });
  } catch (error) {
    console.error('Error en registrarUsuario:', error);

    // Código 23505 = Restricción Unique violada (Email duplicado)
    if (error.code === '23505') {
      return res.status(400).json({
        error: 'El correo electrónico ya se encuentra registrado en esta empresa.'
      });
    }

    res.status(500).json({
      error: 'Error interno del servidor al registrar el usuario.'
    });
  }
};

/**
 * Login de Usuarios
 * Valida credenciales contra el esquema tenant y emite un token JWT que incluye rol y tenant_id.
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Faltan datos requeridos: email, password'
    });
  }

  try {
    // Buscar el usuario dentro del esquema del inquilino (establecido en req.db)
    const query = `SELECT id, nombre, email, password, rol FROM users WHERE email = $1`;
    const result = await req.db.query(query, [email.toLowerCase().trim()]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Credenciales inválidas (correo o contraseña incorrectos).'
      });
    }

    const usuario = result.rows[0];

    // 🔑 Verificar la contraseña encriptada con bcryptjs
    const passwordMatch = await bcrypt.compare(password, usuario.password);
    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Credenciales inválidas (correo o contraseña incorrectos).'
      });
    }

    // 🎫 Construir el payload del Token JWT con rol y tenant_id
    const payload = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,          // 'Admin' o 'Empleado'
      tenant_id: req.tenant_id   // Nombre del esquema (ej. 'schema_ferreteria')
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'clave_secreta_multitenant',
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      mensaje: '¡Inicio de sesión exitoso!',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        tenant_id: req.tenant_id
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error interno del servidor al procesar el inicio de sesión.'
    });
  }
};

module.exports = {
  registrarUsuario,
  login
};