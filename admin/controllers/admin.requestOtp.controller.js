import crypto from "crypto";
import User from "../../models/user.model.js";
import resend from "../../config/resend.js";

export const requestAdminOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Find admin user
    const admin = await User.findOne({ email, role: "admin" });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Save OTP and expiration (5 minutes)
    admin.otp = otp;
    admin.otpExpiresAt = Date.now() + 5 * 60 * 1000;
    await admin.save();

    // Send OTP email
    await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: admin.email,
      subject: "Your Admin Login OTP",
      html: `<p>Your admin login OTP is <b>${otp}</b>.</p><p>It expires in 5 minutes.</p>`,
    });

    res.json({ message: "OTP sent successfully", status: "success", admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
