import express from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';
import {pool} from '../db.js';

//All Get routes are in the following
router.get('/user-data', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Get token from Authorization header

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.user;

    // Fetch user data using the user ID
    const [userData] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

    if (userData.length === 1) {
      res.json(userData[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
});

router.get('/',async (req,res)=>{
  const [rows] = await pool.query('SELECT * FROM users');
  res.json(rows);
})

// GET route to retrieve events
router.get('/events', async (req, res) => {
  try {
    // Fetch all events without authentication
    const [events] = await pool.query('SELECT * FROM events');
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'There has been an error retrieving events' });
  }
});

export default router; 