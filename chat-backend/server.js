const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const cors = require('cors');
const Message = require('./models/Message'); // ✅ Only declared once

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000' }, // frontend URL
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/websocket', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(express.json());

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('chat message', async (msg) => {
    const message = new Message({ text: msg });
    await message.save(); // Save to MongoDB

    io.emit('chat message', msg); // Broadcast to all clients
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// REST API to get messages
app.get('/messages', async (req, res) => {
  const messages = await Message.find();
  res.json(messages);
});

server.listen(5000, () => {
  console.log('Server is running on port 5000');
});
