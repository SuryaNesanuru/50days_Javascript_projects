// Minimal Express + WebSocket relay server (starter)
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
app.use(express.static('.'));

wss.on('connection', ws => {
  ws.on('message', msg => {
    // Broadcast to all other clients
    wss.clients.forEach(c => { if(c !== ws && c.readyState === WebSocket.OPEN) c.send(msg) });
  });
});

const port = process.env.PORT || 3000;
server.listen(port, ()=> console.log('Server running on http://localhost:'+port));
