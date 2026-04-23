const axios = require('axios');
const medicalKnowledge = require('./medicalKnowledge');

/**
 * Calls the Gemini API for medical triage analysis.
 * Falls back to heuristic knowledge base if API fails.
 */
async function analyzeSymptoms(symptoms, additionalContext = '') {
  const geminiKey = process.env.GEMINI_API_KEY;
  
  if (geminiKey && !geminiKey.includes('your-gemini-key')) {
    try {
      console.log(`Analyzing symptoms with Gemini API: ${symptoms.join(', ')}`);
      const result = await callGemini(symptoms, additionalContext, geminiKey);
      console.log('Gemini Analysis Successful:', result.model);
      return result;
    } catch (err) {
      console.error('Gemini API Error:', err.message);
      if (err.response?.data) console.error('Gemini API Response Error:', JSON.stringify(err.response.data));
    }
  }

  // Fallback to Heuristic Knowledge Base
  console.log('Falling back to Heuristic Knowledge Base...');
  const result = medicalKnowledge.analyze(symptoms);
  
  if (result) {
    return { parsed: result, rawText: JSON.stringify(result), model: 'heuristic-engine-v2' };
  }

  // Basic fallback
  const fallback = {
    possibleConditions: [{ condition: "Undetermined", likelihood: "low", description: "Symptoms do not match common patterns in our database." }],
    recommendedSpecialties: ["General Practitioner"],
    urgencyLevel: "routine",
    preliminaryAdvice: "Monitor your symptoms and consult a doctor if they persist or worsen.",
    disclaimer: "BASIC ANALYSIS: Please consult a healthcare professional."
  };
  return { parsed: fallback, rawText: JSON.stringify(fallback), model: 'fallback-v1' };
}

async function callGemini(symptoms, additionalContext, apiKey) {
  const symptomList = symptoms.map((s) => `- ${s}`).join('\n');
  const prompt = `You are a medical triage assistant. Analyze these symptoms:
${symptomList}
Context: ${additionalContext}

Respond ONLY with a valid JSON object in exactly this structure:
{
  "possibleConditions": [
    {
      "condition": "Condition name",
      "likelihood": "high|medium|low",
      "description": "Brief description"
    }
  ],
  "recommendedSpecialties": ["Specialty"],
  "urgencyLevel": "emergency|urgent|routine|self_care",
  "preliminaryAdvice": "Safety advice",
  "disclaimer": "Medical disclaimer"
}

Rules:
- List up to 3 conditions
- List up to 3 specialties
- urgencyLevel must be one of: emergency, urgent, routine, self_care
- ALWAYS include a disclaimer
- Respond ONLY with the JSON object`;

  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const response = await axios.post(GEMINI_URL, {
    contents: [{ parts: [{ text: prompt }] }]
  }, { timeout: 15000 });

  if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response from Gemini API');
  }

  const rawText = response.data.candidates[0].content.parts[0].text;
  
  try {
    // Robust JSON extraction
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    
    const parsed = JSON.parse(jsonMatch[0]);
    return { parsed, rawText, model: 'gemini-1.5-flash' };
  } catch (e) {
    console.error('JSON Parsing Error:', e.message, 'Raw Text:', rawText);
    throw new Error('Gemini returned invalid JSON format');
  }
}

module.exports = { analyzeSymptoms };
