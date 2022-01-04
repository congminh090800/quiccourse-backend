const mongoose = require("mongoose");
const { Schema } = mongoose;

const adminSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      min: 13,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    name: {
      type: String,
      required: true,
      min: 6,
    },
    deleted_flag: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
