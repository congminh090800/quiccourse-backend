const { Course, User } = require("models");
const { generateRoomCode } = require("lib/regex-helpers");
const mongoose = require("mongoose");

module.exports = {
  create: async (req, res, next) => {
    try {
      const { body } = req;
      let existed;
      let code;
      do {
        code = generateRoomCode();
        console.log("code generated", code);
        existed = await Course.findOne({ code: code });
      } while (existed);
      for (let i = 0; i < body.participants.length; i++) {
        const valid = await User.findOne({
          deleted_flag: false,
          _id: mongoose.Types.ObjectId(body.participants[i]),
        });
        if (!valid) {
          return res.notFound(
            "Not Found",
            `Participan at index ${i} is invalid or deleted!`
          );
        }
      }
      const newCourse = await Course({
        name: body.name,
        section: body.section,
        subject: body.subject,
        room: body.room,
        owner: mongoose.Types.ObjectId(body.owner),
        code: code,
        backgroundImg: body.backgroundImg,
        participants: body.participants.map((participant) =>
          mongoose.Types.ObjectId(participant)
        ),
      });

      const saved = await newCourse.save();
      return res.ok(saved);
    } catch (err) {
      console.log("create course failed:", err);
      next(err);
    }
  },
  search: async (req, res, next) => {
    try {
      const { query } = req;
      const offset = Number(query.offset) || 0;
      const limit = Number(query.limit) || 10;
      let matchedOwners = [];
      if (query.owner) {
        matchedOwners = await User.find(
          { name: { $regex: query.owner, $options: "i" }, deleted_flag: false },
          "_id"
        );
      }

      const where = {
        deleted_flag: false,
      };

      if (query.owner) {
        where.owner = { $in: matchedOwners };
      }

      if (query.name) {
        where.name = { $regex: query.name, $options: "i" };
      }

      if (query.section) {
        where.section = { $regex: query.section, $options: "i" };
      }

      if (query.code) {
        where.code = query.code;
      }

      let options = {
        sort: { createdAt: -1 },
        populate: {
          path: "owner",
          select: "-password",
        },
        lean: true,
        offset: offset,
        limit: limit,
      };
      const courses = await Course.paginate(where, options);
      res.ok(courses);
    } catch (err) {
      console.log("search courses failed:", err);
      next(err);
    }
  },
  searchRelevant: async (req, res, next) => {
    try {
      const { query } = req;
      const offset = Number(query.offset) || 0;
      const limit = Number(query.limit) || 10;
      let matchedOwners = [];
      if (query.owner) {
        matchedOwners = await User.find(
          { name: { $regex: query.owner, $options: "i" }, deleted_flag: false },
          "_id"
        );
      }

      const where = {
        deleted_flag: false,
        $or: [
          {
            owner: mongoose.Types.ObjectId(req.user.id),
          },
          {
            participants: mongoose.Types.ObjectId(req.user.id),
          },
        ],
      };

      if (query.owner) {
        where.owner = { $in: matchedOwners };
      }

      if (query.name) {
        where.name = { $regex: query.name, $options: "i" };
      }

      if (query.section) {
        where.section = { $regex: query.section, $options: "i" };
      }

      if (query.code) {
        where.code = query.code;
      }

      let options = {
        sort: { createdAt: -1 },
        populate: {
          path: "owner participants",
          select: "name email",
        },
        lean: true,
        offset: offset,
        limit: limit,
      };
      const courses = await Course.paginate(where, options);
      res.ok(courses);
    } catch (err) {
      console.log("search courses failed:", err);
      next(err);
    }
  },
};
