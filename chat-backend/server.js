const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const cors = require('cors');
const Message = require('./models/Message');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000' },
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/websocket');

app.use(cors());
app.use(express.json());

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('chat message', async (msg) => {
    // msg: { text, senderId, username }
    const message = new Message({
      text: msg.text,
      senderId: msg.senderId,
      username: msg.username,
    });
    await message.save();

    io.emit('chat message', msg);
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

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
  res.json({ message: 'Login successful', userId: user._id, username: user.username });
});