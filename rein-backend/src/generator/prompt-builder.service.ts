import { PreprocessedGoal } from '../preprocessor/types/preprocessor';
import { RoadmapDateDistribution } from '../common/utils/date-calculator';

export interface PromptContext {
  originalMessage: string;
  goal: string;
  preprocessed: PreprocessedGoal;
  conversationContext?: string;
  dateDistribution: RoadmapDateDistribution;
}

/**
 * Builds comprehensive, context-aware prompts for roadmap generation
 * Separated from GeneratorService for maintainability
 */
export class RoadmapPromptBuilder {
  
  /**
   * Build the main roadmap generation prompt
   */
  buildPrompt(context: PromptContext): string {
    const { originalMessage, goal, preprocessed, conversationContext, dateDistribution } = context;
    const { known, experienceLevel, timeframe, formatPreference, specificFocus } = preprocessed;

    const today = new Date().toISOString().split('T')[0];

    return `
You are an expert roadmap builder and learning specialist with a focus on creating COMPREHENSIVE, DETAILED learning paths.

═══════════════════════════════════════════════════════════════════════════════
TASK: Generate a structured, enterprise-grade learning roadmap with substantial depth
═══════════════════════════════════════════════════════════════════════════════

User's original message: "${originalMessage}"
Roadmap goal: ${goal}

EXTRACTED CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Goal: ${goal}
- Known skills: ${known.join(', ') || 'None specified'}
- Experience level: ${experienceLevel || 'Not specified'}
- Timeframe: ${timeframe || 'No specific timeframe provided'}
- Format preference: ${formatPreference || 'mixed'}
- Specific focus areas: ${specificFocus?.join(', ') || 'None specified'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${conversationContext ? `CLARIFICATION CONVERSATION:\n${conversationContext}\n` : ''}

═══════════════════════════════════════════════════════════════════════════════
📅 CALCULATED DATE DISTRIBUTION (USE THESE EXACT DATES)
═══════════════════════════════════════════════════════════════════════════════
Today's date: ${today}
Total duration: ${dateDistribution.totalDays} days
Stage count: ${dateDistribution.stageCount}
Node spacing: ${this.getSpacingDescription(dateDistribution.nodeSpacing)}

${this.buildDateDistributionGuide(dateDistribution)}

⚠️ CRITICAL: Use these EXACT dates in your output. Do not calculate your own dates.

═══════════════════════════════════════════════════════════════════════════════
📚 ROADMAP STRUCTURE REQUIREMENTS
═══════════════════════════════════════════════════════════════════════════════

${this.buildStructureRequirements(dateDistribution)}

═══════════════════════════════════════════════════════════════════════════════
📖 CONTENT QUALITY STANDARDS
═══════════════════════════════════════════════════════════════════════════════

STAGE DESCRIPTIONS (2-3 sentences each):
✓ Explain WHY this stage matters in the learning journey
✓ Connect to previous stage (for stages 2+)
✓ Set expectations for what user will achieve by the end
✓ Example: "This foundational stage establishes core concepts that every practitioner must master. You'll build mental models that make advanced topics accessible later. By the end, you'll confidently explain key principles to others."

NODE DESCRIPTIONS (4-5 sentences each):
✓ Context: Why this node matters
✓ Prerequisites: What you need to know first (if applicable)
✓ Learning outcomes: Specific skills you'll gain
✓ Connection: How it links to next nodes
✓ Practical application: Real-world relevance
✓ Example: "Understanding React's component lifecycle is crucial for building performant applications. This builds on your JavaScript knowledge of functions and state. You'll learn when components mount, update, and unmount, enabling you to optimize rendering. Mastering this concept prevents common bugs and memory leaks. These patterns appear in every React codebase you'll encounter professionally."

RESOURCE QUALITY (4-5 per node):
${this.buildResourceGuidelines(formatPreference)}

RESOURCE DESCRIPTIONS (2 sentences each):
✓ What the resource covers specifically
✓ Why it's valuable / what makes it stand out
✓ Any specific sections to focus on (timestamps, chapters)
✓ Example: "Comprehensive 45-minute video covering all major React hooks with live coding examples. Pay special attention to the useEffect section at 22:30 where common pitfalls are explained."

═══════════════════════════════════════════════════════════════════════════════
🎯 CALENDAR INTEGRATION DETECTION
═══════════════════════════════════════════════════════════════════════════════

Set triggerCalendar = true ONLY if user explicitly mentions:
- "add to my calendar" / "schedule this"
- "set reminders" / "notify me"
- "deadline" / "calendar events"
- "check-ins" / "daily/weekly reminders"

Examples where triggerCalendar = true:
✓ "Make a 6-week plan with weekly reminders"
✓ "Add this to my calendar with deadlines"

Examples where triggerCalendar = false:
✗ "Give me a roadmap to learn TypeScript"
✗ "How to master backend development"

═══════════════════════════════════════════════════════════════════════════════
✅ OUTPUT FORMAT
═══════════════════════════════════════════════════════════════════════════════

{
  "title": "Concise, descriptive title (4-8 words) capturing the learning goal",
  "resolution": [
    {
      "id": "stage-1",
      "title": "Meaningful stage title",
      "description": "2-3 sentence stage description...",
      "startDate": "${dateDistribution.stages[0]?.startDate}",
      "endDate": "${dateDistribution.stages[0]?.endDate}",
      "nodes": [
        {
          "id": "node-1-1",
          "title": "Specific node title",
          "description": "4-5 sentence detailed description covering context, outcomes, application...",
          "scheduledDate": "${dateDistribution.stages[0]?.nodeDates[0]}",
          "resources": [
            {
              "type": "video" | "article" | "tutorial" | "interactive" | "documentation" | "project",
              "title": "Resource title",
              "link": "https://realistic-url.com/path",
              "description": "2-sentence description explaining what's covered and why it's valuable"
            }
            // ... 4-5 resources total per node
          ]
        }
        // ... more nodes with sequential scheduledDates from the provided list
      ]
    }
    // ... more stages following the date distribution
  ],
  "triggerCalendar": boolean,
  "calendarIntentReason": "Brief explanation if true, null if false"
}

═══════════════════════════════════════════════════════════════════════════════
⚡ FINAL REMINDERS
═══════════════════════════════════════════════════════════════════════════════

1. Use EXACT dates provided above - do not calculate your own
2. ${dateDistribution.stageCount} stages total
3. ${dateDistribution.stages.reduce((sum, s) => sum + s.nodeDates.length, 0)} nodes total
4. 4-5 resources per node (NOT 3!)
5. Deep, educational descriptions (4-5 sentences for nodes)
6. Mix resource types: ${this.getResourceMixGuidance(formatPreference)}
7. Only reputable sources (MDN, official docs, O'Reilly, FreeCodeCamp, etc.)
8. Sequential dates - verify no gaps or overlaps

Generate valid JSON matching the schema. Prioritize DEPTH and QUALITY over speed.
`.trim();
  }

