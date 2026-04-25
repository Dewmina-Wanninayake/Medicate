const axios = require('axios');
const medicalKnowledge = require('./medicalKnowledge');

/**
 * Calls the Gemini API for medical triage analysis.
 * Falls back to heuristic knowledge base if API fails.
 */
async function analyzeSymptoms(symptoms, additionalContext = '') {
  const geminiKey = process.env.GEMINI_API_KEY;

  let errorMessage = "No valid API key provided. Please check your .env file.";

  if (geminiKey && geminiKey.trim() !== '' && !geminiKey.includes('your-gemini-key')) {
    try {
      // If symptoms is an array but contains one long natural language string
      const displayInput = Array.isArray(symptoms) ? symptoms.join(', ') : symptoms;
      console.log(`[Gemini] Analyzing input: ${displayInput.substring(0, 50)}...`);

      const result = await callGemini(symptoms, additionalContext, geminiKey);
      console.log(`[Gemini] Analysis successful using model: ${result.model}`);
      return result;
    } catch (err) {
      errorMessage = err.message || "Unknown Gemini error";
      console.error('[Gemini] API Error:', errorMessage);
      if (err.response?.data) {
        console.error('[Gemini] Response Details:', JSON.stringify(err.response.data, null, 2));
      }
    }
  } else {
    console.warn('[Gemini] No valid API key found. Checking fallback options...');
  }

  // Fallback to Heuristic Knowledge Base
  console.log('[Fallback] Using Heuristic Knowledge Base...');
  const inputForHeuristic = Array.isArray(symptoms) ? symptoms : [symptoms];
  const result = medicalKnowledge.analyze(inputForHeuristic);

  if (result) {
    return { parsed: result, rawText: JSON.stringify(result), model: 'heuristic-engine-v2' };
  }

  // Final fallback
  console.log('[Fallback] Using generic fallback...');
  const fallback = {
    possibleConditions: [{ condition: "Undetermined", likelihood: "low", description: "Symptoms do not match common patterns." }],
    recommendedSpecialties: ["General Practitioner"],
    urgencyLevel: "routine",
    preliminaryAdvice: "Monitor your symptoms and consult a healthcare professional if they persist or worsen.",
    disclaimer: `ANALYSIS FAILED: Gemini API Error: ${errorMessage}. The local database also could not match your symptoms.`
  };
  return { parsed: fallback, rawText: JSON.stringify(fallback), model: 'fallback-v1' };
}

async function callGemini(symptoms, additionalContext, apiKey) {
  // Handle both array of keywords and natural language string
  const patientDescription = Array.isArray(symptoms) ? symptoms.join(', ') : symptoms;

  const prompt = `You are a professional medical triage assistant. 
Analyze the following patient description. Extract the symptoms and provide a preliminary assessment of possible conditions, recommended specialties, and urgency level.

Patient Description:
"${patientDescription}"

Additional Context:
${additionalContext || 'No additional context provided.'}

RESPONSE REQUIREMENTS:
1. You MUST respond with ONLY a valid JSON object.
2. Structure the JSON exactly as follows:
{
  "possibleConditions": [
    {
      "condition": "Name of condition",
      "likelihood": "high|medium|low",
      "description": "Short explanation (1-2 sentences)"
    }
  ],
  "recommendedSpecialties": ["Specialty 1", "Specialty 2"],
  "urgencyLevel": "emergency|urgent|routine|self_care",
  "preliminaryAdvice": "Immediate self-care or safety instructions",
  "disclaimer": "This is an AI-generated assessment for informational purposes only. Not a substitute for professional medical advice."
}

RULES:
- Provide up to 3 possible conditions.
- urgencyLevel MUST be one of: emergency, urgent, routine, self_care.
- If symptoms indicate life-threatening issues (chest pain, severe bleeding, etc.), set urgencyLevel to 'emergency'.
- Do NOT include any markdown formatting like \`\`\`json or explanatory text outside the JSON.`;

  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          possibleConditions: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                condition: { type: "STRING" },
                likelihood: { type: "STRING", enum: ["high", "medium", "low"] },
                description: { type: "STRING" }
              },
              required: ["condition", "likelihood", "description"]
            }
          },
          recommendedSpecialties: {
            type: "ARRAY",
            items: { type: "STRING" }
          },
          urgencyLevel: { type: "STRING", enum: ["emergency", "urgent", "routine", "self_care"] },
          preliminaryAdvice: { type: "STRING" },
          disclaimer: { type: "STRING" }
        },
        required: ["possibleConditions", "recommendedSpecialties", "urgencyLevel", "preliminaryAdvice", "disclaimer"]
      }
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
    ]
  };

  const response = await axios.post(GEMINI_URL, requestBody, { timeout: 20000 });

  if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    const finishReason = response.data?.candidates?.[0]?.finishReason;
    if (finishReason === 'SAFETY') {
      throw new Error('Gemini blocked the response due to safety filters.');
    }
    throw new Error(`Invalid response from Gemini API. Finish reason: ${finishReason || 'unknown'}`);
  }

  const rawText = response.data.candidates[0].content.parts[0].text;
  console.log(`[Gemini] Raw Response Snippet: ${rawText.substring(0, 150)}...`);

  // Clean up any potential markdown or extra text
  let cleanText = rawText.trim();
  if (cleanText.includes('```')) {
    cleanText = cleanText.replace(/```json\n?|```/gi, '').trim();
  }

  try {
    const parsed = JSON.parse(cleanText);
    return { parsed, rawText, model: 'gemini-2.5-flash' };
  } catch (e) {
    console.error('[Gemini] JSON Parsing Error:', e.message, '\nClean Text Snippet:', cleanText.substring(0, 150));

    // Try greedy regex extraction as a last resort
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return { parsed, rawText, model: 'gemini-2.5-flash-regex' };
      } catch (innerE) {
        throw new Error('Gemini returned text that could not be parsed as JSON even with regex extraction.');
      }
    }
    throw new Error('Gemini returned invalid JSON format.');
  }
}

module.exports = { analyzeSymptoms };
