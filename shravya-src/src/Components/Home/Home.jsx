import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Import CSS file for styling
import { useAuth } from '../AuthContext';
import polyline from 'google-polyline';
import { AdvancedMarker, GoogleMap, GoogleMapApiLoader, PinElement, Polyline, CustomMarker } from 'react-google-map-wrapper';

const containerStyle = {
  width: '100%',
  height: 'calc(100vh - 60px)', // Adjusted height to fit within viewport minus navbar height
  position: 'absolute',
  top: '60px', // Position below the navbar
  left: 0,
};

function convertCoordinates(array) {
  return array.map(coord => ({
    lat: coord[0],
    lng: coord[1]
  }));
}

function Home() {
  const { isLoggedIn } = useAuth();
  const [inputText, setInputText] = useState(''); // State to store input text
  const [showRoute, setShowRoute] = useState(false); // State to control the polyline visibility
  const [routeData, setRouteData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/homeguest");
    }
  }, [isLoggedIn, navigate]);

  const handleInput = (event) => {
    if (!isLoggedIn) {
      console.log('User is not logged in, input ignored');
      return; // Prevent processing input if not logged in
    }

    if (event.key === 'Enter') {
      // Take user input and send to server for processing
      const input = event.target.value.trim();
      console.log(input);
      fetch('http://localhost:3000/api/generateRoute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: input }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setRouteData(data);
          setShowRoute(true);
        });
    }
  };

  const handleInputChange = (event) => {
    setInputText(event.target.value); // Update inputText state as user types
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <Suspense fallback="Loading Go Snackin'...">
          <GoogleMapApiLoader
            apiKey="AIzaSyAbfGPLQOkiCN5upNBRnUnmxmyLpTqLYFQ"
            suspense
          >
            <GoogleMap
              zoom={12}
              center={{ lat: -27.4705, lng: 153.0260 }}
              mapOptions={{
                mapId: "66e3394611b81fa0",
                tilt: 30,
                disableDefaultUI: true,
              }}
              style={containerStyle}
              reuseMaps={true}
            >
              {showRoute && (
                <>
                  <Polyline
                    path={convertCoordinates(polyline.decode(routeData.polyline))}
                    strokeColor="#1E90FF"
                    strokeOpacity={1.0}
                    strokeWeight={5}
                    geodesic
                  />
                  <AdvancedMarker lat={routeData.stop.location.latitude} lng={routeData.stop.location.longitude}>
                    <PinElement
                      scale={1.3}
                      background={"#37A669"}
                      borderColor={"#226742"}
                      glyphColor={"#226742"}
                    />
                  </AdvancedMarker>
                  <AdvancedMarker lat={routeData.origin.location.latitude} lng={routeData.origin.location.longitude}>
                    <PinElement
                      scale={1}
                      background={"#37A669"}
                      borderColor={"#226742"}
                      glyphColor={"#226742"}
                    />
                  </AdvancedMarker>
                  <AdvancedMarker lat={routeData.destination.location.latitude} lng={routeData.destination.location.longitude}>
                    <PinElement
                      scale={1}
                      background={"#37A669"}
                      borderColor={"#226742"}
                      glyphColor={"#226742"}
                    />
                  </AdvancedMarker>
                  <CustomMarker lat={routeData.stop.location.latitude} lng={routeData.stop.location.longitude}>
                    <div className='stop-location-infobox' >
                      <h3>{routeData.stop.name}</h3>
                      <p>{routeData.stop.address}</p>
                    </div>
                  </CustomMarker>
                  <CustomMarker lat={routeData.origin.location.latitude} lng={routeData.origin.location.longitude}>
                    <div className='end-location-infobox' >
                      <h3>{routeData.origin.name}</h3>
                    </div>
                  </CustomMarker>
                  <CustomMarker lat={routeData.destination.location.latitude} lng={routeData.destination.location.longitude}>
                    <div className='end-location-infobox' >
                      <h3>{routeData.destination.name}</h3>
                    </div>
                  </CustomMarker>
                </>
              )}
            </GoogleMap>
          </GoogleMapApiLoader>
        </Suspense>

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
