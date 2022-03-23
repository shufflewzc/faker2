/*
大牌好礼 迎春季

*/
const $ = new Env("大牌好礼 迎春季");
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const notify = $.isNode() ? require('./sendNotify') : '';
let cookiesArr = [], cookie = '', message = '';
let ownCode = null;
let authorCodeList = []
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
} else {
    let cookiesData = $.getdata('CookiesJD') || "[]";
    cookiesData = JSON.parse(cookiesData);
    cookiesArr = cookiesData.map(item => item.cookie);
    cookiesArr.reverse();
    cookiesArr.push(...[$.getdata('CookieJD2'), $.getdata('CookieJD')]);
    cookiesArr.reverse();
    cookiesArr = cookiesArr.filter(item => !!item);
}
!(async () => {
    $.getAuthorCodeListerr = false
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
        return;
    }
    // authorCodeList = await getAuthorCodeList('https://gitee.com/fatelight/Code/raw/master/lzdz1.json')
    // if($.getAuthorCodeListerr === false){
    //     authorCodeList = [
    //         // '980f55cfc5494ff895ddf9a3b2d3ff3b',
    //     ]
    // }
    // console.log(authorCodeList)
    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i]
            originCookie = cookiesArr[i]
            newCookie = ''
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
            await checkCookie();
            console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
            if (!$.isLogin) {
                $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
                // if ($.isNode()) {
                //     await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                // }
                continue
            }
            $.bean = 0;
            $.ADID = getUUID('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 1);
            $.UUID = getUUID('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
            authorCodeList = [
                '3000bd151f014f07802aa623fb1dddf6',
                'a9c4b3bffa6044b78646684b98d107b2',
                '2dd9a4ec3c404222a27f7dc24bbf9fda',
            ]
            // $.authorCode = authorCodeList[random(0, authorCodeList.length)]
            $.authorCode = ownCode ? ownCode : authorCodeList[random(0, authorCodeList.length)]
            $.authorNum = `${random(1000000, 9999999)}`
            $.randomCode = random(1000000, 9999999)
            $.activityId = 'dzlhkk068d4d0ab8a1256853002f50'
            $.activityShopId = '1000004123'
            $.activityUrl = `https://lzdz1-isv.isvjcloud.com/dingzhi/customized/common/activity/${$.authorNum}?activityId=${$.activityId}&shareUuid=${encodeURIComponent($.authorCode)}&adsource=GG&shareuserid4minipg=${encodeURIComponent($.secretPin)}&shopid=undefined&sid=&un_area=`
            await member();
            // await $.wait(5000)
            if ($.bean > 0) {
                message += `\n【京东账号${$.index}】${$.nickName || $.UserName} \n       └ 获得 ${$.bean} 京豆。`
            }
        }
    }
    if (message !== '') {
        if ($.isNode()) {
            await notify.sendNotify($.name, message, '', `\n`);
        } else {
            $.msg($.name, '有点儿收获', message);
        }
    }
})()
    .catch((e) => {
        $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
        $.done();
    })


async function member() {
    $.token = null;
    $.secretPin = null;
    $.openCardActivityId = null
    lz_cookie = {};
    await getFirstLZCK()
    await getToken();
    await task('dz/common/getSimpleActInfoVo', `activityId=${$.activityId}`, 1)
    if ($.token) {
        await getMyPing();
        if ($.secretPin) {
            console.log("去助力 -> " + $.authorCode);
            await taskaccessLog("common/accessLogWithAD", `venderId=${$.activityShopId}&code=99&pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}&pageUrl=${$.activityUrl}&subType=app&adSource=GG`, 1);
            await task('wxActionCommon/getUserInfo', `pin=${encodeURIComponent($.secretPin)}`, 1)
            if ($.index === 1) {
                await task('linkgame/activity/content', `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&pinImg=&nick=${encodeURIComponent($.pin)}&cjyxPin=&cjhyPin=&shareUuid=${encodeURIComponent($.authorCode)}&adsource=GG`, 0, 1)
            } else {
                await task('linkgame/activity/content', `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&pinImg=&nick=${encodeURIComponent($.pin)}&cjyxPin=&cjhyPin=&shareUuid=${encodeURIComponent($.authorCode)}&adsource=GG`)
            }
            $.log("关注店铺")
            await task('opencard/follow/shop', `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}`)
            await task('taskact/common/drawContent', `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}`)
            await task('linkgame/checkOpenCard', `pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}`)
            $.log("加入店铺会员")
            if ($.openCardList) {
                for (const vo of $.openCardList) {
                    $.log(`>>> 去加入${vo.name} ${vo.venderId}`)
                    if (vo.status === 0) {
                        await getShopOpenCardInfo({ "venderId": `${vo.venderId}`, "channel": "401" }, vo.venderId)
                        await bindWithVender({ "venderId": `${vo.venderId}`, "bindByVerifyCodeFlag": 1, "registerExtend": {}, "writeChildFlag": 0, "activityId": $.openCardActivityId, "channel": 401 }, vo.venderId)
                        await $.wait(1000)
                    } else {
                        $.log(`>>> 已经是会员`)
                    }
                }
            } else {
                $.log("没有获取到对应的任务。\n")
            }
            await task('linkgame/checkOpenCard', `pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}`)
            if ($.openCardStatus) {
                console.log('去助力 -> ' + $.authorCode)
                if ($.openCardStatus.allOpenCard) {
                    await task('linkgame/assist/status', `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&shareUuid=${$.authorCode}`)
                    await task('linkgame/assist', `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&shareUuid=${$.authorCode}`)

                }
            }
            // await task('linkgame/help/list', `pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}`)

            // await task('linkgame/task/info', `pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}`)
            // console.log('任务 -> ')
            // await $.wait(2000)
            // await task('opencard/addCart', `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}`);
            // await $.wait(2000)
            // await task('linkgame/sendAllCoupon', `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}`);
            // console.log('抽奖 -> ')
            // await $.wait(2000)
            // await task('opencard/draw', `activityId=${$.activityId}&actorUuid=${$.actorUuid}&pin=${encodeURIComponent($.secretPin)}`);
        }
    }
}

