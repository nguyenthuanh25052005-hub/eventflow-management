const mongoose = require("mongoose");

const eventTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Event type name is required"],
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const EventType = mongoose.model("EventType", eventTypeSchema);

module.exports = EventType; 