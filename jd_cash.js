/*
签到领现金，每日2毛～5毛
可互助，助力码每日不变，只变日期
活动入口：京东APP搜索领现金进入
更新时间：2021-06-07
已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
============Quantumultx===============
[task_local]
#签到领现金
2 0-23/4 * * * jd_cash.js, tag=签到领现金, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true

================Loon==============
[Script]
cron "2 0-23/4 * * *" script-path=jd_cash.js,tag=签到领现金

===============Surge=================
签到领现金 = type=cron,cronexp="2 0-23/4 * * *",wake-system=1,timeout=3600,script-path=jd_cash.js

============小火箭=========
签到领现金 = type=cron,script-path=jd_cash.js, cronexpr="2 0-23/4 * * *", timeout=3600, enable=true
 */
const $ = new Env('签到领现金');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let jdNotify = true;//是否关闭通知，false打开通知推送，true关闭通知推送
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message;
let helpAuthor = true;
const randomCount = $.isNode() ? 5 : 5;
let cash_exchange = false;//是否消耗2元红包兑换200京豆，默认否
const inviteCodes = [
  `eU9Yau3kZ_4g-DiByHEQ0A@ZnQya-i1Y_UmpGzUnnEX@fkFwauq3ZA@f0JyJuW7bvQ@IhM0bu-0b_kv8W6E@eU9YKpnxOLhYtQSygTJQ@-oaWtXEHOrT_bNMMVso@eU9YG7XaD4lXsR2krgpG@KxMzZOW7YvQ@eU9Ya7jnZP5w822BmntC0g@eU9YPa34F5lnpBWRjyp3@eU9YarnmYfRwpTzUziAV1Q`,
  `eU9Yau3kZ_4g-DiByHEQ0A@ZnQya-i1Y_UmpGzUnnEX@fkFwauq3ZA@f0JyJuW7bvQ@IhM0bu-0b_kv8W6E@eU9YKpnxOLhYtQSygTJQ@-oaWtXEHOrT_bNMMVso@eU9YG7XaD4lXsR2krgpG@KxMzZOW7YvQ@eU9Ya7jnZP5w822BmntC0g@eU9YPa34F5lnpBWRjyp3@eU9YarnmYfRwpTzUziAV1Q`,
]
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
const JD_API_HOST = 'https://api.m.jd.com/client.action';
let allMessage = '';
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  await requireConfig()
  $.authorCode = await getAuthorShareCode('https://raw.githubusercontent.com/Aaron-lv/updateTeam/master/shareCodes/jd_updateCash.json')
  if (!$.authorCode) {
    $.http.get({url: 'https://purge.jsdelivr.net/gh/Aaron-lv/updateTeam@master/shareCodes/jd_updateCash.json'}).then((resp) => {}).catch((e) => $.log('刷新CDN异常', e));
    await $.wait(1000)
    $.authorCode = await getAuthorShareCode('https://cdn.jsdelivr.net/gh/Aaron-lv/updateTeam@master/shareCodes/jd_updateCash.json') || []
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      message = '';
      await TotalBean();
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      await jdCash()
    }
  }
  if (allMessage) {
    if ($.isNode() && (process.env.CASH_NOTIFY_CONTROL ? process.env.CASH_NOTIFY_CONTROL === 'false' : !!1)) await notify.sendNotify($.name, allMessage);
    $.msg($.name, '', allMessage);
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
async function jdCash() {
  $.signMoney = 0;

  await appindex()
  await index()

  await shareCodesFormat()
  // await helpFriends()
  // await getReward()
  // await getReward('2');
  $.exchangeBeanNum = 0;
  cash_exchange = $.isNode() ? (process.env.CASH_EXCHANGE ? process.env.CASH_EXCHANGE : `${cash_exchange}`) : ($.getdata('cash_exchange') ? $.getdata('cash_exchange') : `${cash_exchange}`);
  // if (cash_exchange === 'true') {
  //   if(Number($.signMoney) >= 2){
  //     console.log(`\n\n开始花费2元红包兑换200京豆，一周可换五次`)
  //     for (let item of ["-1", "0", "1", "2", "3"]) {
  //       $.canLoop = true;
  //       if ($.canLoop) {
  //         for (let i = 0; i < 5; i++) {
  //           await exchange2(item);//兑换200京豆(2元红包换200京豆，一周5次。)
  //         }
  //         if (!$.canLoop) {
  //           console.log(`已找到符合的兑换条件，跳出\n`);
  //           break
  //         }
  //       }
  //     }
  //     if ($.exchangeBeanNum) {
  //       message += `兑换京豆成功，获得${$.exchangeBeanNum * 100}京豆\n`;
  //     }
  //   }else{
  //     console.log(`\n\n现金不够2元，不进行兑换200京豆，`)
  //   }
  // }
  await appindex(true)
  // await showMsg()
}

async function appindex(info=false) {
  let functionId = "cash_homePage"
  let body = {}
  let sign = await getSign(functionId, body)
  return new Promise((resolve) => {
    $.post(apptaskUrl(functionId, sign), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if(data.code===0 && data.data.result){
              if(info){
                if (message) {
                  message += `当前现金：${data.data.result.totalMoney}元`;
                  allMessage += `京东账号${$.index}${$.nickName}\n${message}${$.index !== cookiesArr.length ? '\n\n' : ''}`;
                }
                console.log(`\n\n当前现金：${data.data.result.totalMoney}元`);
                return
              }
              $.signMoney = data.data.result.totalMoney;
              // console.log(`您的助力码为${data.data.result.invitedCode}`)
              console.log(`\n【京东账号${$.index}（${$.UserName}）的${$.name}好友互助码】${data.data.result.invitedCode}\n`);
              let helpInfo = {
                'inviteCode': data.data.result.invitedCode,
                'shareDate': data.data.result.shareDate
              }
              $.shareDate = data.data.result.shareDate;
              // $.log(`shareDate: ${$.shareDate}`)
              // console.log(helpInfo)
              for (let task of data.data.result.taskInfos) {
                if (task.type === 4) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await appdoTask(task.type, task.jump.params.skuId)
                    await $.wait(5000)
                  }
                } else if (task.type === 2) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await appdoTask(task.type, task.jump.params.shopId)
                    await $.wait(5000)
                  }
                } else if (task.type === 30) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await appdoTask(task.type, task.jump.params.path)
                    await $.wait(5000)
                  }
                } else if (task.type === 16 || task.type===3 || task.type===5 || task.type===17 || task.type===21) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await appdoTask(task.type, task.jump.params.url)
                    await $.wait(5000)
                  }
                }
              }
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
function index() {
  return new Promise((resolve) => {
    $.get(taskUrl("cash_mob_home"), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0 && data.data.result) {
              for (let task of data.data.result.taskInfos) {
                if (task.type === 4) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await doTask(task.type, task.jump.params.skuId)
                    await $.wait(5000)
                  }
                } else if (task.type === 2) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await doTask(task.type, task.jump.params.shopId)
                    await $.wait(5000)
                  }
                } else if (task.type === 31) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await doTask(task.type, task.jump.params.path)
                    await $.wait(5000)
                  }
                } else if (task.type === 16 || task.type===3 || task.type===5 || task.type===17 || task.type===21) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await doTask(task.type, task.jump.params.url)
                    await $.wait(5000)
                  }
                }
              }
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
async function helpFriends() {
  $.canHelp = true
  for (let code of $.newShareCodes) {
    console.log(`去帮助好友${code['inviteCode']}`)
    await helpFriend(code)
    if(!$.canHelp) break
    await $.wait(1000)
  }
  // if (helpAuthor && $.authorCode) {
  //   for(let helpInfo of $.authorCode){
  //     console.log(`去帮助好友${helpInfo['inviteCode']}`)
  //     await helpFriend(helpInfo)
  //     if(!$.canHelp) break
  //     await $.wait(1000)
  //   }
  // }
}
function helpFriend(helpInfo) {
  return new Promise((resolve) => {
    $.get(taskUrl("cash_mob_assist", {...helpInfo,"source":1}), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if( data.code === 0 && data.data.bizCode === 0){
              console.log(`助力成功，获得${data.data.result.cashStr}`)
              // console.log(data.data.result.taskInfos)
            } else if (data.data.bizCode===207){
              console.log(data.data.bizMsg)
              $.canHelp = false
            } else{
              console.log(data.data.bizMsg)
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

async function appdoTask(type,taskInfo) {
  let functionId = 'cash_doTask'
  let body = {"type":type,"taskInfo":taskInfo}
  let sign = await getSign(functionId, body)
  return new Promise((resolve) => {
    $.post(apptaskUrl(functionId, sign), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if(data.code === 0) {
              console.log(`任务完成成功`)
              // console.log(data.data.result.taskInfos)
            } else {
              console.log(JSON.stringify(data))
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
function doTask(type,taskInfo) {
  return new Promise((resolve) => {
    $.get(taskUrl("cash_doTask",{"type":type,"taskInfo":taskInfo}), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if( data.code === 0){
              console.log(`任务完成成功`)
              // console.log(data.data.result.taskInfos)
            }else{
              console.log(data)
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
function getReward(source = 1) {
  return new Promise((resolve) => {
    $.get(taskUrl("cash_mob_reward",{"source": Number(source),"rewardNode":""}), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0 && data.data.bizCode === 0) {
              console.log(`领奖成功，${data.data.result.shareRewardTip}【${data.data.result.shareRewardAmount}】`)
              message += `领奖成功，${data.data.result.shareRewardTip}【${data.data.result.shareRewardAmount}元】\n`;
              // console.log(data.data.result.taskInfos)
            } else {
              // console.log(`领奖失败，${data.data.bizMsg}`)
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
function exchange2(node) {
  let body = '';
  const data = {node,"configVersion":"1.0"}
  if (data['node'] === '-1') {
    body = `body=${encodeURIComponent(JSON.stringify(data))}&uuid=8888888&client=apple&clientVersion=9.4.1&st=1619595890027&sign=92a8abba7b6846f274ac9803aa5a283d&sv=102`;
  } else if (data['node'] === '0') {
    body = `body=${encodeURIComponent(JSON.stringify(data))}&uuid=8888888&client=apple&clientVersion=9.4.1&st=1619597882090&sign=e00bd6c3af2a53820825b94f7a648551&sv=100`;
  } else if (data['node'] === '1') {
    body = `body=${encodeURIComponent(JSON.stringify(data))}&uuid=8888888&client=apple&clientVersion=9.4.1&st=1619595655007&sign=2e72bbd21e5f5775fe920eac129f89a2&sv=111`;
  } else if (data['node'] === '2') {
    body = `body=${encodeURIComponent(JSON.stringify(data))}&uuid=8888888&client=apple&clientVersion=9.4.1&st=1619597924095&sign=c04c70370ff68d71890de08a18cac981&sv=112`;
  } else if (data['node'] === '3') {
    body = `body=${encodeURIComponent(JSON.stringify(data))}&uuid=8888888&client=apple&clientVersion=9.4.1&st=1619597953001&sign=4c36b3d816d4f0646b5c34e7596502f8&sv=122`;
  }
  return new Promise((resolve) => {
    const options = {
      url: `${JD_API_HOST}?functionId=cash_exchangeBeans&t=${Date.now()}&${body}`,
      body: `body=${escape(JSON.stringify(data))}`,
      headers: {
        'Cookie': cookie,
        'Host': 'api.m.jd.com',
        'Connection': 'keep-alive',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"),
        'Accept-Language': 'zh-cn',
        'Accept-Encoding': 'gzip, deflate, br',
      }
    }
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['code'] === 0) {
              if (data.data.bizCode === 0) {
                console.log(`花费${data.data.result.needMoney}元红包兑换成功！获得${data.data.result.beanName}\n`)
                $.exchangeBeanNum += parseInt(data.data.result.needMoney);
                $.canLoop = false;
              } else {
                console.log('花费2元红包兑换200京豆失败：' + data.data.bizMsg)
                if (data.data.bizCode === 504) $.canLoop = true;
                if (data.data.bizCode === 120) $.canLoop = false;
              }
            } else {
              console.log(`兑换京豆失败：${JSON.stringify(data)}\n`);
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
function getSign(functionId, body) {
  return new Promise(async resolve => {
    let data = {
      functionId,
      body: JSON.stringify(body),
      "client":"apple",
      "clientVersion":"10.3.0"
    }
    let HostArr = ['jdsign.cf', 'signer.nz.lu']
    let Host = HostArr[Math.floor((Math.random() * HostArr.length))]
    let options = {
      url: `https://cdn.nz.lu/ddo`,
      body: JSON.stringify(data),
      headers: {
        Host,
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      },
      timeout: 30 * 1000
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(JSON.stringify(err))
          console.log(`${$.name} getSign API请求失败，请检查网路重试`)
        } else {

        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
function randomString(e) {
  e = e || 32;
  let t = "abcdefghijklmnopqrstuvwxyz0123456789", a = t.length, n = "";
  for (let i = 0; i < e; i++)
    n += t.charAt(Math.floor(Math.random() * a));
  return n
}
function showMsg() {
  return new Promise(resolve => {
    if (!jdNotify) {
      $.msg($.name, '', `${message}`);
    } else {
      $.log(`京东账号${$.index}${$.nickName}\n${message}`);
    }
    resolve()
  })
}
function readShareCode() {
  console.log(`开始`)
  return new Promise(async resolve => {
    $.get({url: `http://code.chiang.fun/api/v1/jd/jdcash/read/${randomCount}/`, 'timeout': 30000}, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            console.log(`随机取${randomCount}个码放到您固定的互助码后面(不影响已有固定互助)`)
            data = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
    await $.wait(30000);
    resolve()
  })
}
//格式化助力码
function shareCodesFormat() {
  return new Promise(async resolve => {
    // console.log(`第${$.index}个京东账号的助力码:::${$.shareCodesArr[$.index - 1]}`)
    $.newShareCodes = [];
    if ($.shareCodesArr[$.index - 1]) {
      $.newShareCodes = $.shareCodesArr[$.index - 1].split('@');
    } else {
      console.log(`由于您第${$.index}个京东账号未提供shareCode,将采纳本脚本自带的助力码\n`)
      const tempIndex = $.index > inviteCodes.length ? (inviteCodes.length - 1) : ($.index - 1);
      $.newShareCodes = inviteCodes[tempIndex].split('@');
      let authorCode = deepCopy($.authorCode)
      $.newShareCodes = [...(authorCode.map((item, index) => authorCode[index] = item['inviteCode'])), ...$.newShareCodes];
    }
    // const readShareCodeRes = await readShareCode();
    // if (readShareCodeRes && readShareCodeRes.code === 200) {
    //   $.newShareCodes = [...new Set([...$.newShareCodes, ...(readShareCodeRes.data || [])])];
    // }
    $.newShareCodes.map((item, index) => $.newShareCodes[index] = { "inviteCode": item, "shareDate": $.shareDate })
    console.log(`第${$.index}个京东账号将要助力的好友${JSON.stringify($.newShareCodes)}`)
    resolve();
  })
}

function requireConfig() {
  return new Promise(resolve => {
    console.log(`开始获取${$.name}配置文件\n`);
    let shareCodes = [];
    if ($.isNode()) {
      if (process.env.JD_CASH_SHARECODES) {
        if (process.env.JD_CASH_SHARECODES.indexOf('\n') > -1) {
          shareCodes = process.env.JD_CASH_SHARECODES.split('\n');
        } else {
          shareCodes = process.env.JD_CASH_SHARECODES.split('&');
        }
      }
    }
    console.log(`共${cookiesArr.length}个京东账号\n`);
    $.shareCodesArr = [];
    if ($.isNode()) {
      Object.keys(shareCodes).forEach((item) => {
        if (shareCodes[item]) {
          $.shareCodesArr.push(shareCodes[item])
        }
      })
    } else {
      if ($.getdata('jd_cash_invite')) $.shareCodesArr = $.getdata('jd_cash_invite').split('\n').filter(item => !!item);
      console.log(`\nBoxJs设置的京东签到领现金邀请码:${$.getdata('jd_cash_invite')}\n`);
    }
    console.log(`您提供了${$.shareCodesArr.length}个账号的${$.name}助力码\n`);
    resolve()
  })
}
function deepCopy(obj) {
  let objClone = Array.isArray(obj) ? [] : {};
  if (obj && typeof obj === "object") {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        //判断ojb子元素是否为对象，如果是，递归复制
        if (obj[key] && typeof obj[key] === "object") {
          objClone[key] = deepCopy(obj[key]);
        } else {
          //如果不是，简单复制
          objClone[key] = obj[key];
        }
      }
    }
  }
  return objClone;
}

function apptaskUrl(functionId = "", body = "") {
  return {
    url: `${JD_API_HOST}?functionId=${functionId}`,
    body,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Connection': 'keep-alive',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': '',
      'User-Agent': 'JD4iPhone/167774 (iPhone; iOS 14.7.1; Scale/3.00)',
      'Accept-Language': 'zh-Hans-CN;q=1',
      'Accept-Encoding': 'gzip, deflate, br',
    }
  }
}
function taskUrl(functionId, body = {}) {
  return {
    url: `${JD_API_HOST}?functionId=${functionId}&body=${encodeURIComponent(JSON.stringify(body))}&appid=CashRewardMiniH5Env&appid=9.1.0`,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Connection': 'keep-alive',
      'Content-Type': 'application/json',
      'Referer': 'http://wq.jd.com/wxapp/pages/hd-interaction/index/index',
      'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      'Accept-Language': 'zh-cn',
      'Accept-Encoding': 'gzip, deflate, br',
    }
  }
}

function getAuthorShareCode(url) {
  return new Promise(resolve => {
    const options = {
      url: `${url}?${new Date()}`, "timeout": 30000, headers: {
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
  })
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
        "Cookie": cookie,
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
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
