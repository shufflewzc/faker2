
/*
京东小魔方--收集兑换
已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
by:小手冰凉 tg:@chianPLA
============Quantumultx===============
[task_local]
#京东小魔方--收集兑换
31 8 * * * https://raw.githubusercontent.com/okyyds/yydspure/master/jd_mofang_ex.js, tag=京东小魔方--收集兑换, enabled=true

================Loon==============
[Script]
cron "31 8 * * *" script-path=https://raw.githubusercontent.com/okyyds/yydspure/master/jd_mofang_ex.js,tag=京东小魔方--收集兑换

===============Surge=================
京东小魔方--收集兑换 = type=cron,cronexp="31 8 * * *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/okyyds/yydspure/master/jd_mofang_ex.js

============小火箭=========
京东小魔方--收集兑换 = type=cron,script-path=https://raw.githubusercontent.com/okyyds/yydspure/master/jd_mofang_ex.js, cronexpr="31 8 * * *", timeout=3600, enable=true

 */
const $ = new Env('京东小魔方--收集兑换');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let jdNotify = true;//是否关闭通知，false打开通知推送，true关闭通知推送
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message;
$.shareCodes = []
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
const JD_API_HOST = 'https://api.m.jd.com/client.action';
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
      await TotalBean();
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      await jdMofang()
      await $.wait(3000)
    }
  }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })

async function jdMofang() {
  console.log(`集魔方 赢大奖`)
  await getInteractionHomeInfo()
}

