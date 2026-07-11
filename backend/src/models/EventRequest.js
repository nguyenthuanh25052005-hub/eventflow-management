const mongoose = require("mongoose");

const eventRequestSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    eventType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventType",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    expectedDate: {
      type: Date,
      required: true,
    },

    expectedGuests: {
      type: Number,
      default: 0,
    },

    budget: {
      type: Number,
      default: 0,
    },

    location: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["PENDING", "CONSULTING", "REJECTED", "CONVERTED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("EventRequest", eventRequestSchema);
