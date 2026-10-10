
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function testApply() {
    // 1. Login to get token
    const loginRes = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: 'super@example.com', password: 'password' })
    });
    const { access_token } = await loginRes.json();
    console.log('Logged in');

    // 2. Submit application
    const form = new FormData();
    form.append('first_name', 'Test');
    form.append('last_name', 'User');
    form.append('email', 'super@example.com');
    form.append('job_listing_id', 1);
    form.append('note', 'Test note');
    
    // Create a dummy text file as CV
    fs.writeFileSync('dummy.pdf', 'Dummy PDF content');
    form.append('cv', fs.createReadStream('dummy.pdf'));

    const applyRes = await fetch('http://127.0.0.1:8000/api/apply', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        },
        body: form
    });

    const result = await applyRes.json();
    console.log('Apply Result:', result);
    
    fs.unlinkSync('dummy.pdf');
}

testApply();
