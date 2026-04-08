// routes/combat.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { getCombatPrompt } = require('../utils/prompts');
const { generateAIResponse } = require('../services/llm');
const moment = require('moment');

router.post('/turn', async (req, res) => {
  const userId = req.user.id;
  const { action, enemyState, useAllyId, itemId } = req.body; 
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

    // 4. Item usage turn
    if (action === 'use_item') {
      const selectedItemId = Number(itemId);
      if (!Number.isInteger(selectedItemId) || selectedItemId <= 0) {
        return res.status(400).json({ error: 'Valid itemId is required for use_item.' });
      }

      const [invRows] = await pool.query(
        `SELECT id, quantity FROM inventory WHERE user_id = ? AND item_id = ? LIMIT 1`,
        [userId, selectedItemId]
      );

      if (invRows.length === 0 || Number(invRows[0].quantity) <= 0) {
        return res.status(400).json({ error: 'Item not available in inventory.' });
      }

      const [itemRows] = await pool.query(
        `SELECT id, name, type, effect_value FROM items WHERE id = ? LIMIT 1`,
        [selectedItemId]
      );

      if (itemRows.length === 0) {
        return res.status(404).json({ error: 'Item not found.' });
      }

      const item = itemRows[0];
      let newHp = Number(user.hp) || 0;
      let newMp = Number(user.mp) || 0;

      if (item.type === 'potion') {
        newHp = Math.min(Number(user.max_hp) || 100, newHp + (Number(item.effect_value) || 0));
      } else if (item.type === 'mana') {
        newMp = Math.min(Number(user.max_mp) || 100, newMp + (Number(item.effect_value) || 0));
      } else {
        return res.status(400).json({ error: 'This item type is not usable in combat.' });
      }

      await pool.query(
        `UPDATE users SET hp = ?, mp = ? WHERE id = ?`,
        [newHp, newMp, userId]
      );

      await pool.query(
        `UPDATE inventory SET quantity = quantity - 1 WHERE id = ?`,
        [invRows[0].id]
      );

      await pool.query(
        `DELETE FROM inventory WHERE id = ? AND quantity <= 0`,
        [invRows[0].id]
      );

      const timestamp = moment().format('MMMM Do YYYY, h:mm:ss a');
      return res.json({
        success: true,
        narrative: `${item.name} was used in battle.`,
        cloneUsed: false,
        missionComplete: false,
        rewards: { yul: 0, merit: 0 },
        playerStats: { hp: newHp, mp: newMp, isCracked: Boolean(user.is_cracked) },
        enemyStats: { hp: Number(enemyState?.hp) || 0 },
        combatLogTime: timestamp
      });
    }

    // 5. Ask the AI to simulate the clash
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
    const cloneEligibleTypes = ['Spatial', 'Mirror', 'Dark'];
    const cloneUsed = action === 'clone' && cloneEligibleTypes.includes(user.magic_type);
    const cloneMpCost = cloneUsed ? 20 : 0;
    const cloneDamageMultiplier = cloneUsed ? 1.5 : 1;
    const crackedDamageMultiplier = crackedActive ? 2 : 1;
    const outgoingDamage = Math.floor(outgoingDamageBase * crackedDamageMultiplier * cloneDamageMultiplier);

    let newHp = Math.max(0, Number(user.hp) - incomingDamage);
    let newMp = Number(user.mp);
    let newEnemyHp = Math.max(0, Number(enemyState.hp) - outgoingDamage);

    // Clone always costs MP for this turn
    newMp = Math.max(0, newMp - cloneMpCost);

    // In cracked state, skills cost HP instead of MP
    if (crackedActive) {
      newHp = Math.max(0, newHp - skillCost);
    } else {
      newMp = Math.max(0, newMp - skillCost);
    }
    
    let isCracked = crackedActive;
    let newMaxMp = user.max_mp;
    let missionComplete = false;
    let rewardYul = 0;
    let rewardMerit = 0;
    let newYul = Number(user.yul) || 0;
    let newMerit = Number(user.merit) || 0;
    let newRank = Number(user.rank) || 1000;

    // THE PENALTY: Grimoire Crack (Option B)
    if (newHp === 0) {
      isCracked = true;
      newMaxMp = Math.floor(user.max_mp * 0.8); // Lose 20% max MP permanently until healed
    }

    // 7. Mission completion: if enemy is defeated, complete active mission and grant rewards
    if (newEnemyHp <= 0) {
      const [activeMissionRows] = await pool.query(
        `
        SELECT am.id, am.mission_id, m.yul_reward, m.merit_reward
        FROM active_missions am
        JOIN missions m ON am.mission_id = m.id
        WHERE am.user_id = ? AND am.status = 'in_progress'
        LIMIT 1
        `,
        [userId]
      );

      if (activeMissionRows.length > 0) {
        const activeMission = activeMissionRows[0];
        rewardYul = Number(activeMission.yul_reward) || 0;
        rewardMerit = Number(activeMission.merit_reward) || 0;
        newYul += rewardYul;
        newMerit += rewardMerit;
        missionComplete = true;

        await pool.query(
          `UPDATE active_missions SET status = 'completed' WHERE id = ?`,
          [activeMission.id]
        );
      }
    }

    // 8. Rank progression: every merit threshold lowers rank number by 100
    const meritThreshold = 100;
    const previousTier = Math.floor((Number(user.merit) || 0) / meritThreshold);
    const currentTier = Math.floor(newMerit / meritThreshold);
    const rankUps = Math.max(0, currentTier - previousTier);
    if (rankUps > 0) {
      newRank = Math.max(100, newRank - (rankUps * 100));
    }

    // 9. Update the Database
    await pool.query(
      `UPDATE users SET hp = ?, mp = ?, max_mp = ?, is_cracked = ?, yul = ?, merit = ?, rank = ? WHERE id = ?`,
      [newHp, newMp, newMaxMp, isCracked, newYul, newMerit, newRank, userId]
    );

    const timestamp = moment().format('MMMM Do YYYY, h:mm:ss a');

    // 10. Send the results back
    res.json({
      success: true,
      narrative: narrativeOnly,
      cloneUsed,
      missionComplete,
      rewards: {
        yul: rewardYul,
        merit: rewardMerit
      },
      playerStats: { hp: newHp, mp: newMp, rank: newRank, merit: newMerit, isCracked },
      enemyStats: { hp: newEnemyHp },
      combatLogTime: timestamp
    });

  } catch (error) {
    console.error("Combat Error:", error);
    res.status(500).json({ error: "Combat system failed to process the turn." });
  }
});

module.exports = router;