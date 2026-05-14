const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

module.exports = (passport) => {
  // Local login checks the submitted email and compares the password hash.
  passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email.toLowerCase().trim() });

      if (!user) {
        return done(null, false, { message: 'No account found with that email.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  // Store only the user id in the session cookie.
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Rebuild req.user from the database for authenticated requests.
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};
