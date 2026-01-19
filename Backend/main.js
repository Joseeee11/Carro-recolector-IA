const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Obtener la IP local del servidor
const IPModule = require('./module/ipLocal');
const ipModule = new IPModule();
const ipLocal = ipModule.getLocalIP();

// Crear servidor Express
const app = express();
const server = http.createServer(app);

// Configuración de Socket.io optimizada para datos binarios (video)
const io = new Server(server, {
    maxHttpBufferSize: 1e7, // Soporta hasta 10MB por mensaje
    cors: { origin: "*" }
});

// Servimos el frontend del teléfono
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('Teléfono conectado. ID:', socket.id);

    // Recibimos el frame binario del teléfono
    socket.on('video-frame', (buffer) => {
        // 'buffer' contiene los bytes de la imagen JPEG procesada
        // Aquí es donde en el siguiente paso inyectaremos a Python
        socket.broadcast.volatile.emit('monitor-frame', buffer);

        console.log(`Frame recibido: ${(buffer.length / 1024).toFixed(2)} KB`);
    });

    socket.on('disconnect', () => {
        console.log('Teléfono desconectado');
    });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`
    =========================================
    Servidor iniciado en el puerto ${PORT}
    Accede desde tu teléfono: ${ipLocal}:${PORT}
    =========================================
    `);
});