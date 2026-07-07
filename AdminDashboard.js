import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Home.css';

const FEATURES = [
  { icon: '🐾', title: 'Easy Adoption',      desc: 'Apply for adoption in just a few clicks — simple, fast, and stress-free.' },
  { icon: '🏥', title: 'Verified Shelters',  desc: 'All pets come from trusted, verified shelters and rescue organizations.' },
  { icon: '🏠', title: 'Loving Homes',       desc: 'We match every pet with the perfect family for a lifetime of happiness.' },
];

function Home() {
  const navigate = useNavigate();
  const [featuredPets, setFeaturedPets] = useState([]);
  const [petsLoading, setPetsLoading]   = useState(true);

  useEffect(() => {
    api.get('/pets')
      .then(({ data }) => setFeaturedPets(data.slice(0, 4)))
      .catch(() => setFeaturedPets([]))
      .finally(() => setPetsLoading(false));
  }, []);

  return (
    <div className="home">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">🐾 #1 Pet Adoption Platform</div>
          <h1 className="hero-title">
            Welcome to <span className="hero-brand">PetNest</span>
          </h1>
          <p className="hero-tagline">Find your perfect companion and give a pet a forever home</p>
          <div className="hero-actions">
            <button className="hero-btn-primary" onClick={() => navigate('/pets')}>
              Browse Pets
            </button>
            <button className="hero-btn-secondary" onClick={() => navigate('/signup')}>
              Get Started
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><strong>500+</strong><span>Pets Adopted</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>50+</strong><span>Shelters</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>1000+</strong><span>Happy Families</span></div>
          </div>
        </div>
        <div className="hero-image-wrap">
          <div className="hero-img-card">
            <img
              src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=500"
              alt="Happy pet"
              className="hero-img"
            />
            <div className="hero-img-badge">❤️ Just Adopted!</div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features-section">
        <div className="section-inner">
          <p className="section-tag">Why PetNest?</p>
          <h2 className="section-title">Adoption made simple</h2>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon-wrap">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PETS ── */}
      <section className="featured-section">
        <div className="section-inner">
          <p className="section-tag">Meet Our Pets</p>
          <h2 className="section-title">Looking for a home</h2>

          {petsLoading ? (
            <div className="home-spinner-wrap">
              <div className="home-spinner" />
            </div>
          ) : featuredPets.length === 0 ? (
            <p className="no-pets-msg">🐾 No pets available right now. Check back soon!</p>
          ) : (
            <div className="featured-grid">
              {featuredPets.map((pet) => (
                <div key={pet._id} className="featured-card"
                  onClick={() => navigate(`/pet/${pet._id}`)}>
                  <div className="featured-img-wrap">
                    <img
                      src={pet.image || 'https://via.placeholder.com/300x200'}
                      alt={pet.name}
                      className="featured-img"
                    />
                    <span className={`featured-status ${pet.status}`}>{pet.status}</span>
                  </div>
                  <div className="featured-body">
                    <h4>{pet.name}</h4>
                    <p>{pet.breed} &bull; {pet.age} yr{pet.age !== 1 ? 's' : ''}</p>
                    <div className="featured-traits">
                      {(pet.traits || []).slice(0, 3).map((t) => (
                        <span key={t} className="trait-chip">{t}</span>
                      ))}
                    </div>
                    <button className="featured-btn">View Profile →</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="view-all-wrap">
            <button className="view-all-btn" onClick={() => navigate('/pets')}>
              View All Pets →
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>Give a pet a home today ❤️</h2>
          <p>Thousands of pets are waiting for someone just like you.</p>
          <div className="cta-actions">
            <button className="cta-btn-primary"  onClick={() => navigate('/pets')}>Adopt Now</button>
            <button className="cta-btn-secondary" onClick={() => navigate('/signup')}>Create Account</button>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;
