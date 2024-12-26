const express =  require('express')
const {createChannel, updateChannel} = require('../controllers/channelController')
const Router = express.Router()

Router.post('/create', createChannel);
Router.post('/update', updateChannel);
module.exports =  Router

