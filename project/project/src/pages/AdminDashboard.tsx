import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, UserCog, Calendar } from 'lucide-react';
import type { Doctor, Appointment } from '../types';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    pendingApplications: 0,
    totalAppointments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentApplications, setRecentApplications] = useState<Doctor[]>([]);

  useEffect(() => {
    async function loadStats() {
      try {
        // Get total approved doctors
        const { data: doctors, error: doctorsError } = await supabase
          .from('doctors')
          .select('status')
          .eq('status', 'approved');

        // Get pending applications
        const { data: pending, error: pendingError } = await supabase
          .from('doctors')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(5);

        // Get total appointments
        const { count: appointmentsCount, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true });

        if (doctorsError || pendingError || appointmentsError) throw new Error('Error fetching stats');

        setStats({
          totalDoctors: doctors?.length || 0,
          pendingApplications: pending?.length || 0,
          totalAppointments: appointmentsCount || 0,
        });

        if (pending) {
          setRecentApplications(pending);
        }
      } catch (error) {
        console.error('Error loading admin stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Doctors
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalDoctors}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCog className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Applications
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.pendingApplications}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Appointments
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalAppointments}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Recent Doctor Applications
          </h3>
          <div className="mt-4">
            {recentApplications.length === 0 ? (
              <p className="text-gray-500">No pending applications</p>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <div
                    key={application.id}
                    className="bg-gray-50 p-4 rounded-md"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Dr. {application.first_name} {application.last_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {application.specialization}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>
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