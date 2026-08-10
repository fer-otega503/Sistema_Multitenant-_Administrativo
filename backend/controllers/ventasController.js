const pool = require('../db');

/**
 * GET /api/ventas/detalle?sell_id=X&no_caja=Y
 * Retorna los detalles de una venta filtrada por ID y número de caja.
 * Requiere el header X-Tenant-ID para aislar el esquema.
 */
const getVentaDetalle = async (req, res) => {
  const { sell_id, no_caja } = req.query;
  const tenantId = req.headers['x-tenant-id'] || 'ferreteria';

  if (!sell_id || !no_caja) {
    return res.status(400).json({
      error: 'Se requiere sell_id y no_caja para consultar la venta.'
    });
  }

  // Validación del esquema
  const isValidSchema = /^[a-zA-Z0-9_]+$/.test(tenantId);
  if (!isValidSchema) {
    return res.status(400).json({ error: 'Tenant ID inválido.' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query(`SET search_path TO "${tenantId}";`);

    // 1. Verificar que la venta existe con el no_caja correcto
    const sellRes = await client.query(
      `SELECT id, no_caja, total, fecha FROM sells WHERE id = $1 AND no_caja = $2`,
      [sell_id, no_caja.toUpperCase().trim()]
    );

    if (sellRes.rows.length === 0) {
      return res.status(404).json({
        error: 'No se encontró ninguna venta con ese No. Venta y No. Caja.'
      });
    }

    const venta = sellRes.rows[0];

    // 2. Obtener los productos del detalle de esa venta
    const detailsRes = await client.query(`
      SELECT
        p.nombre          AS descripcion,
        sd.precio_unitario,
        sd.cantidad,
        p.unidad,
        (sd.cantidad * sd.precio_unitario) AS precio_venta
      FROM sell_details sd
      JOIN products p ON sd.product_id = p.id
      WHERE sd.sell_id = $1
      ORDER BY sd.id;
    `, [sell_id]);

    res.json({
      exito: true,
      venta: {
        id:      venta.id,
        no_caja: venta.no_caja,
        total:   Number(venta.total),
        fecha:   venta.fecha,
      },
      detalles: detailsRes.rows.map(row => ({
        descripcion:     row.descripcion,
        precio_unitario: Number(row.precio_unitario),
        cantidad:        Number(row.cantidad),
        unidad:          row.unidad,
        precio_venta:    Number(row.precio_venta),
      }))
    });

  } catch (error) {
    console.error('[Ventas] Error al obtener detalle de venta:', error);
    res.status(500).json({ error: 'Error interno al consultar la venta.' });
  } finally {
    if (client) client.release();
  }
};

/**
 * GET /api/ventas/cajas
 * Retorna la lista de cajas existentes (sin duplicados) basadas en la tabla sells.
 */
const getCajas = async (req, res) => {
  const tenantId = req.headers['x-tenant-id'] || 'ferreteria';
  const isValidSchema = /^[a-zA-Z0-9_]+$/.test(tenantId);
  if (!isValidSchema) {
    return res.status(400).json({ error: 'Tenant ID inválido.' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query(`SET search_path TO "${tenantId}";`);

    const result = await client.query(`
      SELECT DISTINCT no_caja FROM (
        SELECT no_caja FROM sells WHERE no_caja IS NOT NULL AND TRIM(no_caja) != ''
        UNION
        SELECT no_caja FROM users WHERE no_caja IS NOT NULL AND TRIM(no_caja) != ''
      ) AS c
      ORDER BY no_caja ASC;
    `);

    res.json({
      exito: true,
      cajas: result.rows.map(r => r.no_caja)
    });
  } catch (error) {
    console.error('[Ventas] Error al obtener cajas:', error);
    res.status(500).json({ error: 'Error interno al consultar cajas.' });
  } finally {
    if (client) client.release();
  }
};

/**
 * POST /api/ventas
 * Crea una nueva venta, registra detalles y descuenta inventario.
 */
const crearVenta = async (req, res) => {
  const tenantId = req.headers['x-tenant-id'] || 'ferreteria';
  const { no_caja, detalles } = req.body;

  if (!no_caja || !detalles || !Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({ error: 'Faltan datos de la venta (no_caja o detalles).' });
  }

  const isValidSchema = /^[a-zA-Z0-9_]+$/.test(tenantId);
  if (!isValidSchema) {
    return res.status(400).json({ error: 'Tenant ID inválido.' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query(`SET search_path TO "${tenantId}";`);
    await client.query('BEGIN');

    let totalVenta = 0;
    const productosValidados = [];

    // Validar productos y calcular total real desde la DB
    for (const item of detalles) {
      const prodRes = await client.query(
        'SELECT id, nombre, precio_venta, stock FROM products WHERE codigo = $1 OR id::text = $1',
        [item.producto_id]
      );

      if (prodRes.rows.length === 0) {
        throw new Error(`Producto con ID/Código ${item.producto_id} no encontrado.`);
      }

      const dbProduct = prodRes.rows[0];
      const cantidad = Number(item.cantidad);

      if (isNaN(cantidad) || cantidad <= 0) {
        throw new Error(`Cantidad inválida para producto ${dbProduct.nombre}.`);
      }

      if (Number(dbProduct.stock) < cantidad) {
        throw new Error(`Stock insuficiente para ${dbProduct.nombre}. Disponible: ${dbProduct.stock}`);
      }

      const precio = Number(dbProduct.precio_venta);
      totalVenta += (precio * cantidad);

      productosValidados.push({
        id: dbProduct.id,
        precio: precio,
        cantidad: cantidad
      });
    }

    // 1. Insertar venta
    const sellRes = await client.query(
      'INSERT INTO sells (no_caja, total) VALUES ($1, $2) RETURNING id, fecha',
      [no_caja, totalVenta]
    );
    const newSellId = sellRes.rows[0].id;
    const fecha = sellRes.rows[0].fecha;

    // 2. Insertar detalles y actualizar stock
    for (const prod of productosValidados) {
      await client.query(
        'INSERT INTO sell_details (sell_id, product_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
        [newSellId, prod.id, prod.cantidad, prod.precio]
      );

      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [prod.cantidad, prod.id]
      );
    }

    await client.query('COMMIT');
    res.json({ exito: true, mensaje: 'Venta registrada con éxito.', venta_id: newSellId, total: totalVenta, fecha });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('[Ventas] Error al crear venta:', error);
    res.status(500).json({ error: error.message || 'Error interno al registrar la venta.' });
  } finally {
    if (client) client.release();
  }
};

module.exports = { getVentaDetalle, getCajas, crearVenta };
