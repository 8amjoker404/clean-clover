const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { getSquadWelcomePrompt } = require('../utils/prompts');
const { generateAIResponse } = require('../services/llm');
const moment = require('moment');

//join /api/squad/join 
router.post('/join', async (req, res) => {
  const userId = req.user.id;
  const { squadId } = req.body;
  const chosenSquadId = Number(squadId);

  if (!Number.isInteger(chosenSquadId) || chosenSquadId < 1 || chosenSquadId > 9) {
    return res.status(400).json({ error: 'Invalid squad choice.' });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT u.id, u.username, u.tutorial_stage, u.squad_id, g.magic_type
      FROM users u
      LEFT JOIN grimoires g ON g.user_id = u.id
      WHERE u.id = ?
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = rows[0];
    if (user.squad_id) {
      return res.status(409).json({ error: 'You have already joined a squad.' });
    }

    const [examRows] = await pool.query(
      `
      SELECT grade, available_squads
      FROM exam_results
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId]
    );

    if (examRows.length === 0 || !examRows[0].grade) {
      return res.status(403).json({ error: 'You must finish the entrance exam first.' });
    }

    let allowedSquads = [];
    try {
      allowedSquads = JSON.parse(examRows[0].available_squads || '[]');
    } catch (e) {
      allowedSquads = [];
    }

    if (!Array.isArray(allowedSquads) || !allowedSquads.includes(chosenSquadId)) {
      return res.status(403).json({ error: 'This squad is not available for your exam result.' });
    }

    if (Number(user.tutorial_stage) !== 999) {
      return res.status(403).json({ error: 'You must finish the entrance exam first.' });
    }

    const [squadRows] = await pool.query(
      'SELECT id, name FROM squads WHERE id = ?',
      [chosenSquadId]
    );

    if (squadRows.length === 0) {
      return res.status(404).json({ error: 'Squad does not exist.' });
    }

    const squad = squadRows[0];

    await pool.query(
      'UPDATE users SET squad_id = ?, tutorial_stage = 1000 WHERE id = ?',
      [chosenSquadId, userId]
    );

    const prompt = getSquadWelcomePrompt(user, squad.name);
    const aiData = await generateAIResponse(prompt);

    const timestamp = moment().format('MMMM Do YYYY, h:mm:ss a');
    console.log(`[Squad Join] ${user.username} joined ${squad.name} at ${timestamp}`);

    return res.json({
      success: aiData.success,
      squad: {
        id: squad.id,
        name: squad.name
      },
      tutorialStage: 1000,
      captainSpeech: aiData.text,
      joinedAt: timestamp
    });
  } catch (error) {
    console.error('Squad Join Error:', error);
    return res.status(500).json({ error: 'Failed to join squad.' });
  }
});

module.exports = router;
