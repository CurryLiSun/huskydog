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

function testCallFunc() {
    console.log("---testCallFunc");
}