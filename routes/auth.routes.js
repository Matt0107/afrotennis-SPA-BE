const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");
const User = require("../models/User.model.js");

// Route pour l'inscription d'un utilisateur
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(req.body);
    // Vérifie si un utilisateur avec le même nom d'utilisateur ou la même adresse e-mail existe déjà
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Nom d'utilisateur ou adresse e-mail déjà utilisé." });
    }
    // Vérifie si le mot de passe respecte les critères de sécurité
    const passwordRegex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[a-zA-Z\d!@#$%^&*()_+]{7,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password needs minimum one uppercase, one special case and at least seven characters ",
      });
    }

    // Hashage du mot de passe avant de l'enregistrer dans la base de données
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création d'un nouvel utilisateur avec les informations fournies
    const newUser = new User({ username, email, password: hashedPassword });
    console.log(newUser);
    await newUser.save();

    res.status(201).json({ message: "Compte créé avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la création de votre compte.",
    });
  }
});

// Route pour la connexion d'un utilisateur
router.post(
  "/signin",
  passport.authenticate("local", { failureRedirect: "/signin" }),
  (req, res) => {
    res.status(200).json({ message: "Connexion réussie." });
  }
);
// Définir la route pour la page d'accueil
router.get(
  "/home",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ message: "Welcome to the home page!" });
  }
);

// Route pour la déconnexion d'un utilisateur
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

//Save game played
router.post(
  "/games",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { form, surface, score, result } = req.body;
      const newGame = new Game({
        form,
        surface,
        score,
        result,
        player: req.user._id,
      });
      await newGame.save();
      res.status(201).json({ message: "Partie enregistrée avec succès." });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message:
          "Une erreur est survenue lors de l'enregistrement de la partie.",
      });
    }
  }
);

// Route pour ajouter une partie à la liste de parties de l'utilisateur connecté
router.post(
  "/addgame",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { form, surface, score, win } = req.body;
      const userId = req.user._id;

      // Ajoute la partie à la liste de parties de l'utilisateur
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $push: { games: { form, surface, score, win } } },
        { new: true }
      );

      res
        .status(201)
        .json({ message: "Partie ajoutée avec succès.", user: updatedUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Une erreur est survenue lors de l'ajout de la partie.",
      });
    }
  }
);

module.exports = router;

// router.post("/signup", async (req, res, next) => {
//     try {
//       // code for creating a new user profile
//     } catch (err) {
//       if (err.name === "ValidationError") {
//         // handle validation errors
//         const errors = {};
//         Object.keys(err.errors).forEach((key) => {
//           errors[key] = err.errors[key].message;
//         });
//         return res.status(400).json({ errors });
//       } else if (err.name === "MongoError" && err.code === 11000) {
//         // handle duplicate key error (e.g. email already exists)
//         return res
//           .status(400)
//           .json({ message: "Email address already in use" });
//       } else {
//         // handle other errors
//         return next(err);
//       }
//     }
//   });
