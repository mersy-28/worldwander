import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  const [menuActive, setMenuActive] = useState(false);

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <h1>WorldWander</h1>
            <span>Explore • Discover • Travel</span>
          </Link>
        </div>
        
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {menuActive ? '✕' : '☰'}
        </button>
        
        <nav className={`nav ${menuActive ? 'active' : ''}`}>
          <ul>
            <li>
              <Link to="/" onClick={() => setMenuActive(false)}>Home</Link>
            </li>
            <li>
              <Link to="/bucket-list" onClick={() => setMenuActive(false)}>My Bucket List</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;