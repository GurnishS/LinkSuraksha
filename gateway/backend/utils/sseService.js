const clients = new Map();

function addClient(userId, res) {
  clients.set(userId, res);
  console.log(`Client Map: ${JSON.stringify(Array.from(clients.keys()))}`);
  console.log(`Client connected: ${userId}`);
}

function removeClient(userId) {
  clients.delete(userId);
  console.log(`Client disconnected: ${userId}`);
}

function sendNotification(userId, message) {
  const res = clients.get(userId);
  if (res) {
    res.write(`data: ${JSON.stringify({ message })}\n\n`);
  }
  else{
    console.log(`Client Map: ${JSON.stringify(Array.from(clients.keys()))}`);
    console.log(`No client connected for userId: ${userId}`);
  }
}

export { addClient, removeClient, sendNotification };
