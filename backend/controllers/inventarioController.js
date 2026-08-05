const pool = require('../db');

// ─── Helper: Validar tenant ───────────────────────────────────────────────────
const validarTenant = (tenantId, res) => {
  const isValid = /^[a-zA-Z0-9_]+$/.test(tenantId);
  if (!isValid) {
    res.status(400).json({ error: 'Tenant ID inválido.' });
    return false;
  }
  return true;
};

// ─── Helper: Mapear fila de producto ────────────────────────────────────────
const mapProducto = (p) => ({
  id:           p.id,
  codigo:       p.codigo,
  nombre:       p.nombre,
  descripcion:  p.descripcion,
  costo:        Number(p.costo),
  precio_venta: Number(p.precio_venta),
  unidad:       p.unidad,
  stock:        Number(p.stock),
});

// ─── GET /api/inventario/productos ──────────────────────────────────────────
/**
 * Retorna todos los productos del tenant.
 * Query opcional: ?codigo=XXXX → filtra por código (ILIKE).
 */
const getProductos = async (req, res) => {
  const tenantId = req.headers['x-tenant-id'] || 'ferreteria';
  if (!validarTenant(tenantId, res)) return;

  const { codigo } = req.query;
  let client;
  try {
    client = await pool.connect();
    await client.query(`SET search_path TO "${tenantId}";`);

    let queryText = `
      SELECT id, codigo, nombre, descripcion, costo, precio_venta, unidad, stock
      FROM products
    `;
    const params = [];
    if (codigo && codigo.trim() !== '') {
      queryText += ` WHERE codigo ILIKE $1`;
      params.push(`%${codigo.trim()}%`);
    }
    queryText += ` ORDER BY codigo ASC;`;

    const result = await client.query(queryText, params);
    res.json({ exito: true, productos: result.rows.map(mapProducto) });
  } catch (error) {
    console.error('[Inventario] Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno al consultar los productos.' });
  } finally {
    if (client) client.release();
  }
};

// ─── POST /api/inventario/productos ─────────────────────────────────────────
/**
 * Crea un nuevo producto.
 * Body: { codigo, nombre, descripcion, costo, precio_venta, unidad, stock }
 */
const crearProducto = async (req, res) => {
  const tenantId = req.headers['x-tenant-id'] || 'ferreteria';
  if (!validarTenant(tenantId, res)) return;

  const { codigo, nombre, descripcion, costo, precio_venta, unidad, stock } = req.body;

  if (!codigo || !nombre || costo == null || precio_venta == null || !unidad) {
    return res.status(400).json({
      error: 'Faltan campos requeridos: codigo, nombre, costo, precio_venta, unidad.',
    });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query(`SET search_path TO "${tenantId}";`);

    const result = await client.query(
      `INSERT INTO products (codigo, nombre, descripcion, costo, precio_venta, unidad, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, codigo, nombre, descripcion, costo, precio_venta, unidad, stock;`,
      [
        codigo.trim(),
        nombre.trim(),
        descripcion?.trim() || null,
        Number(costo),
        Number(precio_venta),
        unidad.trim(),
        Number(stock) || 0,
      ]
    );

    res.status(201).json({ exito: true, producto: mapProducto(result.rows[0]) });
  } catch (error) {
    console.error('[Inventario] Error al crear producto:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un producto con ese código.' });
    }
    res.status(500).json({ error: 'Error interno al crear el producto.' });
  } finally {
    if (client) client.release();
  }
};

// ─── PUT /api/inventario/productos/:id ──────────────────────────────────────
/**
 * Edita un producto existente.
 * Body: { codigo, nombre, descripcion, costo, precio_venta, unidad, stock }
 */
const editarProducto = async (req, res) => {
  const tenantId = req.headers['x-tenant-id'] || 'ferreteria';
  if (!validarTenant(tenantId, res)) return;

  const { id } = req.params;
  const { codigo, nombre, descripcion, costo, precio_venta, unidad, stock } = req.body;

  if (!codigo || !nombre || costo == null || precio_venta == null || !unidad) {
    return res.status(400).json({
      error: 'Faltan campos requeridos: codigo, nombre, costo, precio_venta, unidad.',
    });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query(`SET search_path TO "${tenantId}";`);

    const result = await client.query(
      `UPDATE products
       SET codigo=$1, nombre=$2, descripcion=$3, costo=$4, precio_venta=$5, unidad=$6, stock=$7
       WHERE id=$8
       RETURNING id, codigo, nombre, descripcion, costo, precio_venta, unidad, stock;`,
      [
        codigo.trim(),
        nombre.trim(),
        descripcion?.trim() || null,
        Number(costo),
        Number(precio_venta),
        unidad.trim(),
        Number(stock) || 0,
        Number(id),
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.json({ exito: true, producto: mapProducto(result.rows[0]) });
  } catch (error) {
    console.error('[Inventario] Error al editar producto:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe otro producto con ese código.' });
    }
    res.status(500).json({ error: 'Error interno al editar el producto.' });
  } finally {
    if (client) client.release();
  }
};

// ─── DELETE /api/inventario/productos ───────────────────────────────────────
/**
 * Elimina uno o varios productos del tenant.
 * Body: { ids: [1, 2, 3] }
 *
 * IMPORTANTE: Se eliminan primero los sell_details relacionados (dentro de una
 * transacción) para evitar el error de FK que produce el constraint
 * FOREIGN KEY (product_id) REFERENCES products(id) sin ON DELETE CASCADE.
 */
const eliminarProductos = async (req, res) => {
  const tenantId = req.headers['x-tenant-id'] || 'ferreteria';
  if (!validarTenant(tenantId, res)) return;

  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      error: 'Se requiere un arreglo "ids" con al menos un elemento.',
    });
  }

  // Aseguramos que todos sean números enteros válidos
  const numericIds = ids.map(Number).filter(n => Number.isInteger(n) && n > 0);
  if (numericIds.length === 0) {
    return res.status(400).json({ error: 'Los IDs deben ser enteros positivos.' });
  }

  const placeholders = numericIds.map((_, i) => `$${i + 1}`).join(', ');

  let client;
  try {
    client = await pool.connect();
    await client.query(`SET search_path TO "${tenantId}";`);

    // ── Transacción: borrar dependencias y luego el producto ──────────────
    await client.query('BEGIN');

    // 1. Eliminar los detalles de venta que referencian estos productos
    //    (la FK product_id no tiene ON DELETE CASCADE, así que lo hacemos manual)
    await client.query(
      `DELETE FROM sell_details WHERE product_id IN (${placeholders});`,
      numericIds
    );

    // 2. Eliminar los productos
    await client.query(
      `DELETE FROM products WHERE id IN (${placeholders});`,
      numericIds
    );

    await client.query('COMMIT');

    res.json({ exito: true, eliminados: numericIds.length });
  } catch (error) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (_) {}
    }
    console.error('[Inventario] Error al eliminar productos:', error);
    res.status(500).json({
      error: 'Error interno al eliminar los productos.',
      detalle: error.message, // detalle visible sólo en desarrollo
    });
  } finally {
    if (client) client.release();
  }
};

module.exports = { getProductos, crearProducto, editarProducto, eliminarProductos };
