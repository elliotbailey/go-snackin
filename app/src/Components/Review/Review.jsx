import React, { useState } from 'react';
import './Review.css';

function Review() {
  const [visibleContainers, setVisibleContainers] = useState([true, true, true]);
  const [reviewedRestaurants, setReviewedRestaurants] = useState([]);

  const handleButtonClick = (index, status) => {
    const newVisibleContainers = [...visibleContainers];
    newVisibleContainers[index] = false;
    setVisibleContainers(newVisibleContainers);

    const updatedReviewedRestaurants = [...reviewedRestaurants, { ...containers[index], status }];
    setReviewedRestaurants(updatedReviewedRestaurants);
  };

  const containers = [
    { name: 'If You Say So', address: '88 Gailey Rd, St Lucia QLD 4067, Australia', imageUrl: 'src/components/assets/coffee.png' },
    { name: 'Paradise One08', address: '1/108 Helensvale Rd, Helensvale QLD 4212, Australia', imageUrl: 'src/components/assets/cafe.png' },
    { name: 'Comuna Cantina', address: '12 Creek St, Brisbane City QLD 4000, Australia', imageUrl: 'src/components/assets/mexican.png' }
  ];

  return (
    <div className="review-page">
      {reviewedRestaurants.map((restaurant, index) => (
        <div className={`reviewed-container ${restaurant.status}`} key={index}>
          <h1 className="reviewed-text">{restaurant.name}</h1>
        </div>
      ))}
      {containers.map((container, index) => (
        visibleContainers[index] && (
          <div className="review-container" key={index}>
            <h1>{container.name}</h1>
            <div className="image-container">
              <img src={container.imageUrl} alt={`${container.name}`} />
            </div>
            <p>{container.address}</p>
            <div className="buttons">
              <button onClick={() => handleButtonClick(index, 'enjoy')}>✔</button>
              <button onClick={() => handleButtonClick(index, 'didNotEnjoy')}>✘</button>
            </div>
          </div>
        )
      ))}
    </div>
  );
}

export default Review;
