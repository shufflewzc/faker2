/*
注意：助力码每天会变，旧的不可用。
助力逻辑：优先助力互助码变量，默认助力前三个可助力的账号，需要修改助力人数修改代码57行的数字即可
入口-极速版-推推赚大钱  5元无门槛卷 大概需要50人助力
 [task_local]
#快速推一推
0 1 * * * jd_tyt.js, tag=推一推, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true
*/

const $ = new Env('极速版-推推赚大钱');//助力前三个可助力的账号
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const JD_API_HOST = 'https://api.m.jd.com';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message;
let status = ''
let inviteCodes = []
if ($.isNode()) {
     Object.keys(jdCookieNode).forEach((item) => {
          cookiesArr.push(jdCookieNode[item])
     })
     if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
} else {
     cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

!(async () => {
     if (!cookiesArr[0]) {
          $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
          return;
     }
     for (let i = 0; i < cookiesArr.length; i++) {
          if (cookiesArr[i]) {
               cookie = cookiesArr[i];
               $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
               $.index = i + 1;
               $.isLogin = true;
               $.nickName = '';
               message = '';
               //await TotalBean();
               console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
               if (!$.isLogin) {
                    $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });

                    if ($.isNode()) {
                         await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                    }
                    continue
               }
          }
          console.log('\n入口→极速版→赚金币→推推赚大钱\n');
          await info()
          await coinDozerBackFlow()
          await getCoinDozerInfo()
          console.log('\n注意助力前三个可助力的账号\n');
          if (inviteCodes.length >= 3) {
               break
          }
     }
     console.log('\n#######开始助力前三个可助力的账号#######\n');
     cookiesArr.sort(function () {
          return .5 - Math.random();
     });
     for (let i = 0; i < cookiesArr.length; i++) {
          cookie = cookiesArr[i];
          $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
          if (!cookie) continue
          for (let j in inviteCodes) {
               $.ok = false
               if (inviteCodes[j]["ok"]) continue
               if ($.UserName === inviteCodes[j]['user']) continue;
               await helpCoinDozer(inviteCodes[j]['packetId'])
               console.log(`\n【${$.UserName}】去助力【${inviteCodes[j]['user']}】邀请码：${inviteCodes[j]['packetId']}`);
               if ($.ok) {
                    inviteCodes[j]["ok"] = true
                    continue
               }
               await $.wait(10000)
               await help(inviteCodes[j]['packetId'])
               if ($.ok) {
                    inviteCodes[j]["ok"] = true
                    continue
               }
          }
     }
})()
     .catch((e) => {
          $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
     })
     .finally(() => {
          $.done();
     })
function info() {
     return new Promise((resolve) => {

          const nm = {
               url: `${JD_API_HOST}`,
               body: `functionId=initiateCoinDozer&body={"actId":"ccd0447255384f06ae26690993be27f1","channel":"coin_dozer","antiToken":"","referer":"-1","frontendInitStatus":"s"}&appid=megatron&client=ios&clientVersion=14.3&t=1636014459632&networkType=4g&eid=&fp=-1&frontendInitStatus=s&uuid=8888&osVersion=14.3&d_brand=&d_model=&agent=-1&pageClickKey=-1&screen=400*700&platform=3&lang=zh_CN`,
               headers: {
                    "Cookie": cookie,
                    "Origin": "https://pushgold.jd.com",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
               }
          }
          $.post(nm, async (err, resp, data) => {
               try {
                    if (err) {
                         console.log(`${JSON.stringify(err)}`)
                         console.log(`${$.name} API请求失败，请检查网路重试`)
                    } else {
                         if (safeGet(data)) {
                              data = JSON.parse(data);
                              if (data.success == true) {
                                   console.log('邀请码：' + data.data.packetId)
                                   console.log('初始推出：' + data.data.amount)
                                   if (data.data && data.data.packetId) {
                                        inviteCodes.push({
                                             user: $.UserName,
                                             packetId: data.data.packetId,
                                             ok: false,
                                        });
                                   }
                              } else if (data.success == false) {
                                   console.log(data.msg)
                              }
                         }
                    }
               } catch (e) {
                    $.logErr(e, resp)
               } finally {
                    resolve(data);
               }
          })
     })
}
function coinDozerBackFlow() {
     return new Promise((resolve) => {

          const nm = {
               url: `${JD_API_HOST}`,
               body: `functionId=coinDozerBackFlow&body={"actId":"ccd0447255384f06ae26690993be27f1","channel":"coin_dozer","antiToken":"","referer":"-1","frontendInitStatus":"s"}&appid=megatron&client=ios&clientVersion=14.3&t=1636015617899&networkType=4g&eid=&fp=-1&frontendInitStatus=s&uuid=8888&osVersion=14.3&d_brand=&d_model=&agent=-1&pageClickKey=-1&screen=400*700&platform=3&lang=zh_CN`,
               headers: {

                    "Cookie": cookie,
                    "Origin": "https://pushgold.jd.com",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",

               }
          }
          $.post(nm, async (err, resp, data) => {

               try {
                    if (err) {
                         console.log(`${JSON.stringify(err)}`)
                         console.log(`${$.name} API请求失败，请检查网路重试`)
                    } else {
                         if (safeGet(data)) {
                              data = JSON.parse(data);
                              if (data.success == true) {
                                   console.log('浏览任务完成再推一次')


                              }
                         } else if (data.success == false) {
                              console.log(data.msg)
                         }
                    }

               } catch (e) {
                    $.logErr(e, resp)
               } finally {
                    resolve(data);
               }
          })
     })
}

