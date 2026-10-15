const sendOTPEmail = async (email, otp, purpose = "login") => {
  const apiUrl = process.env.MAIL_API_URL;
  const apiSecret = process.env.MAIL_API_SECRET;

  if (!apiUrl || !apiSecret) {
    throw new Error("Google email service settings are missing.");
  }

  if (
    typeof email !== "string" ||
    !email.trim() ||
    !/^\d{6}$/.test(String(otp))
  ) {
    throw new Error("Invalid email address or OTP.");
  }

  if (!["register", "login"].includes(purpose)) {
    throw new Error("Invalid OTP email purpose.");
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: apiSecret,
        email: email.trim().toLowerCase(),
        otp: String(otp),
        purpose,
      }),
      signal: AbortSignal.timeout(30000),
    });

    const result = await response.json();

    if (!response.ok || result.success !== true) {
      console.error("Email API error:", result.message);

      throw new Error(
        result.message || `Email service failed (${response.status})`
      );
    }

    console.log(
      `Connect Event ${purpose} OTP email sent successfully.`
    );

    return result;
  } catch (error) {
    console.error("Connect Event OTP email error:", error.message);
    throw error;
  }
};

export default sendOTPEmail;