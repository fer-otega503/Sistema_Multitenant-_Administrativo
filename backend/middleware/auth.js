const jwt = require('jsonwebtoken');

// Este middleware revisa que el usuario tenga permiso de ver la información y averigua de qué empresa viene
const verificarToken = (req, res, next) => {
    // Los tokens se envían en la cabecera 'Authorization' con el formato: "Bearer AQUI_VA_EL_TOKEN"
    const authHeader = req.headers['authorization'];
    
    // Con este truco cortamos el texto y nos quedamos solo con el código largo del Token
    const token = authHeader && authHeader.split(' ')[1]; 

    // Si el usuario no mandó el token, le paramos el carro de inmediato
    if (!token) {
        return res.status(403).json({ error: 'Acceso denegado. No tienes el token de seguridad.' });
    }

    try {
        // Le pedimos a la librería que revise si el token es real y no ha expirado
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_temporal');
        
        // Si el token es válido, guardamos los datos del usuario dentro del objeto de la petición (req)
        req.usuario = decoded;
        
        // ¡SUPER IMPORTANTE PARA LA TAREA! Guardamos el esquema de su empresa (tenant) en 'req.tenant' 
        // para que las rutas sepan a qué tablas consultar después.
        req.tenant = decoded.tenant; 
        
        next(); // Todo en orden, le damos luz verde para que pase a la ruta que quería ver
    } catch (error) {
        // Si el token fue alterado o ya pasaron las 2 horas, lo rebotamos
        return res.status(401).json({ error: 'Token inválido o vencido. Inicia sesión de nuevo.' });
    }
};

// Este es un middleware extra por si en el futuro quieres que una ruta sea EXCLUSIVA de los jefes (Admin)
const esAdmin = (req, res, next) => {
    // Si el middleware de arriba ya pasó, podemos revisar qué rol tiene guardado
    if (req.usuario && req.usuario.rol === 'Admin') {
        next(); // Es administrador, puede pasar
    } else {
        // Es un empleado común, no tiene permiso para estar aquí
        return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de Administrador.' });
    }
};

// Exportamos las funciones para que el index.js las pueda usar
module.exports = { verificarToken, esAdmin };