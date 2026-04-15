const mongoose = require('mongoose');

let connected = false;

async function connectDB() {
  if (connected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  connected = true;
  console.log('✅ Connected to Cosmos DB (MongoDB API)');
}

module.exports = { connectDB };
