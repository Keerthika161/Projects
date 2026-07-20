import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, Calendar, Hotel, Clock, ArrowRight, CheckCircle, AlertTriangle, AlertCircle, Heart, Bell
} from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  
  const [poojas, setPoojas] = useState([]);
  const [slots, setSlots] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        
        // 1. Fetch Today's Poojas
        const poojasRes = await api.get(`/user/poojas?date=${todayStr}`);
        setPoojas(poojasRes.data);

        // 2. Fetch Slots for Today
        const slotsRes = await api.get(`/user/slots?date=${todayStr}`);
        setSlots(slotsRes.data);

        // 3. Fetch Hotels
        const hotelsRes = await api.get('/user/hotels');
        setHotels(hotelsRes.data);

        // 4. Fetch Bookings
        const bookingsRes = await api.get('/user/bookings');
        setMyBookings(bookingsRes.data);
      } catch (err) {
        console.error('Error loading devotee dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed': return { color: '#4ade80', backgroundColor: 'rgba(74, 222, 128, 0.1)', borderColor: 'rgba(74, 222, 128, 0.2)' };
      case 'cancelled': return { color: '#f87171', backgroundColor: 'rgba(248, 113, 113, 0.1)', borderColor: 'rgba(248, 113, 113, 0.2)' };
      default: return { color: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.1)', borderColor: 'rgba(251, 191, 36, 0.2)' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-saffron-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Divine Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-saffron-600 to-gold-500 p-6 md:p-8 text-white shadow-lg shadow-saffron-500/10">
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-12">
          <Sparkles className="h-64 w-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md mb-4 border border-white/10">
            <Heart className="h-3.5 w-3.5 fill-white" />
            <span>Blessed Gateway</span>
          </div>
          <h1 className="font-serif font-bold text-2xl md:text-4xl tracking-wide">
            Welcome, Devotee {user?.name}
          </h1>
          <p className="text-white/80 text-xs md:text-sm mt-3 font-medium leading-relaxed">
            Experience a smooth, peaceful, and queue-free pilgrimage. Plan your pooja timings, slot entries, and hotel stays with ease.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link 
              to="/book" 
              className="inline-flex items-center gap-2 bg-white text-saffron-600 font-bold px-5 py-2.5 rounded-xl text-xs md:text-sm shadow-md hover:bg-stone-50 active:scale-95 transition-all"
            >
              Book Darshan Slot
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Grid for Poojas, Slots, and Hotels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Special Pooja */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-5 md:p-6 border" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg" style={{color:'#fff'}}>Today's Special Pooja</h3>
                <p className="text-xs mt-0.5" style={{color:'rgba(245,240,232,0.60)'}}>Divine rituals scheduled for today</p>
              </div>
              <span className="p-2 rounded-xl" style={{background:'rgba(255,167,38,0.15)',color:'#ffa726'}}>
                <Sparkles className="h-5 w-5" />
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {poojas.length === 0 ? (
                <p className="text-xs col-span-2 text-center py-6" style={{color:'rgba(245,240,232,0.55)'}}>No special poojas scheduled for today.</p>
              ) : (
                poojas.map((pooja) => (
                  <div 
                    key={pooja.id} 
                    className="p-4 rounded-xl border transition-colors"
                    style={{background:'rgba(255,167,38,0.08)', borderColor:'rgba(255,167,38,0.22)'}}
                  >
                    <h4 className="font-bold text-sm" style={{color:'#fff'}}>{pooja.name}</h4>
                    <p className="text-xs mt-1 line-clamp-2 leading-relaxed" style={{color:'rgba(245,240,232,0.72)'}}>{pooja.description}</p>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full mt-3 font-semibold capitalize text-[10px]" style={{background:'rgba(243,126,34,0.20)',color:'#ffa726'}}>
                      ● {pooja.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Darshan Slot Availability */}
          <div className="glass-card rounded-2xl p-5 md:p-6 border" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg" style={{color:'#fff'}}>Darshan Slot Status</h3>
                <p className="text-xs mt-0.5" style={{color:'rgba(245,240,232,0.60)'}}>Live booking status of today's slots</p>
              </div>
              <span className="p-2 rounded-xl" style={{background:'rgba(255,167,38,0.15)',color:'#ffa726'}}>
                <Clock className="h-5 w-5" />
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {slots.map((slot) => {
                const percentage = Math.round((slot.current_bookings / slot.max_capacity) * 100);
                let status = 'Available';
                let statusColor = 'bg-green-500';
                if (percentage >= 100) {
                  status = 'Full';
                  statusColor = 'bg-red-500';
                } else if (percentage >= 85) {
                  status = 'Almost Full';
                  statusColor = 'bg-amber-500';
                }

                return (
                  <div key={slot.id} className="p-4 rounded-xl border" style={{background:'rgba(255,167,38,0.07)',borderColor:'rgba(255,167,38,0.20)'}}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-xs" style={{color:'#f5f0e8'}}>{slot.slot_time}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] text-white font-bold ${statusColor}`}>
                        {status}
                      </span>
                    </div>
                    <div className="w-full rounded-full h-2 mb-2" style={{background:'rgba(255,255,255,0.12)'}}>
                      <div 
                        className={`h-2 rounded-full ${statusColor}`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px]" style={{color:'rgba(245,240,232,0.60)'}}>
                      <span>Booked: {slot.current_bookings}</span>
                      <span>Rem: {slot.remaining_slots}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Accommodation Availability & Quick booking banner */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-5 md:p-6 border" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg" style={{color:'#fff'}}>Hotel Occupancy</h3>
                <p className="text-xs mt-0.5" style={{color:'rgba(245,240,232,0.60)'}}>Live room vacancy at nearest stays</p>
              </div>
              <span className="p-2 rounded-xl" style={{background:'rgba(255,167,38,0.15)',color:'#ffa726'}}>
                <Hotel className="h-5 w-5" />
              </span>
            </div>

            <div className="space-y-4">
              {hotels.map((hotel) => (
                <div key={hotel.id} className="p-3.5 rounded-xl border" style={{background:'rgba(255,167,38,0.07)',borderColor:'rgba(255,167,38,0.20)'}}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span style={{color:'#fff'}}>{hotel.name}</span>
                    <span style={{color:'#ffa726'}}>{hotel.available_rooms} Rooms left</span>
                  </div>
                  <div className="w-full rounded-full h-1.5 mb-2" style={{background:'rgba(255,255,255,0.12)'}}>
                    <div 
                      className="bg-saffron-500 h-1.5 rounded-full" 
                      style={{ width: `${hotel.total_rooms > 0 ? ((hotel.total_rooms - hotel.available_rooms) / hotel.total_rooms) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px]" style={{color:'rgba(245,240,232,0.55)'}}>
                    <span>Total rooms: {hotel.total_rooms}</span>
                    <span>Booked: {hotel.booked_rooms}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Devotee's Booking Log */}
      <div className="glass-card rounded-2xl p-5 md:p-6 border" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
        <div>
          <h3 className="font-serif font-bold text-lg" style={{color:'#fff'}}>My Booking History</h3>
          <p className="text-xs mt-0.5" style={{color:'rgba(245,240,232,0.60)'}}>Summary of all your past and current slots</p>
        </div>

        <div className="mt-4 overflow-x-auto">
          {myBookings.length === 0 ? (
            <div className="text-center py-8 text-xs" style={{color:'rgba(245,240,232,0.60)'}}>
              <Calendar className="h-10 w-10 mx-auto mb-2" style={{color:'rgba(245,240,232,0.30)'}} />
              You haven't made any bookings yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b font-semibold uppercase" style={{borderColor:'rgba(255,167,38,0.22)', color:'rgba(245,240,232,0.60)'}}>
                  <th className="py-3 px-2">Booking ID</th>
                  <th className="py-3 px-2">Visit Date</th>
                  <th className="py-3 px-2">Slot Time</th>
                  <th className="py-3 px-2">Hotel</th>
                  <th className="py-3 px-2">Room</th>
                  <th className="py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {myBookings.map((b) => (
                  <tr key={b.id} className="border-b last:border-0" style={{borderColor:'rgba(255,167,38,0.15)', color:'rgba(245,240,232,0.90)'}}>
                    <td className="py-3.5 px-2 font-mono font-bold" style={{color:'#ffa726'}}>{b.id}</td>
                    <td className="py-3.5 px-2 font-medium">{b.date}</td>
                    <td className="py-3.5 px-2">{b.slot_time}</td>
                    <td className="py-3.5 px-2">{b.hotel_name || 'Not Opted'}</td>
                    <td className="py-3.5 px-2">{b.room_number || '-'}</td>
                    <td className="py-3.5 px-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize" style={getStatusStyle(b.status)}>
                        {b.status}
                      </span>
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
