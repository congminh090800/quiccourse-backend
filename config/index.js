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
    s3: {
      name: process.env.AWS_BUCKET_NAME,
      region: process.env.AWS_BUCKET_REGION,
      accessKey: process.env.AWS_BUCKET_ACCESS_KEY,
      secretKey: process.env.AWS_BUCKET_SECRET_KEY,
    },
  },
  rateLimit: {
    requests: process.env.RATE_LIMIT_REQUESTS,
    duration: process.env.RATE_LIMIT_DURATION,
  },
  secret: {
    accessToken: process.env.ACCESS_TOKEN_SECRET,
    expiresIn: "86400000",
    refreshToken: process.env.REFRESH_TOKEN_SECRET,
  },
  google: {
    authorizeKey: process.env.GOOGLE_AUTHORIZATION_KEY,
    authorizeUrl:
      process.env.GOOGLE_AUTHORIZATION_URL ||
      "https://www.googleapis.com/oauth2/v3/",
  },
};

module.exports = config;
