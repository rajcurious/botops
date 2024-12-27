
// Service using UserRepository
const UniqueIDGenerator = require("../utils/uniqueIdentity");

class NotificationService {
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
        this.notificationIdGenerator = new UniqueIDGenerator(process.env.STAGE == 'dev');

    }

    async createNotification({receiver_id, type, message}) {

        const notification_id  = this.notificationIdGenerator.generateID().toString();
        
        if(!receiver_id) {
            throw Error("Field receiver_id is missing, receiver_id  is must to create a notification") 
        } 
        if(!type) {
            throw Error("Field type is missing, type  is must to create a notification") 
        }
        await this.notificationRepository.create(notification_id, receiver_id, type, message);
        return  {id : notification_id}
    }

    async searchNotification(searchParams) {
        return await this.notificationRepository.search(searchParams);
    }


    async updateNotification(update_payload) {
        if(!(update_payload?.id)) {
            throw Error("Field id is missing, id  is must to update a notification") 
        }
        return await this.notificationRepository.update(update_payload.id, update_payload?.fields);
    }
}


module.exports = NotificationService;
