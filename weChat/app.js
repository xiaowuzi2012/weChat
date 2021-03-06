"use strict"

var Koa = require("koa");
var path = require("path");
var weChat = require("./weChat/g");
var util = require("./libs/util");
var weChat_file = path.join(__dirname, "./config/weChat.txt");
var config = {
	weChat: {
		AppID: "wx8f9d4fccb88d7b77",
		AppSecret: "62fc63cd2ef58886f269b3cbc7fde662",
		Token: "wujiewujing",
		getAccessToken: function(){
			return util.readFileAsync(weChat_file)
		},
		saveAccessToken: function(data){
			data = JSON.stringify(data)
			return util.writeFileAsync(weChat_file, data)
		}
	}
}

var app = new Koa();
app.use(weChat(config.weChat))

app.listen(80)
console.log("listening:80")