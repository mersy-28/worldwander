import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CountryPage from './pages/CountryPage';
import BucketListPage from './pages/BucketListPage';
import './App.css';

function App() {
  // Get bucket list from localStorage on initial load or use empty array if none exists
  const [bucketList, setBucketList] = useState(() => {
    const savedBucketList = localStorage.getItem('worldwander_bucketlist');
    if (savedBucketList) {
      try {
        return JSON.parse(savedBucketList);
      } catch (error) {
        console.error('Error parsing bucket list from localStorage:', error);
        return [];
      }
    }
    return [];
  });

  // function to add countries to bucket list
  const addToBucketList = (country) => {
    // Check if country is already in list using the isInBucketList function
    if (!isInBucketList(country.name)) {
      // Create new array with the new country (avoiding direct state mutation)
      setBucketList(prevList => [...prevList, country]);
    }
  };
  
  // function to remove countries from bucket list
  const removeFromBucketList = (countryName) => {
    setBucketList(prevList => 
      prevList.filter(country => country.name !== countryName)
    );
  };

  // check if a country is in the bucket list
  const isInBucketList = (countryName) => {
    
    for (let i = 0; i < bucketList.length; i++) {
      // if matching country return true
      if (bucketList[i].name === countryName) {
        return true;
      }
    }
    // if no match return false
    return false;
  };
  
  // Save bucket list to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('worldwander_bucketlist', JSON.stringify(bucketList));
  }, [bucketList]);


  return (
    <Router>

      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route
              path="/country/:name"
              element={
                <CountryPage
                  addToBucketList={addToBucketList}
                  removeFromBucketList={removeFromBucketList}
                  isInBucketList={isInBucketList}
                />
              }
            />

            <Route
              path="/bucket-list"
              element={
                <BucketListPage
                  bucketList={bucketList}
                  removeFromBucketList={removeFromBucketList}
                />
              }
            />

          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;