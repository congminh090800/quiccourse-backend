const express = require("express");
const router = express.Router();
const controller = require("./controller");
const validator = require("middlewares/validator.middleware");
const requestSchema = require("./validator");
const authenticate = require("middlewares/authenticate.middleware");

router.patch(
  "/notifications",
  authenticate,
  validator(requestSchema.visit, "query"),
  controller.visit
);

module.exports = router;

/**
 * @swagger
 * /api/notifications:
 *  patch:
 *      tags:
 *          - notification
 *      summary: Check seen a notification
 *      parameters:
 *          -   name: notificationId
 *              in: query
 *              required: true
 *              schema:
 *                  type: string
 *      responses:
 *          200:
 *              description: Return user info
 */
