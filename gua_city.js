/*
城城领现金

[task_local]
#城城领现金
0 0-23/5,22 6-9 1 * gua_city.js, tag=城城领现金, enabled=true

 */
const $ = new Env('城城领现金');
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const notify = $.isNode() ? require('./sendNotify') : '';
//自动抽奖 ，环境变量  JD_CITY_EXCHANGE
let exchangeFlag = $.getdata('JD_CITY_EXCHANGE') || "true";//是否开启自动抽奖，建议活动快结束开启，默认关闭
exchangeFlag = $.isNode() ? (process.env.JD_CITY_EXCHANGE ? process.env.JD_CITY_EXCHANGE : `${exchangeFlag}`) : ($.getdata('JD_CITY_EXCHANGE') ? $.getdata('JD_CITY_EXCHANGE') : `${exchangeFlag}`);
// 优先助力[助力池]
let helpShareFlag = "true";//是否优先助力[助力池]，默认是
helpShareFlag = $.isNode() ? (process.env.JD_CITY_HELPSHARE ? process.env.JD_CITY_HELPSHARE : `${helpShareFlag}`) : ($.getdata('JD_CITY_HELPSHARE') ? $.getdata('JD_CITY_HELPSHARE') : `${helpShareFlag}`);
$.whitelist = "";// 优先获取助力码的ckPin 用&隔开 pin值(填中文
$.whitelist = $.isNode() ? (process.env.JD_CITY_WHITELIST ? process.env.JD_CITY_WHITELIST : `${$.whitelist}`) : ($.getdata('JD_CITY_WHITELIST') ? $.getdata('JD_CITY_WHITELIST') : `${$.whitelist}`);


//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message;

if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
const JD_API_HOST = 'https://api.m.jd.com/client.action';
let inviteCodes = [
]
$.shareCodesArr = [];
$.toStatus = false
let token = ''
$.token = process.env.gua_log_token || token // token

