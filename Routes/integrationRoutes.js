const express =  require('express');
const { getCalendarEvents } = require('../controllers/googleServicesController');
const Router = express.Router()

Router.get("/google/calendar/events", getCalendarEvents);
module.exports =  Router
