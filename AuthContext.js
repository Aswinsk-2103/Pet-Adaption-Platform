import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import PetCard from './PetCard';
import Filter from './Filter';
import './PetList.css';

function PetList() {
  const { user } = useAuth();
  const [pets, setPets]     = useState([]);
  const [breed, setBreed]   = useState('');
  const [loading, setLoading] = useState(true);
  const [favIds, setFavIds] = useState([]);

  useEffect(() => {
    if (user && user.role === 'user') {
      api.get('/users/me').then(({ data }) => {
        setFavIds((data.favorites || []).map((f) => f._id || f));
      });
    }
  }, [user]);

  useEffect(() => {
    const delay = setTimeout(fetchPets, 400);
    return () => clearTimeout(delay);
  }, [breed]);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const params = breed ? { breed } : {};
      const { data } = await api.get('/pets', { params });
      setPets(user?.role === 'admin' ? data : data.filter((p) => p.status !== 'adopted'));
    } catch (err) {
      console.error('Failed to fetch pets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavToggle = (petId, nowFav) => {
    setFavIds((prev) =>
      nowFav ? [...prev, petId] : prev.filter((id) => id !== petId)
    );
  };

  return (
    <div className="petlist-container">
      <h2 className="petlist-title">Available Pets</h2>
      <Filter breed={breed} onChange={setBreed} onClear={() => setBreed('')} />
      {loading ? (
        <div className="loading">Loading pets...</div>
      ) : pets.length === 0 ? (
        <div className="no-pets">🐾 No pets found. Try a different breed.</div>
      ) : (
        <div className="pet-grid">
          {pets.map((pet) => (
            <PetCard key={pet._id} pet={pet} favIds={favIds} onFavToggle={handleFavToggle} />
          ))}
        </div>
      )}
    </div>
  );
}

export default PetList;
