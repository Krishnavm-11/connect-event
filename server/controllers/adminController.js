import User from "../models/User.js";
import Event from "../models/Event.js";
import Notification from "../models/Notification.js";
import Registration from "../models/Registration.js";

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalOrganizers = await User.countDocuments({
      role: "organizer",
    });
    const totalEvents = await Event.countDocuments();
    const pendingEvents = await Event.countDocuments({
      status: "pending",
    });
    const approvedEvents = await Event.countDocuments({
      status: "approved",
    });

    return res.json({
      totalUsers,
      totalOrganizers,
      totalEvents,
      pendingEvents,
      approvedEvents,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("organizer", "name email profession")
      .sort({ createdAt: -1 });

    return res.json(events);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const approveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (event.status !== "pending") {
      return res.status(400).json({
        message: `This event is already ${event.status} and cannot be approved again.`,
      });
    }

    event.status = "approved";
    await event.save();

    await Notification.create({
      user: event.organizer,
      title: "Event Approved",
      message: `${event.title} has been approved by admin.`,
    });

    return res.json({
      message: "Event approved successfully",
      event,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const rejectEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (event.status !== "pending") {
      return res.status(400).json({
        message:
          event.status === "approved"
            ? "This event has already been approved and cannot be rejected."
            : "This event has already been rejected.",
      });
    }

    event.status = "rejected";
    await event.save();

    await Notification.create({
      user: event.organizer,
      title: "Event Rejected",
      message: `${event.title} has been rejected by admin.`,
    });

    return res.json({
      message: "Event rejected successfully",
      event,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllUsersAdmin = async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.json(users);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllOrganizersAdmin = async (req, res) => {
  try {
    const organizers = await User.find({ role: "organizer" })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.json(organizers);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const toggleOrganizerStatus = async (req, res) => {
  try {
    const organizer = await User.findById(req.params.id);

    if (!organizer) {
      return res.status(404).json({
        message: "Organizer not found",
      });
    }

    organizer.isBlocked = !organizer.isBlocked;

    await organizer.save();

    return res.json({
      message: organizer.isBlocked
        ? "Organizer blocked successfully"
        : "Organizer unblocked successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllRegistrationsAdmin = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("user", "name email")
      .populate("event", "title category date")
      .sort({ createdAt: -1 });

    return res.json(registrations);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};