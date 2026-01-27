import os
import json
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from datetime import datetime
import traceback

try:
    from opik import track
    from opik.integrations.anthropic import AnthropicClientWrapper
    from opik.evaluation import evaluate_experiment
    from opik.evaluation.metrics import Answer, LLMEvaluator
except ImportError:
    logging.warning("Opik not installed - tracing will be disabled")

import google.generativeai as genai

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class GoalPreprocessingResult:
    """Result of goal preprocessing"""
    original_goal: str
    clarified_goal: str
    smart_criteria: Dict[str, str]
    context: Dict[str, Any]
    extracted_timeline: Optional[str]
    priority_level: str  # high, medium, low
    success_metrics: List[str]


@dataclass
class GeneratedResolution:
    """AI-generated resolution structure"""
    title: str
    description: str
    rationale: str
    smart_goal: str
    key_metrics: List[str]
    timeline: str
    challenges: List[str]
    success_strategies: List[str]


@dataclass
class GeneratedPlan:
    """Actionable execution plan for a resolution"""
    goal_id: str
    phases: List[Dict[str, Any]]
    total_weeks: int
    key_milestones: List[Dict[str, Any]]
    resources: List[str]
    contingencies: List[str]
    evaluation_points: List[int]  # Week numbers for check-ins


class ReinMLModel:
    """Main ML model for Rein resolution coaching"""

    def __init__(self, opik_api_key: Optional[str] = None):
        """Initialize the ML model with Opik integration"""
        self.genai_key = os.getenv("GEMINI_API_KEY")
        self.opik_enabled = bool(opik_api_key or os.getenv("OPIK_API_KEY"))
        
        if not self.genai_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")

        genai.configure(api_key=self.genai_key)
        self.model = genai.GenerativeModel("gemini-2.0-flash")

        logger.info(f"Rein ML Model initialized - Opik: {self.opik_enabled}")

    @track(name="preprocess_goal")
    def preprocess_goal(self, user_input: str, user_context: Dict[str, Any]) -> GoalPreprocessingResult:
        """
        Preprocess and clarify user's goal using LLM with Opik tracking.
        
        Args:
            user_input: Raw user goal input
            user_context: User profile and context information
            
        Returns:
            GoalPreprocessingResult with clarified goal and metadata
        """
        logger.info(f"Preprocessing goal: {user_input[:50]}...")

        preprocessing_prompt = f"""
You are an expert at clarifying and structuring life goals.

User's raw goal: {user_input}

User context:
- Experience level: {user_context.get('experience_level', 'unknown')}
- Previous goals: {user_context.get('previous_goals', [])}
- Available time: {user_context.get('available_hours_per_week', 'unknown')} hours/week
- Constraints: {user_context.get('constraints', [])}

Task: Clarify this goal and extract:
1. Clarified goal statement (clear and specific)
2. SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound)
3. Key success metrics (2-3 quantifiable measures)
4. Timeline (estimated duration)
5. Priority level (high/medium/low)
6. Potential challenges

Return response as JSON:
{{
  "clarified_goal": "string",
  "smart_criteria": {{
    "specific": "string",
    "measurable": "string",
    "achievable": "string",
    "relevant": "string",
    "time_bound": "string"
  }},
  "success_metrics": ["string"],
  "timeline": "string",
  "priority_level": "string",
  "challenges": ["string"]
}}
"""

        try:
            response = self.model.generate_content(preprocessing_prompt)
            response_text = response.text

            # Extract JSON
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                result_data = json.loads(json_str)
            else:
                raise ValueError("Could not extract JSON from response")

            result = GoalPreprocessingResult(
                original_goal=user_input,
                clarified_goal=result_data.get('clarified_goal', user_input),
                smart_criteria=result_data.get('smart_criteria', {}),
                context=user_context,
                extracted_timeline=result_data.get('timeline'),
                priority_level=result_data.get('priority_level', 'medium'),
                success_metrics=result_data.get('success_metrics', [])
            )

            logger.info(f"Goal preprocessing completed: {result.clarified_goal[:50]}...")
            return result

        except Exception as e:
            logger.error(f"Goal preprocessing failed: {str(e)}")
            raise

    @track(name="generate_resolution")
    def generate_resolution(
        self,
        preprocessed_goal: GoalPreprocessingResult,
        style: str = "balanced"
    ) -> GeneratedResolution:
        """
        Generate a detailed resolution based on preprocessed goal.
        
        Args:
            preprocessed_goal: Output from goal preprocessing
            style: Generation style - "aggressive", "balanced", or "conservative"
            
        Returns:
            GeneratedResolution with full details and strategies
        """
        logger.info(f"Generating resolution with style: {style}")

        generation_prompt = f"""
You are an expert life coach creating personalized resolution strategies.

Goal: {preprocessed_goal.clarified_goal}
SMART criteria: {json.dumps(preprocessed_goal.smart_criteria)}
Timeline: {preprocessed_goal.extracted_timeline}
Priority: {preprocessed_goal.priority_level}
Success Metrics: {', '.join(preprocessed_goal.success_metrics)}

Generation style: {style}
- aggressive: Push boundaries, high ambition
- balanced: Realistic and achievable with effort
- conservative: Gradual progress, low risk

Create a comprehensive resolution plan including:
1. Resolution title (catchy but professional)
2. Detailed description
3. Rationale (why this approach will work)
4. SMART goal restatement
5. Key measurable metrics
6. Expected timeline with phases
7. Anticipated challenges
8. Success strategies

Return as JSON:
{{
  "title": "string",
  "description": "string",
  "rationale": "string",
  "smart_goal": "string",
  "key_metrics": ["string"],
  "timeline": "string",
  "challenges": ["string"],
  "success_strategies": ["string"]
}}
"""

        try:
            response = self.model.generate_content(generation_prompt)
            response_text = response.text

            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            json_str = response_text[json_start:json_end]
            result_data = json.loads(json_str)

            resolution = GeneratedResolution(
                title=result_data.get('title', 'Resolution'),
                description=result_data.get('description', ''),
                rationale=result_data.get('rationale', ''),
                smart_goal=result_data.get('smart_goal', ''),
                key_metrics=result_data.get('key_metrics', []),
                timeline=result_data.get('timeline', ''),
                challenges=result_data.get('challenges', []),
                success_strategies=result_data.get('success_strategies', [])
            )

            logger.info(f"Resolution generated: {resolution.title}")
            return resolution

        except Exception as e:
            logger.error(f"Resolution generation failed: {str(e)}")
            raise

    @track(name="create_execution_plan")
    def create_execution_plan(
        self,
        goal_id: str,
        resolution: GeneratedResolution,
        available_hours: float = 5.0
    ) -> GeneratedPlan:
        """
        Create a week-by-week execution plan.
        
        Args:
            goal_id: Unique goal identifier
            resolution: Generated resolution details
            available_hours: Hours per week available
            
        Returns:
            GeneratedPlan with phases and milestones
        """
        logger.info(f"Creating execution plan for goal: {goal_id}")

        planning_prompt = f"""
You are an expert project planner creating detailed execution plans.

Resolution: {resolution.title}
Timeline: {resolution.timeline}
Available hours/week: {available_hours}
Metrics: {', '.join(resolution.key_metrics)}
Challenges: {', '.join(resolution.challenges)}

Create a detailed week-by-week plan including:
1. Breakdown into phases (e.g., Foundation, Building, Optimization)
2. Weekly tasks for each phase
3. Milestones and check-in points
4. Resource requirements
5. Contingency plans

Ensure:
- Tasks fit within available hours
- Progressive difficulty (easy to hard)
- Regular check-in points (typically every 2-4 weeks)
- Quick wins in early weeks for motivation

Return as JSON:
{{
  "phases": [
    {{
      "name": "string",
      "weeks": [
        {{
          "week": number,
          "focus": "string",
          "tasks": ["string"],
          "hours_needed": number,
          "milestones": ["string"]
        }}
      ]
    }}
  ],
  "total_weeks": number,
  "evaluation_weeks": [number],
  "resources": ["string"],
  "contingencies": ["string"]
}}
"""

        try:
            response = self.model.generate_content(planning_prompt)
            response_text = response.text

            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            json_str = response_text[json_start:json_end]
            result_data = json.loads(json_str)

            # Flatten phases for storage
            all_phases = []
            for phase in result_data.get('phases', []):
                all_phases.extend(phase.get('weeks', []))

            plan = GeneratedPlan(
                goal_id=goal_id,
                phases=all_phases,
                total_weeks=result_data.get('total_weeks', 12),
                key_milestones=[],  # Extracted from phases
                resources=result_data.get('resources', []),
                contingencies=result_data.get('contingencies', []),
                evaluation_points=result_data.get('evaluation_weeks', [])
            )

            logger.info(f"Execution plan created: {plan.total_weeks} weeks")
            return plan

        except Exception as e:
            logger.error(f"Plan creation failed: {str(e)}")
            raise

    @track(name="evaluate_resolution_quality")
    def evaluate_resolution_quality(
        self,
        resolution: GeneratedResolution
    ) -> Dict[str, Any]:
        """
        Evaluate generated resolution quality using LLM.
        
        Args:
            resolution: Resolution to evaluate
            
        Returns:
            Quality metrics and scores
        """
        logger.info(f"Evaluating resolution: {resolution.title}")

        evaluation_prompt = f"""
You are an expert at evaluating the quality of resolution frameworks.

Resolution: {resolution.title}
Description: {resolution.description}
SMART Goal: {resolution.smart_goal}
Metrics: {', '.join(resolution.key_metrics)}
Timeline: {resolution.timeline}

Evaluate on these 0-10 scales:
- Clarity: How clear and well-defined is the goal?
- Specificity: How specific and detailed?
- Measurability: How measurable is progress?
- Feasibility: How realistic is the timeline?
- Motivation: How motivating is the approach?

Return JSON:
{{
  "clarity": number,
  "specificity": number,
  "measurability": number,
  "feasibility": number,
  "motivation": number,
  "overall_score": number,
  "strengths": ["string"],
  "improvements": ["string"],
  "reasoning": "string"
}}
"""

        try:
            response = self.model.generate_content(evaluation_prompt)
            response_text = response.text

            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            json_str = response_text[json_start:json_end]
            evaluation = json.loads(json_str)

            logger.info(f"Resolution quality: {evaluation.get('overall_score', 0)}/10")
            return evaluation

        except Exception as e:
            logger.error(f"Evaluation failed: {str(e)}")
            raise

    @track(name="generate_coaching_response")
    def generate_coaching_response(
        self,
        user_query: str,
        goal_context: Dict[str, Any],
        recent_progress: Optional[List[str]] = None
    ) -> str:
        """
        Generate adaptive coaching response based on user context.
        
        Args:
            user_query: User's question or check-in
            goal_context: Context about their goal
            recent_progress: Recent progress notes
            
        Returns:
            Personalized coaching response
        """
        logger.info(f"Generating coaching response for query: {user_query[:50]}...")

        coaching_prompt = f"""
You are an empathetic and knowledgeable AI resolution coach.

User's goal: {goal_context.get('goal', '')}
Timeline: {goal_context.get('timeline', '')}
Current week: {goal_context.get('current_week', '')}
Challenges faced: {', '.join(goal_context.get('challenges', []))}

Recent progress:
{chr(10).join(recent_progress) if recent_progress else 'No progress notes yet'}

User's current question/concern:
{user_query}

Provide coaching that:
1. Acknowledges their progress and challenges
2. Provides specific, actionable advice
3. Offers motivation and encouragement
4. Suggests adaptations if needed
5. Reminds them of their 'why'

Be warm, professional, and data-informed. Keep response to 2-3 paragraphs.
"""

        try:
            response = self.model.generate_content(coaching_prompt)
            coaching_response = response.text

            logger.info("Coaching response generated successfully")
            return coaching_response

        except Exception as e:
            logger.error(f"Coaching generation failed: {str(e)}")
            raise

    def end_to_end_pipeline(
        self,
        user_input: str,
        user_profile: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute complete goal-to-plan pipeline with Opik tracing.
        
        Args:
            user_input: User's goal description
            user_profile: User profile and preferences
            
        Returns:
            Complete output with preprocessed goal, resolution, and plan
        """
        logger.info("Starting end-to-end pipeline")

        try:
            # Stage 1: Preprocessing
            preprocessed = self.preprocess_goal(user_input, user_profile)

            # Stage 2: Resolution generation
            resolution = self.generate_resolution(preprocessed)

            # Stage 3: Quality evaluation
            evaluation = self.evaluate_resolution_quality(resolution)

            # Stage 4: Plan creation
            plan = self.create_execution_plan(
                goal_id=user_profile.get('id', 'unknown'),
                resolution=resolution,
                available_hours=user_profile.get('available_hours', 5.0)
            )

            result = {
                'preprocessed_goal': asdict(preprocessed),
                'resolution': asdict(resolution),
                'evaluation': evaluation,
                'plan': asdict(plan),
                'timestamp': datetime.now().isoformat()
            }

            logger.info("End-to-end pipeline completed successfully")
            return result

        except Exception as e:
            logger.error(f"Pipeline failed: {str(e)}\n{traceback.format_exc()}")
            raise


def main():
    """Example usage of the ML model"""
    # Initialize model
    model = ReinMLModel()

    # Example user input
    user_input = "I want to get fit and run a 5K by the end of Q1"
    user_profile = {
        'id': 'user_123',
        'experience_level': 'beginner',
        'available_hours': 5,
        'constraints': ['full-time job', 'family responsibilities'],
        'previous_goals': []
    }

    # Run pipeline
    result = model.end_to_end_pipeline(user_input, user_profile)

    print("\n" + "="*80)
    print("REIN ML MODEL - END-TO-END PIPELINE OUTPUT")
    print("="*80)
    print(json.dumps(result, indent=2, default=str))


if __name__ == "__main__":
    main()
