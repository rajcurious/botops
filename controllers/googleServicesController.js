const { google } = require("googleapis");
const { userService } = require("../dependencies");
const { getOauth2Client } = require("../utils/helper");



// Step 4: API Call
const getCalendarEvents =  async (req, res) => {
    
    const {user_id, order_by = 'startTime', max_results = 10}  = req.query
    if(!user_id) {
        return res.status(400).json({ message: 'query parameter user_id is must' });
    }

    const oauth2Client =  getOauth2Client()
    const tokens = await userService.getAuthTokens(user_id)
    console.log(tokens)
    if (!tokens) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    if(!tokens.access_token) {
       return res.status(401).json({ message: 'Unauthorized' });
    }
    
    oauth2Client.setCredentials({access_token : tokens.access_token, refresh_token : tokens.refresh_token})
  
    try {
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const events = await calendar.events.list({
        calendarId: 'primary',
        maxResults: max_results,
        singleEvents: true,
        orderBy: order_by,
      });
      return res.json(events.data.items);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return res.status(401).json({message : 'Authorization required. Please reauthorize.' });
      } else {
        console.error('Error fetching events:', error);
        return res.status(401).json({message : 'Error fetching calendar events.' });
      }
    }
  };

  module.exports = {getCalendarEvents};