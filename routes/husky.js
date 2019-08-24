var express = require('express');
var router = express.Router();

// Signature validation
const crypto = require('crypto');
const channelSecret = "6fef8cd1c18dc2db6786c887b613652f"; // Channel secret string
const channelToken = "5lWQJsH5FrqDqArB6vgBS5wuZqyfhR4Uqfr1vJT57bxKRxOrSs1F72J5sEKiKBwq+oHIO0dExRsy7hi6E0k1pPlO0Nvi9WTjZD32j4T+k1iohERZWZE+en72+aeg0DixqLTHbTQQVIz7DCAzA+9u3wdB04t89/1O/w1cDnyilFU="; //Channel secret string

// set reply message setting
const line = require('@line/bot-sdk');

const client = new line.Client({
    channelAccessToken: channelToken
});

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
    //response the same word in requset
    let message = {
        type: 'text',
        text: reqMsg
    };
    
    client.replyMessage(replyToken, message)
        .then(() => {
        
        })
        .catch((err) => {
        // error handling
        });
    
    res.send(req.body);
});

module.exports = router;