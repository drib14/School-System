import { useState } from 'react';
import { X, MapPin, Upload } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function CampusModal({ campus, onClose, onSave }) {
  const [form, setForm] = useState(campus || {
    name: '', code: '', address: { street: '', city: '', province: '', zipCode: '' },
    contact: { phone: '', email: '' }, imageUrl: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (campus?._id) {
        await api.put(`/campus/locations/${campus._id}`, form);
        toast.success('Campus updated successfully');
      } else {
        await api.post('/campus/locations', form);
        toast.success('Campus created successfully');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save campus');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slide">
        <div className="modal-header">
          <h3 className="modal-title">{campus ? 'Edit' : 'Add'} Campus</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-row cols-2">
            <div className="form-group">
              <label className="form-label">Campus Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Code / Abbreviation</label>
              <input className="form-input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Street Address</label>
            <input className="form-input" value={form.address.street} onChange={e => setForm(f => ({ ...f, address: { ...f.address, street: e.target.value } }))} required />
          </div>
          <div className="form-row cols-3">
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" value={form.address.city} onChange={e => setForm(f => ({ ...f, address: { ...f.address, city: e.target.value } }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Province</label>
              <input className="form-input" value={form.address.province} onChange={e => setForm(f => ({ ...f, address: { ...f.address, province: e.target.value } }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">ZIP Code</label>
              <input className="form-input" value={form.address.zipCode} onChange={e => setForm(f => ({ ...f, address: { ...f.address, zipCode: e.target.value } }))} />
            </div>
          </div>
          <div className="form-row cols-2">
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input className="form-input" value={form.contact.phone} onChange={e => setForm(f => ({ ...f, contact: { ...f.contact, phone: e.target.value } }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input className="form-input" type="email" value={form.contact.email} onChange={e => setForm(f => ({ ...f, contact: { ...f.contact, email: e.target.value } }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Image URL (Optional)</label>
            <input className="form-input" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
            {form.imageUrl && <div style={{ marginTop: 8, borderRadius: 8, height: 100, backgroundImage: `url(${form.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Campus'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
