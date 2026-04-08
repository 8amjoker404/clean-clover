// routes/exam.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { getExamPrompt } = require('../utils/prompts');
const { generateAIResponse } = require('../services/llm');
const moment = require('moment');

const TRIAL3_FALLBACK = {
  playerDamageTaken: 10,
  playerMpUsed: 15,
  grade: 'C',
  rivalStatus: 'defeated'
};

const clampNonNegative = (value) => Math.max(0, Number(value) || 0);

const fallbackDefensiveSpellName = (magicType) => {
  const base = (magicType || 'Arcane').toString().trim();
  return `${base} Guard`;
};

const splitNarrativeAndJson = (text) => {
  const raw = typeof text === 'string' ? text : '';
  const jsonMatch = raw.match(/```json\s*([\s\S]*?)\s*```/i);
  const jsonText = jsonMatch && jsonMatch[1] ? jsonMatch[1].trim() : '';
  const narrative = raw.replace(/```json\s*[\s\S]*?\s*```/i, '').trim();

  return {
    narrative: narrative || raw,
    jsonText
  };
};

const parseExamJson = (jsonText) => {
  if (!jsonText) return { ok: false, data: {} };

  try {
    const parsed = JSON.parse(jsonText);
    return {
      ok: true,
      data: {
        playerDamageTaken: clampNonNegative(parsed.playerDamageTaken),
        playerMpUsed: clampNonNegative(parsed.playerMpUsed),
        grade: ['A', 'B', 'C'].includes(parsed.grade) ? parsed.grade : '',
        newSpell: typeof parsed.newSpell === 'string' ? parsed.newSpell.trim() : '',
        rivalStatus: typeof parsed.rivalStatus === 'string' ? parsed.rivalStatus.trim() : ''
      }
    };
  } catch (error) {
    return { ok: false, data: {} };
  }
};

const getAvailableSquadsForGrade = (grade) => {
  if (grade === 'A') return [1, 2, 3, 4, 5, 6, 7, 8, 9];
  if (grade === 'B') return [3, 4, 6, 8];
  return [3];
};

const ensureSpellForUser = async (userId, spellName, mpCost = 20, spellType = 'defensive') => {
  if (!spellName) return false;
  const normalizedSpell = spellName.trim();
  if (!normalizedSpell) return false;

  const [grimoireRows] = await pool.query(
    'SELECT id FROM grimoires WHERE user_id = ? LIMIT 1',
    [userId]
  );
  if (grimoireRows.length === 0) return false;

  const grimoireId = grimoireRows[0].id;

  const [existing] = await pool.query(
    'SELECT id FROM spells WHERE grimoire_id = ? AND name = ? LIMIT 1',
    [grimoireId, normalizedSpell]
  );
  if (existing.length > 0) return false;

  await pool.query(
    'INSERT INTO spells (grimoire_id, name, mp_cost, spell_type) VALUES (?, ?, ?, ?)',
    [grimoireId, normalizedSpell, mpCost, spellType]
  );
  return true;
};