function helpCoinDozer(packetId) {
     return new Promise((resolve) => {
          const nm = {
               url: `${JD_API_HOST}`,
               body: `functionId=helpCoinDozer&appid=station-soa-h5&client=H5&clientVersion=1.0.0&t=1636015855103&body={"actId":"ccd0447255384f06ae26690993be27f1","channel":"coin_dozer","antiToken":"","referer":"-1","frontendInitStatus":"s","packetId":"${packetId}"}&_ste=1&_stk=appid,body,client,clientVersion,functionId,t&h5st=20211104165055104;9806356985655163;10005;tk01wd1ed1d5f30nBDriGzaeVZZ9vuiX+cBzRLExSEzpfTriRD0nxU6BbRIOcSQvnfh74uInjSeb6i+VHpnHrBJdVwzs;017f330f7a84896d31a8d6017a1504dc16be8001273aaea9a04a8d04aad033d9`,
               headers: {

                    "Cookie": cookie,
                    "Origin": "https://pushgold.jd.com",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",

               }
          }
          $.post(nm, async (err, resp, data) => {
               try {
                    if (err) {
                         console.log(`${JSON.stringify(err)}`)
                         console.log(`${$.name} API请求失败，请检查网路重试`)
                    } else {
                         if (safeGet(data)) {
                              data = JSON.parse(data);
                              if (data.success == true) {
                                   console.log('推出：' + data.data.amount)
                                   console.log('已经推出：' + data.data.dismantledAmount)
                              }
                         } else if (data.success == false) {
                              if (data.msg.indexOf("已完成砍价") != -1) {
                                   $.ok = true
                              }
                         }
                    }

               } catch (e) {
                    $.logErr(e, resp)
               } finally {
                    resolve(data);
               }
          })
     })
}
function help(packetId) {
     return new Promise((resolve) => {
          const nm = {
               url: `${JD_API_HOST}`,
               body: `functionId=helpCoinDozer&appid=station-soa-h5&client=H5&clientVersion=1.0.0&t=1623120183787&body={"actId":"ccd0447255384f06ae26690993be27f1","channel":"coin_dozer","antiToken":"","referer":"-1","frontendInitStatus":"s","packetId":"${packetId}","helperStatus":"0"}&_ste=1&_stk=appid,body,client,clientVersion,functionId,t&h5st=20210608104303790;8489907903583162;10005;tk01w89681aa9a8nZDdIanIyWnVuWFLK4gnqY+05WKcPY3NWU2dcfa73B7PBM7ufJEN0U+4MyHW5N2mT/RNMq72ycJxH;7e6b956f1a8a71b269a0038bbb4abd24bcfb834a88910818cf1bdfc55b7b96e5`,
               headers: {

                    "Cookie": cookie,
                    "Origin": "https://pushgold.jd.com",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",

               }
          }
          $.post(nm, async (err, resp, data) => {

               try {
                    if (err) {
                         console.log(`${JSON.stringify(err)}`)
                         console.log(`${$.name} API请求失败，请检查网路重试`)
                    } else {
                         if (safeGet(data)) {
                              data = JSON.parse(data);
                              if (data.success == true) {
                                   console.log("帮砍：" + data.data.amount)

                              }
                         }
                         else
                              if (data.msg.indexOf("完成") != -1) {
                                   status = 1
                              }
                         if (data.success == false) {
                              if (data.msg.indexOf("完成") != -1) {
                                   $.ok = true
                              }
                              console.log(data.msg)
                         }
                    }
               } catch (e) {
                    $.logErr(e, resp)
               } finally {
                    resolve(data);
               }
          })
     })
}

