
import Event from "../models/Event.js";
import cloudinary from "../config/cloudinary.js";

// Use the event calendar date in Indian Standard Time.
const getIndiaDateKey = (date = new Date()) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const isEventRegistrationOpen = (eventDate) => {
  if (!eventDate) return false;

  // Registration remains open until the day before the event.
  return getIndiaDateKey(eventDate) > getIndiaDateKey();
};

// Convert today's Indian calendar date into a UTC date boundary.
// This works with event dates saved from HTML date inputs.
const getTodayDateBoundary = () => {
  const todayKey = getIndiaDateKey();
  return new Date(`${todayKey}T00:00:00.000Z`);
};

export const createEvent = async (req, res) => {
  try {
    let banner = "";

    if (req.file) {
      console.log("Uploading event banner:", req.file.originalname);
      console.log("Cloudinary cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
      console.log(
        "Cloudinary API key exists:",
        Boolean(process.env.CLOUDINARY_API_KEY)
      );
      console.log(
        "Cloudinary API secret exists:",
        Boolean(process.env.CLOUDINARY_API_SECRET)
      );

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "events",
        resource_type: "image",
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
      date: req.body.date,
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
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Public event listing: exclude today's and past events.
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({
      status: "approved",
      date: { $gte: getTodayDateBoundary() },
    })
      .populate("organizer", "name email profession")
      .sort({ createdAt: -1 });

    // Additional date check protects against date-boundary differences.
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

// Public event details: do not serve expired events.
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
    event.date = req.body.date || event.date;
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
    return res.status(500).json({
      message: error.message,
    });
  }
};

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

// Organizer dashboard: retain all the organizer's events,
// including past events, for management and reporting.
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
