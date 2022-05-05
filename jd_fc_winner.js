/*
发财大赢家之翻翻乐

需京东账号绑定到微信

脚本兼容: QuantumultX, Surge,Loon, JSBox, Node.js
=================================Quantumultx=========================
[task_local]
#发财大赢家之翻翻乐
40 0-20/4 * * * jd_big_winner.js, tag=发财大赢家之翻翻乐, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true

=================================Loon===================================
[Script]
cron "40 0-20/4 * * *" script-path=jd_big_winner.js,tag=发财大赢家之翻翻乐

===================================Surge================================
发财大赢家之翻翻乐 = type=cron,cronexp="40 0-20/4 * * *",wake-system=1,timeout=3600,script-path=jd_big_winner.js

====================================小火箭=============================
发财大赢家之翻翻乐 = type=cron,script-path=jd_big_winner.js, cronexpr="40 0-20/4 * * *", timeout=3600, enable=true
 */
const $ = new Env('发财大赢家之翻翻乐');
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const money = $.isNode() ? (process.env.Openmoney ? process.env.Openmoney : 0.32) : 0.32
const randomCount = $.isNode() ? 20 : 5;
const notify = $.isNode() ? require('./sendNotify') : '';
let merge = {}
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [],
    cookie = '';
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

const JD_API_HOST = `https://api.m.jd.com`;
message = ""
!(async () => {
		console.log(`\n【默认自动提现，如失败请自行到活动页面提现】\n\n【活动入口：极速版-百元生活费-赚金币下拉-发财大赢家】\n`)
        if (!cookiesArr[0]) {
            $.msg($.name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {
                "open-url": "https://bean.m.jd.com/"
            });
            return;
        }
        message = ""
        for (let i = 0; i < cookiesArr.length; i++) {
            cookie = cookiesArr[i];
            if (cookie) {
                $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
                $.index = i + 1;
                $.isLogin = true;
                $.canDraw = true;
				$.canReward = true;
                $.canOpen = true;
                $.cash = 0
                $.prize = 0
                $.Hb = 0
                $.drawresult = "";
                $.linkid = "WMDf1PTHmh8MYBpD97sieQ"
                $.message = `【京东账号${$.index}】${$.UserName}\n`
                console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
                if (!$.isLogin) {
                    $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {
                        "open-url": "https://bean.m.jd.com/bean/signIndex.action"
                    });

                    if ($.isNode()) {
                        await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                    }
                    continue
                }
                let leftTime = await check()
                if (leftTime != 0) {
                  console.log( `还没到开红包时间哦~剩余时间${parseInt(leftTime / 60000)}min~`)
                } else {
                    console.log("时间已到,开始开红包")
                    await open("gambleOpenReward")
                    while ($.canOpen && $.canDraw && $.canReward) {
                        await open("gambleChangeReward")
                        await $.wait(3000);
                    }
                    if ($.canDraw) {
                        console.log("金额已可提现,开始提现...")
                        $.message += `当前金额 ${$.reward.rewardValue}\n`
                        await open("gambleObtainReward", $.reward.rewardType)
                        await Draw($.reward.id, $.reward.poolBaseId, $.reward.prizeGroupId, $.reward.prizeBaseId, $.reward.prizeType)
                        await totalPrize()
                        message += $.message + `${$.drawresult}累计获得：￥${$.prize} 🧧${$.Hb} \n\n`
                        //    await notify.sendNotify(`京东极速版大赢家翻倍红包提现`, `${$.message}`); 
                    }
                }
				
            }
        }
        if ($.isNode()) {
            if (message.length!=0) {
                await notify.sendNotify("翻翻乐提现", `${message}`);
            }
        }

    })()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())
//获取活动信息



