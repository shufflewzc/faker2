/*
东东水果:脚本更新地址 jd_fruit.js
活动入口：京东APP我的-更多工具-东东农场
东东农场活动链接：https://h5.m.jd.com/babelDiy/Zeus/3KSjXqQabiTuD1cJ28QskrpWoBKT/index.html
已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
互助码shareCode请先手动运行脚本查看打印可看到
一天只能帮助3个人。多出的助力码无效
==========================Quantumultx=========================
[task_local]
#jd免费水果
5 6-18/6 * * * jd_fruit.js, tag=东东农场, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jdnc.png, enabled=true
=========================Loon=============================
[Script]
cron "5 6-18/6 * * *" script-path=jd_fruit.js,tag=东东农场

=========================Surge============================
东东农场 = type=cron,cronexp="5 6-18/6 * * *",wake-system=1,timeout=3600,script-path=jd_fruit.js

=========================小火箭===========================
东东农场 = type=cron,script-path=jd_fruit.js, cronexpr="5 6-18/6 * * *", timeout=3600, enable=true

export DO_TEN_WATER_AGAIN="" 默认再次浇水

*/


const $ = new Env("东东农场");
let cookiesArr = [],
  cookie = "",
  jdFruitShareArr = [],
  isBox = false,
  notify,
  newShareCodes,
  allMessage = "";
//助力好友分享码(最多3个,否则后面的助力失败),原因:京东农场每人每天只有3次助力机会
//此此内容是IOS用户下载脚本到本地使用，填写互助码的地方，同一京东账号的好友互助码请使用@符号隔开。
//下面给出两个账号的填写示例（iOS只支持2个京东账号）
let shareCodes = [
  // 这个列表填入你要助力的好友的shareCode
  //账号一的好友shareCode,不同好友的shareCode中间用@符号隔开
  "",
  //账号二的好友shareCode,不同好友的shareCode中间用@符号隔开
  "",
];
let message = "",
  subTitle = "",
  option = {},
  isFruitFinished = false;
