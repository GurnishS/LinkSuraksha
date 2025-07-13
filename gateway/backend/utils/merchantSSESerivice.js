const merchants = new Map();

function addMerchant(transactionId, res) {
  merchants.set(transactionId, res);
  console.log(`Merchant Map: ${JSON.stringify(Array.from(merchants.keys()))}`);
  console.log(`Merchant connected: ${transactionId}`);
}

function removeMerchant(transactionId) {
  merchants.delete(transactionId);
  console.log(`Merchant disconnected: ${transactionId}`);
}

function sendMerchantNotification(transactionId, message) {
  const res = merchants.get(transactionId);
  if (res) {
    res.write(`data: ${JSON.stringify({ message })}\n\n`);
  }
  else{
    console.log(`Merchant Map: ${JSON.stringify(Array.from(merchants.keys()))}`);
    console.log(`No Merchant connected for transactionId: ${transactionId}`);
  }
}

export { addMerchant, removeMerchant, sendMerchantNotification };
