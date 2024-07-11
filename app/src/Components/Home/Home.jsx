import React, { useState, useEffect, Suspense, useRef } from 'react';
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

function calculatePolylineBounds(poly) {
  const bounds = {
      northwest: {
          latitude: -Infinity,
          longitude: -Infinity
      },
      southeast: {
          latitude: Infinity,
          longitude: Infinity
      },
      hypotenuse: 0
  }
  const path = polyline.decode(poly);
  path.forEach(point => {
      if (point[0] > bounds.northwest.latitude) {
          bounds.northwest.latitude = point[0];
      }
      if (point[0] < bounds.southeast.latitude) {
          bounds.southeast.latitude = point[0];
      }
      if (point[1] > bounds.northwest.longitude) {
          bounds.northwest.longitude = point[1];
      }
      if (point[1] < bounds.southeast.longitude) {
          bounds.southeast.longitude = point[1];
      }
  });

  bounds.hypotenuse = Math.sqrt(
      Math.pow(bounds.northwest.latitude - bounds.southeast.latitude, 2) +
      Math.pow(bounds.northwest.longitude - bounds.southeast.longitude, 2)
  );
  return bounds;
}

function estimateZoom(hypotenuse) {
  return -1.42467 * Math.log(hypotenuse) + 9.89924;
}

function Home() {
  const { isLoggedIn } = useAuth();
  const [inputText, setInputText] = useState(''); // State to store input text
  const [showRoute, setShowRoute] = useState(false); // State to control the polyline visibility
  const [routeData, setRouteData] = useState(null);
  const [zoomPoint, setZoomPoint] = useState({lat: -27.4705, lng: 153.0260});
  const [zoomLevel, setZoomLevel] = useState(13);
  const [showPopup, setShowPopup] = useState(false); // State to control the popup visibility
  const [showPopupButtons, setShowPopupButtons] = useState(true);
  const mapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/homeguest");
    }
    if (mapRef.current && zoomPoint) {
      mapRef.current.panTo(zoomPoint);
    }
  }, [isLoggedIn, navigate, zoomPoint]);

  useEffect(() => {
    if (showRoute && routeData) {
      setShowPopup(true);
    }
  }, [showRoute, routeData]);
  

  const handleInput = (event) => {
    if (!isLoggedIn) {
      console.log('User is not logged in, input ignored');
      return; // Prevent processing input if not logged in
    }

    if (event.key === 'Enter') {
      // Take user input and send to server for processing
      const input = event.target.value.trim();
      const storedEmail = localStorage.getItem('rememberedEmail');
      console.log(input);
      fetch('http://localhost:3000/api/generateRoute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: input, user_id: storedEmail }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            console.error(data.error);
            return;
          }
          setRouteData(data);
          setZoomLevel(estimateZoom(calculatePolylineBounds(data.polyline).hypotenuse));
          setZoomPoint({lat: data.stop.location.latitude, lng: data.stop.location.longitude});
          setShowRoute(true);
          setShowPopup(true);
          setShowPopupButtons(true);
        });
    }
  };

  const handleInputChange = (event) => {
    setInputText(event.target.value); // Update inputText state as user types
  };

  const closePopup = () => {
    setShowPopup(false); // Close the popup
  };

  const acceptRecommendation = () => {
    console.log('Accepted');
    setShowPopupButtons(false);
    // Indicate that route has been accepted by user
    const storedEmail = localStorage.getItem('rememberedEmail');
    fetch('http://localhost:3000/api/acceptRoute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: storedEmail }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
    });
  };

  const rejectRecommendation = () => {
    console.log('Rejected');
    // Replace route data with new suggestion
    const storedEmail = localStorage.getItem('rememberedEmail');
    fetch('http://localhost:3000/api/suggestNewRoute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: storedEmail }),
    })
      .then((response) => response.json())
      .then((data) => {
        setRouteData(data);
        setZoomLevel(estimateZoom(calculatePolylineBounds(data.polyline).hypotenuse));
        setZoomPoint({lat: data.stop.location.latitude, lng: data.stop.location.longitude});
        setShowRoute(true);
    });
    setShowPopup(true);
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
              zoom={zoomLevel}
              center={zoomPoint}
              mapOptions={{
                mapId: "66e3394611b81fa0",
                tilt: 30,
                disableDefaultUI: true,
              }}
              style={containerStyle}
              reuseMaps={true}
              onLoad={map => (mapRef.current = map)}
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

        {showRoute && showPopup && (
          <div className="popup">
          <div className="popup-content">
            <h2>Recommendation</h2>
            <p className="stop-name">{routeData.stop.name}</p>
            <p className="stop-address">{routeData.stop.address}</p>
            <img className = "popup-image" src={routeData.photo} alt="Venue Photo" style={{ width: '100%', maxWidth: '200px', margin: '10px auto' }} />
            <p className="distance">Total route duration is {routeData.duration}</p>
            {showPopupButtons && (
            <div className="popup-buttons">
              <button className="accept-button" onClick={acceptRecommendation}>✔</button>
              <button className="reject-button" onClick={rejectRecommendation}>✘</button>
            </div>
            )}
          </div>
        </div>        
        )}
      </div>
    </div>
  );
}

export default Home;