const retainWater = 100; //保留水滴大于多少g,默认100g;
let jdNotify = false; //是否关闭通知，false打开通知推送，true关闭通知推送
let jdFruitBeanCard = false; //农场使用水滴换豆卡(如果出现限时活动时100g水换20豆,此时比浇水划算,推荐换豆),true表示换豆(不浇水),false表示不换豆(继续浇水),脚本默认是浇水
let randomCount = $.isNode() ? 20 : 5;
const urlSchema = `openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22https://h5.m.jd.com/babelDiy/Zeus/3KSjXqQabiTuD1cJ28QskrpWoBKT/index.html%22%20%7D`;
// const { randomString } = require("./utils/mainUtils");
let sid;
let version = 18;
!(async () => {
  await requireConfig();
  if (!cookiesArr[0]) {
    $.msg($.name, "【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取", "https://bean.m.jd.com/bean/signIndex.action", { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
      $.pin = cookie.match(/pt_pin=([^; ]+)(?=;?)/)?.[1] || ""
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = "";
      await TotalBean();
      console.log(`\n开始【京东账号${$.index}】${$.nickName || $.UserName}\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue;
      }
      message = "";
      subTitle = "";
      option = {};
      $.UA = $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : require("./USER_AGENTS").USER_AGENT) : $.getdata("JDUA") ? $.getdata("JDUA") : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1";
      await shareCodesFormat();
      await jdFruit();
    }
  }
  if ($.isNode() && allMessage && $.ctrTemp) {
    await notify.sendNotify(`${$.name}`, `${allMessage}`);
  }
})()
  .catch((e) => {
    $.log("", `❌ ${$.name}, 失败! 原因: ${e}!`, "");
  })
  .finally(() => {
    $.done();
  });

async function jdFruit() {
  subTitle = `【京东账号${$.index}】${$.nickName || $.UserName}`;
  sid = randomString();
  try {
    $.farmInfo = await doApi("initForFarm", { babelChannel: "121", sid, version, channel: 1 }, 0);
    if ($.farmInfo.farmUserPro) {
      // option['media-url'] = $.farmInfo.farmUserPro.goodsImage;
      message = `【水果名称】${$.farmInfo.farmUserPro.name}\n`;
      console.log(`\n【京东账号${$.index}（${$.UserName}）的${$.name}好友互助码】${$.farmInfo.farmUserPro.shareCode}\n`);
      console.log(`\n【已成功兑换水果】${$.farmInfo.farmUserPro.winTimes}次\n`);
      message += `【已兑换水果】${$.farmInfo.farmUserPro.winTimes}次\n`;
      await masterHelpShare(); //助力好友
      if ($.farmInfo.treeState === 2 || $.farmInfo.treeState === 3) {
        option["open-url"] = urlSchema;
        $.msg($.name, ``, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.farmInfo.farmUserPro.name}已可领取\n请去京东APP或微信小程序查看\n点击弹窗即达`, option);
        if ($.isNode()) {
          await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName || $.UserName}水果已可领取`, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.farmInfo.farmUserPro.name}已可领取\n请去京东APP或微信小程序查看`);
        }
        return;
      } else if ($.farmInfo.treeState === 1) {
        console.log(`\n${$.farmInfo.farmUserPro.name}种植中...\n`);
      } else if ($.farmInfo.treeState === 0) {
        //已下单购买, 但未开始种植新的水果
        option["open-url"] = urlSchema;
        $.msg($.name, ``, `【京东账号${$.index}】 ${$.nickName || $.UserName}\n【提醒⏰】您忘了种植新的水果\n请去京东APP或微信小程序选购并种植新的水果\n点击弹窗即达`, option);
        if ($.isNode()) {
          await notify.sendNotify(`${$.name} - 您忘了种植新的水果`, `京东账号${$.index} ${$.nickName || $.UserName}\n【提醒⏰】您忘了种植新的水果\n请去京东APP或微信小程序选购并种植新的水果`);
        }
        return;
      }
      await doDailyTask();
      await doTenWater(); //浇水十次
      await getFirstWaterAward(); //领取首次浇水奖励
      await getTenWaterAward(); //领取10浇水奖励
      await getWaterFriendGotAward(); //领取为2好友浇水奖励
      await duck();
      if (!process.env.DO_TEN_WATER_AGAIN) {
        console.log("执行再次浇水");
        await doTenWaterAgain(); //再次浇水
      } else {
        console.log("不执行再次浇水，攒水滴");
      }
      await predictionFruit(); //预测水果成熟时间
    } else {
      console.log(`初始化农场数据异常, 请登录京东 app查看农场0元水果功能是否正常,农场初始化数据: ${JSON.stringify($.farmInfo)}`);
      message = `【数据异常】请手动登录京东app查看此账号${$.name}是否正常`;
    }
  } catch (e) {
    console.log(`任务执行异常，请检查执行日志 ‼️‼️`);
    $.logErr(e);
    const errMsg = `京东账号${$.index} ${$.nickName || $.UserName}\n任务执行异常，请检查执行日志 ‼️‼️`;
    if ($.isNode()) await notify.sendNotify(`${$.name}`, errMsg);
    $.msg($.name, "", `${errMsg}`);
  }
  await showMsg();
}
async function doDailyTask() {
  $.farmTask = await doApi("taskInitForFarm", { version, channel: 1, babelChannel: "121" }, 0);
  // console.log(`开始签到`);
  // if (!$.farmTask.signInit.todaySigned) {
  //   await signForFarm(); //签到
  //   if ($.signResult.code === "0") {
  //     console.log(`【签到成功】获得${$.signResult.amount}g💧\\n`);
  //     //message += `【签到成功】获得${$.signResult.amount}g💧\n`//连续签到${signResult.signDay}天
  //   } else {
  //     // message += `签到失败,详询日志\n`;
  //     console.log(`签到结果:  ${JSON.stringify($.signResult)}`);
  //   }
  // } else {
  //   console.log(`今天已签到,连续签到${$.farmTask.signInit.totalSigned},下次签到可得${$.farmTask.signInit.signEnergyEachAmount}g\n`);
  // }
  // 被水滴砸中
  console.log(`被水滴砸中： ${$.farmInfo.todayGotWaterGoalTask.canPop ? "是" : "否"}`);
  if ($.farmInfo.todayGotWaterGoalTask.canPop) {
    $.goalResult = await doApi("gotWaterGoalTaskForFarm", { type: 3, version, channel: 1, babelChannel: "121" }, 0);
    if ($.goalResult.code === "0") {
      console.log(`【被水滴砸中】获得${$.goalResult.addEnergy}g💧\\n`);
      // message += `【被水滴砸中】获得${$.goalResult.addEnergy}g💧\n`
    }
  }
  console.log(`签到结束,开始广告浏览任务`);
  if (!$.farmTask.gotBrowseTaskAdInit.f) {
    let adverts = $.farmTask.gotBrowseTaskAdInit.userBrowseTaskAds;
    let browseReward = 0;
    let browseSuccess = 0;
    let browseFail = 0;
    for (let advert of adverts) {
      //开始浏览广告
      if (advert.limit <= advert.hadFinishedTimes) {
        // browseReward+=advert.reward
        console.log(`${advert.mainTitle}+ ' 已完成`); //,获得${advert.reward}g
        continue;
      }
      console.log("正在进行广告浏览任务: " + advert.mainTitle);
      $.browseResult = await doApi("browseAdTaskForFarm", { advertId: advert.advertId, type: 0, version, channel: 1, babelChannel: "121" }, 0);
      if ($.browseResult.code === "0") {
        console.log(`${advert.mainTitle}浏览任务完成`);
        //领取奖励
        $.browseRwardResult = await doApi("browseAdTaskForFarm", { advertId: advert.advertId, type: 1, version, channel: 1, babelChannel: "121" }, 0);
        if ($.browseRwardResult.code === "0") {
          console.log(`领取浏览${advert.mainTitle}广告奖励成功,获得${$.browseRwardResult.amount}g`);
          browseReward += $.browseRwardResult.amount;
          browseSuccess++;
        } else {
          browseFail++;
          console.log(`领取浏览广告奖励结果:  ${JSON.stringify($.browseRwardResult)}`);
        }
      } else {
        browseFail++;
        console.log(`广告浏览任务结果:   ${JSON.stringify($.browseResult)}`);
      }
    }
    if (browseFail > 0) {
      console.log(`【广告浏览】完成${browseSuccess}个,失败${browseFail},获得${browseReward}g💧\\n`);
      // message += `【广告浏览】完成${browseSuccess}个,失败${browseFail},获得${browseReward}g💧\n`;
    } else {
      console.log(`【广告浏览】完成${browseSuccess}个,获得${browseReward}g💧\n`);
      // message += `【广告浏览】完成${browseSuccess}个,获得${browseReward}g💧\n`;
    }
  } else {
    console.log(`今天已经做过浏览广告任务\n`);
  }
  //定时领水
  if (!$.farmTask.gotThreeMealInit.f) {
    $.threeMeal = await doApi("gotThreeMealForFarm", { type: 0, version, channel: 1, babelChannel: "121" }, 0);
    if ($.threeMeal.code === "0") {
      console.log(`【定时领水】获得${$.threeMeal.amount}g💧\n`);
      // message += `【定时领水】获得${$.threeMeal.amount}g💧\n`;
    } else {
      // message += `【定时领水】失败,详询日志\n`;
      console.log(`定时领水成功结果:  ${JSON.stringify($.threeMeal)}`);
    }
  } else {
    console.log("当前不在定时领水时间断或者已经领过\n");
  }
  //给好友浇水
  if (!$.farmTask.waterFriendTaskInit.f) {
    if ($.farmTask.waterFriendTaskInit.waterFriendCountKey < $.farmTask.waterFriendTaskInit.waterFriendMax) {
      await doFriendsWater();
    }
  } else {
    console.log(`给${$.farmTask.waterFriendTaskInit.waterFriendMax}个好友浇水任务已完成\n`);
  }
  // await Promise.all([
  //   clockInIn(),//打卡领水
  //   executeWaterRains(),//水滴雨
  //   masterHelpShare(),//助力好友
  //   getExtraAward(),//领取额外水滴奖励
  //   turntableFarm()//天天抽奖得好礼
  // ])
  await getAwardInviteFriend();
  await clockInIn(); //打卡领水
  await executeWaterRains(); //水滴雨
  await getExtraAward(); //领取额外水滴奖励
  await turntableFarm(); //天天抽奖得好礼
}
async function predictionFruit() {
  console.log("开始预测水果成熟时间\n");
  $.farmInfo = await doApi("initForFarm", { babelChannel: "121", sid, version, channel: 1 }, 0);
  $.farmTask = await doApi("taskInitForFarm", { version, channel: 1, babelChannel: "121" }, 0);
  let waterEveryDayT = $.farmTask.totalWaterTaskInit.totalWaterTaskTimes; //今天到到目前为止，浇了多少次水
  message += `【今日共浇水】${waterEveryDayT}次\n`;
  message += `【剩余 水滴】${$.farmInfo.farmUserPro.totalEnergy}g💧\n`;
  message += `【水果🍉进度】${(($.farmInfo.farmUserPro.treeEnergy / $.farmInfo.farmUserPro.treeTotalEnergy) * 100).toFixed(2)}%，已浇水${$.farmInfo.farmUserPro.treeEnergy / 10}次,还需${($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy) / 10}次\n`;
  if ($.farmInfo.toFlowTimes > $.farmInfo.farmUserPro.treeEnergy / 10) {
    message += `【开花进度】再浇水${$.farmInfo.toFlowTimes - $.farmInfo.farmUserPro.treeEnergy / 10}次开花\n`;
  } else if ($.farmInfo.toFruitTimes > $.farmInfo.farmUserPro.treeEnergy / 10) {
    message += `【结果进度】再浇水${$.farmInfo.toFruitTimes - $.farmInfo.farmUserPro.treeEnergy / 10}次结果\n`;
  }
  // 预测n天后水果课可兑换功能
  let waterTotalT = ($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy - $.farmInfo.farmUserPro.totalEnergy) / 10; //一共还需浇多少次水

  let waterD = Math.ceil(waterTotalT / waterEveryDayT);

  message += `【预测】${waterD === 1 ? "明天" : waterD === 2 ? "后天" : waterD + "天之后"}(${timeFormat(24 * 60 * 60 * 1000 * waterD + Date.now())}日)可兑换水果🍉`;
}
//浇水十次
async function doTenWater() {
  jdFruitBeanCard = $.getdata("jdFruitBeanCard") ? $.getdata("jdFruitBeanCard") : jdFruitBeanCard;
  if ($.isNode() && process.env.FRUIT_BEAN_CARD) {
    jdFruitBeanCard = process.env.FRUIT_BEAN_CARD;
  }
  $.myCardInfoRes = await doApi("myCardInfoForFarm", { version, channel: 1, babelChannel: 0 }, 0);
  const { fastCard, doubleCard, beanCard, signCard } = $.myCardInfoRes;
  if (`${jdFruitBeanCard}` === "true" && JSON.stringify($.myCardInfoRes).match(`限时翻倍`) && beanCard > 0) {
    console.log(`您设置的是使用水滴换豆卡，且背包有水滴换豆卡${beanCard}张, 跳过10次浇水任务`);
    return;
  }
  if ($.farmTask.totalWaterTaskInit.totalWaterTaskTimes < $.farmTask.totalWaterTaskInit.totalWaterTaskLimit) {
    console.log(`\n准备浇水十次`);
    let waterCount = 0;
    isFruitFinished = false;
    for (; waterCount < $.farmTask.totalWaterTaskInit.totalWaterTaskLimit - $.farmTask.totalWaterTaskInit.totalWaterTaskTimes; waterCount++) {
      console.log(`第${waterCount + 1}次浇水`);
      await $.wait(2000);
      $.waterResult = await doApi("waterGoodForFarm", { type: "", version, channel: 1, babelChannel: 0 }, 0);
      console.log(`本次浇水结果:   ${JSON.stringify($.waterResult)}`);
      if ($.waterResult.code === "0") {
        console.log(`剩余水滴${$.waterResult.totalEnergy}g`);
        if ($.waterResult.finished) {
          // 已证实，waterResult.finished为true，表示水果可以去领取兑换了
          isFruitFinished = true;
          break;
        } else {
          if ($.waterResult.totalEnergy < 10) {
            console.log(`水滴不够，结束浇水`);
            break;
          }
          await gotStageAward(); //领取阶段性水滴奖励
        }
      } else {
        console.log("浇水出现失败异常,跳出不在继续浇水");
        break;
      }
    }
    if (isFruitFinished) {
      option["open-url"] = urlSchema;
      $.msg($.name, ``, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.farmInfo.farmUserPro.name}已可领取\n请去京东APP或微信小程序查看\n点击弹窗即达`, option);
      $.done();
      if ($.isNode()) {
        await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName || $.UserName}水果已可领取`, `京东账号${$.index} ${$.nickName || $.UserName}\n${$.farmInfo.farmUserPro.name}已可领取`);
      }
    }
  } else {
    console.log("\n今日已完成10次浇水任务\n");
  }
}
//领取首次浇水奖励
async function getFirstWaterAward() {
  $.farmTask = await doApi("taskInitForFarm", { version, channel: 1, babelChannel: "121" }, 0);
  //领取首次浇水奖励
  if (!$.farmTask.firstWaterInit.f && $.farmTask.firstWaterInit.totalWaterTimes > 0) {
    $.firstWaterReward = await doApi("firstWaterTaskForFarm", { version, channel: 1, babelChannel: "121" }, 0);
    if ($.firstWaterReward.code === "0") {
      console.log(`【首次浇水奖励】获得${$.firstWaterReward.amount}g💧\n`);
      // message += `【首次浇水奖励】获得${$.firstWaterReward.amount}g💧\n`;
    } else {
      // message += '【首次浇水奖励】领取奖励失败,详询日志\n';
      console.log(`领取首次浇水奖励结果:  ${JSON.stringify($.firstWaterReward)}`);
    }
  } else {
    console.log("首次浇水奖励已领取\n");
  }
}
//领取十次浇水奖励
async function getTenWaterAward() {
  //领取10次浇水奖励
  if (!$.farmTask.totalWaterTaskInit.f && $.farmTask.totalWaterTaskInit.totalWaterTaskTimes >= $.farmTask.totalWaterTaskInit.totalWaterTaskLimit) {
    $.totalWaterReward = await doApi("totalWaterTaskForFarm", { version, channel: 1, babelChannel: 0 }, 0);
    if ($.totalWaterReward.code === "0") {
      console.log(`【十次浇水奖励】获得${$.totalWaterReward.totalWaterTaskEnergy}g💧\n`);
      // message += `【十次浇水奖励】获得${$.totalWaterReward.totalWaterTaskEnergy}g💧\n`;
    } else {
      // message += '【十次浇水奖励】领取奖励失败,详询日志\n';
      console.log(`领取10次浇水奖励结果:  ${JSON.stringify($.totalWaterReward)}`);
    }
  } else if ($.farmTask.totalWaterTaskInit.totalWaterTaskTimes < $.farmTask.totalWaterTaskInit.totalWaterTaskLimit) {
    // message += `【十次浇水奖励】任务未完成，今日浇水${$.farmTask.totalWaterTaskInit.totalWaterTaskTimes}次\n`;
    console.log(`【十次浇水奖励】任务未完成，今日浇水${$.farmTask.totalWaterTaskInit.totalWaterTaskTimes}次\n`);
  }
  console.log("finished 水果任务完成!");
}
//再次浇水
async function doTenWaterAgain() {
  console.log("开始检查剩余水滴能否再次浇水再次浇水\n");
  $.farmInfo = await doApi("initForFarm", { babelChannel: "121", sid, version, channel: 1 }, 0);
  let totalEnergy = $.farmInfo.farmUserPro.totalEnergy;
  console.log(`剩余水滴${totalEnergy}g\n`);
  $.myCardInfoRes = await doApi("myCardInfoForFarm", { version, channel: 1, babelChannel: 0 }, 0);
  const { fastCard, doubleCard, beanCard, signCard } = $.myCardInfoRes;
  console.log(`背包已有道具:\n快速浇水卡:${fastCard === -1 ? "未解锁" : fastCard + "张"}\n水滴翻倍卡:${doubleCard === -1 ? "未解锁" : doubleCard + "张"}\n水滴换京豆卡:${beanCard === -1 ? "未解锁" : beanCard + "张"}\n加签卡:${signCard === -1 ? "未解锁" : signCard + "张"}\n`);
  if (totalEnergy >= 100 && doubleCard > 0) {
    //使用翻倍水滴卡
    for (let i = 0; i < new Array(doubleCard).fill("").length; i++) {
      $.userMyCardRes = await doApi("userMyCardForFarm", { cardType: "doubleCard", type: "", version, channel: 1, babelChannel: 0 }, 0);
      console.log(`使用翻倍水滴卡结果:${JSON.stringify($.userMyCardRes)}`);
    }
    $.farmInfo = await doApi("initForFarm", { babelChannel: "121", sid, version, channel: 1 }, 0);
    totalEnergy = $.farmInfo.farmUserPro.totalEnergy;
  }
  if (signCard > 0) {
    //使用加签卡
    for (let i = 0; i < new Array(signCard).fill("").length; i++) {
      $.userMyCardRes = await doApi("userMyCardForFarm", { cardType: "signCard", type: "", version, channel: 1, babelChannel: 0 }, 0);
      console.log(`使用加签卡结果:${JSON.stringify($.userMyCardRes)}`);
    }
    $.farmInfo = await doApi("initForFarm", { babelChannel: "121", sid, version, channel: 1 }, 0);
    totalEnergy = $.farmInfo.farmUserPro.totalEnergy;
  }
  jdFruitBeanCard = $.getdata("jdFruitBeanCard") ? $.getdata("jdFruitBeanCard") : jdFruitBeanCard;
  if ($.isNode() && process.env.FRUIT_BEAN_CARD) {
    jdFruitBeanCard = process.env.FRUIT_BEAN_CARD;
  }
  if (`${jdFruitBeanCard}` === "true" && JSON.stringify($.myCardInfoRes).match("限时翻倍")) {
    console.log(`\n您设置的是水滴换豆功能,现在为您换豆`);
    if (totalEnergy >= 100 && $.myCardInfoRes.beanCard > 0) {
      //使用水滴换豆卡
      $.userMyCardRes = await doApi("userMyCardForFarm", { cardType: "beanCard", type: "", version, channel: 1, babelChannel: 0 }, 0);
      console.log(`使用水滴换豆卡结果:${JSON.stringify($.userMyCardRes)}`);
      if ($.userMyCardRes.code === "0") {
        message += `【水滴换豆卡】获得${$.userMyCardRes.beanCount}个京豆\n`;
        return;
      }
    } else {
      console.log(`您目前水滴:${totalEnergy}g,水滴换豆卡${$.myCardInfoRes.beanCard}张,暂不满足水滴换豆的条件,为您继续浇水`);
    }
  }
  // if (totalEnergy > 100 && $.myCardInfoRes.fastCard > 0) {
  //   //使用快速浇水卡
  //   await userMyCardForFarm('fastCard');
  //   console.log(`使用快速浇水卡结果:${JSON.stringify($.userMyCardRes)}`);
  //   if ($.userMyCardRes.code === '0') {
  //     console.log(`已使用快速浇水卡浇水${$.userMyCardRes.waterEnergy}g`);
  //   }
  //   await initForFarm();
  //   totalEnergy  = $.farmInfo.farmUserPro.totalEnergy;
  // }
  // 所有的浇水(10次浇水)任务，获取水滴任务完成后，如果剩余水滴大于等于60g,则继续浇水(保留部分水滴是用于完成第二天的浇水10次的任务)
  let overageEnergy = totalEnergy - retainWater;
  if (totalEnergy >= $.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy) {
    //如果现有的水滴，大于水果可兑换所需的对滴(也就是把水滴浇完，水果就能兑换了)
    isFruitFinished = false;
    for (let i = 0; i < ($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy) / 10; i++) {
      await $.wait(2000);
      $.waterResult = await doApi("waterGoodForFarm", { type: "", version, channel: 1, babelChannel: 0 }, 0);
      console.log(`本次浇水结果(水果马上就可兑换了):   ${JSON.stringify($.waterResult)}`);
      if ($.waterResult.code === "0") {
        console.log("\n浇水10g成功\n");
        if ($.waterResult.finished) {
          // 已证实，waterResult.finished为true，表示水果可以去领取兑换了
          isFruitFinished = true;
          break;
        } else {
          console.log(`目前水滴【${$.waterResult.totalEnergy}】g,继续浇水，水果马上就可以兑换了`);
        }
      } else {
        console.log("浇水出现失败异常,跳出不在继续浇水");
        break;
      }
    }
    if (isFruitFinished) {
      option["open-url"] = urlSchema;
      $.msg($.name, ``, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.farmInfo.farmUserPro.name}已可领取\n请去京东APP或微信小程序查看\n点击弹窗即达`, option);
      $.done();
      if ($.isNode()) {
        await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName || $.UserName}水果已可领取`, `京东账号${$.index} ${$.nickName || $.UserName}\n${$.farmInfo.farmUserPro.name}已可领取`);
      }
    }
  } else if (overageEnergy >= 10) {
    console.log("目前剩余水滴：【" + totalEnergy + "】g，可继续浇水");
    isFruitFinished = false;
    for (let i = 0; i < parseInt(overageEnergy / 10); i++) {
      await $.wait(2000);
      $.waterResult = await doApi("waterGoodForFarm", { type: "", version, channel: 1, babelChannel: 0 }, 0);
      console.log(`本次浇水结果:   ${JSON.stringify($.waterResult)}`);
      if ($.waterResult.code === "0") {
        console.log(`\n浇水10g成功,剩余${$.waterResult.totalEnergy}\n`);
        if ($.waterResult.finished) {
          // 已证实，waterResult.finished为true，表示水果可以去领取兑换了
          isFruitFinished = true;
          break;
        } else {
          await gotStageAward();
        }
      } else {
        console.log("浇水出现失败异常,跳出不在继续浇水");
        break;
      }
    }
    if (isFruitFinished) {
      option["open-url"] = urlSchema;
      $.msg($.name, ``, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.farmInfo.farmUserPro.name}已可领取\n请去京东APP或微信小程序查看\n点击弹窗即达`, option);
      $.done();
      if ($.isNode()) {
        await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName || $.UserName}水果已可领取`, `京东账号${$.index} ${$.nickName || $.UserName}\n${$.farmInfo.farmUserPro.name}已可领取`);
      }
    }
  } else {
    console.log("目前剩余水滴：【" + totalEnergy + "】g,不再继续浇水,保留部分水滴用于完成第二天【十次浇水得水滴】任务");
  }
}
//领取阶段性水滴奖励
function gotStageAward() {
  return new Promise(async (resolve) => {
    if ($.waterResult.waterStatus === 0 && $.waterResult.treeEnergy === 10) {
      console.log("果树发芽了,奖励30g水滴");
      $.gotStageAwardForFarmRes = await doApi("gotStageAwardForFarm", { type: "1", version, channel: 1, babelChannel: 0 }, 0);
      console.log(`浇水阶段奖励1领取结果 ${JSON.stringify($.gotStageAwardForFarmRes)}`);
      if ($.gotStageAwardForFarmRes.code === "0") {
        // message += `【果树发芽了】奖励${$.gotStageAwardForFarmRes.addEnergy}\n`;
        console.log(`【果树发芽了】奖励${$.gotStageAwardForFarmRes.addEnergy}\n`);
      }
    } else if ($.waterResult.waterStatus === 1) {
      console.log("果树开花了,奖励40g水滴");
      $.gotStageAwardForFarmRes = await doApi("gotStageAwardForFarm", { type: "2", version, channel: 1, babelChannel: 0 }, 0);
      console.log(`浇水阶段奖励2领取结果 ${JSON.stringify($.gotStageAwardForFarmRes)}`);
      if ($.gotStageAwardForFarmRes.code === "0") {
        // message += `【果树开花了】奖励${$.gotStageAwardForFarmRes.addEnergy}g💧\n`;
        console.log(`【果树开花了】奖励${$.gotStageAwardForFarmRes.addEnergy}g💧\n`);
      }
    } else if ($.waterResult.waterStatus === 2) {
      console.log("果树长出小果子啦, 奖励50g水滴");
      $.gotStageAwardForFarmRes = await doApi("gotStageAwardForFarm", { type: "3", version, channel: 1, babelChannel: 0 }, 0);
      console.log(`浇水阶段奖励3领取结果 ${JSON.stringify($.gotStageAwardForFarmRes)}`);
      if ($.gotStageAwardForFarmRes.code === "0") {
        // message += `【果树结果了】奖励${$.gotStageAwardForFarmRes.addEnergy}g💧\n`;
        console.log(`【果树结果了】奖励${$.gotStageAwardForFarmRes.addEnergy}g💧\n`);
      }
    }
    resolve();
  });
}
//天天抽奖活动
async function turntableFarm() {
  $.initForTurntableFarmRes = await doApi("initForTurntableFarm", { version: 4, channel: 1 });
  if ($.initForTurntableFarmRes.code === "0") {
    //领取定时奖励 //4小时一次
    let { timingIntervalHours, timingLastSysTime, sysTime, timingGotStatus, remainLotteryTimes, turntableInfos } = $.initForTurntableFarmRes;
    if (!timingGotStatus) {
      console.log(`是否到了领取免费赠送的抽奖机会----${sysTime > timingLastSysTime + 60 * 60 * timingIntervalHours * 1000}`);
      if (sysTime > timingLastSysTime + 60 * 60 * timingIntervalHours * 1000) {
        $.timingAwardRes = await doApi("timingAwardForTurntableFarm", { version: 4, channel: 1 });
        console.log(`领取定时奖励结果${JSON.stringify($.timingAwardRes)}`);
        $.initForTurntableFarmRes = await doApi("initForTurntableFarm", { version: 4, channel: 1 });
        remainLotteryTimes = $.initForTurntableFarmRes.remainLotteryTimes;
      } else {
        console.log(`免费赠送的抽奖机会未到时间`);
      }
    } else {
      console.log("4小时候免费赠送的抽奖机会已领取");
    }
    if ($.initForTurntableFarmRes.turntableBrowserAds && $.initForTurntableFarmRes.turntableBrowserAds.length > 0) {
      for (let index = 0; index < $.initForTurntableFarmRes.turntableBrowserAds.length; index++) {
        if (!$.initForTurntableFarmRes.turntableBrowserAds[index].status) {
          console.log(`开始浏览天天抽奖的第${index + 1}个逛会场任务`);
          await browserForTurntableFarm(1, $.initForTurntableFarmRes.turntableBrowserAds[index].adId);
          if ($.browserForTurntableFarmRes.code === "0" && $.browserForTurntableFarmRes.status) {
            console.log(`第${index + 1}个逛会场任务完成，开始领取水滴奖励\n`);
            await browserForTurntableFarm(2, $.initForTurntableFarmRes.turntableBrowserAds[index].adId);
            if ($.browserForTurntableFarmRes.code === "0") {
              console.log(`第${index + 1}个逛会场任务领取水滴奖励完成\n`);
              $.initForTurntableFarmRes = await doApi("initForTurntableFarm", { version: 4, channel: 1 });
              remainLotteryTimes = $.initForTurntableFarmRes.remainLotteryTimes;
            }
          }
        } else {
          console.log(`浏览天天抽奖的第${index + 1}个逛会场任务已完成`);
        }
      }
    }
    //天天抽奖助力
    console.log("开始天天抽奖--好友助力--每人每天只有三次助力机会.");
    for (let code of newShareCodes) {
      if (code === $.farmInfo.farmUserPro.shareCode) {
        console.log("天天抽奖-不能自己给自己助力\n");
        continue;
      }
      $.lotteryMasterHelpRes = await doApi("initForFarm", { shareCode: code + "-3", sid, version, channel: 1, babelChannel: 0 }, 0);
      // console.log('天天抽奖助力结果',lotteryMasterHelpRes.helpResult)
      if ($.lotteryMasterHelpRes.helpResult.code === "0") {
        console.log(`天天抽奖-助力${$.lotteryMasterHelpRes.helpResult.masterUserInfo.nickName}成功\n`);
      } else if ($.lotteryMasterHelpRes.helpResult.code === "11") {
        console.log(`天天抽奖-不要重复助力${$.lotteryMasterHelpRes.helpResult.masterUserInfo.nickName}\n`);
      } else if ($.lotteryMasterHelpRes.helpResult.code === "13") {
        console.log(`天天抽奖-助力${$.lotteryMasterHelpRes.helpResult.masterUserInfo.nickName}失败,助力次数耗尽\n`);
        break;
      }
    }
    console.log(`---天天抽奖次数remainLotteryTimes----${remainLotteryTimes}次`);
    //抽奖
    if (remainLotteryTimes > 0) {
      console.log("开始抽奖");
      let lotteryResult = "";
      for (let i = 0; i < new Array(remainLotteryTimes).fill("").length; i++) {
        await $.wait(2000);
        $.lotteryRes = await doApi("lotteryForTurntableFarm", { type: 1, version: 4, channel: 1 });
        console.log(`第${i + 1}次抽奖结果${JSON.stringify($.lotteryRes)}`);
        if ($.lotteryRes.code === "0") {
          turntableInfos.map((item) => {
            if (item.type === $.lotteryRes.type) {
              console.log(`lotteryRes.type${$.lotteryRes.type}`);
              if ($.lotteryRes.type.match(/bean/g) && $.lotteryRes.type.match(/bean/g)[0] === "bean") {
                lotteryResult += `${item.name}个，`;
              } else if ($.lotteryRes.type.match(/water/g) && $.lotteryRes.type.match(/water/g)[0] === "water") {
                lotteryResult += `${item.name}，`;
              } else {
                lotteryResult += `${item.name}，`;
              }
            }
          });
          //没有次数了
          if ($.lotteryRes.remainLotteryTimes === 0) {
            break;
          }
        }
      }
      if (lotteryResult) {
        console.log(`【天天抽奖】${lotteryResult.substr(0, lotteryResult.length - 1)}\n`);
        // message += `【天天抽奖】${lotteryResult.substr(0, lotteryResult.length - 1)}\n`;
      }
    } else {
      console.log("天天抽奖--抽奖机会为0次");
    }
  } else {
    console.log("初始化天天抽奖得好礼失败");
  }
}
//领取额外奖励水滴
async function getExtraAward() {
  $.farmAssistResult = await doApi("farmAssistInit", { version, channel: 1, babelChannel: "121" }, 0);
  if ($.farmAssistResult.code === "0") {
    if ($.farmAssistResult.assistFriendList && $.farmAssistResult.assistFriendList.length >= 2) {
      if ($.farmAssistResult.status === 2) {
        let num = 0;
        for (let key of Object.keys($.farmAssistResult.assistStageList)) {
          let vo = $.farmAssistResult.assistStageList[key];
          if (vo.stageStaus === 2) {
            $.receiveStageEnergy = await doApi("receiveStageEnergy", { version, channel: 1, babelChannel: "121" }, 0);
            if ($.receiveStageEnergy.code === "0") {
              console.log(`已成功领取第${key + 1}阶段好友助力奖励：【${$.receiveStageEnergy.amount}】g水`);
              num += $.receiveStageEnergy.amount;
            }
          }
        }
        message += `【额外奖励】${num}g水领取成功\n`;
      } else if ($.farmAssistResult.status === 3) {
        console.log("已经领取过8好友助力额外奖励");
        message += `【额外奖励】已被领取过\n`;
      }
    } else {
      console.log("助力好友未达到2个");
      message += `【额外奖励】领取失败,原因：给您助力的人未达2个\n`;
    }
    if ($.farmAssistResult.assistFriendList && $.farmAssistResult.assistFriendList.length > 0) {
      let str = "";
      $.farmAssistResult.assistFriendList.map((item, index) => {
        if (index === $.farmAssistResult.assistFriendList.length - 1) {
          str += item.nickName || "匿名用户";
        } else {
          str += (item.nickName || "匿名用户") + ",";
        }
        let date = new Date(item.time);
        let time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getMinutes();
        console.log(`\n京东昵称【${item.nickName || "匿名用户"}】 在 ${time} 给您助过力\n`);
      });
      message += `【助力您的好友】${str}\n`;
    }
    console.log("领取额外奖励水滴结束\n");
  } else {
    // await masterHelpTaskInitForFarm();
    // if ($.masterHelpResult.code === "0") {
    //   if ($.masterHelpResult.masterHelpPeoples && $.masterHelpResult.masterHelpPeoples.length >= 5) {
    //     // 已有五人助力。领取助力后的奖励
    //     if (!$.masterHelpResult.masterGotFinal) {
    //       await masterGotFinishedTaskForFarm();
    //       if ($.masterGotFinished.code === "0") {
    //         console.log(`已成功领取好友助力奖励：【${$.masterGotFinished.amount}】g水`);
    //         message += `【额外奖励】${$.masterGotFinished.amount}g水领取成功\n`;
    //       }
    //     } else {
    //       console.log("已经领取过5好友助力额外奖励");
    //       message += `【额外奖励】已被领取过\n`;
    //     }
    //   } else {
    //     console.log("助力好友未达到5个");
    //     message += `【额外奖励】领取失败,原因：给您助力的人未达5个\n`;
    //   }
    //   if ($.masterHelpResult.masterHelpPeoples && $.masterHelpResult.masterHelpPeoples.length > 0) {
    //     let str = "";
    //     $.masterHelpResult.masterHelpPeoples.map((item, index) => {
    //       if (index === $.masterHelpResult.masterHelpPeoples.length - 1) {
    //         str += item.nickName || "匿名用户";
    //       } else {
    //         str += (item.nickName || "匿名用户") + ",";
    //       }
    //       let date = new Date(item.time);
    //       let time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getMinutes();
    //       console.log(`\n京东昵称【${item.nickName || "匿名用户"}】 在 ${time} 给您助过力\n`);
    //     });
    //     message += `【助力您的好友】${str}\n`;
    //   }
    //   console.log("领取额外奖励水滴结束\n");
    // }
  }
}
// 助力好友
async function masterHelpShare() {
  console.log("开始助力好友");
  let salveHelpAddWater = 0;
  let remainTimes = 3; //今日剩余助力次数,默认3次（京东农场每人每天3次助力机会）。
  let helpSuccessPeoples = ""; //成功助力好友
  console.log(`格式化后的助力码::${JSON.stringify(newShareCodes)}\n`);

  for (let code of newShareCodes) {
    console.log(`开始助力京东账号${$.index} - ${$.nickName || $.UserName}的好友: ${code}`);
    if (!code) continue;
    if (code === $.farmInfo.farmUserPro.shareCode) {
      console.log("不能为自己助力哦，跳过自己的shareCode\n");
      continue;
    }
    $.helpResult = await doWxApi("initForFarmWX", { shareCode: code, mpin: "", imageUrl: "", nickName: "", version, channel: 2, babelChannel: 0 }, 0);
    if ($.helpResult.code === "0") {
      if ($.helpResult.helpResult.code === "0") {
        //助力成功
        salveHelpAddWater += $.helpResult.helpResult.salveHelpAddWater;
        console.log(`【助力好友结果】: 已成功给【${$.helpResult.helpResult.masterUserInfo.nickName}】助力`);
        console.log(`给好友【${$.helpResult.helpResult.masterUserInfo.nickName}】助力获得${$.helpResult.helpResult.salveHelpAddWater}g水滴`);
        helpSuccessPeoples += ($.helpResult.helpResult.masterUserInfo.nickName || "匿名用户") + ",";
      } else if ($.helpResult.helpResult.code === "8") {
        console.log(`【助力好友结果】: 助力【${$.helpResult.helpResult.masterUserInfo.nickName}】失败，您今天助力次数已耗尽`);
      } else if ($.helpResult.helpResult.code === "9") {
        console.log(`【助力好友结果】: 之前给【${$.helpResult.helpResult.masterUserInfo.nickName}】助力过了`);
      } else if ($.helpResult.helpResult.code === "10") {
        console.log(`【助力好友结果】: 好友【${$.helpResult.helpResult.masterUserInfo.nickName}】已满五人助力`);
      } else {
        console.log(`助力其他情况：${JSON.stringify($.helpResult.helpResult)}`);
      }
      console.log(`【今日助力次数还剩】${$.helpResult.helpResult.remainTimes}次\n`);
      remainTimes = $.helpResult.helpResult.remainTimes;
      if ($.helpResult.helpResult.remainTimes === 0) {
        console.log(`您当前助力次数已耗尽，跳出助力`);
        break;
      }
    } else {
      console.log(`助力失败::${JSON.stringify($.helpResult)}`);
    }
  }
  if ($.isLoon() || $.isQuanX() || $.isSurge()) {
    let helpSuccessPeoplesKey = timeFormat() + $.farmInfo.farmUserPro.shareCode;
    if (!$.getdata(helpSuccessPeoplesKey)) {
      //把前一天的清除
      $.setdata("", timeFormat(Date.now() - 24 * 60 * 60 * 1000) + $.farmInfo.farmUserPro.shareCode);
      $.setdata("", helpSuccessPeoplesKey);
    }
    if (helpSuccessPeoples) {
      if ($.getdata(helpSuccessPeoplesKey)) {
        $.setdata($.getdata(helpSuccessPeoplesKey) + "," + helpSuccessPeoples, helpSuccessPeoplesKey);
      } else {
        $.setdata(helpSuccessPeoples, helpSuccessPeoplesKey);
      }
    }
    helpSuccessPeoples = $.getdata(helpSuccessPeoplesKey);
  }
  if (helpSuccessPeoples && helpSuccessPeoples.length > 0) {
    message += `【您助力的好友👬】${helpSuccessPeoples.substr(0, helpSuccessPeoples.length - 1)}\n`;
  }
  if (salveHelpAddWater > 0) {
    // message += `【助力好友👬】获得${salveHelpAddWater}g💧\n`;
    console.log(`【助力好友👬】获得${salveHelpAddWater}g💧\n`);
  }
  message += `【今日剩余助力👬】${remainTimes}次\n`;
  console.log("助力好友结束，即将开始领取额外水滴奖励\n");
}
//水滴雨
async function executeWaterRains() {
  let executeWaterRain = !$.farmTask.waterRainInit.f;
  if (executeWaterRain) {
    console.log(`水滴雨任务，每天两次，最多可得10g水滴`);
    console.log(`两次水滴雨任务是否全部完成：${$.farmTask.waterRainInit.f ? "是" : "否"}`);
    if ($.farmTask.waterRainInit.lastTime) {
      if (Date.now() < $.farmTask.waterRainInit.lastTime + 3 * 60 * 60 * 1000) {
        executeWaterRain = false;
        // message += `【第${$.farmTask.waterRainInit.winTimes + 1}次水滴雨】未到时间，请${new Date($.farmTask.waterRainInit.lastTime + 3 * 60 * 60 * 1000).toLocaleTimeString()}再试\n`;
        console.log(`\`【第${$.farmTask.waterRainInit.winTimes + 1}次水滴雨】未到时间，请${new Date($.farmTask.waterRainInit.lastTime + 3 * 60 * 60 * 1000).toLocaleTimeString()}再试\n`);
      }
    }
    if (executeWaterRain) {
      console.log(`开始水滴雨任务,这是第${$.farmTask.waterRainInit.winTimes + 1}次，剩余${2 - ($.farmTask.waterRainInit.winTimes + 1)}次`);
      await waterRainForFarm();
      console.log("水滴雨waterRain");
      if ($.waterRain.code === "0") {
        console.log("水滴雨任务执行成功，获得水滴：" + $.waterRain.addEnergy + "g");
        console.log(`【第${$.farmTask.waterRainInit.winTimes + 1}次水滴雨】获得${$.waterRain.addEnergy}g水滴\n`);
        // message += `【第${$.farmTask.waterRainInit.winTimes + 1}次水滴雨】获得${$.waterRain.addEnergy}g水滴\n`;
      }
    }
  } else {
    // message += `【水滴雨】已全部完成，获得20g💧\n`;
  }
}
//打卡领水活动
async function clockInIn() {
  console.log("开始打卡领水活动（签到，关注，领券）");
  $.clockInInit = await doApi("clockInInitForFarm", { timestamp: Date.now(), version, channel: 1, babelChannel: "121" }, 0);
  if ($.clockInInit.code === "0") {
    // 签到得水滴
    if (!$.clockInInit.todaySigned) {
      console.log("开始今日签到");
      $.clockInForFarmRes = await doApi("clockInForFarm", { type: 1, version, channel: 1, babelChannel: "121" }, 0);
      console.log(`打卡结果${JSON.stringify($.clockInForFarmRes)}`);
      if ($.clockInForFarmRes.code === "0") {
        // message += `【第${$.clockInForFarmRes.signDay}天签到】获得${$.clockInForFarmRes.amount}g💧\n`;
        console.log(`【第${$.clockInForFarmRes.signDay}天签到】获得${$.clockInForFarmRes.amount}g💧\n`);
        if ($.clockInForFarmRes.signDay === 7) {
          //可以领取惊喜礼包
          console.log("开始领取--惊喜礼包38g水滴");
          $.gotClockInGiftRes = await doApi("clockInForFarm", { type: 2, version, channel: 1, babelChannel: "121" }, 0);
          if ($.gotClockInGiftRes.code === "0") {
            // message += `【惊喜礼包】获得${$.gotClockInGiftRes.amount}g💧\n`;
            console.log(`【惊喜礼包】获得${$.gotClockInGiftRes.amount}g💧\n`);
          }
        }
      }
    }
    if ($.clockInInit.todaySigned && $.clockInInit.totalSigned === 7) {
      console.log("开始领取--惊喜礼包38g水滴");
      $.gotClockInGiftRes = await doApi("clockInForFarm", { type: 2, version, channel: 1, babelChannel: "121" }, 0);
      if ($.gotClockInGiftRes.code === "0") {
        // message += `【惊喜礼包】获得${$.gotClockInGiftRes.amount}g💧\n`;
        console.log(`【惊喜礼包】获得${$.gotClockInGiftRes.amount}g💧\n`);
      }
    }
    // 限时关注得水滴
    if ($.clockInInit.themes && $.clockInInit.themes.length > 0) {
      for (let item of $.clockInInit.themes) {
        if (!item.hadGot) {
          console.log(`关注ID${item.id}`);
          await clockInFollowForFarm(item.id, "theme", "1");
          console.log(`themeStep1--结果${JSON.stringify($.themeStep1)}`);
          if ($.themeStep1.code === "0") {
            await clockInFollowForFarm(item.id, "theme", "2");
            console.log(`themeStep2--结果${JSON.stringify($.themeStep2)}`);
            if ($.themeStep2.code === "0") {
              console.log(`关注${item.name}，获得水滴${$.themeStep2.amount}g`);
            }
          }
        }
      }
    }
    // 限时领券得水滴
    if ($.clockInInit.venderCoupons && $.clockInInit.venderCoupons.length > 0) {
      for (let item of $.clockInInit.venderCoupons) {
        if (!item.hadGot) {
          console.log(`领券的ID${item.id}`);
          await clockInFollowForFarm(item.id, "venderCoupon", "1");
          console.log(`venderCouponStep1--结果${JSON.stringify($.venderCouponStep1)}`);
          if ($.venderCouponStep1.code === "0") {
            await clockInFollowForFarm(item.id, "venderCoupon", "2");
            if ($.venderCouponStep2.code === "0") {
              console.log(`venderCouponStep2--结果${JSON.stringify($.venderCouponStep2)}`);
              console.log(`从${item.name}领券，获得水滴${$.venderCouponStep2.amount}g`);
            }
          }
        }
      }
    }
  }
  console.log("开始打卡领水活动（签到，关注，领券）结束\n");
}
async function getAwardInviteFriend() {
  $.friendList = await doApi("friendListInitForFarm", { version, channel: 1, babelChannel: "121" }); //查询好友列表
  // console.log(`查询好友列表数据：${JSON.stringify($.friendList)}\n`)
  if ($.friendList) {
    console.log(`\n今日已邀请好友${$.friendList.inviteFriendCount}个 / 每日邀请上限${$.friendList.inviteFriendMax}个`);
    console.log(`开始删除${$.friendList.friends && $.friendList.friends.length}个好友,可拿每天的邀请奖励`);
    if ($.friendList.friends && $.friendList.friends.length > 0) {
      for (let friend of $.friendList.friends) {
        console.log(`\n开始删除好友 [${friend.shareCode}]`);
        const deleteFriendForFarm = await doApi("deleteFriendForFarm", { shareCode: friend.shareCode, version, channel: 1, babelChannel: "121" }, 0);
        if (deleteFriendForFarm && deleteFriendForFarm.code === "0") {
          console.log(`删除好友 [${friend.shareCode}] 成功\n`);
        }
      }
    }
    await receiveFriendInvite(); //为他人助力,接受邀请成为别人的好友
    if ($.friendList.inviteFriendCount > 0) {
      if ($.friendList.inviteFriendCount > $.friendList.inviteFriendGotAwardCount) {
        console.log("开始领取邀请好友的奖励");
        $.awardInviteFriendRes = await doApi("awardInviteFriendForFarm", { version, channel: 1, babelChannel: "121" }, 0);
        console.log(`领取邀请好友的奖励结果：：${JSON.stringify($.awardInviteFriendRes)}`);
      }
    } else {
      console.log("今日未邀请过好友");
    }
  } else {
    console.log(`查询好友列表失败\n`);
  }
}
//给好友浇水
async function doFriendsWater() {
  $.friendList = await doApi("friendListInitForFarm", { version, channel: 1, babelChannel: "121" });
  console.log("开始给好友浇水...");
  $.farmTask = await doApi("taskInitForFarm", { version, channel: 1, babelChannel: "121" }, 0);
  const { waterFriendCountKey, waterFriendMax } = $.farmTask.waterFriendTaskInit;
  console.log(`今日已给${waterFriendCountKey}个好友浇水`);
  if (waterFriendCountKey < waterFriendMax) {
    let needWaterFriends = [];
    if ($.friendList.friends && $.friendList.friends.length > 0) {
      $.friendList.friends.map((item, index) => {
        if (item.friendState === 1) {
          if (needWaterFriends.length < waterFriendMax - waterFriendCountKey) {
            needWaterFriends.push(item.shareCode);
          }
        }
      });
      console.log(`需要浇水的好友列表shareCodes:${JSON.stringify(needWaterFriends)}`);
      let waterFriendsCount = 0,
        cardInfoStr = "";
      for (let index = 0; index < needWaterFriends.length; index++) {
        $.waterFriendForFarmRes = await doApi("waterFriendForFarm", { shareCode: needWaterFriends[index], version, channel: 1, babelChannel: "121" }, 0);
        console.log(`为第${index + 1}个好友浇水结果:${JSON.stringify($.waterFriendForFarmRes)}\n`);
        if ($.waterFriendForFarmRes.code === "0") {
          waterFriendsCount++;
          if ($.waterFriendForFarmRes.cardInfo) {
            console.log("为好友浇水获得道具了");
            if ($.waterFriendForFarmRes.cardInfo.type === "beanCard") {
              console.log(`获取道具卡:${$.waterFriendForFarmRes.cardInfo.rule}`);
              cardInfoStr += `水滴换豆卡,`;
            } else if ($.waterFriendForFarmRes.cardInfo.type === "fastCard") {
              console.log(`获取道具卡:${$.waterFriendForFarmRes.cardInfo.rule}`);
              cardInfoStr += `快速浇水卡,`;
            } else if ($.waterFriendForFarmRes.cardInfo.type === "doubleCard") {
              console.log(`获取道具卡:${$.waterFriendForFarmRes.cardInfo.rule}`);
              cardInfoStr += `水滴翻倍卡,`;
            } else if ($.waterFriendForFarmRes.cardInfo.type === "signCard") {
              console.log(`获取道具卡:${$.waterFriendForFarmRes.cardInfo.rule}`);
              cardInfoStr += `加签卡,`;
            }
          }
        } else if ($.waterFriendForFarmRes.code === "11") {
          console.log("水滴不够,跳出浇水");
        }
      }
      // message += `【好友浇水】已给${waterFriendsCount}个好友浇水,消耗${waterFriendsCount * 10}g水\n`;
      console.log(`【好友浇水】已给${waterFriendsCount}个好友浇水,消耗${waterFriendsCount * 10}g水\n`);
      if (cardInfoStr && cardInfoStr.length > 0) {
        // message += `【好友浇水奖励】${cardInfoStr.substr(0, cardInfoStr.length - 1)}\n`;
        console.log(`【好友浇水奖励】${cardInfoStr.substr(0, cardInfoStr.length - 1)}\n`);
      }
    } else {
      console.log("您的好友列表暂无好友,快去邀请您的好友吧!");
    }
  } else {
    console.log(`今日已为好友浇水量已达${waterFriendMax}个`);
  }
}
//领取给3个好友浇水后的奖励水滴
async function getWaterFriendGotAward() {
  $.farmTask = await doApi("taskInitForFarm", { version, channel: 1, babelChannel: "121" }, 0);
  const { waterFriendCountKey, waterFriendMax, waterFriendSendWater, waterFriendGotAward } = $.farmTask.waterFriendTaskInit;
  if (waterFriendCountKey >= waterFriendMax) {
    if (!waterFriendGotAward) {
      $.waterFriendGotAwardRes = await doApi("waterFriendGotAwardForFarm", { version, channel: 1, babelChannel: "121" }, 0);
      console.log(`领取给${waterFriendMax}个好友浇水后的奖励水滴::${JSON.stringify($.waterFriendGotAwardRes)}`);
      if ($.waterFriendGotAwardRes.code === "0") {
        // message += `【给${waterFriendMax}好友浇水】奖励${$.waterFriendGotAwardRes.addWater}g水滴\n`;
        console.log(`【给${waterFriendMax}好友浇水】奖励${$.waterFriendGotAwardRes.addWater}g水滴\n`);
      }
    } else {
      console.log(`给好友浇水的${waterFriendSendWater}g水滴奖励已领取\n`);
      // message += `【给${waterFriendMax}好友浇水】奖励${waterFriendSendWater}g水滴已领取\n`;
    }
  } else {
    console.log(`暂未给${waterFriendMax}个好友浇水\n`);
  }
}
//接收成为对方好友的邀请
async function receiveFriendInvite() {
  for (let code of newShareCodes) {
    if (code === $.farmInfo.farmUserPro.shareCode) {
      console.log("自己不能邀请自己成为好友噢\n");
      continue;
    }
    $.inviteFriendRes = await doWxApi("initForFarmWX", { shareCode: code + "-inviteFriend", mpin: "", imageUrl: "", nickName: "", version, channel: 2, babelChannel: 0 }, 0);
    // console.log(`接收邀请成为好友结果:${JSON.stringify($.inviteFriendRes)}`)
    if ($.inviteFriendRes && $.inviteFriendRes.helpResult && $.inviteFriendRes.helpResult.code === "0") {
      console.log(`接收邀请成为好友结果成功,您已成为${$.inviteFriendRes.helpResult.masterUserInfo.nickName}的好友`);
    } else if ($.inviteFriendRes && $.inviteFriendRes.helpResult && $.inviteFriendRes.helpResult.code === "17") {
      console.log(`接收邀请成为好友结果失败,对方已是您的好友`);
    }
  }
  // console.log(`开始接受6fbd26cc27ac44d6a7fed34092453f77的邀请\n`)
  // await inviteFriend('6fbd26cc27ac44d6a7fed34092453f77');
  // console.log(`接收邀请成为好友结果:${JSON.stringify($.inviteFriendRes.helpResult)}`)
  // if ($.inviteFriendRes.helpResult.code === '0') {
  //   console.log(`您已成为${$.inviteFriendRes.helpResult.masterUserInfo.nickName}的好友`)
  // } else if ($.inviteFriendRes.helpResult.code === '17') {
  //   console.log(`对方已是您的好友`)
  // }
}
async function duck() {
  for (let i = 0; i < 10; i++) {
    //这里循环十次
    $.duckRes = await doApi("getFullCollectionReward", { type: 2, version, channel: 1, babelChannel: "121" }, 0);
    if ($.duckRes.code === "0") {
      if (!$.duckRes.hasLimit) {
        console.log(`小鸭子游戏:${$.duckRes.title}`);
        // if ($.duckRes.type !== 3) {
        //   console.log(`${$.duckRes.title}`);
        //   if ($.duckRes.type === 1) {
        //     message += `【小鸭子】为你带回了水滴\n`;
        //   } else if ($.duckRes.type === 2) {
        //     message += `【小鸭子】为你带回快速浇水卡\n`
        //   }
        // }
      } else {
        console.log(`${$.duckRes.title}`);
        break;
      }
    } else if ($.duckRes.code === "10") {
      console.log(`小鸭子游戏达到上限`);
      break;
    }
  }
}
async function browserForTurntableFarm(type, adId) {
  if (type === 1) {
    console.log("浏览爆品会场");
  }
  if (type === 2) {
    console.log("天天抽奖浏览任务领取水滴");
  }
  let body = { type, adId, version: 4, channel: 1 };
  $.browserForTurntableFarmRes = await doApi("browserForTurntableFarm", body);
  // 浏览爆品会场8秒
}
//关注，领券等API
async function clockInFollowForFarm(id, type, step) {
  let body = { id, type, step, version, channel: 1, babelChannel: "121" };
  if (type === "theme") {
    if (step === "1") {
      $.themeStep1 = await doApi("clockInFollowForFarm", body, 0);
    } else if (step === "2") {
      $.themeStep2 = await doApi("clockInFollowForFarm", body, 0);
    }
  } else if (type === "venderCoupon") {
    if (step === "1") {
      $.venderCouponStep1 = await doApi("clockInFollowForFarm", body, 0);
    } else if (step === "2") {
      $.venderCouponStep2 = await doApi("clockInFollowForFarm", body, 0);
    }
  }
}
function waterRainForFarm() {
  return new Promise((resolve) => {
    let options = {
      url: "https://api.m.jd.com/client.action",
      body: `functionId=waterRainForFarm&body={"type":1,"hongBaoTimes":34,"version":3}&appid=wh5`,
      headers: {
        Host: "api.m.jd.com",
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: "https://h5.m.jd.com",
        "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        "User-Agent": $.UA,
        Referer: "https://h5.m.jd.com/",
        "Accept-Encoding": "gzip, deflate, br",
        Cookie: cookie,
      },
    };
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(JSON.stringify(err));
          console.log(`${$.name} waterRainForFarm API请求失败，请检查网路重试`);
        } else {
          $.waterRain = JSON.parse(data);
        }
      } catch (e) {
        console.log(e);
      } finally {
        resolve();
      }
    });
  });
}



