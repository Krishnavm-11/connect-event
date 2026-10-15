export const sendOTPEmail = async (email, otp, purpose) => {
  const apiUrl = process.env.MAIL_API_URL;
  const secret = process.env.MAIL_API_SECRET;

  if (!apiUrl || !secret) {
    throw new Error("Missing MAIL_API_URL or MAIL_API_SECRET in Render");
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        email: email.trim().toLowerCase(),
        otp: String(otp),
        purpose,
      }),
      signal: AbortSignal.timeout(60000),
    });

    const result = await response.json();

    if (!response.ok || result.success !== true) {
      throw new Error(result.message || `Email service failed (${response.status})`);
    }

    console.log("OTP email sent successfully");
  } catch (error) {
    console.error("OTP email error:", error.message);
    throw new Error(error.message || "Unable to send verification email");
  }
};