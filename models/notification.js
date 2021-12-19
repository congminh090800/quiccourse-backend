const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    seen: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      required: true,
    },
    extendedData: {
      type: Schema.Types.Mixed,
      default: {},
    },
    deleted_flag: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = {
  notificationSchema,
};
