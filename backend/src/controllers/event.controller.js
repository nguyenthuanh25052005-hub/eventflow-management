const Event = require("../models/Event");
const EventRequest = require("../models/EventRequest");
const Employee = require("../models/Employee");

const internalRoles = ["ADMIN", "EVENT_MANAGER"];

// GET /api/events
const getEvents = async (req, res) => {
  try {
    const { status, managerId, keyword, dateFrom, dateTo } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (managerId) {
      filter.manager = managerId;
    }

    if (keyword) {
      filter.$or = [
        { eventName: { $regex: keyword, $options: "i" } },
        { location: { $regex: keyword, $options: "i" } },
      ];
    }

    if (dateFrom || dateTo) {
      filter.eventDate = {};

      if (dateFrom) {
        filter.eventDate.$gte = new Date(dateFrom);
      }

      if (dateTo) {
        filter.eventDate.$lte = new Date(dateTo);
      }
    }

    if (req.user.role === "CUSTOMER") {
      filter.customer = req.user._id;
    }

    const events = await Event.find(filter)
      .populate("customer", "fullName email phone")
      .populate("eventType", "name description")
      .populate({
        path: "manager",
        populate: {
          path: "user",
          select: "fullName email phone role",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/events/my
const getMyEvents = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {
      customer: req.user._id,
    };

    if (status) {
      filter.status = status;
    }

    const events = await Event.find(filter)
      .populate("eventType", "name description")
      .populate({
        path: "manager",
        populate: {
          path: "user",
          select: "fullName email phone",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("eventRequest")
      .populate("customer", "fullName email phone role")
      .populate("eventType", "name description")
      .populate({
        path: "manager",
        populate: {
          path: "user",
          select: "fullName email phone role",
        },
      });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const isOwner =
      event.customer._id.toString() === req.user._id.toString();

    if (!isOwner && !internalRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this event",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/events
const createEvent = async (req, res) => {
  try {
    if (!internalRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin or Event Manager can create events",
      });
    }

    const {
      eventRequestId,
      managerId,
      eventName,
      description,
      eventDate,
      location,
      guestCount,
      estimatedBudget,
      notes,
    } = req.body;

    if (!eventRequestId) {
      return res.status(400).json({
        success: false,
        message: "Event request ID is required",
      });
    }

    const eventRequest = await EventRequest.findById(eventRequestId);

    if (!eventRequest) {
      return res.status(404).json({
        success: false,
        message: "Event request not found",
      });
    }

    if (eventRequest.status === "CONVERTED") {
      return res.status(400).json({
        success: false,
        message: "This event request has already been converted",
      });
    }

    const existingEvent = await Event.findOne({
      eventRequest: eventRequestId,
    });

    if (existingEvent) {
      return res.status(400).json({
        success: false,
        message: "Event already exists for this request",
      });
    }

    if (managerId) {
      const manager = await Employee.findById(managerId);

      if (!manager) {
        return res.status(404).json({
          success: false,
          message: "Manager not found",
        });
      }

      if (!["ADMIN", "EVENT_MANAGER"].includes(manager.position)) {
        return res.status(400).json({
          success: false,
          message: "Selected employee is not an Event Manager",
        });
      }
    }

    const event = await Event.create({
      eventRequest: eventRequest._id,
      customer: eventRequest.customer,
      eventType: eventRequest.eventType,
      manager: managerId || null,
      eventName: eventName || eventRequest.title,
      description:
        description !== undefined
          ? description
          : eventRequest.description,
      eventDate: eventDate || eventRequest.expectedDate,
      location: location || eventRequest.location,
      guestCount:
        guestCount !== undefined
          ? guestCount
          : eventRequest.expectedGuests,
      estimatedBudget:
        estimatedBudget !== undefined
          ? estimatedBudget
          : eventRequest.budget,
      notes,
    });

    eventRequest.status = "CONVERTED";
    await eventRequest.save();

    const populatedEvent = await Event.findById(event._id)
      .populate("customer", "fullName email phone")
      .populate("eventType", "name description")
      .populate({
        path: "manager",
        populate: {
          path: "user",
          select: "fullName email phone role",
        },
      });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: populatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT /api/events/:id
const updateEvent = async (req, res) => {
  try {
    if (!internalRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin or Event Manager can update events",
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const allowedFields = [
      "manager",
      "eventName",
      "description",
      "eventDate",
      "location",
      "guestCount",
      "estimatedBudget",
      "status",
      "progress",
      "notes",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    if (
      event.status === "COMPLETED" &&
      req.body.progress === undefined
    ) {
      event.progress = 100;
    }

    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate("customer", "fullName email phone")
      .populate("eventType", "name description")
      .populate({
        path: "manager",
        populate: {
          path: "user",
          select: "fullName email phone role",
        },
      });

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: populatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getEvents,
  getMyEvents,
  getEventById,
  createEvent,
  updateEvent,
};