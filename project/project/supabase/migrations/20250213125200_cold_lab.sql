/*
  # Initial Schema Setup for Doctor Appointment System

  1. Tables
    - profiles (extends auth.users)
      - id (uuid, references auth.users)
      - role (enum: admin, user, doctor)
      - created_at (timestamp)
    
    - doctors
      - id (uuid, primary key)
      - user_id (uuid, references profiles)
      - first_name (text)
      - last_name (text)
      - specialization (text)
      - experience (integer)
      - fee (integer)
      - phone (text)
      - address (text)
      - status (enum: pending, approved, blocked)
      - timings (text array)
      - created_at (timestamp)
    
    - appointments
      - id (uuid, primary key)
      - user_id (uuid, references profiles)
      - doctor_id (uuid, references doctors)
      - date (date)
      - time (text)
      - status (enum: pending, approved, rejected)
      - created_at (timestamp)
    
    - notifications
      - id (uuid, primary key)
      - user_id (uuid, references profiles)
      - message (text)
      - seen (boolean)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Set up appropriate policies for each role
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'user', 'doctor');
CREATE TYPE doctor_status AS ENUM ('pending', 'approved', 'blocked');
CREATE TYPE appointment_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role user_role DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- Create doctors table
CREATE TABLE doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  specialization text NOT NULL,
  experience integer NOT NULL,
  fee integer NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  status doctor_status DEFAULT 'pending',
  timings text[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  doctor_id uuid REFERENCES doctors ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  status appointment_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(doctor_id, date, time)
);

-- Create notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  seen boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Doctors policies
CREATE POLICY "Doctors are viewable by everyone"
  ON doctors FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage doctors"
  ON doctors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Doctors can update their own info"
  ON doctors FOR UPDATE
  USING (user_id = auth.uid());

-- Appointments policies
CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  USING (
    user_id = auth.uid() OR
    doctor_id IN (
      SELECT id FROM doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can update appointment status"
  ON appointments FOR UPDATE
  USING (
    doctor_id IN (
      SELECT id FROM doctors WHERE user_id = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own notification status"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();