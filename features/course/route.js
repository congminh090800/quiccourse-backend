const express = require("express");
const router = express.Router();
const controller = require("./controller");
const validator = require("middlewares/validator.middleware");
const requestSchema = require("./validator");
const authenticate = require("middlewares/authenticate.middleware");
const authorize = require("middlewares/authorize.middleware");
const roleAuthorize = require("middlewares/role_authorize.middleware");

router.post(
  "/courses",
  authenticate,
  validator(requestSchema.create),
  controller.create
);

router.get(
  "/courses",
  authenticate,
  authorize,
  validator(requestSchema.search, "query"),
  controller.search
);

router.get(
  "/courses/me",
  authenticate,
  validator(requestSchema.search, "query"),
  controller.searchRelevant
);

router.patch(
  "/courses/participate/:codeRoom",
  authenticate,
  controller.participate
);

router.patch(
  "/courses/invite/create/:courseCode",
  validator(requestSchema.invitation, "params"),
  authenticate,
  controller.createInvitationLink
);

router.patch(
  "/courses/invite/:courseCode",
  validator(requestSchema.invitation, "params"),
  authenticate,
  controller.participateByLink
);

router.get("/courses/me/:code", authenticate, controller.detail);

router.post(
  "/courses/invite/email/send",
  validator(requestSchema.sendInvitation),
  authenticate,
  roleAuthorize,
  controller.sendInvitationEmail
);

router.post(
  "/courses/invite/email/send-teachers",
  validator(requestSchema.sendInvitation),
  authenticate,
  roleAuthorize,
  controller.sendTeachersInvitationEmail
);

router.patch(
  "/courses/invite/teacher/:key",
  validator(requestSchema.teacherInvitation, "params"),
  authenticate,
  controller.teacherParticipateByLink
);

router.patch(
  '/course/grade',
  validator(requestSchema.updateGradeStructure, "body"),
  authenticate,
  controller.updateGradeStructure
);

module.exports = router;

/**
 * @swagger
 * /api/courses:
 *  post:
 *      tags:
 *          - course
 *      summary: Create new course
 *      requestBody:
 *          description: Course information
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      example:
 *                           {
 *                               "name": "Test name",
 *                               "section": "Test section",
 *                               "subject": "Test subject",
 *                               "room": "Test room",
 *                               "owner": "61748455a3966446b239dd87",
 *                               "backgroundImg": "https://gstatic.com/classroom/themes/img_read.jpg",
 *                               "participants": [
 *                                   "617540443cd3edf1f42edecf",
 *                                   "6175407f3cd3edf1f42eded2"
 *                               ]
 *                           }
 *      responses:
 *          200:
 *              description: Return course created
 *
 */

/**
 * @swagger
 * /api/courses:
 *  get:
 *      tags:
 *          - course
 *      summary: Query a list of courses as admin
 *      description: name, section, owner search by regex; code must be exactly matched
 *      parameters:
 *          -   name: name
 *              in: query
 *              schema:
 *                  type: string
 *          -   name: section
 *              in: query
 *              schema:
 *                  type: string
 *          -   name: owner
 *              in: query
 *              description: Name of owner not id
 *              schema:
 *                  type: string
 *          -   name: code
 *              in: query
 *              schema:
 *                  type: string
 *          -   name: offset
 *              in: query
 *              required: true
 *              schema:
 *                  type: number
 *          -   name: limit
 *              in: query
 *              required: true
 *              schema:
 *                  type: number
 *      responses:
 *          200:
 *              description: Return list with pagination
 */

