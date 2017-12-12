"use strict"

exports.reply = function*(next) {
	var message = this.weixin;
	console.log(message);
	if(message.MsgType === "event") {
		if(message.Event === "subscribe") {
			if(message.EventKey) {
				console.log("扫二维码进来：" + message.EventKey + " " + message.ticket)
			}
			this.body = "你订阅了这个号";
		} else if(message.Event === "unsubscribe") {
			console.log("无情取消关注");
			this.body = "";
		}
	}
	yield next;
};