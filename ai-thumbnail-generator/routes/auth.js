const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/User');
const isAuthenticated = require('../middleware/isAuthenticated');

const router = express.Router();
const saltRounds = 10;

// Landing page with basic project overview and auth links.
router.get('/', (req, res) => {
  res.render('index');
});

// Show the registration form unless the user is already signed in.
router.get('/register', (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/generate');
  res.render('register');
});

// Create a new user using a bcrypt password hash, then send them to login.
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      req.flash('error', 'Please fill in all fields.');
      return res.redirect('/register');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      req.flash('error', 'An account with that email already exists.');
      return res.redirect('/register');
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);
    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash
    });

    req.flash('success', 'Registration successful. Please log in.');
    res.redirect('/login');
  } catch (error) {
    console.error('Registration failed:', error);
    req.flash('error', 'Registration failed. Please try again.');
    res.redirect('/register');
  }
});

// Show the login form unless the user is already signed in.
router.get('/login', (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/generate');
  res.render('login');
});

// Authenticate with Passport local strategy and redirect by outcome.
router.post('/login', passport.authenticate('local', {
  successRedirect: '/generate',
  failureRedirect: '/login',
  failureFlash: true
}));

// Destroy the session on logout and clear the session cookie.
router.get('/logout', isAuthenticated, (req, res, next) => {
  req.logout((error) => {
    if (error) return next(error);

    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/login');
    });
  });
});

module.exports = router;
