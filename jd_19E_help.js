if (process.env.JD_19E != "true") {
    console.log('\n默认不运行,安全性自行衡量,设置变量export JD_19E="true"来运行\n')
    return
}
/*

建议手动先点开一次
33 0,6-23/3 * * * jd_19E_help.js

*/

const CryptoJS = require("crypto-js");
const $ = new Env('热爱奇旅互助版-部分加密');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
let cookiesArr = [], cookie = '', message, helpCodeArr = [], helpPinArr = [], wxCookie = "";
let wxCookieArr = process.env.WXCookie?.split("@") || []
const teamLeaderArr = [], teamPlayerAutoTeam = {}
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let appid = '50074'
var timestamp = Math.round(new Date().getTime()).toString();
$.curlCmd = ""
const h = (new Date()).getHours()
const helpFlag = h >= 9 && h < 12
const puzzleFlag = h >= 13 && h < 18
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
const pkTeamNum = Math.ceil(cookiesArr.length / 30)
const JD_API_HOST = 'https://api.m.jd.com/client.action';


!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
        return;
    }
	console.log(`\n自行测试,部分加密\n来源于其他作者,自行衡量是否跑不跑！\n`);
    const helpSysInfoArr = []
    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            wxCookie = wxCookieArr[i] ?? "";
            const pt_key = cookie.match(/pt_key=([^; ]+)(?=;?)/)?.[1] || ""
            if (!/app_open/.test(pt_key)) {
                //getAppCookie && (cookie = await getAppCookie(cookie));
            }
            $.pin = cookie.match(/pt_pin=([^; ]+)(?=;?)/)?.[1] || ""
            $.UserName = decodeURIComponent($.pin)
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = $.UserName;
            $.startActivityTime = Date.now().toString() + randomNum(1e8).toString()
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
            $.UA = getUA()
            $.shshshfpb = randomUUID({
                formatData: "x".repeat(23),
                charArr: [
                    ...[...Array(10).keys()].map(x => String.fromCharCode(x + 48)),
                    ...[...Array(26).keys()].map(x => String.fromCharCode(x + 97)),
                    ...[...Array(26).keys()].map(x => String.fromCharCode(x + 65)),
                    "/"
                ],
                followCase: false
            }) + "==";
            $.__jd_ref_cls = "Babel_dev_adv_selfReproduction"
           // $.ZooFaker = utils({ $ })
            $.joyytoken = await getToken()
            $.blog_joyytoken = await getToken("50999", "4")
           // cookie = $.ZooFaker.getCookie(cookie + `joyytoken=${appid}${$.joyytoken};`)
            await travel()
    helpSysInfoArr.push({
                cookie,
                pin: $.UserName,
                UA: $.UA,
                joyytoken: $.joyytoken,
               blog_joyytoken: $.blog_joyytoken,
                secretp: $.secretp
            })
        }
    }
    //
    $.subSceneid = "RAhomePageh5" 
    for (let i = 0; i < helpSysInfoArr.length; i++) {
        const s = helpSysInfoArr[i]
        cookie = s.cookie
        $.UserName = s.pin
        $.index = i + 1;
        $.isLogin = true;
        $.nickName = $.UserName;
        await TotalBean();
        console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
        if (!$.isLogin) continue
        $.UA = s.UA
        //$.ZooFaker = utils()
        $.joyytoken = s.joyytoken
        $.blog_joyytoken = s.blog_joyytoken
        $.secretp = s.secretp
        //if (helpFlag) {
            $.newHelpCodeArr = [...helpCodeArr]
            for (let i = 0, codeLen = helpCodeArr.length; i < codeLen; i++) {
                const helpCode = helpCodeArr[i]
                const { pin, code } = helpCode
                if (pin === $.UserName) continue
                console.log(`去帮助用户：${pin}`)
                const helpRes = await doApi("collectScore", null, { inviteId: code }, true, true)
                if (helpRes?.result?.score) {
                    const { alreadyAssistTimes, maxAssistTimes, maxTimes, score, times } = helpRes.result
                    const c = maxAssistTimes - alreadyAssistTimes
                    console.log(`互助成功，获得${score}金币，他还需要${maxTimes - times}人完成助力，你还有${maxAssistTimes - alreadyAssistTimes}次助力机会`)
                    if (!c) break
                } else {
                    if (helpRes?.bizCode === -201) {
                        $.newHelpCodeArr = $.newHelpCodeArr.filter(x => x.pin !== pin)
                    }
                    console.log(`互助失败，原因：${helpRes?.bizMsg}（${helpRes?.bizCode}）`)
                    if (![0, -201, -202].includes(helpRes?.bizCode)) break
                }
            }
            helpCodeArr = [...$.newHelpCodeArr]
        //}
        // $.joyytoken = ""
        // cookie = cookie.replace(/joyytoken=\S+?;/, "joyytoken=;") 
        if (teamPlayerAutoTeam.hasOwnProperty($.UserName)) {
            const { groupJoinInviteId, groupNum, groupName } = teamLeaderArr[teamPlayerAutoTeam[$.UserName]]
            console.log(`${groupName}人数：${groupNum}，正在去加入他的队伍...`)
            await joinTeam(groupJoinInviteId)
            teamLeaderArr[teamPlayerAutoTeam[$.UserName]].groupNum += 1
            await $.wait(2000)
        }
    }
})()
    .catch((e) => {
        $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    }).finally(() => {
        $.done();
    })

async function travel() {
    try {
        const mainMsgPopUp = await doApi("getMainMsgPopUp", { "channel": "1" })
        mainMsgPopUp?.score && formatMsg(mainMsgPopUp.score, "首页弹窗")
        const homeData = await doApi("getHomeData")
        // console.log(homeData)
        if (homeData) {
            const { homeMainInfo: { todaySignStatus, secretp } } = homeData
            if (secretp) $.secretp = secretp
            if (!todaySignStatus) {
                const { awardResult, nextRedPacketDays, progress, scoreResult } = await doApi("sign", null, null, true)
                let ap = []
                for (let key in awardResult || {}) {
                    if (key === "couponResult") {
                        const { usageThreshold, quota, desc } = awardResult[key]
                        ap.push(`获得优惠券：满${usageThreshold || 0}减${quota || 0}（${desc}）`)
                    } else if (key === "redPacketResult") {
                        const { value } = awardResult[key]
                        ap.push(`获得红包：${value}元`)
                    } else {
                        ap.push(`获得未知东东（${key}）：${JSON.stringify(awardResult[key])}`)
                    }
                }
                ap.push(`还需签到${nextRedPacketDays}天获得红包`)
                ap.push(`签到进度：${progress}`)
                scoreResult?.score && formatMsg(scoreResult.score, "每日签到", ap.join("，"))
            }
            const collectAutoScore = await doApi("collectAutoScore", null, null, true)
            collectAutoScore.produceScore && formatMsg(collectAutoScore.produceScore, "定时收集")
            console.log("\n去做主App任务\n")
            await doAppTask()

            //console.log("\n去看看战队\n")
            const pkHomeData = await doApi("pk_getHomeData")
            const pkPopArr = await doApi("pk_getMsgPopup") || []
            for (const pkPopInfo of pkPopArr) {
                if (pkPopInfo?.type === 50 && pkPopInfo.value) {
                    const pkDivideInfo = await doApi("pk_divideScores", null, null, true)
                    pkDivideInfo?.produceScore && formatMsg(pkDivideInfo?.produceScore, "PK战队瓜分收益")
                }
            }
            const { votInfo } = pkHomeData
            if (votInfo) {
                const { groupPercentA, groupPercentB, packageA, packageB, status } = votInfo
                if (status === 2) {
                    let a = (+ packageA / + groupPercentA).toFixed(3)
                    let b = (+ packageB / + groupPercentB).toFixed(3)
                    const vot = a > b ? "A" : "B"
                    console.log(`'A'投票平均收益：${a}，'B'投票平均收益：${b}，去投：${vot}`)
                    await votFor(vot)
                }
            }
            const { groupJoinInviteId, groupName, groupNum } = pkHomeData?.groupInfo || {}
            if (groupNum !== undefined && groupNum < 30 && $.index <= pkTeamNum) {
                if (groupJoinInviteId) {
                    teamLeaderArr.push({
                        groupJoinInviteId,
                        groupNum,
                        groupName
                    })
                }
            } else if (groupNum === 1) {
                const n = ($.index - 1) % pkTeamNum
                if (teamLeaderArr[n]) {
                    teamPlayerAutoTeam[$.UserName] = n
                }
            }
            //if (puzzleFlag) {
            //    console.log("\n去做做拼图任务")
            //    const { doPuzzle } = require('./jd_travel_puzzle')
            //    await doPuzzle($, cookie)
            //}
        }
    } catch (e) {
        console.log(e)
    }
    if (helpFlag) {
        try {
            $.WxUA = getWxUA()
            const WxHomeData = await doWxApi("getHomeData", { inviteId: "" })
            $.WxSecretp = WxHomeData?.homeMainInfo?.secretp || $.secretp
            console.log("\n去做微信小程序任务\n")
            await doWxTask()
        } catch (e) {
            console.log(e)
        }

        try {
            console.log("\n去做金融App任务\n")
            $.sdkToken = "jdd01" + randomUUID({
                formatData: "X".repeat(103),
                charArr: [...Array(36).keys()].map(k => k.toString(36).toUpperCase())
            }) + "0123456"
            await doJrAppTask()
        } catch (e) {
            console.log(e)
        }
    }

    try {
        //await raise(true)
    } catch (e) {
        console.log(e)
    }
}

async function joinTeam(groupJoinInviteId) {
    const inviteId = groupJoinInviteId
    await doApi("pk_getHomeData", { inviteId })
    const { bizCode, bizMsg } = await doApi("pk_joinGroup", { inviteId, confirmFlag: "1" }, null, true, true)
    if (bizCode === 0) {
        console.log("加入队伍成功！")
    } else {
        formatErr("pk_joinGroup", `${bizMsg}（${bizCode}）`, $.curlCmd)
    }
}

async function votFor(votFor) {
    const { bizCode, bizMsg } = await doApi("pk_votFor", { votFor }, null, false, true)
    if (bizCode === 0) {
        console.log("投票成功！")
    } else {
        formatErr("pk_votFor", `${bizMsg}（${bizCode}）`, $.curlCmd)
    }
}

async function raise(isFirst = false) {
    const homeData = await doApi("getHomeData")
    // console.log(homeData)
    if (!homeData) return
    const { homeMainInfo: { raiseInfo: { cityConfig: { clockNeedsCoins, points }, remainScore } } } = homeData
    if (remainScore >= clockNeedsCoins) {
        if (isFirst) console.log(`\n开始解锁\n`)
        let curScore = remainScore
        let flag = false
        for (const { status, pointName } of points) {
            if (status === 1) {
                const res = await doApi("raise", {}, {}, true)
                if (res) {
                    if (!flag) flag = true
                    let arr = [`解锁'${pointName}'成功`]
                    const { levelUpAward: { awardCoins, canFirstShare, couponInfo, firstShareAwardCoins, redNum } } = res
                    arr.push(`获得${awardCoins}个金币`)
                    if (couponInfo) {
                        arr.push(`获得【${couponInfo.name}】优惠券：满${couponInfo.usageThreshold}减${couponInfo.quota}（${couponInfo.desc}）`)
                    }
                    if (redNum) {
                        arr.push(`获得${redNum}份分红`)
                    }
                    console.log(arr.join("，"))
                    if (canFirstShare) {
                        const WelfareScore = await doApi("getWelfareScore", { type: 1 })
                        if (WelfareScore?.score) formatMsg(WelfareScore?.score, "分享收益")
                    }
                    curScore -= clockNeedsCoins
                    if (curScore < clockNeedsCoins) return
                } else {
                    return
                }
            }
            await $.wait(2000)
        }
        if (flag) await raise()
    }
}

async function doAppTask() {
    const { inviteId, lotteryTaskVos, taskVos } = await doApi("getTaskDetail")
    if (inviteId) {
        console.log(`你的互助码：${inviteId}`)
        if (!helpPinArr.includes($.UserName)) {
            helpCodeArr.push({
                pin: $.UserName,
                code: inviteId
            })
            helpPinArr.push($.UserName)
        }
    }
    for (const { times, badgeAwardVos } of lotteryTaskVos || []) {
        for (const { awardToken, requireIndex, status } of badgeAwardVos) {
            if (times >= requireIndex && status === 3) {
                const res = await doApi("getBadgeAward", { awardToken })
                if (res?.score) {
                    formatMsg(res.score, "奖励宝箱收益")
                } else {
                    const myAwardVos = mohuReadJson(res, "Vos?$", 1)
                    if (myAwardVos) {
                        let flag = false
                        for (let award of myAwardVos) {
                            const awardInfo = mohuReadJson(award, "Vos?$", -1, "score")
                            if (awardInfo?.score) {
                                if (!flag) flag = true
                                formatMsg(awardInfo.score, "奖励宝箱收益")
                            }
                        }
                        if (!flag) console.log(res)
                    }
                }
            }
        }
    }
    const feedList = []
    for (let mainTask of taskVos) {
        // console.log(mainTask)
        const { taskId, taskName, waitDuration, times: timesTemp, maxTimes, status } = mainTask
        if (status === 2) continue
        let times = timesTemp, flag = false
        const other = mohuReadJson(mainTask, "Vos?$", -1, "taskToken")
        if (other) {
            const { taskToken } = other
            if (!taskToken) continue
            if (taskId === 1) {
                continue
            }
            console.log(`当前正在做任务：${taskName}`)
            const body = { taskId, taskToken, actionType: 1 }
            if (taskId === 31) {
                await doApi("pk_getHomeData")
                await doApi("pk_getPkTaskDetail", null, null, false, true)
                await doApi("pk_getMsgPopup")
                delete body.actionType
            }
            const res = await doApi("collectScore", { taskId, taskToken, actionType: 1 }, null, true)
            res?.score && (formatMsg(res.score, "任务收益"), true)/*  || console.log(res) */
            continue
        }
        $.stopCard = false
        for (let activity of mohuReadJson(mainTask, "Vo(s)?$", maxTimes, "taskToken") || []) {
            if (!flag) flag = true
            const { shopName, title, taskToken, status } = activity
            if (status !== 1) continue
            console.log(`当前正在做任务：${shopName || title}`)
            const res = await doApi("collectScore", { taskId, taskToken, actionType: 1 }, null, true)
            if ($.stopCard) break
            if (waitDuration || res.taskToken) {
                await $.wait(waitDuration * 1000)
                const res = await doApi("collectScore", { taskId, taskToken, actionType: 0 }, null, true)
                res?.score && (formatMsg(res.score, "任务收益"), true)/*  || console.log(res) */
            } else {
                res?.score && (formatMsg(res.score, "任务收益"), true)/*  || console.log(res) */
            }
            times++
            if (times >= maxTimes) break
        }
        if (flag) continue
        feedList.push({
            taskId: taskId.toString(),
            taskName
        })
    }
    for (let feed of feedList) {
        const { taskId: id, taskName: name } = feed
        const res = await doApi("getFeedDetail", { taskId: id.toString() })
        if (!res) continue
        for (let mainTask of mohuReadJson(res, "Vos?$", 1, "taskId") || []) {
            const { score, taskId, taskBeginTime, taskEndTime, taskName, times: timesTemp, maxTimes, waitDuration } = mainTask
            const t = Date.now()
            let times = timesTemp
            if (t >= taskBeginTime && t <= taskEndTime) {
                console.log(`当前正在做任务：${taskName}`)
                for (let productInfo of mohuReadJson(mainTask, "Vo(s)?$", maxTimes, "taskToken") || []) {
                    const { taskToken, status } = productInfo
                    if (status !== 1) continue
                    const res = await doApi("collectScore", { taskId, taskToken, actionType: 1 }, null, true)
                    times = res?.times ?? (times + 1)
                    await $.wait(waitDuration * 1000)
                    if (times >= maxTimes) {
                        formatMsg(score, "任务收益")
                        break
                    }
                }
            }/*  else {
            console.log(`任务：${taskName}：未到做任务时间`)
        } */
        }
    }
}

async function doWxTask() {
    $.stopWxTask = false
    const feedList = []
    const { taskVos } = await doWxApi("getTaskDetail", { taskId: "", appSign: 2 })
    for (let mainTask of taskVos) {
        const { taskId, taskName, waitDuration, times: timesTemp, maxTimes, status } = mainTask
        let times = timesTemp, flag = false
        if (status === 2) continue
        const other = mohuReadJson(mainTask, "Vos?$", -1, "taskToken")
        if (other) {
            const { taskToken } = other
            if (!taskToken) continue
            if (taskId === 1) {
                continue
            }
            console.log(`当前正在做任务：${taskName}`)
            const res = await doWxApi("collectScore", { taskId, taskToken, actionType: 1 }, null, true)
            if ($.stopWxTask) return
            res?.score && (formatMsg(res.score, "任务收益"), true)/*  || console.log(res) */
            continue
        }
        $.stopCard = false
        for (let activity of mohuReadJson(mainTask, "Vo(s)?$", maxTimes, "taskToken") || []) {
            if (!flag) flag = true
            const { shopName, title, taskToken, status } = activity
            if (status !== 1) continue
            console.log(`当前正在做任务：${shopName || title}`)
            const res = await doWxApi("collectScore", { taskId, taskToken, actionType: 1 }, null, true)
            if ($.stopCard || $.stopWxTask) break
            if (waitDuration || res.taskToken) {
                await $.wait(waitDuration * 1000)
                const res = await doWxApi("collectScore", { taskId, taskToken, actionType: 0 }, null, true)
                if ($.stopWxTask) return
                res?.score && (formatMsg(res.score, "任务收益"), true)/*  || console.log(res) */
            } else {
                if ($.stopWxTask) return
                res?.score && (formatMsg(res.score, "任务收益"), true)/*  || console.log(res) */
            }
            times++
            if (times >= maxTimes) break
        }
        if (flag) continue
        feedList.push({
            taskId: taskId.toString(),
            taskName
        })
    }
    for (let feed of feedList) {
        const { taskId: id, taskName: name } = feed
        const res = await doWxApi("getFeedDetail", { taskId: id.toString() }, null, true)
        if (!res) continue
        for (let mainTask of mohuReadJson(res, "Vos?$", 1, "taskId") || []) {
            const { score, taskId, taskBeginTime, taskEndTime, taskName, times: timesTemp, maxTimes, waitDuration } = mainTask
            const t = Date.now()
            let times = timesTemp
            if (t >= taskBeginTime && t <= taskEndTime) {
                console.log(`当前正在做任务：${taskName}`)
                for (let productInfo of mohuReadJson(mainTask, "Vo(s)?$", maxTimes, "taskToken") || []) {
                    const { taskToken, status } = productInfo
                    if (status !== 1) continue
                    const res = await doWxApi("collectScore", { taskId, taskToken, actionType: 1 }, null, true)
                    if ($.stopWxTask) return
                    times = res?.times ?? (times + 1)
                    await $.wait(waitDuration * 1000)
                    if (times >= maxTimes) {
                        formatMsg(score, "任务收益")
                        break
                    }
                }
            }/*  else {
            console.log(`任务：${taskName}：未到做任务时间`)
        } */
        }
    }
}

async function doJrAppTask() {
    $.isJr = true
    $.JrUA = getJrUA()
    const { trades, views } = await doJrPostApi("miMissions", null, null, true)
    /* for (let task of trades || views || []) {
        const { status, missionId, channel } = task
        if (status !== 1 && status !== 3) continue
        const { subTitle, title, url } = await doJrPostApi("miTakeMission", null, {
            missionId,
            validate: "",
            channel,
            babelChannel: "1111shouyefuceng"
        }, true)
        console.log(`当前正在做任务：${title}，${subTitle}`)
        const { code, msg, data } = await doJrGetApi("queryPlayActiveHelper", { sourceUrl: url })
        // const { code, msg, data } = await doJrGetApi("queryMissionReceiveAfterStatus", { missionId })
        console.log(`做任务结果：${msg}（${code}）`)
    } */
    for (let task of views || []) {
        const { status, missionId, channel, total, complete } = task
        if (status !== 1 && status !== 3) continue
        const { subTitle, title, url } = await doJrPostApi("miTakeMission", null, {
            missionId,
            validate: "",
            channel,
            babelChannel: "1111zhuhuichangfuceng"
        }, true)
        console.log(`当前正在做任务：${title}，${subTitle}`)
        const readTime = url.getKeyVal("readTime")
        const juid = url.getKeyVal("juid")
        if (readTime) {
            await doJrGetApi("queryMissionReceiveAfterStatus", { missionId })
            await $.wait(+ readTime * 1000)
            const { code, msg, data } = await doJrGetApi("finishReadMission", { missionId, readTime })
            console.log(`做任务结果：${msg}`)
        } else if (juid) {
            const { code, msg, data } = await doJrGetApi("getJumpInfo", { juid })
            console.log(`做任务结果：${msg}`)
        } else {
            console.log(`不知道这是啥：${url}`)
        }
    }
    $.isJr = false
}

