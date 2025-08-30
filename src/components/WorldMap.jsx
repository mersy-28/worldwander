import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WorldMap.css'

function WorldMap({ countries }) {
  const navigate = useNavigate();
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  
  // Update filtered countries when original countries, search term or region changes
  useEffect(() => {
    let filtered = [...countries];
    
    if (searchTerm) {
      filtered = filtered.filter(country => 
        country.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedRegion) {
      filtered = filtered.filter(country => 
        country.region === selectedRegion
      );
    }
    
    setFilteredCountries(filtered);
  }, [countries, searchTerm, selectedRegion]);
  
  // Function to handle clicked country
  const handleCountryClick = (countryName) => {
    navigate(`/country/${countryName}`);
  };
  
  // Get unique regions for filter
  const regions = [...new Set(countries.map(country => country.region))];

  return (
    <div className="world-map">
      <h2>Explore Countries</h2>
      
      <div className="filter-section">
        <input
          type="text"
          placeholder="Search for a country..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select 
          className="region-filter"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
        >
          <option value="">All Regions</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      <div className="country-grid">
        {filteredCountries.map((country, index) => (
          <div
            key={index}
            className="country-box"
            onClick={() => handleCountryClick(country.name)}
          >
            <img
              src={country.flag}
              alt={`Flag of ${country.name}`}
              className="country-flag"
            />
            <span className="country-region">{country.region}</span>
            <div className="country-name">
              {country.name}
            </div>
          </div>
        ))}
      </div>
      
      {filteredCountries.length === 0 && (
        <div className="no-results">
          <p>No countries found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

export default WorldMap;