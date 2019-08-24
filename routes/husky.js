var express = require('express');
var router = express.Router();

// Signature validation
const crypto = require('crypto');
const channelSecret = "6fef8cd1c18dc2db6786c887b613652f"; // Channel secret string
let body;  // Request body string
//const signature = crypto.createHmac('SHA256', channelSecret).update(body).digest('base64');
// const signature = crypto.createHmac('SHA256', channelSecret).update(body).digest('base64');

// Compare X-Line-Signature request header and the signature

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

// POST method route
router.post('/', function (req, res) {
    // get requset item
    let replyToken = req.body.events[0].replyToken;
    let reqMsg = req.body.events[0].message;

    console.log(req.body);
    console.log(replyToken);
    console.log(reqMsg);
    res.send(req.body);
});

module.exports = router;