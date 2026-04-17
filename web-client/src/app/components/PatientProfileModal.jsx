import React, { useState } from 'react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  User, 
  Calendar, 
  Droplets, 
  MapPin, 
  Phone, 
  Heart,
  Edit2,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function PatientProfileModal({ user }) {
  const { refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const initialProfile = user?.patientProfile || {};
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    patientProfile: {
      dateOfBirth: initialProfile.dateOfBirth ? new Date(initialProfile.dateOfBirth).toISOString().split('T')[0] : '',
      gender: initialProfile.gender || '',
      bloodGroup: initialProfile.bloodGroup || '',
      address: initialProfile.address || '',
      emergencyContact: {
        name: initialProfile.emergencyContact?.name || '',
        phone: initialProfile.emergencyContact?.phone || '',
      }
    }
  });

  if (!user) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('patientProfile.')) {
      const field = name.split('.')[1];
      if (field === 'emergencyContact') {
         // handle sub-fields if needed, but let's keep it simple for now
      } else {
        setFormData(prev => ({
          ...prev,
          patientProfile: {
            ...prev.patientProfile,
            [field]: value
          }
        }));
      }
    } else if (name.startsWith('emergency.')) {
        const field = name.split('.')[1];
        setFormData(prev => ({
            ...prev,
            patientProfile: {
                ...prev.patientProfile,
                emergencyContact: {
                    ...prev.patientProfile.emergencyContact,
                    [field]: value
                }
            }
        }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await userAPI.updateProfile(formData);
      await refreshUser();
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const InfoRow = ({ icon: Icon, label, value, name, type = "text", options = null }) => (
    <div className="flex items-center gap-4 p-3 rounded-2xl bg-muted/30 border border-border/50">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        {isEditing ? (
          options ? (
            <select
              name={name}
              value={value}
              onChange={handleInputChange}
              className="w-full bg-transparent border-none focus:ring-0 font-semibold p-0 h-auto"
            >
              <option value="">Select {label}</option>
              {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : (
            <input
              type={type}
              name={name}
              value={value}
              onChange={handleInputChange}
              className="w-full bg-transparent border-none focus:ring-0 font-semibold p-0 h-auto"
            />
          )
        ) : (
          <p className="font-semibold text-foreground">{type === 'date' ? formatDate(value) : (value || 'Not set')}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full max-h-[85vh] overflow-hidden">
      <DialogHeader className="mb-6 shrink-0">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleInputChange}
                    className="h-8 w-24"
                  />
                  <Input 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleInputChange}
                    className="h-8 w-24"
                  />
                </div>
              ) : (
                <div>{user.firstName} {user.lastName}</div>
              )}
              <div className="text-sm font-normal text-muted-foreground">{user.email}</div>
            </div>
          </DialogTitle>
          {!isEditing && (
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="rounded-full">
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
        </div>
        <DialogDescription>
          Personal health profile and emergency contact information.
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow 
            icon={Calendar} 
            label="Date of Birth" 
            value={formData.patientProfile.dateOfBirth} 
            name="patientProfile.dateOfBirth"
            type="date"
          />
          <InfoRow 
            icon={User} 
            label="Gender" 
            value={formData.patientProfile.gender} 
            name="patientProfile.gender"
            options={['male', 'female', 'other']}
          />
          <InfoRow 
            icon={Droplets} 
            label="Blood Group" 
            value={formData.patientProfile.bloodGroup} 
            name="patientProfile.bloodGroup"
          />
          <InfoRow 
            icon={Phone} 
            label="Phone Number" 
            value={`${user.phone?.countryCode || ''} ${user.phone?.number || ''}`.trim()} 
            name="phone"
            type="text"
            disabled={true} // For now, let's keep phone fixed as it's often part of identity
          />
          <div className="md:col-span-2">
            <InfoRow 
              icon={MapPin} 
              label="Home Address" 
              value={formData.patientProfile.address} 
              name="patientProfile.address"
            />
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4" /> Emergency Contact
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-primary/5 p-4 rounded-[24px] border border-primary/10">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Name</p>
              {isEditing ? (
                <Input 
                  name="emergency.name" 
                  value={formData.patientProfile.emergencyContact.name} 
                  onChange={handleInputChange}
                  className="bg-transparent border-none p-0 h-auto font-semibold focus-visible:ring-0"
                />
              ) : (
                <p className="font-semibold">{formData.patientProfile.emergencyContact.name || 'Not set'}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Phone</p>
              {isEditing ? (
                <Input 
                  name="emergency.phone" 
                  value={formData.patientProfile.emergencyContact.phone} 
                  onChange={handleInputChange}
                  className="bg-transparent border-none p-0 h-auto font-semibold focus-visible:ring-0"
                />
              ) : (
                <p className="font-semibold">{formData.patientProfile.emergencyContact.phone || 'Not set'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <DialogFooter className="mt-6 pt-4 border-t gap-2 shrink-0">
          <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-full gap-2" disabled={isLoading}>
            <X className="w-4 h-4" /> Cancel
          </Button>
          <Button onClick={handleSave} className="rounded-full gap-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </DialogFooter>
      )}
    </div>
  );
}
