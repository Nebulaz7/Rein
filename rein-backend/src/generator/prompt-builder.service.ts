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
  const { known, experienceLevel, timeframe, formatPreference, specificFocus, goalType, requiresPractical, practicalGuidance } = preprocessed;

  const today = new Date().toISOString().split('T')[0];

  // NEW: Build practical node instructions based on goal type
  const practicalInstructions = this.buildPracticalNodeInstructions(
    goalType ?? 'mixed',
    requiresPractical ?? false,
    practicalGuidance
  );

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
- Goal type: ${goalType}
- Requires practical: ${requiresPractical}
- Practical guidance: ${practicalGuidance || 'General hands-on practice'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${conversationContext ? `CLARIFICATION CONVERSATION:\n${conversationContext}\n` : ''}

${practicalInstructions}

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

${this.buildStructureRequirements(dateDistribution, requiresPractical ?? false)}

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
          "description": "4-5 sentence detailed description...",
          "scheduledDate": "${dateDistribution.stages[0]?.nodeDates[0]}",
          "isPractical": false,
          "resources": [...]
        },
        // ... more theory nodes ...
        {
          "id": "node-1-practical",
          "title": "Hands-on practical title",
          "description": "4-5 sentence description of what to build/do...",
          "scheduledDate": "${dateDistribution.stages[0]?.nodeDates[dateDistribution.stages[0]?.nodeDates.length - 1]}",
          "isPractical": true,
          "practicalType": "${this.getPracticalType(goalType ?? 'mixed')}",
          "githubReady": ${goalType === 'coding-learning'},
          "resources": [...]
        }
      ]
    }
  ],
  "triggerCalendar": boolean,
  "calendarIntentReason": "Brief explanation if true, null if false"
}

═══════════════════════════════════════════════════════════════════════════════
⚡ FINAL REMINDERS
═══════════════════════════════════════════════════════════════════════════════

1. Use EXACT dates provided above - do not calculate your own
2. ${dateDistribution.stageCount} stages total
3. ${dateDistribution.stages.reduce((sum, s) => sum + s.nodeDates.length, 0)} nodes total${requiresPractical ? ` (includes ${dateDistribution.stageCount} practical nodes)` : ''}
4. 4-5 resources per node (NOT 3!)
5. Deep, educational descriptions (4-5 sentences for nodes)
6. Mix resource types: ${this.getResourceMixGuidance(formatPreference)}
7. Only reputable sources (MDN, official docs, O'Reilly, FreeCodeCamp, etc.)
8. Sequential dates - verify no gaps or overlaps
${requiresPractical ? '9. ONE practical node per stage as the FINAL node in that stage' : ''}

Generate valid JSON matching the schema. Prioritize DEPTH and QUALITY over speed.
`.trim();
}

/**
 * Build practical node instructions based on goal type
 */
private buildPracticalNodeInstructions(
  goalType: string,
  requiresPractical: boolean,
  practicalGuidance?: string
): string {
  if (!requiresPractical) {
    return `
═══════════════════════════════════════════════════════════════════════════════
⚠️ NO PRACTICAL NODES REQUIRED
═══════════════════════════════════════════════════════════════════════════════
This is a pure knowledge/theory goal. Focus on comprehensive learning resources.
All nodes should be educational (theory, concepts, frameworks).
`;
  }

  const baseInstructions = `
═══════════════════════════════════════════════════════════════════════════════
🛠️ PRACTICAL NODE REQUIREMENTS (CRITICAL)
═══════════════════════════════════════════════════════════════════════════════

STRUCTURE:
- Each stage MUST have EXACTLY 1 practical node as its FINAL node
- Theory nodes come first, practical node comes last in each stage
- Practical node should synthesize and apply all concepts from that stage

PRACTICAL NODE SPECIFICATIONS:
- Set "isPractical": true
- Set "practicalType": "${this.getPracticalType(goalType)}"
- Set "githubReady": ${goalType === 'coding-learning'}
- Title should be action-oriented (e.g., "Build...", "Create...", "Implement...")
- Description (4-5 sentences):
  ✓ What to build/create/do
  ✓ Which concepts from the stage it applies
  ✓ Expected deliverable/outcome
  ✓ Success criteria (how to know you've completed it)
  ✓ Why this practical matters for real-world application

GUIDANCE: ${practicalGuidance || 'Create hands-on exercises that apply stage concepts'}
`;

  if (goalType === 'coding-learning') {
    return baseInstructions + `

CODING-SPECIFIC PRACTICAL NODES:
- Must be actual coding projects that can be committed to GitHub
- Include starter templates or scaffolding resources
- Provide step-by-step tutorial as one resource
- Suggest GitHub repo structure in description
- Examples:
  * "Build a Todo App with React Hooks"
  * "Create a REST API with Express and PostgreSQL"
  * "Implement User Authentication with JWT"
  
PRACTICAL NODE RESOURCES (4-5):
- At least 1 starter template or boilerplate repo
- At least 1 step-by-step tutorial
- At least 1 reference documentation
- Optional: video walkthrough, testing guide
`;
  } else if (goalType === 'non-coding-learning') {
    return baseInstructions + `

NON-CODING PRACTICAL NODES:
- Must be tangible deliverables (documents, presentations, case studies)
- Should apply theoretical knowledge to realistic scenarios
- Examples:
  * "Write a Data Governance Policy for a Fictional Company"
  * "Create a Marketing Strategy Deck for a Product Launch"
  * "Conduct a Mock GDPR Compliance Audit"
  
PRACTICAL NODE RESOURCES (4-5):
- Templates or frameworks to follow
- Real-world examples to reference
- Evaluation criteria or rubrics
- Tools or software recommendations
`;
  } else if (goalType === 'execution') {
    return baseInstructions + `

EXECUTION-FOCUSED PRACTICAL NODES:
- Each node should be a concrete milestone or deliverable
- Should have clear "done" criteria
- Examples:
  * "Ship MVP Landing Page with Email Capture"
  * "Launch Beta to First 10 Users and Collect Feedback"
  * "Complete Market Research Report"
  
PRACTICAL NODE RESOURCES (4-5):
- Tools and platforms needed
- Process guides and checklists
- Examples of similar executions
- Metrics and success criteria
`;
  } else { // mixed
    return baseInstructions + `

MIXED GOAL PRACTICAL NODES:
- Balance between learning exercises and execution milestones
- Adapt to the specific nature of each stage
- Use coding-style practicals for technical stages
- Use deliverable-style practicals for strategic stages
`;
  }
}

/**
 * Get practical type string based on goal type
 */
private getPracticalType(goalType: string): string {
  switch (goalType) {
    case 'coding-learning':
      return 'github-project';
    case 'non-coding-learning':
      return 'document-deliverable';
    case 'execution':
      return 'general-exercise';
    case 'mixed':
      return 'github-project'; // Default to code if mixed
    default:
      return 'general-exercise';
  }
}

/**
 * Update structure requirements to account for practical nodes
 */
private buildStructureRequirements(distribution: RoadmapDateDistribution, requiresPractical: boolean): string {
  const totalNodes = distribution.stages.reduce((sum, s) => sum + s.nodeDates.length, 0);
  const practicalNodes = requiresPractical ? distribution.stageCount : 0;
  const theoryNodes = totalNodes - practicalNodes;
  const totalResources = totalNodes * 4.5;

  return `
REQUIRED STRUCTURE:
├── ${distribution.stageCount} stages (following date distribution above)
├── ${totalNodes} nodes total${requiresPractical ? ` (${theoryNodes} theory + ${practicalNodes} practical)` : ''}
├── ~${Math.round(totalResources)} resources total (4-5 per node)
└── Each node has a scheduledDate from the provided list

${requiresPractical ? `
PRACTICAL NODE PLACEMENT:
- 1 practical node per stage
- Practical node is ALWAYS the last node in each stage
- Use the last available date in each stage for the practical node
- Theory nodes use earlier dates in the stage

` : ''}STAGE PROGRESSION:
- Stage 1 (20%): Foundations - broad concepts, definitions, why it matters
- Stage 2 (25%): Core skills - main techniques, tools, frameworks
- Stage 3 (30%): Applied practice - projects, exercises, real scenarios
- Stage 4 (20%): Advanced - optimization, best practices, edge cases
- Stage 5+ (5%): Mastery - portfolio projects, teaching others (if applicable)`;
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