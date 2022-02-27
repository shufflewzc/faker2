if (!["card","car"].includes(process.env.FS_LEVEL)) {
    console.log("请设置通用加购/开卡环境变量FS_LEVEL为\"car\"(或\"card\"开卡+加购)来运行加购脚本")
    return
}
/*
#jd_joyjd_open通用ID任务，多个活动用@连接，任务连接https://jdjoy.jd.com/module/task/v2/doTask
export comm_activityIDList="af2b3d56e22d43afa0c50622c45ca2a3"  
export comm_endTimeList="1639756800000"
export comm_tasknameList="京东工业品抽奖"

即时任务，无需cron,短期或者长期请参考活动规则设置cron
*/
const $ = new Env('jd_joyjd_open通用ID任务');
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const notify = $.isNode() ? require('./sendNotify') : '';
let cookiesArr = [];
let activityIDList = '';     
let endTimeList = '';
let tasknameList = '';
let activityIDArr = [];     
let endTimeArr = [];
let tasknameArr = [];
let activityID = '', endTime = '', taskname = '';
$.UA = '';
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.comm_activityIDList) activityIDList = process.env.comm_activityIDList
    if (process.env.comm_endTimeList) endTimeList = process.env.comm_endTimeList
    if (process.env.comm_tasknameList) tasknameList = process.env.comm_tasknameList
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
    cookiesArr = [
        $.getdata("CookieJD"),
        $.getdata("CookieJD2"),
        ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        return;
    }
    if (!activityIDList) {
        $.log(`没有通用ID任务，尝试获取远程`);
        let data = await getData("https://raw.githubusercontent.com/Ca11back/scf-experiment/master/json/joyjd_open.json")
        if (!data) {
            data = await getData("https://raw.fastgit.org/Ca11back/scf-experiment/master/json/joyjd_open.json")
        }
        if (data.activityIDList && data.activityIDList.length) {
            $.log(`获取到远程且有数据`);
            activityIDList = data.activityIDList.join('@')
            endTimeList = data.endTimeList.join('@')
            tasknameList = data.tasknameList.join('@')
        }else{
            $.log(`获取失败或当前无远程数据`);
            return
        }
    }
    console.log(`通用ID任务就位，准备开始薅豆`);
    for (let i = 0; i < cookiesArr.length; i++) {
       if (cookiesArr[i]) {
        await getUA();
        $.index = i + 1;
        $.cookie = cookiesArr[i];
        $.oldcookie = cookiesArr[i];
        $.isLogin = true;
        $.nickName = '';
        await TotalBean();
        $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
        console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
        if (!$.isLogin) {
            $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
            if ($.isNode()) {
                await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
            }
            continue
        }
        let activityIDArr = activityIDList.split("@");
        let endTimeArr = endTimeList.split("@");
        let tasknameArr = tasknameList.split("@");
        for (let j = 0; j < activityIDArr.length; j++) {
        activityID = activityIDArr[j]
        endTime = endTimeArr[j]
        taskname = tasknameArr[j]
        $.fp =  randomString();
        $.eid =  randomString(90).toUpperCase();
        console.log(`通用活动任务ID：${activityID}，结束时间：${endTime}，活动名称：${taskname}`);
        if($.endTime && Date.now() > $.endTime){
            console.log(`活动已结束\n`);
             continue;
        }
        await main();
        await $.wait(2000);
        console.log('\n')
        }
     }
   }
})().catch((e) => {$.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')}).finally(() => {$.done();});

function getData(url) {
  return new Promise(async resolve => {
    const options = {
      url: `${url}?${new Date()}`, "timeout": 10000, headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }
    };
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
        } else {
          if (data) data = JSON.parse(data)
        }
      } catch (e) {
        // $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
    await $.wait(10000)
    resolve();
  })
}

