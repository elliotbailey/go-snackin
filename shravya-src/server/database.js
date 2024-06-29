const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const db = new Database('users.db', { verbose: console.log });

app.use(bodyParser.json());
app.use(cors());

// Create users table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )
`).run();

// Signup route
app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  const stmt = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');

  try {
    stmt.run(username, email, password);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const stmt = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?');
  const user = stmt.get(email, password);

  if (user) {
    res.status(200).json({ message: 'Login successful', user });
  } else {
    res.status(400).json({ error: 'Invalid email or password' });
  }
});

const PORT = 8001;
const HOST = '0.0.0.0'; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
