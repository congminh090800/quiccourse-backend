const mongoose = require('mongoose');
const { Schema } = mongoose;

const mappingSchema = new Schema({
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    studentId: { type: String },
});

const Mapping = mongoose.model('Mapping', mappingSchema);
module.exports = Mapping;