const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Configuración del servidor
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir el frontend desde la carpeta Front-End
app.use(express.static(path.join(__dirname, 'Front-End')));

// Cola en memoria para almacenar los mensajes
const messageQueue = [];

// Manejo de conexiones de Socket.IO
io.on('connection', (socket) => {
    console.log('Un usuario se conectó:', socket.id);

    // Enviar mensajes previos al cliente
    socket.emit('previousMessages', messageQueue);

    // Escuchar mensajes enviados desde el cliente
    socket.on('sendMessage', (data) => {
        const message = {
            id: Date.now(),
            sender: socket.id,
            content: data,
            timestamp: new Date(),
        };

        // Agregar mensaje a la cola
        messageQueue.push(message);

        // Emitir el mensaje a todos los clientes
        io.emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('Un usuario se desconectó:', socket.id);
    });
});

// Iniciar el servidor
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
