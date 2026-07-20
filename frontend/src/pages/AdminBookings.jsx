import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  CalendarRange, Search, XCircle, CheckCircle, Clock, Trash2, ShieldAlert
} from 'lucide-react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/bookings?search=${search}&date=${date}`);
      setBookings(res.data);
    } catch (err) {
      setError('Failed to fetch bookings list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [date]); // Fetch when date changes

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will release reserved slots and accommodation.')) {
      return;
    }
    try {
      await api.put(`/admin/bookings/${id}/cancel`);
      // Update state local
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="font-serif font-bold text-2xl md:text-3xl" style={{color:'#fff'}}>Devotee Bookings List</h1>
        <p className="text-xs mt-1" style={{color:'rgba(245,240,232,0.60)'}}>Review, search, and cancel online darshan schedules</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 md:p-5 border flex flex-col md:flex-row gap-4 items-center justify-between" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4" style={{color:'rgba(245,240,232,0.60)'}} />
            <input 
              type="text" 
              placeholder="Search by devotee, mobile or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-10 text-xs py-2"
              style={{background:'rgba(255,255,255,0.08)', color:'#f5f0e8'}}
            />
          </div>
          <button 
            type="submit"
            className="bg-saffron-500 hover:bg-saffron-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-all"
          >
            Search
          </button>
        </form>

        {/* Date Filter */}
        <div className="w-full md:w-auto flex items-center gap-3">
          <span className="text-xs font-bold whitespace-nowrap" style={{color:'rgba(245,240,232,0.60)'}}>Filter Date:</span>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="form-input text-xs py-2 w-full md:w-44 text-center font-bold"
            style={{background:'rgba(255,255,255,0.08)', color:'#f5f0e8'}}
          />
          {date && (
            <button 
              onClick={() => setDate('')}
              className="text-xs text-red-500 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="glass-card rounded-2xl p-5 border" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron-500" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-xs" style={{color:'rgba(245,240,232,0.60)'}}>
              <CalendarRange className="h-10 w-10 mx-auto mb-2" style={{color:'rgba(245,240,232,0.60)'}} />
              No booking records matching the search criteria.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b font-semibold uppercase" style={{borderColor:'rgba(255,167,38,0.22)', color:'rgba(245,240,232,0.60)'}}>
                  <th className="py-3 px-2">Booking ID</th>
                  <th className="py-3 px-2">Devotee</th>
                  <th className="py-3 px-2">Contact</th>
                  <th className="py-3 px-2">Visit Date</th>
                  <th className="py-3 px-2">Slot Time</th>
                  <th className="py-3 px-2">Accommodation</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{borderColor:'rgba(255,167,38,0.22)'}}>
                {bookings.map((b) => (
                  <tr key={b.id} style={{color:'rgba(245,240,232,0.90)', borderColor:'rgba(255,167,38,0.22)'}}>
                    <td className="py-3.5 px-2 font-mono font-bold" style={{color:'#ffa726'}}>{b.id}</td>
                    <td className="py-3.5 px-2 font-bold">{b.user_name}</td>
                    <td className="py-3.5 px-2">
                      <p>{b.user_email}</p>
                      <p className="text-[10px] mt-0.5" style={{color:'rgba(245,240,232,0.60)'}}>{b.user_mobile}</p>
                    </td>
                    <td className="py-3.5 px-2 font-medium">{b.date}</td>
                    <td className="py-3.5 px-2">{b.slot_time}</td>
                    <td className="py-3.5 px-2 font-medium" style={{color:'rgba(245,240,232,0.60)'}}>
                      {b.hotel_name ? `${b.hotel_name} (Rm: ${b.room_number})` : 'None'}
                    </td>
                    <td className="py-3.5 px-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getStatusColor(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-center">
                      {b.status === 'confirmed' ? (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="p-1 rounded-md text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Cancel Booking"
                        >
                          <XCircle className="h-4.5 w-4.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] italic" style={{color:'rgba(245,240,232,0.60)'}}>No Action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
