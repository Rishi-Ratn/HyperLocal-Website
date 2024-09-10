const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

dotenv.config();

const ratingRoutes = require("./routes/rating");
const societyRouter = require('./routes/society');

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// Serve static files from the react frontend build
app.use(express.static(path.join(__dirname, "../build")));


// Routes
app.use("/api/ratings", ratingRoutes);
app.use('/api/society', societyRouter);


// Catch-all handler to serve the frontend for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});


// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});



// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
