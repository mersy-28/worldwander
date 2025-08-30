import React from 'react';
import { Link } from 'react-router-dom';
import './BucketListPage.css';

function BucketListPage({ bucketList, removeFromBucketList }) {
  return (
    <div className="bucket-list-page">
      <div className="bucket-list-header">
        <h1>My Travel Bucket List</h1>
        <p>Manage your personalized list of dream destinations</p>
      </div>
      
      {bucketList.length === 0 ? (
        <div className="empty-bucket-list">
          <h2>Your bucket list is empty</h2>
          <p>Explore countries and add your favorite destinations to your bucket list!</p>
          <Link to="/" className="explore-btn">Explore Countries</Link>
        </div>
      ) : (
        <div className="bucket-list-grid">
          {bucketList.map((country, index) => (
            <div key={index} className="bucket-list-item">
              <img 
                src={country.flag} 
                alt={`Flag of ${country.name}`}
              />
              
              <div className="bucket-list-content">
                <h3>{country.name}</h3>
                <p><strong>Capital:</strong> {country.capital}</p>
                <p><strong>Region:</strong> {country.region}</p>
                <p><strong>Population:</strong> {country.population.toLocaleString()}</p>
                
                <div className="bucket-list-actions">
                  <Link to={`/country/${country.name}`} className="view-country-btn">
                    View Details
                  </Link>
                  
                  <button 
                    className="remove-btn"
                    onClick={() => removeFromBucketList(country.name)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BucketListPage;