/**
 * PeerRent server entry point: loads env, connects to MongoDB, starts listening.
 * The Express app itself is built in app.js.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { validateEnv } = require('./config/env');

try {
  validateEnv();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const app = require('./app');
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 PeerRent Server is running on port ${PORT}`);
    console.log(`📱 Access the app at: http://localhost:${PORT}`);
    console.log(`🔐 Admin panel at: http://localhost:${PORT}/admin`);
  });
})();