function mohuReadJson(json, key, len, keyName) {
    if (!key) return null
    for (let jsonKey in json) {
        if (RegExp(key).test(jsonKey)) {
            if (!len) return json[jsonKey]
            if (len === -1) {
                if (json[jsonKey][keyName]) return json[jsonKey]
            } else if (json[jsonKey]?.length >= len) {
                if (keyName) {
                    if (json[jsonKey][0].hasOwnProperty(keyName)) {
                        return json[jsonKey]
                    } else {
                        continue
                    }
                }
                return json[jsonKey]
            }
        }
    }
    return null
}

function formatMsg(num, pre, ap) {
    console.log(`${pre ? pre + "：" : ""}获得${num}个金币🪙${ap ? "，" + ap : ""}`)
}

function getSs(secretp) {
    $.random = 53554918
    $.sceneid = $.subSceneid ?? "RAhomePageh5"
    const extraData = getBody(53554918)
    return {
        extraData,
        secretp,
        random: $.random
    }
}

function getSafeStr() {
    $.random = 53554918
    const log = getBody(53554918)
    return {
        random: $.random,
        secreid: "HYJGJSh5",
        log
    }
}

function getWxSs(secretp) {
    $.random = 53554918
    $.secreid = "HYJhPagewx"
    const extraData = getBody(53554918)
    return {
        extraData,
        secretp,
        random: $.random
    }
}

async function doApi(functionId, prepend = {}, append = {}, needSs = false, getLast = false) {
    functionId = `promote_${functionId}`
    const url = JD_API_HOST + `?functionId=${functionId}`
    const bodyMain = objToStr2({
        functionId,
        body: encodeURIComponent(JSON.stringify({
            ...prepend,
            ss: needSs ? JSON.stringify(getSs($.secretp || "E7CRMoDURcyS-_XDYYuo__Ai9oE")) : undefined,
            ...append,
        })),
        client: "m",
        clientVersion: "1.0.0",
        appid :"signed_wh5"
    })
    const option = {
        url,
        body: bodyMain,
        headers: {
            'Cookie': cookie,
            'Host': 'api.m.jd.com',
            'Origin': 'https://wbbny.m.jd.com',
            'Referer': 'https://wbbny.m.jd.com/babelDiy/Zeus/2vVU4E7JLH9gKYfLQ5EVW6eN2P7B/index.html',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            "User-Agent": $.UA,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-cn',
            'Accept-Encoding': 'gzip, deflate, br',
        }
    }
    $.curlCmd = toCurl(option)
    return new Promise(resolve => {
        $.post(option, (err, resp, data) => {
            let res = null
            try {
                if (err) console.log(formatErr(functionId, err, toCurl(option)))
                else {
                    if (safeGet(data)) {
                        data = JSON.parse(data)
                        if (getLast) {
                            res = data?.data
                            if (data?.data?.bizCode === -1002) {
                                console.log(formatErr(functionId, data, toCurl(option)))
                            }
                        } else {
                            if (data?.data?.bizCode !== 0) {
                                if (/加入.*?会员.*?获得/.test(data?.data?.bizMsg)) {
                                    console.log(data?.data?.bizMsg + `（${data?.data?.bizCode}）`)
                                    $.stopCard = true
                                } else console.log(formatErr(functionId, data?.data?.bizMsg + `（${data?.data?.bizCode}）`, toCurl(option)))
                            } else {
                                res = data?.data?.result || {}
                            }
                        }
                    } else {
                        console.log(formatErr(functionId, data, toCurl(option)))
                    }
                }
            } catch (e) {
                console.log(formatErr(functionId, e.toString(), toCurl(option)))
            } finally {
                resolve(res)
            }
        })
    })
}

async function doJrPostApi(functionId, prepend = {}, append = {}, needEid = false) {
    const url = "https://ms.jr.jd.com/gw/generic/uc/h5/m/" + functionId
    const bodyMain = `reqData=${encodeURIComponent(JSON.stringify({
        ...prepend,
        ...needEid ? {
            eid: $.eid || "",
            sdkToken: $.sdkToken || "",
        } : {},
        ...append
    }))}`
    const option = {
        url,
        body: bodyMain,
        headers: {
            'Cookie': cookie,
            'Host': 'ms.jr.jd.com',
            'Origin': 'https://wbbny.m.jd.com',
            'Referer': 'https://wbbny.m.jd.com/babelDiy/Zeus/2vVU4E7JLH9gKYfLQ5EVW6eN2P7B/index.html?babelChannel=1111zhuhuichangfuceng&conf=jr',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            "User-Agent": $.JrUA,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-cn',
            'Accept-Encoding': 'gzip, deflate, br',
        }
    }
    return new Promise(resolve => {
        $.post(option, (err, resp, data) => {
            let res = null
            try {
                if (err) console.log(formatErr(functionId, err, toCurl(option)))
                else {
                    if (safeGet(data)) {
                        data = JSON.parse(data)
                        if (data?.resultData?.code !== 0) {
                            console.log(formatErr(functionId, data?.resultData?.msg + `（${data?.resultData?.code}）`, toCurl(option)))
                        } else {
                            res = data?.resultData?.data || {}
                        }
                    } else {
                        console.log(formatErr(functionId, data, toCurl(option)))
                    }
                }
            } catch (e) {
                console.log(formatErr(functionId, e.toString(), toCurl(option)))
            } finally {
                resolve(res)
            }
        })
    })
}

async function doJrGetApi(functionId, prepend = {}, append = {}, needEid = false) {
    const url = "https://ms.jr.jd.com/gw/generic/mission/h5/m/" + functionId
    const bodyMain = `reqData=${encodeURIComponent(JSON.stringify({
        ...prepend,
        ...needEid ? {
            eid: $.eid || "",
            sdkToken: $.sdkToken || "",
        } : {},
        ...append
    }))}`
    const option = {
        url: `${url}?${bodyMain}`,
        headers: {
            'Cookie': cookie,
            'Host': 'ms.jr.jd.com',
            'Origin': 'https://wbbny.m.jd.com',
            'Referer': 'https://wbbny.m.jd.com/babelDiy/Zeus/2vVU4E7JLH9gKYfLQ5EVW6eN2P7B/index.html?babelChannel=1111shouyefuceng&conf=jr',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            "User-Agent": $.JrUA,
            'Accept': '*/*',
            'Accept-Language': 'zh-cn',
            'Accept-Encoding': 'gzip, deflate, br',
        }
    }
    return new Promise(resolve => {
        $.get(option, (err, resp, data) => {
            let res = null
            try {
                if (err) console.log(formatErr(functionId, err, toCurl(option)))
                else {
                    if (safeGet(data)) {
                        data = JSON.parse(data)
                        res = data?.resultData || {}
                    } else {
                        console.log(formatErr(functionId, data, toCurl(option)))
                    }
                }
            } catch (e) {
                console.log(formatErr(functionId, e.toString(), toCurl(option)))
            } finally {
                resolve(res)
            }
        })
    })
}

async function doWxApi(functionId, prepend = {}, append = {}, needSs = false) {
    functionId = `promote_${functionId}`
    const url = JD_API_HOST + `?dev=${functionId}&g_ty=ls&g_tk=`
    const bodyMain = {
        sceneval: "",
        callback: functionId,
        functionId,
        appid: "wh5",
        client: "wh5",
        clientVersion: "1.0.0",
        uuid: -1,
        body: encodeURIComponent(JSON.stringify({
            ...prepend,
            ss: needSs ? JSON.stringify(getWxSs($.WxSecretp)) : undefined,
            ...append,
        })),
        loginType: 2,
        loginWQBiz: "dacu"
    }
    const cookieA =
        wxCookie
            ?
            ((bodyMain.loginType = 1), `jdpin=${$.pin};pin=${$.pin};pinStatus=0;wq_auth_token=${wxCookie};shshshfpb=${encodeURIComponent($.shshshfpb)};`)
            :
            cookie
    const option = {
        url,
        body: objToStr2(bodyMain),
        headers: {
            'Cookie': cookieA,
            'Host': 'api.m.jd.com',
            'Referer': 'https://servicewechat.com/wx91d27dbf599dff74/570/page-frame.html',
            'wxreferer': 'http://wq.jd.com/wxapp/pages/loveTravel/pages/index/index',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            "User-Agent": $.WxUA,
            'Accept': '*/*',
            'Accept-Language': 'zh-cn',
            'Accept-Encoding': 'gzip, deflate, br',
        }
    }
    return new Promise(resolve => {
        $.post(option, (err, resp, data) => {
            let res = null
            try {
                if (err) console.log(formatErr(functionId, err, toCurl(option)))
                else {
                    if (safeGet(data)) {
                        data = JSON.parse(data)
                        if (data?.data?.bizCode !== 0) {
                            if (data?.data?.bizCode === -1002) $.stopWxTask = true
                            console.log(formatErr(functionId, data?.data?.bizMsg ? (data?.data?.bizMsg + `（${data?.data?.bizCode}）`) : JSON.stringify(data), toCurl(option)))
                        } else {
                            res = data.data.result
                        }
                    } else {
                        //console.log(formatErr(functionId, data, toCurl(option)))
                    }
                }
            } catch (e) {
                console.log(formatErr(functionId, e.toString(), toCurl(option)))
            } finally {
                resolve(res)
            }
        })
    })
}


function getToken(appname = appid, platform = "1") {
    return new Promise(resolve => {
        $.post({
            url: "https://rjsb-token-m.jd.com/gettoken",
            body: `content=${JSON.stringify({
                appname,
                whwswswws: "",
                jdkey: $.UUID || randomString(40),
                body: {
                    platform,
                }
            })}`,
            headers: {
                Accept: "*/*",
                'Accept-Encoding': "gzip, deflate, br",
                'Accept-Language': "zh-CN,zh-Hans;q=0.9",
                Connection: "keep-alive",
                'Content-Type': "text/plain;charset=UTF-8",
                Host: "rjsb-token-m.jd.com",
                Origin: "https://h5.m.jd.com",
                Referer: "https://h5.m.jd.com/",
                'User-Agent': $.UA
            }
        }, (err, resp, data) => {
            try {
                if (err) {
                    console.log(err)
                    resolve()
                }
                const { joyytoken } = JSON.parse(data)
                resolve(joyytoken)
            } catch (e) {
                console.log(e)
                resolve()
            } finally {
            }
        })
    })
}

