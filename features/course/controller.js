const { Course, User, Invitation } = require("models");
const { generateRoomCode } = require("lib/regex-helpers");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const config = require("../../config");

module.exports = {
  create: async (req, res, next) => {
    try {
      const { body } = req;
      let existed;
      let code;
      do {
        code = generateRoomCode();
        existed = await Course.findOne({ code: code });
      } while (existed);
      let participants = body.participants;
      if (participants) {
        for (let i = 0; i < body.participants.length; i++) {
          const valid = await User.findOne({
            deleted_flag: false,
            _id: mongoose.Types.ObjectId(body.participants[i]),
          });
          if (!valid) {
            return res.notFound(
              `Participan at index ${i} is invalid or deleted!`,
              `Participan at index ${i} is invalid or deleted!`
            );
          }
        }
      }
      const newCourse = await Course({
        name: body.name,
        section: body.section,
        subject: body.subject,
        room: body.room,
        owner: mongoose.Types.ObjectId(body.owner),
        code: code,
        backgroundImg: body.backgroundImg ? body.backgroundImg : "",
        participants: participants
          ? participants.map((participant) =>
              mongoose.Types.ObjectId(participant)
            )
          : [],
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
          path: "owner participants teachers",
          select: "-password -accessToken -refreshToken",
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
          {
            teachers: mongoose.Types.ObjectId(req.user.id),
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
          path: "owner participants teachers",
          select: "-password -accessToken -refreshToken",
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
  participate: async (req, res, next) => {
    try {
      const { codeRoom } = req.params;
      const { id } = req.user;
      console.log("info", codeRoom, id);
      const selectedCourse = await Course.findOne({
        code: codeRoom,
        deleted_flag: false,
      });

      if (!selectedCourse) {
        return res.notFound("Class does not exist", "Class does not exist");
      }

      if (selectedCourse.participants.includes(id)) {
        return res.badRequest(
          "User are already in the class",
          "User are already in the class"
        );
      }

      const updated = await Course.findOneAndUpdate(
        { _id: selectedCourse._id, deleted_flag: false },
        {
          $push: {
            participants: id,
          },
        },
        {
          new: true,
        }
      );
      return res.ok(updated);
    } catch (err) {
      console.log("participate failed", err);
      next(err);
    }
  },
  createInvitationLink: async (req, res, next) => {
    const { courseCode } = req.params;

    try {
      const course = await Course.findOne({ code: courseCode });

      if (!course) {
        return res.notFound("Class does not exist", "Class does not exist");
      }

      if (course.owner.toString() !== req.user.id) {
        return res.badRequest(
          "You are not the owner of this class",
          "INVALID_OWNER"
        );
      }

      const currentDate = new Date();
      const expiredDate = new Date().setHours(currentDate.getHours() + 12); //Set expired date to 12 hours later

      await Course.findByIdAndUpdate(course._id, {
        invitation_expired_date: expiredDate,
      });

      return res.ok({ expiredDate });
    } catch (error) {
      console.log("Create invitation link failed", error);
      next(error);
    }
  },
  participateByLink: async (req, res) => {
    try {
      const userId = req.user.id;
      const code = req.params.courseCode;

      let course = await Course.findOne({ code: code });
      if (!course) {
        return res.notFound("Invitation key invalid", "INVALID_INVITAION_KEY");
      }

      const isExpired = course.invitation_expired_date < Date.now();
      if (isExpired) {
        return res.forbidden(
          "Invitation key is expired",
          "EXPIRED_INVITATION_KEY"
        );
      }

      if (course.participants.includes(userId)) {
        return res.badRequest(
          "User are already in the class",
          "User are already in the class"
        );
      }

      course.participants.push(userId);
      await Course.findByIdAndUpdate(course.id, {
        $push: {
          participants: userId,
        },
      });
      res.ok(true);
    } catch (err) {
      console.log(err);
    }
  },
  detail: async (req, res, next) => {
    try {
      const { code } = req.params;
      const where = {
        code: code,
        deleted_flag: false,
        $or: [
          {
            owner: mongoose.Types.ObjectId(req.user.id),
          },
          {
            participants: mongoose.Types.ObjectId(req.user.id),
          },
          {
            teachers: mongoose.Types.ObjectId(req.user.id),
          },
        ],
      };
      const removedFields = "-password -accessToken -refreshToken";
      const course = await Course.findOne(where)
        .populate("owner", removedFields)
        .populate("teachers", removedFields)
        .populate("participants", removedFields);
      if (!course) {
        return res.badRequest(
          "Require course's existence and you are in this class",
          "Bad request"
        );
      }
      return res.ok(course);
    } catch (err) {
      console.log("search courses failed:", err);
      next(err);
    }
  },
  sendInvitationEmail: async (req, res) => {
    const { emails } = req.body;
    const course = req.course;
    const userId = req.user.id;
    const requestHost = req.get("origin");

    if (!course.owner.equals(userId)) {
      return res.forbidden("Forbiden", "NO_PERMISSION_USER");
    }

    try {
      const transporter = nodemailer.createTransport(config.nodemailerConfig);

      const acceptLink = `${requestHost}/courses/paticipate/${course.code}`;

      const mailOptions = await transporter.sendMail({
        from: '"HCMUS Course" <course@hcmus.com>', // sender address
        to: emails.join(), // list of receivers
        subject: "Join class invitation ✔", // Subject line
        html:
          "<p>Click <a href=" +
          acceptLink +
          ">this link</a> to accept join class invitation</p>", // html body
      });

      transporter.sendMail(mailOptions, (err) => {
        if (err) return res.failure(err.message, err.name);
        res.ok(true);
      });
    } catch (err) {
      console.log(err);
    }
  },
  sendTeachersInvitationEmail: async (req, res) => {
    const { emails } = req.body;
    const course = req.course;
    const requestUserId = req.user.id;
    const requestHost = req.get("origin");

    if (!course.owner.equals(requestUserId)) {
      return res.forbidden("Forbiden", "NO_PERMISSION_USER");
    }

    const users = await User.find({ email: { $in: emails } });

    try {
      const transporter = nodemailer.createTransport(config.nodemailerConfig);
      for (let user of users) {
        if (user._id !== requestUserId) {
          const timestamp = Date.now();
          const key = `${timestamp}!${course.code}`;
          let invitation = new Invitation({
            userId: user._id,
            courseId: course._id,
            key: key,
          });

          invitation = await invitation.save();

          const acceptLink = `${requestHost}/courses/participate/${key}`;

          const mailOptions = await transporter.sendMail({
            from: "HCMUS Course <hcmus.course@gmail.com>", // sender address
            to: user.email, // list of receivers
            subject: "Join class invitation ✔", // Subject line
            html: `<p>Click <a href="${acceptLink}">this link</a> to accept join class invitation</p>`, // html body
          });

          transporter.sendMail(mailOptions, (err) => {
            if (err) return res.failure(err.message, err.name);
          });
        }
      }
      res.ok(true);
    } catch (err) {
      console.log(err);
    }
  },
  teacherParticipateByLink: async (req, res) => {
    const requestUserId = req.user.id;
    const key = req.params.key;
    const extractedKey = key.split("!");
    const timestamp = extractedKey[0];

    if (new Date(timestamp) < Date.now()) {
      return res.forbidden(
        "Invitation key is expired",
        "EXPIRED_INVITATION_KEY"
      );
    }

    try {
      const invitation = await Invitation.findOne({ key: key });
      if (!invitation) {
        return res.badRequest(
          "Invitation key invalid",
          "INVALID_INVITAION_KEY"
        );
      }

      if (!invitation.userId.equals(requestUserId)) {
        return res.forbidden("Forbiden", "NO_PERMISSION_USER");
      }

      if (invitation.isUsed) {
        return res.badRequest(
          "Invitation key is used",
          "INVALID_INVITAION_KEY"
        );
      }

      const course = await Course.findById(invitation.courseId);
      if (!course) {
        return res.notFound("Class does not exist", "CLASS_NOT_EXISTS");
      }

      if (course.participants.includes(requestUserId)) {
        return res.badRequest(
          "User is already in the class",
          "USER_ALREADY_IN_CLASS"
        );
      }

      if (course.teachers.includes(requestUserId)) {
        return res.badRequest(
          "User is already a teacher in the class",
          "USER_ALREADY_IN_CLASS"
        );
      }

      await Course.findByIdAndUpdate(course.id, {
        $push: { teachers: requestUserId },
      });
      await Invitation.findByIdAndUpdate(invitation.id, { isUsed: true });

      res.ok(true);
    } catch (err) {
      console.log(err);
    }
  },
};
