/*
京东特价翻翻乐
一天可翻多次，但有上限
运气好每次可得0.3元以上的微信现金(需京东账号绑定到微信)
脚本兼容: QuantumultX, Surge,Loon, JSBox, Node.js
=================================Quantumultx=========================
[task_local]
#京东特价翻翻乐
20 0-23/3 * * * https://raw.githubusercontent.com/okyyds/yydspure/master/jd_jdtj_winner.js, tag=京东特价翻翻乐, img-url=https://github.com/58xinian/icon/raw/master/jdgc.png, enabled=true

================Loon==============
[Script]
cron "20 0-23/3 * * *" script-path=https://raw.githubusercontent.com/okyyds/yydspure/master/jd_jdtj_winner.js,tag=京东特价翻翻乐

===============Surge=================
京东特价翻翻乐 = type=cron,cronexp="20 0-23/3 * * *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/okyyds/yydspure/master/jd_jdtj_winner.js

============小火箭=========
京东特价翻翻乐 = type=cron,script-path=https://raw.githubusercontent.com/okyyds/yydspure/master/jd_jdtj_winner.js, cronexpr="20 0-23/3 * * *", timeout=3600, enable=true
 */
const $ = new Env('京东特价翻翻乐');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message = '', linkId = 'ouLEuSSoBzj9b9YYYIsiDA', fflLinkId = 'ouLEuSSoBzj9b9YYYIsiDA';
const money = process.env.BIGWINNER_MONEY || 0.3
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
} else {
  cookiesArr = [
    $.getdata("CookieJD"),
    $.getdata("CookieJD2"),
    ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
const len = cookiesArr.length;

!(async () => {
    $.redPacketId = []
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', { "open-url": "https://bean.m.jd.com/" });
        return;
    }
    for (let i = 0; i < len; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
            console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
            await $.wait(3000);
            await main()
        }
    }
    if (message) {
        $.msg($.name, '', message);
        if ($.isNode()) await notify.sendNotify($.name, message);
    }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })

async function main() {
    try {
        $.canApCashWithDraw = false;
        $.changeReward = true;
        $.canOpenRed = true;
        await gambleHomePage();
        if (!$.time) {
            console.log(`开始进行翻翻乐拿红包\n`)
            await gambleOpenReward();//打开红包
            await $.wait(3000);
            if ($.canOpenRed) {
                while (!$.canApCashWithDraw && $.changeReward) {
                    await openRedReward();
                    await $.wait(2000);
                }
                if ($.canApCashWithDraw) {
                    //提现
                    await openRedReward('gambleObtainReward', $.rewardData.rewardType);
                    await apCashWithDraw($.rewardData.id, $.rewardData.poolBaseId, $.rewardData.prizeGroupId, $.rewardData.prizeBaseId, $.rewardData.prizeType);
                }
            }
        }
    } catch (e) {
        $.logErr(e)
    }
}


