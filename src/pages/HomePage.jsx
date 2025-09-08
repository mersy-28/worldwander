import React, { useState, useEffect } from 'react';
import WorldMap from '../components/WorldMap';
import CountryExplorer from '../components/CountryExplorer';
import MapExplorer from '../components/MapExplorer';
import './HomePage.css';

function HomePage({ bucketList = [] }) {
  // state for list of countries
  const [countries, setCountries] = useState([]);
  // state for if data is loading
  const [loading, setLoading] = useState(true);
  // state for error messages
  const [error, setError] = useState(null);
  // state for view mode (grid or map) - default to map view
  const [viewMode, setViewMode] = useState('map');

  // fetch data when the component mounts
  useEffect(() => {
    // fetch countries data
    const fetchCountries = async () => {
      try {
        setLoading(true);
        
        // fetch data from the API with required fields parameter including country codes
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,capital,population,region,cca2,cca3');
        
        if (!response.ok) {
          throw new Error('Failed to fetch countries');
        }
        
        const data = await response.json();
        
        // name data simpler
        const formattedCountries = data.map(country => ({
          name: country.name.common,
          flag: country.flags.png,
          capital: country.capital ? country.capital[0] : 'Unknown',
          population: country.population,
          region: country.region,
          alpha2Code: country.cca2,
          alpha3Code: country.cca3
        }));
        
        // update state with the simple countries data
        setCountries(formattedCountries);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCountries();
  }, []); // runs once when the component mounts

  // display a loading message if loading
  if (loading) {
    return <div className="loading">Loading countries...</div>;
  }

  // display an error message if error
  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Explore the World</h1>
        <p>Discover countries, cultures, and create your personalized travel bucket list</p>
        <a href="#countries" className="hero-btn">Start Exploring</a>
      </div>
      
      <div id="countries" className="featured-section">
        <h2 className="featured-heading">Discover Countries</h2>
        <p className="featured-text">
          Browse through countries from around the world, learn about their cultures,
          and add your favorites to your travel bucket list.
        </p>
        
        <div className="view-toggle">
          <button 
            className={viewMode === 'grid' ? 'active' : ''} 
            onClick={() => setViewMode('grid')}
          >
            Simple View
          </button>
          <button 
            className={viewMode === 'explorer' ? 'active' : ''} 
            onClick={() => setViewMode('explorer')}
          >
            Explorer View
          </button>
          <button 
            className={viewMode === 'map' ? 'active' : ''} 
            onClick={() => setViewMode('map')}
          >
            Map View
          </button>
        </div>
      </div>
      
      {viewMode === 'grid' ? (
        <WorldMap countries={countries} />
      ) : viewMode === 'explorer' ? (
        <CountryExplorer bucketList={bucketList.map(country => country.alpha3Code)} />
      ) : (
        <MapExplorer bucketList={bucketList.map(country => country.alpha3Code)} />
      )}
    </div>
  );
}

export default HomePage;