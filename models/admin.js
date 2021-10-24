const mongoose = require('mongoose');
const { Schema } = mongoose;

const adminSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deleted_flag: { type: Boolean, default: false },
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;