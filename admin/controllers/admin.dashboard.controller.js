import mongoose from "mongoose";
import Subscription from "../../models/subscription.model.js";

export const getAdminDashboard = async (req, res) => {
  try {
    // 1️⃣ Overall subscription stats
    const totalSubscriptions = await Subscription.countDocuments();

    // 2️⃣ Active, cancelled, expired counts
    const statusStats = await Subscription.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // 3️⃣ Total revenue across all subscriptions
    const totalRevenueResult = await Subscription.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$price" },
          avgPrice: { $avg: "$price" },
        },
      },
    ]);

    const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;
    const avgPrice = totalRevenueResult[0]?.avgPrice || 0;

    // 4️⃣ Category stats
    const categoryStats = await Subscription.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$price" },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1,
          totalRevenue: 1,
        },
      },
    ]);

    // 5️⃣ Monthly trend (for chart)
    const monthlyStats = await Subscription.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$price" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // 6️⃣ Recent subscriptions
    const recentSubscriptions = await Subscription.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      message: "Admin dashboard stats fetched successfully",
      stats: {
        totalSubscriptions,
        statusStats,
        totalRevenue,
        avgPrice,
        categoryStats,
        monthlyStats,
      },
      recentSubscriptions,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin dashboard data",
      error: error.message,
    });
  }
};
