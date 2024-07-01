import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Home.css'; // Import CSS file for styling
import { useAuth } from '../AuthContext';
import { GoogleMap, LoadScript } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: 'calc(100vh - 60px)', // Adjusted height to fit within viewport minus navbar height
  position: 'absolute',
  top: '60px', // Position below the navbar
  left: 0,
};


function Home() {
  const data = useLocation();
  const { logout } = useAuth();
  const [inputText, setInputText] = useState(''); // State to store input text

  const [currentPosition, setCurrentPosition] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setCurrentPosition({ lat: latitude, lng: longitude });
    });
  }, []);


  const handleInput = (event) => {
    if (!isLoggedIn) {
      return; // Prevent processing input if not logged in
    }
    if (event.key === 'Enter') {
      const text = event.target.value.trim();
      console.log(text);
      fetch('http://localhost:3000/api/nlp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: text }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
        });

    }
  };

  const handleInputChange = (event) => {
    setInputText(event.target.value); // Update inputText state as user types
  };

  return (
    <div className="home-container">
      <div className="home-content">
      {/* <LoadScript googleMapsApiKey="AIzaSyAbfGPLQOkiCN5upNBRnUnmxmyLpTqLYFQ">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentPosition}
          zoom={11}
          options={{ gestureHandling: 'greedy' }}
        />
      </LoadScript> */}

        <div className="input-container">
          <input
            className="curved-input"
            type="text"
            placeholder="Where do you wish to go?"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleInput}
          />
        </div>
      </div>
    </div>
  );
}

export default Home;


