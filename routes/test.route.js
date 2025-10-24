import express from "express";
import resend from "../config/resend.js";

const semdMailRouter = express.Router();

semdMailRouter.get("/", async (req, res) => {
  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: "elhassanehussaine@gmail.com",
      subject: "Hello from Resend",
      html: "<p>This is a test email via Resend API 🎉</p>",
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default semdMailRouter;
