var express = require('express');
var router = express.Router();

// Signature validation
const crypto = require('crypto');
const channelSecret = "6fef8cd1c18dc2db6786c887b613652f"; // Channel secret string
const channelToken = "LJb2VigkfYE0/+WZAfxLAEwPdC9hmqvMK9jPkT7RahK5/Mc9lyxqRlGF4CHVgujG+oHIO0dExRsy7hi6E0k1pPlO0Nvi9WTjZD32j4T+k1jhiLSNEO3q0N3J0r0yEwlg8DVHGBZljYnllBglZ5gzFAdB04t89/1O/w1cDnyilFU=+oHIO0dExRsy7hi6E0k1pPlO0Nvi9WTjZD32j4T+k1iohERZWZE+en72+aeg0DixqLTHbTQQVIz7DCAzA+9u3wdB04t89/1O/w1cDnyilFU="; //Channel secret string

// set reply message setting
const line = require('@line/bot-sdk');

//set scraping setting
var https = require('https');
const axios = require('axios');
const cheerio = require("cheerio");
// const siteUrl = "https://remoteok.io/";
// let siteUrl = "https://www.cwb.gov.tw/V8/C/";

//set line bot client
const client = new line.Client({
    channelSecret: channelSecret,
    channelAccessToken: channelToken
});

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

//reconstruct
const test = require("../public/javascripts/lineBotFunctions.js");
//postgre sql test
var pgp = require("pg-promise")(/*options*/);
var db = pgp("postgres://postgres:123456@localhost:5432/postgres");
//heroku postgre sql test
const { Pool } = require('pg');
const herokuSql = new Pool({
  connectionString: "postgres://tmawuwlnambrqa:baae8813144cdbcc4fbf8f2b1399447d8c2190efccca820b1fa73e47692f9dfc@ec2-54-235-100-99.compute-1.amazonaws.com:5432/ddlf5nv8ig28dh",
  ssl: true
});

// POST method route
router.post('/testpost', async function (req, res) {
    console.log("---process testpost start---");
    //replyUrl = await getReslut(req.body.test);
    let replyImgUrl = await getCwbImg(req.body.test);
    //console.log("---replyImgUrl---",replyImgUrl);
    // console.log("testpost---",replyImgUrl);

    //reconstruct
    console.log(test) // => "This is a test!"

    try {
        let herokuSqlClient = await herokuSql.connect()
        let doSqlResult = await herokuSqlClient.query('SELECT * FROM keyword_mapping');
        let result = doSqlResult.rows;
        console.log('---pages/db', result );
        herokuSqlClient.release();
    } catch (err) {
        console.error(err);
    }

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
    res.send(req.body);
    // res.send(randomToReply());

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
            BotJoin(res, replyToken, reqSource);
        break;
        
        case "leave":

        break;
    
        default:
            BotReplyMsg(res, replyToken, reqMsg, reqSource);
        break;
    }

    //res.sendStatus(200);
});

