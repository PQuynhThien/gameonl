const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname)); // Thư mục chứa giao diện

let players = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Tạo nhân vật mới với vị trí ngẫu nhiên và tên tạm thời
    players[socket.id] = {
        x: Math.random() * 700 + 50,
        y: Math.random() * 500 + 50,
        id: socket.id,
        name: "Guest_" + socket.id.substring(0,4)
    };

    io.emit('currentPlayers', players);

    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });

    socket.on('chat', (message) => {
        io.emit('newMessage', { id: socket.id, msg: message });
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

http.listen(3000, () => console.log('Thế giới đã mở tại http://localhost:3000'));

