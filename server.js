require('dotenv').config();
require('rootpath')();

const express = require('express');
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const baseResponse = require('lib/base-response');

const app = express();
const config = require('config');

// database initialize
const database = require('lib/database');
database.addPlugins();
database.connect();

// settings
app.use('/static', express.static(path.join(__dirname, 'public')));

app.use(baseResponse());

app.use(helmet());

app.use(cookieParser());

const limiter = rateLimit({
  windowMs: config.rateLimit.requests,
  max: config.rateLimit.duration
});
app.use(limiter);

app.use(cors());  

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const healthCheckFn = (req, res) => {
  let result = {
    app: config.app.name,
    description: config.app.description,
    version: config.app.version,
    health: 'OK',
    environment: app.get('env'),
    documentationLink: req.protocol + "://" + req.get('host') + '/api-docs',
  };

  res.json(result);
};
//paths
app.get('/', healthCheckFn);
app.get('/health', (req, res) => res.send('OK!'));

// documentation
require('config/swagger')(app);

app.use('/api', require('features'));

app.use(function (req, res) {
  res.notFound('Not Found');
});

app.use((err, req, res, next) => {
  console.log(err);
  res.serverInternalError(err.message);
});

app.listen(config.app.port, function () {
  console.log(`Server started at port ${config.app.port}`);
});