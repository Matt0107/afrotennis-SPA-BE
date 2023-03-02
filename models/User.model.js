const { Schema, model } = require("mongoose");

const gameSchema = new Schema({
  form: {
    type: String,
    enum: ["Blessé", "Fatigué", "Bien", "Excellente forme"],
  },
  surface: { type: String, enum: ["Dur", "Gazon", "Terre-battue", "Tapis"] },
  score: { type: String, required: true },
  win: { type: Boolean, required: true },
});

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    games: [gameSchema],
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
