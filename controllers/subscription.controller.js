import { getMonnifyToken } from "../config/monnifyAuth.js";
import Subscription from "../models/subscription.model.js";

import axios from "axios";

export const createSubscription = async (req, res, next) => {
  try {
    const {
      name,
      price,
      currency = "NGN",
      frequency = "monthly",
      startDate,
      category,
    } = req.body;

    // 1️⃣ Calculate renewal and reminder dates
    const renewalPeriod = { daily: 1, weekly: 7, monthly: 30, yearly: 365 };
    const renewalDate = new Date(startDate || Date.now());
    renewalDate.setDate(renewalDate.getDate() + renewalPeriod[frequency]);

    const reminderOffsets = [7, 5, 3, 1];
    const reminders = reminderOffsets.map((days) => {
      const d = new Date(renewalDate);
      d.setDate(d.getDate() - days);
      return d;
    });

    // 2️⃣ Generate Monnify transaction reference
    const transactionRef = `SUB_${Date.now()}_${Math.floor(
      Math.random() * 1000
    )}`;

    // 3️⃣ Get Monnify access token
    const token = await getMonnifyToken();

    // 4️⃣ Initialize Monnify transaction
    const response = await axios.post(
      `${process.env.MONNIFY_BASE_URL}/transactions/init-transaction`,
      {
        amount: price,
        customerName: req.user?.name || "Anonymous User",
        customerEmail: req.user?.email || "test@example.com",
        paymentReference: transactionRef,
        paymentDescription: `Purchase of ${name} plan`,
        currencyCode: currency,
        contractCode: process.env.MONNIFY_CONTRACT_CODE,
        redirectUrl: `${process.env.CLIENT_URL}/payment-success`, // your frontend
        paymentMethods: ["CARD", "ACCOUNT_TRANSFER"],
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const monnifyData = response.data.responseBody;

    // 5️⃣ Create subscription (status = pending until payment)
    const subscription = await Subscription.create({
      name,
      price,
      currency,
      frequency,
      category,
      startDate: startDate || Date.now(),
      renewalDate,
      reminders,
      user: req.user._id,
      status: "pending",
      paymentMethod: "monnify",
      paymentReference: transactionRef, // save this for webhook match
    });

    // 6️⃣ Return checkout URL to frontend
    return res.status(200).json({
      success: true,
      message: "Monnify payment initialized successfully",
      checkoutUrl: monnifyData.checkoutUrl,
      transactionRef,
      subscription,
    });
  } catch (error) {
    console.error("Monnify init error:", error.response?.data || error.message);
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
