import { useState } from 'react';
import { Search, Filter, Star } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { mockDoctors } from "../../data/mockData";

export default function DoctorSearch({ onDoctorSelect }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDoctors = mockDoctors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input 
            placeholder="Search by name or specialty..." 
            className="pl-10 rounded-full bg-white border-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="rounded-full shadow-sm bg-white">
          <Filter className="w-5 h-5 mr-2" /> Filters
        </Button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDoctors.map(doctor => (
          <Card 
            key={doctor.id} 
            className="rounded-[24px] border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-card"
            onClick={() => onDoctorSelect(doctor)}
          >
            <div className="flex p-4 gap-4 items-center">
              <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                <img src={doctor.imageUrl} alt={doctor.name} className="object-cover w-full h-full" />
                {doctor.available && (
                  <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{doctor.name}</h3>
                <p className="text-sm text-primary font-medium">{doctor.specialty}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>{doctor.rating}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
