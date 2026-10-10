const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('C:/Users/oussama/.n8n/database.sqlite');
db.serialize(() => {
    db.each("SELECT status FROM execution_entity ORDER BY id DESC LIMIT 1", (err, row) => {
        if (err) { console.error(err); return; }
        console.log(`Execution Status: ${row.status}`);
    });
});
db.close();
