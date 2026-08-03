const pool = require('./db');

const createTenantSchema = async (schemaName) => {
    const query = `
    -- 1. Creamos el esquema aislado para el inquilino
    CREATE SCHEMA IF NOT EXISTS ${schemaName};

    -- 2. Creamos la tabla Users dentro de ese esquema
    CREATE TABLE IF NOT EXISTS ${schemaName}.users (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        usuario VARCHAR(100) UNIQUE NOT NULL,
        psw VARCHAR(255) NOT NULL,
        rol VARCHAR(50) NOT NULL
    );

    -- 3. Creamos la tabla Products dentro de ese esquema
    CREATE TABLE IF NOT EXISTS ${schemaName}.products (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(50) UNIQUE, 
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        costo DECIMAL(10, 2) NOT NULL,
        precio_venta DECIMAL(10, 2) NOT NULL,
        unidad VARCHAR(20) NOT NULL, -- Ej. PZ, KG
        stock DECIMAL(10, 2) DEFAULT 0 -- Decimal por si el inventario se pesa en KG
    );

    -- 4. Creamos la tabla Sells dentro de ese esquema
    CREATE TABLE IF NOT EXISTS ${schemaName}.sells (
        id SERIAL PRIMARY KEY,
        no_caja VARCHAR(20) NOT NULL, -- Para el filtro del Dashboard-Ventas-Consulta
        total DECIMAL(10, 2) NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. Creamos la tabla de Detalles de Venta (Nueva)
    CREATE TABLE IF NOT EXISTS ${schemaName}.sell_details (
        id SERIAL PRIMARY KEY,
        sell_id INT NOT NULL,
        product_id INT NOT NULL,
        cantidad DECIMAL(10, 2) NOT NULL, 
        precio_unitario DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (sell_id) REFERENCES ${schemaName}.sells(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES ${schemaName}.products(id)
    );
  `;

    try {
        console.log(`Creando esquema y tablas para: ${schemaName}...`);
        await pool.query(query);
        console.log(`¡Éxito! Esquema '${schemaName}' y tablas base listas para usarse.`);
    } catch (error) {
        console.error('Ocurrió un error creando las tablas:', error);
    } finally {
        // Cerramos la conexión para que la terminal no se quede colgada
        pool.end();
    }
};

// Ejecutamos la función para nuestro primer inquilino de prueba
createTenantSchema('schema_ferreteria');