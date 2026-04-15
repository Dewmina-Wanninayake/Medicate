const OpenAI = require('openai');

// Initialize OpenAI client with API key from environment variables
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── POST /api/ai/symptoms ─────────────────────────────────────────────────
// Protected | Patient only | Analyze symptoms using GPT and return suggestions
exports.checkSymptoms = async (req, res) => {
  try {
    const { symptoms, age, gender } = req.body;

    // Symptoms are mandatory to proceed
    if (!symptoms) {
      return res.status(400).json({ success: false, message: 'Symptoms are required' });
    }

    // Add patient context to prompt if age and gender are provided
    const patientContext = age && gender ? `Patient: ${gender}, ${age} years old.` : '';

    const response = await client.chat.completions.create({
      model:      'gpt-4o-mini',
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          // Instruct AI to always respond in a strict JSON format
          content: `You are a medical triage assistant helping patients in Sri Lanka.
Given a patient's symptoms, respond in this exact JSON format:
{
  "possibleConditions":    ["condition1", "condition2", "condition3"],
  "recommendedSpecialty":  "Doctor specialty name",
  "urgencyLevel":          "low" | "medium" | "high",
  "urgencyReason":         "brief reason",
  "generalAdvice":         "brief general advice"
}
Keep responses concise. Never diagnose definitively. Always recommend seeing a real doctor.`
        },
        {
          role: 'user',
          // Combine patient context + symptoms into a single message
          content: `${patientContext} Symptoms: ${symptoms}`
        }
      ]
    });

    const raw = response.choices[0].message.content;

    // Parse AI response — strip markdown code fences if present (e.g. ```json ... ```)
    let suggestion;
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim();
      suggestion = JSON.parse(cleaned);
    } catch {
      // If JSON parsing fails, return raw text as fallback
      suggestion = { rawResponse: raw };
    }

    res.status(200).json({
      success: true,
      data:       suggestion,
      disclaimer: 'This is not a medical diagnosis. Please consult a qualified doctor.'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};