const EventType = require("../models/EventType");

// GET /api/event-types
const getEventTypes = async (req, res) => {
  try {
    const { status, keyword } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (keyword) {
      filter.name = {
        $regex: keyword,
        $options: "i",
      };
    }

    const eventTypes = await EventType.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: eventTypes.length,
      data: eventTypes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/event-types/:id
const getEventTypeById = async (req, res) => {
  try {
    const eventType = await EventType.findById(req.params.id);

    if (!eventType) {
      return res.status(404).json({
        success: false,
        message: "Event type not found",
      });
    }

    res.status(200).json({
      success: true,
      data: eventType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/event-types
const createEventType = async (req, res) => {
  try {
    const { name, description, imageUrl, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Event type name is required",
      });
    }

    const existingEventType = await EventType.findOne({
      name: name.trim(),
    });

    if (existingEventType) {
      return res.status(400).json({
        success: false,
        message: "Event type already exists",
      });
    }

    const eventType = await EventType.create({
      name,
      description,
      imageUrl,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Event type created successfully",
      data: eventType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT /api/event-types/:id
const updateEventType = async (req, res) => {
  try {
    const { name, description, imageUrl, status } = req.body;

    const eventType = await EventType.findById(req.params.id);

    if (!eventType) {
      return res.status(404).json({
        success: false,
        message: "Event type not found",
      });
    }

    if (name && name !== eventType.name) {
      const existingEventType = await EventType.findOne({
        name: name.trim(),
        _id: { $ne: eventType._id },
      });

      if (existingEventType) {
        return res.status(400).json({
          success: false,
          message: "Event type already exists",
        });
      }
    }

    if (name !== undefined) eventType.name = name;
    if (description !== undefined) eventType.description = description;
    if (imageUrl !== undefined) eventType.imageUrl = imageUrl;
    if (status !== undefined) eventType.status = status;

    await eventType.save();

    res.status(200).json({
      success: true,
      message: "Event type updated successfully",
      data: eventType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getEventTypes,
  getEventTypeById,
  createEventType,
  updateEventType,
};