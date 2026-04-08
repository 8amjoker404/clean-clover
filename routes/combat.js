// routes/combat.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { getCombatPrompt } = require('../utils/prompts');
const { generateAIResponse } = require('../services/llm');
const moment = require('moment');

router.post('/turn', async (req, res) => {
  const userId = req.user.id;
  const { action, enemyState, useAllyId } = req.body; 
  // enemyState should be sent from frontend: { name: "Rogue Mage", element: "Fire", hp: 100 }

  try {
    // 1. Fetch User + Squad Buff + Grimoire
    const [userRows] = await pool.query(`
      SELECT u.*, s.passive_buff, g.magic_type 
      FROM users u 
      LEFT JOIN squads s ON u.squad_id = s.id 
      LEFT JOIN grimoires g ON u.id = g.user_id 
      WHERE u.id = ?
    `, [userId]);

    if (userRows.length === 0) return res.status(404).json({ error: "User not found" });
    const user = userRows[0];

    // 2. Limit Break trigger: once HP is at or below 15%, enter cracked state
    if (Number(user.hp) <= Number(user.max_hp) * 0.15 && !user.is_cracked) {
      await pool.query(
        `UPDATE users SET is_cracked = 1 WHERE id = ?`,
        [userId]
      );
      user.is_cracked = 1;
    }

    // 3. Fetch Ally if requested (The AI Clone system)
    let ally = null;
    if (useAllyId) {
      const [allyRows] = await pool.query(`
        SELECT u.username, g.magic_type 
        FROM users u 
        LEFT JOIN grimoires g ON u.id = g.user_id 
        WHERE u.id = ?
      `, [useAllyId]);
      if (allyRows.length > 0) ally = allyRows[0];
    }

    // 4. Ask the AI to simulate the clash
    const prompt = getCombatPrompt(user, enemyState, action, ally);
    const aiData = await generateAIResponse(prompt);
    const aiResponseText = aiData.text || '';

    // 5. Parse the JSON out of the AI's response text
    // The AI returns text + a markdown JSON block. We extract the JSON.
    let mathData = { playerDamageTaken: 10, playerMpUsed: 15, enemyDamageTaken: 20 }; // Fallback defaults
    const jsonMatch = aiResponseText.match(/```json\n([\s\S]*?)\n```/);
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        mathData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse AI JSON math:", e);
      }
    }

    // Remove the JSON block from the narrative so the user just sees the story
    const narrativeOnly = aiResponseText.replace(/```json\n[\s\S]*?\n```/, '').trim();

    // 6. Calculate New Stats
    const incomingDamage = Math.max(0, Number(mathData.playerDamageTaken) || 0);
    const skillCost = Math.max(0, Number(mathData.playerMpUsed) || 0);
    const outgoingDamageBase = Math.max(0, Number(mathData.enemyDamageTaken) || 0);
    const crackedActive = Boolean(user.is_cracked);
    const outgoingDamage = crackedActive ? outgoingDamageBase * 2 : outgoingDamageBase;

    let newHp = Math.max(0, Number(user.hp) - incomingDamage);
    let newMp = Number(user.mp);
    let newEnemyHp = Math.max(0, Number(enemyState.hp) - outgoingDamage);

    // In cracked state, skills cost HP instead of MP
    if (crackedActive) {
      newHp = Math.max(0, newHp - skillCost);
    } else {
      newMp = Math.max(0, Number(user.mp) - skillCost);
    }
    
    let isCracked = crackedActive;
    let newMaxMp = user.max_mp;

    // THE PENALTY: Grimoire Crack (Option B)
    if (newHp === 0) {
      isCracked = true;
      newMaxMp = Math.floor(user.max_mp * 0.8); // Lose 20% max MP permanently until healed
    }

    // 7. Update the Database
    await pool.query(
      `UPDATE users SET hp = ?, mp = ?, max_mp = ?, is_cracked = ? WHERE id = ?`,
      [newHp, newMp, newMaxMp, isCracked, userId]
    );

    const timestamp = moment().format('MMMM Do YYYY, h:mm:ss a');

    // 8. Send the results back
    res.json({
      narrative: narrativeOnly,
      playerStats: { hp: newHp, mp: newMp, isCracked },
      enemyStats: { hp: newEnemyHp },
      combatLogTime: timestamp
    });

  } catch (error) {
    console.error("Combat Error:", error);
    res.status(500).json({ error: "Combat system failed to process the turn." });
  }
});

module.exports = router;