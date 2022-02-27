/**
 东东电竞经理:脚本更新地址 jd_EsportsManager.js
 更新时间：2021-06-20
 活动入口：京东APP-东东农场-风车-电竞经理
 活动链接：https://xinruidddj-isv.isvjcloud.com
 [Script]
 cron "20 0-23/2 * * *" script-path=jd_EsportsManager.js,tag=东东电竞经理
 按顺序给第(Math.floor((index - 1) / 6) + 1)个账号助力
 可能有BUG，但不会给别人号助力
 */

const $ = new Env('东东电竞经理');
let cookiesArr = [], cookie = '', isBox = false, notify, newShareCodes, allMessage = '';
let tasks = [], shareCodes = [], first = true;

!(async () => {
    await requireConfig();
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        return;
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
            $.shareCode = await makeShareCode();
            await TotalBean();
            console.log(`\n开始【京东账号${$.index}】${$.nickName || $.UserName}\n`);
            if (!$.isLogin) {
                $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
                if ($.isNode()) {
                    await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                }
                continue
            }
            message = '';
            subTitle = '';
            option = {};
            await getIsvToken();
            await getIsvToken2();
            await getToken();

            let r = await get_produce_coins();
            if (r !== 200)
                continue

            await $.wait(2000);
            await main();
            await $.wait(3000)
        }
    }
    if ($.isNode() && allMessage && $.ctrTemp) {
        await notify.sendNotify(`${$.name}`, `${allMessage}`)
    }
})()

async function main() {
  tasks = await detail();
  for (let i = 0; i < tasks.length; i++) {
    let product_info_vos = []
    let task_vos = tasks[i]
    switch (task_vos.task_name) {
      case '连签得金币':
        if (task_vos.status === '1')
          await do_task(task_vos.simple_record_info_vo.task_token, task_vos.task_id, task_vos.task_type)
        continue
      case '邀请好友助力':
        await getShareCode(task_vos.assist_task_detail_vo.task_token)
        await $.wait(2000)

        await getAssist()
        await $.wait(2000)

        console.log(`第${$.index}个账号${$.UserName}去助力第${Math.floor(($.index - 1) / 6) + 1}个账号。`)
        await doAssist()
        continue
      case '去浏览精彩会场': case '去关注特色频道' :
        product_info_vos = task_vos['shopping_activity_vos']
        break
      case '去关注优质好店':
        product_info_vos = task_vos['follow_shop_vo']
        break
      default:
        ""
    }
    let taskId = task_vos.task_id, taskType = task_vos.task_type;
     for (let t of product_info_vos) {
       if (t.status === '1') {
         console.log(`开始任务：${task_vos.task_name}`)
         let res = await do_task(t.task_token, taskId, taskType)
         await $.wait(1000)
       }
     }
  }
}

