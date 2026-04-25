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
  },
  {
    condition: "Seasonal Allergies",
    symptoms: ["sneezing", "itchy eyes", "runny nose", "congestion", "watery eyes"],
    specialty: "Allergist",
    urgency: "self_care",
    advice: "Avoid known allergens. Over-the-counter antihistamines can help.",
    description: "An immune system reaction to pollen or other environmental triggers."
  },
  {
    condition: "Lower Back Pain (Muscular)",
    symptoms: ["back pain", "muscle ache", "stiffness", "limited range of motion"],
    specialty: "Physiotherapist",
    urgency: "routine",
    advice: "Apply heat or ice. Stay active with gentle stretching. Avoid heavy lifting.",
    description: "Pain or discomfort in the lower part of the spine, often due to muscle strain."
  },
  {
    condition: "Influenza (Flu)",
    symptoms: ["fever", "chills", "muscle aches", "cough", "congestion", "fatigue"],
    specialty: "General Practitioner",
    urgency: "routine",
    advice: "Rest and stay hydrated. Antiviral medications may help if taken early.",
    description: "A highly contagious viral infection of the respiratory system."
  }
];

function analyze(reportedSymptoms) {
  // Convert reported symptoms into a single lowercase string
  const fullDescription = reportedSymptoms.join(' ').toLowerCase();

  // Calculate match scores for each condition based on keyword presence
  const results = KNOWLEDGE_BASE.map(kb => {
    let matchCount = 0;

    // Check if any of the condition's symptom keywords appear in the natural language text
    kb.symptoms.forEach(s => {
      const keyword = s.toLowerCase();
      // Simple exact phrase match within the full text
      if (fullDescription.includes(keyword)) {
        matchCount++;
      } else {
        // Fallback: Check if individual words of the keyword match
        const words = keyword.split(' ');
        if (words.length > 1 && words.some(w => w.length > 3 && fullDescription.includes(w))) {
          matchCount += 0.5; // partial match
        }
      }
    });

    const score = matchCount / kb.symptoms.length;
    return { ...kb, score, matchCount };
  })
    .filter(res => res.matchCount >= 0.5)
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
