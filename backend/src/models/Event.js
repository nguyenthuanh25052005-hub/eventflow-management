const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    eventRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventRequest",
      required: true,
      unique: true,
    },

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

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    eventName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    eventDate: {
      type: Date,
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    guestCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    estimatedBudget: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "PLANNING",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING",
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event; 