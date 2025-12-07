const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// 1. IMPORT ROUTES (Crucial Step)
const userRoutes = require('./routes/userRoutes'); 

dotenv.config();
connectDB();

const app = express();

// 2. Enable CORS
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
}));

app.use(express.json());

// 3. LOG REQUESTS (This helps us debug)
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

// 4. CONNECT ROUTES (Crucial Step)
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Gym Pro API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));