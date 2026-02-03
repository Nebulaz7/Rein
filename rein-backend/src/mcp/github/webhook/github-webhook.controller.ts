import {
  Controller,
  Post,
  Param,
  Headers,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { GitHubWebhookService } from './github-webhook.service';

@Controller('github/webhook')
export class GitHubWebhookController {
  private readonly logger = new Logger(GitHubWebhookController.name);

  constructor(private readonly webhookService: GitHubWebhookService) {}

  /**
   * Receive GitHub webhook
   * POST /github/webhook/:accountId
   * 
   * GitHub will send webhooks to this endpoint for each connected account
   */
  @Post(':accountId')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('accountId') accountId: string,
    @Headers('x-github-event') event: string,
    @Headers('x-hub-signature-256') signature: string,
    @Body() payload: any,
  ) {
    this.logger.log(`Received ${event} webhook for account ${accountId}`);

    if (!signature) {
      this.logger.warn('No signature provided');
      return { success: false, message: 'No signature provided' };
    }

    try {
      await this.webhookService.processWebhook(accountId, event, signature, payload);

      return {
        success: true,
        message: 'Webhook processed',
      };
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`, error.stack);
      
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Test endpoint to verify webhook is reachable
   * GET /github/webhook/test
   */
  @Post('test')
  @HttpCode(HttpStatus.OK)
  testWebhook() {
    return {
      success: true,
      message: 'Webhook endpoint is active',
      timestamp: new Date().toISOString(),
    };
  }
}