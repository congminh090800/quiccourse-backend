const express = require("express");
const router = express.Router();

router.use(require("./user/route"));
router.use(require("./course/route"));
router.use(require("./upload/route"));
module.exports = router;
