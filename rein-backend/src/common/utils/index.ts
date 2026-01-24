/**
 * Builds a prompt for generating a structured roadmap from a preprocessed goal.
 * @param goal - The user's learning goal (e.g., "Learn React, TypeScript, and Tailwind")
 * @param known - Technologies the user already knows (e.g., ["HTML", "CSS"])
 * @param experienceLevel - Optional level of experience (e.g., "beginner")
 */
export function buildResolutionPrompt(
  goal: string,
  known: string[] = [],
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced',
): string {
  const knownTech = known.length ? `Avoid including: ${known.join(', ')}.` : '';
  const levelHint = experienceLevel ? `User is ${experienceLevel}-level.` : '';

  return `
You are an expert roadmap architect. Given a user's goal, generate a personalized learning roadmap in JSON format.

---

### Goal:
"""${goal}"""

### Context:
- ${knownTech}
- ${levelHint}
- Provide ONLY resources that are free and beginner-friendly if applicable.
- Include only relevant technologies the user wants to learn.

---

### Roadmap Format:
Return ONLY valid JSON with this structure:

[
  {
    "id": "stage-1",
    "title": "Stage title",
    "nodes": [
      {
        "id": "node-1",
        "title": "Node title",
        "description": "Brief explanation of the topic",
        "resources": [
          {
            "type": "video" | "article" | "project",
            "title": "Resource title",
            "link": "https://..."
          }
        ]
      }
    ]
  }
]

### Guidelines:
- Do NOT include any extra explanation or commentary before or after the JSON.
- Do NOT include technologies the user already knows.
- Do NOT repeat generic steps like "learn HTML" if the user already knows it.
- Make sure resource links are real, high-quality, and free.
- Tailor roadmap structure to the user's goal only.

`.trim();
}
