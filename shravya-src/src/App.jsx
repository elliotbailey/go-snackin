import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './Components/Navbar/NavBar.jsx';
import FooterBar from './Components/FooterBar/FooterBar.jsx';

function App() {
  return (
    <div>
      <NavBar />
      <Outlet /> 
      <FooterBar/>
    </div>
  );
}

export default App;


