var express = require('express');
var router = express.Router();

//refactor function
const lineBotFunctions = require("../public/javascripts/lineBotFunctions.js");

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

//db* sequelize test
var models = require("../models");

// POST method route
router.post('/testpost', async function (req, res) {
    console.log("---process testpost start---");
    //replyUrl = await getReslut(req.body.test);
    // let replyImgUrl = await getCwbImg(req.body.test);
    // console.log("---req data",req.body.test);
    let hasProfile = false;
    let client_userId = req.body.test;

    await models.BotUsers.findAll({
        where: {
            userId: client_userId
        }
    }).then(function(users) {
        // console.log("---users",users);
        if (users[0]) {
            hasProfile = true;
        }
        
    });

    if (!hasProfile) {
        models.BotUsers.create({
            userId: client_userId, userAuth: 0, enable: false
        }).then(res => {
            console.log("---insert data", res);
        }).catch(err => {
            console.log("---err", err);
        });
    }

    if (hasProfile) {
        models.BotUsers.destroy({
            where: {
                userId: client_userId
            }
        }).then(() => {
            console.log("Done");
        }).catch(err => {
            console.log("---err", err);
        });
    }

    //標籤三種:1.衛星 2.雷達 3.雨量
    res.send(req.body);
    // res.send(replyImgUrl);

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
    // console.log("---res",res);

    switch (reqType) {
        case "follow":
            lineBotFunctions.FollowBot(res, replyToken, reqSource);
        break;

        case "unfollow":
            lineBotFunctions.UnFollowBot(res, replyToken, reqSource);
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

    res.sendStatus(200);
});

module.exports = router;