function formatErr(functionId, errMsg, curlCmd) {
    return JSON.parse(JSON.stringify({
        functionId,
        errMsg,
        curlCmd,
    }))
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

function getUA() {
    $.UUID = randomString(40)
    const buildMap = {
        "167814": `10.1.4`,
        "167841": `10.1.6`,
        "167853": `10.2.0`
    }
    $.osVersion = `${randomNum(13, 14)}.${randomNum(3, 6)}.${randomNum(1, 3)}`
    let network = `network/${['4g', '5g', 'wifi'][randomNum(0, 2)]}`
    $.mobile = `iPhone${randomNum(9, 13)},${randomNum(1, 3)}`
    $.build = ["167814", "167841", "167853"][randomNum(0, 2)]
    $.appVersion = buildMap[$.build]
    return `jdapp;android;10.3.2`
}

function getWxUA() {
    const osVersion = `${randomNum(12, 14)}.${randomNum(0, 6)}`
    $.wxAppid = "wx91d27dbf599dff74"
    return `Mozilla/5.0 (iPhone; CPU OS ${osVersion.replace(/\./g, "_")} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.15(0x18000f28) NetType/WIFI Language/zh_CN`
}

function randomUUID(option = {
    formatData: `${"X".repeat(8)}-${"X".repeat(4)}-${"X".repeat(4)}-${"X".repeat(12)}`,
    charArr: [...Array(16).keys()].map(k => k.toString(16).toUpperCase()),
    followCase: true,
}) {
    if (!option.formatData) option.formatData = `${"X".repeat(8)}-${"X".repeat(4)}-${"X".repeat(4)}-${"X".repeat(12)}`
    if (!option.charArr) option.charArr = [...Array(16).keys()].map(k => k.toString(16).toUpperCase())
    if (!option.followCase === undefined) option.followCase = true
    let { formatData: res, charArr } = option
    res = res.split("")
    const charLen = charArr.length - 1
    const resLen = res.length
    for (let i = 0; i < resLen; i++) {
        const tis = res[i]
        if (/[xX]/.test(tis)) {
            res[i] = charArr[randomNum(0, charLen)]
            if (option.followCase) res[i] = res[i][tis === "x" ? "toLowerCase" : "toUpperCase"]()
        }
    }
    return res.join("")
}

function getJrUA() {
    const randomMobile = {
        type: `${randomNum(9, 13)},${randomNum(1, 3)}`,
        screen: ["812", "375"]
    }
    const mobile = $.mobile ?? "iPhone " + randomMobile.type
    const screen = randomMobile.screen.join('*')
    const osV = $.osVersion ?? `${randomNum(13, 14)}.${randomNum(0, 6)}`
    const appV = `6.2.40`
    const deviceId = randomUUID({
        formatData: 'x'.repeat(36) + '-' + 'x'.repeat(36),
        charArr: [...Array(10).keys(), 'd'].map(x => x.toString())
    })
    const jdPaySdkV = `4.00.10.00`
    return `Mozilla/5.0 (iPhone; CPU iPhone OS ${osV.replace(/\./g, "_")} AppleWebKit/60${randomNum(3, 5)}.1.15 (KHTML, like Gecko) Mobile/15E148/application=JDJR-App&deviceId=${deviceId}&eufv=1&clientType=ios&iosType=iphone&clientVersion=${appV}&HiClVersion=${appV}&isUpdate=0&osVersion=${osV}&osName=iOS&platform=${mobile}&screen=${screen}&src=App Store&netWork=1&netWorkType=1&CpayJS=UnionPay/1.0 JDJR&stockSDK=stocksdk-iphone_3.5.0&sPoint=&jdPay=(*#@jdPaySDK*#@jdPayChannel=jdfinance&jdPayChannelVersion=${osV}&jdPaySdkVersion=${jdPaySdkV}&jdPayClientName=iOS*#@jdPaySDK*#@)`
}

function toCurl(option = { url: "", body: "", headers: {} }) {
    if (!option.url) return ""
    let res = "curl "
    if (!option.headers.Host) option.headers.Host = option.url.match(/^http(s)?:\/\/(.*?)($|\/)/)?.[2] || ""
    for (let key in option.headers) {
        res += `-H '${key}: ${option.headers[key]}' `
    }
    if (option.body) {
        res += `--data-raw '${option.body}' `
    }
    res += `--compressed "${option.url}"`
    return res
}

function objToStr2(jsonMap) {
    let isFirst = true
    let res = ""
    for (let key in jsonMap) {
        let keyValue = jsonMap[key]
        if (typeof keyValue == "object") {
            keyValue = JSON.stringify(keyValue)
        }
        if (isFirst) {
            res += `${key}=${keyValue}`
            isFirst = false
        } else {
            res += `&${key}=${keyValue}`
        }
    }
    return res
}

function str2ToObj(keyMap) {
    const keyArr = keyMap.split("&").filter(x => x)
    const keyLen = keyArr.length
    if (keyLen === 1 && !keyArr[0].includes("=")) {
        return keyMap
    }
    const res = {}
    for (let i = 0; i < keyLen; i++) {
        const cur = keyArr[i].split('=').filter(x => x)
        const curValue = cur[1]
        if (/\d{1,16}|[.*?]|{}|{"\w+?":.*?(,"\w+?":.*?)*}|true|false/.test(curValue)) {
            try {
                cur[1] = eval(`(${curValue})`)
            } catch (_) { }
        }
        res[cur[0]] = cur[1]
    }
    return res
}

function randomNum(min, max) {
    if (arguments.length === 0) return Math.random()
    if (!max) max = 10 ** (Math.log(min) * Math.LOG10E + 1 | 0) - 1
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomString(min, max = 0) {
    var str = "", range = min, arr = [...Array(36).keys()].map(k => k.toString(36));

    if (max) {
        range = Math.floor(Math.random() * (max - min + 1) + min);
    }

    for (let i = 0; i < range;) {
        let randomString = Math.random().toString(16).substring(2)
        if ((range - i) > randomString.length) {
            str += randomString
            i += randomString.length
        } else {
            str += randomString.slice(i - range)
            i += randomString.length
        }
    }
    return str;
}

function TotalBean() {
    return new Promise(async resolve => {
        const options = {
            url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
            headers: {
                Host: "me-api.jd.com",
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
                        if (data['retcode'] === "1001") {
                            $.isLogin = false; //cookie过期
                            return;
                        }
                        if (data['retcode'] === "0" && data.data && data.data.hasOwnProperty("userInfo")) {
                            $.nickName = data.data.userInfo.baseInfo.nickname;
                        }
                    } else {
                        $.log('京东服务器返回空数据');
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

String.prototype.getKeyVal = function (str) {
    const reg = new RegExp(`${str}\=(.*?)(&|$)`)
    let res = ""
    if (reg.test(this)) {
        res = this.match(reg)[1]
    }
    return res
}
! function(t, r) {
    "object" == typeof exports ? module.exports = exports = r() : "function" == typeof define && define.amd ? define([], r) : t.CryptoJS = r()
}(this, function() {
    var t = t || function(t, r) {
            var e = Object.create || function() {
                    function t() {}
                    return function(r) {
                        var e;
                        return t.prototype = r, e = new t, t.prototype = null, e
                    }
                }(),
                i = {}, n = i.lib = {}, o = n.Base = function() {
                    return {
                        extend: function(t) {
                            var r = e(this);
                            return t && r.mixIn(t), r.hasOwnProperty("init") && this.init !== r.init || (r.init = function() {
                                r.$super.init.apply(this, arguments)
                            }), r.init.prototype = r, r.$super = this, r
                        },
                        create: function() {
                            var t = this.extend();
                            return t.init.apply(t, arguments), t
                        },
                        init: function() {},
                        mixIn: function(t) {
                            for (var r in t) t.hasOwnProperty(r) && (this[r] = t[r]);
                            t.hasOwnProperty("toString") && (this.toString = t.toString)
                        },
                        clone: function() {
                            return this.init.prototype.extend(this)
                        }
                    }
                }(),
                s = n.WordArray = o.extend({
                    init: function(t, e) {
                        t = this.words = t || [], e != r ? this.sigBytes = e : this.sigBytes = 4 * t.length
                    },
                    toString: function(t) {
                        return (t || c).stringify(this)
                    },
                    concat: function(t) {
                        var r = this.words,
                            e = t.words,
                            i = this.sigBytes,
                            n = t.sigBytes;
                        if (this.clamp(), i % 4) for (var o = 0; o < n; o++) {
                            var s = e[o >>> 2] >>> 24 - o % 4 * 8 & 255;
                            r[i + o >>> 2] |= s << 24 - (i + o) % 4 * 8
                        } else for (var o = 0; o < n; o += 4) r[i + o >>> 2] = e[o >>> 2];
                        return this.sigBytes += n, this
                    },
                    clamp: function() {
                        var r = this.words,
                            e = this.sigBytes;
                        r[e >>> 2] &= 4294967295 << 32 - e % 4 * 8, r.length = t.ceil(e / 4)
                    },
                    clone: function() {
                        var t = o.clone.call(this);
                        return t.words = this.words.slice(0), t
                    },
                    random: function(r) {
                        for (var e, i = [], n = function(r) {
                            var r = r,
                                e = 987654321,
                                i = 4294967295;
                            return function() {
                                e = 36969 * (65535 & e) + (e >> 16) & i, r = 18e3 * (65535 & r) + (r >> 16) & i;
                                var n = (e << 16) + r & i;
                                return n /= 4294967296, n += .5, n * (t.random() > .5 ? 1 : -1)
                            }
                        }, o = 0; o < r; o += 4) {
                            var a = n(4294967296 * (e || t.random()));
                            e = 987654071 * a(), i.push(4294967296 * a() | 0)
                        }
                        return new s.init(i, r)
                    }
                }),
                a = i.enc = {}, c = a.Hex = {
                    stringify: function(t) {
                        for (var r = t.words, e = t.sigBytes, i = [], n = 0; n < e; n++) {
                            var o = r[n >>> 2] >>> 24 - n % 4 * 8 & 255;
                            i.push((o >>> 4).toString(16)), i.push((15 & o).toString(16))
                        }
                        return i.join("")
                    },
                    parse: function(t) {
                     for (var r = t.length, e = [], i = 0; i < r; i += 2) e[i >>> 3] |= parseInt(t.substr(i, 2), 16) << 24 - i % 8 * 4;
                        return new s.init(e, r / 2)
                        
                    }
                }, h = a.Latin1 = {
                    stringify: function(t) {
                        for (var r = t.words, e = t.sigBytes, i = [], n = 0; n < e; n++) {
                            var o = r[n >>> 2] >>> 24 - n % 4 * 8 & 255;
                            i.push(String.fromCharCode(o))
                        }
                        return i.join("")
                    },
                    parse: function(t) {
                        for (var r = t.length, e = [], i = 0; i < r; i++) e[i >>> 2] |= (255 & t.charCodeAt(i)) << 24 - i % 4 * 8;
                        return new s.init(e, r)
                    }
                }, l = a.Utf8 = {
                    stringify: function(t) {
                        try {
                            return decodeURIComponent(escape(h.stringify(t)))
                        } catch (t) {
                            throw new Error("Malformed UTF-8 data")
                        }
                    },
                    parse: function(t) {
                        return h.parse(unescape(encodeURIComponent(t)))
                    }
                }, f = n.BufferedBlockAlgorithm = o.extend({
                    reset: function() {
                        this._data = new s.init, this._nDataBytes = 0
                    },
                    _append: function(t) {
                        "string" == typeof t && (t = l.parse(t)), this._data.concat(t), this._nDataBytes += t.sigBytes
                    },
                    _process: function(r) {
                        var e = this._data,
                            i = e.words,
                            n = e.sigBytes,
                            o = this.blockSize,
                            a = 4 * o,
                            c = n / a;
                        c = r ? t.ceil(c) : t.max((0 | c) - this._minBufferSize, 0);
                        var h = c * o,
                            l = t.min(4 * h, n);
                        if (h) {
                            for (var f = 0; f < h; f += o) this._doProcessBlock(i, f);
                            var u = i.splice(0, h);
                            e.sigBytes -= l
                        }
                        return new s.init(u, l)
                    },
                    clone: function() {
                        var t = o.clone.call(this);
                        return t._data = this._data.clone(), t
                    },
                    _minBufferSize: 0
                }),
                u = (n.Hasher = f.extend({
                    cfg: o.extend(),
                    init: function(t) {
                        this.cfg = this.cfg.extend(t), this.reset()
                    },
                    reset: function() {
                        f.reset.call(this), this._doReset()
                    },
                    update: function(t) {
                        return this._append(t), this._process(), this
                    },
                    finalize: function(t) {
                        t && this._append(t);
                        var r = this._doFinalize();
                        return r
                    },
                    blockSize: 16,
                    _createHelper: function(t) {
                        return function(r, e) {
                            return new t.init(e).finalize(r)
                        }
                    },
                    _createHmacHelper: function(t) {
                        return function(r, e) {
                            return new u.HMAC.init(t, e).finalize(r)
                        }
                    }
                }), i.algo = {});
            return i
        }(Math);
    return function() {
        function r(t, r, e) {
            for (var i = [], o = 0, s = 0; s < r; s++) if (s % 4) {
                var a = e[t.charCodeAt(s - 1)] << s % 4 * 2,
                    c = e[t.charCodeAt(s)] >>> 6 - s % 4 * 2;
                i[o >>> 2] |= (a | c) << 24 - o % 4 * 8, o++
            }
            return n.create(i, o)
        }
        var e = t,
            i = e.lib,
            n = i.WordArray,
            o = e.enc;
        o.Base64 = {
            stringify: function(t) {
                var r = t.words,
                    e = t.sigBytes,
                    i = this._map;
                t.clamp();
                for (var n = [], o = 0; o < e; o += 3) for (var s = r[o >>> 2] >>> 24 - o % 4 * 8 & 255, a = r[o + 1 >>> 2] >>> 24 - (o + 1) % 4 * 8 & 255, c = r[o + 2 >>> 2] >>> 24 - (o + 2) % 4 * 8 & 255, h = s << 16 | a << 8 | c, l = 0; l < 4 && o + .75 * l < e; l++) n.push(i.charAt(h >>> 6 * (3 - l) & 63));
                var f = i.charAt(64);
                if (f) for (; n.length % 4;) n.push(f);
                return n.join("")
            },
            parse: function(t) {
                var e = t.length,
                    i = this._map,
                    n = this._reverseMap;
                if (!n) {
                    n = this._reverseMap = [];
                    for (var o = 0; o < i.length; o++) n[i.charCodeAt(o)] = o
                }
                var s = i.charAt(64);
                if (s) {
                    var a = t.indexOf(s);
                    a !== -1 && (e = a)
                }
                return r(t, e, n)
            },
            _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
        }
    }(),
    function(r) {
        function e(t, r, e, i, n, o, s) {
            var a = t + (r & e | ~r & i) + n + s;
            return (a << o | a >>> 32 - o) + r
        }
        function i(t, r, e, i, n, o, s) {
            var a = t + (r & i | e & ~i) + n + s;
            return (a << o | a >>> 32 - o) + r
        }
        function n(t, r, e, i, n, o, s) {
            var a = t + (r ^ e ^ i) + n + s;
            return (a << o | a >>> 32 - o) + r
        }
        function o(t, r, e, i, n, o, s) {
            var a = t + (e ^ (r | ~i)) + n + s;
            return (a << o | a >>> 32 - o) + r
        }
        var s = t,
            a = s.lib,
            c = a.WordArray,
            h = a.Hasher,
            l = s.algo,
            f = [];
        ! function() {
            for (var t = 0; t < 64; t++) f[t] = 4294967296 * r.abs(r.sin(t + 1)) | 0
        }();
        var u = l.MD5 = h.extend({
            _doReset: function() {
                this._hash = new c.init([1732584193, 4023233417, 2562383102, 271733878])
            },
            _doProcessBlock: function(t, r) {
                for (var s = 0; s < 16; s++) {
                    var a = r + s,
                        c = t[a];
                    t[a] = 16711935 & (c << 8 | c >>> 24) | 4278255360 & (c << 24 | c >>> 8)
                }
                var h = this._hash.words,
                    l = t[r + 0],
                    u = t[r + 1],
                    d = t[r + 2],
                    v = t[r + 3],
                    p = t[r + 4],
                    _ = t[r + 5],
                    y = t[r + 6],
                    g = t[r + 7],
                    B = t[r + 8],
                    w = t[r + 9],
                    k = t[r + 10],
                    S = t[r + 11],
                    m = t[r + 12],
                    x = t[r + 13],
                    b = t[r + 14],
                    H = t[r + 15],
                    z = h[0],
                    A = h[1],
                    C = h[2],
                    D = h[3];
                z = e(z, A, C, D, l, 7, f[0]), D = e(D, z, A, C, u, 12, f[1]), C = e(C, D, z, A, d, 17, f[2]), A = e(A, C, D, z, v, 22, f[3]), z = e(z, A, C, D, p, 7, f[4]), D = e(D, z, A, C, _, 12, f[5]), C = e(C, D, z, A, y, 17, f[6]), A = e(A, C, D, z, g, 22, f[7]), z = e(z, A, C, D, B, 7, f[8]), D = e(D, z, A, C, w, 12, f[9]), C = e(C, D, z, A, k, 17, f[10]), A = e(A, C, D, z, S, 22, f[11]), z = e(z, A, C, D, m, 7, f[12]), D = e(D, z, A, C, x, 12, f[13]), C = e(C, D, z, A, b, 17, f[14]), A = e(A, C, D, z, H, 22, f[15]), z = i(z, A, C, D, u, 5, f[16]), D = i(D, z, A, C, y, 9, f[17]), C = i(C, D, z, A, S, 14, f[18]), A = i(A, C, D, z, l, 20, f[19]), z = i(z, A, C, D, _, 5, f[20]), D = i(D, z, A, C, k, 9, f[21]), C = i(C, D, z, A, H, 14, f[22]), A = i(A, C, D, z, p, 20, f[23]), z = i(z, A, C, D, w, 5, f[24]), D = i(D, z, A, C, b, 9, f[25]), C = i(C, D, z, A, v, 14, f[26]), A = i(A, C, D, z, B, 20, f[27]), z = i(z, A, C, D, x, 5, f[28]), D = i(D, z, A, C, d, 9, f[29]), C = i(C, D, z, A, g, 14, f[30]), A = i(A, C, D, z, m, 20, f[31]), z = n(z, A, C, D, _, 4, f[32]), D = n(D, z, A, C, B, 11, f[33]), C = n(C, D, z, A, S, 16, f[34]), A = n(A, C, D, z, b, 23, f[35]), z = n(z, A, C, D, u, 4, f[36]), D = n(D, z, A, C, p, 11, f[37]), C = n(C, D, z, A, g, 16, f[38]), A = n(A, C, D, z, k, 23, f[39]), z = n(z, A, C, D, x, 4, f[40]), D = n(D, z, A, C, l, 11, f[41]), C = n(C, D, z, A, v, 16, f[42]), A = n(A, C, D, z, y, 23, f[43]), z = n(z, A, C, D, w, 4, f[44]), D = n(D, z, A, C, m, 11, f[45]), C = n(C, D, z, A, H, 16, f[46]), A = n(A, C, D, z, d, 23, f[47]), z = o(z, A, C, D, l, 6, f[48]), D = o(D, z, A, C, g, 10, f[49]), C = o(C, D, z, A, b, 15, f[50]), A = o(A, C, D, z, _, 21, f[51]), z = o(z, A, C, D, m, 6, f[52]), D = o(D, z, A, C, v, 10, f[53]), C = o(C, D, z, A, k, 15, f[54]), A = o(A, C, D, z, u, 21, f[55]), z = o(z, A, C, D, B, 6, f[56]), D = o(D, z, A, C, H, 10, f[57]), C = o(C, D, z, A, y, 15, f[58]), A = o(A, C, D, z, x, 21, f[59]), z = o(z, A, C, D, p, 6, f[60]), D = o(D, z, A, C, S, 10, f[61]), C = o(C, D, z, A, d, 15, f[62]), A = o(A, C, D, z, w, 21, f[63]), h[0] = h[0] + z | 0, h[1] = h[1] + A | 0, h[2] = h[2] + C | 0, h[3] = h[3] + D | 0
            },
            _doFinalize: function() {
                var t = this._data,
                    e = t.words,
                    i = 8 * this._nDataBytes,
                    n = 8 * t.sigBytes;
                e[n >>> 5] |= 128 << 24 - n % 32;
                var o = r.floor(i / 4294967296),
                    s = i;
                e[(n + 64 >>> 9 << 4) + 15] = 16711935 & (o << 8 | o >>> 24) | 4278255360 & (o << 24 | o >>> 8), e[(n + 64 >>> 9 << 4) + 14] = 16711935 & (s << 8 | s >>> 24) | 4278255360 & (s << 24 | s >>> 8), t.sigBytes = 4 * (e.length + 1), this._process();
                for (var a = this._hash, c = a.words, h = 0; h < 4; h++) {
                    var l = c[h];
                    c[h] = 16711935 & (l << 8 | l >>> 24) | 4278255360 & (l << 24 | l >>> 8)
                }
                return a
            },
            clone: function() {
                var t = h.clone.call(this);
                return t._hash = this._hash.clone(), t
            }
        });
        s.MD5 = h._createHelper(u), s.HmacMD5 = h._createHmacHelper(u)
    }(Math),
    function() {
        var r = t,
            e = r.lib,
            i = e.WordArray,
            n = e.Hasher,
            o = r.algo,
            s = [],
            a = o.SHA1 = n.extend({
                _doReset: function() {
                    this._hash = new i.init([1732584193, 4023233417, 2562383102, 271733878, 3285377520])
                },
                _doProcessBlock: function(t, r) {
                    for (var e = this._hash.words, i = e[0], n = e[1], o = e[2], a = e[3], c = e[4], h = 0; h < 80; h++) {
                        if (h < 16) s[h] = 0 | t[r + h];
                        else {
                            var l = s[h - 3] ^ s[h - 8] ^ s[h - 14] ^ s[h - 16];
                            s[h] = l << 1 | l >>> 31
                        }
                        var f = (i << 5 | i >>> 27) + c + s[h];
                        f += h < 20 ? (n & o | ~n & a) + 1518500249 : h < 40 ? (n ^ o ^ a) + 1859775393 : h < 60 ? (n & o | n & a | o & a) - 1894007588 : (n ^ o ^ a) - 899497514, c = a, a = o, o = n << 30 | n >>> 2, n = i, i = f
                    }
                    e[0] = e[0] + i | 0, e[1] = e[1] + n | 0, e[2] = e[2] + o | 0, e[3] = e[3] + a | 0, e[4] = e[4] + c | 0
                },
                _doFinalize: function() {
                    var t = this._data,
                        r = t.words,
                        e = 8 * this._nDataBytes,
                        i = 8 * t.sigBytes;
                    return r[i >>> 5] |= 128 << 24 - i % 32, r[(i + 64 >>> 9 << 4) + 14] = Math.floor(e / 4294967296), r[(i + 64 >>> 9 << 4) + 15] = e, t.sigBytes = 4 * r.length, this._process(), this._hash
                },
                clone: function() {
                    var t = n.clone.call(this);
                    return t._hash = this._hash.clone(), t
                }
            });
        r.SHA1 = n._createHelper(a), r.HmacSHA1 = n._createHmacHelper(a)
    }(),
    function(r) {
        var e = t,
            i = e.lib,
            n = i.WordArray,
            o = i.Hasher,
            s = e.algo,
            a = [],
            c = [];
        ! function() {
            function t(t) {
                for (var e = r.sqrt(t), i = 2; i <= e; i++) if (!(t % i)) return !1;
                return !0
            }
            function e(t) {
                return 4294967296 * (t - (0 | t)) | 0
            }
            for (var i = 2, n = 0; n < 64;) t(i) && (n < 8 && (a[n] = e(r.pow(i, .5))), c[n] = e(r.pow(i, 1 / 3)), n++), i++
        }();
        var h = [],
            l = s.SHA256 = o.extend({
                _doReset: function() {
                    this._hash = new n.init(a.slice(0))
                },
                _doProcessBlock: function(t, r) {
                    for (var e = this._hash.words, i = e[0], n = e[1], o = e[2], s = e[3], a = e[4], l = e[5], f = e[6], u = e[7], d = 0; d < 64; d++) {
                        if (d < 16) h[d] = 0 | t[r + d];
                        else {
                            var v = h[d - 15],
                                p = (v << 25 | v >>> 7) ^ (v << 14 | v >>> 18) ^ v >>> 3,
                                _ = h[d - 2],
                                y = (_ << 15 | _ >>> 17) ^ (_ << 13 | _ >>> 19) ^ _ >>> 10;
                            h[d] = p + h[d - 7] + y + h[d - 16]
                        }
                        var g = a & l ^ ~a & f,
                            B = i & n ^ i & o ^ n & o,
                            w = (i << 30 | i >>> 2) ^ (i << 19 | i >>> 13) ^ (i << 10 | i >>> 22),
                            k = (a << 26 | a >>> 6) ^ (a << 21 | a >>> 11) ^ (a << 7 | a >>> 25),
                            S = u + k + g + c[d] + h[d],
                            m = w + B;
                        u = f, f = l, l = a, a = s + S | 0, s = o, o = n, n = i, i = S + m | 0
                    }
                    e[0] = e[0] + i | 0, e[1] = e[1] + n | 0, e[2] = e[2] + o | 0, e[3] = e[3] + s | 0, e[4] = e[4] + a | 0, e[5] = e[5] + l | 0, e[6] = e[6] + f | 0, e[7] = e[7] + u | 0
                },
                _doFinalize: function() {
                    var t = this._data,
                        e = t.words,
                        i = 8 * this._nDataBytes,
                        n = 8 * t.sigBytes;
                    return e[n >>> 5] |= 128 << 24 - n % 32, e[(n + 64 >>> 9 << 4) + 14] = r.floor(i / 4294967296), e[(n + 64 >>> 9 << 4) + 15] = i, t.sigBytes = 4 * e.length, this._process(), this._hash
                },
                clone: function() {
                    var t = o.clone.call(this);
                    return t._hash = this._hash.clone(), t
                }
            });
        e.SHA256 = o._createHelper(l), e.HmacSHA256 = o._createHmacHelper(l)
    }(Math),
    function() {
        function r(t) {
            return t << 8 & 4278255360 | t >>> 8 & 16711935
        }
        var e = t,
            i = e.lib,
            n = i.WordArray,
            o = e.enc;
        o.Utf16 = o.Utf16BE = {
            stringify: function(t) {
                for (var r = t.words, e = t.sigBytes, i = [], n = 0; n < e; n += 2) {
                    var o = r[n >>> 2] >>> 16 - n % 4 * 8 & 65535;
                    i.push(String.fromCharCode(o))
                }
                return i.join("")
            },
            parse: function(t) {
                for (var r = t.length, e = [], i = 0; i < r; i++) e[i >>> 1] |= t.charCodeAt(i) << 16 - i % 2 * 16;
                return n.create(e, 2 * r)
            }
        };
        o.Utf16LE = {
            stringify: function(t) {
                for (var e = t.words, i = t.sigBytes, n = [], o = 0; o < i; o += 2) {
                    var s = r(e[o >>> 2] >>> 16 - o % 4 * 8 & 65535);
                    n.push(String.fromCharCode(s))
                }
                return n.join("")
            },
            parse: function(t) {
                for (var e = t.length, i = [], o = 0; o < e; o++) i[o >>> 1] |= r(t.charCodeAt(o) << 16 - o % 2 * 16);
                return n.create(i, 2 * e)
            }
        }
    }(),
    function() {
        if ("function" == typeof ArrayBuffer) {
            var r = t,
                e = r.lib,
                i = e.WordArray,
                n = i.init,
                o = i.init = function(t) {
                    if (t instanceof ArrayBuffer && (t = new Uint8Array(t)), (t instanceof Int8Array || "undefined" != typeof Uint8ClampedArray && t instanceof Uint8ClampedArray || t instanceof Int16Array || t instanceof Uint16Array || t instanceof Int32Array || t instanceof Uint32Array || t instanceof Float32Array || t instanceof Float64Array) && (t = new Uint8Array(t.buffer, t.byteOffset, t.byteLength)), t instanceof Uint8Array) {
                        for (var r = t.byteLength, e = [], i = 0; i < r; i++) e[i >>> 2] |= t[i] << 24 - i % 4 * 8;
                        n.call(this, e, r)
                    } else n.apply(this, arguments)
                };
            o.prototype = i
        }
    }(),
    function(r) {
        function e(t, r, e) {
            return t ^ r ^ e
        }
        function i(t, r, e) {
            return t & r | ~t & e
        }
        function n(t, r, e) {
            return (t | ~r) ^ e
        }
        function o(t, r, e) {
            return t & e | r & ~e
        }
        function s(t, r, e) {
            return t ^ (r | ~e)
        }
        function a(t, r) {
            return t << r | t >>> 32 - r
        }
        var c = t,
            h = c.lib,
            l = h.WordArray,
            f = h.Hasher,
            u = c.algo,
            d = l.create([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13]),
            v = l.create([5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11]),
            p = l.create([11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6]),
            _ = l.create([8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11]),
            y = l.create([0, 1518500249, 1859775393, 2400959708, 2840853838]),
            g = l.create([1352829926, 1548603684, 1836072691, 2053994217, 0]),
            B = u.RIPEMD160 = f.extend({
                _doReset: function() {
                    this._hash = l.create([1732584193, 4023233417, 2562383102, 271733878, 3285377520])
                },
                _doProcessBlock: function(t, r) {
                    for (var c = 0; c < 16; c++) {
                        var h = r + c,
                            l = t[h];
                        t[h] = 16711935 & (l << 8 | l >>> 24) | 4278255360 & (l << 24 | l >>> 8)
                    }
                    var f, u, B, w, k, S, m, x, b, H, z = this._hash.words,
                        A = y.words,
                        C = g.words,
                        D = d.words,
                        R = v.words,
                        E = p.words,
                        M = _.words;
                    S = f = z[0], m = u = z[1], x = B = z[2], b = w = z[3], H = k = z[4];
                    for (var F, c = 0; c < 80; c += 1) F = f + t[r + D[c]] | 0, F += c < 16 ? e(u, B, w) + A[0] : c < 32 ? i(u, B, w) + A[1] : c < 48 ? n(u, B, w) + A[2] : c < 64 ? o(u, B, w) + A[3] : s(u, B, w) + A[4], F |= 0, F = a(F, E[c]), F = F + k | 0, f = k, k = w, w = a(B, 10), B = u, u = F, F = S + t[r + R[c]] | 0, F += c < 16 ? s(m, x, b) + C[0] : c < 32 ? o(m, x, b) + C[1] : c < 48 ? n(m, x, b) + C[2] : c < 64 ? i(m, x, b) + C[3] : e(m, x, b) + C[4], F |= 0, F = a(F, M[c]), F = F + H | 0, S = H, H = b, b = a(x, 10), x = m, m = F;
                    F = z[1] + B + b | 0, z[1] = z[2] + w + H | 0, z[2] = z[3] + k + S | 0, z[3] = z[4] + f + m | 0, z[4] = z[0] + u + x | 0, z[0] = F
                },
                _doFinalize: function() {
                    var t = this._data,
                        r = t.words,
                        e = 8 * this._nDataBytes,
                        i = 8 * t.sigBytes;
                    r[i >>> 5] |= 128 << 24 - i % 32, r[(i + 64 >>> 9 << 4) + 14] = 16711935 & (e << 8 | e >>> 24) | 4278255360 & (e << 24 | e >>> 8), t.sigBytes = 4 * (r.length + 1), this._process();
                    for (var n = this._hash, o = n.words, s = 0; s < 5; s++) {
                        var a = o[s];
                        o[s] = 16711935 & (a << 8 | a >>> 24) | 4278255360 & (a << 24 | a >>> 8)
                    }
                    return n
                },
                clone: function() {
                    var t = f.clone.call(this);
                    return t._hash = this._hash.clone(), t
                }
            });
        c.RIPEMD160 = f._createHelper(B), c.HmacRIPEMD160 = f._createHmacHelper(B)
    }(Math),
    function() {
        var r = t,
            e = r.lib,
            i = e.Base,
            n = r.enc,
            o = n.Utf8,
            s = r.algo;
        s.HMAC = i.extend({
            init: function(t, r) {
                t = this._hasher = new t.init, "string" == typeof r && (r = o.parse(r));
                var e = t.blockSize,
                    i = 4 * e;
                r.sigBytes > i && (r = t.finalize(r)), r.clamp();
                for (var n = this._oKey = r.clone(), s = this._iKey = r.clone(), a = n.words, c = s.words, h = 0; h < e; h++) a[h] ^= 1549556828, c[h] ^= 909522486;
                n.sigBytes = s.sigBytes = i, this.reset()
            },
            reset: function() {
                var t = this._hasher;
                t.reset(), t.update(this._iKey)
            },
            update: function(t) {
                return this._hasher.update(t), this
            },
            finalize: function(t) {
                var r = this._hasher,
                    e = r.finalize(t);
                r.reset();
                var i = r.finalize(this._oKey.clone().concat(e));
                return i
            }
        })
    }(),
    function() {
        var r = t,
            e = r.lib,
            i = e.Base,
            n = e.WordArray,
            o = r.algo,
            s = o.SHA1,
            a = o.HMAC,
            c = o.PBKDF2 = i.extend({
                cfg: i.extend({
                    keySize: 4,
                    hasher: s,
                    iterations: 1
                }),
                init: function(t) {
                    this.cfg = this.cfg.extend(t)
                },
                compute: function(t, r) {
                    for (var e = this.cfg, i = a.create(e.hasher, t), o = n.create(), s = n.create([1]), c = o.words, h = s.words, l = e.keySize, f = e.iterations; c.length < l;) {
                        var u = i.update(r).finalize(s);
                        i.reset();
                        for (var d = u.words, v = d.length, p = u, _ = 1; _ < f; _++) {
                            p = i.finalize(p), i.reset();
                            for (var y = p.words, g = 0; g < v; g++) d[g] ^= y[g]
                        }
                        o.concat(u), h[0]++
                    }
                    return o.sigBytes = 4 * l, o
                }
            });
        r.PBKDF2 = function(t, r, e) {
            return c.create(e).compute(t, r)
        }
    }(),
    function() {
        var r = t,
            e = r.lib,
            i = e.Base,
            n = e.WordArray,
            o = r.algo,
            s = o.MD5,
            a = o.EvpKDF = i.extend({
                cfg: i.extend({
                    keySize: 4,
                    hasher: s,
                    iterations: 1
                }),
                init: function(t) {
                    this.cfg = this.cfg.extend(t)
                },
                compute: function(t, r) {
                    for (var e = this.cfg, i = e.hasher.create(), o = n.create(), s = o.words, a = e.keySize, c = e.iterations; s.length < a;) {
                        h && i.update(h);
                        var h = i.update(t).finalize(r);
                        i.reset();
                        for (var l = 1; l < c; l++) h = i.finalize(h), i.reset();
                        o.concat(h)
                    }
                    return o.sigBytes = 4 * a, o
                }
            });
        r.EvpKDF = function(t, r, e) {
            return a.create(e).compute(t, r)
        }
    }(),
    function() {
        var r = t,
            e = r.lib,
            i = e.WordArray,
            n = r.algo,
            o = n.SHA256,
            s = n.SHA224 = o.extend({
                _doReset: function() {
                    this._hash = new i.init([3238371032, 914150663, 812702999, 4144912697, 4290775857, 1750603025, 1694076839, 3204075428])
                },
                _doFinalize: function() {
                    var t = o._doFinalize.call(this);
                    return t.sigBytes -= 4, t
                }
            });
        r.SHA224 = o._createHelper(s), r.HmacSHA224 = o._createHmacHelper(s)
    }(),
    function(r) {
        var e = t,
            i = e.lib,
            n = i.Base,
            o = i.WordArray,
            s = e.x64 = {};
        s.Word = n.extend({
            init: function(t, r) {
                this.high = t, this.low = r
            }
        }), s.WordArray = n.extend({
            init: function(t, e) {
                t = this.words = t || [], e != r ? this.sigBytes = e : this.sigBytes = 8 * t.length
            },
            toX32: function() {
                for (var t = this.words, r = t.length, e = [], i = 0; i < r; i++) {
                    var n = t[i];
                    e.push(n.high), e.push(n.low)
                }
                return o.create(e, this.sigBytes)
            },
            clone: function() {
                for (var t = n.clone.call(this), r = t.words = this.words.slice(0), e = r.length, i = 0; i < e; i++) r[i] = r[i].clone();
                return t
            }
        })
    }(),
    function(r) {
        var e = t,
            i = e.lib,
            n = i.WordArray,
            o = i.Hasher,
            s = e.x64,
            a = s.Word,
            c = e.algo,
            h = [],
            l = [],
            f = [];
        ! function() {
            for (var t = 1, r = 0, e = 0; e < 24; e++) {
                h[t + 5 * r] = (e + 1) * (e + 2) / 2 % 64;
                var i = r % 5,
                    n = (2 * t + 3 * r) % 5;
                t = i, r = n
            }
            for (var t = 0; t < 5; t++) for (var r = 0; r < 5; r++) l[t + 5 * r] = r + (2 * t + 3 * r) % 5 * 5;
            for (var o = 1, s = 0; s < 24; s++) {
                for (var c = 0, u = 0, d = 0; d < 7; d++) {
                    if (1 & o) {
                        var v = (1 << d) - 1;
                        v < 32 ? u ^= 1 << v : c ^= 1 << v - 32
                    }
                    128 & o ? o = o << 1 ^ 113 : o <<= 1
                }
                f[s] = a.create(c, u)
            }
        }();
        var u = [];
        ! function() {
            for (var t = 0; t < 25; t++) u[t] = a.create()
        }();
        var d = c.SHA3 = o.extend({
            cfg: o.cfg.extend({
                outputLength: 512
            }),
            _doReset: function() {
                for (var t = this._state = [], r = 0; r < 25; r++) t[r] = new a.init;
                this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32
            },
            _doProcessBlock: function(t, r) {
                for (var e = this._state, i = this.blockSize / 2, n = 0; n < i; n++) {
                    var o = t[r + 2 * n],
                        s = t[r + 2 * n + 1];
                    o = 16711935 & (o << 8 | o >>> 24) | 4278255360 & (o << 24 | o >>> 8), s = 16711935 & (s << 8 | s >>> 24) | 4278255360 & (s << 24 | s >>> 8);
                    var a = e[n];
                    a.high ^= s, a.low ^= o
                }
                for (var c = 0; c < 24; c++) {
                    for (var d = 0; d < 5; d++) {
                        for (var v = 0, p = 0, _ = 0; _ < 5; _++) {
                            var a = e[d + 5 * _];
                            v ^= a.high, p ^= a.low
                        }
                        var y = u[d];
                        y.high = v, y.low = p
                    }
                    for (var d = 0; d < 5; d++) for (var g = u[(d + 4) % 5], B = u[(d + 1) % 5], w = B.high, k = B.low, v = g.high ^ (w << 1 | k >>> 31), p = g.low ^ (k << 1 | w >>> 31), _ = 0; _ < 5; _++) {
                        var a = e[d + 5 * _];
                        a.high ^= v, a.low ^= p
                    }
                    for (var S = 1; S < 25; S++) {
                        var a = e[S],
                            m = a.high,
                            x = a.low,
                            b = h[S];
                        if (b < 32) var v = m << b | x >>> 32 - b,
                            p = x << b | m >>> 32 - b;
                        else var v = x << b - 32 | m >>> 64 - b,
                            p = m << b - 32 | x >>> 64 - b;
                        var H = u[l[S]];
                        H.high = v, H.low = p
                    }
                    var z = u[0],
                        A = e[0];
                    z.high = A.high, z.low = A.low;
                    for (var d = 0; d < 5; d++) for (var _ = 0; _ < 5; _++) {
                        var S = d + 5 * _,
                            a = e[S],
                            C = u[S],
                            D = u[(d + 1) % 5 + 5 * _],
                            R = u[(d + 2) % 5 + 5 * _];
                        a.high = C.high ^ ~D.high & R.high, a.low = C.low ^ ~D.low & R.low
                    }
                    var a = e[0],
                        E = f[c];
                    a.high ^= E.high, a.low ^= E.low
                }
            },
            _doFinalize: function() {
                var t = this._data,
                    e = t.words,
                    i = (8 * this._nDataBytes, 8 * t.sigBytes),
                    o = 32 * this.blockSize;
                e[i >>> 5] |= 1 << 24 - i % 32, e[(r.ceil((i + 1) / o) * o >>> 5) - 1] |= 128, t.sigBytes = 4 * e.length, this._process();
                for (var s = this._state, a = this.cfg.outputLength / 8, c = a / 8, h = [], l = 0; l < c; l++) {
                    var f = s[l],
                        u = f.high,
                        d = f.low;
                    u = 16711935 & (u << 8 | u >>> 24) | 4278255360 & (u << 24 | u >>> 8), d = 16711935 & (d << 8 | d >>> 24) | 4278255360 & (d << 24 | d >>> 8), h.push(d), h.push(u)
                }
                return new n.init(h, a)
            },
            clone: function() {
                for (var t = o.clone.call(this), r = t._state = this._state.slice(0), e = 0; e < 25; e++) r[e] = r[e].clone();
                return t
            }
        });
        e.SHA3 = o._createHelper(d), e.HmacSHA3 = o._createHmacHelper(d)
    }(Math),
    function() {
        function r() {
            return s.create.apply(s, arguments)
        }
        var e = t,
            i = e.lib,
            n = i.Hasher,
            o = e.x64,
            s = o.Word,
            a = o.WordArray,
            c = e.algo,
            h = [r(1116352408, 3609767458), r(1899447441, 602891725), r(3049323471, 3964484399), r(3921009573, 2173295548), r(961987163, 4081628472), r(1508970993, 3053834265), r(2453635748, 2937671579), r(2870763221, 3664609560), r(3624381080, 2734883394), r(310598401, 1164996542), r(607225278, 1323610764), r(1426881987, 3590304994), r(1925078388, 4068182383), r(2162078206, 991336113), r(2614888103, 633803317), r(3248222580, 3479774868), r(3835390401, 2666613458), r(4022224774, 944711139), r(264347078, 2341262773), r(604807628, 2007800933), r(770255983, 1495990901), r(1249150122, 1856431235), r(1555081692, 3175218132), r(1996064986, 2198950837), r(2554220882, 3999719339), r(2821834349, 766784016), r(2952996808, 2566594879), r(3210313671, 3203337956), r(3336571891, 1034457026), r(3584528711, 2466948901), r(113926993, 3758326383), r(338241895, 168717936), r(666307205, 1188179964), r(773529912, 1546045734), r(1294757372, 1522805485), r(1396182291, 2643833823), r(1695183700, 2343527390), r(1986661051, 1014477480), r(2177026350, 1206759142), r(2456956037, 344077627), r(2730485921, 1290863460), r(2820302411, 3158454273), r(3259730800, 3505952657), r(3345764771, 106217008), r(3516065817, 3606008344), r(3600352804, 1432725776), r(4094571909, 1467031594), r(275423344, 851169720), r(430227734, 3100823752), r(506948616, 1363258195), r(659060556, 3750685593), r(883997877, 3785050280), r(958139571, 3318307427), r(1322822218, 3812723403), r(1537002063, 2003034995), r(1747873779, 3602036899), r(1955562222, 1575990012), r(2024104815, 1125592928), r(2227730452, 2716904306), r(2361852424, 442776044), r(2428436474, 593698344), r(2756734187, 3733110249), r(3204031479, 2999351573), r(3329325298, 3815920427), r(3391569614, 3928383900), r(3515267271, 566280711), r(3940187606, 3454069534), r(4118630271, 4000239992), r(116418474, 1914138554), r(174292421, 2731055270), r(289380356, 3203993006), r(460393269, 320620315), r(685471733, 587496836), r(852142971, 1086792851), r(1017036298, 365543100), r(1126000580, 2618297676), r(1288033470, 3409855158), r(1501505948, 4234509866), r(1607167915, 987167468), r(1816402316, 1246189591)],
            l = [];
        ! function() {
            for (var t = 0; t < 80; t++) l[t] = r()
        }();
        var f = c.SHA512 = n.extend({
            _doReset: function() {
                this._hash = new a.init([new s.init(1779033703, 4089235720), new s.init(3144134277, 2227873595), new s.init(1013904242, 4271175723), new s.init(2773480762, 1595750129), new s.init(1359893119, 2917565137), new s.init(2600822924, 725511199), new s.init(528734635, 4215389547), new s.init(1541459225, 327033209)])
            },
            _doProcessBlock: function(t, r) {
                for (var e = this._hash.words, i = e[0], n = e[1], o = e[2], s = e[3], a = e[4], c = e[5], f = e[6], u = e[7], d = i.high, v = i.low, p = n.high, _ = n.low, y = o.high, g = o.low, B = s.high, w = s.low, k = a.high, S = a.low, m = c.high, x = c.low, b = f.high, H = f.low, z = u.high, A = u.low, C = d, D = v, R = p, E = _, M = y, F = g, P = B, W = w, O = k, U = S, I = m, K = x, X = b, L = H, j = z, N = A, T = 0; T < 80; T++) {
                    var Z = l[T];
                    if (T < 16) var q = Z.high = 0 | t[r + 2 * T],
                        G = Z.low = 0 | t[r + 2 * T + 1];
                    else {
                        var J = l[T - 15],
                            $ = J.high,
                            Q = J.low,
                            V = ($ >>> 1 | Q << 31) ^ ($ >>> 8 | Q << 24) ^ $ >>> 7,
                            Y = (Q >>> 1 | $ << 31) ^ (Q >>> 8 | $ << 24) ^ (Q >>> 7 | $ << 25),
                            tt = l[T - 2],
                            rt = tt.high,
                            et = tt.low,
                            it = (rt >>> 19 | et << 13) ^ (rt << 3 | et >>> 29) ^ rt >>> 6,
                            nt = (et >>> 19 | rt << 13) ^ (et << 3 | rt >>> 29) ^ (et >>> 6 | rt << 26),
                            ot = l[T - 7],
                            st = ot.high,
                            at = ot.low,
                            ct = l[T - 16],
                            ht = ct.high,
                            lt = ct.low,
                            G = Y + at,
                            q = V + st + (G >>> 0 < Y >>> 0 ? 1 : 0),
                            G = G + nt,
                            q = q + it + (G >>> 0 < nt >>> 0 ? 1 : 0),
                            G = G + lt,
                            q = q + ht + (G >>> 0 < lt >>> 0 ? 1 : 0);
                        Z.high = q, Z.low = G
                    }
                    var ft = O & I ^ ~O & X,
                        ut = U & K ^ ~U & L,
                        dt = C & R ^ C & M ^ R & M,
                        vt = D & E ^ D & F ^ E & F,
                        pt = (C >>> 28 | D << 4) ^ (C << 30 | D >>> 2) ^ (C << 25 | D >>> 7),
                        _t = (D >>> 28 | C << 4) ^ (D << 30 | C >>> 2) ^ (D << 25 | C >>> 7),
                        yt = (O >>> 14 | U << 18) ^ (O >>> 18 | U << 14) ^ (O << 23 | U >>> 9),
                        gt = (U >>> 14 | O << 18) ^ (U >>> 18 | O << 14) ^ (U << 23 | O >>> 9),
                        Bt = h[T],
                        wt = Bt.high,
                        kt = Bt.low,
                        St = N + gt,
                        mt = j + yt + (St >>> 0 < N >>> 0 ? 1 : 0),
                        St = St + ut,
                        mt = mt + ft + (St >>> 0 < ut >>> 0 ? 1 : 0),
                        St = St + kt,
                        mt = mt + wt + (St >>> 0 < kt >>> 0 ? 1 : 0),
                        St = St + G,
                        mt = mt + q + (St >>> 0 < G >>> 0 ? 1 : 0),
                        xt = _t + vt,
                        bt = pt + dt + (xt >>> 0 < _t >>> 0 ? 1 : 0);
                    j = X, N = L, X = I, L = K, I = O, K = U, U = W + St | 0, O = P + mt + (U >>> 0 < W >>> 0 ? 1 : 0) | 0, P = M, W = F, M = R, F = E, R = C, E = D, D = St + xt | 0, C = mt + bt + (D >>> 0 < St >>> 0 ? 1 : 0) | 0
                }
                v = i.low = v + D, i.high = d + C + (v >>> 0 < D >>> 0 ? 1 : 0), _ = n.low = _ + E, n.high = p + R + (_ >>> 0 < E >>> 0 ? 1 : 0), g = o.low = g + F, o.high = y + M + (g >>> 0 < F >>> 0 ? 1 : 0), w = s.low = w + W, s.high = B + P + (w >>> 0 < W >>> 0 ? 1 : 0), S = a.low = S + U, a.high = k + O + (S >>> 0 < U >>> 0 ? 1 : 0), x = c.low = x + K, c.high = m + I + (x >>> 0 < K >>> 0 ? 1 : 0), H = f.low = H + L, f.high = b + X + (H >>> 0 < L >>> 0 ? 1 : 0), A = u.low = A + N, u.high = z + j + (A >>> 0 < N >>> 0 ? 1 : 0)
            },
            _doFinalize: function() {
                var t = this._data,
                    r = t.words,
                    e = 8 * this._nDataBytes,
                    i = 8 * t.sigBytes;
                r[i >>> 5] |= 128 << 24 - i % 32, r[(i + 128 >>> 10 << 5) + 30] = Math.floor(e / 4294967296), r[(i + 128 >>> 10 << 5) + 31] = e, t.sigBytes = 4 * r.length, this._process();
                var n = this._hash.toX32();
                return n
            },
            clone: function() {
                var t = n.clone.call(this);
                return t._hash = this._hash.clone(), t
            },
            blockSize: 32
        });
        e.SHA512 = n._createHelper(f), e.HmacSHA512 = n._createHmacHelper(f)
    }(),
    function() {
        var r = t,
            e = r.x64,
            i = e.Word,
            n = e.WordArray,
            o = r.algo,
            s = o.SHA512,
            a = o.SHA384 = s.extend({
                _doReset: function() {
                    this._hash = new n.init([new i.init(3418070365, 3238371032), new i.init(1654270250, 914150663), new i.init(2438529370, 812702999), new i.init(355462360, 4144912697), new i.init(1731405415, 4290775857), new i.init(2394180231, 1750603025), new i.init(3675008525, 1694076839), new i.init(1203062813, 3204075428)])
                },
                _doFinalize: function() {
                    var t = s._doFinalize.call(this);
                    return t.sigBytes -= 16, t
                }
            });
        r.SHA384 = s._createHelper(a), r.HmacSHA384 = s._createHmacHelper(a)
    }(), t.lib.Cipher || function(r) {
        var e = t,
            i = e.lib,
            n = i.Base,
            o = i.WordArray,
            s = i.BufferedBlockAlgorithm,
            a = e.enc,
            c = (a.Utf8, a.Base64),
            h = e.algo,
            l = h.EvpKDF,
            f = i.Cipher = s.extend({
                cfg: n.extend(),
                createEncryptor: function(t, r) {
                    return this.create(this._ENC_XFORM_MODE, t, r)
                },
                createDecryptor: function(t, r) {
                    return this.create(this._DEC_XFORM_MODE, t, r)
                },
                init: function(t, r, e) {
                    this.cfg = this.cfg.extend(e), this._xformMode = t, this._key = r, this.reset()
                },
                reset: function() {
                    s.reset.call(this), this._doReset()
                },
                process: function(t) {
                    return this._append(t), this._process()
                },
                finalize: function(t) {
                    t && this._append(t);
                    var r = this._doFinalize();
                    return r
                },
                keySize: 4,
                ivSize: 4,
                _ENC_XFORM_MODE: 1,
                _DEC_XFORM_MODE: 2,
                _createHelper: function() {
                    function t(t) {
                        return "string" == typeof t ? m : w
                    }
                    return function(r) {
                        return {
                            encrypt: function(e, i, n) {
                                return t(i).encrypt(r, e, i, n)
                            },
                            decrypt: function(e, i, n) {
                                return t(i).decrypt(r, e, i, n)
                            }
                        }
                    }
                }()
            }),
            u = (i.StreamCipher = f.extend({
                _doFinalize: function() {
                    var t = this._process(!0);
                    return t
                },
                blockSize: 1
            }), e.mode = {}),
            d = i.BlockCipherMode = n.extend({
                createEncryptor: function(t, r) {
                    return this.Encryptor.create(t, r)
                },
                createDecryptor: function(t, r) {
                    return this.Decryptor.create(t, r)
                },
                init: function(t, r) {
                    this._cipher = t, this._iv = r
                }
            }),
            v = u.CBC = function() {
                function t(t, e, i) {
                    var n = this._iv;
                    if (n) {
                        var o = n;
                        this._iv = r
                    } else var o = this._prevBlock;
                    for (var s = 0; s < i; s++) t[e + s] ^= o[s]
                }
                var e = d.extend();
                return e.Encryptor = e.extend({
                    processBlock: function(r, e) {
                        var i = this._cipher,
                            n = i.blockSize;
                        t.call(this, r, e, n), i.encryptBlock(r, e), this._prevBlock = r.slice(e, e + n)
                    }
                }), e.Decryptor = e.extend({
                    processBlock: function(r, e) {
                        var i = this._cipher,
                            n = i.blockSize,
                            o = r.slice(e, e + n);
                        i.decryptBlock(r, e), t.call(this, r, e, n), this._prevBlock = o
                    }
                }), e
            }(),
            p = e.pad = {}, _ = p.Pkcs7 = {
                pad: function(t, r) {
                    for (var e = 4 * r, i = e - t.sigBytes % e, n = i << 24 | i << 16 | i << 8 | i, s = [], a = 0; a < i; a += 4) s.push(n);
                    var c = o.create(s, i);
                    t.concat(c)
                },
                unpad: function(t) {
                    var r = 255 & t.words[t.sigBytes - 1 >>> 2];
                    t.sigBytes -= r
                }
            }, y = (i.BlockCipher = f.extend({
                cfg: f.cfg.extend({
                    mode: v,
                    padding: _
                }),
                reset: function() {
                    f.reset.call(this);
                    var t = this.cfg,
                        r = t.iv,
                        e = t.mode;
                    if (this._xformMode == this._ENC_XFORM_MODE) var i = e.createEncryptor;
                    else {
                        var i = e.createDecryptor;
                        this._minBufferSize = 1
                    }
                    this._mode && this._mode.__creator == i ? this._mode.init(this, r && r.words) : (this._mode = i.call(e, this, r && r.words), this._mode.__creator = i)
                },
                _doProcessBlock: function(t, r) {
                    this._mode.processBlock(t, r)
                },
                _doFinalize: function() {
                    var t = this.cfg.padding;
                    if (this._xformMode == this._ENC_XFORM_MODE) {
                        t.pad(this._data, this.blockSize);
                        var r = this._process(!0)
                    } else {
                        var r = this._process(!0);
                        t.unpad(r)
                    }
                    return r
                },
                blockSize: 4
            }), i.CipherParams = n.extend({
                init: function(t) {
                    this.mixIn(t)
                },
                toString: function(t) {
                    return (t || this.formatter).stringify(this)
                }
            })),
            g = e.format = {}, B = g.OpenSSL = {
                stringify: function(t) {
                    var r = t.ciphertext,
                        e = t.salt;
                    if (e) var i = o.create([1398893684, 1701076831]).concat(e).concat(r);
                    else var i = r;
                    return i.toString(c)
                },
                parse: function(t) {
                    var r = c.parse(t),
                        e = r.words;
                    if (1398893684 == e[0] && 1701076831 == e[1]) {
                        var i = o.create(e.slice(2, 4));
                        e.splice(0, 4), r.sigBytes -= 16
                    }
                    return y.create({
                        ciphertext: r,
                        salt: i
                    })
                }
            }, w = i.SerializableCipher = n.extend({
                cfg: n.extend({
                    format: B
                }),
                encrypt: function(t, r, e, i) {
                    i = this.cfg.extend(i);
                    var n = t.createEncryptor(e, i),
                        o = n.finalize(r),
                        s = n.cfg;
                    return y.create({
                        ciphertext: o,
                        key: e,
                        iv: s.iv,
                        algorithm: t,
                        mode: s.mode,
                        padding: s.padding,
                        blockSize: t.blockSize,
                        formatter: i.format
                    })
                },
                decrypt: function(t, r, e, i) {
                    i = this.cfg.extend(i), r = this._parse(r, i.format);
                    var n = t.createDecryptor(e, i).finalize(r.ciphertext);
                    return n
                },
                _parse: function(t, r) {
                    return "string" == typeof t ? r.parse(t, this) : t
                }
            }),
            k = e.kdf = {}, S = k.OpenSSL = {
                execute: function(t, r, e, i) {
                    i || (i = o.random(8));
                    var n = l.create({
                        keySize: r + e
                    }).compute(t, i),
                        s = o.create(n.words.slice(r), 4 * e);
                    return n.sigBytes = 4 * r, y.create({
                        key: n,
                        iv: s,
                        salt: i
                    })
                }
            }, m = i.PasswordBasedCipher = w.extend({
                cfg: w.cfg.extend({
                    kdf: S
                }),
                encrypt: function(t, r, e, i) {
                    i = this.cfg.extend(i);
                    var n = i.kdf.execute(e, t.keySize, t.ivSize);
                    i.iv = n.iv;
                    var o = w.encrypt.call(this, t, r, n.key, i);
                    return o.mixIn(n), o
                },
                decrypt: function(t, r, e, i) {
                    i = this.cfg.extend(i), r = this._parse(r, i.format);
                    var n = i.kdf.execute(e, t.keySize, t.ivSize, r.salt);
                    i.iv = n.iv;
                    var o = w.decrypt.call(this, t, r, n.key, i);
                    return o
                }
            })
    }(), t.mode.CFB = function() {
        function r(t, r, e, i) {
            var n = this._iv;
            if (n) {
                var o = n.slice(0);
                this._iv = void 0
            } else var o = this._prevBlock;
            i.encryptBlock(o, 0);
            for (var s = 0; s < e; s++) t[r + s] ^= o[s]
        }
        var e = t.lib.BlockCipherMode.extend();
        return e.Encryptor = e.extend({
            processBlock: function(t, e) {
                var i = this._cipher,
                    n = i.blockSize;
                r.call(this, t, e, n, i), this._prevBlock = t.slice(e, e + n)
            }
        }), e.Decryptor = e.extend({
            processBlock: function(t, e) {
                var i = this._cipher,
                    n = i.blockSize,
                    o = t.slice(e, e + n);
                r.call(this, t, e, n, i), this._prevBlock = o
            }
        }), e
    }(), t.mode.ECB = function() {
        var r = t.lib.BlockCipherMode.extend();
        return r.Encryptor = r.extend({
            processBlock: function(t, r) {
                this._cipher.encryptBlock(t, r)
            }
        }), r.Decryptor = r.extend({
            processBlock: function(t, r) {
                this._cipher.decryptBlock(t, r)
            }
        }), r
    }(), t.pad.AnsiX923 = {
        pad: function(t, r) {
            var e = t.sigBytes,
                i = 4 * r,
                n = i - e % i,
                o = e + n - 1;
            t.clamp(), t.words[o >>> 2] |= n << 24 - o % 4 * 8, t.sigBytes += n
        },
        unpad: function(t) {
            var r = 255 & t.words[t.sigBytes - 1 >>> 2];
            t.sigBytes -= r
        }
    }, t.pad.Iso10126 = {
        pad: function(r, e) {
            var i = 4 * e,
                n = i - r.sigBytes % i;
            r.concat(t.lib.WordArray.random(n - 1)).concat(t.lib.WordArray.create([n << 24], 1))
        },
        unpad: function(t) {
            var r = 255 & t.words[t.sigBytes - 1 >>> 2];
            t.sigBytes -= r
        }
    }, t.pad.Iso97971 = {
        pad: function(r, e) {
            r.concat(t.lib.WordArray.create([2147483648], 1)), t.pad.ZeroPadding.pad(r, e)
        },
        unpad: function(r) {
            t.pad.ZeroPadding.unpad(r), r.sigBytes--
        }
    }, t.mode.OFB = function() {
        var r = t.lib.BlockCipherMode.extend(),
            e = r.Encryptor = r.extend({
                processBlock: function(t, r) {
                    var e = this._cipher,
                        i = e.blockSize,
                        n = this._iv,
                        o = this._keystream;
                    n && (o = this._keystream = n.slice(0), this._iv = void 0), e.encryptBlock(o, 0);
                    for (var s = 0; s < i; s++) t[r + s] ^= o[s]
                }
            });
        return r.Decryptor = e, r
    }(), t.pad.NoPadding = {
        pad: function() {},
        unpad: function() {}
    },
    function(r) {
        var e = t,
            i = e.lib,
            n = i.CipherParams,
            o = e.enc,
            s = o.Hex,
            a = e.format;
        a.Hex = {
            stringify: function(t) {
                return t.ciphertext.toString(s)
            },
            parse: function(t) {
                var r = s.parse(t);
                return n.create({
                    ciphertext: r
                })
            }
        }
    }(),
    function() {
        var r = t,
            e = r.lib,
            i = e.BlockCipher,
            n = r.algo,
            o = [],
            s = [],
            a = [],
            c = [],
            h = [],
            l = [],
            f = [],
            u = [],
            d = [],
            v = [];
        ! function() {
            for (var t = [], r = 0; r < 256; r++) r < 128 ? t[r] = r << 1 : t[r] = r << 1 ^ 283;
            for (var e = 0, i = 0, r = 0; r < 256; r++) {
                var n = i ^ i << 1 ^ i << 2 ^ i << 3 ^ i << 4;
                n = n >>> 8 ^ 255 & n ^ 99, o[e] = n, s[n] = e;
                var p = t[e],
                    _ = t[p],
                    y = t[_],
                    g = 257 * t[n] ^ 16843008 * n;
                a[e] = g << 24 | g >>> 8, c[e] = g << 16 | g >>> 16, h[e] = g << 8 | g >>> 24, l[e] = g;
                var g = 16843009 * y ^ 65537 * _ ^ 257 * p ^ 16843008 * e;
                f[n] = g << 24 | g >>> 8, u[n] = g << 16 | g >>> 16, d[n] = g << 8 | g >>> 24, v[n] = g, e ? (e = p ^ t[t[t[y ^ p]]], i ^= t[t[i]]) : e = i = 1
            }
        }();
        var p = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
            _ = n.AES = i.extend({
                _doReset: function() {
                    if (!this._nRounds || this._keyPriorReset !== this._key) {
                        for (var t = this._keyPriorReset = this._key, r = t.words, e = t.sigBytes / 4, i = this._nRounds = e + 6, n = 4 * (i + 1), s = this._keySchedule = [], a = 0; a < n; a++) if (a < e) s[a] = r[a];
                        else {
                            var c = s[a - 1];
                            a % e ? e > 6 && a % e == 4 && (c = o[c >>> 24] << 24 | o[c >>> 16 & 255] << 16 | o[c >>> 8 & 255] << 8 | o[255 & c]) : (c = c << 8 | c >>> 24, c = o[c >>> 24] << 24 | o[c >>> 16 & 255] << 16 | o[c >>> 8 & 255] << 8 | o[255 & c], c ^= p[a / e | 0] << 24), s[a] = s[a - e] ^ c
                        }
                        for (var h = this._invKeySchedule = [], l = 0; l < n; l++) {
                            var a = n - l;
                            if (l % 4) var c = s[a];
                            else var c = s[a - 4];
                            l < 4 || a <= 4 ? h[l] = c : h[l] = f[o[c >>> 24]] ^ u[o[c >>> 16 & 255]] ^ d[o[c >>> 8 & 255]] ^ v[o[255 & c]]
                        }
                    }
                },
                encryptBlock: function(t, r) {
                    this._doCryptBlock(t, r, this._keySchedule, a, c, h, l, o)
                },
                decryptBlock: function(t, r) {
                    var e = t[r + 1];
                    t[r + 1] = t[r + 3], t[r + 3] = e, this._doCryptBlock(t, r, this._invKeySchedule, f, u, d, v, s);
                    var e = t[r + 1];
                    t[r + 1] = t[r + 3], t[r + 3] = e
                },
                _doCryptBlock: function(t, r, e, i, n, o, s, a) {
                    for (var c = this._nRounds, h = t[r] ^ e[0], l = t[r + 1] ^ e[1], f = t[r + 2] ^ e[2], u = t[r + 3] ^ e[3], d = 4, v = 1; v < c; v++) {
                        var p = i[h >>> 24] ^ n[l >>> 16 & 255] ^ o[f >>> 8 & 255] ^ s[255 & u] ^ e[d++],
                            _ = i[l >>> 24] ^ n[f >>> 16 & 255] ^ o[u >>> 8 & 255] ^ s[255 & h] ^ e[d++],
                            y = i[f >>> 24] ^ n[u >>> 16 & 255] ^ o[h >>> 8 & 255] ^ s[255 & l] ^ e[d++],
                            g = i[u >>> 24] ^ n[h >>> 16 & 255] ^ o[l >>> 8 & 255] ^ s[255 & f] ^ e[d++];
                        h = p, l = _, f = y, u = g
                    }
                    var p = (a[h >>> 24] << 24 | a[l >>> 16 & 255] << 16 | a[f >>> 8 & 255] << 8 | a[255 & u]) ^ e[d++],
                        _ = (a[l >>> 24] << 24 | a[f >>> 16 & 255] << 16 | a[u >>> 8 & 255] << 8 | a[255 & h]) ^ e[d++],
                        y = (a[f >>> 24] << 24 | a[u >>> 16 & 255] << 16 | a[h >>> 8 & 255] << 8 | a[255 & l]) ^ e[d++],
                        g = (a[u >>> 24] << 24 | a[h >>> 16 & 255] << 16 | a[l >>> 8 & 255] << 8 | a[255 & f]) ^ e[d++];
                    t[r] = p, t[r + 1] = _, t[r + 2] = y, t[r + 3] = g
                },
                keySize: 8
            });
        r.AES = i._createHelper(_)
    }(),
    function() {
        function r(t, r) {
            var e = (this._lBlock >>> t ^ this._rBlock) & r;
            this._rBlock ^= e, this._lBlock ^= e << t
        }
        function e(t, r) {
            var e = (this._rBlock >>> t ^ this._lBlock) & r;
            this._lBlock ^= e, this._rBlock ^= e << t;
        }
        var i = t,
            n = i.lib,
            o = n.WordArray,
            s = n.BlockCipher,
            a = i.algo,
            c = [57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4],
            h = [14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32],
            l = [1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28],
            f = [{
                0: 8421888,
                268435456: 32768,
                536870912: 8421378,
                805306368: 2,
                1073741824: 512,
                1342177280: 8421890,
                1610612736: 8389122,
                1879048192: 8388608,
                2147483648: 514,
                2415919104: 8389120,
                2684354560: 33280,
                2952790016: 8421376,
                3221225472: 32770,
                3489660928: 8388610,
                3758096384: 0,
                4026531840: 33282,
                134217728: 0,
                402653184: 8421890,
                671088640: 33282,
                939524096: 32768,
                1207959552: 8421888,
                1476395008: 512,
                1744830464: 8421378,
                2013265920: 2,
                2281701376: 8389120,
                2550136832: 33280,
                2818572288: 8421376,
                3087007744: 8389122,
                3355443200: 8388610,
                3623878656: 32770,
                3892314112: 514,
                4160749568: 8388608,
                1: 32768,
                268435457: 2,
                536870913: 8421888,
                805306369: 8388608,
                1073741825: 8421378,
                1342177281: 33280,
                1610612737: 512,
                1879048193: 8389122,
                2147483649: 8421890,
                2415919105: 8421376,
                2684354561: 8388610,
                2952790017: 33282,
                3221225473: 514,
                3489660929: 8389120,
                3758096385: 32770,
                4026531841: 0,
                134217729: 8421890,
                402653185: 8421376,
                671088641: 8388608,
                939524097: 512,
                1207959553: 32768,
                1476395009: 8388610,
                1744830465: 2,
                2013265921: 33282,
                2281701377: 32770,
                2550136833: 8389122,
                2818572289: 514,
                3087007745: 8421888,
                3355443201: 8389120,
                3623878657: 0,
                3892314113: 33280,
                4160749569: 8421378
            }, {
                0: 1074282512,
                16777216: 16384,
                33554432: 524288,
                50331648: 1074266128,
                67108864: 1073741840,
                83886080: 1074282496,
                100663296: 1073758208,
                117440512: 16,
                134217728: 540672,
                150994944: 1073758224,
                167772160: 1073741824,
                184549376: 540688,
                201326592: 524304,
                218103808: 0,
                234881024: 16400,
                251658240: 1074266112,
                8388608: 1073758208,
                25165824: 540688,
                41943040: 16,
                58720256: 1073758224,
                75497472: 1074282512,
                92274688: 1073741824,
                109051904: 524288,
                125829120: 1074266128,
                142606336: 524304,
                159383552: 0,
                176160768: 16384,
                192937984: 1074266112,
                209715200: 1073741840,
                226492416: 540672,
                243269632: 1074282496,
                260046848: 16400,
                268435456: 0,
                285212672: 1074266128,
                301989888: 1073758224,
                318767104: 1074282496,
                335544320: 1074266112,
                352321536: 16,
                369098752: 540688,
                385875968: 16384,
                402653184: 16400,
                419430400: 524288,
                436207616: 524304,
                452984832: 1073741840,
                469762048: 540672,
                486539264: 1073758208,
                503316480: 1073741824,
                520093696: 1074282512,
                276824064: 540688,
                293601280: 524288,
                310378496: 1074266112,
                327155712: 16384,
                343932928: 1073758208,
                360710144: 1074282512,
                377487360: 16,
                394264576: 1073741824,
                411041792: 1074282496,
                427819008: 1073741840,
                444596224: 1073758224,
                461373440: 524304,
                478150656: 0,
                494927872: 16400,
                511705088: 1074266128,
                528482304: 540672
            }, {
                0: 260,
                1048576: 0,
                2097152: 67109120,
                3145728: 65796,
                4194304: 65540,
                5242880: 67108868,
                6291456: 67174660,
                7340032: 67174400,
                8388608: 67108864,
                9437184: 67174656,
                10485760: 65792,
                11534336: 67174404,
                12582912: 67109124,
                13631488: 65536,
                14680064: 4,
                15728640: 256,
                524288: 67174656,
                1572864: 67174404,
                2621440: 0,
                3670016: 67109120,
                4718592: 67108868,
                5767168: 65536,
                6815744: 65540,
                7864320: 260,
                8912896: 4,
                9961472: 256,
                11010048: 67174400,
                12058624: 65796,
                13107200: 65792,
                14155776: 67109124,
                15204352: 67174660,
                16252928: 67108864,
                16777216: 67174656,
                17825792: 65540,
                18874368: 65536,
                19922944: 67109120,
                20971520: 256,
                22020096: 67174660,
                23068672: 67108868,
                24117248: 0,
                25165824: 67109124,
                26214400: 67108864,
                27262976: 4,
                28311552: 65792,
                29360128: 67174400,
                30408704: 260,
                31457280: 65796,
                32505856: 67174404,
                17301504: 67108864,
                18350080: 260,
                19398656: 67174656,
                20447232: 0,
                21495808: 65540,
                22544384: 67109120,
                23592960: 256,
                24641536: 67174404,
                25690112: 65536,
                26738688: 67174660,
                27787264: 65796,
                28835840: 67108868,
                29884416: 67109124,
                30932992: 67174400,
                31981568: 4,
                33030144: 65792
            }, {
                0: 2151682048,
                65536: 2147487808,
                131072: 4198464,
                196608: 2151677952,
                262144: 0,
                327680: 4198400,
                393216: 2147483712,
                458752: 4194368,
                524288: 2147483648,
                589824: 4194304,
                655360: 64,
                720896: 2147487744,
                786432: 2151678016,
                851968: 4160,
                917504: 4096,
                983040: 2151682112,
                32768: 2147487808,
                98304: 64,
                163840: 2151678016,
                229376: 2147487744,
                294912: 4198400,
                360448: 2151682112,
                425984: 0,
                491520: 2151677952,
                557056: 4096,
                622592: 2151682048,
                688128: 4194304,
                753664: 4160,
                819200: 2147483648,
                884736: 4194368,
                950272: 4198464,
                1015808: 2147483712,
                1048576: 4194368,
                1114112: 4198400,
                1179648: 2147483712,
                1245184: 0,
                1310720: 4160,
                1376256: 2151678016,
                1441792: 2151682048,
                1507328: 2147487808,
                1572864: 2151682112,
                1638400: 2147483648,
                1703936: 2151677952,
                1769472: 4198464,
                1835008: 2147487744,
                1900544: 4194304,
                1966080: 64,
                2031616: 4096,
                1081344: 2151677952,
                1146880: 2151682112,
                1212416: 0,
                1277952: 4198400,
                1343488: 4194368,
                1409024: 2147483648,
                1474560: 2147487808,
                1540096: 64,
                1605632: 2147483712,
                1671168: 4096,
                1736704: 2147487744,
                1802240: 2151678016,
                1867776: 4160,
                1933312: 2151682048,
                1998848: 4194304,
                2064384: 4198464
            }, {
                0: 128,
                4096: 17039360,
                8192: 262144,
                12288: 536870912,
                16384: 537133184,
                20480: 16777344,
                24576: 553648256,
                28672: 262272,
                32768: 16777216,
                36864: 537133056,
                40960: 536871040,
                45056: 553910400,
                49152: 553910272,
                53248: 0,
                57344: 17039488,
                61440: 553648128,
                2048: 17039488,
                6144: 553648256,
                10240: 128,
                14336: 17039360,
                18432: 262144,
                22528: 537133184,
                26624: 553910272,
                30720: 536870912,
                34816: 537133056,
                38912: 0,
                43008: 553910400,
                47104: 16777344,
                51200: 536871040,
                55296: 553648128,
                59392: 16777216,
                63488: 262272,
                65536: 262144,
                69632: 128,
                73728: 536870912,
                77824: 553648256,
                81920: 16777344,
                86016: 553910272,
                90112: 537133184,
                94208: 16777216,
                98304: 553910400,
                102400: 553648128,
                106496: 17039360,
                110592: 537133056,
                114688: 262272,
                118784: 536871040,
                122880: 0,
                126976: 17039488,
                67584: 553648256,
                71680: 16777216,
                75776: 17039360,
                79872: 537133184,
                83968: 536870912,
                88064: 17039488,
                92160: 128,
                96256: 553910272,
                100352: 262272,
                104448: 553910400,
                108544: 0,
                112640: 553648128,
                116736: 16777344,
                120832: 262144,
                124928: 537133056,
                129024: 536871040
            }, {
                0: 268435464,
                256: 8192,
                512: 270532608,
                768: 270540808,
                1024: 268443648,
                1280: 2097152,
                1536: 2097160,
                1792: 268435456,
                2048: 0,
                2304: 268443656,
                2560: 2105344,
                2816: 8,
                3072: 270532616,
                3328: 2105352,
                3584: 8200,
                3840: 270540800,
                128: 270532608,
                384: 270540808,
                640: 8,
                896: 2097152,
                1152: 2105352,
                1408: 268435464,
                1664: 268443648,
                1920: 8200,
                2176: 2097160,
                2432: 8192,
                2688: 268443656,
                2944: 270532616,
                3200: 0,
                3456: 270540800,
                3712: 2105344,
                3968: 268435456,
                4096: 268443648,
                4352: 270532616,
                4608: 270540808,
                4864: 8200,
                5120: 2097152,
                5376: 268435456,
                5632: 268435464,
                5888: 2105344,
                6144: 2105352,
                6400: 0,
                6656: 8,
                6912: 270532608,
                7168: 8192,
                7424: 268443656,
                7680: 270540800,
                7936: 2097160,
                4224: 8,
                4480: 2105344,
                4736: 2097152,
                4992: 268435464,
                5248: 268443648,
                5504: 8200,
                5760: 270540808,
                6016: 270532608,
                6272: 270540800,
                6528: 270532616,
                6784: 8192,
                7040: 2105352,
                7296: 2097160,
                7552: 0,
                7808: 268435456,
                8064: 268443656
            }, {
                0: 1048576,
                16: 33555457,
                32: 1024,
                48: 1049601,
                64: 34604033,
                80: 0,
                96: 1,
                112: 34603009,
                128: 33555456,
                144: 1048577,
                160: 33554433,
                176: 34604032,
                192: 34603008,
                208: 1025,
                224: 1049600,
                240: 33554432,
                8: 34603009,
                24: 0,
                40: 33555457,
                56: 34604032,
                72: 1048576,
                88: 33554433,
                104: 33554432,
                120: 1025,
                136: 1049601,
                152: 33555456,
                168: 34603008,
                184: 1048577,
                200: 1024,
                216: 34604033,
                232: 1,
                248: 1049600,
                256: 33554432,
                272: 1048576,
                288: 33555457,
                304: 34603009,
                320: 1048577,
                336: 33555456,
                352: 34604032,
                368: 1049601,
                384: 1025,
                400: 34604033,
                416: 1049600,
                432: 1,
                448: 0,
                464: 34603008,
                480: 33554433,
                496: 1024,
                264: 1049600,
                280: 33555457,
                296: 34603009,
                312: 1,
                328: 33554432,
                344: 1048576,
                360: 1025,
                376: 34604032,
                392: 33554433,
                408: 34603008,
                424: 0,
                440: 34604033,
                456: 1049601,
                472: 1024,
                488: 33555456,
                504: 1048577
            }, {
                0: 134219808,
                1: 131072,
                2: 134217728,
                3: 32,
                4: 131104,
                5: 134350880,
                6: 134350848,
                7: 2048,
                8: 134348800,
                9: 134219776,
                10: 133120,
                11: 134348832,
                12: 2080,
                13: 0,
                14: 134217760,
                15: 133152,
                2147483648: 2048,
                2147483649: 134350880,
                2147483650: 134219808,
                2147483651: 134217728,
                2147483652: 134348800,
                2147483653: 133120,
                2147483654: 133152,
                2147483655: 32,
                2147483656: 134217760,
                2147483657: 2080,
                2147483658: 131104,
                2147483659: 134350848,
                2147483660: 0,
                2147483661: 134348832,
                2147483662: 134219776,
                2147483663: 131072,
                16: 133152,
                17: 134350848,
                18: 32,
                19: 2048,
                20: 134219776,
                21: 134217760,
                22: 134348832,
                23: 131072,
                24: 0,
                25: 131104,
                26: 134348800,
                27: 134219808,
                28: 134350880,
                29: 133120,
                30: 2080,
                31: 134217728,
                2147483664: 131072,
                2147483665: 2048,
                2147483666: 134348832,
                2147483667: 133152,
                2147483668: 32,
                2147483669: 134348800,
                2147483670: 134217728,
                2147483671: 134219808,
                2147483672: 134350880,
                2147483673: 134217760,
                2147483674: 134219776,
                2147483675: 0,
                2147483676: 133120,
                2147483677: 2080,
                2147483678: 131104,
                2147483679: 134350848
            }],
            u = [4160749569, 528482304, 33030144, 2064384, 129024, 8064, 504, 2147483679],
            d = a.DES = s.extend({
                _doReset: function() {
                    for (var t = this._key, r = t.words, e = [], i = 0; i < 56; i++) {
                        var n = c[i] - 1;
                        e[i] = r[n >>> 5] >>> 31 - n % 32 & 1
                    }
                    for (var o = this._subKeys = [], s = 0; s < 16; s++) {
                        for (var a = o[s] = [], f = l[s], i = 0; i < 24; i++) a[i / 6 | 0] |= e[(h[i] - 1 + f) % 28] << 31 - i % 6, a[4 + (i / 6 | 0)] |= e[28 + (h[i + 24] - 1 + f) % 28] << 31 - i % 6;
                        a[0] = a[0] << 1 | a[0] >>> 31;
                        for (var i = 1; i < 7; i++) a[i] = a[i] >>> 4 * (i - 1) + 3;
                        a[7] = a[7] << 5 | a[7] >>> 27
                    }
                    for (var u = this._invSubKeys = [], i = 0; i < 16; i++) u[i] = o[15 - i]
                },
                encryptBlock: function(t, r) {
                    this._doCryptBlock(t, r, this._subKeys)
                },
                decryptBlock: function(t, r) {
                    this._doCryptBlock(t, r, this._invSubKeys)
                },
                _doCryptBlock: function(t, i, n) {
                    this._lBlock = t[i], this._rBlock = t[i + 1], r.call(this, 4, 252645135), r.call(this, 16, 65535), e.call(this, 2, 858993459), e.call(this, 8, 16711935), r.call(this, 1, 1431655765);
                    for (var o = 0; o < 16; o++) {
                        for (var s = n[o], a = this._lBlock, c = this._rBlock, h = 0, l = 0; l < 8; l++) h |= f[l][((c ^ s[l]) & u[l]) >>> 0];
                        this._lBlock = c, this._rBlock = a ^ h
                    }
                    var d = this._lBlock;
                    this._lBlock = this._rBlock, this._rBlock = d, r.call(this, 1, 1431655765), e.call(this, 8, 16711935), e.call(this, 2, 858993459), r.call(this, 16, 65535), r.call(this, 4, 252645135), t[i] = this._lBlock, t[i + 1] = this._rBlock
                },
                keySize: 2,
                ivSize: 2,
                blockSize: 2
            });
        i.DES = s._createHelper(d);
        var v = a.TripleDES = s.extend({
            _doReset: function() {
                var t = this._key,
                    r = t.words;
                this._des1 = d.createEncryptor(o.create(r.slice(0, 2))), this._des2 = d.createEncryptor(o.create(r.slice(2, 4))), this._des3 = d.createEncryptor(o.create(r.slice(4, 6)))
            },
            encryptBlock: function(t, r) {
                this._des1.encryptBlock(t, r), this._des2.decryptBlock(t, r), this._des3.encryptBlock(t, r)
            },
            decryptBlock: function(t, r) {
                this._des3.decryptBlock(t, r), this._des2.encryptBlock(t, r), this._des1.decryptBlock(t, r)
            },
            keySize: 6,
            ivSize: 2,
            blockSize: 2
        });
        i.TripleDES = s._createHelper(v)
    }(),
    function() {
        function r() {
            for (var t = this._S, r = this._i, e = this._j, i = 0, n = 0; n < 4; n++) {
                r = (r + 1) % 256, e = (e + t[r]) % 256;
                var o = t[r];
                t[r] = t[e], t[e] = o, i |= t[(t[r] + t[e]) % 256] << 24 - 8 * n
            }
            return this._i = r, this._j = e, i
        }
        var e = t,
            i = e.lib,
            n = i.StreamCipher,
            o = e.algo,
            s = o.RC4 = n.extend({
                _doReset: function() {
                    for (var t = this._key, r = t.words, e = t.sigBytes, i = this._S = [], n = 0; n < 256; n++) i[n] = n;
                    for (var n = 0, o = 0; n < 256; n++) {
                        var s = n % e,
                            a = r[s >>> 2] >>> 24 - s % 4 * 8 & 255;
                        o = (o + i[n] + a) % 256;
                        var c = i[n];
                        i[n] = i[o], i[o] = c
                    }
                    this._i = this._j = 0
                },
                _doProcessBlock: function(t, e) {
                    t[e] ^= r.call(this)
                },
                keySize: 8,
                ivSize: 0
            });
        e.RC4 = n._createHelper(s);
        var a = o.RC4Drop = s.extend({
            cfg: s.cfg.extend({
                drop: 192
            }),
            _doReset: function() {
                s._doReset.call(this);
                for (var t = this.cfg.drop; t > 0; t--) r.call(this)
            }
        });
        e.RC4Drop = n._createHelper(a)
    }(), t.mode.CTRGladman = function() {
        function r(t) {
            if (255 === (t >> 24 & 255)) {
                var r = t >> 16 & 255,
                    e = t >> 8 & 255,
                    i = 255 & t;
                255 === r ? (r = 0, 255 === e ? (e = 0, 255 === i ? i = 0 : ++i) : ++e) : ++r, t = 0, t += r << 16, t += e << 8, t += i
            } else t += 1 << 24;
            return t
        }
        function e(t) {
            return 0 === (t[0] = r(t[0])) && (t[1] = r(t[1])), t
        }
        var i = t.lib.BlockCipherMode.extend(),
            n = i.Encryptor = i.extend({
                processBlock: function(t, r) {
                    var i = this._cipher,
                        n = i.blockSize,
                        o = this._iv,
                        s = this._counter;
                    o && (s = this._counter = o.slice(0), this._iv = void 0), e(s);
                    var a = s.slice(0);
                    i.encryptBlock(a, 0);
                    for (var c = 0; c < n; c++) t[r + c] ^= a[c]
                }
            });
        return i.Decryptor = n, i
    }(),
    function() {
        function r() {
            for (var t = this._X, r = this._C, e = 0; e < 8; e++) a[e] = r[e];
            r[0] = r[0] + 1295307597 + this._b | 0, r[1] = r[1] + 3545052371 + (r[0] >>> 0 < a[0] >>> 0 ? 1 : 0) | 0, r[2] = r[2] + 886263092 + (r[1] >>> 0 < a[1] >>> 0 ? 1 : 0) | 0, r[3] = r[3] + 1295307597 + (r[2] >>> 0 < a[2] >>> 0 ? 1 : 0) | 0, r[4] = r[4] + 3545052371 + (r[3] >>> 0 < a[3] >>> 0 ? 1 : 0) | 0, r[5] = r[5] + 886263092 + (r[4] >>> 0 < a[4] >>> 0 ? 1 : 0) | 0, r[6] = r[6] + 1295307597 + (r[5] >>> 0 < a[5] >>> 0 ? 1 : 0) | 0, r[7] = r[7] + 3545052371 + (r[6] >>> 0 < a[6] >>> 0 ? 1 : 0) | 0, this._b = r[7] >>> 0 < a[7] >>> 0 ? 1 : 0;
            for (var e = 0; e < 8; e++) {
                var i = t[e] + r[e],
                    n = 65535 & i,
                    o = i >>> 16,
                    s = ((n * n >>> 17) + n * o >>> 15) + o * o,
                    h = ((4294901760 & i) * i | 0) + ((65535 & i) * i | 0);
                c[e] = s ^ h
            }
            t[0] = c[0] + (c[7] << 16 | c[7] >>> 16) + (c[6] << 16 | c[6] >>> 16) | 0, t[1] = c[1] + (c[0] << 8 | c[0] >>> 24) + c[7] | 0, t[2] = c[2] + (c[1] << 16 | c[1] >>> 16) + (c[0] << 16 | c[0] >>> 16) | 0, t[3] = c[3] + (c[2] << 8 | c[2] >>> 24) + c[1] | 0, t[4] = c[4] + (c[3] << 16 | c[3] >>> 16) + (c[2] << 16 | c[2] >>> 16) | 0, t[5] = c[5] + (c[4] << 8 | c[4] >>> 24) + c[3] | 0, t[6] = c[6] + (c[5] << 16 | c[5] >>> 16) + (c[4] << 16 | c[4] >>> 16) | 0, t[7] = c[7] + (c[6] << 8 | c[6] >>> 24) + c[5] | 0
        }
        var e = t,
            i = e.lib,
            n = i.StreamCipher,
            o = e.algo,
            s = [],
            a = [],
            c = [],
            h = o.Rabbit = n.extend({
                _doReset: function() {
                    for (var t = this._key.words, e = this.cfg.iv, i = 0; i < 4; i++) t[i] = 16711935 & (t[i] << 8 | t[i] >>> 24) | 4278255360 & (t[i] << 24 | t[i] >>> 8);
                    var n = this._X = [t[0], t[3] << 16 | t[2] >>> 16, t[1], t[0] << 16 | t[3] >>> 16, t[2], t[1] << 16 | t[0] >>> 16, t[3], t[2] << 16 | t[1] >>> 16],
                        o = this._C = [t[2] << 16 | t[2] >>> 16, 4294901760 & t[0] | 65535 & t[1], t[3] << 16 | t[3] >>> 16, 4294901760 & t[1] | 65535 & t[2], t[0] << 16 | t[0] >>> 16, 4294901760 & t[2] | 65535 & t[3], t[1] << 16 | t[1] >>> 16, 4294901760 & t[3] | 65535 & t[0]];
                    this._b = 0;
                    for (var i = 0; i < 4; i++) r.call(this);
                    for (var i = 0; i < 8; i++) o[i] ^= n[i + 4 & 7];
                    if (e) {
                        var s = e.words,
                            a = s[0],
                            c = s[1],
                            h = 16711935 & (a << 8 | a >>> 24) | 4278255360 & (a << 24 | a >>> 8),
                            l = 16711935 & (c << 8 | c >>> 24) | 4278255360 & (c << 24 | c >>> 8),
                            f = h >>> 16 | 4294901760 & l,
                            u = l << 16 | 65535 & h;
                        o[0] ^= h, o[1] ^= f, o[2] ^= l, o[3] ^= u, o[4] ^= h, o[5] ^= f, o[6] ^= l, o[7] ^= u;
                        for (var i = 0; i < 4; i++) r.call(this)
                    }
                },
                _doProcessBlock: function(t, e) {
                    var i = this._X;
                    r.call(this), s[0] = i[0] ^ i[5] >>> 16 ^ i[3] << 16, s[1] = i[2] ^ i[7] >>> 16 ^ i[5] << 16, s[2] = i[4] ^ i[1] >>> 16 ^ i[7] << 16, s[3] = i[6] ^ i[3] >>> 16 ^ i[1] << 16;
                    for (var n = 0; n < 4; n++) s[n] = 16711935 & (s[n] << 8 | s[n] >>> 24) | 4278255360 & (s[n] << 24 | s[n] >>> 8), t[e + n] ^= s[n]
                },
                blockSize: 4,
                ivSize: 2
            });
        e.Rabbit = n._createHelper(h)
    }(), t.mode.CTR = function() {
        var r = t.lib.BlockCipherMode.extend(),
            e = r.Encryptor = r.extend({
                processBlock: function(t, r) {
                    var e = this._cipher,
                        i = e.blockSize,
                        n = this._iv,
                        o = this._counter;
                    n && (o = this._counter = n.slice(0), this._iv = void 0);
                    var s = o.slice(0);
                    e.encryptBlock(s, 0), o[i - 1] = o[i - 1] + 1 | 0;
                    for (var a = 0; a < i; a++) t[r + a] ^= s[a]
                }
            });
        return r.Decryptor = e, r
    }(),
    function() {
        function r() {
            for (var t = this._X, r = this._C, e = 0; e < 8; e++) a[e] = r[e];
            r[0] = r[0] + 1295307597 + this._b | 0, r[1] = r[1] + 3545052371 + (r[0] >>> 0 < a[0] >>> 0 ? 1 : 0) | 0, r[2] = r[2] + 886263092 + (r[1] >>> 0 < a[1] >>> 0 ? 1 : 0) | 0, r[3] = r[3] + 1295307597 + (r[2] >>> 0 < a[2] >>> 0 ? 1 : 0) | 0, r[4] = r[4] + 3545052371 + (r[3] >>> 0 < a[3] >>> 0 ? 1 : 0) | 0, r[5] = r[5] + 886263092 + (r[4] >>> 0 < a[4] >>> 0 ? 1 : 0) | 0, r[6] = r[6] + 1295307597 + (r[5] >>> 0 < a[5] >>> 0 ? 1 : 0) | 0, r[7] = r[7] + 3545052371 + (r[6] >>> 0 < a[6] >>> 0 ? 1 : 0) | 0, this._b = r[7] >>> 0 < a[7] >>> 0 ? 1 : 0;
            for (var e = 0; e < 8; e++) {
                var i = t[e] + r[e],
                    n = 65535 & i,
                    o = i >>> 16,
                    s = ((n * n >>> 17) + n * o >>> 15) + o * o,
                    h = ((4294901760 & i) * i | 0) + ((65535 & i) * i | 0);
                c[e] = s ^ h
            }
            t[0] = c[0] + (c[7] << 16 | c[7] >>> 16) + (c[6] << 16 | c[6] >>> 16) | 0, t[1] = c[1] + (c[0] << 8 | c[0] >>> 24) + c[7] | 0, t[2] = c[2] + (c[1] << 16 | c[1] >>> 16) + (c[0] << 16 | c[0] >>> 16) | 0, t[3] = c[3] + (c[2] << 8 | c[2] >>> 24) + c[1] | 0, t[4] = c[4] + (c[3] << 16 | c[3] >>> 16) + (c[2] << 16 | c[2] >>> 16) | 0, t[5] = c[5] + (c[4] << 8 | c[4] >>> 24) + c[3] | 0, t[6] = c[6] + (c[5] << 16 | c[5] >>> 16) + (c[4] << 16 | c[4] >>> 16) | 0, t[7] = c[7] + (c[6] << 8 | c[6] >>> 24) + c[5] | 0
        }
        var e = t,
            i = e.lib,
            n = i.StreamCipher,
            o = e.algo,
            s = [],
            a = [],
            c = [],
            h = o.RabbitLegacy = n.extend({
                _doReset: function() {
                    var t = this._key.words,
                        e = this.cfg.iv,
                        i = this._X = [t[0], t[3] << 16 | t[2] >>> 16, t[1], t[0] << 16 | t[3] >>> 16, t[2], t[1] << 16 | t[0] >>> 16, t[3], t[2] << 16 | t[1] >>> 16],
                        n = this._C = [t[2] << 16 | t[2] >>> 16, 4294901760 & t[0] | 65535 & t[1], t[3] << 16 | t[3] >>> 16, 4294901760 & t[1] | 65535 & t[2], t[0] << 16 | t[0] >>> 16, 4294901760 & t[2] | 65535 & t[3], t[1] << 16 | t[1] >>> 16, 4294901760 & t[3] | 65535 & t[0]];
                    this._b = 0;
                    for (var o = 0; o < 4; o++) r.call(this);
                    for (var o = 0; o < 8; o++) n[o] ^= i[o + 4 & 7];
                    if (e) {
                        var s = e.words,
                            a = s[0],
                            c = s[1],
                            h = 16711935 & (a << 8 | a >>> 24) | 4278255360 & (a << 24 | a >>> 8),
                            l = 16711935 & (c << 8 | c >>> 24) | 4278255360 & (c << 24 | c >>> 8),
                            f = h >>> 16 | 4294901760 & l,
                            u = l << 16 | 65535 & h;
                        n[0] ^= h, n[1] ^= f, n[2] ^= l, n[3] ^= u, n[4] ^= h, n[5] ^= f, n[6] ^= l, n[7] ^= u;
                        for (var o = 0; o < 4; o++) r.call(this)
                    }
                },
                _doProcessBlock: function(t, e) {
                    var i = this._X;
                    r.call(this), s[0] = i[0] ^ i[5] >>> 16 ^ i[3] << 16, s[1] = i[2] ^ i[7] >>> 16 ^ i[5] << 16, s[2] = i[4] ^ i[1] >>> 16 ^ i[7] << 16, s[3] = i[6] ^ i[3] >>> 16 ^ i[1] << 16;
                    for (var n = 0; n < 4; n++) s[n] = 16711935 & (s[n] << 8 | s[n] >>> 24) | 4278255360 & (s[n] << 24 | s[n] >>> 8), t[e + n] ^= s[n]
                },
                blockSize: 4,
                ivSize: 2
            });
        e.RabbitLegacy = n._createHelper(h)
    }(), t.pad.ZeroPadding = {
        pad: function(t, r) {
            var e = 4 * r;
            t.clamp(), t.sigBytes += e - (t.sigBytes % e || e)
        },
        unpad: function(t) {
            for (var r = t.words, e = t.sigBytes - 1; !(r[e >>> 2] >>> 24 - e % 4 * 8 & 255);) e--;
            t.sigBytes = e + 1
        }
    }, t

});

function _0x3ae16b(_0x5a3e57, _0x14e9cd, _0x5c6201) {
    var _0x246eb8 = {
        'AJxuL': '2|3|0|4|1',
        'Dbsnw': function(_0xa072dc, _0x1f093e) {
            return _0xa072dc >> _0x1f093e;
        },
        'QkbcW': function(_0x47a39e, _0x3ff673) {
            return _0x47a39e - _0x3ff673;
        },
        'PCclX': function(_0x396af4, _0x150d27) {
            return _0x396af4 % _0x150d27;
        },
        'YXFak': function(_0x4a1414, _0x2bf484) {
            return _0x4a1414 + _0x2bf484;
        },
        'zlqgX': function(_0x44ad08, _0x55e887) {
            return _0x44ad08 << _0x55e887;
        },
        'ebLRE': function(_0x451844, _0x2ab79c) {
            return _0x451844 >>> _0x2ab79c;
        },
        'HDahn': function(_0x1d79ee, _0x4642bb) {
            return _0x1d79ee + _0x4642bb;
        },
        'LzNNV': function(_0x4e7c93, _0xf89d40) {
            return _0x4e7c93(_0xf89d40);
        },
        'iiVpi': function(_0xb960fa, _0xf463c) {
            return _0xb960fa(_0xf463c);
        },
        'DyzqP': function(_0x269a4e, _0x2c4762) {
            return _0x269a4e * _0x2c4762;
        },
        'kiGQQ': function(_0x266a67, _0x58ea41) {
            return _0x266a67 < _0x58ea41;
        },
        'QbYpJ': function(_0x32d0e4, _0x4ed47b) {
            return _0x32d0e4 < _0x4ed47b;
        },
        'JAWHp': function(_0x4e2455, _0x42e2c4) {
            return _0x4e2455 + _0x42e2c4;
        },
        'FjIUk': function(_0x4b6281, _0x25d16d) {
            return _0x4b6281 ^ _0x25d16d;
        },
        'QddEN': function(_0x4134a3, _0x102520) {
            return _0x4134a3 ^ _0x102520;
        },
        'GMYEG': function(_0x49a99b, _0x19b88b) {
            return _0x49a99b ^ _0x19b88b;
        },
        'fumQT': function(_0x4aaa7e, _0x67d23e) {
            return _0x4aaa7e - _0x67d23e;
        },
        'OBXZF': function(_0x54d561, _0x1fda6d) {
            return _0x54d561 | _0x1fda6d;
        },
        'kjvjR': function(_0x3f372a, _0x369915) {
            return _0x3f372a + _0x369915;
        },
        'gaTAt': function(_0x36391f, _0x286a1d) {
            return _0x36391f >>> _0x286a1d;
        },
        'PtTaG': function(_0x1b0f41, _0x3a1d33) {
            return _0x1b0f41 >>> _0x3a1d33;
        },
        'VSzoS': function(_0x1f7c95, _0x33bb4f) {
            return _0x1f7c95 & _0x33bb4f;
        },
        'fEwuO': function(_0x4be3b3, _0x276c20) {
            return _0x4be3b3 + _0x276c20;
        },
        'BWuqJ': function(_0x1d62c6, _0x4dabf4) {
            return _0x1d62c6 ^ _0x4dabf4;
        },
        'Lpfuc': function(_0x40caec, _0x127671) {
            return _0x40caec - _0x127671;
        },
        'OUGyN': function(_0x1ec0dd, _0x57bae3) {
            return _0x1ec0dd | _0x57bae3;
        },
        'TMqAw': function(_0x3426b4, _0x53507d) {
            return _0x3426b4 & _0x53507d;
        },
        'AZGei': function(_0xf39963, _0x571451) {
            return _0xf39963 | _0x571451;
        },
        'BmKIn': function(_0x87889f, _0xafb6a7) {
            return _0x87889f !== _0xafb6a7;
        },
        'CaqeM': 'IHdXZ',
        'tnAKq': 'yUVEs',
        'eCYad': 'MTfuu'
    };
    let _0x30957c = '', _0x39bf9a = _0x14e9cd, _0x8a637d = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    if (_0x5a3e57) {
        if (_0x246eb8['BmKIn'](_0x246eb8['CaqeM'], _0x246eb8['CaqeM'])) {
            var _0x14e623 = _0x246eb8['AJxuL']['split']('|'),
                _0x3d37b6 = 0x0;
            while ( !! []) {
                switch (_0x14e623[_0x3d37b6++]) {
                    case '0':
                        _0x5c13e7[_0x246eb8['Dbsnw'](_0x207247, 0x5)] |= 0x80 << _0x246eb8['QkbcW'](0x18, _0x246eb8['PCclX'](_0x207247, 0x20)),
                        _0x5c13e7[_0x246eb8['YXFak'](0xf, _0x246eb8['zlqgX'](_0x246eb8['ebLRE'](_0x246eb8['HDahn'](_0x207247, 0x40), 0x9), 0x4))] = _0x207247;
                        continue;
                    case '1':
                        return [_0x449093, _0x5eba36, _0xed3673, _0x30fa76, _0x13c89a];
                    case '2':
                        t = _0x246eb8['LzNNV'](_0x492c17, t);
                        continue;
                    case '3':
                        var _0x5c13e7 = _0x246eb8['iiVpi'](bytesToWords, t),
                            _0x207247 = _0x246eb8['DyzqP'](0x8, t['length']),
                            _0x5daa7f = [],
                            _0x449093 = 0x67452301,
                            _0x5eba36 = -0x10325477,
                            _0xed3673 = -0x67452302,
                            _0x30fa76 = 0x10325476,
                            _0x13c89a = -0x3c2d1e10;
                        continue;
                    case '4':
                        for (var _0x4dcfb4 = 0x0; _0x4dcfb4 < _0x5c13e7['length']; _0x4dcfb4 += 0x10) {
                            for (var _0x3dfabb = _0x449093, _0x302b34 = _0x5eba36, _0x15f9aa = _0xed3673, _0x53c51c = _0x30fa76, _0x41c128 = _0x13c89a, _0x196d20 = 0x0; _0x246eb8['kiGQQ'](_0x196d20, 0x50); _0x196d20++) {
                                if (_0x246eb8['QbYpJ'](_0x196d20, 0x10)) _0x5daa7f[_0x196d20] = _0x5c13e7[_0x246eb8['JAWHp'](_0x4dcfb4, _0x196d20)];
                                else {
                                    var _0x5b8e7c = _0x246eb8['FjIUk'](_0x246eb8['QddEN'](_0x246eb8['GMYEG'](_0x5daa7f[_0x246eb8['QkbcW'](_0x196d20, 0x3)], _0x5daa7f[_0x246eb8['QkbcW'](_0x196d20, 0x8)]), _0x5daa7f[_0x246eb8['fumQT'](_0x196d20, 0xe)]), _0x5daa7f[_0x196d20 - 0x10]);
                                    _0x5daa7f[_0x196d20] = _0x246eb8['OBXZF'](_0x5b8e7c << 0x1, _0x5b8e7c >>> 0x1f);
                                }
                                var _0x2701f8 = _0x246eb8['kjvjR'](_0x246eb8['kjvjR'](_0x246eb8['OBXZF'](_0x246eb8['zlqgX'](_0x449093, 0x5), _0x246eb8['gaTAt'](_0x449093, 0x1b)), _0x13c89a), _0x246eb8['PtTaG'](_0x5daa7f[_0x196d20], 0x0)) + (_0x246eb8['QbYpJ'](_0x196d20, 0x14) ? 0x5a827999 + _0x246eb8['OBXZF'](_0x5eba36 & _0xed3673, _0x246eb8['VSzoS'](~_0x5eba36, _0x30fa76)) : _0x196d20 < 0x28 ? _0x246eb8['fEwuO'](0x6ed9eba1, _0x246eb8['BWuqJ'](_0x246eb8['BWuqJ'](_0x5eba36, _0xed3673), _0x30fa76)) : _0x196d20 < 0x3c ? _0x246eb8['Lpfuc'](_0x246eb8['OUGyN'](_0x246eb8['OUGyN'](_0x246eb8['TMqAw'](_0x5eba36, _0xed3673), _0x246eb8['TMqAw'](_0x5eba36, _0x30fa76)), _0x246eb8['TMqAw'](_0xed3673, _0x30fa76)), 0x70e44324) : _0x246eb8['Lpfuc'](_0x5eba36 ^ _0xed3673 ^ _0x30fa76, 0x359d3e2a));
                                _0x13c89a = _0x30fa76,
                                _0x30fa76 = _0xed3673,
                                _0xed3673 = _0x246eb8['AZGei'](_0x246eb8['zlqgX'](_0x5eba36, 0x1e), _0x246eb8['PtTaG'](_0x5eba36, 0x2)),
                                _0x5eba36 = _0x449093,
                                _0x449093 = _0x2701f8;
                            }
                            _0x449093 += _0x3dfabb,
                            _0x5eba36 += _0x302b34,
                            _0xed3673 += _0x15f9aa,
                            _0x30fa76 += _0x53c51c,
                            _0x13c89a += _0x41c128;
                        }
                        continue;
                }
                break;
            }
        } else {
            _0x39bf9a = _0x246eb8['fEwuO'](Math['round'](_0x246eb8['DyzqP'](Math['random'](), _0x246eb8['Lpfuc'](_0x5c6201, _0x14e9cd))), _0x14e9cd);
        }
    }
    for (let _0x579cce = 0x0; _0x579cce < _0x39bf9a; _0x579cce++) {
        if (_0x246eb8['tnAKq'] === _0x246eb8['eCYad']) {
            var _0x19a303 = t[e],
                _0xbe175f = /[a-zA-Z]/ ['test'](_0x19a303);
            if (t['hasOwnProperty'](e)) if (_0xbe175f) n += _0x296732(_0x19a303);
            else n += _0x19a303;
        } else {
            pos = Math['round'](_0x246eb8['DyzqP'](Math['random'](), _0x8a637d['length'] - 0x1));
            _0x30957c += _0x8a637d[pos];
        }
    }
    return _0x30957c;
}

function _0x36e8da(_0x164f9b, _0x11098b) {
    return (Array(_0x11098b)['join']('0') + _0x164f9b)['slice'](-_0x11098b);
}

function _0x296732(_0x247c5b) {
    var _0x2d30f3 = _0x247c5b['charCodeAt'](0x0)['toString']();
    return _0x2d30f3[_0x2d30f3['length'] - 0x1];
}

function _0x492c17(_0x6fe761) {
    _0x6fe761 = unescape(encodeURIComponent(_0x6fe761));
    for (var _0x4613e3 = [], _0x55d77b = 0x0; _0x55d77b < _0x6fe761['length']; _0x55d77b++)
    _0x4613e3['push'](0xff & _0x6fe761['charCodeAt'](_0x55d77b));
    return _0x4613e3;
}

function _0x37a6aa(_0x9f40d3) {
    var _0xc223b4 = {
        'bFDjm': function(_0x3a95fa, _0x5899d0) {
            return _0x3a95fa + _0x5899d0;
        },
        'AHpKF': function(_0x3d56ce, _0x4436a7) {
            return _0x3d56ce - _0x4436a7;
        },
        'XrdsW': function(_0x308a26, _0x8c366c) {
            return _0x308a26 ^ _0x8c366c;
        },
        'iRNjg': function(_0x3ead64, _0x1f18fe) {
            return _0x3ead64 < _0x1f18fe;
        },
        'MdjrP': function(_0x5bf48b, _0x299607) {
            return _0x5bf48b & _0x299607;
        },
        'kTshg': function(_0xfc8d9b, _0x5c5c47) {
            return _0xfc8d9b | _0x5c5c47;
        },
        'HLgKD': function(_0x2d12ab, _0x356820) {
            return _0x2d12ab << _0x356820;
        },
        'zFVgN': function(_0xf70724, _0x431262) {
            return _0xf70724 - _0x431262;
        },
        'NFXHB': function(_0x3c9bee, _0x3f731e) {
            return _0x3c9bee * _0x3f731e;
        },
        'TYvmE': function(_0x4bc9fe, _0x31a953) {
            return _0x4bc9fe - _0x31a953;
        },
        'ldqsK': function(_0x4e166e, _0x5e1bfd) {
            return _0x4e166e < _0x5e1bfd;
        },
        'wRYnR': function(_0x388a41, _0x4abb34) {
            return _0x388a41 === _0x4abb34;
        },
        'Geimp': 'UszxO',
        'EAAYv': 'BjaoJ',
        'Kvzjn': function(_0x50257c, _0x579a51) {
            return _0x50257c < _0x579a51;
        },
        'MxiWL': 'GNqMB',
        'BJGcH': function(_0x40a4ff, _0xacd3ad) {
            return _0x40a4ff | _0xacd3ad;
        },
        'CKsbW': function(_0x3d0216, _0x4998af) {
            return _0x3d0216 >> _0x4998af;
        },
        'vzjDv': function(_0x4ef9f8, _0x414884) {
            return _0x4ef9f8 & _0x414884;
        },
        'AFkCt': function(_0x12ae06, _0x155687) {
            return _0x12ae06(_0x155687);
        },
        'nrgzW': function(_0x1c1dbc, _0xa06115) {
            return _0x1c1dbc < _0xa06115;
        },
        'jwnlL': function(_0x50da32, _0xbaca9e) {
            return _0x50da32 ^ _0xbaca9e;
        },
        'EkTLg': function(_0x523c74, _0x3f8a7a) {
            return _0x523c74 & _0x3f8a7a;
        },
        'ZoeCp': function(_0x420891, _0x58cfa9) {
            return _0x420891 >>> _0x58cfa9;
        }
    };

    function _0x577ce3(_0x115ee8) {
        var _0x3ca9cf = {
            'cYqyv': function(_0x4618aa, _0x491309) {
                return _0xc223b4['bFDjm'](_0x4618aa, _0x491309);
            },
            'YITZr': function(_0x3a6cae, _0x57180b) {
                return _0xc223b4['AHpKF'](_0x3a6cae, _0x57180b);
            },
            'YmKFs': function(_0x29414e, _0x5089da) {
                return _0x29414e < _0x5089da;
            },
            'ODygq': function(_0x515a5b, _0x3c81a2) {
                return _0x515a5b + _0x3c81a2;
            },
            'AMjdt': function(_0xd58b55, _0xbd65a4) {
                return _0xc223b4['XrdsW'](_0xd58b55, _0xbd65a4);
            },
            'hYOIf': function(_0x14c0be, _0x6980d9) {
                return _0x14c0be - _0x6980d9;
            },
            'TZicU': function(_0x5d9935, _0x3ea097) {
                return _0x5d9935 + _0x3ea097;
            },
            'quAvl': function(_0x533bf7, _0x322cc0) {
                return _0x533bf7 | _0x322cc0;
            },
            'JjJJx': function(_0x3a2046, _0x56df5d) {
                return _0x3a2046 << _0x56df5d;
            },
            'huUzX': function(_0x1e4684, _0x306cca) {
                return _0x1e4684 >>> _0x306cca;
            },
            'tVKXk': function(_0x2958da, _0xb97a34) {
                return _0xc223b4['iRNjg'](_0x2958da, _0xb97a34);
            },
            'JcTTg': function(_0x22e90d, _0x227433) {
                return _0xc223b4['MdjrP'](_0x22e90d, _0x227433);
            },
            'TpHCm': function(_0x4abc0a, _0x36ff74) {
                return _0xc223b4['XrdsW'](_0x4abc0a, _0x36ff74);
            },
            'nVfQO': function(_0xc13c2d, _0x582867) {
                return _0xc223b4['kTshg'](_0xc13c2d, _0x582867);
            },
            'FZqxk': function(_0xd776fd, _0x4971c1) {
                return _0xd776fd ^ _0x4971c1;
            },
            'DYHVB': function(_0x36d052, _0x48d51c) {
                return _0xc223b4['XrdsW'](_0x36d052, _0x48d51c);
            },
            'Xzlqe': function(_0x317558, _0x519d35) {
                return _0xc223b4['HLgKD'](_0x317558, _0x519d35);
            },
            'iFtgP': function(_0x55b295, _0x1f194d) {
                return _0xc223b4['zFVgN'](_0x55b295, _0x1f194d);
            },
            'eUrnD': function(_0x50d416, _0x39f89e) {
                return _0xc223b4['NFXHB'](_0x50d416, _0x39f89e);
            },
            'Gokrz': function(_0x573bf9, _0x7b6d9b) {
                return _0xc223b4['TYvmE'](_0x573bf9, _0x7b6d9b);
            }
        };
        _0x115ee8 = _0x115ee8['replace'](/\r\n/g, '\x0a');
        var _0x16554e = '';
        for (var _0x49a2ae = 0x0; _0xc223b4['ldqsK'](_0x49a2ae, _0x115ee8['length']); _0x49a2ae++) {
            if (_0xc223b4['wRYnR'](_0xc223b4['Geimp'], _0xc223b4['EAAYv'])) {
                range = _0x3ca9cf['cYqyv'](Math['round'](Math['random']() * _0x3ca9cf['YITZr'](max, min)), min);
            } else {
                var _0x16c125 = _0x115ee8['charCodeAt'](_0x49a2ae);
                if (_0xc223b4['Kvzjn'](_0x16c125, 0x80)) {
                    if (_0xc223b4['MxiWL'] !== 'GNqMB') {
                        for (var _0x196626 = s, _0x6e1cae = u, _0x23cbc2 = _0x16c125, _0x3e8f57 = f, _0x4b94ff = h, _0x42a4e6 = 0x0; _0x3ca9cf['YmKFs'](_0x42a4e6, 0x50); _0x42a4e6++) {
                            if (_0x42a4e6 < 0x10) a[_0x42a4e6] = e[_0x3ca9cf['ODygq'](l, _0x42a4e6)];
                            else {
                                var _0x5a28ff = _0x3ca9cf['AMjdt'](a[_0x3ca9cf['hYOIf'](_0x42a4e6, 0x3)] ^ a[_0x3ca9cf['hYOIf'](_0x42a4e6, 0x8)], a[_0x42a4e6 - 0xe]) ^ a[_0x42a4e6 - 0x10];
                                a[_0x42a4e6] = _0x5a28ff << 0x1 | _0x5a28ff >>> 0x1f;
                            }
                            var _0x29e50a = _0x3ca9cf['ODygq'](_0x3ca9cf['ODygq'](_0x3ca9cf['TZicU'](_0x3ca9cf['quAvl'](_0x3ca9cf['JjJJx'](s, 0x5), s >>> 0x1b), h), _0x3ca9cf['huUzX'](a[_0x42a4e6], 0x0)), _0x3ca9cf['tVKXk'](_0x42a4e6, 0x14) ? _0x3ca9cf['TZicU'](0x5a827999, _0x3ca9cf['quAvl'](_0x3ca9cf['JcTTg'](u, _0x16c125), _0x3ca9cf['JcTTg'](~u, f))) : _0x3ca9cf['tVKXk'](_0x42a4e6, 0x28) ? _0x3ca9cf['TZicU'](0x6ed9eba1, _0x3ca9cf['TpHCm'](u ^ _0x16c125, f)) : _0x42a4e6 < 0x3c ? _0x3ca9cf['hYOIf'](_0x3ca9cf['nVfQO'](_0x3ca9cf['JcTTg'](u, _0x16c125), _0x3ca9cf['JcTTg'](u, f)) | _0x3ca9cf['JcTTg'](_0x16c125, f), 0x70e44324) : _0x3ca9cf['FZqxk'](_0x3ca9cf['DYHVB'](u, _0x16c125), f) - 0x359d3e2a);
                            h = f,
                            f = _0x16c125,
                            _0x16c125 = _0x3ca9cf['nVfQO'](_0x3ca9cf['Xzlqe'](u, 0x1e), u >>> 0x2),
                            u = s,
                            s = _0x29e50a;
                        }
                        s += _0x196626,
                        u += _0x6e1cae,
                        _0x16c125 += _0x23cbc2,
                        f += _0x3e8f57,
                        h += _0x4b94ff;
                    } else {
                        _0x16554e += String['fromCharCode'](_0x16c125);
                    }
                } else if (_0x16c125 > 0x7f && _0x16c125 < 0x800) {
                    _0x16554e += String['fromCharCode'](_0xc223b4['BJGcH'](_0xc223b4['CKsbW'](_0x16c125, 0x6), 0xc0));
                    _0x16554e += String['fromCharCode'](_0xc223b4['BJGcH'](_0xc223b4['vzjDv'](_0x16c125, 0x3f), 0x80));
                } else {
                    if ('VxSlu' !== 'LMRBy') {
                        _0x16554e += String['fromCharCode'](_0xc223b4['CKsbW'](_0x16c125, 0xc) | 0xe0);
                        _0x16554e += String['fromCharCode'](_0xc223b4['BJGcH'](_0xc223b4['vzjDv'](_0x16c125 >> 0x6, 0x3f), 0x80));
                        _0x16554e += String['fromCharCode'](_0xc223b4['BJGcH'](_0xc223b4['vzjDv'](_0x16c125, 0x3f), 0x80));
                    } else {
                        let _0x5273f7 = '', _0x19adaa = min, _0x350057 = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
                        if (randomFlag) {
                            _0x19adaa = _0x3ca9cf['TZicU'](Math['round'](Math['random']() * _0x3ca9cf['iFtgP'](max, min)), min);
                        }
                        for (let _0x110cba = 0x0; _0x110cba < _0x19adaa; _0x110cba++) {
                            pos = Math['round'](_0x3ca9cf['eUrnD'](Math['random'](), _0x3ca9cf['Gokrz'](_0x350057['length'], 0x1)));
                            _0x5273f7 += _0x350057[pos];
                        }
                        return _0x5273f7;
                    }
                }
            }
        }
        return _0x16554e;
    };
    _0x9f40d3 = _0xc223b4['AFkCt'](_0x577ce3, _0x9f40d3);
    var _0x5ba5d0 = [0x0, 0x77073096, 0xee0e612c, 0x990951ba, 0x76dc419, 0x706af48f, 0xe963a535, 0x9e6495a3, 0xedb8832, 0x79dcb8a4, 0xe0d5e91e, 0x97d2d988, 0x9b64c2b, 0x7eb17cbd, 0xe7b82d07, 0x90bf1d91, 0x1db71064, 0x6ab020f2, 0xf3b97148, 0x84be41de, 0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7, 0x136c9856, 0x646ba8c0, 0xfd62f97a, 0x8a65c9ec, 0x14015c4f, 0x63066cd9, 0xfa0f3d63, 0x8d080df5, 0x3b6e20c8, 0x4c69105e, 0xd56041e4, 0xa2677172, 0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b, 0x35b5a8fa, 0x42b2986c, 0xdbbbc9d6, 0xacbcf940, 0x32d86ce3, 0x45df5c75, 0xdcd60dcf, 0xabd13d59, 0x26d930ac, 0x51de003a, 0xc8d75180, 0xbfd06116, 0x21b4f4b5, 0x56b3c423, 0xcfba9599, 0xb8bda50f, 0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924, 0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d, 0x76dc4190, 0x1db7106, 0x98d220bc, 0xefd5102a, 0x71b18589, 0x6b6b51f, 0x9fbfe4a5, 0xe8b8d433, 0x7807c9a2, 0xf00f934, 0x9609a88e, 0xe10e9818, 0x7f6a0dbb, 0x86d3d2d, 0x91646c97, 0xe6635c01, 0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e, 0x6c0695ed, 0x1b01a57b, 0x8208f4c1, 0xf50fc457, 0x65b0d9c6, 0x12b7e950, 0x8bbeb8ea, 0xfcb9887c, 0x62dd1ddf, 0x15da2d49, 0x8cd37cf3, 0xfbd44c65, 0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2, 0x4adfa541, 0x3dd895d7, 0xa4d1c46d, 0xd3d6f4fb, 0x4369e96a, 0x346ed9fc, 0xad678846, 0xda60b8d0, 0x44042d73, 0x33031de5, 0xaa0a4c5f, 0xdd0d7cc9, 0x5005713c, 0x270241aa, 0xbe0b1010, 0xc90c2086, 0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f, 0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4, 0x59b33d17, 0x2eb40d81, 0xb7bd5c3b, 0xc0ba6cad, 0xedb88320, 0x9abfb3b6, 0x3b6e20c, 0x74b1d29a, 0xead54739, 0x9dd277af, 0x4db2615, 0x73dc1683, 0xe3630b12, 0x94643b84, 0xd6d6a3e, 0x7a6a5aa8, 0xe40ecf0b, 0x9309ff9d, 0xa00ae27, 0x7d079eb1, 0xf00f9344, 0x8708a3d2, 0x1e01f268, 0x6906c2fe, 0xf762575d, 0x806567cb, 0x196c3671, 0x6e6b06e7, 0xfed41b76, 0x89d32be0, 0x10da7a5a, 0x67dd4acc, 0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5, 0xd6d6a3e8, 0xa1d1937e, 0x38d8c2c4, 0x4fdff252, 0xd1bb67f1, 0xa6bc5767, 0x3fb506dd, 0x48b2364b, 0xd80d2bda, 0xaf0a1b4c, 0x36034af6, 0x41047a60, 0xdf60efc3, 0xa867df55, 0x316e8eef, 0x4669be79, 0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236, 0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f, 0xc5ba3bbe, 0xb2bd0b28, 0x2bb45a92, 0x5cb36a04, 0xc2d7ffa7, 0xb5d0cf31, 0x2cd99e8b, 0x5bdeae1d, 0x9b64c2b0, 0xec63f226, 0x756aa39c, 0x26d930a, 0x9c0906a9, 0xeb0e363f, 0x72076785, 0x5005713, 0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0xcb61b38, 0x92d28e9b, 0xe5d5be0d, 0x7cdcefb7, 0xbdbdf21, 0x86d3d2d4, 0xf1d4e242, 0x68ddb3f8, 0x1fda836e, 0x81be16cd, 0xf6b9265b, 0x6fb077e1, 0x18b74777, 0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c, 0x8f659eff, 0xf862ae69, 0x616bffd3, 0x166ccf45, 0xa00ae278, 0xd70dd2ee, 0x4e048354, 0x3903b3c2, 0xa7672661, 0xd06016f7, 0x4969474d, 0x3e6e77db, 0xaed16a4a, 0xd9d65adc, 0x40df0b66, 0x37d83bf0, 0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9, 0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6, 0xbad03605, 0xcdd70693, 0x54de5729, 0x23d967bf, 0xb3667a2e, 0xc4614ab8, 0x5d681b02, 0x2a6f2b94, 0xb40bbe37, 0xc30c8ea1, 0x5a05df1b, 0x2d02ef8d];
    var _0x250abb = 0x0;
    var _0x3a6852 = 0x0;
    _0x3a6852 = _0xc223b4['XrdsW'](_0x3a6852, -0x1);
    for (var _0x8af020 = 0x0, _0xc611eb = _0x9f40d3['length']; _0xc223b4['nrgzW'](_0x8af020, _0xc611eb); _0x8af020++) {
        _0x250abb = _0x9f40d3['charCodeAt'](_0x8af020);
        _0x3a6852 = _0xc223b4['jwnlL'](_0x5ba5d0[_0xc223b4['EkTLg'](0xff, _0x3a6852 ^ _0x250abb)], _0xc223b4['ZoeCp'](_0x3a6852, 0x8));
    }
    return (-0x1 ^ _0x3a6852) >>> 0x0;
}

function keyjiami(e) {
    return _e(e)["toString"]()["toUpperCase"]();
}

function _e(e, t) {
    return e = wordsToBytes(function(e) {
        e = Array.prototype.slice.call(stringToBytes(e), 0)
        var t = bytesToWords(e),
            n = [],
            r = 1732584193,
            a = -271733879,
            o = -1732584194,
            i = 271733878,
            s = -1009589776;
        t[(e = 8 * e.length) >> 5] |= 128 << 24 - e % 32,
        t[15 + (64 + e >>> 9 << 4)] = e;
        for (var u = 0; u < t.length; u += 16) {
            for (var c = r, l = a, d = o, f = i, p = s, m = 0; m < 80; m++) {
                m < 16 ? n[m] = t[u + m] : (h = n[m - 3] ^ n[m - 8] ^ n[m - 14] ^ n[m - 16],
                n[m] = h << 1 | h >>> 31);
                var h = (r << 5 | r >>> 27) + s + (n[m] >>> 0) + (m < 20 ? 1518500249 + (a & o | ~a & i) : m < 40 ? 1859775393 + (a ^ o ^ i) : m < 60 ? (a & o | a & i | o & i) - 1894007588 : (a ^ o ^ i) - 899497514),
                    s = i,
                    i = o,
                    o = a << 30 | a >>> 2,
                    a = r,
                    r = h
            }
            r += c,
            a += l,
            o += d,
            i += f,
            s += p
        }
        return [r, a, o, i, s]
    }(e)), bytesToHex(e)
}

function wordsToBytes(e) {
    for (var t = [], n = 0; n < 32 * e.length; n += 8)
    t.push(e[n >>> 5] >>> 24 - n % 32 & 255);
    return t
}

function stringToBytes(e) {
    e = unescape(encodeURIComponent(e))
    for (var t = [], n = 0; n < e.length; n++)
    t.push(255 & e.charCodeAt(n));
    return t
}

function bytesToWords(e) {
    for (var t = [], n = 0, r = 0; n < e.length; n++, r += 8)
    t[r >>> 5] |= e[n] << 24 - r % 32;
    return t
}

function bytesToHex(e) {
    for (var t = [], n = 0; n < e.length; n++)
    t.push((e[n] >>> 4).toString(16)),
    t.push((15 & e[n]).toString(16));
    return t.join("")
}

function getkey(e, t) {
    try {
        for (var i = t["toString"](), s = e.split("")["reverse"]()["join"]("")["slice"](0, 5), u = (String(t) + "000000")["slice"](0, 13)["slice"](-5), c = "", l = 0;
        (l < s["length"]); l++)
        ("PLKft" !== "PLKft") || (c += "" ["concat"](s["charAt"](l))["concat"](u["charAt"](l)));
        c += c["slice"](0, (i["length"] - c["length"]));
        for (var d = [], f = 0;
        (f < i.length); f++) {
            var p = (i["charCodeAt"](f) ^ c["charCodeAt"](f))["toString"](16);
            d.push(p)
        }
        return d["join"]("")
    } catch (e) {
        return null
    }
}

function _zhuanzifu(canshu1, canshu2) {
    for (var _0x2ddc2d = canshu2['length'], _0x1117fa = '', ju_i = 0x0; ju_i < canshu1['length']; ju_i++)
    _0x1117fa += String['fromCharCode'](canshu1[ju_i]['charCodeAt']() ^ canshu2[ju_i % _0x2ddc2d]['charCodeAt']());
    return _0x1117fa;
}

function getBody(_random) {
    if (_random == "") {
        _random = 53554918;
    }
    let _suijizifu = _0x3ae16b(![], 0xa);
    //let _time = Date['now']();
    let _key = getkey(_suijizifu, _time['toString']());
    let _cankey = 'random=' + _random + '&token=' + _joyytoken + '&time=' + _time + '&nonce_str=' + _suijizifu + '&key=' + _key + '&is_trust=1';
    let _keyjiami = keyjiami(_cankey)['toUpperCase']();
    let _0x1e9fe6 = _0x37a6aa(_keyjiami)['toString'](0x24);
    _0x1e9fe6 = _0x36e8da(_0x1e9fe6, 0x7);
    //let _data = '{"tm":[],"tnm":["d5-6L,ES,2EY,1.000,t","d7-6L,ES,2GB,1.000,t","d1-6M,ES,2H8,u,t"],"grn":1,"ss":"' + _time['toString']() + '5987","wed":"tttttfuf","wea":"ffttttua","pdn":[8,16,2,3,1,5],"jj":1,"cs":"' + _cs + '","np":"Linux i686","t":' + _time['toString']() + ',"jk":"' + _jk + '","fpb":"' + _fpb + '","nv":"Google Inc.","nav":"' + _nav + '","scr":[854,480],"ro":["' + _xinghao + '","android","' + _azbb + '","' + _rjbb + '","' + _nav + '","' + _uuid + '","a"],"ioa":"fffffftt","aj":"u","ci":"w3.2.4","cf_v":"01","bd":"random=' + _random + '","mj":[1,0,0],"blog":"a","msg":"a"}'
    let _data = pinjie
    let _jiamidata1 = CryptoJS['enc']['Utf8']['parse'](unescape(encodeURIComponent(_zhuanzifu(_data, _key))));
    _jiamidata1 = CryptoJS['enc']['Base64']['stringify'](_jiamidata1);
    let _0x2f3398 = _0x37a6aa(_jiamidata1)['toString'](0x24);
    _0x2f3398 = _0x36e8da(_0x2f3398, 0x7);
    _keyjiami = _time['toString']() + '~1' + _suijizifu + _joyytoken + '~9,1~' + _keyjiami + '~' + _0x1e9fe6 + '~C~' + _jiamidata1 + '~' + _0x2f3398;
    s = JSON['stringify']({
        'extraData': {
            'log': encodeURIComponent(_keyjiami),
            'sceneid': _sceneid
        },
        'secretp': _secretp,
        'random': _random['toString']()
    });
    if (_ss_log == '1') {
        return s;
    } else {
        return encodeURIComponent(_keyjiami);
    }
}

var _ss_log = '0',
    _cs = '',
    _fpb = '',
    _secretp = '',
    _sceneid = '',
    _joyytoken = $.joyytoken,
    _rjbb = '',
    _azbb = '',
    _uuid = '',
    _jk = '',
    _xinghao = '',
    _nav = '',
    _time = timestamp;
var pinjie = '{"tm":[],"tnm":["d5-69,DA,1IX,1.000,t","d7-69,DH,1JZ,1.000,t","d8-6A,DN,1RV,u,t"],"grn":1,"ss":"'+timestamp+'9250","wed":"tttttfuf","wea":"ffttttua","pdn":[9,41,2,3,1,5],"jj":1,"cs":"39710915a734dacc5dba2f8e8b964987","np":"Linux i686","t":1642319530621,"jk":"f78382db5b9f46445838e8bca26b6441","fpb":"016c95c8a80f4ab5ca3ffd8b1","nv":"Apple Computer, Inc.","nav":"727652","scr":[854,480],"ro":["iPhone10,1","iOS","11.3.3","10.1.8","727652","f78382db5b9f46445838e8bca26b6441","a"],"ioa":"fffffftt","aj":"u","ci":"w3.4.0","cf_v":"02","bd":"random=53554918","mj":[1,0,0],"blog":"a","msg":"a"}';

//console.log(getBody(53554918))
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
