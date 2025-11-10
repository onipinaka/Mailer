/**
 * Database Initialization Script
 * Run this after first deployment to create indexes and optimize database
 */

import dbConnect from '../lib/db';
import { ensureIndexes, checkDatabaseHealth } from '../lib/db-optimization';

async function initializeDatabase() {
  console.log('🚀 Starting database initialization...\n');

  try {
    // Connect to database
    console.log('📡 Connecting to MongoDB...');
    await dbConnect();
    console.log('✅ Connected successfully\n');

    // Check database health
    console.log('🏥 Checking database health...');
    const health = await checkDatabaseHealth();
    console.log('Status:', health.status);
    console.log('Details:', JSON.stringify(health.details, null, 2));
    console.log('');

    if (health.status === 'unhealthy') {
      console.error('❌ Database is unhealthy. Please check your connection.');
      process.exit(1);
    }

    // Create indexes
    console.log('📇 Creating database indexes...');
    await ensureIndexes();
    console.log('✅ Indexes created successfully\n');

    console.log('🎉 Database initialization complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Verify indexes in MongoDB Atlas');
    console.log('2. Test your application');
    console.log('3. Monitor performance');
    
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

export default initializeDatabase;
