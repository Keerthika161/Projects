import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Users, UserCheck, UserMinus, Plus, Search, RefreshCw, LogOut, Calendar
} from 'lucide-react';

export default function AdminVisitors() {
  const [visitors, setVisitors] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('inside'); // 'inside' or 'exited'
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/visitors?search=${search}&status=${status}&date=${date}`);
      setVisitors(res.data);
    } catch (err) {
      setError('Failed to fetch visitors list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [status, date]); // Auto-refresh when status or date filters change

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVisitors();
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    if (!name.trim() || !mobile.trim()) {
      setError('Name and Mobile number are required.');
      setSaving(false);
      return;
    }

    try {
      await api.post('/admin/visitors/check-in', {
        name: name.trim(),
        email: email.trim() || null,
        mobile: mobile.trim()
      });
      setSuccess(`Checked in ${name} successfully.`);
      setName('');
      setEmail('');
      setMobile('');
      fetchVisitors();
    } catch (err) {
      setError('Failed to check in visitor.');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckOut = async (id, visitorName) => {
    setError('');
    setSuccess('');
    try {
      await api.put(`/admin/visitors/${id}/check-out`);
      setSuccess(`Checked out ${visitorName} successfully.`);
      fetchVisitors();
    } catch (err) {
      setError('Failed to check out visitor.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="font-serif font-bold text-2xl md:text-3xl" style={{color:'#fff'}}>Physical Visitor Logs</h1>
        <p className="text-xs mt-1" style={{color:'rgba(245,240,232,0.60)'}}>Manage physical walk-ins, gate check-ins, and live crowd status</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-xl text-xs font-semibold">
          {success}
        </div>
      )}

      {/* Grid: Check-in form & Logs list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Check-in Form */}
        <div className="glass-card rounded-2xl p-5 md:p-6 border h-fit space-y-4" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
          <div className="flex items-center gap-2 border-b pb-3" style={{borderColor:'rgba(255,167,38,0.22)'}}>
            <span className="p-1.5 rounded-lg bg-saffron-500 text-white shadow-sm">
              <Plus className="h-4 w-4" />
            </span>
            <h3 className="font-serif font-bold text-sm" style={{color:'#fff'}}>Gate Check-In</h3>
          </div>
          
          <form onSubmit={handleCheckIn} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-[10px] uppercase" style={{color:'rgba(245,240,232,0.60)'}}>Visitor Full Name</label>
              <input 
                type="text" 
                placeholder="Enter visitor's full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input text-xs"
                style={{background:'rgba(255,255,255,0.08)', color:'#f5f0e8'}}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase" style={{color:'rgba(245,240,232,0.60)'}}>Mobile Number</label>
              <input 
                type="tel" 
                placeholder="Enter 10-digit mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="form-input text-xs"
                style={{background:'rgba(255,255,255,0.08)', color:'#f5f0e8'}}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase" style={{color:'rgba(245,240,232,0.60)'}}>Email Address (Optional)</label>
              <input 
                type="email" 
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input text-xs"
                style={{background:'rgba(255,255,255,0.08)', color:'#f5f0e8'}}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition-all"
            >
              {saving ? 'Registering...' : 'Register Gate Entry'}
            </button>
          </form>
        </div>

        {/* Visitor Logs List */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 md:p-6 border space-y-4" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3" style={{borderColor:'rgba(255,167,38,0.22)'}}>
            <div>
              <h3 className="font-serif font-bold text-sm" style={{color:'#fff'}}>Live Visitor Logs</h3>
              <p className="text-[10px]" style={{color:'rgba(245,240,232,0.60)'}}>Review gate entries and checkout timestamps</p>
            </div>

            {/* Status tabs */}
            <div className="flex p-0.5 rounded-lg text-[10px] font-bold" style={{background:'rgba(255,255,255,0.12)'}}>
              <button 
                onClick={() => setStatus('inside')}
                className={`px-3 py-1 rounded-md transition-colors ${status === 'inside' ? 'shadow-sm' : ''}`}
                style={status === 'inside' ? {background:'rgba(255,167,38,0.08)', color:'#ffa726'} : {color:'rgba(245,240,232,0.60)'}}
              >
                Inside ({visitors.filter(v => v.status === 'inside').length})
              </button>
              <button 
                onClick={() => setStatus('exited')}
                className={`px-3 py-1 rounded-md transition-colors ${status === 'exited' ? 'shadow-sm' : ''}`}
                style={status === 'exited' ? {background:'rgba(255,167,38,0.08)', color:'#ffa726'} : {color:'rgba(245,240,232,0.60)'}}
              >
                Exited
              </button>
            </div>
          </div>

          {/* Search/Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5" style={{color:'rgba(245,240,232,0.60)'}} />
              <input 
                type="text" 
                placeholder="Search visitor or mobile..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pl-9 text-[11px] py-1.5"
                style={{background:'rgba(255,255,255,0.08)', color:'#f5f0e8'}}
              />
            </form>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[10px] font-bold whitespace-nowrap" style={{color:'rgba(245,240,232,0.60)'}}>Date:</span>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input text-[11px] py-1.5 w-full sm:w-36 text-center font-bold"
                style={{background:'rgba(255,255,255,0.08)', color:'#f5f0e8'}}
              />
            </div>
          </div>

          {/* Visitors Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-saffron-500" />
              </div>
            ) : visitors.length === 0 ? (
              <p className="text-xs text-center py-8" style={{color:'rgba(245,240,232,0.60)'}}>No visitor records matching criteria.</p>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b font-semibold uppercase" style={{borderColor:'rgba(255,167,38,0.22)', color:'rgba(245,240,232,0.60)'}}>
                    <th className="py-2.5 px-1">Visitor</th>
                    <th className="py-2.5 px-1">Contact</th>
                    <th className="py-2.5 px-1">Check-in Time</th>
                    {status === 'exited' && <th className="py-2.5 px-1">Check-out Time</th>}
                    {status === 'inside' && <th className="py-2.5 px-1 text-center">Checkout</th>}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{borderColor:'rgba(255,167,38,0.22)'}}>
                  {visitors.map((v) => (
                    <tr key={v.id} style={{color:'rgba(245,240,232,0.90)', borderColor:'rgba(255,167,38,0.22)'}}>
                      <td className="py-3 px-1 font-bold">{v.name}</td>
                      <td className="py-3 px-1">
                        <p>{v.mobile}</p>
                        {v.email && <p className="text-[9px]" style={{color:'rgba(245,240,232,0.60)'}}>{v.email}</p>}
                      </td>
                      <td className="py-3 px-1 font-medium">
                        {new Date(v.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      {status === 'exited' && (
                        <td className="py-3 px-1 font-medium" style={{color:'rgba(245,240,232,0.60)'}}>
                          {v.check_out_time ? new Date(v.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                      )}
                      {status === 'inside' && (
                        <td className="py-3 px-1 text-center">
                          <button
                            onClick={() => handleCheckOut(v.id, v.name)}
                            className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold px-2.5 py-1 rounded-lg text-[10px] transition-colors border border-amber-200/50"
                          >
                            <LogOut className="h-3 w-3" />
                            Gate Exit
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
