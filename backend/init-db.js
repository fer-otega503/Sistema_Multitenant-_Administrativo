const pool = require('./db');

const createTenantSchema = async (schemaName) => {
    const query = `
    -- 1. Creamos el esquema aislado para el inquilino
    CREATE SCHEMA IF NOT EXISTS ${schemaName};

    -- 2. Creamos la tabla Users dentro de ese esquema
    CREATE TABLE IF NOT EXISTS ${schemaName}.users (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        rol VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
    );

    -- 3. Creamos la tabla Products dentro de ese esquema
    CREATE TABLE IF NOT EXISTS ${schemaName}.products (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10, 2) NOT NULL,
        stock INT DEFAULT 0
    );

    -- 4. Creamos la tabla Sells dentro de ese esquema
    CREATE TABLE IF NOT EXISTS ${schemaName}.sells (
        id SERIAL PRIMARY KEY,
        total DECIMAL(10, 2) NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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