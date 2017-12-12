"use strict"

var Promise = require("bluebird");
var request = Promise.promisify(require("request"));
var util = require("./util");

var prefix = "https://api.weixin.qq.com/cgi-bin/";
var api = {
	accessToken: prefix + "token?grant_type=client_credential"
}

function WeChat(opts) {
	var that = this;
	this.AppID = opts.AppID;
	this.AppSecret = opts.AppSecret;
	this.getAccessToken = opts.getAccessToken;
	this.saveAccessToken = opts.saveAccessToken;

	this.getAccessToken().then(function(data) {
		try {
			data = JSON.parse(data);
		} catch(e) {
			//不合法或者失败时候，更新票据
			return that.updateAccessToken();
		}
		//判断票据是否在有效期内
		if(that.isValidAccessToken(data)) {
			return Promise.resolve(data);
		} else {
			return that.updateAccessToken();
		}
	}).then(function(data) {
		that.access_token = data.access_token;
		that.expires_in = data.expires_in;
		that.saveAccessToken(data);
	})
}

WeChat.prototype.isValidAccessToken = function(data) {
	if(!data || !data.access_token || !data.expires_in) {
		return false;
	}
	var access_token = data.access_token;
	var expires_in = data.expires_in;
	var now = new Date().getTime();
	if(now < expires_in) {
		return true;
	} else {
		return false;
	}
}

WeChat.prototype.updateAccessToken = function() {
	var AppID = this.AppID;
	var AppSecret = this.AppSecret;
	var url = api.accessToken + "&appid=" + AppID + "&secret=" + AppSecret;

	return new Promise(function(resolve, reject) {
		request({
			url: url,
			json: true
		}).then(function(response) {
			var data = response.body;
			console.log(data);
			var now = (new Date().getTime());
			var expires_in = now + (data.expires_in - 20) * 1000;
			data.expires_in = expires_in;
			resolve(data);
		})
	})
}

WeChat.prototype.reply = function() {
	var content = this.body;
	var message = this.weixin;
	var xml = util.tpl(content, message);

	this.status = 200;
	this.type = "application/xml";
	this.body = xml;
}

module.exports = WeChat;