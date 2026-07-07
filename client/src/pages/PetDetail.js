import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { calcCompatibility } from '../utils/compatibility';
import TraitSelector from '../components/TraitSelector';
import './PetDetail.css';

function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [pet, setPet]             = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [isFav, setIsFav]         = useState(false);
  const [lifestyle, setLifestyle] = useState(null);
  const [score, setScore]         = useState(null);

  // Edit state
  const [editing, setEditing]     = useState(false);
  const [editForm, setEditForm]   = useState({});
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    api.get(`/pets/${id}`)
      .then(({ data }) => {
        if (data.status === 'adopted' && !isAdmin) {
          navigate('/pets', { replace: true });
          return;
        }
        setPet(data);
        setEditForm({
          name:          data.name,
          breed:         data.breed,
          age:           data.age,
          image:         data.image || '',
          traits:        data.traits || [],
          status:        data.status,
          activityLevel: data.activityLevel || 'moderate',
          goodWithKids:  data.goodWithKids,
          goodWithPets:  data.goodWithPets,
          description:   data.description || '',
        });
      })
      .catch(() => setPet(null))
      .finally(() => setLoading(false));

    if (user && !isAdmin) {
      api.get('/users/me').then(({ data }) => {
        setIsFav(data.favorites?.some((f) => (f._id || f) === id));
        if (data.lifestyle?.activityLevel) setLifestyle(data.lifestyle);
      });
    }
  }, [id, user, isAdmin]);

  useEffect(() => {
    if (lifestyle && pet) setScore(calcCompatibility(lifestyle, pet));
  }, [lifestyle, pet]);

  const toggleFav = async () => {
    if (!user) return navigate('/login');
    try {
      const { data } = await api.post(`/users/favorites/${id}`);
      setIsFav(data.favorites.some((f) => f.toString() === id));
    } catch { /* silent */ }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editForm.name || !editForm.breed || !editForm.age)
      return setEditError('Name, breed, and age are required');
    setEditSaving(true);
    try {
      const payload = {
        ...editForm,
        age: Number(editForm.age),
        traits: editForm.traits,
        goodWithKids: editForm.goodWithKids === true || editForm.goodWithKids === 'true',
        goodWithPets: editForm.goodWithPets === true || editForm.goodWithPets === 'true',
      };
      console.log('PUT /pets/' + id, payload);
      const { data } = await api.put(`/pets/${id}`, payload);
      setPet(data);
      setEditing(false);
    } catch (err) {
      console.error('Edit save error:', err.response?.status, err.response?.data, err.message);
      const msg = err.response?.data?.error || err.message || 'Failed to update pet';
      setEditError(`[${err.response?.status ?? 'network'}] ${msg}`);
    } finally {
      setEditSaving(false);
    }
  };

  const getScoreColor = (s) => s >= 75 ? '#4caf50' : s >= 50 ? '#ff9800' : '#e53935';

  if (loading) return <div className="detail-loading">Loading...</div>;
  if (!pet)    return <div className="detail-loading">Pet not found.</div>;

  const images = pet.gallery?.length ? pet.gallery : [pet.image];

  return (
    <div className="detail-container">
      <button className="back-btn" onClick={() => navigate('/pets')}>← Back to Pets</button>

      <div className="detail-card">
        {/* Gallery */}
        <div className="gallery-section">
          <img
            src={images[activeImg] || 'https://via.placeholder.com/600x400'}
            alt={pet.name}
            className="gallery-main"
          />
          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((img, i) => (
                <img key={i} src={img} alt="" className={`gallery-thumb ${activeImg === i ? 'active' : ''}`}
                  onClick={() => setActiveImg(i)} />
              ))}
            </div>
          )}
        </div>

        {/* Info / Edit */}
        <div className="detail-info">
          {!editing ? (
            <>
              <div className="detail-header">
                <h2 className="detail-name">{pet.name}</h2>
                <div className="detail-header-actions">
                  {isAdmin && (
                    <button className="edit-detail-btn" onClick={() => setEditing(true)}>
                      ✏️ Edit Pet
                    </button>
                  )}
                  {!isAdmin && (
                    <button className={`fav-btn ${isFav ? 'fav-active' : ''}`} onClick={toggleFav}
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}>
                      {isFav ? '❤️' : '🤍'}
                    </button>
                  )}
                </div>
              </div>

              <div className="detail-meta-grid">
                <div className="meta-item"><span className="meta-label">Breed</span><span>{pet.breed}</span></div>
                <div className="meta-item"><span className="meta-label">Age</span><span>{pet.age} yr{pet.age !== 1 ? 's' : ''}</span></div>
                <div className="meta-item"><span className="meta-label">Activity</span><span className="capitalize">{pet.activityLevel}</span></div>
                <div className="meta-item">
                  <span className="meta-label">Status</span>
                  <span className={`status-tag ${pet.status}`}>{pet.status}</span>
                </div>
              </div>

              {pet.description && <p className="detail-description">{pet.description}</p>}

              <div className="detail-traits">
                {pet.traits.map((t) => <span key={t} className="trait-badge">{t}</span>)}
              </div>

              <div className="compat-flags">
                <span className={`flag ${pet.goodWithKids ? 'yes' : 'no'}`}>
                  {pet.goodWithKids ? '✓' : '✗'} Good with Kids
                </span>
                <span className={`flag ${pet.goodWithPets ? 'yes' : 'no'}`}>
                  {pet.goodWithPets ? '✓' : '✗'} Good with Pets
                </span>
              </div>

              {score !== null && !isAdmin && (
                <div className="compat-score-box">
                  <span className="compat-score-label">Your Compatibility</span>
                  <div className="compat-bar">
                    <div className="compat-fill" style={{ width: `${score}%`, background: getScoreColor(score) }} />
                  </div>
                  <span className="compat-pct" style={{ color: getScoreColor(score) }}>{score}% Match</span>
                  {score < 50 && (
                    <p className="compat-hint">
                      Take the <button className="link-btn" onClick={() => navigate('/quiz')}>Compatibility Quiz</button> to improve your matches.
                    </p>
                  )}
                </div>
              )}

              {!score && !isAdmin && (
                <p className="compat-hint">
                  <button className="link-btn" onClick={() => navigate('/quiz')}>Take the quiz</button> to see your compatibility score.
                </p>
              )}

              {!isAdmin && (
                <button className="apply-btn" onClick={() => navigate(`/apply/${pet._id}`)}
                  disabled={pet.status === 'adopted'}>
                  {pet.status === 'adopted' ? 'Already Adopted' : 'Apply for Adoption'}
                </button>
              )}
            </>
          ) : (
            /* ── INLINE EDIT FORM ── */
            <div className="edit-form-wrap">
              <h3 className="edit-form-title">✏️ Edit Pet Details</h3>
              {editError && <div className="edit-error">{editError}</div>}
              <form onSubmit={handleEditSave}>
                <div className="edit-field">
                  <label>Name *</label>
                  <input value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div className="edit-field">
                  <label>Breed *</label>
                  <input value={editForm.breed}
                    onChange={(e) => setEditForm({ ...editForm, breed: e.target.value })} />
                </div>
                <div className="edit-field">
                  <label>Age (years) *</label>
                  <input type="number" min="0" value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })} />
                </div>
                <div className="edit-field">
                  <label>Image URL</label>
                  <input value={editForm.image}
                    onChange={(e) => setEditForm({ ...editForm, image: e.target.value })} />
                </div>
                <div className="edit-field">
                  <label>Traits</label>
                  <TraitSelector
                    selected={editForm.traits}
                    onChange={(traits) => setEditForm({ ...editForm, traits })}
                  />
                </div>
                <div className="edit-field">
                  <label>Description</label>
                  <textarea rows={3} value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                </div>
                <div className="edit-row">
                  <div className="edit-field">
                    <label>Activity Level</label>
                    <select value={editForm.activityLevel}
                      onChange={(e) => setEditForm({ ...editForm, activityLevel: e.target.value })}>
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="edit-field">
                    <label>Status</label>
                    <select value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                      <option value="available">Available</option>
                      <option value="adopted">Adopted</option>
                    </select>
                  </div>
                </div>
                <div className="edit-row">
                  <div className="edit-field">
                    <label>Good with Kids</label>
                    <select value={String(editForm.goodWithKids)}
                      onChange={(e) => setEditForm({ ...editForm, goodWithKids: e.target.value === 'true' })}>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div className="edit-field">
                    <label>Good with Pets</label>
                    <select value={String(editForm.goodWithPets)}
                      onChange={(e) => setEditForm({ ...editForm, goodWithPets: e.target.value === 'true' })}>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>
                <div className="edit-actions">
                  <button type="button" className="edit-cancel-btn" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="edit-save-btn" disabled={editSaving}>
                    {editSaving ? 'Saving...' : '💾 Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PetDetail;
