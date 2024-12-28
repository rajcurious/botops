const { request } = require("express");
const {
  friendRequestService,
  channelService,
  notificationService,
  userService,
} = require("../dependencies");

const createFriendRequest = async (req, res) => {
  const response = await friendRequestService.createFriendRequest(req.body);
  res.status(200).send(response);
};

const updateFriendRequest = async (req, res) => {
  const { id} = req.body;
  console.log("updateFriendRequest", req.body)
 
  const friendRequest = (await friendRequestService.searchFriendRequest({ id }))[0];
  const sender = getOne(await userService.searchUser({id: friendRequest.sender_id}))
  if(!friendRequest){
    return null;
  }
  if (friendRequest.status === "ACCEPTED") {
    return null;
  }
  const response = await friendRequestService.updateFriendRequest(req.body);
  if (req.body.fields?.status === "ACCEPTED") {
   
    const channel = await channelService.createChannel({
      admin_id: friendRequest?.sender_id,
      is_group: 0,
    });

    // TODO: Improve this api to a single call 
    await userService.subscribeUserToChannel(friendRequest.sender_id, channel.id)
    await userService.subscribeUserToChannel(friendRequest.receiver_id, channel.id)
    const notification = await notificationService.createNotification({
      receiver_id: friendRequest?.sender_id,
      type: "friend_request_update",
      message: `${sender.user_name} has accepted friend request.`,
    });
    res
      .status(200)
      .send({
        friend_request_id: id,
        channel_id: channel.id,
        notification_id: notification.id,
      });
  }
  return null
};

const getFriendRequest =  async (req, res) =>  {
  const response = await friendRequestService.searchFriendRequest(req.query)
  res.status(200).send(response);
};
// const getChannel =  async (req, res) => {

//     const response = await channelService.getChannelWithIds(req.query)
//     res.status(200).send(response)
// }

module.exports = { createFriendRequest, updateFriendRequest, getFriendRequest};