/**
 * @swagger
 * /api/courses/me:
 *  get:
 *      tags:
 *          - course
 *      summary: Query a list of courses that relevant to your account (you are the owner or a participant)
 *      description: name, section, owner search by regex; code must be exactly matched
 *      parameters:
 *          -   name: name
 *              in: query
 *              schema:
 *                  type: string
 *          -   name: section
 *              in: query
 *              schema:
 *                  type: string
 *          -   name: owner
 *              in: query
 *              description: Name of owner not id
 *              schema:
 *                  type: string
 *          -   name: code
 *              in: query
 *              schema:
 *                  type: string
 *          -   name: offset
 *              in: query
 *              required: true
 *              schema:
 *                  type: number
 *          -   name: limit
 *              in: query
 *              required: true
 *              schema:
 *                  type: number
 *      responses:
 *          200:
 *              description: Return list with pagination
 */

/**
 * @swagger
 * /api/courses/participate/{codeRoom}:
 *  patch:
 *      tags:
 *          - course
 *      summary: Participate a course
 *      parameters:
 *          -   name: codeRoom
 *              in: path
 *              required: true
 *              schema:
 *                  type: string
 *      responses:
 *          200:
 *              description: Return update info
 */

/**
 * @swagger
 * /api/courses/invite/create/{courseCode}:
 *  patch:
 *      tags:
 *          - course
 *      summary: Create new expired date for invitation link
 *      parameters:
 *          -   name: courseCode
 *              in: path
 *              required: true
 *              schema:
 *                  type: string
 *      responses:
 *          200:
 *              description: Return new expired date for invitation link
 */

/**
 * @swagger
 * /api/courses/invite/{courseCode}:
 *  patch:
 *      tags:
 *         - course
 *      summary: Add userId to class participant list
 *      parameters:
 *         -  name: courseCode
 *            in: path
 *            required: true
 *            schema:
 *                type: string
 *      responses:
 *          200:
 *              description: Return "true"
 *
 */

/**
 * @swagger
 * /api/courses/invite/email/send:
 *  patch:
 *      tags:
 *         - course
 *      summary: Send invitation link to target emails
 *      requestBody:
 *          description: Target emails and courseId
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      example:
 *                           {
 *                               "emails": ["test@gmail.com", "test1@gmail.com"],
 *                               "courseId" : "618ea2aa952e5bdf038a8e5c"
 *                           }
 *      responses:
 *          200:
 *              description: Return "true"
 *
 */

/**
 * @swagger
 * /api/courses/invite/email/send-teachers:
 *  post:
 *      tags:
 *         - course
 *      summary: Send invitation link to teachers emails
 *      requestBody:
 *          description: Target teachers emails and courseId
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      example:
 *                           {
 *                               "emails": ["test@gmail.com", "test1@gmail.com"],
 *                               "courseId" : "618ea2aa952e5bdf038a8e5c"
 *                           }
 *      responses:
 *          200:
 *              description: Return "true"
 *
 */

/**
 * @swagger
 * /api/courses/invite/teacher/{key}:
 *  post:
 *      tags:
 *         - course
 *      summary: Add teacher to class teacher list by invitation link sent to teacher
 *      parameters:
 *         -  name: key
 *            in: path
 *            required: true
 *            schema:
 *                type: string
 *      responses:
 *          200:
 *              description: Return "true"
 *
 */

/**
 * @swagger
 * /api/courses/me/{code}:
 *  get:
 *      tags:
 *          - course
 *      summary: Get course detail
 *      parameters:
 *          -   name: code
 *              in: path
 *              schema:
 *                  type: string
 *      responses:
 *          200:
 *              description: Return list with pagination
 */

/**
 * @swagger
 * /api/course/grade:
 *  post:
 *      tags:
 *         - course
 *      summary: Create/update course grade structure
 *      requestBody:
 *          description: courseId and grade structure
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      example:
 *                           {
 *                               "courseId" : "618ea2aa952e5bdf038a8e5c",
 *                               "gradeStructure" : [
 *                                  {
 *                                     "name": "Excercises",
 *                                     "point": 10
 *                                  }
 *                               ]
 *                           }
 *      responses:
 *          200:
 *              description: Return "true"
 *
 */