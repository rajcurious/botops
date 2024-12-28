
const { userService, messageService, notificationService, channelService, friendRequestService } = require("../dependencies")
const { getOne } = require("../utils/helper")

const startUpData =  async (req, res) => {

    const user = req.user;
    const channel_subscriptions = await userService.getChannelsSubscribedBy(user.id);
    const channel_ids = []
    channel_subscriptions.forEach(subscription => {
        channel_ids.push(subscription.channel_id);
    })
    const channels = await channelService.getChannelWithIds(channel_ids)
    const friendRequests = await friendRequestService.searchFriendRequest({receiver_id: user.id, status: 'CREATED'})
    friendRequests.forEach(async (friendRequest) =>  {
        const sender = getOne(await userService.searchUser({id: friendRequest.sender_id}))
        friendRequest.sender = sender;
    })
    const lastMessages = await messageService.getLastMessages(channel_ids)
    const channelInfo = {}
    channels.forEach(channel => {channelInfo[channel.id] = channel})
    for(const channel of channels) {
        const subscriptions = await userService.searchChannelSubscription({channel_id: channel.id})
        const user_ids =  subscriptions.map((sub)=>sub.user_id)
        const channel_users_list = await userService.getUserByIds(user_ids)
        // should replace with is_group
        if(!channel.is_group) {
            const friend =  (channel_users_list.filter((channel_user)=> channel_user.id !=user.id))[0]
            channelInfo[channel.id].name = friend.name
            channelInfo[channel.id].pfp_url = friend.pfp_url
        }
        // const users_map = {}
        // users_list.forEach(user => users_map[user.id] = user)
        channelInfo[channel.id]['users'] = channel_users_list
    }

    //Assumption: for message in there channel must exist...
    lastMessages.forEach(lastMessage => channelInfo[lastMessage.channel_id]['lastMesssage'] =  lastMessage)

    const bots =  await userService.searchUser({bot: 1})
    response = {
        user : user,
        channels:  Object.values(channelInfo) || [],
        friendRequests:  friendRequests || [],
        bots: bots || []
    }
    // // TASK TO FETCH pfp of all channel users...
    // const response = await userService.searchUser(req.query)

    res.status(200).send(response)

}

module.exports = {startUpData}