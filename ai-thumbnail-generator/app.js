require('dotenv').config();

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');

const authRoutes = require('./routes/auth');
const thumbnailRoutes = require('./routes/thumbnails');

const app = express();
const PORT = process.env.PORT || 3000;

require('./config/passport')(passport);

// Connect Mongoose before serving requests so database-backed routes are ready.
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Make user and flash data available to every EJS template.
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.successMessages = req.flash('success');
  res.locals.errorMessages = req.flash('error');
  next();
});

app.use('/', authRoutes);
app.use('/', thumbnailRoutes);

app.use((req, res) => {
  res.status(404).render('index');
});

app.listen(PORT, () => {
  console.log(`AI Thumbnail Generator running on http://localhost:${PORT}`);
});
