// models/Subscription.js
import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Subscribed product is required"],
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    renewalDate: {
      type: Date,
    },

    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      default: "monthly",
    },

    isRecurring: {
      type: Boolean,
      default: true,
    },

    paymentMethod: {
      type: String,
      enum: ["card", "bank_transfer", "paystack", "crypto", "paypal", "other"],
      default: "paystack",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "successful", "failed", "refunded"],
      default: "pending",
    },

    paymentReference: {
      type: String,
      unique: true,
      sparse: true,
    },

    priceAtSubscription: {
      type: Number,
      required: [true, "Price at time of subscription is required"],
    },

    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "pending"],
      default: "active",
    },

    cancelledAt: Date,
    cancelReason: String,

    reminderDate: Date,
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 🔁 Auto-calculate renewalDate and reminderDate
subscriptionSchema.pre("save", function (next) {
  const renewalPeriod = {
    daily: 1,
    weekly: 7,
    monthly: 30,
    yearly: 365,
  };

  if (!this.renewalDate) {
    this.renewalDate = new Date(this.startDate);
    this.renewalDate.setDate(
      this.startDate.getDate() + renewalPeriod[this.frequency]
    );
  }

  if (!this.reminderDate) {
    const reminder = new Date(this.renewalDate);
    reminder.setDate(reminder.getDate() - 3);
    this.reminderDate = reminder;
  }

  if (this.renewalDate < new Date()) {
    this.status = "expired";
  }

  next();
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
