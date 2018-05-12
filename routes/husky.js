var express = require('express');
var router = express.Router();

// Signature validation
const crypto = require('crypto');
const channelSecret = "6fef8cd1c18dc2db6786c887b613652f"; // Channel secret string
let body;  // Request body string
// const signature = crypto.createHmac('SHA256', channelSecret).update(body).digest('base64');

// Compare X-Line-Signature request header and the signature

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

// POST method route
router.post('/', function (req, res) {
    // console.log(req);
    res.send('This is post function!');
});

module.exports = router;