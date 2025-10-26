import mongoose from "mongoose";
import Subscription from "../../models/subscription.model.js";
import Product from "../../models/product.model.js";
import Category from "../../models/category.model.js";

export const getAdminDashboard = async (req, res) => {
  try {
    // 1️⃣ Overall subscription count
    const totalSubscriptions = await Subscription.countDocuments();

    // 2️⃣ Count by status (active, cancelled, expired)
    const statusStats = await Subscription.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // 3️⃣ Total revenue & average price (use priceAtSubscription)
    const totalRevenueResult = await Subscription.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$priceAtSubscription" },
          avgPrice: { $avg: "$priceAtSubscription" },
        },
      },
    ]);

    const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;
    const avgPrice = totalRevenueResult[0]?.avgPrice || 0;

    // 4️⃣ Category stats via lookup → product → category
    const categoryStats = await Subscription.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $lookup: {
          from: "categories",
          localField: "productInfo.category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      {
        $group: {
          _id: "$categoryInfo.name",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$priceAtSubscription" },
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
      { $sort: { count: -1 } },
    ]);

    // 5️⃣ Monthly trend (for charts)
    const monthlyStats = await Subscription.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$priceAtSubscription" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // 6️⃣ Recent subscriptions (populate product + user)
    const recentSubscriptions = await Subscription.find()
      .populate({
        path: "user",
        select: "name email",
      })
      .populate({
        path: "product",
        select: "name price category",
        populate: { path: "category", select: "name" },
      })
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
