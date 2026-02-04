import { Injectable } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import { buildResolutionPrompt } from '../common/utils/index';
import { ParsedResolution } from '../common/types/index';
import { GoalPreprocessorService } from '../preprocessor/goal-preprocessor';
import { ClarificationSession } from '../common/types/context';
import { PreprocessedGoal } from '../preprocessor/types/preprocessor';
import { DateCalculator } from '../common/utils/date-calculator';
import { RoadmapPromptBuilder } from './prompt-builder.service';

export interface ResolutionResponse {
  title: string;
  description: string;
  resolution: ParsedResolution;
  shouldTriggerCalendar: boolean;
  calendarIntentReason?: string;

  githubSyncMetadata?: {
    shouldSyncGitHub: boolean;
    practicalNodeCount: number;
    goalType: string;
    suggestedPlatforms: string[];
  };
}

@Injectable()
export class GeneratorService {
  private ai: GoogleGenAI;
  private promptBuilder: RoadmapPromptBuilder;

  constructor(private readonly goalPreprocessor: GoalPreprocessorService) {
    this.ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });
    this.promptBuilder = new RoadmapPromptBuilder();
  }

  async generateResolution(
    prompt: string, 
    modeType: 'plan' | 'agent',
    sessionData?: ClarificationSession
  ): Promise<ResolutionResponse> {
    // Use enriched data from clarification session if available
    let preprocessed: PreprocessedGoal;
    let conversationContext = '';
    
    if (sessionData) {
      preprocessed = this.buildEnrichedContext(sessionData);
      conversationContext = sessionData.history
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
    } else {
      preprocessed = await this.goalPreprocessor.preprocess(prompt);
    }

    const { goal, known, experienceLevel, timeframe, formatPreference, specificFocus, totalDays } = preprocessed;
    const message = buildResolutionPrompt(goal, known, experienceLevel);

    // ═══════════════════════════════════════════════════════════
    // CALCULATE DATE DISTRIBUTION USING DateCalculator
    // ═══════════════════════════════════════════════════════════
    const dateDistribution = DateCalculator.calculateRoadmapDates(
      timeframe,
      experienceLevel
    );

    console.log('📅 Date Distribution:', {
      totalDays: dateDistribution.totalDays,
      stageCount: dateDistribution.stageCount,
      nodeSpacing: dateDistribution.nodeSpacing,
      stages: dateDistribution.stages.map(s => ({
        stage: s.stageIndex,
        dates: `${s.startDate} → ${s.endDate}`,
        nodeCount: s.nodeDates.length
      }))
    });

    // Define enhanced response schema with dates and more resources
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    resolution: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                scheduledDate: { type: Type.STRING },
                // NEW: Practical node fields
                isPractical: { 
                  type: Type.BOOLEAN,
                  nullable: true,
                },
                practicalType: { 
                  type: Type.STRING,
                  nullable: true,
                },
                githubReady: { 
                  type: Type.BOOLEAN,
                  nullable: true,
                },
                resources: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      title: { type: Type.STRING },
                      link: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ['type', 'title', 'link', 'description'],
                  },
                },
              },
              required: ['id', 'title', 'description', 'scheduledDate', 'resources'],
            },
          },
        },
        required: ['id', 'title', 'description', 'startDate', 'endDate', 'nodes'],
      },
    },
    triggerCalendar: { type: Type.BOOLEAN },
    calendarIntentReason: { 
      type: Type.STRING,
      nullable: true,
    },
  },
  required: ['title', 'resolution', 'triggerCalendar'],
};

    // Build comprehensive prompt using the prompt builder
    const fullPrompt = this.promptBuilder.buildPrompt({
      originalMessage: prompt,
      goal: message,
      preprocessed,
      conversationContext,
      dateDistribution,
    });

    let text = '';
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
          temperature: 0.7,
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      console.log("✅ Using model: gemini-2.5-flash");

      text = response.text ?? '';

      if (!text) {
        throw new Error('Empty response from Gemini');
      }

      const parsed = JSON.parse(text);

      // Validate that dates match our calculated distribution
      this.validateDateConsistency(parsed.resolution, dateDistribution);

      // Clean up the title
      const cleanTitle = this.cleanTitle(parsed.title);

      // Generate a polished description for display
      const description = await this.generateDescription(cleanTitle, parsed.resolution);

      // Extract practical nodes for GitHub sync metadata
      const practicalNodes = parsed.resolution
        .flatMap(stage => stage.nodes)
        .filter(node => node.isPractical === true);

      const githubReadyNodes = practicalNodes.filter(node => node.githubReady === true);

      return {
        title: cleanTitle,
        description,
        resolution: parsed.resolution,
        shouldTriggerCalendar: parsed.triggerCalendar,
        calendarIntentReason: parsed.calendarIntentReason ?? undefined,
        
        // NEW: Add GitHub sync metadata
        githubSyncMetadata: {
          shouldSyncGitHub: githubReadyNodes.length > 0,
          practicalNodeCount: githubReadyNodes.length,
          goalType: preprocessed.goalType ?? 'mixed',
          suggestedPlatforms: preprocessed.suggestedPlatforms ?? [],
        },
      };
    } catch (err: any) {
      console.error('❌ Gemini generation failed:', err.message);
      console.error('Raw output (if any):', err?.response?.text?.());

      // Fallback logic
      try {
        if (text) {
          const fallbackMatch = text.match(/\[[\s\S]*\]/);
          if (fallbackMatch) {
            const resolution = JSON.parse(fallbackMatch[0]);
            return {
              title: 'Learning Roadmap',
              description: 'A structured learning path to help you achieve your goals.',
              resolution,
              shouldTriggerCalendar: false,
            };
          }
        }
      } catch (fallbackErr) {
        // Silent fallback failure
      }

      throw new Error(`Failed to generate or parse resolution: ${err.message}`);
    }
  }

  /**
   * Validate that LLM-generated dates match our calculated distribution
   * Log warnings if there are discrepancies
   */
  private validateDateConsistency(
    resolution: ParsedResolution,
    dateDistribution: any
  ): void {
    if (resolution.length !== dateDistribution.stageCount) {
      console.warn(
        `⚠️ Stage count mismatch: Expected ${dateDistribution.stageCount}, got ${resolution.length}`
      );
    }

    resolution.forEach((stage, idx) => {
      const expectedStage = dateDistribution.stages[idx];
      if (!expectedStage) return;

      if (stage.startDate !== expectedStage.startDate || stage.endDate !== expectedStage.endDate) {
        console.warn(
          `⚠️ Stage ${idx + 1} date mismatch:`,
          `Expected ${expectedStage.startDate} → ${expectedStage.endDate}`,
          `Got ${stage.startDate} → ${stage.endDate}`
        );
      }

      // Validate node dates
      stage.nodes?.forEach((node, nodeIdx) => {
        const expectedDate = expectedStage.nodeDates[nodeIdx];
        if (expectedDate && node.scheduledDate !== expectedDate) {
          console.warn(
            `⚠️ Node ${node.id} date mismatch:`,
            `Expected ${expectedDate}, Got ${node.scheduledDate}`
          );
        }
      });
    });
  }

  /**
   * Clean up title - extract just the goal if it contains structured text
   */
  private cleanTitle(title: string): string {
    if (!title) return 'Learning Goal';
    
    let cleanTitle = title.trim();
    
    // Remove "Here's what I understood:" and similar intro phrases
    cleanTitle = cleanTitle.replace(/^.*?(?:Here's what I understood|Here is what I understood|Understanding)[:\s]*\n*/i, '');
    
    // Extract content after "Goal:" (handles both **Goal:** and Goal:)
    const goalMatch = cleanTitle.match(/\*?\*?Goal:\*?\*?\s*(.+?)(?:\n|$)/is);
    if (goalMatch) {
      cleanTitle = goalMatch[1].trim();
    }
    
    // Only remove markdown formatting, NOT the actual content
    cleanTitle = cleanTitle
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/^[•\-*]\s+/, '') // Remove leading bullet point (single line only)
      .split('\n')[0] // Take only first line
      .trim();

    // If cleaning resulted in something too short or empty, return original
    if (!cleanTitle || cleanTitle.length < 3) {
      return title.trim();
    }

    return cleanTitle;
  }

  /**
   * Generate a polished description for the resolution
   */
  async generateDescription(title: string, roadmap: ParsedResolution): Promise<string> {
    try {
      // Extract key information from roadmap
      const stageCount = roadmap.length;
      const totalNodes = roadmap.reduce((sum, stage) => sum + (stage.nodes?.length || 0), 0);
      const totalResources = roadmap.reduce(
        (sum, stage) => sum + (stage.nodes?.reduce((nodeSum, node) => nodeSum + (node.resources?.length || 0), 0) || 0),
        0
      );
      
      // Calculate timeframe
      const startDate = roadmap[0]?.startDate;
      const endDate = roadmap[roadmap.length - 1]?.endDate;
      let timeframeText = '';
      if (startDate && endDate) {
        timeframeText = DateCalculator.formatDateRange(startDate, endDate);
      }

      const prompt = `You are a motivational coach. Generate a brief, inspiring description (2-3 sentences) for a learning resolution.

Title: ${title}
Stages: ${stageCount}
Total milestones: ${totalNodes}
Total resources: ${totalResources}
Timeframe: ${timeframeText || 'flexible timeline'}

The description should:
- Be encouraging and actionable
- Highlight what the person will achieve
- Mention the structured approach with ${stageCount} stages
- Be concise (50-80 words)
- Not use bullet points
- Be in second person ("You will...")

Generate ONLY the description text, no additional formatting.`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.8,
          maxOutputTokens: 150,
        },
      });

      const rawDescription = response.text?.trim() || this.getFallbackDescription(title, stageCount, timeframeText);
      return this.cleanDescription(rawDescription);
    } catch (error) {
      console.error('Failed to generate description:', error);
      return this.cleanDescription(this.getFallbackDescription(title, roadmap.length, ''));
    }
  }

  /**
   * Clean up description - preserve full content, remove aggressive formatting
   */
  private cleanDescription(description: string): string {
    if (!description) return 'A structured learning path to help you achieve your goals.';
    
    let cleanDesc = description.trim();
    
    // Remove common intro phrases that the LLM might add
    cleanDesc = cleanDesc.replace(/^.*?(?:Here's the description|Here is|Description)[:\s]*\n*/i, '');
    
    // Remove markdown formatting (bold, italic, etc) but keep the content
    cleanDesc = cleanDesc
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/\*/g, '')   // Remove italic markdown
      .replace(/^[•\-*]\s+/gm, '') // Remove bullet points
      .replace(/^#+\s+/gm, '') // Remove markdown headers
      .trim();
    
    // If cleaning resulted in something too short, return a reasonable fallback
    if (!cleanDesc || cleanDesc.length < 20) {
      return description.trim();
    }
    
    return cleanDesc;
  }

  /**
   * Fallback description if LLM fails
   */
  private getFallbackDescription(title: string, stageCount: number, timeframe: string): string {
    const timeText = timeframe ? ` over ${timeframe}` : '';
    return `You'll master ${title.toLowerCase()} through a structured ${stageCount}-stage learning path${timeText}. Each stage builds on the previous one, ensuring you develop strong fundamentals and practical skills to achieve your goals.`;
  }

  /**
   * Build enriched context from clarification session
   * Combines parsedGoal with insights from the conversation
   */
  private buildEnrichedContext(session: ClarificationSession): PreprocessedGoal {
    return {
      goal: session.parsedGoal.goal,
      known: session.parsedGoal.known || [],
      experienceLevel: session.parsedGoal.experienceLevel,
      timeframe: session.parsedGoal.timeframe,
      formatPreference: session.parsedGoal.formatPreference,
      specificFocus: session.parsedGoal.specificFocus,
      totalDays: session.parsedGoal.totalDays,
    };
  }
}