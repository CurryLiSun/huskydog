var express = require('express');
var router = express.Router();

// Signature validation
const crypto = require('crypto');
const channelSecret = "6fef8cd1c18dc2db6786c887b613652f"; // Channel secret string
const channelToken = "LJb2VigkfYE0/+WZAfxLAEwPdC9hmqvMK9jPkT7RahK5/Mc9lyxqRlGF4CHVgujG+oHIO0dExRsy7hi6E0k1pPlO0Nvi9WTjZD32j4T+k1jhiLSNEO3q0N3J0r0yEwlg8DVHGBZljYnllBglZ5gzFAdB04t89/1O/w1cDnyilFU=+oHIO0dExRsy7hi6E0k1pPlO0Nvi9WTjZD32j4T+k1iohERZWZE+en72+aeg0DixqLTHbTQQVIz7DCAzA+9u3wdB04t89/1O/w1cDnyilFU="; //Channel secret string

// set reply message setting
const line = require('@line/bot-sdk');

const client = new line.Client({
    channelSecret: channelSecret,
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
    let replyType = req.body.events[0].type;
    let replySource = req.body.events[0].source;
    let reqMsg = req.body.events[0].message;

    //log reqest item
    console.log(req.body);
    console.log(replyType);
    console.log(reqMsg);
    // console.log(replyToken);
    // console.log(reqMsg.text);

    switch (replyType) {
        case "follow":

        break;

        case "unfollow":

        break;

        case "join":
            BotJoin(res, replyToken, replySource);
        break;
        
        case "leave":

        break;
    
        default:
            //response the same word in requset
            let message = {
                type: 'text',
                text: reqMsg.text
            };

            client.replyMessage(replyToken, message)
                .then(() => {
                    console.log("replyMessage success");
                    res.sendStatus(200);
                })
                .catch((err) => {
                // error handling
                    //console.log(err);
                    res.send(err);
                }); 
        break;
    }

    //res.sendStatus(200);
});

function BotJoin(res, replyToken, replySource){
    //greeting word
    //response the same word in requset
    let message = {
        type: 'text',
        text: "汪汪汪汪汪汪汪(真開心又可以對一群人說話了)!"
    };

    client.pushMessage(replySource.groupId, message)
        .then(() => {
            console.log("replyMessage success");
            res.sendStatus(200);
        })
        .catch((err) => {
        // error handling
            //console.log(err);
            res.send(err);
        }); 
    console.log("BotJoin End!");
}

function BotLeave(){
    //clear db data
}

module.exports = router;