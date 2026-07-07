import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import './UserDashboard.css';

const STAGES = ['Applied', 'Under Review', 'Decision'];

function StatusTracker({ status }) {
  const step = status === 'pending' ? 1 : status === 'approved' || status === 'rejected' ? 3 : 2;
  return (
    <div className="tracker">
      {STAGES.map((s, i) => (
        <div key={s} className="tracker-step">
          <div className={`tracker-dot ${i < step ? 'done' : ''} ${i === step - 1 ? 'active' : ''}`}>
            {i < step ? '✓' : i + 1}
          </div>
          <span className={`tracker-label ${i === step - 1 ? 'active-label' : ''}`}>{s}</span>
          {i < STAGES.length - 1 && <div className={`tracker-line ${i < step - 1 ? 'done' : ''}`} />}
        </div>
      ))}
    </div>
  );
}

function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [favorites, setFavorites]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState('applications');

  useEffect(() => {
    Promise.all([
      api.get('/applications/mine'),
      api.get('/users/me'),
    ]).then(([appsRes, userRes]) => {
      setApplications(appsRes.data);
      setFavorites(userRes.data.favorites || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const removeFav = async (petId) => {
    try {
      await api.post(`/users/favorites/${petId}`);
      setFavorites((prev) => prev.filter((p) => p._id !== petId));
    } catch { /* silent */ }
  };

  return (
    <div className="user-container">
      {/* Welcome Banner */}
      <div className="user-welcome">
        <div>
          <h2>👋 Welcome, {user.name}!</h2>
          <p>Manage your adoptions, favorites, and find your perfect match.</p>
        </div>
        <div className="welcome-actions">
          <button className="browse-btn" onClick={() => navigate('/pets')}>🐾 Browse Pets</button>
          <button className="quiz-btn"   onClick={() => navigate('/quiz')}>🧬 Compatibility Quiz</button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="user-stats">
        <div className="stat-box">
          <span className="stat-num">{applications.length}</span>
          <span className="stat-label">Applications</span>
        </div>
        <div className="stat-box">
          <span className="stat-num">{applications.filter((a) => a.status === 'approved').length}</span>
          <span className="stat-label">Approved</span>
        </div>
        <div className="stat-box">
          <span className="stat-num">{applications.filter((a) => a.status === 'pending').length}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-box">
          <span className="stat-num">{favorites.length}</span>
          <span className="stat-label">Favorites</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="user-tabs">
        <button className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}>
          📋 My Applications ({applications.length})
        </button>
        <button className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}>
          ❤️ Favorites ({favorites.length})
        </button>
      </div>

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="user-card">
          {loading ? (
            <p className="loading-text">Loading...</p>
          ) : applications.length === 0 ? (
            <div className="empty-state">
              <p>You haven't applied for any pets yet.</p>
              <button className="browse-btn" onClick={() => navigate('/pets')}>Find a Pet</button>
            </div>
          ) : (
            <div className="app-list">
              {applications.map((app) => (
                <div key={app._id} className="app-item">
                  <img
                    src={app.petId?.image || 'https://via.placeholder.com/70'}
                    alt={app.petId?.name}
                    className="app-pet-img"
                    onClick={() => navigate(`/pet/${app.petId?._id}`)}
                  />
                  <div className="app-info">
                    <h4>{app.petId?.name}</h4>
                    <p>{app.petId?.breed}</p>
                    <p className="app-date">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                    <StatusTracker status={app.status} />
                  </div>
                  <span className={`status-pill ${app.status}`}>{app.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <div className="user-card">
          {loading ? (
            <p className="loading-text">Loading...</p>
          ) : favorites.length === 0 ? (
            <div className="empty-state">
              <p>No favorites yet. Heart a pet to save it here.</p>
              <button className="browse-btn" onClick={() => navigate('/pets')}>Browse Pets</button>
            </div>
          ) : (
            <div className="fav-grid">
              {favorites.filter((pet) => pet.status !== 'adopted').map((pet) => (
                <div key={pet._id} className="fav-card">
                  <img src={pet.image || 'https://via.placeholder.com/200'} alt={pet.name}
                    className="fav-img" onClick={() => navigate(`/pet/${pet._id}`)} />
                  <div className="fav-body">
                    <h4>{pet.name}</h4>
                    <p>{pet.breed}</p>
                    <div className="fav-actions">
                      <button className="fav-view-btn" onClick={() => navigate(`/pet/${pet._id}`)}>View</button>
                      <button className="fav-remove-btn" onClick={() => removeFav(pet._id)}>✕ Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
