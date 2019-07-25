const express = require('express');
const router = express.Router();
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const config = require('../config');

aws.config.update({
  secretAccessKey: config.awsSecretAccessKey,
  accessKeyId: config.awsAccessKeyId,
  region: config.region
});

const s3 = new aws.S3()

const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'application/pdf') {
    cb(null, true);
  }
  else {
    cb(new Error('Invalid file type. Only PDFs are allowed'), false);
  }
}

const upload = multer({
  fileFilter,
  storage: multerS3({
    s3,
    bucket: 'node-s3-upload-h',
    metadata: function (req, file, cb) {
      cb(null, Object.assign({}, req.body));
    },
    key: function (req, file, cb) {
      cb(null, 'files/' + file.originalname);
    },
    contentType: (req, file, cb) => { 
      console.log(file);
      cb(null, file.mimetype ? file.mimetype : multerS3.AUTO_CONTENT_TYPE);
    },
    contentDisposition: 'attachment'
  })
})

const singleFileUpload = upload.single('file');

router.post('/upload', (req, res) => {
    singleFileUpload(req, res, (err) => {
    if(err) {
      return res.status(422).json({
        error: err.message
      });
    }
    return res.json({
      'file-url': req.file.location
    });
  });
});

module.exports = router;
