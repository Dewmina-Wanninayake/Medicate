import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Plus, Trash2, Pill, Loader2, Save, X } from 'lucide-react';
import { clinicalAPI } from '../services/api';
import { toast } from 'sonner';

export default function PrescriptionModal({ open, onClose, appointment }) {
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [saving, setSaving] = useState(false);

  if (!open || !appointment) return null;

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const updateMedication = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const removeMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!diagnosis || medications.some(m => !m.name || !m.dosage)) {
      toast.error('Please fill in diagnosis and at least one medication details');
      return;
    }

    setSaving(true);
    try {
      await clinicalAPI.createPrescription({
        patientId:     appointment.patientId,
        patientName:   appointment.patientName,
        appointmentId: appointment._id || appointment.id,
        diagnosis,
        notes,
        medications,
      });
      toast.success('Prescription issued successfully');
      onClose();
    } catch (err) {
      toast.error('Failed to issue prescription');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-primary px-8 py-6 text-primary-foreground flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Issue Digital Prescription</h2>
            <p className="text-primary-foreground/80 text-sm">For {appointment.patientName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto space-y-6 text-foreground">
          <div className="space-y-2">
            <label className="text-sm font-black uppercase text-muted-foreground ml-1">Diagnosis</label>
            <Input 
              placeholder="e.g., Seasonal Influenza, Bacterial Pharyngitis" 
              value={diagnosis}
              onChange={e => setDiagnosis(e.target.value)}
              className="rounded-2xl border-2 focus:border-primary"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-black uppercase text-muted-foreground ml-1">Medications</label>
              <Button onClick={addMedication} variant="outline" size="sm" className="rounded-full gap-2">
                <Plus className="w-4 h-4" /> Add Med
              </Button>
            </div>
            
            <div className="space-y-3">
              {medications.map((med, idx) => (
                <div key={idx} className="p-4 rounded-3xl bg-muted/30 border border-border space-y-3 relative group">
                  <div className="grid grid-cols-2 gap-3">
                    <Input 
                      placeholder="Medication Name" 
                      value={med.name}
                      onChange={e => updateMedication(idx, 'name', e.target.value)}
                      className="rounded-xl"
                    />
                    <Input 
                      placeholder="Dosage (e.g. 500mg)" 
                      value={med.dosage}
                      onChange={e => updateMedication(idx, 'dosage', e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input 
                      placeholder="Frequency (e.g. 2x daily)" 
                      value={med.frequency}
                      onChange={e => updateMedication(idx, 'frequency', e.target.value)}
                      className="rounded-xl"
                    />
                    <Input 
                      placeholder="Duration (e.g. 7 days)" 
                      value={med.duration}
                      onChange={e => updateMedication(idx, 'duration', e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  {medications.length > 1 && (
                    <button 
                      onClick={() => removeMedication(idx)}
                      className="absolute -top-2 -right-2 bg-destructive text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black uppercase text-muted-foreground ml-1">Additional Instructions</label>
            <Textarea 
              placeholder="e.g., Take after meals, Drink plenty of water..." 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="rounded-2xl min-h-[100px]"
            />
          </div>
        </div>

        <div className="p-8 bg-muted/30 border-t flex gap-4">
          <Button variant="outline" onClick={onClose} className="rounded-full flex-1 py-6 font-bold shadow-sm">Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={saving}
            className="rounded-full flex-1 py-6 font-bold bg-primary hover:bg-accent gap-2 shadow-lg"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Confirm & Send
          </Button>
        </div>
      </div>
    </div>
  );
}
