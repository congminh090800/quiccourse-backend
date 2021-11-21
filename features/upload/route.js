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
    cb(null, "static");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}`); //Appending extension
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

router.patch(
  "/upload/upload-avatar",
  upload.single("imgFile"),
  authenticate,
  controller.uploadAvatar
);

router.get("/images/:key", controller.getImage);

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

/**
 * @swagger
 * /api/images/{key}:
 *  get:
 *      tags:
 *          - upload
 *      summary: Load image
 *      parameters:
 *          -   name: key
 *              in: path
 *              schema:
 *                  type: string
 *                  required: true
 *      responses:
 *          200:
 *              description: Return image file
 */

/**
 * @swagger
 * /api/upload/upload-avatar:
 *  patch:
 *      tags:
 *          - upload
 *      summary: Upload user avatar
 *      requestBody:
 *          required: true
 *          content:
 *              multipart/form-data:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          imgFile:
 *                              type: string
 *                              format: binary
 *                              required: true
 *      responses:
 *          200:
 *              description: Return result
 *
 */
