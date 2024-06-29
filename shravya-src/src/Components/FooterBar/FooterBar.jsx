import React from 'react';
import { Link } from 'react-router-dom';
import './FooterBar.css';

function FooterBar() {
    return(
    <footer className="footer">
      <Link to="/about" className="About">About Go Snackin'</Link>
    </footer>
  );
}

export default FooterBar;
