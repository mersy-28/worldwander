import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import "./InteractiveWorldMap.css";

const InteractiveWorldMap = ({ bucketList = [] }) => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [tooltip, setTooltip] = useState({ visible: false, country: null, x: 0, y: 0 });
  const tooltipRef = useRef(null);
  
  // Fetch countries data
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,capital,population,region,cca3');
        
        if (!response.ok) {
          throw new Error(`Error fetching countries: ${response.status}`);
        }
        
        const data = await response.json();
        setCountries(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch countries:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Filter countries by search term and region
  const filteredCountries = countries.filter(country => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      country.name.common.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by region
    const matchesRegion = selectedRegion === '' || 
      country.region === selectedRegion;
    
    return matchesSearch && matchesRegion;
  });
  
  // Group countries by region
  const countryRegions = [...new Set(countries.map(country => country.region))].sort();

  // Count countries in bucket list by region
  const countBucketListByRegion = (region) => {
    return countries.filter(country => 
      country.region === region && 
      bucketList.includes(country.cca3)
    ).length;
  };

  // Navigate to country page
  const handleCountryClick = (cca3) => {
    navigate(`/country/${cca3}`);
  };

  // Handle tooltip display
  const handleMouseEnter = (e, country) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      country,
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, visible: false });
  };

  // Handle region selection
  const handleRegionClick = (region) => {
    setSelectedRegion(region);
  };

  // Format population with commas
  const formatPopulation = (population) => {
    return population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  if (loading) {
    return <div className="interactive-map-container">
      <p className="loading-message">Loading country data...</p>
    </div>;
  }

  if (error) {
    return <div className="interactive-map-container">
      <p className="error-message">Error: {error}</p>
    </div>;
  }

  return (
    <div className="interactive-map-container">
      <h2 className="map-title">Country Explorer</h2>
      <p className="map-description">Browse countries by region and add them to your bucket list</p>
      
      <div className="map-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search for a country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="region-filter">
          <select 
            className="region-select" 
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option value="">All Regions</option>
            {countryRegions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="country-content">
        {selectedRegion === '' && searchTerm === '' ? (
          // Show region cards when no filter is applied
          <div className="region-summary">
            <h3>Choose a Region to Explore</h3>
            <div className="region-cards">
              {countryRegions.map(region => (
                <div 
                  key={region} 
                  className="region-card"
                  onClick={() => handleRegionClick(region)}
                >
                  <h4>{region}</h4>
                  <div className="region-stats">
                    <span>{countries.filter(c => c.region === region).length} countries</span>
                    <span className="bucket-list-count">
                      {countBucketListByRegion(region)} in bucket list
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Show filtered countries
          <div>
            {filteredCountries.length > 0 ? (
              <div className="countries-grid">
                {filteredCountries.map(country => (
                  <div 
                    key={country.cca3}
                    className={`country-card ${bucketList.includes(country.cca3) ? 'in-bucket-list' : ''}`}
                    onClick={() => handleCountryClick(country.cca3)}
                    onMouseEnter={(e) => handleMouseEnter(e, country)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="country-flag">
                      <img src={country.flags.png} alt={`Flag of ${country.name.common}`} />
                    </div>
                    <div className="country-name">{country.name.common}</div>
                    {bucketList.includes(country.cca3) && (
                      <div className="bucket-list-badge">✓</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-countries-message">No countries match your search criteria.</p>
            )}
          </div>
        )}
      </div>
      
      {tooltip.visible && tooltip.country && (
        <div 
          className="country-tooltip"
          style={{ 
            left: `${tooltip.x}px`, 
            top: `${tooltip.y}px` 
          }}
          ref={tooltipRef}
        >
          <img 
            className="tooltip-flag" 
            src={tooltip.country.flags.png} 
            alt={`Flag of ${tooltip.country.name.common}`} 
          />
          <div className="tooltip-content">
            <div className="tooltip-name">{tooltip.country.name.common}</div>
            {tooltip.country.capital && (
              <div className="tooltip-capital">Capital: {tooltip.country.capital[0]}</div>
            )}
            <div className="tooltip-population">
              Population: {formatPopulation(tooltip.country.population)}
            </div>
            <div className="tooltip-hint">Click to view details</div>
          </div>
        </div>
      )}
      
      <div className="explorer-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: 'var(--accent-color)' }}></div>
          <span>In Bucket List</span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveWorldMap;
