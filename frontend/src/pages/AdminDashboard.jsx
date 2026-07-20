import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Users, UserCheck, UserMinus, Globe, BookOpen, Hotel, Award, Landmark, DollarSign,
  TrendingUp, Activity, CheckCircle, ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, Cell, PieChart, Pie
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const statsRes = await api.get('/admin/dashboard-stats');
        setStats(statsRes.data);

        const chartsRes = await api.get('/admin/analytics-charts');
        setCharts(chartsRes.data);
      } catch (err) {
        console.error('Error fetching admin dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
    // Poll data every 10 seconds for real-time live crowd feel
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-saffron-500" />
      </div>
    );
  }

  // Color constants for charts
  const COLORS = ['#f37e22', '#d4af37', '#854d0e', '#c2410c'];

  // Card details
  const cards = [
    { title: 'Total Visitors Today', value: stats?.totalVisitorsToday, icon: Users },
    { title: 'Currently Inside', value: stats?.visitorsCurrentlyInside, icon: UserCheck },
    { title: 'Exited Temple', value: stats?.visitorsWhoHaveExited, icon: UserMinus },
    { title: 'Online Bookings', value: stats?.onlineBookings, icon: Globe },
    { title: 'Walk-in Visitors', value: stats?.walkinVisitors, icon: BookOpen },
    { title: 'Hotel Bookings', value: stats?.accommodationBookings, icon: Hotel },
    { title: 'Rooms Available', value: stats?.roomsAvailable, icon: Landmark },
    { title: 'Today\'s Revenue', value: `₹${stats?.todayRevenue?.toLocaleString()}`, icon: DollarSign },
    { title: 'Prasadam Distributed', value: stats?.totalPrasadamDistributed, icon: Award },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl md:text-3xl" style={{color:'#fff'}}>Temple Analytics Hub</h1>
          <p className="text-xs mt-1" style={{color:'rgba(245,240,232,0.60)'}}>Real-time devotee monitoring and slot control center</p>
        </div>
        
        {/* Real-time sync badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider" style={{background:'rgba(255,167,38,0.08)', borderColor:'rgba(255,167,38,0.22)', color:'#ffa726'}}>
          <Activity className="h-3 w-3 animate-pulse" />
          <span>Live Synced</span>
        </div>
      </div>

      {/* 1. Live Crowd Status Banner */}
      <div className="p-6 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${
            stats?.crowdColor === 'red' 
              ? 'bg-red-500 text-white' 
              : stats?.crowdColor === 'orange' 
                ? 'bg-amber-500 text-white' 
                : 'bg-green-500 text-white'
          } shadow-md`}>
            {stats?.crowdColor === 'red' ? <ShieldAlert className="h-6 w-6" /> : <CheckCircle className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg" style={{color:'#fff'}}>
              Live Crowd Level: <span className={
                stats?.crowdColor === 'red' ? 'text-red-500' : stats?.crowdColor === 'orange' ? 'text-amber-500' : 'text-green-500'
              }>{stats?.crowdStatus}</span>
            </h3>
            <p className="text-xs mt-0.5" style={{color:'rgba(245,240,232,0.60)'}}>
              {stats?.visitorsCurrentlyInside} people currently inside. Exited: {stats?.visitorsWhoHaveExited}.
            </p>
          </div>
        </div>

        {/* Animated capacity monitor bar */}
        <div className="w-full md:w-72 space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold uppercase" style={{color:'rgba(245,240,232,0.60)'}}>
            <span>Safety Capacity</span>
            <span>{Math.round((stats?.visitorsCurrentlyInside / 50) * 100)}%</span>
          </div>
          <div className="w-full rounded-full h-2" style={{background:'rgba(255,255,255,0.12)'}}>
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                stats?.crowdColor === 'red' ? 'bg-red-500' : stats?.crowdColor === 'orange' ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(((stats?.visitorsCurrentlyInside || 0) / 50) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-card rounded-2xl p-5 border flex items-center justify-between" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{color:'rgba(245,240,232,0.60)'}}>{card.title}</span>
                <p className="font-serif font-extrabold text-2xl tracking-wide" style={{color:'#ffa726'}}>{card.value}</p>
              </div>
              <div className="p-3.5 rounded-xl border" style={{background:'rgba(255,167,38,0.15)', color:'#ffa726', borderColor:'rgba(255,167,38,0.22)'}}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Panels */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Daily Visitor Flow chart */}
          <div className="glass-card rounded-2xl p-5 border" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-serif font-bold text-sm" style={{color:'#fff'}}>Daily Visited Flows</h3>
                <p className="text-[10px]" style={{color:'rgba(245,240,232,0.60)'}}>Total bookings vs. physical walk-in entries over last 7 days</p>
              </div>
              <TrendingUp className="h-4 w-4 text-saffron-500" />
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.dailyBookings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.08)" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'rgba(245, 240, 232, 0.70)' }} stroke="rgba(255, 167, 38, 0.2)" />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(245, 240, 232, 0.70)' }} stroke="rgba(255, 167, 38, 0.2)" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 10, 5, 0.95)', 
                      border: '1px solid rgba(255, 167, 38, 0.35)', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }} 
                    itemStyle={{ color: 'rgba(245, 240, 232, 0.95)' }}
                    labelStyle={{ color: '#ffa726', fontWeight: 'bold', fontFamily: 'serif', marginBottom: '4px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, color: 'rgba(245, 240, 232, 0.70)' }} />
                  <Line type="monotone" dataKey="bookings" stroke="#f37e22" strokeWidth={2} name="Online Bookings" activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="walkins" stroke="#d4af37" strokeWidth={2} name="Walk-ins" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Slot-wise Booking Distribution */}
          <div className="glass-card rounded-2xl p-5 border" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-serif font-bold text-sm" style={{color:'#fff'}}>Slot Occupancy & Load</h3>
                <p className="text-[10px]" style={{color:'rgba(245,240,232,0.60)'}}>Visitor allocation percentage across today's slots</p>
              </div>
              <Users className="h-4 w-4 text-gold-500" />
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.slotStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.08)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(245, 240, 232, 0.70)' }} stroke="rgba(255, 167, 38, 0.2)" />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(245, 240, 232, 0.70)' }} stroke="rgba(255, 167, 38, 0.2)" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 10, 5, 0.95)', 
                      border: '1px solid rgba(255, 167, 38, 0.35)', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }} 
                    itemStyle={{ color: 'rgba(245, 240, 232, 0.95)' }}
                    labelStyle={{ color: '#ffa726', fontWeight: 'bold', fontFamily: 'serif', marginBottom: '4px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, color: 'rgba(245, 240, 232, 0.70)' }} />
                  <Bar dataKey="booked" fill="#f37e22" name="Current Booked" radius={[4, 4, 0, 0]}>
                    {charts.slotStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                  <Bar dataKey="capacity" fill="rgba(212, 175, 55, 0.2)" name="Max Capacity" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
