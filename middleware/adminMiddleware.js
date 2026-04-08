const pool = require('../config/db');

const isAdmin = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0 || rows[0].role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "Only the Wizard King can post missions."
      });
    }

    next();
  } catch (error) {
    console.error('Admin Middleware Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authorization failed.'
    });
  }
};

module.exports = isAdmin;
