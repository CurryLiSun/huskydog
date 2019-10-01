// line* set reply message setting
const line = require('@line/bot-sdk');
// line* Signature validation
const crypto = require('crypto');
const channelSecret = "6fef8cd1c18dc2db6786c887b613652f"; // Channel secret string
const channelToken = "LJb2VigkfYE0/+WZAfxLAEwPdC9hmqvMK9jPkT7RahK5/Mc9lyxqRlGF4CHVgujG+oHIO0dExRsy7hi6E0k1pPlO0Nvi9WTjZD32j4T+k1jhiLSNEO3q0N3J0r0yEwlg8DVHGBZljYnllBglZ5gzFAdB04t89/1O/w1cDnyilFU=+oHIO0dExRsy7hi6E0k1pPlO0Nvi9WTjZD32j4T+k1iohERZWZE+en72+aeg0DixqLTHbTQQVIz7DCAzA+9u3wdB04t89/1O/w1cDnyilFU="; //Channel secret string

//line* set line bot client
const client = new line.Client({
    channelSecret: channelSecret,
    channelAccessToken: channelToken
});

//scrap* set scraping setting
var https = require('https');
const axios = require('axios');
const cheerio = require("cheerio");
// const siteUrl = "https://remoteok.io/";
// let siteUrl = "https://www.cwb.gov.tw/V8/C/";

//db* postgre sql test
var pgp = require("pg-promise")(/*options*/);
var db = pgp("postgres://postgres:123456@localhost:5432/postgres");
//db* heroku postgre sql test
const { Pool } = require('pg');
const herokuSql = new Pool({
  connectionString: "postgres://tmawuwlnambrqa:baae8813144cdbcc4fbf8f2b1399447d8c2190efccca820b1fa73e47692f9dfc@ec2-54-235-100-99.compute-1.amazonaws.com:5432/ddlf5nv8ig28dh",
  ssl: true
});

module.exports = {
    testCallFunc: function () {
        console.log("---testCallFunc");
    },
    BotJoin: function (res, replyToken, replySource) {
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
    },
    BotLeave: function () {
        
    },
    searchKeyword: async function(source_str, getProfile, groupId){
        let message = null;
        let querySql = "SELECT * FROM keyword_mapping WHERE keyword = $1";
        let querySqlValues = [source_str[0]];
        // console.log("---search querySqlValues",querySqlValues);
        try {
            let herokuSqlClient = await herokuSql.connect();
            let doSqlResult = await herokuSqlClient.query(querySql, querySqlValues);
            let searchResult = doSqlResult.rows;
            let rowsCount = searchResult.length;
            // console.log("---search searchResult",searchResult);
            // console.log("---search rowsCount",rowsCount);
            //random get rows
            let randomRow = Math.floor(Math.random()*rowsCount);
            // console.log("---search randomRow",randomRow);
            if (searchResult[0] === null || searchResult[0] === undefined) {
                return null;
            }else{
                // reply searched message
                message = [
                {
                    type: 'text',
                    text: searchResult[randomRow].message
                }];
            }
            // console.log('---pages/db', result );
            herokuSqlClient.release();
        } catch (err) {
            console.error("---error",err);
        }
        
        return message;
    },
    learnKeyword: async function(source_str, getProfile, groupId){
        //check learn keyword process
        if (source_str[0] !== "學說話") {
            return null;
        }
        //check learn keyword have value
        if (source_str[1] === "" || source_str[2] === "") {
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
    },
    randomToReply: async function() {
        let a = Math.floor(Math.random()*100)+1;
        let b = Math.floor(Math.random()*10)+1;
        console.log("---a",a);
        console.log("---b",b);
        if (a === b) {
            return a;
        }else{
            return null;
        }
    },
    fetchData: async function(customerUrl){
        // console.log(customerUrl);
        // console.log(siteUrl+customerUrl);
        let result = await axios.get(customerUrl);
        
        return cheerio.load(result);
    },
    uploadToImgur: async function(webUrl) {
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
    },
    BotReplyMsg: async function (res, replyToken, reqMsg, reqSource) {
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
            console.log("---error",err);
        });

        let message = null;
        let randomNum = await this.randomToReply().then();

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
                    message = await this.getCwbImg(spiltStr, getProfile);
                }
                //learn keyword
                if (message === null) {
                    message = await this.learnKeyword(spiltStr, getProfile, reqSource.groupId);
                }
                //search keyword
                if (message === null) {
                    message = await this.searchKeyword(spiltStr, getProfile, reqSource.groupId);
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

        this.testPushFunc(res, reqSource.userId, replyToken, message);

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
    },
    getCwbImg: async function (selectPage, getProfile) {
        let resultUrl = "";
        let customerUrl = "";
        // define search point & split point
        let splitStr = "";
        let idxSplitPoint = 0;
        let idxStrHead = ":\'";
        let idxStrEnd = "\',";
        let onlyRainUrl = "";

        console.log("---getCwb",selectPage);
    
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
    },
    FollowBot: function (res, replyToken, replySource) {
        console.log("---Follow bot running");

        res.sendStatus(200);
    },
    UnFollowBot: function (res, replyToken, replySource) {
        console.log("---Unfollow bot running");

        res.sendStatus(200);
    },
    testPushFunc: function (res, userId, replyToken, message) {
        client.pushMessage(userId, message)
        .then(() => {
            console.log("pushMessage success");
            // res.sendStatus(200);
        })
        .catch((err) => {
        // error handling
            console.log(err);
            // res.send(err);
        }); 
    },
};