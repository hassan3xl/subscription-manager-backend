import Subscription from "../../models/subscription.model.js";

// ✅ Get all subscriptions
export const getSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find();
    res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Get subscription by ID
export const getSubscriptionById = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Update subscription by ID
export const updateSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Subscription.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Delete subscription by ID
export const deleteSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Subscription.findByIdAndDelete(id);

    if (!deleted) {
      const error = new Error("Subscription not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
