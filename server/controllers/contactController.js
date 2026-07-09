import Contact from "../models/Contact.js";

export const sendContactMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                message: "Please fill all fields",
            });
        }

        const contact = await Contact.create({
            name,
            email,
            message,
        });

        res.status(201).json({
            message: "Message sent successfully",
            contact,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const getAllContactMessages = async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const markContactAsRead = async (req, res) => {
    try {
        const message = await Contact.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                message: "Message not found",
            });
        }

        message.isRead = true;
        await message.save();

        res.json({
            message: "Message marked as read",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};