import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Home.css'; // Import CSS file for styling
import { useAuth } from '../AuthContext';

function Home() {
  const data = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [inputText, setInputText] = useState(''); // State to store input text
  const [output, setOutput] = useState([]); // State to store printed output

  const handleLogout = () => {
    // Logout logic
    logout();
    navigate('/homeguest');
  };

  const handleInput = (event) => {
    if (event.key === 'Enter') {
      const text = event.target.value.trim();
      if (text !== '') {
        setOutput([...output, text]); // Add new text to output list
        setInputText(''); // Clear input field after processing
      }
    }
  };

  const handleInputChange = (event) => {
    setInputText(event.target.value); // Update inputText state as user types
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h2>Home {data.state}</h2>
        <button onClick={handleLogout}>Logout</button>
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
        <div>
          <h3>Output:</h3>
          <ul>
            {output.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Home;


//add map api/map image in the back
