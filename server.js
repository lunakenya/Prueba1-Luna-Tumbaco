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

// Cola FIFO en memoria para los mensajes
class MessageQueue {
    constructor() {
        this.queue = [];
    }

    enqueue(message) {
        this.queue.push(message); // Agregar mensaje al final de la cola
    }

    dequeue() {
        return this.queue.shift(); // Eliminar y devolver el primer mensaje de la cola
    }

    isEmpty() {
        return this.queue.length === 0;
    }
}

const messageQueue = new MessageQueue();

// Manejo de conexiones de Socket.IO
io.on('connection', (socket) => {
    console.log('Un usuario se conectó:', socket.id);

    // Enviar mensajes previos al cliente
    socket.emit('previousMessages', messageQueue.queue);

    // Escuchar mensajes enviados desde el cliente
    socket.on('sendMessage', (data) => {
        const message = {
            id: Date.now(),
            sender: socket.id,
            content: data,
            timestamp: new Date(),
        };

        // Agregar mensaje a la cola
        messageQueue.enqueue(message);

        // Procesar la cola y emitir mensajes
        processQueue();
    });

    socket.on('disconnect', () => {
        console.log('Un usuario se desconectó:', socket.id);
    });
});

// Procesar la cola de mensajes con FIFO
const processQueue = () => {
    while (!messageQueue.isEmpty()) {
        const message = messageQueue.dequeue(); // Extraer el primer mensaje de la cola
        io.emit('message', message); // Emitir mensaje a todos los clientes
    }
};

// Iniciar el servidor
const PORT = 3000;
ser
ver.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
