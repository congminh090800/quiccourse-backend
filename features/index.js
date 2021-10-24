const express = require("express");
const router = express.Router();

router.use(require('./user/route'));
router.use(require('./course/route'));

module.exports = router;