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
                    console.log('Connected to SQLite database, setting up channel schema');
                    this.db.run(
                        `CREATE TABLE IF NOT EXISTS channels (
                            id INTEGER PRIMARY KEY,
                            admin_id INTEGER,
                            name TEXT,
                            age_restricted DEFAULT 0 ,
                            about  TEXT,
                            pfp_url  TEXT, 
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            edited_at DATETIME ,
                            bot INTEGER DEFAULT 0 ,
                            is_group INTEGER DEFAULT 0,
                            is_deleted INTEGER DEFAULT 0
                        );`,
                        (err) => {
                            if (err) reject(err.message);
                            else resolve();
                        }
                    );
                }
            });
        });
    }

    async create(id, is_group, {name = "", admin_id = null, age_restricted, about = "", bot = 0, pfp_url = null}){
        const query = `
        INSERT INTO channels (id, name, admin_id, pfp_url,  is_group, age_restricted, about, bot )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;
        return runQuery(this.db, query, [id, name, admin_id, pfp_url, is_group,  age_restricted, about, bot]);
    }

    async findByIds(channel_ids = []) {
        let query = `
        SELECT * from channels where id in (`;
        query += channel_ids.join(",")
        query += ');'
        return allQuery(this.db, query, []);
    }

    async search(search_params){
        // TODO
    }

    async update_channel(id, updateFields) {

        const fields = Object.keys(updateFields);
        const values = Object.values(updateFields);

        const setClause = fields.map((field) => `${field} = ?`).join(', ');
        const query = `
            UPDATE channels
            SET ${setClause}, edited_at = CURRENT_TIMESTAMP
            WHERE id = ?;
        `;

        return runQuery(this.db, query, [...values, id]);

    }
}

module.exports  = SqliteChannelRepository