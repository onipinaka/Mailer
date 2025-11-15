/**
 * Database Optimization and Scalability Utilities
 * Connection pooling, query optimization, and performance monitoring
 */

import mongoose from 'mongoose';

/**
 * Ensure indexes exist for optimal query performance
 */
export async function ensureIndexes() {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      console.warn('⚠️ Database not connected, skipping index creation');
      return;
    }
    
    // User collection indexes
    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true, name: 'email_unique' },
      { key: { createdAt: -1 }, name: 'created_at' },
      { key: { paidLifetime: 1, email: 1 }, name: 'paid_email' },
    ]);

    // EmailEvent collection indexes (campaign tracking)
    await db.collection('emailevents').createIndexes([
      { key: { userId: 1, campaignId: 1 }, name: 'user_campaign' },
      { key: { campaignId: 1 }, name: 'campaign' },
      { key: { userId: 1, createdAt: -1 }, name: 'user_created' },
      { key: { eventType: 1, createdAt: -1 }, name: 'event_created' },
    ]);

    // RecipientStatus collection indexes
    await db.collection('recipientstatuses').createIndexes([
      { key: { campaignId: 1, status: 1 }, name: 'campaign_status' },
      { key: { userId: 1, createdAt: -1 }, name: 'user_created' },
      { key: { recipientEmail: 1, campaignId: 1 }, unique: true, name: 'email_campaign_unique' },
      { key: { status: 1, createdAt: -1 }, name: 'status_created' },
    ]);

    console.log('✅ Database indexes ensured');
  } catch (error) {
    console.error('❌ Error ensuring indexes:', error);
  }
}

/**
 * Clean up old data for better performance
 */
export async function cleanupOldData() {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Delete old email events (keep last 30 days)
    const eventsResult = await db.collection('emailevents').deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
    });

    // Delete old recipient statuses (keep last 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const recipientsResult = await db.collection('recipientstatuses').deleteMany({
      createdAt: { $lt: ninetyDaysAgo },
    });

    console.log('✅ Cleanup completed:', {
      eventsDeleted: eventsResult.deletedCount,
      recipientsDeleted: recipientsResult.deletedCount,
    });
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
}

/**
 * Database health check
 */
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  details: any;
}> {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return {
        status: 'unhealthy',
        details: { message: 'Database not connected' },
      };
    }
    
    // Check connection state
    if (mongoose.connection.readyState !== 1) {
      return {
        status: 'unhealthy',
        details: { message: 'Database not connected' },
      };
    }

    // Ping database
    const pingResult = await db.admin().ping();
    
    // Get collection stats
    const collections = await db.listCollections().toArray();
    const stats = collections.map(col => ({
      name: col.name,
    }));

    return {
      status: 'healthy',
      details: {
        ping: pingResult,
        collections: stats,
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: { error: String(error) },
    };
  }
}

/**
 * Cached query wrapper
 */
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function cachedQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  ttl: number = CACHE_TTL
): Promise<T> {
  const cached = queryCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data as T;
  }

  const data = await queryFn();
  queryCache.set(cacheKey, { data, timestamp: Date.now() });

  return data;
}

/**
 * Clear query cache
 */
export function clearCache(pattern?: string) {
  if (pattern) {
    for (const key of queryCache.keys()) {
      if (key.includes(pattern)) {
        queryCache.delete(key);
      }
    }
  } else {
    queryCache.clear();
  }
}

/**
 * Transaction wrapper for atomic operations
 */
export async function withTransaction<T>(
  operation: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await operation(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
