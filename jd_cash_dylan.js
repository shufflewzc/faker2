/*
签到领现金
活动入口：京东APP搜索领现金进入
更新时间：2022-08-02
定时自定义，一天跑两次就行了
 */

const $ = new Env('签到领现金_Dylan');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let jdNotify = true;
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message;
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
  await appindex(true)
}

async function appindex(info=false) {
  let functionId = "cash_homePage"
  let sign = `body=%7B%7D&build=167968&client=apple&clientVersion=10.4.0&d_brand=apple&d_model=iPhone13%2C3&ef=1&eid=eidI25488122a6s9Uqq6qodtQx6rgQhFlHkaE1KqvCRbzRnPZgP/93P%2BzfeY8nyrCw1FMzlQ1pE4X9JdmFEYKWdd1VxutadX0iJ6xedL%2BVBrSHCeDGV1&ep=%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22screen%22%3A%22CJO3CMeyDJCy%22%2C%22osVersion%22%3A%22CJUkDK%3D%3D%22%2C%22openudid%22%3A%22CJSmCWU0DNYnYtS0DtGmCJY0YJcmDwCmYJC0DNHwZNc5ZQU2DJc3Zq%3D%3D%22%2C%22area%22%3A%22CJZpCJCmC180ENcnCv80ENc1EK%3D%3D%22%2C%22uuid%22%3A%22aQf1ZRdxb2r4ovZ1EJZhcxYlVNZSZz09%22%7D%2C%22ts%22%3A1648428189%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D&ext=%7B%22prstate%22%3A%220%22%2C%22pvcStu%22%3A%221%22%7D&isBackground=N&joycious=104&lang=zh_CN&networkType=3g&networklibtype=JDNetworkBaseAF&partner=apple&rfs=0000&scope=11&sign=98c0ea91318ef1313786d86d832f1d4d&st=1648428208392&sv=101&uemps=0-0&uts=0f31TVRjBSv7E8yLFU2g86XnPdLdKKyuazYDek9RnAdkKCbH50GbhlCSab3I2jwM04d75h5qDPiLMTl0I3dvlb3OFGnqX9NrfHUwDOpTEaxACTwWl6n//EOFSpqtKDhg%2BvlR1wAh0RSZ3J87iAf36Ce6nonmQvQAva7GoJM9Nbtdah0dgzXboUL2m5YqrJ1hWoxhCecLcrUWWbHTyAY3Rw%3D%3D`
  return new Promise((resolve) => {
    $.post(apptaskUrl(functionId, sign), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`appindex API请求失败，请检查网路重试`)
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
              //console.log(`\n【京东账号${$.index}（${$.UserName}）的好友互助码】${data.data.result.invitedCode}\n`);
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
                } else if (task.type === 16 || task.type===3 || task.type===5 || task.type===17 || task.type===35)  {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await appdoTask(task.type, task.jump.params.url)
                    await $.wait(5000)
                  }
                }else if (task.type === 7) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await appdoTask(task.type, 1)
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
          console.log(`index API请求失败，请检查网路重试`)
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
                } else {
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

async function appdoTask(type,taskInfo) {
  let functionId = 'cash_doTask'
  let body = {"type":type,"taskInfo":taskInfo}
  for (let i=0; i<3; i++){
  var sign = await _0x5f5391(functionId, body)
  if(sign) break;
  await $.wait(5000)
  } 
  if(sign){
    return new Promise((resolve) => {
      $.post(apptaskUrl(functionId, sign), (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`appdoTask API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if(data.code === 0) {
                console.log(`任务完成成功`)
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
}

function doTask(type,taskInfo) {
  return new Promise((resolve) => {
    $.get(taskUrl("cash_doTask",{"type":type,"taskInfo":taskInfo}), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`doTask API请求失败，请检查网路重试`)
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


function randomString(e) {
  e = e || 32;
  let t = "abcdef0123456789", a = t.length, n = "";
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
function v(){const f=['6l2p5O246l+75OYpW4pdGEACV+wiLEwNREI3La','W6rRjeTz','gYxcPmkPWPC','AHLHWQLG','W6GQW5dcNq','WQK2WRneWPP/WRK3W49nwmkkWOC','WQhdMwitDmk+eMi+ba','WRfPsaJcLa','Ab/dUYuu','WO3dNSoQdSo8','W7itW4hcUCki','WP/cL0y4rhVdPCo7WOav','WQNcKmkwWRpdG8kcWQFdQq','WRpdMNhcVYS','zvGuvmo5','Et7dSZhcSweEkCoWWPS','WOFcGW1xkG','Asui','W4JdPNC','ASoNkSkEW70','WRahWR7cVSkr','WQLXWPhdNSo9WPKSjLjDBepcGG','W4BdLWb/bNFdUmkdWQe6WObFWPu','WRPTxCoNkG0','AZKiW43cK8olW5LCWPZdQW','WPBdKhxcIWW','WQFdRHlcN8k/WQSkW7lcUCkAxwTQ','WPpcIeigzq','6lYv5O2ggdFMNiFLIPRMIlNLIla','tHdcO8kLzq','WR4NW4ZcJCk1WPi','W6dcLN/dI8op','rWVcTCkiWPjDW6O','irRcQCkGWO0','zGxcNG','W4X5W7G0W7W','W7S9W6lcM8kv','WRldMbWpDCkJuxC','77Yv6ywp6kY044cl44kR44gs','DJddV8o1WRxdQNZdK8ko','y3SYwCkUsSocW6mCp1ldPCoS','6zEB5ysn6k+zaa','cqtdRCkfeG','WQ1nwYxcRW','WQ7dNcS6vW','W6LHCx8G','W7L7j1HswW','FY/dPJ4J','WR7cKmkRWRtdHCkzWRZdRCkfW6O','u8oHkCkSW7FcLa','aJBdRblcSh0D','WQ3dKvq','W4WmW4pcSCoS','WQpcHJ0kB0LA','Df0SECoHESkaWQG','wSoYx3Dp','wN7cH8oLumolASkxWQddUmolsXO','A2uhrW','WOtdM8oM','WQr/ECoMkW','vK8fqSkD','W4lcMLWqBWdcGW','W4BdLqT/a3FdSSknWPO7WOH1WPW','W6ZdH8o8W7/cGSoBW7JdM8khW4BcKZxcNW','WORcMCkSt8ke','bGNcJSkdWPfEW4VcImo2','WPzTWOdcJCo8ECkXWPJdGSkH','kJbCjhXAWO/dQ8kg','wY7cTZlcJSkxgq','W75rWRi8BCkuWPpdVmkeeq','W417eq','WQ8JW6pdN8ob','Eq/cMmkwCmoA','W4ddILhdUHC','WRHxWRddNCkjWR7dJwPkWOZdNNuq','6l6W5O+YWP0Z5P+B5yM35OMa5yUP','sSkItfldNCk2quPbdG','566J5zoY6i2Y5yYr5AAa6lEoW6xMJ6ZKU5VMLBm','rSkmW4agW48','WPxcJfyX','W4/dOSovFmkvh8kRD2DM','WRpdKmk9W6RdHSkCWR7cO8kxW6O','m2/cNmoYWPxdH0FdGW','DdBdV8k1W5/cMb3dVmkqpCkyW6GO','FXldNrGD','dSkTqW','WQXbCmo+hW','W5zRW4GtW6O','wdRdUZSo','W4RdGmotbmowx8oJFCkYWPe','Ce47mMm','6zAF5yEb6k2GW7O','FGFcKSkhAq','WRWTCr8jaamEgCo7vsDm','W4/dQxFdUcO','W4JcLLdcGNT1bG','wcTgWOTcESof','vI1gWP9xjSoeW6tcT8oI','WQ9JsSogjq','W4LdWQNcNa0ZW7H+W7Hn','mqrgoSkNjCowWPz6fCksib0','W4D8F2qb','W6VdIcCkja','WQddRXFcM8k/WQ8dW4BcM8kuyLD+','W7Pnu3yE','Agunju12'];v=function(){return f;};return v();}(function(S,y){function M(S,y,G,Z){return l(y-0x220,S);}const G=S();function W(S,y,G,Z){return l(G- -0x2a9,Z);}while(!![]){try{const Z=parseInt(W(-0x16a,-0x169,-0x156,'iMDg'))/(0xfa*-0x5+0x24c0+0x1*-0x1fdd)+-parseInt(M('I%bO',0x32c,0x34b,0x34e))/(-0x1d0b+0x217a+-0x46d)*(parseInt(W(-0x182,-0x1b3,-0x17e,'qwoW'))/(0x2*0x10f0+0x19dd*-0x1+-0x800))+-parseInt(M('o$7w',0x370,0x36a,0x391))/(-0x77c+-0x1b05+-0x1*-0x2285)*(parseInt(W(-0x1ad,-0x18c,-0x179,'apmF'))/(0x2106*0x1+0x11d0+0x32d1*-0x1))+parseInt(W(-0x138,-0x154,-0x16a,'g15W'))/(-0x2f5*-0x9+0xc8e+0x2725*-0x1)+-parseInt(W(-0x1ae,-0x196,-0x1a3,'iMDg'))/(-0x1cfd+-0x3dd+-0x1*-0x20e1)+parseInt(M('#5h[',0x33e,0x370,0x34f))/(0x63+-0x3*-0x8bf+-0x4*0x6a6)*(-parseInt(M('d5Ww',0x356,0x351,0x32a))/(0x1413*-0x1+0x13d9+-0x1*-0x43))+parseInt(W(-0x1ac,-0x1b6,-0x196,'g15W'))/(-0x284+-0x8d*0x46+0x291c)*(parseInt(M('dDG#',0x322,0x2f1,0x33d))/(0x7*0x2cc+-0x1*-0xb99+0x31d*-0xa));if(Z===y)break;else G['push'](G['shift']());}catch(t){G['push'](G['shift']());}}}(v,-0x50aaf*0x2+-0x78453+0x1d5593));function l(E,s){const S=v();return l=function(y,G){y=y-(-0xe03*-0x2+0xa7*0x13+0x3*-0xd28);let Z=S[y];if(l['KuudmS']===undefined){var t=function(h){const Y='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let b='',C='',P=b+t;for(let R=0x1*-0x2d7+0x1*0x1683+-0x13ac,m,r,I=-0x25cf+-0x104c+-0xf3*-0x39;r=h['charAt'](I++);~r&&(m=R%(-0x21e6+-0xd*0x14b+0x32b9*0x1)?m*(0x8f*0x2f+-0x121a*-0x2+0x7*-0x8e3)+r:r,R++%(0x228+-0x7*0x4fd+-0x20c7*-0x1))?b+=P['charCodeAt'](I+(-0xaf*-0x2+0x1aa0+-0x1bf4))-(-0x65d+0x89a+-0x233)!==0x1078+0x7c1+-0x1839?String['fromCharCode'](0x1df5+0xb88+-0x1*0x287e&m>>(-(-0x1bb9+0x1f6*-0xc+0x3343)*R&0xfb*-0x7+-0x239f+0x2a82)):R:-0xa2*0x1e+0x1055+-0x2a7*-0x1){r=Y['indexOf'](r);}for(let K=-0xb42+-0x1*0x2303+-0x5*-0x941,a=b['length'];K<a;K++){C+='%'+('00'+b['charCodeAt'](K)['toString'](0x2152+-0x5*-0x3d3+0xfd*-0x35))['slice'](-(-0x165f+0x10e+0x1553));}return decodeURIComponent(C);};const F=function(h,Y){let b=[],C=-0x225a+0x1554+0xd06,P,R='';h=t(h);let m;for(m=0x5b*-0x1+-0x1349*0x1+0x13a4;m<-0x255c+0x23f4+0xb*0x38;m++){b[m]=m;}for(m=-0x18fb+0x1*-0x5d+0xcac*0x2;m<-0x257d*-0x1+-0x1dcb+-0x6b2;m++){C=(C+b[m]+Y['charCodeAt'](m%Y['length']))%(-0x141e+-0x17dc+0x39*0xca),P=b[m],b[m]=b[C],b[C]=P;}m=-0x2286+-0x207a+-0x10c*-0x40,C=0xfaa+0x1ad9+-0x2a83;for(let r=-0x1*-0x11fb+0x5+-0x3*0x600;r<h['length'];r++){m=(m+(0xb4a+-0x1237+0x6ee))%(-0x1b67+0x7f9*0x1+-0x20b*-0xa),C=(C+b[m])%(0x17*-0x1a0+-0x3e1*0x4+0x35e4),P=b[m],b[m]=b[C],b[C]=P,R+=String['fromCharCode'](h['charCodeAt'](r)^b[(b[m]+b[C])%(-0x3df*0x5+-0x1*-0x12cf+0x18c)]);}return R;};l['gfNMdO']=F,E=arguments,l['KuudmS']=!![];}const z=S[-0x1*0x25a+-0x2305+-0xc75*-0x3],N=y+z,L=E[N];if(!L){if(l['LeFylT']===undefined){const h=function(Y){this['nFyMsQ']=Y,this['OlVtRQ']=[0x2327*-0x1+-0xf64+-0x287*-0x14,-0xef9+0x5*-0x529+0x28c6,-0x1*0x19f1+-0x1ccb+0xdaf*0x4],this['hsTgow']=function(){return'newState';},this['wEuAlu']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['UQMySH']='[\x27|\x22].+[\x27|\x22];?\x20*}';};h['prototype']['aqyekq']=function(){const Y=new RegExp(this['wEuAlu']+this['UQMySH']),b=Y['test'](this['hsTgow']['toString']())?--this['OlVtRQ'][0xbdb+0x185*0xb+-0x1c91*0x1]:--this['OlVtRQ'][-0x1*0xe8b+0x1*-0x150+0xfdb];return this['LEzOAm'](b);},h['prototype']['LEzOAm']=function(Y){if(!Boolean(~Y))return Y;return this['mZWkLI'](this['nFyMsQ']);},h['prototype']['mZWkLI']=function(Y){for(let b=0x1*-0x19cf+-0x17f3+0x31c2,C=this['OlVtRQ']['length'];b<C;b++){this['OlVtRQ']['push'](Math['round'](Math['random']())),C=this['OlVtRQ']['length'];}return Y(this['OlVtRQ'][-0x2268+0x21c+0x204c]);},new h(l)['aqyekq'](),l['LeFylT']=!![];}Z=l['gfNMdO'](Z,G),E[N]=Z;}else Z=L;return Z;},l(E,s);}const s=(function(){let S=!![];return function(y,G){const Z=S?function(){function H(S,y,G,Z){return l(Z- -0xd4,y);}if(G){const t=G[H(0x55,'Ev&e',0x84,0x70)](y,arguments);return G=null,t;}}:function(){};return S=![],Z;};}()),E=s(this,function(){const y={};function k(S,y,G,Z){return l(Z-0x171,G);}function V(S,y,G,Z){return l(S- -0x1c,y);}y[k(0x299,0x2d2,'4oyt',0x2c2)]=k(0x2cc,0x29b,'sCqO',0x2b6)+'+$';const G=y;return E[V(0xdc,'qwoW',0xe5,0x107)]()[V(0x139,'^tVq',0x133,0x13c)](G[k(0x2d8,0x2cf,'I%bO',0x2c9)])[k(0x28c,0x275,'JS*Q',0x282)]()[V(0x100,'qwoW',0x105,0x118)+'r'](E)[k(0x299,0x29d,'*[(x',0x28b)](G[V(0x11e,'07SZ',0xf1,0xff)]);});E();function getSignfromDY(S,y){const G={'bHXQz':function(z,N){return z!=N;},'YKvde':function(z,N){return z(N);},'dkpNR':U(0x2db,'JS*Q',0x305,0x2fe),'WnFUU':c(0x1b9,0x1a2,0x1e1,'hB)0'),'urSYG':c(0x20f,0x21e,0x23b,'UqCy'),'qKZaH':function(z,N){return z==N;},'jVbPD':U(0x2cb,'oVM]',0x2be,0x2ef),'OHHgT':function(z,N){return z!==N;},'hqWey':c(0x207,0x204,0x1f0,'[cEw'),'LBQmu':'签名获取失败,换个时'+U(0x30a,'iWrn',0x33c,0x319),'JhNBc':function(z,N){return z!==N;},'kNWeM':c(0x1b4,0x1ce,0x1ab,'dDG#')+U(0x31f,'JS*Q',0x343,0x2fe)+c(0x1c1,0x18e,0x1ca,'ECe#')+c(0x1f5,0x1f3,0x1dd,'gDh7')+U(0x310,'oH^f',0x2f4,0x322)+'dylan/gets'+c(0x1fe,0x1ec,0x1f3,'gDh7'),'eILkV':'applicatio'+c(0x1fa,0x203,0x1e0,'qwoW')+c(0x1eb,0x210,0x1cd,'0MKh')+'ded','HHBmY':function(z,N){return z(N);}};function U(S,y,G,Z){return l(S-0x1c3,y);}function c(S,y,G,Z){return l(S-0xbd,Z);}var Z='';let t=c(0x1ee,0x1ce,0x204,'y4eQ')+'='+S+c(0x1c7,0x1b2,0x1c3,'guXL')+G[U(0x2f8,'[cEw',0x30e,0x327)](encodeURIComponent,JSON[c(0x1ea,0x1cb,0x216,'I%bO')](y));return new Promise(z=>{function g(S,y,G,Z){return c(S-0x2cb,y-0x3a,G-0xee,G);}const N={'tmkcz':function(h,Y){function j(S,y,G,Z){return l(y-0x38,Z);}return G[j(0x153,0x14e,0x171,'iWrn')](h,Y);},'ejkYj':function(h,Y){return G['YKvde'](h,Y);},'nubah':J('XvUv',0x120,0x14c,0xee)+'+$','TwrHU':function(h,Y){return h===Y;},'vBNTb':G[J('dDG#',0xd8,0xe6,0xc4)],'DzZAv':G[J('7atX',0xd6,0xc6,0xb3)],'rdBar':G[g(0x4ab,0x47d,'$$A5',0x4de)],'QUprc':function(h,Y){function T(S,y,G,Z){return g(S- -0x237,y-0x84,y,Z-0x108);}return G[T(0x25c,'iMDg',0x285,0x290)](h,Y);},'mwEsb':G[J('guXL',0xc7,0xf0,0xa3)],'FXVOj':function(h,Y){function D(S,y,G,Z){return J(S,y- -0x18b,G-0xca,Z-0x4);}return G[D('IEco',-0x87,-0x8e,-0x6f)](h,Y);},'TgUJr':G[J('sCqO',0xfd,0x102,0xcd)],'fkvSl':g(0x4a8,0x4d8,'d5Ww',0x4d1),'mPIQZ':function(h,Y){function u(S,y,G,Z){return g(y- -0x483,y-0x167,S,Z-0x120);}return G[u('JuGl',0x2d,0x4f,0x62)](h,Y);},'SitQw':G['LBQmu'],'NeBoC':g(0x498,0x477,'guXL',0x4b0),'rQqLS':g(0x4de,0x4e9,'iMDg',0x503)+g(0x49a,0x4bb,'e&^7',0x4c4),'Uidwx':function(h,Y){return G['JhNBc'](h,Y);},'ZWFFG':g(0x4a3,0x49b,'Ev&e',0x482)};function J(S,y,G,Z){return c(y- -0xec,y-0xbe,G-0x9d,S);}const L={};L[J('x#Mw',0x103,0xfe,0xec)]=G[J('^tVq',0x117,0xf4,0x11d)],L[g(0x4c3,0x4ae,'dDG#',0x4cb)]=t,L[J('oVM]',0xf2,0xf6,0x115)]={},L[g(0x4d3,0x502,'6j)x',0x4e7)]=0x7530,L[J('oVM]',0xf2,0xf6,0x115)][g(0x483,0x47b,'#5h[',0x476)+'pe']=G[g(0x4ca,0x4a3,'VbCT',0x4f2)];let F=L;$[J('guXL',0x12b,0x146,0x101)](F,async(h,Y,b)=>{function x(S,y,G,Z){return g(G-0x10,y-0x1e3,S,Z-0x4f);}function q(S,y,G,Z){return J(Z,S- -0x28a,G-0xdb,Z-0x152);}if(N[x('2j$u',0x496,0x4b1,0x4e6)](N['vBNTb'],N[q(-0x1b0,-0x1aa,-0x198,'KuVF')])){F[x('7atX',0x4c0,0x4b7,0x497)](x('apmF',0x4e3,0x4cf,0x4f1));h['data']&&(r=I['data']||'');if(N[q(-0x171,-0x189,-0x16c,'KuVF')](C,''))N[x('o$7w',0x486,0x492,0x494)](K,a);else m[q(-0x1bb,-0x1c0,-0x1dc,'lt%f')](x('qwoW',0x503,0x4d1,0x4c7)+q(-0x1a4,-0x186,-0x1ab,'$$A5'));}else try{if(N[x('MPr7',0x47a,0x4a7,0x498)](N['rdBar'],N[q(-0x1c0,-0x1af,-0x18c,'7atX')])){if(b){b=JSON['parse'](b);if(b&&N[q(-0x1c5,-0x1d3,-0x199,'Ev&e')](b['code'],-0x20a6+-0xf*-0x1a1+-0x3*-0x2bd)){console[q(-0x193,-0x1c7,-0x18d,'kB&V')](N[q(-0x192,-0x16d,-0x1b5,'VbCT')]);if(b['data']){if(N[x('Ev&e',0x50d,0x4d8,0x4e6)](N[q(-0x1ac,-0x1af,-0x18e,'I%bO')],N[x('VbCT',0x4d2,0x4e6,0x504)]))Z=b['data']||'';else return G[x('o$7w',0x4eb,0x4ba,0x4e9)]()[q(-0x1b6,-0x1d0,-0x185,'VbCT')](jzvMDT[x('*[(x',0x4ca,0x4ef,0x4f9)])[q(-0x17b,-0x19d,-0x168,'g15W')]()[q(-0x17d,-0x14b,-0x16a,'6[4g')+'r'](Z)[x('KuVF',0x4f0,0x4cc,0x4cd)](jzvMDT[q(-0x1c6,-0x1f8,-0x1a9,'yV^X')]);}if(Z!='')N['mPIQZ'](z,Z);else console['log'](N[x('4oyt',0x4d3,0x4ec,0x4e7)]);}else console[q(-0x1ab,-0x1a3,-0x1e0,'KuVF')](b[x('ECe#',0x464,0x495,0x4c5)]);}else N['TwrHU'](N['NeBoC'],N[x('MPr7',0x4e5,0x4db,0x4f2)])?console[q(-0x193,-0x186,-0x17f,'kB&V')](N[q(-0x1a2,-0x1d2,-0x199,'yV^X')]):Z[x('9QmH',0x4d2,0x4b5,0x495)](t,z);}else G=Z[q(-0x194,-0x170,-0x1ac,'JuGl')]||'';}catch(r){if(N[q(-0x1ba,-0x1ec,-0x188,'9QmH')](N[q(-0x1b9,-0x196,-0x199,'gh40')],N[q(-0x160,-0x175,-0x152,'oH^f')])){if(t){const K=F['apply'](h,arguments);return Y=null,K;}}else $['logErr'](r,Y);}finally{N[q(-0x1c4,-0x19a,-0x1c6,'kB&V')](z,Z);}});});}
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
