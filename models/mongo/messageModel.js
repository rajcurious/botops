const mongoose = require("mongoose");

const messageModel = mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    } 
  },
  {
    timeStamp: true,
  }
);

const chat = mongoose.Model("Message", messageModel);
module.exports = chat;