function task(function_id, body, isCommon = 0, own = 0) {
    return new Promise(resolve => {
        $.post(taskUrl(function_id, body, isCommon), async (err, resp, data) => {
            try {
                if (err) {
                    $.log(err)
                } else {

                    if (data) {
                        data = JSON.parse(data);
                        if (data.result) {
                            switch (function_id) {
                                case 'dz/common/getSimpleActInfoVo':
                                    // console.log(data)
                                    $.jdActivityId = data.data.jdActivityId;
                                    $.venderId = data.data.venderId;
                                    $.activityType = data.data.activityType;
                                    break;
                                case 'wxActionCommon/getUserInfo':
                                    break;
                                case 'linkgame/activity/content':
                                    // console.log(data)
                                    if (!data.data.hasEnd) {
                                        $.log(`开启【${data.data.activity['name']}】活动`)
                                        $.log("-------------------")
                                        if ($.index === 1) {
                                            ownCode = data.data.actor['actorUuid']
                                            console.log(ownCode)
                                        }
                                        $.actorUuid = data.data.actor['actorUuid'];
                                    } else {
                                        $.log("活动已经结束");
                                    }
                                    break;
                                case 'linkgame/checkOpenCard':
                                    $.openCardList = data.data.openCardList;
                                    $.openCardStatus = data.data;
                                    // console.log(data)
                                    break;
                                case 'opencard/follow/shop':
                                    console.log(data)
                                    break;
                                case 'linkgame/sign':
                                    console.log(data)
                                    break;
                                case 'opencard/addCart':
                                    if (data.data) {
                                        console.log(data.data)
                                    }
                                    break;
                                case 'linkgame/sendAllCoupon':
                                    if (data.data) {
                                        console.log(data.data)
                                    }
                                    
                                    break;
                                case 'interaction/write/writePersonInfo':
                                    console.log(data)
                                    break;
                                case 'opencard/draw':
                                    console.log(data)
                                    break;
                                case 'linkgame/assist/status':
                                    $.log(JSON.stringify(data))
                                    break;
                                case 'linkgame/assist':
                                    $.log(JSON.stringify(data))
                                    break;
                                case 'linkgame/help/list':
                                    $.log(JSON.stringify(data))
                                    break;
                                default:
                                    // $.log(JSON.stringify(data))
                                    break;
                            }
                        } else {
                            // $.log(JSON.stringify(data))
                        }
                    } else {
                        // $.log("京东没有返回数据")
                    }
                }
            } catch (error) {
                $.log(error)
            } finally {
                resolve();
            }
        })
    })
}

function getAuthorCodeList(url) {
    return new Promise(resolve => {
        const options = {
            url: `${url}?${new Date()}`, "timeout": 10000, headers: {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
            }
        };
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    // $.log(err)
                    $.getAuthorCodeListerr = false
                } else {
                if (data) data = JSON.parse(data)
                    $.getAuthorCodeListerr = true
                }
            } catch (e) {
                $.logErr(e, resp)
                data = null;
            } finally {
                resolve(data);
            }
        })
    })
}

