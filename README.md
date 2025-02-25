# Doctor Appointment System

A modern, full-stack web application for managing doctor appointments, built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### For Patients
- Search and browse available doctors
- Book appointments with preferred doctors
- View appointment history and status
- Real-time notifications for appointment updates

### For Doctors
- Create and manage professional profile
- Set available time slots
- Accept or reject appointment requests
- View upcoming appointments and schedule

### For Administrators
- Review and approve doctor applications
- Manage user roles and permissions

## Tech Stack

- **Frontend**
  - React 18
  - TypeScript
  - Tailwind CSS
  - Lucide React (icons)
  - React Router DOM
  - React Hot Toast (notifications)

- **Backend**
  - Supabase (Backend as a Service)
  - PostgreSQL Database
  - Row Level Security (RLS)
  - Real-time subscriptions

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd doctor-appointment-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/        # Reusable UI components
├── context/          # React context providers
├── lib/              # Utility functions and API clients
├── pages/            # Page components
├── types/            # TypeScript type definitions
└── main.tsx         # Application entry point

supabase/
└── migrations/      # Database migrations
```

## Key Components

### Authentication
- Email/password authentication
- Protected routes with role-based access
- Persistent sessions

### Real-time Features
- Instant notifications for appointment updates
- Live updates for doctor availability
- Real-time appointment status changes

### Database Schema

#### Tables
- `profiles`: User profiles and roles
- `doctors`: Doctor information and availability
- `appointments`: Appointment bookings and status
- `notifications`: System notifications

## Security

- Row Level Security (RLS) policies for data protection
- Role-based access control
- Secure authentication flow
- Protected API endpoints

## User Roles

### Patient (default user)
- Browse doctors
- Book appointments
- Receive notifications
- View appointment history

### Doctor
- Manage profile
- Set availability
- Handle appointment requests
- View scheduled appointments

### Administrator
- Approve doctor applications
- Manage user roles
- System oversight
- Monitor activities

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Database Migrations

The project uses Supabase migrations for database schema management. Migrations are located in the `supabase/migrations` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
