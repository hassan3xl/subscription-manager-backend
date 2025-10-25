// controllers/monnifyWebhook.controller.js
import Subscription from "../models/subscription.model.js";

export const handleMonnifyWebhook = async (req, res) => {
  try {
    const { paymentReference, paymentStatus, amountPaid } = req.body;

    if (paymentStatus === "PAID") {
      const subscription = await Subscription.findOneAndUpdate(
        { paymentReference },
        { status: "active", isPaid: true },
        { new: true }
      );

      console.log("Payment confirmed:", subscription);
    }

    res.status(200).send("Webhook received");
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(500).send("Error handling webhook");
  }
};
