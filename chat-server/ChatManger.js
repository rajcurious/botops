const ChatRoom = require('./ChatRoom');

class ChatManager {
  constructor() {
    this.rooms = new Map(); // Map of roomName -> ChatRoom instance
  }

  getOrCreateRoom(roomName) {
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new ChatRoom(roomName));
    }
    return this.rooms.get(roomName);
  }

  deleteRoom(roomName) {
    this.rooms.delete(roomName);
  }

  getRoomUsers(roomName) {
    const room = this.rooms.get(roomName);
    return room ? room.getUsers() : [];
  }
}

module.exports = ChatManager;