function getCoinDozerInfo() {
     return new Promise((resolve) => {

          const nm = {
               url: `${JD_API_HOST}`,
               body: `functionId=getCoinDozerInfo&body={"actId":"ccd0447255384f06ae26690993be27f1","channel":"coin_dozer","antiToken":"","referer":"-1","frontendInitStatus":"s"}&appid=megatron&client=ios&clientVersion=14.3&t=1636015858295&networkType=4g&eid=&fp=-1&frontendInitStatus=s&uuid=8888&osVersion=14.3&d_brand=&d_model=&agent=-1&pageClickKey=-1&screen=400*700&platform=3&lang=zh_CN`,
               headers: {
                    "Cookie": cookie,
                    "Origin": "https://pushgold.jd.com",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
               }
          }
          $.post(nm, async (err, resp, data) => {

               try {
                    if (err) {
                         console.log(`${JSON.stringify(err)}`)
                         console.log(`${$.name} API请求失败，请检查网路重试`)
                    } else {
                         if (safeGet(data)) {
                              data = JSON.parse(data);
                              if (data.success == true && data?.data?.sponsorActivityInfo?.packetId) {
                                   console.log('叼毛：' + data.data.sponsorActivityInfo.initiatorNickname)
                                   console.log('邀请码：' + data.data.sponsorActivityInfo.packetId)
                                   console.log('推出：' + data.data.sponsorActivityInfo.dismantledAmount)
                                   if (data.data && data.data.sponsorActivityInfo.packetId) {
                                        inviteCodes.push({
                                             user: $.UserName,
                                             packetId: data.data.sponsorActivityInfo.packetId,
                                             ok: false,
                                        });
                                   }
                              } else if (data.success == false) {
                                   console.log(data.msg)
                              }
                         }
                    }

               } catch (e) {
                    $.logErr(e, resp)
               } finally {
                    resolve(data);
               }
          })
     })
}


function TotalBean() {
     return new Promise(async resolve => {
          const options = {
               "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
               "headers": {
                    "Accept": "application/json,text/plain, */*",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Accept-Language": "zh-cn",
                    "Connection": "keep-alive",
                    "Cookie": cookie,
                    "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
                    "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
               }
          }
          $.post(options, (err, resp, data) => {
               try {
                    if (err) {
                         console.log(`${JSON.stringify(err)}`)
                         console.log(`${$.name} API请求失败，请检查网路重试`)
                    } else {
                         if (data) {
                              data = JSON.parse(data);
                              if (data["retcode"] === 13) {
                                   $.isLogin = false; //cookie过期
                                   return;
                              }
                              if (data["retcode"] === 0) {
                                   $.nickName = (data["base"] && data["base"].nickname) || $.UserName;
                              } else {
                                   $.nickName = $.UserName;
                              }
                         } else {
                              console.log(`京东服务器返回空数据`)
                         }
                    }
               } catch (e) {
                    $.logErr(e, resp)
               } finally {
                    resolve();
               }
          })
     })
}
function safeGet(data) {
     try {
          if (typeof JSON.parse(data) == "object") {
               return true;
          }
     } catch (e) {
          console.log(e);
          console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
          return false;
     }
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



function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
