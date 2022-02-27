/*
京喜财富岛合成生鲜
cron 45 * * * * jd_cfd_fresh.js
更新时间：2021-9-11
活动入口：微信京喜-我的-京喜财富岛

已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
============Quantumultx===============
[task_local]
#京喜财富岛合成生鲜
45 * * * * https://raw.githubusercontent.com/Aaron-lv/sync/jd_scripts/jd_cfd_fresh.js, tag=京喜财富岛合成生鲜, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jxcfd.png, enabled=true

================Loon==============
[Script]
cron "45 * * * *" script-path=https://raw.githubusercontent.com/Aaron-lv/sync/jd_scripts/jd_cfd_fresh.js,tag=京喜财富岛合成生鲜

===============Surge=================
京喜财富岛合成生鲜 = type=cron,cronexp="45 * * * *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/Aaron-lv/sync/jd_scripts/jd_cfd_fresh.js

============小火箭=========
京喜财富岛合成生鲜 = type=cron,script-path=https://raw.githubusercontent.com/Aaron-lv/sync/jd_scripts/jd_cfd_fresh.js, cronexpr="45 * * * *", timeout=3600, enable=true
 */
const $ = new Env("京喜财富岛合成生鲜");
const JD_API_HOST = "https://m.jingxi.com/";
const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require("./jdCookie.js") : "";
$.showLog = $.getdata("cfd_showLog") ? $.getdata("cfd_showLog") === "true" : false;
$.notifyTime = $.getdata("cfd_notifyTime");
$.result = [];
$.shareCodes = [];
let cookiesArr = [], cookie = '', token = '';
let UA, UAInfo = {};
let nowTimes;
const randomCount = $.isNode() ? 20 : 3;
$.appId = 10032;
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
    if (JSON.stringify(process.env).indexOf('GITHUB') > -1) process.exit(0);
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        return;
    }
    $.CryptoJS = $.isNode() ? require('crypto-js') : CryptoJS;
    await requestAlgo();
    await $.wait(1000)
    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            $.cookie = cookie;
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
            $.index = i + 1;
            $.nickName = '';
            $.isLogin = true;
            UA = `jdpingou;iPhone;4.13.0;14.4.2;${randomString(40)};network/wifi;model/iPhone10,2;appBuild/100609;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/${Math.random * 98 + 1};pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
            UAInfo[$.UserName] = UA
            await TotalBean();
            console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
            if (!$.isLogin) {
                $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

                if ($.isNode()) {
                    await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                }
                continue
            }
            $.allTask = []
            $.info = {}
            token = await getJxToken()
            await cfd();
            await $.wait(2000);
        }
    }

})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done());

async function cfd() {
    try {
        nowTimes = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 + 8 * 60 * 60 * 1000)
        let beginInfo = await getUserInfo();
        if (beginInfo.LeadInfo.dwLeadType === 2) {
            console.log(`还未开通活动，尝试初始化`)
            await noviceTask()
            await $.wait(2000)
            beginInfo = await getUserInfo(false);
            if (beginInfo.LeadInfo.dwLeadType !== 2) {
                console.log(`初始化成功\n`)
            } else {
                console.log(`初始化失败\n`)
                return
            }
        }

        //抽奖
        await $.wait(2000)
        await composePearlState(4)


        //合成生鲜
        let count = $.isNode() ? (process.env.JD_CFD_RUNNUM ? process.env.JD_CFD_RUNNUM * 1 : Math.floor((Math.random() * 2)) + 3) : ($.getdata('JD_CFD_RUNNUM') ? $.getdata('JD_CFD_RUNNUM') * 1 : Math.floor((Math.random() * 2)) + 3);
        console.log(`\n合成生鲜`)
        console.log(`合成生鲜运行次数为：${count}\n`)
        let num = 0
        do {
            await $.wait(2000)
            await composePearlState(3)
            num++
        } while (!$.stop && num < count)

    } catch (e) {
        $.logErr(e)
    }
}

// 合成生鲜
async function composePearlState(type) {
    return new Promise(async (resolve) => {
        $.get(taskUrl(`user/ComposePinPinPearlState`, `__t=${Date.now()}&dwGetType=0`), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} ComposePearlState API请求失败，请检查网路重试`)
                } else {
                    switch (type) {
                        case 1:
                            data = JSON.parse(data.replace(/\n/g, "").match(new RegExp(/jsonpCBK.?\((.*);*\)/))[1]);
                            break
                        case 2:
                            data = JSON.parse(data.replace(/\n/g, "").match(new RegExp(/jsonpCBK.?\((.*);*\)/))[1]);
                            console.log(`领助力奖励`)
                            if (data.iRet === 0) {
                                let helpNum = []
                                for (let key of Object.keys(data.helpInfo.HelpList)) {
                                    let vo = data.helpInfo.HelpList[key]
                                    if (vo.dwStatus !== 1 && vo.dwIsHasAward === 1 && vo.dwIsHelp === 1) {
                                        helpNum.push(vo.dwId)
                                    }
                                }
                                if (helpNum.length !== 0) {
                                    for (let j = 0; j < helpNum.length; j++) {
                                        await pearlHelpDraw(data.ddwSeasonStartTm, helpNum[j])
                                        await $.wait(2000)
                                        data = await composePearlState(1)
                                    }
                                } else {
                                    console.log(`暂无可领助力奖励`)
                                }
                            }
                            break
                        case 3:
                            data = JSON.parse(data.replace(/\n/g, "").match(new RegExp(/jsonpCBK.?\((.*);*\)/))[1]);
                            if (data.iRet === 0) {
                                console.log(`当前已合成${data.dwCurProgress}颗生鲜，总计获得${data.ddwVirHb  }个金豆子`)
                                if (data.strDT) {
                                    // let num = Math.ceil(Math.random() * 12 + 12)
                                    let num = data.PearlList.length
                                    let div = Math.ceil(Math.random() * 4 + 2)
                                    console.log(`合成生鲜：模拟操作${num}次`)
                                    for (let v = 0; v < num; v++) {
                                        console.log(`模拟操作进度：${v + 1}/${num}`)
                                        let beacon = data.PearlList[0]
                                        data.PearlList.shift()
                                        let beaconType = beacon.type
                                        if (v % div === 0){
                                            await realTmReport(data.strMyShareId)
                                            await $.wait(5000)
                                        }
                                        if (beacon.rbf) {
                                            let size = 1
                                            // for (let key of Object.keys(data.PearlList)) {
                                            //   let vo = data.PearlList[key]
                                            //   if (vo.rbf && vo.type === beaconType) {
                                            //     data.PearlList.splice(key, 1)
                                            //     size = 2
                                            //     vo.rbf = 0
                                            //     break
                                            //   }
                                            // }
                                            await composePearlAward(data.strDT, beaconType, size)
                                        }
                                    }
                                    let strLT = data.oPT[data.ddwCurTime % data.oPT.length]
                                    let res = await composePearlAddProcess(data.strDT, strLT)
                                    if (res.iRet === 0) {
                                        console.log(`\n合成生鲜成功：获得${res.ddwAwardHb }个金豆子\n`)
                                        if (res.ddwAwardHb === 0) {
                                            $.stop = true
                                            console.log(`合成生鲜没有奖励，停止运行\n`)
                                        }
                                    } else {
                                        console.log(`\n合成生鲜失败：${res.sErrMsg}\n`)
                                    }
                                } else {
                                    console.log(`今日已完成\n`)
                                }
                            }
                            break
                        case 4:
                            data = JSON.parse(data.replace(/\n/g, "").match(new RegExp(/jsonpCBK.?\((.*);*\)/))[1]);
                            console.log(`每日抽奖`)
                            if (data.iRet === 0) {
                                if (data.dayDrawInfo.dwIsDraw === 0) {
                                    let strToken = (await getPearlDailyReward()).strToken
                                    await $.wait(2000)
                                    await pearlDailyDraw(data.ddwSeasonStartTm, strToken)
                                } else {
                                    console.log(`无抽奖次数\n`)
                                }
                            }
                        default:
                            break;
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(data);
            }
        })
    })
}
function realTmReport(strMyShareId) {
    return new Promise((resolve) => {
        $.get(taskUrl(`user/RealTmReport`, `__t=${Date.now()}&dwIdentityType=0&strBussKey=composegame&strMyShareId=${strMyShareId}&ddwCount=10`), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} RealTmReport API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data.replace(/\n/g, "").match(new RegExp(/jsonpCBK.?\((.*);*\)/))[1]);
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}
function composePearlAddProcess(strDT, strLT) {
    return new Promise((resolve) => {
        $.get(taskUrl(`user/ComposePearlAddProcess`, `strBT=${strDT}&strLT=${strLT}&dwIsPP=1`), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} ComposePearlAddProcess API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data.replace(/\n/g, "").match(new RegExp(/jsonpCBK.?\((.*);*\)/))[1]);
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(data);
            }
        })
    })
}
function getPearlDailyReward() {
    return new Promise((resolve) => {
        $.get(taskUrl(`user/GetPpPearlDailyReward`, `__t=${Date.now()}`), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} PpPearlDailyDraw API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data.replace(/\n/g, "").match(new RegExp(/jsonpCBK.?\((.*);*\)/))[1]);
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(data);
            }
        })
    })
}
function pearlDailyDraw(ddwSeasonStartTm, strToken) {
    return new Promise((resolve) => {
        $.get(taskUrl(`user/PpPearlDailyDraw`, `__t=${Date.now()}&ddwSeaonStart=${ddwSeasonStartTm}&strToken=${strToken}`), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} PearlDailyDraw API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data.replace(/\n/g, "").match(new RegExp(/jsonpCBK.?\((.*);*\)/))[1]);
                    if (data.iRet === 0) {
                        console.log(`抽奖成功：获得${data.strPrizeName || JSON.stringify(data)}\n`)
                    } else {
                        console.log(`抽奖失败：${data.sErrMsg}\n`)
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(data);
            }
        })
    })
}
function composePearlAward(strDT, type, size) {
    return new Promise((resolve) => {
        $.get(taskUrl(`user/ComposePearlAward`, `__t=${Date.now()}&type=${type}&size=${size}&strBT=${strDT}`), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} ComposePearlAward API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data.replace(/\n/g, "").match(new RegExp(/jsonpCBK.?\((.*);*\)/))[1]);
                    if (data.iRet === 0) {
                        console.log(`模拟操作中奖：获得${data.ddwAwardHb }个金豆子，总计获得${data.ddwVirHb }个金豆子`)
                    } else {
                        console.log(`模拟操作未中奖：${data.sErrMsg}`)
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(data);
            }
        })
    })
}

