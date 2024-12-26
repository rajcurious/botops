class ChatRoom {
    constructor(roomName) {
      this.roomName = roomName;
      this.users = new Set(); // To store active users
    }
  
    addUser(user_id) {
      this.users.add(user_id);
    }
  
    removeUser(user_id) {
      this.users.delete(user_id);
    }
  
    getUsers() {
      return Array.from(this.users);
    }
  
    broadcast(io, message) {
      io.to(this.roomName).emit('message', message);
      console.log(`Emitting message to room : ${this.roomName}`)
    }
  }
  
  module.exports = ChatRoom;
  