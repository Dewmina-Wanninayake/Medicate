import { Search, Plus, Send, AlertTriangle } from 'lucide-react';
import { useState } from 'react';



export function PrescriptionWorkflow() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('Sarah Johnson');
  const [medications, setMedications] = useState([]);
  const [pharmacyPreference, setPharmacyPreference] = useState('CVS Pharmacy - Main St');

  const commonMedications = [
    { name: 'Metformin', category: 'Diabetes', dosage: '500mg' },
    { name: 'Lisinopril', category: 'Blood Pressure', dosage: '10mg' },
    { name: 'Atorvastatin', category: 'Cholesterol', dosage: '20mg' },
    { name: 'Levothyroxine', category: 'Thyroid', dosage: '50mcg' }
  ];

  const patientAllergies = ['Penicillin', 'Sulfa drugs'];

  const addMedication = () => {
    setMedications([
      ...medications,
      {
        name: '',
        dosage: '',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: ''
      }
    ]);
  };

  const updateMedication = (index, field, value) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const removeMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">E-Prescription</h1>
          <p className="text-gray-600">Create and send digital prescriptions</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl mb-4">Patient Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Patient</label>
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Sarah Johnson</option>
                  <option>Michael Chen</option>
                  <option>Emma Davis</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Preferred Pharmacy</label>
                <select
                  value={pharmacyPreference}
                  onChange={(e) => setPharmacyPreference(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>CVS Pharmacy - Main St</option>
                  <option>Walgreens - Oak Avenue</option>
                  <option>Rite Aid - Downtown</option>
                </select>
              </div>
            </div>

            {patientAllergies.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm text-red-800 mb-1">Known Allergies</h3>
                    <div className="flex flex-wrap gap-2">
                      {patientAllergies.map((allergy, idx) => (
                        <span key={idx} className="px-3 py-1 bg-red-600 text-white rounded-full text-sm">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl">Medications</h2>
              <button
                onClick={addMedication}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Medication
              </button>
            </div>

            {medications.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-600 mb-4">No medications added yet</p>
                <button
                  onClick={addMedication}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First Medication
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {medications.map((med, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm mb-2">Medication Name</label>
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) => updateMedication(index, 'name', e.target.value)}
                          placeholder="Search medication..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2">Dosage</label>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                          placeholder="e.g., 500mg"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm mb-2">Frequency</label>
                        <select
                          value={med.frequency}
                          onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option>Once daily</option>
                          <option>Twice daily</option>
                          <option>Three times daily</option>
                          <option>Four times daily</option>
                          <option>Every 12 hours</option>
                          <option>Every 8 hours</option>
                          <option>As needed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm mb-2">Duration</label>
                        <select
                          value={med.duration}
                          onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option>7 days</option>
                          <option>14 days</option>
                          <option>30 days</option>
                          <option>60 days</option>
                          <option>90 days</option>
                          <option>Ongoing</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm mb-2">Instructions</label>
                      <textarea
                        value={med.instructions}
                        onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                        placeholder="e.g., Take with food in the morning"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={2}
                      />
                    </div>

                    <button
                      onClick={() => removeMedication(index)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {medications.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl mb-4">Review & Send</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm mb-2">Prescription Summary</h3>
                <ul className="space-y-2">
                  {medications.map((med, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      • {med.name} {med.dosage} - {med.frequency} for {med.duration}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  Send to {pharmacyPreference}
                </button>
                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Save as Draft
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Prescription will be electronically sent to the pharmacy and logged in the patient's medical record
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl mb-4">Frequently Prescribed</h2>
          <div className="grid grid-cols-4 gap-3">
            {commonMedications.map((med, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setMedications([
                    ...medications,
                    {
                      name: med.name,
                      dosage: med.dosage,
                      frequency: 'Once daily',
                      duration: '30 days',
                      instructions: ''
                    }
                  ]);
                }}
                className="p-3 text-left border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="text-sm mb-1">{med.name}</div>
                <div className="text-xs text-gray-600">{med.dosage}</div>
                <div className="text-xs text-gray-500 mt-1">{med.category}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}





