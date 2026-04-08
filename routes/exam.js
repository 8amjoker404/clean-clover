// routes/exam.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { getExamPrompt } = require('../utils/prompts');
const { generateAIResponse } = require('../services/llm');
const moment = require('moment');

const extractJsonFromAiText = (text) => {
  const fallback = {
    playerDamageTaken: 0,
    playerMpUsed: 0,
    grade: 'C',
    newSpell: ''
  };

  if (!text || typeof text !== 'string') return fallback;

  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (!jsonMatch || !jsonMatch[1]) return fallback;

  try {
    const parsed = JSON.parse(jsonMatch[1]);
    return {
      playerDamageTaken: Number(parsed.playerDamageTaken) || 0,
      playerMpUsed: Number(parsed.playerMpUsed) || 0,
      grade: ['A', 'B', 'C'].includes(parsed.grade) ? parsed.grade : 'C',
      newSpell: typeof parsed.newSpell === 'string' ? parsed.newSpell.trim() : ''
    };
  } catch (error) {
    return fallback;
  }
};

router.post('/action', async (req, res) => {
  const userId = req.user.id;
  const { action } = req.body;

  try {
    const [rows] = await pool.query(`
      SELECT u.*, g.magic_type 
      FROM users u 
      LEFT JOIN grimoires g ON u.id = g.user_id 
      WHERE u.id = ?
    `, [userId]);

    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    const user = rows[0];

    if (!action || typeof action !== 'string') {
      return res.status(400).json({ error: 'Action is required.' });
    }

    const prompt = getExamPrompt(user, action);
    const aiData = await generateAIResponse(prompt);
    const aiText = aiData.text || '';
    const mathData = extractJsonFromAiText(aiText);
    const narrativeOnly = aiText.replace(/```json\s*[\s\S]*?\s*```/i, '').trim();

    let nextStage = Number(user.tutorial_stage) || 1;
    const mpUsed = Math.max(0, Number(mathData.playerMpUsed) || 0);
    const newMp = Math.max(0, Number(user.mp) - mpUsed);
    let availableSquads = [];

    if (nextStage === 1) {
      nextStage = 2;
      await pool.query(
        `UPDATE users SET tutorial_stage = ?, mp = ? WHERE id = ?`,
        [nextStage, newMp, userId]
      );
    } else if (nextStage === 2) {
      nextStage = 3;
      await pool.query(
        `UPDATE users SET tutorial_stage = ?, mp = ? WHERE id = ?`,
        [nextStage, newMp, userId]
      );

      if (mathData.newSpell) {
        await pool.query(
          `INSERT INTO spells (user_id, spell_name, mp_cost) VALUES (?, ?, ?)`,
          [userId, mathData.newSpell, 20]
        );
      }
    } else if (nextStage === 3) {
      if (mathData.grade === 'A') {
        availableSquads = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      } else if (mathData.grade === 'B') {
        availableSquads = [3, 4, 6, 8];
      } else {
        availableSquads = [3];
      }

      nextStage = 999;
      await pool.query(
        `UPDATE users SET tutorial_stage = ?, mp = ? WHERE id = ?`,
        [nextStage, newMp, userId]
      );
    } else {
      await pool.query(
        `UPDATE users SET mp = ? WHERE id = ?`,
        [newMp, userId]
      );
    }

    const timestamp = moment().format('MMMM Do YYYY, h:mm:ss a');
    console.log(`[Exam Log] Wizard ${user.username} took an action at: ${timestamp}`);

    res.json({
      success: aiData.success,
      narrative: narrativeOnly || aiText,
      grade: mathData.grade,
      availableSquads,
      currentMp: newMp,
      nextStage,
      actionTime: timestamp
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Exam system error" });
  }
});

module.exports = router;