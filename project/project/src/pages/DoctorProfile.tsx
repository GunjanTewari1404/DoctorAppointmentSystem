import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { MapPin, Phone, Clock, Calendar } from 'lucide-react';
import type { Doctor } from '../types';
import { format, addDays, isBefore, startOfToday } from 'date-fns';

export function DoctorProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadDoctor();
      loadBookedSlots();
    }
  }, [id, selectedDate]);

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  async function loadBookedSlots() {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('time')
        .eq('doctor_id', id)
        .eq('date', format(selectedDate, 'yyyy-MM-dd'))
        .in('status', ['pending', 'approved']);

      if (error) throw error;
      setBookedSlots(data?.map(appointment => appointment.time) || []);
    } catch (error) {
      console.error('Error loading booked slots:', error);
    }
  }

  async function loadDoctor() {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setDoctor(data);
    } catch (error) {
      console.error('Error loading doctor:', error);
      navigate('/doctors');
    } finally {
      setLoading(false);
    }
  }

  async function handleBookAppointment() {
    if (!user || !doctor || !selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }

    setBookingLoading(true);
    try {
      const { error } = await supabase.from('appointments').insert({
        user_id: user.id,
        doctor_id: doctor.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
      });

      if (error) throw error;

      // Create notification for the doctor
      await supabase.from('notifications').insert({
        user_id: doctor.user_id,
        message: `New appointment request for ${format(selectedDate, 'MMM dd, yyyy')} at ${selectedTime}`,
      });

      toast.success('Appointment requested successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  }

  const availableTimeSlots = doctor?.timings.filter(
    time => !bookedSlots.includes(time)
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!doctor) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-2xl font-medium text-indigo-600">
                {doctor.first_name[0]}{doctor.last_name[0]}
              </span>
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Dr. {doctor.first_name} {doctor.last_name}
              </h2>
              <p className="text-lg text-gray-500">{doctor.specialization}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Contact
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{doctor.phone}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Address
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{doctor.address}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Experience
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{doctor.experience} years</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Consultation Fee</dt>
              <dd className="mt-1 text-sm text-gray-900">${doctor.fee}</dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Book Appointment</h3>
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <Calendar className="h-5 w-5 inline-block mr-2" />
                Select Date
              </label>
              <input
                type="date"
                min={format(addDays(startOfToday(), 1), 'yyyy-MM-dd')}
                max={format(addDays(startOfToday(), 30), 'yyyy-MM-dd')}
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                <Clock className="h-5 w-5 inline-block mr-2" />
                Select Time
              </label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {availableTimeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      selectedTime === time
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
              {availableTimeSlots.length === 0 && (
                <p className="mt-2 text-sm text-red-600">
                  No available slots for this date
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleBookAppointment}
              disabled={!selectedDate || !selectedTime || bookingLoading}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {bookingLoading ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}