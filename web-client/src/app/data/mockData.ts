export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  experience: number;
  imageUrl: string;
  available: boolean;
  nextAvailable?: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientAge: number;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'Live' | 'Scheduled' | 'Completed' | 'Pending';
  symptoms?: string[];
  aiInsights?: string;
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  lastVisit: string;
}

export const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Adams',
    specialty: 'Cardiology',
    rating: 4.9,
    reviewCount: 324,
    experience: 15,
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
    available: true,
    nextAvailable: 'Today, 2:00 PM'
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Neurology',
    rating: 4.8,
    reviewCount: 289,
    experience: 12,
    imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
    available: true,
    nextAvailable: 'Today, 3:30 PM'
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Pediatrics',
    rating: 5.0,
    reviewCount: 412,
    experience: 18,
    imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400',
    available: false,
    nextAvailable: 'Tomorrow, 10:00 AM'
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    specialty: 'Orthopedics',
    rating: 4.7,
    reviewCount: 256,
    experience: 10,
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
    available: true,
    nextAvailable: 'Today, 4:00 PM'
  },
  {
    id: '5',
    name: 'Dr. Lisa Kumar',
    specialty: 'Dermatology',
    rating: 4.9,
    reviewCount: 378,
    experience: 14,
    imageUrl: 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=400',
    available: true,
    nextAvailable: 'Today, 1:30 PM'
  },
  {
    id: '6',
    name: 'Dr. Robert Park',
    specialty: 'Psychiatry',
    rating: 4.8,
    reviewCount: 301,
    experience: 16,
    imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400',
    available: true,
    nextAvailable: 'Today, 5:00 PM'
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientName: 'John Doe',
    patientAge: 45,
    doctorName: 'Dr. Sarah Adams',
    specialty: 'Cardiology',
    date: '2026-04-07',
    time: '2:00 PM',
    status: 'Live',
    symptoms: ['Chest pain', 'Shortness of breath'],
    aiInsights: 'Possible cardiac concern. ECG review recommended. Patient history shows hypertension.'
  },
  {
    id: '2',
    patientName: 'Maria Garcia',
    patientAge: 32,
    doctorName: 'Dr. Michael Chen',
    specialty: 'Neurology',
    date: '2026-04-07',
    time: '3:30 PM',
    status: 'Scheduled',
    symptoms: ['Migraine', 'Dizziness'],
    aiInsights: 'Chronic migraine pattern detected. Consider preventive medication adjustment.'
  },
  {
    id: '3',
    patientName: 'David Kim',
    patientAge: 28,
    doctorName: 'Dr. Lisa Kumar',
    specialty: 'Dermatology',
    date: '2026-04-07',
    time: '1:30 PM',
    status: 'Scheduled',
    symptoms: ['Skin rash', 'Itching']
  },
  {
    id: '4',
    patientName: 'Susan Taylor',
    patientAge: 56,
    doctorName: 'Dr. James Wilson',
    specialty: 'Orthopedics',
    date: '2026-04-06',
    time: '11:00 AM',
    status: 'Completed',
    symptoms: ['Knee pain', 'Swelling']
  },
  {
    id: '5',
    patientName: 'Robert Johnson',
    patientAge: 41,
    doctorName: 'Dr. Sarah Adams',
    specialty: 'Cardiology',
    date: '2026-04-08',
    time: '10:00 AM',
    status: 'Pending',
    symptoms: ['High blood pressure']
  }
];

export const mockPatientRecords: PatientRecord[] = [
  {
    id: '1',
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    bloodType: 'A+',
    allergies: ['Penicillin', 'Latex'],
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    lastVisit: '2026-03-15'
  },
  {
    id: '2',
    name: 'Maria Garcia',
    age: 32,
    gender: 'Female',
    bloodType: 'O-',
    allergies: ['None'],
    conditions: ['Chronic Migraine'],
    lastVisit: '2026-02-28'
  },
  {
    id: '3',
    name: 'David Kim',
    age: 28,
    gender: 'Male',
    bloodType: 'B+',
    allergies: ['Shellfish'],
    conditions: ['Eczema'],
    lastVisit: '2026-01-20'
  }
];

export const specialties = [
  { name: 'Cardiology', icon: '❤️' },
  { name: 'Neurology', icon: '🧠' },
  { name: 'Pediatrics', icon: '👶' },
  { name: 'Orthopedics', icon: '🦴' },
  { name: 'Dermatology', icon: '✨' },
  { name: 'Psychiatry', icon: '🧘' },
  { name: 'General', icon: '🏥' },
  { name: 'Dentistry', icon: '🦷' }
];
