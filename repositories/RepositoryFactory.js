
const SqliteMessageRepository = require('./sqlite/SqliteMessagesRepository');
const SqliteUserRepository = require('./sqlite/SqliteUserRepository');
const SqliteChannelRepository = require('./sqlite/SqliteChannelRepository');
const SqliteFriendRequestRepository = require('./sqlite/SqliteFriendRequestRepository');
const SqliteNotificationRepository = require('./sqlite/SqliteNotificationRepository');


const dotenv =  require('dotenv')

console.log("env variable", process.env.NODE_ENV," " ,  process.env.SQLITE_DB_PATH);
const envFile = process.env.NODE_ENV === 'production' ? '../.env.production' : '../.env.dev';
dotenv.config({ path: envFile });



class RepositoryFactory {

    static getMessageRepository() {
        const dbType = process.env.DB_TYPE || 'sqlite'; // 'mongo' or 'sql'
        if (dbType === 'sqlite') {
            return new SqliteMessageRepository(process.env.SQLITE_DB_PATH);
        }
        throw new Error('Unsupported DB type');
    }

    static getUserRepository() {
        const dbType = process.env.DB_TYPE || 'sqlite'; // 'mongo' or 'sql'
        if (dbType === 'sqlite') {
            return new SqliteUserRepository(process.env.SQLITE_DB_PATH);
        }
        throw new Error('Unsupported DB type');
    }

    static getChannelRepository() {
        const dbType = process.env.DB_TYPE || 'sqlite'; // 'mongo' or 'sql'
        if (dbType === 'sqlite') {
            return new SqliteChannelRepository(process.env.SQLITE_DB_PATH);
        }
        throw new Error('Unsupported DB type');
    }

    static getFriendRequestRepository() {
        const dbType = process.env.DB_TYPE || 'sqlite'; // 'mongo' or 'sql'
        if (dbType === 'sqlite') {
            return new SqliteFriendRequestRepository(process.env.SQLITE_DB_PATH);
        }
        throw new Error('Unsupported DB type');
    }

    static getNotificationRepository() {
        const dbType = process.env.DB_TYPE || 'sqlite'; // 'mongo' or 'sql'
        if (dbType === 'sqlite') {
            return new SqliteNotificationRepository(process.env.SQLITE_DB_PATH);
        }
        throw new Error('Unsupported DB type');
    }

    
}

module.exports = RepositoryFactory;
