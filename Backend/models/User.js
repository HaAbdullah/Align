const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firebase_uid: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
    },
    display_name: {
      type: String,
    },
    subscription_tier: {
      type: String,
      default: "FREEMIUM",
      enum: ["FREEMIUM", "BASIC", "PREMIUM", "PREMIUM_PLUS"],
    },
    monthly_generations_limit: {
      type: Number,
      default: 2,
    },
    monthly_generations_used: {
      type: Number,
      default: 0,
    },
    subscription_status: {
      type: String,
      default: "active",
    },
    stripe_customer_id: {
      type: String,
    },
    stripe_subscription_id: {
      type: String,
    },
    subscription_start_date: {
      type: Date,
    },
    usage_reset_date: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", UserSchema);
