const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Import Routes
const authRoutes = require('./routes/authRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');  

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/assessment', assessmentRoutes); 

// Test Route
app.get('/', (req, res) => {
  res.send('Campus Connect API is Running... 🚀');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

console.log("Loaded Gemini Key:", process.env.GEMINI_API_KEY);