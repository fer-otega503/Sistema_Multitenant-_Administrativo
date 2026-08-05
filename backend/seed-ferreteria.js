/**
 * seed-ferreteria.js
 * 
 * Script de inicialización del esquema "ferreteria" en PostgreSQL.
 * Crea el esquema, todas las tablas y los datos de ejemplo (usuario Gestor + productos + ventas).
 * 
 * Uso: node backend/seed-ferreteria.js
 * 
 * CREDENCIALES DE EJEMPLO INSERTADAS:
 *   Email:      admin1234@gmail.com
 *   Contraseña: admins123456789
 *   Rol:        Gestor
 */

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const SCHEMA_NAME = 'ferreteria';

const ADMIN_EMAIL = 'admin1234@gmail.com';
const ADMIN_PASSWORD = 'admins123456789';
const ADMIN_NOMBRE = 'Admin Ferretería';
const ADMIN_ROL = 'Gestor';

async function seedFerreteria() {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Conexión exitosa a PostgreSQL.');

    // ─────────────────────────────────────────────
    // 1. Crear el esquema si no existe
    // ─────────────────────────────────────────────
    console.log(`\n🏗️  Creando esquema "${SCHEMA_NAME}"...`);
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA_NAME}";`);
    await client.query(`SET search_path TO "${SCHEMA_NAME}";`);
    console.log(`   → Esquema "${SCHEMA_NAME}" listo.`);

    // ─────────────────────────────────────────────
    // 2. Crear tabla users
    // ─────────────────────────────────────────────
    console.log('\n📋 Creando tabla "users"...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "${SCHEMA_NAME}".users (
        id        SERIAL PRIMARY KEY,
        nombre    VARCHAR(100) NOT NULL,
        email     VARCHAR(100) UNIQUE NOT NULL,
        password  VARCHAR(255) NOT NULL,
        rol       VARCHAR(50) NOT NULL
      );
    `);
    console.log('   → Tabla "users" lista.');

    // ─────────────────────────────────────────────
    // 3. Crear tabla products
    // ─────────────────────────────────────────────
    console.log('\n📦 Creando tabla "products"...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "${SCHEMA_NAME}".products (
        id           SERIAL PRIMARY KEY,
        codigo       VARCHAR(50) UNIQUE,
        nombre       VARCHAR(100) NOT NULL,
        descripcion  TEXT,
        costo        DECIMAL(10, 2) NOT NULL,
        precio_venta DECIMAL(10, 2) NOT NULL,
        unidad       VARCHAR(20) NOT NULL,
        stock        DECIMAL(10, 2) DEFAULT 0
      );
    `);
    console.log('   → Tabla "products" lista.');

    // ─────────────────────────────────────────────
    // 4. Crear tabla sells
    // ─────────────────────────────────────────────
    console.log('\n🛒 Creando tabla "sells"...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "${SCHEMA_NAME}".sells (
        id      SERIAL PRIMARY KEY,
        no_caja VARCHAR(20) NOT NULL,
        total   DECIMAL(10, 2) NOT NULL,
        fecha   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('   → Tabla "sells" lista.');

    // ─────────────────────────────────────────────
    // 5. Crear tabla sell_details
    // ─────────────────────────────────────────────
    console.log('\n📝 Creando tabla "sell_details"...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "${SCHEMA_NAME}".sell_details (
        id              SERIAL PRIMARY KEY,
        sell_id         INT NOT NULL,
        product_id      INT NOT NULL,
        cantidad        DECIMAL(10, 2) NOT NULL,
        precio_unitario DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (sell_id)    REFERENCES "${SCHEMA_NAME}".sells(id)    ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES "${SCHEMA_NAME}".products(id)
      );
    `);
    console.log('   → Tabla "sell_details" lista.');

    // ─────────────────────────────────────────────
    // 6. Insertar usuario Gestor de ejemplo
    // ─────────────────────────────────────────────
    console.log(`\n👤 Insertando usuario Gestor: ${ADMIN_EMAIL}...`);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    await client.query(`
      INSERT INTO "${SCHEMA_NAME}".users (nombre, email, password, rol)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE
        SET nombre   = EXCLUDED.nombre,
            password = EXCLUDED.password,
            rol      = EXCLUDED.rol;
    `, [ADMIN_NOMBRE, ADMIN_EMAIL, hashedPassword, ADMIN_ROL]);
    console.log(`   → Usuario "${ADMIN_EMAIL}" con rol "${ADMIN_ROL}" insertado/actualizado.`);

    // ─────────────────────────────────────────────
    // 7. Insertar productos de ferretería
    // ─────────────────────────────────────────────
    console.log('\n🔧 Insertando productos de ferretería...');
    await client.query(`
      INSERT INTO "${SCHEMA_NAME}".products
        (codigo, nombre, descripcion, costo, precio_venta, unidad, stock)
      VALUES
        ('2026001', 'Martillo de uña',       'Martillo Truper de 16 oz con mango de madera',      85.00,  150.00, 'PZ',   25.00),
        ('2026002', 'Clavo estándar 2"',     'Clavos para madera, venta por kilo',                30.00,   55.00, 'KG',   50.00),
        ('2026003', 'Cemento Cruz Azul',      'Bulto de cemento gris 50kg',                       180.00,  220.00, 'PZ',  100.00),
        ('2026004', 'Cable de cobre cal. 12', 'Rollo de cable THW 100m color rojo',               600.00,  950.00, 'PZ',   10.00),
        ('2026005', 'Tornillo pija 1"',       'Tornillo pija cabeza plana',                         0.50,    1.50, 'PZ',  500.00),
        ('2026006', 'Lija de agua #220',      'Hoja de lija de agua grano 220',                    5.00,   12.00, 'PZ',  200.00),
        ('2026007', 'Pintura vinílica blanca','Cubeta 20L pintura vinílica interior/exterior',    320.00,  480.00, 'PZ',   15.00),
        ('FER-008', 'Flexómetro 5m',          'Cinta métrica de 5 metros con cuerpo antidesliz',   45.00,   85.00, 'PZ',   30.00)
      ON CONFLICT (codigo) DO NOTHING;
    `);
    console.log('   → 8 productos de ferretería insertados.');

    // ─────────────────────────────────────────────
    // 8. Insertar ventas simuladas
    // ─────────────────────────────────────────────
    console.log('\n💰 Insertando ventas simuladas...');
    await client.query(`
      INSERT INTO "${SCHEMA_NAME}".sells (id, no_caja, total)
      VALUES
        (1, 'CAJA-01',  370.00),
        (2, 'CAJA-02', 1170.00),
        (3, 'CAJA-01',  492.00),
        (4, 'CAJA-02',  220.00)
      ON CONFLICT DO NOTHING;
    `);

    // Ajustar las secuencias para evitar conflictos futuros
    await client.query(`
      SELECT setval(
        pg_get_serial_sequence('"${SCHEMA_NAME}".sells', 'id'),
        coalesce(max(id), 1),
        max(id) IS NOT null
      ) FROM "${SCHEMA_NAME}".sells;
    `);
    await client.query(`
      SELECT setval(
        pg_get_serial_sequence('"${SCHEMA_NAME}".products', 'id'),
        coalesce(max(id), 1),
        max(id) IS NOT null
      ) FROM "${SCHEMA_NAME}".products;
    `);
    console.log('   → 4 ventas simuladas insertadas.');

    // ─────────────────────────────────────────────
    // 9. Insertar detalles de ventas
    // ─────────────────────────────────────────────
    console.log('\n🧾 Insertando detalles de ventas...');
    await client.query(`
      INSERT INTO "${SCHEMA_NAME}".sell_details
        (sell_id, product_id, cantidad, precio_unitario)
      VALUES
        (1, 1, 1.00, 150.00),
        (1, 2, 4.00,  55.00),
        (2, 3, 1.00, 220.00),
        (2, 4, 1.00, 950.00),
        (3, 5, 8.00,   1.50),
        (3, 8, 4.00,  85.00),
        (4, 3, 1.00, 220.00)
      ON CONFLICT DO NOTHING;
    `);
    console.log('   → Detalles de ventas insertados.');

    // ─────────────────────────────────────────────
    // 10. Resumen final
    // ─────────────────────────────────────────────
    const resUsers = await client.query(`SELECT COUNT(*) FROM "${SCHEMA_NAME}".users;`);
    const resProds = await client.query(`SELECT COUNT(*) FROM "${SCHEMA_NAME}".products;`);
    const resSells = await client.query(`SELECT COUNT(*) FROM "${SCHEMA_NAME}".sells;`);
    const resDetails = await client.query(`SELECT COUNT(*) FROM "${SCHEMA_NAME}".sell_details;`);

    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅  RESUMEN DEL ESQUEMA "ferreteria"');
    console.log('═══════════════════════════════════════════════════');
    console.log(`   👤  Usuarios    : ${resUsers.rows[0].count}`);
    console.log(`   📦  Productos   : ${resProds.rows[0].count}`);
    console.log(`   💰  Ventas      : ${resSells.rows[0].count}`);
    console.log(`   🧾  Detalles    : ${resDetails.rows[0].count}`);
    console.log('───────────────────────────────────────────────────');
    console.log('   Credenciales del usuario de ejemplo:');
    console.log(`   📧  Email      : ${ADMIN_EMAIL}`);
    console.log(`   🔑  Contraseña : ${ADMIN_PASSWORD}`);
    console.log(`   🎭  Rol        : ${ADMIN_ROL}`);
    console.log('   Tenant ID para login: ferreteria');
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error durante el seeding:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
    console.log('🔌 Conexión cerrada.');
  }
}

seedFerreteria();
