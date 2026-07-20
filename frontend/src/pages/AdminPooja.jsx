import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Sparkles, Plus, Edit3, Trash2, Calendar, RefreshCw
} from 'lucide-react';

export default function AdminPooja() {
  const [poojas, setPoojas] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form input states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [poojaDate, setPoojaDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('active');

  const fetchPoojas = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/poojas?date=${date}`);
      setPoojas(res.data);
    } catch (err) {
      setError('Failed to fetch poojas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoojas();
  }, [date]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setDescription('');
    setPoojaDate(date);
    setStatus('active');
    setError('');
    setSuccess('');
  };

  const handleOpenEdit = (p) => {
    setIsEditing(true);
    setEditingId(p.id);
    setName(p.name);
    setDescription(p.description);
    setPoojaDate(p.date);
    setStatus(p.status);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !poojaDate) {
      setError('Name and Date are required.');
      return;
    }

    try {
      if (isEditing) {
        await api.put(`/admin/poojas/${editingId}`, {
          name: name.trim(),
          description: description.trim(),
          date: poojaDate,
          status
        });
        setSuccess('Special pooja updated successfully.');
      } else {
        await api.post('/admin/poojas', {
          name: name.trim(),
          description: description.trim(),
          date: poojaDate
        });
        setSuccess('New special pooja added and broadcasted to devotees.');
      }

      setName('');
      setDescription('');
      setIsEditing(false);
      setEditingId(null);
      fetchPoojas();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save pooja.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this special pooja schedule?')) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      await api.delete(`/admin/poojas/${id}`);
      setSuccess('Pooja schedule removed successfully.');
      fetchPoojas();
    } catch (err) {
      setError('Failed to delete pooja.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl md:text-3xl" style={{color:'#fff'}}>Special Pooja Planner</h1>
          <p className="text-xs mt-1" style={{color:'rgba(245,240,232,0.60)'}}>Configure and announce today's divine pooja items</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-saffron-500 hover:bg-saffron-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          Schedule Pooja
        </button>
      </div>

      {error && (
        <div className="p-3 border rounded-xl text-xs font-semibold" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)', color:'#ff6b6b'}}>
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 border rounded-xl text-xs font-semibold" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)', color:'#4ade80'}}>
          {success}
        </div>
      )}

      {/* Date Filter bar */}
      <div className="glass-card rounded-2xl p-4 md:p-5 border flex flex-col sm:flex-row items-center justify-between gap-4" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
        <span className="text-xs font-bold" style={{color:'rgba(245,240,232,0.90)'}}>Show Poojas for Date:</span>
        <input 
          type="date" 
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="form-input text-xs py-2 w-full sm:w-44 text-center font-bold"
          style={{background:'rgba(255,255,255,0.08)', color:'#f5f0e8', borderColor:'rgba(255,167,38,0.22)'}}
        />
      </div>

      {/* Grid List & Scheduling Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* List of Poojas */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 md:p-6 border space-y-4" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
          <h3 className="font-serif font-bold text-sm border-b pb-3" style={{color:'#fff', borderColor:'rgba(255,167,38,0.22)'}}>Scheduled Poojas ({poojas.length})</h3>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-saffron-500" />
            </div>
          ) : poojas.length === 0 ? (
            <p className="text-xs text-center py-12" style={{color:'rgba(245,240,232,0.60)'}}>No special poojas scheduled for this date.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {poojas.map((pooja) => (
                <div 
                  key={pooja.id} 
                  className="p-4 rounded-xl border flex flex-col justify-between"
                  style={{background:'rgba(255,167,38,0.08)', borderColor:'rgba(255,167,38,0.22)'}}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-sm" style={{color:'#fff'}}>{pooja.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold capitalize`} style={{
                        background: pooja.status === 'active' ? 'rgba(74,222,128,0.1)' : 'rgba(255,167,38,0.1)',
                        color: pooja.status === 'active' ? '#4ade80' : '#ffa726'
                      }}>
                        {pooja.status}
                      </span>
                    </div>
                    <p className="text-xs mt-1 leading-relaxed" style={{color:'rgba(245,240,232,0.90)'}}>{pooja.description}</p>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-3 border-t text-[10px] font-semibold" style={{borderColor:'rgba(255,167,38,0.22)', color:'rgba(245,240,232,0.60)'}}>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" style={{color:'#ffa726'}} />
                      {pooja.date}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenEdit(pooja)}
                        className="p-1 rounded-md transition-colors"
                        style={{background:'rgba(255,167,38,0.15)', color:'#ffa726'}}
                        title="Edit pooja"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pooja.id)}
                        className="p-1 rounded-md transition-colors"
                        style={{background:'rgba(255,167,38,0.15)', color:'#ff6b6b'}}
                        title="Delete pooja"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule form */}
        <div className="glass-card rounded-2xl p-5 md:p-6 border h-fit space-y-4" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
          <h3 className="font-serif font-bold text-sm" style={{color:'#fff'}}>
            {isEditing ? `Edit Pooja Details` : 'Schedule New Pooja'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-[10px] uppercase" style={{color:'rgba(245,240,232,0.60)'}}>Pooja Name</label>
              <input 
                type="text" 
                placeholder="e.g. Abhishekam, Lakshmi Pooja"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input text-xs"
                style={{background:'rgba(255,255,255,0.08)', color:'#f5f0e8', borderColor:'rgba(255,167,38,0.22)'}}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase" style={{color:'rgba(245,240,232,0.60)'}}>Description / Timings</label>
              <textarea 
                rows="3"
                placeholder="Describe details, times and ritual processes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input text-xs"
                style={{background:'rgba(255,255,255,0.08)', color:'#f5f0e8', borderColor:'rgba(255,167,38,0.22)'}}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase" style={{color:'rgba(245,240,232,0.60)'}}>Date Scheduled</label>
              <input 
                type="date" 
                value={poojaDate}
                onChange={(e) => setPoojaDate(e.target.value)}
                className="form-input text-xs font-bold"
                style={{background:'rgba(255,255,255,0.08)', color:'#f5f0e8', borderColor:'rgba(255,167,38,0.22)'}}
                required
              />
            </div>

            {isEditing && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase" style={{color:'rgba(245,240,232,0.60)'}}>Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="form-input text-xs"
                  style={{background:'rgba(255,255,255,0.08)', color:'#f5f0e8', borderColor:'rgba(255,167,38,0.22)'}}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}

            <div className="flex gap-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="flex-1 border py-2 rounded-xl text-xs transition-colors"
                  style={{borderColor:'rgba(255,167,38,0.22)', color:'rgba(245,240,232,0.90)', background:'rgba(255,255,255,0.08)'}}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex-1 bg-saffron-500 hover:bg-saffron-600 text-white font-bold py-2 rounded-xl text-xs shadow-sm transition-all"
              >
                {isEditing ? 'Save Pooja' : 'Create Pooja'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