async function BotReplyMsg(res, replyToken, reqMsg, reqSource){
    //get member info
    let getProfile = await client.getGroupMemberProfile(reqSource.groupId, reqSource.userId)
    .then((profile) => {
        // console.log(profile.displayName);
        // console.log(profile.userId);
        // console.log(profile.pictureUrl);
        // console.log(profile.statusMessage);
        return profile;
    })
    .catch((err) => {
        // error handling
        console.log("---getProfile error",err);
    });

    let message = null;
    let randomNum = await randomToReply().then();

    switch (reqMsg.type) {
        case "sticker":
            if (randomNum !== null) {
                message = [
                {
                    type: 'text',
                    text: getProfile.displayName+"是個幸運的渾蛋"
                },
                {
                    type: 'text',
                    text: "以千分之一的機率抽中\'" + randomNum + "\'這個幸運數字"
                },
                {
                    id: reqMsg.id,
                    type: "sticker",
                    stickerId: "51626520",
                    packageId: "11538"
                }]
            }
        break;
        case "image":
            if (randomNum !== null) {
                message = [
                {
                    type: 'text',
                    text: getProfile.displayName+"是個幸運的渾蛋"
                },
                {
                    type: 'text',
                    text: "以千分之一的機率抽中\'" + randomNum + "\'這個幸運數字"
                }
            ];
            }
        break;

        case "text":
            //以;切割字串
            let spiltStr = reqMsg.text.split(";");
            //scrap cwb
            if (message === null) {
                message = await getCwbImg(spiltStr, getProfile);
            }
            //learn keyword
            if (message === null) {
                message = await learnKeyword(spiltStr, getProfile, reqSource.groupId);
            }
            //search keyword
            if (message === null) {
                message = await searchKeyword(spiltStr, getProfile, reqSource.groupId);
            }

            //random lucky number
            if (randomNum !== null) {
                message = [
                {
                    type: 'text',
                    text: getProfile.displayName+"是個幸運的渾蛋"
                },
                {
                    type: 'text',
                    text: "以千分之一的機率抽中\'" + randomNum + "\'這個幸運數字"
                },
                {
                    type: 'text',
                    text: reqMsg.text
                }];
            }

            /*
            message = {
                type: 'text',
                text: reqMsg.text
            };
            */
        break;

        default:
            return null;
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

    //get group user id ! but only for VIP
    /*
    client.getGroupMemberIds(replySource.groupId)
    .then((ids) => {
        ids.forEach((id) => console.log(id));
    })
    .catch((err) => {
        // error handling
        console.log("---greet error",err);
    });
    */

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

async function searchKeyword(source_str, getProfile, groupId){
    let message = null;
    let querySql = "SELECT * FROM keyword_mapping WHERE keyword = $1";
    let querySqlValues = [source_str[0]];
    // console.log("---search querySqlValues",querySqlValues);
    try {
        let herokuSqlClient = await herokuSql.connect();
        let doSqlResult = await herokuSqlClient.query(querySql, querySqlValues);
        let searchResult = doSqlResult.rows;
        let rowsCount = searchResult.length;
        console.log("---search searchResult",searchResult);
        console.log("---search rowsCount",rowsCount);
        //random get rows
        let randomRow = Math.floor(Math.random()*rowsCount);
        console.log("---search randomRow",randomRow);
        if (searchResult[0] === null || searchResult[0] === undefined) {
            return null;
        }else{
            // reply searched message
            message = [
            {
                type: 'text',
                text: searchResult[0].message
            }];
        }
        // console.log('---pages/db', result );
        herokuSqlClient.release();
    } catch (err) {
        console.error(err);
    }
    
    return message;
}

async function learnKeyword(source_str, getProfile, groupId){
    if (source_str[0] !== "學說話") {
        return null;
    }
    if (source_str[1] !== "" || source_str[2] !== "") {
        return null;
    }

    let querySql = "INSERT INTO keyword_mapping VALUES ('', $1, $2, $3)";
    let querySqlValues = [groupId, source_str[1], source_str[2]];
    console.log("---learnKeyword querySqlValues",querySqlValues);
    try {
        let herokuSqlClient = await herokuSql.connect();
        let doSqlResult = await herokuSqlClient.query(querySql, querySqlValues);
        searchResult = doSqlResult;
        
        console.log('---pages/db', searchResult );
        herokuSqlClient.release();
    } catch (err) {
        console.error(err);
    }

    //combine message
    let message = [
    {
        type: 'text',
        text: getProfile.displayName+"今天教我一句話"
    },
    {
        type: 'text',
        text: "如果聽到" + source_str[1] + "要回答" + source_str[2]
    }];

    return message;
}

async function randomToReply() {
    let a = Math.floor(Math.random()*100)+1;
    let b = Math.floor(Math.random()*10)+1;
    console.log("---a",a);
    console.log("---b",b);
    if (a === b) {
        return a;
    }else{
        return null;
    }
}

async function fetchData(customerUrl){
    // console.log(customerUrl);
    // console.log(siteUrl+customerUrl);
    let result = await axios.get(customerUrl);
    
    return cheerio.load(result);
}

async function uploadToImgur(webUrl) {
    //upload to imgur
    let resLink = "";
    let getLink = await axios({
        method: 'post',
        url: 'https://api.imgur.com/3/image',
        headers: { 'authorization': 'Client-ID 105b9032c7f67b2'},
        data: { image: webUrl}
    }).then(function(response) {
        resLink = response.data["data"]["link"];
        // console.log("---axios",response.data);
    }).catch(function(error) {
        console.log("---error",error);
    });
    // console.log("---getLink",resLink);
    return resLink;
}

async function getReslut(selectPage){
    let customerUrl = "";
    let selector = ".zoomHolder  > img";
    console.log("---getResult---",selectPage);
    //接收應讀取的項目
    switch (selectPage) {
        case "衛星":
            // customerUrl = "W/OBS_Sat.html";
            customerUrl = "https://www.cwb.gov.tw/Data/satellite/LCC_IR1_CR_1000/LCC_IR1_CR_1000.jpg";
        break;
        case "雷達":
            // customerUrl="W/OBS_Radar.html";
            customerUrl = "https://www.cwb.gov.tw/Data/radar/CV1_1000.png";
        break;
        case "雨量":
            customerUrl = "P/Rainfall/Rainfall_QZJ.html";
            selector = "[role=tabpanel] > img";
        break;
        default:
            return null;
        break;
    }
    
    //let $ = await fetchData(customerUrl);
    // siteName = $('.top > .action-post-job').text();
    // console.log("---get back $---",$);
    
    return uploadToImgur(customerUrl);
}

async function getCwbImg(selectPage, getProfile){
    let resultUrl = "";
    let customerUrl = "";
    // define search point & split point
    let splitStr = "";
    let idxSplitPoint = 0;
    let idxStrHead = ":\'";
    let idxStrEnd = "\',";
    let onlyRainUrl = "";

    switch (selectPage[0]) {
        case "衛星":
            // customerUrl = "W/OBS_Sat.html";
            customerUrl = "https://www.cwb.gov.tw/Data/js/obs_img/Observe_sat.js";
            resultUrl = "https://www.cwb.gov.tw/Data/satellite/";
            idxSplitPoint = 2;
            splitStr = "Area1";
        break;
        case "雷達":
            // customerUrl="W/OBS_Radar.html";
            customerUrl = "https://www.cwb.gov.tw/Data/js/obs_img/Observe_radar.js";
            resultUrl = "https://www.cwb.gov.tw/Data/radar/";
            idxSplitPoint = 1;
            splitStr = "Area0";
        break;
        case "雨量":
            customerUrl = "https://www.cwb.gov.tw/Data/js/rainfall/RainfallImg_Day.js";
            resultUrl = "https://www.cwb.gov.tw/Data/rainfall/";
            idxSplitPoint = 1;
            splitStr = "Day0";
            onlyRainUrl = ".jpg";
        break;
        default:
            return null;
        break;
    }

    let getLink = await axios({
        method: 'get',
        url: customerUrl,
    }).then(function(response) {
        resLink = response.data.split(splitStr);
        // console.log("---axios2",typeof(resLink.data));
        // console.log(CircularJSON.stringify(resLink));
        // console.log("---axios1",resLink.data);
        let a = resLink[idxSplitPoint].indexOf(idxStrHead);
        let b = resLink[idxSplitPoint].indexOf(idxStrEnd);
        
        resultUrl = resultUrl + resLink[idxSplitPoint].substring(a+2,b);
    }).catch(function(error) {
        console.log("---error",error);
    });

    //combine message
    let message = [
    {
        type: 'text',
        text: getProfile.displayName+"要找資料???"
    },
    {
        type: 'text',
        text: "這是中央氣象局的資料的啦!"
    },
    {
        type: "image",
        originalContentUrl: resultUrl + onlyRainUrl,
        previewImageUrl: resultUrl + onlyRainUrl
    }];

    return message;
}

module.exports = router;