function returnInfo(functionId) {
  let obj = {
    initForFarm: {
      appId: "8a2af",
    },
    initForFarmWX: {
      appId: "235ec",
      functionId: "initForFarm",
      appid: "signed_mp",
      client: "ios",
      clientVersion: "8.0.28",
    },
    taskInitForFarm: {
      appId: "fcb5a",
      client: "apple",
    },
    gotWaterGoalTaskForFarm: {
      appId: "c901b",
    },
    browseAdTaskForFarm: {
      appId: "53f09",
    },
    gotThreeMealForFarm: {
      appId: "57b30",
    },
    waterFriendForFarm: {
      appId: "673a0",
    },
    deleteFriendForFarm: {
      appId: "eaf91",
    },
    awardInviteFriendForFarm: {
      appId: "2b5ca",
    },
    clockInInitForFarm: {
      appId: "08dc3",
    },
    clockInForFarm: {
      appId: "32b94",
    },
    clockInFollowForFarm: {
      appId: "4a0b4",
    },
    farmAssistInit: {
      appId: "92354",
    },
    receiveStageEnergy: {
      appId: "15507",
    },
    myCardInfoForFarm: {
      appId: "157b6",
    },
    waterGoodForFarm: {
      appId: "0c010",
    },
    gotStageAwardForFarm: {
      appId: "81591",
    },
    firstWaterTaskForFarm: {
      appId: "0cf1e",
    },
    totalWaterTaskForFarm: {
      appId: "102f5",
    },
    waterFriendGotAwardForFarm: {
      appId: "d08ff",
    },
    getFullCollectionReward: {
      appId: "5c767",
    },
    userMyCardForFarm: {
      appId: "86ba5",
    },
  };
  if (!obj[functionId]) obj[functionId] = {};
  if (!obj[functionId].client) obj[functionId].client = "iOS";
  if (!obj[functionId].appid) obj[functionId].appid = "signed_wh5";
  if (!obj[functionId].clientVersion) obj[functionId].clientVersion = "11.2.5";
  if (!obj[functionId].functionId) obj[functionId].functionId = functionId;
  if (!obj[functionId].appId) obj[functionId].appid = "wh5";

  return obj[functionId];
}

