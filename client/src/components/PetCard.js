import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './PetCard.css';

function PetCard({ pet, favIds = [], onFavToggle }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [isFav, setIsFav] = useState(favIds.includes(pet._id));

  const toggleFav = async (e) => {
    e.stopPropagation();
    if (!user) return navigate('/login');
    try {
      const { data } = await api.post(`/users/favorites/${pet._id}`);
      const nowFav = data.favorites.some((f) => f.toString() === pet._id);
      setIsFav(nowFav);
      if (onFavToggle) onFavToggle(pet._id, nowFav);
    } catch { /* silent */ }
  };

  return (
    <div className="pet-card" onClick={() => { if (isAdmin || pet.status !== 'adopted') navigate(`/pet/${pet._id}`); }}>
      <div className="pet-card-img-wrap">
        <img
          src={pet.image || 'https://via.placeholder.com/300x200?text=No+Image'}
          alt={pet.name}
          className="pet-card-img"
        />
        <span className={`card-status-badge ${pet.status}`}>{pet.status}</span>
        {!isAdmin && user && (
          <button className="card-fav-btn" onClick={toggleFav} title="Toggle favorite">
            {isFav ? '❤️' : '🤍'}
          </button>
        )}
      </div>
      <div className="pet-card-body">
        <h3 className="pet-card-name">{pet.name}</h3>
        <p className="pet-card-info">{pet.breed} &bull; {pet.age} yr{pet.age !== 1 ? 's' : ''}</p>
        <div className="pet-card-traits">
          {pet.traits.slice(0, 3).map((t) => (
            <span key={t} className="trait-badge">{t}</span>
          ))}
        </div>
        {!isAdmin ? (
          <button className="adopt-btn" disabled={pet.status === 'adopted'}
            onClick={(e) => { e.stopPropagation(); navigate(`/pet/${pet._id}`); }}>
            {pet.status === 'adopted' ? 'Adopted' : 'Adopt'}
          </button>
        ) : (
          <button className="view-btn"
            onClick={(e) => { e.stopPropagation(); navigate(`/pet/${pet._id}`); }}>
            View Details
          </button>
        )}
      </div>
    </div>
  );
}

export default PetCard;