router.get('/', async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(`
      SELECT u.*, g.magic_type 
      FROM users u 
      LEFT JOIN grimoires g ON u.id = g.user_id 
      WHERE u.id = ?
    `, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = rows[0];
    const stage = Number(user.tutorial_stage) || 1;

    if (stage === 999) {
      const [resultRows] = await pool.query(
        `SELECT grade, available_squads
         FROM exam_results
         WHERE user_id = ?
         LIMIT 1`,
        [userId]
      );
      const examResult = resultRows[0] || null;

      return res.json({
        success: true,
        stage: 999,
        stageTitle: "Exam Complete",
        grade: examResult ? examResult.grade : null,
        availableSquads: JSON.parse((examResult && examResult.available_squads) || "[]"),
        message: "The captains have made their decision.",
        currentHp: user.hp,
        currentMp: user.mp
      });
    }

    // 🧠 Build scene-only prompt (no action)
    const prompt = getExamPrompt(user, null); // action = null means "describe scene"

    const aiData = await generateAIResponse(prompt);
    const aiText = aiData.text || '';
    const split = splitNarrativeAndJson(aiText);

    let stageTitle = '';
    let stageDescription = '';

    if (stage === 1) {
      stageTitle = "Trial 1: The Dummy";
      stageDescription = "Target practice. Show your magic.";
    } else if (stage === 2) {
      stageTitle = "Trial 2: Survival";
      stageDescription = "Defend yourself against incoming attacks.";
    } else if (stage === 3) {
      stageTitle = "Trial 3: The Duel";
      stageDescription = "Defeat your rival.";
    } else if (stage === 999) {
      stageTitle = "Exam Complete";
      stageDescription = "Captains await your choice.";
    }

    res.json({
      success: true,
      stage,
      stageTitle,
      stageDescription,
      narrative: split.narrative || aiText,
      currentHp: user.hp,
      currentMp: user.mp
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Exam scene error" });
  }
});

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

    const stage = Number(user.tutorial_stage) || 1;
    if (stage === 999) {
      return res.json({
        success: false,
        message: "Exam complete. Choose your squad.",
        nextStep: "select_squad"
      });
    }

    if (!action || typeof action !== 'string') {
      return res.status(400).json({ error: 'Action is required.' });
    }

    const [historyRows] = await pool.query(
      `SELECT action, narrative, stage
       FROM exam_history
       WHERE user_id = ?
       ORDER BY id DESC
       LIMIT 3`,
      [userId]
    );
    const recentHistory = historyRows.reverse();

    const [spellRows] = await pool.query(
      `SELECT s.id
       FROM spells s
       JOIN grimoires g ON s.grimoire_id = g.id
       WHERE g.user_id = ? AND s.spell_type = 'defensive'
       LIMIT 1`,
      [userId]
    );
    const hasUnlockedSpell = spellRows.length > 0;

    const prompt = getExamPrompt(user, action, {
      stage,
      hasUnlockedSpell,
      history: recentHistory
    });
    const aiData = await generateAIResponse(prompt);
    const aiText = aiData.text || '';
    const split = splitNarrativeAndJson(aiText);
    const parsed = parseExamJson(split.jsonText);
    const data = parsed.data || {};
    let nextStage = stage;
    let availableSquads = [];
    let unlockedSpell = '';
    let grade = '';
    let rivalStatus = '';
    let hpDamage = 0;
    let mpUsed = 0;
    let newHp = clampNonNegative(user.hp);
    let newMp = clampNonNegative(user.mp);

    if (stage === 1) {
      mpUsed = 10;
      newMp = clampNonNegative(newMp - mpUsed);
      nextStage = 2;

      await pool.query(
        `UPDATE users SET tutorial_stage = ?, mp = ? WHERE id = ?`,
        [nextStage, newMp, userId]
      );
    } else if (stage === 2) {
      mpUsed = parsed.ok ? clampNonNegative(data.playerMpUsed) : 12;
      mpUsed = Math.min(mpUsed, newMp);
      newMp = clampNonNegative(newMp - mpUsed);
      nextStage = 3;

      await pool.query(
        `UPDATE users SET tutorial_stage = ?, mp = ? WHERE id = ?`,
        [nextStage, newMp, userId]
      );

      unlockedSpell = data.newSpell || fallbackDefensiveSpellName(user.magic_type);
      await ensureSpellForUser(userId, unlockedSpell, 20, 'defensive');
    } else if (stage === 3) {
      const duelData = parsed.ok
        ? {
            playerDamageTaken: clampNonNegative(data.playerDamageTaken),
            playerMpUsed: clampNonNegative(data.playerMpUsed),
            grade: ['A', 'B', 'C'].includes(data.grade) ? data.grade : 'C',
            rivalStatus: data.rivalStatus || 'defeated'
          }
        : TRIAL3_FALLBACK;

      hpDamage = duelData.playerDamageTaken;
      mpUsed = Math.min(duelData.playerMpUsed, newMp);
      newHp = clampNonNegative(newHp - hpDamage);
      newMp = clampNonNegative(newMp - mpUsed);
      grade = duelData.grade;
      rivalStatus = duelData.rivalStatus || 'defeated';
      availableSquads = getAvailableSquadsForGrade(grade);

      nextStage = 999;
      await pool.query(
        `UPDATE users
         SET tutorial_stage = ?, hp = ?, mp = ?
         WHERE id = ?`,
        [nextStage, newHp, newMp, userId]
      );

      await pool.query(
        `INSERT INTO exam_results (user_id, grade, available_squads)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           grade = VALUES(grade),
           available_squads = VALUES(available_squads)`,
        [userId, grade, JSON.stringify(availableSquads)]
      );
    } else {
      await pool.query(
        `UPDATE users SET mp = ? WHERE id = ?`,
        [newMp, userId]
      );
    }

    const timestamp = moment().format('MMMM Do YYYY, h:mm:ss a');
    console.log(`[Exam Log] Wizard ${user.username} took an action at: ${timestamp}`);

    await pool.query(
      `INSERT INTO exam_history (user_id, stage, action, narrative)
       VALUES (?, ?, ?, ?)`,
      [userId, stage, action, split.narrative || aiText]
    );

    res.json({
      success: aiData.success,
      narrative: split.narrative || aiText,
      unlockedSpell,
      grade,
      availableSquads,
      rivalStatus,
      currentMp: newMp,
      currentHp: newHp,
      nextStage,
      actionTime: timestamp
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Exam system error" });
  }
});

module.exports = router;