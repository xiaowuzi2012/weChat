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
		} else if(message.Event === "LOCATION") {
			this.body = "您上报的位置是：" + message.Latitude + "/" + message.Longitude + "-" + message.Precision;
		} else if(message.Event === "CLICK") {
			this.body = "您点击了菜单：" + message.EventKey;
		} else if(message.Event === "SCAN") {
			console.log("关注后扫二维码" + message.EventKey + " " + message.Ticket);
			this.body = "看到你扫了一下哦";
		} else if(message.Event === "VIEW") {
			console.log("您点击了菜单中的连接" + message.EventKey);
		}
	} else if(message.MsgType === "text") {
		var content = message.Content;
		var reply = "额，你说的 " + content + "太复杂了";
		if(content === "1") {
			reply = "天下第一吃大米";
		} else if(content === "2") {
			reply = "天下第二吃豆腐";
		} else if(content === "3") {
			reply = "天下第三吃仙丹";
		} else if(content === "4") {
			reply = [{
					title: "技术改变世界",
					description: "只是个描述而已",
					picUrl: "http://g.hiphotos.baidu.com/image/pic/item/ac4bd11373f0820264c90cf542fbfbedaa641ba4.jpg",
					url: "https://github.com/"
				}
				//			, {
				//				title: "NodeJs 开发微信",
				//				description: "爽到爆",
				//				picUrl: "http://f.hiphotos.baidu.com/image/pic/item/f703738da97739121ebbe1b1f2198618377ae245.jpg",
				//				url: "https://nodejs.org/"
				//			}
			];
		}
		this.body = reply;
	}
	yield next;
};