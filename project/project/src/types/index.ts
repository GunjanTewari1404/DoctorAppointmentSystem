export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'doctor';
  created_at: string;
}

export interface Doctor {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  experience: number;
  fee: number;
  phone: string;
  address: string;
  status: 'pending' | 'approved' | 'blocked';
  timings: string[];
  created_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  doctor_id: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  seen: boolean;
  created_at: string;
}