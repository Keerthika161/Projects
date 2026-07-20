import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, Clock, Hotel, FileText, CheckCircle, ArrowRight, ArrowLeft, Download, Sparkles, Heart
} from 'lucide-react';

export default function SlotBookingFlow() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [needAccommodation, setNeedAccommodation] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Successful Booking state
  const [bookingResult, setBookingResult] = useState(null);

  // Fetch slots whenever date changes
  useEffect(() => {
    if (step === 2) {
      fetchSlots();
    }
  }, [date, step]);

  // Fetch hotels when entering accommodation step
  useEffect(() => {
    if (step === 3 && needAccommodation) {
      fetchHotels();
    }
  }, [step, needAccommodation]);

  const fetchSlots = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/user/slots?date=${date}`);
      setSlots(res.data);
    } catch (err) {
      setError('Failed to retrieve slots for this date.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await api.get('/user/hotels');
      setHotels(res.data);
    } catch (err) {
      setError('Failed to retrieve hotels.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && !date) {
      setError('Please select a valid date.');
      return;
    }
    if (step === 2 && !selectedSlot) {
      setError('Please choose an available slot.');
      return;
    }
    if (step === 3 && needAccommodation && !selectedHotel) {
      setError('Please select a hotel stay or opt out.');
      return;
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        date,
        slotId: selectedSlot.id,
        needAccommodation,
        hotelId: selectedHotel ? selectedHotel.id : null,
      };
      
      const res = await api.post('/user/book', payload);
      setBookingResult(res.data.booking);
      setStep(5); // Go to Success page
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = () => {
    const printContent = document.getElementById('receipt-download-area').innerHTML;
    const originalContent = document.body.innerHTML;
    
    // Create print-specific page view
    document.body.innerHTML = `
      <div style="padding: 40px; font-family: sans-serif; text-align: center;">
        ${printContent}
      </div>
    `;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore React state
  };

  // Prevent selecting past dates
  const todayDateStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Step Indicators */}
      {step < 5 && (
        <div className="flex justify-between items-center px-4 md:px-8 py-3 rounded-2xl border shadow-sm text-xs font-semibold" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
          {[
            { num: 1, label: 'Date', icon: Calendar },
            { num: 2, label: 'Slot', icon: Clock },
            { num: 3, label: 'Stay', icon: Hotel },
            { num: 4, label: 'Review', icon: FileText }
          ].map((item) => {
            const Icon = item.icon;
            const isCompleted = step > item.num;
            const isActive = step === item.num;
            return (
              <div key={item.num} className="flex flex-col items-center gap-1.5">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center border transition-all ${
                  isCompleted 
                    ? 'bg-saffron-500 border-saffron-500 text-white' 
                    : isActive 
                      ? 'border-saffron-500 text-saffron-500 font-bold scale-110 shadow-gold-glow' 
                      : ''
                }`} style={!isCompleted && !isActive ? { borderColor: 'rgba(255,167,38,0.22)', color: 'rgba(245,240,232,0.60)' } : {}}>
                  {isCompleted ? '✓' : item.num}
                </div>
                <span className={`text-[10px] sm:text-xs ${isActive ? 'text-saffron-500 font-bold' : ''}`} style={!isActive ? { color: 'rgba(245,240,232,0.60)' } : {}}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl text-xs font-semibold" style={{background:'rgba(220,38,38,0.1)', borderColor:'rgba(220,38,38,0.3)', color:'#f87171', borderWidth:'1px'}}>
          {error}
        </div>
      )}

      {/* STEP CARD WRAPPERS */}
      <div className="glass-card rounded-3xl p-6 md:p-8 border" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
        
        {/* STEP 1: SELECT DATE */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-serif font-bold text-xl" style={{color:'#fff'}}>Choose Visit Date</h3>
              <p className="text-xs mt-1" style={{color:'rgba(245,240,232,0.60)'}}>Please select the day of your sacred visit</p>
            </div>
            
            <div className="max-w-xs mx-auto">
              <input
                type="date"
                min={todayDateStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input text-center text-sm font-bold tracking-wide"
                style={{background:'rgba(255,255,255,0.08)', color:'#f5f0e8'}}
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleNextStep}
                className="inline-flex items-center gap-2 bg-saffron-500 hover:bg-saffron-600 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all"
              >
                Proceed to Slots
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SELECT SLOT */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-serif font-bold text-xl" style={{color:'#fff'}}>Select Darshan Slot</h3>
              <p className="text-xs mt-1" style={{color:'rgba(245,240,232,0.60)'}}>Visit date: {date}. Slots are capped to avoid crowding.</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {slots.map((slot) => {
                  const percentage = Math.round((slot.current_bookings / slot.max_capacity) * 100);
                  const isFull = percentage >= 100;
                  const isSelected = selectedSlot?.id === slot.id;
                  
                  let statusText = 'Available';
                  let statusColor = 'bg-green-500';
                  let borderSelectionClass = isSelected ? 'border-saffron-500 ring-2 ring-saffron-500/20' : '';

                  if (isFull) {
                    statusText = 'Full';
                    statusColor = 'bg-red-500';
                  } else if (percentage >= 85) {
                    statusText = 'Almost Full';
                    statusColor = 'bg-amber-500';
                  }

                  return (
                    <button
                      key={slot.id}
                      disabled={isFull}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-5 rounded-2xl border text-left flex flex-col transition-all ${
                        isFull 
                          ? 'opacity-40 cursor-not-allowed' 
                          : ''
                      } ${borderSelectionClass}`}
                      style={{
                        background: 'rgba(255,167,38,0.08)', 
                        borderColor: isSelected ? '#f97316' : 'rgba(255,167,38,0.22)'
                      }}
                    >
                      <div className="flex justify-between items-center w-full mb-3">
                        <span className="font-bold text-xs" style={{color:'#ffa726'}}>{slot.slot_time}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] text-white font-bold ${statusColor}`}>
                          {statusText}
                        </span>
                      </div>
                      
                      <div className="w-full rounded-full h-1.5 mb-2" style={{background:'rgba(255,255,255,0.12)'}}>
                        <div className={`h-1.5 rounded-full ${statusColor}`} style={{ width: `${percentage}%` }} />
                      </div>

                      <div className="flex justify-between w-full text-[10px] font-medium" style={{color:'rgba(245,240,232,0.60)'}}>
                        <span>Capacity: {slot.max_capacity}</span>
                        <span>Available: {slot.remaining_slots}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button
                onClick={handlePrevStep}
                className="inline-flex items-center gap-2 border font-bold px-5 py-3 rounded-xl text-xs sm:text-sm transition-all"
                style={{borderColor:'rgba(255,167,38,0.22)', color:'rgba(245,240,232,0.90)', background:'rgba(255,167,38,0.08)'}}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={handleNextStep}
                disabled={!selectedSlot}
                className="inline-flex items-center gap-2 bg-saffron-500 hover:bg-saffron-600 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all disabled:opacity-50"
              >
                Accommodation Choice
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ACCOMMODATION OPT-IN */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-serif font-bold text-xl" style={{color:'#fff'}}>Require Accommodation?</h3>
              <p className="text-xs mt-1" style={{color:'rgba(245,240,232,0.60)'}}>Book hotel rooms near the temple campus for your stay.</p>
            </div>

            <div className="flex items-center justify-center gap-6 py-4">
              <button
                onClick={() => { setNeedAccommodation(false); setSelectedHotel(null); }}
                className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm border transition-all ${
                  !needAccommodation 
                    ? 'border-saffron-500 text-saffron-500' 
                    : ''
                }`}
                style={needAccommodation ? {borderColor:'rgba(255,167,38,0.22)', color:'rgba(245,240,232,0.60)'} : {background:'rgba(255,167,38,0.15)'}}
              >
                No, Only Darshan
              </button>
              <button
                onClick={() => setNeedAccommodation(true)}
                className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm border transition-all ${
                  needAccommodation 
                    ? 'border-saffron-500 text-saffron-500' 
                    : ''
                }`}
                style={!needAccommodation ? {borderColor:'rgba(255,167,38,0.22)', color:'rgba(245,240,232,0.60)'} : {background:'rgba(255,167,38,0.15)'}}
              >
                Yes, Book Hotel Room
              </button>
            </div>

            {needAccommodation && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wide" style={{color:'rgba(245,240,232,0.90)'}}>Available Hotels</h4>
                
                {loading ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-saffron-500" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {hotels.map((hotel) => {
                      const isNoVacancy = hotel.available_rooms <= 0;
                      const isSelected = selectedHotel?.id === hotel.id;
                      
                      return (
                        <button
                          key={hotel.id}
                          disabled={isNoVacancy}
                          onClick={() => setSelectedHotel(hotel)}
                          className={`p-4 rounded-xl border flex items-center justify-between text-left transition-all ${
                            isNoVacancy 
                              ? 'opacity-40 cursor-not-allowed' 
                              : ''
                          } ${isSelected ? 'border-saffron-500 ring-2 ring-saffron-500/10' : ''}`}
                          style={{
                            background: 'rgba(255,167,38,0.08)',
                            borderColor: isSelected ? '#f97316' : 'rgba(255,167,38,0.22)'
                          }}
                        >
                          <div>
                            <p className="font-bold text-sm" style={{color:'#fff'}}>{hotel.name}</p>
                            <p className="text-[10px] mt-0.5" style={{color:'rgba(245,240,232,0.60)'}}>Rooms: {hotel.total_rooms} total | {hotel.booked_rooms} occupied</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold`}
                                  style={isNoVacancy ? {background:'rgba(220,38,38,0.1)', color:'#f87171'} : {background:'rgba(34,197,94,0.1)', color:'#4ade80'}}>
                              {isNoVacancy ? 'No Vacancy' : `${hotel.available_rooms} Available`}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button
                onClick={handlePrevStep}
                className="inline-flex items-center gap-2 border font-bold px-5 py-3 rounded-xl text-xs sm:text-sm transition-all"
                style={{borderColor:'rgba(255,167,38,0.22)', color:'rgba(245,240,232,0.90)', background:'rgba(255,167,38,0.08)'}}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="inline-flex items-center gap-2 bg-saffron-500 hover:bg-saffron-600 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all"
              >
                Proceed to Review
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUMMARY & CONFIRMATION */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-serif font-bold text-xl" style={{color:'#fff'}}>Review Booking Summary</h3>
              <p className="text-xs mt-1" style={{color:'rgba(245,240,232,0.60)'}}>Please confirm all selection details before filing booking.</p>
            </div>

            <div className="p-6 rounded-2xl border space-y-4 text-sm" style={{background:'rgba(255,167,38,0.05)', borderColor:'rgba(255,167,38,0.22)'}}>
              <div className="flex justify-between py-2 border-b" style={{borderColor:'rgba(255,255,255,0.1)'}}>
                <span style={{color:'rgba(245,240,232,0.60)'}}>Devotee Name:</span>
                <span className="font-bold" style={{color:'#fff'}}>{user?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b" style={{borderColor:'rgba(255,255,255,0.1)'}}>
                <span style={{color:'rgba(245,240,232,0.60)'}}>Darshan Date:</span>
                <span className="font-bold" style={{color:'#fff'}}>{date}</span>
              </div>
              <div className="flex justify-between py-2 border-b" style={{borderColor:'rgba(255,255,255,0.1)'}}>
                <span style={{color:'rgba(245,240,232,0.60)'}}>Slot Session:</span>
                <span className="font-bold" style={{color:'#ffa726'}}>{selectedSlot?.slot_time}</span>
              </div>
              <div className="flex justify-between py-2 border-b" style={{borderColor:'rgba(255,255,255,0.1)'}}>
                <span style={{color:'rgba(245,240,232,0.60)'}}>Accommodation Status:</span>
                <span className="font-bold" style={{color:'#fff'}}>
                  {needAccommodation && selectedHotel ? `Yes (Hotel: ${selectedHotel.name})` : 'No'}
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={handlePrevStep}
                className="inline-flex items-center gap-2 border font-bold px-5 py-3 rounded-xl text-xs sm:text-sm transition-all"
                style={{borderColor:'rgba(255,167,38,0.22)', color:'rgba(245,240,232,0.90)', background:'rgba(255,167,38,0.08)'}}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-saffron-500 hover:bg-saffron-600 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm & Book Slot'}
                <CheckCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: SUCCESS PAGE */}
        {step === 5 && bookingResult && (
          <div className="space-y-6 text-center">
            <div className="inline-flex p-4 rounded-full mb-2 border" style={{background:'rgba(34,197,94,0.1)', color:'#4ade80', borderColor:'rgba(34,197,94,0.2)'}}>
              <CheckCircle className="h-10 w-10" />
            </div>
            
            <div>
              <h3 className="font-serif font-bold text-2xl" style={{color:'#fff'}}>Booking Successful!</h3>
              <p className="text-xs mt-1" style={{color:'rgba(245,240,232,0.60)'}}>May the blessings of God be with you.</p>
            </div>

            {/* Receipt container for printing */}
            <div 
              id="receipt-download-area" 
              className="max-w-md mx-auto p-6 rounded-2xl border text-left font-sans space-y-4"
              style={{background:'rgba(255,167,38,0.05)', borderColor:'rgba(255,167,38,0.22)'}}
            >
              <div className="text-center pb-3 border-b" style={{borderColor:'rgba(255,167,38,0.2)'}}>
                <span className="font-serif font-bold text-base" style={{color:'#fff'}}>Mandir Gateway Receipt</span>
                <p className="text-[10px]" style={{color:'rgba(245,240,232,0.60)'}}>Sri Venkateswara Temple Gateway</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span style={{color:'rgba(245,240,232,0.60)'}}>Booking ID:</span>
                  <span className="font-mono font-bold" style={{color:'#ffa726'}}>{bookingResult.id}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{color:'rgba(245,240,232,0.60)'}}>Devotee Name:</span>
                  <span className="font-bold" style={{color:'#fff'}}>{user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{color:'rgba(245,240,232,0.60)'}}>Date of Visit:</span>
                  <span className="font-bold" style={{color:'#fff'}}>{bookingResult.date}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{color:'rgba(245,240,232,0.60)'}}>Slot Time:</span>
                  <span className="font-bold" style={{color:'#ffa726'}}>{selectedSlot?.slot_time}</span>
                </div>
                {bookingResult.hotel_name && (
                  <div className="flex justify-between">
                    <span style={{color:'rgba(245,240,232,0.60)'}}>Stay Hotel:</span>
                    <span className="font-bold" style={{color:'#fff'}}>{bookingResult.hotel_name}</span>
                  </div>
                )}
                {bookingResult.room_number && (
                  <div className="flex justify-between">
                    <span style={{color:'rgba(245,240,232,0.60)'}}>Room Number:</span>
                    <span className="font-bold" style={{color:'#fff'}}>{bookingResult.room_number}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t text-center text-[10px] font-medium italic" style={{borderColor:'rgba(255,167,38,0.2)', color:'rgba(245,240,232,0.60)'}}>
                "God loves each of us as if there were only one of us."
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <button
                onClick={printReceipt}
                className="inline-flex items-center justify-center gap-2 border text-saffron-500 font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition-all shadow-sm"
                style={{borderColor:'rgba(255,167,38,0.22)', background:'rgba(255,167,38,0.08)'}}
              >
                <Download className="h-4 w-4" />
                Download Receipt
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center justify-center gap-2 bg-saffron-500 hover:bg-saffron-600 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md active:scale-95 transition-all"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