async function showMsg() {
  if ($.isNode() && process.env.FRUIT_NOTIFY_CONTROL) {
    $.ctrTemp = `${process.env.FRUIT_NOTIFY_CONTROL}` === "false";
  } else if ($.getdata("jdFruitNotify")) {
    $.ctrTemp = $.getdata("jdFruitNotify") === "false";
  } else {
    $.ctrTemp = `${jdNotify}` === "false";
  }
  if ($.ctrTemp) {
    $.msg($.name, subTitle, message, option);
    if ($.isNode()) {
      allMessage += `${subTitle}\n${message}${$.index !== cookiesArr.length ? "\n\n" : ""}`;
      // await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName || $.UserName}`, `${subTitle}\n${message}`);
    }
  } else {
    $.log(`\n${message}\n`);
  }
}

function timeFormat(time) {
  let date;
  if (time) {
    date = new Date(time);
  } else {
    date = new Date();
  }
  return date.getFullYear() + "-" + (date.getMonth() + 1 >= 10 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1)) + "-" + (date.getDate() >= 10 ? date.getDate() : "0" + date.getDate());
}
function readShareCode() {
  return new Promise(async (resolve) => {
    $.get({ url: `http://transfer.nz.lu/farm`, timeout: 10000 }, (err, resp, data) => {
      try {
        if (err) {
          console.log(JSON.stringify(err));
          console.log(`${$.name} API请求失败，请检查网路重试`);
        } else {
          if (data) {
            console.log(`随机取个${randomCount}码放到您固定的互助码后面(不影响已有固定互助)`);
            data = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    });
    await $.wait(10000);
    resolve();
  });
}
function shareCodesFormat() {
  return new Promise(async (resolve) => {
    // console.log(`第${$.index}个京东账号的助力码:::${$.shareCodesArr[$.index - 1]}`)
    newShareCodes = [];
    if ($.shareCodesArr[$.index - 1]) {
      newShareCodes = $.shareCodesArr[$.index - 1].split("@");
    } else {
      console.log(`由于您第${$.index}个京东账号未提供shareCode,将采纳本脚本自带的助力码\n`);
      const tempIndex = $.index > shareCodes.length ? shareCodes.length - 1 : $.index - 1;
      newShareCodes = shareCodes[tempIndex].split("@");
    }
    // const readShareCodeRes = await readShareCode();
    // if (readShareCodeRes && readShareCodeRes.code === 200) {
    //   // newShareCodes = newShareCodes.concat(readShareCodeRes.data || []);
    //   newShareCodes = [...new Set([...newShareCodes, ...(readShareCodeRes.data || [])])];
    // }
    console.log(`第${$.index}个京东账号将要助力的好友${JSON.stringify(newShareCodes)}`);
    resolve();
  });
}
function requireConfig() {
  return new Promise((resolve) => {
    console.log("开始获取配置文件\n");
    notify = $.isNode() ? require("./sendNotify") : "";
    //Node.js用户请在jdCookie.js处填写京东ck;
    const jdCookieNode = $.isNode() ? require("./jdCookie.js") : "";
    const jdFruitShareCodes = $.isNode() ? require("./jdFruitShareCodes.js") : "";
    //IOS等用户直接用NobyDa的jd cookie
    if ($.isNode()) {
      Object.keys(jdCookieNode).forEach((item) => {
        if (jdCookieNode[item]) {
          cookiesArr.push(jdCookieNode[item]);
        }
      });
      if (process.env.JD_DEBUG && process.env.JD_DEBUG === "false") console.log = () => { };
    } else {
      cookiesArr = [$.getdata("CookieJD"), $.getdata("CookieJD2"), ...jsonParse($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
    }
    console.log(`共${cookiesArr.length}个京东账号\n`);
    $.shareCodesArr = [];
    if ($.isNode()) {
      Object.keys(jdFruitShareCodes).forEach((item) => {
        if (jdFruitShareCodes[item]) {
          $.shareCodesArr.push(jdFruitShareCodes[item]);
        }
      });
    } else {
      if ($.getdata("jd_fruit_inviter"))
        $.shareCodesArr = $.getdata("jd_fruit_inviter")
          .split("\n")
          .filter((item) => !!item);
      console.log(`\nBoxJs设置的${$.name}好友邀请码:${$.getdata("jd_fruit_inviter") ? $.getdata("jd_fruit_inviter") : "暂无"}\n`);
    }
    // console.log(`$.shareCodesArr::${JSON.stringify($.shareCodesArr)}`)
    // console.log(`jdFruitShareArr账号长度::${$.shareCodesArr.length}`)
    console.log(`您提供了${$.shareCodesArr.length}个账号的农场助力码\n`);
    resolve();
  });
}
function TotalBean() {
  return new Promise((resolve) => {
    const options = {
      url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
      headers: {
        Host: "me-api.jd.com",
        Accept: "*/*",
        "User-Agent": "ScriptableWidgetExtension/185 CFNetwork/1312 Darwin/21.0.0",
        "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Cookie: cookie,
      },
    };
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          $.logErr(err);
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data["retcode"] === "1001") {
              $.isLogin = false; //cookie过期
              return;
            }
            if (data["retcode"] === "0" && data.data && data.data.hasOwnProperty("userInfo")) {
              $.nickName = data.data.userInfo.baseInfo.nickname;
            }
          } else {
            console.log("京东服务器返回空数据");
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
function randomString() {
  let len = 32;
  let chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  let maxPos = chars.length;
  let character = '';
  for (let i = 0; i < len; i++) {
    character += chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return character;
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
      $.msg($.name, "", "请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie");
      return [];
    }
  }
}
// prettier-ignore
var _0xodm='jsjiami.com.v6',_0xodm_=['‮_0xodm'],_0x1c6a=[_0xodm,'wrphQcKkJcKcwqYmwpzDhQ==','w4h9wrRKw7w=','w5DCjCbCg8OhMA==','wo9Nw4bCmibDqw9DR8K9FcKVbQ==','HMK5w5YoZw==','LxLCixfCmw==','wq7CqMO0esKs','Q8KbFGM=','woh4woc=','w4Baw5fDlFE=','YcOTORYAwrA=','wovDgcOqw4fDnw==','ZMKeD1rDjw==','YyxTwr5+','w4ZEMyTChg==','w5ItRXFdw61+wrTDsnjDmsOF','w6TCi8KB','wp5/w43CjmFET8KPwoDDpl3CgU5mwr/DrsK+cg0=','wo8lLwlrwrbCqzDDmD7CsFXCn8KeA8KgHMK9wrjDshzCijU=','w5DCg8OeO8OO','w6bCrXLCjgo=','wrVRwrsLEA==','wqhfwrkOLw==','dDrChsOKaQ==','H0fDk8ONVg==','w5PClMOTKsOs','woAgHSh/','w6/CrXTCpjbClMO2T8OEe0TCs8KkBjwdbcKhYj3Dk8Oxwo3DulcNwqh2woQuw4HDicKmw6fCjg==','wqnCnzBr','wq99w59RwqQ=','KcKYT8OYMg==','w5dXMlHCtQ==','w6o7Xj1E','OThCw5DCmw==','awvCqlAJ','w6BoJ0rCnQ==','woNywpQ=','wr8wFxFv','w6rDp8ORF8Ks','w7dpw6bDrEA=','R1/DisOXwrs=','X8KbAA==','wr3DkMOZw6jDs8KfDQLDvw==','FsKWSQ==','b8OYw4fCgeisu+axgOWnq+i0iO+9teitjOajouael+e9sOi0vumEtuitug==','aMKsw5fCj1k=','w6bDvT3DicKz','wrsNwo9RFw==','wrB7SA==','wpQawotYMA==','XMKEw7fChWs=','w7XDnSg=','w5F3KQTCvsK1NcO4aQ==','YcO/cw==','w4RWwrDChOivmOawquWkhOi3gu++oeitmeajvOaciue9rOi2sumEg+ishg==','XcOUw5rDlsK6','M23DjsOqQg==','GMODw7vCi8KA','wotZW8KMJA==','UsKEF3vDqMKawpJNw53ChGAiGmrCm8Om','w6/Cs8ObP8Ob','VU1/P8OI','wo9uwpfClW4=','wqjCvjdGFg==','A1LDi8ORUCp4w4fDqMK3c07DmVHCocKLGcOHN8O0BcOtw6x9EQl+w6dGXlhjw4AHbg==','wr57S8K+','w6TDg8OWUMKYwq3Cm8KHw4zCh8KewoM=','wq/CqcOPW8Kb','EsKNWnHCghvCqHJsV8OpVBPDnHnCusOjOhAwwrPCryRsMsOgA8KZUsOdw7/DvT3CtsK9w71LwrfDksK6DcOtIcKHw6LCrX/CqgHCusOlDgfCpGrDu3TCh8Ouw47Do8OzwqXDgQ==','wqdEwpHCn3w=','fcOTw7s=','wpJjwr8zKA==','wo/Ck0/DhcK7','bsOFbT3CgA==','YznCr1gk','wrZFbw==','w6dFDA7Cig==','w59fEw==','wpPChGY=','wr1Cw6AP','wrPCqHPDtMKt','wr9Mw6o=','w5JiKR7CtQ==','w6ZuwoBAw6A=','wp3Dk8O/X8KyRW3Dsys2w5XDtMKMw7wtwpw=','DHPDiMOjZA==','wrtXw7kaAsOCw4zDvsO6IVjCuMKUwoVLw4jDsDPCoMONJsKuaCMtwp0basO2w64=','w4DClD3Cj8OhI8KjT8KN','jspXjxGizHarmlQfkDi.cMorxm.wv6=='];if(function(_0x286c0b,_0x2e81b8,_0x25f89d){function _0x3fb198(_0x4eb9e0,_0x5180ff,_0x62f835,_0x8406f5,_0x33dad7,_0x51abc9){_0x5180ff=_0x5180ff>>0x8,_0x33dad7='po';var _0x27283a='shift',_0x3a759c='push',_0x51abc9='‮';if(_0x5180ff<_0x4eb9e0){while(--_0x4eb9e0){_0x8406f5=_0x286c0b[_0x27283a]();if(_0x5180ff===_0x4eb9e0&&_0x51abc9==='‮'&&_0x51abc9['length']===0x1){_0x5180ff=_0x8406f5,_0x62f835=_0x286c0b[_0x33dad7+'p']();}else if(_0x5180ff&&_0x62f835['replace'](/[pXxGzHrlQfkDMrxw=]/g,'')===_0x5180ff){_0x286c0b[_0x3a759c](_0x8406f5);}}_0x286c0b[_0x3a759c](_0x286c0b[_0x27283a]());}return 0x10848f;};return _0x3fb198(++_0x2e81b8,_0x25f89d)>>_0x2e81b8^_0x25f89d;}(_0x1c6a,0x1b4,0x1b400),_0x1c6a){_0xodm_=_0x1c6a['length']^0x1b4;};function _0x52aa(_0x226bc3,_0x7c5885){_0x226bc3=~~'0x'['concat'](_0x226bc3['slice'](0x1));var _0x1d0d38=_0x1c6a[_0x226bc3];if(_0x52aa['GrpQwJ']===undefined){(function(){var _0x334957=typeof window!=='undefined'?window:typeof process==='object'&&typeof require==='function'&&typeof global==='object'?global:this;var _0x37e075='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x334957['atob']||(_0x334957['atob']=function(_0x853872){var _0x79d02f=String(_0x853872)['replace'](/=+$/,'');for(var _0x439ecc=0x0,_0x22c8f6,_0x1a93d5,_0x442f11=0x0,_0x3dfe83='';_0x1a93d5=_0x79d02f['charAt'](_0x442f11++);~_0x1a93d5&&(_0x22c8f6=_0x439ecc%0x4?_0x22c8f6*0x40+_0x1a93d5:_0x1a93d5,_0x439ecc++%0x4)?_0x3dfe83+=String['fromCharCode'](0xff&_0x22c8f6>>(-0x2*_0x439ecc&0x6)):0x0){_0x1a93d5=_0x37e075['indexOf'](_0x1a93d5);}return _0x3dfe83;});}());function _0x7ee86a(_0x545ec5,_0x7c5885){var _0x5a5b58=[],_0x3ab615=0x0,_0x461a71,_0x182e0a='',_0x573bd9='';_0x545ec5=atob(_0x545ec5);for(var _0x1db51a=0x0,_0x6446e3=_0x545ec5['length'];_0x1db51a<_0x6446e3;_0x1db51a++){_0x573bd9+='%'+('00'+_0x545ec5['charCodeAt'](_0x1db51a)['toString'](0x10))['slice'](-0x2);}_0x545ec5=decodeURIComponent(_0x573bd9);for(var _0x3544f2=0x0;_0x3544f2<0x100;_0x3544f2++){_0x5a5b58[_0x3544f2]=_0x3544f2;}for(_0x3544f2=0x0;_0x3544f2<0x100;_0x3544f2++){_0x3ab615=(_0x3ab615+_0x5a5b58[_0x3544f2]+_0x7c5885['charCodeAt'](_0x3544f2%_0x7c5885['length']))%0x100;_0x461a71=_0x5a5b58[_0x3544f2];_0x5a5b58[_0x3544f2]=_0x5a5b58[_0x3ab615];_0x5a5b58[_0x3ab615]=_0x461a71;}_0x3544f2=0x0;_0x3ab615=0x0;for(var _0x49bb14=0x0;_0x49bb14<_0x545ec5['length'];_0x49bb14++){_0x3544f2=(_0x3544f2+0x1)%0x100;_0x3ab615=(_0x3ab615+_0x5a5b58[_0x3544f2])%0x100;_0x461a71=_0x5a5b58[_0x3544f2];_0x5a5b58[_0x3544f2]=_0x5a5b58[_0x3ab615];_0x5a5b58[_0x3ab615]=_0x461a71;_0x182e0a+=String['fromCharCode'](_0x545ec5['charCodeAt'](_0x49bb14)^_0x5a5b58[(_0x5a5b58[_0x3544f2]+_0x5a5b58[_0x3ab615])%0x100]);}return _0x182e0a;}_0x52aa['DTLxPe']=_0x7ee86a;_0x52aa['UwsvBG']={};_0x52aa['GrpQwJ']=!![];}var _0x339846=_0x52aa['UwsvBG'][_0x226bc3];if(_0x339846===undefined){if(_0x52aa['kLDaKU']===undefined){_0x52aa['kLDaKU']=!![];}_0x1d0d38=_0x52aa['DTLxPe'](_0x1d0d38,_0x7c5885);_0x52aa['UwsvBG'][_0x226bc3]=_0x1d0d38;}else{_0x1d0d38=_0x339846;}return _0x1d0d38;};function geth5st(_0x24867b,_0x47d45f,_0x2d2caf){var _0x2464c4={'EeAFB':function(_0x297348,_0x4875ad){return _0x297348(_0x4875ad);},'gUwBG':function(_0x587d2c,_0x506841){return _0x587d2c(_0x506841);},'KJFVp':'1111','YWyrv':_0x52aa('‮0','VCp4')};let _0x446dc2=_0x2464c4[_0x52aa('‫1','7eVu')](returnInfo,_0x24867b);const _0xdb1e11={'url':_0x52aa('‫2','TK&D'),'body':JSON[_0x52aa('‮3','iaA1')]({'fn':_0x446dc2[_0x52aa('‮4','MW[$')],'body':_0x47d45f,'appid':_0x446dc2[_0x52aa('‫5','*CO5')],'client':_0x446dc2[_0x52aa('‫6','iaA1')],'clientVersion':_0x446dc2[_0x52aa('‫7','3%UY')],'appId':_0x446dc2[_0x52aa('‫8','eMy@')]||_0x2464c4[_0x52aa('‮9','Su^r')],'version':'3.1','pin':$['pin'],'code':_0x2d2caf}),'headers':{'Content-Type':_0x2464c4[_0x52aa('‫a','#@mc')]}};return new Promise(_0x24867b=>{$[_0x52aa('‮b','cI8P')](_0xdb1e11,async(_0x47d45f,_0x2d2caf,_0x446dc2)=>{try{_0x47d45f?console[_0x52aa('‫c','$]Ks')](_0x47d45f):_0x446dc2=JSON[_0x52aa('‫d',')U$g')](_0x446dc2);}catch(_0x53fa1e){$[_0x52aa('‫e','[Rx2')](_0x53fa1e,_0x2d2caf);}finally{_0x2464c4[_0x52aa('‮f','zZHy')](_0x24867b,_0x446dc2||'');}});});}function doApi(_0x275b35,_0x3e544b,_0x31d2e4=0x1){var _0x13a9d1={'SXSlG':function(_0x257a61,_0x20ebdc){return _0x257a61(_0x20ebdc);},'WZlCL':function(_0x215895,_0x461320){return _0x215895(_0x461320);},'WMtKu':function(_0x5d5d62,_0x22973e){return _0x5d5d62||_0x22973e;},'atrXO':function(_0x41f35f,_0x3e940e){return _0x41f35f!==_0x3e940e;},'DtPSM':'RrhrR','YzRVr':_0x52aa('‫10','cI8P'),'tdJTf':_0x52aa('‫11','A)fv'),'SomCU':_0x52aa('‫12','!!w['),'tallu':function(_0x92e532,_0x41bc5e){return _0x92e532===_0x41bc5e;},'iRclu':'TMaRn','gqFQg':function(_0x53ad58,_0x2c6029,_0x43b417,_0x5c35bd){return _0x53ad58(_0x2c6029,_0x43b417,_0x5c35bd);},'JANkI':_0x52aa('‫13','VWXq'),'oXpRP':_0x52aa('‫14','zZHy'),'JFPDv':'https://carry.m.jd.com','dgFwo':'gzip,\x20deflate,\x20br','Yfrbt':_0x52aa('‮15','$]Ks'),'DAnpe':_0x52aa('‮16','794x'),'YvCKf':function(_0x55a274,_0x3ac2a2,_0x4c32e1){return _0x55a274(_0x3ac2a2,_0x4c32e1);}};return new Promise(async _0x3fbe74=>{var _0x2d4f7f={'XaLhw':function(_0x3f6f03,_0x3c3e89){return _0x13a9d1[_0x52aa('‫17','$cZh')](_0x3f6f03,_0x3c3e89);},'oTniY':function(_0x30a063,_0x468d00){return _0x13a9d1[_0x52aa('‮18','XbRy')](_0x30a063,_0x468d00);},'GRCKt':_0x13a9d1[_0x52aa('‮19','sLWK')],'dKAvD':_0x13a9d1[_0x52aa('‮1a','sLWK')],'YkXYU':function(_0x3e41f5){return _0x3e41f5();},'KxrsH':function(_0x37d675,_0x21d8f9){return _0x13a9d1['atrXO'](_0x37d675,_0x21d8f9);},'yIQFj':_0x13a9d1['tdJTf'],'mCxSg':_0x13a9d1[_0x52aa('‫1b','Xuv4')]};if(_0x13a9d1[_0x52aa('‫1c','7eVu')](_0x13a9d1['iRclu'],_0x52aa('‫1d','$cZh'))){let _0x38b450=await _0x13a9d1[_0x52aa('‮1e','794x')](geth5st,_0x275b35,_0x3e544b,_0x31d2e4);let _0x5d7f5b={'url':_0x52aa('‫1f','XbRy')+_0x38b450[_0x52aa('‫20','rXtV')],'headers':{'Host':_0x13a9d1[_0x52aa('‮21','KRX)')],'Accept':_0x13a9d1['oXpRP'],'Origin':_0x13a9d1[_0x52aa('‫22','gccf')],'Accept-Encoding':_0x13a9d1[_0x52aa('‫23','3*N$')],'User-Agent':_0x38b450['ua'],'Accept-Language':_0x13a9d1[_0x52aa('‫24','VWXq')],'Referer':_0x13a9d1[_0x52aa('‮25','Zbvd')],'Cookie':cookie}};_0x13a9d1[_0x52aa('‮26','UTgb')](setTimeout,()=>{var _0x454bec={'GbUoh':function(_0x271b29){return _0x271b29();},'XKqKa':function(_0x5102cd,_0x4d4855){return _0x13a9d1[_0x52aa('‮27','3*N$')](_0x5102cd,_0x4d4855);}};$[_0x52aa('‫28','$]Ks')](_0x5d7f5b,(_0x1de230,_0x842f6c,_0x52b1f9)=>{var _0x2cdcb6={'dovzo':function(_0x1d988d,_0x5cbce2){return _0x2d4f7f[_0x52aa('‮29','794x')](_0x1d988d,_0x5cbce2);}};try{if(_0x2d4f7f[_0x52aa('‮2a','ZRW)')](_0x2d4f7f[_0x52aa('‮2b',')U$g')],_0x2d4f7f[_0x52aa('‮2c','$r8I')])){if(_0x1de230){console[_0x52aa('‮2d','cI8P')](JSON[_0x52aa('‮2e','zZHy')](_0x1de230));console[_0x52aa('‮2f','ufFe')]($['name']+'\x20'+_0x275b35+_0x52aa('‮30','W0NL'));_0x2d4f7f[_0x52aa('‮31','o5vz')](_0x3fbe74);}else{if(safeGet(_0x52b1f9)){_0x52b1f9=JSON[_0x52aa('‫32','*u51')](_0x52b1f9);}}}else{if(_0x2cdcb6[_0x52aa('‫33','z!Xw')](safeGet,_0x52b1f9)){_0x52b1f9=JSON['parse'](_0x52b1f9);}}}catch(_0x5b1034){console[_0x52aa('‫34','MW[$')](_0x5b1034);_0x3fbe74();}finally{if(_0x2d4f7f[_0x52aa('‮35','z!Xw')](_0x2d4f7f['yIQFj'],_0x2d4f7f[_0x52aa('‫36','o5vz')])){_0x3fbe74(_0x52b1f9);}else{if(_0x1de230){console[_0x52aa('‫37','hHDP')](JSON[_0x52aa('‮38','!!w[')](_0x1de230));console[_0x52aa('‮39','9Ftp')]($['name']+'\x20'+_0x275b35+_0x52aa('‫3a','$]Ks'));_0x454bec[_0x52aa('‮3b','fysr')](_0x3fbe74);}else{if(_0x454bec[_0x52aa('‫3c','7eVu')](safeGet,_0x52b1f9)){_0x52b1f9=JSON['parse'](_0x52b1f9);}}}}});},0x1*0x3e8);}else{_0x13a9d1[_0x52aa('‮3d','W0NL')](n,_0x13a9d1[_0x52aa('‫3e','MW[$')](i,''));}});}function doWxApi(_0x346fca,_0x50c995,_0xb205fc=0x1){var _0x3d2c24={'hjiGY':function(_0xfc2dac,_0x3df56c){return _0xfc2dac===_0x3df56c;},'QOQky':function(_0x11281c,_0x21636c){return _0x11281c!==_0x21636c;},'mokez':'QDFCK','kywXA':function(_0x2ffe51){return _0x2ffe51();},'ouKzx':function(_0x214997,_0x23f955){return _0x214997(_0x23f955);},'cNcTF':function(_0x164fcf){return _0x164fcf();},'fIGou':function(_0x38b4dc){return _0x38b4dc();},'GiTKo':function(_0x333720,_0x22df71,_0x5c7bd6,_0x3d3888){return _0x333720(_0x22df71,_0x5c7bd6,_0x3d3888);},'iMoCk':function(_0x1fcfd0,_0x404d97){return _0x1fcfd0+_0x404d97;},'XVBSA':_0x52aa('‫3f','cI8P'),'UmNXl':'gzip,compress,br,deflate','CSqRS':function(_0x5724b7,_0x4a85ba,_0x5119e9){return _0x5724b7(_0x4a85ba,_0x5119e9);},'OcDcx':function(_0x5f0994,_0x5a95c1){return _0x5f0994*_0x5a95c1;}};return new Promise(async _0x293c17=>{var _0x4d41f3={'cFTku':function(_0x70a60a,_0x36d8dd){return _0x3d2c24[_0x52aa('‮40','$cZh')](_0x70a60a,_0x36d8dd);},'pxNxg':'CzqsG','cUyuA':function(_0x40a450,_0x315515){return _0x3d2c24['QOQky'](_0x40a450,_0x315515);},'DFTon':_0x3d2c24[_0x52aa('‮41','YHRQ')],'BCLHy':function(_0x1f7d7f){return _0x3d2c24[_0x52aa('‮42','$]Ks')](_0x1f7d7f);},'LCrIq':function(_0x45b1ef,_0x260392){return _0x3d2c24['ouKzx'](_0x45b1ef,_0x260392);},'MdvdF':function(_0x4159ea){return _0x3d2c24[_0x52aa('‫43','rXtV')](_0x4159ea);},'YzOxK':function(_0x1afba3){return _0x3d2c24['fIGou'](_0x1afba3);}};let _0x257e1a=await _0x3d2c24['GiTKo'](geth5st,_0x346fca,_0x50c995,_0xb205fc);let _0x69cc7b={'url':_0x3d2c24['iMoCk'](_0x52aa('‫44','7eVu'),_0x257e1a[_0x52aa('‮45','MW[$')]),'headers':{'Host':_0x52aa('‮46','ZRW)'),'Connection':'keep-alive','Content-Type':_0x3d2c24[_0x52aa('‮47','#@mc')],'Accept-Encoding':_0x3d2c24['UmNXl'],'User-Agent':_0x257e1a['ua'],'Referer':_0x52aa('‫48','ufFe'),'Cookie':cookie}};_0x3d2c24[_0x52aa('‫49','$]Ks')](setTimeout,()=>{var _0x3e01de={'EFWcZ':function(_0x34aca5){return _0x4d41f3['YzOxK'](_0x34aca5);}};$[_0x52aa('‫4a','fysr')](_0x69cc7b,(_0x33ac8d,_0x42c48b,_0x5d410c)=>{if(_0x4d41f3[_0x52aa('‫4b','sLWK')](_0x4d41f3[_0x52aa('‮4c','F]1X')],'CzqsG')){try{if(_0x33ac8d){if(_0x4d41f3[_0x52aa('‫4d','9Ftp')](_0x4d41f3['DFTon'],_0x52aa('‫4e','UTgb'))){console[_0x52aa('‫4f','$#ZJ')](e);_0x3e01de[_0x52aa('‫50','!!w[')](_0x293c17);}else{console[_0x52aa('‫51','3*N$')](JSON['stringify'](_0x33ac8d));console[_0x52aa('‫52','F]1X')]($[_0x52aa('‮53','TK&D')]+'\x20'+_0x346fca+_0x52aa('‫3a','$]Ks'));_0x4d41f3['BCLHy'](_0x293c17);}}else{if(_0x4d41f3[_0x52aa('‮54','F]1X')](safeGet,_0x5d410c)){_0x5d410c=JSON['parse'](_0x5d410c);}}}catch(_0x363b78){console[_0x52aa('‫55','TK&D')](_0x363b78);_0x4d41f3['MdvdF'](_0x293c17);}finally{_0x293c17(_0x5d410c);}}else{if(safeGet(_0x5d410c)){_0x5d410c=JSON[_0x52aa('‮56','!!w[')](_0x5d410c);}}});},_0x3d2c24[_0x52aa('‮57','*CO5')](0x1,0x3e8));});};_0xodm='jsjiami.com.v6';
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
