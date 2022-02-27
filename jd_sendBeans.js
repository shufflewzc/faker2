/*
送豆得豆
活动入口：来客有礼小程序
已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
============Quantumultx===============
[task_local]
#送豆得豆
45 1,12 * * * https://raw.githubusercontent.com/Aaron-lv/sync/jd_scripts/jd_sendBeans.js, tag=送豆得豆, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true
================Loon==============
[Script]
cron "45 1,12 * * *" script-path=https://raw.githubusercontent.com/Aaron-lv/sync/jd_scripts/jd_sendBeans.js,tag=送豆得豆
===============Surge=================
送豆得豆 = type=cron,cronexp="45 1,12 * * *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/Aaron-lv/sync/jd_scripts/jd_sendBeans.js
============小火箭=========
送豆得豆 = type=cron,script-path=https://raw.githubusercontent.com/Aaron-lv/sync/jd_scripts/jd_sendBeans.js, cronexpr="45 1,12 * * *", timeout=3600, enable=true
 */
const $ = new Env('送豆得豆');
const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], isLoginInfo = {};
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  });
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [$.getdata("CookieJD"), $.getdata("CookieJD2"), ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  $.activityId = '';
  $.completeNumbers = '';
  console.log(`开始获取活动信息`);
  for (let i = 0; (cookiesArr.length < 3 ? i < cookiesArr.length : i < 3) && $.activityId === ''; i++) {
    $.cookie = cookiesArr[i];
    $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
    $.isLogin = true;
    $.nickName = ''
    if (isLoginInfo[$.UserName] === false) {
      
    } else {
      if (!isLoginInfo[$.UserName]) {
        await TotalBean();
        isLoginInfo[$.UserName] = $.isLogin
      }
    }
    if (!isLoginInfo[$.UserName]) continue
    await getActivityInfo();
  }
  if ($.activityId === '') {
    console.log(`获取活动ID失败`);
    return;
  }
  let openCount = Math.floor((Number(cookiesArr.length)-1)/Number($.completeNumbers));
  console.log(`\n共有${cookiesArr.length}个账号，前${openCount}个账号可以开团\n`);
  $.openTuanList = [];
  console.log(`前${openCount}个账号开始开团\n`);
  for (let i = 0; i < cookiesArr.length && i < openCount; i++) {
    $.cookie = cookiesArr[i];
    $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
    $.index = i + 1;
    $.isLogin = true;
    $.nickName = '';
    console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
    if (isLoginInfo[$.UserName] === false) {
      
    } else {
      if (!isLoginInfo[$.UserName]) {
        await TotalBean();
        isLoginInfo[$.UserName] = $.isLogin
      }
    }
    if (!isLoginInfo[$.UserName]) continue
    await openTuan();
  }
  console.log('\n开团信息\n'+JSON.stringify($.openTuanList));
  console.log(`\n开始互助\n`);
  let ckList = getRandomArrayElements(cookiesArr,cookiesArr.length);
  for (let i = 0; i < ckList.length && $.openTuanList.length > 0; i++) {
    $.cookie = ckList[i];
    $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
    $.index = i + 1;
    $.isLogin = true;
    console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
    if (isLoginInfo[$.UserName] === false) {

    } else {
      if (!isLoginInfo[$.UserName]) {
        await TotalBean();
        isLoginInfo[$.UserName] = $.isLogin
      }
    }
    if (!isLoginInfo[$.UserName]) {
      $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
      
      if ($.isNode()) {
        await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
      }
      continue;
    }
    await helpMain();
  }
  console.log(`\n开始领取奖励\n`);
  for (let i = 0; i < cookiesArr.length && i < openCount; i++) {
    $.cookie = cookiesArr[i];
    $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
    $.index = i + 1;
    $.isLogin = true;
    console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
    if (isLoginInfo[$.UserName] === false) {
      
    } else {
      if (!isLoginInfo[$.UserName]) {
        await TotalBean();
        isLoginInfo[$.UserName] = $.isLogin
      }
    }
    if (!isLoginInfo[$.UserName]) continue
    await rewardMain();
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    $.cookie = cookiesArr[i];
    $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
    $.index = i + 1;
    $.isLogin = true;
    $.nickName = ''
    console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);
    if (isLoginInfo[$.UserName] === false) {
      
    } else {
      if (!isLoginInfo[$.UserName]) {
        await TotalBean();
        isLoginInfo[$.UserName] = $.isLogin
      }
    }
    if (!isLoginInfo[$.UserName]) continue
    await myReward()
  }
})().catch((e) => {$.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')}).finally(() => {$.done();});

async function getActivityInfo(){
  $.activityList = [];
  await getActivityList();
  if($.activityList.length === 0){
    return;
  }
  for (let i = 0; i < $.activityList.length; i++) {
    if($.activityList[i].status !== 'NOT_BEGIN'){
      $.activityId = $.activityList[i].activeId;
      $.activityCode = $.activityList[i].activityCode;
      break;
    }
  }
  await $.wait(3000);
  $.detail = {};
  await getActivityDetail();
  if(JSON.stringify($.detail) === '{}'){
    console.log(`获取活动详情失败`);
    return;
  }else{
    console.log(`获取活动详情成功`);
  }
  $.completeNumbers = $.detail.activityInfo.completeNumbers;
  console.log(`获取到的活动ID：${$.activityId},需要邀请${$.completeNumbers}人瓜分`);
}

async function myReward(){
  return new Promise(async (resolve) => {
    let lkt = new Date().getTime()
    let lks = $.md5('' + 'q8DNJdpcfRQ69gIx' + lkt).toString()
    let options = {
      "url": `https://sendbeans.jd.com/common/api/bean/activity/myReward?itemsPerPage=10&currentPage=1&sendType=0&invokeKey=q8DNJdpcfRQ69gIx`,
      "headers": {
        "Host": "sendbeans.jd.com",
        "Origin": "https://sendbeans.jd.com",
        "Cookie": $.cookie,
        "app-id": "h5",
        "Connection": "keep-alive",
        "Accept": "application/json, text/plain, */*",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        "Accept-Language": "zh-cn",
        "Referer": "https://sendbeans.jd.com/dist/index.html",
        "Accept-Encoding": "gzip, deflate, br",
        "openId": "",
        'lkt': lkt,
        'lks': lks
      }
    };
    $.get(options, async (err, resp, data) => {
      try {
        data = JSON.parse(data);
        if (data.success) {
          let canReward = false
          for (let key of Object.keys(data.datas)) {
            let vo = data.datas[key]
            if (vo.status === 3 && vo.type === 2) {
              canReward = true
              $.rewardRecordId = vo.id
              await rewardBean()
              $.rewardRecordId = ''
            }
          }
          if (!canReward) console.log(`没有可领取奖励`)
        }else{
          console.log(JSON.stringify(data));
        }
      } catch (e) {
        console.log(e);
      } finally {
        resolve(data);
      }
    })
  })
}

async function getActivityList(){
  return new Promise((resolve) => {
    let lkt = new Date().getTime()
    let lks = $.md5('' + 'q8DNJdpcfRQ69gIx' + lkt).toString()
    let options = {
      "url": `https://sendbeans.jd.com/common/api/bean/activity/get/entry/list/by/channel?channelId=14&channelType=H5&sendType=0&singleActivity=false&invokeKey=q8DNJdpcfRQ69gIx`,
      "headers": {
        "Host": "sendbeans.jd.com",
        "Origin": "https://sendbeans.jd.com",
        "Cookie": $.cookie,
        "Connection": "keep-alive",
        "Accept": "application/json, text/plain, */*",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        "Accept-Language": "zh-cn",
        "Referer": "https://sendbeans.jd.com/dist/index.html",
        "Accept-Encoding": "gzip, deflate, br",
        "openId": "",
        'lkt': lkt,
        'lks': lks
      }
    };
    $.get(options, (err, resp, data) => {
      try {
        data = JSON.parse(data);
        if (data.success) {
          $.activityList = data.data.items;
        }else{
          console.log(JSON.stringify(data));
        }
      } catch (e) {
        console.log(e);
      } finally {
        resolve(data);
      }
    })
  })
}

async function openTuan(){
  $.detail = {};
  $.rewardRecordId = '';
  await getActivityDetail();
  if(JSON.stringify($.detail) === '{}'){
    console.log(`获取活动详情失败`);
    return;
  }else{
    $.rewardRecordId = $.detail.rewardRecordId;
    console.log(`获取活动详情成功`);
  }
  await $.wait(3000);
  if(!$.rewardRecordId){
    if(!$.detail.invited){
      await invite();
      await $.wait(1000);
      await getActivityDetail();
      await $.wait(3000);
      $.rewardRecordId = $.detail.rewardRecordId;
      console.log(`【京东账号${$.index}】${$.UserName} 瓜分ID:${$.rewardRecordId}`);
    }
  }else{
    console.log(`【京东账号${$.index}】${$.UserName} 瓜分ID:${$.rewardRecordId}`);
  }
  $.openTuanList.push({
    'user':$.UserName,
    'rewardRecordId':$.rewardRecordId,
    'completed':$.detail.completed,
    'rewardOk':$.detail.rewardOk
  });
}

async function helpMain(){
  $.canHelp = true;
  for (let j = 0; j < $.openTuanList.length && $.canHelp; j++) {
    $.oneTuanInfo =  $.openTuanList[j];
    if( $.UserName === $.oneTuanInfo['user']){
      continue;
    }
    if( $.oneTuanInfo['completed']){
      continue;
    }
    console.log(`${$.UserName}去助力${$.oneTuanInfo['user']}`);
    $.detail = {};
    $.rewardRecordId = '';
    await getActivityDetail();
    if(JSON.stringify($.detail) === '{}'){
      console.log(`获取活动详情失败`);
      return;
    }else{
      $.rewardRecordId = $.detail.rewardRecordId;
      console.log(`获取活动详情成功`);
    }
    await $.wait(3000);
    await help();
    await $.wait(2000);
  }
}

async function rewardMain(){
  $.detail = {};
  $.rewardRecordId = '';
  await getActivityDetail();
  if(JSON.stringify($.detail) === '{}'){
    console.log(`获取活动详情失败`);
    return;
  }else{
    $.rewardRecordId = $.detail.rewardRecordId;
    console.log(`获取活动详情成功`);
  }
  await $.wait(3000);
  if($.rewardRecordId && $.detail.completed && !$.detail.rewardOk){
    await rewardBean();
    await $.wait(2000);
  }else if($.rewardRecordId && $.detail.completed && $.detail.rewardOk){
    console.log(`奖励已领取`);
  }else{
    console.log(`未满足条件，不可领取奖励`);
  }
}
async function rewardBean(){
  return new Promise((resolve) => {
    let lkt = new Date().getTime()
    let lks = $.md5('' + 'q8DNJdpcfRQ69gIx' + lkt).toString()
    let options = {
      "url": `https://draw.jdfcloud.com/common/api/bean/activity/sendBean?rewardRecordId=${$.rewardRecordId}&jdChannelId=&userSource=mp&appId=wxccb5c536b0ecd1bf&invokeKey=q8DNJdpcfRQ69gIx`,
      "headers":  {
        'content-type' : `application/json`,
        'Connection' : `keep-alive`,
        'Accept-Encoding' : `gzip,compress,br,deflate`,
        'App-Id' : `wxccb5c536b0ecd1bf`,
        'Lottery-Access-Signature' : `wxccb5c536b0ecd1bf1537237540544h79HlfU`,
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.13(0x18000d2a) NetType/WIFI Language/zh_CN",
        'openId' : ``,
        'Host' : `draw.jdfcloud.com`,
        'Referer' : `https://servicewechat.com/wxccb5c536b0ecd1bf/755/page-frame.html`,
        'cookie' : $.cookie,
        'lkt': lkt,
        'lks': lks
      }
    };
    $.get(options, (err, resp, data) => {
      try {
        data = JSON.parse(data);
        if(data.success){
          console.log(`领取豆子奖励成功`);
        }else{
          console.log(JSON.stringify(data));
        }
      } catch (e) {
        console.log(e);
      } finally {
        resolve(data);
      }
    })
  });
}

function getRandomArrayElements(arr, count) {
  var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(min);
}

async function help() {
  await new Promise((resolve) => {
    let lkt = new Date().getTime()
    let lks = $.md5('' + 'q8DNJdpcfRQ69gIx' + lkt + $.activityCode).toString()
    let options = {
      "url": `https://draw.jdfcloud.com/common/api/bean/activity/participate?activityCode=${$.activityCode}&activityId=${$.activityId}&inviteUserPin=${encodeURIComponent($.oneTuanInfo['user'])}&invokeKey=q8DNJdpcfRQ69gIx&timestap=${Date.now()}`,
      "headers":  {
        'content-type' : `application/json`,
        'Connection' : `keep-alive`,
        'Accept-Encoding' : `gzip,compress,br,deflate`,
        'App-Id' : `wxccb5c536b0ecd1bf`,
        'Lottery-Access-Signature' : `wxccb5c536b0ecd1bf1537237540544h79HlfU`,
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.13(0x18000d2a) NetType/WIFI Language/zh_CN",
        'openId' : ``,
        'Host' : `draw.jdfcloud.com`,
        'Referer' : `https://servicewechat.com/wxccb5c536b0ecd1bf/755/page-frame.html`,
        'cookie' : $.cookie,
        'lkt': lkt,
        'lks': lks
      }
    };
    $.post(options, (err, resp, res) => {
      try {
        if (res) {
          res = JSON.parse(res);
          if(res.data.result === 5){
            $.oneTuanInfo['completed'] = true;
          }else if(res.data.result === 0 || res.data.result === 1){
            $.canHelp = false;
          }
          console.log(JSON.stringify(res));
        }
      } catch (e) {
        console.log(e);
      } finally {
        resolve(res);
      }
    })
  });
}

async function invite() {
  let lkt = new Date().getTime()
  let lks = $.md5('' + 'q8DNJdpcfRQ69gIx' + lkt + $.activityCode).toString()
  const url = `https://draw.jdfcloud.com/common/api/bean/activity/invite?activityCode=${$.activityCode}&openId=&activityId=${$.activityId}&userSource=mp&formId=123&jdChannelId=&fp=&appId=wxccb5c536b0ecd1bf&invokeKey=q8DNJdpcfRQ69gIx`;
  const method = `POST`;
  const headers = {
    'content-type' : `application/json`,
    'Connection' : `keep-alive`,
    'Accept-Encoding' : `gzip,compress,br,deflate`,
    'App-Id' : `wxccb5c536b0ecd1bf`,
    'Lottery-Access-Signature' : `wxccb5c536b0ecd1bf1537237540544h79HlfU`,
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.13(0x18000d2a) NetType/WIFI Language/zh_CN",
    'openId' : ``,
    'Host' : `draw.jdfcloud.com`,
    'Referer' : `https://servicewechat.com/wxccb5c536b0ecd1bf/755/page-frame.html`,
    'cookie' : $.cookie,
    'lkt': lkt,
    'lks': lks
  };
  const body = `{}`;
  const myRequest = {
    url: url,
    method: method,
    headers: headers,
    body: body
  };
  return new Promise(async resolve => {
    $.post(myRequest, (err, resp, data) => {
      try {
        data = JSON.parse(data);
        if(data.success){
          console.log(`发起瓜分成功`);
        }else{
          console.log(JSON.stringify(data));
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

async function getActivityDetail() {
  let lkt = new Date().getTime()
  let lks = $.md5('' + 'q8DNJdpcfRQ69gIx' + lkt + $.activityCode).toString()
  const url = `https://draw.jdfcloud.com/common/api/bean/activity/detail?activityCode=${$.activityCode}&activityId=${$.activityId}&userOpenId=&timestap=${Date.now()}&userSource=mp&jdChannelId=&appId=wxccb5c536b0ecd1bf&invokeKey=q8DNJdpcfRQ69gIx`;
  const method = `GET`;
  const headers = {
    'cookie' : $.cookie,
    'openId' : ``,
    'Connection' : `keep-alive`,
    'App-Id' : `wxccb5c536b0ecd1bf`,
    'content-type' : `application/json`,
    'Host' : `draw.jdfcloud.com`,
    'Accept-Encoding' : `gzip,compress,br,deflate`,
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.13(0x18000d2a) NetType/WIFI Language/zh_CN",
    'Lottery-Access-Signature' : `wxccb5c536b0ecd1bf1537237540544h79HlfU`,
    'Referer' : `https://servicewechat.com/wxccb5c536b0ecd1bf/755/page-frame.html`,
    'lkt': lkt,
    'lks': lks
  };
  const myRequest = {url: url, method: method, headers: headers};
  return new Promise(async resolve => {
    $.get(myRequest, (err, resp, data) => {
      try {
        //console.log(data);
        data = JSON.parse(data);
        if(data.success){
          $.detail = data.data;
        }
      } catch (e) {
        //console.log(data);
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      url: "https://wq.jd.com/user_new/info/GetJDUserInfoUnion?sceneval=2",
      headers: {
        Host: "wq.jd.com",
        Accept: "*/*",
        Connection: "keep-alive",
        Cookie: $.cookie,
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
            if (data['retcode'] === 1001) {
              $.isLogin = false; //cookie过期
              return;
            }
            if (data['retcode'] === 0 && data.data && data.data.hasOwnProperty("userInfo")) {
              $.nickName = data.data.userInfo.baseInfo.nickname;
            }
          } else {
            console.log('京东服务器返回空数据');
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
// md5
!function(n){function t(n,t){var r=(65535&n)+(65535&t);return(n>>16)+(t>>16)+(r>>16)<<16|65535&r}function r(n,t){return n<<t|n>>>32-t}function e(n,e,o,u,c,f){return t(r(t(t(e,n),t(u,f)),c),o)}function o(n,t,r,o,u,c,f){return e(t&r|~t&o,n,t,u,c,f)}function u(n,t,r,o,u,c,f){return e(t&o|r&~o,n,t,u,c,f)}function c(n,t,r,o,u,c,f){return e(t^r^o,n,t,u,c,f)}function f(n,t,r,o,u,c,f){return e(r^(t|~o),n,t,u,c,f)}function i(n,r){n[r>>5]|=128<<r%32,n[14+(r+64>>>9<<4)]=r;var e,i,a,d,h,l=1732584193,g=-271733879,v=-1732584194,m=271733878;for(e=0;e<n.length;e+=16){i=l,a=g,d=v,h=m,g=f(g=f(g=f(g=f(g=c(g=c(g=c(g=c(g=u(g=u(g=u(g=u(g=o(g=o(g=o(g=o(g,v=o(v,m=o(m,l=o(l,g,v,m,n[e],7,-680876936),g,v,n[e+1],12,-389564586),l,g,n[e+2],17,606105819),m,l,n[e+3],22,-1044525330),v=o(v,m=o(m,l=o(l,g,v,m,n[e+4],7,-176418897),g,v,n[e+5],12,1200080426),l,g,n[e+6],17,-1473231341),m,l,n[e+7],22,-45705983),v=o(v,m=o(m,l=o(l,g,v,m,n[e+8],7,1770035416),g,v,n[e+9],12,-1958414417),l,g,n[e+10],17,-42063),m,l,n[e+11],22,-1990404162),v=o(v,m=o(m,l=o(l,g,v,m,n[e+12],7,1804603682),g,v,n[e+13],12,-40341101),l,g,n[e+14],17,-1502002290),m,l,n[e+15],22,1236535329),v=u(v,m=u(m,l=u(l,g,v,m,n[e+1],5,-165796510),g,v,n[e+6],9,-1069501632),l,g,n[e+11],14,643717713),m,l,n[e],20,-373897302),v=u(v,m=u(m,l=u(l,g,v,m,n[e+5],5,-701558691),g,v,n[e+10],9,38016083),l,g,n[e+15],14,-660478335),m,l,n[e+4],20,-405537848),v=u(v,m=u(m,l=u(l,g,v,m,n[e+9],5,568446438),g,v,n[e+14],9,-1019803690),l,g,n[e+3],14,-187363961),m,l,n[e+8],20,1163531501),v=u(v,m=u(m,l=u(l,g,v,m,n[e+13],5,-1444681467),g,v,n[e+2],9,-51403784),l,g,n[e+7],14,1735328473),m,l,n[e+12],20,-1926607734),v=c(v,m=c(m,l=c(l,g,v,m,n[e+5],4,-378558),g,v,n[e+8],11,-2022574463),l,g,n[e+11],16,1839030562),m,l,n[e+14],23,-35309556),v=c(v,m=c(m,l=c(l,g,v,m,n[e+1],4,-1530992060),g,v,n[e+4],11,1272893353),l,g,n[e+7],16,-155497632),m,l,n[e+10],23,-1094730640),v=c(v,m=c(m,l=c(l,g,v,m,n[e+13],4,681279174),g,v,n[e],11,-358537222),l,g,n[e+3],16,-722521979),m,l,n[e+6],23,76029189),v=c(v,m=c(m,l=c(l,g,v,m,n[e+9],4,-640364487),g,v,n[e+12],11,-421815835),l,g,n[e+15],16,530742520),m,l,n[e+2],23,-995338651),v=f(v,m=f(m,l=f(l,g,v,m,n[e],6,-198630844),g,v,n[e+7],10,1126891415),l,g,n[e+14],15,-1416354905),m,l,n[e+5],21,-57434055),v=f(v,m=f(m,l=f(l,g,v,m,n[e+12],6,1700485571),g,v,n[e+3],10,-1894986606),l,g,n[e+10],15,-1051523),m,l,n[e+1],21,-2054922799),v=f(v,m=f(m,l=f(l,g,v,m,n[e+8],6,1873313359),g,v,n[e+15],10,-30611744),l,g,n[e+6],15,-1560198380),m,l,n[e+13],21,1309151649),v=f(v,m=f(m,l=f(l,g,v,m,n[e+4],6,-145523070),g,v,n[e+11],10,-1120210379),l,g,n[e+2],15,718787259),m,l,n[e+9],21,-343485551),l=t(l,i),g=t(g,a),v=t(v,d),m=t(m,h)}return[l,g,v,m]}function a(n){var t,r="",e=32*n.length;for(t=0;t<e;t+=8){r+=String.fromCharCode(n[t>>5]>>>t%32&255)}return r}function d(n){var t,r=[];for(r[(n.length>>2)-1]=void 0,t=0;t<r.length;t+=1){r[t]=0}var e=8*n.length;for(t=0;t<e;t+=8){r[t>>5]|=(255&n.charCodeAt(t/8))<<t%32}return r}function h(n){return a(i(d(n),8*n.length))}function l(n,t){var r,e,o=d(n),u=[],c=[];for(u[15]=c[15]=void 0,o.length>16&&(o=i(o,8*n.length)),r=0;r<16;r+=1){u[r]=909522486^o[r],c[r]=1549556828^o[r]}return e=i(u.concat(d(t)),512+8*t.length),a(i(c.concat(e),640))}function g(n){var t,r,e="";for(r=0;r<n.length;r+=1){t=n.charCodeAt(r),e+="0123456789abcdef".charAt(t>>>4&15)+"0123456789abcdef".charAt(15&t)}return e}function v(n){return unescape(encodeURIComponent(n))}function m(n){return h(v(n))}function p(n){return g(m(n))}function s(n,t){return l(v(n),v(t))}function C(n,t){return g(s(n,t))}function A(n,t,r){return t?r?s(t,n):C(t,n):r?m(n):p(n)}$.md5=A}(this);
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
