const express = require("express");
const router = express.Router();
const authenticate = require("middlewares/authenticate.middleware");
const roleAuthenticate = require("middlewares/role_authorize.middleware.js");
const validator = require("middlewares/validator.middleware");
const controller = require("./controller");
const requestSchema = require("./validator");

// upload handler
const multer = require("multer");
var storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get(
  "/grade/student-list-template",
  authenticate,
  controller.generateStudentTemplate
);
router.patch(
  "/grade/upload-student-list",
  upload.single("csvFile"),
  // authenticate,
  // roleAuthenticate,
  // validator(requestSchema.uploadStudentList),
  controller.uploadStudentList
);
module.exports = router;

/**
 * @swagger
 * /api/grade/student-list-template:
 *  get:
 *      tags:
 *          - grade
 *      summary: Download student list template
 *      responses:
 *          200:
 *              description: Return csv file
 */

/**
 * @swagger
 * /api/grade/upload-student-list:
 *  patch:
 *      tags:
 *          - grade
 *      summary: Upload csv student list
 *      requestBody:
 *          required: true
 *          content:
 *              multipart/form-data:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          csvFile:
 *                              type: string
 *                              format: binary
 *                              required: true
 *      responses:
 *          200:
 *              description: Return result
 *
 */
