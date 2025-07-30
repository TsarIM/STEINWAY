import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {

  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if(!user)return null;

  return (
    <nav className="navbar">
      <Link to="/piano" className="navbar-brand">
        STEINWAY
      </Link>
      <div className="navbar-nav">
        <Link 
          to="/piano" 
          className={`nav-link ${location.pathname === '/piano' ? 'active' : ''}`}
        >
          compose
        </Link>
        <Link 
          to="/feed" 
          className={`nav-link ${location.pathname === '/feed' ? 'active' : ''}`}
        >
          feed
        </Link>
        <Link 
          to="/recordings" 
          className={`nav-link ${location.pathname === '/recordings' ? 'active' : ''}`}
        >
          recordings
        </Link>
        <Link 
          to="/profile" 
          className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
        >
          profile
        </Link>
        <button onClick={handleLogout} className="logout-btn">
          logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
