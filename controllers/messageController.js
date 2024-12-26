
const { messageService, userService } = require("../dependencies")


const getMessages = async (req, res) => {
    const { channel_id, limit=20, message_id=null } = req.query;
    if(channel_id) {
        const messages = await messageService.getMessages(channel_id, limit, message_id)
        const userSet = new Set()
        for (const message of messages){
            const reactions = await messageService.getReactions(message.id)
            console.log(reactions)
            message.reactions =  reactions;
        }
        messages.forEach((message) => userSet
        .add(message.author_id))
        const userIds =  Array.from(userSet)
        const users = await userService.getUserByIds(userIds)
        const userMap = new Map()
        users.forEach(user => {
            userMap.set(user.id, user)
        });
        messages.forEach((message)=> message.author =  userMap.get(message.author_id))
        res.status(200).send({
            last_message_id :  parseInt(message_id),
            messages: messages
        })
    }
    else {
        res.status(400).send({error: "Field channel_id is required."})
    }
}

const updateMessage = async (req, res) =>  {
    const updateRequest =  req.body
    if(!('id' in updateRequest)) {
       return res.status(400).send({error: "Field `id` is required."})
    }
    if(!('fields' in updateRequest)){
        return res.status(400).send({error: "Field `fields` id is required."})
    }
    const response = await messageService.editMessage(updateRequest)
    res.status(200).send(response)
}
const addMessage =  async (req, res) => {

    const message =  req.body
    const response = await messageService.addMessage(message)
    res.status(200).send(response)

}

const getMessage =  async (req, res) => {

    const {id} =req.query
    console.log(id)
    const response = await messageService.getMessageWithId(id)
    console.log(response)
    res.status(200).send(response)

}
module.exports = {getMessages, updateMessage, addMessage, getMessage};