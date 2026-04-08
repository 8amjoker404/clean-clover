// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();

// Helper: Roll Grimoire from the Databases
const rollGrimoire = async () => {
  const [rows] = await pool.query('SELECT element_name FROM grimoire_elements');
  
  // Fallback just in case the table is empty
  if (rows.length === 0) return 'Basic'; 
  
  const elements = rows.map(row => row.element_name);
  return elements[Math.floor(Math.random() * elements.length)];
};

// REGISTER
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Username, email, and password are required." });
  }

  try {
    // 1. Check if username OR email already exists
    const [existing] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?', 
      [username, email]
    );
    
    if (existing.length > 0) {
      const conflictMessage = existing[0].email === email 
        ? "Email already registered." 
        : "Username already taken.";
      return res.status(400).json({ error: conflictMessage });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insert new user
    const [userResult] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    const userId = userResult.insertId;

    // 4. Roll and Assign their Grimoire (Now pulls from DB)
    const magicType = await rollGrimoire();
    await pool.query(
      'INSERT INTO grimoires (user_id, magic_type) VALUES (?, ?)',
      [userId, magicType]
    );

    res.status(201).json({ 
      message: `Registered successfully! You rolled a ${magicType} Grimoire.`,
      magicType: magicType 
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Registration failed due to a server error." });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  // We check for 'identifier' (which handles both UI setups), 
  // or fallback to username/email if sent explicitly.
  const identifier = req.body.identifier || req.body.username || req.body.email;
  const { password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: "Username/Email and password are required." });
  }

  try {
    // 1. Find user by matching EITHER username OR email
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?', 
      [identifier, identifier]
    );
    
    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials. User not found." });
    }
    const user = rows[0];

    // 2. Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid credentials. Wrong password." });
    }

    // 3. Create JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({ 
      message: "Login successful",
      token, 
      user: {
        id: user.id, 
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed due to a server error." });
  }
});

module.exports = router;