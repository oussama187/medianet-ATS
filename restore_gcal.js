const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const recovered = JSON.parse(fs.readFileSync('recovered_workflow.json', 'utf8'));

// Find Webhook node and update path
recovered.nodes.forEach(n => {
    if (n.type === 'n8n-nodes-base.webhook') {
        n.parameters.path = 'da374d02-f3f9-4f10-b138-80b038295019-v2';
    }
});

const nodesJson = JSON.stringify(recovered.nodes);
const connectionsJson = JSON.stringify(recovered.connections);

const db = new sqlite3.Database('C:/Users/oussama/.n8n/database.sqlite');
db.serialize(() => {
    db.run("UPDATE workflow_entity SET nodes = ?, connections = ? WHERE id = '1cwDoS3Lp0LRxgW2'", [nodesJson, connectionsJson], function(err) {
        if (err) { console.error(err); }
        else { console.log('Successfully updated workflow in DB. Rows affected:', this.changes); }
    });
});
db.close();
