import Subscription from "../models/subscription.model.js";

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    res.status(201).json({ success: true, data: { subscription } });
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
