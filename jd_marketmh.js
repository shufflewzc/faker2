/*
超市盲盒
入口：京东APP-更多-超市盲盒
39 12,21 * * *  jd_marketmh.js
updatetime：2022-11-7 开盒
jdpro
 */

const $ = new Env('超市盲盒');
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', secretp = '', joyToken = "";
let linkId = 'qHqXOx2bvqgFOzTH_-iJoQ';
$.shareCoseList = [];
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

const JD_API_HOST = `https://api.m.jd.com/client.action`;
!(async () => {
    console.log('活动入口：京东APP-更多-超市盲盒')
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
        return;
    }
    //await getToken();
    //cookiesArr = cookiesArr.map(ck => ck  + `joyytoken=50084${joyToken};`)
    for (let i = 0; i < cookiesArr.length; i++) {
        cookie = cookiesArr[i];
        if (cookie) {
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
            $.flag = true;
            if (!$.isLogin) {
                $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
                continue
            }
            console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
            await main()
        }
    };
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())

async function main() {
    await starShopPageInfo({ "taskId": "", "linkId": linkId, "encryptPin": "" })
    //if (!$.flag) await starShopDraw({"linkId":linkId,"isDailyRaffle":true});
    if (Date.now() > $.drawts) {
        console.log('开礼盒时间到，去开...')
        for (let i = 0; i < $.drawtimes; i++) {
            await starShopDraw();
            await $.wait(500);
        }
    }
    await $.wait(1000);
    await apTaskList({ "linkId": linkId });
    if ($.allList) {
        for (let i = 0; i < $.allList.length; i++) {
            $.oneTask = $.allList[i];
            if (["SIGN"].includes($.oneTask.taskType) && $.oneTask.taskFinished === false) {
                await apDoTask({ "taskId": $.allList[i].id, "taskType": $.allList[i].taskType, "linkId": linkId })
            };
            if (["BROWSE_CHANNEL"].includes($.oneTask.taskType) && $.oneTask.taskFinished === false) {
                await apTaskDetail({ "taskId": $.oneTask.id, "taskType": $.oneTask.taskType, "channel": 4, "linkId": linkId });
                await $.wait(1000)
                for (let y = 0; y < ($.doList.status.finishNeed - $.doList.status.userFinishedTimes); y++) {
                    $.startList = $.doList.taskItemList[y];
                    $.itemName = $.doList.taskItemList[y].itemName;
                    console.log(`去浏览${$.itemName}`)
                    await apDoTask({ "taskId": $.allList[i].id, "taskType": $.allList[i].taskType, "channel": 4, "itemId": $.startList.itemId, "linkId": linkId })
                    await $.wait(1000)
                }
            }
        }
    } else {
        console.log(`无任务数据！`)
    }
}

