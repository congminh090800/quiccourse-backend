const { Course } = require("models");
const mongoose = require("mongoose");
const { uploadFile, getFile } = require("lib/database/s3");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

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

      const file = req.file;
      const result = await uploadFile(file);

      await Course.updateOne(
        { _id: selectedCourse._id, deleted_flag: false },
        {
          backgroundImg: result.Key || "1",
        }
      );
      await unlinkFile(file.path);
      res.ok({ imagePath: `/images/${result.Key}` });
    } catch (err) {
      console.log("update cover failed", err);
      next(err);
    }
  },
  getImage: (req, res, next) => {
    try {
      const key = req.params.key;
      res.set("Content-Type", "image/*");
      const readStream = getFile(key);
      readStream.pipe(res);
    } catch (err) {
      console.log("get image failed", err);
      next(err);
    }
  },
};
