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

app.listen(PORT , "0.0.0.0");

//logging, morgan, winston