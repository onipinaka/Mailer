/**
 * Test MongoDB Connection
 * Run this to verify your MongoDB connection works before deploying
 * 
 * Usage: node scripts/test-connection.js
 */

const mongoose = require('mongoose');

// Read .env file manually
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

console.log('🔍 Testing MongoDB connection...\n');
console.log('URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));

const opts = {
  bufferCommands: false,
  maxPoolSize: 10,
  minPoolSize: 2,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  family: 4, // Use IPv4
};

mongoose.connect(MONGODB_URI, opts)
  .then(() => {
    console.log('\n✅ MongoDB connected successfully!');
    console.log('\n📊 Connection Details:');
    console.log('- Host:', mongoose.connection.host);
    console.log('- Database:', mongoose.connection.name);
    console.log('- Ready State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');
    
    console.log('\n✨ Your MongoDB is ready for Vercel deployment!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ MongoDB connection failed!\n');
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check your MongoDB Atlas Network Access settings');
    console.error('2. Ensure your IP is whitelisted (or allow 0.0.0.0/0 for Vercel)');
    console.error('3. Verify your username and password are correct');
    console.error('4. Make sure your cluster is not paused\n');
    process.exit(1);
  });
