const { writeToString } = require("@fast-csv/format");
const { Course } = require("models");
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

      if (selectedCourse.owner != id) {
        return res.badRequest("You are not the owner", "Permission denied");
      }
      const csvString = Buffer.from(req.file.buffer).toString();
      let errors = [];
      let enrolledStudents = [];
      let index = 1;
      csv
        .parseString(csvString, { headers: true })
        .on("error", (error) => {
          console.log(error);
          return res.badRequest("Error in reading csv", "Bad request");
        })
        .on("data", (row) => {
          if (!row.full_name || row.full_name.length < 3) {
            errors.push(`row ${index} full_name is null or less than 3 chars`);
          } else if (!row.student_id) {
            errors.push(`row ${index} student_id is null`);
          } else {
            enrolledStudents.push({
              fullName: row.full_name,
              studentId: row.student_id,
              courseId: mongoose.Types.ObjectId(courseId),
              grades: [],
              deleted_flag: false,
              _id: new mongoose.Types.ObjectId().toHexString(),
            });
          }
          index++;
        })
        .on("end", async (rowCount) => {
          try {
            const updated = await Course.findByIdAndUpdate(
              courseId,
              {
                enrolledStudents: enrolledStudents,
              },
              {
                overwrite: true,
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
      const validGradeCom = gradeStructure.find(gradeComponent => gradeComponent._id.equals(formattedComponentId));
      if (!validGradeCom) {
        return res.notFound("Grade component does not exist in grade stucture", "Not found");
      }
      let errors = [];
      let doc = {};
      for (const pointInfo of listPoints) {
        const enrolledStudents = selectedCourse.enrolledStudents || [];
        const validStudent = enrolledStudents.find(student => student.studentId === pointInfo.studentId);
        if (!validStudent) {
          errors.push(`Student ${pointInfo.studentId} is not exist in enrolled list`);
          continue;
        }
        if (Number(pointInfo.point) > validGradeCom.point) {
          errors.push(`Student ${pointInfo.studentId} can not be greater than ${validGradeCom.point}`);
          continue;
        }
        let grades = validStudent.grades || [];
        let updateMode = grades.find(grade => grade.gradeComponentId.equals(formattedComponentId));
        if (!updateMode) {
          grades.push({
            point: Number(pointInfo.point),
            gradeComponentId: formattedComponentId,
            _id: new mongoose.Types.ObjectId().toHexString(),
          });
        } else {
          grades = grades.map(grade => {
            if (grade.gradeComponentId.equals(formattedComponentId)) {
              return {
                ...grade,
                point: pointInfo.point,
              };
            };
            return grade;
          });
        }
        doc = await Course.findByIdAndUpdate(
          courseId,
          {
            '$set': {
              'enrolledStudents.$[el].grades': grades, 
            }
          },
          {
            arrayFilters: [
              {
                'el.studentId': pointInfo.studentId,
              }
            ],
            overwrite: true,
            returnDocument: "after",
          }
        );
      }
      return res.ok({
        document: doc,
        errors
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

      if (selectedCourse.owner != id) {
        return res.badRequest("You are not the owner", "Permission denied");
      }
      let enrolledStudents = selectedCourse.enrolledStudents || [];
      if (!enrolledStudents.find(student => studentId === student.studentId)) {
        const newStudent = {
          fullName,
          studentId,
          courseId,
          grades: [],
        };
        const updated = await Course.findByIdAndUpdate(
          courseId,
          {
            '$push': {
              enrolledStudents: newStudent,
            }
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
            '$set': {
              'enrolledStudents.$[el].fullName': fullName, 
            }
          },
          {
            arrayFilters: [
              {
                'el.studentId': studentId,
              }
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
      const validGradeCom = gradeStructure.find(gradeComponent => gradeComponent._id.equals(formattedComponentId));
      if (!validGradeCom) {
        return res.notFound("Grade component does not exist in grade stucture", "Not found");
      }
      let enrolledStudents = selectedCourse.enrolledStudents || [];
      let csvObject = [];
      for (let student of enrolledStudents) {
        let baseInfo = {
          student_id: student.studentId || "",
          full_name: student.fullName || "",
        }
        const pointColumnName = `${validGradeCom.point}-${validGradeCom.name}`;
        const grades = student.grades || [];
        const gradeInfo = grades.find(grade => grade.gradeComponentId.equals(mongoose.Types.ObjectId(gradeComponentId)));
        if (!gradeInfo) {
          csvObject.push({
            ...baseInfo,
            [pointColumnName]: null
          })
        } else {
          csvObject.push({
            student_id: student.studentId || "",
            full_name: student.fullName || "",
            [pointColumnName]: Number(gradeInfo.point) || 0,
          })
        }
      }

      const data = await writeToString(csvObject, { headers: true });
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
      const validGradeCom = gradeStructure.find(gradeComponent => gradeComponent._id.equals(formattedComponentId));
      if (!validGradeCom) {
        return res.notFound("Grade component does not exist in grade stucture", "Not found");
      }
      const csvString = Buffer.from(req.file.buffer).toString();
      let errors = [];
      let index = 1;
      csv.parseString(csvString, { headers: true })
      .on("error", (error) => {
        console.log(error);
        return res.badRequest("Error reading grade csv", "Bad request");
      })
      .on("data", async (row) => {
        const columnName = `${validGradeCom.point}-${validGradeCom.name}`;
        if (!row.student_id) {
          errors.push(`row ${index} student_id is null`);
        } else if (!row[columnName] || isNaN(row[columnName])) {
          errors.push(`row ${index} point must be a number`);
        } else if (Number(row[columnName]) >  validGradeCom.point) {
          errors.push(`row ${index} point must not exceed ${validGradeCom.point}`);
        } else {
          const enrolledStudents = selectedCourse.enrolledStudents || [];
          const validStudent = enrolledStudents.find(student => student.studentId === row.student_id);
          if (!validStudent) {
            errors.push(`row ${index} student_id does not exist in enrolled list`);
          } else {
            let grades = validStudent.grades || [];
            let updateMode = grades.find(grade => grade.gradeComponentId.equals(formattedComponentId));
            if (!updateMode) {
              grades.push({
                point: Number(row[columnName]),
                gradeComponentId: formattedComponentId,
                _id: new mongoose.Types.ObjectId().toHexString(),
              });
            } else {
              grades = grades.map(grade => {
                if (grade.gradeComponentId.equals(formattedComponentId)) {
                  return {
                    ...grade,
                    point: Number(row[columnName]),
                  };
                };
                return grade;
              });
            }
            doc = await Course.findByIdAndUpdate(
              courseId,
              {
                '$set': {
                  'enrolledStudents.$[el].grades': grades, 
                }
              },
              {
                arrayFilters: [
                  {
                    'el.studentId': row.student_id,
                  }
                ],
                overwrite: true,
                returnDocument: "after",
              }
            );
          }
        }
        index++;
      })
      .on("end", async (rowCount) => {
        try {
          const doc = await Course.findOne({
            _id: mongoose.Types.ObjectId(courseId),
            deleted_flag: false,
          });
          return res.ok({
            totalRows: rowCount,
            errors: errors,
            document: doc,
          });
        } catch (err) {
          console.log(err);
          return res.badRequest("Error occured", "Bad request");
        }
      });
    } catch (err) {
      console.log("upload grade failed", err);
      next(err);
    }
  }
};