//查询剩余多长时间可进行翻翻乐
function gambleHomePage() {
    const headers = {
        'Host': 'api.m.jd.com',
        'Origin': 'https://doublejoy.jd.com',
        'Accept': 'application/json, text/plain, */*',
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),                'Accept-Encoding': `gzip, deflate, br`,
        'Referer': `https://doublejoy.jd.com/?activityId${linkId}`,
        'Accept-Language': 'zh-cn',
        'Cookie': cookie
    }
    const body = { 'linkId': fflLinkId };
    const options = {
        url: `https://api.m.jd.com/?functionId=gambleHomePage&body=${encodeURIComponent(JSON.stringify(body))}&appid=activities_platform&clientVersion=null`,
        headers,
    }
    return new Promise(resolve => {
        $.get(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data['code'] === 0) {
                            if (data.data.leftTime === 0) {
                                $.time = data.data.leftTime;
                            } else {
                                $.time = (data.data.leftTime / (60 * 1000)).toFixed(2);
                            }
                            console.log(`\n查询下次翻翻乐剩余时间成功：\n京东账号【${$.UserName}】距开始剩 ${$.time} 分钟`);
                        } else {
                            console.log(`查询下次翻翻乐剩余时间失败：${JSON.stringify(data)}\n`);
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve()
            }
        })
    })
}
//打开翻翻乐红包
function gambleOpenReward() {
    const headers = {
        'Host': 'api.m.jd.com',
        'Origin': 'https://doublejoy.jd.com',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 9; Note9 Build/PKQ1.181203.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3149 MMWEBSDK/20211001 Mobile Safari/537.36 MMWEBID/8813 MicroMessenger/8.0.16.2040(0x28001055) Process/appbrand0 WeChat/arm64 Weixin NetType/4G Language/zh_CN ABI/arm64 miniProgram/wxc3c2227edeffca75',
        'Referer': `https://doublejoy.jd.com`,
        'Accept-Language': 'zh-cn',
        "Content-Type": "application/x-www-form-urlencoded",
        'Cookie': cookie
    }
    const body = { 'linkId': fflLinkId };
    const options = {
        url: `https://api.m.jd.com/`,
        headers,
        body: `functionId=gambleOpenReward&body=${JSON.stringify(body)}&t=${Date.now()}&appid=activities_platform&clientVersion=null`
    }
    return new Promise(resolve => {
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data['code'] === 0) {
                            console.log(`翻翻乐打开红包 成功，获得：${data.data.rewardValue}元红包\n`);
                        } else {
                            console.log(`翻翻乐打开红包 失败：${JSON.stringify(data)}\n`);
                            if (data.code === 20007 || data.code === 1000) {
                                $.canOpenRed = false;
                                console.log(`翻翻乐打开红包 失败，今日活动参与次数已达上限或者黑号拉！`)
                            }
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve()
            }
        })
    })
}
//翻倍红包
function openRedReward(functionId = 'gambleChangeReward', type) {
    const headers = {
        'Host': 'api.m.jd.com',
        'Origin': 'https://doublejoy.jd.com',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 9; Note9 Build/PKQ1.181203.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3149 MMWEBSDK/20211001 Mobile Safari/537.36 MMWEBID/8813 MicroMessenger/8.0.16.2040(0x28001055) Process/appbrand0 WeChat/arm64 Weixin NetType/4G Language/zh_CN ABI/arm64 miniProgram/wxc3c2227edeffca75',
        'Referer': `https://doublejoy.jd.com`,
        'Accept-Language': 'zh-cn',
        "Content-Type": "application/x-www-form-urlencoded",
        'Cookie': cookie
    }
    const body = { 'linkId': fflLinkId };
    if (type) body['rewardType'] = type;
    const options = {
        url: `https://api.m.jd.com/`,
        headers,
        body: `functionId=${functionId}&body=${JSON.stringify(body)}&t=${Date.now()}&appid=activities_platform&clientVersion=null`
    }
    return new Promise(resolve => {
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    $.changeReward = false;
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        // console.log(`翻翻乐结果：${data}\n`);
                        data = JSON.parse(data);
                        if (data['code'] === 0) {
                            $.rewardData = data.data;
                            if (data.data.rewardState === 1) {
                                if (data.data.rewardValue >= money) {
                                    //已翻倍到0.3元，可以提现了
                                    $.canApCashWithDraw = true;
                                    $.changeReward = false;
                                    // message += `${data.data.rewardValue}元现金\n`
                                }
                                if (data.data.rewardType === 1) {
                                    console.log(`翻翻乐 第${data.data.changeTimes}次翻倍 成功，获得：${data.data.rewardValue}元红包\n`);
                                } else if (data.data.rewardType === 2) {
                                    console.log(`翻翻乐 第${data.data.changeTimes}次翻倍 成功，获得：${data.data.rewardValue}元现金\n`);
                                    // $.canApCashWithDraw = true;
                                } else {
                                    console.log(`翻翻乐 第${data.data.changeTimes}次翻倍 成功，获得：${JSON.stringify(data)}\n`);
                                }
                            } else if (data.data.rewardState === 3) {
                                console.log(`翻翻乐 第${data.data.changeTimes}次翻倍 失败，奖品溜走了/(ㄒoㄒ)/~~\n`);
                                $.changeReward = false;
                            } else {
                                if (type) {
                                    console.log(`翻翻乐领取成功：${data.data.amount}现金\n`)
                                    message += `【京东账号${$.index}】${$.nickName || $.UserName}\n${new Date().getHours()}点：${data.data.amount}现金\n`;
                                } else {
                                    console.log(`翻翻乐 翻倍 成功，获得：${JSON.stringify(data)}\n`);
                                }
                            }
                        } else {
                            $.canApCashWithDraw = true;
                            $.changeReward = false;
                            console.log(`翻翻乐 翻倍 失败：${JSON.stringify(data)}\n`);
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve()
            }
        })
    })
}
//翻翻乐提现
function apCashWithDraw(id, poolBaseId, prizeGroupId, prizeBaseId, prizeType) {
    const headers = {
        'Host': 'api.m.jd.com',
        'Origin': 'https://doublejoy.jd.com',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 9; Note9 Build/PKQ1.181203.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3149 MMWEBSDK/20211001 Mobile Safari/537.36 MMWEBID/8813 MicroMessenger/8.0.16.2040(0x28001055) Process/appbrand0 WeChat/arm64 Weixin NetType/4G Language/zh_CN ABI/arm64 miniProgram/wxc3c2227edeffca75',
        'Referer': `https://doublejoy.jd.com?activityId=${linkId}`,
        'Accept-Language': 'zh-cn',
        "Content-Type": "application/x-www-form-urlencoded",
        'Cookie': cookie
    }
    const body = {
        "businessSource": "GAMBLE",
        "base": {
            id,
            "business": "redEnvelopeDouble",
            poolBaseId,
            prizeGroupId,
            prizeBaseId,
            prizeType
        },
        "linkId": fflLinkId
    };
    const options = {
        url: `https://api.m.jd.com/`,
        headers,
        body: `functionId=apCashWithDraw&body=${encodeURIComponent(JSON.stringify(body))}&t=${Date.now()}&appid=activities_platform&clientVersion=null`
    }
    return new Promise(resolve => {
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data['code'] === 0) {
                            if (data['data']['status'] === '310') {
                                console.log(`京东特价--翻翻乐 成功🎉，详情：${JSON.stringify(data)}\n`);
                                message += `提现至微信钱包成功🎉\n\n`;
                            } else if (data['data']['status'] === '50053') {
                                console.log(`京东特价--翻翻乐 失败，详情：${JSON.stringify(data)}\n`);
                                message += `提现至微信钱包失败\n详情：${JSON.stringify(data)}\n\n`;
                            }
                        } else {
                            console.log(`京东特价--翻翻乐 失败：${JSON.stringify(data)}\n`);
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve()
            }
        })
    })
}
// prettier-ignore
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), a = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(a, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t) { let e = { "M+": (new Date).getMonth() + 1, "d+": (new Date).getDate(), "H+": (new Date).getHours(), "m+": (new Date).getMinutes(), "s+": (new Date).getSeconds(), "q+": Math.floor(((new Date).getMonth() + 3) / 3), S: (new Date).getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, ((new Date).getFullYear() + "").substr(4 - RegExp.$1.length))); for (let s in e) new RegExp("(" + s + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : ("00" + e[s]).substr(("" + e[s]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))); let h = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="]; h.push(e), s && h.push(s), i && h.push(i), console.log(h.join("\n")), this.logs = this.logs.concat(h) } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }