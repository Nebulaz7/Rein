import { addDays, differenceInDays, format, parseISO } from 'date-fns';

/**
 * Spacing rules based on total duration
 */
export interface SpacingRule {
  minDays: number;
  maxDays: number;
  nodeSpacing: number; // days between nodes
  nodesPerStage: { min: number; max: number };
  stageCount: number;
}

/**
 * Date range for a stage or node
 */
export interface DateRange {
  startDate: string; // ISO format YYYY-MM-DD
  endDate: string;   // ISO format YYYY-MM-DD
}

/**
 * Complete date distribution for a roadmap
 */
export interface RoadmapDateDistribution {
  totalDays: number;
  stageCount: number;
  nodeSpacing: number;
  stages: Array<{
    stageIndex: number;
    startDate: string;
    endDate: string;
    nodeDates: string[]; // ISO dates for each node in this stage
  }>;
}

/**
 * Centralized date calculation utility for resolution roadmaps
 */
export class DateCalculator {
  
  /**
   * Parse natural language timeframe to total days
   * Examples: "2 weeks" → 14, "3 months" → 90, "6 months" → 180
   */
  static parseTimeframeToTotalDays(timeframe: string | undefined): number {
    if (!timeframe) {
      return 30; // default to 1 month
    }

    const lower = timeframe.toLowerCase().trim();

    // Handle "X weeks"
    const weeksMatch = lower.match(/(\d+)\s*weeks?/);
    if (weeksMatch) {
      return parseInt(weeksMatch[1]) * 7;
    }

    // Handle "X months"
    const monthsMatch = lower.match(/(\d+)\s*months?/);
    if (monthsMatch) {
      return parseInt(monthsMatch[1]) * 30;
    }

    // Handle "X days"
    const daysMatch = lower.match(/(\d+)\s*days?/);
    if (daysMatch) {
      return parseInt(daysMatch[1]);
    }

    // Handle variations like "in 6 months", "over 3 weeks"
    const inOverMatch = lower.match(/(?:in|over)\s*(\d+)\s*(week|month|day)s?/);
    if (inOverMatch) {
      const num = parseInt(inOverMatch[1]);
      const unit = inOverMatch[2];
      if (unit.startsWith('week')) return num * 7;
      if (unit.startsWith('month')) return num * 30;
      if (unit.startsWith('day')) return num;
    }

    // Fallback patterns
    if (lower.includes('quarter')) return 90;
    if (lower.includes('year')) return 365;
    if (lower.includes('quick') || lower.includes('fast')) return 14;
    if (lower.includes('comprehensive') || lower.includes('deep')) return 90;

    // Default to 30 days if unparseable
    return 30;
  }

  /**
   * Get spacing rule based on total duration
   */
  static getSpacingRule(totalDays: number): SpacingRule {
    if (totalDays < 14) {
      return {
        minDays: 0,
        maxDays: 13,
        nodeSpacing: 1,
        nodesPerStage: { min: 3, max: 4 },
        stageCount: 2,
      };
    }

    if (totalDays <= 30) {
      return {
        minDays: 14,
        maxDays: 30,
        nodeSpacing: 1,
        nodesPerStage: { min: 4, max: 6 },
        stageCount: 3,
      };
    }

    if (totalDays <= 60) {
      return {
        minDays: 31,
        maxDays: 60,
        nodeSpacing: 2,
        nodesPerStage: { min: 6, max: 8 },
        stageCount: 4,
      };
    }

    if (totalDays <= 90) {
      return {
        minDays: 61,
        maxDays: 90,
        nodeSpacing: 3,
        nodesPerStage: { min: 7, max: 9 },
        stageCount: 4,
      };
    }

    if (totalDays <= 180) {
      return {
        minDays: 91,
        maxDays: 180,
        nodeSpacing: 7,
        nodesPerStage: { min: 8, max: 12 },
        stageCount: 5,
      };
    }

    // 180+ days (6+ months)
    return {
      minDays: 181,
      maxDays: 365,
      nodeSpacing: 14,
      nodesPerStage: { min: 10, max: 15 },
      stageCount: 6,
    };
  }

  /**
   * Calculate evenly distributed stage date ranges
   */
  static calculateStageDates(
    totalDays: number,
    stageCount: number,
    startDate: Date = new Date()
  ): DateRange[] {
    const stages: DateRange[] = [];
    
    // Calculate base days per stage
    const baseDaysPerStage = Math.floor(totalDays / stageCount);
    const extraDays = totalDays % stageCount;

    let currentDate = startDate;

    for (let i = 0; i < stageCount; i++) {
      // Distribute extra days across first stages
      const daysForThisStage = baseDaysPerStage + (i < extraDays ? 1 : 0);
      
      const stageStart = format(currentDate, 'yyyy-MM-dd');
      const stageEnd = format(
        addDays(currentDate, daysForThisStage - 1), // -1 because end date is inclusive
        'yyyy-MM-dd'
      );

      stages.push({
        startDate: stageStart,
        endDate: stageEnd,
      });

      // Move to next stage start (day after current stage ends)
      currentDate = addDays(currentDate, daysForThisStage);
    }

    return stages;
  }

  /**
   * Distribute node dates within a stage based on spacing
   */
  static distributeNodesInStage(
    stageStartDate: string,
    stageEndDate: string,
    nodeCount: number,
    spacing: number
  ): string[] {
    const start = parseISO(stageStartDate);
    const end = parseISO(stageEndDate);
    const stageDays = differenceInDays(end, start) + 1; // +1 for inclusive

    const nodeDates: string[] = [];
    
    // Calculate total days needed for all nodes with spacing
    const totalNeededDays = (nodeCount - 1) * spacing + 1;

    if (totalNeededDays <= stageDays) {
      // Normal case: space nodes evenly with specified spacing
      let currentDate = start;
      
      for (let i = 0; i < nodeCount; i++) {
        nodeDates.push(format(currentDate, 'yyyy-MM-dd'));
        currentDate = addDays(currentDate, spacing);
      }
    } else {
      // Tight fit case: compress spacing to fit all nodes in stage
      const adjustedSpacing = Math.max(1, Math.floor(stageDays / nodeCount));
      let currentDate = start;

      for (let i = 0; i < nodeCount; i++) {
        // Ensure we don't exceed stage end date
        if (differenceInDays(currentDate, end) <= 0) {
          nodeDates.push(format(currentDate, 'yyyy-MM-dd'));
          currentDate = addDays(currentDate, adjustedSpacing);
        } else {
          // If we've run out of days, assign remaining nodes to last valid date
          nodeDates.push(format(end, 'yyyy-MM-dd'));
        }
      }
    }

    return nodeDates;
  }

  /**
   * Calculate complete roadmap date distribution
   * This is the main method that orchestrates everything
   */
  static calculateRoadmapDates(
    timeframe: string | undefined,
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced',
    startDate: Date = new Date()
  ): RoadmapDateDistribution {
    // Parse timeframe or use intelligent default based on experience
    let totalDays = this.parseTimeframeToTotalDays(timeframe);

    // Adjust default timeframe based on experience if no explicit timeframe
    if (!timeframe && experienceLevel) {
      if (experienceLevel === 'beginner') {
        totalDays = 60; // 2 months for beginners
      } else if (experienceLevel === 'intermediate') {
        totalDays = 45; // 1.5 months for intermediate
      } else if (experienceLevel === 'advanced') {
        totalDays = 30; // 1 month for advanced
      }
    }

    // Get spacing rule for this duration
    const rule = this.getSpacingRule(totalDays);
    const stageCount = rule.stageCount;
    const nodeSpacing = rule.nodeSpacing;

    // Calculate stage date ranges
    const stageDates = this.calculateStageDates(totalDays, stageCount, startDate);

    // Calculate node count per stage (balanced distribution)
    const avgNodesPerStage = Math.floor(
      (rule.nodesPerStage.min + rule.nodesPerStage.max) / 2
    );

    // Build complete distribution
    const stages = stageDates.map((stage, index) => {
      // Vary node count slightly across stages (more in middle stages)
      let nodeCount = avgNodesPerStage;
      
      if (stageCount >= 4) {
        // Stage 1: foundational (fewer nodes)
        if (index === 0) nodeCount = rule.nodesPerStage.min;
        // Stage 2-3: core content (more nodes)
        else if (index > 0 && index < stageCount - 1) nodeCount = rule.nodesPerStage.max;
        // Final stage: mastery/projects (medium nodes)
        else nodeCount = avgNodesPerStage;
      }

      const nodeDates = this.distributeNodesInStage(
        stage.startDate,
        stage.endDate,
        nodeCount,
        nodeSpacing
      );

      return {
        stageIndex: index + 1,
        startDate: stage.startDate,
        endDate: stage.endDate,
        nodeDates,
      };
    });

    return {
      totalDays,
      stageCount,
      nodeSpacing,
      stages,
    };
  }

  /**
   * Get recommended node count for a given timeframe
   */
  static getRecommendedNodeCount(totalDays: number): number {
    const rule = this.getSpacingRule(totalDays);
    const avgNodesPerStage = Math.floor(
      (rule.nodesPerStage.min + rule.nodesPerStage.max) / 2
    );
    return avgNodesPerStage * rule.stageCount;
  }

  /**
   * Format date range for human-readable display
   */
  static formatDateRange(startDate: string, endDate: string): string {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const days = differenceInDays(end, start) + 1;

    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    
    const weeks = Math.ceil(days / 7);
    if (weeks === 1) return '1 week';
    if (days < 30) return `${weeks} weeks`;

    const months = Math.ceil(days / 30);
    if (months === 1) return '1 month';
    return `${months} months`;
  }
}