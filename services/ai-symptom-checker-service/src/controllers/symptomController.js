const SymptomCheck = require('../models/SymptomCheck');
const { analyzeSymptoms } = require('../config/anthropic');

// POST /api/symptoms/check
// Patient submits symptoms and receives AI-powered preliminary analysis
async function checkSymptoms(req, res) {
  try {
    const { symptoms, additionalContext } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        error: 'symptoms must be a non-empty array of strings (e.g. ["headache", "fever"])',
      });
    }

    if (symptoms.length > 15) {
      return res.status(400).json({ error: 'Maximum 15 symptoms per check' });
    }

    // Sanitize symptoms
    const cleanedSymptoms = symptoms
      .map((s) => String(s).trim().toLowerCase())
      .filter((s) => s.length > 0);

    // Call AI
    const { parsed, rawText, model } = await analyzeSymptoms(cleanedSymptoms, additionalContext);

    // Persist the check
    const record = await SymptomCheck.create({
      patientId: req.userId,
      symptoms: cleanedSymptoms,
      additionalContext: additionalContext || '',
      aiResponse: parsed,
      rawAiText: rawText,
      model,
    });

    res.status(201).json({
      checkId: record._id,
      symptoms: cleanedSymptoms,
      analysis: parsed,
      checkedAt: record.createdAt,
    });
  } catch (err) {
    console.error('Symptom check error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

// GET /api/symptoms/history
// Patient retrieves their past symptom checks
async function getHistory(req, res) {
  try {
    const checks = await SymptomCheck.find({ patientId: req.userId })
      .select('-rawAiText')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(checks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/symptoms/history/:id
// Patient retrieves a specific symptom check result
async function getCheckById(req, res) {
  try {
    const check = await SymptomCheck.findById(req.params.id).select('-rawAiText');
    if (!check) return res.status(404).json({ error: 'Symptom check not found' });

    if (req.userRole === 'patient' && check.patientId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(check);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/symptoms/specialties
// Returns the full list of doctor specialties the system recognises
// (Useful for the frontend to show a specialty filter when booking)
async function listSpecialties(req, res) {
  const specialties = [
    'General Practitioner',
    'Cardiologist',
    'Neurologist',
    'Dermatologist',
    'Gastroenterologist',
    'Pulmonologist',
    'Endocrinologist',
    'Orthopedist',
    'Psychiatrist',
    'Ophthalmologist',
    'ENT Specialist',
    'Urologist',
    'Gynecologist',
    'Oncologist',
    'Rheumatologist',
    'Nephrologist',
    'Infectious Disease Specialist',
    'Hematologist',
    'Allergist',
    'Pediatrician',
  ];
  res.json({ specialties });
}

module.exports = { checkSymptoms, getHistory, getCheckById, listSpecialties };
