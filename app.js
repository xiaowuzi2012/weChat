"use strict"

var Koa = require("koa");
var weChat = require("./weChat/g");
var config = require("./config");
var weixin = require("./weixin");

var app = new Koa();
app.use(weChat(config.weChat, weixin.reply));
app.listen(80)
console.log("listening:80")