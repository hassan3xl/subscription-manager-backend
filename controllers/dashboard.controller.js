// controllers/dashboardController.js
import mongoose from "mongoose";
import Subscription from "../models/subscription.model.js";

export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User not found.",
      });
    }

    // ✅ Fetch subscriptions for this user with product + category populated
    const subscriptions = await Subscription.find({ user: userId })
      .populate({
        path: "product",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    const totalSubscriptions = subscriptions.length;

    // ✅ Status breakdown
    const activeCount = subscriptions.filter(
      (s) => s.status === "active"
    ).length;
    const cancelledCount = subscriptions.filter(
      (s) => s.status === "cancelled"
    ).length;
    const expiredCount = subscriptions.filter(
      (s) => s.status === "expired"
    ).length;

    // ✅ Total amount spent (based on priceAtSubscription)
    const totalSpent = subscriptions.reduce(
      (sum, s) => sum + (s.priceAtSubscription || s.product?.price || 0),
      0
    );

    // ✅ Upcoming renewals (for next 5)
    const upcomingRenewals = subscriptions
      .filter((s) => s.renewalDate && new Date(s.renewalDate) > new Date())
      .sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate))
      .slice(0, 5);

    // ✅ Category breakdown using aggregation (based on product.category)
    const categoryStats = await Subscription.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productData",
        },
      },
      { $unwind: "$productData" },
      {
        $lookup: {
          from: "categories",
          localField: "productData.category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      { $unwind: "$categoryData" },
      {
        $group: {
          _id: "$categoryData.name",
          count: { $sum: 1 },
          totalSpent: { $sum: "$priceAtSubscription" },
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

    // ✅ Return complete data
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
