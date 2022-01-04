const { Admin, User, Course } = require("models");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const config = require("config");
const mongoose = require("mongoose");

module.exports = {
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const admin = await Admin.findOne({ email: email, deleted_flag: false });

      if (!admin) {
        return res.badRequest("Email does not exist", "EMAIL_NOT_EXISTS", {
          fields: ["email"],
        });
      }

      const matched = bcrypt.compareSync(password, admin.password);
      if (!matched) {
        return res.unauthorized("Unauthorized", "UNAUTHORIZED");
      }

      const accessToken = jwt.sign(
        { id: admin._id },
        config.secret.accessToken,
        { expiresIn: config.secret.accessExpiresIn }
      );
      const refreshToken = jwt.sign(
        { id: admin._id },
        config.secret.refreshToken,
        { expiresIn: config.secret.expiresIn }
      );

      admin.password = undefined;
      return res.ok({
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiredAt: Date.now() + Number(config.secret.expiresIn),
        accessExpiredAt: Date.now() + Number(config.secret.accessExpiresIn),
        user: admin,
      });
    } catch (err) {
      console.log("log in failed:", err);
      next(err);
    }
  },
  createAdmin: async (req, res, next) => {
    try {
      const { body } = req;
      const email = String(body.email).trim().toLowerCase();
      const existed = await Admin.findOne({ email: email });

      if (existed) {
        return res.badRequest(
          "Email is already existed",
          "EMAIL_EXISTS_ALREADY",
          {
            fields: ["email"],
          }
        );
      }

      const salt = bcrypt.genSaltSync(10);
      const hashPassword = bcrypt.hashSync(body.password, salt);
      const newAdmin = await Admin({
        email: email,
        password: hashPassword,
        name: body.name,
      });
      const saved = await newAdmin.save();
      return res.ok(saved);
    } catch (err) {
      console.log("create admin failed:", err);
      next(err);
    }
  },
  searchAdmin: async (req, res, next) => {
    try {
      const { query } = req;
      const offset = Number(query.offset) || 0;
      const limit = Number(query.limit) || 10;
      const timeOrder = query.timeOrder === "ASC" ? 1 : -1;
      const where = {};
      if (query.name) {
        where.name = { $regex: query.name, $options: "i" };
      }
      let options = {
        sort: { createdAt: timeOrder },
        lean: true,
        select: "-password",
        offset: offset,
        limit: limit,
      };
      const admins = await Admin.paginate(where, options);
      return res.ok(admins);
    } catch (err) {
      console.log("search admins failed:", err);
      next(err);
    }
  },
  adminDetail: async (req, res, next) => {
    try {
      const { id } = req.params;
      const existed = await Admin.findOne(
        {
          _id: mongoose.Types.ObjectId(id),
        },
        "-password"
      );
      if (!existed) {
        return res.notFound("Admin does not exist", "NOT_FOUND");
      }
      return res.ok(existed);
    } catch (err) {
      console.log("find admin by id failed", err);
      next(err);
    }
  },
  searchUser: async (req, res, next) => {
    try {
      const { query } = req;
      const offset = Number(query.offset) || 0;
      const limit = Number(query.limit) || 10;
      const timeOrder = query.timeOrder === "ASC" ? 1 : -1;

      const where = {};

      if (query.name) {
        where.name = { $regex: query.name, $options: "i" };
      }

      if (query.email) {
        where.email = { $regex: query.email, $options: "i" };
      }

      let options = {
        sort: { createdAt: timeOrder },
        lean: true,
        offset: offset,
        limit: limit,
      };
      const users = await User.paginate(where, options);
      return res.ok(users);
    } catch (err) {
      console.log("search users failed:", err);
      next(err);
    }
  },
  userDetail: async (req, res, next) => {
    try {
      const { id } = req.params;
      const existed = await User.findOne(
        {
          _id: mongoose.Types.ObjectId(id),
        },
        "-password -accessToken -refreshToken"
      );
      if (!existed) {
        return res.notFound("User does not exist", "NOT_FOUND");
      }
      return res.ok(existed);
    } catch (err) {
      console.log("find user by id failed", err);
      next(err);
    }
  },
  mapStudentId: async (req, res, next) => {
    try {
      const { id, studentId } = req.body;
      const existed = await User.findOne({ _id: mongoose.Types.ObjectId(id) });
      if (!existed) {
        return res.badRequest("User does not exist", "USER_NOT_EXISTS");
      }
      if (studentId) {
        const user = await User.findOne({
          studentId: studentId,
        });
        if (user) {
          return res.badRequest(
            "Student ID has already been mapped with another account",
            "BAD_REQUEST"
          );
        }
      }
      const updated = await User.findByIdAndUpdate(
        id,
        {
          studentId: studentId ? studentId : "",
        },
        {
          returnDocument: "after",
        }
      );
      return res.ok(updated);
    } catch (err) {
      console.log("map student id failed", err);
      next(err);
    }
  },
  lockAccount: async (req, res, next) => {
    try {
      const { id } = req.body;
      const existed = await User.findOne({ _id: mongoose.Types.ObjectId(id) });
      if (!existed) {
        return res.badRequest("User does not exist", "USER_NOT_EXISTS");
      }
      const updated = await User.findByIdAndUpdate(
        id,
        {
          isBlocked: true,
        },
        {
          returnDocument: "after",
        }
      );
      return res.ok(updated);
    } catch (err) {
      console.log("lock account failed", err);
      next(err);
    }
  },
  unlockAccount: async (req, res, next) => {
    try {
      const { id } = req.body;
      const existed = await User.findOne({ _id: mongoose.Types.ObjectId(id) });
      if (!existed) {
        return res.badRequest("User does not exist", "USER_NOT_EXISTS");
      }
      const updated = await User.findByIdAndUpdate(
        id,
        {
          isBlocked: false,
        },
        {
          returnDocument: "after",
        }
      );
      return res.ok(updated);
    } catch (err) {
      console.log("unlock account failed", err);
      next(err);
    }
  },
  searchCourse: async (req, res, next) => {
    try {
      const { query } = req;
      const offset = Number(query.offset) || 0;
      const limit = Number(query.limit) || 10;
      const timeOrder = query.timeOrder === "ASC" ? 1 : -1;
      const where = {};
      if (query.name) {
        where.name = { $regex: query.name, $options: "i" };
      }
      let options = {
        sort: { createdAt: timeOrder },
        lean: true,
        select: "-password",
        offset: offset,
        limit: limit,
      };
      const courses = await Course.paginate(where, options);
      return res.ok(courses);
    } catch (err) {
      console.log("search courses failed:", err);
      next(err);
    }
  },
  courseDetail: async (req, res, next) => {
    try {
      const { id } = req.params;
      const existed = await Course.findOne({
        _id: mongoose.Types.ObjectId(id),
      });
      if (!existed) {
        return res.notFound("Course does not exist", "NOT_FOUND");
      }
      return res.ok(existed);
    } catch (err) {
      console.log("find course by id failed", err);
      next(err);
    }
  },
};
