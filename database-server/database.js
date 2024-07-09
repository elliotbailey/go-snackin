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
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    preferences TEXT DEFAULT NULL
  )
`).run();

// Validate email format
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password length
const validatePassword = (password) => {
  return password.length >= 8;
};

// Signup route
app.post('/signup', (req, res) => {
  const { email, password } = req.body;

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  const stmt = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');

  try {
    stmt.run(email, password);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(400).json({ error: 'Signup failed' });
    }
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

app.post('/user-details', (req, res) => {
  const { email, preferences } = req.body;
  const preferencesString = JSON.stringify(preferences);

  const updateQuery = db.prepare('UPDATE users SET preferences = ? WHERE email = ?');
  try {
    updateQuery.run(preferencesString, email);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update preferences' });
  }
});

// Update the forgot-password endpoint
app.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  // Check if the email exists in the users table
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (user) {
    // Simulate sending a password reset email (replace with actual email sending code)
    res.status(200).json({ message: 'Password reset instructions sent to your email.' });
  } else {
    res.status(404).json({ error: 'Email not found in our records' });
  }
});

const PORT = 8001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
