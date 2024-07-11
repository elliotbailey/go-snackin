import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();
const db = new Database('users.db', { verbose: console.log });

import { convertCuisineToMapsType } from './tools.js';

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

app.post('/getUserPreferences', (req, res) => {
  const { user_id } = req.body;
  const user = db.prepare('SELECT preferences FROM users WHERE email = ?').get(user_id);
  // convert user preferences to google maps type
  const prefs = JSON.parse(user.preferences).map((pref) => {
    return convertCuisineToMapsType(pref);
  });

  if (user) {
    res.status(200).json({ preferences: prefs });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/submitPreference', (req, res) => {
  const { user_id, place, place_type, preference } = req.body;
  // filter out place types that are irrelevant
  const irrelevants = ['establishment', 'point_of_interest', 'food', 'store'];
  const filtered_place_types = place_type.filter((t) => !irrelevants.includes(t));
  const stmt = db.prepare('INSERT INTO preferences (user_id, place, place_type, preference) VALUES (?, ?, ?, ?)');
  try {
    stmt.run(user_id, place, filtered_place_types.join(','), preference ? 1 : 0);
    res.status(200).json({ message: 'Preference submitted successfully' });
  } catch (error) {
    console.log(error.message)
    res.status(400).json({ error: 'Failed to submit preference' });
  }
});

app.post('/checkPlace', (req, res) => {
  const { user_id, place } = req.body;
  const stmt = db.prepare('SELECT preference FROM preferences WHERE user_id = ? AND place = ? ORDER BY id DESC LIMIT 1');
  const userPlace = stmt.get(user_id, place);
  console.log(userPlace);
  if (userPlace) {
    res.status(200).json({ acceptable: userPlace.preference });
  } else {
    res.status(404).json({ acceptable: true });
  }
});

app.post('/checkMultiplePlaces', (req, res) => {
  const { user_id, places } = req.body;
  const placeholders = places.map(() => '?').join(', ');
  const query = `
    SELECT p.*
    FROM preferences p
    JOIN (
      SELECT place, MAX(id) as max_id
      FROM preferences
      WHERE user_id = ?
        AND place IN (${placeholders})
      GROUP BY place
    ) grouped_p
    ON p.place = grouped_p.place AND p.id = grouped_p.max_id
  `;
  const stmt = db.prepare(query);
  const userPlaces = stmt.all(user_id, ...places);
  const result = userPlaces.map((place) => ({
    place: place.place,
    preference: place.preference == 1,
    types: place.place_type.split(',')
  }));
  res.status(200).json({ result });
});

app.post('/getAllUserPreferences', (req, res) => {
  const { user_id } = req.body;
  const stmt = db.prepare('SELECT place_type, preference FROM preferences WHERE user_id = ?');
  const userPreferences = stmt.all(user_id);
  res.status(200).json({ userPreferences });
});


const PORT = 8001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
