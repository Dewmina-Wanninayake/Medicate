/**
 * A comprehensive knowledge base of symptoms and conditions.
 * This provides high-quality heuristic analysis when no AI key is available.
 */
const KNOWLEDGE_BASE = [
  {
    condition: "Migraine",
    symptoms: ["headache", "nausea", "light sensitivity", "blurred vision"],
    specialty: "Neurologist",
    urgency: "routine",
    advice: "Rest in a quiet, dark room. Stay hydrated and avoid known triggers.",
    description: "Recurrent throbbing headache typically affecting one side of the head."
  },
  {
    condition: "Gastroenteritis (Stomach Flu)",
    symptoms: ["nausea", "vomiting", "diarrhea", "abdominal pain", "fever"],
    specialty: "Gastroenterologist",
    urgency: "routine",
    advice: "Drink small sips of water or electrolyte solutions frequently. Stick to bland foods.",
    description: "Inflammation of the stomach and intestines, usually caused by a virus or bacteria."
  },
  {
    condition: "Acute Bronchitis",
    symptoms: ["cough", "mucus", "shortness of breath", "chest discomfort", "fatigue"],
    specialty: "Pulmonologist",
    urgency: "routine",
    advice: "Use a humidifier and get plenty of rest. Avoid smoke and other lung irritants.",
    description: "Inflammation of the lining of your bronchial tubes, which carry air to and from your lungs."
  },
  {
    condition: "Common Cold",
    symptoms: ["runny nose", "sore throat", "cough", "sneezing", "mild fever"],
    specialty: "General Practitioner",
    urgency: "self_care",
    advice: "Rest, fluids, and over-the-counter cold medications can help manage symptoms.",
    description: "A viral infection of your nose and throat."
  },
  {
    condition: "Urinary Tract Infection (UTI)",
    symptoms: ["burning urination", "frequent urination", "pelvic pain", "cloudy urine"],
    specialty: "Urologist",
    urgency: "routine",
    advice: "Drink plenty of water. See a doctor soon as you may need antibiotics.",
    description: "An infection in any part of your urinary system."
  },
  {
    condition: "Angina / Potential MI",
    symptoms: ["chest pain", "pressure", "sweating", "shortness of breath", "arm pain", "jaw pain"],
    specialty: "Cardiologist",
    urgency: "emergency",
    advice: "CALL EMERGENCY SERVICES IMMEDIATELY. Do not wait.",
    description: "Chest pain caused by reduced blood flow to the heart, or a possible heart attack."
  },
  {
    condition: "Anaphylaxis",
    symptoms: ["hives", "swelling", "difficulty breathing", "rapid pulse", "nausea"],
    specialty: "Allergist",
    urgency: "emergency",
    advice: "Use an epinephrine injector if available and call emergency services immediately.",
    description: "A severe, potentially life-threatening allergic reaction."
  },
  {
    condition: "Eczema / Dermatitis",
    symptoms: ["skin rash", "itchy", "dry skin", "redness", "inflammation"],
    specialty: "Dermatologist",
    urgency: "routine",
    advice: "Moisturize regularly with fragrance-free products. Avoid harsh soaps.",
    description: "Conditions that cause the skin to become inflamed or irritated."
  },
  {
    condition: "Pink Eye (Conjunctivitis)",
    symptoms: ["red eyes", "itchy eyes", "watery eyes", "eye discharge"],
    specialty: "Ophthalmologist",
    urgency: "routine",
    advice: "Avoid touching your eyes. Wash hands frequently as it can be highly contagious.",
    description: "An inflammation or infection of the transparent membrane that lines your eyelid."
  }
];

function analyze(reportedSymptoms) {
  const normalized = reportedSymptoms.map(s => s.toLowerCase());
  
  // Calculate match scores for each condition
  const results = KNOWLEDGE_BASE.map(kb => {
    const matches = kb.symptoms.filter(s => 
      normalized.some(reported => reported.includes(s) || s.includes(reported))
    );
    const score = matches.length / kb.symptoms.length;
    return { ...kb, score, matchCount: matches.length };
  })
  .filter(res => res.matchCount > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 3);

  if (results.length === 0) return null;

  return {
    possibleConditions: results.map(r => ({
      condition: r.condition,
      likelihood: r.score > 0.6 ? "high" : r.score > 0.3 ? "medium" : "low",
      description: r.description
    })),
    recommendedSpecialties: [...new Set(results.map(r => r.specialty))],
    urgencyLevel: results.some(r => r.urgency === 'emergency') ? 'emergency' : 
                 results.some(r => r.urgency === 'urgent') ? 'urgent' : 'routine',
    preliminaryAdvice: results[0].advice,
    disclaimer: "HEURISTIC ANALYSIS: This is based on a medical knowledge database. Not a substitute for professional diagnosis."
  };
}

module.exports = { analyze };
