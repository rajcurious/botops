
const { userService, channelService } = require("../dependencies")


const searchUsers =  async (req, res) => {

    const response = await userService.searchUser(req.query)
    res.status(200).send(response)

}


const getFriends =  async (req, res) => {
    if(!req.query?.id) {
        return res.status(400).send({"message": "field id is must."})
    }
    const response =  await userService.getFriends(req.query?.id)
    res.status(200).send(response)
}

const addUserToGroup  = async (req, res) => {
    if(!req.query?.user_id) {
        return res.status(400).send({"message": "field user_id is must."})
    }
    if(!req.query?.channel_id) {
        return res.status(400).send({"message": "field channel_id is must."})
    }
    
    const response  = await userService.subscribeUserToChannel(req.query.user_id, req.query.channel_id)
    return res.status(200).send(response)
} 

const createGroup =  async (req, res) => {

    const {admin_id, user_ids = [], is_group = 1, name = "", age_restricted = 0, about = "", bot = 0} = req.body
    const channel = await channelService.createChannel({
        admin_id: admin_id, 
        is_group: 1,
        name,
        age_restricted,
        about,
        bot
      });
    
    for(const user_id of user_ids) {
        await userService.subscribeUserToChannel(user_id, channel.id)
    } 
    await userService.subscribeUserToChannel(admin_id, channel.id)
    return  res.status(200).send({
        channel_id : channel.id
    })

}

const createBot =  async (req, res) => {
    const { name, given_name = "", family_name = "", pfp_url = null, about = "", provider = "system"} =  req.body;
    const response = await userService.createBot({name, given_name, family_name, pfp_url, about,  provider, bot : 1})
    return res.status(200).send(response);
}

const getBots =  async (req, res) => {

    const response = await userService.searchUser({bot : 1, is_deleted : 0})
    return res.status(200).send(response);
}

module.exports = {searchUsers, getFriends, createGroup, addUserToGroup, createBot, getBots}