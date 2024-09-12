import React, { useCallback, useEffect, useState } from 'react';
import '../App.css';
import axios from 'axios';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Rating from './Rating'; 
import { signInWithGoogle, signOutWithGoogle } from '../firebase';
import { useSelector } from 'react-redux';

const App = () => {
  const {society} = useParams();
  const [myData, setMyData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isError, setIsError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [ratings, setRatings] = useState({});
  const navigate = useNavigate();
  const [selectedData, setSelectedData] = useState({});
  const [adminSocieties, setAdminSocieties] = useState([]);
  const [allSocieties, setAllSocieties] = useState([]);
  const {role, currentUser, isAuthenticated} = useSelector((state) => state.auth);
  

  useEffect(() => {
    const fetchAllSocieties = async () => {
      try {
        const response = await axios.get('/api/society');
        setAllSocieties(response.data);
      } catch (error) {
        console.error('Error fetching societies:', error);
      }
    };
  
    fetchAllSocieties();
  }, []);
  

  useEffect(() => {
    const fetchAdminSocieties = async () => {
      try {
        const response = await axios.get('/api/society/check-admin', {
          params: { email: currentUser.email }
        });
        
        if (response.data.isAdmin) {
          const societyResponse = await axios.get('/api/society');
          const adminSocieties = societyResponse.data.filter(society => 
            society.admin.includes(currentUser.email)
          );
          setAdminSocieties(adminSocieties);  
        } else {
          toast.error("You are not an admin of any society");
        }
      } catch (error) {
        console.error('Error fetching admin societies:', error);
      }
    };
  
    if (currentUser && role === 'admin') {
      fetchAdminSocieties();
    }
  }, [currentUser, role]);



  const handleSelectData = useCallback(async (selectedCategory) => {
    const cat_id = selectedCategory;
  
    try {
      const response = await axios.get(`/api/society/post/${cat_id}`, {
        params: { society },
      });
      
      if (response.data.statusCode === 200) {
        const category = response.data.data[0];
        setSelectedData(category);
      } else {
        setIsError(response.data.message);
      }
    } catch (error) {
      setIsError(error.message);
    }
  }, [society]);
  
  

   useEffect(() => {

    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/society/posts',{
          params: {society}
        });
        
        if (response.data.statusCode === 200) {
          setMyData(response.data.data);
          if (response.data.data.length > 0) {
            const initialCategory = response.data.data[0].cat_id.toString();   
            setSelectedCategory(initialCategory);
            handleSelectData(initialCategory);
          }
        } else {    
          setIsError(response.data.message);
        }
        setIsLoading(false);
        const storedRatings = JSON.parse(localStorage.getItem('ratings')) || {};
        setRatings(storedRatings);
      } catch (error) {
        setIsError(error.message);
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [society, handleSelectData]);



  const handleCategoryChange = (event) => {
    const newcategory = event.target.value;
    
    setSelectedCategory(newcategory);
  
    handleSelectData(newcategory);
  };


  const handleRate = async (itemId, rating) => {
    if (!isAuthenticated) {
      toast.error('Please Login to give review');
    } else {
      try {

        const userEmail = currentUser.email;
        const response = await axios.post('/api/ratings', {
          itemId,
          rating,
          userEmail
        });

        if (response.data.error === 'You have already rated this item.') {
          toast.info("You've already made a rating");
          return;
        }

        if (response.data) {
          const updatedRatings = { ...ratings };
          
          if (!updatedRatings[itemId]) {
            updatedRatings[itemId] = { count: 0, sum: 0, users: [] };
          }
  
          updatedRatings[itemId].count += 1;
          updatedRatings[itemId].sum += rating;
          updatedRatings[itemId].users.push(userEmail);
  
          setRatings(updatedRatings);
          
          localStorage.setItem("ratings", JSON.stringify(updatedRatings));  
          toast.success("Rating submitted successfully")
        } else {
          toast.error("Failed to submit rating");
        }
      } catch (error) {
        toast.error("Error submitting rating");
      }
    }
  };


  const getAverageRating = (itemId) => {
    const currentRatings = ratings[itemId] || { count: 0, sum: 0 };
    return currentRatings.count > 0 ? currentRatings.sum / currentRatings.count : 0;
  };


  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      toast.success(`Login successful`); 
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      toast.error('Login failed. Please try again.');
    }
  };
  

  const handleLogout = async () => {
    try {
      await signOutWithGoogle();
      toast.success(`You’ve logged out`);  
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error('Logout failed. Please try again.');
    }
  };


  return (
    <>
      <header>
        <div className="header-left">
          <h1>Contact Information</h1>
        </div>
        
        <div className="header-right">
          
          {currentUser && role === 'admin' && (
            <select onChange={(e) => navigate(`/${e.target.value}`)}>
              <option value="">Select Admin Panel</option>
              {adminSocieties.map(society => (
                <option key={society._id} value={`${society.link}/admin`}>
                  {society.name}
                </option>
              ))}
            </select>
          )}


          {currentUser ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <button onClick={handleLogin}>Login</button>
          )}


          {!isLoading && (
            <select
              value={society} 
              onChange={(e) => {
                window.location.href = `/${e.target.value}`
              }}
            >
              {allSocieties.map((society) => (
                <option key={society._id} value={society.link}>
                  {society.name}
                </option>
              ))}
              <option value="..">Starter Page</option>
            </select>
          )}


        </div>
      </header>
      
      {isLoading ? (
        <h2>Loading...</h2>
      ) : isError ? (
        <h2>Error: {isError}</h2>
      ) : (
        <>
          <div className="content-wrapper">
            <div className="main-content">
              <div className="dropdown">
                <label htmlFor="category-select">Choose a category:</label>
                <select
                  id="category-select"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  aria-label="Select Category"
                >
                  {myData.map((category) => (
                    <option key={category.cat_id} value={category.cat_id.toString()}>
                      {category.cat}
                    </option>
                  ))}
                </select>
              </div>
                  {console.log(selectedData)}
                  
              {selectedData && selectedData.data && selectedData.data.length > 0 && (
                <>
                  <h2 className="category-heading">{selectedData.cat}</h2>
                  <div className="grid">
                    {selectedData.data.map((item, index) => (
                      <div key={index} className="card">  

                        <Link 
                          to={`/item/${item.name}?society=${society}`} 
                          target='_blank'>
                          <h3>{item.name}</h3>
                        </Link>


                        {Array.isArray(item.phone) ? (
                          <p>
                            <span role="img" aria-label="phone">📞</span> +91{" "}
                            {item.phone.map((phone, i) => (
                              <React.Fragment key={i}>
                                <a href={`tel:${phone}`}>{phone}</a>
                                {i < item.phone.length - 1 ? ', ' : ''}
                              </React.Fragment>
                            ))}
                          </p>
                        ) : (
                          <p><span role="img" aria-label="phone">📞</span> <a href={`tel:${item.phone}`}>+91 {item.phone}</a></p>
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
                                {i < item.website.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </p>
                        )}

                        <Rating
                          rating={ratings[item._id]?.value || 0}
                          onRate={(value) => handleRate(item._id, value)}
                          numRatings={ratings[item._id]?.count || 0}
                          averageRating={getAverageRating(item._id)}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            
          </div>

          
        </>
      )}
      <div className="banner-section desktop">
        <h1>Banner</h1>
      </div>
      <div className="banner-section mobile">
          <h1>banner</h1>
      </div>
    </>
    
  );
};

export default App;


