const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');

router.post('/create', verifyToken, isAdmin, async (req, res) => {
  const {
    title,
    description,
    difficulty,
    rank_required,
    yul_reward,
    merit_reward
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      error: 'Title and description are required.'
    });
  }

  try {
    await pool.query(
      `
      INSERT INTO missions (title, description, difficulty, rank_required, yul_reward, merit_reward)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        description,
        difficulty || 'D-Rank',
        Number(rank_required) || 1000,
        Number(yul_reward) || 0,
        Number(merit_reward) || 0
      ]
    );

    return res.json({
      success: true,
      message: "Mission created successfully"
    });
  } catch (error) {
    console.error('Create Mission Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create mission.'
    });
  }
});

router.get('/list', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [userRows] = await pool.query(
      'SELECT rank FROM users WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found.'
      });
    }

    const userRank = Number(userRows[0].rank) || 1000;
    const [missions] = await pool.query(
      `
      SELECT * FROM missions
      WHERE rank_required >= ?
      ORDER BY rank_required ASC
      `,
      [userRank]
    );

    return res.json({
      success: true,
      missions
    });
  } catch (error) {
    console.error('List Missions Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to load missions.'
    });
  }
});

router.post('/start', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { missionId } = req.body;
  const selectedMissionId = Number(missionId);

  if (!Number.isInteger(selectedMissionId) || selectedMissionId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid missionId.'
    });
  }

  try {
    const [userRows] = await pool.query(
      'SELECT rank FROM users WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found.'
      });
    }

    const userRank = Number(userRows[0].rank) || 1000;
    const [missionRows] = await pool.query(
      'SELECT id, rank_required FROM missions WHERE id = ? LIMIT 1',
      [selectedMissionId]
    );

    if (missionRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Mission not found.'
      });
    }

    const mission = missionRows[0];
    if (userRank > Number(mission.rank_required)) {
      return res.status(403).json({
        success: false,
        error: 'Your rank is too low for this mission.'
      });
    }

    const [activeRows] = await pool.query(
      `
      SELECT id FROM active_missions
      WHERE user_id = ? AND status = 'in_progress'
      LIMIT 1
      `,
      [userId]
    );

    if (activeRows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'You already have an active mission.'
      });
    }

    await pool.query(
      'INSERT INTO active_missions (user_id, mission_id) VALUES (?, ?)',
      [userId, selectedMissionId]
    );

    return res.json({
      success: true,
      message: "Mission started"
    });
  } catch (error) {
    console.error('Start Mission Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to start mission.'
    });
  }
});

module.exports = router;