function taskUrl(function_id, body, isCommon) {
    return {
        url: isCommon ? `https://lzdz1-isv.isvjcloud.com/${function_id}` : `https://lzdz1-isv.isvjcloud.com/dingzhi/${function_id}`,
        headers: {
            Host: 'lzdz1-isv.isvjcloud.com',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept-Language': 'zh-cn',
            'Accept-Encoding': 'gzip, deflate, br',
            'Content-Type': 'application/x-www-form-urlencoded',
            Origin: 'https://lzdz1-isv.isvjcloud.com',
            'User-Agent': `jdapp;iPhone;9.5.4;13.6;${$.UUID};network/wifi;ADID/${$.ADID};model/iPhone10,3;addressid/0;appBuild/167668;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
            Connection: 'keep-alive',
            Referer: $.activityUrl,
            Cookie: cookie
        },
        body: body

    }
}
function taskaccessLog(function_id, body, isCommon = 0) {
    return new Promise((resolve) => {
        $.post(taskUrl(function_id, body, isCommon), async (err, resp, data) => {
        try {
            if (err) {
            $.log(err);
            } else {
            // console.log(resp);
            if (resp["headers"]["set-cookie"]) {
                cookie = `${originCookie};`;
                for (let sk of resp["headers"]["set-cookie"]) {
                lz_cookie[sk.split(";")[0].substr(0, sk.split(";")[0].indexOf("="))] = sk.split(";")[0].substr(sk.split(";")[0].indexOf("=") + 1);
                }
                for (const vo of Object.keys(lz_cookie)) {
                cookie += vo + "=" + lz_cookie[vo] + ";";
                }
            }
            }
        } catch (error) {
            console.log(error);
        } finally {
            resolve();
        }
        });
    });
}
function getMyPing() {
    let opt = {
        url: `https://lzdz1-isv.isvjcloud.com/customer/getMyPing`,
        headers: {
            Host: 'lzdz1-isv.isvjcloud.com',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept-Language': 'zh-cn',
            'Accept-Encoding': 'gzip, deflate, br',
            'Content-Type': 'application/x-www-form-urlencoded',
            Origin: 'https://lzdz1-isv.isvjcloud.com',
            'User-Agent': `jdapp;iPhone;9.5.4;13.6;${$.UUID};network/wifi;ADID/${$.ADID};model/iPhone10,3;addressid/0;appBuild/167668;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
            Connection: 'keep-alive',
            Referer: $.activityUrl,
            Cookie: cookie,
        },
        body: `userId=${$.activityShopId}&token=${$.token}&fromType=APP&riskType=1`
    }
    return new Promise(resolve => {
        $.post(opt, (err, resp, data) => {
            try {
                if (err) {
                    $.log(err)
                } else {
                    if (resp['headers']['set-cookie']) {
                        cookie = `${originCookie}`
                        if ($.isNode()) {
                            for (let sk of resp['headers']['set-cookie']) {
                                cookie = `${cookie}${sk.split(";")[0]};`
                            }
                        } else {
                            for (let ck of resp['headers']['Set-Cookie'].split(',')) {
                                cookie = `${cookie}${ck.split(";")[0]};`
                            }
                        }
                    }
                    if (resp['headers']['Set-Cookie']) {
                        cookie = `${originCookie}`
                        if ($.isNode()) {
                            for (let sk of resp['headers']['set-cookie']) {
                                cookie = `${cookie}${sk.split(";")[0]};`
                            }
                        } else {
                            for (let ck of resp['headers']['Set-Cookie'].split(',')) {
                                cookie = `${cookie}${ck.split(";")[0]};`
                            }
                        }
                    }
                    if (data) {
                        data = JSON.parse(data)
                        if (data.result) {
                            $.log(`你好：${data.data.nickname}`)
                            $.pin = data.data.nickname;
                            $.secretPin = data.data.secretPin;
                            cookie = `${cookie};AUTH_C_USER=${data.data.secretPin}`
                        } else {
                            $.log(data.errorMessage)
                        }
                    } else {
                        $.log("京东返回了空数据")
                    }
                }
            } catch (error) {
                $.log(error)
            } finally {
                resolve();
            }

        })
    })
}
function getFirstLZCK() {
    return new Promise(resolve => {
        $.get({ url: $.activityUrl ,headers:{"user-agent":$.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")}}, (err, resp, data) => {
            try {
                if (err) {
                    console.log(err)
                } else {
                    if (resp['headers']['set-cookie']) {
                        cookie = `${originCookie}`
                        if ($.isNode()) {
                            for (let sk of resp['headers']['set-cookie']) {
                                cookie = `${cookie}${sk.split(";")[0]};`
                            }
                        } else {
                            for (let ck of resp['headers']['Set-Cookie'].split(',')) {
                                cookie = `${cookie}${ck.split(";")[0]};`
                            }
                        }
                    }
                    if (resp['headers']['Set-Cookie']) {
                        cookie = `${originCookie}`
                        if ($.isNode()) {
                            for (let sk of resp['headers']['set-cookie']) {
                                cookie = `${cookie}${sk.split(";")[0]};`
                            }
                        } else {
                            for (let ck of resp['headers']['Set-Cookie'].split(',')) {
                                cookie = `${cookie}${ck.split(";")[0]};`
                            }
                        }
                    }
                }
            } catch (error) {
                console.log(error)
            } finally {
                resolve();
            }
        })
    })
}
function getToken() {
    let opt = {
        url: `https://api.m.jd.com/client.action?functionId=isvObfuscator`,
        headers: {
            Host: 'api.m.jd.com',
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: '*/*',
            Connection: 'keep-alive',
            Cookie: cookie,
            'User-Agent': 'JD4iPhone/167650 (iPhone; iOS 13.7; Scale/3.00)',
            'Accept-Language': 'zh-Hans-CN;q=1',
            'Accept-Encoding': 'gzip, deflate, br',
        },
        body: `body=%7B%22url%22%3A%20%22https%3A//lzkj-isv.isvjcloud.com%22%2C%20%22id%22%3A%20%22%22%7D&uuid=hjudwgohxzVu96krv&client=apple&clientVersion=9.4.0&st=1620476162000&sv=111&sign=f9d1b7e3b943b6a136d54fe4f892af05`
    }
    return new Promise(resolve => {
        $.post(opt, (err, resp, data) => {
            try {
                if (err) {
                    $.log(err)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data.code === "0") {
                            $.token = data.token
                        }
                    } else {
                        $.log("京东返回了空数据")
                    }
                }
            } catch (error) {
                $.log(error)
            } finally {
                resolve();
            }
        })
    })
}
function random(min, max) {

    return Math.floor(Math.random() * (max - min)) + min;

}
function getUUID(format = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', UpperCase = 0) {
    return format.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        if (UpperCase) {
            uuid = v.toString(36).toUpperCase();
        } else {
            uuid = v.toString(36)
        }
        return uuid;
    });
}
function checkCookie() {
    const options = {
        url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
        headers: {
            "Host": "me-api.jd.com",
            "Accept": "*/*",
            "Connection": "keep-alive",
            "Cookie": cookie,
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Mobile/15E148 Safari/604.1",
            "Accept-Language": "zh-cn",
            "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
            "Accept-Encoding": "gzip, deflate, br",
        }
    };
    return new Promise(resolve => {
        $.get(options, (err, resp, data) => {
            try {
                if (err) {
                    $.logErr(err)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data.retcode === "1001") {
                            $.isLogin = false; //cookie过期
                            return;
                        }
                        if (data.retcode === "0" && data.data.hasOwnProperty("userInfo")) {
                            $.nickName = data.data.userInfo.baseInfo.nickname;
                        }
                    } else {
                        $.log('京东返回了空数据');
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
// prettier-ignore
var _0xode='jsjiami.com.v6',_0xode_=['‮_0xode'],_0x5bce=[_0xode,'\x53\x45\x70\x6a\x54\x6b\x73\x3d','\x61\x6d\x4e\x52\x54\x33\x45\x3d','\x59\x6b\x5a\x7a\x53\x6b\x73\x3d','\x61\x30\x52\x55\x54\x47\x49\x3d','\x5a\x6d\x78\x76\x62\x33\x49\x3d','\x54\x6e\x70\x71\x64\x47\x30\x3d','\x63\x6d\x46\x75\x5a\x47\x39\x74','\x62\x47\x56\x75\x5a\x33\x52\x6f','\x59\x6d\x6c\x75\x5a\x46\x64\x70\x64\x47\x68\x57\x5a\x57\x35\x6b\x5a\x58\x4a\x74\x5a\x58\x4e\x7a\x59\x57\x64\x6c','\x62\x57\x56\x7a\x63\x32\x46\x6e\x5a\x51\x3d\x3d','\x65\x6d\x31\x51\x56\x45\x34\x3d','\x52\x57\x5a\x6a\x65\x6c\x4d\x3d','\x64\x33\x70\x49\x65\x47\x49\x3d','\x52\x30\x4a\x44\x65\x55\x30\x3d','\x4f\x47\x46\x6b\x5a\x6d\x49\x3d','\x61\x6d\x52\x66\x63\x32\x68\x76\x63\x46\x39\x74\x5a\x57\x31\x69\x5a\x58\x49\x3d','\x4f\x53\x34\x79\x4c\x6a\x41\x3d','\x61\x6d\x52\x7a\x61\x57\x64\x75\x4c\x6d\x4e\x6d','\x59\x58\x42\x77\x62\x47\x6c\x6a\x59\x58\x52\x70\x62\x32\x34\x76\x61\x6e\x4e\x76\x62\x67\x3d\x3d','\x61\x55\x4a\x43\x62\x30\x6f\x3d','\x63\x48\x64\x68\x59\x6d\x30\x3d','\x53\x57\x46\x44\x62\x46\x6b\x3d','\x5a\x47\x78\x6e\x55\x6d\x59\x3d','\x62\x32\x46\x4a\x55\x31\x59\x3d','\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x6a\x5a\x47\x34\x75\x62\x6e\x6f\x75\x62\x48\x55\x76\x5a\x32\x56\x30\x61\x44\x56\x7a\x64\x41\x3d\x3d','\x54\x6b\x64\x30\x59\x6b\x59\x3d','\x63\x47\x39\x7a\x64\x41\x3d\x3d','\x59\x58\x42\x77\x62\x48\x6b\x3d','\x64\x45\x6c\x78\x65\x45\x77\x3d','\x65\x6b\x46\x35\x65\x58\x55\x3d','\x5a\x56\x70\x42\x64\x55\x73\x3d','\x62\x45\x5a\x45\x62\x46\x59\x3d','\x5a\x30\x74\x56\x65\x6e\x49\x3d','\x59\x58\x42\x70\x4c\x6d\x30\x75\x61\x6d\x51\x75\x59\x32\x39\x74','\x4b\x69\x38\x71','\x61\x32\x56\x6c\x63\x43\x31\x68\x62\x47\x6c\x32\x5a\x51\x3d\x3d','\x65\x6d\x67\x74\x59\x32\x34\x3d','\x5a\x33\x70\x70\x63\x43\x77\x67\x5a\x47\x56\x6d\x62\x47\x46\x30\x5a\x53\x77\x67\x59\x6e\x49\x3d','\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x68\x63\x47\x6b\x75\x62\x53\x35\x71\x5a\x43\x35\x6a\x62\x32\x30\x76\x59\x32\x78\x70\x5a\x57\x35\x30\x4c\x6d\x46\x6a\x64\x47\x6c\x76\x62\x6a\x39\x68\x63\x48\x42\x70\x5a\x44\x31\x71\x5a\x46\x39\x7a\x61\x47\x39\x77\x58\x32\x31\x6c\x62\x57\x4a\x6c\x63\x69\x5a\x6d\x64\x57\x35\x6a\x64\x47\x6c\x76\x62\x6b\x6c\x6b\x50\x57\x64\x6c\x64\x46\x4e\x6f\x62\x33\x42\x50\x63\x47\x56\x75\x51\x32\x46\x79\x5a\x45\x6c\x75\x5a\x6d\x38\x6d\x59\x6d\x39\x6b\x65\x54\x30\x3d','\x52\x6c\x68\x70\x52\x48\x6b\x3d','\x63\x33\x52\x79\x61\x57\x35\x6e\x61\x57\x5a\x35','\x4a\x6d\x4e\x73\x61\x57\x56\x75\x64\x44\x31\x49\x4e\x53\x5a\x6a\x62\x47\x6c\x6c\x62\x6e\x52\x57\x5a\x58\x4a\x7a\x61\x57\x39\x75\x50\x54\x6b\x75\x4d\x69\x34\x77\x4a\x6e\x56\x31\x61\x57\x51\x39\x4f\x44\x67\x34\x4f\x44\x67\x3d','\x62\x57\x74\x4f\x59\x57\x4d\x3d','\x52\x32\x4e\x78\x61\x56\x63\x3d','\x54\x47\x70\x55\x63\x33\x41\x3d','\x61\x6d\x52\x68\x63\x48\x41\x37\x61\x56\x42\x6f\x62\x32\x35\x6c\x4f\x7a\x6b\x75\x4e\x53\x34\x30\x4f\x7a\x45\x7a\x4c\x6a\x59\x37','\x56\x56\x56\x4a\x52\x41\x3d\x3d','\x4f\x32\x35\x6c\x64\x48\x64\x76\x63\x6d\x73\x76\x64\x32\x6c\x6d\x61\x54\x74\x42\x52\x45\x6c\x45\x4c\x77\x3d\x3d','\x51\x55\x52\x4a\x52\x41\x3d\x3d','\x4f\x32\x31\x76\x5a\x47\x56\x73\x4c\x32\x6c\x51\x61\x47\x39\x75\x5a\x54\x45\x77\x4c\x44\x4d\x37\x59\x57\x52\x6b\x63\x6d\x56\x7a\x63\x32\x6c\x6b\x4c\x7a\x41\x37\x59\x58\x42\x77\x51\x6e\x56\x70\x62\x47\x51\x76\x4d\x54\x59\x33\x4e\x6a\x59\x34\x4f\x32\x70\x6b\x55\x33\x56\x77\x63\x47\x39\x79\x64\x45\x52\x68\x63\x6d\x74\x4e\x62\x32\x52\x6c\x4c\x7a\x41\x37\x54\x57\x39\x36\x61\x57\x78\x73\x59\x53\x38\x31\x4c\x6a\x41\x67\x4b\x47\x6c\x51\x61\x47\x39\x75\x5a\x54\x73\x67\x51\x31\x42\x56\x49\x47\x6c\x51\x61\x47\x39\x75\x5a\x53\x42\x50\x55\x79\x41\x78\x4d\x31\x38\x32\x49\x47\x78\x70\x61\x32\x55\x67\x54\x57\x46\x6a\x49\x45\x39\x54\x49\x46\x67\x70\x49\x45\x46\x77\x63\x47\x78\x6c\x56\x32\x56\x69\x53\x32\x6c\x30\x4c\x7a\x59\x77\x4e\x53\x34\x78\x4c\x6a\x45\x31\x49\x43\x68\x4c\x53\x46\x52\x4e\x54\x43\x77\x67\x62\x47\x6c\x72\x5a\x53\x42\x48\x5a\x57\x4e\x72\x62\x79\x6b\x67\x54\x57\x39\x69\x61\x57\x78\x6c\x4c\x7a\x45\x31\x52\x54\x45\x30\x4f\x44\x74\x7a\x64\x58\x42\x77\x62\x33\x4a\x30\x53\x6b\x52\x54\x53\x46\x64\x4c\x4c\x7a\x45\x3d','\x64\x33\x70\x79\x61\x31\x41\x3d','\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x7a\x61\x47\x39\x77\x62\x57\x56\x74\x59\x6d\x56\x79\x4c\x6d\x30\x75\x61\x6d\x51\x75\x59\x32\x39\x74\x4c\x33\x4e\x6f\x62\x33\x42\x6a\x59\x58\x4a\x6b\x4c\x7a\x39\x32\x5a\x57\x35\x6b\x5a\x58\x4a\x4a\x5a\x44\x30\x3d','\x66\x53\x5a\x6a\x61\x47\x46\x75\x62\x6d\x56\x73\x50\x54\x67\x77\x4d\x53\x5a\x79\x5a\x58\x52\x31\x63\x6d\x35\x56\x63\x6d\x77\x39','\x56\x6e\x46\x73\x56\x6b\x6f\x3d','\x59\x57\x4e\x30\x61\x58\x5a\x70\x64\x48\x6c\x56\x63\x6d\x77\x3d','\x56\x55\x39\x73\x62\x45\x4d\x3d','\x56\x48\x70\x6f\x51\x6e\x4d\x3d','\x59\x56\x64\x5a\x53\x6c\x67\x3d','\x65\x48\x6c\x4e\x64\x57\x45\x3d','\x5a\x57\x35\x32','\x55\x30\x6c\x48\x54\x6c\x39\x56\x55\x6b\x77\x3d','\x5a\x32\x56\x30','\x55\x6c\x70\x43\x62\x45\x73\x3d','\x51\x30\x52\x74\x5a\x55\x63\x3d','\x54\x55\x78\x43\x63\x45\x6b\x3d','\x62\x47\x39\x6e','\x63\x47\x46\x79\x63\x32\x55\x3d','\x63\x33\x56\x6a\x59\x32\x56\x7a\x63\x77\x3d\x3d','\x63\x6d\x56\x7a\x64\x57\x78\x30','\x61\x57\x35\x30\x5a\x58\x4a\x6c\x63\x33\x52\x7a\x55\x6e\x56\x73\x5a\x55\x78\x70\x63\x33\x51\x3d','\x62\x33\x42\x6c\x62\x6b\x4e\x68\x63\x6d\x52\x42\x59\x33\x52\x70\x64\x6d\x6c\x30\x65\x55\x6c\x6b','\x61\x57\x35\x30\x5a\x58\x4a\x6c\x63\x33\x52\x7a\x53\x57\x35\x6d\x62\x77\x3d\x3d','\x59\x57\x4e\x30\x61\x58\x5a\x70\x64\x48\x6c\x4a\x5a\x41\x3d\x3d','\x52\x47\x31\x35\x61\x48\x55\x3d','\x59\x56\x70\x51\x59\x57\x34\x3d','\x59\x58\x42\x33\x52\x6d\x30\x3d','\x65\x46\x56\x42\x64\x31\x63\x3d','\x54\x30\x5a\x6d\x52\x58\x55\x3d','\x52\x31\x68\x4c\x54\x31\x45\x3d','\x61\x6c\x5a\x53\x64\x6c\x6f\x3d','\x64\x32\x35\x4d\x52\x30\x30\x3d','\x62\x33\x42\x5a\x51\x32\x59\x3d','\x59\x6d\x6c\x75\x5a\x46\x64\x70\x64\x47\x68\x57\x5a\x57\x35\x6b\x5a\x58\x49\x3d','\x64\x45\x4a\x79\x52\x32\x38\x3d','\x55\x6d\x6c\x68\x52\x56\x63\x3d','\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x68\x63\x47\x6b\x75\x62\x53\x35\x71\x5a\x43\x35\x6a\x62\x32\x30\x76\x59\x32\x78\x70\x5a\x57\x35\x30\x4c\x6d\x46\x6a\x64\x47\x6c\x76\x62\x6a\x38\x3d','\x56\x30\x64\x30\x53\x30\x73\x3d','\x64\x33\x46\x6f\x59\x57\x38\x3d','\x52\x31\x46\x30\x52\x6b\x55\x3d','\x51\x6b\x78\x34\x51\x57\x49\x3d','\x66\x53\x5a\x6a\x61\x47\x46\x75\x62\x6d\x56\x73\x50\x54\x51\x77\x4d\x53\x5a\x79\x5a\x58\x52\x31\x63\x6d\x35\x56\x63\x6d\x77\x39','\x54\x56\x46\x45\x5a\x6d\x30\x3d','\x52\x30\x39\x4b\x61\x6d\x55\x3d','\x61\x31\x6c\x47\x53\x6c\x45\x3d','\x61\x57\x56\x6b\x51\x55\x73\x3d','\x61\x6d\x31\x72\x54\x45\x49\x3d','\x54\x32\x46\x33\x59\x32\x63\x3d','\x65\x55\x64\x78\x59\x6d\x49\x3d','\x53\x32\x70\x70\x62\x58\x4d\x3d','\x56\x45\x52\x57\x53\x45\x59\x3d','\x56\x31\x4e\x49\x53\x6e\x4d\x3d','\x53\x47\x56\x53\x65\x45\x45\x3d','\x52\x55\x78\x79\x54\x6c\x51\x3d','\x57\x6b\x52\x45\x56\x57\x59\x3d','\x64\x58\x64\x35\x55\x6b\x6b\x3d','\x59\x6c\x64\x49\x51\x57\x77\x3d','\x5a\x30\x35\x78\x53\x6d\x34\x3d','\x52\x6b\x4a\x79\x53\x6d\x49\x3d','\x53\x6b\x68\x58\x55\x45\x63\x3d','\x64\x58\x4e\x5a\x65\x56\x6f\x3d','\x54\x46\x4e\x54\x65\x48\x67\x3d','\x54\x48\x4e\x4a\x65\x6b\x30\x3d','\x62\x47\x5a\x69\x65\x6b\x6f\x3d','\x5a\x48\x4e\x79\x63\x55\x38\x3d','\x62\x47\x39\x6e\x52\x58\x4a\x79','\x5a\x45\x46\x42\x5a\x30\x45\x3d','\x51\x42\x59\x67\x6a\x73\x6a\x53\x69\x61\x6d\x69\x74\x4a\x52\x4e\x2e\x63\x6f\x6d\x66\x54\x2e\x76\x74\x36\x4e\x67\x67\x3d\x3d'];if(function(_0x15a272,_0x516b6a,_0x4dd628){function _0x4485e5(_0x3c702f,_0x2622f0,_0x1e7f7d,_0x34d687,_0x19a000,_0x186734){_0x2622f0=_0x2622f0>>0x8,_0x19a000='po';var _0x34e09c='shift',_0x2629da='push',_0x186734='‮';if(_0x2622f0<_0x3c702f){while(--_0x3c702f){_0x34d687=_0x15a272[_0x34e09c]();if(_0x2622f0===_0x3c702f&&_0x186734==='‮'&&_0x186734['length']===0x1){_0x2622f0=_0x34d687,_0x1e7f7d=_0x15a272[_0x19a000+'p']();}else if(_0x2622f0&&_0x1e7f7d['replace'](/[QBYgStJRNfTtNgg=]/g,'')===_0x2622f0){_0x15a272[_0x2629da](_0x34d687);}}_0x15a272[_0x2629da](_0x15a272[_0x34e09c]());}return 0xd874a;};return _0x4485e5(++_0x516b6a,_0x4dd628)>>_0x516b6a^_0x4dd628;}(_0x5bce,0x91,0x9100),_0x5bce){_0xode_=_0x5bce['length']^0x91;};function _0x14c9(_0x4701f8,_0x11a1c1){_0x4701f8=~~'0x'['concat'](_0x4701f8['slice'](0x1));var _0x1331d9=_0x5bce[_0x4701f8];if(_0x14c9['WGWLGh']===undefined&&'‮'['length']===0x1){(function(){var _0x5a4c3d=function(){var _0x2c6ed1;try{_0x2c6ed1=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(_0x324599){_0x2c6ed1=window;}return _0x2c6ed1;};var _0x1631b1=_0x5a4c3d();var _0x593b41='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x1631b1['atob']||(_0x1631b1['atob']=function(_0x18444a){var _0x3a683c=String(_0x18444a)['replace'](/=+$/,'');for(var _0xc7b9d7=0x0,_0x1bc799,_0x7d79af,_0x5a84b3=0x0,_0x4e49ab='';_0x7d79af=_0x3a683c['charAt'](_0x5a84b3++);~_0x7d79af&&(_0x1bc799=_0xc7b9d7%0x4?_0x1bc799*0x40+_0x7d79af:_0x7d79af,_0xc7b9d7++%0x4)?_0x4e49ab+=String['fromCharCode'](0xff&_0x1bc799>>(-0x2*_0xc7b9d7&0x6)):0x0){_0x7d79af=_0x593b41['indexOf'](_0x7d79af);}return _0x4e49ab;});}());_0x14c9['sUNWyz']=function(_0x5c4f2c){var _0x82ac57=atob(_0x5c4f2c);var _0x545da4=[];for(var _0x2ea7d6=0x0,_0x3edb2d=_0x82ac57['length'];_0x2ea7d6<_0x3edb2d;_0x2ea7d6++){_0x545da4+='%'+('00'+_0x82ac57['charCodeAt'](_0x2ea7d6)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x545da4);};_0x14c9['dThVyS']={};_0x14c9['WGWLGh']=!![];}var _0x2f65e7=_0x14c9['dThVyS'][_0x4701f8];if(_0x2f65e7===undefined){_0x1331d9=_0x14c9['sUNWyz'](_0x1331d9);_0x14c9['dThVyS'][_0x4701f8]=_0x1331d9;}else{_0x1331d9=_0x2f65e7;}return _0x1331d9;};function getShopOpenCardInfo(_0x28beec,_0x1334ea){var _0x6cf197={'\x52\x5a\x42\x6c\x4b':function(_0x1c184c,_0x537af3){return _0x1c184c!==_0x537af3;},'\x43\x44\x6d\x65\x47':_0x14c9('‫0'),'\x4d\x4c\x42\x70\x49':_0x14c9('‫1'),'\x44\x6d\x79\x68\x75':function(_0x277d5c){return _0x277d5c();},'\x54\x7a\x68\x42\x73':function(_0xde51b5,_0x1748b4){return _0xde51b5===_0x1748b4;},'\x61\x57\x59\x4a\x58':_0x14c9('‮2'),'\x78\x79\x4d\x75\x61':_0x14c9('‫3'),'\x46\x58\x69\x44\x79':function(_0x10e2ee,_0x35354b){return _0x10e2ee(_0x35354b);},'\x6d\x6b\x4e\x61\x63':_0x14c9('‮4'),'\x47\x63\x71\x69\x57':_0x14c9('‫5'),'\x4c\x6a\x54\x73\x70':_0x14c9('‮6'),'\x77\x7a\x72\x6b\x50':_0x14c9('‮7'),'\x56\x71\x6c\x56\x4a':function(_0x9710d4,_0x43a323){return _0x9710d4(_0x43a323);},'\x55\x4f\x6c\x6c\x43':_0x14c9('‫8')};let _0x14d980={'\x75\x72\x6c':_0x14c9('‮9')+_0x6cf197[_0x14c9('‮a')](encodeURIComponent,JSON[_0x14c9('‫b')](_0x28beec))+_0x14c9('‮c'),'\x68\x65\x61\x64\x65\x72\x73':{'\x48\x6f\x73\x74':_0x6cf197[_0x14c9('‫d')],'\x41\x63\x63\x65\x70\x74':_0x6cf197[_0x14c9('‮e')],'\x43\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e':_0x6cf197[_0x14c9('‫f')],'\x43\x6f\x6f\x6b\x69\x65':cookie,'User-Agent':_0x14c9('‮10')+$[_0x14c9('‫11')]+_0x14c9('‮12')+$[_0x14c9('‮13')]+_0x14c9('‮14'),'Accept-Language':_0x6cf197[_0x14c9('‮15')],'\x52\x65\x66\x65\x72\x65\x72':_0x14c9('‮16')+_0x1334ea+_0x14c9('‮17')+_0x6cf197[_0x14c9('‮18')](encodeURIComponent,$[_0x14c9('‫19')]),'Accept-Encoding':_0x6cf197[_0x14c9('‫1a')]}};return new Promise(_0x15ba0a=>{if(_0x6cf197[_0x14c9('‫1b')](_0x6cf197[_0x14c9('‫1c')],_0x6cf197[_0x14c9('‫1d')])){Host=process[_0x14c9('‫1e')][_0x14c9('‫1f')];}else{$[_0x14c9('‫20')](_0x14d980,(_0x45fcbf,_0x5cda91,_0x4f16e6)=>{if(_0x6cf197[_0x14c9('‮21')](_0x6cf197[_0x14c9('‫22')],_0x6cf197[_0x14c9('‫23')])){try{if(_0x45fcbf){console[_0x14c9('‮24')](_0x45fcbf);}else{res=JSON[_0x14c9('‮25')](_0x4f16e6);if(res[_0x14c9('‫26')]){if(res[_0x14c9('‮27')][_0x14c9('‮28')]){$[_0x14c9('‮29')]=res[_0x14c9('‮27')][_0x14c9('‮28')][0x0][_0x14c9('‮2a')][_0x14c9('‮2b')];}}}}catch(_0x1069d5){console[_0x14c9('‮24')](_0x1069d5);}finally{_0x6cf197[_0x14c9('‮2c')](_0x15ba0a);}}else{$[_0x14c9('‮29')]=res[_0x14c9('‮27')][_0x14c9('‮28')][0x0][_0x14c9('‮2a')][_0x14c9('‮2b')];}});}});}async function bindWithVender(_0x458f18,_0x51a5d2){var _0x1ce6ca={'\x6b\x59\x46\x4a\x51':function(_0x48eab1,_0x247bf6){return _0x48eab1*_0x247bf6;},'\x69\x65\x64\x41\x4b':function(_0x380bcb,_0x201d01){return _0x380bcb(_0x201d01);},'\x6a\x6d\x6b\x4c\x42':function(_0x281c59,_0x7919b2){return _0x281c59!==_0x7919b2;},'\x4f\x61\x77\x63\x67':_0x14c9('‫2d'),'\x79\x47\x71\x62\x62':function(_0x165cda,_0x4905e3){return _0x165cda!==_0x4905e3;},'\x4b\x6a\x69\x6d\x73':_0x14c9('‫2e'),'\x54\x44\x56\x48\x46':_0x14c9('‮2f'),'\x57\x53\x48\x4a\x73':function(_0x5cece6,_0x32ca4d){return _0x5cece6===_0x32ca4d;},'\x48\x65\x52\x78\x41':_0x14c9('‫30'),'\x45\x4c\x72\x4e\x54':_0x14c9('‫31'),'\x5a\x44\x44\x55\x66':_0x14c9('‮32'),'\x75\x77\x79\x52\x49':_0x14c9('‫33'),'\x62\x57\x48\x41\x6c':function(_0x2b4b80){return _0x2b4b80();},'\x67\x4e\x71\x4a\x6e':function(_0x37eecf,_0x4a6f6e){return _0x37eecf===_0x4a6f6e;},'\x46\x42\x72\x4a\x62':_0x14c9('‫34'),'\x74\x42\x72\x47\x6f':function(_0x3345e3,_0x292932,_0x1ccf93){return _0x3345e3(_0x292932,_0x1ccf93);},'\x52\x69\x61\x45\x57':_0x14c9('‫35'),'\x57\x47\x74\x4b\x4b':_0x14c9('‮4'),'\x77\x71\x68\x61\x6f':_0x14c9('‫5'),'\x47\x51\x74\x46\x45':_0x14c9('‮6'),'\x42\x4c\x78\x41\x62':_0x14c9('‮7'),'\x4d\x51\x44\x66\x6d':function(_0x100ab6,_0xf684c7){return _0x100ab6(_0xf684c7);},'\x47\x4f\x4a\x6a\x65':_0x14c9('‫8')};return h5st=await _0x1ce6ca[_0x14c9('‫36')](geth5st,_0x1ce6ca[_0x14c9('‮37')],_0x458f18),opt={'\x75\x72\x6c':_0x14c9('‫38')+h5st,'\x68\x65\x61\x64\x65\x72\x73':{'\x48\x6f\x73\x74':_0x1ce6ca[_0x14c9('‫39')],'\x41\x63\x63\x65\x70\x74':_0x1ce6ca[_0x14c9('‮3a')],'\x43\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e':_0x1ce6ca[_0x14c9('‮3b')],'\x43\x6f\x6f\x6b\x69\x65':cookie,'User-Agent':_0x14c9('‮10')+$[_0x14c9('‫11')]+_0x14c9('‮12')+$[_0x14c9('‮13')]+_0x14c9('‮14'),'Accept-Language':_0x1ce6ca[_0x14c9('‮3c')],'\x52\x65\x66\x65\x72\x65\x72':_0x14c9('‮16')+_0x51a5d2+_0x14c9('‫3d')+_0x1ce6ca[_0x14c9('‮3e')](encodeURIComponent,$[_0x14c9('‫19')]),'Accept-Encoding':_0x1ce6ca[_0x14c9('‮3f')]}},new Promise(_0x3a254b=>{var _0x15bfd9={'\x4e\x7a\x6a\x74\x6d':function(_0x24ea44,_0x4ba87d){return _0x1ce6ca[_0x14c9('‫40')](_0x24ea44,_0x4ba87d);},'\x4a\x48\x57\x50\x47':function(_0x58c92e,_0x1d183a){return _0x1ce6ca[_0x14c9('‫41')](_0x58c92e,_0x1d183a);},'\x75\x73\x59\x79\x5a':function(_0x1f0eb5,_0x10a768){return _0x1ce6ca[_0x14c9('‮42')](_0x1f0eb5,_0x10a768);},'\x4c\x53\x53\x78\x78':_0x1ce6ca[_0x14c9('‫43')],'\x6c\x66\x62\x7a\x4a':function(_0x1fbae4,_0x237377){return _0x1ce6ca[_0x14c9('‮44')](_0x1fbae4,_0x237377);},'\x64\x73\x72\x71\x4f':_0x1ce6ca[_0x14c9('‫45')],'\x64\x41\x41\x67\x41':function(_0x3c4670,_0x24c70b){return _0x1ce6ca[_0x14c9('‮44')](_0x3c4670,_0x24c70b);},'\x48\x4a\x63\x4e\x4b':_0x1ce6ca[_0x14c9('‫46')],'\x6a\x63\x51\x4f\x71':function(_0x2454bf,_0x34e55b){return _0x1ce6ca[_0x14c9('‫47')](_0x2454bf,_0x34e55b);},'\x62\x46\x73\x4a\x4b':_0x1ce6ca[_0x14c9('‮48')],'\x6b\x44\x54\x4c\x62':_0x1ce6ca[_0x14c9('‮49')],'\x7a\x6d\x50\x54\x4e':function(_0x5f2a7c,_0x2aaf67){return _0x1ce6ca[_0x14c9('‫47')](_0x5f2a7c,_0x2aaf67);},'\x45\x66\x63\x7a\x53':_0x1ce6ca[_0x14c9('‮4a')],'\x77\x7a\x48\x78\x62':_0x1ce6ca[_0x14c9('‫4b')],'\x47\x42\x43\x79\x4d':function(_0x48d9fa){return _0x1ce6ca[_0x14c9('‫4c')](_0x48d9fa);}};if(_0x1ce6ca[_0x14c9('‫4d')](_0x1ce6ca[_0x14c9('‮4e')],_0x1ce6ca[_0x14c9('‮4e')])){$[_0x14c9('‫20')](opt,(_0x2bd187,_0x25e56a,_0x27e117)=>{var _0x9eb65a={'\x4c\x73\x49\x7a\x4d':function(_0x2595b3,_0x1b21fa){return _0x15bfd9[_0x14c9('‫4f')](_0x2595b3,_0x1b21fa);}};if(_0x15bfd9[_0x14c9('‮50')](_0x15bfd9[_0x14c9('‮51')],_0x15bfd9[_0x14c9('‮51')])){_0x9eb65a[_0x14c9('‫52')](_0x3a254b,_0x27e117);}else{try{if(_0x15bfd9[_0x14c9('‮53')](_0x15bfd9[_0x14c9('‮54')],_0x15bfd9[_0x14c9('‮54')])){$[_0x14c9('‫55')](e,_0x25e56a);}else{if(_0x2bd187){console[_0x14c9('‮24')](_0x2bd187);}else{if(_0x15bfd9[_0x14c9('‮56')](_0x15bfd9[_0x14c9('‫57')],_0x15bfd9[_0x14c9('‫57')])){console[_0x14c9('‮24')](_0x2bd187);}else{res=JSON[_0x14c9('‮25')](_0x27e117);if(res[_0x14c9('‫26')]){if(_0x15bfd9[_0x14c9('‮58')](_0x15bfd9[_0x14c9('‮59')],_0x15bfd9[_0x14c9('‮5a')])){Host=HostArr[Math[_0x14c9('‫5b')](_0x15bfd9[_0x14c9('‮5c')](Math[_0x14c9('‫5d')](),HostArr[_0x14c9('‫5e')]))];}else{console[_0x14c9('‮24')](res);$[_0x14c9('‫5f')]=res[_0x14c9('‮60')];}}}}}}catch(_0x35edb1){console[_0x14c9('‮24')](_0x35edb1);}finally{if(_0x15bfd9[_0x14c9('‫61')](_0x15bfd9[_0x14c9('‫62')],_0x15bfd9[_0x14c9('‮63')])){res=JSON[_0x14c9('‮25')](_0x27e117);if(res[_0x14c9('‫26')]){if(res[_0x14c9('‮27')][_0x14c9('‮28')]){$[_0x14c9('‮29')]=res[_0x14c9('‮27')][_0x14c9('‮28')][0x0][_0x14c9('‮2a')][_0x14c9('‮2b')];}}}else{_0x15bfd9[_0x14c9('‫64')](_0x3a254b);}}}});}else{console[_0x14c9('‮24')](res);$[_0x14c9('‫5f')]=res[_0x14c9('‮60')];}});}function geth5st(_0x336ae8,_0x5dec8f){var _0x2e38b8={'\x74\x49\x71\x78\x4c':function(_0x29a313,_0xb36afc){return _0x29a313(_0xb36afc);},'\x69\x42\x42\x6f\x4a':_0x14c9('‫65'),'\x70\x77\x61\x62\x6d':_0x14c9('‫66'),'\x49\x61\x43\x6c\x59':_0x14c9('‮67'),'\x64\x6c\x67\x52\x66':_0x14c9('‫68'),'\x6f\x61\x49\x53\x56':function(_0x15e1c6,_0x661068){return _0x15e1c6*_0x661068;},'\x4e\x47\x74\x62\x46':_0x14c9('‮69')};return new Promise(async _0xcfa8c2=>{let _0x56832e={'\x61\x70\x70\x49\x64':_0x2e38b8[_0x14c9('‫6a')],'\x62\x6f\x64\x79':{'\x61\x70\x70\x69\x64':_0x2e38b8[_0x14c9('‮6b')],'\x66\x75\x6e\x63\x74\x69\x6f\x6e\x49\x64':_0x336ae8,'\x62\x6f\x64\x79':JSON[_0x14c9('‫b')](_0x5dec8f),'\x63\x6c\x69\x65\x6e\x74\x56\x65\x72\x73\x69\x6f\x6e':_0x2e38b8[_0x14c9('‮6c')],'\x63\x6c\x69\x65\x6e\x74':'\x48\x35'},'\x63\x61\x6c\x6c\x62\x61\x63\x6b\x41\x6c\x6c':!![]};let _0x36eeef='';let _0x322029=[_0x2e38b8[_0x14c9('‫6d')]];if(process[_0x14c9('‫1e')][_0x14c9('‫1f')]){_0x36eeef=process[_0x14c9('‫1e')][_0x14c9('‫1f')];}else{_0x36eeef=_0x322029[Math[_0x14c9('‫5b')](_0x2e38b8[_0x14c9('‫6e')](Math[_0x14c9('‫5d')](),_0x322029[_0x14c9('‫5e')]))];}let _0x9a07e6={'\x75\x72\x6c':_0x14c9('‮6f'),'\x62\x6f\x64\x79':JSON[_0x14c9('‫b')](_0x56832e),'\x68\x65\x61\x64\x65\x72\x73':{'\x48\x6f\x73\x74':_0x36eeef,'Content-Type':_0x2e38b8[_0x14c9('‮70')]},'\x74\x69\x6d\x65\x6f\x75\x74':_0x2e38b8[_0x14c9('‫6e')](0x1e,0x3e8)};$[_0x14c9('‫71')](_0x9a07e6,async(_0x4d8507,_0x51c179,_0x56832e)=>{try{if(_0x4d8507){_0x56832e=await geth5st[_0x14c9('‫72')](this,arguments);}else{}}catch(_0x3cef4f){$[_0x14c9('‫55')](_0x3cef4f,_0x51c179);}finally{_0x2e38b8[_0x14c9('‮73')](_0xcfa8c2,_0x56832e);}});});};_0xode='jsjiami.com.v6';
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
