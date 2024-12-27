const repositoryFactory = require("./repositories/RepositoryFactory");
const MessageService = require("./services/MessageService");
const UserService = require("./services/UserService");
const NotificationService = require("./services/NotificationService");
const FriendRequestService = require("./services/FriendRequestService");
const ChannelService = require("./services/ChannelService");


// const userService = new UserService(repositoryFactory.getUserRepository());

const messageService =  new MessageService(repositoryFactory.getMessageRepository())
const userService = new UserService(repositoryFactory.getUserRepository())
const notificationService =  new NotificationService(repositoryFactory.getNotificationRepository())
const friendRequestService = new FriendRequestService(repositoryFactory.getFriendRequestRepository())
const channelService =  new ChannelService(repositoryFactory.getChannelRepository())



module.exports = {messageService, userService, notificationService, friendRequestService, channelService}