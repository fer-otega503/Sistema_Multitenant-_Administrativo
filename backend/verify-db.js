require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function verify() {
  const client = await pool.connect();
  try {
    const schemas = await client.query(
      "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'ferreteria';"
    );
    console.log('Esquema "ferreteria" existe:', schemas.rows.length > 0 ? '✅ SI' : '❌ NO');

    if (schemas.rows.length === 0) {
      console.log('Ejecuta primero: node seed-ferreteria.js');
      return;
    }

    await client.query('SET search_path TO ferreteria;');

    const users = await client.query('SELECT id, nombre, email, rol FROM users;');
    console.log('\n👤 Usuarios:');
    users.rows.forEach(u => console.log(`  ID:${u.id} | ${u.email} | ${u.rol}`));

    const products = await client.query('SELECT codigo, nombre, stock FROM products ORDER BY codigo;');
    console.log('\n📦 Productos:');
    products.rows.forEach(p => console.log(`  ${p.codigo} | ${p.nombre} | Stock: ${p.stock}`));

    const sells = await client.query('SELECT id, no_caja, total FROM sells ORDER BY id;');
    console.log('\n💰 Ventas:');
    sells.rows.forEach(s => console.log(`  Venta #${s.id} | Caja: ${s.no_caja} | Total: $${s.total}`));

    const details = await client.query('SELECT COUNT(*) as total FROM sell_details;');
    console.log(`\n🧾 Detalles de ventas: ${details.rows[0].total} registros`);

    console.log('\n═══════════════════════════════════════');
    console.log('✅ Verificación completa — la BD está lista');
    console.log('═══════════════════════════════════════');

  } finally {
    client.release();
    await pool.end();
  }
}

verify().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
