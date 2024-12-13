//create WedSocket server
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const clients = new Map();

wss.on('connection', (ws, req) => {
  console.log('Client connected');

  // Store the client with a unique ID
  const userId = req.url.split('?buyerId=')[1]; // Example: userId from query params
  clients.set(buyerId, ws);

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    // Handle different message types
    if (data.type === 'chat') {
      const recipientWs = clients.get(data.recipientId);
      if (recipientWs) {
        recipientWs.send(JSON.stringify({ senderId: buyerId, text: data.text }));
      } else {
        ws.send(JSON.stringify({ error: 'Buyer not connected' }));
      }
    }
  });

  ws.on('close', () => {
    clients.delete(userId);
    console.log('Client disconnected');
  });
});

  