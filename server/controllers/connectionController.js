import Connection from "../models/Connection.js";
import Registration from "../models/Registration.js";
import Notification from "../models/Notification.js";

export const sendConnectionRequest = async (req, res) => {
  try {
    const receiverId = req.params.receiverId;

    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot connect with yourself",
      });
    }

    const existingConnection = await Connection.findOne({
      $or: [
        {
          sender: req.user._id,
          receiver: receiverId,
        },
        {
          sender: receiverId,
          receiver: req.user._id,
        },
      ],
    });

    if (existingConnection) {
      return res.status(400).json({
        message: "Connection already exists",
      });
    }

    const connection = await Connection.create({
      sender: req.user._id,
      receiver: receiverId,
      status: "pending",
    });

    await Notification.create({
      user: receiverId,
      title: "New Connection Request",
      message: `${req.user.name} sent you a connection request.`,
    });

    res.status(201).json({
      message: "Connection request sent",
      connection,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({
        message: "Connection not found",
      });
    }

    if (connection.receiver.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    connection.status = "accepted";

    await connection.save();

    await Notification.create({
      user: connection.sender,
      title: "Connection Accepted",
      message: `${req.user.name} accepted your connection request.`,
    });

    res.json({
      message: "Connection accepted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const rejectConnectionRequest = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({
        message: "Connection not found",
      });
    }

    if (connection.receiver.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    connection.status = "rejected";

    await connection.save();

    res.json({
      message: "Connection rejected",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const requests = await Connection.find({
      receiver: req.user._id,
      status: "pending",
    }).populate("sender", "name profession interests");

    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMyConnections = async (req, res) => {
  try {
    const connections = await Connection.find({
      status: "accepted",
      $or: [
        {
          sender: req.user._id,
        },
        {
          receiver: req.user._id,
        },
      ],
    })
      .populate("sender", "name profession interests")
      .populate("receiver", "name profession interests");

    res.json(connections);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getNetworkingSuggestions = async (req, res) => {
  try {
    const registrations = await Registration.find({
      event: req.params.eventId,
    }).populate("user", "name profession interests");

    const users = registrations
      .map((registration) => registration.user)
      .filter(
        (user) =>
          user &&
          user._id.toString() !== req.user._id.toString()
      );

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};