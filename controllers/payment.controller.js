// controllers/paymentController.js
import { initializePayment } from "../config/paystack.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Subscription from "../models/subscription.model.js";

export const initializeSubscriptionPayment = async (req, res, next) => {
  try {
    const {
      productId,
      frequency = "monthly",
      startDate,
      isRecurring = false,
    } = req.body;

    // 🧩 Validate Product
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    const product = await Product.findById(productId).populate("category");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // 🧩 Validate User
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.email) {
      return res.status(400).json({
        success: false,
        message: "User email is required for payment.",
      });
    }

    // 🧩 Prepare payment details
    const reference = `SUB_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`;

    const amountInKobo = Math.round(product.price * 100); // Paystack requires amount in kobo

    console.log("Initializing Paystack payment with:", {
      email: user.email,
      amountInKobo,
      reference,
    });

    // 🧩 Initialize Paystack payment
    const paymentData = await initializePayment(user.email, amountInKobo, {
      user_id: user._id.toString(),
      product_id: product._id.toString(),
      product_name: product.name,
      frequency,
      isRecurring: isRecurring.toString(),
    });

    if (!paymentData.status || !paymentData.data?.authorization_url) {
      console.error("Paystack returned error:", paymentData);
      return res.status(400).json({
        success: false,
        message:
          paymentData.message || "Failed to initialize Paystack payment.",
        paystackError: paymentData,
      });
    }

    // 🧩 Create a pending subscription
    const subscription = await Subscription.create({
      user: user._id,
      product: product._id,
      name: product.name,
      priceAtSubscription: product.price, // snapshot price at time of subscription
      currency: "NGN",
      category: product.category?._id || null,
      frequency,
      paymentMethod: "paystack",
      paymentStatus: "pending",
      paymentReference: paymentData.data.reference, // use Paystack’s reference
      startDate: startDate || new Date(),
      isRecurring,
      status: "pending",
    });

    console.log("Subscription created & payment initialized:", {
      reference: paymentData.data.reference,
      authorization_url: paymentData.data.authorization_url,
    });

    // 🧩 Send response
    return res.status(200).json({
      success: true,
      message: "Subscription payment initialized successfully.",
      data: {
        authorization_url: paymentData.data.authorization_url,
        access_code: paymentData.data.access_code,
        reference: paymentData.data.reference,
        subscription,
      },
    });
  } catch (error) {
    console.error("Error in initializeSubscriptionPayment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initialize subscription payment.",
      error: error.message,
    });
  }
};
