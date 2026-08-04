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

module.exports = { getVentaDetalle };
