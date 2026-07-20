import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Phone, User, ShieldCheck } from 'lucide-react';

// Direct image URLs extracted from user's theme references
const MAIN_BG_IMAGE = 'https://i.ibb.co/DPLFQhBw/Screenshot-2026-07-20-095549.png';
const SECONDARY_IMAGE = 'https://i.ibb.co/20WLVSsF/Screenshot-2026-07-20-095615.png';

export default function Login() {
  const { loginUser, loginAdmin, registerDevotee } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('user-login');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (activeTab === 'user-login') {
      const res = await loginUser(email, password);
      if (res.success) navigate('/dashboard');
      else setError(res.error);
    } else if (activeTab === 'admin-login') {
      const res = await loginAdmin(email, password);
      if (res.success) navigate('/admin');
      else setError(res.error);
    } else if (activeTab === 'user-register') {
      if (!name || !mobile || !email || !password) {
        setError('All fields are required.');
        setLoading(false);
        return;
      }
      const res = await registerDevotee(name, mobile, email, password);
      if (res.success) {
        setSuccess('Registration successful! Please sign in below.');
        setName(''); setMobile(''); setEmail(''); setPassword('');
        setActiveTab('user-login');
      } else setError(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      {/* ===== FULL BACKGROUND: Main Theme Image ===== */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('${MAIN_BG_IMAGE}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Dark overlay for text readability - reduced opacity to make background image clearly visible */}
      <div className="absolute inset-0 z-0 bg-black/30" />

      {/* Warm amber gradient overlay for temple mood - reduced opacity */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-amber-900/20 via-transparent to-saffron-900/30" />



      {/* ===== CONTENT AREA ===== */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-10 min-h-screen py-8">

        {/* LEFT SIDE: Branding */}
        <div className="flex-1 text-center lg:text-left space-y-6 lg:pr-8">
          {/* Logo Icon — Secondary theme image */}
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(251,146,60,0.7)]">
              <img
                src={SECONDARY_IMAGE}
                alt="Temple Management Logo"
                className="h-16 w-16 object-cover"
                style={{ filter: 'drop-shadow(0 0 12px rgba(251,146,60,0.5))' }}
              />
            </div>
          </div>

          {/* Main Title */}
          <div>
            <h1
              className="font-serif font-extrabold leading-tight tracking-wide"
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
                color: '#FFFFFF',
                textShadow: '0 2px 20px rgba(0,0,0,0.8), 0 0 60px rgba(251,146,60,0.4)',
                letterSpacing: '0.04em',
              }}
            >
              TEMPLE
              <br />
              <span style={{ color: '#FFA726', textShadow: '0 0 40px rgba(255,167,38,0.8), 0 2px 20px rgba(0,0,0,0.8)' }}>
                MANAGEMENT
              </span>
            </h1>
            <div className="mt-3 h-1 w-24 bg-gradient-to-r from-saffron-400 to-gold-400 rounded-full lg:mx-0 mx-auto" />
          </div>

          <p
            className="text-base md:text-lg font-medium leading-relaxed max-w-md lg:mx-0 mx-auto"
            style={{ color: 'rgba(255,255,255,0.90)', textShadow: '0 1px 8px rgba(0,0,0,0.7)' }}
          >
            Your divine gateway to seamless temple experiences — book darshans, manage accommodations, and monitor live temple activity.
          </p>

          <div
            className="italic text-sm font-medium"
            style={{ color: 'rgba(255,213,79,0.95)', textShadow: '0 1px 8px rgba(0,0,0,0.7)' }}
          >
            "God loves each of us as if there were only one of us."
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start mt-4">
            {['Slot Booking', 'Live Crowd Monitor', 'Hotel Rooms', 'Prasadam Tracker', 'Smart Reports'].map(badge => (
              <span
                key={badge}
                className="px-3 py-1.5 rounded-full text-xs font-bold border"
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,167,38,0.4)',
                  color: '#FFE082',
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: Login Card */}
        <div
          className="w-full max-w-md rounded-3xl p-7 shadow-2xl"
          style={{
            background: 'rgba(15, 10, 5, 0.75)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,167,38,0.25)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Card Header */}
          <div className="text-center mb-6">
            <h2
              className="font-serif font-bold text-2xl"
              style={{ color: '#FFFFFF', textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}
            >
              TEMPLE{' '}
              <span style={{ color: '#FFA726' }}>MANAGEMENT</span>
            </h2>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,213,79,0.85)' }}>
              Sacred Portal Access
            </p>
          </div>

          {/* Tabs */}
          <div className="flex mb-5 rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(255,167,38,0.2)' }}>
            {[
              { id: 'user-login', label: 'Devotee Login' },
              { id: 'user-register', label: 'Register' },
              { id: 'admin-login', label: 'Admin' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setError(''); setSuccess(''); }}
                className="flex-1 py-2.5 text-xs font-bold transition-all duration-200"
                style={{
                  background: activeTab === tab.id
                    ? 'linear-gradient(135deg, #f37e22, #d4af37)'
                    : 'rgba(255,255,255,0.04)',
                  color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.55)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#FCA5A5' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#86EFAC' }}>
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'user-register' && (
              <>
                <LoginField icon={<User className="h-4 w-4" />} type="text" placeholder="Full devotee name" value={name} onChange={setName} />
                <LoginField icon={<Phone className="h-4 w-4" />} type="tel" placeholder="Mobile number" value={mobile} onChange={setMobile} />
              </>
            )}

            <LoginField icon={<Mail className="h-4 w-4" />} type="email" placeholder="Email address" value={email} onChange={setEmail} />
            <LoginField icon={<Lock className="h-4 w-4" />} type="password" placeholder="Password" value={password} onChange={setPassword} />

            {activeTab === 'admin-login' && (
              <div className="flex items-center gap-1.5 text-[10px] font-semibold" style={{ color: '#FFA726' }}>
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Restricted — Authorized temple administrators only</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-extrabold text-sm text-white transition-all duration-200 active:scale-95 disabled:opacity-50 mt-2"
              style={{
                background: 'linear-gradient(135deg, #f37e22 0%, #d4af37 100%)',
                boxShadow: '0 4px 20px rgba(243,126,34,0.4)',
                letterSpacing: '0.05em',
              }}
            >
              {loading ? 'Please wait...' : activeTab === 'user-register' ? 'CREATE ACCOUNT' : 'SIGN IN'}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-center text-[10px] mt-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Temple Management System &copy; {new Date().getFullYear()}
          </p>
        </div>

      </div>


    </div>
  );
}

/* Reusable styled input field */
function LoginField({ icon, type, placeholder, value, onChange }) {
  return (
    <div className="relative">
      <span
        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'rgba(255,167,38,0.7)' }}
      >
        {icon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,167,38,0.2)',
          color: '#FFFFFF',
          caretColor: '#FFA726',
        }}
        onFocus={e => {
          e.target.style.border = '1px solid rgba(255,167,38,0.6)';
          e.target.style.background = 'rgba(255,255,255,0.10)';
          e.target.style.boxShadow = '0 0 0 3px rgba(243,126,34,0.12)';
        }}
        onBlur={e => {
          e.target.style.border = '1px solid rgba(255,167,38,0.2)';
          e.target.style.background = 'rgba(255,255,255,0.07)';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}
