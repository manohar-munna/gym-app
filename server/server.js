const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');

dotenv.config();
connectDB();

const app = express();

// Set up CORS for production
// Vercel will set process.env.VERCEL_URL
const allowedOrigins = process.env.VERCEL_URL ? [`https://swamy-gym-app.vercel.app`] : ['http://localhost:5173'];
app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('Swamy Gym API is running...');
});

// Vercel handles the listening part, so we remove the app.listen() for production
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export the app for Vercel
module.exports = app;