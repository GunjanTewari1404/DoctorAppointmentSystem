import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../types';

export function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'unseen' | 'seen'>('unseen');

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data) {
          setNotifications(data);
        }
      };

      fetchNotifications();

      // Subscribe to new notifications
      const subscription = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((current) => [payload.new as Notification, ...current]);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as seen
    if (!notification.seen) {
      await supabase
        .from('notifications')
        .update({ seen: true })
        .eq('id', notification.id);

      setNotifications(current =>
        current.map(n =>
          n.id === notification.id ? { ...n, seen: true } : n
        )
      );
    }

    // Navigate based on notification content
    if (notification.message.includes('doctor application')) {
      navigate('/doctor-applications');
    }
    setShowDropdown(false);
  };

  const unseenNotifications = notifications.filter(n => !n.seen);
  const seenNotifications = notifications.filter(n => n.seen);
  const displayedNotifications = activeTab === 'unseen' ? unseenNotifications : seenNotifications;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-400 hover:text-gray-500"
      >
        <Bell className="h-6 w-6" />
        {unseenNotifications.length > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="p-4">
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setActiveTab('unseen')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  activeTab === 'unseen'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Unseen ({unseenNotifications.length})
              </button>
              <button
                onClick={() => setActiveTab('seen')}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  activeTab === 'seen'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Seen ({seenNotifications.length})
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {displayedNotifications.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No {activeTab} notifications
                </p>
              ) : (
                <div className="space-y-4">
                  {displayedNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className="w-full text-left p-3 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}