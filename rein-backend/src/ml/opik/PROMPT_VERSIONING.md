# Opik Prompt Versioning System

This system enables systematic versioning, tracking, and evaluation of prompts used throughout the Rein platform. It integrates with Opik to provide observability and optimization of AI model prompts.

## Overview

The Opik Prompt Versioning system consists of four core services:

1. **OpikPromptVersioningService** - Core versioning and registry management
2. **OpikPromptRegistryService** - Opik integration and prompt registration
3. **OpikPromptEvaluationService** - Evaluation tracking and metrics
4. **OpikClientService** - Base Opik client (existing)

## Directory Structure

```
rein-backend/
├── prompts/
│   └── versioned/
│       ├── resolution_analyzer/
│       │   ├── v1.0.0.txt
│       │   └── v2.0.0.txt (future versions)
│       ├── goal_clarity_judge/
│       │   └── v1.0.0.txt
│       └── [other_prompts]/
│           └── v*.*.*.txt
└── src/ml/opik/
    ├── opik-client.service.ts
    ├── opik-client.module.ts
    ├── opik-prompt-versioning.service.ts
    ├── opik-prompt-registry.service.ts
    └── opik-prompt-evaluation.service.ts
```

## Prompt File Format

Versioned prompts are stored as text files with optional JSON metadata headers:

```
<!--
{
  "description": "Description of the prompt",
  "author": "Author Name",
  "tags": ["tag1", "tag2"],
  "status": "active|archived|experimental",
  "capabilities": ["capability1", "capability2"]
}
-->

[Prompt content here...]
```

### Filename Convention

Prompts follow semantic versioning: `v<MAJOR>.<MINOR>.<PATCH>.txt`

Examples:
- `v1.0.0.txt` - Initial release
- `v1.0.1.txt` - Patch (bug fix)
- `v1.1.0.txt` - Minor (new features, backwards compatible)
- `v2.0.0.txt` - Major (breaking changes)

## Usage Examples

### Getting Prompts with Versioning

```typescript
// In your service
constructor(private promptRegistry: OpikPromptRegistryService) {}

async analyzeResolution(rawText: string): Promise<any> {
  // Get latest version
  const { content, metadata } = this.promptRegistry.getPromptWithMetadata('resolution_analyzer');
  
  // Get specific version
  const { content, metadata } = this.promptRegistry.getPromptVersionWithMetadata(
    'resolution_analyzer',
    '1.0.0'
  );
  
  // Pass metadata to LLM service for Opik tracking
  return this.llmService.generateContent(content, userPrompt, 'Resolution Analyzer', metadata);
}
```

### Logging Evaluations

```typescript
// In your evaluation logic
constructor(private evaluationService: OpikPromptEvaluationService) {}

async evaluateGoalClarity(goal: any, scores: any): Promise<void> {
  this.evaluationService.logClarityEvaluation(
    '1.0.0',
    goal,
    {
      clarity: 8,
      specificity: 7,
      measurability: 8,
      achievability: 8,
      relevance: 9
    },
    'Well-structured goal with clear objectives'
  );
}
```

### Tracking Output Quality

```typescript
// After LLM generation
const { content, metadata } = this.promptRegistry.getPromptWithMetadata('resolution_analyzer');
const output = await this.llmService.generateContent(content, userPrompt, traceName, metadata);

// Evaluate output quality
this.evaluationService.logOutputQuality(
  'resolution_analyzer',
  metadata.promptVersion,
  output,
  0.95,
  'Output meets all requirements'
);
```

## Registering New Prompts

### Adding a New Prompt Version

1. Create directory: `prompts/versioned/<prompt_id>/`
2. Create version file: `v<version>.txt` with metadata header
3. Prompts are auto-discovered and registered on service initialization

Example:

```typescript
// Create a new version of an existing prompt
const newPrompt = this.promptVersioning.createVersionedPrompt(
  'resolution_analyzer',
  'New improved prompt content...',
  '2.0.0',
  {
    description: 'Enhanced resolution analyzer with better SMART goal detection',
    author: 'Rein AI Team',
    status: 'active'
  }
);
```

## Integration with Opik

The system automatically:

1. **Registers prompts** - Creates Opik datasets for each prompt ID
2. **Tracks execution** - Logs each prompt use with metadata
3. **Records evaluations** - Stores evaluation scores and feedback
4. **Maintains history** - Preserves all versions and evaluations for analysis

### Opik Metadata

Each LLM trace includes:

```typescript
{
  promptId: 'resolution_analyzer',
  promptName: 'Resolution Analyzer',
  promptVersion: '1.0.0',
  promptTags: ['system-prompt', 'resolution-analysis'],
  promptStatus: 'active',
  promptUpdatedAt: '2026-02-04T...',
  promptDescription: '...'
}
```

## Evaluation Metrics

Track prompt performance across multiple dimensions:

- **Output Quality** - How well does the output meet requirements?
- **JSON Validity** - Is the output valid JSON?
- **Task Completion** - Did the prompt accomplish its goal?
- **Clarity Metrics** - How clear, specific, and measurable is the output?

### Getting Evaluation Statistics

```typescript
const stats = this.evaluationService.getEvaluationStats('resolution_analyzer');

// Returns:
// {
//   totalEvaluations: 150,
//   passRate: 92.5,
//   avgScore: 8.7,
//   evaluationsByName: { ... }
// }
```

## Best Practices

1. **Semantic Versioning** - Use semver for version numbers
2. **Clear Metadata** - Document prompt capabilities and status
3. **Consistent Tags** - Use consistent tags for filtering/analysis
4. **Evaluation Discipline** - Log evaluations for all productions prompts
5. **Version Testing** - Test new versions before marking as active
6. **Backward Compatibility** - Plan version upgrades carefully

## Environment Variables

```bash
# Prompt configuration
PROMPT_BASE_PATH=prompts/versioned  # Directory for versioned prompts

# Opik configuration (existing)
OPIK_API_KEY=your_api_key
OPIK_PROJECT_NAME=rein-ai
```

## Future Enhancements

- Prompt A/B testing support
- Automatic evaluation scoring
- Prompt performance dashboards
- Prompt versioning webhooks
- Batch prompt evaluations
- ML-based prompt optimization suggestions

## Troubleshooting

### Prompts Not Loading

Check:
- Directory structure matches convention
- File names follow `v*.*.*.txt` format
- `PROMPT_BASE_PATH` environment variable is set
- JSON metadata is valid (if included)

### Opik Integration Issues

Check:
- `OPIK_API_KEY` is set
- `OPIK_PROJECT_NAME` is configured
- Opik client initialized successfully in logs

### Missing Evaluation Logs

Ensure:
- Service is injected properly
- `logEvaluation()` is called with correct parameters
- Opik client is initialized
