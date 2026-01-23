const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const camaraSocketRoutes = require("./routes/camaraSocket.reutes");

// Crear servidor Express
const app = express();
const server = http.createServer(app);

// Configuración de Socket.io optimizada para datos binarios (video)
const io = new Server(server, {
  maxHttpBufferSize: 1e7, // Soporta hasta 10MB por mensaje
  cors: { origin: "*" },
  allowEIO3: true,
});

movimiento = { l: 0, r: 0 };

io.on("connection", (socket) => {
  console.log("Teléfono conectado. ID:", socket.id);

  socket.on("sliderSpeed", (data) => {
    // Validar datos recibidos
    if (
      typeof data !== "object" ||
      data === null ||
      typeof data.L !== "number" ||
      typeof data.R !== "number"
    ) {
      console.error("Datos de velocidad inválidos recibidos:", data);
      return;
    }

    // Limitar valores entre 0 y 255
    const leftSpeed = Math.max(-255, Math.min(255, data.L)) * -1;
    const rightSpeed = Math.max(-255, Math.min(255, data.R)) * -1;
    movimiento.l = leftSpeed;
    movimiento.r = rightSpeed;

    console.log(
      `Velocidades recibidas - Izquierda: ${leftSpeed}, Derecha: ${rightSpeed}`,
    );
    io.emit("CarManual", movimiento);
  });
  // Recibimos el frame binario del teléfono
  // 1. Evento para clasificar usuarios
  socket.on("register", (type) => {
    if (type === "monitor") {
      socket.join("sala-monitor"); // El monitor entra aquí
      console.log("Monitor registrado en sala privada");
    }
    // El ESP32 no se une a esta sala, así que estará a salvo
  });

  // 2. Evento de video (MODIFICADO)
  socket.on("video-frame", (data) => {
    // ANTES: socket.broadcast.emit(...)  <-- ESTO MATABA AL ESP32

    // AHORA: Solo enviamos a la sala 'sala-monitor'
    socket.to("sala-monitor").emit("monitor-frame", data);
  });

  socket.on("disconnect", () => {
    console.log("Dispositivo desconectado", socket.id);
  });
});

// Servimos el frontend del teléfono
app.use(camaraSocketRoutes);

module.exports = server;
