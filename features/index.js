const express = require("express");
const router = express.Router();

router.use(require("./user/route"));
router.use(require("./course/route"));
router.use(require("./upload/route"));
router.use(require("./google-signin/route"));
router.use(require("./grade/route"));
router.use(require("./notification/route"));
module.exports = router;
