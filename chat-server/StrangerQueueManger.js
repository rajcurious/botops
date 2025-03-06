const { Mutex } = require("async-mutex");
const { channelService } = require("../dependencies");
class StrangerQueueManager {
  constructor() {
    this.queue = [];
    this.mutex = new Mutex();
    this.userInfo = {}; //user_id, channel
    this.sessions = {}; // channel_id,  [user_ids]
    this.matchMakingLoop();
   
  }

  async deleteSession(channel_id) {
    await this.mutex.runExclusive(() => {
      if (this.userInfo && this.channels.hasOwnProperty(channel_id)) {
        delete this.channels[channel_id];
      }
    });
  }

  async getChannel(user_id) {
    console.log("CALLING GET CHANNEL....")
    user_id = user_id.toString();
    return await this.mutex.runExclusive(() => {
      if (this.userInfo.hasOwnProperty(user_id)) {
            return this.userInfo[user_id].channel;
      } else {
        return null;
      }
    });
  }

  async joinQueue(userProfile, socket) {
    await this.mutex.runExclusive(() => {
      const user_id =  userProfile.id.toString();
      if(!(user_id in this.userInfo)) {
        this.userInfo[user_id] = {status : 'hanging', channel : null};
      }

      if(this.userInfo[user_id].status === 'queued') {
        this.queue = this.queue.filter((item) => item.user.id !== userProfile.id);
        this.userInfo[user_id].status = 'hanging'
        this.userInfo[user_id].channel = null;
      }

      if(this.userInfo[user_id].status === 'hanging' ) {
        this.queue.push({ socket, user: userProfile });
        this.userInfo[user_id].status = 'queued'
        this.userInfo[user_id].status = null;
      }
      
    });
  }

  async skipChannel(channel_id, user_id) {
    if(!this.sessions[channel_id]) return;
    user_id = user_id.toString();
    const sessionInfo = this.sessions[channel_id];
    for(const connection of sessionInfo) {
      connection.socket.emit("transient:channel:skipped", {channel_id, by : parseInt(user_id)});;
      console.log("Sending skip message to ", connection.user.id)
      this.userInfo[connection.user.id.toString()] = {channel : null, 'status': 'hanging'}
    }
    delete this.sessions[channel_id];

  }


  async removeSocket(socket_id) {
    await this.mutex.runExclusive(() => {
      this.queue = this.queue.filter((item) => item.socket_id !== socket_id);
    });
  }

  async selectAndRemoveTwo() {
    return await this.mutex.runExclusive(() => {
      if (this.queue.length < 2) return null;
      return this.queue.splice(0, 2);
    });
  }

  async matchMakingLoop() {
    while (true) {
      const userPair = await this.selectAndRemoveTwo();

      if (userPair) {
        const channel = await channelService.createAnonymousChannel();
        // tODO: Is this right, or we should change the original output from create channel
        const channel_id = parseInt(channel.id)
        const channel_info_0 = {
            id: channel_id,
            name: userPair[1].user.name,
            pfp_url: userPair[1].pfp_url,
        }
        const user_id_0 = userPair[0].user.id.toString()
        const user_id_1 = userPair[1].user.id.toString()
        this.userInfo[user_id_0].channel = channel_info_0;
        userPair[0].socket.emit("transient:channel:created", channel_info_0);
        this.userInfo[user_id_0].status = 'connected';
        const channel_info_1 = {
            id: channel_id,
            name: userPair[0].user.name,
            pfp_url: userPair[0].user.pfp_url,
        }
        userPair[1].socket.emit("transient:channel:created", channel_info_1);
        this.userInfo[user_id_1].channel = channel_info_1;
        this.userInfo[user_id_1].status = 'connected';
        this.sessions[channel_id] = userPair;
       
      } else {
        await new Promise((resolve) => setTimeout(resolve, 0)); // Yield control and retry
      }
    }
  }
}

module.exports = StrangerQueueManager;
