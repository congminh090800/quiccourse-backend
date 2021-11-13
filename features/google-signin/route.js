const express = require("express");
const router = express.Router();
const controller = require("./controller");
const validator = require("middlewares/validator.middleware");
const signInSchema = require("./google-signin-validator");

router.post("/google-signin", validator(signInSchema), controller.googleSignIn);

module.exports = router;

/**
 * @swagger
 * /api/google-signin:
 *  post:
 *      tags:
 *          - google
 *      summary: Sign in with google
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      example:
 *                          {
 *                               "tokenId": "some_token",
 *                           }
 *      responses:
 *          200:
 *              description: Return user data
 *
 */
