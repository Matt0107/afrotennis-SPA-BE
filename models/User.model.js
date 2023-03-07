const { Schema, model } = require("mongoose");


// game Schema
const gameSchema = new Schema({
  opponent: { type: String, required: true },
  form: {
    type: String,
    enum: ["Injured", "Tired", "I feel good", "Excellent shape"],
  },
  surface: { type: String, enum: ["Hard Court", "Grass", "Clay", "Carpet"] },
  score: { type: String, required: true },
  win: { type: String, required: true },
});
// userprofile
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
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
    dateOfBirth: {
      type: Date,
    },
    plays: {
      type: String,
    },
    backhand: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    games: [gameSchema],
  },
  {
    timestamps: true,
  }
);
userSchema.methods.getAge = function () {
  const birthdate = new Date(this.dateOfBirth);
  const today = new Date();
  const ageInMilliseconds = today - birthdate;
  const ageInYears = Math.floor(ageInMilliseconds / 31557600000); // number of milliseconds in a year
  return ageInYears;
};

const User = model("User", userSchema);

module.exports = User;
