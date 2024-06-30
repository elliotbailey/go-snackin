// src/Components/NavBar/NavBar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import './NavBar.css';

function NavBar() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/homeguest');
  };

  return (
    <nav className="nav">
      <Link to={isLoggedIn ? '/home' : '/homeguest'} className="goSnack">Go Snackin'</Link>

      <div className="login-status">
        {isLoggedIn ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/login">
            <button>Login</button>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default NavBar;