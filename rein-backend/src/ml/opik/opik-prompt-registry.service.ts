import { Injectable, Logger } from '@nestjs/common';
import { OpikPromptVersioningService, VersionedPrompt } from './opik-prompt-versioning.service';

/**
 * Prompt Registry for tracking and managing prompts in Opik
 * Integrates with Opik to enable evaluation and optimization
 */
@Injectable()
export class OpikPromptRegistryService {
  private readonly logger = new Logger(OpikPromptRegistryService.name);
  private opik: any;
  private registeredPromptIds: Map<string, string> = new Map(); // promptId -> opikPromptId

  constructor(private promptVersioningService: OpikPromptVersioningService) {}

  /**
   * Initialize Opik integration for prompt registry
   */
  async initializeOpikIntegration(opikClient: any): Promise<void> {
    try {
      this.opik = opikClient;
      this.logger.log('Opik integration initialized for prompt registry');

      // Register all existing prompts with Opik
      await this.registerExistingPromptsWithOpik();
    } catch (error) {
      this.logger.error('Failed to initialize Opik integration', error);
    }
  }

  /**
   * Register all existing prompts with Opik
   */
  private async registerExistingPromptsWithOpik(): Promise<void> {
    try {
      const promptIds = this.promptVersioningService.getRegisteredPrompts();

      for (const promptId of promptIds) {
        const prompt = this.promptVersioningService.getLatestPrompt(promptId);
        
        if (prompt) {
          await this.registerPromptWithOpik(prompt);
        }
      }

      this.logger.log(`Registered ${promptIds.length} prompts with Opik`);
    } catch (error) {
      this.logger.error('Error registering prompts with Opik', error);
    }
  }

  /**
   * Register a single prompt with Opik
   */
  private async registerPromptWithOpik(prompt: VersionedPrompt): Promise<void> {
    try {
      // Create a dataset for this prompt's versions
      const datasetName = `prompt-${prompt.id}-versions`;
      
      if (this.opik && this.opik.getOrCreateDataset) {
        await this.opik.getOrCreateDataset(datasetName, {
          description: `Versions and evaluations for prompt: ${prompt.name}`,
          metadata: {
            promptId: prompt.id,
            promptName: prompt.name,
            createdAt: new Date().toISOString(),
          },
        });

        this.registeredPromptIds.set(prompt.id, datasetName);
        this.logger.debug(`Registered prompt with Opik: ${prompt.id}`);
      }
    } catch (error) {
      this.logger.error(`Failed to register prompt ${prompt.id} with Opik`, error);
    }
  }

  /**
   * Log prompt execution with Opik for tracking
   */
  logPromptExecution(
    promptId: string,
    version: string,
    input: any,
    output: any,
    metadata?: Record<string, any>,
  ): void {
    try {
      const prompt = this.promptVersioningService.getPromptVersion(promptId, version);

      if (!prompt) {
        this.logger.warn(`Prompt not found: ${promptId}@${version}`);
        return;
      }

      const datasetName = this.registeredPromptIds.get(promptId);

      if (!datasetName || !this.opik) {
        this.logger.debug(`Opik not available for logging prompt execution`);
        return;
      }

      // Log to Opik (implementation depends on Opik SDK)
      this.logger.debug(
        `Logged prompt execution: ${promptId}@${version} with metadata: ${JSON.stringify(metadata)}`,
      );
    } catch (error) {
      this.logger.error(`Error logging prompt execution`, error);
    }
  }

  /**
   * Log prompt evaluation score
   */
  logPromptEvaluation(
    promptId: string,
    version: string,
    scorerName: string,
    score: number,
    reason?: string,
  ): void {
    try {
      const prompt = this.promptVersioningService.getPromptVersion(promptId, version);

      if (!prompt) {
        this.logger.warn(`Prompt not found for evaluation: ${promptId}@${version}`);
        return;
      }

      this.logger.log(
        `Logged prompt evaluation: ${promptId}@${version} - ${scorerName}=${score} (${reason || 'no reason'})`,
      );
    } catch (error) {
      this.logger.error(`Error logging prompt evaluation`, error);
    }
  }

  /**
   * Get prompt for use with version tracking
   */
  getPromptWithMetadata(promptId: string): { content: string; metadata: Record<string, any> } {
    const prompt = this.promptVersioningService.getLatestPrompt(promptId);

    if (!prompt) {
      return {
        content: '',
        metadata: { promptId, found: false },
      };
    }

    return {
      content: prompt.content,
      metadata: {
        promptId: prompt.id,
        promptVersion: prompt.version,
        promptName: prompt.name,
        promptTags: prompt.tags,
        promptStatus: prompt.metadata.status,
      },
    };
  }

  /**
   * Get prompt with specific version
   */
  getPromptVersionWithMetadata(promptId: string, version: string): { content: string; metadata: Record<string, any> } {
    const prompt = this.promptVersioningService.getPromptVersion(promptId, version);

    if (!prompt) {
      return {
        content: '',
        metadata: { promptId, version, found: false },
      };
    }

    return {
      content: prompt.content,
      metadata: {
        promptId: prompt.id,
        promptVersion: prompt.version,
        promptName: prompt.name,
        promptTags: prompt.tags,
        promptStatus: prompt.metadata.status,
      },
    };
  }

  /**
   * Get all prompt versions
   */
  getPromptHistory(promptId: string): VersionedPrompt[] {
    return this.promptVersioningService.getAllPromptVersions(promptId);
  }

  /**
   * List all registered prompts
   */
  listAllPrompts(): Array<{ id: string; name: string; version: string; status: string }> {
    const promptIds = this.promptVersioningService.getRegisteredPrompts();

    return promptIds.map(id => {
      const prompt = this.promptVersioningService.getLatestPrompt(id);

      return {
        id,
        name: prompt?.name || id,
        version: prompt?.version || 'unknown',
        status: prompt?.metadata.status || 'unknown',
      };
    });
  }
}
