import { Injectable, Logger, Inject } from '@nestjs/common';
import { AnchorStorage } from './anchor.storage';
import type { MessagingService } from './messaging.interface';
import {
  CreateCommitmentDto,
  CreateCommitmentResponse,
  CollectResponseDto,
  CollectResponseResponse,
  ReminderStatusResponse,
  EscalateResponse,
  CommitmentStatus,
  ReminderResponseType,
  Commitment,
} from './types/anchor.types';
import { MESSAGING_SERVICE } from './messaging.interface';

/**
 * Anchor Service - Core business logic for accountability system
 * Platform-agnostic: works with any messang service (Slack, Discord, etc.)
 */
@Injectable()
export class AnchorService {
  private readonly logger = new Logger(AnchorService.name);

  constructor(
    private storage: AnchorStorage,
    @Inject(MESSAGING_SERVICE) private messagingService: MessagingService,
  ) {}

  // ============================================
  // COMMITMENT MANAGEMENT
  // ============================================

  async createCommitment(
    dto: CreateCommitmentDto,
  ): Promise<CreateCommitmentResponse> {
    try {
      const commitment = await this.storage.createCommitment(dto);

      this.logger.log(`Created commitment: ${commitment.id}`);
      return {
        success: true,
        commitmentId: commitment.id,
        message: 'Commitment created successfully',
      };
    } catch (error) {
      this.logger.error('Failed to create commitment:', error);
      return {
        success: false,
        message: `Failed to create commitment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async getCommitment(id: string): Promise<Commitment | null> {
    return this.storage.getCommitment(id);
  }

  async getAllCommitments(): Promise<Commitment[]> {
    return this.storage.getAllCommitments();
  }

  async getCommitmentsByUser(userId: string): Promise<Commitment[]> {
    return this.storage.getCommitmentsByUser(userId);
  }

  // ============================================
  // REMINDER FLOW
  // ============================================

async sendReminder(commitmentId: string): Promise<{ success: boolean; messageId: string }> {
  const commitment = await this.storage.getCommitment(commitmentId);
  
  if (!commitment) {
    throw new Error(`Commitment ${commitmentId} not found`);
  }

  const message = `Reminder: ${commitment.commitmentText} (Due: ${commitment.deadline})`;
  
  // Pass userId in richContent so messaging service can look up their token
  const richContent = {
    userId: commitment.userId, // Add this!
    type: 'reminder',
    commitmentText: commitment.commitmentText,
    deadline: commitment.deadline.toISOString(),
    context: commitment.context,
  };

  const messageId = await this.messagingService.sendMessage(
    commitment.channelOrDm,
    message,
    richContent,
  );

  await this.storage.addReminder(commitmentId, messageId);
  
  return { success: true, messageId };
}

  // ============================================
  // RESPONSE HANDLING
  // ============================================

  parseResponse(text: string): {
    type: ReminderResponseType;
    details?: string;
  } {
    const lowerText = text.toLowerCase().trim();

    if (lowerText === 'done' || lowerText.includes('✅')) {
      return { type: ReminderResponseType.DONE };
    }

    if (
      lowerText === 'working' ||
      lowerText.includes('⏳') ||
      lowerText === 'still working'
    ) {
      return { type: ReminderResponseType.WORKING };
    }

    if (lowerText.startsWith('blocked')) {
      const details = text
        .substring('blocked'.length)
        .replace(/^[:\s]+/, '')
        .trim();
      return { type: ReminderResponseType.BLOCKED, details: details || undefined };
    }

    if (lowerText.includes('blocked')) {
      return { type: ReminderResponseType.BLOCKED, details: text };
    }

    return { type: ReminderResponseType.NO_RESPONSE };
  }

  async collectResponse(
    dto: CollectResponseDto,
  ): Promise<CollectResponseResponse> {
    try {
      const commitment = await this.storage.getCommitment(dto.commitmentId);

      if (!commitment) {
        return { success: false, message: 'Commitment not found' };
      }

      // Find the reminder by message ID
      const reminder = await this.storage.findReminderByMessageId(
        dto.messageId,
      );

      if (!reminder) {
        return {
          success: false,
          message: 'Could not find matching reminder for this response',
        };
      }

      // Parse the response
      const parsed = this.parseResponse(dto.responseText);

      // Update commitment status based on response
      let newStatus: CommitmentStatus;
      switch (parsed.type) {
        case ReminderResponseType.DONE:
          newStatus = CommitmentStatus.DONE;
          break;
        case ReminderResponseType.WORKING:
          newStatus = CommitmentStatus.IN_PROGRESS;
          break;
        case ReminderResponseType.BLOCKED:
          newStatus = CommitmentStatus.BLOCKED;
          break;
        default:
          newStatus = commitment.status; // Keep current status
      }

      // Update reminder with response
      await this.storage.updateReminderResponse(
        reminder.id,
        parsed.type,
        dto.responseText,
      );

      // Update commitment status
      await this.storage.updateCommitmentStatus(dto.commitmentId, newStatus);

      this.logger.log(
        `Recorded response for commitment ${dto.commitmentId}: ${parsed.type}`,
      );
      return {
        success: true,
        message: 'Response recorded successfully',
        parsedResponse: parsed.type,
      };
    } catch (error) {
      this.logger.error('Failed to collect response:', error);
      return {
        success: false,
        message: `Failed to collect response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // ============================================
  // STATUS CHECK
  // ============================================

  async checkReminderStatus(
    commitmentId: string,
  ): Promise<ReminderStatusResponse> {
    const commitment = await this.storage.getCommitment(commitmentId);

    if (!commitment) {
      return {
        success: false,
        commitmentId,
        status: CommitmentStatus.PENDING,
        totalReminders: 0,
        respondedReminders: 0,
        pendingReminders: 0,
      };
    }

    const reminders = commitment.reminders || [];
    const totalReminders = reminders.length;
    const respondedReminders = reminders.filter(
      (r) =>
        r.responseType &&
        r.responseType !== ReminderResponseType.NO_RESPONSE,
    ).length;
    const pendingReminders = totalReminders - respondedReminders;

    // Find latest response
    const latestResponded = reminders
      .filter((r) => r.responseAt !== null)
      .sort((a, b) => b.responseAt!.getTime() - a.responseAt!.getTime())[0];

    return {
      success: true,
      commitmentId,
      status: commitment.status,
      totalReminders,
      respondedReminders,
      pendingReminders,
      latestResponse: latestResponded
        ? {
            type: latestResponded.responseType!,
            text: latestResponded.responseText!,
            at: latestResponded.responseAt!,
          }
        : undefined,
    };
  }

  // ============================================
  // ESCALATION
  // ============================================

  async escalateUnresponsive(
    commitmentId: string,
    reason?: string,
  ): Promise<EscalateResponse> {
    try {
      const commitment = await this.storage.getCommitment(commitmentId);

      if (!commitment) {
        return { success: false, message: 'Commitment not found' };
      }

      // Count unanswered reminders
      const unansweredCount =
        commitment.reminders?.filter(
          (r) =>
            !r.responseType ||
            r.responseType === ReminderResponseType.NO_RESPONSE,
        ).length || 0;

      if (unansweredCount === 0) {
        return {
          success: false,
          message: 'All reminders have been responded to. No escalation needed.',
        };
      }

      // Format escalation message
      const userMention = commitment.platformUserId
        ? this.messagingService.formatMention(commitment.platformUserId)
        : commitment.userId;

      const text = `🚨 ESCALATION: ${userMention} has not responded to ${unansweredCount} reminder(s) about: ${commitment.commitmentText}`;

      const richContent = {
        type: 'escalation',
        commitmentText: commitment.commitmentText,
        deadline: commitment.deadline.toISOString(),
        userId: commitment.userId,
        unansweredCount,
      };

      // Send escalation message
      const messageId = await this.messagingService.sendMessage(
        commitment.channelOrDm,
        text,
        richContent,
      );

      // Record escalation
      const escalationReason =
        reason || `No response to ${unansweredCount} reminder(s)`;
      await this.storage.addEscalation(
        commitmentId,
        escalationReason,
        messageId,
      );

      // Update commitment status
      await this.storage.updateCommitmentStatus(
        commitmentId,
        CommitmentStatus.ESCALATED,
      );

      const escalationCount = await this.storage.getEscalationCount(
        commitmentId,
      );

      this.logger.log(`Escalated commitment: ${commitmentId}`);
      return {
        success: true,
        message: 'Escalation sent successfully',
        escalationCount,
      };
    } catch (error) {
      this.logger.error('Failed to escalate:', error);
      return {
        success: false,
        message: `Failed to escalate: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}
