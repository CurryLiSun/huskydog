// set reply message setting
const line = require('@line/bot-sdk');
// Signature validation
const crypto = require('crypto');
const channelSecret = "6fef8cd1c18dc2db6786c887b613652f"; // Channel secret string
const channelToken = "LJb2VigkfYE0/+WZAfxLAEwPdC9hmqvMK9jPkT7RahK5/Mc9lyxqRlGF4CHVgujG+oHIO0dExRsy7hi6E0k1pPlO0Nvi9WTjZD32j4T+k1jhiLSNEO3q0N3J0r0yEwlg8DVHGBZljYnllBglZ5gzFAdB04t89/1O/w1cDnyilFU=+oHIO0dExRsy7hi6E0k1pPlO0Nvi9WTjZD32j4T+k1iohERZWZE+en72+aeg0DixqLTHbTQQVIz7DCAzA+9u3wdB04t89/1O/w1cDnyilFU="; //Channel secret string

//set line bot client
const client = new line.Client({
    channelSecret: channelSecret,
    channelAccessToken: channelToken
});

//set scraping setting
var https = require('https');
const axios = require('axios');
const cheerio = require("cheerio");
// const siteUrl = "https://remoteok.io/";
// let siteUrl = "https://www.cwb.gov.tw/V8/C/";

//postgre sql test
var pgp = require("pg-promise")(/*options*/);
var db = pgp("postgres://postgres:123456@localhost:5432/postgres");
//heroku postgre sql test
const { Pool } = require('pg');
const herokuSql = new Pool({
  connectionString: "postgres://tmawuwlnambrqa:baae8813144cdbcc4fbf8f2b1399447d8c2190efccca820b1fa73e47692f9dfc@ec2-54-235-100-99.compute-1.amazonaws.com:5432/ddlf5nv8ig28dh",
  ssl: true
});

module.exports = {
    testCallFunc: function () {
        console.log("---testCallFunc");
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
    }
};