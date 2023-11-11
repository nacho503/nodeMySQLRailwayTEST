import express from 'express';
import cors from 'cors';
import {pool} from './db.js';
import { PORT,SECRET_KEY } from './config.js';
import jwt from 'jsonwebtoken';

const app = express();

app.use(express.json());
app.use(cors());



app.post('/create-user', async (req, res) => {
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


app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check credentials
  const [user] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);

  if (user.length === 1) {
    // User authenticated
    const token = jwt.sign({ user: user[0].id }, SECRET_KEY, { expiresIn: '1h' }); // Generate a JWT token with a duration of 1 hour
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Incorrect credentials' });
  }
});

app.get('/',async (req,res)=>{
  const [rows] = await pool.query('SELECT * FROM users');
  res.json(rows);
})



app.listen(PORT , "0.0.0.0");

//logging, morgan, winston