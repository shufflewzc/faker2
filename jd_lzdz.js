/*
品类联合
7 7 7 7 7 jd_lzdz.js
*/
const $ = new Env("品类联合");
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
    //         '980f55cfc5494ff895ddf9a3b2d3ff3b',
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
                '509fc6a2beea4dc394dd8e09fc91153e',
                // '30e1856f1454413cb40ca0bf0fc184e1',
            ]
            // $.authorCode = authorCodeList[random(0, authorCodeList.length)]
            $.authorCode = ownCode ? ownCode : authorCodeList[random(0, authorCodeList.length)]
            $.authorNum = `${random(1000000, 9999999)}`
            $.randomCode = random(1000000, 9999999)
            $.activityId = 'e6dbf2c13af04372ae844575f07b6f7a'
            $.activityShopId = '688693'
            $.activityUrl = `https://lzdz-isv.isvjcloud.com/categoryUnion/activity/${$.authorNum}?activityId=${$.activityId}&tplId=0003&friendid=${encodeURIComponent($.authorCode)}&shareuserid4minipg=${encodeURIComponent($.secretPin)}&shopid=&sid=&un_area=`
            await member();
            await $.wait(5000)
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
    await getFirstLZCK()
    await getToken();
    await task('customer/getSimpleActInfoVo', `activityId=${$.activityId}`, 1)
    if ($.token) {
        await getMyPing();
        if ($.secretPin) {
            await task('common/accessLogWithAD', `venderId=${$.activityShopId}&code=99&pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}&pageUrl=${$.activityUrl}&subType=app&adSource=null`, 1);
            // await task('wxActionCommon/getUserInfo', `pin=${encodeURIComponent($.secretPin)}`, 1)
            await task('categoryUnion/activityContent', `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&pinImg=&nick=${encodeURIComponent($.pin)}&shareUuid=${encodeURIComponent($.authorCode)}`, 1)
            await task('categoryUnion/initOpenCard', `pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}&shareUuid=${encodeURIComponent($.authorCode)}`,1)
            await $.wait(2000)
            $.log("加入店铺会员")
            if ($.openCardList) {
                for (const vo of $.openCardList) {
                    // console.log(vo)
                    $.log("关注店铺")
                    if (vo.followShopStatus === false) {
                        await task('wxActionCommon/followShop', `userId=${vo.venderId}&activityId=${$.activityId}&buyerNick=${encodeURIComponent($.secretPin)}&activityType=99`,1)
                    }
                    $.log(`>>> 去加入 ${vo.venderId}`)
                    if (vo.openStatus === false) {
                        await getShopOpenCardInfo({ venderId: `${vo.venderId}`, channel: "401" }, vo.venderId);
                        await bindWithVender({ venderId: `${vo.venderId}`, bindByVerifyCodeFlag: 1, registerExtend: {}, writeChildFlag: 0, activityId: $.openCardActivityId, channel: 401 }, vo.venderId);
                        await $.wait(1000)

                    } else {
                        $.log(`>>> 已经是会员`)
                    }
                    await $.wait(2000)
                    // await task('categoryUnion/shopHotZone', `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&type=1`,1)
                }
            } else {
                $.log("没有获取到对应的任务。\n")
            }
            await task('categoryUnion/initOpenCard', `pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}&shareUuid=${encodeURIComponent($.authorCode)}`,1)
            $.log("抽奖")
            // console.log($.score)
            // for (let index = 0; index < $.score; index++) {
            //     await getFirstLZCK()
            //     await $.wait(1000)
            //     await getToken();
            //     await $.wait(1000)
            //     await getMyPing();
            //     await $.wait(1000)
            //     await task('categoryUnion/luckyDraw', `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&actorUuid=${encodeURIComponent($.actorUuid)}`,1)
            // }
            await task('categoryUnion/luckyDraw', `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&actorUuid=${encodeURIComponent($.actorUuid)}`,1)

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
                                case 'customer/getSimpleActInfoVo':
                                    console.log(data)
                                    // $.jdActivityId = data.data.jdActivityId;
                                    // $.venderId = data.data.venderId;
                                    // $.activityType = data.data.activityType;
                                    break;
                                case 'wxActionCommon/getUserInfo':
                                    console.log(data)
                                    break;
                                case 'categoryUnion/activityContent':
                                    // console.log(data)
                                    $.log(`开启【${data.data.activityName}】活动`)
                                    if ($.index === 1) {
                                        ownCode = data.data.actorUuid
                                        console.log(ownCode)
                                    }
                                    $.score = data.score
                                    $.actorUuid = data.data.actorUuid;
                                    break;
                                case 'categoryUnion/initOpenCard':
                                    $.openCardList = data.data.openInfo;
                                    // console.log(data)
                                    break;
                                case 'wxActionCommon/followShop':
                                    console.log(data)
                                    break;
                                case 'categoryUnion/shopHotZone':
                                    console.log(data)
                                    break;
                                case 'opencard/addCart':
                                    if (data.data) {
                                        console.log(data.data)
                                    }
                                    break;
                                case 'categoryUnion/luckyDraw':
                                    console.log(data)
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
        url: isCommon ? `https://lzdz-isv.isvjcloud.com/${function_id}` : `https://lzdz-isv.isvjcloud.com/dingzhi/${function_id}`,
        headers: {
            Host: 'lzdz-isv.isvjcloud.com',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept-Language': 'zh-cn',
            'Accept-Encoding': 'gzip, deflate, br',
            'Content-Type': 'application/x-www-form-urlencoded',
            Origin: 'https://lzdz-isv.isvjcloud.com',
            'User-Agent': `jdapp;iPhone;9.5.4;13.6;${$.UUID};network/wifi;ADID/${$.ADID};model/iPhone10,3;addressid/0;appBuild/167668;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
            Connection: 'keep-alive',
            Referer: $.activityUrl,
            Cookie: cookie
        },
        body: body

    }
}

function getMyPing() {
    let opt = {
        url: `https://lzdz-isv.isvjcloud.com/customer/getMyPing`,
        headers: {
            Host: 'lzdz-isv.isvjcloud.com',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept-Language': 'zh-cn',
            'Accept-Encoding': 'gzip, deflate, br',
            'Content-Type': 'application/x-www-form-urlencoded',
            Origin: 'https://lzdz-isv.isvjcloud.com',
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
                    $.cookie = cookie
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
var _0xod2='jsjiami.com.v6',_0xod2_=['‮_0xod2'],_0x2521=[_0xod2,'\x66\x53\x5a\x6a\x61\x47\x46\x75\x62\x6d\x56\x73\x50\x54\x51\x77\x4d\x53\x5a\x79\x5a\x58\x52\x31\x63\x6d\x35\x56\x63\x6d\x77\x39','\x61\x30\x70\x69\x59\x32\x67\x3d','\x64\x30\x6c\x71\x59\x55\x30\x3d','\x53\x46\x6c\x48\x5a\x6e\x41\x3d','\x53\x31\x4e\x45\x56\x45\x6f\x3d','\x65\x57\x70\x36\x51\x6b\x59\x3d','\x56\x6b\x4e\x4a\x54\x46\x6b\x3d','\x57\x6d\x5a\x6b\x57\x47\x38\x3d','\x62\x55\x5a\x70\x5a\x32\x34\x3d','\x65\x6e\x52\x6a\x65\x47\x4d\x3d','\x53\x46\x52\x42\x52\x45\x51\x3d','\x63\x30\x52\x74\x63\x6b\x34\x3d','\x64\x47\x4e\x32\x64\x6d\x6f\x3d','\x51\x6b\x56\x52\x64\x45\x30\x3d','\x64\x6e\x5a\x61\x51\x58\x4d\x3d','\x57\x57\x56\x77\x54\x31\x63\x3d','\x4f\x47\x46\x6b\x5a\x6d\x49\x3d','\x61\x6d\x52\x66\x63\x32\x68\x76\x63\x46\x39\x74\x5a\x57\x31\x69\x5a\x58\x49\x3d','\x4f\x53\x34\x79\x4c\x6a\x41\x3d','\x61\x6d\x52\x7a\x61\x57\x64\x75\x4c\x6d\x4e\x6d','\x57\x57\x78\x42\x64\x6d\x67\x3d','\x59\x58\x52\x70\x63\x46\x6f\x3d','\x59\x58\x42\x77\x62\x47\x6c\x6a\x59\x58\x52\x70\x62\x32\x34\x76\x61\x6e\x4e\x76\x62\x67\x3d\x3d','\x55\x56\x52\x45\x52\x31\x59\x3d','\x56\x57\x5a\x6a\x61\x32\x59\x3d','\x64\x30\x64\x35\x63\x32\x30\x3d','\x5a\x56\x42\x70\x59\x55\x34\x3d','\x61\x6d\x56\x6c\x62\x45\x77\x3d','\x64\x56\x56\x69\x63\x6d\x6f\x3d','\x5a\x30\x52\x43\x64\x56\x67\x3d','\x62\x31\x52\x42\x62\x6b\x73\x3d','\x59\x6e\x5a\x34\x62\x6b\x49\x3d','\x53\x46\x4a\x46\x59\x32\x51\x3d','\x62\x47\x39\x6e\x52\x58\x4a\x79','\x64\x58\x70\x79\x59\x55\x34\x3d','\x53\x45\x39\x77\x52\x46\x45\x3d','\x62\x48\x4e\x72\x63\x45\x55\x3d','\x61\x45\x74\x35\x54\x6b\x4d\x3d','\x5a\x57\x35\x32','\x55\x30\x6c\x48\x54\x6c\x39\x56\x55\x6b\x77\x3d','\x55\x57\x31\x50\x63\x6c\x51\x3d','\x64\x55\x4a\x30\x62\x6b\x63\x3d','\x63\x31\x56\x47\x52\x45\x34\x3d','\x5a\x6d\x78\x76\x62\x33\x49\x3d','\x63\x6d\x46\x75\x5a\x47\x39\x74','\x62\x47\x56\x75\x5a\x33\x52\x6f','\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x6a\x5a\x47\x34\x75\x62\x6e\x6f\x75\x62\x48\x55\x76\x5a\x32\x56\x30\x61\x44\x56\x7a\x64\x41\x3d\x3d','\x61\x31\x6c\x51\x52\x6c\x49\x3d','\x63\x47\x39\x7a\x64\x41\x3d\x3d','\x63\x6c\x5a\x56\x62\x46\x6b\x3d','\x56\x30\x56\x31\x51\x6c\x49\x3d','\x63\x57\x5a\x48\x54\x48\x51\x3d','\x59\x58\x42\x77\x62\x48\x6b\x3d','\x52\x55\x64\x6f\x52\x33\x63\x3d','\x55\x6b\x52\x32\x56\x32\x73\x3d','\x59\x56\x4e\x6c\x52\x30\x4d\x3d','\x64\x31\x4e\x4f\x55\x48\x63\x3d','\x63\x33\x5a\x71\x53\x30\x67\x3d','\x52\x55\x78\x75\x63\x56\x59\x3d','\x56\x47\x64\x6c\x62\x57\x38\x3d','\x59\x58\x4e\x33\x59\x33\x59\x3d','\x51\x6b\x39\x58\x62\x58\x45\x3d','\x54\x6b\x70\x44\x59\x6d\x73\x3d','\x61\x33\x70\x47\x57\x45\x55\x3d','\x53\x47\x46\x48\x56\x57\x59\x3d','\x63\x6e\x42\x56\x52\x58\x41\x3d','\x59\x58\x42\x70\x4c\x6d\x30\x75\x61\x6d\x51\x75\x59\x32\x39\x74','\x4b\x69\x38\x71','\x61\x32\x56\x6c\x63\x43\x31\x68\x62\x47\x6c\x32\x5a\x51\x3d\x3d','\x65\x6d\x67\x74\x59\x32\x34\x3d','\x5a\x33\x70\x70\x63\x43\x77\x67\x5a\x47\x56\x6d\x62\x47\x46\x30\x5a\x53\x77\x67\x59\x6e\x49\x3d','\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x68\x63\x47\x6b\x75\x62\x53\x35\x71\x5a\x43\x35\x6a\x62\x32\x30\x76\x59\x32\x78\x70\x5a\x57\x35\x30\x4c\x6d\x46\x6a\x64\x47\x6c\x76\x62\x6a\x39\x68\x63\x48\x42\x70\x5a\x44\x31\x71\x5a\x46\x39\x7a\x61\x47\x39\x77\x58\x32\x31\x6c\x62\x57\x4a\x6c\x63\x69\x5a\x6d\x64\x57\x35\x6a\x64\x47\x6c\x76\x62\x6b\x6c\x6b\x50\x57\x64\x6c\x64\x46\x4e\x6f\x62\x33\x42\x50\x63\x47\x56\x75\x51\x32\x46\x79\x5a\x45\x6c\x75\x5a\x6d\x38\x6d\x59\x6d\x39\x6b\x65\x54\x30\x3d','\x57\x6e\x6c\x76\x61\x57\x73\x3d','\x63\x33\x52\x79\x61\x57\x35\x6e\x61\x57\x5a\x35','\x4a\x6d\x4e\x73\x61\x57\x56\x75\x64\x44\x31\x49\x4e\x53\x5a\x6a\x62\x47\x6c\x6c\x62\x6e\x52\x57\x5a\x58\x4a\x7a\x61\x57\x39\x75\x50\x54\x6b\x75\x4d\x69\x34\x77\x4a\x6e\x56\x31\x61\x57\x51\x39\x4f\x44\x67\x34\x4f\x44\x67\x3d','\x5a\x56\x64\x6b\x55\x6d\x55\x3d','\x52\x56\x4e\x31\x65\x57\x6f\x3d','\x55\x30\x56\x5a\x65\x6c\x6f\x3d','\x61\x6d\x52\x68\x63\x48\x41\x37\x61\x56\x42\x6f\x62\x32\x35\x6c\x4f\x7a\x6b\x75\x4e\x53\x34\x30\x4f\x7a\x45\x7a\x4c\x6a\x59\x37','\x56\x56\x56\x4a\x52\x41\x3d\x3d','\x4f\x32\x35\x6c\x64\x48\x64\x76\x63\x6d\x73\x76\x64\x32\x6c\x6d\x61\x54\x74\x42\x52\x45\x6c\x45\x4c\x77\x3d\x3d','\x51\x55\x52\x4a\x52\x41\x3d\x3d','\x4f\x32\x31\x76\x5a\x47\x56\x73\x4c\x32\x6c\x51\x61\x47\x39\x75\x5a\x54\x45\x77\x4c\x44\x4d\x37\x59\x57\x52\x6b\x63\x6d\x56\x7a\x63\x32\x6c\x6b\x4c\x7a\x41\x37\x59\x58\x42\x77\x51\x6e\x56\x70\x62\x47\x51\x76\x4d\x54\x59\x33\x4e\x6a\x59\x34\x4f\x32\x70\x6b\x55\x33\x56\x77\x63\x47\x39\x79\x64\x45\x52\x68\x63\x6d\x74\x4e\x62\x32\x52\x6c\x4c\x7a\x41\x37\x54\x57\x39\x36\x61\x57\x78\x73\x59\x53\x38\x31\x4c\x6a\x41\x67\x4b\x47\x6c\x51\x61\x47\x39\x75\x5a\x54\x73\x67\x51\x31\x42\x56\x49\x47\x6c\x51\x61\x47\x39\x75\x5a\x53\x42\x50\x55\x79\x41\x78\x4d\x31\x38\x32\x49\x47\x78\x70\x61\x32\x55\x67\x54\x57\x46\x6a\x49\x45\x39\x54\x49\x46\x67\x70\x49\x45\x46\x77\x63\x47\x78\x6c\x56\x32\x56\x69\x53\x32\x6c\x30\x4c\x7a\x59\x77\x4e\x53\x34\x78\x4c\x6a\x45\x31\x49\x43\x68\x4c\x53\x46\x52\x4e\x54\x43\x77\x67\x62\x47\x6c\x72\x5a\x53\x42\x48\x5a\x57\x4e\x72\x62\x79\x6b\x67\x54\x57\x39\x69\x61\x57\x78\x6c\x4c\x7a\x45\x31\x52\x54\x45\x30\x4f\x44\x74\x7a\x64\x58\x42\x77\x62\x33\x4a\x30\x53\x6b\x52\x54\x53\x46\x64\x4c\x4c\x7a\x45\x3d','\x53\x55\x4e\x55\x55\x47\x59\x3d','\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x7a\x61\x47\x39\x77\x62\x57\x56\x74\x59\x6d\x56\x79\x4c\x6d\x30\x75\x61\x6d\x51\x75\x59\x32\x39\x74\x4c\x33\x4e\x6f\x62\x33\x42\x6a\x59\x58\x4a\x6b\x4c\x7a\x39\x32\x5a\x57\x35\x6b\x5a\x58\x4a\x4a\x5a\x44\x30\x3d','\x66\x53\x5a\x6a\x61\x47\x46\x75\x62\x6d\x56\x73\x50\x54\x67\x77\x4d\x53\x5a\x79\x5a\x58\x52\x31\x63\x6d\x35\x56\x63\x6d\x77\x39','\x54\x47\x46\x4e\x59\x32\x34\x3d','\x59\x57\x4e\x30\x61\x58\x5a\x70\x64\x48\x6c\x56\x63\x6d\x77\x3d','\x5a\x6b\x6c\x5a\x63\x57\x77\x3d','\x5a\x46\x4e\x51\x64\x45\x59\x3d','\x5a\x56\x68\x4e\x5a\x58\x6f\x3d','\x5a\x32\x56\x30','\x56\x45\x5a\x6f\x57\x57\x38\x3d','\x64\x57\x4e\x32\x61\x6d\x45\x3d','\x52\x55\x4e\x7a\x56\x6e\x6b\x3d','\x62\x47\x39\x6e','\x63\x47\x46\x79\x63\x32\x55\x3d','\x63\x33\x56\x6a\x59\x32\x56\x7a\x63\x77\x3d\x3d','\x63\x6d\x56\x7a\x64\x57\x78\x30','\x61\x57\x35\x30\x5a\x58\x4a\x6c\x63\x33\x52\x7a\x55\x6e\x56\x73\x5a\x55\x78\x70\x63\x33\x51\x3d','\x62\x33\x42\x6c\x62\x6b\x4e\x68\x63\x6d\x52\x42\x59\x33\x52\x70\x64\x6d\x6c\x30\x65\x55\x6c\x6b','\x61\x57\x35\x30\x5a\x58\x4a\x6c\x63\x33\x52\x7a\x53\x57\x35\x6d\x62\x77\x3d\x3d','\x59\x57\x4e\x30\x61\x58\x5a\x70\x64\x48\x6c\x4a\x5a\x41\x3d\x3d','\x53\x6c\x70\x42\x5a\x6c\x63\x3d','\x53\x46\x46\x44\x5a\x45\x59\x3d','\x62\x48\x56\x55\x63\x6d\x51\x3d','\x59\x6d\x6c\x75\x5a\x46\x64\x70\x64\x47\x68\x57\x5a\x57\x35\x6b\x5a\x58\x4a\x74\x5a\x58\x4e\x7a\x59\x57\x64\x6c','\x62\x57\x56\x7a\x63\x32\x46\x6e\x5a\x51\x3d\x3d','\x62\x6d\x4a\x71\x63\x6d\x38\x3d','\x55\x58\x52\x47\x61\x56\x67\x3d','\x52\x46\x6c\x31\x63\x57\x63\x3d','\x54\x57\x5a\x44\x62\x6d\x38\x3d','\x59\x6e\x5a\x59\x57\x46\x6f\x3d','\x56\x6b\x6c\x55\x63\x46\x51\x3d','\x51\x33\x46\x4c\x51\x6c\x67\x3d','\x56\x56\x4e\x76\x5a\x45\x59\x3d','\x52\x47\x6c\x32\x54\x58\x59\x3d','\x56\x48\x6c\x6e\x5a\x6d\x30\x3d','\x59\x6d\x6c\x75\x5a\x46\x64\x70\x64\x47\x68\x57\x5a\x57\x35\x6b\x5a\x58\x49\x3d','\x55\x32\x64\x74\x57\x46\x59\x3d','\x5a\x6d\x35\x42\x61\x32\x6b\x3d','\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x68\x63\x47\x6b\x75\x62\x53\x35\x71\x5a\x43\x35\x6a\x62\x32\x30\x76\x59\x32\x78\x70\x5a\x57\x35\x30\x4c\x6d\x46\x6a\x64\x47\x6c\x76\x62\x6a\x38\x3d','\x62\x47\x52\x52\x62\x32\x30\x3d','\x54\x55\x70\x53\x63\x45\x63\x3d','\x54\x55\x4e\x6f\x53\x6c\x59\x3d','\x57\x47\x6c\x4b\x63\x6c\x63\x3d','\x6a\x73\x6a\x4b\x7a\x71\x69\x44\x61\x6d\x59\x69\x46\x2e\x52\x4a\x63\x6f\x4f\x65\x6d\x2e\x76\x51\x36\x4b\x43\x62\x3d\x3d'];if(function(_0x2277b4,_0x973061,_0x28df6a){function _0x5bdc51(_0x41f15a,_0x1112ff,_0x8c36a8,_0x1f3f77,_0x1ecf84,_0x5be323){_0x1112ff=_0x1112ff>>0x8,_0x1ecf84='po';var _0x2744bc='shift',_0x2fe2d3='push',_0x5be323='‮';if(_0x1112ff<_0x41f15a){while(--_0x41f15a){_0x1f3f77=_0x2277b4[_0x2744bc]();if(_0x1112ff===_0x41f15a&&_0x5be323==='‮'&&_0x5be323['length']===0x1){_0x1112ff=_0x1f3f77,_0x8c36a8=_0x2277b4[_0x1ecf84+'p']();}else if(_0x1112ff&&_0x8c36a8['replace'](/[KzqDYFRJOeQKCb=]/g,'')===_0x1112ff){_0x2277b4[_0x2fe2d3](_0x1f3f77);}}_0x2277b4[_0x2fe2d3](_0x2277b4[_0x2744bc]());}return 0xde733;};return _0x5bdc51(++_0x973061,_0x28df6a)>>_0x973061^_0x28df6a;}(_0x2521,0x136,0x13600),_0x2521){_0xod2_=_0x2521['length']^0x136;};function _0x219b(_0x19cca3,_0xd01416){_0x19cca3=~~'0x'['concat'](_0x19cca3['slice'](0x1));var _0x5e241a=_0x2521[_0x19cca3];if(_0x219b['SQLhKl']===undefined&&'‮'['length']===0x1){(function(){var _0x2a4157;try{var _0x1a3b6e=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x2a4157=_0x1a3b6e();}catch(_0x5649f7){_0x2a4157=window;}var _0x41452e='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x2a4157['atob']||(_0x2a4157['atob']=function(_0x2e050a){var _0x44c966=String(_0x2e050a)['replace'](/=+$/,'');for(var _0xd76250=0x0,_0x14d201,_0x5e06c3,_0x19370a=0x0,_0x2309e9='';_0x5e06c3=_0x44c966['charAt'](_0x19370a++);~_0x5e06c3&&(_0x14d201=_0xd76250%0x4?_0x14d201*0x40+_0x5e06c3:_0x5e06c3,_0xd76250++%0x4)?_0x2309e9+=String['fromCharCode'](0xff&_0x14d201>>(-0x2*_0xd76250&0x6)):0x0){_0x5e06c3=_0x41452e['indexOf'](_0x5e06c3);}return _0x2309e9;});}());_0x219b['cHEEak']=function(_0x1d83d8){var _0x5d1157=atob(_0x1d83d8);var _0x557fcf=[];for(var _0xa1d923=0x0,_0x302be1=_0x5d1157['length'];_0xa1d923<_0x302be1;_0xa1d923++){_0x557fcf+='%'+('00'+_0x5d1157['charCodeAt'](_0xa1d923)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x557fcf);};_0x219b['yVqUlS']={};_0x219b['SQLhKl']=!![];}var _0x1eab5b=_0x219b['yVqUlS'][_0x19cca3];if(_0x1eab5b===undefined){_0x5e241a=_0x219b['cHEEak'](_0x5e241a);_0x219b['yVqUlS'][_0x19cca3]=_0x5e241a;}else{_0x5e241a=_0x1eab5b;}return _0x5e241a;};function getShopOpenCardInfo(_0x427ea7,_0xd8a74){var _0x57a1ec={'\x54\x46\x68\x59\x6f':function(_0x3bf920,_0xb95601){return _0x3bf920!==_0xb95601;},'\x75\x63\x76\x6a\x61':_0x219b('‮0'),'\x45\x43\x73\x56\x79':_0x219b('‫1'),'\x4a\x5a\x41\x66\x57':_0x219b('‮2'),'\x48\x51\x43\x64\x46':_0x219b('‫3'),'\x6c\x75\x54\x72\x64':_0x219b('‫4'),'\x6e\x62\x6a\x72\x6f':function(_0x1ae4cf,_0x16a0a7){return _0x1ae4cf===_0x16a0a7;},'\x51\x74\x46\x69\x58':_0x219b('‮5'),'\x4d\x66\x43\x6e\x6f':function(_0x524909,_0xd1e9e6){return _0x524909===_0xd1e9e6;},'\x62\x76\x58\x58\x5a':_0x219b('‮6'),'\x56\x49\x54\x70\x54':function(_0x4fae49){return _0x4fae49();},'\x5a\x79\x6f\x69\x6b':function(_0x21d446,_0x2a69bc){return _0x21d446(_0x2a69bc);},'\x64\x53\x50\x74\x46':function(_0x361710,_0x4e7aec){return _0x361710===_0x4e7aec;},'\x65\x58\x4d\x65\x7a':_0x219b('‫7'),'\x65\x57\x64\x52\x65':_0x219b('‮8'),'\x45\x53\x75\x79\x6a':_0x219b('‫9'),'\x53\x45\x59\x7a\x5a':_0x219b('‫a'),'\x49\x43\x54\x50\x66':_0x219b('‮b'),'\x4c\x61\x4d\x63\x6e':function(_0x4511c8,_0x436c7f){return _0x4511c8(_0x436c7f);},'\x66\x49\x59\x71\x6c':_0x219b('‫c')};let _0x43735d={'\x75\x72\x6c':_0x219b('‮d')+_0x57a1ec[_0x219b('‮e')](encodeURIComponent,JSON[_0x219b('‫f')](_0x427ea7))+_0x219b('‫10'),'\x68\x65\x61\x64\x65\x72\x73':{'\x48\x6f\x73\x74':_0x57a1ec[_0x219b('‮11')],'\x41\x63\x63\x65\x70\x74':_0x57a1ec[_0x219b('‫12')],'\x43\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e':_0x57a1ec[_0x219b('‮13')],'\x43\x6f\x6f\x6b\x69\x65':cookie,'User-Agent':_0x219b('‫14')+$[_0x219b('‫15')]+_0x219b('‮16')+$[_0x219b('‫17')]+_0x219b('‮18'),'Accept-Language':_0x57a1ec[_0x219b('‫19')],'\x52\x65\x66\x65\x72\x65\x72':_0x219b('‫1a')+_0xd8a74+_0x219b('‫1b')+_0x57a1ec[_0x219b('‫1c')](encodeURIComponent,$[_0x219b('‮1d')]),'Accept-Encoding':_0x57a1ec[_0x219b('‮1e')]}};return new Promise(_0x4d8528=>{var _0x4a857c={'\x44\x59\x75\x71\x67':function(_0x1cc541,_0x551ac5){return _0x57a1ec[_0x219b('‮e')](_0x1cc541,_0x551ac5);}};if(_0x57a1ec[_0x219b('‫1f')](_0x57a1ec[_0x219b('‫20')],_0x57a1ec[_0x219b('‫20')])){$[_0x219b('‮21')](_0x43735d,(_0x42bd53,_0xba57c8,_0x114bc1)=>{try{if(_0x42bd53){if(_0x57a1ec[_0x219b('‮22')](_0x57a1ec[_0x219b('‮23')],_0x57a1ec[_0x219b('‮24')])){console[_0x219b('‫25')](_0x42bd53);}else{res=JSON[_0x219b('‮26')](_0x114bc1);if(res[_0x219b('‫27')]){if(res[_0x219b('‫28')][_0x219b('‮29')]){$[_0x219b('‮2a')]=res[_0x219b('‫28')][_0x219b('‮29')][0x0][_0x219b('‫2b')][_0x219b('‫2c')];}}}}else{if(_0x57a1ec[_0x219b('‮22')](_0x57a1ec[_0x219b('‫2d')],_0x57a1ec[_0x219b('‮2e')])){res=JSON[_0x219b('‮26')](_0x114bc1);if(res[_0x219b('‫27')]){if(res[_0x219b('‫28')][_0x219b('‮29')]){if(_0x57a1ec[_0x219b('‮22')](_0x57a1ec[_0x219b('‮2f')],_0x57a1ec[_0x219b('‮2f')])){res=JSON[_0x219b('‮26')](_0x114bc1);if(res[_0x219b('‫27')]){console[_0x219b('‫25')](res);$[_0x219b('‮30')]=res[_0x219b('‮31')];}}else{$[_0x219b('‮2a')]=res[_0x219b('‫28')][_0x219b('‮29')][0x0][_0x219b('‫2b')][_0x219b('‫2c')];}}}}else{$[_0x219b('‮2a')]=res[_0x219b('‫28')][_0x219b('‮29')][0x0][_0x219b('‫2b')][_0x219b('‫2c')];}}}catch(_0x435943){if(_0x57a1ec[_0x219b('‮32')](_0x57a1ec[_0x219b('‮33')],_0x57a1ec[_0x219b('‮33')])){console[_0x219b('‫25')](_0x435943);}else{_0x4a857c[_0x219b('‮34')](_0x4d8528,_0x114bc1);}}finally{if(_0x57a1ec[_0x219b('‫35')](_0x57a1ec[_0x219b('‮36')],_0x57a1ec[_0x219b('‮36')])){_0x57a1ec[_0x219b('‮37')](_0x4d8528);}else{if(res[_0x219b('‫28')][_0x219b('‮29')]){$[_0x219b('‮2a')]=res[_0x219b('‫28')][_0x219b('‮29')][0x0][_0x219b('‫2b')][_0x219b('‫2c')];}}}});}else{console[_0x219b('‫25')](err);}});}async function bindWithVender(_0x6a4f96,_0x2eb643){var _0x5c8438={'\x48\x59\x47\x66\x70':function(_0x343f54,_0x48d0e2){return _0x343f54===_0x48d0e2;},'\x4b\x53\x44\x54\x4a':_0x219b('‫38'),'\x79\x6a\x7a\x42\x46':function(_0x3b41cd,_0x4dfdef){return _0x3b41cd===_0x4dfdef;},'\x56\x43\x49\x4c\x59':_0x219b('‫39'),'\x5a\x66\x64\x58\x6f':_0x219b('‫3a'),'\x6d\x46\x69\x67\x6e':function(_0xb6e3d8,_0x23686f){return _0xb6e3d8===_0x23686f;},'\x7a\x74\x63\x78\x63':_0x219b('‫3b'),'\x48\x54\x41\x44\x44':function(_0xb2175d){return _0xb2175d();},'\x53\x67\x6d\x58\x56':function(_0x5c652b,_0x377eb0,_0x40b9c8){return _0x5c652b(_0x377eb0,_0x40b9c8);},'\x66\x6e\x41\x6b\x69':_0x219b('‫3c'),'\x6c\x64\x51\x6f\x6d':_0x219b('‮8'),'\x4d\x4a\x52\x70\x47':_0x219b('‫9'),'\x4d\x43\x68\x4a\x56':_0x219b('‫a'),'\x58\x69\x4a\x72\x57':_0x219b('‮b'),'\x6b\x4a\x62\x63\x68':function(_0x43c66b,_0x13d811){return _0x43c66b(_0x13d811);},'\x77\x49\x6a\x61\x4d':_0x219b('‫c')};return h5st=await _0x5c8438[_0x219b('‫3d')](geth5st,_0x5c8438[_0x219b('‫3e')],_0x6a4f96),opt={'\x75\x72\x6c':_0x219b('‮3f')+h5st,'\x68\x65\x61\x64\x65\x72\x73':{'\x48\x6f\x73\x74':_0x5c8438[_0x219b('‮40')],'\x41\x63\x63\x65\x70\x74':_0x5c8438[_0x219b('‮41')],'\x43\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e':_0x5c8438[_0x219b('‫42')],'\x43\x6f\x6f\x6b\x69\x65':cookie,'User-Agent':_0x219b('‫14')+$[_0x219b('‫15')]+_0x219b('‮16')+$[_0x219b('‫17')]+_0x219b('‮18'),'Accept-Language':_0x5c8438[_0x219b('‮43')],'\x52\x65\x66\x65\x72\x65\x72':_0x219b('‫1a')+_0x2eb643+_0x219b('‮44')+_0x5c8438[_0x219b('‫45')](encodeURIComponent,$[_0x219b('‮1d')]),'Accept-Encoding':_0x5c8438[_0x219b('‫46')]}},new Promise(_0x215897=>{$[_0x219b('‮21')](opt,(_0x52284b,_0x327a7e,_0x1bb051)=>{try{if(_0x52284b){if(_0x5c8438[_0x219b('‫47')](_0x5c8438[_0x219b('‫48')],_0x5c8438[_0x219b('‫48')])){console[_0x219b('‫25')](_0x52284b);}else{console[_0x219b('‫25')](error);}}else{if(_0x5c8438[_0x219b('‮49')](_0x5c8438[_0x219b('‮4a')],_0x5c8438[_0x219b('‫4b')])){console[_0x219b('‫25')](res);$[_0x219b('‮30')]=res[_0x219b('‮31')];}else{res=JSON[_0x219b('‮26')](_0x1bb051);if(res[_0x219b('‫27')]){console[_0x219b('‫25')](res);$[_0x219b('‮30')]=res[_0x219b('‮31')];}}}}catch(_0x55bfed){if(_0x5c8438[_0x219b('‮4c')](_0x5c8438[_0x219b('‮4d')],_0x5c8438[_0x219b('‮4d')])){console[_0x219b('‫25')](_0x55bfed);}else{if(_0x52284b){console[_0x219b('‫25')](_0x52284b);}else{res=JSON[_0x219b('‮26')](_0x1bb051);if(res[_0x219b('‫27')]){console[_0x219b('‫25')](res);$[_0x219b('‮30')]=res[_0x219b('‮31')];}}}}finally{_0x5c8438[_0x219b('‮4e')](_0x215897);}});});}function geth5st(_0x1103d7,_0x586621){var _0x430883={'\x51\x54\x44\x47\x56':function(_0x1e7d03){return _0x1e7d03();},'\x55\x66\x63\x6b\x66':function(_0x5ab017,_0x2b8838){return _0x5ab017*_0x2b8838;},'\x77\x47\x79\x73\x6d':function(_0x5935c8,_0x185779){return _0x5935c8!==_0x185779;},'\x65\x50\x69\x61\x4e':_0x219b('‫4f'),'\x6a\x65\x65\x6c\x4c':_0x219b('‮50'),'\x75\x55\x62\x72\x6a':function(_0x1a5aa8,_0x52ae2c){return _0x1a5aa8===_0x52ae2c;},'\x67\x44\x42\x75\x58':_0x219b('‫51'),'\x6f\x54\x41\x6e\x4b':_0x219b('‫52'),'\x62\x76\x78\x6e\x42':function(_0xa50297,_0x6b8ce2){return _0xa50297(_0x6b8ce2);},'\x48\x52\x45\x63\x64':_0x219b('‮53'),'\x75\x7a\x72\x61\x4e':_0x219b('‮54'),'\x48\x4f\x70\x44\x51':_0x219b('‫55'),'\x6c\x73\x6b\x70\x45':_0x219b('‮56'),'\x68\x4b\x79\x4e\x43':_0x219b('‮57'),'\x51\x6d\x4f\x72\x54':_0x219b('‫58'),'\x75\x42\x74\x6e\x47':_0x219b('‮59'),'\x6b\x59\x50\x46\x52':_0x219b('‮5a')};return new Promise(async _0x255c7d=>{var _0x373d32={'\x73\x55\x46\x44\x4e':function(_0x16c255){return _0x430883[_0x219b('‫5b')](_0x16c255);},'\x45\x47\x68\x47\x77':function(_0x2bd73b,_0xef9125){return _0x430883[_0x219b('‮5c')](_0x2bd73b,_0xef9125);},'\x72\x56\x55\x6c\x59':function(_0x3d06bf,_0x4e3e01){return _0x430883[_0x219b('‫5d')](_0x3d06bf,_0x4e3e01);},'\x57\x45\x75\x42\x52':_0x430883[_0x219b('‮5e')],'\x71\x66\x47\x4c\x74':_0x430883[_0x219b('‫5f')],'\x52\x44\x76\x57\x6b':function(_0xd1e750,_0x1d575d){return _0x430883[_0x219b('‫60')](_0xd1e750,_0x1d575d);},'\x61\x53\x65\x47\x43':_0x430883[_0x219b('‮61')],'\x77\x53\x4e\x50\x77':_0x430883[_0x219b('‮62')],'\x73\x76\x6a\x4b\x48':function(_0x2a1cfb,_0x46f22f){return _0x430883[_0x219b('‮63')](_0x2a1cfb,_0x46f22f);}};if(_0x430883[_0x219b('‫5d')](_0x430883[_0x219b('‮64')],_0x430883[_0x219b('‮64')])){$[_0x219b('‫65')](e,resp);}else{let _0x30ff4={'\x61\x70\x70\x49\x64':_0x430883[_0x219b('‮66')],'\x62\x6f\x64\x79':{'\x61\x70\x70\x69\x64':_0x430883[_0x219b('‮67')],'\x66\x75\x6e\x63\x74\x69\x6f\x6e\x49\x64':_0x1103d7,'\x62\x6f\x64\x79':JSON[_0x219b('‫f')](_0x586621),'\x63\x6c\x69\x65\x6e\x74\x56\x65\x72\x73\x69\x6f\x6e':_0x430883[_0x219b('‫68')],'\x63\x6c\x69\x65\x6e\x74':'\x48\x35','\x61\x63\x74\x69\x76\x69\x74\x79\x49\x64':$[_0x219b('‫2c')]},'\x63\x61\x6c\x6c\x62\x61\x63\x6b\x41\x6c\x6c':!![]};let _0x2be600='';let _0xb852e3=[_0x430883[_0x219b('‮69')]];if(process[_0x219b('‫6a')][_0x219b('‮6b')]){if(_0x430883[_0x219b('‫60')](_0x430883[_0x219b('‮6c')],_0x430883[_0x219b('‫6d')])){_0x373d32[_0x219b('‮6e')](_0x255c7d);}else{_0x2be600=process[_0x219b('‫6a')][_0x219b('‮6b')];}}else{_0x2be600=_0xb852e3[Math[_0x219b('‫6f')](_0x430883[_0x219b('‮5c')](Math[_0x219b('‮70')](),_0xb852e3[_0x219b('‫71')]))];}let _0x1ba80c={'\x75\x72\x6c':_0x219b('‮72'),'\x62\x6f\x64\x79':JSON[_0x219b('‫f')](_0x30ff4),'\x68\x65\x61\x64\x65\x72\x73':{'\x48\x6f\x73\x74':_0x2be600,'Content-Type':_0x430883[_0x219b('‫73')]},'\x74\x69\x6d\x65\x6f\x75\x74':_0x430883[_0x219b('‮5c')](0x1e,0x3e8)};$[_0x219b('‫74')](_0x1ba80c,async(_0x46941b,_0x74988f,_0x30ff4)=>{try{if(_0x46941b){if(_0x373d32[_0x219b('‮75')](_0x373d32[_0x219b('‮76')],_0x373d32[_0x219b('‫77')])){_0x30ff4=await geth5st[_0x219b('‮78')](this,arguments);}else{_0x2be600=_0xb852e3[Math[_0x219b('‫6f')](_0x373d32[_0x219b('‮79')](Math[_0x219b('‮70')](),_0xb852e3[_0x219b('‫71')]))];}}else{}}catch(_0x290dbf){$[_0x219b('‫65')](_0x290dbf,_0x74988f);}finally{if(_0x373d32[_0x219b('‫7a')](_0x373d32[_0x219b('‫7b')],_0x373d32[_0x219b('‮7c')])){_0x2be600=process[_0x219b('‫6a')][_0x219b('‮6b')];}else{_0x373d32[_0x219b('‮7d')](_0x255c7d,_0x30ff4);}}});}});};_0xod2='jsjiami.com.v6';
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}

