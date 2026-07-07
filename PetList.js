import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to={user ? (user.role === 'admin' ? '/admin' : '/user') : '/'} className="navbar-brand">🐾 PetNest</Link>
      <div className="navbar-links">
        <Link to="/pets">Browse Pets</Link>
        {user ? (
          <>
            <Link to={user.role === 'admin' ? '/admin' : '/user'} className="nav-dashboard">
              {user.role === 'admin' ? '⚙️ Admin' : '👤 Dashboard'}
            </Link>
            {user.role === 'user' && (
              <Link to="/quiz" className="nav-quiz">🧬 Quiz</Link>
            )}
            <span className="nav-name">Hi, {user.name}</span>
            <span className={`nav-role-badge role-${user.role}`}>
              {user.role === 'admin' ? '⚙️ Admin' : '👤 User'}
            </span>
            <button className="nav-logout-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup" className="nav-signup-btn">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