//活动主页
function starShopPageInfo(body) {
    return new Promise((resolve) => {
        $.get(taskGetUrl('starShopPageInfo', body), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`starShopPageInfo 请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    if (data.code === 0) {
                        $.flag = data.data.isDailyRaffle;
                        $.drawtimes = data.data.avaiableTimes;
                        $.drawts = data.data.planDrawTime;
                        console.log('当前积分：' + data.data.currentGoodRoleValue);
                    } else {
                        console.log(`starShopPageInfo：${JSON.stringify(data)}\n`);
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}
//惊喜礼盒
function starShopDraw(body) {
    let opt =
    {
        url: 'https://api.m.jd.com/?functionId=starShopDraw&body={%22linkId%22:%22qHqXOx2bvqgFOzTH_-iJoQ%22}&appid=activities_platform&t=1667822944208&client=android&clientVersion=11.3.0&h5st=20221107200904210%3B6499624445078456%3B568c6%3Btk02w69911b1718n4BJd1F3S7xUk5Lw%2Bnu3d2ZLLORy0io21aJoCapEcA8gbK9tvLzON1FQ1iLeder0OAU4Th%2F7yWwZn%3Beb5ae376b553da072432e7749e8b852745ad3ea35e554ce04d1eb2b0ab1c3bfa%3B3.1%3B1667822944210%3B62f4d401ae05799f14989d31956d3c5f0a269d1342e4ecb6ab00268fc69555cdc3295f00e681fd72cd76a48b9fb3faf3579d80b37c85b023e9e8ba94d8d2b852b9cbef42726bbe41ffd8c74540f4a1ced584468ba9e46bfbef62144b678f5532e02456edc95e6131cb12c2dd5fa5c6c0ca7e28a3c717e0dd9ae889f2eaf9441c5254165d7b1aa2509f8e74f626a4f631',
        //body: `functionId=${functionId}&body=${JSON.stringify(body)}&client=wh5&clientVersion=1.0.0&uuid=ef746bc0663f7ca06cdd1fa724c15451900039cf`,
        headers: {
            'User-Agent': 'jdapp;android;11.3.0;;;appBuild/98413;ef/1;ep/%7B%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22ts%22%3A1667822922035%2C%22ridx%22%3A-1%2C%22cipher%22%3A%7B%22sv%22%3A%22EG%3D%3D%22%2C%22ad%22%3A%22ZwS1ZQC4ZwVrZJZuDzC0ZK%3D%3D%22%2C%22od%22%3A%22ZQHuZtc3CzCjZtdvZM1rEQO5BJvsD2OjCzPsZwHsZQU2YzKz%22%2C%22ov%22%3A%22Ctq%3D%22%2C%22ud%22%3A%22ZwS1ZQC4ZwVrZJZuDzC0ZK%3D%3D%22%7D%2C%22ciphertype%22%3A5%2C%22version%22%3A%221.2.0%22%2C%22appname%22%3A%22com.jingdong.app.mall%22%7D;jdSupportDarkMode/0;Mozilla/5.0 (Linux; Android 9; LYA-AL00 Build/HUAWEILYA-AL00L; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 MQQBrowser/6.2 TBS/046033 Mobile Safari/537.36',
            //'Content-Type': 'application/x-www-form-urlencoded',
            //'Host': 'api.m.jd.com',
            'Cookie': cookie,
            'Origin': 'https://prodev.m.jd.com',
            'Referer': 'https://prodev.m.jd.com/',
        }
    }
    return new Promise((resolve) => {
        $.get(opt, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`starShopDraw 请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    if (data.success) {
                        if (data.data.prizeType === 2) {
                            console.log('开启惊喜礼盒，获得红包：' + data.data.prizeValue);
                        }
                    } else {
                        console.log(`starShopDraw：${(data.errMsg)}\n`);
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}
//获取任务列表
function apTaskList(body) {
    return new Promise((resolve) => {
        $.get(taskGetUrl('apTaskList', body), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} apTaskList API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    if (data.code === 0) {
                        $.allList = data.data
                    } else {
                        console.log(`apTaskList错误：${JSON.stringify(data)}\n`);
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}

//获取任务分表
function apTaskDetail(body) {
    return new Promise((resolve) => {
        $.get(taskGetUrl('apTaskDetail', body), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} apTaskDetail API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    if (data.code === 0) {
                        $.doList = data.data
                        //console.log(JSON.stringify($.doList));
                    } else {
                        console.log(`apTaskDetail错误：${JSON.stringify(data)}\n`);
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}

//做任务
function apDoTask(body) {
    return new Promise((resolve) => {
        $.post(taskPostUrl('apDoTask', body), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} apDoTask API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    //console.log(JSON.stringify(data));
                    if (data.success === true && data.code === 0) {
                        console.log(`任务完成！`)
                    } else if (data.success === false && data.code === 2005) {
                        console.log(`${data.data.errMsg}${data.data.userFinishedTimes}次`)
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}

//助力
function helpShare(body) {
    return new Promise((resolve) => {
        $.get(taskGetUrl('superboxSupBoxHomePage', body), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} superboxSupBoxHomePage API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    //console.log(JSON.stringify(data));
                    if (data.success === true && data.code === 0) {
                        console.log(`助力成功\n\n`)
                    } else {
                        console.log(`助力失败：${JSON.stringify(data)}\n\n`)
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}

//开盲盒
function openBox(body) {
    return new Promise((resolve) => {
        $.get(taskGetUrl('superboxOrdinaryLottery', body), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} superboxOrdinaryLottery API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    //console.log(JSON.stringify(data));
                    if (data.success === true && data.code === 0 && data.data.rewardType === 2) {
                        console.log(`开箱成功获得${data.data.discount}元红包\n\n`)
                    } else if (data.success === true && data.code === 0 && data.data.rewardType !== 2) {
                        console.log(`开箱成功应该获得了空气${JSON.stringify(data.data)}\n\n`)
                    } else {
                        console.log(`失败：${JSON.stringify(data)}\n\n`)
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}

function getToken(timeout = 0) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let url = {
                url: `https://bh.m.jd.com/gettoken`,
                headers: {
                    'Content-Type': `text/plain;charset=UTF-8`
                },
                body: `content={"appname":"50084","whwswswws":"","jdkey":"","body":{"platform":"1"}}`
            }
            $.post(url, async (err, resp, data) => {
                try {
                    data = JSON.parse(data);
                    joyToken = data.joyytoken;
                    console.log(`joyToken = ${data.joyytoken}`)
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve()
                }
            })
        }, timeout)
    })
}

function taskGetUrl(functionId, body = {}) {
    return {
        url: `${JD_API_HOST}?functionId=${functionId}&body=${JSON.stringify(body)}&_t=${Date.now()}&appid=activities_platform&client=wh5&clientVersion=1.0.0`,
        //body: `functionId=${functionId}&body=${JSON.stringify(body)}&client=wh5&clientVersion=1.0.0&uuid=ef746bc0663f7ca06cdd1fa724c15451900039cf`,
        headers: {
            'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'api.m.jd.com',
            'Cookie': cookie,
            'Origin': 'https://prodev.m.jd.com',
            'Referer': 'https://prodev.m.jd.com/mall/active/3z9BVbnAa1sVy88yEyKdp9wcWZ7Z/index.html?',
        }
    }
}

function taskPostUrl(functionId, body = {}) {
    return {
        url: `${JD_API_HOST}?functionId=${functionId}`,
        body: `functionId=${functionId}&body=${JSON.stringify(body)}&_t=${Date.now()}&appid=activities_platform&client=wh5&clientVersion=1.0.0`,
        headers: {
            'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'api.m.jd.com',
            'Cookie': cookie,
            'Origin': 'https://prodev.m.jd.com',
            'Referer': 'https://prodev.m.jd.com/mall/active/3z9BVbnAa1sVy88yEyKdp9wcWZ7Z/index.html?',
        }
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