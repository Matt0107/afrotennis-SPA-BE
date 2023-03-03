const passport = require("passport");
const HttpStrategy = require("passport-http").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/User.model.js");

passport.use(
  new HttpStrategy(
    {
      usernameField: "email", // Le champ à utiliser pour l'authentification
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });

        // Si l'utilisateur n'existe pas dans la base de données
        if (!user) {
          return done(null, false, {
            message: "Unknown email address or incorrect password",
          });
        }

        // Vérifie si le mot de passe est incorrect
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, {
            message: "Unknown email address or incorrect password",
          });
        }

        // Si tout est ok, retourne l'utilisateur
        return done(null, user);
      } catch (error) {
        console.error(error);
        return done(error);
      }
    }
  )
);

// Serialize et deserialize l'utilisateur pour la session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.error(error);
    done(error);
  }
});
