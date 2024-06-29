import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const data = useLocation()
  const navigate = useNavigate()
  console.log(data)

  return (
    <div>
      Home {data.state}<br/>
      <button onClick={()=>navigate(-1)}>Logout</button>
    </div>
  );
}

export default Home;
