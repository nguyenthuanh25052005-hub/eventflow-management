const EventRequest = require("../models/EventRequest");
const EventType = require("../models/EventType");

// GET /api/event-requests
const getEventRequests = async (req, res) => {
  try {
    const { status, eventTypeId, keyword } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (eventTypeId) {
      filter.eventType = eventTypeId;
    }

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { location: { $regex: keyword, $options: "i" } },
      ];
    }

    const eventRequests = await EventRequest.find(filter)
      .populate("customer", "fullName email phone")
      .populate("eventType", "name description status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: eventRequests.length,
      data: eventRequests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/event-requests/my
const getMyEventRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {
      customer: req.user._id,
    };

    if (status) {
      filter.status = status;
    }

    const eventRequests = await EventRequest.find(filter)
      .populate("eventType", "name description status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: eventRequests.length,
      data: eventRequests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/event-requests/:id
const getEventRequestById = async (req, res) => {
  try {
    const eventRequest = await EventRequest.findById(req.params.id)
      .populate("customer", "fullName email phone role")
      .populate("eventType", "name description status");

    if (!eventRequest) {
      return res.status(404).json({
        success: false,
        message: "Event request not found",
      });
    }

    const isOwner =
      eventRequest.customer._id.toString() === req.user._id.toString();

    const internalRoles = ["ADMIN", "EVENT_MANAGER"];

    if (!isOwner && !internalRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this event request",
      });
    }

    res.status(200).json({
      success: true,
      data: eventRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/event-requests
const createEventRequest = async (req, res) => {
  try {
    const {
      eventTypeId,
      title,
      description,
      expectedDate,
      expectedGuests,
      budget,
      location,
    } = req.body;

    if (!eventTypeId || !title || !expectedDate || !location) {
      return res.status(400).json({
        success: false,
        message: "Event type, title, expected date and location are required",
      });
    }

    const eventType = await EventType.findById(eventTypeId);

    if (!eventType) {
      return res.status(404).json({
        success: false,
        message: "Event type not found",
      });
    }

    if (new Date(expectedDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Expected date must be in the future",
      });
    }

    if (expectedGuests !== undefined && Number(expectedGuests) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Expected guests must be greater than 0",
      });
    }

    if (budget !== undefined && Number(budget) < 0) {
      return res.status(400).json({
        success: false,
        message: "Budget must be greater than or equal to 0",
      });
    }

    const eventRequest = await EventRequest.create({
      customer: req.user._id,
      eventType: eventTypeId,
      title,
      description,
      expectedDate,
      expectedGuests,
      budget,
      location,
    });

    const populatedEventRequest = await EventRequest.findById(eventRequest._id)
      .populate("customer", "fullName email phone")
      .populate("eventType", "name description status");

    res.status(201).json({
      success: true,
      message: "Event request created successfully",
      data: populatedEventRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT /api/event-requests/:id/status
const updateEventRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event request status",
      });
    }

    const eventRequest = await EventRequest.findById(req.params.id);

    if (!eventRequest) {
      return res.status(404).json({
        success: false,
        message: "Event request not found",
      });
    }

    eventRequest.status = status;
    await eventRequest.save();

    const populatedEventRequest = await EventRequest.findById(eventRequest._id)
      .populate("customer", "fullName email phone")
      .populate("eventType", "name description status");

    res.status(200).json({
      success: true,
      message: "Event request status updated successfully",
      data: populatedEventRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getEventRequests,
  getMyEventRequests,
  getEventRequestById,
  createEventRequest,
  updateEventRequestStatus,
};
