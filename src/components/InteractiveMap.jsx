import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InteractiveMap.css';

const InteractiveMap = ({ bucketList = [] }) => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch countries data
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,capital,population,region,cca3,latlng');
        if (!response.ok) throw new Error('Failed to fetch countries');
        
        const data = await response.json();
        setCountries(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Get unique regions
  const regions = [...new Set(countries.map(country => country.region))].filter(Boolean).sort();

  // Filter countries based on region and search
  const filteredCountries = countries.filter(country => {
    const matchesRegion = selectedRegion ? country.region === selectedRegion : true;
    const matchesSearch = searchTerm ? 
      country.name.common.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    return matchesRegion && matchesSearch;
  });

  // Handle country click
  const handleCountryClick = (countryCode) => {
    navigate(`/country/${countryCode}`);
  };

  if (loading) {
    return (
      <div className="interactive-map">
        <h2>Interactive World Map</h2>
        <div className="loading">Loading countries...</div>
      </div>
    );
  }

  return (
    <div className="interactive-map">
      <h2>Explore Countries</h2>
      <p>Click on any country to learn more about it</p>

      {/* Controls */}
      <div className="map-controls">
        <input
          type="text"
          placeholder="Search countries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select 
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="region-select"
        >
          <option value="">All Regions</option>
          {regions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </div>

      {/* Country Grid */}
      <div className="countries-grid">
        {filteredCountries.map(country => {
          const isInBucketList = bucketList.includes(country.cca3);
          
          return (
            <div
              key={country.cca3}
              className={`country-card ${isInBucketList ? 'in-bucket-list' : ''}`}
              onClick={() => handleCountryClick(country.cca3)}
            >
              <div className="country-flag">
                <img src={country.flags.png} alt={`${country.name.common} flag`} />
              </div>
              <div className="country-info">
                <h3>{country.name.common}</h3>
                <p className="country-region">{country.region}</p>
                {country.capital && (
                  <p className="country-capital">Capital: {country.capital[0]}</p>
                )}
                <p className="country-population">
                  Population: {country.population.toLocaleString()}
                </p>
              </div>
              {isInBucketList && (
                <div className="bucket-badge">✓</div>
              )}
            </div>
          );
        })}
      </div>

      {filteredCountries.length === 0 && (
        <div className="no-results">
          No countries found matching your criteria.
        </div>
      )}

      {/* Stats */}
      <div className="map-stats">
        <p>
          Showing {filteredCountries.length} of {countries.length} countries
          {bucketList.length > 0 && ` • ${bucketList.length} in your bucket list`}
        </p>
      </div>
    </div>
  );
};

export default InteractiveMap;