const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User.model.js");
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../middleware/jwt.js");

// Sign up Route
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;
    console.log(req.body);
    // Check if username or email are not already taken
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or Email already taken" });
    }
    // Check if password respects requirements
    const passwordRegex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[a-zA-Z\d!@#$%^&*()_+]{7,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password needs minimum one uppercase, one special case and at least seven characters ",
      });
    }

    // Password hashing before being saved in database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creation of new user with given information
    const newUser = new User({ firstName, lastName, username, email, password: hashedPassword });
    console.log(newUser);
    await newUser.save();

    res.status(201).json({ message: "Account created." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something wrong happened",
    });
  }
});
//Token based Authentication with JWT
router.get("/verify", isAuthenticated, (req, res, next) => {
  // if the token is valid we can access it on : req.payload
  console.log("request payload is: ", req.payload);
  res.status(200).json(req.payload);
});

router.post("/signin", (req, res, next) => {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    res.status(400).json({ message: "Provide email and password" });
    return;
  }
  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        res.status(400).json({ message: "User not found" });
        return;
      }
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);
      if (passwordCorrect) {
        const { _id, firstName, lastName, email, username, games } = foundUser;
        console.log(`found user: ${foundUser}`);
        const payload = { _id, firstName, lastName, email, username, games };
        // create the json web token
        console.log(payload);
        const authToken = jwt.sign(payload, process.env.JWT_SECRET, {
          algorithm: "HS256",
          expiresIn: "1h",
        });
        res.status(200).json({ authToken });
      } else {
        res.status(401).json({ message: "Unable to authenticate" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error" });
    });
});

// Route pour la déconnexion d'un utilisateur
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

//Save game played
router.post("/games", async (req, res) => {
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
    res.status(201).json({ message: "Game saved." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Fault!  Something wrong happened.",
    });
  }
});

// Add games to list of played games of the connected user
router.post("/addgame", async (req, res) => {
  try {
    const { form, surface, score, win } = req.body;
    const userId = req.user._id;

    // Add game to the list of user's games
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { games: { form, surface, score, win } } },
      { new: true }
    );

    res
      .status(201)
      .json({ message: "Game added", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Fault!  Something wrong happened.",
    });
  }
});

module.exports = router;
