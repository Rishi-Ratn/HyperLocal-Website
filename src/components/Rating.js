import React, { useState } from 'react';

const Rating = ({ rating, onRate, numRatings, averageRating }) => {
  const [hover, setHover] = useState(0);

  const displayedRating = rating || averageRating

  return (
    <div>
      <div className="star-rating">
        {[...Array(5)].map((star, index) => {
          index += 1;
          return (
            <button
              type="button"
              key={index}
              className={index <= (hover || displayedRating) ? "on" : "off"}
              onClick={() => onRate(index)} 
              onMouseEnter={() => setHover(index)}
              onMouseLeave={() => setHover(0)}
            >
              <span className="star">&#9733;</span>
            </button>
          );
        })}
      </div>
      <div>
        <p>Average Rating: {averageRating ? averageRating.toFixed(2) : "N/A"}</p>
        <p>Number of Ratings: {numRatings}</p>
      </div>
    </div>
  );
};

export default Rating;
