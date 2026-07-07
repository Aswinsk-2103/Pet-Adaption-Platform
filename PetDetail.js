import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './AdoptionForm.css';

function AdoptionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pet, setPet] = useState(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role === 'admin') { navigate('/admin'); return; }
    api.get(`/pets/${id}`).then(({ data }) => setPet(data)).catch(() => setPet(null));
  }, [id, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!reason.trim()) return setError('Please provide a reason.');
    if (reason.trim().length < 20) return setError('Reason must be at least 20 characters.');

    setSubmitting(true);
    try {
      await api.post('/applications/apply', { petId: id, reason });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="form-container">
        <div className="success-box">
          <span className="success-icon">🎉</span>
          <h2>Application Submitted!</h2>
          <p>
            Thank you, <strong>{user.name}</strong>! We'll be in touch soon
            about <strong>{pet?.name}</strong>.
          </p>
          <button className="submit-btn" onClick={() => navigate('/user')}>
            View My Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <button className="back-btn" onClick={() => navigate(`/pet/${id}`)}>
        ← Back
      </button>
      <div className="form-card">
        <h2 className="form-title">Adopt {pet ? pet.name : '...'}</h2>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Your Name</label>
            <input type="text" value={user?.name || ''} disabled />
          </div>
          <div className="form-group">
            <label>Why do you want to adopt {pet?.name}?</label>
            <textarea
              rows={5}
              placeholder="Tell us a bit about yourself and why you'd be a great match..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdoptionForm;
