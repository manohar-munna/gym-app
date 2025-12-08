const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// CORS Configuration
app.use(cors({
    origin: true, // Allow all origins (simplifies Vercel deployment)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// --- CRITICAL FIX FOR VERCEL 404s ---
// Vercel sometimes strips the '/api' prefix, sometimes it keeps it.
// We mount the routes on both paths to be 100% safe.
app.use('/api/users', userRoutes);
app.use('/users', userRoutes); 
// ------------------------------------

app.get('/', (req, res) => {
    res.send('Swamy Gym API is running...');
});

// Export the app for Vercel Serverless
module.exports = app;

// Only listen if running locally
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}