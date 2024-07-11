import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';
import { useAuth } from '../AuthContext';
import logo from './../Assets/go-snackin-logo-white-small.png'; // Adjusted path

function NavBar() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/homeguest');
  };

  return (
    <header className="nav">
      <div className="logo-container">
        <img src={logo} alt="Go Snackin' Icon" className="logo" />
        <Link to={isLoggedIn ? '/home' : '/homeguest'} className="goSnack">Go Snackin'</Link>
      </div>
      <div className="login-status">
        {isLoggedIn ? (
          <div className="dropdown">
            <button className="account-btn">ACCOUNT</button>
            <div className="dropdown-content">
              <Link to="/review">
                <button className="review-btn">Review</button>
              </Link>
              <Link to="/user-details">
                <button className="preferences-btn">Change Preferences</button>
              </Link>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>
        ) : (
          <Link to="/login">
            <button className="login-btn">LOGIN</button>
          </Link>
        )}
      </div>
    </header>
  );
}

export default NavBar;
