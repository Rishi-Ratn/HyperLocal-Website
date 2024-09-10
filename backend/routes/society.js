const express = require('express');
const Society = require('../models/society.js');

const router = express.Router();

// GET ALL SOCIETIES 
router.get('/', async (req, res) => {
  try {
    const societies = await Society.find();
    res.status(200).json(societies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// cHECK ADMIN ON BASIS OF EMAIL QUERY
router.get('/check-admin', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Email query parameter is required' });
  }
  try {
    const society = await Society.findOne({ admin: email });
    const isAdmin = !!society;
    res.status(200).json({ isAdmin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET POSTS BY CATEGORY
router.get('/post/:cat_id', async (req, res, next) => {
  try {
    const { cat_id } = req.params;
    const { society } = req.query;

    // Find the society by the link
    const societies = await Society.findOne({ link: society });

    if (!societies) {
      return res.status(404).json({
        statusCode: 404,
        message: `Society '${society}' not found`,
      });
    }

    // Filter the posts by the cat_id
    const filteredPosts = societies.post.filter(post => post.cat_id === parseInt(cat_id, 10));

    if (filteredPosts.length === 0) {
      return res.status(404).json({
        statusCode: 404,
        message: `No posts found for category ID '${cat_id}'`,
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: 'Fetched posts successfully',
      data: filteredPosts,
    });

  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      message: 'Failed to fetch posts',
      error: err.message,
    });
  }
});


// GET ALL POSTS BY SOCIETY 
router.get('/posts', async (req, res, next) => {
  const { society } = req.query;
  console.log(society);
  if (!society) {
    return res.status(400).json({ error: 'Society query parameter is required' });
  }
  try {
    const societies = await Society.findOne({'link': society});
    if (!societies) {
      return res.status(404).json({
        statusCode: 404,
        message: `'${society}' not found`,               
      });
    }
    const posts = societies.post;
    return res.status(200).json({
      statusCode: 200,
      message: 'Fetched posts successfully',
      data: posts,
    });

  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      message: 'Failed to fetch posts',
      error: err.message,
    });
  }
});


// GET SOCIETY BY NAME (MINI PAGE)
router.get('/post/search/:name', async (req, res, next) => {
  const { society } = req.query;

  if (!society) {
    return res.status(400).json({ error: 'Society query parameter is required' });
  }

  try {
    const { name } = req.params;

    // Find the society by its 'link'
    const societies = await Society.findOne({ link: society });

    if (!societies) {
      return res.status(404).json({
        statusCode: 404,
        message: `Society '${society}' not found`,
      });
    }

    // Find the specific contact within the posts array
    const contact = societies.post.find(post =>
      post.data.some(contact => contact.name === name)
    );
    

    if (!contact) {
      return res.status(404).json({
        statusCode: 404,
        message: `Contact '${name}' not found in society '${society}'`,
      });
    }

    // Retrieve the exact contact within the found post
    const specificContact = contact.data.find(contact => contact.name === name);

    return res.status(200).json({
      statusCode: 200,
      message: 'Fetched contact successfully',
      data: specificContact,
    });


  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      message: 'Failed to fetch contact',
      error: err.message,
    });
  }
});


// GET a single post by ID
// router.get('/post/:id', async (req, res, next) => {
//   try {
//     const post = await Post.findById(req.params.id);
//     if (!post) {
//       return res.status(404).json({
//         statusCode: 404,
//         message: 'Post not found',
//         data: {},
//       });
//     }
//     return res.status(200).json({
//       statusCode: 200,
//       message: 'Fetched post',
//       data: { post },
//     });
//   } catch (err) {
//     return res.status(500).json({
//       statusCode: 500,
//       message: 'Failed to fetch post',
//       error: err.message,
//     });
//   }
// });


// POST a new post
router.post('/create/post', async (req, res, next) => {
  const { society } = req.query;
  console.log(society);
  if (!society) {
    return res.status(400).json({ error: 'Society query parameter is required' });
  }
  try {
    const societies = await Society.findOne({ link: society });
    if (!societies) {
      return res.status(404).json({
        statusCode: 404,
        message: `'${society}' not found`,               
      });
    }
    const { cat_id, cat, data } = req.body;
    const newPost = {
      cat_id,
      cat,
      data,
    };
    societies.post.push(newPost);
    await societies.save();

    return res.status(201).json({
      statusCode: 201,
      message: 'Created post',
      data: { post: newPost },
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      message: 'Failed to create post',
      error: err.message,
    });
  }
});


// // POST multiple posts
// router.post('/post/multiple', async (req, res, next) => {
//     try {
//       const posts = req.body.posts; // Expecting an array of posts
//       const insertedPosts = await Post.insertMany(posts);
//       return res.status(201).json({
//         statusCode: 201,
//         message: 'Created multiple posts',
//         data: { insertedPosts },
//       });
//     } catch (err) {
//       return res.status(500).json({
//         statusCode: 500,
//         message: 'Failed to create multiple posts',
//         error: err.message,
//       });
//     }
//   });





    // const post = await Post.findByIdAndUpdate(
    //   req.params.id,
    //   { cat_id, cat, data, priority },
    //   { new: true } // Return the updated document
    // );
    // if (!post) {
    //   return res.status(404).json({
    //     statusCode: 404,
    //     message: 'Post not found',
    //     data: {},
    //   });
    // }

// PUT updatae an existing post
// router.put('/update/post/:postId/contact/:contactId', async (req, res, next) => {
//   const { postId, contactId } = req.params;
//   const { society } = req.query;
//   console.log(society);
//   if (!society) {
//     return res.status(400).json({ error: 'Society query parameter is required' });
//   }
//   try {
//     const societies = await Society.findOne({ link: society });
//     if (!societies) {
//       return res.status(404).json({
//         statusCode: 404,
//         message: `'${society}' not found`,               
//       });
//     }
    
//     // Find the specific post within the society's posts array
//     const post = societies.post.id(postId);
//     if (!post) {
//       return res.status(404).json({
//         statusCode: 404,
//         message: 'Post not found',
//         data: post,
//       });
//     }

//     // Find the specific contact within the post's data array
//     const contact = post.data.id(contactId);
//     if (!contact) {
//       return res.status(404).json({
//         statusCode: 404,
//         message: 'Contact not found',
//       });
//     }

//     // Update the contact fields with the data from the request body
//     const { name, phone, address, website, priority } = req.body;
//     if (name) contact.name = name;
//     if (phone) contact.phone = phone;
//     if (address) contact.address = address;
//     if (website) contact.website = website;
//     if (priority) contact.priority = priority;


//     // Save the updated society document
//     await societies.save();

//     return res.status(200).json({
//       statusCode: 200,
//       message: 'Updated post',
//       data: { post },
//     });
//   } catch (err) {
//     return res.status(500).json({
//       statusCode: 500,
//       message: 'Failed to update post',
//       error: err.message,
//     });
//   }
// });





// PUT update an existing post
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { society } = req.query;
  const updatedPostData = req.body.data; 

  if (!society) {
    return res.status(400).json({ error: 'Society query parameter is required' });
  }

  try {
    const societyDocument = await Society.findOne({ link: society });
    if (!societyDocument) {
      return res.status(404).json({
        statusCode: 404,
        message: `'${society}' not found`,
      });
    }

    // Find the specific post within the society's posts array
    const post = societyDocument.post.id(id);
    if (!post) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Post not found',
      });
    }

    // Update the post's data
    post.data = updatedPostData || post.data;

    // Save the updated society document
    await societyDocument.save();

    return res.status(200).json({
      statusCode: 200,
      message: 'Post updated successfully',
      data: {post} ,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: 'An error occurred while updating the post',
    });
  }
});




// DELETE a post
router.delete('/post/item/:postId/:itemId', async (req, res) => {
  const { postId, itemId } = req.params;
  const { society } = req.query;

  if (!society) {
    return res.status(400).json({ error: 'Society query parameter is required' });
  }

  try {
    const societyDocument = await Society.findOne({ link: society });
    if (!societyDocument) {
      return res.status(404).json({
        statusCode: 404,
        message: `'${society}' not found`,
      });
    }

    // Find the specific post within the society's posts array
    const post = societyDocument.post.id(postId);
    if (!post) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Post not found',
      });
    }

    // Find the specific item within the post's data array
    const itemIndex = post.data.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Item not found',
      });
    }

    // Remove the item from the post's data array
    post.data.splice(itemIndex, 1);

    // Save the updated society document
    await societyDocument.save();

    return res.status(200).json({
      statusCode: 200,
      message: 'Item deleted successfully',
      data: {},
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      message: 'Failed to delete item',
      error: err.message,
    });
  }
});




module.exports = router;
