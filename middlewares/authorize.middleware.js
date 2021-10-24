const Admin = require('models').Admin;
const mongoose = require('mongoose');
module.exports = async function (req, res, next) {
    let userId = req.user.id;
    const admin = await Admin.findOne({ userId: mongoose.Types.ObjectId(userId) });
    if (!admin) { 
        return res.forbidden('No authority', 'You had no permission to do this');
    }
    next();
}