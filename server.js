const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname)); 

let players = {};

io.on('connection', (socket) => {
    console.log('Người chơi mới kết nối:', socket.id);

    // Tạo nhân vật và chia phe ngẫu nhiên
    players[socket.id] = {
        x: Math.random() * 800 + 100,
        y: Math.random() * 800 + 100,
        id: socket.id,
        team: Math.random() > 0.5 ? 'fire' : 'ice',
        name: "Player_" + socket.id.substring(0,4)
    };

    // Gửi dữ liệu cho tất cả mọi người
    io.emit('currentPlayers', players);

    // Xử lý di chuyển
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });

    // Xử lý tấn công (Bắn đạn)
    socket.on('shoot', (bulletData) => {
        io.emit('newBullet', {
            x: bulletData.x,
            y: bulletData.y,
            angle: bulletData.angle,
            team: players[socket.id].team
        });
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log('Server Live on port ' + PORT));