async function getInteractionHomeInfo() {
  return new Promise(async (resolve) => {
    $.post(taskUrl("getInteractionHomeInfo", { "sign": "u6vtLQ7ztxgykLEr" }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`getInteractionHomeInfo API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data)
            $.config = data.result;
            await queryInteractiveRewardInfo(data.result.taskConfig.projectPoolId, "wh5", 0); //收集魔方
            await $.wait(1500)
            await queryInteractiveRewardInfo(data.result.giftConfig.projectId, "acexinpin0823", 1);//兑换魔方
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

async function queryInteractiveInfo(encryptProjectId, sourceCode) {
  return new Promise(async (resolve) => {
    $.post(taskUrl("queryInteractiveInfo", { "encryptProjectId": encryptProjectId, "sourceCode": sourceCode, "ext": { "couponUsableGetSwitch": 1 } }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`queryInteractiveInfo API请求失败，请检查网路重试`)
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data)
      }
    })
  })
}

async function queryInteractiveRewardInfo(encryptProjectId, sourceCode, type) {
  return new Promise(async (resolve) => {
    if (type === 0) {
      body = { "encryptProjectPoolId": encryptProjectId, "sourceCode": sourceCode, "ext": { "needPoolRewards": 1, "needExchangeRestScore": 1 } }
    }
    else {
      body = { "encryptProjectId": encryptProjectId, "sourceCode": sourceCode, "ext": { "needExchangeRestScore": "1" } }
    }
    $.post(taskUrl("queryInteractiveRewardInfo", body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`queryInteractiveRewardInfo API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data)
            if (type == 1) {
              sum = data.exchangeRestScoreMap['367'];
              console.log(`当前魔方${sum}个`);
              let task = await queryInteractiveInfo($.config.giftConfig.projectId, "acexinpin0823");
              data2 = JSON.parse(task);
              $.run = true;
              if (data2.subCode == '0') {
                for (let key of Object.keys(data2.assignmentList)) {
                  let vo = data2.assignmentList[key];
                  if (sum >= 3) {
                    if (vo.exchangeRate == 3) {
                      for (let i = 1; i <= 1; i++) {
                        if ($.run == false) {
                          continue;
                        }
                        console.log(`开始3魔方第${i}次兑换`);
                        await doInteractiveAssignment($.config.giftConfig.projectId, vo.encryptAssignmentId, "acexinpin0823", 1);
                        await $.wait(1500);
                      }
                    }
                  }
                }
              } else {
                console.log('获取兑换失败了');
              }
            } else {
              sum = data.exchangeRestScoreMap['368'];
              if (sum >= 6) {
                for (let k = 1; k <= Math.floor(sum / 6); k++) {
                  if ($.run == false) {
                    continue;
                  }
                  console.log(`开始第${k}次收集魔方`);
                  await doInteractiveAssignment($.config.giftConfig.projectId, "wE62TwscdA52Z4WkpTJq7NaMvfw", "acexinpin0823", 0);//兑换魔方
                  await $.wait(1500);
                }
              }
            }
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

// 兑换和收集魔方
async function doInteractiveAssignment(encryptProjectId, AssignmentId, sourceCode, type) {
  return new Promise(async (resolve) => {
    $.post(taskUrl("doInteractiveAssignment", { "encryptProjectId": encryptProjectId, "encryptAssignmentId": AssignmentId, "sourceCode": sourceCode, "itemId": "", "actionType": "", "completionFlag": "", "ext": { "exchangeNum": 1 }, "extParam": { "businessData": { "random": "85707533" }, "signStr": "1639914390947~1KANxv8F8hhMDF4ZUtXWDAxMQ==.SVN4bmFJUXhvaExceCkCTFx8HW09Ch1gJklJfXtrVFc1ZSZJGykbFkhSGQEVNicJfCs1EiYdE0EKeQ4vRVg1.0f82af10~3,2~171F7F51216CC9EEA80A5C3D4372ED8F17117802E6ABE50E9AA1945A32CF6071~0vzuy9d~C~TxdFWRMObmwYE0BbXBYLbxdVARwDfR12YxgEYAMdABsBBwEYQRMYE1ACHAN5GHdjGABnBR0AHwQGARhFFhkTUAAZAnkYc2YZAGdyGEAdQBNpGRNTQ1oXCwAdFkZCFgsWBAcHCA0EBQcJDQwEAQMHAAkWHRZCVFATDhdFQEVAQVdBVxYZE0NUVRcLFldSQUVARUFUExgTRFFfFgtvAh0DBxgNHQwdBRkEaR0WX1sWCwcZE1dCFg8TVVIADARRUA0CB1EJAgYFUlABAlVRCAEBVQACVwYFAgAWGRNaQRYPE3hYWkBJFFBVR1JcBwAXHRZFFg8AAgINDAAAAg0FCAAGGBdbXxMOFxwHAwJRB1IFBgxUAAIZAAQEVFdUB1YFAgJSVQVSBhMYE1JFUxYLFld9egEDZ2d5f3Z3EUd8Q1h7fwhbB2hDDAkXHRZfQhcLFnZbWlZYVBR8X1cfFhkTWlBCFwsWCAQMAgQTGBdCV0MWD2oMAQQZAgIBaRkTRl4WD2oWZnhvHHV/BAUTGBNVW1VGXl1RExgTBQUTGBMFBR8GHwQXHRYIBAwCBBMYFwQHBAcFAgEHBwMAAgcHBwcZBQcDAgMCBwMAAgUHAwcHAhYZEwUTaRkTXV5VFwsWV1JTV1JXQEETGBNVXxMOE0EXHRZSXRcLFkYHGwMaBRYZE1dXa0MTDhMEBBMYE1ZREw4TRlRfUF5ZCAkBBgQCBAcCFhkTWVsWD2oFHQQZAWkdFlddW1YWDxMFBwcMCAUFBwMBAgkMSwBQegV7ZwRfbW8BeXVye2hYVUVWW3VJeVIMCR9Sc2NfZARBCWFmfmFgbABmbElldFJja19wYVp4Ykl+bHVwRXt5ZG5obWN8RGl1TQl8dW1weFNkTGxiUGtzT3gCZk5saXpJAEF0Q2h1dHdDd3xMfE14Xl4efXJXDHhDfHNxRmVzUWdCcmkEVgB+ZQxTe3Bge3dWDGN2T0VdemYBdnNcflF4dlZsf1pxV1J2WnBpXWwCcnYAX3pcVgZzYFBwcF9SfHt3Vll1SV8NaWVWcnRIR3lRZlZ1dnZ4enZZAHR+B3BXGwkDBAFXVQJSSk8dBU9KS3NKZVxRd2ZWU2Nnclp4fQAEZGJNa2ByXABkbHd6d2dYSWZyYFxlZVldYnVYZ3llSURxZwR0f3NJdVNxY15sdUxgd3FzR2NnZXNBZAF5fGVCa2d0XF5gZUlxcXdDZHZtcFtnc01gZGBMUVNyd3FUZEx4bnB3RHVzQglscwVgcnZJYVRjcntXZEZMdWJjcFFzTEJ3cWRlCE8FSQBEQEZdFhkTWUJTFwsWE0k=~0zkqpsb", "sceneid": "XMFJGh5" } }), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`doInteractiveAssignment API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data)
            if (data.subCode == '0') {
              if (type == 1) {
                console.log(`当前兑换${data.rewardsInfo.successRewards['3'][0].rewardName}`);
              }
            } else if (data.subCode == '1403' || data.subCode == '1703') {
              console.log(data.msg);
              $.run = false;
            } else {
              console.log(data);
            }
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

function taskUrl(functionId, body = {}) {
  return {
    url: `${JD_API_HOST}?functionId=${functionId}&body=${escape(JSON.stringify(body))}&appid=content_ecology&client=wh5&clientVersion=1.0.0`,
    headers: {
      'Host': 'api.m.jd.com',
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://h5.m.jd.com',
      'Accept-Language': 'zh-cn',
      'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      'Referer': 'https://h5.m.jd.com/babelDiy/Zeus/2bf3XEEyWG11pQzPGkKpKX2GxJz2/index.html',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cookie': cookie
    }
  }
}

function randomString(e) {
  let t = "abcdef0123456789"
  if (e === 16) t = "abcdefghijklmnopqrstuvwxyz0123456789"
  e = e || 32;
  let a = t.length, n = "";
  for (let i = 0; i < e; i++)
    n += t.charAt(Math.floor(Math.random() * a));
  return n
}

function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      url: "https://wq.jd.com/user_new/info/GetJDUserInfoUnion?sceneval=2",
      headers: {
        Host: "wq.jd.com",
        Accept: "*/*",
        Connection: "keep-alive",
        Cookie: cookie,
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        "Accept-Language": "zh-cn",
        "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
        "Accept-Encoding": "gzip, deflate, br"
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          $.logErr(err)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === 1001) {
              $.isLogin = false; //cookie过期
              return;
            }
            if (data['retcode'] === 0 && data.data && data.data.hasOwnProperty("userInfo")) {
              $.nickName = data.data.userInfo.baseInfo.nickname;
            }
          } else {
            console.log('京东服务器返回空数据');
          }
        }
      } catch (e) {
        $.logErr(e)
      } finally {
        resolve();
      }
    })
  })
}
function showMsg() {
  return new Promise(resolve => {
    if (!jdNotify) {
      $.msg($.name, '', `${message}`);
    } else {
      $.log(`京东账号${$.index}${$.nickName}\n${message}`);
    }
    resolve()
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
// prettier-ignore
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }