const { S3 } = require('@aws-sdk/client-s3');
const Moleculer = require('moleculer');
const winston = require('winston');
const fs = require('fs');
const path = require('path');
const { createGzip } = require('zlib');
const { promisify } = require('util');
const { pipeline } = require('stream');
const pipe = promisify(pipeline);

const s3 = new S3({
  region: 'ap-southeast-1',
  http_wire_trace: true
});

function getDailyRotateFileLogger (logger) {
  let dailyLogger = null;

  const winstonLogger = logger.appenders.find(l => {
    return (l instanceof Moleculer.Loggers.Winston);
  });
  if (winstonLogger) {
    dailyLogger = winstonLogger.winston.transports.find(t => t instanceof winston.transports.DailyRotateFile);
  }

  return dailyLogger;
}

async function upload (file) {
  const source = path.join(__dirname, '../', `${file}`);
  const dest = path.basename(source);
  const match = /(\d{4}-\d{2}-\d{2})/.exec(dest);
  const fileStream = fs.createReadStream(source);
  const gzip = createGzip({ level: 9 });
  // await pipe(fileStream, gzip, fs.createWriteStream(`/tmp/${dest}.gz`));
  // const f = fs.createWriteStream(`/tmp/${dest}.gz`);
  // return fileStream.pipe(gzip).pipe(f);
  console.log('put to ', `pud/${match[1]}/${dest}.gz`);
  return s3.putObject({
    Bucket: 'eko-temp-files',
    Key: `pud/${match[1]}/${dest}.gz`,
    Body: fileStream.pipe(gzip),
    ContentLength: fs.statSync(source).size,
    ContentType: 'application/zip',
    ContentEncoding: 'gzip'
  });
}

async function uploadLogToS3 (broker) {
  // Listen to event from daily log rotate logger
  const logger = getDailyRotateFileLogger(broker.logger);
  if (logger) {
    logger.on('rotate', async (oldFile, newFile) => {
      await upload(oldFile).catch(console.error);
    });
  }
}

module.exports = uploadLogToS3;
