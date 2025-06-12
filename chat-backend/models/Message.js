const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  senderId: { type: String, required: true },
  username: { type: String, required: true } // <-- add this line
});

module.exports = mongoose.model('Message', messageSchema);