import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Represents a versioned prompt
 */
export interface VersionedPrompt {
  id: string;
  name: string;
  version: string;
  content: string;
  tags: string[];
  metadata: {
    description: string;
    author?: string;
    createdAt: Date;
    updatedAt: Date;
    status: 'active' | 'archived' | 'experimental';
  };
}

/**
 * Configuration for prompt versioning
 */
export interface PromptVersionConfig {
  basePath: string;
  namespace: string;
  enableRegistration: boolean;
}

/**
 * Service for managing versioned prompts with Opik integration
 * Enables tracking, versioning, and optimization of prompts
 */
@Injectable()
export class OpikPromptVersioningService {
  private readonly logger = new Logger(OpikPromptVersioningService.name);
  private promptRegistry: Map<string, VersionedPrompt[]> = new Map();
  private promptConfig: PromptVersionConfig;

  constructor() {
    this.promptConfig = {
      basePath: process.env.PROMPT_BASE_PATH || 'prompts/versioned',
      namespace: process.env.OPIK_PROJECT_NAME || 'rein-ai',
      enableRegistration: true,
    };
    this.initializeRegistry();
  }

  /**
   * Initialize the prompt registry from filesystem
   */
  private initializeRegistry(): void {
    try {
      const basePath = this.promptConfig.basePath;
      if (fs.existsSync(basePath)) {
        this.scanAndRegisterPrompts(basePath);
        this.logger.log(`Prompt registry initialized with versioned prompts from ${basePath}`);
      } else {
        this.logger.warn(`Prompt base path does not exist: ${basePath}`);
      }
    } catch (error) {
      this.logger.error('Failed to initialize prompt registry', error);
    }
  }

  /**
   * Recursively scan and register prompts from filesystem
   */
  private scanAndRegisterPrompts(basePath: string): void {
    try {
      const items = fs.readdirSync(basePath);
      
      for (const item of items) {
        const itemPath = path.join(basePath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          // Assume directory name is the prompt ID
          this.loadPromptVersions(item, itemPath);
        }
      }
    } catch (error) {
      this.logger.error(`Error scanning prompts directory: ${basePath}`, error);
    }
  }

  /**
   * Load all versions of a specific prompt
   */
  private loadPromptVersions(promptId: string, promptPath: string): void {
    try {
      const files = fs.readdirSync(promptPath);
      const versions: VersionedPrompt[] = [];

      for (const file of files) {
        if (file.endsWith('.txt') || file.endsWith('.md')) {
          const filePath = path.join(promptPath, file);
          const versionedPrompt = this.parsePromptFile(promptId, filePath, file);
          
          if (versionedPrompt) {
            versions.push(versionedPrompt);
          }
        }
      }

      if (versions.length > 0) {
        // Sort by version (newest first)
        versions.sort((a, b) => b.version.localeCompare(a.version));
        this.promptRegistry.set(promptId, versions);
        this.logger.debug(`Registered ${versions.length} versions for prompt: ${promptId}`);
      }
    } catch (error) {
      this.logger.error(`Error loading prompt versions for ${promptId}`, error);
    }
  }

