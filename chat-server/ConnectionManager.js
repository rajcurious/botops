const Channel = require("./channel");

class ConnectionManager {
    constructor() {
      this.channels = new Map(); // Map of roomName -> ChatRoom instance
    }
  
    getOrCreateChannel(channel_id) {
      if (!this.channels.has(channel_id)) {
        console.log("using the same instance to broadcast...",  channel_id)
        this.channels.set(channel_id, new Channel(channel_id));
      }
      return this.channels.get(channel_id);
    }
  
    deleteChannel(channel_id) {
      this.channels.delete(channel_id);
    }

    removeSocket(socket) {
        this.channels.forEach(channel => {
            if(channel.existsSocketId(socket.id)) {
                channel.removeSocket(socket.id)
            }
        })
    }
  }
  
  module.exports = ConnectionManager;
  