const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // Path is now relative to api/
const userRoutes = require('./routes/userRoutes');

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// CORS: Allow everything for Vercel
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

// --- ROUTES ---
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Mount routes
// Vercel sometimes sends the request as /api/users or just /users depending on the rewrite
app.use('/api/users', userRoutes);
app.use('/users', userRoutes); 

// Export the app for Vercel
module.exports = app;

// Local Development: Run this if executed directly
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}