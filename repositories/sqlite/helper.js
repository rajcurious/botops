
 // Helper to run a single query (INSERT, UPDATE, DELETE)
function runQuery(db, query, params = []) {
    console.log("Query: ", query)
    console.log("Params ",  params)
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) {
                reject(err.message);
            } else {
                resolve({id : this.lastId});
            }
        });
    });
}

 // Helper to fetch multiple rows (SELECT)
function allQuery(db, query, params = []) {
    console.log("Query: ", query)
    params = params.map((param)=>param.toString())
    console.log("Params ",  params)
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err.message);
            } else {
                resolve(rows);
            }
        });
    });
}

// Close the database connection
function closeConnection(db) {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) reject(`Error closing database: ${err.message}`);
                else resolve('Database connection closed');
            });
        } else {
            resolve('No database connection to close');
        }
    });
}

module.exports = {runQuery, allQuery, closeConnection};