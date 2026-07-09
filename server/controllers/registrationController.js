import Registration from "../models/Registration.js";
import Event from "../models/Event.js";
import Notification from "../models/Notification.js";

export const registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (event.status !== "approved") {
      return res.status(400).json({
        message: "Event is not approved",
      });
    }

    const alreadyRegistered = await Registration.findOne({
      user: req.user._id,
      event: eventId,
      status: "registered",
    });

    if (alreadyRegistered) {
      return res.status(400).json({
        message: "You already registered",
      });
    }

    if (event.availableSeats <= 0) {
      return res.status(400).json({
        message: "No seats available",
      });
    }

    const registration = await Registration.create({
      user: req.user._id,
      event: eventId,
      ticketNumber:
        "EVT-" + Date.now(),
    });

    event.availableSeats -= 1;

    await event.save();

    await Notification.create({
      user: req.user._id,
      title: "Registration Successful",
      message: `You registered for ${event.title}`,
    });

    res.status(201).json({
      message: "Registration Successful",
      registration,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findOne({
      user: req.user._id,
      event: req.params.eventId,
      status: "registered",
    });

    if (!registration) {
      return res.status(404).json({
        message: "Registration not found",
      });
    }

    registration.status = "cancelled";

    await registration.save();

    const event = await Event.findById(req.params.eventId);

    event.availableSeats += 1;

    await event.save();

    res.json({
      message: "Registration Cancelled",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMyRegistrations = async (req, res) => {
  try {

    const registrations = await Registration.find({
      user: req.user._id,
      status: "registered",
    })
      .populate("event")
      .sort({ createdAt: -1 });

    res.json(registrations);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getEventAttendees = async (req, res) => {
  try {

    const attendees = await Registration.find({
      event: req.params.eventId,
      status: "registered",
    }).populate(
      "user",
      "name profession profileImage"
    );

    res.json(attendees);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};