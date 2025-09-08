import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapExplorer.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapExplorer = ({ bucketList = [] }) => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  
  // Fetch countries data from REST Countries API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,capital,population,region,cca3,latlng');
        
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

    // Fetch GeoJSON data
    const fetchGeoJson = async () => {
      try {
        const response = await fetch('/countries.geojson');
        if (!response.ok) {
          throw new Error('Failed to fetch GeoJSON data');
        }
        const data = await response.json();
        setGeoJsonData(data);
      } catch (err) {
        console.error('Error loading GeoJSON:', err);
      }
    };

    fetchGeoJson();
  }, []);

  // Filter countries by region
  const filteredCountries = selectedRegion 
    ? countries.filter(country => country.region === selectedRegion)
    : countries;
  
  // Get unique regions
  const regions = [...new Set(countries.map(country => country.region))].sort();

  // Handle country click
  const handleCountryClick = (cca3) => {
    navigate(`/country/${cca3}`);
  };

  // Style for the GeoJSON countries
  const countryStyle = (feature) => {
    // Find the country in our country data
    const countryCode = feature.properties.ISO_A3;
    const isInBucketList = bucketList.includes(countryCode);
    
    return {
      fillColor: isInBucketList ? '#F9A826' : '#3498db',
      weight: 1,
      opacity: 0.7,
      color: '#fff',
      fillOpacity: isInBucketList ? 0.6 : 0.3
    };
  };

  // On feature (country) click handler for GeoJSON
  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.NAME) {
      // Create a popup with country info and a button
      const countryName = feature.properties.NAME;
      const countryCode = feature.properties.ISO_A3;
      
      // Find the country in our data using ISO code
      const country = countries.find(c => c.cca3 === countryCode);
      
      // Create popup content based on available data
      let popupContent = `
        <div class="map-popup">
          <h3>${countryName}</h3>
      `;
      
      // Add extra information if we have country data from API
      if (country) {
        popupContent += `
          <div style="text-align: center; margin: 8px 0;">
            <img src="${country.flags.png}" alt="Flag" style="max-width: 100px; max-height: 60px; margin-bottom: 8px;" />
          </div>
        `;
        
        if (country.capital && country.capital.length > 0) {
          popupContent += `<p>Capital: ${country.capital[0]}</p>`;
        }
      }
      
      // Always add the View Details button
      popupContent += `<button class="popup-button">View Details</button></div>`;
      
      layer.bindPopup(popupContent);

      layer.on({
        click: (e) => {
          // Find the country in our data using ISO code
          const country = countries.find(c => c.cca3 === countryCode);
          if (country) {
            // Directly navigate to country detail page when clicking on the country
            handleCountryClick(countryCode);
          } else {
            console.warn(`Country data not found for ${countryName} (${countryCode})`);
          }
        },
        mouseover: (e) => {
          const layer = e.target;
          const countryCode = feature.properties.ISO_A3;
          const isInBucketList = bucketList.includes(countryCode);
          
          layer.setStyle({
            weight: 2,
            color: '#333',
            opacity: 1,
            fillOpacity: 0.8,
            fillColor: isInBucketList ? '#F9A826' : '#4dabf7'
          });
          layer.bringToFront();
        },
        mouseout: (e) => {
          const layer = e.target;
          layer.setStyle({
            weight: 1,
            opacity: 0.7,
            fillOpacity: bucketList.includes(feature.properties.ISO_A3) ? 0.6 : 0.3
          });
        }
      });
    }
  };

  // Handle region selection
  const handleRegionChange = (event) => {
    const region = event.target.value;
    setSelectedRegion(region);

    // Set map center based on selected region
    if (region) {
      switch (region) {
        case 'Africa':
          setMapCenter([0, 20]);
          setMapZoom(3);
          break;
        case 'Americas':
          setMapCenter([0, -80]);
          setMapZoom(2);
          break;
        case 'Asia':
          setMapCenter([30, 100]);
          setMapZoom(3);
          break;
        case 'Europe':
          setMapCenter([50, 10]);
          setMapZoom(4);
          break;
        case 'Oceania':
          setMapCenter([-25, 135]);
          setMapZoom(4);
          break;
        default:
          setMapCenter([20, 0]);
          setMapZoom(2);
      }
    } else {
      // Reset to world view
      setMapCenter([20, 0]);
      setMapZoom(2);
    }
  };

  if (loading) {
    return <div className="map-explorer-container">
      <p className="loading-message">Loading map data...</p>
    </div>;
  }

  if (error) {
    return <div className="map-explorer-container">
      <p className="error-message">Error: {error}</p>
    </div>;
  }

  return (
    <div className="map-explorer-container">
      <h2 className="map-title">Interactive World Map</h2>
      <p className="map-description">Explore countries and add them to your bucket list</p>
      <p className="map-instructions">Click on any country to view details or hover for more information</p>
      
      <div className="map-controls">
        <div className="region-filter">
          <select 
            className="region-select" 
            value={selectedRegion}
            onChange={handleRegionChange}
          >
            <option value="">All Regions</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="map-container">
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          className="leaflet-map"
          key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`} // Force re-render on center/zoom change
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {geoJsonData && (
            <GeoJSON 
              data={geoJsonData} 
              style={countryStyle}
              onEachFeature={onEachFeature}
            />
          )}
          
          {/* Optionally add markers for countries in bucket list for emphasis */}
          {filteredCountries
            .filter(country => bucketList.includes(country.cca3) && country.latlng && country.latlng.length === 2)
            .map(country => (
              <Marker 
                key={country.cca3} 
                position={[country.latlng[0], country.latlng[1]]}
                eventHandlers={{
                  click: () => handleCountryClick(country.cca3)
                }}
              >
                <Popup>
                  <div className="map-popup">
                    <div className="popup-flag">
                      <img src={country.flags.png} alt={`Flag of ${country.name.common}`} />
                    </div>
                    <h3>{country.name.common}</h3>
                    {country.capital && <p>Capital: {country.capital[0]}</p>}
                    <p>Population: {country.population.toLocaleString()}</p>
                    <button 
                      className="popup-button"
                      onClick={() => handleCountryClick(country.cca3)}
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))
          }
        </MapContainer>
      </div>
      
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#F9A826' }}></div>
          <span>In Bucket List</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#3498db' }}></div>
          <span>Available Countries</span>
        </div>
      </div>
    </div>
  );
};

export default MapExplorer;
