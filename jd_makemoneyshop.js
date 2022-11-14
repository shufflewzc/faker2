
/*
京东特价APP首页-赚钱大赢家
进APP看看，能不能进去，基本都黑的！！！
有的能进去，助力确是黑的！！
默认定时不跑！
运行流程：设置助力码--过滤黑号--助力--领取任务奖励！！！
助理吗变量：多个用&号隔开
DYJSHAREID = 'xxx&xxx&xxx'
10 10 10 10 * https://raw.githubusercontent.com/6dylan6/jdpro/main/jd_makemoneyshop.js
By: https://github.com/6dylan6/jdpro
updatetime: 2022/11/13 不过滤黑号了，直接助力
 */

const $ = new Env('特价版大赢家');
const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
let shareId = [];
if ($.isNode()) {
	Object.keys(jdCookieNode).forEach((item) => {
		cookiesArr.push(jdCookieNode[item])
	})
	if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
} else {
	cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
if (process.env.DYJSHAREID) {
	if (process.env.DYJSHAREID.indexOf('&') > -1) {
		shareId = process.env.DYJSHAREID.split('&');
	} else {
		shareId = [process.env.DYJSHAREID];
	}
}
let helpinfo = {};
!(async () => {
	if (!cookiesArr[0]) {
		$.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
		return;
	}
	console.log('\n运行一遍可以看到助力码，然后设置需要助力的！')
	console.log('\n运行流程：助力--领取任务奖励！！！\n')
	// for (let i = 0; i < cookiesArr.length; i++) {
	//     if (cookiesArr[i]) {
	//         cookie = cookiesArr[i];
	//         $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
	//         $.index = i + 1;
	//         $.isLogin = true;
	//         $.nickName = '';
	//         $.canUseCoinAmount = 0;
	//         helpinfo[$.UserName] = {};
	//         UA = require('./USER_AGENTS').UARAM();
	//         helpinfo[$.UserName].ua = UA;
	//         await TotalBean();
	//         console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
	//         if (!$.isLogin) {
	//             $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
	//             if ($.isNode()) {
	//                 await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
	//             }
	//             continue
	//         }

	//         await getinfo(1);
	//         await $.wait(1000);
	//     }

	// }
	if (shareId.length > 0) {
		console.log('\n\n开始助力...')
		$.index = 1;
		$.fullhelp = false;
		let k = 0;
		let m = cookiesArr.length;
		for (let j = 0; j < shareId.length; j++) {
			console.log('\n去助力--> ' + shareId[j]);
			helpnum = 0;
			if ($.index === m) { console.log('已无账号可用于助力！结束\n'); break };
			for (let i = k; i < m; i++) {
				if (helpnum == 10) { console.log('助力已满，跳出！\n'); k = i; break };
				if ($.fullhelp) { console.log('助力已满，跳出！\n'); k = i - 1; break };
				if (cookiesArr[i]) {
					cookie = cookiesArr[i];
					$.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
					$.index = i + 1;
					helpinfo[$.UserName] = {};
					UA = require('./USER_AGENTS').UARAM();
					helpinfo[$.UserName].ua = UA;
					console.log(`\n开始【账号${$.index}】${$.nickName || $.UserName}`);
					if (helpinfo[$.UserName].nohelp) { console.log('已无助力次数了'); continue };
					if (helpinfo[$.UserName].hot) { console.log('可能黑了，跳过！'); continue };
					await help(shareId[j]);
					//console.log('随机等待1-2秒');
					await $.wait(parseInt(Math.random() * 1000 + 1000, 10))
				}
			}
		}
	} else {
		console.log('无助立马请设置！！\n')
	}

	console.log('开始领取任务奖励...')

	for (let i = 0; i < cookiesArr.length; i++) {
		if (cookiesArr[i]) {
			cookie = cookiesArr[i];
			$.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
			$.index = i + 1;
            $.canUseCoinAmount = 0;
			if (Object.keys(helpinfo).length == 0) helpinfo[$.UserName] = {};
			try {
				UA = helpinfo[$.UserName].ua;
			} catch (e) {
				UA = require('./USER_AGENTS').UARAM();
			}
			console.log(`\n开始【账号${$.index}】${$.UserName}`);
			//if (helpinfo[$.UserName].hot) continue;
			await getinfo(1);	
			await $.wait(200);			
			await gettask();
			await $.wait(500);
			for (let item of $.tasklist) {
				if (item.awardStatus !== 1) {
					for (let k = 0; k < (item.realCompletedTimes - item.targetTimes + 1); k++) {
						console.log(`去领取${item.taskName}奖励`);
						await Award(item.taskId);
						await $.wait(500);
					}
				}
			}
			await $.wait(1000);
		}
	}

})()
	.catch((e) => {
		$.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
	})
	.finally(() => {
		$.done();
	})

function getinfo(xc) {
	return new Promise(async (resolve) => {
		$.get(taskUrl('makemoneyshop/home', 'activeId=63526d8f5fe613a6adb48f03&_stk=activeId&_ste=1'), async (err, resp, data) => {
			try {
				if (err) {
					console.log(`${JSON.stringify(err)}`)
					console.log(` API请求失败，请检查网路重试`)
				} else {
					let tostr = data.match(/\((\{.*?\})\)/)[1];
					data = eval('(' + tostr + ')');
					if (data.code == 0) {
						if (xc) {
							let sId = data.data.shareId;
							helpinfo[$.UserName].sId = `${sId}`;
							console.log('助力码：' + sId);
							console.log('当前营业金：' + data.data.canUseCoinAmount);
						}
					} else if (data.msg.indexOf('火爆') > -1) {
						console.log('此CK可能黑了！');
					} else {
						console.log(data.msg);
						helpinfo[$.UserName].hot = 1;
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			} finally {
				resolve(data)
			}
		})
	})
}

function gettask() {
	return new Promise(async (resolve) => {
		$.get(taskUrl('newtasksys/newtasksys_front/GetUserTaskStatusList', `__t=${Date.now}&source=makemoneyshop&bizCode=makemoneyshop`), async (err, resp, data) => {
			try {
				if (err) {
					console.log(`${JSON.stringify(err)}`)
					console.log(` API请求失败，请检查网路重试`)
				} else {
					let tostr = data.match(/\((\{.*?\})\n\)/)[1];
					data = eval('(' + tostr + ')');
					if (data.ret == 0) {
						$.tasklist = data.data.userTaskStatusList;
					} else {
						console.log(data.msg);
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			} finally {
				resolve(data)
			}
		})
	})
}
function Award(id) {
	return new Promise(async (resolve) => {
		$.get(taskUrl('newtasksys/newtasksys_front/Award', `__t=${Date.now()}&source=makemoneyshop&taskId=${id}&bizCode=makemoneyshop`), async (err, resp, data) => {
			try {
				if (err) {
					console.log(`${JSON.stringify(err)}`)
					console.log(` API请求失败，请检查网路重试`)
				} else {
					let tostr = data.match(/\((\{.*?\})\n\)/)[1];
					data = eval('(' + tostr + ')');
					if (data.ret == 0) {
						console.log('获得营业金：' + (data.data.prizeInfo / 100) + '元');
					} else {
						console.log(data.msg);
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			} finally {
				resolve(data)
			}
		})
	})
}


function help(shareid) {
	return new Promise(async (resolve) => {
		$.get(taskUrl('makemoneyshop/guesthelp', `activeId=63526d8f5fe613a6adb48f03&shareId=${shareid}&_stk=activeId,shareId&_ste=1`), async (err, resp, data) => {
			try {
				if (err) {
					console.log(`${JSON.stringify(err)}`)
					console.log(` API请求失败，请检查网路重试`)
				} else {
					let tostr = data.match(/\((\{.*?\})\)/)[1];
					data = eval('(' + tostr + ')');
					if (data.code == 0) {
						console.log('助力成功！');
						helpinfo[$.UserName].nohelp = 1;
						helpnum++;
					} else if (data.msg === '已助力') {
						console.log('你已助力过TA！')
						helpinfo[$.UserName].nohelp = 1;
					} else if (data.msg === '助力任务已完成') {
						$.fullhelp = true;
					} else if (data.code === 1006) {
						console.log('不能助力自己！');
						// $.qqq = [];
						// $.qqq.push($.index);
					} else if (data.code === 1008) {
						console.log('今日无助力次数了！');
					} else if (data.msg.indexOf('火爆') > -1) {
						console.log('此CK助力可能黑了！');
					} else {
						console.log(data.msg);
					}
				}
			} catch (e) {
				$.logErr(e, resp)
			} finally {
				resolve(data)
			}
		})
	})
}

function taskUrl(fn, body) {
	return {
		url: `https://wq.jd.com/${fn}?g_ty=h5&g_tk=&appCode=msc588d6d5&${body}&h5st=&sceneval=2&callback=__jsonp1667344808184`,
		headers: {
			'Origin': 'https://wq.jd.com',
			'Referer': 'https://wqs.jd.com/sns/202210/20/make-money-shop/index.html?activeId=63526d8f5fe613a6adb48f03',
			'User-Agent': UA,
			'Cookie': cookie
		}
	}
}

function TotalBean() {
	return new Promise((resolve) => {
		const options = {
			url: 'https://plogin.m.jd.com/cgi-bin/ml/islogin',
			headers: {
				"Cookie": cookie,
				"referer": "https://h5.m.jd.com/",
				"User-Agent": UA,
			},
			timeout: 10000
		}
		$.get(options, (err, resp, data) => {
			try {
				if (data) {
					data = JSON.parse(data);
					if (data.islogin === "1") {
					} else if (data.islogin === "0") {
						$.isLogin = false;
					}
				}
			} catch (e) {
				console.log(e);
			}
			finally {
				resolve();
			}
		});
	});
}

function jsonParse(str) {
	if (typeof str == "string") {
		try {
			return JSON.parse(str);
		} catch (e) {
			console.log(e);
			$.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
			return [];
		}
	}
}
// prettier-ignore
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }