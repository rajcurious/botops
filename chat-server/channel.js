class Channel {
  constructor(channel_id) {
    this.channel_id = channel_id;
    this.sockets = new Map();
  }

  addSocket(socket) {
    if (!this.sockets.has(socket.id)) {
      this.sockets.set(socket.id, socket);
    }
  }

  removeSocket(socket_id) {
    console.log(`removing socket with id = ${socket_id}`);
    // this.sockets.delete(socket_id);
  }

  broadcastMessage(sender_socket_id, message, except_sender = true) {
    if (except_sender) {
      console.log(this.sockets.keys());
      this.sockets.forEach((socket, socket_id) => {
        if (socket_id !== sender_socket_id) {
          socket.emit("message", message);
        }
      });
    } else {
      this.sockets.forEach((socket, socket_id) => {
        socket.emit("message", message);
      });
    }
  }

  broadcastMessageUpdate(sender_socket_id, message, except_sender = true) {
    if (except_sender) {
      this.sockets.forEach((socket, socket_id) => {
        if (socket_id !== sender_socket_id) {
          socket.emit("message-update", message);
        }
      });
    } else {
      this.sockets.forEach((socket, socket_id) => {
        if (socket_id !== sender_socket_id) {
          socket.emit("message-update", message);
        }
      });
    }
  }

  broadcastReaction(reaction) {
    this.sockets.forEach((socket, socket_id) => {
      socket.emit("reaction", reaction);
    });
  }

  call(from, offer, sender_socket_id) {
    this.sockets.forEach((socket, socket_id) => {
      if (socket_id !== sender_socket_id) {
        socket.emit("incoming:call", { channel_id: this.channel_id, offer, from });
        // TODO: think of multi-user call now only 1-1 call i supported. so returning
        return;
      }
    });
  }
  callAccepted(by, ans, sender_socket_id) {
    this.sockets.forEach((socket, socket_id) => {
      if (socket_id !== sender_socket_id) {
        socket.emit("call:accepted", { channel_id: this.channel_id, ans, by });
        // TODO: think of multi-user call now only 1-1 call i supported. so returning
        return;
      }
    });
  }

  callRejected(by, sender_socket_id) {
    this.sockets.forEach((socket, socket_id) => {
      if (socket_id !== sender_socket_id) {
        socket.emit("call:rejected", { channel_id: this.channel_id, by });
        // TODO: think of multi-user call now only 1-1 call i supported. so returning
        return;
      }
    });
  }

  requestPeerNegotiation( offer, sender_socket_id) {
    this.sockets.forEach((socket, socket_id) => {
      if (socket_id !== sender_socket_id) {
        socket.emit("peer:nego:needed", { channel_id: this.channel_id, offer });
        // TODO: think of multi-user call now only 1-1 call i supported. so returning
        return;
      }
    });
  }
  peerNegotiationDone(ans, sender_socket_id) {
    this.sockets.forEach((socket, socket_id) => {
      if (socket_id !== sender_socket_id) {
        socket.emit("peer:nego:final", { channel_id: this.channel_id, ans });
        // TODO: think of multi-user call now only 1-1 call i supported. so returning
        return;
      }
    });
  }

  onStartTyping(by, sender_socket_id) {
    this.sockets.forEach((socket, socket_id) => {
      if (socket_id !== sender_socket_id) {
        socket.emit("typing:started", { channel_id: this.channel_id, by });
        // TODO: think of multi-user call now only 1-1 call i supported. so returning
        return;
      }
    });
  }

  onStopTyping(by, sender_socket_id) {
    this.sockets.forEach((socket, socket_id) => {
      if (socket_id !== sender_socket_id) {
        socket.emit("typing:stopped", { channel_id: this.channel_id, by });
        // TODO: think of multi-user call now only 1-1 call i supported. so returning
        return;
      }
    });
  }




  existsSocketId(socket_id) {
    return this.sockets.has(socket_id);
  }
}

module.exports = Channel;
