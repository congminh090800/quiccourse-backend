const { Admin, User } = require('models');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');

module.exports = {
    signUp: async (req, res, next) => {
        try {
            const { body } = req;
            const email = String(body.email).trim().toLowerCase();
            const user = await User.findOne({ email: email });

            if (user) {
                return res.badRequest("EMAIL_EXISTS_ALREADY", "EMAIL_EXISTS_ALREADY", { fields: ['email'] });
            }

            const salt = bcrypt.genSaltSync(10);
            const hashPassword = bcrypt.hashSync(body.password, salt);
            const newUser = await User({
                email: email,
                password: hashPassword,
                phone: body.phone,
                name: body.name,
                birthDate: body.birthDate ? moment(body.birthDate).toDate() : moment().toDate(),
                gender: body.gender,
            });

            const saved = await newUser.save();
            return res.ok(saved._id);
        } catch (err) {
            console.log("sign up failed:", err);
            next(err);
        }
    },
    signIn: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email: email });

            if (!user) {
                return res.badRequest("EMAIL_NOT_EXISTS", "EMAIL_NOT_EXISTS", { fields: ['email'] });
            }

            const matched = bcrypt.compareSync(password, user.password);
            if (!matched) {
                return res.unauthorized("UNAUTHORIZED", "UNAUTHORIZED");
            }

            const accessToken = jwt.sign({id: user._id}, config.secret.accessToken);
            return res.ok(accessToken);
        } catch (err) {
            console.log("sign in failed:", err);
            next(err);
        }        
    },
    createAdmin: async (req, res, next) => {
        try { 
            const userId = req.body.userId;
            const valid = await User.findOne({ _id: mongoose.Types.ObjectId(userId), deleted_flag: false });
            if (!valid) {
                return res.notFound("Not Found", "User not found");
            }

            const validAdmin = await Admin.findOne({ userId: mongoose.Types.ObjectId(userId), deleted_flag: false });
            if (validAdmin) {
                return res.badRequest("Bad Request", "This user is already an admin");
            }

            const newAdmin = await Admin({
                userId: mongoose.Types.ObjectId(userId),
            });
            const saved = await newAdmin.save();
            res.ok(saved);
        } catch (err) {
            console.log("create admin failed", err);
            next(err);
        }
    }
}