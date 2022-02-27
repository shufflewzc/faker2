/*
东东超市兑换奖品 脚本地址：https://raw.githubusercontent.com/Aaron-lv/sync/jd_scripts/jd_blueCoin.js
感谢@yangtingxiao提供PR
更新时间：2021-6-7
活动入口：京东APP我的-更多工具-东东超市
支持京东多个账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
============QuantumultX==============
[task_local]
#东东超市兑换奖品
59 23 * * * https://raw.githubusercontent.com/Aaron-lv/sync/jd_scripts/jd_blueCoin.js, tag=东东超市兑换奖品, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jxc.png, enabled=true

====================Loon=================
[Script]
cron "59 23 * * *" script-path=https://raw.githubusercontent.com/Aaron-lv/sync/jd_scripts/jd_blueCoin.js,tag=东东超市兑换奖品

===================Surge==================
东东超市兑换奖品 = type=cron,cronexp="59 23 * * *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/Aaron-lv/sync/jd_scripts/jd_blueCoin.js

============小火箭=========
东东超市兑换奖品 = type=cron,script-path=https://raw.githubusercontent.com/Aaron-lv/sync/jd_scripts/jd_blueCoin.js, cronexpr="59 23 * * *", timeout=3600, enable=true
 */
const $ = new Env('东东超市兑换奖品');
const notify = $.isNode() ? require('./sendNotify') : '';
let allMessage = '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let coinToBeans = $.getdata('coinToBeans') || 0; //兑换多少数量的京豆（20或者1000），0表示不兑换，默认不兑换京豆，如需兑换把0改成20或者1000，或者'商品名称'(商品名称放到单引号内)即可
let jdNotify = false;//是否开启静默运行，默认false关闭(即:奖品兑换成功后会发出通知提示)
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

const JD_API_HOST = `https://api.m.jd.com/api?appid=jdsupermarket`;
Date.prototype.Format = function (fmt) { //author: meizz
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    cookie = cookiesArr[i];
    if (cookie) {
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.data = {};
      $.coincount = 0;
      $.beanscount = 0;
      $.blueCost = 0;
      $.errBizCodeCount = 0;
      $.coinerr = "";
      $.beanerr = "";
      $.title = '';
      //console.log($.coincount);
      $.isLogin = true;
      $.nickName = '';
      await TotalBean();
      console.log(`\n****开始【京东账号${$.index}】${$.nickName || $.UserName}****\n`);
      // console.log(`目前暂无兑换酒类的奖品功能，即使输入酒类名称，脚本也会提示下架\n`)
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName || $.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      //先兑换京豆
      if ($.isNode()) {
        if (process.env.MARKET_COIN_TO_BEANS) {
          coinToBeans = process.env.MARKET_COIN_TO_BEANS;
        }
      }
      try {
        if (`${coinToBeans}` !== '0') {
          await smtgHome();//查询蓝币数量，是否满足兑换的条件
          await PrizeIndex();
        } else {
          console.log('查询到您设置的是不兑换京豆选项，现在为您跳过兑换京豆。如需兑换，请去BoxJs设置或者修改脚本coinToBeans或设置环境变量MARKET_COIN_TO_BEANS\n')
        }
        await msgShow();
      } catch (e) {
        $.logErr(e)
      }
    }
  }
  if ($.isNode() && allMessage && $.ctrTemp) {
    await notify.sendNotify(`${$.name}`, `${allMessage}`)
  }
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done())

