// Repository interface
class MessageRepository {
    async createMessage({ id, channel_id, content, content_type, media_url }) {
        throw new Error("Method not implemented");
    }

    async updateMessage(id, fields){
        throw new Error("Method not implemented");
    }

    async getMessages(channel_id, limit, message_id) {
        throw new Error("Method not implemented");
    }
    async findById(id) {
        throw new Error("Method not implemented");
    }
    async deleteAll(){
        throw new Error("Method not implemented");
    }

}

module.exports = MessageRepository;
