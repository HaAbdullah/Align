const mongoose = require('mongoose');

let connectionPromise = null;

async function connectDB() {
  if (connectionPromise) return connectionPromise;
  connectionPromise = mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('✅ Connected to Cosmos DB (MongoDB API)');
  });
  return connectionPromise;
}

module.exports = { connectDB };
