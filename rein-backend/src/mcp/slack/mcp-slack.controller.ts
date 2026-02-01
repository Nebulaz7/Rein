import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { McpSlackService } from './mcp-slack.service';
import type {
  CreateCommitmentDto,
  SendReminderDto,
  CollectResponseDto,
  EscalateDto,
} from '../../anchor/types/anchor.types';

@Controller('anchor')
export class McpSlackController {
  constructor(private readonly slackService: McpSlackService) {}

  // ============================================
  // HEALTH CHECK
  // ============================================

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'anchor-accountability',
      timestamp: new Date().toISOString(),
      mock_mode: process.env.USE_MOCK_MESSAGING === 'true',
      messaging_provider: process.env.USE_MOCK_MESSAGING === 'true' 
        ? 'mock' 
        : 'slack',
    };
  }

  // Test endpoint to verify Slack connection
  @Post('test-slack')
  async testSlack(@Body() body: { channel: string; message?: string; userId: string }) {
    try {
      const message = body.message || 'Test message from Rein backend 🚀';
      
      // Create a test commitment to send reminder
      const testCommitment = await this.slackService.createCommitment({
        userId: body.userId,
        platformUserId: body.userId,
        commitmentText: 'Test commitment for Slack messaging',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        context: 'Slack connection test',
        channelOrDm: body.channel,
      });

      if (!testCommitment.success || !testCommitment.commitmentId) {
        throw new Error('Failed to create commitment');
      }

      // Send a test reminder
      const reminderResult = await this.slackService.sendReminder(testCommitment.commitmentId);
      
      return {
        success: true,
        message: 'Slack test successful',
        commitmentId: testCommitment.commitmentId,
        reminderResult,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Check if user has connected their Slack workspace
  @Get('slack-status/:userId')
  async getSlackStatus(@Param('userId') userId: string) {
    try {
      // This will throw an error if user hasn't connected Slack
      await this.slackService.sendReminder('test-check');
      return { connected: true, userId };
    } catch (error) {
      return { 
        connected: false, 
        userId,
        error: error.message.includes('has not connected') ? 'not_connected' : 'other_error'
      };
    }
  }

  // ============================================
  // COMMITMENT CRUD
  // ============================================

  /**
   * Create a new commitment
   * 
   * POST /anchor/commitments
   * {
   *   "userId": "user_123",
   *   "platformUserId": "U12345ABC",
   *   "commitmentText": "Finish the proposal document",
   *   "deadline": "2026-02-01T17:00:00Z",
   *   "context": "Q1 Sales Goals",
   *   "channelOrDm": "D12345ABC"
   * }
   */
  @Post('commitments')
  async createCommitment(@Body() dto: CreateCommitmentDto) {
    return this.slackService.createCommitment(dto);
  }

  /**
   * Get all commitments (or filter by user)
   * 
   * GET /anchor/commitments
   * GET /anchor/commitments?userId=user_123
   */
  @Get('commitments')
  async getAllCommitments(@Query('userId') userId?: string) {
    if (userId) {
      return {
        success: true,
        commitments: await this.slackService.getCommitmentsByUser(userId),
      };
    }
    return {
      success: true,
      commitments: await this.slackService.getAllCommitments(),
    };
  }

  /**
   * Get a specific commitment
   * 
   * GET /anchor/commitments/:id
   */
  @Get('commitments/:id')
  async getCommitment(@Param('id') id: string) {
    const commitment = await this.slackService.getCommitment(id);
    if (!commitment) {
      return { success: false, message: 'Commitment not found' };
    }
    return { success: true, commitment };
  }

  // ============================================
  // REMINDER FLOW
  // ============================================

  /**
   * Send a reminder for a commitment
   * 
   * POST /anchor/reminders/send
   * { "commitmentId": "clxxx123" }
   */
  @Post('reminders/send')
  async sendReminder(@Body() dto: SendReminderDto) {
    return this.slackService.sendReminder(dto.commitmentId);
  }

  /**
   * Collect a response to a reminder
   * 
   * POST /anchor/reminders/respond
   * {
   *   "commitmentId": "clxxx123",
   *   "responseText": "done",
   *   "messageId": "1706712000.123456"
   * }
   */
  @Post('reminders/respond')
  async collectResponse(@Body() dto: CollectResponseDto) {
    return this.slackService.collectResponse(dto);
  }

  /**
   * Check reminder status for a commitment
   * 
   * GET /anchor/reminders/status/:id
   */
  @Get('reminders/status/:id')
  async checkStatus(@Param('id') id: string) {
    return this.slackService.checkReminderStatus(id);
  }

  // ============================================
  // ESCALATION
  // ============================================

  /**
   * Escalate an unresponsive commitment
   * 
   * POST /anchor/escalate
   * {
   *   "commitmentId": "clxxx123",
   *   "reason": "Deadline approaching with no response"
   * }
   */
  @Post('escalate')
  async escalate(@Body() dto: EscalateDto) {
    return this.slackService.escalateUnresponsive(dto.commitmentId, dto.reason);
  }

  // ============================================
  // TEST ENDPOINT
  // ============================================

  /**
   * Test the full flow
   * 
   * POST /anchor/test-flow
   */
  @Post('test-flow')
  async testFlow() {
    // 1. Create a test commitment
    const createResult = await this.slackService.createCommitment({
      userId: 'test_user',
      platformUserId: 'U_TEST_123',
      commitmentText: 'Test commitment - finish the report',
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      context: 'Testing the accountability system',
      channelOrDm: 'test_channel',
    });

    if (!createResult.success || !createResult.commitmentId) {
      return { error: 'Failed to create commitment', details: createResult };
    }

    const commitmentId = createResult.commitmentId;

    // 2. Send a reminder
    const reminderResult = await this.slackService.sendReminder(commitmentId);

    // 3. Simulate user response
    const responseResult = await this.slackService.collectResponse({
      commitmentId,
      responseText: 'working',
      messageId: reminderResult.messageId || 'mock_message_id',
    });

    // 4. Check status
    const statusResult = await this.slackService.checkReminderStatus(
      commitmentId,
    );

    return {
      success: true,
      message: 'Test flow completed!',
      steps: {
        '1_create': createResult,
        '2_reminder': reminderResult,
        '3_response': responseResult,
        '4_status': statusResult,
      },
    };
  }
}