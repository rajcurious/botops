const { runQuery, allQuery } = require('./helper');

const sqlite3 = require('sqlite3').verbose();

// Repository interface
class SqliteChannelRepository  {

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
                    console.log('Connected to SQLite database, setting up notification schema');
                    this.db.run(
                        `CREATE TABLE IF NOT EXISTS notification (
                            id INTEGER PRIMARY KEY,
                            receiver_id INTEGER,
                            type TEXT, 
                            message TEXT,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
                        `CREATE INDEX IF NOT EXISTS idx_notification_receiver_id ON notification(receiver_id);`,
                        (err) => {
                            if (err) reject(err.message);
                            else resolve();
                        }
                    );
                }
            });
        });
    }

    async create(id, receiver_id, type, message = ""){
        const query = `
        INSERT INTO notification (id, receiver_id, type, message)
        VALUES (?, ?, ?, ?);
    `;
        return runQuery(this.db, query, [id, receiver_id, type,  message]);
    }

    async search(searchFields) {
        const fields = Object.keys(searchFields);
        const values = Object.values(searchFields);
        const searchClause= fields.map((field) => `${field} = ?`).join(' AND ');
        let query = `SELECT * from notification`;
        if(fields.length > 0 ){
            query += ' where ';
            query += searchClause;
        }
        query += ' order by created_at DESC'
        return allQuery(this.db, query, values);
    }

    async updateNotification(id, updateFields = {}) {

        const fields = Object.keys(updateFields);
        const values = Object.values(updateFields);

        const setClause = fields.map((field) => `${field} = ?`).join(', ');
        const query = `
            UPDATE notification
            SET ${setClause}, edited_at = CURRENT_TIMESTAMP
            WHERE id = ?;
        `;

        return runQuery(this.db, query, [...values, id]);

    }

}
module.exports = SqliteChannelRepository