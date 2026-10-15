
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: Number(process.env.SMTP_PORT || 465) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS?.replace(/\s/g, ""),
  },
});

export const sendOTPEmail = async (email, otp, purpose) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("Email service is not configured");
  }

  const action =
    purpose === "register" ? "complete your registration" : "log in";

  await transporter.sendMail({
    from:
      process.env.EMAIL_FROM ||
      `"Connect Event" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your Connect Event verification code",
    text: `Your verification code is ${otp}. Use it to ${action}. It expires in 5 minutes. If you did not request this code, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:28px;color:#0f172a">
        <h2 style="color:#2563eb">Connect Event</h2>
        <p>Use the verification code below to ${action}.</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:20px;background:#f1f5f9;text-align:center;border-radius:12px">
          ${otp}
        </div>
        <p>This code expires in <strong>5 minutes</strong>.</p>
        <p style="color:#64748b;font-size:13px">If you did not request this code, ignore this email.</p>
      </div>
    `,
  });
};
