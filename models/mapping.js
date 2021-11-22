const mongoose = require('mongoose');
const { Schema } = mongoose;

const mappingSchema = new Schema({
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    studentId: { type: String },
    deleted_flag: { type: Boolean, default: false },
});

const Mapping = mongoose.model('Mapping', mappingSchema);
module.exports = Mapping;