async function main() {
    $.mainTime = 0;
    do {
        $.runTime = 0;
        do {
            $.activity = {};
            $.dailyTaskList = []
            $.moduleBaseInfo = {}
            await getActivity();
            await $.wait(2000);
            if(JSON.stringify($.activity) === '{}'){
                console.log(`获取列表失败：${activityID},重新获取`);
            }
            $.runTime++;
            await $.wait(2000);
        }while (JSON.stringify($.activity) === '{}' && $.runTime < 10);
        console.log(`任务列表：${activityID},获取成功`);
        $.moduleBaseInfo = $.activity.moduleBaseInfo;
        $.dailyTaskList = $.activity.dailyTask.taskList;
        if($.moduleBaseInfo.rewardStatus === 1){
            console.log(`领取最后奖励`);
            await getReward();
        }
        await $.wait(1000);
        $.runFlag = false;
        for (let i = 0; i < $.dailyTaskList.length; i++) {
            $.oneTask = $.dailyTaskList[i];
            if($.oneTask.taskCount === $.oneTask.finishCount){
                console.log(`groupType:${$.oneTask.groupType},已完成`);
                continue;
            }
            console.log(`groupType:${$.oneTask.groupType},已完成:${$.oneTask.finishCount}次，需要完成：${$.oneTask.taskCount}次`);
            $.item = $.oneTask.item;
            let viewTime = $.oneTask.viewTime || 3;
            console.log(`浏览：${$.item.itemName},等待${viewTime}秒`);
            await $.wait( viewTime* 1000);
            await $.wait( 1000);
            await doTask();
            $.runFlag = true;
            break;
        }
        $.mainTime++;
    }while ($.runFlag && $.mainTime < 40);
}

async function getReward(){
    const url = `https://jdjoy.jd.com/module/task/v2/getReward`;
    const method = `POST`;
    const headers = {
        'Accept' : `application/json, text/plain, */*`,
        'Origin' : `https://prodev.m.jd.com`,
        'Accept-Encoding' : `gzip, deflate, br`,
        'Cookie': $.cookie,
        'Content-Type' : `application/json;charset=utf-8`,
        'Host' : `jdjoy.jd.com`,
        'Connection' : `keep-alive`,
        'User-Agent' : $.UA,
        'Referer' : `https://prodev.m.jd.com/mall/active/3q7yrbh3qCJvHsu3LhojdgxNuWQT/index.html`,
        'Accept-Language' : `zh-cn`
    };
    const body = `{"groupType":5,"configCode":"${$.moduleBaseInfo.configCode}","itemId":1,"eid":"${$.eid}","fp":"${$.fp}"}`;

    const myRequest = {url: url, method: method, headers: headers, body: body};
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                console.log(data);
            } catch (e) {
                console.log(data);
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

async function doTask(){
    const url = `https://jdjoy.jd.com/module/task/v2/doTask`;
    const method = `POST`;
    const headers = {
        'Accept' : `application/json, text/plain, */*`,
        'Origin' : `https://prodev.m.jd.com`,
        'Accept-Encoding' : `gzip, deflate, br`,
        'Cookie': $.cookie,
        'Content-Type' : `application/json;charset=utf-8`,
        'Host' : `jdjoy.jd.com`,
        'Connection' : `keep-alive`,
        'User-Agent' : $.UA,
        'Referer' : `https://prodev.m.jd.com/mall/active/3q7yrbh3qCJvHsu3LhojdgxNuWQT/index.html`,
        'Accept-Language' : `zh-cn`
    };
    const body = `{"groupType":${$.oneTask.groupType},"configCode":"${$.moduleBaseInfo.configCode}","itemId":"${$.item.itemId}","eid":"${$.eid}","fp":"${$.fp}"}`;

    const myRequest = {url: url, method: method, headers: headers, body: body};
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                console.log(data);
            } catch (e) {
                console.log(data);
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

async function getActivity(){
    const url = `https://jdjoy.jd.com/module/task/v2/getActivity?configCode=${activityID}&eid=${$.eid}&fp=${$.fp}`;
    const headers = {
        'Accept' : `application/json, text/plain, */*`,
        'content-type':'application/json;charset=utf-8',
        'Origin' : `https://prodev.m.jd.com`,
        'Cookie': $.cookie,
        'Accept-Encoding' : `gzip, deflate, br`,
        'User-Agent' : $.UA,
        'Referer' : `https://prodev.m.jd.com/mall/active/3q7yrbh3qCJvHsu3LhojdgxNuWQT/index.html`,
        'Host' : `jdjoy.jd.com`,
        'Accept-Language' : `zh-cn`,
        'Connection' : `keep-alive`,
    };

    const myRequest = {url: url, headers: headers,};
    return new Promise(async resolve => {
        $.get(myRequest, (err, resp, data) => {
            try {
                data = JSON.parse(data);
                if(data && data.data && data.data.moduleBaseInfo && data.data.dailyTask){
                    $.activity = data.data;
                }
            } catch (e) {
                console.log(data);
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}



async function getUA(){
    $.UA = `jdapp;iPhone;10.0.10;14.3;${randomString(40)};network/wifi;model/iPhone12,1;addressid/3364463029;appBuild/167764;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`
}
function randomString(e) {
    e = e || 32;
    let t = "abcdef0123456789", a = t.length, n = "";
    for (i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
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
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
