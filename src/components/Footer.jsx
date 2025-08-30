import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/bucket-list">Bucket List</Link>
        </div>
        <p>© {currentYear} WorldWander - Created by Faith Hookey</p>
        <p>Data provided by <a href="https://restcountries.com" target="_blank" rel="noopener noreferrer">RestCountries API</a></p>
      </div>
    </footer>
  );
}

export default Footer;