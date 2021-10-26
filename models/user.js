const mongoose = require("mongoose");
const { Schema } = mongoose;
const { validatePhone } = require("lib/regex-helpers");

const userSchema = new Schema({
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: true,
    min: 13,
  },
  password: {
    type: String,
    required: true,
    min: 6,
  },
  phone: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
    validate: [validatePhone, "Please fill a valid phone number"],
  },
  name: {
    type: String,
    required: true,
    min: 6,
    max: 100,
  },
  birthDate: { type: Date, default: Date.now },
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  avatar: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deleted_flag: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
