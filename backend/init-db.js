const pool = require('./db-mysql');
const bcrypt = require('bcryptjs');

/**
 * Crea de forma dinámica la base de datos/esquema y sus respectivas tablas para un inquilino (tenant).
 * Además, inserta el primer usuario administrador recibido desde el controlador.
 * 
 * @param {string} nombre_negocio Nombre de la base de datos/esquema a crear.
 * @param {object} adminData Datos del administrador (nombre, usuario, psw).
 */
const createTenantSchema = async (nombre_negocio, adminData) => {
    // 🛡️ Sanitización y validación estricta del nombre del esquema para evitar inyección SQL
    const isValidSchema = /^[a-zA-Z0-9_]+$/.test(nombre_negocio);
    if (!isValidSchema) {
        throw new Error('El nombre del negocio (esquema) es inválido o contiene caracteres no permitidos.');
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // 1. Crear el esquema/base de datos
        console.log(`[Database Init] Creando esquema para el negocio: ${ferreteria}...`);
        await connection.query(`CREATE SCHEMA IF NOT EXISTS \`${ferreteria}\`;`);

        // 2. Creación de la tabla users (id, nombre, usuario, psw, rol)
        console.log(`[Database Init] Creando tabla users...`);
        await connection.query(`
      CREATE TABLE IF NOT EXISTS \`${ferreteria}\`.users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        usuario VARCHAR(100) UNIQUE NOT NULL,
        psw VARCHAR(255) NOT NULL,
        rol VARCHAR(50) NOT NULL
      );
    `);

        // 3. Creación de la tabla products (id, codigo, nombre, descripcion, costo, precio_venta, unidad, stock DECIMAL)
        console.log(`[Database Init] Creando tabla products...`);
        await connection.query(`
      CREATE TABLE IF NOT EXISTS \`${ferreteria}\`.products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(50) UNIQUE,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        costo DECIMAL(10, 2) NOT NULL,
        precio_venta DECIMAL(10, 2) NOT NULL,
        unidad VARCHAR(20) NOT NULL,
        stock DECIMAL(10, 2) DEFAULT 0
      );
    `);

        // 4. Creación de la tabla sells (id, no_caja, total, fecha TIMESTAMP)
        console.log(`[Database Init] Creando tabla sells...`);
        await connection.query(`
      CREATE TABLE IF NOT EXISTS \`${ferreteria}\`.sells (
        id INT AUTO_INCREMENT PRIMARY KEY,
        no_caja VARCHAR(20) NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // 5. Creación de la tabla sell_details (id, sell_id, product_id, cantidad, precio_unitario)
        console.log(`[Database Init] Creando tabla sell_details...`);
        await connection.query(`
      CREATE TABLE IF NOT EXISTS \`${ferreteria}\`.sell_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sell_id INT NOT NULL,
        product_id INT NOT NULL,
        cantidad DECIMAL(10, 2) NOT NULL,
        precio_unitario DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (sell_id) REFERENCES \`${ferreteria}\`.sells(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES \`${ferreteria}\`.products(id)
      );
    `);

        // 6. Seeder: Insertar usuario administrador
        if (adminData) {
            console.log(`[Database Init] Insertando administrador inicial: ${adminData.usuario}...`);
            const { nombre, usuario, psw } = adminData;

            // Hasheamos la contraseña por seguridad
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(psw, salt);

            await connection.query(`
        INSERT INTO \`${ferreteria}\`.users (nombre, usuario, psw, rol)
        VALUES (?, ?, ?, 'Administrador')
        ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), psw = VALUES(psw);
      `, [nombre, usuario, hashedPassword]);
        }

        console.log(`[Database Init] ¡Éxito! Esquema '${ferreteria}' inicializado correctamente.`);
        return { success: true };
    } catch (error) {
        console.error(`[Database Init] Error al inicializar el esquema para '${ferreteria}':`, error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    createTenantSchema
};

// Asegúrate de cambiar `schemaName` por el valor real si no lo estás usando como variable dinámica (ej. 'ferreteria')

const ferreteriaSeederQuery = `
    -- 1. Insertar Productos de Ferretería
    -- Orden: codigo, nombre, descripcion, costo, precio_venta, unidad, stock
    INSERT INTO ${ferreteria}.products (codigo, nombre, descripcion, costo, precio_venta, unidad, stock) VALUES
    ('FER-001', 'Martillo de uña', 'Martillo Truper de 16 oz con mango de madera', 85.00, 150.00, 'PZ', 25.00),
    ('FER-002', 'Clavo estándar 2"', 'Clavos para madera, venta por kilo', 30.00, 55.00, 'KG', 50.00),
    ('FER-003', 'Cemento Cruz Azul', 'Bulto de cemento gris 50kg', 180.00, 220.00, 'PZ', 100.00),
    ('FER-004', 'Cable de cobre cal. 12', 'Rollo de cable THW 100m color rojo', 600.00, 950.00, 'PZ', 10.00),
    ('FER-005', 'Tornillo pija 1"', 'Tornillo pija cabeza plana', 0.50, 1.50, 'PZ', 500.00);

    -- 2. Insertar Ventas Simuladas
    -- Orden: no_caja, total
    INSERT INTO ${ferreteria}.sells (no_caja, total) VALUES
    ('CAJA-01', 370.00), -- Venta 1
    ('CAJA-02', 1170.00); -- Venta 2

    -- 3. Insertar Detalles de esas Ventas (Tabla pivote)
    -- Asumiendo que los IDs generados arriba son 1 al 5 para productos, y 1 y 2 para ventas
    -- Orden: sell_id, product_id, cantidad, precio_unitario
    INSERT INTO ${ferreteria}.sell_details (sell_id, product_id, cantidad, precio_unitario) VALUES
    -- Detalles del Ticket 1 (1 Martillo y 4 KG de clavos)
    (1, 1, 1.00, 150.00),
    (1, 2, 4.00, 55.00),
    
    -- Detalles del Ticket 2 (1 Cemento y 1 Rollo de Cable)
    (2, 3, 1.00, 220.00),
    (2, 4, 1.00, 950.00);
`;

// Ejecutar el seeder en MySQL
await pool.query(ferreteriaSeederQuery);
console.log('✅ Datos de ferretería cargados con éxito.');