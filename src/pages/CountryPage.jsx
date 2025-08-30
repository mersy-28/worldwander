import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './CountryPage.css';

function CountryPage({ addToBucketList, removeFromBucketList, isInBucketList }) {
  // get country name from URL
  const { name } = useParams();
  
  // state for country data
  const [country, setCountry] = useState(null);
  // state for if loading
  const [loading, setLoading] = useState(true);
  // state for error messages
  const [error, setError] = useState(null);

  // fetch country data when the component mounts
  // or name changes
  useEffect(() => {
    // fetch country data
    const fetchCountry = async () => {
      try {
        setLoading(true);
        
        // fetch data from API for specific country with required fields
        const response = await fetch(`https://restcountries.com/v3.1/name/${name}?fields=name,flags,capital,population,region,subregion,languages,currencies`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch country data');
        }
        
        const data = await response.json();
        
        // make country data simpler
        const countryData = {
          name: data[0].name.common,
          flag: data[0].flags.png,
          capital: data[0].capital ? data[0].capital[0] : 'Unknown',
          population: data[0].population,
          region: data[0].region,
          subregion: data[0].subregion,
          languages: data[0].languages ? Object.values(data[0].languages) : [],
          currencies: data[0].currencies ? Object.values(data[0].currencies).map(c => c.name) : []
        };
        
        // update our state with country data
        setCountry(countryData);
        setLoading(false);
      } catch (err) {
        // if error, update error state
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCountry();
  }, [name]); // re-run effect if the country name changes

  // function for adding/removing country from bucket list
  const handleBucketListAction = () => {
    if (isInBucketList(country.name)) {
      removeFromBucketList(country.name);
    } else {
      addToBucketList(country);
    }
  };

  // display a loading message if loading
  if (loading) {
    return <div className="loading">Loading country data...</div>;
  }

  // display an error message if error
  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  // display message if no country data was found
  if (!country) {
    return <div className="not-found">Country not found</div>;
  }

  return (
    <div className="country-page">
      <div className="back-button">
        <Link to="/">← Back to Countries</Link>
      </div>
      
      <div className="country-details">
        <img 
          src={country.flag} 
          alt={`Flag of ${country.name}`} 
          className="country-flag"
        />
        
        <h1>{country.name}</h1>
        
        <div className="info-grid">
          <div className="info-item">
            <h3>Capital</h3>
            <p>{country.capital}</p>
          </div>
          
          <div className="info-item">
            <h3>Population</h3>
            <p>{country.population.toLocaleString()}</p>
          </div>
          
          <div className="info-item">
            <h3>Region</h3>
            <p>{country.region}</p>
          </div>
          
          <div className="info-item">
            <h3>Subregion</h3>
            <p>{country.subregion}</p>
          </div>
          
          <div className="info-item">
            <h3>Languages</h3>
            <p>{country.languages.join(', ')}</p>
          </div>
          
          <div className="info-item">
            <h3>Currencies</h3>
            <p>{country.currencies.join(', ')}</p>
          </div>
        </div>
        
        <button 
          className={`bucket-list-button ${isInBucketList(country.name) ? 'remove' : 'add'}`}
          onClick={handleBucketListAction}
        >
          {isInBucketList(country.name) 
            ? 'Remove from Bucket List' 
            : 'Add to Bucket List'}
        </button>
      </div>
    </div>
  );
}

export default CountryPage;