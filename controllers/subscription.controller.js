import Subscription from "../models/subscription.model.js";

export const createSubscription = async (req, res, next) => {
  try {
    const { startDate, frequency } = req.body;

    // Create a temporary subscription object to get the renewal date calculation logic
    const tempSub = new Subscription({
      ...req.body,
      user: req.user._id,
    });

    // Calculate renewalDate manually to compute reminders correctly
    const renewalPeriod = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      yearly: 365,
    };
    const renewalDate = new Date(startDate || Date.now());
    renewalDate.setDate(
      renewalDate.getDate() + renewalPeriod[frequency || "monthly"]
    );

    // Generate reminder dates: 7, 5, 3, and 1 day before renewal
    const reminderOffsets = [7, 5, 3, 1];
    const reminders = reminderOffsets.map((days) => {
      const d = new Date(renewalDate);
      d.setDate(d.getDate() - days);
      return d;
    });

    // Create subscription in DB
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
      renewalDate,
      reminders,
    });

    res.status(201).json({
      success: true,
      data: { subscription },
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id });
    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionById = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
    }
    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const { id } = req.params; // subscription ID from URL
    const { reason } = req.body; // optional cancel reason

    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Only the owner can cancel
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this subscription",
      });
    }

    // Check if already cancelled or expired
    if (subscription.status !== "active") {
      return res.status(400).json({
        success: false,
        message: `This subscription is already ${subscription.status}`,
      });
    }

    // Perform cancellation
    subscription.status = "cancelled";
    subscription.cancelledAt = new Date();
    if (reason) subscription.cancelReason = reason;

    await subscription.save();

    res.json({
      success: true,
      message: "Subscription cancelled successfully",
      data: { subscription },
    });
  } catch (error) {
    next(error);
  }
};
