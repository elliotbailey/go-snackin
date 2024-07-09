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
    { name: 'Restaurant 1', address: 'Address 1', imageUrl: 'src/components/assets/coffeeImage.jpg' },
    { name: 'Restaurant 2', address: 'Address 2', imageUrl: 'src/components/assets/image2.jpg' },
    { name: 'Restaurant 3', address: 'Address 3', imageUrl: 'src/components/assets/image3.jpg' }
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
              <button onClick={() => handleButtonClick(index, 'enjoy')}>Enjoy</button>
              <button onClick={() => handleButtonClick(index, 'didNotEnjoy')}>Did Not Enjoy</button>
            </div>
          </div>
        )
      ))}
    </div>
  );
}

export default Review;
