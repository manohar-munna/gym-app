const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

const userRoutes = require('./routes/userRoutes');

dotenv.config();
connectDB();

const app = express();

// This CORS setup is perfect for local development.
app.use(cors({
  origin: ["http://localhost:5173", "http://12-7.0.0.1:5173"],
  credentials: true
}));

app.use(express.json());

// Logging to see requests in your terminal
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Gym Pro API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
