
// Service using UserRepository
const UniqueIDGenerator = require("../utils/uniqueIdentity");

class ChannelService {
    constructor(channelRepository) {
        this.channelRepository = channelRepository;
        this.channelIdGenerator = new UniqueIDGenerator(process.env.STAGE == 'dev');
    }

    async createChannel({admin_id, is_group, name = "", age_restricted = 0, about = "",  bot = 0}) {
        
        const channel_id  = this.channelIdGenerator.generateID().toString();
        if(!admin_id) {
            throw Error("Field admin_id is missing, admin_id  is must to create a channel") 
        } 
        if(is_group === undefined || is_group === null) {
            throw Error("Field is_group is missing, is_group  is must to create a channel") 
        }
        await this.channelRepository.create(channel_id, is_group, {name, admin_id, age_restricted, bot});
        return  {id : channel_id}
    }

    async createAnonymousChannel() {
        const channel_id  = this.channelIdGenerator.generateID().toString();
        await this.channelRepository.create(channel_id, {});
        return  {id : channel_id}
    }


    async getChannelWithIds(channel_ids = []) {
        console.log("getChannelWithIds", channel_ids)

        return await this.channelRepository.findByIds(channel_ids);
    }


    async updateChannel(update_payload) {
        if(!(update_payload?.id)) {
            throw Error("Field id is missing, id is must to update a channel") 
        }
        return await this.channelRepository.update(update_payload.id, update_payload?.fields);
    }


}


module.exports = ChannelService;
