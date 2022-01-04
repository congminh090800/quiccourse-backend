const express = require("express");
const router = express.Router();
const controller = require("./controller");
const validator = require("middlewares/validator.middleware");
const requestSchema = require("./validator");
const authorize = require("middlewares/authorize.middleware");

router.post("/admin/login", validator(requestSchema.login), controller.login);

router.post(
  "/admin/create-admin",
  validator(requestSchema.createAdmin),
  authorize,
  controller.createAdmin
);

router.get(
  "/admin/search-admin",
  validator(requestSchema.searchAdmin),
  authorize,
  controller.searchAdmin
);

router.get("/admin/admin-detail/:id", authorize, controller.adminDetail);

router.get(
  "/admin/users",
  validator(requestSchema.searchUser),
  authorize,
  controller.searchUser
);

router.get("/admin/users/:id", authorize, controller.userDetail);

router.patch(
  "/admin/users/map-student-id",
  validator(requestSchema.mapStudentId),
  authorize,
  controller.mapStudentId
);

router.patch(
  "/admin/users/lock-account",
  validator(requestSchema.lockAccount),
  authorize,
  controller.lockAccount
);

router.patch(
  "/admin/users/unlock-account",
  validator(requestSchema.unlockAccount),
  authorize,
  controller.unlockAccount
);

router.get(
  "/admin/courses",
  validator(requestSchema.searchCourse),
  authorize,
  controller.searchCourse
);

router.get("/admin/courses/:id", authorize, controller.courseDetail);

module.exports = router;
/**
 * @swagger
 * /api/admin/login:
 *  post:
 *      tags:
 *          - admin
 *      summary: Admin login
 *      requestBody:
 *          description: Username and password
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      example:
 *                          {
 *                               "email": "admin@gmail.com",
 *                               "password": "123456",
 *                           }
 *      responses:
 *          200:
 *              description: Return access token
 *              examples:
 *                  application/json:
 *                      {
 *                          "data": "61754d7b81dd1d44c3013172"
 *                      }
 *
 */

/**
 * @swagger
 * /api/admin/create-admin:
 *  post:
 *      tags:
 *          - admin
 *      summary: Create new admin
 *      requestBody:
 *          description: Admin
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      example:
 *                          {
 *                               "email": "randomname@gmail.com",
 *                               "password": "abc123456",
 *                               "name": "randomname"
 *                           }
 *      responses:
 *          200:
 *              description: Return access token
 *              examples:
 *                  application/json:
 *                      {
 *                          "data": "61754d7b81dd1d44c3013172"
 *                      }
 *
 */

/**
 * @swagger
 * /api/admin/search-admin:
 *  get:
 *      tags:
 *          - admin
 *      summary: Query a list of admin
 *      parameters:
 *          -   name: offset
 *              in: query
 *              required: false
 *              schema:
 *                  type: number
 *          -   name: limit
 *              in: query
 *              required: false
 *              schema:
 *                  type: number
 *          -   name: name
 *              in: query
 *              required: false
 *              schema:
 *                  type: string
 *          -   name: timeOrder
 *              in: query
 *              required: false
 *              schema:
 *                  type: string
 *      responses:
 *          200:
 *              description: Return list with pagination
 */

/**
 * @swagger
 * /api/admin/admin-detail/{id}:
 *  get:
 *      tags:
 *          - admin
 *      summary: Get admin detail
 *      parameters:
 *          -   name: id
 *              in: path
 *              schema:
 *                  type: string
 *      responses:
 *          200:
 *              description: Return admin detail
 */

/**
 * @swagger
 * /api/admin/users:
 *  get:
 *      tags:
 *          - admin
 *      summary: Query a list of user as admin
 *      parameters:
 *          -   name: name
 *              in: query
 *              schema:
 *                  type: string
 *          -   name: email
 *              in: query
 *              schema:
 *                  type: string
 *          -   name: offset
 *              in: query
 *              required: false
 *              schema:
 *                  type: number
 *          -   name: limit
 *              in: query
 *              required: false
 *              schema:
 *                  type: number
 *          -   name: timeOrder
 *              in: query
 *              required: false
 *              schema:
 *                  type: string
 *      responses:
 *          200:
 *              description: Return list with pagination
 */

/**
 * @swagger
 * /api/admin/users/{id}:
 *  get:
 *      tags:
 *          - admin
 *      summary: Get user detail
 *      parameters:
 *          -   name: id
 *              in: path
 *              schema:
 *                  type: string
 *      responses:
 *          200:
 *              description: Return user detail
 */

/**
 * @swagger
 * /api/admin/users/map-student-id:
 *  patch:
 *      tags:
 *          - admin
 *      summary: Map or unmap a student id (leave "" or no passing student id to unmap)
 *      requestBody:
 *          description: Admin
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      example:
 *                          {
 *                               "id": "someid",
 *                               "studentId": "somestudentid"
 *                           }
 *      responses:
 *          200:
 *              description: Map/Unmap student id
 */

/**
 * @swagger
 * /api/admin/users/lock-account:
 *  patch:
 *      tags:
 *          - admin
 *      summary: Lock account
 *      requestBody:
 *          description: Admin
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      example:
 *                          {
 *                               "id": "someid"
 *                           }
 *      responses:
 *          200:
 *              description: Lock account
 */

/**
 * @swagger
 * /api/admin/users/unlock-account:
 *  patch:
 *      tags:
 *          - admin
 *      summary: unlock account
 *      requestBody:
 *          description: Admin
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      example:
 *                          {
 *                               "id": "someid",
 *                           }
 *      responses:
 *          200:
 *              description: unock account
 */

/**
 * @swagger
 * /api/admin/courses:
 *  get:
 *      tags:
 *          - admin
 *      summary: Query a list of courses
 *      parameters:
 *          -   name: offset
 *              in: query
 *              required: false
 *              schema:
 *                  type: number
 *          -   name: limit
 *              in: query
 *              required: false
 *              schema:
 *                  type: number
 *          -   name: name
 *              in: query
 *              required: false
 *              schema:
 *                  type: string
 *          -   name: timeOrder
 *              in: query
 *              required: false
 *              schema:
 *                  type: string
 *      responses:
 *          200:
 *              description: Return list with pagination
 */

/**
 * @swagger
 * /api/admin/courses/{id}:
 *  get:
 *      tags:
 *          - admin
 *      summary: Get courses detail
 *      parameters:
 *          -   name: id
 *              in: path
 *              schema:
 *                  type: string
 *      responses:
 *          200:
 *              description: Return course detail
 */
