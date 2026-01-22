const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Lưu trữ danh sách người chơi
let players = {};

io.on('connection', (socket) => {
  console.log('Có người kết nối: ' + socket.id);

  // Tạo người chơi mới khi có ai đó vào
  players[socket.id] = {
    x: 300,
    y: 300,
    color: '#' + Math.floor(Math.random()*16777215).toString(16) // Màu ngẫu nhiên
  };

  // Gửi danh sách người chơi hiện tại cho người mới
  io.emit('currentPlayers', players);

  // Xử lý khi người chơi di chuyển
  socket.on('playerMovement', (movementData) => {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    // Gửi vị trí mới cho tất cả mọi người
    socket.broadcast.emit('playerMoved', { id: socket.id, x: players[socket.id].x, y: players[socket.id].y });
  });

  // Xử lý khi ngắt kết nối
  socket.on('disconnect', () => {
    console.log('Người chơi thoát: ' + socket.id);
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});