!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
        return;
    }
    if(!$.token){
      console.log("填写log token[gua_log_token]")
      return
    }
    getWhitelist()
    console.log("\nTOKEN："+$.token.replace(/(.{5}).+(.{5})/, '$1***$2')+"\n")
    let urlArr = [
        // "http://127.0.0.1",
        "http://g.zxi7.cn",
        "https://jd.smiek.tk",
        "http://jd.smiek.ga",
    ]
    for(let i of urlArr){
        $.getSignUrl = i
        await toStatus()
        if($.toStatus) break
    }
    if(!$.toStatus){
        $.getSignUrl = ''
    }
    await requireConfig();
    if (helpShareFlag + "" == "true") {
        console.log('脚本优先助力[助力池] 如需开启优先助力[内部账号]，请设置环境变量  JD_CITY_HELPSHARE 为false\n')
    } else {
        console.log('脚本优先助力[内部账号] 如需开启优先助力[助力池]，请设置环境变量  JD_CITY_HELPSHARE 为true\n')
    }
    if (exchangeFlag + "" == "true") {
        console.log(`脚本自动抽奖`)
    } else {
        console.log(`脚本不会自动抽奖，建议活动快结束开启，默认关闭(在12.12日自动开启抽奖),如需自动抽奖请设置环境变量  JD_CITY_EXCHANGE 为true`);
    }
    $.collectAllCount = 5
    $.inviteIdCodesArr = {}
    for (let i = 0; i < cookiesArr.length && true; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.index = i + 1;
            await getUA()
            await getInviteId();
            await $.wait(3000)
            if(Object.getOwnPropertyNames($.inviteIdCodesArr).length >= $.collectAllCount) {
                console.log(`已获取超过${$.collectAllCount}个`)
                break
            }
        }
    }
    // let sssss = ''
    // for(let i in $.inviteIdCodesArr){
    //     sssss += $.inviteIdCodesArr[i]+"&";
    // }
    // console.log(sssss);
    // return
    if (Object.getOwnPropertyNames($.inviteIdCodesArr).length > 0) {
        for (let i = 0; i < cookiesArr.length && true; i++) {
            if (cookiesArr[i]) {
                cookie = cookiesArr[i];
                $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
                $.index = i + 1;
                let code = []
                for (let s = 0; s < cookiesArr.length && true; s++) {
                    if (s != $.index - 1 && $.inviteIdCodesArr[s]) code.push($.inviteIdCodesArr[s])
                }
                if (code.length > 0) $.shareCodesArr.push(code.join('@'))
            }
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
            await getUA()
            // await getInfo('')
            await shareCodesFormat()
            // continue
            $.joyytoken = ''
            $.uid = ''
            let noHelpCount = 0
            let isLogin = true
            $.joyytokenb = ($.getdata("jd_blog_joyytoken") && $.getdata("jd_blog_joyytoken")[$.UserName]) || ''
            for (let i = 0; i < $.newShareCodes.length && true; ++i) {
                console.log(`\n开始助力 【${$.newShareCodes[i]}】`)
                let res = await getInfo($.newShareCodes[i])
                if (res && res['data'] && res['data']['bizCode'] === 0) {
                    if(!res['data']['result']['toasts']){
                        console.log("\n\n无法助力")
                        noHelpCount++
                        if(noHelpCount > 1) break
                    }
                    if (res['data']['result']['toasts'] && res['data']['result']['toasts'][0] && res['data']['result']['toasts'][0]['status'] === '3') {
                        console.log(`助力次数已耗尽，跳出`)
                        break
                    }
                    if (res['data']['result']['toasts'] && res['data']['result']['toasts'][0]) {
                        console.log(`助力 【${$.newShareCodes[i]}】:${res.data.result.toasts[0].msg}`)
                    }
                }
                // {"code":410} 疑似黑ip
                if ((res && res['status'] && res['status'] === '3') || (res && res.data && res.data.bizCode === -11)) {
                    // 助力次数耗尽 || 黑号
                    break
                }
                if(/火爆|已有账号参与活动|结束/.test($.toStr(res, res))){
                    break
                }else if(/登陆失败/.test($.toStr(res, res))){
                    isLogin = false
                    break
                }
                await $.wait(3000)
            }
            if(!isLogin){
                continue
            }
            let jd_blog_joyytoken = $.getdata("jd_blog_joyytoken") || {}
            if($.joyytokenb){
              jd_blog_joyytoken[$.UserName] = $.joyytokenb
              $.setdata(jd_blog_joyytoken, 'jd_blog_joyytoken')
            }else if (jd_blog_joyytoken[$.UserName]){
              delete jd_blog_joyytoken[$.UserName]
              $.setdata(jd_blog_joyytoken, 'jd_blog_joyytoken')
            }
            // await getInfo($.newShareCodes[i], true)
            await getInviteInfo();//雇佣
            if (exchangeFlag + "" == "true") {
                const res = await city_lotteryAward();//抽奖
                if (res && res > 0) {
                    for (let i = 0; i < new Array(res).fill('').length; i++) {
                        if (i >= 20) {
                            console.log('抽奖次数达20次，退出抽奖')
                            break
                        }
                        await $.wait(1000)
                        await city_lotteryAward();//抽奖
                    }
                }
            } else {
                var times = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000)
                //默认1.9开启抽奖
                if ($.time("MM", times) == 1 && $.time("dd", times) >= 9) {
                    const res = await city_lotteryAward();//抽奖
                    if (res && res > 0) {
                        for (let i = 0; i < new Array(res).fill('').length; i++) {
                            await $.wait(1000)
                            await city_lotteryAward();//抽奖
                        }
                    }
                }
            }
            await $.wait(1000)
        }
    }
})()
    .catch((e) => {
        $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
        $.done();
    })

function taskPostUrl(functionId, body) {
    return {
        url: `${JD_API_HOST}`,
        body: `functionId=${functionId}&appid=signed_wh5&body=${(JSON.stringify(body))}&client=wh5&clientVersion=1.0.0`,
        headers: {
            'Cookie': ($.abcv ? $.abcv : "")+cookie,
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            "User-Agent": $.UA,
            "Referer":"https://bunearth.m.jd.com/",
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-cn',
            'Accept-Encoding': 'gzip, deflate, br',
        },
        timeout: 20000
    }
}

