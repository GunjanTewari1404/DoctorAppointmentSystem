import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Calendar, Users, Clock } from 'lucide-react';
import type { Appointment, Doctor } from '../types';

export function Dashboard() {
  const { userProfile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        if (userProfile?.role === 'user') {
          // Load user's appointments
          const { data: appointmentsData } = await supabase
            .from('appointments')
            .select('*, doctor:doctors(*)')
            .eq('user_id', userProfile.id)
            .order('date', { ascending: true })
            .limit(5);

          if (appointmentsData) {
            setAppointments(appointmentsData);
          }

          // Load available doctors
          const { data: doctorsData } = await supabase
            .from('doctors')
            .select('*')
            .eq('status', 'approved')
            .limit(5);

          if (doctorsData) {
            setDoctors(doctorsData);
          }
        } else if (userProfile?.role === 'doctor') {
          // Load doctor's appointments
          const { data: doctorData } = await supabase
            .from('doctors')
            .select('id')
            .eq('user_id', userProfile.id)
            .single();

          if (doctorData) {
            const { data: appointmentsData } = await supabase
              .from('appointments')
              .select('*')
              .eq('doctor_id', doctorData.id)
              .order('date', { ascending: true })
              .limit(5);

            if (appointmentsData) {
              setAppointments(appointmentsData);
            }
          }
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (userProfile) {
      loadDashboardData();
    }
  }, [userProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Upcoming Appointments
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {appointments.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {userProfile?.role === 'user' && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Available Doctors
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {doctors.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {userProfile?.role === 'doctor' && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Today's Appointments
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {appointments.filter(
                        (apt) => apt.date === new Date().toISOString().split('T')[0]
                      ).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Recent Appointments
          </h3>
          <div className="mt-4">
            {appointments.length === 0 ? (
              <p className="text-gray-500">No appointments found.</p>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-gray-50 p-4 rounded-md flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(appointment.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">{appointment.time}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        appointment.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}