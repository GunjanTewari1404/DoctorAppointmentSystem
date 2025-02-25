import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UserCog, 
  LogOut, 
  Menu,
  X,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { toast } from 'react-hot-toast';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['user', 'doctor'],
  },
  {
    label: 'Admin Dashboard',
    path: '/admin',
    icon: <ShieldCheck className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Appointments',
    path: '/appointments',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['user', 'doctor'],
  },
  {
    label: 'Doctors',
    path: '/doctors',
    icon: <Users className="w-5 h-5" />,
    roles: ['user', 'admin'],
  },
  {
    label: 'Doctor Applications',
    path: '/doctor-applications',
    icon: <UserCog className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Apply as Doctor',
    path: '/apply-doctor',
    icon: <Stethoscope className="w-5 h-5" />,
    roles: ['user'],
  },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(userProfile?.role || '')
  );

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b px-4 py-2">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          <NotificationBell />
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform lg:translate-x-0 transition-transform duration-200 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 border-b">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <LayoutDashboard className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">MedConnect</span>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  location.pathname === item.path
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex-shrink-0 p-4 border-t">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {userProfile?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {userProfile?.email}
                </p>
                <p className="text-xs font-medium text-gray-500 capitalize">
                  {userProfile?.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-4 w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="hidden lg:flex bg-white border-b px-8 py-4">
          <div className="flex-1"></div>
          <NotificationBell />
        </header>
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 mt-14 lg:mt-0">
          {children}
        </main>
      </div>
    </div>
  );
}