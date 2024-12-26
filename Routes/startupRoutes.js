const express =  require('express')
const { startUpData} = require('../controllers/startUpController')
const Router = express.Router()


Router.get('/data', startUpData);
module.exports =  Router

