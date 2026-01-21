const http = require('./app');

// Obtener la IP local del servidor
const IPModule = require('./utils/ipLocal');
const { log } = require('console');
const ipModule = new IPModule();
const ipLocal = ipModule.getLocalIP();


const PORT = 3000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`
    =========================================
    Servidor iniciado en el puerto ${PORT}
    Accede desde tu teléfono: ${ipLocal}:${PORT}
    =========================================
    `);
});