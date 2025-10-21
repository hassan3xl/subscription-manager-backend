const sendReminders = async (req, res, next) => {
  try {
    res.send({
      title: "Send reminders",
    });
  } catch (error) {
    next(error);
  }
};

export default sendReminders;
