import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// Theme images
const MAIN_BG_IMAGE = 'https://i.ibb.co/DPLFQhBw/Screenshot-2026-07-20-095549.png';
const SECONDARY_IMAGE = 'https://i.ibb.co/20WLVSsF/Screenshot-2026-07-20-095615.png';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  Sun, Moon, Bell, Search, LogOut, Menu, X, User,
  LayoutDashboard, CalendarRange, Hotel, Utensils, Sparkles, Users, FileBarChart, Clock
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Load and toggle theme
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    const isDark = theme === 'dark' || theme === null;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };



  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Navigation Links definition
  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Bookings', path: '/admin/bookings', icon: CalendarRange },
    { name: 'Hotels & Rooms', path: '/admin/hotels', icon: Hotel },
    { name: 'Prasadam', path: '/admin/prasadam', icon: Utensils },
    { name: 'Special Pooja', path: '/admin/pooja', icon: Sparkles },
    { name: 'Physical Visitors', path: '/admin/visitors', icon: Users },
    { name: 'Reports', path: '/admin/reports', icon: FileBarChart },
  ];

  const userLinks = [
    { name: 'Home Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Book a Slot', path: '/book', icon: Clock },
  ];

  const links = user?.role === 'admin' ? adminLinks : userLinks;

  return (
    <div className={`min-h-screen flex transition-colors duration-300`} style={{ background: 'rgba(18,10,3,0.82)' }}>
      {/* Sidebar for Desktop */}
      <aside
        className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-30"
        style={{
          background: `linear-gradient(180deg, rgba(15,10,5,0.72) 0%, rgba(30,15,5,0.78) 100%), url('${MAIN_BG_IMAGE}') center/cover no-repeat`,
          borderRight: '1px solid rgba(255,167,38,0.2)',
        }}
      >
        <div
          className="h-20 flex items-center justify-center px-4"
          style={{ borderBottom: '1px solid rgba(255,167,38,0.2)' }}
        >
          <Link to="/" className="flex items-center gap-2.5">
            <span className="rounded-xl overflow-hidden shadow-[0_0_20px_rgba(251,146,60,0.6)]">
              <img src={SECONDARY_IMAGE} alt="Temple Logo" className="h-10 w-10 object-cover" />
            </span>
            <div className="leading-tight">
              <p className="font-serif font-extrabold text-sm tracking-widest" style={{ color: '#FFFFFF', letterSpacing: '0.12em' }}>TEMPLE</p>
              <p className="font-serif font-extrabold text-sm tracking-widest" style={{ color: '#FFA726', letterSpacing: '0.12em' }}>MANAGEMENT</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                style={isActive ? {
                  background: 'linear-gradient(135deg, #f37e22, #d4af37)',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 15px rgba(243,126,34,0.35)',
                  transform: 'scale(1.02)',
                } : {
                  color: 'rgba(255,255,255,0.72)',
                  background: 'transparent',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,167,38,0.12)'; e.currentTarget.style.color = '#FFE082'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.72)'; } }}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid rgba(255,167,38,0.2)' }}>
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #f37e22, #d4af37)', color: '#fff', boxShadow: '0 0 12px rgba(243,126,34,0.4)' }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate" style={{ color: '#FFFFFF' }}>{user?.name}</p>
              <p className="text-[10px] truncate capitalize" style={{ color: 'rgba(255,213,79,0.8)' }}>{user?.role} Portal</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 rounded-lg transition-all duration-200"
              style={{ color: 'rgba(255,255,255,0.45)' }}
              onMouseEnter={e => { e.currentTarget.style.color='#FCA5A5'; e.currentTarget.style.background='rgba(239,68,68,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.45)'; e.currentTarget.style.background='transparent'; }}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Sticky Header Navbar */}
        <header
          className="sticky top-0 z-20 flex h-20 items-center justify-between px-4 md:px-8"
          style={{
            background: 'rgba(15,10,5,0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255,167,38,0.2)',
            boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
          }}
        >
          {/* Left: Mobile Menu Trigger & Dashboard Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg md:hidden"
            style={{ color: 'rgba(255,255,255,0.8)' }}
          >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border max-w-xs" style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,167,38,0.22)' }}>
              <Search className="h-4 w-4" style={{ color: 'rgba(245,240,232,0.60)' }} />
              <input 
                type="text" 
                placeholder="Search devotees, bookings..."
                className="bg-transparent text-xs border-none outline-none w-44 focus:w-52 transition-all duration-300"
                style={{ color: '#f5f0e8' }}
              />
            </div>
          </div>

          {/* Right: Theme Toggle, Notifications, Profile Menu */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl transition-colors"
              style={{ color: 'rgba(245,240,232,0.90)' }}
              title="Toggle Light/Dark Mode"
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" style={{ color: 'rgba(245,240,232,0.90)' }} />}
            </button>

            {/* Notification Bell (Only show for standard user devotees as they receive bookings/pooja/accommodation alerts) */}
            {user?.role === 'user' && (
              <div className="relative">
                <button
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    setIsProfileOpen(false);
                  }}
                  className="p-2.5 rounded-xl transition-colors relative"
                  style={{ color: 'rgba(245,240,232,0.90)' }}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-saffron-500 animate-pulse" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 rounded-2xl border shadow-2xl p-4 z-50" style={{ background: 'rgba(18,10,3,0.82)', borderColor: 'rgba(255,167,38,0.22)' }}>
                    <div className="flex items-center justify-between pb-3 mb-2 border-b" style={{ borderColor: 'rgba(255,167,38,0.22)' }}>
                      <h4 className="font-serif font-bold text-sm" style={{ color: '#fff' }}>Divine Notifications</h4>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-[10px] text-saffron-500 font-semibold hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2.5">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-center py-6" style={{ color: 'rgba(245,240,232,0.60)' }}>No new notifications.</p>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            className={`p-2.5 rounded-xl text-xs transition-colors ${
                              n.status === 'unread' 
                                ? 'border-l-2 border-saffron-500' 
                                : 'bg-transparent'
                            }`}
                            style={n.status === 'unread' ? { background: 'rgba(255,167,38,0.08)', color: '#fff' } : { color: 'rgba(245,240,232,0.60)' }}
                          >
                            <p>{n.message}</p>
                            <span className="text-[9px] mt-1 block" style={{ color: 'rgba(245,240,232,0.60)' }}>
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-xl border transition-colors"
                style={{ borderColor: 'rgba(255,167,38,0.22)' }}
              >
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-saffron-400 to-gold-400 text-white font-bold flex items-center justify-center text-xs">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-xs font-semibold pr-1" style={{ color: 'rgba(245,240,232,0.90)' }}>{user?.name}</span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 rounded-xl border shadow-2xl p-2 z-50" style={{ background: 'rgba(18,10,3,0.82)', borderColor: 'rgba(255,167,38,0.22)' }}>
                  <div className="px-3 py-2 border-b" style={{ borderColor: 'rgba(255,167,38,0.22)' }}>
                    <p className="text-xs font-bold" style={{ color: '#fff' }}>{user?.name}</p>
                    <p className="text-[10px] truncate" style={{ color: 'rgba(245,240,232,0.60)' }}>{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3 py-2.5 mt-1 text-xs hover:text-red-600 rounded-lg transition-colors"
                    style={{ color: 'rgba(245,240,232,0.90)' }}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Routing Slot */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 backdrop-blur-sm z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        />
      )}

      {/* Mobile Drawer Menu */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: `linear-gradient(180deg, rgba(15,10,5,0.72) 0%, rgba(30,15,5,0.78) 100%), url('${MAIN_BG_IMAGE}') center/cover no-repeat`,
          borderRight: '1px solid rgba(255,167,38,0.2)',
        }}
      >
        <div className="h-20 flex items-center justify-between px-4" style={{ borderBottom: '1px solid rgba(255,167,38,0.2)' }}>
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setIsMobileMenuOpen(false)}>
            <span className="rounded-xl overflow-hidden">
              <img src={SECONDARY_IMAGE} alt="Temple Logo" className="h-10 w-10 object-cover" />
            </span>
            <div className="leading-tight">
              <p className="font-serif font-extrabold text-xs tracking-widest" style={{ color: '#FFFFFF' }}>TEMPLE</p>
              <p className="font-serif font-extrabold text-xs tracking-widest" style={{ color: '#FFA726' }}>MANAGEMENT</p>
            </div>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-lg"
            style={{ color: 'rgba(245,240,232,0.60)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                style={isActive ? {
                  background: 'linear-gradient(135deg, #f37e22, #d4af37)',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 15px rgba(243,126,34,0.35)',
                } : {
                  color: 'rgba(255,255,255,0.72)',
                }}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 absolute bottom-0 w-full" style={{ borderTop: '1px solid rgba(255,167,38,0.2)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-sm"
            style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.35)' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.4)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(239,68,68,0.2)'}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </div>
  );
}
