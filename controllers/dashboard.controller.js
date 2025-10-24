import mongoose from "mongoose";
import Subscription from "../models/subscription.model.js";

/**
 * USER DASHBOARD
 * GET /api/v1/dashboard/user
 */
export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User not found.",
      });
    }

    // Fetch all subscriptions for this user
    const subscriptions = await Subscription.find({ user: userId }).sort({
      createdAt: -1,
    });

    const totalSubscriptions = subscriptions.length;

    const activeCount = subscriptions.filter(
      (s) => s.status === "active"
    ).length;
    const cancelledCount = subscriptions.filter(
      (s) => s.status === "cancelled"
    ).length;
    const expiredCount = subscriptions.filter(
      (s) => s.status === "expired"
    ).length;

    // Total amount the user is spending
    const totalSpent = subscriptions.reduce(
      (sum, s) => sum + (s.price || 0),
      0
    );

    // Upcoming renewals
    const upcomingRenewals = subscriptions
      .filter((s) => new Date(s.renewalDate) > new Date())
      .sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate))
      .slice(0, 5);

    // Category breakdown (for charts)
    const categoryStats = await Subscription.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalSpent: { $sum: "$price" },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1,
          totalSpent: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "User dashboard stats fetched successfully",
      stats: {
        totalSubscriptions,
        activeCount,
        cancelledCount,
        expiredCount,
        totalSpent,
        categoryStats,
        upcomingRenewals,
      },
      subscriptions,
    });
  } catch (error) {
    console.error("User dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user dashboard data",
      error: error.message,
    });
  }
};
