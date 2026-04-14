import { Search, Star, MapPin, Clock, Video, Calendar, Filter, Languages } from 'lucide-react';
import { useState } from 'react';



export function DoctorSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const specialties = [
    'All Specialties',
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'General Practice',
    'Neurology',
    'Pediatrics',
    'Psychiatry'
  ];

  const languages = ['All Languages', 'English', 'Spanish', 'Mandarin', 'Hindi', 'French'];

  const doctors = [
    {
      id: '1',
      name: 'Dr. Emily Chen',
      specialty: 'Cardiology',
      rating: 4.9,
      reviewCount: 342,
      experience: 15,
      languages: ['English', 'Mandarin'],
      location: 'New York, NY',
      avatar: 'EC',
      availability: 'available',
      consultationFee: 150,
      nextAvailable: 'Today, 2:00 PM'
    },
    {
      id: '2',
      name: 'Dr. Michael Rodriguez',
      specialty: 'Dermatology',
      rating: 4.8,
      reviewCount: 289,
      experience: 12,
      languages: ['English', 'Spanish'],
      location: 'Los Angeles, CA',
      avatar: 'MR',
      availability: 'available',
      consultationFee: 120,
      nextAvailable: 'Tomorrow, 10:00 AM'
    },
    {
      id: '3',
      name: 'Dr. Sarah Patel',
      specialty: 'Endocrinology',
      rating: 4.95,
      reviewCount: 456,
      experience: 18,
      languages: ['English', 'Hindi'],
      location: 'Chicago, IL',
      avatar: 'SP',
      availability: 'busy',
      consultationFee: 180,
      nextAvailable: 'Apr 15, 9:00 AM'
    },
    {
      id: '4',
      name: 'Dr. James Wilson',
      specialty: 'General Practice',
      rating: 4.7,
      reviewCount: 521,
      experience: 20,
      languages: ['English'],
      location: 'Boston, MA',
      avatar: 'JW',
      availability: 'available',
      consultationFee: 100,
      nextAvailable: 'Today, 4:30 PM'
    }
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
    const matchesLanguage = selectedLanguage === 'all' || doctor.languages.includes(selectedLanguage);
    const matchesRating = doctor.rating >= minRating;

    return matchesSearch && matchesSpecialty && matchesLanguage && matchesRating;
  });

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Find a Doctor</h1>
          <p className="text-gray-600">Search by specialty, language, or availability</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or specialty..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm mb-2">Specialty</label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {specialties.map(spec => (
                    <option key={spec} value={spec === 'All Specialties' ? 'all' : spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Language</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang === 'All Languages' ? 'all' : lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Minimum Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Any Rating</option>
                  <option value={4}>4+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                  <option value={4.8}>4.8+ Stars</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">{filteredDoctors.length} doctors found</p>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Sort by</option>
            <option>Sort by</option>
            <option>Sort by</option>
            <option>Sort by</option>
            <option>Sort by (Low to High)</option>
            <option>Sort by (High to Low)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {filteredDoctors.map(doctor => (
            <div key={doctor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-4 mb-4">
                <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl flex-shrink-0">
                  {doctor.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl mb-1">{doctor.name}</h3>
                      <p className="text-gray-600">{doctor.specialty}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      doctor.availability === 'available'
                        ? 'bg-green-100 text-green-700'
                        : doctor.availability === 'busy'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {doctor.availability === 'available' ? 'Available' : doctor.availability === 'busy' ? 'Busy' : 'Offline'}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{doctor.rating}</span>
                      <span className="text-gray-500">({doctor.reviewCount})</span>
                    </div>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">{doctor.experience} years exp.</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {doctor.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Languages className="w-4 h-4" />
                  {doctor.languages.join(', ')}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {doctor.nextAvailable}
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Fee: </span>
                  <span className="text-gray-900">${doctor.consultationFee}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Book Appointment
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Video className="w-4 h-4" />
                  Instant Call
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}




