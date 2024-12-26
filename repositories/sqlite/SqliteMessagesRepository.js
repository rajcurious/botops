const MessageRepository = require('../MessageRepository');
const { runQuery, allQuery } = require('./helper');

const sqlite3 = require('sqlite3').verbose();

// Repository interface
class SqliteMessageRepository extends MessageRepository {

    constructor(databaseFile) {
        super()
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
                    console.log('Connected to SQLite database, setting up messsage schema');
                    this.db.run(
                        `CREATE TABLE IF NOT EXISTS messages (
                            id INTEGER PRIMARY KEY,
                            channel_id INTEGER,
                            content TEXT,
                            author_id INTEGER, 
                            content_type TEXT,
                            media_url TEXT,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            client_timestamp  TEXT,
                            edited_at DATETIME,
                            read INTEGER DEFAULT 0,
                            is_deleted INTEGER DEFAULT 0
                        );`,
                        (err) => {
                            if (err) reject(err.message);
                            else resolve();
                        }
                    );
                    this.db.run(
                        `CREATE TABLE IF NOT EXISTS message_read_status (
                            message_id INTEGER,
                            user_id INTEGER,
                            read_at TEXT
                        );`,
                        (err) => {
                            if (err) reject(err.message);
                            else resolve();
                        }
                    );
                    this.db.run(
                        `CREATE INDEX IF NOT EXISTS message_read_status_message_id ON message_read_status(message_id)`
                        ,(err) => {
                            if (err) reject(err.message);
                            else resolve();
                        }
                    )
                    this.db.run(
                        `CREATE TABLE IF NOT EXISTS emojis (
                            message_id INTEGER,
                            user_id INTEGER, 
                            emoji TEXT
                        );`,
                        (err) => {
                            if (err) reject(err.message);
                            else resolve();
                        }
                    );
                    this.db.run(
                        `CREATE INDEX IF NOT EXISTS emojis_user_id ON emojis(user_id)`
                        ,(err) => {
                            if (err) reject(err.message);
                            else resolve();
                        }
                    )
                    this.db.run(
                        `CREATE INDEX IF NOT EXISTS emojis_message_id ON emojis(message_id)`
                        ,(err) => {
                            if (err) reject(err.message);
                            else resolve();
                        }
                    )

                    this.db.run(
                        `CREATE INDEX IF NOT EXISTS emojis_channel_id ON emojis(user_id)`
                        ,(err) => {
                            if (err) reject(err.message);
                            else resolve();
                        }
                    )
                }
            });
        });
    }

    async createMessage({ id, channel_id, content, content_type, media_url, author_id, client_timestamp }) {
        const query = `
            INSERT INTO messages (id, author_id, channel_id, content, content_type, media_url, client_timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;
        return runQuery(this.db, query, [id, author_id, channel_id, content, content_type, media_url, client_timestamp]);
    }

     // Update an existing message
     async updateMessage(id, updatedFields) {
        const fields = Object.keys(updatedFields);
        const values = Object.values(updatedFields);

        const setClause = fields.map((field) => `${field} = ?`).join(', ');
        const query = `
            UPDATE messages
            SET ${setClause}, edited_at = CURRENT_TIMESTAMP
            WHERE id = ?;
        `;

        return runQuery(this.db, query, [...values, id]);
    }

    // Get paginated messages for a channel, starting with the latest
    async getMessages(channel_id, limit = 20, message_id = null) {
        let query = `
            SELECT id, channel_id, author_id, content, content_type, media_url, created_at, client_timestamp,  edited_at
            FROM messages
            WHERE channel_id = ? AND is_deleted = 0
        `;
        const params = [channel_id];

        if (message_id) {
            query += ' AND id < ? ';
            params.push(message_id);
        }

        query += ' ORDER BY id DESC LIMIT ?;';
        params.push(limit);

        return allQuery(this.db, query, params);
    }

    async get_last_messages(channel_ids) {
        let query = "SELECT id, author_id, channel_id,  content, content_type, media_url, MAX(created_at) , edited_at FROM messages WHERE channel_id IN (";

        query += channel_ids.join(",")
        query += ') '
        query += "GROUP BY channel_id;"
        return allQuery(this.db, query, []);    

    }

    async findById(id){
        console.log(id)
        const query = "select id, author_id, channel_id, content, content_type, media_url, created_at, edited_at, client_timestamp from messages where id = ?"
        const res = await allQuery(this.db, query, [BigInt(id)])
        if(res.length > 0) {
            return res[0]
        }   
        else return null
    }

    async deleteAll(){
       return runQuery(this.db, "DELETE FROM messages where 1=1")
    }

    async getAll(){
        return allQuery(this.db, "select * from messages");
     }

    async deleteReaction({user_id, emoji, message_id}) {
        const query = `DELETE FROM emojis where user_id = ? and emoji =  ? and message_id = ? `;
        return runQuery(this.db, query, [user_id, emoji, message_id]);
    }
    async addReaction({user_id, emoji, message_id}) {
        const query = `
            INSERT INTO emojis (user_id, emoji, message_id)
            VALUES (?, ?, ?);
         `;
         return runQuery(this.db, query, [user_id, emoji, message_id]);
    }


    async getReactions(message_id) {
        
        const query = `
            select user_id, message_id, emoji, user_name from emojis e join user u on e.user_id =  u.id where message_id = ?;
          `; 
        return allQuery(this.db, query, [message_id]);
    }

    async addReadStatus({user_id, message_id, read_at}) {
        const query = `
            INSERT INTO message_read_status (user_id, message_id, read_at)
            VALUES (?, ?, ?);
         `;
         return runQuery(this.db, query, [user_id, message_id, read_at]);
    }

    async getMessageReadStatus(message_id) {
        
        const query = `
            select user_id, message_id, read_at from message_read_status where message_id = ?;
          `; 
        return allQuery(this.db, query, [message_id]);
    }
    



}

module.exports =  SqliteMessageRepository;
