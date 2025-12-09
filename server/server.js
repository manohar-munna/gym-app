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
app.use('/api/activity', require('./routes/activityRoutes'));
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  // Tells the browser: "This is a website page, do not download it."
  res.setHeader("Content-Type", "text/html");
  res.status(200).send("<h1>API is running...</h1>");
});

// 2. EXPORT APP (Crucial for Vercel)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // <--- ADD THIS LINE