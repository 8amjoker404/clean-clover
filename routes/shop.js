const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/items', async (req, res) => {
  try {
    const [items] = await pool.query('SELECT * FROM items ORDER BY id ASC');
    return res.json({
      success: true,
      items
    });
  } catch (error) {
    console.error('Shop Items Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to load shop items.'
    });
  }
});

router.post('/buy', async (req, res) => {
  const userId = req.user.id;
  const itemId = Number(req.body.itemId);

  if (!Number.isInteger(itemId) || itemId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid itemId.'
    });
  }

  try {
    const [itemRows] = await pool.query(
      'SELECT id, name, price FROM items WHERE id = ? LIMIT 1',
      [itemId]
    );
    if (itemRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Item not found.'
      });
    }
    const item = itemRows[0];

    const [userRows] = await pool.query(
      'SELECT yul FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found.'
      });
    }
    const currentYul = Number(userRows[0].yul) || 0;

    if (currentYul < Number(item.price)) {
      return res.status(400).json({
        success: false,
        error: 'Not enough Yul.'
      });
    }

    const newYul = currentYul - Number(item.price);
    await pool.query('UPDATE users SET yul = ? WHERE id = ?', [newYul, userId]);

    const [invRows] = await pool.query(
      'SELECT id, quantity FROM inventory WHERE user_id = ? AND item_id = ? LIMIT 1',
      [userId, itemId]
    );

    if (invRows.length > 0) {
      await pool.query(
        'UPDATE inventory SET quantity = quantity + 1 WHERE id = ?',
        [invRows[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO inventory (user_id, item_id, quantity) VALUES (?, ?, 1)',
        [userId, itemId]
      );
    }

    return res.json({
      success: true,
      message: 'Item purchased successfully.',
      yul: newYul
    });
  } catch (error) {
    console.error('Shop Buy Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to buy item.'
    });
  }
});

router.post('/use', async (req, res) => {
  const userId = req.user.id;
  const itemId = Number(req.body.itemId);

  if (!Number.isInteger(itemId) || itemId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid itemId.'
    });
  }

  try {
    const [itemRows] = await pool.query(
      'SELECT id, name, type, effect_value FROM items WHERE id = ? LIMIT 1',
      [itemId]
    );
    if (itemRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Item not found.'
      });
    }
    const item = itemRows[0];

    const [invRows] = await pool.query(
      'SELECT id, quantity FROM inventory WHERE user_id = ? AND item_id = ? LIMIT 1',
      [userId, itemId]
    );
    if (invRows.length === 0 || Number(invRows[0].quantity) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Item not in inventory.'
      });
    }

    const [userRows] = await pool.query(
      'SELECT hp, max_hp, mp, max_mp FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found.'
      });
    }
    const user = userRows[0];

    let newHp = Number(user.hp) || 0;
    let newMp = Number(user.mp) || 0;
    const maxHp = Number(user.max_hp) || 100;
    const maxMp = Number(user.max_mp) || 100;
    const effectValue = Number(item.effect_value) || 0;

    if (item.type === 'potion') {
      newHp = Math.min(maxHp, newHp + effectValue);
    } else if (item.type === 'mana') {
      newMp = Math.min(maxMp, newMp + effectValue);
    } else {
      return res.status(400).json({
        success: false,
        error: 'This item cannot be used right now.'
      });
    }

    await pool.query(
      'UPDATE users SET hp = ?, mp = ? WHERE id = ?',
      [newHp, newMp, userId]
    );

    await pool.query(
      'UPDATE inventory SET quantity = quantity - 1 WHERE id = ?',
      [invRows[0].id]
    );

    await pool.query(
      'DELETE FROM inventory WHERE id = ? AND quantity <= 0',
      [invRows[0].id]
    );

    return res.json({
      success: true,
      message: `${item.name} used successfully.`,
      stats: {
        hp: newHp,
        mp: newMp,
        max_hp: maxHp,
        max_mp: maxMp
      }
    });
  } catch (error) {
    console.error('Shop Use Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to use item.'
    });
  }
});

module.exports = router;
