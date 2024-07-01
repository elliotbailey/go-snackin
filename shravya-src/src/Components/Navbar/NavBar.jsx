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
    <header className="nav"> {/* Changed <nav> to <header> */}
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
    </header>
  );
}

export default NavBar;