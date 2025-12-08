const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');

dotenv.config();
connectDB();

const app = express();

// 1. ALLOW CORS (Allow requests from anywhere for now)
app.use(cors({
  origin: "*", 
  credentials: true
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Gym Pro API is running on Vercel...');
});

// 2. EXPORT APP (Crucial for Vercel)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // <--- ADD THIS LINE