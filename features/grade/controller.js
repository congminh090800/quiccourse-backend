const { writeToString } = require("@fast-csv/format");
const { Course, User } = require("models");
const mongoose = require("mongoose");
const csv = require("@fast-csv/parse");

module.exports = {
  generateStudentTemplate: async (req, res, next) => {
    try {
      const rows = [["Full name", "Student ID"]];
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
      csv
        .parseFile(req.file)
        .on("error", (error) => console.error(error))
        .on("data", (row) => console.log(`ROW=${JSON.stringify(row)}`))
        .on("end", (rowCount) => console.log(`Parsed ${rowCount} rows`));
      return res.ok(true);
    } catch (err) {
      console.log("upload student list failed:", err);
      next(err);
    }
  },
};
