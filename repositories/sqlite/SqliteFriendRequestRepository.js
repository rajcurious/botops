const { allQuery, runQuery} = require('./helper');

const sqlite3 = require('sqlite3').verbose();

// Repository interface
class SqliteFriendRequestRepository  {

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
                    console.log('Connected to SQLite database : Setting up Friend request schema');
                    this.db.run(
                        `CREATE TABLE IF NOT EXISTS friend_requests (
                            id INTEGER PRIMARY KEY,
                            status TEXT, 
                            receiver_id INTEGER,
                            sender_id INTEGER,
                            edited_at DATETIME,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        );`,
                        (err) => {
                            if (err) reject(err.message);
                            else resolve();
                        }
                    );
                    this.db.run(
                        `CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver_id ON friend_requests(receiver_id);`,
                        (err) => {
                            if (err) reject(err.message);
                            else resolve();
                        }
                    );
                }
            });
        });
    }

    async create({id, receiver_id, sender_id}){
        const query = `
        INSERT INTO friend_requests (id, receiver_id, sender_id, status)
        VALUES (?, ?, ?, ?);
    `;
        return runQuery(this.db, query, [id, receiver_id, sender_id, 'CREATED']);
    }

    async search({id, receiver_id, sender_id, status}) {

        let query = `
        SELECT * FROM friend_requests`;
        const params = []
        const params_clause = []
        if(id) {
            params.push(id)
            params_clause.push('id = ?')
        }
        if(receiver_id) {
            params.push(receiver_id)
            params_clause.push('receiver_id = ?')
        }
        if(sender_id){
            params.push(sender_id)
            params_clause.push('sender_id = ?')
        }
        if(status){
            params.push(status)
            params_clause.push('status = ?')
        }
        if(params.length > 0) {
            query += ' where '
        }

        query += params_clause.join(' AND ')
        query += ' order by created_at DESC'
    
        return allQuery(this.db, query, params);
    }

    async update(id, updateFields) {

        const fields = Object.keys(updateFields);
        const values = Object.values(updateFields);

        const setClause = fields.map((field) => `${field} = ?`).join(', ');
        const query = `
            UPDATE friend_requests
            SET ${setClause}, edited_at = CURRENT_TIMESTAMP
            WHERE id = ?;
        `;

        return runQuery(this.db, query, [...values, id]);

    }

}

module.exports =  SqliteFriendRequestRepository