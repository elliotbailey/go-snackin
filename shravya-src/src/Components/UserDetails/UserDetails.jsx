import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import './UserDetails.css';
import axios from 'axios';

const UserDetails = () => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleOptionToggle = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(item => item !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const foodOptions = [
    'American', 'Bakery', 'Bar', 'Barbecue', 'Brazilian', 'Breakfast', 'Brunch', 'Cafe',
    'Chinese', 'Coffee', 'Fast-Food', 'French', 'Greek', 'Hamburger', 'Ice-Cream', 'Indian', 
    'Indonesian', 'Italian', 'Japanese', 'Korean', 'Lebanese', 'Mediterranean', 'Mexican', 
    'Middle-Eastern', 'Pizza', 'Ramen', 'Sandwich', 'Seafood', 'Spanish', 'Steak', 'Sushi', 
    'Thai', 'Turkish', 'Vegan', 'Vegetarian', 'Vietnamese'
  ];

  const savePreferences = async () => {
    try {
      const response = await axios.post('http://localhost:8001/user-details', {
        username,
        preferences: selectedOptions
      });
      console.log(response.data); // Optionally handle the server response
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  return (
    <div className="food-options-container">
      <h2>Select Food Preferences:</h2>
      <div className="options-list">
        {foodOptions.map(option => (
          <div
            key={option}
            className={`option-label ${selectedOptions.includes(option) ? 'selected' : ''}`}
            onClick={() => handleOptionToggle(option)}
          >
            <div className="option-rect">
              <span className={`option-text ${selectedOptions.includes(option) ? 'selected-text' : ''}`}>
                {option}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p>Selected Options: {selectedOptions.join(', ')}</p>
      <Link to="/home" className="save-link" onClick={savePreferences}>Save</Link>
    </div>
  );
};

export default UserDetails;