const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

// Connect to DB immediately
connectDB();

const app = express();

app.use(cors({
    origin: true, // Allow all origins for simplicity in Vercel
    credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Gym Pro API is running...');
});

app.use('/api/users', userRoutes);

// Export the app for Vercel Serverless
module.exports = app;

// Only listen if running locally (not in Vercel)
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}