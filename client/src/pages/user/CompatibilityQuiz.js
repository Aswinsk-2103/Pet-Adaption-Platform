import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { calcCompatibility } from '../../utils/compatibility';
import './CompatibilityQuiz.css';

const defaultLifestyle = {
  activityLevel: 'moderate',
  homeType: 'house',
  hasChildren: false,
  hasOtherPets: false,
  experience: 'beginner',
};

function CompatibilityQuiz() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lifestyle, setLifestyle] = useState(defaultLifestyle);
  const [pets, setPets] = useState([]);
  const [results, setResults] = useState([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/pets').then(({ data }) => setPets(data));
    api.get('/users/me').then(({ data }) => {
      if (data.lifestyle?.activityLevel) setLifestyle(data.lifestyle);
    });
  }, []);

  const handleChange = (key, value) => setLifestyle((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/users/lifestyle', lifestyle);
      const scored = pets
        .map((pet) => ({ ...pet, score: calcCompatibility(lifestyle, pet) }))
        .sort((a, b) => b.score - a.score);
      setResults(scored);
      setSaved(true);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return '#4caf50';
    if (score >= 50) return '#ff9800';
    return '#e53935';
  };

  return (
    <div className="quiz-container">
      <h2 className="quiz-title">🐾 Pet Compatibility Quiz</h2>
      <p className="quiz-subtitle">Tell us about your lifestyle to find your perfect match</p>

      <form className="quiz-form" onSubmit={handleSubmit}>
        <div className="quiz-grid">
          <div className="quiz-field">
            <label>Activity Level</label>
            <div className="option-group">
              {['low', 'moderate', 'high'].map((v) => (
                <button type="button" key={v}
                  className={`option-btn ${lifestyle.activityLevel === v ? 'selected' : ''}`}
                  onClick={() => handleChange('activityLevel', v)}>
                  {v === 'low' ? '🛋️ Low' : v === 'moderate' ? '🚶 Moderate' : '🏃 High'}
                </button>
              ))}
            </div>
          </div>

          <div className="quiz-field">
            <label>Home Type</label>
            <div className="option-group">
              {['apartment', 'house', 'farm'].map((v) => (
                <button type="button" key={v}
                  className={`option-btn ${lifestyle.homeType === v ? 'selected' : ''}`}
                  onClick={() => handleChange('homeType', v)}>
                  {v === 'apartment' ? '🏢 Apartment' : v === 'house' ? '🏠 House' : '🌾 Farm'}
                </button>
              ))}
            </div>
          </div>

          <div className="quiz-field">
            <label>Experience with Pets</label>
            <div className="option-group">
              {['beginner', 'intermediate', 'experienced'].map((v) => (
                <button type="button" key={v}
                  className={`option-btn ${lifestyle.experience === v ? 'selected' : ''}`}
                  onClick={() => handleChange('experience', v)}>
                  {v === 'beginner' ? '🌱 Beginner' : v === 'intermediate' ? '⭐ Intermediate' : '🏆 Experienced'}
                </button>
              ))}
            </div>
          </div>

          <div className="quiz-field">
            <label>Household</label>
            <div className="option-group">
              <button type="button"
                className={`option-btn ${lifestyle.hasChildren ? 'selected' : ''}`}
                onClick={() => handleChange('hasChildren', !lifestyle.hasChildren)}>
                👶 {lifestyle.hasChildren ? 'Has Children ✓' : 'Has Children'}
              </button>
              <button type="button"
                className={`option-btn ${lifestyle.hasOtherPets ? 'selected' : ''}`}
                onClick={() => handleChange('hasOtherPets', !lifestyle.hasOtherPets)}>
                🐕 {lifestyle.hasOtherPets ? 'Has Other Pets ✓' : 'Has Other Pets'}
              </button>
            </div>
          </div>
        </div>

        <button type="submit" className="quiz-submit-btn" disabled={loading}>
          {loading ? 'Calculating...' : '🔍 Find My Matches'}
        </button>
      </form>

      {saved && results.length > 0 && (
        <div className="results-section">
          <h3>Your Compatibility Results</h3>
          <div className="results-grid">
            {results.map((pet) => (
              <div key={pet._id} className="result-card">
                <img src={pet.image || 'https://via.placeholder.com/200'} alt={pet.name} className="result-img" />
                <div className="result-body">
                  <h4>{pet.name}</h4>
                  <p>{pet.breed}</p>
                  <div className="score-bar-wrap">
                    <div className="score-bar">
                      <div className="score-fill"
                        style={{ width: `${pet.score}%`, background: getScoreColor(pet.score) }} />
                    </div>
                    <span className="score-label" style={{ color: getScoreColor(pet.score) }}>
                      {pet.score}% Match
                    </span>
                  </div>
                  <button className="result-view-btn" onClick={() => navigate(`/pet/${pet._id}`)}>
                    View Pet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CompatibilityQuiz;