  /**
   * Build date distribution guide with specific dates for each stage/node
   */
  private buildDateDistributionGuide(distribution: RoadmapDateDistribution): string {
    return distribution.stages.map((stage, idx) => {
      const nodesList = stage.nodeDates
        .map((date, nodeIdx) => `  • Node ${nodeIdx + 1}: ${date}`)
        .join('\n');
      
      return `
Stage ${stage.stageIndex}: ${stage.startDate} → ${stage.endDate}
${nodesList}`;
    }).join('\n');
  }

  /**
   * Build structure requirements based on calculated distribution
   */
  private buildStructureRequirements(distribution: RoadmapDateDistribution): string {
    const totalNodes = distribution.stages.reduce((sum, s) => sum + s.nodeDates.length, 0);
    const totalResources = totalNodes * 4.5; // avg 4-5 per node

    return `
REQUIRED STRUCTURE:
├── ${distribution.stageCount} stages (following date distribution above)
├── ${totalNodes} nodes total (distributed across stages as shown)
├── ~${Math.round(totalResources)} resources total (4-5 per node)
└── Each node has a scheduledDate from the provided list

STAGE PROGRESSION:
- Stage 1 (20%): Foundations - broad concepts, definitions, why it matters
- Stage 2 (25%): Core skills - main techniques, tools, frameworks
- Stage 3 (30%): Applied practice - projects, exercises, real scenarios
- Stage 4 (20%): Advanced - optimization, best practices, edge cases
- Stage 5+ (5%): Mastery - portfolio projects, teaching others (if applicable)`;
  }

  /**
   * Build resource guidelines based on format preference
   */
  private buildResourceGuidelines(formatPreference?: string): string {
    const baseGuidelines = `
✓ 4-5 resources per node (NOT 3!)
✓ Diverse types: video, article, tutorial, interactive, documentation, project
✓ Only reputable sources:
  - Technical: MDN, official docs, Microsoft Learn, Google Developers
  - Learning: FreeCodeCamp, Codecademy, Udemy (top-rated), Coursera
  - Video: Traversy Media, Net Ninja, Fireship, Academind
  - Articles: CSS-Tricks, Smashing Magazine, LogRocket, dev.to (curated)
✓ Realistic URLs - proper domain structure
✓ Include at least 1 hands-on/project resource per 3 nodes`;

    if (formatPreference === 'video') {
      return baseGuidelines + '\n✓ PREFERENCE: 60% videos, 20% articles, 20% interactive/projects';
    } else if (formatPreference === 'article') {
      return baseGuidelines + '\n✓ PREFERENCE: 60% articles, 20% videos, 20% documentation/tutorials';
    } else if (formatPreference === 'project') {
      return baseGuidelines + '\n✓ PREFERENCE: 50% hands-on projects/tutorials, 30% articles, 20% videos';
    }
    
    return baseGuidelines + '\n✓ PREFERENCE: Balanced mix - 40% articles, 30% videos, 30% interactive/projects';
  }

  /**
   * Get spacing description for display
   */
  private getSpacingDescription(spacing: number): string {
    if (spacing === 1) return 'Daily tasks';
    if (spacing === 2 || spacing === 3) return `Tasks every ${spacing} days`;
    if (spacing === 7) return 'Weekly tasks';
    if (spacing === 14) return 'Bi-weekly tasks';
    return `Tasks every ${spacing} days`;
  }

  /**
   * Get resource mix guidance based on preference
   */
  private getResourceMixGuidance(formatPreference?: string): string {
    if (formatPreference === 'video') return '60% videos, 40% articles/tutorials';
    if (formatPreference === 'article') return '60% articles, 40% videos/interactive';
    if (formatPreference === 'project') return '50% projects, 50% supporting resources';
    return '40% articles, 30% videos, 30% interactive/projects';
  }
}