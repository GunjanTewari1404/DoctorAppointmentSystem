import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Appointment, Doctor } from '../types';
import { format } from 'date-fns';

interface AppointmentWithDoctor extends Appointment {
  doctor: Doctor;
}

export function Appointments() {
  const { userProfile } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentWithDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (userProfile) {
      loadAppointments();
    }
  }, [userProfile]);

  async function loadAppointments() {
    try {
      let query = supabase
        .from('appointments')
        .select('*, doctor:doctors(*)')
        .order('date', { ascending: true });

      if (userProfile?.role === 'doctor') {
        const { data: doctorData } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', userProfile.id)
          .single();

        if (doctorData) {
          query = query.eq('doctor_id', doctorData.id);
        }
      } else {
        query = query.eq('user_id', userProfile?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }

  async function handleAppointmentStatus(appointmentId: string, status: 'approved' | 'rejected') {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;

      // Create notification for the user
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (appointment) {
        await supabase.from('notifications').insert({
          user_id: appointment.user_id,
          message: `Your appointment for ${format(new Date(appointment.date), 'MMM dd, yyyy')} at ${appointment.time} has been ${status}`,
        });
      }

      toast.success(`Appointment ${status} successfully`);
      setAppointments(apps =>
        apps.map(app =>
          app.id === appointmentId ? { ...app, status } : app
        )
      );
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  }

  const filteredAppointments = appointments.filter(
    appointment => filter === 'all' || appointment.status === filter
  );

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
        <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No appointments found</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <ul className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <li key={appointment.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-lg font-medium text-indigo-600">
                            {appointment.doctor.first_name[0]}
                            {appointment.doctor.last_name[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Dr. {appointment.doctor.first_name} {appointment.doctor.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {appointment.doctor.specialization}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-5 w-5 mr-2" />
                        {format(new Date(appointment.date), 'MMMM d, yyyy')}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-5 w-5 mr-2" />
                        {appointment.time}
                      </div>
                    </div>
                  </div>
                  <div className="ml-6">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        appointment.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                    {userProfile?.role === 'doctor' && appointment.status === 'pending' && (
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => handleAppointmentStatus(appointment.id, 'approved')}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleAppointmentStatus(appointment.id, 'rejected')}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}