  /**
   * Parse a prompt file and extract metadata
   */
  private parsePromptFile(promptId: string, filePath: string, fileName: string): VersionedPrompt | null {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Extract version from filename (e.g., v1_2026.txt -> 1.2026)
      const versionMatch = fileName.match(/v?([\d_\.]+)\.(txt|md)/);
      const version = versionMatch ? versionMatch[1].replace(/_/g, '.') : '1.0.0';

      // Extract metadata from content header (optional)
      const metadataMatch = content.match(/<!--\s*([\s\S]*?)\s*-->/);
      const metadata = metadataMatch ? JSON.parse(metadataMatch[1]) : {};

      // Strip metadata from content if present
      const cleanContent = content.replace(/<!--[\s\S]*?-->\s*/g, '').trim();

      const stat = fs.statSync(filePath);

      return {
        id: promptId,
        name: promptId.replace(/_/g, ' ').toUpperCase(),
        version,
        content: cleanContent,
        tags: metadata.tags || ['system-prompt'],
        metadata: {
          description: metadata.description || `System prompt for ${promptId}`,
          author: metadata.author,
          createdAt: new Date(stat.birthtime),
          updatedAt: new Date(stat.mtime),
          status: metadata.status || 'active',
        },
      };
    } catch (error) {
      this.logger.error(`Failed to parse prompt file: ${filePath}`, error);
      return null;
    }
  }

  /**
   * Get the latest version of a prompt by ID
   */
  getLatestPrompt(promptId: string): VersionedPrompt | null {
    const versions = this.promptRegistry.get(promptId);
    
    if (!versions || versions.length === 0) {
      this.logger.warn(`No prompts found for ID: ${promptId}`);
      return null;
    }

    return versions[0]; // Already sorted newest first
  }

  /**
   * Get a specific version of a prompt
   */
  getPromptVersion(promptId: string, version: string): VersionedPrompt | null {
    const versions = this.promptRegistry.get(promptId);
    
    if (!versions) {
      return null;
    }

    return versions.find(p => p.version === version) || null;
  }

  /**
   * Get all versions of a prompt
   */
  getAllPromptVersions(promptId: string): VersionedPrompt[] {
    return this.promptRegistry.get(promptId) || [];
  }

  /**
   * Get all registered prompt IDs
   */
  getRegisteredPrompts(): string[] {
    return Array.from(this.promptRegistry.keys());
  }

  /**
   * Register a new prompt version programmatically
   */
  registerPrompt(promptId: string, versionedPrompt: VersionedPrompt): void {
    if (!this.promptConfig.enableRegistration) {
      this.logger.warn('Prompt registration is disabled');
      return;
    }

    const versions = this.promptRegistry.get(promptId) || [];
    versions.push(versionedPrompt);
    versions.sort((a, b) => b.version.localeCompare(a.version));
    this.promptRegistry.set(promptId, versions);

    this.logger.log(`Registered prompt version: ${promptId}@${versionedPrompt.version}`);
  }

  /**
   * Get prompt metadata for Opik logging
   */
  getPromptMetadataForOpik(promptId: string): Record<string, any> {
    const prompt = this.getLatestPrompt(promptId);
    
    if (!prompt) {
      return { promptId, found: false };
    }

    return {
      promptId: prompt.id,
      promptName: prompt.name,
      promptVersion: prompt.version,
      promptTags: prompt.tags,
      promptStatus: prompt.metadata.status,
      promptUpdatedAt: prompt.metadata.updatedAt,
      promptDescription: prompt.metadata.description,
    };
  }

  /**
   * Load prompt from file system (fallback method)
   * Maintains backward compatibility with direct file loading
   */
  loadPromptFromFile(filePath: string): string {
    try {
      const fullPath = path.resolve(filePath);
      
      if (!fs.existsSync(fullPath)) {
        this.logger.warn(`Prompt file not found: ${fullPath}`);
        return '';
      }

      return fs.readFileSync(fullPath, 'utf-8');
    } catch (error) {
      this.logger.error(`Failed to load prompt from file: ${filePath}`, error);
      return '';
    }
  }

  /**
   * Create a new versioned prompt file
   */
  createVersionedPrompt(
    promptId: string,
    content: string,
    version: string,
    metadata?: Partial<VersionedPrompt['metadata']>,
  ): VersionedPrompt {
    const versionedPrompt: VersionedPrompt = {
      id: promptId,
      name: promptId.replace(/_/g, ' ').toUpperCase(),
      version,
      content,
      tags: metadata?.description ? ['system-prompt'] : [],
      metadata: {
        description: metadata?.description || `System prompt for ${promptId}`,
        author: metadata?.author,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: metadata?.status || 'active',
      },
    };

    this.registerPrompt(promptId, versionedPrompt);
    return versionedPrompt;
  }
}
