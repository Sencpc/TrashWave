const express = require("express");
const router = express.Router();
const SubscriptionPlan = require("../Model/mSubscriptionPlan");
const PaymentTransaction = require("../Model/mPaymentTransaction");
const User = require("../Model/mAccount");
const { auth } = require("../Middleware/auth");
const { validateBody, validateQuery } = require("../Middleware/validation");
const {
  subscriptionSchema,
  paymentSchema,
  paginationSchema,
} = require("../validation/schemas");

// GET /subscriptions/plans - Get all subscription plans
const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      where: { is_active: true },
      order: [["price", "ASC"]],
    });

    return res.status(200).json({ plans });
  } catch (error) {
    console.error("Get subscription plans error:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch subscription plans" });
  }
};

// POST /subscriptions/subscribe - Subscribe to a plan
const subscribe = async (req, res) => {
  try {
    const { plan_id, payment_method } = req.body;
    const userId = req.user.id;

    if (!plan_id || !payment_method) {
      return res
        .status(400)
        .json({ error: "Plan ID and payment method are required" });
    }

    const plan = await SubscriptionPlan.findByPk(plan_id);
    if (!plan || !plan.is_active) {
      return res
        .status(404)
        .json({ error: "Subscription plan not found or inactive" });
    }

    // Create payment transaction
    const transaction = await PaymentTransaction.create({
      user_id: userId,
      subscription_plan_id: plan_id,
      amount: plan.price,
      payment_method,
      transaction_status: "pending",
      created_at: new Date(),
    });

    // In a real application, you would integrate with a payment processor here
    // For now, we'll simulate successful payment

    // Update user subscription
    const user = await User.findByPk(userId);
    await user.update({
      subscription_plan: plan.name.toLowerCase().replace(" ", "_"),
      streaming_quota: plan.streaming_quota,
      download_quota: plan.download_quota,
      updated_at: new Date(),
    });

    // Update transaction status
    await transaction.update({
      transaction_status: "completed",
      updated_at: new Date(),
    });

    return res.status(200).json({
      message: "Subscription successful",
      subscription: {
        plan: plan.name,
        streaming_quota: plan.streaming_quota,
        download_quota: plan.download_quota,
        expires_at: new Date(
          Date.now() + plan.duration_days * 24 * 60 * 60 * 1000
        ),
      },
      transaction_id: transaction.id,
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    return res.status(500).json({ error: "Failed to process subscription" });
  }
};

// GET /subscriptions/current - Get current user subscription
const getCurrentSubscription = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["subscription_plan", "streaming_quota", "download_quota"],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      subscription: {
        plan: user.subscription_plan,
        streaming_quota: user.streaming_quota,
        download_quota: user.download_quota,
      },
    });
  } catch (error) {
    console.error("Get current subscription error:", error);
    return res.status(500).json({ error: "Failed to fetch subscription" });
  }
};

// GET /subscriptions/transactions - Get user's transaction history
const getTransactionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const transactions = await PaymentTransaction.findAndCountAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: SubscriptionPlan,
          as: "subscription_plan",
          attributes: ["name", "duration_days"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      transactions: transactions.rows,
      pagination: {
        total: transactions.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(transactions.count / limit),
      },
    });
  } catch (error) {
    console.error("Get transaction history error:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch transaction history" });
  }
};

// Routes
router.get("/plans", getSubscriptionPlans);
router.post("/subscribe", auth, validateBody(subscriptionSchema), subscribe);
router.get("/current", auth, getCurrentSubscription);
router.get(
  "/transactions",
  auth,
  validateQuery(paginationSchema),
  getTransactionHistory
);

module.exports = router;
