
const { messageService , userService, friendRequestService, channelService, notificationService} = require('../dependencies');
const { getOne } = require('../utils/helper');
const ChatManager = require('./ChatManger');
const ConnectionManager = require('./ConnectionManager');

const users = new Map(); // { userId: socket }

const chatManager = new ChatManager();
const connectionManager =  new ConnectionManager()

function setupSocket(io) {
  io.on('connection', async (socket) =>  {
    const userId = socket.handshake.query.user_id.toString();

    if(!users.get(userId)) {
      users.set(userId, [])
    }
     // Save the user's socket

    users.get(userId).push(socket);
    console.log('User connected with user_id:', userId, "and socket id: ", socket.id);
    
    // If user is bot already join this bot to the channels so..
    const user = getOne(await userService.searchUser({id: userId}))
    if(user.bot){
       const channelSubsriptions =  await userService.getChannelsSubscribedBy(BigInt(userId))
       console.log(channelSubsriptions);
       channelSubsriptions.forEach((subscription) => {
        const channel = connectionManager.getOrCreateChannel(subscription?.channel_id)
        channel.addSocket(socket);
        console.log(`User id ${userId} joing room  : ${subscription?.channel_id}`)
       })
    }

    socket.on('reconnect', async (attemptNumber) => {

      const index = users.get(userId).findIndex((item) => item.id === socket.id);
      
      if(index !== -1){
        if(!users.get(userId)) {
          users.set(userId, [])
        }
        users.get(userId).push(socket);
      }
     

      console.log('User connected with user_id:', userId, "and socket id: ", socket.id);
      
      // If user is bot already join this bot to the channels so..
      const user = getOne(await userService.searchUser({id: userId}))
      if(user.bot){
         const channelSubsriptions =  await userService.getChannelsSubscribedBy(BigInt(userId))
         console.log(channelSubsriptions);
         channelSubsriptions.forEach((subscription) => {
          const channel = connectionManager.getOrCreateChannel(subscription?.channel_id)
          channel.addSocket(socket);
          console.log(`User id ${userId} joing room  : ${subscription?.channel_id}`)
         })
      }
    });

    socket.on('join-room', ({ user_id, channel_id }) => {
      const chatRoom = chatManager.getOrCreateRoom(channel_id);
      const channel = connectionManager.getOrCreateChannel(channel_id)
      channel.addSocket(socket);
      chatRoom.addUser(user_id);
      socket.join(channel_id);

      console.log(`User id ${user_id} joing room  : ${channel_id}`)

      // Notify users in the room
      // chatRoom.broadcast(io, {channel_id, author: 'System', content: `${username} has joined.`, created_at: get_current_timestamp() });
    //   io.to(room).emit('roomUsers', { room, users: chatRoom.getUsers() });
    });

    socket.on("add-friend", async ({friend_request_id, from_user, to_user}) => {
       console.log('socket-id', socket.id)
       const to_user_id = to_user.id.toString()
      
        if(users.get(to_user_id)) {
          users.get(to_user_id).forEach( target_socket =>  {
            console.log(`Sending friend request with id = ${friend_request_id} to socket with id = `, target_socket.id )
            target_socket.emit('friend-request', {id: friend_request_id, sender : from_user })
          })
        }
    })

    socket.on("friend-request-update", async ({status, payload}) => {
      console.log(status)
      console.log('socket-id', socket.id)
      
      if(status === 'ACCEPTED') {
          const {friend_request_id, channel_id, notification_id} = payload
          const friendRequest = (await friendRequestService.searchFriendRequest({ id: friend_request_id }))[0];
          const channel =(await channelService.getChannelWithIds([channel_id]))[0]
          const subscriptions = await userService.searchChannelSubscription({channel_id: channel.id})
          const user_ids =  subscriptions.map((sub)=>sub.user_id)
          const channel_users_list = await userService.getUserByIds(user_ids)
          // should replace with is_group
          if(!channel.pfp_url) {
              const friend =  (channel_users_list.filter((channel_user)=> channel_user.id !=user.id))[0]
              channelInfo[channel.id].name = friend.name
              channelInfo[channel.id].pfp_url = friend.pfp_url
          }
          channel.users = channel_users_list
          const notification  = (await notificationService.searchNotification({id : notification_id}))[0]
          const sender_id = friendRequest.sender_id.toString()
          const receiver_id = friendRequest.receiver_id.toString()
          if(users.get(sender_id)) {
              users.get(sender_id).forEach( target_socket =>  {
                console.log(`Sending channel update with id = ${channel.id} to socket with id = `, target_socket.id )
                target_socket.emit('add-channel', channel)
              })
          }
          if(users.get(receiver_id)) {
            users.get(receiver_id).forEach( target_socket =>  {
              console.log(`Sending channel update with id = ${channel.id} to socket with id = `, target_socket.id )
              target_socket.emit('add-channel', channel)
            })
         }

        if(users.get(sender_id)) {
          users.get(sender_id).forEach( target_socket =>  {
            console.log(`Sending notification update with id = ${notification.id} to socket with id = `, target_socket.id )
            target_socket.emit('notification', notification)
          })
        }
      
      }
      
      if(status === 'DECLINED')
       
       if(users.get(to_user_id)) {
         users.get(to_user_id).forEach( target_socket =>  {
           console.log(`Sending friend request with id = ${friend_request_id} to socket with id = `, target_socket.id )
           target_socket.emit('friend-request', {friend_request_id, from_user})
         })
       }

   })

   socket.on('create-group-update', async ({channel_id}) => {

     console.log('---------------------')
     console.log('received create group update....')
     console.log('---------------------')
     const channel =  (await channelService.getChannelWithIds([channel_id]))[0]
     const subscriptions = await userService.searchChannelSubscription({channel_id})
     const user_ids =  subscriptions.map((sub)=>sub.user_id)
     const channel_users_list = await userService.getUserByIds(user_ids)
     channel.users = channel_users_list
     user_ids.forEach((user_id)=>{
      user_id = user_id.toString()
       if(users.get(user_id)) {
         users.get(user_id).forEach( target_socket =>  {
           console.log(`Sending channel update with id = ${channel_id} to socket with id = `, target_socket.id )
           target_socket.emit('add-channel', channel)
         })
       }
       else{
        console.log(`user id ${user_id}not found the users socket list`)
       }
     })   
   })

    socket.on('add-bot', async ({channel_id, bot_id}) => {
    
     const socketChannel = connectionManager.getOrCreateChannel(channel_id);
     if(users.get(bot_id)) {
      users.get(bot_id).forEach((socket)=>{
        socketChannel.addSocket(socket);
      })
     }

      const channel =  (await channelService.getChannelWithIds([channel_id]))[0]
      const subscriptions = await userService.searchChannelSubscription({channel_id})
      const user_ids =  subscriptions.map((sub)=>sub.user_id)
      const channel_users_list = await userService.getUserByIds(user_ids)
      channel.users = channel_users_list
      user_ids.forEach((user_id)=>{
        user_id =  user_id.toString()
        if(users.get(user_id)) {
          users.get(user_id).forEach( target_socket =>  {
            console.log(`Sending channel update with id = ${channel_id} to socket with id = `, target_socket.id )
            target_socket.emit('add-channel', channel)
          })
        }
      })   
    })


    socket.on('notification', async (notification) => {
       const author_id = notification?.author_id
       const target_user_name = notification?.target_user_name
       // TODO: logic to store notification using notification sevice...
       const toSocket = users.get(target_user_id); // Get the recipient's socket
       const from_user = getOne(userService.searchUser({userId}))
      //  if(!fr)
       if (toSocket) {
        // Notify the recipient of the invite
        toSocket.emit('receive-invite', { fromUserId: userId, roomName });
      } else {
            socket.emit('error', { message: 'User not available' });
        }
    })

    socket.on('message', async (message, callback) => {
      try{
        const channel_id = parseInt(message?.channel_id)
        const chatRoom = chatManager.getOrCreateRoom(channel_id);
        const channel = connectionManager.getOrCreateChannel(channel_id)
        const msg = await messageService.addMessage(message)
        callback({ status: "acknowledged", message_id: msg.id});
        const author = getOne(await userService.searchUser({id : msg.author_id}))
        msg.author = author
        msg.status = 'acknowledged'
      // chatRoom.broadcast(io, msg);
        channel.broadcastMessage(socket.id, msg);
      }
      catch(err) {
      }
      
    });


    socket.on('edit-message', async (mesage_update) => {

      const {id, channel_id, fields} =  mesage_update;
      if(!id || !fields) {
        return
      }
      const msg = messageService.editMessage(mesage_update)
      // tODO: I think author should be added in the edit message update... what do you think...
      const channel = connectionManager.getOrCreateChannel(channel_id)
      channel.broadcastMessageUpdate(socket.id, msg)
  })

    socket.on('reaction', async (reaction) => {
        const {type, channel_id, message_id, user_id, emoji} =  reaction;
        if(type === 'add') {
             await messageService.addReaction({message_id, user_id, emoji})
        }
        else{
          await messageService.removeReaction({message_id, user_id, emoji})
        }
        const channel = connectionManager.getOrCreateChannel(channel_id)
        channel.broadcastReaction(reaction)
    } )




    socket.on('leaveRoom', ({ user_id, room }) => {
      const chatRoom = chatManager.getOrCreateRoom(room);
      chatRoom.removeUser(user_id);
      socket.leave(room);

      chatRoom.broadcast(io, { username: 'System', text: `${username} has left.` });
      io.to(room).emit('roomUsers', { room, users: chatRoom.getUsers() });

      // Clean up room if empty
      if (chatRoom.getUsers().length === 0) {
        chatManager.deleteRoom(room);
      }
    });

    socket.on('disconnect', () => {
      connectionManager.removeSocket(socket)
      // Find the index of the object to delete
      const index = users.get(userId).findIndex((item) => item.id === socket.id);

      // Delete the element if found
      if (index !== -1) {
        users.get(userId).splice(index, 1);
}
      console.log('User disconnected with id', userId);
      // Handle cleanup if needed
    });
  });
}

module.exports = setupSocket;