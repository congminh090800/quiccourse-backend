const express = require("express");
const router = express.Router();
const controller = require("./controller");
const validator = require("middlewares/validator.middleware");
const requestSchema = require("./validator");
const authenticate = require("middlewares/authenticate.middleware");

// upload handler
const multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "static/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`); //Appending extension
  },
});
const upload = multer({ storage: storage });

router.patch(
  "/upload/upload-cover",
  upload.single("imgFile"),
  authenticate,
  validator(requestSchema.uploadCover),
  controller.uploadCover
);

module.exports = router;

/**
 * @swagger
 * /api/upload/upload-cover:
 *  patch:
 *      tags:
 *          - upload
 *      summary: Upload cover of a course
 *      requestBody:
 *          required: true
 *          content:
 *              multipart/form-data:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          courseId:
 *                              type: string
 *                              required: true
 *                          imgFile:
 *                              type: string
 *                              format: binary
 *                              required: true
 *      responses:
 *          200:
 *              description: Return result
 *
 */
