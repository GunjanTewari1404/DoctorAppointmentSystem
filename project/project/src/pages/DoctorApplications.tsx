import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';
import type { Doctor } from '../types';

export function DoctorApplications() {
  const { userProfile } = useAuth();
  const [applications, setApplications] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.role === 'admin') {
      loadApplications();
    }
  }, [userProfile]);

  async function loadApplications() {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }

  async function handleApplicationStatus(doctorId: string, status: 'approved' | 'blocked') {
    try {
      const doctor = applications.find(app => app.id === doctorId);
      if (!doctor) return;

      if (status === 'approved') {
        // First update the user's role to doctor
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: 'doctor' })
          .eq('id', doctor.user_id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
          throw new Error('Failed to update user role');
        }

        // Then update the doctor status
        const { error: doctorError } = await supabase
          .from('doctors')
          .update({ status })
          .eq('id', doctorId);

        if (doctorError) {
          console.error('Error updating doctor:', doctorError);
          // Rollback the profile update if doctor update fails
          await supabase
            .from('profiles')
            .update({ role: 'user' })
            .eq('id', doctor.user_id);
          throw new Error('Failed to update doctor status');
        }
      } else {
        // If blocking, just update the doctor status
        const { error: doctorError } = await supabase
          .from('doctors')
          .update({ status })
          .eq('id', doctorId);

        if (doctorError) throw doctorError;
      }

      // Create notification for the doctor
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: doctor.user_id,
          message: `Your doctor application has been ${status}. ${
            status === 'approved' 
              ? 'You can now log in as a doctor and start accepting appointments.' 
              : 'Please contact support for more information.'
          }`,
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Continue despite notification error
      }

      toast.success(`Application ${status} successfully`);
      setApplications(apps => apps.filter(app => app.id !== doctorId));
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    }
  }

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
        <h1 className="text-2xl font-semibold text-gray-900">Doctor Applications</h1>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500 text-center">No pending applications</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <ul className="divide-y divide-gray-200">
            {applications.map((application) => (
              <li key={application.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      Dr. {application.first_name} {application.last_name}
                    </h3>
                    <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <p className="text-sm text-gray-500">Specialization</p>
                        <p className="text-sm font-medium text-gray-900">
                          {application.specialization}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Experience</p>
                        <p className="text-sm font-medium text-gray-900">
                          {application.experience} years
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Fee</p>
                        <p className="text-sm font-medium text-gray-900">
                          ${application.fee}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">
                          {application.phone}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-sm font-medium text-gray-900">
                          {application.address}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6 flex items-center space-x-3">
                    <button
                      onClick={() => handleApplicationStatus(application.id, 'approved')}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleApplicationStatus(application.id, 'blocked')}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </button>
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