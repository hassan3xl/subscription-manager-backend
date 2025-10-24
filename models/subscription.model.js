import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subscription name is required"],
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    price: {
      type: Number,
      required: [true, "Subscription price is required"],
      min: [0, "Subscription price must be greater than 0"],
    },
    currency: {
      type: String,
      enum: ["USD", "EUR", "NGN"],
      default: "NGN",
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      default: "monthly",
    },
    category: {
      type: String,
      enum: ["sports", "news", "technology", "movies", "music"],
      default: "technology",
      required: [true, "Subscription category is required"],
    },

    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelReason: {
      type: String,
      trim: true,
    },

    paymentMethod: {
      type: String,
      enum: ["card", "bank_transfer", "paystack", "crypto", "paypal", "other"],
      default: "paystack",
      required: [true, "Payment method is required"],
    },

    startDate: {
      type: Date,
      required: true,
      default: Date.now,
      validate: {
        validator: (value) => value <= new Date(),
        message: "Start date must be in the past or now",
      },
    },

    renewalDate: {
      type: Date,
      required: true,
      default: Date.now,
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "Renewal date must be after the start date",
      },
    },

    // reminder before renewal or cancellation period

    reminders: {
      type: [Date],
      default: [],
    },

    reminderDate: {
      type: Date,
      default: function () {
        // default 3 days before renewal date
        const date = new Date(this.renewalDate);
        date.setDate(date.getDate() - 3);
        return date;
      },
    },

    reminderSent: {
      type: Boolean,
      default: false,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// auto calculate renewal date and reminder date
subscriptionSchema.pre("save", function (next) {
  if (!this.renewalDate) {
    const renewalPeriod = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      yearly: 365,
    };

    this.renewalDate = new Date(this.startDate);
    this.renewalDate.setDate(
      this.startDate.getDate() + renewalPeriod[this.frequency]
    );
  }

  // Auto-calculate reminder date if not manually set
  if (!this.reminderDate) {
    const reminder = new Date(this.renewalDate);
    reminder.setDate(reminder.getDate() - 3);
    this.reminderDate = reminder;
  }

  // auto-update the status if renewal date has passed
  if (this.renewalDate < new Date()) {
    this.status = "expired";
  }

  next();
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
