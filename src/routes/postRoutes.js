import {pool} from '../db.js';
import express from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';
import { PORT,SECRET_KEY } from '../config.js';



/////CREATE USER

router.post('/create-user', async (req, res) => {
  const { username, password, nationalid, country, lastname, email } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Must provide email and password' });
  }

  try {
    // Check if the username or email already exists
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Insert a new user into the 'users' table
    const result = await pool.query(
      'INSERT INTO users (username, password, nationalid, country, lastname, email) VALUES (?, ?, ?, ?, ?, ?)',
      [username, password, nationalid, country, lastname, email]
    );

    return res.json({ message: 'User created successfully', userId: result[0].insertId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'There has been an error creating user' });
  }
});


/////////// LOGIN

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check credentials
  const [user] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);

  if (user.length === 1) {
    // User authenticated
    const token = jwt.sign({ user: user[0].id }, SECRET_KEY, { expiresIn: '1h' }); // Generate a JWT token with a duration of 1 hour
    res.json({ token,  userData: user[0] });
  } else {
    res.status(401).json({ error: 'Incorrect credentials' });
  }
});


///////////////// CREATE EVENT

router.post('/create-event', async (req, res) => {
  const {
    user_id,
    event_name,
    isRecurrent,
    isActive,
    isPaid,
    peoplenumber,
    description,
    lat,
    lng,
  } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1]; // Get token from Authorization header

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.user;

    if (user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized: Invalid user' });
    }

    // Insert new event into the 'events' table
    const result = await pool.query(
      'INSERT INTO events (user_id, event_name, isRecurrent, isActive, isPaid, peoplenumber, description, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, event_name, isRecurrent, isActive, isPaid, peoplenumber, description, lat, lng]
    );

    return res.json({ message: 'Event created successfully', eventId: result[0].insertId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'There has been an error creating event' });
  }
});


export default router; 