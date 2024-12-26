const express =  require('express')
const {createFriendRequest, updateFriendRequest, getFriendRequest} = require('../controllers/friendRequestController')
const Router = express.Router()

Router.post('/create', createFriendRequest);
Router.post('/update', updateFriendRequest);
Router.get('/search', getFriendRequest);
module.exports =  Router

