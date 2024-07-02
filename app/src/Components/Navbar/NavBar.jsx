import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';
import { useAuth } from '../AuthContext';

function NavBar() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/homeguest');
  };

  return (
    <header className="nav">
      <Link to={isLoggedIn ? '/home' : '/homeguest'} className="goSnack">Go Snackin'</Link>
      <div className="login-status">
        {isLoggedIn ? (
          <button onClick={handleLogout}>LOGOUT</button>
        ) : (
          <Link to="/login">
            <button>LOGIN</button>
          </Link>
        )}
      </div>
    </header>
  );
}

export default NavBar;