function check() {
    return new Promise(async (resolve) => {
        let options = taskUrl("gambleHomePage", `{"linkId":"${$.linkid}"}`)
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    //     console.log(data)
                    data = JSON.parse(data);
                    if (data.code === 0) {
                        //    resolve(data.data.leftTime)
                        let time = (parseInt(data.data.leftTime / 60000))
                        if (data.data.leftTime < 1000 * 100) {
                            await $.wait(data.data.leftTime + 600);
                            console.log("马上就好")
                            resolve(0)
                        } else {
                            console.log("等你🐎呢")
                            resolve(data.data.leftTime)
                        }
                        console.log("查询成功 剩余时间：" + time + "min")
                    } else {
                        console.log(data)
                        resolve(6)
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

function totalPrize() {
    return new Promise(async (resolve) => {
        let options = taskUrl("gamblePrizeList", `{"linkId":"${$.linkid}","pageNum":1,"pageSize":999999}`)
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    //      console.log(data)
                    data = JSON.parse(data);
                    if (data.code === 0 && data.data && data.data.items) {
                        for (item in data.data.items) {
                            reward = data.data.items[item]
                            if (reward.prizeType === 4) {
                                $.prize = $.prize + parseFloat(reward.amount)
                                if (reward.state === 0) {
                                    console.log(`检测到有${reward.amount}未提现,尝试提现ing...`)
                                    await Draw(reward.id, reward.poolBaseId, reward.prizeGroupId, reward.prizeBaseId, reward.prizeType)
                                    await $.wait(500);
                                }
                            } else if (reward.prizeType === 2) {
                                $.Hb = $.Hb + Number(reward.amount)
                            }
                            //  
                        }
                        console.log("查询成功 共提现：￥" + $.prize + "  🧧  " + $.Hb)
                    } else {
                        $essage += data.errMsg
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}



function open(functionid, type) {
    return new Promise(async (resolve) => {
        let options = taskPostUrl(functionid, `{"linkId":"${$.linkid}"}`)
        if (type) {
            options = taskPostUrl(functionid, `{"linkId":"${$.linkid}","rewardType":${type}}`)
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
					$.canReward = false;
                } else {
                    data = JSON.parse(data);
                    if (data.code === 0 && data.data) {
                        if (functionid != "gambleObtainReward") {
                            $.reward = data.data
                            if(data.data.rewardValue>money){
								$.canOpen=false
								}
                            if (data.data.rewardState === 3) {
                                console.log("翻倍失败啦...")
                                $.message += `当前：${data.data.rewardValue} 翻倍失败啦`
                                $.canDraw = false
								$.canReward = false;
                            } else if (data.data.rewardState === 1) {
                                console.log("翻倍成功啦")
                                console.log("当前红包：" + data.data.rewardValue + "翻倍次数：" + data.data.changeTimes)
								
                            } else {
                                console.log(data.data)
                                console.log(`状态 ${data.data.rewardState} 还不知道是什么原因嗷`)
                            }
							
                        } else {
                            console.log(data)
							
                        }


                    } else {
                        $.canDraw = false
						$.canReward = false;
                        console.log(data.errMsg)
                        $.message += data.errMsg + "\n"
                    }
                }
                resolve(data.data)
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}


function Draw(id, poolBaseId, prizeGroupId, prizeBaseId, prizeType) {
    return new Promise(async (resolve) => {
        let options = taskPostUrl("apCashWithDraw", `{"businessSource":"GAMBLE","base":{"id":${id},"business":"redEnvelopeDouble","poolBaseId":${poolBaseId},"prizeGroupId":${prizeGroupId},"prizeBaseId":${prizeBaseId},"prizeType":${prizeType}},"linkId":"${$.linkid}"}`)
        //   console.log(options)
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    //     console.log(data)
                    data = JSON.parse(data);
                    if (data.code === 0 && data.data && data.data.message) {
                        console.log("提现结果：" + data.data.message)
                        $.drawresult = "提现结果：" + data.data.message + "\n"
                    } else {
                        console.log(data)
                        $.drawresult = "提现结果：" + JSON.stringify(data) + "\n"
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}



function taskUrl(function_id, body) {
    return {
        url: `${JD_API_HOST}/?functionId=${function_id}&body=${encodeURIComponent(body)}&t=${Date.now()}&appid=activities_platform&clientVersion=3.5.6`,
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-cn",
            "Connection": "keep-alive",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": "api.m.jd.com",
            "Referer": "https://618redpacket.jd.com/?activityId=DA4SkG7NXupA9sksI00L0g&channel=wjicon&sid=0a1ec8fa2455796af69028f8410996aw&un_area=1_2803_2829_0",
            "Cookie": cookie,
            "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        }
    }
}


function taskPostUrl(functionid, body) {
    return {
        url: `${JD_API_HOST}/`,
        body: `functionId=${functionid}&body=${encodeURIComponent(body)}&t=${Date.now()}&appid=activities_platform&clientVersion=3.5.6`,
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-cn",
            "Connection": "keep-alive",
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": "api.m.jd.com",
            "Referer": "https://618redpacket.jd.com/?activityId=DA4SkG7NXupA9sksI00L0g&channel=wjicon&sid=0a1ec8fa2455796af69028f8410996aw&un_area=1_2803_2829_0",
            "Cookie": cookie,
            "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
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
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
