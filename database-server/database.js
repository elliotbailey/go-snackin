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

db.prepare(`
  CREATE TABLE IF NOT EXISTS preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    place TEXT,
    place_type TEXT,
    preference BOOLEAN
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

app.post('/submitPreference', (req, res) => {
  const { user_id, place, place_type, preference } = req.body;
  const stmt = db.prepare('INSERT INTO preferences (user_id, place, place_type, preference) VALUES (?, ?, ?, ?)');
  try {
    stmt.run(user_id, place, place_type.toString(), preference ? 1 : 0);
    res.status(201).json({ message: 'Preference submitted successfully' });
  } catch (error) {
    console.log(error.message)
    res.status(400).json({ error: 'Failed to submit preference' });
  }
});

app.post('/checkPlaceForUser', (req, res) => {
  const { user_id, place } = req.body;
  const stmt = db.prepare('SELECT * FROM preferences WHERE user_id = ? AND place = ?');
  const userPlace = stmt.get(user_id, place);
  if (userPlace) {
    res.status(200).json({ acceptable: userPlace.preference });
  } else {
    res.status(404).json({ acceptable: true });
  }
});

app.post('/checkMultiplePlaces', (req, res) => {
  const { user_id, places } = req.body;
  const stmt = db.prepare('SELECT * FROM preferences WHERE user_id = ? AND place = ?');
  const results = places.map((place) => {
    const userPlace = stmt.get(user_id, place);
    return { place, acceptable: userPlace ? userPlace.preference : true };
  });
  res.status(200).json(results);
});


const PORT = 8001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
