const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const camaraSocketRoutes = require('./routes/camaraSocket.reutes');

// Crear servidor Express
const app = express();
const server = http.createServer(app);

// Configuración de Socket.io optimizada para datos binarios (video)
const io = new Server(server, {
    maxHttpBufferSize: 1e7, // Soporta hasta 10MB por mensaje
    cors: { origin: "*" }
});


io.on('connection', (socket) => {
    console.log('Teléfono conectado. ID:', socket.id);

    // Recibimos el frame binario del teléfono
    socket.on('video-frame', (buffer) => {
        // 'buffer' contiene los bytes de la imagen JPEG procesada
        // Aquí es donde en el siguiente paso inyectaremos a Python
        socket.broadcast.volatile.emit('monitor-frame', buffer);

        // console.log(`Frame recibido: ${(buffer.length / 1024).toFixed(2)} KB`);
    });

    socket.on('disconnect', () => {
        console.log('Teléfono desconectado');
    });

    socket.volatile.on('ping', (count) => {
        console.log(`Ping recibido #${count}`);
    });
});


// Servimos el frontend del teléfono
app.use(camaraSocketRoutes);



module.exports = server;