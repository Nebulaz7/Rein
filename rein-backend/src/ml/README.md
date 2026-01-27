# ML Infrastructure with Opik Tracing

Comprehensive AI coaching platform ML infrastructure with integrated Opik tracing for observability, evaluation, and feedback collection.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Module Structure](#module-structure)
- [File Descriptions](#file-descriptions)
- [Integration Guide](#integration-guide)
- [Setup & Configuration](#setup--configuration)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

---

## Overview

The ML infrastructure provides:

- **Opik Tracing**: End-to-end tracing of LLM calls and ML operations for debugging and optimization
- **LLM Integration**: Seamless integration with Google's Generative AI (Gemini) with automatic tracing
- **Preprocessing**: Goal preprocessing with context understanding and validation
- **Evaluation**: Automated goal quality evaluation and metric tracking
- **Feedback Loop**: Collection and analysis of user feedback for continuous improvement
- **Decorators**: Simple `@Trace()` decorator for automatic tracing of any method

---

## Architecture

```
ML Infrastructure
│
├── Opik Client Module
│   ├── OpikClientService (initialization, trace management)
│   └── OpikClientModule (DI configuration)
│
├── LLM Module
│   ├── LlmServiceWithTracing (Gemini integration with tracing)
│   └── LlmTraceModule (exports for other modules)
│
├── Tracing Module
│   ├── TracingService (high-level tracing utilities)
│   ├── TracingDecorator (@Trace decorator for methods)
│   └── TracingModule (DI configuration)
│
├── Evaluation Module
│   ├── EvaluationService (goal quality metrics)
│   └── EvaluationModule (DI configuration)
│
├── Feedback Module
│   ├── FeedbackService (user feedback collection)
│   └── FeedbackModule (DI configuration)
│
└── ML Infrastructure Module (aggregates all)
```

---

## Module Structure

```
src/ml/
├── README.md (this file)
├── examples.ts (integration examples)
├── ml-infrastructure.module.ts (main module)
│
├── opik/
│   ├── opik-client.module.ts
│   └── opik-client.service.ts
│
├── llm/
│   ├── llm-service-with-tracing.ts
│   └── llm-trace.module.ts
│
├── tracing/
│   ├── tracing.service.ts
│   ├── tracing.decorator.ts
│   ├── tracing.module.ts
│   └── index.ts
│
├── evaluation/
│   ├── evaluation.service.ts
│   └── evaluation.module.ts
│
└── feedback/
    ├── feedback.service.ts
    └── feedback.module.ts
```

---

## File Descriptions

### Core Opik Integration

#### `opik/opik-client.service.ts`
**Purpose**: Central service for Opik client management and trace operations.

**Key Methods**:
- `onModuleInit()`: Initializes Opik client with API key and project name
- `getClient()`: Returns the Opik client instance
- `startTrace(name, metadata)`: Creates a new trace for tracking operations
- `createSpan(trace, name, input)`: Creates a sub-operation within a trace
- `endSpan(span, output, feedback)`: Completes a span with results
- `endTrace(trace, status, error)`: Completes a trace with final status

**Environment Variables**:
```
OPIK_API_KEY=your-opik-api-key
OPIK_PROJECT_NAME=rein-ai-coaching
```

#### `opik/opik-client.module.ts`
**Purpose**: NestJS module configuration for Opik client injection.

**Exports**: OpikClientService for use across the application.

### LLM Integration

#### `llm/llm-service-with-tracing.ts`
**Purpose**: High-level LLM service with automatic Opik tracing for all Gemini interactions.

**Key Methods**:
- `generateContent(systemPrompt, userPrompt, options)`: Generate content with tracing
  - Supports output formats: `json`, `text`, `markdown`
  - Configurable temperature (0-1) and max tokens
  - Tracks input/output tokens
  - Automatic error handling and logging

- `generateGoal(userGoal, context)`: Generate SMART goals
  - Uses system prompt for goal engineering
  - Validates JSON output format
  - Traces entire generation pipeline

- `refineGoal(goal, feedback)`: Refine goals based on feedback
  - Iterative improvement with tracing
  - Feedback integration

- `generateResolutions(goal)`: Generate resolution steps
  - Breaks down goals into actionable resolutions
  - Traces each resolution generation

- `evaluateGoalQuality(goal)`: Evaluate goal quality metrics
  - Traces quality evaluation process
  - Returns structured metrics

**Tracing Details**:
- Each method is decorated with `@Trace()` for automatic tracing
- Spans track: prompt formatting, model calls, token usage, output parsing
- All errors are logged to traces for debugging

#### `llm/llm-trace.module.ts`
**Purpose**: NestJS module exporting LLM service for other modules.

**Exports**: 
- LlmServiceWithTracing
- Depends on: OpikClientModule

### Tracing Utilities

#### `tracing/tracing.service.ts`
**Purpose**: High-level tracing service providing specialized tracing for different operations.

**Key Methods**:
- `traceLlmCall(name, input, generateFn)`: Trace LLM generation calls
  - Captures model, prompt, temperature, max tokens
  - Tracks input/output token counts
  - Automatic success/error logging

- `tracePreprocessing(name, input, processFn)`: Trace preprocessing operations
  - Tracks input transformation
  - Validates output

- `traceEvaluation(name, context, evaluateFn)`: Trace evaluation operations
  - Tracks goal evaluation metrics
  - Associates with user and goal IDs

- `traceFeedback(name, context, processFn)`: Trace feedback collection
  - Tracks user feedback
  - Links to resolutions and goals

#### `tracing/tracing.decorator.ts`
**Purpose**: Provides `@Trace()` decorator for automatic method tracing without manual span management.

**Usage**:
```typescript
@Trace({
  name: 'custom_operation_name',
  metadata: { version: '1.0' },
  captureArgs: true,
  captureResult: true
})
async myMethod(arg1: string, arg2: number) {
  // Automatically traced
  return result;
}
```

**Features**:
- Automatic trace creation and completion
- Optional argument and result capture
- Duration tracking
- Error capture and logging
- Graceful fallback if OpikClientService not injected

#### `tracing/tracing.module.ts`
**Purpose**: NestJS module configuration for tracing services.

**Exports**: 
- TracingService
- Depends on: OpikClientModule

### Evaluation & Feedback

#### `evaluation/evaluation.service.ts`
**Purpose**: Service for evaluating goal and resolution quality.

**Key Methods**:
- `evaluateGoalQuality(goal, context)`: Evaluate goal against SMART criteria
- `scoreGoalClarity(goal)`: Measure goal clarity (0-1)
- `scoreGoalRealism(goal, context)`: Measure realism given context (0-1)
- `calculateMetrics(evaluation)`: Calculate composite quality metrics
- `logEvaluation(goalId, evaluation)`: Persist evaluation results

**Tracing**: All evaluations are traced to Opik for analysis.

#### `feedback/feedback.service.ts`
**Purpose**: Service for collecting and processing user feedback.

**Key Methods**:
- `collectFeedback(goalId, feedback)`: Store user feedback
- `processFeedback(feedback)`: Analyze and categorize feedback
- `linkFeedbackToResolution(resolutionId, feedbackId)`: Associate feedback with resolutions
- `getFeedbackAnalysis(goalId)`: Get aggregated feedback insights

**Tracing**: Feedback collection and processing are traced for insight extraction.

---

## Integration Guide

### Step 1: Import ML Infrastructure Module

In `app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { MlInfrastructureModule } from './ml/ml-infrastructure.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    MlInfrastructureModule, // Add this
    // ... other modules
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### Step 2: Inject Services into Your Controllers/Services

```typescript
import { Injectable } from '@nestjs/common';
import { LlmServiceWithTracing } from './ml/llm/llm-service-with-tracing';
import { TracingService } from './ml/tracing/tracing.service';
import { EvaluationService } from './ml/evaluation/evaluation.service';
import { FeedbackService } from './ml/feedback/feedback.service';

@Injectable()
export class MyService {
  constructor(
    private llm: LlmServiceWithTracing,
    private tracing: TracingService,
    private evaluation: EvaluationService,
    private feedback: FeedbackService,
  ) {}

  async processGoal(userGoal: string) {
    // Use injected services with automatic tracing
    const generatedGoal = await this.llm.generateGoal(userGoal, {});
    const evaluation = await this.evaluation.evaluateGoalQuality(generatedGoal);
    return { goal: generatedGoal, metrics: evaluation };
  }
}
```

### Step 3: Use Tracing Decorators (Optional)

```typescript
@Injectable()
export class CustomService {
  constructor(private opik: OpikClientService) {}

  @Trace({
    name: 'my_custom_operation',
    captureArgs: true,
    captureResult: true,
    metadata: { version: '1.0' }
  })
  async myOperation(input: string): Promise<string> {
    // Automatically traced - no manual tracing needed
    return `processed: ${input}`;
  }
}
```

---

## Setup & Configuration

### 1. Install Dependencies

```bash
npm install opik @google/generative-ai
```

### 2. Environment Variables

Create `.env` file in the backend root:

```env
# Opik Configuration
OPIK_API_KEY=your-opik-api-key-here
OPIK_PROJECT_NAME=rein-ai-coaching

# LLM Configuration
GEMINI_API_KEY=your-gemini-api-key-here

# Environment
NODE_ENV=development
```

### 3. Opik Setup

1. Sign up at [opik.comet.com](https://opik.comet.com)
2. Create a project named "rein-ai-coaching"
3. Generate an API key from project settings
4. Add to environment variables

### 4. Google Gemini Setup

1. Get API key from [Google AI Studio](https://aistudio.google.com)
2. Add to environment variables as `GEMINI_API_KEY`

---

## Usage Examples

### Example 1: Basic Goal Generation with Tracing

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { LlmServiceWithTracing } from './ml/llm/llm-service-with-tracing';

@Controller('goals')
export class GoalController {
  constructor(private llm: LlmServiceWithTracing) {}

  @Post('generate')
  async generateGoal(@Body() { description, context }: any) {
    // Automatically traced
    const goal = await this.llm.generateGoal(description, context);
    return goal;
  }
}
```

**Trace Output in Opik**:
```
├── llm_generate_goal (root trace)
│   ├── prompt_formatting (span)
│   ├── model_call (span)
│   │   ├── input_tokens: 450
│   │   └── output_tokens: 250
│   └── output_parsing (span)
│       └── json_valid: true
```

### Example 2: End-to-End Resolution Generation with Evaluation

```typescript
async generateAndEvaluateResolutions(goalId: string, goal: string) {
  // Generate resolutions (traced)
  const resolutions = await this.llm.generateResolutions(goal);

  // Evaluate goal quality (traced)
  const evaluation = await this.evaluation.evaluateGoalQuality(goal, {
    userId: 'user123',
  });

  // Collect initial feedback (traced)
  await this.feedback.collectFeedback(goalId, {
    clarity: 0.95,
    realism: 0.87,
    motivation: 0.92,
  });

  return {
    resolutions,
    evaluation,
  };
}
```

### Example 3: Custom Traced Operation

```typescript
@Injectable()
export class ResolutionService {
  constructor(private opik: OpikClientService) {}

  @Trace({
    name: 'resolution_scoring',
    captureArgs: true,
    captureResult: true,
  })
  async scoreResolutions(resolutions: string[]): Promise<number[]> {
    return resolutions.map((res) => {
      const length = res.length;
      return Math.min(length / 100, 1.0); // Scoring logic
    });
  }
}
```

### Example 4: Manual Span Management

```typescript
async complexOperation() {
  const trace = this.opik.startTrace('complex_operation', {
    operation_type: 'multi_step',
  });

  try {
    // Step 1
    const step1Span = this.opik.createSpan(trace, 'step_1', { input: data });
    const result1 = await this.doStep1(data);
    this.opik.endSpan(step1Span, { result: result1 });

    // Step 2
    const step2Span = this.opik.createSpan(trace, 'step_2', { input: result1 });
    const result2 = await this.doStep2(result1);
    this.opik.endSpan(step2Span, { result: result2 });

    this.opik.endTrace(trace, 'success');
    return result2;
  } catch (error) {
    this.opik.endTrace(trace, 'error', error);
    throw error;
  }
}
```

---

## Best Practices

### 1. Always Use Tracing for LLM Calls

```typescript
// ✅ Good - Automatically traced
const goal = await this.llm.generateGoal(description, context);

// ❌ Avoid - No tracing
const response = await genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
```

### 2. Use Decorators for Custom Methods

```typescript
// ✅ Good - Clean and automatic
@Trace({ name: 'custom_scoring', captureArgs: true })
async scoreGoal(goal: string): Promise<number> {
  return goal.length / 100;
}

// ❌ Avoid - Manual span management for simple methods
async scoreGoal(goal: string): Promise<number> {
  const trace = this.opik.startTrace('scoring');
  // ... manual span management
}
```

### 3. Include Meaningful Metadata

```typescript
// ✅ Good
const trace = this.opik.startTrace('goal_generation', {
  userId: 'user123',
  goalType: 'fitness',
  contextLevel: 'advanced',
});

// ❌ Avoid
const trace = this.opik.startTrace('goal_generation', {});
```

### 4. Limit Captured Data for Performance

```typescript
// ✅ Good - Truncate large strings
const summary = input.substring(0, 500);
this.opik.createSpan(trace, 'input', { summary });

// ❌ Avoid - Capturing entire large objects
this.opik.createSpan(trace, 'input', { entire_dataset });
```

### 5. Handle Errors with Tracing

```typescript
// ✅ Good
try {
  const result = await this.llm.generateGoal(goal, context);
  this.opik.endTrace(trace, 'success');
  return result;
} catch (error) {
  this.opik.endTrace(trace, 'error', error);
  throw error;
}

// ❌ Avoid - Silent failures
try {
  const result = await this.llm.generateGoal(goal, context);
  return result;
} catch (error) {
  // Trace lost
}
```

### 6. Link Related Operations

```typescript
// ✅ Good - Trace shows relationships
const goalTrace = this.opik.startTrace('generate_goal', { userId });
const goal = await this.llm.generateGoal(description, context);

const resolutionTrace = this.opik.startTrace('generate_resolutions', {
  userId,
  goalId: goal.id,
  parentTrace: goalTrace.id, // Link traces
});
const resolutions = await this.llm.generateResolutions(goal);
```

---

## Monitoring & Debugging

### Viewing Traces in Opik

1. Go to [opik.comet.com](https://opik.comet.com)
2. Select "rein-ai-coaching" project
3. View traces, spans, and metrics in real-time

### Common Trace Issues

| Issue | Solution |
|-------|----------|
| Traces not appearing | Verify `OPIK_API_KEY` is set and valid |
| Missing spans | Ensure services are properly injected |
| Token estimates wrong | Check `estimateTokens()` logic in LlmService |
| Decorator not working | Verify OpikClientService is injected as `opikService` |

### Performance Monitoring

- **Trace latency**: Compare span durations in Opik UI
- **Token usage**: Monitor input/output tokens per operation
- **Error rates**: Track failure patterns in traces
- **Feedback correlation**: Link user feedback to trace patterns

---

## File Integration Checklist

- [ ] Import `MlInfrastructureModule` in `app.module.ts`
- [ ] Set `OPIK_API_KEY` and `GEMINI_API_KEY` in `.env`
- [ ] Install dependencies: `npm install opik @google/generative-ai`
- [ ] Inject services in controllers/services as needed
- [ ] Test LLM generation with `POST /api/goals/generate`
- [ ] Verify traces appear in Opik dashboard
- [ ] Add `@Trace()` decorators to custom methods
- [ ] Monitor traces in production

---

## Related Files

- [Generator Service](../generator/generator.service.ts) - Uses LlmServiceWithTracing
- [Resolution Service](../resolution/resolution.service.ts) - Uses evaluation and feedback
- [Context Service](../context/context.service.ts) - Provides context for LLM calls
- [Examples](./examples.ts) - Integration examples and patterns

---

## Support & Troubleshooting

For detailed integration examples, see [examples.ts](./examples.ts).

For Opik documentation, visit: https://docs.opik.comet.com

For Google Gemini API, visit: https://ai.google.dev
