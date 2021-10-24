const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

module.exports = {
    addPlugins: () => {
        mongoose.plugin(mongoosePaginate);
        console.log("plugin: mongoose-paginate added");
    },
    connect: async () => {
        try {
            await mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@hcmus-course-db.ihhbe.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`);
            console.log("db connected");
        } catch (error) {
            console.log("db connect failed:", error);
        }
    },
};