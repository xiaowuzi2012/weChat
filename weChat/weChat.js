"use strict"

var Promise = require("bluebird");
var request = Promise.promisify(require("request"));
var util = require("./util");
var fs = require("fs");
var _ = require("lodash");

var prefix = "https://api.weixin.qq.com/cgi-bin/";
var api = {
	accessToken: prefix + "token?grant_type=client_credential",
	temporary: {
		upload: prefix + "media/upload?"
	},
	permanent: {
		upload: prefix + "material/add_material?",
		uploadNews: prefix + "material/add_news?",
		uploadNewsPic: prefix + "media/uploadimg?"
	}
}

function WeChat(opts) {
	var that = this;
	this.AppID = opts.AppID;
	this.AppSecret = opts.AppSecret;
	this.getAccessToken = opts.getAccessToken;
	this.saveAccessToken = opts.saveAccessToken;

	this.fetchAccessToken();
}

WeChat.prototype.fetchAccessToken = function(data) {
	var that = this;
	if(this.access_token && this.expires_in) {
		if(this.isValidAccessToken(this)) {
			return Promise.resolve(this);
		}
	}
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
		return Promise.resolve(data);
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

WeChat.prototype.uploadMaterial = function(type, material, permanent) {
	var that = this;
	var form = {};
	var uploadUrl = api.temporary.upload;
	
	if(permanent) {
		uploadUrl = api.permanent.upload;
		_.extend(form, permanent);
	}
	if(type === "pic") {
		uploadUrl = api.permanent.uploadNewsPic;
	}
	//material如果是图文的话传进来的是数组
	//material如果是图片或视频的话传进来的是路径的字符串
	if(type === "news") {
		uploadUrl = api.permanent.uploadNews;
		form = material;
	} else {
		form.media = fs.createReadStream(material)
	}

	var AppID = this.AppID;
	var AppSecret = this.AppSecret;

	return new Promise(function(resolve, reject) {
		that
			.fetchAccessToken()
			.then(function(data) {
				var url = uploadUrl + "&access_token=" + data.access_token;
				if(!permanent) {
					url += "&type=" + type;
				} else {
					form.access_token = data.access_token;
				}
				var options = {
					method: "POST",
					url: url,
					json: true
				}
				if(type === "news") {
					options.body = form;
				} else {
					options.formData = form;
				}
				request({
						method: "POST",
						url: url,
						formData: form,
						json: true
					})
					.then(function(response) {
						console.log(response);
	console.log(1111111111111111111);
						var _data = response.body;
						if(_data) {
							resolve(_data);
						} else {
							throw new Error("upload material fails");
						}
					})
					.catch(function(error) {
						reject(error);
					})
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