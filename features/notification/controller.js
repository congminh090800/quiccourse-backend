const { User } = require("models");
const mongoose = require("mongoose");

module.exports = {
  visit: async (req, res, next) => {
    try {
      const { notificationId } = req.query;
      const { id } = req.user;
      const updated = await User.findByIdAndUpdate(
        id,
        {
          $set: {
            "notifications.$[el].seen": true,
          },
        },
        {
          arrayFilters: [
            {
              "el._id": mongoose.Types.ObjectId(notificationId),
            },
          ],
          returnDocument: "after",
        }
      );
      return res.ok(updated.notifications);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
};
