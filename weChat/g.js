"use strict"

var Sha1 = require("sha1");
var getRawBody = require("raw-body");
var WeChat = require("./weChat");
var util = require("./util");

module.exports = function(opts) {
	//在测试发送方式get/post时，可以先屏蔽掉
	//	var weChat = new WeChat(opts);
	return function*(next) {
		var that = this;
		var token = opts.Token;
		var signature = this.query.signature;
		var nonce = this.query.nonce;
		var timestamp = this.query.timestamp;
		var echostr = this.query.echostr;
		var str = [token, timestamp, nonce].sort().join("");
		var sha = Sha1(str);
		//请求方法判断
		if(this.method === "GET") {
			console.log("get");
			if(sha === signature) {
				this.body = echostr + ""
			} else {
				this.body = "wrong"
			}
		} else if(this.method === "POST") {
			if(sha !== signature) {
				this.body = "wrong";
				return false;
			} else {
				var data = yield getRawBody(this.req, {
					length: this.length,
					limit: "1mb",
					encoding: this.charset
				})
				var content = yield util.parseXMLAsync(data);
				console.log(content);
				var message = util.formatMessage(content.xml);
				console.log(message);
				if(message.MsgType === "event") {
					if(message.Event === "subscribe") {
						var now = new Date().getTime();
						that.status = 200;
						that.type = "application/xml";
						that.body = "<xml>" +
							"<ToUserName><![CDATA[" + message.FromUserName + "]]></ToUserName>" +
							"<FromUserName><![CDATA[" + message.ToUserName + "]]></FromUserName>" +
							"<CreateTime>" + now + "</CreateTime>" +
							"<MsgType><![CDATA[text]]></MsgType>" +
							"<Content><![CDATA[wujinghenpiaoliang]]></Content>" +
							"</xml>";
						return;
					}
				}
			}
		}
	}
}