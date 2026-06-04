import { useState, useEffect, useRef } from 'react';
import {
  Building2, Plus, Search, Filter, Calendar, CheckCircle, Clock,
  XCircle, Edit2, Trash2, MapPin, Users, Package, AlertCircle,
  ChevronDown, RefreshCw, X
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import CampusModal from './CampusModal';
import CustomSelect from '../../components/forms/CustomSelect';

const ROOM_TYPES = ['classroom', 'laboratory', 'library', 'gym', 'office', 'auditorium', 'cafeteria', 'clinic', 'other'];
const ASSET_STATUS_COLOR = { good: 'badge-green', for_repair: 'badge-yellow', under_repair: 'badge-red', disposed: 'badge-gray' };

function RoomModal({ room, onClose, onSave, schoolId }) {
  const [form, setForm] = useState(room || {
    name: '', code: '', building: '', floor: 1, type: 'classroom',
    capacity: 40, facilities: [],
  });
  const [facilityInput, setFacilityInput] = useState('');
  const [loading, setLoading] = useState(false);

  const addFacility = () => {
    if (facilityInput.trim()) {
      setForm(f => ({ ...f, facilities: [...(f.facilities || []), facilityInput.trim()] }));
      setFacilityInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (room?._id) {
        await api.put(`/campus/rooms/${room._id}`, form);
        toast.success('Room updated');
      } else {
        await api.post('/campus/rooms', form);
        toast.success('Room created');
      }
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg animate-slide">
        <div className="modal-header">
          <h3 className="modal-title">{room?._id ? 'Edit Room' : 'Add Room'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Room Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Computer Lab 1" />
              </div>
              <div className="form-group">
                <label className="form-label">Room Code *</label>
                <input className="form-input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required placeholder="e.g. CL-101" />
              </div>
              <div className="form-group">
                <label className="form-label">Building</label>
                <input className="form-input" value={form.building} onChange={e => setForm(f => ({ ...f, building: e.target.value }))} placeholder="e.g. Main Building" />
              </div>
              <div className="form-group">
                <label className="form-label">Floor</label>
                <input className="form-input" type="number" value={form.floor} onChange={e => setForm(f => ({ ...f, floor: Number(e.target.value) }))} min={1} />
              </div>
              <div className="form-group">
                <label className="form-label">Room Type</label>
                <CustomSelect
                  value={form.type}
                  onChange={val => setForm(f => ({ ...f, type: val }))}
                  options={ROOM_TYPES.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Capacity</label>
                <input className="form-input" type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} min={1} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">Facilities</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input className="form-input" value={facilityInput} onChange={e => setFacilityInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFacility())}
                  placeholder="Add facility (e.g. Projector, AC)..." style={{ flex: 1 }} />
                <button type="button" className="btn btn-secondary btn-sm" onClick={addFacility}>Add</button>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(form.facilities || []).map((f, i) => (
                  <span key={i} className="badge badge-blue" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {f}
                    <button type="button" onClick={() => setForm(frm => ({ ...frm, facilities: frm.facilities.filter((_, idx) => idx !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1 }}>✕</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Room'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssetModal({ asset, rooms, onClose, onSave }) {
  const [form, setForm] = useState(asset || {
    name: '', code: '', type: 'computer', brand: '', model: '', serialNumber: '',
    location: '', status: 'good', purchaseCost: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (asset?._id) {
        await api.put(`/campus/assets/${asset._id}`, form);
        toast.success('Asset updated');
      } else {
        await api.post('/campus/assets', form);
        toast.success('Asset added');
      }
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg animate-slide">
        <div className="modal-header">
          <h3 className="modal-title">{asset?._id ? 'Edit Asset' : 'Add Asset'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Asset Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Asset Code</label>
                <input className="form-input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <CustomSelect
                  value={form.type}
                  onChange={val => setForm(f => ({ ...f, type: val }))}
                  options={['computer', 'projector', 'furniture', 'equipment', 'vehicle', 'book', 'other'].map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <CustomSelect
                  value={form.status}
                  onChange={val => setForm(f => ({ ...f, status: val }))}
                  options={[
                    { value: 'good', label: 'Good' },
                    { value: 'for_repair', label: 'For Repair' },
                    { value: 'under_repair', label: 'Under Repair' },
                    { value: 'disposed', label: 'Disposed' }
                  ]}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Brand</label>
                <input className="form-input" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Model</label>
                <input className="form-input" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Serial Number</label>
                <input className="form-input" value={form.serialNumber} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Location (Room)</label>
                <CustomSelect
                  value={form.location}
                  onChange={val => setForm(f => ({ ...f, location: val }))}
                  options={[
                    { value: '', label: '— Select Room —' },
                    ...rooms.map(r => ({ value: r._id, label: `${r.name} (${r.code})` }))
                  ]}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Purchase Cost (₱)</label>
                <input className="form-input" type="number" value={form.purchaseCost} onChange={e => setForm(f => ({ ...f, purchaseCost: Number(e.target.value) }))} min={0} />
              </div>
              <div className="form-group">
                <label className="form-label">Purchase Date</label>
                <input className="form-input" type="date" value={form.purchaseDate?.slice(0, 10) || ''} onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Asset'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('campuses');
  const [campuses, setCampuses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [editRoom, setEditRoom] = useState(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [assetSummary, setAssetSummary] = useState(null);
  const [editCampus, setEditCampus] = useState(null);
  const [showCampusModal, setShowCampusModal] = useState(false);

  const canManage = ['registrar', 'principal', 'super_admin', 'school_owner'].includes(user?.role);

  useEffect(() => { fetchAll(); }, [activeTab]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      if (activeTab === 'campuses') {
        const { data } = await api.get('/campus/locations');
        setCampuses(data.campuses || []);
      } else if (activeTab === 'rooms') {
        const { data } = await api.get('/campus/rooms');
        setRooms(data.rooms || []);
      } else {
        const [assetsRes, summaryRes] = await Promise.all([
          api.get('/campus/assets'),
          api.get('/campus/assets/summary').catch(() => ({ data: null })),
        ]);
        setAssets(assetsRes.data.assets || []);
        setAssetSummary(summaryRes.data);
      }
    } catch { } finally { setLoading(false); }
  };

  const filteredCampuses = campuses.filter(c => {
    const s = search.toLowerCase();
    return (!s || c.name?.toLowerCase().includes(s) || c.code?.toLowerCase().includes(s));
  });

  const filteredRooms = rooms.filter(r => {
    const s = search.toLowerCase();
    return (!s || r.name?.toLowerCase().includes(s) || r.code?.toLowerCase().includes(s) || r.building?.toLowerCase().includes(s)) &&
      (!filterType || r.type === filterType);
  });

  const filteredAssets = assets.filter(a => {
    const s = search.toLowerCase();
    return (!s || a.name?.toLowerCase().includes(s) || a.code?.toLowerCase().includes(s) || a.serialNumber?.toLowerCase().includes(s)) &&
      (!filterType || a.type === filterType);
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Campus Management</h1>
          <p className="page-sub">Manage rooms and assets</p>
        </div>
        <div className="page-actions">
          <button className={`btn btn-sm ${activeTab === 'campuses' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('campuses')}>
            <MapPin size={14} /> Campuses
          </button>
          <button className={`btn btn-sm ${activeTab === 'rooms' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('rooms')}>
            <Building2 size={14} /> Rooms
          </button>
          <button className={`btn btn-sm ${activeTab === 'assets' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('assets')}>
            <Package size={14} /> Assets
          </button>
          {canManage && (
            <button className="btn btn-primary btn-sm" onClick={() => activeTab === 'campuses' ? setShowCampusModal(true) : activeTab === 'rooms' ? setShowRoomModal(true) : setShowAssetModal(true)}>
              <Plus size={14} /> Add {activeTab === 'campuses' ? 'Campus' : activeTab === 'rooms' ? 'Room' : 'Asset'}
            </button>
          )}
        </div>
      </div>

      {/* Asset Summary Cards */}
      {activeTab === 'assets' && assetSummary && (
        <div className="grid-4" style={{ marginBottom: 20 }}>
          {(assetSummary.byStatus || []).map(s => (
            <div key={s._id} className="stat-card blue" style={{ padding: '14px 16px' }}>
              <div className="stat-value" style={{ fontSize: 22 }}>{s.count}</div>
              <div className="stat-label">{s._id?.replace(/_/g, ' ')}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-wrapper" style={{ flex: 1 }}>
          <Search size={14} className="search-icon" />
          <input className="search-input" placeholder={`Search ${activeTab}...`} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {activeTab !== 'campuses' && (
          <CustomSelect
            className="filter-cs"
            value={filterType}
            onChange={val => setFilterType(val)}
            options={[
              { value: '', label: 'All Types' },
              ...(activeTab === 'rooms' ? ROOM_TYPES : ['computer', 'projector', 'furniture', 'equipment', 'vehicle', 'book', 'other']).map(t => ({
                value: t,
                label: t.charAt(0).toUpperCase() + t.slice(1)
              }))
            ]}
          />
        )}
        <button className="btn btn-secondary btn-sm btn-icon" onClick={fetchAll}><RefreshCw size={14} /></button>
      </div>

      {/* CAMPUSES TAB */}
      {activeTab === 'campuses' && (
        <div className="grid-3" style={{ gap: 20 }}>
          {loading ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card skeleton" style={{ height: 200 }} />
          )) : filteredCampuses.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center' }}>
              <MapPin size={48} style={{ margin: '0 auto 16px', color: 'var(--text-muted)', opacity: 0.5 }} />
              <div style={{ fontSize: 16, fontWeight: 600 }}>No Campuses Found</div>
              <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>Add a campus to manage locations.</div>
            </div>
          ) : filteredCampuses.map(campus => (
            <div key={campus._id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
              {campus.imageUrl ? (
                <div style={{ height: 140, backgroundImage: `url(${campus.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              ) : (
                <div style={{ height: 140, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={48} style={{ opacity: 0.2 }} />
                </div>
              )}
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{campus.name}</h3>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{campus.code}</div>
                  </div>
                  {canManage && (
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setEditCampus(campus); setShowCampusModal(true); }}>
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <MapPin size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span>{campus.address?.street}, {campus.address?.city}, {campus.address?.province} {campus.address?.zipCode}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ROOMS TAB */}
      {activeTab === 'rooms' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Room</th><th>Building / Floor</th><th>Type</th><th>Capacity</th><th>Facilities</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: canManage ? 6 : 5 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>)}</tr>
                )) : filteredRooms.length === 0 ? (
                  <tr><td colSpan={canManage ? 6 : 5} className="table-empty">
                    <Building2 size={36} style={{ opacity: 0.2, display: 'block', margin: '0 auto 8px' }} />
                    No rooms found. {canManage && <button className="btn btn-sm btn-primary" onClick={() => setShowRoomModal(true)}>Add Room</button>}
                  </td></tr>
                ) : filteredRooms.map(room => (
                  <tr key={room._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{room.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{room.code}</div>
                    </td>
                    <td>
                      <div>{room.building || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Floor {room.floor || 1}</div>
                    </td>
                    <td><span className="badge badge-blue">{room.type}</span></td>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12} />{room.capacity}</div></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(room.facilities || []).slice(0, 3).map((f, i) => <span key={i} className="badge badge-gray">{f}</span>)}
                        {(room.facilities || []).length > 3 && <span className="badge badge-gray">+{room.facilities.length - 3}</span>}
                      </div>
                    </td>
                    {canManage && (
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setEditRoom(room); setShowRoomModal(true); }}><Edit2 size={13} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ASSETS TAB */}
      {activeTab === 'assets' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Asset</th><th>Type</th><th>Location</th><th>Status</th><th>Purchase Cost</th><th>Serial #</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>)}</tr>
                )) : filteredAssets.length === 0 ? (
                  <tr><td colSpan={7} className="table-empty">
                    <Package size={36} style={{ opacity: 0.2, display: 'block', margin: '0 auto 8px' }} />
                    No assets found.
                  </td></tr>
                ) : filteredAssets.map(asset => (
                  <tr key={asset._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{asset.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{asset.brand} {asset.model}</div>
                    </td>
                    <td><span className="badge badge-blue">{asset.type}</span></td>
                    <td>{asset.location?.name || '—'}</td>
                    <td><span className={`badge ${ASSET_STATUS_COLOR[asset.status] || 'badge-gray'}`}>{asset.status?.replace(/_/g, ' ')}</span></td>
                    <td style={{ fontWeight: 600 }}>{asset.purchaseCost ? `₱${asset.purchaseCost.toLocaleString()}` : '—'}</td>
                    <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{asset.serialNumber || '—'}</td>
                    {canManage && (
                      <td>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setEditAsset(asset); setShowAssetModal(true); }}><Edit2 size={13} /></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCampusModal && <CampusModal campus={editCampus} onClose={() => { setShowCampusModal(false); setEditCampus(null); }} onSave={() => { setShowCampusModal(false); setEditCampus(null); fetchAll(); }} />}
      {showRoomModal && <RoomModal room={editRoom} onClose={() => { setShowRoomModal(false); setEditRoom(null); }} onSave={() => { setShowRoomModal(false); setEditRoom(null); fetchAll(); }} />}
      {showAssetModal && <AssetModal asset={editAsset} rooms={rooms} onClose={() => { setShowAssetModal(false); setEditAsset(null); }} onSave={() => { setShowAssetModal(false); setEditAsset(null); fetchAll(); }} />}
    </div>
  );
}
