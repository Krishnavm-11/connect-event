import Message from "../models/Message.js";

export const getEventMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      event: req.params.eventId,
    })
      .populate("sender", "name email profession profileImage")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};