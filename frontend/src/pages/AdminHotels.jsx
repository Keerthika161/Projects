import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Hotel, Plus, ToggleLeft, ToggleRight, CheckCircle, AlertCircle, RefreshCw
} from 'lucide-react';

export default function AdminHotels() {
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchHotels = async () => {
    setLoadingHotels(true);
    try {
      const res = await api.get('/admin/hotels');
      setHotels(res.data);
      if (res.data.length > 0 && !selectedHotel) {
        setSelectedHotel(res.data[0]);
      } else if (selectedHotel) {
        // Refresh selected hotel object
        const updatedSelected = res.data.find(h => h.id === selectedHotel.id);
        setSelectedHotel(updatedSelected);
      }
    } catch (err) {
      setError('Failed to fetch hotels list.');
    } finally {
      setLoadingHotels(false);
    }
  };

  const fetchRooms = async (hotelId) => {
    setLoadingRooms(true);
    try {
      const res = await api.get(`/admin/hotels/${hotelId}/rooms`);
      setRooms(res.data);
    } catch (err) {
      setError('Failed to fetch rooms.');
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    if (selectedHotel) {
      fetchRooms(selectedHotel.id);
    }
  }, [selectedHotel]);

  const handleAddRoom = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newRoomNumber.trim()) {
      setError('Room number is required.');
      return;
    }

    try {
      await api.post('/admin/rooms', {
        hotelId: selectedHotel.id,
        roomNumber: newRoomNumber.trim()
      });
      setSuccess(`Room ${newRoomNumber} added successfully.`);
      setNewRoomNumber('');
      // Refresh
      fetchHotels();
      fetchRooms(selectedHotel.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add room.');
    }
  };

  const toggleRoomStatus = async (room) => {
    setError('');
    setSuccess('');
    const nextStatus = room.status === 'available' ? 'occupied' : 'available';
    try {
      await api.put(`/admin/rooms/${room.id}/status`, { status: nextStatus });
      
      // Update local rooms list state
      setRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: nextStatus } : r));
      
      // Refresh hotels metrics (total occupied changes)
      fetchHotels();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle room status.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="font-serif font-bold text-2xl md:text-3xl" style={{color:'#fff'}}>Accommodation & Hotels</h1>
        <p className="text-xs mt-1" style={{color:'rgba(245,240,232,0.60)'}}>Manage Taj Hotel, Breeze Hotel, and Sree Hotel rooms availability</p>
      </div>

      {error && (
        <div className="p-3 border text-red-500 rounded-xl text-xs font-semibold" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 border text-green-500 rounded-xl text-xs font-semibold" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
          {success}
        </div>
      )}

      {/* Grid of Hotels Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loadingHotels ? (
          <div className="col-span-3 flex justify-center py-6">
            <RefreshCw className="h-6 w-6 animate-spin text-saffron-500" />
          </div>
        ) : (
          hotels.map((hotel) => {
            const isSelected = selectedHotel?.id === hotel.id;
            return (
              <button
                key={hotel.id}
                onClick={() => setSelectedHotel(hotel)}
                className={`glass-card rounded-2xl p-5 border text-left flex flex-col justify-between transition-all ${
                  isSelected 
                    ? 'border-saffron-500 ring-2 ring-saffron-500/10' 
                    : ''
                }`}
                style={{background:'rgba(18,10,3,0.82)', borderColor: isSelected ? undefined : 'rgba(255,167,38,0.22)'}}
              >
                <div className="flex justify-between w-full items-start">
                  <div className="space-y-1">
                    <p className="font-serif font-bold text-base" style={{color:'#fff'}}>{hotel.name}</p>
                    <p className="text-[10px]" style={{color:'rgba(245,240,232,0.60)'}}>Occupancy: {hotel.occupancy_percentage}%</p>
                  </div>
                  <span className={`p-2 rounded-xl ${
                    isSelected ? 'bg-saffron-500 text-white' : ''
                  }`}
                  style={isSelected ? {} : {background:'rgba(255,167,38,0.15)', color:'#ffa726'}}>
                    <Hotel className="h-4.5 w-4.5" />
                  </span>
                </div>

                <div className="w-full rounded-full h-2 mt-4 mb-2" style={{background:'rgba(255,255,255,0.12)'}}>
                  <div 
                    className="bg-saffron-500 h-2 rounded-full transition-all" 
                    style={{ width: `${hotel.occupancy_percentage}%` }}
                  />
                </div>

                <div className="flex justify-between w-full text-[10px] font-semibold mt-1" style={{color:'rgba(245,240,232,0.60)'}}>
                  <span>Vacant: {hotel.available_rooms}</span>
                  <span>Occupied: {hotel.booked_rooms}</span>
                  <span>Total: {hotel.total_rooms}</span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Selected Hotel Rooms Dashboard */}
      {selectedHotel && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Rooms Grid */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-5 md:p-6 border space-y-4" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
            <div className="flex justify-between items-center border-b pb-3" style={{borderColor:'rgba(255,167,38,0.22)'}}>
              <div>
                <h3 className="font-serif font-bold text-sm" style={{color:'#fff'}}>{selectedHotel.name} Rooms Status</h3>
                <p className="text-[10px]" style={{color:'rgba(245,240,232,0.60)'}}>Toggle vacancies directly for physical check-ins</p>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold" style={{background:'rgba(255,167,38,0.15)', color:'#ffa726'}}>
                {rooms.length} Configured Rooms
              </span>
            </div>

            {loadingRooms ? (
              <div className="flex justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-saffron-500" />
              </div>
            ) : rooms.length === 0 ? (
              <p className="text-xs text-center py-12" style={{color:'rgba(245,240,232,0.60)'}}>No rooms configured. Add rooms using the form on the right.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {rooms.map((room) => {
                  const isAvailable = room.status === 'available';
                  return (
                    <div 
                      key={room.id} 
                      className="p-3.5 rounded-xl border flex flex-col justify-between gap-3 text-left transition-colors"
                      style={{background:'rgba(255,167,38,0.08)', borderColor:'rgba(255,167,38,0.22)'}}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm" style={{color:'#fff'}}>Rm: {room.room_number}</span>
                        <span className={`h-2 w-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-amber-500'}`} />
                      </div>
                      
                      <button
                        onClick={() => toggleRoomStatus(room)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold hover:text-saffron-600 transition-colors"
                        style={{color:'rgba(245,240,232,0.60)'}}
                      >
                        {isAvailable ? (
                          <>
                            <ToggleLeft className="h-4.5 w-4.5" style={{color:'rgba(245,240,232,0.60)'}} />
                            <span>Mark Occupied</span>
                          </>
                        ) : (
                          <>
                            <ToggleRight className="h-4.5 w-4.5 text-saffron-500" />
                            <span>Mark Available</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Room Sidepanel */}
          <div className="glass-card rounded-2xl p-5 md:p-6 border h-fit space-y-4" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
            <h3 className="font-serif font-bold text-sm" style={{color:'#fff'}}>Configure New Room</h3>
            <p className="text-[10px] leading-relaxed" style={{color:'rgba(245,240,232,0.60)'}}>
              Add a new room to **{selectedHotel.name}**. The hotel's total count and vacancy percentage will update automatically.
            </p>

            <form onSubmit={handleAddRoom} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase" style={{color:'rgba(245,240,232,0.60)'}}>Room Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. 106, 205, 3A"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  className="form-input text-xs"
                  style={{background:'rgba(255,255,255,0.08)', color:'#f5f0e8', borderColor:'rgba(255,167,38,0.22)'}}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-bold py-2 rounded-xl text-xs shadow-sm transition-all"
              >
                Add Room
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
