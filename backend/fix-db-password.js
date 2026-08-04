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

const fixPasswords = async () => {
    let client;
    try {
        client = await pool.connect();
        
        // Asumiendo que el usuario administrador está en el esquema 'schema_ferreteria' o 'public'
        // Buscaremos en schema_ferreteria
        const schema = 'schema_ferreteria';
        
        // Primero aseguramos que existe el schema
        const checkSchema = await client.query(`
            SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1;
        `, [schema]);

        if (checkSchema.rows.length > 0) {
            await client.query(`SET search_path TO "${schema}";`);
            console.log(`Buscando usuario en el esquema "${schema}"...`);
            
            const res = await client.query(`SELECT id, email, password FROM users WHERE email = $1`, ['administrador1234@gmail.com']);
            
            if (res.rows.length > 0) {
                const user = res.rows[0];
                console.log(`Usuario encontrado: ${user.email}`);
                
                // Si la contraseña no empieza con $2 (que es el formato de bcrypt), la hasheamos
                if (!user.password.startsWith('$2')) {
                    console.log('La contraseña está en texto plano. Encriptando...');
                    const salt = await bcrypt.genSalt(10);
                    const hashed = await bcrypt.hash(user.password, salt);
                    
                    await client.query(`UPDATE users SET password = $1 WHERE id = $2`, [hashed, user.id]);
                    console.log('Contraseña actualizada y encriptada correctamente con bcrypt.');
                } else {
                    console.log('La contraseña ya está encriptada con bcrypt.');
                }
            } else {
                console.log('No se encontró al usuario administrador1234@gmail.com en el esquema ' + schema);
            }
        }
        
    } catch (e) {
        console.error('Error al arreglar la contraseña:', e);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

fixPasswords();
