const express = require('express');
const router = express.Router();
const controller = require('./controller');
const validator = require('middlewares/validator.middleware');
const requestSchema = require('./validator');
const authenticate = require('middlewares/authenticate.middleware');
const authorize = require('middlewares/authorize.middleware');

router.post(
    '/courses',
    authenticate,
    validator(requestSchema.create),
    controller.create,
);

router.get(
    '/courses',
    authenticate,
    authorize,
    validator(requestSchema.search, 'query'),
    controller.search,
);

router.get(
    '/courses/me',
    authenticate,
    validator(requestSchema.search, 'query'),
    controller.searchRelevant,
);
module.exports = router;