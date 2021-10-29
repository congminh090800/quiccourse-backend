const { Course } = require("models");
const mongoose = require("mongoose");

module.exports = {
  uploadCover: async (req, res, next) => {
    try {
      const { courseId } = req.body;
      const { id } = req.user;
      const selectedCourse = await Course.findOne({
        _id: mongoose.Types.ObjectId(courseId),
        deleted_flag: false,
      });
      if (!selectedCourse) {
        return res.notFound("Class does not exist", "Class does not exist");
      }

      if (selectedCourse.owner != id) {
        return res.badRequest("You are not the owner", "Permission denied");
      }

      await Course.update(
        { _id: selectedCourse._id, deleted_flag: false },
        {
          backgroundImg: req.file.path || "1",
        }
      );
      res.ok(req.file.path || "1");
    } catch (err) {
      console.log("update cover failed", err);
      next(err);
    }
  },
};
