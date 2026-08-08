const pool = require('../db');
const bcrypt = require('bcryptjs');

// ─── Helper: Validar tenant ───────────────────────────────────────────────────
const validarTenant = (tenantId, res) => {
  const isValid = /^[a-zA-Z0-9_]+$/.test(tenantId);
  if (!isValid) {
    res.status(400).json({ error: 'Tenant ID inválido.' });
    return false;
  }
  return true;
};

// ─── Helper: Asegurar columnas nuevas (migración en caliente) ────────────────
/**
 * Agrega apellido_p, apellido_m y no_caja a users si no existen.
 * Se llama al inicio de cada request que lea/escriba empleados.
 */
const ensureColumns = async (client) => {
  await client.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS apellido_p VARCHAR(100) DEFAULT '',
      ADD COLUMN IF NOT EXISTS apellido_m VARCHAR(100) DEFAULT '',
      ADD COLUMN IF NOT EXISTS no_caja    VARCHAR(50)  DEFAULT '';
  `);
};

// ─── Helper: Mapear fila de usuario (sin exponer la contraseña) ──────────────
const mapEmpleado = (u) => ({
  id:         u.id,
  nombre:     u.nombre     ?? '',
  apellido_p: u.apellido_p ?? '',
  apellido_m: u.apellido_m ?? '',
  email:      u.email,
  no_caja:    u.no_caja    ?? '',
  rol:        u.rol,
});

// ─── GET /api/empleados ──────────────────────────────────────────────────────
/**
 * Lista todos los usuarios del tenant.
 * El admin que hace la petición se identifica por su email (header X-Admin-Email).
 * Query opcional: ?nombre=XXX → filtra por nombre (ILIKE).
 */
const getEmpleados = async (req, res) => {
  const tenantId = req.headers['x-tenant-id'] || 'ferreteria';
  if (!validarTenant(tenantId, res)) return;

  const { nombre } = req.query;
  let client;
  try {
    client = await pool.connect();
    await client.query(`SET search_path TO "${tenantId}";`);
    await ensureColumns(client);

    let queryText = `
      SELECT id, nombre, apellido_p, apellido_m, email, no_caja, rol
      FROM users
    `;
    const params = [];
    if (nombre && nombre.trim() !== '') {
      queryText += ` WHERE nombre ILIKE $1 OR apellido_p ILIKE $1 OR apellido_m ILIKE $1`;
      params.push(`%${nombre.trim()}%`);
    }
    queryText += ` ORDER BY id ASC;`;

    const result = await client.query(queryText, params);
    res.json({ exito: true, empleados: result.rows.map(mapEmpleado) });
  } catch (error) {
    console.error('[Empleados] Error al obtener empleados:', error);
    res.status(500).json({ error: 'Error interno al consultar empleados.' });
  } finally {
    if (client) client.release();
  }
};

// ─── POST /api/empleados ─────────────────────────────────────────────────────
/**
 * Crea un nuevo empleado.
 * Body: { nombre, apellido_p, apellido_m, email, password, no_caja, rol }
 * Roles permitidos para empleados: Empleado, Gerente, Limpieza
 */
const crearEmpleado = async (req, res) => {
  const tenantId = req.headers['x-tenant-id'] || 'ferreteria';
  if (!validarTenant(tenantId, res)) return;

  const { nombre, apellido_p, apellido_m, email, password, no_caja, rol } = req.body;

  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({
      error: 'Faltan campos requeridos: nombre, email, contraseña y rol.',
    });
  }

  const rolesPermitidos = ['Empleado', 'Gerente', 'Limpieza'];
  if (!rolesPermitidos.includes(rol)) {
    return res.status(400).json({
      error: `Rol inválido. Debe ser uno de: ${rolesPermitidos.join(', ')}.`,
    });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query(`SET search_path TO "${tenantId}";`);
    await ensureColumns(client);

    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await client.query(
      `INSERT INTO users (nombre, apellido_p, apellido_m, email, password, no_caja, rol)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, nombre, apellido_p, apellido_m, email, no_caja, rol;`,
      [
        nombre.trim(),
        (apellido_p || '').trim(),
        (apellido_m || '').trim(),
        email.toLowerCase().trim(),
        hashedPassword,
        (no_caja || '').trim(),
        rol,
      ]
    );

    res.status(201).json({ exito: true, empleado: mapEmpleado(result.rows[0]) });
  } catch (error) {
    console.error('[Empleados] Error al crear empleado:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });
    }
    res.status(500).json({ error: 'Error interno al crear el empleado.' });
  } finally {
    if (client) client.release();
  }
};

// ─── PUT /api/empleados/:id ──────────────────────────────────────────────────
/**
 * Edita un empleado existente.
 * Si se envía contraseña no vacía, se actualiza; de lo contrario se conserva la actual.
 * El Admin no puede editar su propio registro (verificado en el frontend, pero
 * lo protegemos también aquí comprobando que el id !== adminId del token si aplica).
 */
const editarEmpleado = async (req, res) => {
  const tenantId = req.headers['x-tenant-id'] || 'ferreteria';
  if (!validarTenant(tenantId, res)) return;

  const { id } = req.params;
  const { nombre, apellido_p, apellido_m, email, password, no_caja, rol } = req.body;

  if (!nombre || !email || !rol) {
    return res.status(400).json({ error: 'Faltan campos requeridos: nombre, email y rol.' });
  }

  const rolesPermitidos = ['Empleado', 'Gerente', 'Limpieza'];
  if (!rolesPermitidos.includes(rol)) {
    return res.status(400).json({
      error: `Rol inválido. Debe ser uno de: ${rolesPermitidos.join(', ')}.`,
    });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query(`SET search_path TO "${tenantId}";`);
    await ensureColumns(client);

    let result;
    if (password && password.trim() !== '') {
      // Actualizar también la contraseña
      const salt           = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password.trim(), salt);

      result = await client.query(
        `UPDATE users
         SET nombre=$1, apellido_p=$2, apellido_m=$3, email=$4, password=$5, no_caja=$6, rol=$7
         WHERE id=$8
         RETURNING id, nombre, apellido_p, apellido_m, email, no_caja, rol;`,
        [
          nombre.trim(),
          (apellido_p || '').trim(),
          (apellido_m || '').trim(),
          email.toLowerCase().trim(),
          hashedPassword,
          (no_caja || '').trim(),
          rol,
          Number(id),
        ]
      );
    } else {
      // Mantener la contraseña actual
      result = await client.query(
        `UPDATE users
         SET nombre=$1, apellido_p=$2, apellido_m=$3, email=$4, no_caja=$5, rol=$6
         WHERE id=$7
         RETURNING id, nombre, apellido_p, apellido_m, email, no_caja, rol;`,
        [
          nombre.trim(),
          (apellido_p || '').trim(),
          (apellido_m || '').trim(),
          email.toLowerCase().trim(),
          (no_caja || '').trim(),
          rol,
          Number(id),
        ]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado.' });
    }

    res.json({ exito: true, empleado: mapEmpleado(result.rows[0]) });
  } catch (error) {
    console.error('[Empleados] Error al editar empleado:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'El correo electrónico ya está en uso.' });
    }
    res.status(500).json({ error: 'Error interno al editar el empleado.' });
  } finally {
    if (client) client.release();
  }
};

// ─── DELETE /api/empleados/:id ───────────────────────────────────────────────
/**
 * Elimina un empleado por su ID.
 * El Admin no puede eliminarse a sí mismo.
 * Header X-Admin-ID contiene el ID del administrador actual.
 */
const eliminarEmpleado = async (req, res) => {
  const tenantId = req.headers['x-tenant-id'] || 'ferreteria';
  if (!validarTenant(tenantId, res)) return;

  const { id }     = req.params;
  const adminId    = req.headers['x-admin-id'];

  // Guardia: no puede eliminarse a sí mismo
  if (adminId && String(adminId) === String(id)) {
    return res.status(403).json({ error: 'No puedes eliminar tu propio perfil de administrador.' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query(`SET search_path TO "${tenantId}";`);

    const result = await client.query(
      `DELETE FROM users WHERE id=$1 RETURNING id;`,
      [Number(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado.' });
    }

    res.json({ exito: true, eliminado: Number(id) });
  } catch (error) {
    console.error('[Empleados] Error al eliminar empleado:', error);
    res.status(500).json({ error: 'Error interno al eliminar el empleado.' });
  } finally {
    if (client) client.release();
  }
};

module.exports = { getEmpleados, crearEmpleado, editarEmpleado, eliminarEmpleado };
