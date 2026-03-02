const http = require('http');

const data = JSON.stringify({
    email: 'admin@gmail.com',
    newPassword: 'newPassword123',
    secretWord: 'ciconectado'
});

const options = {
    hostname: 'localhost',
    port: 3333,
    path: '/api/v1/auth/reset-password',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
        console.log(`BODY: ${body}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
