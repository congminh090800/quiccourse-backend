const express = require('express');
const router = express.Router();
const controller = require('./controller');
const validator = require('middlewares/validator.middleware');
const requestSchema = require('./validator');
const authenticate = require('middlewares/authenticate.middleware');
const authorize = require('middlewares/authorize.middleware');

router.post(
    '/signup',
    validator(requestSchema.signUp),
    controller.signUp,
);

router.post(
    '/signin',
    validator(requestSchema.signIn),
    controller.signIn,
);

router.post(
    '/createAdmin',
    authenticate,
    authorize,
    controller.createAdmin,
);

module.exports = router;