function getInviteId() {
    let body = { "lbsCity": "16", "realLbsCity": "1315", "inviteId": '', "headImg": "", "userName": "", "taskChannel": "1","location":"","safeStr":"" }
    return new Promise((resolve) => {
        $.post(taskPostUrl("city_getHomeDatav1", body), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        // if (inviteId) $.log(`\n助力结果:\n${data}\n`)
                        data = JSON.parse(data);
                        if (data.code === 0) {
                            if (data.data && data['data']['bizCode'] === 0) {
                                if (data.data && data.data.result.userActBaseInfo.inviteId) {
                                    if(data.data.result.userActBaseInfo.actStatus != 4){
                                        console.log(`\n【京东账号${$.index}（${$.UserName}）的${$.name}好友互助码】${data.data && data.data.result.userActBaseInfo.inviteId}\n`);
                                        $.inviteIdCodesArr[$.index - 1] = data.data.result.userActBaseInfo.inviteId
                                    }else{
                                        $.collectAllCount += 1
                                        console.log(`\n【账号${$.index}（${$.UserName}）】已领完所有现金\n【好友互助码】${data.data && data.data.result.userActBaseInfo.inviteId}`)
                                    }
                                }
                            } else {
                                console.log(`\n\n获取邀请码失败:${data.data.bizMsg}`)
                                if (data.data && !data.data.result.userActBaseInfo.inviteId) {
                                    console.log(`账号已黑，看不到邀请码\n`);
                                }
                            }
                        } else {
                            console.log(`\n\ncity_getHomeData失败:${JSON.stringify(data)}\n`)
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
async function getInfo(inviteId, flag = false) {
    let log = JSON.stringify(await getLogs("inviteId", { }))
    // let log = ''
    let body = { "lbsCity": "16", "realLbsCity": "1315", "inviteId": inviteId, "headImg": "", "userName": "", "taskChannel": "1" ,"location":"","safeStr":`${log}`}
    return new Promise((resolve) => {
        $.post(taskPostUrl("city_getHomeDatav1", body), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        // if (inviteId) $.log(`\n助力结果:\n${data}\n`)
                        data = JSON.parse(data);
                        if (data.code === 0) {
                            if (data.data && data['data']['bizCode'] === 0) {
                                console.log(`待提现:￥${data.data.result.userActBaseInfo.poolMoney}`)
                                for (let vo of data.data.result && data.data.result.popWindows || []) {
                                    if (vo && vo.type === "dailycash_second") {
                                        await receiveCash()
                                        await $.wait(1 * 1000)
                                    }
                                }
                                for (let vo of data.data.result && data.data.result.mainInfos || []) {
                                    if (vo && vo.remaingAssistNum === 0 && vo.status === "1") {
                                        // console.log(vo.roundNum)
                                        await receiveCash(vo.roundNum)
                                        await $.wait(1 * 1000)
                                    }
                                }
                                if (flag) {
                                    // console.log(data.data.result.taskInfo.taskDetailResultVo.taskVos)
                                    for (let vo of data.data.result && data.data.result.taskInfo.taskDetailResultVo.taskVos && false || []) {
                                        if (vo && vo.status == 1) {
                                            console.log(vo.taskName)
                                            // console.log(vo.roundNum)
                                            // await receiveCash(vo.roundNum)
                                            // await $.wait(2*1000)
                                        }
                                    }
                                }
                            } else {
                                console.log(`\n\n${inviteId ? '助力好友' : '获取邀请码'}失败:${data.data.bizMsg}`)
                                if (flag) {
                                    if (data.data && !data.data.result.userActBaseInfo.inviteId) {
                                        console.log(`账号已黑，看不到邀请码\n`);
                                    }
                                }
                            }
                        } else {
                            console.log(`\n\ncity_getHomeData失败:${JSON.stringify(data)}\n`)
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
function receiveCash(roundNum = '') {
    let body = { "cashType": 2 }
    if (roundNum) body = { "cashType": 1, "roundNum": roundNum }
    if (roundNum == -1) body = { "cashType": 4 }
    return new Promise((resolve) => {
        $.post(taskPostUrl("city_receiveCash", body), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        // console.log(`领红包结果${data}`);
                        data = JSON.parse(data);
                        if (data['data']['bizCode'] === 0) {
                            console.log(`获得 ${data.data.result.currentTimeCash} 元，共计 ${data.data.result.totalCash} 元`)
                        } else {
                            console.log(`领红包结果${data}`);
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
function getInviteInfo() {
    let body = {}
    return new Promise((resolve) => {
        $.post(taskPostUrl("city_masterMainData", body), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        // console.log(data)
                        data = JSON.parse(data);
                        if (data.data.result.masterData.actStatus == 2) {
                            console.log('领取赚赏金')
                            await receiveCash(-1)
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
function city_lotteryAward() {
    let body = {}
    return new Promise((resolve) => {
        $.post(taskPostUrl("city_lotteryAward", body), async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        try{
                            let res = $.toObj(data, data)
                            console.log("抽奖结果："+(res.data.result.hongbao ? "红包" : res.data.result.coupon ? "优惠券" : ""))
                            console.log((res.data.result.hongbao || res.data.result.coupon || data))
                        }catch(e){
                            console.log(`抽奖结果：${data}`);
                        }
                        data = JSON.parse(data);
                        if (data['data']['bizCode'] === 0) {
                            const lotteryNum = data['data']['result']['lotteryNum'];
                            resolve(lotteryNum);
                        }
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
function readShareCode() {
    if(!$.getSignUrl){
        return ''
    }
    console.log(`开始`)
    return new Promise(async resolve => {
        $.post({ url: `${$.getSignUrl}/city`, 'timeout': 10000 }, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`助力池 API请求失败，请检查网路重试`)
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
//格式化助力码
function shareCodesFormat() {
    return new Promise(async resolve => {
        // console.log(`第${$.index}个京东账号的助力码:::${$.shareCodesArr[$.index - 1]}`)
        $.newShareCodes = [];
        if (helpShareFlag + "" != "true") {
            if ($.shareCodesArr[$.index - 1]) {
                $.newShareCodes = $.shareCodesArr[$.index - 1].split('@');
            }
        }
        if (inviteCodes.length) $.newShareCodes = [...inviteCodes, ...$.newShareCodes]
        try {
            const readShareCodeRes = await readShareCode();
            if (readShareCodeRes && readShareCodeRes.code === 200) {
              $.newShareCodes = [...new Set([...$.newShareCodes, ...(readShareCodeRes.data || [])])];
            }
        } catch (e) {
            console.log(e);
        }
        console.log(`第${$.index}个京东账号将要助力的好友(前10条数据)${JSON.stringify($.newShareCodes.slice(0,10))}`)
        resolve();
    })
}
function requireConfig() {
    return new Promise(resolve => {
        console.log(`开始获取${$.name}配置文件\n`);
        //Node.js用户请在jdCookie.js处填写京东ck;
        let shareCodes = [];
        if ($.isNode()) {
            if (process.env.GUA_CITY_SHARECODES) {
                if (process.env.GUA_CITY_SHARECODES.indexOf('\n') > -1) {
                    shareCodes = process.env.GUA_CITY_SHARECODES.split('\n');
                } else {
                    shareCodes = process.env.GUA_CITY_SHARECODES.split('&');
                }
            }
        }
        $.shareCodesArr = [];
        if ($.isNode()) {
            Object.keys(shareCodes).forEach((item) => {
                if (shareCodes[item]) {
                    inviteCodes.push(shareCodes[item])
                }
            })
        }
        console.log(`您提供了${inviteCodes.length}个账号的${$.name}助力码\n`);
        resolve()
    })
}
async function getLogs(functionId, body = {}) {
    if(!$.getSignUrl){
        return {
            ...body,
            "log":-1,
            "sceneid":"CHFhPageh5",
            "random":""
        }
    }
    let num = ''
    let log = ''
    let res = ''
    let joyytoken = ''
    let joyytokenb = ''
    if (!$.joyytoken) {
        // $.joyytoken = await gettoken("50074")
        $.joyytoken = ""
    }
    joyytoken = $.joyytoken
    if (!$.joyytokenb) {
        $.joyytokenb = await gettoken("50999")
    }
    joyytokenb = $.joyytokenb
    let resBody = { "fn": "city1", "id": functionId, "riskData": '', "pin": $.UserName, "joyytoken": joyytoken, "uid": $.uid || "", "joyytokenb": joyytokenb }
    let log_res = await getLog(resBody)
    res = log_res.data
    let resCount = 0
    while (!res && resCount <= 4) {
        resCount++
        console.log(`重新获取算法 第${resCount}次`)
        log_res = await getLog(resBody)
        res = log_res.data
        await $.wait(2000)
    }
    
    if (!res) {
        console.log('获取不到算法')
        process.exit(1)
    }
    if (res.joyytoken) {
        $.joyytoken = res.joyytoken
    }
    if (res.ua) {
        $.UA = res.ua
    }
    if (res.uid) {
        $.uid = res.uid
    }
    if (res.abcv) {
        $.abcv = res.abcv
    }
    log = res.log || -1
    num = res.random || ''
    return {
        ...body,
        "log":log,
        "sceneid":"CHFhPageh5",
        "random":num
    }
}
function gettoken(appname) {
    return new Promise(resolve => {
        let body = `content={"appname":"50074","whwswswws":"","jdkey":"a","body":{"platform":"1"}}`
        if (appname != "50074") {
            body = `content={"appname":"50999","whwswswws":"","jdkey":"a","body":{"platform":"2"}}`
        }
        opts = {
            url: `https://rjsb-token-m.jd.com/gettoken`,
            headers: {
                "accept": "*/*",
                "Origin": "https://bunearth.m.jd.com",
                "Referer": "https://bunearth.m.jd.com/",
                "User-Agent": $.UA,
            },
            body: body
        }
        let msg = ''
        $.post(opts, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${$.toStr(err, err)}`)
                    console.log(`gettoken API请求失败，请检查网路重试`)
                } else {
                    let res = $.toObj(data, data);
                    if (typeof res == 'object') {
                        if (res.joyytoken) {
                            msg = res.joyytoken
                        } else {
                            console.log(data)
                        }
                    } else {
                        console.log(data)
                    }
                }
            } catch (e) {
                console.log(e, resp)
            } finally {
                resolve(msg);
            }
        })
    })
}
//log算法
async function getLog(body) {
    return new Promise(resolve => {
        let options = {
            url: `${$.getSignUrl}/jdlog`,
            body: JSON.stringify({ "token": $.token, "body": body }),
            headers: {
                "Content-Type": "application/json",
            },
            timeout: 30000
        }
        let msg = ''
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} 算法 API请求失败，请检查网路重试`)
                } else {
                    data = $.toObj(data, data);
                    if (data && data.code && data.code == 200) {
                        msg = data
                        if (data.msg && data.msg != "success") {
                            console.log(data.msg)
                            if (/次数不够/.test(data.msg)) process.exit(1)
                        }
                    }
                }
            } catch (e) {
                console.log(e)
            } finally {
                resolve(msg);
            }
        })
    })
}
function toStatus() {
    return new Promise(resolve => {
        let get = {
            url: `${$.getSignUrl}/to_status`,
            timeout: 10000
        }
        $.get(get, async (err, resp, data) => {
            try {
                if (err) {
                    $.getSignErr = err
                    // console.log(`${$.toStr(err)}`)
                    // console.log(`${$.name} 连接服务器 API请求失败，请检查网路重试`)
                } else {
                    let res = $.toObj(data, data)
                    if (res && typeof res == 'object') {
                        if (res.msg === "success") {
                            $.toStatus = true
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
function getUA() {
    $.UA = `jdapp;iPhone;10.2.0;14.3;${randomString(40)};M/5.0;network/wifi;ADID/;model/iPhone12,1;addressid/;appBuild/167853;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;`
}
function randomString(e) {
    e = e || 32;
    let t = "abcdef0123456789", a = t.length, n = "";
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
// 数组置顶移动
function toFirst(arr, index){
    if (index != 0) {
        arr.unshift(arr.splice(index, 1)[0])
    }
}
/**
 * 白名单
 */
function getWhitelist(){
    if($.whitelist == '') return
    console.log('------- 白名单 -------')
    const result = Array.from(new Set($.whitelist.split('&'))) // 数组去重
    console.log(`${result.join('\n')}`)
    let arr = $.toObj($.toStr(cookiesArr,cookiesArr))
    let whitelistArr = result
    let g = false
    for(let n in whitelistArr){
        let m = whitelistArr[whitelistArr.length - 1 - n]
        if(!m) continue
        for(let i in arr){
            let s = decodeURIComponent(arr[i].match(/pt_pin=([^; ]+)(?=;?)/) && arr[i].match(/pt_pin=([^; ]+)(?=;?)/)[1])
            if(m == s){
                g = true
                toFirst(arr, i)
            }
        }
    }
    if(g) cookiesArr = arr
}
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