async function PrizeIndex() {
  let nowtime = new Date().Format("s.S")
  let starttime = $.isNode() ? (process.env.SM_STARTTIME ? process.env.SM_STARTTIME * 1 : 60) : ($.getdata('SM_STARTTIME') ? $.getdata('SM_STARTTIME') * 1 : 60);
  if(nowtime < 59) {
    let sleeptime = (starttime - nowtime) * 1000;
    console.log(`等待时间 ${sleeptime / 1000}`);
    await sleep(sleeptime)
  }
  await smtg_queryPrize();
  // await smtg_materialPrizeIndex();//兑换酒类奖品，此兑换API与之前的兑换京豆类的不一致，故目前无法进行
  // await Promise.all([
  //   smtg_queryPrize(),
  //   smtg_materialPrizeIndex()
  // ])
  // const prizeList = [...$.queryPrizeData, ...$.materialPrizeIndex];
  const prizeList = [...$.queryPrizeData];
  if (prizeList && prizeList.length) {
    if (`${coinToBeans}` === '1000') {
      if (prizeList[1] && prizeList[1].type === 3) {
        console.log(`查询换${prizeList[1].name}ID成功，ID:${prizeList[1].prizeId}`)
        $.title = prizeList[1].name;
        $.blueCost = prizeList[1].cost;
      } else {
        console.log(`查询换1000京豆ID失败`)
        $.beanerr = `东哥今天不给换`;
        return ;
      }
      // if (prizeList[1] && prizeList[1].status === 2) {
      //   $.beanerr = `失败，1000京豆领光了，请明天再来`;
      //   return ;
      // }
      if (prizeList[1] && prizeList[1].limit === prizeList[1] && prizeList[1].finished) {
        $.beanerr = `${prizeList[1].name}`;
        return ;
      }
      //兑换1000京豆
      if ($.totalBlue > $.blueCost) {
        for (let j = 0; j <= 10; j++) {
          await smtg_obtainPrize(prizeList[1].prizeId);
          if ($.errBizCodeCount >= 15) break
        }
      } else {
        console.log(`兑换失败,您目前蓝币${$.totalBlue}个,不足以兑换${$.title}所需的${$.blueCost}个`);
        $.beanerr = `兑换失败,您目前蓝币${$.totalBlue}个,不足以兑换${$.title}所需的${$.blueCost}个`;
      }
    } else if (`${coinToBeans}` === '20') {
      if (prizeList[0] && prizeList[0].type === 3) {
        console.log(`查询换${prizeList[0].name}ID成功，ID:${prizeList[0].prizeId}`)
        $.title = prizeList[0].name;
        $.blueCost = prizeList[0].cost;
      } else {
        console.log(`查询换万能的京豆ID失败`)
        $.beanerr = `东哥今天不给换`;
        return ;
      }
      // if (prizeList[0] && prizeList[0].status === 2) {
      //   console.log(`失败，万能的京豆领光了，请明天再来`);
      //   $.beanerr = `失败，万能的京豆领光了，请明天再来`;
      //   return ;
      // }
      if ((prizeList[0] && prizeList[0].limit) === (prizeList[0] && prizeList[0].finished)) {
        $.beanerr = `${prizeList[0].name}`;
        return ;
      }
      //兑换万能的京豆(1-20京豆)
      if ($.totalBlue > $.blueCost) {
        for (let j = 0; j <= 10; j++) {
          await smtg_obtainPrize(prizeList[0].prizeId, 1000);
          if ($.errBizCodeCount >= 15) break
        }
      } else {
        console.log(`兑换失败,您目前蓝币${$.totalBlue}个,不足以兑换${$.title}所需的${$.blueCost}个`);
        $.beanerr = `兑换失败,您目前蓝币${$.totalBlue}个,不足以兑换${$.title}所需的${$.blueCost}个`;
      }
    } else {
      //自定义输入兑换
      console.log(`\n\n温馨提示：需兑换商品的名称设置请尽量与其他商品有区分度，否则可能会兑换成其他类似商品\n\n`)
      let prizeId = '', i;
      for (let index = 0; index < prizeList.length; index ++) {
        if (prizeList[index].name.indexOf(coinToBeans) > -1) {
          prizeId = prizeList[index].prizeId;
          i = index;
          $.title = prizeList[index].name;
          $.blueCost = prizeList[index].cost;
          $.type = prizeList[index].type;
          $.beanType = prizeList[index].hasOwnProperty('beanType');
        }
      }
      if (prizeId) {
        if (prizeList[i].inStock === 506 || prizeList[i].inStock === -1) {
          console.log(`失败，您输入设置的${coinToBeans}领光了，请明天再来`);
          $.beanerr = `失败，您输入设置的${coinToBeans}领光了，请明天再来`;
          return ;
        }
        if ((prizeList[i].targetNum) && prizeList[i].targetNum === prizeList[i].finishNum) {
          $.beanerr = `${prizeList[0].subTitle}`;
          return ;
        }
        if ($.totalBlue > $.blueCost) {
          if ($.type === 4 && !$.beanType) {
            for (let j = 0; j <= 10; j++) {
              await smtg_obtainPrize(prizeId, 0, "smtg_lockMaterialPrize")
              if ($.errBizCodeCount >= 15) break
            }
          } else {
            for (let j = 0; j <= 10; j++) {
              await smtg_obtainPrize(prizeId);
              if ($.errBizCodeCount >= 15) break
            }
          }
        } else {
          console.log(`兑换失败,您目前蓝币${$.totalBlue}个,不足以兑换${$.title}所需的${$.blueCost}个`);
          $.beanerr = `兑换失败,您目前蓝币${$.totalBlue}个,不足以兑换${$.title}所需的${$.blueCost}个`;
        }
      } else {
        console.log(`奖品兑换列表【${coinToBeans}】已下架，请检查活动页面是否存在此商品，如存在请检查您的输入是否正确`);
        $.beanerr = `奖品兑换列表【${coinToBeans}】已下架`;
      }
    }
  }
}
//查询白酒类奖品列表API
function smtg_materialPrizeIndex(timeout = 0) {
  $.materialPrizeIndex = [];
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}&functionId=smtg_materialPrizeIndex&clientVersion=8.0.0&client=m&body=%7B%22channel%22:%221%22%7D&t=${Date.now()}`,
        headers : {
          'Origin' : `https://jdsupermarket.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `application/json, text/plain, */*`,
          'Referer' : `https://jdsupermarket.jd.com/game/?tt=1597540727225`,
          'Host' : `api.m.jd.com`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        }
      }
      $.post(url, async (err, resp, data) => {
        try {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data.bizCode !== 0) {
              $.beanerr = `${data.data.bizMsg}`;
              return
            }
            $.materialPrizeIndex = data.data.result.prizes || [];
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve()
        }
      })
    },timeout)
  })
}
//查询任务
function smtg_queryPrize(timeout = 0){
  $.queryPrizeData = [];
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}&functionId=smt_queryPrizeAreas&clientVersion=8.0.0&client=m&body=%7B%22channel%22%3A%2218%22%7D&t=${Date.now()}`,
        headers : {
          'Origin' : `https://jdsupermarket.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `application/json, text/plain, */*`,
          'Referer' : `https://jdsupermarket.jd.com/game/?tt=1597540727225`,
          'Host' : `api.m.jd.com`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        }
      }
      $.post(url, async (err, resp, data) => {
        try {
          if (safeGet(data)) {
            data = JSON.parse(data);
            // $.queryPrizeData = data;
            if (data.data.bizCode !== 0) {
              console.log(`${data.data.bizMsg}\n`)
              $.beanerr = `${data.data.bizMsg}`;
              return
            }
            if (data.data.bizCode === 0) {
              const { areas } = data.data.result;
              const prizes = areas.filter(vo => vo['type'] === 4);
              if (prizes && prizes[0]) {
                $.areaId = prizes[0].areaId;
                $.periodId = prizes[0].periodId;
                $.queryPrizeData = prizes[0].prizes || [];
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve()
        }
      })
    },timeout)
  })
}
//换京豆
function smtg_obtainPrize(prizeId, timeout = 0, functionId = 'smt_exchangePrize') {
  //1000京豆，prizeId为4401379726
  const body = {
    "connectId": prizeId,
    "areaId": $.areaId,
    "periodId": $.periodId,
    "informationParam": {
      "eid": "",
      "referUrl": -1,
      "shshshfp": "",
      "openId": -1,
      "isRvc": 0,
      "fp": -1,
      "shshshfpa": "",
      "shshshfpb": "",
      "userAgent": -1
    },
    "channel": "18"
  }
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `${JD_API_HOST}&functionId=${functionId}&clientVersion=8.0.0&client=m&body=${encodeURIComponent(JSON.stringify(body))}&t=${Date.now()}`,
        headers : {
          'Origin' : `https://jdsupermarket.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `application/json, text/plain, */*`,
          'Referer' : `https://jdsupermarket.jd.com/game/?tt=1597540727225`,
          'Host' : `api.m.jd.com`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        }
      }
      $.post(url, async (err, resp, data) => {
        try {
          console.log(`兑换结果:${data}`);
          if (safeGet(data)) {
            data = JSON.parse(data);
            $.data = data;
            if ($.data.data.bizCode !== 0 && $.data.data.bizCode !== 400) {
              $.beanerr = `${$.data.data.bizMsg}`;
              //console.log(`【京东账号${$.index}】${$.nickName} 换取京豆失败：${$.data.data.bizMsg}`)
              return
            }
            if ($.data.data.bizCode === 400) {
              $.errBizCodeCount ++;
              console.log(`debug 兑换京豆活动火爆次数:${$.errBizCodeCount}`);
              return
            }
            if ($.data.data.bizCode === 0) {
              if (`${coinToBeans}` === '1000') {
                $.beanscount ++;
                console.log(`【京东账号${$.index}】${$.nickName || $.UserName} 第${$.data.data.result.count}次换${$.title}成功`)
                if ($.beanscount === 1) return;
              } else if (`${coinToBeans}` === '20') {
                $.beanscount ++;
                console.log(`【京东账号${$.index}】${$.nickName || $.UserName} 第${$.data.data.result.count}次换${$.title}成功`)
                if ($.data.data.result.count === 20 || $.beanscount === coinToBeans || $.data.data.result.blue < $.blueCost) return;
              } else {
                $.beanscount ++;
                console.log(`【京东账号${$.index}】${$.nickName || $.UserName} 第${$.data.data.result.count}次换${$.title}成功`)
                if ($.beanscount === 1) return;
              }
            }
          }
          await smtg_obtainPrize(prizeId, 3000);
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve()
        }
      })
    },timeout)
  })
}
function smtgHome() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_newHome'), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市兑换奖品: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            // console.log(data)
            if (data.data.bizCode === 0) {
              const { result } = data.data;
              $.totalBlue = result.totalBlue;
              console.log(`【总蓝币】${$.totalBlue}个\n`);
            }
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
function sleep(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}
//通知
function msgShow() {
  // $.msg($.name, ``, `【京东账号${$.index}】${$.nickName}\n【收取蓝币】${$.coincount ? `${$.coincount}个` : $.coinerr }${coinToBeans ? `\n【兑换京豆】${ $.beanscount ? `${$.beanscount}个` : $.beanerr}` : ""}`);
  return new Promise(async resolve => {
    $.log(`\n【京东账号${$.index}】${$.nickName || $.UserName}\n${coinToBeans ? `【兑换${$.title}】${$.beanscount ? `成功` : $.beanerr}` : "您设置的是不兑换奖品"}\n`);
    if ($.isNode() && process.env.MARKET_REWARD_NOTIFY) {
      $.ctrTemp = `${process.env.MARKET_REWARD_NOTIFY}` === 'false';
    } else if ($.getdata('jdSuperMarketRewardNotify')) {
      $.ctrTemp = $.getdata('jdSuperMarketRewardNotify') === 'false';
    } else {
      $.ctrTemp = `${jdNotify}` === 'false';
    }
    //默认只在兑换奖品成功后弹窗提醒。情况情况加，只打印日志，不弹窗
    if ($.beanscount && $.ctrTemp) {
      $.msg($.name, ``, `【京东账号${$.index}】${$.nickName || $.UserName}\n${coinToBeans ? `【兑换${$.title}】${ $.beanscount ? `成功，数量：${$.beanscount}个` : $.beanerr}` : "您设置的是不兑换奖品"}`);
      allMessage += `【京东账号${$.index}】${$.nickName || $.UserName}\n${coinToBeans ? `【兑换${$.title}】${$.beanscount ? `成功，数量：${$.beanscount}个` : $.beanerr}` : "您设置的是不兑换奖品"}${$.index !== cookiesArr.length ? '\n\n' : ''}`
      // if ($.isNode()) {
      //   await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】${$.nickName}\n${coinToBeans ? `【兑换${$.title}】${$.beanscount ? `成功，数量：${$.beanscount}个` : $.beanerr}` : "您设置的是不兑换奖品"}`)
      // }
    }
    resolve()
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
function taskUrl(function_id, body = {}) {
  return {
    url: `${JD_API_HOST}&functionId=${function_id}&clientVersion=8.0.0&client=m&body=${escape(JSON.stringify(body))}&t=${Date.now()}`,
    headers: {
      'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      'Host': 'api.m.jd.com',
      'Cookie': cookie,
      'Referer': 'https://jdsupermarket.jd.com/game',
      'Origin': 'https://jdsupermarket.jd.com',
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
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}