const { runQuery, allQuery } = require('./helper');

const sqlite3 = require('sqlite3').verbose();

// Repository interface
class SqliteUserRepository  {

    constructor(databaseFile) {
        this.databaseFile = databaseFile;
        this.db = null;
        this.initialize().catch((error)=> console.log(error))
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.databaseFile, (err) => {
                if (err) {
                    reject(`Failed to connect to the database: ${err.message}`);
                } else {
                    console.log('Connected to SQLite database, setting up  user schema');
                    this.db.run(
                        `CREATE TABLE IF NOT EXISTS user (
                            id INTEGER PRIMARY KEY,
                            email TEXT,
                            password TEXT,
                            name TEXT,
                            given_name TEXT,
                            family_name TEXT,
                            user_name TEXT,
                            pfp_url TEXT,
                            provider TEXT,
                            provider_user_id  TEXT, 
                            about  TEXT,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            edited_at DATETIME,
                            email_verified INTEGER DEFAULT 0,
                            bot INTEGER DEFAULT 0,
                            is_deleted INTEGER DEFAULT 0
                        );`,
                        (err) => {
                            if (err) reject(err.message);
                            else resolve();
                        }
                    );

                    this.db.run(
                        `CREATE TABLE IF NOT EXISTS channel_subscription (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            user_id INTEGER,
                            channel_id INTEGER,
                            muted INTEGER DEFAULT 0,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            edited_at DATETIME,
                            archived INTEGER DEFAULT 0,
                            is_deleted INTEGER DEFAULT 0
                        );`,
                        (err) => {
                            if (err) reject(err.message);
                            else resolve();
                        },
                    );
                    this.db.run(
                        `CREATE INDEX IF NOT EXISTS channel_subscription_user_id_idx ON channel_subscription(user_id)`
                    ,(err) => {
                        if (err) reject(err.message);
                        else resolve();
                    }
                    )
                }
            });
        });
    }

    async createChannelSubscription(user_id, channel_id) {
        const query = `
            INSERT INTO channel_subscription (user_id, channel_id) VALUES (?, ?);
        `;

        return runQuery(this.db, query, [user_id, channel_id]);
    }

    // Update an existing message
    async updateChannelSubscription(id, updatedFields) {
        const fields = Object.keys(updatedFields);
        const values = Object.values(updatedFields);

        const setClause = fields.map((field) => `${field} = ?`).join(', ');
        const query = `
            UPDATE channel_subscription
            SET ${setClause}, edited_at = CURRENT_TIMESTAMP
            WHERE id = ?;
        `;


        return runQuery(this.db, query, [...values, id]);
    }



    async searchChannelSubscription(searchFields) {
        const fields = Object.keys(searchFields);
        const values = Object.values(searchFields);
        const searchClause= fields.map((field) => `${field} = ?`).join(' AND ');
        let query = `SELECT * from channel_subscription`;
        if(fields.length > 0 ){
            query += ' where ';
            query += searchClause;
        }

        query += ' and is_deleted = 0 order by created_at DESC '

        return allQuery(this.db, query, values);
    }
  
    async create({ id, email, password = null, name, given_name, family_name, user_name = null, pfp_url = null, about = "", provider, provider_user_id, bot = 0, email_verified}) {
        const query = `
            INSERT INTO user (id, email, password, name, given_name, family_name, user_name, pfp_url, about, provider, provider_user_id, bot,  email_verified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        return runQuery(this.db, query, [id, email, password, name, given_name, family_name, user_name, pfp_url, about, provider, provider_user_id, bot,  email_verified]);
    }

     // Update an existing message
     async update(id, updatedFields) {
        const fields = Object.keys(updatedFields);
        const values = Object.values(updatedFields);

        const setClause = fields.map((field) => `${field} = ?`).join(', ');
        const query = `
            UPDATE user
            SET ${setClause}, edited_at = CURRENT_TIMESTAMP
            WHERE id = ?;
        `;

        return runQuery(this.db, query, [...values, id]);
    }

    async searchUser(searchFields) {
        const fields = Object.keys(searchFields);
        const values = Object.values(searchFields);
        const searchClause= fields.map((field) => `${field} = ?`).join(' AND ');
        let query = `SELECT * from user`;
        if(fields.length > 0 ){
            query += ' where ';
            query += searchClause;
        }
    
        return allQuery(this.db, query, values);
    }
    
    async getFriends(user_id) {
        const query  =  "select * from user where id in (select user_id from channel_subscription where channel_id in (select channel_id from channel_subscription join channels where user_id = ? and is_group = 0) and user_id != ?)"
        return allQuery(this.db, query, [user_id, user_id])
    }

    async findByIds(user_ids = []) {
        let query = `
        SELECT * from user where id in (`;
        query += user_ids.join(",")
        query += ');'
        return allQuery(this.db, query, []);
    }

    // This is just for debugging and should not be actually used , to delete we should mark the flag off
    async deleteAll(){
       return runQuery(this.db, "DELETE FROM messages where 1=1")
    }

    async getAll(){
        return allQuery(this.db, "select * from messages");
     }
}

module.exports =  SqliteUserRepository;
