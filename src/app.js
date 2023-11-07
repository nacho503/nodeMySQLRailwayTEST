import express from 'express';
import {pool} from './db.js';
import { PORT,SECRET_KEY } from './config.js';
import jwt from 'jsonwebtoken';

const app = express();

app.use(express.json());



app.post('/create-user', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Must provide user and password' });
  }

  try {
    //Check if user already exists
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE name = ?', [username]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User name already exists' });
    }

    //Inserts new user in db
    const result = await pool.query('INSERT INTO users (name, password) VALUES (?, ?)', [username, password]);

    return res.json({ message: 'User created succesfully', userId: result[0].insertId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'There has been an error creating user' });
  }
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Check credentials
  const [user] = await pool.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);

  if (user.length === 1) {
    // Usuario autenticado
    const token = jwt.sign({ user: user[0].id }, SECRET_KEY, { expiresIn: '1h' }); // Genera un token JWT con una duración de 1 hora
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Credenciales incorrectas' });
  }
});

app.get('/',async (req,res)=>{
  const [rows] = await pool.query('SELECT * FROM users');
  res.json(rows);
})

app.get('/ping', async (req,res)=>{
  const [result] =await pool.query(`SELECT "hello world" as RESULT`);
  console.log(result[0]);
  res.json(result[0])
})


// Route to create user data
app.post('/create-userdata', async (req, res) => {
  const { user_id, user_name, user_occupation } = req.body;

  if (!user_id || !user_name || !user_occupation) {
    return res.status(400).json({ error: 'Must provide user_id, user_name, and user_occupation' });
  }

  try {
    // Inserts new user data into the 'userdata' table
    const result = await pool.query('INSERT INTO userdata (user_id, user_name, user_occupation) VALUES (?, ?, ?)', [
      user_id,
      user_name,
      user_occupation,
    ]);

    return res.json({ message: 'User data created successfully', user_data_id: result[0].insertId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'There has been an error creating user data' });
  }
});

// Route to get user data from 'userdata' based on the provided 'username'
app.post('/combined-data', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Please provide a username in the query parameters.' });
  }

  try {
    // Perform a SQL JOIN to retrieve data from both tables based on the provided 'username'
    const query = `
      SELECT u.username, ud.user_name, ud.user_occupation
      FROM users AS u
      JOIN userdata AS ud ON u.id = ud.user_id
      WHERE u.username = ?
    `;

    const [rows] = await pool.query(query, [username]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User data not found for the provided username.' });
    }

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT , "0.0.0.0");

//logging, morgan, winston