/*
京东多合一签到,自用,可N个京东账号
活动入口：各处的签到汇总
更新时间：2021-6-18

cron "0 7 * * *" script-path= jd_bean_sign.js,tag= 京东多合一签到
 */

const $ = new Env('京东多合一签到');
const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const exec = require('child_process').execSync
const fs = require('fs')
const download = require('download');

let resultPath = "./result.txt";
let JD_DailyBonusPath = "./utils/JD_DailyBonus.js";
let outPutUrl = './utils';
let NodeSet = 'CookieSet.json';
let cookiesArr = [], cookie = '', allMessage = '', jrBodyArr = [], jrBody = '';

if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_BEAN_SIGN_BODY) {
    if (process.env.JD_BEAN_SIGN_BODY.indexOf('&') > -1) {
      jrBodyArr = process.env.JD_BEAN_SIGN_BODY.split('&');
    } else if (process.env.JD_BEAN_SIGN_BODY.indexOf('\n') > -1) {
      jrBodyArr = process.env.JD_BEAN_SIGN_BODY.split('\n');
    } else {
      jrBodyArr = [process.env.JD_BEAN_SIGN_BODY];
    }
  }
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
}

!(async() => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  process.env.JD_BEAN_SIGN_NOTIFY_SIMPLE = process.env.JD_BEAN_SIGN_NOTIFY_SIMPLE ? process.env.JD_BEAN_SIGN_NOTIFY_SIMPLE : 'true';
  await requireConfig();

  if (!await fs.existsSync(JD_DailyBonusPath)) {
    console.log(`\nJD_DailyBonus.js 文件不存在，停止执行${$.name}\n`);
    await notify.sendNotify($.name, `本次执行${$.name}失败，JD_DailyBonus.js 文件下载异常，详情请查看日志`)
    return
  }
  const content = await fs.readFileSync(JD_DailyBonusPath, 'utf8')
  for (let i = 0; i < cookiesArr.length; i++) {
    cookie = cookiesArr[i];
    if (cookie) {
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.nickName = '';
      $.isLogin = true;
      jrBody = ''
      console.log(`*****************开始京东账号${$.index} ${$.nickName || $.UserName}京豆签到*******************\n`);

      if (jrBodyArr && jrBodyArr.length) {
        for (let key in Object.keys(jrBodyArr)) {
          let vo = JSON.parse(jrBodyArr[key])
          if (decodeURIComponent(vo.pin) == $.UserName) {
            jrBody = vo.body || ''
          }
        }
      } else {
        jrBody = ''
      }

      await changeFile(content);
      await execSign();
    }
  }
  //await deleteFile(JD_DailyBonusPath);//删除下载的JD_DailyBonus.js文件
  if ($.isNode() && allMessage && process.env.JD_BEAN_SIGN_NOTIFY_SIMPLE === 'true') {
    $.msg($.name, '', allMessage);
    await notify.sendNotify($.name, allMessage)
  }
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done())
async function execSign() {
  console.log(`\n开始执行 ${$.name} 签到，请稍等...\n`);
  try {
    await exec(`${process.execPath} ${JD_DailyBonusPath} >> ${resultPath}`);
    const notifyContent = await fs.readFileSync(resultPath, "utf8");
    console.error(`👇👇👇👇👇👇👇👇👇👇👇签到详情👇👇👇👇👇👇👇👇👇👇👇\n${notifyContent}\n👆👆👆👆👆👆👆👆👆签到详情👆👆👆👆👆👆👆👆👆👆👆`);
    // await exec("node JD_DailyBonus.js", { stdio: "inherit" });
    // console.log('执行完毕', new Date(new Date().getTime() + 8 * 3600000).toLocaleDateString())
    //发送通知
    let BarkContent = '';
    if (fs.existsSync(resultPath)) {
      const barkContentStart = notifyContent.indexOf('【签到概览】')
      const barkContentEnd = notifyContent.length;
      if (process.env.JD_BEAN_SIGN_STOP_NOTIFY !== 'true') {
        if (process.env.JD_BEAN_SIGN_NOTIFY_SIMPLE === 'true') {
          if (barkContentStart > -1 && barkContentEnd > -1) {
            BarkContent = notifyContent.substring(barkContentStart, barkContentEnd);
          }
          BarkContent = BarkContent.split('\n\n')[0];
        } else {
          if (barkContentStart > -1 && barkContentEnd > -1) {
            BarkContent = notifyContent.substring(barkContentStart, barkContentEnd);
          }
        }
      }
    }
    //不管哪个时区,这里得到的都是北京时间的时间戳;
    const UTC8 = new Date().getTime() + new Date().getTimezoneOffset()*60000 + 28800000;
    $.beanSignTime = new Date(UTC8).toLocaleString('zh', {hour12: false});
    //console.log(`脚本执行完毕时间：${$.beanSignTime}`)
    if (BarkContent) {
      allMessage += `【京东号 ${$.index}】: ${$.nickName || $.UserName}\n【签到时间】:  ${$.beanSignTime}\n${BarkContent}${$.index !== cookiesArr.length ? '\n\n' : ''}`;
      if (!process.env.JD_BEAN_SIGN_NOTIFY_SIMPLE || (process.env.JD_BEAN_SIGN_NOTIFY_SIMPLE && process.env.JD_BEAN_SIGN_NOTIFY_SIMPLE !== 'true')) {
        await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName || $.UserName}`, `【签到号 ${$.index}】: ${$.nickName || $.UserName}\n【签到时间】:  ${$.beanSignTime}\n${BarkContent}`);
      }
    }
    //运行完成后，删除下载的文件
    await deleteFile(resultPath);//删除result.txt
    await deleteFile('./utils/CookieSet.json')
    console.log(`\n\n*****************${new Date(new Date().getTime()).toLocaleString('zh', {hour12: false})} 京东账号${$.index} ${$.nickName || $.UserName} ${$.name}完成*******************\n\n`);
  } catch (e) {
    console.log("京东签到脚本执行异常:" + e);
  }
}
async function downFile () {
  let url = '';
  await downloadUrl();
  if ($.body) {
    url = 'https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js';
  } else {
    url = 'https://cdn.jsdelivr.net/gh/NobyDa/Script@master/JD-DailyBonus/JD_DailyBonus.js';
  }
  try {
    const options = { }
    if (process.env.TG_PROXY_HOST && process.env.TG_PROXY_PORT) {
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
    await download(url, outPutUrl, options);
    console.log(`JD_DailyBonus.js文件下载完毕\n\n`);
  } catch (e) {
    console.log("JD_DailyBonus.js 文件下载异常:" + e);
  }
}

async function changeFile (content) {
  console.log(`开始替换变量`)
  let newContent = content.replace(/var OtherKey = `.*`/, `var OtherKey = \`[{"cookie":"${cookie}","jrBody":"${jrBody}"}]\``);
  newContent = newContent.replace(/const NodeSet = 'CookieSet.json'/, `const NodeSet = '${NodeSet}'`)
  if (process.env.JD_BEAN_STOP && process.env.JD_BEAN_STOP !== '0') {
    newContent = newContent.replace(/var stop = '0'/, `var stop = '${process.env.JD_BEAN_STOP}'`);
  }
  const zone = new Date().getTimezoneOffset();
  if (zone === 0) {
    //此处针对UTC-0时区用户做的
    newContent = newContent.replace(/tm\s=.*/, `tm = new Date(new Date().toLocaleDateString()).getTime() - 28800000;`);
  }
  try {
    await fs.writeFileSync(JD_DailyBonusPath, newContent, 'utf8');
    console.log('替换变量完毕');
  } catch (e) {
    console.log("京东签到写入文件异常:" + e);
  }
}
async function deleteFile(path) {
  // 查看文件result.txt是否存在,如果存在,先删除
  const fileExists = await fs.existsSync(path);
  // console.log('fileExists', fileExists);
  if (fileExists) {
    const unlinkRes = await fs.unlinkSync(path);
    // console.log('unlinkRes', unlinkRes)
  }
}

function downloadUrl(url = 'https://cdn.jsdelivr.net/gh/NobyDa/Script@master/JD-DailyBonus/JD_DailyBonus.js') {
  return new Promise(resolve => {
    let options = { url, "timeout": 20000 };
    if ($.isNode() && process.env.TG_PROXY_HOST && process.env.TG_PROXY_PORT) {
      let tunnel = require("tunnel");
      let agent = {
        https: tunnel.httpsOverHttp({
          proxy: {
            host: process.env.TG_PROXY_HOST,
            port: process.env.TG_PROXY_PORT * 1
          }
        })
      }
      Object.assign(options, { agent })
    }

  })
}

function requireConfig() {
  return new Promise(resolve => {
    //判断是否是云函数环境。原函数跟目录目录没有可写入权限，文件只能放到根目录下虚拟的/temp/文件夹（具有可写入权限）
    resultPath = process.env.TENCENTCLOUD_RUNENV === 'SCF' ? '/tmp/result.txt' : resultPath;
    JD_DailyBonusPath = process.env.TENCENTCLOUD_RUNENV === 'SCF' ? '/tmp/JD_DailyBonus.js' : JD_DailyBonusPath;
    outPutUrl = process.env.TENCENTCLOUD_RUNENV === 'SCF' ? '/tmp/' : outPutUrl;
    NodeSet = process.env.TENCENTCLOUD_RUNENV === 'SCF' ? '/tmp/CookieSet.json' : NodeSet;
    resolve()
  })
}

function timeFormat(time) {
  let date;
  if (time) {
    date = new Date(time)
  } else {
    date = new Date();
  }
  return date.getFullYear() + '-' + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + (date.getDate() >= 10 ? date.getDate() : '0' + date.getDate());
}
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
