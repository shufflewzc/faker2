/**
 京喜-首页-牛牛福利
 Author：zxx
 Date：2021-11-2
 -----------------
 Update: 2021-11-17  修复任务
 -----------------
先内部助力，有剩余助力作者
 cron 1 0,19,23 * * * https://raw.githubusercontent.com/ZXX2021/jd-scripts/main/jd_nnfls.js
 */
const $ = new Env('牛牛福利');
const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const CryptoJS = $.isNode() ? require('crypto-js') : CryptoJS;
let cookiesArr = [];
let shareCodes = [];
let rcsArr = [];
let coin = 0;
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    });
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
} else {
    cookiesArr = [
        $.getdata("CookieJD"),
        $.getdata("CookieJD2"),
        ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)
    ].filter((item) => !!item);
};
!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
        return;
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        $.index = i + 1;
        $.cookie = cookiesArr[i];
        $.isLogin = true;
        $.nickName = '';
        $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
        await TotalBean();
        console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
        if (!$.isLogin) {
            $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });

            if ($.isNode()) {
                await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
            }
            continue
        }
        res = await UserSignNew();
        // await drawUserTask();
    }
    shareCodes = shareCodes.filter(code => code)
    const author = Math.random() > 0.5 ? 'zero205' : 'ZXX2021'
    await getShareCode('nnfls.json', author, 3, true)
    shareCodes = [...new Set([...shareCodes, ...($.shareCode || [])])];
    if (shareCodes.length > 0) {
        console.log(`\n*********开始互助**********\n`);
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        $.cookie = cookiesArr[i];
        $.canHelp = true;
        $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
        console.log(`====开始账号${$.UserName}===助力`)
        if (rcsArr.includes($.UserName) > 0) {
            console.log("不让助力，休息会！");
            break;
        }
        for (let j = 0; j < shareCodes.length; j++) {
            if (!$.canHelp) {
                break;
            }
            await help(shareCodes[j]);
            await $.wait(1000);
        }
    }
    console.log(`\n********执行任务抽奖**********\n`);
    for (let i = 0; i < cookiesArr.length; i++) {
        $.cookie = cookiesArr[i];
        $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
        console.log(`====开始账号${$.UserName}===`)
        if (rcsArr.includes($.UserName) > 0) {
            console.log("不让做任务，休息会！");
            continue;
        }
        await drawUserTask();
    }

})().catch((e) => { $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '') }).finally(() => { $.done(); })

