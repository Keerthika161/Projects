import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  FileText, Download, Calendar, Hotel, Utensils, Users, RefreshCw
} from 'lucide-react';

export default function AdminReports() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const res = await api.get('/admin/dashboard-stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching reports stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleExport = (type) => {
    const token = localStorage.getItem('token');
    // Using simple browser redirection for download
    // Since it requires JWT, we should fetch it or trigger download by calling axios
    // or by creating a hidden anchor with the auth header if necessary.
    // Let's download it via fetch, convert to blob, and trigger standard browser download!
    // This is 100% secure and supports JWT authentication headers!
    setLoading(true);
    api.get(`/admin/reports/export?type=${type}`, { responseType: 'blob' })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch((error) => {
        alert('Failed to export report: ' + (error.response?.data?.message || error.message));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const reports = [
    { 
      title: 'Devotee Bookings Report', 
      desc: 'All online darshan schedules, slot times, dates and registered devotees.', 
      type: 'bookings',
      icon: Calendar
    },
    { 
      title: 'Gate Visitors Log', 
      desc: 'Physical check-ins, check-outs, and dwell times inside the temple.', 
      type: 'visitors',
      icon: Users
    },
    { 
      title: 'Hotel Occupancy Sheet', 
      desc: 'Breeze Hotel, Taj Hotel, and Sree Hotel room configurations and bookings.', 
      type: 'hotels',
      icon: Hotel
    },
    { 
      title: 'Prasadam Distribution Sheet', 
      desc: 'Pongal, Laddu, and Puliyodarai prep volumes, distribution counts, and stock.', 
      type: 'prasadam',
      icon: Utensils
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="font-serif font-bold text-2xl md:text-3xl" style={{color:'#fff'}}>Reports & Audits</h1>
        <p className="text-xs mt-1" style={{color:'rgba(245,240,232,0.60)'}}>Export Excel/CSV reports for temple operations and logs</p>
      </div>

      {/* Stats preview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Darshan Slots Booked', val: stats?.onlineBookings || 0 },
          { label: 'Physical Gate Traffic', val: stats?.totalVisitorsToday || 0 },
          { label: 'Hotel Rooms Booked', val: stats?.accommodationBookings || 0 },
          { label: 'Prasadam Distributed', val: stats?.totalPrasadamDistributed || 0 },
        ].map((item, i) => (
          <div key={i} className="glass-card rounded-xl p-4 border" style={{background:'rgba(255,167,38,0.08)', borderColor:'rgba(255,167,38,0.22)'}}>
            <span className="text-[9px] font-bold uppercase tracking-wide" style={{color:'rgba(245,240,232,0.60)'}}>{item.label}</span>
            <p className="font-serif font-bold text-lg mt-1" style={{color:'#ffa726'}}>{item.val}</p>
          </div>
        ))}
      </div>

      {/* Reports Export Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reports.map((rep) => {
          const Icon = rep.icon;
          return (
            <div key={rep.type} className="glass-card rounded-2xl p-5 border flex flex-col justify-between gap-4" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
              <div className="flex gap-4">
                <div className="p-3.5 rounded-xl border h-fit" style={{background:'rgba(255,167,38,0.15)', color:'#ffa726', borderColor:'rgba(255,167,38,0.22)'}}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-sm" style={{color:'#fff'}}>{rep.title}</h3>
                  <p className="text-[11px] leading-relaxed" style={{color:'rgba(245,240,232,0.60)'}}>{rep.desc}</p>
                </div>
              </div>

              <div className="flex justify-end border-t pt-3" style={{borderColor:'rgba(255,167,38,0.22)'}}>
                <button
                  onClick={() => handleExport(rep.type)}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 bg-saffron-500 hover:bg-saffron-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export to Excel (CSV)
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50" style={{background:'rgba(18,10,3,0.6)'}}>
          <div className="p-4 rounded-xl shadow-lg border flex items-center gap-3" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
            <RefreshCw className="h-4 w-4 animate-spin text-saffron-500" />
            <span className="text-xs font-semibold" style={{color:'rgba(245,240,232,0.90)'}}>Generating report...</span>
          </div>
        </div>
      )}
    </div>
  );
}
