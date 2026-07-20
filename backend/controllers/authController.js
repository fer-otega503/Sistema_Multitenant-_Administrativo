const jwt = require('jsonwebtoken');
const pool = require('../db'); // Subimos una carpeta para importar la base de datos

// 🔐 Lógica para iniciar sesión
const login = async (req, res) => {
  const { email, password, tenant } = req.body;

  if (!email || !password || !tenant) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: email, password o tenant' });
  }

  try {
    // Buscamos dinámicamente en el esquema del inquilino (tenant)
    const userQuery = `SELECT * FROM ${tenant}.users WHERE email = $1`;
    const result = await pool.query(userQuery, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'El correo o la contraseña no coinciden' });
    }

    const usuario = result.rows[0];

    if (password !== usuario.password) { 
      return res.status(401).json({ error: 'El correo o la contraseña no coinciden' });
    }

    // Creamos el Token JWT con los datos clave del usuario y su empresa
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, tenant: tenant }, 
      process.env.JWT_SECRET || 'clave_secreta_temporal',
      { expiresIn: '2h' }
    );

    res.json({
      message: '¡Login exitoso! Bienvenido al sistema',
      token,
      usuario: { nombre: usuario.nombre, rol: usuario.rol, tenant }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Hubo un fallo en el servidor al intentar iniciar sesión' });
  }
};

// 👥 Lógica para registrar un nuevo usuario (empleado)
const registrarUsuario = async (req, res) => {
  const { nombre, rol, email, password } = req.body;

  if (!nombre || !rol || !email || !password) {
    return res.status(400).json({ error: 'Faltan datos para registrar al empleado.' });
  }

  try {
    const esquemaEmpresa = req.tenant; // El middleware ya extrajo esto del token JWT

    const query = `
      INSERT INTO ${esquemaEmpresa}.users (nombre, rol, email, password)
      VALUES ($1, $2, $3, $4) RETURNING id, nombre, rol, email;
    `;
    
    const result = await pool.query(query, [nombre, rol, email, password]);
    
    res.status(201).json({
      mensaje: `Empleado registrado con éxito en la empresa: ${esquemaEmpresa}`,
      usuarioCreado: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Este correo electrónico ya está registrado.' });
    }
    res.status(500).json({ error: 'Fallo interno al crear el usuario.' });
  }
};

module.exports = { login, registrarUsuario };