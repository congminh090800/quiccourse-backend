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
router.put(
  "/grade/upload-student-list",
  upload.single("csvFile"),
  authenticate,
  roleAuthenticate,
  validator(requestSchema.uploadStudentList),
  controller.uploadStudentList
);

router.put(
  "/grade/finalize-grades",
  authenticate,
  roleAuthenticate,
  validator(requestSchema.finalizeGrades),
  controller.finalizeGrades
)

router.patch(
  "/grade/add-or-update-student",
  authenticate,
  roleAuthenticate,
  validator(requestSchema.addStudent),
  controller.addStudent
)
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
 *  put:
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
 *                          courseId:
 *                              type: string
 *                              required: true
 *                          csvFile:
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
 * /api/grade/finalize-grades:
 *  put:
 *      tags:
 *          - grade
 *      summary: Update data of a grade component in a course
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      example:
 *                           {
 *                               "courseId": "619d0228ca30412f1dfcee09",
 *                               "gradeComponentId": "61a664c7b64e25dd815e8b1a",
 *                               "listPoints": [
 *                                   {
 *                                      studentId: "123123",
 *                                      point: 3  
 *                                   },
 *                                   {
 *                                      studentId: "2133",
 *                                      point: 5  
 *                                   }
 *                               ]
 *                           }
 *      responses:
 *          200:
 *              description: OK
 *              content:
 *                  application/json:
 *                    examples:
 *                     {
 *                       "data": {
 *                         "document": {
 *                           "_id": "619d0228ca30412f1dfcee09",
 *                           "name": "222222",
 *                           "section": "22222",
 *                           "subject": "2222",
 *                           "room": "2222",
 *                           "code": "4JhXs",
 *                           "owner": "618cbdcb5e34ab4dcf6b9e90",
 *                           "backgroundImg": "3",
 *                           "participants": [],
 *                           "teachers": [],
 *                           "invitation_expired_date": 0,
 *                           "deleted_flag": false,
 *                           "createdAt": "2021-11-23T15:00:56.124Z",
 *                           "updatedAt": "2021-12-19T06:35:02.707Z",
 *                           "__v": 0,
 *                           "gradeStructure": [
 *                             {
 *                               "isFinalized": false,
 *                               "name": "1111",
 *                               "point": 10,
 *                               "index": 0,
 *                               "_id": "61a664c7b64e25dd815e8b1a",
 *                               "createdAt": "2021-11-30T17:52:07.501Z"
 *                             },
 *                             {
 *                               "isFinalized": false,
 *                               "name": "test",
 *                               "point": 10,
 *                               "index": 1,
 *                               "_id": "61a664c7b64e25dd815e8b1b",
 *                               "createdAt": "2021-11-30T17:52:07.501Z"
 *                             },
 *                             {
 *                               "isFinalized": false,
 *                               "name": "111",
 *                               "point": 10,
 *                               "index": 2,
 *                               "_id": "61a664c7b64e25dd815e8b1c",
 *                               "createdAt": "2021-11-30T17:52:07.501Z"
 *                             }
 *                           ],
 *                           "enrolledStudents": [
 *                             {
 *                               "fullName": "SSjjlal ládjál",
 *                               "studentId": "123123",
 *                               "courseId": "619d0228ca30412f1dfcee09",
 *                               "deleted_flag": false,
 *                               "_id": "61bb89412bf0aeb42d53b49c",
 *                               "updatedAt": "2021-12-16T18:45:21.550Z",
 *                               "createdAt": "2021-12-16T18:45:21.550Z",
 *                               "grades": [
 *                                 {
 *                                   "point": 3,
 *                                   "gradeComponentId": "61a664c7b64e25dd815e8b1a",
 *                                   "_id": "61bed296a1762de744b57220"
 *                                 }
 *                               ]
 *                             }
 *                           ]
 *                         },
 *                         "errors": [
 *                           "Student 2133 is not exist in enrolled list"
 *                         ]
 *                       }
 *                     }
 *
 */
