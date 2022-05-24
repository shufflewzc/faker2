if (process.env.JD_19E != "true") {
    console.log('\n默认不运行,安全性自行衡量,设置变量export JD_19E="true"来运行\n')
    return
}

/*

建议手动先点开一次
33 0,6-23/2 * * * jd_19E.js

*/
const $ = new Env('热爱奇旅');

const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';


let cookiesArr = [],
    cookie = '',
    message;
let secretp = '',
    inviteId = []

if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
const JD_API_HOST = 'https://api.m.jd.com/client.action';
let inviteCodes = [

]
$.shareCodesArr = [];

!(async() => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
        return;
    }
    $.inviteIdCodesArr = {}
    for (let i = 0; i < cookiesArr.length && true; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.index = i + 1;
            await getUA()
        }
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
            message = '';
            console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
            //   await shareCodesFormat()
            $.newShareCodes = []
            for (let i = 0; i < $.newShareCodes.length && true; ++i) {
                console.log(`\n开始助力 【${$.newShareCodes[i]}】`)
                let res = await getInfo($.newShareCodes[i])
                if (res && res['data'] && res['data']['bizCode'] === 0) {
                    if (res['data']['result']['toasts'] && res['data']['result']['toasts'][0] && res['data']['result']['toasts'][0]['status'] === '3') {
                        console.log(`助力次数已耗尽，跳出`)
                        break
                    }
                    if (res['data']['result']['toasts'] && res['data']['result']['toasts'][0]) {
                        console.log(`助力 【${$.newShareCodes[i]}】:${res.data.result.toasts[0].msg}`)
                    }
                }
                if ((res && res['status'] && res['status'] === '3') || (res && res.data && res.data.bizCode === -11)) {
                    // 助力次数耗尽 || 黑号
                    break
                }
            }
            try {
                await get_secretp()

                do {
                    var conti = false
                    await promote_collectAtuoScore()
                    res = await promote_getTaskDetail()

                    for (var p = 0; p < res.lotteryTaskVos[0].badgeAwardVos.length; p++) {
                        if (res.lotteryTaskVos[0].badgeAwardVos[p].status == 3) {
                            await promote_getBadgeAward(res.lotteryTaskVos[0].badgeAwardVos[p].awardToken)
                        }

                    }
                    let task = []
                    let r = []
                    for (var p = 0; p < res.taskVos.length; p++) {
                        task = res.taskVos[p]
                        if (task.status != 1) continue
                        switch (task.taskType) {
                            case 7:
                            case 9:
                            case 3:
                            case 6:
                            case 26:
                                var tmp = []
                                if (task.taskType == 7) {
                                    tmp = task.browseShopVo
                                } else {
                                    tmp = task.shoppingActivityVos
                                }

                                for (var o = 0; o < tmp.length; o++) {
                                    console.log(`\n\n ${tmp[o].title?tmp[o].title:tmp[o].shopName}`)
                                    if (tmp[o].status == 1) {
                                        conti = true
                                        await promote_collectScore(tmp[o].taskToken, task.taskId)
                                    }

                                }
                                await $.wait(8000)
                                for (var o = 0; o < tmp.length; o++) {
                                    if (tmp[o].status == 1) {
                                        conti = true
                                        await qryViewkitCallbackResult(tmp[o].taskToken)
                                    }

                                }
                                break
                            case 2:
                                r = await promote_getFeedDetail(task.taskId)
                                var t = 0;
                                for (var o = 0; o < r.productInfoVos.length; o++) {
                                    if (r.productInfoVos[o].status == 1) {
                                        conti = true
                                        await promote_collectScore(r.productInfoVos[o].taskToken, task.taskId)
                                        t++
                                        if (t >= 5) break
                                    }

                                }
                                break
                            case 5:
                                r = await promote_getFeedDetail2(task.taskId)
                                var t = 0;
                                for (var o = 0; o < r.browseShopVo.length; o++) {
                                    if (r.browseShopVo[o].status == 1) {
                                        conti = true
                                        await promote_collectScore(r.browseShopVo[o].taskToken, task.taskId)
                                        t++
                                        if (t >= 5) break
                                    }

                                }
                                break
                            case 21:
                                for (var o = 0; o < task.brandMemberVos.length; o++) {
                                    if (task.brandMemberVos[o].status == 1) {
                                        console.log(`\n\n ${task.brandMemberVos[o].title}`)
                                        memberUrl = task.brandMemberVos[o].memberUrl
                                        memberUrl = transform(memberUrl)
                                        await join(task.brandMemberVos[o].vendorIds, memberUrl.channel, memberUrl.shopId ? memberUrl.shopId : "")
                                        await promote_collectScore(task.brandMemberVos[o].taskToken, task.taskId)
                                    }

                                }
                        }

                    }
                    await $.wait(1000)
                } while (conti)


                await promote_sign()
                do {
                    var ret = await promote_raise()
                } while (ret)
                console.log(`\n\n助力码：${res.inviteId}\n`)
                $.newShareCodes.push(res.inviteId)
                inviteId.push(res.inviteId)
            } catch (e) {
                $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
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

function transform(str) {
    var REQUEST = new Object,
        data = str.slice(str.indexOf("?") + 1, str.length - 1),
        aParams = data.substr(1).split("&");
    for (i = 0; i < aParams.length; i++) {　　
        var aParam = aParams[i].split("=");　　
        REQUEST[aParam[0]] = aParam[1]
    }
    return REQUEST
}

function get_secretp() {
    let body = {};
    return new Promise((resolve) => {
        $.post(taskPostUrl("promote_getHomeData", body), async(err, resp, data) => {
            //console.log(data)
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data.code == 0) {
                            if (data.data && data.data.bizCode === 0) {
                                secretp = data.data.result.homeMainInfo.secretp
                                console.log(secretp)
                          }
                        } else 
                        if (data.code != 0) {
                            //console.log(`\n\nsecretp失败:${JSON.stringify(data)}\n`)
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

function promote_sign() {
    let body = { "ss": { "extraData": { "log": "", "sceneid": "RAhomePageh5" }, "secretp": secretp, "random": randomString(6) } };
    return new Promise((resolve) => {
        $.post(taskPostUrl("promote_sign", body), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data.code === 0) {
                            if (data.data && data['data']['bizCode'] === 0) {

                                console.log(`\n\n 签到成功`)
                                resolve(true)
                            } else {
                                resolve(false)
                            }
                        } else {
                            console.log(`\n\n签到失败:${JSON.stringify(data)}\n`)
                            resolve(false)
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

function promote_raise() {
    let body = {"scenceId":4, "ss": { "extraData": { "log": "", "sceneid": "RAhomePageh5" }, "secretp": secretp, "random": randomString(6) } };
    return new Promise((resolve) => {
        $.post(taskPostUrl("promote_raise", body), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data.code === 0) {
                            if (data.data && data['data']['bizCode'] === 0) {

                                console.log(`\n\n 升级成功`)
                                resolve(true)
                            } else {
                                resolve(false)
                            }
                        } else {
                            console.log(`\n\n升级失败:${JSON.stringify(data)}\n`)
                            resolve(false)
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

function promote_collectAtuoScore() {
    let body = { "ss": { "extraData": { "log": "", "sceneid": "RAhomePageh5" }, "secretp": secretp, "random": randomString(6) } };
    return new Promise((resolve) => {
        $.post(taskPostUrl("promote_collectAtuoScore", body), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data.code === 0) {
                            if (data.data && data['data']['bizCode'] === 0) {

                                console.log(`\n\n 成功领取${data.data.result.produceScore}个币`)
                            }
                        } else {
                            //console.log(`\n\nsecretp失败:${JSON.stringify(data)}\n`)
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

function promote_getTaskDetail() {
    let body = {};
    return new Promise((resolve) => {
        $.post(taskPostUrl("promote_getTaskDetail", body), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data.code === 0) {
                            if (data.data && data['data']['bizCode'] === 0) {
                                if (data.data.result.inviteId == null) {
                                    console.log("黑号")
                                    resolve("")
                                }
                                inviteId.push(data.data.result.inviteId)
                                resolve(data.data.result)
                            }
                        } else {
                            //console.log(`\n\nsecretp失败:${JSON.stringify(data)}\n`)
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

function promote_collectScore(taskToken, taskId) {
    let body = { "taskId": taskId, "taskToken": taskToken, "actionType": 1, "ss": { "extraData": { "log": "", "sceneid": "RAhomePageh5" }, "secretp": secretp, "random": randomString(6) } };

    return new Promise((resolve) => {
        $.post(taskPostUrl("promote_collectScore", body), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data.code === 0) {
                            if (data.data && data['data']['bizCode'] === 0) {
                                console.log(data.msg)
                            }
                        } else {
                            console.log(`\n\n 失败:${JSON.stringify(data)}\n`)
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

function qryViewkitCallbackResult(taskToken) {
    let body = { "dataSource": "newshortAward", "method": "getTaskAward", "reqParams": `{\"taskToken\":"${taskToken}"}`, "sdkVersion": "1.0.0", "clientLanguage": "zh", "onlyTimeId": new Date().getTime(), "riskParam": { "platform": "3", "orgType": "2", "openId": "-1", "pageClickKey": "Babel_VKCoupon", "eid": "", "fp": "-1", "shshshfp": "", "shshshfpa": "", "shshshfpb": "", "childActivityUrl": "", "userArea": "-1", "client": "", "clientVersion": "", "uuid": "", "osVersion": "", "brand": "", "model": "", "networkType": "", "jda": "-1" } };

    return new Promise((resolve) => {
        $.post(taskPostUrl2("qryViewkitCallbackResult", body), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        if (data.indexOf("已完成") != -1) {
                            data = JSON.parse(data);
                            console.log(`\n\n ${data.toast.subTitle}`)
                        } else {
                            console.log(`\n\n失败:${JSON.stringify(data)}\n`)
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

function promote_getBadgeAward(taskToken) {
    let body = { "awardToken": taskToken };

    return new Promise((resolve) => {
        $.post(taskPostUrl("promote_getBadgeAward", body), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data.code === 0) {
                            if (data.data && data['data']['bizCode'] === 0) {
                                for (let i = 0; i < data.data.result.myAwardVos.length; i++) {
                                    switch (data.data.result.myAwardVos[i].type) {
                                        case 15:
                                            console.log(`\n\n 获得${data.data.result.myAwardVos[i].pointVo.score}币`)
                                            break
                                        case 1:
                                            //console.log(`\n\n 获得优惠券 满${data.result.myAwardVos[1].couponVo.usageThreshold}-${data.result.myAwardVos[i].couponVo.quota}  ${data.result.myAwardVos[i].couponVo.useRange}`)
                                            break
                                    }
                                }
                            }
                        } else {
                            console.log(`\n\n 失败:${JSON.stringify(data)}\n`)
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

function promote_getFeedDetail(taskId) {
    let body = { "taskId": taskId.toString() };

    return new Promise((resolve) => {
        $.post(taskPostUrl("promote_getFeedDetail", body), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data.code === 0) {
                            if (data.data && data['data']['bizCode'] === 0) {
                                resolve(data.data.result.addProductVos[0])
                            }
                        } else {
                            console.log(`\n\n 失败:${JSON.stringify(data)}\n`)
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

function promote_getFeedDetail2(taskId) {
    let body = { "taskId": taskId.toString() };

    return new Promise((resolve) => {
        $.post(taskPostUrl("promote_getFeedDetail", body), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data);
                        if (data.code === 0) {
                            if (data.data && data['data']['bizCode'] === 0) {
                                resolve(data.data.result.taskVos[0])
                            }
                        } else {
                            console.log(`\n\n 失败:${JSON.stringify(data)}\n`)
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

function join(venderId, channel, shopId) {
    let shopId_ = shopId != "" ? `,"shopId":"${shopId}"` : ""
    return new Promise((resolve) => {
        $.get({
            url: `https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=bindWithVender&body={"venderId":"${venderId}"${shopId_},"bindByVerifyCodeFlag":1,"registerExtend":{},"writeChildFlag":0,"channel":${channel}}&client=H5&clientVersion=9.2.0&uuid=88888`,
            headers: {
                'Content-Type': 'text/plain; Charset=UTF-8',
                'Cookie': cookie,
                'Host': 'api.m.jd.com',
                'Connection': 'keep-alive',
                'Content-Type': 'application/x-www-form-urlencoded',
                "User-Agent": $.UA,
                'Accept-Language': 'zh-cn',
                'Referer': `https://shopmember.m.jd.com/shopcard/?venderId=${venderId}&shopId=${venderId}&venderType=5&channel=401&returnUrl=https://lzdz1-isv.isvjcloud.com/dingzhi/personal/care/activity/4540555?activityId=dz210768869313`,
                'Accept-Encoding': 'gzip, deflate, br'
            }
        }, async(err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        if (data.indexOf("成功") != -1) {
                            console.log(`\n\n 入会成功\n`)
                        } else {
                            console.log(`\n\n 失败:${JSON.stringify(data)}\n`)
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

function taskPostUrl(functionId, body) {
    return {
        //functionId=promote_getHomeData&body={}&client=wh5&clientVersion=1.0.0
        url: `${JD_API_HOST}`,
        body: `functionId=${functionId}&body=${escape(JSON.stringify(body))}&client=m&clientVersion=-1&appid=signed_wh5`,
        headers: {
            'Cookie': cookie,
            'Host': 'api.m.jd.com',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            "User-Agent": $.UA,
            'Origin': 'https://wbbny.m.jd.com',
            'Accept-Language': 'zh-cn',
            'Accept-Encoding': 'gzip, deflate, br',
        }
    }
}

function taskPostUrl2(functionId, body) {
    return {
        url: `${JD_API_HOST}?functionId=${functionId}&client=wh5`,
        body: `body=${escape(JSON.stringify(body))}`,
        headers: {
            'Cookie': cookie,
            'Host': 'api.m.jd.com',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            "User-Agent": $.UA,
            'Accept-Language': 'zh-cn',
            'Accept-Encoding': 'gzip, deflate, br',
            'Origin': 'https://wbbny.m.jd.com',
        }
    }
}



function getUA() {
    $.UA = `jdapp;android;10.0.6;11;9363537336739353-2636733333439346;network/wifi;model/KB2000;addressid/138121554;aid/9657c795bc73349d;oaid/;osVer/30;appBuild/88852;partner/oppo;eufv/1;jdSupportDarkMode/0;Mozilla/5.0 (Linux; Android 11; KB2000 Build/RP1A.201005.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045537 Mobile Safari/537.36`
}

function randomString(e) {
    e = e || 32;
    let t = "abcdef0123456789",
        a = t.length,
        n = "";
    for (i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
}

function randomNum(e) {
    e = e || 32;
    let t = "0123456789",
        a = t.length,
        n = "";
    for (i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
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
            if (i) try { s = JSON.parse(this.getdata(t)) } catch {}
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
        get(t, e = (() => {})) {
            t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => {!t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => {
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
        post(t, e = (() => {})) {
            if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => {!t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) });
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