function getShareCode(token) {
    return new Promise(resolve => {
        $.get({
            url: 'https://xinruidddj-isv.isvjcloud.com/api/uc/user',
            headers: {
                'Host': 'xinruidddj-isv.isvjcloud.com',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
                'Authorization': `Bearer ${$.token}`,
                'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;10.0.2;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
                'Accept-Language': 'zh-cn',
            }
        }, (err, resp, data) => {
            try {
                data = $.toObj(data)
                shareCodes.push({
                    'tid': token,
                    'uid': data.body.openid
                })
                console.log(`\n【京东账号${$.index}（${$.UserName}）的${$.name}好友互助码】${shareCodes[$.index - 1].uid}\n`);

            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function doAssist() {
    return new Promise(resolve => {
        $.post({
            url: 'https://xinruidddj-isv.isvjcloud.com/api/task/do_assist_task',
            headers: {
                'Host': 'xinruidddj-isv.isvjcloud.com',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
                'Authorization': `Bearer ${$.token}`,
                'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;10.0.2;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
                'Accept-Language': 'zh-cn',
            },
            body: `token=${shareCodes[Math.floor(($.index - 1) / 6)].tid}&inviter=${Math.floor(($.index - 1) / 6).uid}`
        }, (err, resp, data) => {
            try {
                data = $.toObj(data)
                if (data.status === '0') {
                    console.log('助力成功')
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function getAssist() {
    return new Promise(resolve => {
        $.get({
            url: 'https://xinruidddj-isv.isvjcloud.com/api/task/today_assist?task_id=2&need_num=10',
            headers: {
                'Host': 'xinruidddj-isv.isvjcloud.com',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
                'Authorization': `Bearer ${$.token}`,
                'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;10.0.2;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
                'Accept-Language': 'zh-cn',
            }
        }, (err, resp, data) => {
            try {
                data = $.toObj(data)
                console.log(`今日共收到${data.body.length}个助力`)
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function getIsvToken() {
    let config = {
        url: 'https://api.m.jd.com/client.action?functionId=genToken&clientVersion=10.0.2&client=android&uuid=818aa057737ba6a4&st=1623934987178&sign=0877498be29cda51b9628fa0195f412f&sv=111',
        body: `body=${escape('{"action":"to","to":"https%3A%2F%2Fh5.m.jd.com%2FbabelDiy%2FZeus%2F3KSjXqQabiTuD1cJ28QskrpWoBKT%2Findex.html%3FbabelChannel%3D45%26collectionId%3D519"}')}`,
        headers: {
            'Host': 'api.m.jd.com',
            'charset': 'UTF-8',
            'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;10.0.2;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'cookie': cookie
        }
    }
    return new Promise(resolve => {
        $.post(config, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                    console.log(`${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data);
                    $.isvToken = data['tokenKey'];
                    console.log(`isvToken:${$.isvToken}`);
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function getIsvToken2() {
    let config = {
        url: 'https://api.m.jd.com/client.action?functionId=isvObfuscator&clientVersion=10.0.2&client=android&uuid=818aa057737ba6a4&st=1623934998790&sign=e571148c8dfb456a1795d249c6aa3956&sv=100',
        body: `body=${escape('{"id":"","url":"https://xinruidddj-isv.isvjcloud.com"}')}`,
        headers: {
            'Host': 'api.m.jd.com',
            'charset': 'UTF-8',
            'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;10.0.2;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'cookie': cookie
        }
    }
    return new Promise(resolve => {
        $.post(config, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    $.token2 = data['token']
                    console.log(`token2:${$.token2}`);
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function getToken() {
    let config = {
        url: 'https://xinruidddj-isv.isvjcloud.com/api/user/jd/auth',
        body: `token=${$.token2}&source=01`,
        headers: {
            'Host': 'xinruidddj-isv.isvjcloud.com',
            'Accept': 'application/json, text/plain, */*',
            'Origin': 'https://xinruidddj-isv.isvjcloud.com',
            'Authorization': 'Bearer undefined',
            'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;10.0.2;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            'Sec-Fetch-Mode': 'cors',
            'X-Requested-With': 'com.jingdong.app.mall',
            'Sec-Fetch-Site': 'same-origin',
            'Referer': 'https://xinruidddj-isv.isvjcloud.com/exception/?channel=DDLY&sid=fd5e44488241862af88cb40cbebf660w&un_area=12_904_3373_62101',
            'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cookie': `IsvToken=${$.isvToken};`
        },
    }
    return new Promise(resolve => {
        $.post(config, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    $.token = data.body.access_token
                    console.log($.token)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function detail() {
    return new Promise(resolve => {
        $.get({
            url: 'https://xinruidddj-isv.isvjcloud.com/api/task/detail',
            headers: {
                'Host': 'xinruidddj-isv.isvjcloud.com',
                'Accept': 'application/json, text/plain, */*',
                'Authorization': `Bearer ${$.token}`,
                'Accept-Language': 'zh-cn',
                'Origin': 'https://xinruidddj-isv.isvjcloud.com',
                'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;10.0.2;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
                'Referer': 'https://xinruidddj-isv.isvjcloud.com/',
            }
        }, (err, resp, data) => {
            if (!err) {
                try {
                    resolve(JSON.parse(data).body.task_component.task_vos)
                } catch (e) {
                    resolve("黑号")
                } finally {
                    resolve([])
                }
            }
        })
    })
}

function do_task(token, id, type) {
    return new Promise(resolve => {
        // console.log(token, id, type)
        $.post({
            url: 'https://xinruidddj-isv.isvjcloud.com/api/task/do_task',
            headers: {
                'Host': 'xinruidddj-isv.isvjcloud.com',
                'Accept': 'application/json, text/plain, */*',
                'Authorization': `Bearer ${$.token}`,
                'Accept-Language': 'zh-cn',
                'Origin': 'https://xinruidddj-isv.isvjcloud.com',
                'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;10.0.2;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
                'Referer': 'https://xinruidddj-isv.isvjcloud.com/',
            },
            body: `token=${token}&task_id=${id}&task_type=${type}`
        }, (err, resp, data) => {
            try {
                if (!err) {
                    data = JSON.parse(data)
                    if (data.status === '0') {
                        let result = data.body.result
                        console.log(`任务成功：本次获得 ${result.acquired_score}，账户总额 ${result.user_score}`)
                        resolve(200);
                    } else {
                        console.log('任务失败！')
                        resolve(502)
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

function makeShareCode() {
    return new Promise(resolve => {
        $.post({
            url: 'https://api.m.jd.com/client.action?functionId=jdf_queryBothwayFriendsInfo',
            headers: {
                'Host': 'api.m.jd.com',
                'accept': '*/*',
                'content-type': 'application/x-www-form-urlencoded',
                'referer': '',
                'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;10.0.2;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
                'accept-language': 'zh-Hans-CN;q=1',
                'Cookie': cookie
            },
            body: "body=%7B%7D&build=167694&client=apple&clientVersion=10.0.2&openudid=fc13275e23b2613e6aae772533ca6f349d2e0a86&sign=399128e7314f716adbf1ca9d9c205a10&st=1623850849392&sv=110"
        }, (err, resp, data) => {
            try {
                if (!err) {
                    data = JSON.parse(data)
                    resolve(data.data)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve()
            }
        })
    })
}

function get_produce_coins() {
    return new Promise(resolve => {
        $.post({
            url: 'https://xinruidddj-isv.isvjcloud.com/api/club/get_produce_coins',
            headers: {
                'Host': 'xinruidddj-isv.isvjcloud.com',
                'Accept': 'application/json, text/plain, */*',
                'Authorization': `Bearer ${$.token}`,
                'Accept-Language': 'zh-cn',
                'Origin': 'https://xinruidddj-isv.isvjcloud.com',
                'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;10.0.2;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
                'Referer': 'https://xinruidddj-isv.isvjcloud.com/',
            },
        }, (err, resp, data) => {
            try {
                if (!err) {
                    data = JSON.parse(data)
                    console.log("收币：", data)
                    if (data.status === '0') {
                        let coins = parseInt(data.body.coins)
                        console.log(`收币成功：获得 ${coins}`)
                    } else {
                        console.log('收币失败！')
                        resolve(500)
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(200)
            }
        })
    })
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

function requireConfig() {
    return new Promise(resolve => {
        console.log('开始获取配置文件\n')
        notify = $.isNode() ? require('./sendNotify') : '';
        const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
        if ($.isNode()) {
            Object.keys(jdCookieNode).forEach((item) => {
                if (jdCookieNode[item]) {
                    cookiesArr.push(jdCookieNode[item])
                }
            })
            if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {
            };
        } else {
            cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
        }
        console.log(`共${cookiesArr.length}个京东账号\n`)
        resolve()
    })
}

function jsonParse(str) {
    if (typeof str == "string") {
        try {
            return JSON.parse(str);
        } catch (e) {
            console.log(e);
            $.msg($.name, '', '不要在BoxJS手动复制粘贴修改cookie')
            return [];
        }
    }
}

function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}