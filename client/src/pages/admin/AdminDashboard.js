import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../../api';
import TraitSelector from '../../components/TraitSelector';
import './AdminDashboard.css';

const emptyForm = {
  name: '', breed: '', age: '', image: '', traits: [],
  status: 'available', activityLevel: 'moderate',
  goodWithKids: true, goodWithPets: true, description: '',
};

const COLORS = ['#4caf50', '#ff9800', '#e53935'];

function AdminDashboard() {
  const [pets, setPets]                 = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats]               = useState(null);
  const [form, setForm]                 = useState(emptyForm);
  const [formError, setFormError]       = useState('');
  const [activeTab, setActiveTab]       = useState('analytics');
  const [loading, setLoading]           = useState(true);

  // Edit modal state
  const [editPet, setEditPet]       = useState(null);
  const [editForm, setEditForm]     = useState({});
  const [editError, setEditError]   = useState('');
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [petsRes, appsRes, statsRes] = await Promise.all([
        api.get('/pets'),
        api.get('/applications'),
        api.get('/admin/stats'),
      ]);
      setPets(petsRes.data);
      setApplications(appsRes.data);
      setStats(statsRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // ── Add Pet ──
  const handleAddPet = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name || !form.breed || !form.age)
      return setFormError('Name, breed, and age are required');
    try {
      await api.post('/pets', {
        ...form,
        age: Number(form.age),
        traits: form.traits,
        goodWithKids: form.goodWithKids === true || form.goodWithKids === 'true',
        goodWithPets: form.goodWithPets === true || form.goodWithPets === 'true',
      });
      setForm(emptyForm);
      fetchAll();
    } catch (err) { setFormError(err.response?.data?.error || 'Failed to add pet'); }
  };

  // ── Delete Pet ──
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this pet?')) return;
    try {
      await api.delete(`/pets/${id}`);
      fetchAll();
    } catch { alert('Failed to delete pet'); }
  };

  // ── Open Edit Modal ──
  const openEdit = (pet) => {
    setEditPet(pet);
    setEditError('');
    setEditForm({
      name:          pet.name,
      breed:         pet.breed,
      age:           pet.age,
      image:         pet.image || '',
      traits:        pet.traits || [],
      status:        pet.status,
      activityLevel: pet.activityLevel || 'moderate',
      goodWithKids:  pet.goodWithKids,
      goodWithPets:  pet.goodWithPets,
      description:   pet.description || '',
    });
  };

  // ── Save Edit ──
  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editForm.name || !editForm.breed || !editForm.age)
      return setEditError('Name, breed, and age are required');
    setEditSaving(true);
    try {
      await api.put(`/pets/${editPet._id}`, {
        ...editForm,
        age: Number(editForm.age),
        traits: editForm.traits,
        goodWithKids: editForm.goodWithKids === true || editForm.goodWithKids === 'true',
        goodWithPets: editForm.goodWithPets === true || editForm.goodWithPets === 'true',
      });
      setEditPet(null);
      fetchAll();
    } catch (err) { setEditError(err.response?.data?.error || 'Failed to update pet'); }
    finally { setEditSaving(false); }
  };

  // ── Approve / Reject ──
  const handleStatusChange = async (appId, status) => {
    try {
      const { data } = await api.put(`/applications/${appId}`, { status });
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: data.status } : a))
      );
      // refresh stats after decision
      api.get('/admin/stats').then(({ data: s }) => setStats(s));
    } catch { alert('Failed to update status'); }
  };

  // ── Chart data from real stats ──
  const barData = stats ? [
    { name: 'Total Pets',   value: stats.totalPets },
    { name: 'Available',    value: stats.totalPets - stats.adoptedPets },
    { name: 'Adopted',      value: stats.adoptedPets },
    { name: 'Applications', value: stats.totalApplications },
    { name: 'Approved',     value: stats.approvedApplications },
  ] : [];

  const pieData = stats ? [
    { name: 'Approved', value: stats.approvedApplications },
    { name: 'Pending',  value: stats.pendingApplications  },
    { name: 'Rejected', value: stats.totalApplications - stats.approvedApplications - stats.pendingApplications },
  ] : [];

  return (
    <div className="admin-container">
      <h2 className="admin-heading">⚙️ Admin Dashboard</h2>

      <div className="admin-tabs">
        {['analytics', 'pets', 'apps'].map((tab) => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}>
            {tab === 'analytics' ? '📊 Analytics'
              : tab === 'pets' ? `🐾 Manage Pets (${pets.length})`
              : `📋 Applications (${applications.length})`}
          </button>
        ))}
      </div>

      {/* ── ANALYTICS TAB ── */}
      {activeTab === 'analytics' && (
        <>
          {loading || !stats ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : (
            <>
              <div className="analytics-stats">
                <div className="analytics-card green">
                  <span className="analytics-num">{stats.totalPets}</span>
                  <span className="analytics-label">Total Pets</span>
                </div>
                <div className="analytics-card blue">
                  <span className="analytics-num">{stats.totalApplications}</span>
                  <span className="analytics-label">Total Applications</span>
                </div>
                <div className="analytics-card orange">
                  <span className="analytics-num">{stats.adoptedPets}</span>
                  <span className="analytics-label">Pets Adopted</span>
                </div>
                <div className="analytics-card teal">
                  <span className="analytics-num">{stats.successRate}%</span>
                  <span className="analytics-label">Success Rate</span>
                </div>
              </div>

              <div className="charts-row">
                <div className="admin-card chart-card">
                  <h3>Overview</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#4caf50" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="admin-card chart-card">
                  <h3>Application Status</h3>
                  {stats.totalApplications === 0 ? (
                    <p className="loading-text">No applications yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                          {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ── PETS TAB ── */}
      {activeTab === 'pets' && (
        <>
          <div className="admin-card">
            <h3>Add New Pet</h3>
            {formError && <div className="admin-error">{formError}</div>}
            <form className="add-pet-form" onSubmit={handleAddPet}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input placeholder="e.g. Buddy" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Breed *</label>
                  <input placeholder="e.g. Labrador" value={form.breed}
                    onChange={(e) => setForm({ ...form, breed: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Age *</label>
                  <input type="number" min="0" placeholder="e.g. 2" value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Image URL</label>
                  <input placeholder="https://..." value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Traits</label>
                  <TraitSelector
                    selected={form.traits}
                    onChange={(traits) => setForm({ ...form, traits })}
                  />
                </div>
                <div className="form-group">
                  <label>Activity Level</label>
                  <select value={form.activityLevel}
                    onChange={(e) => setForm({ ...form, activityLevel: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="available">Available</option>
                    <option value="adopted">Adopted</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Good with Kids</label>
                  <select value={form.goodWithKids}
                    onChange={(e) => setForm({ ...form, goodWithKids: e.target.value === 'true' })}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Good with Pets</label>
                  <select value={form.goodWithPets}
                    onChange={(e) => setForm({ ...form, goodWithPets: e.target.value === 'true' })}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Description</label>
                  <input placeholder="Short description about the pet..." value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="add-btn">+ Add Pet</button>
            </form>
          </div>

          <div className="admin-card">
            <h3>All Pets</h3>
            {loading ? (
              <div className="spinner-wrap"><div className="spinner" /></div>
            ) : pets.length === 0 ? (
              <p className="loading-text">No pets available.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Image</th><th>Name</th><th>Breed</th><th>Age</th><th>Activity</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {pets.map((pet) => (
                      <tr key={pet._id}>
                        <td><img src={pet.image || 'https://via.placeholder.com/60'} alt={pet.name} className="table-pet-img" /></td>
                        <td>{pet.name}</td>
                        <td>{pet.breed}</td>
                        <td>{pet.age} yr{pet.age !== 1 ? 's' : ''}</td>
                        <td className="capitalize">{pet.activityLevel}</td>
                        <td><span className={`status-pill ${pet.status}`}>{pet.status}</span></td>
                        <td>
                          <div className="action-btns">
                            <button className="edit-btn" onClick={() => openEdit(pet)}>✏️ Edit</button>
                            <button className="delete-btn" onClick={() => handleDelete(pet._id)}>🗑 Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── APPLICATIONS TAB ── */}
      {activeTab === 'apps' && (
        <div className="admin-card">
          <h3>Adoption Applications</h3>
          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : applications.length === 0 ? (
            <p className="loading-text">No applications yet.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Applicant</th><th>Pet</th><th>Reason</th><th>Date</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td>{app.userId?.name || app.userName}</td>
                      <td>{app.petId?.name}<br /><small>{app.petId?.breed}</small></td>
                      <td className="reason-cell">{app.reason || '—'}</td>
                      <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td><span className={`status-pill ${app.status}`}>{app.status}</span></td>
                      <td>
                        {app.status === 'pending' ? (
                          <div className="action-btns">
                            <button className="approve-btn" onClick={() => handleStatusChange(app._id, 'approved')}>✓ Approve</button>
                            <button className="reject-btn"  onClick={() => handleStatusChange(app._id, 'rejected')}>✕ Reject</button>
                          </div>
                        ) : <span className="decided-text">Decided</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editPet && (
        <div className="modal-overlay" onClick={() => setEditPet(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Edit — {editPet.name}</h3>
              <button className="modal-close" onClick={() => setEditPet(null)}>✕</button>
            </div>
            {editError && <div className="admin-error">{editError}</div>}
            <form onSubmit={handleEditSave}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Breed *</label>
                  <input value={editForm.breed}
                    onChange={(e) => setEditForm({ ...editForm, breed: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Age *</label>
                  <input type="number" min="0" value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Image URL</label>
                  <input value={editForm.image}
                    onChange={(e) => setEditForm({ ...editForm, image: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Traits</label>
                  <TraitSelector
                    selected={editForm.traits}
                    onChange={(traits) => setEditForm({ ...editForm, traits })}
                  />
                </div>
                <div className="form-group">
                  <label>Activity Level</label>
                  <select value={editForm.activityLevel}
                    onChange={(e) => setEditForm({ ...editForm, activityLevel: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                    <option value="available">Available</option>
                    <option value="adopted">Adopted</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Good with Kids</label>
                  <select value={editForm.goodWithKids}
                    onChange={(e) => setEditForm({ ...editForm, goodWithKids: e.target.value === 'true' })}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Good with Pets</label>
                  <select value={editForm.goodWithPets}
                    onChange={(e) => setEditForm({ ...editForm, goodWithPets: e.target.value === 'true' })}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Description</label>
                  <input value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setEditPet(null)}>Cancel</button>
                <button type="submit" className="add-btn" disabled={editSaving}>
                  {editSaving ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
