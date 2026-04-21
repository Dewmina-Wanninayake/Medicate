const axios = require('axios');

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

/**
 * Calls the Anthropic Claude API and returns a parsed structured symptom analysis.
 * @param {string[]} symptoms - Array of symptom strings
 * @param {string} additionalContext - Optional extra context (age, duration, etc.)
 * @returns {{ parsed: object, rawText: string, model: string }}
 */
async function analyzeSymptoms(symptoms, additionalContext = '') {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured');

  const symptomList = symptoms.map((s) => `- ${s}`).join('\n');

  const prompt = `You are a medical triage assistant. A patient has reported the following symptoms:

${symptomList}
${additionalContext ? `\nAdditional context: ${additionalContext}` : ''}

Analyze these symptoms and respond ONLY with a valid JSON object (no markdown, no explanation outside JSON) in exactly this structure:
{
  "possibleConditions": [
    {
      "condition": "Condition name",
      "likelihood": "high|medium|low",
      "description": "Brief description of this condition and why it matches the symptoms"
    }
  ],
  "recommendedSpecialties": ["Specialty1", "Specialty2"],
  "urgencyLevel": "emergency|urgent|routine|self_care",
  "preliminaryAdvice": "Short, safe, non-diagnostic advice for the patient",
  "disclaimer": "This is not a medical diagnosis. Please consult a qualified healthcare professional."
}

Rules:
- List up to 3 possible conditions
- List 1-3 recommended doctor specialties
- urgencyLevel must be one of: emergency, urgent, routine, self_care
- Keep preliminary advice practical and safe (hydration, rest, monitoring)
- ALWAYS include the disclaimer
- Respond ONLY with the JSON object`;

  const response = await axios.post(
    ANTHROPIC_API_URL,
    {
      model: MODEL,
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      timeout: 30000,
    }
  );

  const rawText = response.data.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');

  // Strip potential markdown code fences before parsing
  const cleaned = rawText.replace(/```json|```/g, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (parseErr) {
    throw new Error(`AI returned non-JSON response: ${rawText.slice(0, 200)}`);
  }

  return { parsed, rawText, model: MODEL };
}

module.exports = { analyzeSymptoms };
