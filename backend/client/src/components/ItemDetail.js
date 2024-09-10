import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import './item.css';

const ItemDetail = () => {
  const { itemName } = useParams();
  const location = useLocation();
  
  const params = new URLSearchParams(location.search);
  const society = params.get('society');
  
  const [item, setItem] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/society/post/search/${itemName}`,{
          params: { society }
        });
        
        const contact = response.data.data;
        
        if (contact) {
          setItem(contact);  
        } else {
          throw new Error(`Item '${itemName}' not found`);
        }
      } catch (error) {
        setIsError(error.message);
        console.log(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [itemName, society]);

  if (isLoading) return <h2>Loading...</h2>;
  if (isError) return <h2>Error: {isError}</h2>;
  if (!item) return <h2>Item not found</h2>;

  return (
    <div className="item-detail">
      <h2>{item.name}</h2>
      {Array.isArray(item.phone) ? (
        <p>{item.phone.join(", ")}</p>
      ) : (
        <p>{item.phone}</p>
      )}
      {item.address && <p>Address: {item.address}</p>}
      {item.specialization && <p>Specialization: {item.specialization}</p>}
      {item.website && (
        <p>
          Website:{" "}
          {item.website.map((site, i) => (
            <span key={i}>
              <a href={`http://${site}`} target="_blank" rel="noopener noreferrer">
                {site}
              </a>
              {i < item.website.length - 1 && ", "}
            </span>
          ))}
        </p>
      )}
      {item.google_maps && (
        <p>
          <a href={item.google_maps} target="_blank" rel="noopener noreferrer">
            Google Maps Location
          </a>
        </p>
      )}
    </div>
  );
};

export default ItemDetail;
