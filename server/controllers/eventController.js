
import Event from "../models/Event.js";
import cloudinary from "../config/cloudinary.js";

// Get the current date in Indian Standard Time.
const getIndiaDateKey = (date = new Date()) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

// Validate event date (HTML date input: YYYY-MM-DD).
const validateEventDate = (dateValue) => {
  if (
    typeof dateValue !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)
  ) {
    return {
      valid: false,
      message: "Please select a valid event date",
    };
  }

  const [year, month, day] = dateValue.split("-").map(Number);

  // Validate actual calendar date.
  const selectedDate = new Date(Date.UTC(year, month - 1, day));

  if (
    selectedDate.getUTCFullYear() !== year ||
    selectedDate.getUTCMonth() !== month - 1 ||
    selectedDate.getUTCDate() !== day
  ) {
    return {
      valid: false,
      message: "Please select a valid event date",
    };
  }

  // Compare Indian calendar dates to avoid timezone issues.
  const today = getIndiaDateKey();

  if (dateValue < today) {
    return {
      valid: false,
      message:
        "Past dates are not allowed. Please select today or a future date.",
    };
  }

  return {
    valid: true,
    date: new Date(`${dateValue}T00:00:00.000Z`),
  };
};

const isEventRegistrationOpen = (eventDate) => {
  if (!eventDate) return false;

  // Existing behavior: registration remains open until the day before the event.
  return getIndiaDateKey(eventDate) > getIndiaDateKey();
};

// Convert today's Indian calendar date into a UTC date boundary.
const getTodayDateBoundary = () => {
  const todayKey = getIndiaDateKey();
  return new Date(`${todayKey}T00:00:00.000Z`);
};

// CREATE EVENT
export const createEvent = async (req, res) => {
  try {
    // Validate date before uploading banner or creating event.
    const dateValidation = validateEventDate(req.body.date);

    if (!dateValidation.valid) {
      return res.status(400).json({
        message: dateValidation.message,
      });
    }

    let banner = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "events",
      });

      banner = result.secure_url;
    }

    let speakers = [];

    if (req.body.speakers) {
      try {
        speakers =
          typeof req.body.speakers === "string"
            ? JSON.parse(req.body.speakers)
            : req.body.speakers;
      } catch {
        return res.status(400).json({
          message: "Invalid speakers data",
        });
      }
    }

    const event = await Event.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      venue: req.body.venue,
      location: req.body.location,
      date: dateValidation.date,
      time: req.body.time,
      price: req.body.price,
      totalSeats: req.body.totalSeats,
      availableSeats: req.body.totalSeats,
      speakers,
      banner,
      organizer: req.user._id,
    });

    return res.status(201).json(event);
  } catch (error) {
    console.error("Create event error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET PUBLIC EVENTS
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({
      status: "approved",
      date: { $gte: getTodayDateBoundary() },
    })
      .populate("organizer", "name email profession")
      .sort({ createdAt: -1 });

    const activeEvents = events.filter((event) =>
      isEventRegistrationOpen(event.date)
    );

    return res.json(activeEvents);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET EVENT BY ID
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      status: "approved",
    }).populate("organizer", "name email profession");

    if (!event || !isEventRegistrationOpen(event.date)) {
      return res.status(404).json({
        message: "This event is no longer available.",
      });
    }

    return res.json(event);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE EVENT
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not allowed",
      });
    }

    // Validate date only when a new date is submitted.
    let updatedDate = event.date;

    if (req.body.date !== undefined) {
      const dateValidation = validateEventDate(req.body.date);

      if (!dateValidation.valid) {
        return res.status(400).json({
          message: dateValidation.message,
        });
      }

      updatedDate = dateValidation.date;
    }

    let speakers = event.speakers;

    if (req.body.speakers) {
      try {
        speakers =
          typeof req.body.speakers === "string"
            ? JSON.parse(req.body.speakers)
            : req.body.speakers;
      } catch {
        return res.status(400).json({
          message: "Invalid speakers data",
        });
      }
    }

    let banner = event.banner;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "events",
      });

      banner = result.secure_url;
    }

    event.title = req.body.title || event.title;
    event.description = req.body.description || event.description;
    event.category = req.body.category || event.category;
    event.venue = req.body.venue || event.venue;
    event.location = req.body.location || event.location;
    event.date = updatedDate;
    event.time = req.body.time || event.time;
    event.price = req.body.price ?? event.price;
    event.totalSeats = req.body.totalSeats || event.totalSeats;
    event.availableSeats =
      req.body.availableSeats ?? event.availableSeats;
    event.speakers = speakers;
    event.banner = banner;

    const updatedEvent = await event.save();

    return res.json(updatedEvent);
  } catch (error) {
    console.error("Update event error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE EVENT
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not allowed",
      });
    }

    await event.deleteOne();

    return res.json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// ORGANIZER DASHBOARD
export const getMyOrganizerEvents = async (req, res) => {
  try {
    const events = await Event.find({
      organizer: req.user._id,
    }).sort({ createdAt: -1 });

    return res.json(events);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
