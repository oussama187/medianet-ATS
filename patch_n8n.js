const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('C:/Users/oussama/.n8n/database.sqlite');
db.serialize(() => {
    db.each("SELECT nodes FROM workflow_entity WHERE id = '1cwDoS3Lp0LRxgW2'", (err, row) => {
        if (err) { console.error(err); return; }
        let nodes = JSON.parse(row.nodes);
        const emailNode = nodes.find(n => n.name === 'Send Email');
        if (emailNode) {
            emailNode.parameters.toEmail = "={{ $('Webhook').first().json.body.candidate.email }}";
            emailNode.parameters.subject = "=Update on your application for: {{ $('Webhook').first().json.body.job_title }}";
            emailNode.parameters.html = emailNode.parameters.html
                .replace(/\{\{ \$json\.body\.candidate\.first_name \}\}/g, "{{ $('Webhook').first().json.body.candidate.first_name }}")
                .replace(/\{\{ \$json\.body\.job_title \}\}/g, "{{ $('Webhook').first().json.body.job_title }}")
                .replace(/\{\{ \$json\.body\.new_step \}\}/g, "{{ $('Webhook').first().json.body.new_step }}");
            
            // Also, clean up any previous botched replacements
            emailNode.parameters.html = emailNode.parameters.html.replace(/\$\('Webhook'\)\.item/g, "$('Webhook').first()");
        }
        
        db.run("UPDATE workflow_entity SET nodes = ? WHERE id = '1cwDoS3Lp0LRxgW2'", [JSON.stringify(nodes)], function(err) {
            if (err) { console.error(err); }
            else { console.log("Workflow nodes successfully updated! Rows affected:", this.changes); }
            db.close();
        });
    });
});