// 助力奖励
function pearlHelpDraw(ddwSeasonStartTm, dwUserId) {
    return new Promise((resolve) => {
        $.get(taskUrl(`user/PearlHelpDraw`, `__t=${Date.now()}&ddwSeaonStart=${ddwSeasonStartTm}&dwUserId=${dwUserId}`), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} PearlHelpDraw API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data.replace(/\n/g, "").match(new RegExp(/jsonpCBK.?\((.*);*\)/))[1]);
                    if (data.iRet === 0) {
                        console.log(`领取助力奖励成功：获得${data.StagePrizeInfo.ddwAwardHb  }个金豆子，总计获得${data.StagePrizeInfo.ddwVirHb  }个金豆子`)
                    } else {
                        console.log(`领取助力奖励失败：${data.sErrMsg}`)
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

// 助力
function helpByStage(shareCodes) {
    return new Promise((resolve) => {
        $.get(taskUrl(`user/PpPearlHelpByStage`, `__t=${Date.now()}&strShareId=${shareCodes}`), (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} helpbystage API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data.replace(/\n/g, "").match(new RegExp(/jsonpCBK.?\((.*);*\)/))[1]);
                    if (data.iRet === 0 || data.sErrMsg === 'success') {
                        console.log(`助力成功`)
                    } else if (data.iRet === 2235 || data.sErrMsg === '今日助力次数达到上限，明天再来帮忙吧~') {
                        console.log(`助力失败：${data.sErrMsg}`)
                        $.canHelp = false
                    } else if (data.iRet === 2232 || data.sErrMsg === '分享链接已过期') {
                        console.log(`助力失败：${data.sErrMsg}`)
                        $.delcode = true
                    } else if (data.iRet === 9999 || data.sErrMsg === '您还没有登录，请先登录哦~') {
                        console.log(`助力失败：${data.sErrMsg}`)
                        $.canHelp = false
                    } else if (data.iRet === 2229 || data.sErrMsg === '助力失败啦~') {
                        console.log(`助力失败：您的账号已黑`)
                        $.canHelp = false
                    } else if (data.iRet === 2190 || data.sErrMsg === '达到助力上限') {
                        console.log(`助力失败：${data.sErrMsg}`)
                        $.canHelp = false
                        $.delcode = true
                    } else {
                        $.canHelp = false
                        console.log(`助力失败：${data.sErrMsg}`)
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(data);
            }
        })
    })
}

function getAuthorShareCode(url) {
    return new Promise(async resolve => {
        const options = {
            url: `${url}?${new Date()}`, "timeout": 10000, headers: {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
            }
        };
        if ($.isNode() && process.env.TG_PROXY_HOST && process.env.TG_PROXY_PORT) {
            const tunnel = require("tunnel");
            const agent = {
                https: tunnel.httpsOverHttp({
                    proxy: {
                        host: process.env.TG_PROXY_HOST,
                        port: process.env.TG_PROXY_PORT * 1
                    }
                })
            }
            Object.assign(options, { agent })
        }
        $.get(options, async (err, resp, data) => {
            try {
                resolve(JSON.parse(data))
            } catch (e) {
                // $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
        await $.wait(10000)
        resolve();
    })
}

// 获取用户信息
function getUserInfo(showInvite = true) {
    return new Promise(async (resolve) => {
        $.get(taskUrl(`user/QueryUserInfo`, `ddwTaskId=&strShareId=&strMarkList=${encodeURIComponent('guider_step,collect_coin_auth,guider_medal,guider_over_flag,build_food_full,build_sea_full,build_shop_full,build_fun_full,medal_guider_show,guide_guider_show,guide_receive_vistor,daily_task,guider_daily_task')}&strPgUUNum=${token['farm_jstoken']}&strPgtimestamp=${token['timestamp']}&strPhoneID=${token['phoneid']}`), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} QueryUserInfo API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data.replace(/\n/g, "").match(new RegExp(/jsonpCBK.?\((.*);*\)/))[1]);
                    const {
                        ddwRichBalance,
                        ddwCoinBalance,
                        sErrMsg,
                        strMyShareId,
                        dwLandLvl,
                        LeadInfo = {},
                        Business = {},
                    } = data;
                    if (showInvite) {
                        console.log(`获取用户信息：${sErrMsg}\n${$.showLog ? data : ""}`);
                        console.log(`\n当前等级:${dwLandLvl},金币:${ddwCoinBalance},财富值:${ddwRichBalance},连续营业天数:${Business.dwBussDayNum},离线收益:${Business.ddwCoin}\n`)
                    }
                    if (showInvite && strMyShareId) {
                        console.log(`财富岛好友互助码每次运行都变化,旧的当天有效`);
                        console.log(`\n【京东账号${$.index}（${$.UserName}）的${$.name}好友互助码】${strMyShareId}\n`);
                        $.shareCodes.push(strMyShareId)
                    }
                    $.info = {
                        ...$.info,
                        ddwRichBalance,
                        ddwCoinBalance,
                        strMyShareId,
                        dwLandLvl,
                        LeadInfo,
                    };
                    resolve({
                        ddwRichBalance,
                        ddwCoinBalance,
                        strMyShareId,
                        LeadInfo,
                    });
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}

// 新手任务
async function noviceTask(){
    let body = ``
    await init(`user/guideuser`, body)
    body = `strMark=guider_step&strValue=welcom&dwType=2`
    await init(`user/SetMark`, body)
    body = `strMark=guider_over_flag&strValue=999&dwType=2`
    await init(`user/SetMark`, body)
    body = `strMark=guider_step&strValue=999&dwType=2`
    await init(`user/SetMark`, body)
    body = `strMark=guider_step&strValue=999&dwType=2`
    await init(`user/SetMark`, body)
    body = `strMark=guider_over_flag&strValue=999&dwType=2`
    await init(`user/SetMark`, body)
    body = `strMark=guider_step&strValue=gift_redpack&dwType=2`
    await init(`user/SetMark`, body)
    body = `strMark=guider_step&strValue=none&dwType=2`
    await init(`user/SetMark`, body)
}
async function init(function_path, body) {
    return new Promise(async (resolve) => {
        $.get(taskUrl(function_path, body), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} init API请求失败，请检查网路重试`)
                } else {
                    if (function_path == "user/SetMark") opId = 23
                    if (function_path == "user/guideuser") opId = 27
                    data = JSON.parse(data.replace(/\n/g, "").match(new RegExp(/jsonpCBK.?\((.*);*\)/))[1]);
                    contents = `1771|${opId}|${data.iRet}|0|${data.sErrMsg || 0}`
                    await biz(contents)
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}
function biz(contents){
    return new Promise(async (resolve) => {
        let option = {
            url:`https://m.jingxi.com/webmonitor/collect/biz.json?contents=${contents}&t=${Math.random()}&sceneval=2`,
            headers: {
                Cookie: cookie,
                Accept: "*/*",
                Connection: "keep-alive",
                Referer: "https://st.jingxi.com/fortune_island/index.html?ptag=138631.26.55",
                "Accept-Encoding": "gzip, deflate, br",
                Host: 'm.jingxi.com',
                "User-Agent": UA,
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            }
        }
        $.get(option, async (err, resp, _data) => {
            try {
                // console.log(_data)
            }
            catch (e) {
                $.logErr(e, resp);
            }
            finally {
                resolve();
            }
        })
    })
}

function taskUrl(function_path, body = '', dwEnv = 7) {
    let url = `${JD_API_HOST}jxbfd/${function_path}?strZone=jxbfd&bizCode=jxbfd&source=jxbfd&dwEnv=${dwEnv}&_cfd_t=${Date.now()}&ptag=7155.9.47${body ? `&${body}` : ''}`;
    url += `&_stk=${getStk(url)}`;
    url += `&_ste=1&h5st=${decrypt(Date.now(), '', '', url)}&_=${Date.now() + 2}&sceneval=2&g_login_type=1&dwIsPP=1&callback=jsonpCBK${String.fromCharCode(Math.floor(Math.random() * 26) + "A".charCodeAt(0))}&g_ty=ls`;
    return {
        url,
        headers: {
            "Host": "m.jingxi.com",
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "User-Agent": UA,
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
            "Referer": "https://st.jingxi.com/",
            "Cookie": cookie
        }
    };
}
function getStk(url) {
    let arr = url.split('&').map(x => x.replace(/.*\?/, "").replace(/=.*/, ""))
    return encodeURIComponent(arr.filter(x => x).sort().join(','))
}
function randomString(e) {
    e = e || 32;
    let t = "0123456789abcdef", a = t.length, n = "";
    for (let i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
}

function showMsg() {
    return new Promise(async (resolve) => {
        if ($.result.length) {
            if ($.notifyTime) {
                const notifyTimes = $.notifyTime.split(",").map((x) => x.split(":"));
                const now = $.time("HH:mm").split(":");
                console.log(`\n${JSON.stringify(notifyTimes)}`);
                console.log(`\n${JSON.stringify(now)}`);
                if ( notifyTimes.some((x) => x[0] === now[0] && (!x[1] || x[1] === now[1])) ) {
                    $.msg($.name, "", `${$.result.join("\n")}`);
                }
            } else {
                $.msg($.name, "", `${$.result.join("\n")}`);
            }

            if ($.isNode() && process.env.CFD_NOTIFY_CONTROL)
                await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `${$.result.join("\n")}`);
        }
        resolve();
    });
}

//格式化助力码
function shareCodesFormat() {
    return new Promise(async resolve => {
        $.newShareCodes = []
        const readShareCodeRes = await readShareCode();
        if (readShareCodeRes && readShareCodeRes.code === 200) {
          $.newShareCodes = [...new Set([...$.shareCodes, ...(readShareCodeRes.data || [])])];
        } else {
          $.newShareCodes = [...new Set([...$.shareCodes])];
        }
        console.log(`您将要助力的好友${JSON.stringify($.newShareCodes)}`)
        resolve();
    })
}
function readShareCode() {
    return new Promise(async resolve => {
        $.get({url: `https://ghproxy.com/https://raw.githubusercontent.com/jiulan/helpRepository/main/json/cfd_hb.json`, 'timeout': 10000}, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
        await $.wait(10000);
        resolve()
    })
}
function TotalBean() {
    return new Promise(resolve => {
        const options = {
            url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
            headers: {
                "Host": "me-api.jd.com",
                "Accept": "*/*",
                "User-Agent": "ScriptableWidgetExtension/185 CFNetwork/1312 Darwin/21.0.0",
                "Accept-Language": "zh-CN,zh-Hans;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "Cookie": cookie
            }
        }
        $.get(options, (err, resp, data) => {
            try {
                if (err) {
                    $.logErr(err)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data['retcode'] === "1001") {
                            $.isLogin = false; //cookie过期
                            return;
                        }
                        if (data['retcode'] === "0" && data.data && data.data.hasOwnProperty("userInfo")) {
                            $.nickName = data.data.userInfo.baseInfo.nickname;
                        }
                    } else {
                        console.log('京东服务器返回空数据');
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
/*
修改时间戳转换函数，京喜工厂原版修改
 */
Date.prototype.Format = function (fmt) {
    var e,
        n = this, d = fmt, l = {
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

async function requestAlgo() {
    $.fingerprint = await generateFp();
    const options = {
        "url": `https://cactus.jd.com/request_algo?g_ty=ajax`,
        "headers": {
            'Authority': 'cactus.jd.com',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
            'Content-Type': 'application/json',
            'Origin': 'https://st.jingxi.com',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://st.jingxi.com/',
            'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7'
        },
        'body': JSON.stringify({
            "version": "1.0",
            "fp": $.fingerprint,
            "appId": $.appId.toString(),
            "timestamp": Date.now(),
            "platform": "web",
            "expandParams": ""
        })
    }
    new Promise(async resolve => {
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`request_algo 签名参数API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        // console.log(data);
                        data = JSON.parse(data);
                        if (data['status'] === 200) {
                            $.token = data.data.result.tk;
                            let enCryptMethodJDString = data.data.result.algo;
                            if (enCryptMethodJDString) $.enCryptMethodJD = new Function(`return ${enCryptMethodJDString}`)();
                            console.log(`获取签名参数成功！`)
                            console.log(`fp: ${$.fingerprint}`)
                            console.log(`token: ${$.token}`)
                            console.log(`enCryptMethodJD: ${enCryptMethodJDString}`)
                        } else {
                            console.log(`fp: ${$.fingerprint}`)
                            console.log('request_algo 签名参数API请求失败:')
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
function decrypt(time, stk, type, url) {
    stk = stk || (url ? getUrlData(url, '_stk') : '')
    if (stk) {
        const timestamp = new Date(time).Format("yyyyMMddhhmmssSSS");
        let hash1 = '';
        if ($.fingerprint && $.token && $.enCryptMethodJD) {
            hash1 = $.enCryptMethodJD($.token, $.fingerprint.toString(), timestamp.toString(), $.appId.toString(), $.CryptoJS).toString($.CryptoJS.enc.Hex);
        } else {
            const random = '5gkjB6SpmC9s';
            $.token = `tk01wcdf61cb3a8nYUtHcmhSUFFCfddDPRvKvYaMjHkxo6Aj7dhzO+GXGFa9nPXfcgT+mULoF1b1YIS1ghvSlbwhE0Xc`;
            $.fingerprint = 5287160221454703;
            const str = `${$.token}${$.fingerprint}${timestamp}${$.appId}${random}`;
            hash1 = $.CryptoJS.SHA512(str, $.token).toString($.CryptoJS.enc.Hex);
        }
        let st = '';
        stk.split(',').map((item, index) => {
            st += `${item}:${getUrlData(url, item)}${index === stk.split(',').length -1 ? '' : '&'}`;
        })
        const hash2 = $.CryptoJS.HmacSHA256(st, hash1.toString()).toString($.CryptoJS.enc.Hex);
        // console.log(`\nst:${st}`)
        // console.log(`h5st:${["".concat(timestamp.toString()), "".concat(fingerprint.toString()), "".concat($.appId.toString()), "".concat(token), "".concat(hash2)].join(";")}\n`)
        return encodeURIComponent(["".concat(timestamp.toString()), "".concat($.fingerprint.toString()), "".concat($.appId.toString()), "".concat($.token), "".concat(hash2)].join(";"))
    } else {
        return '20210318144213808;8277529360925161;10001;tk01w952a1b73a8nU0luMGtBanZTHCgj0KFVwDa4n5pJ95T/5bxO/m54p4MtgVEwKNev1u/BUjrpWAUMZPW0Kz2RWP8v;86054c036fe3bf0991bd9a9da1a8d44dd130c6508602215e50bb1e385326779d'
    }
}

/**
 * 获取url参数值
 * @param url
 * @param name
 * @returns {string}
 */
function getUrlData(url, name) {
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
                // return pair[1];
                return vars[i].substr(vars[i].indexOf('=') + 1);
            }
        }
        return ''
    }
}
/**
 * 模拟生成 fingerprint
 * @returns {string}
 */
function generateFp() {
    let e = "0123456789";
    let a = 13;
    let i = '';
    for (; a--; )
        i += e[Math.random() * e.length | 0];
    return (i + Date.now()).slice(0,16)
}
function getJxToken() {
    var _0x1e2686 = {
        'kElFH': 'abcdefghijklmnopqrstuvwxyz1234567890',
        'MNRFu': function(_0x433b6d, _0x308057) {
            return _0x433b6d < _0x308057;
        },
        'gkPpb': function(_0x531855, _0xce2a99) {
            return _0x531855(_0xce2a99);
        },
        'KPODZ': function(_0x3394ff, _0x3181f7) {
            return _0x3394ff * _0x3181f7;
        },
        'TjSvK': function(_0x2bc1b7, _0x130f17) {
            return _0x2bc1b7(_0x130f17);
        }
    };

    function _0xe18f69(_0x5487a9) {
        let _0x3f25a6 = _0x1e2686['kElFH'];
        let _0x2b8bca = '';
        for (let _0x497a6a = 0x0; _0x1e2686['MNRFu'](_0x497a6a, _0x5487a9); _0x497a6a++) {
            _0x2b8bca += _0x3f25a6[_0x1e2686['gkPpb'](parseInt, _0x1e2686['KPODZ'](Math['random'](), _0x3f25a6['length']))];
        }
        return _0x2b8bca;
    }
    return new Promise(_0x1b19fc => {
        let _0x901291 = _0x1e2686['TjSvK'](_0xe18f69, 0x28);
        let _0x5b2fde = (+new Date())['toString']();
        if (!$.cookie['match'](/pt_pin=([^; ]+)(?=;?)/)) {
            console['log']('此账号cookie填写不规范,你的pt_pin=xxx后面没分号(;)\n');
            _0x1e2686['TjSvK'](_0x1b19fc, null);
        }
        let _0x1bb53f = $.cookie['match'](/pt_pin=([^; ]+)(?=;?)/)[0x1];
        let _0x367e43 = $['md5']('' + decodeURIComponent(_0x1bb53f) + _0x5b2fde + _0x901291 + 'tPOamqCuk9NLgVPAljUyIHcPRmKlVxDy')['toString']();
        _0x1e2686['TjSvK'](_0x1b19fc, {
            'timestamp': _0x5b2fde,
            'phoneid': _0x901291,
            'farm_jstoken': _0x367e43
        });
    });
}
!function(n){"use strict";function t(n,t){var r=(65535&n)+(65535&t);return(n>>16)+(t>>16)+(r>>16)<<16|65535&r}function r(n,t){return n<<t|n>>>32-t}function e(n,e,o,u,c,f){return t(r(t(t(e,n),t(u,f)),c),o)}function o(n,t,r,o,u,c,f){return e(t&r|~t&o,n,t,u,c,f)}function u(n,t,r,o,u,c,f){return e(t&o|r&~o,n,t,u,c,f)}function c(n,t,r,o,u,c,f){return e(t^r^o,n,t,u,c,f)}function f(n,t,r,o,u,c,f){return e(r^(t|~o),n,t,u,c,f)}function i(n,r){n[r>>5]|=128<<r%32,n[14+(r+64>>>9<<4)]=r;var e,i,a,d,h,l=1732584193,g=-271733879,v=-1732584194,m=271733878;for(e=0;e<n.length;e+=16)i=l,a=g,d=v,h=m,g=f(g=f(g=f(g=f(g=c(g=c(g=c(g=c(g=u(g=u(g=u(g=u(g=o(g=o(g=o(g=o(g,v=o(v,m=o(m,l=o(l,g,v,m,n[e],7,-680876936),g,v,n[e+1],12,-389564586),l,g,n[e+2],17,606105819),m,l,n[e+3],22,-1044525330),v=o(v,m=o(m,l=o(l,g,v,m,n[e+4],7,-176418897),g,v,n[e+5],12,1200080426),l,g,n[e+6],17,-1473231341),m,l,n[e+7],22,-45705983),v=o(v,m=o(m,l=o(l,g,v,m,n[e+8],7,1770035416),g,v,n[e+9],12,-1958414417),l,g,n[e+10],17,-42063),m,l,n[e+11],22,-1990404162),v=o(v,m=o(m,l=o(l,g,v,m,n[e+12],7,1804603682),g,v,n[e+13],12,-40341101),l,g,n[e+14],17,-1502002290),m,l,n[e+15],22,1236535329),v=u(v,m=u(m,l=u(l,g,v,m,n[e+1],5,-165796510),g,v,n[e+6],9,-1069501632),l,g,n[e+11],14,643717713),m,l,n[e],20,-373897302),v=u(v,m=u(m,l=u(l,g,v,m,n[e+5],5,-701558691),g,v,n[e+10],9,38016083),l,g,n[e+15],14,-660478335),m,l,n[e+4],20,-405537848),v=u(v,m=u(m,l=u(l,g,v,m,n[e+9],5,568446438),g,v,n[e+14],9,-1019803690),l,g,n[e+3],14,-187363961),m,l,n[e+8],20,1163531501),v=u(v,m=u(m,l=u(l,g,v,m,n[e+13],5,-1444681467),g,v,n[e+2],9,-51403784),l,g,n[e+7],14,1735328473),m,l,n[e+12],20,-1926607734),v=c(v,m=c(m,l=c(l,g,v,m,n[e+5],4,-378558),g,v,n[e+8],11,-2022574463),l,g,n[e+11],16,1839030562),m,l,n[e+14],23,-35309556),v=c(v,m=c(m,l=c(l,g,v,m,n[e+1],4,-1530992060),g,v,n[e+4],11,1272893353),l,g,n[e+7],16,-155497632),m,l,n[e+10],23,-1094730640),v=c(v,m=c(m,l=c(l,g,v,m,n[e+13],4,681279174),g,v,n[e],11,-358537222),l,g,n[e+3],16,-722521979),m,l,n[e+6],23,76029189),v=c(v,m=c(m,l=c(l,g,v,m,n[e+9],4,-640364487),g,v,n[e+12],11,-421815835),l,g,n[e+15],16,530742520),m,l,n[e+2],23,-995338651),v=f(v,m=f(m,l=f(l,g,v,m,n[e],6,-198630844),g,v,n[e+7],10,1126891415),l,g,n[e+14],15,-1416354905),m,l,n[e+5],21,-57434055),v=f(v,m=f(m,l=f(l,g,v,m,n[e+12],6,1700485571),g,v,n[e+3],10,-1894986606),l,g,n[e+10],15,-1051523),m,l,n[e+1],21,-2054922799),v=f(v,m=f(m,l=f(l,g,v,m,n[e+8],6,1873313359),g,v,n[e+15],10,-30611744),l,g,n[e+6],15,-1560198380),m,l,n[e+13],21,1309151649),v=f(v,m=f(m,l=f(l,g,v,m,n[e+4],6,-145523070),g,v,n[e+11],10,-1120210379),l,g,n[e+2],15,718787259),m,l,n[e+9],21,-343485551),l=t(l,i),g=t(g,a),v=t(v,d),m=t(m,h);return[l,g,v,m]}function a(n){var t,r="",e=32*n.length;for(t=0;t<e;t+=8)r+=String.fromCharCode(n[t>>5]>>>t%32&255);return r}function d(n){var t,r=[];for(r[(n.length>>2)-1]=void 0,t=0;t<r.length;t+=1)r[t]=0;var e=8*n.length;for(t=0;t<e;t+=8)r[t>>5]|=(255&n.charCodeAt(t/8))<<t%32;return r}function h(n){return a(i(d(n),8*n.length))}function l(n,t){var r,e,o=d(n),u=[],c=[];for(u[15]=c[15]=void 0,o.length>16&&(o=i(o,8*n.length)),r=0;r<16;r+=1)u[r]=909522486^o[r],c[r]=1549556828^o[r];return e=i(u.concat(d(t)),512+8*t.length),a(i(c.concat(e),640))}function g(n){var t,r,e="";for(r=0;r<n.length;r+=1)t=n.charCodeAt(r),e+="0123456789abcdef".charAt(t>>>4&15)+"0123456789abcdef".charAt(15&t);return e}function v(n){return unescape(encodeURIComponent(n))}function m(n){return h(v(n))}function p(n){return g(m(n))}function s(n,t){return l(v(n),v(t))}function C(n,t){return g(s(n,t))}function A(n,t,r){return t?r?s(t,n):C(t,n):r?m(n):p(n)}$.md5=A}(this);
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
