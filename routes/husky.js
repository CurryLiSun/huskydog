var express = require('express');
var router = express.Router();

// Signature validation
// const crypto = require('crypto');
// const channelSecret = "6fef8cd1c18dc2db6786c887b613652f"; // Channel secret string
// const channelToken = "LJb2VigkfYE0/+WZAfxLAEwPdC9hmqvMK9jPkT7RahK5/Mc9lyxqRlGF4CHVgujG+oHIO0dExRsy7hi6E0k1pPlO0Nvi9WTjZD32j4T+k1jhiLSNEO3q0N3J0r0yEwlg8DVHGBZljYnllBglZ5gzFAdB04t89/1O/w1cDnyilFU=+oHIO0dExRsy7hi6E0k1pPlO0Nvi9WTjZD32j4T+k1iohERZWZE+en72+aeg0DixqLTHbTQQVIz7DCAzA+9u3wdB04t89/1O/w1cDnyilFU="; //Channel secret string

// set reply message setting
// const line = require('@line/bot-sdk');

//set scraping setting
// var https = require('https');
// const axios = require('axios');
// const cheerio = require("cheerio");
// const siteUrl = "https://remoteok.io/";
// let siteUrl = "https://www.cwb.gov.tw/V8/C/";

//set line bot client
// const client = new line.Client({
//     channelSecret: channelSecret,
//     channelAccessToken: channelToken
// });

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

//postgre sql test
// var pgp = require("pg-promise")(/*options*/);
// var db = pgp("postgres://postgres:123456@localhost:5432/postgres");
// //heroku postgre sql test
// const { Pool } = require('pg');
// const herokuSql = new Pool({
//   connectionString: "postgres://tmawuwlnambrqa:baae8813144cdbcc4fbf8f2b1399447d8c2190efccca820b1fa73e47692f9dfc@ec2-54-235-100-99.compute-1.amazonaws.com:5432/ddlf5nv8ig28dh",
//   ssl: true
// });

//reconstruct
const lineBotFunctions = require("../public/javascripts/lineBotFunctions.js");

// POST method route
router.post('/testpost', async function (req, res) {
    console.log("---process testpost start---");
    //replyUrl = await getReslut(req.body.test);
    let replyImgUrl = await getCwbImg(req.body.test);
    
    //
    let profileTest = {
        displayName : "abcde"
    };
    let replyImgUrl = await lineBotFunctions.getCwbImg(req.body.test.split(";"),profileTest);
    
    //console.log("---replyImgUrl---",replyImgUrl);
    // console.log("testpost---",replyImgUrl);

    /*
    let isInsert = req.body.test.split(";");
    let insertValues = [isInsert[1], isInsert[2]];

    if (isInsert[0] === "學說話" && isInsert[1] !== "" && isInsert[2] !== "") {
        db
        .query("INSERT INTO keyword_mapping(keyword, message) VALUES($1, $2)", insertValues)
        .then()
        .catch(e => console.error(e));
    }

    db
    .query("SELECT * From keyword_mapping Where keyword = $1", isInsert[1])
    .then(function (data) {
        console.log("---DATA1:", data);
    })
    .catch(e => console.error(e));
    */

    //標籤三種:1.衛星 2.雷達 3.雨量
    // res.send(req.body);
    res.send(replyImgUrl);

    console.log("---process testpost end---");
});

// POST method route
router.post('/', function (req, res) {
    // get requset item
    let replyToken = req.body.events[0].replyToken;
    let reqType = req.body.events[0].type;
    let reqSource = req.body.events[0].source;
    let reqMsg = req.body.events[0].message;

    //log reqest item
    console.log("---reqSource---",reqSource);
    //console.log("---reqType---",reqType);
    console.log("---reqMsg---",reqMsg);
    // console.log(replyToken);

    switch (reqType) {
        case "follow":

        break;

        case "unfollow":

        break;

        case "join":
            lineBotFunctions.BotJoin(res, replyToken, reqSource);
        break;
        
        case "leave":

        break;
    
        default:
            lineBotFunctions.BotReplyMsg(res, replyToken, reqMsg, reqSource);
        break;
    }

    //res.sendStatus(200);
});

module.exports = router;