import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, Star } from 'lucide-react';
import type { Doctor } from '../types';

export function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');

  useEffect(() => {
    loadDoctors();
  }, []);

  async function loadDoctors() {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = 
      doctor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = !selectedSpecialization || 
      doctor.specialization === selectedSpecialization;

    return matchesSearch && matchesSpecialization;
  });

  const specializations = Array.from(
    new Set(doctors.map(doctor => doctor.specialization))
  ).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Find a Doctor</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDoctors.map((doctor) => (
          <Link
            key={doctor.id}
            to={`/doctors/${doctor.id}`}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-xl font-medium text-indigo-600">
                      {doctor.first_name[0]}{doctor.last_name[0]}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Dr. {doctor.first_name} {doctor.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">{doctor.specialization}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span>{doctor.experience} years experience</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Consultation Fee: ${doctor.fee}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {doctor.timings.slice(0, 3).map((time, index) => (
                    <span
                      key={time}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {time}
                    </span>
                  ))}
                  {doctor.timings.length > 3 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      +{doctor.timings.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No doctors found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}