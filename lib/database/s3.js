require("dotenv").config();
require("rootpath")();

const S3 = require("aws-sdk/clients/s3");
const config = require("config");
const fs = require("fs");

const s3 = new S3({
  region: config.db.s3.region,
  accessKeyId: config.db.s3.accessKey,
  secretAccessKey: config.db.s3.secretKey,
});

function uploadFile(file) {
  const fileStream = fs.createReadStream(file.path);
  const params = {
    Bucket: config.db.s3.name,
    Body: fileStream,
    Key: file.filename,
  };
  return s3.upload(params).promise();
}

function getFile(fileKey) {
  const params = {
    Key: fileKey,
    Bucket: config.db.s3.name,
  };
  const objStream = s3.getObject(params).createReadStream();
  return objStream;
}

module.exports = {
  uploadFile: uploadFile,
  getFile: getFile,
};
