const mongoose = require('mongoose');
const { Schema } = mongoose;

const invitationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    key: { type: String },
    isUsed: { type: Boolean, default: false },
});

const Invitation = mongoose.model('Invitation', invitationSchema);
module.exports = Invitation;