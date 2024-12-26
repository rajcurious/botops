const express =  require('express')
const { addMessage, getMessages, updateMessage, getMessage} = require('../controllers/messageController')
const Router = express.Router()


Router.get('/search', getMessages);
Router.get('/', getMessage);
Router.post('/add', addMessage);
Router.post('/update', updateMessage);
module.exports =  Router

