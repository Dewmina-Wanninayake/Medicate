const mongoose = require('mongoose');

const symptomCheckSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true },
    symptoms: [{ type: String, required: true }],        // e.g. ["headache", "fever", "fatigue"]
    additionalContext: { type: String },                  // free text: age, duration, severity etc.
    aiResponse: {
      possibleConditions: [
        {
          condition: String,
          likelihood: String,   // "high" | "medium" | "low"
          description: String,
        },
      ],
      recommendedSpecialties: [String],   // e.g. ["General Practitioner", "Neurologist"]
      urgencyLevel: {
        type: String,
        enum: ['emergency', 'urgent', 'routine', 'self_care'],
      },
      preliminaryAdvice: String,
      disclaimer: String,
    },
    rawAiText: { type: String },   // store raw AI output for audit
    model: { type: String },       // which AI model was used
  },
  { timestamps: true }
);

module.exports = mongoose.model('SymptomCheck', symptomCheckSchema);
