var express = require('express');
var router = express.Router();

// Signature validation
const crypto = require('crypto');
const channelSecret = "6fef8cd1c18dc2db6786c887b613652f"; // Channel secret string
const channelToken = "LJb2VigkfYE0/+WZAfxLAEwPdC9hmqvMK9jPkT7RahK5/Mc9lyxqRlGF4CHVgujG+oHIO0dExRsy7hi6E0k1pPlO0Nvi9WTjZD32j4T+k1jhiLSNEO3q0N3J0r0yEwlg8DVHGBZljYnllBglZ5gzFAdB04t89/1O/w1cDnyilFU=+oHIO0dExRsy7hi6E0k1pPlO0Nvi9WTjZD32j4T+k1iohERZWZE+en72+aeg0DixqLTHbTQQVIz7DCAzA+9u3wdB04t89/1O/w1cDnyilFU="; //Channel secret string

// set reply message setting
const line = require('@line/bot-sdk');

//set scraping setting
const axios = require('axios');
const cheerio = require("cheerio");
// const siteUrl = "https://remoteok.io/";
// let siteUrl = "https://www.cwb.gov.tw/V8/C/";
async function fetchData(customerUrl){
    // console.log(customerUrl);
    // console.log(siteUrl+customerUrl);
    const result = await axios.get(customerUrl);
    return cheerio.load(result.data);
}

async function getReslut(select_page){
    let customerUrl = "";
    let selector = ".zoomHolder  > img";
    console.log(select_page);
    //接收應讀取的項目
    switch (select_page) {
        case "衛星":
            // customerUrl = "W/OBS_Sat.html";
            customerUrl = "/Data/satellite/LCC_IR1_CR_1000/LCC_IR1_CR_1000.jpg";
        break;
        case "雷達":
            // customerUrl="W/OBS_Radar.html";
            customerUrl = "/Data/radar/CV1_1000.png";
        break;
        case "雨量":
            customerUrl = "P/Rainfall/Rainfall_QZJ.html";
            selector = "[role=tabpanel] > img";
        break;
        default:
            return null;
        break;
    }

    let $ = await fetchData("https://www.cwb.gov.tw"+customerUrl);
    // siteName = $('.top > .action-post-job').text();
    cwbImg = $("img").attr('src');
    console.log("https://www.cwb.gov.tw"+customerUrl);

    return cwbImg;
}

//set line bot client
const client = new line.Client({
    channelSecret: channelSecret,
    channelAccessToken: channelToken
});

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

// POST method route
router.post('/testpost', async function (req, res) {
    //replyUrl = await getReslut(req.body.test);
    // let spiltStr = req.body.test.split(";");
    let replyImgUrl = await getReslut(req.body.test);
    console.log(replyImgUrl);

    //標籤三種:1.衛星 2.雷達 3.雨量
    res.send(req.body);
});

// POST method route
router.post('/', function (req, res) {
    // get requset item
    let replyToken = req.body.events[0].replyToken;
    let replyType = req.body.events[0].type;
    let replySource = req.body.events[0].source;
    let reqMsg = req.body.events[0].message;

    //log reqest item
    console.log("---replySource---",replySource);
    //console.log("---replyType---",replyType);
    console.log("---reqMsg---",reqMsg);
    // console.log(replyToken);

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
            BotReplyMsg(res, replyToken, reqMsg);
        break;
    }

    //res.sendStatus(200);
});

async function BotReplyMsg(res, replyToken, reqMsg){
    let message;
    switch (reqMsg.type) {
        case "sticker":
            return null;
            message = {
                id: reqMsg.id,
                type: "sticker",
                stickerId: "51626520",
                packageId: "11538"
            }
        break;
        case "image":
            return null;
            message = {
                type: 'text',
                text: "汪汪汪汪汪! \n(幹嘛貼這種圖給我看)"
            };
        break;

        default:
            let spiltStr = reqMsg.text.split(";");
            let replyImgUrl = await getReslut(spiltStr[0]);
            
            if(replyImgUrl !== null){
                message = {
                    type: "image",
                    originalContentUrl: replyImgUrl,
                    previewImageUrl: replyImgUrl
                };
            }
            
            /*
            message = {
                type: 'text',
                text: reqMsg.text
            };
            */
        break;
    }

    client.replyMessage(replyToken, message)
        .then(() => {
            //console.log("replyMessage success");
            res.sendStatus(200);
        })
        .catch((err) => {
        // error handling
            //console.log(err);
            res.send(err);
        }); 
}

function BotJoin(res, replyToken, replySource){
    //greeting word
    let message = {
        type: 'text',
        text: "汪汪汪汪汪汪汪!! \n(真開心又可以對一群人說話了)"
    };

    client.pushMessage(replySource.groupId, message)
        .then(() => {
            //console.log("pushMessage success");
            res.sendStatus(200);
        })
        .catch((err) => {
        // error handling
            //console.log(err);
            res.send(err);
        }); 
}

function BotLeave(){
    //clear db data
}

module.exports = router;