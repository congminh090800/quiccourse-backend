require("dotenv").config();
const pkg = require("package.json");

const config = {
  app: {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    port: Number(process.env.PORT) || 3000,
  },
  db: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  rateLimit: {
    requests: process.env.RATE_LIMIT_REQUESTS,
    duration: process.env.RATE_LIMIT_DURATION,
  },
  secret: {
    accessToken: process.env.ACCESS_TOKEN_SECRET,
  },
};

module.exports = config;
