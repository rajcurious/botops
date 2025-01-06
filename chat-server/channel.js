class Channel {
    constructor(channel_id) {
      this.channel_id = channel_id;
      this.sockets = new Map()
    }
  
    addSocket(socket) {
      if(!this.sockets.has(socket.id)) {
        this.sockets.set(socket.id, socket)
      }
       
    }
  
    removeSocket(socket_id) {
    
      console.log(`removing socket with id = ${socket_id}`)
      // this.sockets.delete(socket_id);

    }

    broadcastMessage(sender_socket_id, message, except_sender =  true) {
      if(except_sender) {
        console.log(this.sockets.keys())
        this.sockets.forEach((socket, socket_id) => {
          if(socket_id !== sender_socket_id) {
            socket.emit('message', message);
          }
         
        });
          
      }
      else{
        this.sockets.forEach((socket, socket_id) => {
          socket.emit('message', message);
        });
      }

    }

    broadcastMessageUpdate(sender_socket_id, message, except_sender =  true) {

      if(except_sender) {
          this.sockets.forEach((socket, socket_id) => {
            if(socket_id !== sender_socket_id) {
              socket.emit('message-update', message);
            }
          });
      }
      else{
        this.sockets.forEach((socket, socket_id) => {
          if(socket_id !== sender_socket_id) {
            socket.emit('message-update', message);
          }
        });
      }
    }

    broadcastReaction(reaction){
      this.sockets.forEach((socket, socket_id) => {
        socket.emit('reaction', reaction);
      });
     
    }

    existsSocketId(socket_id) {
        return this.sockets.has(socket_id)
    }
  }
  
  module.exports = Channel;
  