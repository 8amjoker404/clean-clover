// routes/leaderboard.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get the Rank Window for the current user
router.get('/window', async (req, res) => {
  const userId = req.user.id; // From verifyToken middleware

  try {
    // 1. Get current user's rank
    const [userRows] = await pool.query('SELECT rank, merit FROM users WHERE id = ?', [userId]);
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const userRank = userRows[0].rank;

    // 2. Define the window (50 ranks above and below)
    // Note: Rank 1 is the best, so "above" means a lower number.
    const minRank = Math.max(1, userRank - 50); 
    const maxRank = userRank + 50;

    // 3. Fetch the players in that window
    const [leaderboardRows] = await pool.query(`
      SELECT id, username, rank, merit, is_cracked 
      FROM users 
      WHERE rank >= ? AND rank <= ? 
      ORDER BY rank ASC
    `, [minRank, maxRank]);

    res.json({
      currentUserRank: userRank,
      window: leaderboardRows
    });

  } catch (error) {
    console.error("Leaderboard Error:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard window." });
  }
});

module.exports = router;