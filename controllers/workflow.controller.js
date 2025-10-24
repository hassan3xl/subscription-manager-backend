import Subscription from "../models/subscription.model.js";

const sendReminders = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // ignore time precision

    const subscriptions = await Subscription.find({ status: "active" });

    const dueReminders = subscriptions.filter((sub) =>
      sub.reminders.some(
        (r) => new Date(r).setHours(0, 0, 0, 0) === today.getTime()
      )
    );

    // TODO: Replace with your email sending logic
    for (const sub of dueReminders) {
      console.log(`Reminder: Send email to user ${sub.user} for ${sub.name}`);
      // await sendEmail(sub.user.email, `Your ${sub.name} plan renews soon!`);
    }

    res.json({
      success: true,
      count: dueReminders.length,
      message: `${dueReminders.length} reminders triggered`,
    });
  } catch (error) {
    next(error);
  }
};

export default sendReminders;
