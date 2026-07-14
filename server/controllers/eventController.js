import Event from "../models/Event.js";
import cloudinary from "../config/cloudinary.js";

export const createEvent = async (req, res) => {
  try {
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
      } catch (error) {
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

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({
      status: "approved",
    })
      .populate("organizer", "name email profession")
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "name email profession"
    );

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({
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
      } catch (error) {
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

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({
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

    res.json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMyOrganizerEvents = async (req, res) => {
  try {
    const events = await Event.find({
      organizer: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};