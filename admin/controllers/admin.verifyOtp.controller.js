import jwt from "jsonwebtoken";
import User from "../../models/user.model.js";

export const verifyAdminOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const admin = await User.findOne({ email, role: "admin" });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (!admin.otp || admin.otp !== otp || Date.now() > admin.otpExpiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP
    admin.otp = null;
    admin.otpExpiresAt = null;
    await admin.save();

    // Generate JWT
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Admin logged in successfully",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
