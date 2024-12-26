
const { channelService } = require("../dependencies")

const createChannel =  async (req, res) => {

    const response = await channelService.createChannel(req.body)
    res.status(200).send(response)
}

const updateChannel = async (req, res) => {
    const response = await channelService.updateChannel(req.body)
    res.status(200).send(response)
}

// const getChannel =  async (req, res) => {

//     const response = await channelService.getChannelWithIds(req.query)
//     console.log(response)
//     res.status(200).send(response)
// }

module.exports = {createChannel, updateChannel}