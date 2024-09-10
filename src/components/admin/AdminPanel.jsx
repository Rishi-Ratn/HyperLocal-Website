import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const AdminPanel = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newPost, setNewPost] = useState({
    cat_id: "",
    cat: "",
    data: [{ name: "", phone: "", address: "", website: "", priority: "" }]
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [currentDataItem, setCurrentDataItem] = useState(null);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { society } = useParams();

  useEffect(()=>{
    const fetchPosts = async (req, res, next) => {
      try {
        const response = await axios.get('http://localhost:5000/api/society/posts',{
          params: {society}
        })
        // console.log(response.data.data);
        setPosts(response.data.data);
        setCategories([...new Set(response.data.data.map(post => post.cat))]);
        // console.log(posts);
        // console.log(categories);
      } catch (error) {
        console.log('Error fetching posts:', error);
      }
    };
    fetchPosts();
  },[society]);



  const handleDelete = async (postId, itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await axios.delete(
          `http://localhost:5000/api/society/post/item/${postId}/${itemId}`,
          {
            params: { society },  
          }
        );
  
        if (response.status === 200) {
          setPosts(posts.map(post =>
            post._id === postId ? {
              ...post,
              data: post.data.filter(item => item._id !== itemId) 
            } : post
          ));
          alert('Item deleted successfully.');
        }
      } catch (error) {
        console.error('There was an error deleting the item!', error);
        alert('There was an error deleting the item!');
      }
    }
  };


  const handleInputChange = (e, index = null) => {
    const { name, value } = e.target;
    console.log(name);
    console.log(value);
    console.log(index);
    
    if (index !== null) {
      setNewPost(prevState => {
        const newData = [...prevState.data];
        newData[index][name] = name === 'phone' || name === 'website' ? value.split(', ') : value;
        return {
          ...prevState,
          data: newData
        };
      });
    } else {
      setNewPost(prevState => ({
        ...prevState,
        [name]: value
      }));
      newPost.cat_id = 2;
      console.log(newPost);
      
    }
  };


  const handleCreate = async (e) => {
    e.preventDefault();
    console.log(isAddingNewCategory);
    console.log(newPost.cat);
    
    if (isAddingNewCategory && !newPost.cat) {
      alert('Please enter a new category.');
      return;
    }

    if (!isAddingNewCategory && !newPost.cat) {
      alert('Please select a category.');
      return;
    }

    const existingPost = posts.find(post => post.cat === newPost.cat);
    console.log(existingPost);
    existingPost ? console.log(true) : console.log(false);
    

    if (existingPost) {
      console.log(existingPost);
      console.log(newPost);
      console.log(existingPost.data);
      console.log(newPost.data);
      
      const updatedData = [...existingPost.data, ...newPost.data];
      console.log(updatedData);
      
      try {
        const response = await axios.put(`http://localhost:5000/api/society/${existingPost._id}`,
          { data: updatedData },  
          {
            params: { society }, 
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        console.log(response);
        
        if (response.status === 200) {
          setPosts(posts.map(post =>
            post._id === existingPost._id ? response.data.data.post : post
          ));
          console.log(posts);
          
          setNewPost({
            cat_id: "",
            cat: "",
            data: [{ name: "", phone: "", address: "", website: "", priority: "" }]
          });
          console.log(newPost);
          
          setIsAddingNewCategory(false);
          alert('User added to existing category successfully.');
        }

      } catch (error) {
        console.error('There was an error adding the user to the existing category!', error);
        alert('There was an error adding the user to the existing category!');
      }
    
    } else {

      try {
        console.log(newPost);
      
        const response = await axios.post('http://localhost:5000/api/society/create/post', newPost, {
          params: { society },
          headers: {
            'Content-Type': 'application/json',
          },
        });      
        if (response.status !== 201) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      
        setPosts([...posts, response.data.data.post]);
      
        setNewPost({
          cat_id: "",
          cat: "",
          data: [{ name: "", phone: "", address: "", website: "", priority: "" }]
        });
      
        setIsAddingNewCategory(false);
        alert('Post created successfully.');
      
      } catch (error) {
        console.error('There was an error creating the post!', error);
        console.log(error.message);
        alert('There was an error creating the post!');
      }
    }
  };


  const handleEdit = (post, dataItem) => {
    setCurrentPost(post);
    setCurrentDataItem(dataItem);
    setIsModalOpen(true);
  };


  const handleUpdate = async (e) => {
    console.log(society);
    
    e.preventDefault();
    console.log(currentPost);

    const updatedData = currentPost.data.map(item =>
      item._id === currentDataItem._id ? currentDataItem : item
    );
    console.log(updatedData);
    console.log(currentPost._id);
    
    try {
      const response = await axios.put(`http://localhost:5000/api/society/${currentPost._id}`,
        {data: updatedData},
        {
        params: {society},
        headers: {
            'Content-Type': 'application/json',
        },
      }
      );

      if (response.status === 200) {
        setPosts(posts.map(post => 
          post._id === currentPost._id ? response.data.data.post : post
        ));
        console.log(posts);
        
        setIsModalOpen(false);
        setCurrentPost(null);
        setCurrentDataItem(null);
        alert('Post updated successfully.');
      }
    } catch (error) {
      console.error('There was an error updating the post!', error);
      alert('There was an error updating the post!');
    }
  };





  // const handleUpdate = async (e) => {
  //   e.preventDefault();
  
  //   if (!currentPost || !currentPost._id) {
  //     console.error('currentPost is not defined or missing _id.');
  //     alert('Error: current post is not selected or missing ID.');
  //     return;
  //   }
  
  //   console.log(society);
  //   console.log(currentPost);
  
  //   const updatedData = currentPost.data.map(item =>
  //     item._id === currentDataItem._id ? currentDataItem : item
  //   );
    
  //   console.log(updatedData);
  //   console.log(currentPost._id);
  
  //   try {
  //     const response = await axios.put(`http://localhost:5000/api/society/${currentPost._id}`,
  //       { data: updatedData },
  //       {
  //         params: { society },
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //       }
  //     );
  
  //     if (response.status === 200) {
  //       setPosts(posts.map(post =>
  //         post._id === currentPost._id ? response.data.data.post : post
  //       ));
  //       console.log(posts);
  
  //       setIsModalOpen(false);
  //       setCurrentPost(null);
  //       setCurrentDataItem(null);
  //       alert('Post updated successfully.');
  //     }
  //   } catch (error) {
  //     console.error('There was an error updating the post!', error);
  //     alert('There was an error updating the post!');
  //   }
  // };
  




  const renderData = (post) => {
    return post.data.map((item, index) => (
      <div className="data-container" key={item._id}>
        <p>Name: {item.name}</p>
        <p>Phone: {Array.isArray(item.phone) ? item.phone.join(', ') : item.phone}</p>
        <p>Address: {item.address}</p>
        <p>Website: {Array.isArray(item.website) ? item.website.join(', ') : item.website}</p>
        <p>Priority: {item.priority}</p>
        <button onClick={() => handleDelete(post._id, item._id)}>Delete</button>
        <button onClick={() => handleEdit(post, item)}>Edit</button>
      </div>
    ));
  };

  
  const filteredPosts = posts.filter(post =>
    post.cat.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.data.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );



  return (
    <div>
      <h1>Admin Panel</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by category or item name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="form-container">
        <h2>Create New User</h2>
        <form onSubmit={handleCreate}>
          <select
            name="cat"
            value={isAddingNewCategory ? "" : newPost.cat}
            onChange={(e) => {
              const value = e.target.value;
              {console.log(value)}
              if (value === "new") {
                setIsAddingNewCategory(true);
                setNewPost({ ...newPost, cat: "" });
              } else {
                setIsAddingNewCategory(false);
                setNewPost({ ...newPost, cat: value});
              }
            }}
            // required
          >
            <option value="">Select Category</option>
            <option value="new">Add New Category</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>

          {isAddingNewCategory && (
            <input
              type="text"
              name="cat"
              placeholder="New Category"
              value={newPost.cat}
              onChange={handleInputChange}
              required
            />
          )}

          {newPost.data.map((item, index) => (
            <div key={index}>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={item.name}
                onChange={(e) => handleInputChange(e, index)}
                required
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={Array.isArray(item.phone) ? item.phone.join(', ') : item.phone}
                onChange={(e) => handleInputChange(e, index)}
                required
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={item.address}
                onChange={(e) => handleInputChange(e, index)}
                required
              />
              <input
                type="text"
                name="website"
                placeholder="Website"
                value={Array.isArray(item.website) ? item.website.join(', ') : item.website}
                onChange={(e) => handleInputChange(e, index)}
              />
              <input
                type="number"
                name="priority"
                placeholder="Priority"
                value={item.priority}
                onChange={(e) => handleInputChange(e, index)}
                required
              />
            </div>
          ))}
          <button type="submit">Create</button>
        </form>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map(post => (
              <tr key={post._id}>
                <td>{post.cat}</td>
                <td>{renderData(post)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
            <h2>Edit Data Item</h2>
            <form onSubmit={handleUpdate}>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={currentDataItem.name}
                onChange={e => setCurrentDataItem({ ...currentDataItem, name: e.target.value })}
                required
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={Array.isArray(currentDataItem.phone) ? currentDataItem.phone.join(', ') : currentDataItem.phone}
                onChange={e => setCurrentDataItem({ ...currentDataItem, phone: e.target.value.split(', ') })}
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={currentDataItem.address}
                onChange={e => setCurrentDataItem({ ...currentDataItem, address: e.target.value })}
              />
              <input
                type="text"
                name="website"
                placeholder="Website"
                value={Array.isArray(currentDataItem.website) ? currentDataItem.website.join(', ') : currentDataItem.website}
                onChange={e => setCurrentDataItem({ ...currentDataItem, website: e.target.value.split(', ') })}
              />
              <input
                type="number"
                name="priority"
                placeholder="Priority"
                value={currentDataItem.priority}
                onChange={e => setCurrentDataItem({ ...currentDataItem, priority: e.target.value })}
              />
              <button type="submit">Update</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
