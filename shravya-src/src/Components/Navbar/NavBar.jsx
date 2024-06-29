import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

function NavBar() {
  return (
    <nav className="nav">
      <Link to="/homeguest" className="goSnack">Go Snackin'</Link>
      <ul>
        <li className='active'>
          <Link to='/map'>Map</Link>
        </li>
        <li>
          <Link to='/login'>Account</Link>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
