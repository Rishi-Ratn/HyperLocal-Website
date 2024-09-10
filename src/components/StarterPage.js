import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../StarterPage.css';

const StarterPage = () => {
  const [societies, setSocieties] = useState([]);

  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/society');
        setSocieties(response.data);
        
      } catch (error) {
        console.error('Error fetching societies:', error);
      }
    };

    fetchSocieties();
  }, []);

  return (
    <div className="starter-page">
      <h1>Choose Your Society</h1>
      <div className="society-links">
        {societies.map((society) => (
          <Link key={society._id} to={society.link}>
            {society.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StarterPage;
