const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require('uuid');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  /* options */
});

// Objek untuk menyimpan ID pengguna dan soket mereka
const users = {};


//menyimpan rooms yang ada
const rooms ={};


app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html"); // Mengirimkan file HTML untuk halaman utama
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.emit("roomsList", Object.keys(rooms));

  // Event ketika pengguna terputus
  socket.on("disconnect", () => {
    console.log("User disconnected");
    // Menghapus ID pengguna yang terkait dengan soket yang terputus
    delete users[socket.id];
  });

  socket.on("leaveRoom", (room) => {
    socket.leave(room);
    console.log(`User ${users[socket.id]} left room ${room}`);
  });


  socket.on("joinRoom", (room) => {
    // Periksa apakah ruangan ada dalam objek rooms
    if (rooms.hasOwnProperty(room)) {
      socket.join(room); // Bergabung dengan ruangan yang ditentukan

      socket.emit('connectionroom', room);
      console.log(`User ${users[socket.id]} joined room ${room}`);
    } else {
      console.log(`Room ${room} does not exist.`);
    }
  });
  

  // Event ketika pesan dikirim
  socket.on("chatMessage", ({ sender, message, senderId, room }) => {
    // Broadcast the message to users in the same room as the sender
    socket.to(room).emit("chatMessage", { sender, message, senderId,room });

    console.log(senderId);
});

  // Menyimpan ID pengguna yang terkait dengan soket
  socket.on("setUserId", (username) => {

    console.log(username);
    users[socket.id] = username;
  });

  socket.on('createRoom', (roomName) => {
    const roomId = uuidv4(); // Menghasilkan UUID baru
    rooms[roomName] = roomId; // Menyimpan nama ruangan dengan UUID sebagai kunci
    console.log(`Room ${roomName} created with ID ${roomId}.`);
  });
});

httpServer.listen(3000, () => {
  console.log("Server listening on http://localhost:3000");
});
