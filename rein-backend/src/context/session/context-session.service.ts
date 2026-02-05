import { Injectable, Logger } from '@nestjs/common';
import Redis, { Redis as RedisType } from 'ioredis';
import { randomUUID } from 'crypto';
import {
  ClarificationSession,
  Message,
  MissingField,
} from '../../common/types/context'; // ← note: you changed to context folder
import { PreprocessedGoal } from '../../preprocessor/types/preprocessor';

@Injectable()
export class ClarificationSessionService {
  private readonly logger = new Logger(ClarificationSessionService.name);
  private readonly redis: RedisType | null = null;
  private readonly inMemoryStore = new Map<string, string>(); // Fallback storage
  private readonly prefix = 'ctx:session:'; // changed prefix to reflect "context" naming
  private readonly ttlSeconds = 3600; // 1 hour
  private isRedisAvailable = false;

  constructor() {
    // Only connect to Redis if configured
    if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
      try {
        this.redis = new Redis({
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT || '6379'),
          username: process.env.REDIS_USERNAME || 'default',
          password: process.env.REDIS_PASSWORD,
          retryStrategy: (times) => {
            if (times > 3) {
              this.logger.warn('Redis unavailable, using in-memory storage');
              this.isRedisAvailable = false;
              return null; // Stop retrying
            }
            return Math.min(times * 50, 2000);
          },
          maxRetriesPerRequest: 3,
          connectTimeout: 5000,
          enableOfflineQueue: false, // Don't queue if offline
          showFriendlyErrorStack: process.env.NODE_ENV === 'development',
          lazyConnect: true, // Don't connect immediately
        });

        this.redis.on('connect', () => {
          this.logger.log('Connected to Redis Cloud');
          this.isRedisAvailable = true;
        });

        this.redis.on('error', (err) => {
          this.isRedisAvailable = false;
          // Only log severe errors, not connection failures
          if ((err as any).code !== 'ECONNREFUSED') {
            this.logger.error('Redis error', err.message);
          }
        });

        this.redis.on('reconnecting', () => {
          this.isRedisAvailable = false;
        });

        // Try to connect but don't fail if it doesn't work
        this.redis.connect().catch(() => {
          this.logger.warn('Redis not available, using in-memory session storage');
          this.isRedisAvailable = false;
        });
      } catch (error) {
        this.logger.warn('Failed to initialize Redis, using in-memory storage');
        this.isRedisAvailable = false;
      }
    } else {
      this.logger.log('Redis not configured, using in-memory session storage');
    }
  }

  async startSession(
    userId: string,
    initialData: {
      originalPrompt: string;
      parsedGoal: PreprocessedGoal;
      missingFields: MissingField[];
    },
  ): Promise<ClarificationSession> {
    const sessionId = randomUUID();

    const session: ClarificationSession = {
      sessionId,
      userId,
      originalPrompt: initialData.originalPrompt,
      parsedGoal: initialData.parsedGoal,
      missingFields: initialData.missingFields,
      history: [],
      roundCount: 0,
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    };

    const key = this.getKey(userId, sessionId);
    
    if (this.redis && this.isRedisAvailable) {
      try {
        await this.redis.set(key, JSON.stringify(session), 'EX', this.ttlSeconds);
      } catch (error) {
        this.logger.warn('Redis set failed, using in-memory storage');
        this.inMemoryStore.set(key, JSON.stringify(session));
      }
    } else {
      this.inMemoryStore.set(key, JSON.stringify(session));
    }

    this.logger.debug(`Started context session ${sessionId} for user ${userId}`);
    return session;
  }

  async getSession(userId: string, sessionId: string): Promise<ClarificationSession | null> {
    const key = this.getKey(userId, sessionId);
    let data: string | null = null;

    if (this.redis && this.isRedisAvailable) {
      try {
        data = await this.redis.get(key);
      } catch (error) {
        this.logger.warn('Redis get failed, checking in-memory storage');
        data = this.inMemoryStore.get(key) || null;
      }
    } else {
      data = this.inMemoryStore.get(key) || null;
    }

    if (!data) {
      this.logger.debug(`Session ${sessionId} not found or expired`);
      return null;
    }

    try {
      return JSON.parse(data) as ClarificationSession;
    } catch (err) {
      this.logger.error(`Failed to parse session ${sessionId}`, err);
      return null;
    }
  }

async updateSession(userId: string, session: ClarificationSession): Promise<void> {
  const key = this.getKey(userId, session.sessionId);
  
  if (this.redis && this.isRedisAvailable) {
    try {
      await this.redis.set(key, JSON.stringify(session), 'EX', this.ttlSeconds);
    } catch (error) {
      this.logger.warn('Redis update failed, using in-memory storage');
      this.inMemoryStore.set(key, JSON.stringify(session));
    }
  } else {
    this.inMemoryStore.set(key, JSON.stringify(session));
  }
  
  this.logger.debug(`Updated session ${session.sessionId} for user ${userId}`);
}

  async deleteSession(userId: string, sessionId: string): Promise<boolean> {
    const key = this.getKey(userId, sessionId);
    
    if (this.redis && this.isRedisAvailable) {
      try {
        const deleted = await this.redis.del(key);
        return deleted === 1;
      } catch (error) {
        this.logger.warn('Redis delete failed, using in-memory storage');
        return this.inMemoryStore.delete(key);
      }
    } else {
      return this.inMemoryStore.delete(key);
    }
  }

  private getKey(userId: string, sessionId: string): string {
    return `${this.prefix}${userId}:${sessionId}`;
  }

  // Optional debug helper
  async getUserSessions(userId: string): Promise<string[]> {
    if (this.redis && this.isRedisAvailable) {
      try {
        const pattern = `${this.prefix}${userId}:*`;
        return await this.redis.keys(pattern);
      } catch (error) {
        this.logger.warn('Redis keys failed, using in-memory storage');
        const pattern = `${this.prefix}${userId}:`;
        return Array.from(this.inMemoryStore.keys()).filter(k => k.startsWith(pattern));
      }
    } else {
      const pattern = `${this.prefix}${userId}:`;
      return Array.from(this.inMemoryStore.keys()).filter(k => k.startsWith(pattern));
    }
  }
}