// Service using UserRepository

const dotenv  = require("dotenv");
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.dev';
dotenv.config({ path: envFile });
const UniqueIDGenerator = require("../utils/uniqueIdentity");


function validateFields(object, update_fields) {
    // Get all keys in the object
    const objectKeys = Object.keys(object);

    // Find keys that are not in update_fields
    const invalidKeys = objectKeys.filter(key => !update_fields.includes(key));

    // Throw an error if there are invalid keys
    if (invalidKeys.length > 0) {
        throw new Error(`Invalid fields: ${invalidKeys.join(', ')}`);
    }
}


class MessageService {

    static editable_fields = ['content', 'media_url']

    constructor(messageRepository) {
        this.messageRepository = messageRepository; 

        this.messageIdGenerator = new UniqueIDGenerator(process.env.STAGE == 'dev');
    } 
    

    async addMessage(message) {
        
        const message_id =  this.messageIdGenerator.generateID();
        const messagePayload = {
            id: message_id.toString(),
            channel_id : message?.channel_id,
            content : message?.content, 
            content_type:  message?.content_type,
            media_url : message?.media_url,
            author_id:   message?.author_id,
            client_timestamp : message?.client_timestamp
        };

    
        await this.messageRepository.createMessage(messagePayload);   
        return await this.getMessageWithId(message_id)
    }

    async editMessage(updateRequest) {

        // TODO: should we check if the message is present or not how the handle ins such scenerios.
      
        validateFields(updateRequest?.fields, MessageService.editable_fields)
        await this.messageRepository.updateMessage(updateRequest.id, updateRequest.fields);
        return await this.getMessageWithId(updateRequest.id)
    }

    async getMessages(channel_id, limit=20, message_id =  null) {
        console.log(typeof message_id)
        console.log(message_id)
        return await this.messageRepository.getMessages(channel_id, limit, message_id)
        
    }

    async getLastMessages(channel_ids = []) {
        console.log("getLastMessages", channel_ids)
        return await this.messageRepository.get_last_messages(channel_ids);    }

    async getMessageWithId(id){
        return await this.messageRepository.findById(id)
    }

    async addReaction({user_id, emoji, message_id}){
        return await this.messageRepository.addReaction({user_id, emoji, message_id});
    }


    async removeReaction({user_id, emoji, message_id}){
        await this.messageRepository.deleteReaction({user_id, emoji, message_id});
    }

    async getReactions(message_id) {
       return await this.messageRepository.getReactions(message_id);
    }

    async markMessageRead({user_id, message_id, read_at}) {
        return await this.messageRepository.addReadStatus({user_id, message_id, read_at});
    }

    async getMessageReadStatus(message_id) {
        return await this.messageRepository.getMessageReadStatus(message_id);
     }


}


module.exports = MessageService;