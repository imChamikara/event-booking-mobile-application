const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'server', 'eventhub.db'));
const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table'").all();
console.log(JSON.stringify(schema, null, 2));
db.close();
