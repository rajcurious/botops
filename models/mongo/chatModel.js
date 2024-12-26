const mongoose = require("mongoose");

const chatModel = mongoose.Schema({
  chatName: { type: String },
  guild: { type: Boolean },
  users: [{
     type: mongoose.Schema.Types.ObjectId,
     ref: "User"
     }],
  messages: [{
     type: mongoose.Schema.Types.ObjectId,
     ref: "Message"
  }],
  guildAdmin : {
     type: mongoose.Schema.Types.ObjectId,
     ref: "User"
  },
},{
    timeStamp: true
});

const chat  =  mongoose.Model("Chat", chatModel);
module.exports = chat;
