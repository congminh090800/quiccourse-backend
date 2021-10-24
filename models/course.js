const mongoose = require('mongoose');
const { Schema } = mongoose;
const { validateRoomCode } = require('lib/regex-helpers');

const courseSchema = new Schema({
    name: {
        type: String,
        required: true,
        min: 3
    },
    section: {
        type: String,
        min: 3,
    },
    subject: {
        type: String,
        min: 3,
    },
    room: {
        type: String,
        min: 3,
    },
    code: {
        type: String,
        unique: true,
        validate: [validateRoomCode, 'Please fill a valid room code'],
        required: true,
        min: 5,
        max: 7,
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    backgroundImg: {
        type: String,
        default: '',
    },
    participants: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        default: [],
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deleted_flag: { type: Boolean, default: false },
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;