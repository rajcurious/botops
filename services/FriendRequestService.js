
// Service using UserRepository
const dotenv = require("dotenv");
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.dev';
dotenv.config({ path: envFile });
const UniqueIDGenerator = require("../utils/uniqueIdentity");

class FriendRequestService {
    constructor(friendRequestRepository) {
        this.friendRequestRepository = friendRequestRepository;
        this.friendRequestIdGenerator = new UniqueIDGenerator(process.env.STAGE == 'dev');
    }

    async createFriendRequest({receiver_id, sender_id}) {
        
        const friend_request_id  = this.friendRequestIdGenerator.generateID().toString();
        if(!receiver_id) {
            throw Error("Field receiver_id is missing, receiver_id  is must to create a friend request") 
        } 
        if(!sender_id) {
            throw Error("Field sender_id is missing, sender_id  is must to create a friend request") 
        }
        await this.friendRequestRepository.create({id: friend_request_id, receiver_id, sender_id});
        return {
            id: friend_request_id
        }
    }

    async searchFriendRequest({id, receiver_id, sender_id, status}) {
        return await this.friendRequestRepository.search({id, receiver_id, sender_id, status});
    }


    async updateFriendRequest(update_payload) {
        if(!(update_payload?.id)) {
            throw Error("Field id is missing, id is must to update a friend request") 
        }
        return await this.friendRequestRepository.update(update_payload.id, update_payload?.fields);
    }


}


module.exports = FriendRequestService;