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
  private readonly redis: RedisType;
  private readonly prefix = 'ctx:session:'; // changed prefix to reflect "context" naming
  private readonly ttlSeconds = 3600; // 1 hour

  constructor() {
    // Production-ready Redis Cloud connection
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT || '6379'),
      username: process.env.REDIS_USERNAME || 'default',
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => Math.min(times * 50, 2000), // backoff
      maxRetriesPerRequest: 5,
      connectTimeout: 10000,
      enableOfflineQueue: true, // queue commands while reconnecting
      showFriendlyErrorStack: process.env.NODE_ENV !== 'development',
    });

    this.redis.on('connect', () => {
      this.logger.log('Connected to Redis Cloud');
    });

    this.redis.on('error', (err) => {
      this.logger.error('Redis connection error', err);
    });

    this.redis.on('reconnecting', (delay) => {
      this.logger.warn(`Redis reconnecting in ${delay}ms`);
    });
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
    await this.redis.set(key, JSON.stringify(session), 'EX', this.ttlSeconds);

    this.logger.debug(`Started context session ${sessionId} for user ${userId}`);
    return session;
  }

  async getSession(userId: string, sessionId: string): Promise<ClarificationSession | null> {
    const key = this.getKey(userId, sessionId);
    const data = await this.redis.get(key);

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
  await this.redis.set(key, JSON.stringify(session), 'EX', this.ttlSeconds);
  this.logger.debug(`Updated session ${session.sessionId} for user ${userId}`);
}

  async deleteSession(userId: string, sessionId: string): Promise<boolean> {
    const key = this.getKey(userId, sessionId);
    const deleted = await this.redis.del(key);
    return deleted === 1;
  }

  private getKey(userId: string, sessionId: string): string {
    return `${this.prefix}${userId}:${sessionId}`;
  }

  // Optional debug helper
  async getUserSessions(userId: string): Promise<string[]> {
    const pattern = `${this.prefix}${userId}:*`;
    return this.redis.keys(pattern);
  }
}