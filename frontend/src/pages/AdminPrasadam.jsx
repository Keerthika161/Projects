import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Utensils, Plus, Edit3, Trash2, CheckCircle, AlertCircle, RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

export default function AdminPrasadam() {
  const [prasadam, setPrasadam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form inputs
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [quantityPrepared, setQuantityPrepared] = useState(0);
  const [quantityDistributed, setQuantityDistributed] = useState(0);

  const fetchPrasadam = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/prasadam');
      setPrasadam(res.data);
    } catch (err) {
      setError('Failed to fetch prasadam list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrasadam();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setQuantityPrepared(0);
    setQuantityDistributed(0);
    setError('');
    setSuccess('');
  };

  const handleOpenEdit = (p) => {
    setIsEditing(true);
    setEditingId(p.id);
    setName(p.name);
    setQuantityPrepared(p.quantity_prepared);
    setQuantityDistributed(p.quantity_distributed);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (quantityPrepared < 0 || quantityDistributed < 0) {
      setError('Quantities cannot be negative.');
      return;
    }
    if (quantityDistributed > quantityPrepared) {
      setError('Distributed quantity cannot exceed prepared quantity.');
      return;
    }

    try {
      if (isEditing) {
        await api.put(`/admin/prasadam/${editingId}`, {
          name: name.trim(),
          quantityPrepared,
          quantityDistributed
        });
        setSuccess('Prasadam quantities updated successfully.');
      } else {
        await api.post('/admin/prasadam', {
          name: name.trim(),
          quantityPrepared
        });
        setSuccess('New prasadam item added successfully.');
      }
      
      // Close forms, clear inputs, refresh lists
      setName('');
      setQuantityPrepared(0);
      setQuantityDistributed(0);
      setIsEditing(false);
      setEditingId(null);
      fetchPrasadam();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save prasadam item.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prasadam item?')) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      await api.delete(`/admin/prasadam/${id}`);
      setSuccess('Prasadam deleted successfully.');
      fetchPrasadam();
    } catch (err) {
      setError('Failed to delete prasadam.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl md:text-3xl" style={{color:'#fff'}}>Temple Prasadam Distribution</h1>
          <p className="text-xs mt-1" style={{color:'rgba(245,240,232,0.60)'}}>Monitor, prepare, and distribute sacred prasadam items</p>
        </div>
        
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-saffron-500 hover:bg-saffron-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          Add New Prasadam
        </button>
      </div>

      {error && (
        <div className="p-3 border rounded-xl text-xs font-semibold" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)', color:'#ef4444'}}>
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 border rounded-xl text-xs font-semibold" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)', color:'#22c55e'}}>
          {success}
        </div>
      )}

      {/* Grid of prasadam stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 flex justify-center py-6">
            <RefreshCw className="h-6 w-6 animate-spin text-saffron-500" />
          </div>
        ) : prasadam.length === 0 ? (
          <p className="col-span-3 text-xs text-center py-6" style={{color:'rgba(245,240,232,0.60)'}}>No prasadam records available.</p>
        ) : (
          prasadam.map((item) => (
            <div key={item.id} className="glass-card rounded-2xl p-5 border space-y-4" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-base" style={{color:'#fff'}}>{item.name}</h4>
                  <p className="text-[10px]" style={{color:'rgba(245,240,232,0.60)'}}>Distribution Load: {item.distribution_percentage}%</p>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg hover:text-saffron-500 transition-colors"
                    style={{color:'rgba(245,240,232,0.60)'}}
                    title="Edit/Update quantities"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg hover:text-red-500 transition-colors"
                    style={{color:'rgba(245,240,232,0.60)'}}
                    title="Delete item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full rounded-full h-2" style={{background:'rgba(255,255,255,0.12)'}}>
                <div 
                  className="bg-saffron-500 h-2 rounded-full transition-all" 
                  style={{ width: `${item.distribution_percentage}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold">
                <div className="p-2 rounded-lg" style={{background:'rgba(255,167,38,0.08)'}}>
                  <p className="text-[9px] mb-0.5" style={{color:'rgba(245,240,232,0.60)'}}>Prepared</p>
                  <span className="font-bold" style={{color:'#ffa726'}}>{item.quantity_prepared}</span>
                </div>
                <div className="p-2 rounded-lg" style={{background:'rgba(255,167,38,0.08)'}}>
                  <p className="text-[9px] mb-0.5" style={{color:'rgba(245,240,232,0.60)'}}>Distributed</p>
                  <span className="font-bold" style={{color:'#ffa726'}}>{item.quantity_distributed}</span>
                </div>
                <div className="p-2 rounded-lg" style={{background:'rgba(255,167,38,0.08)'}}>
                  <p className="text-[9px] mb-0.5" style={{color:'rgba(245,240,232,0.60)'}}>Remaining</p>
                  <span className="font-bold" style={{color:'#ffa726'}}>{item.remaining_quantity}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Editor Panel & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart representation */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 border" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
          <h3 className="font-serif font-bold text-sm mb-4" style={{color:'#fff'}}>Prasadam Inventory Levels</h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prasadam} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(245,240,232,0.60)' }} stroke="rgba(255, 255, 255, 0.1)" />
                <YAxis tick={{ fontSize: 10, fill: 'rgba(245,240,232,0.60)' }} stroke="rgba(255, 255, 255, 0.1)" />
                <Tooltip contentStyle={{ background: 'rgba(18,10,3,0.82)', border: '1px solid rgba(255,167,38,0.22)', borderRadius: '8px', color: '#fff' }} itemStyle={{color: '#fff'}} />
                <Legend wrapperStyle={{ fontSize: 10, color: 'rgba(245,240,232,0.60)' }} />
                <Bar dataKey="quantity_prepared" fill="#f37e22" name="Prepared" radius={[4, 4, 0, 0]} />
                <Bar dataKey="quantity_distributed" fill="#d4af37" name="Distributed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="remaining_quantity" fill="rgba(133, 77, 14, 0.4)" name="Remaining Stock" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic creation and update forms */}
        <div className="glass-card rounded-2xl p-5 md:p-6 border h-fit space-y-4" style={{background:'rgba(18,10,3,0.82)', borderColor:'rgba(255,167,38,0.22)'}}>
          <h3 className="font-serif font-bold text-sm" style={{color:'#fff'}}>
            {isEditing ? `Update ${name}` : 'New Prasadam Item'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-[10px] uppercase" style={{color:'rgba(245,240,232,0.60)'}}>Item Name</label>
              <input 
                type="text" 
                placeholder="e.g. Pongal, Laddu, Payasam"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isEditing} // Prevent name changes if editing for schema mapping simplicity
                className="form-input text-xs"
                style={{background:'rgba(255,255,255,0.08)', color:'#f5f0e8', borderColor:'rgba(255,167,38,0.22)'}}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase" style={{color:'rgba(245,240,232,0.60)'}}>Quantity Prepared</label>
              <input 
                type="number" 
                value={quantityPrepared}
                onChange={(e) => setQuantityPrepared(parseInt(e.target.value) || 0)}
                className="form-input text-xs"
                style={{background:'rgba(255,255,255,0.08)', color:'#f5f0e8', borderColor:'rgba(255,167,38,0.22)'}}
                required
              />
            </div>

            {isEditing && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase" style={{color:'rgba(245,240,232,0.60)'}}>Quantity Distributed</label>
                <input 
                  type="number" 
                  value={quantityDistributed}
                  onChange={(e) => setQuantityDistributed(parseInt(e.target.value) || 0)}
                  className="form-input text-xs"
                  style={{background:'rgba(255,255,255,0.08)', color:'#f5f0e8', borderColor:'rgba(255,167,38,0.22)'}}
                  required
                />
              </div>
            )}

            <div className="flex gap-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="flex-1 border py-2 rounded-xl text-xs transition-colors"
                  style={{borderColor:'rgba(255,167,38,0.22)', color:'rgba(245,240,232,0.90)'}}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex-1 bg-saffron-500 hover:bg-saffron-600 text-white font-bold py-2 rounded-xl text-xs shadow-sm transition-all"
              >
                {isEditing ? 'Save Changes' : 'Create Item'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