function getShareCode(name, author = 'zero205', num = -1, shuffle = false) {
    return new Promise(resolve => {
        $.get({
            url: `https://raw.fastgit.org/${author}/updateTeam/main/shareCodes/${name}`,
            headers: {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
            }
        }, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    console.log(`优先账号内部互助，有剩余助力次数再帮作者助力`);
                    $.shareCode = JSON.parse(data) || []
                    if (shuffle) {
                        $.shareCode = $.shareCode.sort(() => 0.5 - Math.random())
                    }
                    if (num != -1) {
                        $.shareCode = $.shareCode.slice(0, num)
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


async function help(sharecode) {
    console.log(`${$.UserName} 去助力 ${sharecode}`)
    res = await api('sign/helpSign', 'flag,sceneval,token', { flag: 0, token: sharecode })
    await $.wait(3000)
    res = await api('sign/helpSign', 'flag,sceneval,token', { flag: 1, token: sharecode })
    if (res) {
        switch (res.retCode) {
            case 30014:
                console.log('不能助力自己');
                break;
            case 30010:
                console.log('助力已满！');
                break;
            case 30011:
                console.log('助力次数已用完！');
                $.canHelp = false;
                break;
            case 30009:
                console.log('已助力过！');
                break;
            case 60009:
                console.log('不让助力，先休息会！');
                rcsArr.push($.UserName);
                $.canHelp = false;
                break;
            case 0:
                console.log('助力成功');
                break;
            default:
                console.log('助力结果' + res.errMsg);
                break;
        }
    } else {
        console.log('助力失败！');
    }
    await $.wait(2000)
}

async function drawUserTask() {
    res = await api('task/QueryUserTask', 'sceneval,taskType', { taskType: 0 })
    let tasks = []
    if (res.datas) {
        for (let t of res.datas) {
            if (t.state !== 2)
                tasks.push(t.taskid ? t.taskid : t.taskId)
        }
    } else {
        res = await api('task/QueryPgTaskCfg', 'sceneval', {})
        if (tasks.length === 0) {
            for (let t of res.data.tasks) {
                tasks.push(t.taskid ? t.taskid : t.taskId)
            }
        }
    }
    console.log(`总任务数：${res.datas && res.datas.length}   本次执行任务数: ${tasks && tasks.length}`)
    await $.wait(2000)

    res = await api('task/QueryPgTaskCfg', 'sceneval', {})
    // console.log('tasks:', res.data.tasks && res.data.tasks.length)
    // await $.wait(2000)
    for (let t of res.data.tasks) {
        if (tasks.includes(t.taskid ? t.taskid : t.taskId)) {
            let sleep = (t.param7 ? t.param7 : 2) * 1000 + (Math.random() * 5 + 1) * 1000;
            console.log(`任务名：${t.taskName}    浏览时间：${sleep / 1000} s`)
            res = await api('task/drawUserTask', 'sceneval,taskid', { taskid: t.taskid ? t.taskid : t.taskId })
            await $.wait(sleep)
            res = await api('task/UserTaskFinish', 'sceneval,taskid', { taskid: t.taskid ? t.taskid : t.taskId })
            // console.log(`${JSON.stringify(res)}`)
            await $.wait(2000)

        }
    }

    res = await api('active/LuckyTwistUserInfo', 'sceneval', {})
    let surplusTimes = res.data.surplusTimes
    console.log('剩余抽奖次数', surplusTimes)
    for (let j = 0; j < surplusTimes && coin >= 10; j++) {
        res = await api('active/LuckyTwistDraw', 'active,activedesc,sceneval', { active: 'rwjs_fk1111', activedesc: encodeURIComponent('幸运扭蛋机抽奖') })
        if (res) {
            if (res.retCode == 0) {
                console.log('抽奖成功', res.data && res.data.prize ? res.data.prize[0].prizename : "")
            } else {
                console.log('抽奖失败', res.errMsg ? res.errMsg : "")
            }

        } else {
            console.log('抽奖失败，返回数据为空')
        }
        coin -= 10
        await $.wait(5000)
    }
    await $.wait(2000)
}

async function UserSignNew() {
    let fn = "sign/UserSignNew";
    let stk = "sceneval,source";
    let params = { source: '' };
    let res = await api(fn, stk, params);
    if (res) {
        if (res.retCode == 60009) {
            console.log('风控用户，不让玩')
            rcsArr.push($.UserName);
            return res;
        }
        console.log('签到', res.retCode == 0 ? "success" : "fail")
        console.log('助力码', res.data.token)
        shareCodes.push(res.data.token);
        coin = res.data.pgAmountTotal
        console.log('金币', coin)
    }
    return res;
}


function decrypturl(url, stk, params, appId = 10012) {
    for (const [key, val] of Object.entries(params)) {
        url += `&${key}=${val}`
    }
    url += '&h5st=' + decrypt(url, stk, appId)
    return url
}

function decrypt(url, stk, appId) {
    stk = stk || (url ? getJxmcUrlData(url, '_stk') : '')
    if (stk) {
        const timestamp = new Date().Format("yyyyMMddhhmmssSSS");
        let hash1 = '';
        if ($.fingerprint && $.Jxmctoken && $.enCryptMethodJD) {
            hash1 = $.enCryptMethodJD($.Jxmctoken, $.fingerprint.toString(), timestamp.toString(), appId.toString(), CryptoJS).toString(CryptoJS.enc.Hex);
        } else {
            const random = '5gkjB6SpmC9s';
            $.Jxmctoken = `tk01wcdf61cb3a8nYUtHcmhSUFFCfddDPRvKvYaMjHkxo6Aj7dhzO+GXGFa9nPXfcgT+mULoF1b1YIS1ghvSlbwhE0Xc`;
            $.fingerprint = 5287160221454703;
            const str = `${$.Jxmctoken}${$.fingerprint}${timestamp}${appId}${random}`;
            hash1 = CryptoJS.SHA512(str, $.Jxmctoken).toString(CryptoJS.enc.Hex);
        }
        let st = '';
        stk.split(',').map((item, index) => {
            st += `${item}:${getJxmcUrlData(url, item)}${index === stk.split(',').length - 1 ? '' : '&'}`;
        })
        const hash2 = CryptoJS.HmacSHA256(st, hash1.toString()).toString(CryptoJS.enc.Hex);
        return encodeURIComponent(["".concat(timestamp.toString()), "".concat($.fingerprint.toString()), "".concat(appId.toString()), "".concat($.Jxmctoken), "".concat(hash2)].join(";"))
    } else {
        return '20210318144213808;8277529360925161;10001;tk01w952a1b73a8nU0luMGtBanZTHCgj0KFVwDa4n5pJ95T/5bxO/m54p4MtgVEwKNev1u/BUjrpWAUMZPW0Kz2RWP8v;86054c036fe3bf0991bd9a9da1a8d44dd130c6508602215e50bb1e385326779d'
    }
}

function getJxmcUrlData(url, name) {
    if (typeof URL !== "undefined") {
        let urls = new URL(url);
        let data = urls.searchParams.get(name);
        return data ? data : '';
    } else {
        const query = url.match(/\?.*/)[0].substring(1)
        const vars = query.split('&')
        for (let i = 0; i < vars.length; i++) {
            const pair = vars[i].split('=')
            if (pair[0] === name) {
                return vars[i].substr(vars[i].indexOf('=') + 1);
            }
        }
        return ''
    }
}

async function api(fn, stk, params) {
    let url = `https://m.jingxi.com/pgcenter`;
    url = await decrypturl(`${url}/${fn}?sceneval=2&_stk=active,activedesc,sceneval&_ste=1&_=${Date.now()}&sceneval=2`, stk, params, 10012)
    let myRequest = taskUrl(url);
    return new Promise(async resolve => {
        let rv = "";
        $.get(myRequest, (err, resp, data) => {
            try {
                if (data) {
                    data = JSON.parse(data)
                    rv = data
                }
            } catch (e) {
                console.log(data);
                $.logErr(e, resp)
                resolve();
            } finally {
                resolve(rv);
            }
        })
    })
}

function taskUrl(url) {
    return {
        url,
        headers: {
            "Host": "m.jingxi.com",
            "Connection": "keep-alive",
            "User-Agent": "jdpingou",
            "Accept": "*/*",
            "Referer": "https://st.jingxi.com/pingou/taskcenter/index.html",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            "Cookie": $.cookie,
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
    }
}

function randomWord(randomFlag, min, max) {
    var str = "",
        range = min,
        arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

    // 随机产生
    if (randomFlag) {
        range = Math.round(Math.random() * (max - min)) + min;
    }
    for (var i = 0; i < range; i++) {
        pos = Math.round(Math.random() * (arr.length - 1));
        str += arr[pos];
    }
    return str;
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
                "Cookie": $.cookie,
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
                        if (data['retcode'] === 13) {
                            $.isLogin = false; //cookie过期
                            return
                        }
                        if (data['retcode'] === 0) {
                            $.nickName = (data['base'] && data['base'].nickname) || $.UserName;
                        } else {
                            $.nickName = $.UserName
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


Date.prototype.Format = function (fmt) {
    var e,
        n = this,
        d = fmt,
        l = {
            "M+": n.getMonth() + 1,
            "d+": n.getDate(),
            "D+": n.getDate(),
            "h+": n.getHours(),
            "H+": n.getHours(),
            "m+": n.getMinutes(),
            "s+": n.getSeconds(),
            "w+": n.getDay(),
            "q+": Math.floor((n.getMonth() + 3) / 3),
            "S+": n.getMilliseconds()
        };
    /(y+)/i.test(d) && (d = d.replace(RegExp.$1, "".concat(n.getFullYear()).substr(4 - RegExp.$1.length)));
    for (var k in l) {
        if (new RegExp("(".concat(k, ")")).test(d)) {
            var t, a = "S+" === k ? "000" : "00";
            d = d.replace(RegExp.$1, 1 == RegExp.$1.length ? l[k] : ("".concat(a) + l[k]).substr("".concat(l[k]).length))
        }
    }
    return d;
}

// prettier-ignore
function Env(t, e) {
    "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
    class s {
        constructor(t) { this.env = t }
        send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) }
        get(t) { return this.send.call(this.env, t) }
        post(t) { return this.send.call(this.env, t, "POST") }
    }
    return new class {
        constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) }
        isNode() { return "undefined" != typeof module && !!module.exports }
        isQuanX() { return "undefined" != typeof $task }
        isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon }
        isLoon() { return "undefined" != typeof $loon }
        toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } }
        toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } }
        getjson(t, e) {
            let s = e;
            const i = this.getdata(t);
            if (i) try { s = JSON.parse(this.getdata(t)) } catch { }
            return s
        }
        setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } }
        getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) }
        runScript(t, e) {
            return new Promise(s => {
                let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
                i = i ? i.replace(/\n/g, "").trim() : i;
                let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
                r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r;
                const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } };
                this.post(n, (t, e, i) => s(i))
            }).catch(t => this.logErr(t))
        }
        loaddata() {
            if (!this.isNode()) return {}; {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t),
                    i = !s && this.fs.existsSync(e);
                if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } }
            }
        }
        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t),
                    i = !s && this.fs.existsSync(e),
                    r = JSON.stringify(this.data);
                s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
            }
        }
        lodash_get(t, e, s) {
            const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
            let r = t;
            for (const t of i)
                if (r = Object(r)[t], void 0 === r) return s;
            return r
        }
        lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) }
        getdata(t) {
            let e = this.getval(t);
            if (/^@/.test(t)) {
                const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : "";
                if (r) try {
                    const t = JSON.parse(r);
                    e = t ? this.lodash_get(t, i, "") : e
                } catch (t) { e = "" }
            }
            return e
        }
        setdata(t, e) {
            let s = !1;
            if (/^@/.test(e)) {
                const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}";
                try {
                    const e = JSON.parse(h);
                    this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i)
                } catch (e) {
                    const o = {};
                    this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i)
                }
            } else s = this.setval(t, e);
            return s
        }
        getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null }
        setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null }
        initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) }
        get(t, e = (() => { })) {
            t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => {
                const { statusCode: s, statusCode: i, headers: r, body: o } = t;
                e(null, { status: s, statusCode: i, headers: r, body: o }, o)
            }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
                try {
                    if (t.headers["set-cookie"]) {
                        const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                        s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar
                    }
                } catch (t) { this.logErr(t) }
            }).then(t => {
                const { statusCode: s, statusCode: i, headers: r, body: o } = t;
                e(null, { status: s, statusCode: i, headers: r, body: o }, o)
            }, t => {
                const { message: s, response: i } = t;
                e(s, i, i && i.body)
            }))
        }
        post(t, e = (() => { })) {
            if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) });
            else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => {
                const { statusCode: s, statusCode: i, headers: r, body: o } = t;
                e(null, { status: s, statusCode: i, headers: r, body: o }, o)
            }, t => e(t));
            else if (this.isNode()) {
                this.initGotEnv(t);
                const { url: s, ...i } = t;
                this.got.post(s, i).then(t => {
                    const { statusCode: s, statusCode: i, headers: r, body: o } = t;
                    e(null, { status: s, statusCode: i, headers: r, body: o }, o)
                }, t => {
                    const { message: s, response: i } = t;
                    e(s, i, i && i.body)
                })
            }
        }
        time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t }
        msg(e = t, s = "", i = "", r) {
            const o = t => {
                if (!t) return t;
                if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        let e = t.openUrl || t.url || t["open-url"],
                            s = t.mediaUrl || t["media-url"];
                        return { openUrl: e, mediaUrl: s }
                    }
                    if (this.isQuanX()) {
                        let e = t["open-url"] || t.url || t.openUrl,
                            s = t["media-url"] || t.mediaUrl;
                        return { "open-url": e, "media-url": s }
                    }
                    if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } }
                }
            };
            if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) {
                let t = ["", "==============📣系统通知📣=============="];
                t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t)
            }
        }
        log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) }
        logErr(t, e) {
            const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t)
        }
        wait(t) { return new Promise(e => setTimeout(e, t)) }
        done(t = {}) {
            const e = (new Date).getTime(),
                s = (e - this.startTime) / 1e3;
            this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
        }
    }(t, e)
}
