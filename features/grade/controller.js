const { writeToString } = require("@fast-csv/format");
const { Course, User } = require("models");
const mongoose = require("mongoose");
const csv = require("@fast-csv/parse");

module.exports = {
  generateStudentTemplate: async (req, res, next) => {
    try {
      const rows = [["full_name", "student_id"]];
      const data = await writeToString(rows);
      res.set("Content-Type", "text/csv");
      res.setHeader(
        "Content-disposition",
        "attachment; filename=student-list-template.csv"
      );
      return res.send(data);
    } catch (err) {
      console.log("generate student tempalte failed:", err);
      next(err);
    }
  },
  uploadStudentList: async (req, res, next) => {
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
      const csvString = Buffer.from(req.file.buffer).toString();
      let errors = [];
      let enrolledStudents = selectedCourse.enrolledStudents || [];
      let index = 0;
      csv
        .parseString(csvString, { headers: true })
        .on("error", (error) => {
          console.log(error);
          return res.badRequest("Error in reading csv", "Bad request");
        })
        .on("data", (row) => {
          index = index + 1;
          if (!row.full_name || row.full_name.length < 3) {
            errors.push(`row ${index} full_name is null or less than 3 chars`);
          } else if (!row.student_id) {
            errors.push(`row ${index} student_id is null`);
          } else {
            const exist = enrolledStudents.find(
              (student) => student.studentId === row.student_id
            );
            if (!exist) {
              enrolledStudents.push({
                fullName: row.full_name,
                studentId: row.student_id,
                courseId: mongoose.Types.ObjectId(courseId),
                grades: [],
                deleted_flag: false,
                _id: new mongoose.Types.ObjectId().toHexString(),
              });
            }
          }
        })
        .on("end", async (rowCount) => {
          try {
            const updated = await Course.findByIdAndUpdate(
              courseId,
              {
                enrolledStudents: enrolledStudents,
              },
              {
                returnDocument: "after",
              }
            );
            return res.ok({
              totalRows: rowCount,
              errors: errors,
              document: updated,
            });
          } catch (err) {
            console.log(err);
            return res.badRequest("Error occured", "Bad request");
          }
        });
    } catch (err) {
      console.log("upload student list failed:", err);
      next(err);
    }
  },
  finalizeGrades: async (req, res, next) => {
    try {
      const { courseId, gradeComponentId, listPoints } = req.body;
      const selectedCourse = await Course.findOne({
        _id: mongoose.Types.ObjectId(courseId),
        deleted_flag: false,
      });
      if (!selectedCourse) {
        return res.notFound("Class does not exist", "Class does not exist");
      }
      const formattedComponentId = mongoose.Types.ObjectId(gradeComponentId);
      const gradeStructure = selectedCourse.gradeStructure || [];
      const validGradeCom = gradeStructure.find((gradeComponent) =>
        gradeComponent._id.equals(formattedComponentId)
      );
      if (!validGradeCom) {
        return res.notFound(
          "Grade component does not exist in grade stucture",
          "Not found"
        );
      }
      let errors = [];
      let doc = {};
      for (const pointInfo of listPoints) {
        const enrolledStudents = selectedCourse.enrolledStudents || [];
        const validStudent = enrolledStudents.find(
          (student) => student.studentId === pointInfo.studentId
        );
        if (!validStudent) {
          errors.push(
            `Student ${pointInfo.studentId} is not exist in enrolled list`
          );
          continue;
        }
        if (Number(pointInfo.point) > validGradeCom.point) {
          errors.push(
            `Student ${pointInfo.studentId} can not be greater than ${validGradeCom.point}`
          );
          continue;
        }
        let grades = validStudent.grades || [];
        let updateMode = grades.findIndex((grade) =>
          grade.gradeComponentId.equals(formattedComponentId)
        );
        if (updateMode < 0) {
          grades.push({
            point: Number(pointInfo.point),
            gradeComponentId: formattedComponentId,
          });
        } else {
          grades[updateMode] = {
            point: Number(pointInfo.point),
            gradeComponentId: formattedComponentId,
          };
        }
        doc = await Course.findByIdAndUpdate(
          courseId,
          {
            $set: {
              "enrolledStudents.$[el].grades": grades,
            },
          },
          {
            arrayFilters: [
              {
                "el.studentId": pointInfo.studentId,
              },
            ],
            returnDocument: "after",
          }
        );
      }
      return res.ok({
        document: doc,
        errors,
      });
    } catch (err) {
      console.log("finalize grade failed:", err);
      next(err);
    }
  },
  addStudent: async (req, res, next) => {
    try {
      const { courseId, fullName, studentId } = req.body;
      const { id } = req.user;
      const selectedCourse = await Course.findOne({
        _id: mongoose.Types.ObjectId(courseId),
        deleted_flag: false,
      });
      if (!selectedCourse) {
        return res.notFound("Class does not exist", "Class does not exist");
      }
      let enrolledStudents = selectedCourse.enrolledStudents || [];
      if (
        !enrolledStudents.find((student) => studentId === student.studentId)
      ) {
        const newStudent = {
          fullName,
          studentId,
          courseId,
          grades: [],
        };
        const updated = await Course.findByIdAndUpdate(
          courseId,
          {
            $push: {
              enrolledStudents: newStudent,
            },
          },
          {
            returnDocument: "after",
          }
        );
        return res.ok(updated);
      } else {
        const updated = await Course.findByIdAndUpdate(
          courseId,
          {
            $set: {
              "enrolledStudents.$[el].fullName": fullName,
            },
          },
          {
            arrayFilters: [
              {
                "el.studentId": studentId,
              },
            ],
            returnDocument: "after",
          }
        );
        return res.ok(updated);
      }
    } catch (err) {
      console.log("add student failed:", err);
      next(err);
    }
  },
  gradeTemplate: async (req, res, next) => {
    try {
      const { courseId, gradeComponentId } = req.query;
      const selectedCourse = await Course.findOne({
        _id: mongoose.Types.ObjectId(courseId),
        deleted_flag: false,
      });
      if (!selectedCourse) {
        return res.notFound("Class does not exist", "Class does not exist");
      }
      const formattedComponentId = mongoose.Types.ObjectId(gradeComponentId);
      const gradeStructure = selectedCourse.gradeStructure || [];
      const validGradeCom = gradeStructure.find((gradeComponent) =>
        gradeComponent._id.equals(formattedComponentId)
      );
      if (!validGradeCom) {
        return res.notFound(
          "Grade component does not exist in grade stucture",
          "Not found"
        );
      }
      let enrolledStudents = selectedCourse.enrolledStudents || [];
      const pointColumnName = `${validGradeCom.point}-${validGradeCom.name}`;
      let csvObject = [];
      for (let student of enrolledStudents) {
        let baseInfo = {
          student_id: student.studentId || "",
          full_name: student.fullName || "",
        };
        const grades = student.grades || [];
        const gradeInfo = grades.find((grade) =>
          grade.gradeComponentId.equals(
            mongoose.Types.ObjectId(gradeComponentId)
          )
        );
        if (!gradeInfo) {
          csvObject.push({
            ...baseInfo,
            [pointColumnName]: null,
          });
        } else {
          csvObject.push({
            student_id: student.studentId || "",
            full_name: student.fullName || "",
            [pointColumnName]: Number(gradeInfo.point) || 0,
          });
        }
      }
      if (!csvObject || csvObject.length === 0) {
        csvObject = [["student_id", "full_name", pointColumnName]];
      }
      let data = await writeToString(csvObject, { headers: true });
      res.set("Content-Type", "text/csv");
      res.setHeader(
        "Content-disposition",
        "attachment; filename=grade-template.csv"
      );
      return res.send(data);
    } catch (err) {
      console.log("download grade template failed:", err);
      next(err);
    }
  },
  uploadGrades: async (req, res, next) => {
    try {
      const { courseId, gradeComponentId } = req.body;
      const selectedCourse = await Course.findOne({
        _id: mongoose.Types.ObjectId(courseId),
        deleted_flag: false,
      });
      if (!selectedCourse) {
        return res.notFound("Class does not exist", "Class does not exist");
      }
      const formattedComponentId = mongoose.Types.ObjectId(gradeComponentId);
      const gradeStructure = selectedCourse.gradeStructure || [];
      const validGradeCom = gradeStructure.find((gradeComponent) =>
        gradeComponent._id.equals(formattedComponentId)
      );
      if (!validGradeCom) {
        return res.notFound(
          "Grade component does not exist in grade stucture",
          "Not found"
        );
      }
      const csvString = Buffer.from(req.file.buffer).toString();
      let errors = [];
      let index = 0;
      csv
        .parseString(csvString, { headers: true })
        .on("error", (error) => {
          console.log(error);
          return res.badRequest("Error reading grade csv", "Bad request");
        })
        .on("data", async (row) => {
          index = index + 1;
          const columnName = `${validGradeCom.point}-${validGradeCom.name}`;
          if (!row.student_id) {
            errors.push(`row ${index} student_id is null`);
          } else if (!row[columnName] || isNaN(row[columnName])) {
            errors.push(`row ${index} point must be a number`);
          } else if (Number(row[columnName]) > validGradeCom.point) {
            errors.push(
              `row ${index} point must not exceed ${validGradeCom.point}`
            );
          } else {
            const enrolledStudents = selectedCourse.enrolledStudents || [];
            const validStudent = enrolledStudents.find(
              (student) => student.studentId === row.student_id
            );
            if (!validStudent) {
              errors.push(
                `row ${index} student_id does not exist in enrolled list`
              );
            } else {
              let grades = validStudent.grades || [];
              let updateMode = grades.findIndex((grade) =>
                grade.gradeComponentId.equals(formattedComponentId)
              );
              if (updateMode < 0) {
                grades.push({
                  point: Number(row[columnName]),
                  gradeComponentId: formattedComponentId,
                });
              } else {
                grades[updateMode] = {
                  point: Number(row[columnName]),
                  gradeComponentId: formattedComponentId,
                };
              }
              doc = await Course.findByIdAndUpdate(
                courseId,
                {
                  $set: {
                    "enrolledStudents.$[el].grades": grades,
                  },
                },
                {
                  arrayFilters: [
                    {
                      "el.studentId": row.student_id,
                    },
                  ],
                  returnDocument: "after",
                }
              );
            }
          }
        })
        .on("end", (rowCount) => {
          return res.ok({
            totalRows: rowCount,
            errors: errors,
          });
        });
    } catch (err) {
      console.log("upload grade failed", err);
      next(err);
    }
  },
  finalizeColumn: async (req, res, next) => {
    try {
      const { courseId, gradeComponentId } = req.body;
      const { id } = req.user;
      const selectedCourse = await Course.findOne({
        _id: mongoose.Types.ObjectId(courseId),
        deleted_flag: false,
      });
      if (!selectedCourse) {
        return res.notFound("Class does not exist", "Class does not exist");
      }
      doc = await Course.findByIdAndUpdate(
        courseId,
        {
          $set: {
            "gradeStructure.$[el].isFinalized": true,
          },
        },
        {
          arrayFilters: [
            {
              "el._id": mongoose.Types.ObjectId(gradeComponentId),
            },
          ],
          returnDocument: "after",
        }
      );
      const gradeComponent = selectedCourse.gradeStructure.find((gC) =>
        gC._id.equals(mongoose.Types.ObjectId(gradeComponentId))
      );
      const notification = {
        sender: mongoose.Types.ObjectId(id),
        title: `Grade has been revealed`,
        description: `${gradeComponent.name}'s grade (class ${selectedCourse.name}) is now availabe`,
        seen: false,
        type: "GRADE_REVEALED",
        extendedData: {
          courseCode: selectedCourse.code,
          courseId: selectedCourse._id,
        },
        deleted_flag: false,
      };
      const participants = selectedCourse.participants || [];
      await User.updateMany(
        {
          _id: {
            $in: participants,
          },
        },
        {
          $push: {
            notifications: {
              $each: [notification],
              $slice: -50,
            },
          },
        }
      );
      return res.ok(doc);
    } catch (err) {
      console.log("finalize column failed:", err);
      next(err);
    }
  },
  unfinalizeColumn: async (req, res, next) => {
    try {
      const { courseId, gradeComponentId } = req.body;
      const { id } = req.user;
      const selectedCourse = await Course.findOne({
        _id: mongoose.Types.ObjectId(courseId),
        deleted_flag: false,
      });
      if (!selectedCourse) {
        return res.notFound("Class does not exist", "Class does not exist");
      }
      doc = await Course.findByIdAndUpdate(
        courseId,
        {
          $set: {
            "gradeStructure.$[el].isFinalized": false,
          },
        },
        {
          arrayFilters: [
            {
              "el._id": mongoose.Types.ObjectId(gradeComponentId),
            },
          ],
          returnDocument: "after",
        }
      );
      const gradeComponent = selectedCourse.gradeStructure.find((gC) =>
        gC._id.equals(mongoose.Types.ObjectId(gradeComponentId))
      );
      const notification = {
        sender: mongoose.Types.ObjectId(id),
        title: `Grade has been rollbacked`,
        description: `${gradeComponent.name}'s grade (class ${selectedCourse.name}) is now hidden`,
        seen: false,
        type: "GRADE_UNREVEALED",
        extendedData: {
          courseCode: selectedCourse.code,
          courseId: selectedCourse._id,
        },
        deleted_flag: false,
      };
      const participants = selectedCourse.participants || [];
      await User.updateMany(
        {
          _id: {
            $in: participants,
          },
        },
        {
          $push: {
            notifications: {
              $each: [notification],
              $slice: -50,
            },
          },
        }
      );
      return res.ok(doc);
    } catch (err) {
      console.log("unfinalize column failed:", err);
      next(err);
    }
  },
};
