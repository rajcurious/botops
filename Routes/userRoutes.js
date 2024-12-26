const express =  require('express')
const {searchUsers, getFriends, createGroup, addUserToGroup, createBot, getBots} = require('../controllers/userController')
const Router = express.Router()


Router.get('/search', searchUsers);
Router.get('/friends', getFriends);
Router.post('/group/create', createGroup);
Router.get('/group/add', addUserToGroup);
Router.post('/bot/create', createBot);
Router.get('/bot/all', getBots);
module.exports =  Router
