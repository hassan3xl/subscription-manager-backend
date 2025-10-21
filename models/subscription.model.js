import mongoose from "mongoose";

const subscriptionSchema = mongoose.Schema(
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
      trim: true,
      minLength: [0, "Subscription price must be greater than 0"],
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
      enum: ["sports", "news", "technology"],
      default: "technology",
      required: [true, "Subscription category is required"],
    },

    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },
    startDate: {
      required: true,
      type: Date,
      default: Date.now,
      validate: {
        validator: (value) => value < new Date(),
        message: "Start date must be in the past",
      },
    },
    renewalDate: {
      required: true,
      type: Date,
      default: Date.now,
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "Renewal date must be after the start date",
      },
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
// auto calculate renewal date
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

  // auto-update te status if renewal date has passed
  if (this.renewalDate < new Date()) {
    this.status = "expired";
  }
  next();
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
