// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // <-- Imported Helmet
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/auth');
const examRoutes = require('./routes/exam');
const combatRoutes = require('./routes/combat'); 
const leaderboardRoutes = require('./routes/leaderboard');
const squadRoutes = require('./routes/squad');
const missionRoutes = require('./routes/mission');
const verifyToken = require('./middleware/authMiddleware');

const app = express();

// Global Middleware
app.use(helmet()); // <-- Deployed Helmet at the very top for maximum security
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // <-- Good to have when prepping for forms/files

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exam', verifyToken, examRoutes);
app.use('/api/combat', verifyToken, combatRoutes);
app.use('/api/leaderboard', verifyToken, leaderboardRoutes);
app.use('/api/squad', verifyToken, squadRoutes);
app.use('/api/mission', missionRoutes);

app.get('/', (req, res) => {
  res.send('Clover Soul API is online and secured!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully.');
    connection.release();
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
});