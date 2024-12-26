
// Service using UserRepository
const dotenv = require("dotenv");
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.dev';
dotenv.config({ path: envFile });
const UniqueIDGenerator = require("../utils/uniqueIdentity");
const { getOne } = require("../utils/helper");

const randomFourDigit = () => Math.floor(Math.random() * 9999);
const removeSpaces = (str) => str.replace(/\s+/g, '');

const get_user_name = (name) => (removeSpaces(name).toLowerCase()+ randomFourDigit())


class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
        this.userIdGenerator = new UniqueIDGenerator(process.env.STAGE == 'dev');
    }

    async createUserFromGoogleProfile(profile_json) {
        if(!profile_json?.email){
            throw Error("Email id not found, email id is must to create anew user")
        } 
        const email = profile_json.email
        const exitingUser = getOne(await this.searchUser({email}));
        if(exitingUser) {
            // user already exists no need to create a new usr
            return exitingUser;
        }
        if(!profile_json?.name) {
            throw Error("name is not found, name is must to create a new user")
        }
        let user_name = get_user_name(profile_json?.name)
        let is_old_user = getOne(this.searchUser({user_name}));
        while(is_old_user) {
            user_name = get_user_name(profile_json?.name)
            is_old_user = getOne(this.searchUser({user_name}));
        }

        const user_id = this.userIdGenerator.generateID().toString();
    
        const user = {
            id : user_id,
            user_name : user_name,
            email: profile_json?.email,
            email_verified : profile_json?.email_verified ? 1 : 0,
            name: profile_json?.name,
            given_name : profile_json?.given_name,
            family_name : profile_json?.family_name,
            pfp_url : profile_json?.picture,
            provider: 'google',
            provider_user_id : profile_json?.sub
        }
        console.log("Creating new user...")
        await this.userRepository.create(user);
        return getOne(await this.searchUser({id: user_id}));
    }

    async create({ id, email, password = null, name, given_name, family_name, user_name = null, pfp_url = null, about = "", provider, provider_user_id, bot = 0, email_verified}) {
        const query = `
            INSERT INTO user (id, email, password, name, given_name, family_name, user_name, pfp_url, about, provider, provider_user_id, bot,  email_verified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        return runQuery(this.db, query, [id, email, password, name, given_name, family_name, user_name, pfp_url, about, provider, provider_user_id, bot,  email_verified]);
    }

    async createBot(user) {

        let user_name = get_user_name(user?.name)
        let is_old_user = getOne(await this.searchUser({user_name}));
        while(is_old_user) {
            user_name = get_user_name(user?.name)
            is_old_user = getOne(await this.searchUser({user_name}));
        }
        const user_id = this.userIdGenerator.generateID().toString();
        user.id = user_id;
        user.user_name = user_name;

        console.log("Creating bot ser...")
        await this.userRepository.create(user);
        return {
            id : user_id
        }
    }

    async searchUser(searchParams) {
        return await this.userRepository.searchUser(searchParams);
    }

    async getUserByIds(user_ids) {
        return await this.userRepository.findByIds(user_ids)
    }


    async updateUser({id, fields}) {
        return await this.userRepository.update(id, fields);
    }

    async deleteUser(id) {
        return await this.userRepository.delete(id);
    }

    async subscribeUserToChannel(user_id, channel_id) {
        const is_exist = await  this.userRepository.searchChannelSubscription({user_id, channel_id})?.length > 0
        if(is_exist){
            return {}
        }
        return await this.userRepository.createChannelSubscription(user_id, channel_id)
    }



    async updateChannelSubscription({id, fields}) {
        if(!id) {
            throw Error("Field id is missing, id  is must to update a channel subscription") 
        }
        return await this.userRepository.updateChannelSubscription(id, fields);
    }

    async searchChannelSubscription(searchParams){
        return await this.userRepository.searchChannelSubscription(searchParams)
    }

    async getChannelsSubscribedBy(user_id) {
        console.log("getChannelsSubscribedBy", user_id)
        if(!user_id) {
            throw Error("Field user_id  is null, id  is must be not null to get channel subscriptions") 
        }
        return await this.userRepository.searchChannelSubscription({user_id})
    }

    async getFriends(user_id) {
        return await this.userRepository.getFriends(user_id);
    }


}


module.exports = UserService;
