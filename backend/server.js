const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');



dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());


// Import Routes
const commentRoutes = require("./src/routes/commentRoutes");
const authRoutes = require('./src/routes/authRoutes');
const postRoutes = require('./src/routes/postRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const threadRoutes = require('./src/routes/threadRoutes');

// Use Routes
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/threads', threadRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/thread", threadRoutes);
app.use("/api/comments", commentRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Campus Connect API is Running... 🚀');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});