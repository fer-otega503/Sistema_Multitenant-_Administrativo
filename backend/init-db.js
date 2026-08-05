const pool = require('./db');
const bcrypt = require('bcryptjs');

/**
 * Crea de forma dinámica la base de datos/esquema y sus respectivas tablas para un inquilino (tenant).
 * Además, inserta el primer usuario administrador recibido desde el controlador y opcionalmente datos de prueba.
 * 
 * @param {string} nombre_negocio Nombre del esquema a crear.
 * @param {object} adminData Datos del administrador (nombre, email, password).
 */
const createTenantSchema = async (nombre_negocio, adminData) => {
  // 🛡️ Sanitización y validación estricta del nombre del esquema para evitar inyección SQL
  const isValidSchema = /^[a-zA-Z0-9_]+$/.test(nombre_negocio);
  if (!isValidSchema) {
    throw new Error('El nombre del negocio (esquema) es inválido o contiene caracteres no permitidos.');
  }

  let client;
  try {
    client = await pool.connect();

    // 1. Crear el esquema de forma aislada
    console.log(`[Database Init] Creando esquema para el negocio: ${nombre_negocio}...`);
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${nombre_negocio}";`);

    // Hacemos que por defecto todas las operaciones de esta conexión vayan al esquema creado
    await client.query(`SET search_path TO "${nombre_negocio}";`);

    // 2. Creación de la tabla users
    console.log(`[Database Init] Creando tabla users...`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(50) NOT NULL
      );
    `);

    // 3. Creación de la tabla products
    console.log(`[Database Init] Creando tabla products...`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(50) UNIQUE,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        costo DECIMAL(10, 2) NOT NULL,
        precio_venta DECIMAL(10, 2) NOT NULL,
        unidad VARCHAR(20) NOT NULL,
        stock DECIMAL(10, 2) DEFAULT 0
      );
    `);

    // 4. Creación de la tabla sells
    console.log(`[Database Init] Creando tabla sells...`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS sells (
        id SERIAL PRIMARY KEY,
        no_caja VARCHAR(20) NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Creación de la tabla sell_details
    console.log(`[Database Init] Creando tabla sell_details...`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS sell_details (
        id SERIAL PRIMARY KEY,
        sell_id INT NOT NULL,
        product_id INT NOT NULL,
        cantidad DECIMAL(10, 2) NOT NULL,
        precio_unitario DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (sell_id) REFERENCES sells(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
    `);

    // 6. Seeder: Insertar usuario administrador
    if (adminData) {
      console.log(`[Database Init] Insertando administrador inicial: ${adminData.email}...`);
      const { nombre, email, password } = adminData;

      // Hasheamos la contraseña por seguridad
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await client.query(`
        INSERT INTO users (nombre, email, password, rol)
        VALUES ($1, $2, $3, 'Administrador')
        ON CONFLICT (email) DO UPDATE 
        SET nombre = EXCLUDED.nombre, password = EXCLUDED.password;
      `, [nombre, email, hashedPassword]);
    }

    // 7. Cargar datos iniciales de prueba de ferretería
    await seedDatosIniciales(client);

    console.log(`[Database Init] ¡Éxito! Esquema '${nombre_negocio}' inicializado correctamente.`);
    return { success: true };
  } catch (error) {
    console.error(`[Database Init] Error al inicializar el esquema para '${nombre_negocio}':`, error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
};

/**
 * Función auxiliar asíncrona para sembrar datos iniciales de ferretería en un esquema.
 */
const seedDatosIniciales = async (client) => {
  try {
    // 1. Productos iniciales
    await client.query(`
      INSERT INTO products (codigo, nombre, descripcion, costo, precio_venta, unidad, stock) VALUES
      ('2026001', 'Martillo de uña', 'Martillo Truper de 16 oz con mango de madera', 85.00, 150.00, 'PZ', 25.00),
      ('2026002', 'Clavo estándar 2"', 'Clavos para madera, venta por kilo', 30.00, 55.00, 'KG', 50.00),
      ('2026003', 'Cemento Cruz Azul', 'Bulto de cemento gris 50kg', 180.00, 220.00, 'PZ', 100.00),
      ('2026004', 'Cable de cobre cal. 12', 'Rollo de cable THW 100m color rojo', 600.00, 950.00, 'PZ', 10.00),
      ('2026005', 'Tornillo pija 1"', 'Tornillo pija cabeza plana', 0.50, 1.50, 'PZ', 500.00)
      ON CONFLICT (codigo) DO NOTHING;
    `);

    // 2. Ventas simuladas iniciales (No insertamos ID manual para evitar conflictos con el serial)
    // Pero como dependemos del ID en sell_details, podemos usar un workaround:
    await client.query(`
      INSERT INTO sells (id, no_caja, total) VALUES
      (1, 'CAJA-01', 370.00),
      (2, 'CAJA-02', 1170.00)
      ON CONFLICT DO NOTHING;
    `);

    // Ajustar secuencia para evitar errores si se insertan ids a mano
    await client.query("SELECT setval(pg_get_serial_sequence('sells', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM sells;");
    await client.query("SELECT setval(pg_get_serial_sequence('products', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM products;");

    // 3. Detalles de ventas
    await client.query(`
      INSERT INTO sell_details (sell_id, product_id, cantidad, precio_unitario) VALUES
      (1, 1, 1.00, 150.00),
      (1, 2, 4.00, 55.00),
      (2, 3, 1.00, 220.00),
      (2, 4, 1.00, 950.00)
      ON CONFLICT DO NOTHING;
    `);

    console.log(`[Database Init] ✅ Datos iniciales de ferretería cargados con éxito.`);
  } catch (err) {
    console.warn(`[Database Init] Aviso: No se pudieron cargar los datos de prueba iniciales:`, err.message);
  }
};

module.exports = {
  createTenantSchema,
  seedDatosIniciales
};