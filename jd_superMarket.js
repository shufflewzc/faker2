/*
东东超市
Last Modified time: 2021-3-4 21:22:37
活动入口：京东APP首页-京东超市-底部东东超市
Some Functions Modified From https://github.com/Zero-S1/JD_tools/blob/master/JD_superMarket.py
东东超市兑换奖品请使用此脚本 jd_blueCoin.js
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
=================QuantumultX==============
[task_local]
#东东超市
11 * * * * jd_superMarket.js, tag=东东超市, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jxc.png, enabled=true
===========Loon===============
[Script]
cron "11 * * * *" script-path=jd_superMarket.js,tag=东东超市
=======Surge===========
东东超市 = type=cron,cronexp="11 * * * *",wake-system=1,timeout=3600,script-path=jd_superMarket.js
==============小火箭=============
东东超市 = type=cron,script-path=jd_superMarket.js, cronexpr="11 * * * *", timeout=3600, enable=true
 */
const $ = new Env('东东超市');
//Node.js用户请在jdCookie.js处填写京东ck;
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', jdSuperMarketShareArr = [], notify, newShareCodes;
let helpAu = true;//给作者助力 免费拿,省钱大赢家等活动.默认true是,false不助力.
helpAu = $.isNode() ? (process.env.HELP_AUTHOR ? process.env.HELP_AUTHOR === 'true' : helpAu) : helpAu;
let jdNotify = true;//用来是否关闭弹窗通知，true表示关闭，false表示开启。
let superMarketUpgrade = true;//自动升级,顺序:解锁升级商品、升级货架,true表示自动升级,false表示关闭自动升级
let businessCircleJump = true;//小于对方300热力值自动更换商圈队伍,true表示运行,false表示禁止
let drawLotteryFlag = false;//是否用500蓝币去抽奖，true表示开启，false表示关闭。默认关闭
let joinPkTeam = true;//是否自动加入PK队伍
let message = '', subTitle;
const JD_API_HOST = 'https://api.m.jd.com/api';

//助力好友分享码
//此此内容是IOS用户下载脚本到本地使用，填写互助码的地方，同一京东账号的好友互助码请使用@符号隔开。
//下面给出两个账号的填写示例（iOS只支持2个京东账号）
let shareCodes = []

!(async () => {
  await requireConfig();
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.coincount = 0;//收取了多少个蓝币
      $.coinerr = "";
      $.blueCionTimes = 0;
      $.isLogin = true;
      $.nickName = '';
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
      //await shareCodesFormat();//格式化助力码
      await jdSuperMarket();
      await showMsg();
      // await businessCircleActivity();
    }
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
async function jdSuperMarket() {
  try {
    await smtgHome();
    // await receiveGoldCoin();//收金币
    // await businessCircleActivity();//商圈活动
    await receiveBlueCoin();//收蓝币（小费）
    // await receiveLimitProductBlueCoin();//收限时商品的蓝币
    await daySign();//每日签到
    await BeanSign()//
    await doDailyTask();//做日常任务，分享，关注店铺，
    // await help();//商圈助力
    //await smtgQueryPkTask();//做商品PK任务
    await drawLottery();//抽奖功能(招财进宝)
    // await myProductList();//货架
    // await upgrade();//升级货架和商品
    // await manageProduct();
    // await limitTimeProduct();
    await smtg_shopIndex();
    await smtgHome();
    await receiveUserUpgradeBlue();
    await Home();
    if (helpAu === true) {
      await helpAuthor();
    }
  } catch (e) {
    $.logErr(e)
  }
}
function showMsg() {
  $.log(`【京东账号${$.index}】${$.nickName}\n${message}`);
  jdNotify = $.getdata('jdSuperMarketNotify') ? $.getdata('jdSuperMarketNotify') : jdNotify;
  if (!jdNotify || jdNotify === 'false') {
    $.msg($.name, subTitle ,`【京东账号${$.index}】${$.nickName}\n${message}`);
  }
}
//抽奖功能(招财进宝)
async function drawLottery() {
  console.log(`\n注意⚠:东东超市抽奖已改版,花费500蓝币抽奖一次,现在脚本默认已关闭抽奖功能\n`);
  drawLotteryFlag = $.getdata('jdSuperMarketLottery') ? $.getdata('jdSuperMarketLottery') : drawLotteryFlag;
  if ($.isNode() && process.env.SUPERMARKET_LOTTERY) {
    drawLotteryFlag = process.env.SUPERMARKET_LOTTERY;
  }
  if (`${drawLotteryFlag}` === 'true') {
    const smtg_lotteryIndexRes = await smtg_lotteryIndex();
    if (smtg_lotteryIndexRes && smtg_lotteryIndexRes.data.bizCode === 0) {
      const { result } = smtg_lotteryIndexRes.data
      if (result.blueCoins > result.costCoins && result.remainedDrawTimes > 0) {
        const drawLotteryRes = await smtg_drawLottery();
        console.log(`\n花费${result.costCoins}蓝币抽奖结果${JSON.stringify(drawLotteryRes)}`);
        await drawLottery();
      } else {
        console.log(`\n抽奖失败:已抽奖或者蓝币不足`);
        console.log(`失败详情：\n现有蓝币:${result.blueCoins},抽奖次数:${result.remainedDrawTimes}`)
      }
    }
  } else {
    console.log(`设置的为不抽奖\n`)
  }
}
async function help() {
  return
  console.log(`\n开始助力好友`);
  for (let code of newShareCodes) {
    if (!code) continue;
    const res = await smtgDoAssistPkTask(code);
    console.log(`助力好友${JSON.stringify(res)}`);
  }
}
async function doDailyTask() {
  const smtgQueryShopTaskRes = await smtgQueryShopTask();
  if (smtgQueryShopTaskRes.code === 0 && smtgQueryShopTaskRes.data.success) {
    const taskList = smtgQueryShopTaskRes.data.result.taskList;
    console.log(`\n日常赚钱任务       完成状态`)
    for (let item of taskList) {
      console.log(` ${item['title'].length < 4 ? item['title']+`\xa0` : item['title'].slice(-4)}         ${item['finishNum'] === item['targetNum'] ? '已完成':'未完成'} ${item['finishNum']}/${item['targetNum']}`)
    }
    for (let item of taskList) {
      //领奖
      if (item.taskStatus === 1 && item.prizeStatus === 1) {
        const res = await smtgObtainShopTaskPrize(item.taskId);
        console.log(`\n领取做完任务的奖励${JSON.stringify(res)}\n`)
      }
      //做任务
      if ((item.type === 1 || item.type === 11) && item.taskStatus === 0) {
        // 分享任务
        const res = await smtgDoShopTask(item.taskId);
        console.log(`${item.subTitle}结果${JSON.stringify(res)}`)
      }
      if (item.type === 2) {
        //逛会场
        if (item.taskStatus === 0) {
          console.log('开始逛会场')
          const itemId = item.content[item.type].itemId;
          const res = await smtgDoShopTask(item.taskId, itemId);
          console.log(`${item.subTitle}结果${JSON.stringify(res)}`);
        }
      }
      if (item.type === 8) {
        //关注店铺
        if (item.taskStatus === 0) {
          console.log('开始关注店铺')
          const itemId = item.content[item.type].itemId;
          const res = await smtgDoShopTask(item.taskId, itemId);
          console.log(`${item.subTitle}结果${JSON.stringify(res)}`);
        }
      }
      if (item.type === 9) {
        //开卡领蓝币任务
        if (item.taskStatus === 0) {
          console.log('开始开卡领蓝币任务')
          const itemId = item.content[item.type].itemId;
          const res = await smtgDoShopTask(item.taskId, itemId);
          console.log(`${item.subTitle}结果${JSON.stringify(res)}`);
        }
      }
      if (item.type === 10) {
        //关注商品领蓝币
        if (item.taskStatus === 0) {
          console.log('关注商品')
          const itemId = item.content[item.type].itemId;
          const res = await smtgDoShopTask(item.taskId, itemId);
          console.log(`${item.subTitle}结果${JSON.stringify(res)}`);
        }
      }
      if ((item.type === 8 || item.type === 2 || item.type === 10) && item.taskStatus === 0) {
        // await doDailyTask();
      }
    }
  }
}
async function receiveGoldCoin() {
  const options = taskUrl("smtg_newHome", {
    "shareId": "",
    "channel": "4",
  });
  $.get(options, (err, resp, data) => {});
  $.goldCoinData = await smtgReceiveCoin({"type":0});
  if ($.goldCoinData.data && $.goldCoinData.data.bizCode === 0) {
    console.log(`领取金币成功：${$.goldCoinData.data.result.receivedGold}`);
    message += `【领取金币】${$.goldCoinData.data.result.receivedGold}个\n`;
  } else {
    console.log($.goldCoinData.data && $.goldCoinData.data.bizMsg);
  }
}

function smtgHome() {
  return new Promise((resolve) => {
    const options = taskUrl("smtg_newHome", {
      "shareId": "",
      "channel": "4",
    });
    $.get(options, (err, resp, data) => {});
    $.get(taskUrl("smtg_newHome", {"shopType":"0","channel":"18"}), (err, resp, data) => {
      try {
        if (err) {
          console.log("\n东东超市: API查询请求失败 ‼️‼️");
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
          if (data.code === 0 && data.data.success) {
            const { result } = data.data;
            const {
              shopName,
              totalBlue,
              userUpgradeBlueVos,
              turnoverProgress,
              currentShopId
            } = result;
            $.currentShopId = currentShopId
            $.userUpgradeBlueVos = userUpgradeBlueVos;
            $.turnoverProgress = turnoverProgress;
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}

//领限时商品的蓝币
async function receiveLimitProductBlueCoin() {
  const res = await smtgReceiveCoin({ "type": 1 });
  console.log(`\n限时商品领蓝币结果：[${res.data.bizMsg}]\n`);
  if (res.data.bizCode === 0) {
    message += `【限时商品】获得${res.data.result.receivedBlue}个蓝币\n`;
  }
}

//领蓝币
function receiveBlueCoin(timeout = 0) {
  return new Promise((resolve) => {
    setTimeout( ()=>{
      $.get(taskUrl('smtg_receiveCoin', {"type": 4, "shopId": $.currentShopId, "channel": "18"}), async (err, resp, data) => {
        try {
          if (err) {
            console.log('\n东东超市: API查询请求失败 ‼️‼️')
            console.log(JSON.stringify(err));
          } else {
            data = JSON.parse(data);
            $.data = data;
            if ($.data.data.bizCode !== 0 && $.data.data.bizCode !== 809) {
              $.coinerr = `${$.data.data.bizMsg}`;
              message += `【收取小费】${$.data.data.bizMsg}\n`;
              console.log(`收取蓝币失败：${$.data.data.bizMsg}`)
              return
            }
            if  ($.data.data.bizCode === 0) {
              $.coincount += $.data.data.result.receivedBlue;
              $.blueCionTimes ++;
              console.log(`【京东账号${$.index}】${$.nickName} 第${$.blueCionTimes}次领蓝币成功，获得${$.data.data.result.receivedBlue}个\n`)
              if (!$.data.data.result.isNextReceived) {
                message += `【收取小费】${$.coincount}个\n`;
                return
              }
            }
            await receiveBlueCoin(3000);
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
async function daySign() {
  const signDataRes = await smtgSign({"shareId":"QcSH6BqSXysv48bMoRfTBz7VBqc5P6GodDUBAt54d8598XAUtNoGd4xWVuNtVVwNO1dSKcoaY3sX_13Z-b3BoSW1W7NnqD36nZiNuwrtyO-gXbjIlsOBFpgIPMhpiVYKVAaNiHmr2XOJptu14d8uW-UWJtefjG9fUGv0Io7NwAQ","channel":"4"});
  await smtgSign({"shareId":"TBj0jH-x7iMvCMGsHfc839Tfnco6UarNx1r3wZVIzTZiLdWMRrmoocTbXrUOFn0J6UIir16A2PPxF50_Eoo7PW_NQVOiM-3R16jjlT20TNPHpbHnmqZKUDaRajnseEjVb-SYi6DQqlSOioRc27919zXTEB6_llab2CW2aDok36g","channel":"4"});
  if (signDataRes && signDataRes.code === 0) {
    const signList = await smtgSignList();
    if (signList.data.bizCode === 0) {
      $.todayDay = signList.data.result.todayDay;
    }
    if (signDataRes.code === 0 && signDataRes.data.success) {
      message += `【第${$.todayDay}日签到】成功，奖励${signDataRes.data.result.rewardBlue}蓝币\n`
    } else {
      message += `【第${$.todayDay}日签到】${signDataRes.data.bizMsg}\n`
    }
  }
}
async function BeanSign() {
  const beanSignRes = await smtgSign({"channel": "1"});
  if (beanSignRes && beanSignRes.data['bizCode'] === 0) {
    console.log(`每天从指定入口进入游戏,可获得额外奖励:${JSON.stringify(beanSignRes)}`)
  }
}
//每日签到
function smtgSign(body) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_sign', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}

// 商圈活动
async function businessCircleActivity() {
  // console.log(`\n商圈PK奖励,次日商圈大战开始的时候自动领领取\n`)
  joinPkTeam = $.isNode() ? (process.env.JOIN_PK_TEAM ? process.env.JOIN_PK_TEAM : `${joinPkTeam}`) : ($.getdata('JOIN_PK_TEAM') ? $.getdata('JOIN_PK_TEAM') : `${joinPkTeam}`);
  const smtg_getTeamPkDetailInfoRes = await smtg_getTeamPkDetailInfo();
  if (smtg_getTeamPkDetailInfoRes && smtg_getTeamPkDetailInfoRes.data.bizCode === 0) {
    const { joinStatus, pkStatus, inviteCount, inviteCode, currentUserPkInfo, pkUserPkInfo, prizeInfo, pkActivityId, teamId } = smtg_getTeamPkDetailInfoRes.data.result;
    console.log(`\njoinStatus:${joinStatus}`);
    console.log(`pkStatus:${pkStatus}\n`);
    console.log(`pkActivityId:${pkActivityId}\n`);

    if (joinStatus === 0) {
      if (joinPkTeam === 'true') {
        console.log(`\n注：PK会在每天的七点自动随机加入作者创建的队伍\n`)
        await updatePkActivityIdCDN('https://cdn.jsdelivr.net/gh/gitupdate/updateTeam@master/shareCodes/jd_updateTeam.json');
        console.log(`\nupdatePkActivityId[pkActivityId]:::${$.updatePkActivityIdRes && $.updatePkActivityIdRes.pkActivityId}`);
        console.log(`\n京东服务器返回的[pkActivityId] ${pkActivityId}`);
        if ($.updatePkActivityIdRes && ($.updatePkActivityIdRes.pkActivityId === pkActivityId)) {
          await getTeam();
          let Teams = []
          Teams = $.updatePkActivityIdRes['Teams'] || Teams;
          if ($.getTeams && $.getTeams.length) {
            Teams = [...Teams, ...$.getTeams.filter(item => item['pkActivityId'] === `${pkActivityId}`)];
          }
          const randomNum = randomNumber(0, Teams.length);

          const res = await smtg_joinPkTeam(Teams[randomNum] && Teams[randomNum].teamId, Teams[randomNum] && Teams[randomNum].inviteCode, pkActivityId);
          if (res && res.data.bizCode === 0) {
            console.log(`加入战队成功`)
          } else if (res && res.data.bizCode === 229) {
            console.log(`加入战队失败,该战队已满\n无法加入`)
          } else {
            console.log(`加入战队其他未知情况:${JSON.stringify(res)}`)
          }
        } else {
          console.log('\nupdatePkActivityId请求返回的pkActivityId与京东服务器返回不一致,暂时不加入战队')
        }
      }
    } else if (joinStatus === 1) {
      if (teamId) {
        console.log(`inviteCode: [${inviteCode}]`);
        console.log(`PK队伍teamId: [${teamId}]`);
        console.log(`PK队伍名称: [${currentUserPkInfo && currentUserPkInfo.teamName}]`);
        console.log(`我邀请的人数:${inviteCount}\n`)
        console.log(`\n我方战队战队 [${currentUserPkInfo && currentUserPkInfo.teamName}]/【${currentUserPkInfo && currentUserPkInfo.teamCount}】`);
        console.log(`对方战队战队 [${pkUserPkInfo && pkUserPkInfo.teamName}]/【${pkUserPkInfo && pkUserPkInfo.teamCount}】\n`);
      }
    }
    if (pkStatus === 1) {
      console.log(`商圈PK进行中\n`)
      if (!teamId) {
        const receivedPkTeamPrize = await smtg_receivedPkTeamPrize();
        console.log(`商圈PK奖励领取结果：${JSON.stringify(receivedPkTeamPrize)}\n`)
        if (receivedPkTeamPrize.data.bizCode === 0) {
          if (receivedPkTeamPrize.data.result.pkResult === 1) {
            const { pkTeamPrizeInfoVO } = receivedPkTeamPrize.data.result;
            message += `【商圈PK奖励】${pkTeamPrizeInfoVO.blueCoin}蓝币领取成功\n`;
            if ($.isNode()) {
              await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】 ${$.nickName}\n【商圈队伍】PK获胜\n【奖励】${pkTeamPrizeInfoVO.blueCoin}蓝币领取成功`)
            }
          } else if (receivedPkTeamPrize.data.result.pkResult === 2) {
            if ($.isNode()) {
              await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】 ${$.nickName}\n【商圈队伍】PK失败`)
            }
          }
        }
      }
    } else if (pkStatus === 2) {
      console.log(`商圈PK结束了`)
      if (prizeInfo.pkPrizeStatus === 2) {
        console.log(`开始领取商圈PK奖励`);
        // const receivedPkTeamPrize = await smtg_receivedPkTeamPrize();
        // console.log(`商圈PK奖励领取结果：${JSON.stringify(receivedPkTeamPrize)}`)
        // if (receivedPkTeamPrize.data.bizCode === 0) {
        //   if (receivedPkTeamPrize.data.result.pkResult === 1) {
        //     const { pkTeamPrizeInfoVO } = receivedPkTeamPrize.data.result;
        //     message += `【商圈PK奖励】${pkTeamPrizeInfoVO.blueCoin}蓝币领取成功\n`;
        //     if ($.isNode()) {
        //       await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】 ${$.nickName}\n【商圈队伍】PK获胜\n【奖励】${pkTeamPrizeInfoVO.blueCoin}蓝币领取成功`)
        //     }
        //   } else if (receivedPkTeamPrize.data.result.pkResult === 2) {
        //     if ($.isNode()) {
        //       await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】 ${$.nickName}\n【商圈队伍】PK失败`)
        //     }
        //   }
        // }
      } else if (prizeInfo.pkPrizeStatus === 1) {
        console.log(`商圈PK奖励已经领取\n`)
      }
    } else if (pkStatus === 3) {
      console.log(`商圈PK暂停中\n`)
    }
  } else {
    console.log(`\n${JSON.stringify(smtg_getTeamPkDetailInfoRes)}\n`)
  }
  return
  const businessCirclePKDetailRes = await smtg_businessCirclePKDetail();
  if (businessCirclePKDetailRes && businessCirclePKDetailRes.data.bizCode === 0) {
    const { businessCircleVO, otherBusinessCircleVO, inviteCode, pkSettleTime } = businessCirclePKDetailRes.data.result;
    console.log(`\n【您的商圈inviteCode互助码】：\n${inviteCode}\n\n`);
    const businessCircleIndexRes = await smtg_businessCircleIndex();
    const { result } = businessCircleIndexRes.data;
    const { pkPrizeStatus, pkStatus  } = result;
    if (pkPrizeStatus === 2) {
      console.log(`开始领取商圈PK奖励`);
      const getPkPrizeRes = await smtg_getPkPrize();
      console.log(`商圈PK奖励领取结果：${JSON.stringify(getPkPrizeRes)}`)
      if (getPkPrizeRes.data.bizCode === 0) {
        const { pkPersonPrizeInfoVO, pkTeamPrizeInfoVO } = getPkPrizeRes.data.result;
        message += `【商圈PK奖励】${pkPersonPrizeInfoVO.blueCoin + pkTeamPrizeInfoVO.blueCoin}蓝币领取成功\n`;
      }
    }
    console.log(`我方商圈人气值/对方商圈人气值：${businessCircleVO.hotPoint}/${otherBusinessCircleVO.hotPoint}`);
    console.log(`我方商圈成员数量/对方商圈成员数量：${businessCircleVO.memberCount}/${otherBusinessCircleVO.memberCount}`);
    message += `【我方商圈】${businessCircleVO.memberCount}/${businessCircleVO.hotPoint}\n`;
    message += `【对方商圈】${otherBusinessCircleVO.memberCount}/${otherBusinessCircleVO.hotPoint}\n`;
    // message += `【我方商圈人气值】${businessCircleVO.hotPoint}\n`;
    // message += `【对方商圈人气值】${otherBusinessCircleVO.hotPoint}\n`;
    businessCircleJump = $.getdata('jdBusinessCircleJump') ? $.getdata('jdBusinessCircleJump') : businessCircleJump;
    if ($.isNode() && process.env.jdBusinessCircleJump) {
      businessCircleJump = process.env.jdBusinessCircleJump;
    }
    if (`${businessCircleJump}` === 'false') {
      console.log(`\n小于对方300热力值自动更换商圈队伍: 您设置的是禁止自动更换商圈队伍\n`);
      return
    }
    if (otherBusinessCircleVO.hotPoint - businessCircleVO.hotPoint > 300 && (Date.now() > (pkSettleTime - 24 * 60 * 60 * 1000))) {
      //退出该商圈
      if (inviteCode === '-4msulYas0O2JsRhE-2TA5XZmBQ') return;
      console.log(`商圈PK已过1天，对方商圈人气值还大于我方商圈人气值300，退出该商圈重新加入`);
      await smtg_quitBusinessCircle();
    } else if (otherBusinessCircleVO.hotPoint > businessCircleVO.hotPoint && (Date.now() > (pkSettleTime - 24 * 60 * 60 * 1000 * 2))) {
      //退出该商圈
      if (inviteCode === '-4msulYas0O2JsRhE-2TA5XZmBQ') return;
      console.log(`商圈PK已过2天，对方商圈人气值还大于我方商圈人气值，退出该商圈重新加入`);
      await smtg_quitBusinessCircle();
    }
  } else if (businessCirclePKDetailRes && businessCirclePKDetailRes.data.bizCode === 222) {
    console.log(`${businessCirclePKDetailRes.data.bizMsg}`);
    console.log(`开始领取商圈PK奖励`);
    const getPkPrizeRes = await smtg_getPkPrize();
    console.log(`商圈PK奖励领取结果：${JSON.stringify(getPkPrizeRes)}`)
    if (getPkPrizeRes && getPkPrizeRes.data.bizCode === 0) {
      const { pkPersonPrizeInfoVO, pkTeamPrizeInfoVO } = getPkPrizeRes.data.result;
      $.msg($.name, '', `【京东账号${$.index}】 ${$.nickName}\n【商圈PK奖励】${pkPersonPrizeInfoVO.blueCoin + pkTeamPrizeInfoVO.blueCoin}蓝币领取成功`)
      if ($.isNode()) {
        await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】 ${$.nickName}\n【商圈PK奖励】${pkPersonPrizeInfoVO.blueCoin + pkTeamPrizeInfoVO.blueCoin}蓝币领取成功`)
      }
    }
  } else if (businessCirclePKDetailRes && businessCirclePKDetailRes.data.bizCode === 206) {
    console.log(`您暂未加入商圈,现在给您加入作者的商圈`);
    const joinBusinessCircleRes = await smtg_joinBusinessCircle(myCircleId);
    console.log(`参加商圈结果：${JSON.stringify(joinBusinessCircleRes)}`)
    if (joinBusinessCircleRes.data.bizCode !== 0) {
      console.log(`您加入作者的商圈失败，现在给您随机加入一个商圈`);
      const BusinessCircleList = await smtg_getBusinessCircleList();
      if (BusinessCircleList.data.bizCode === 0) {
        const { businessCircleVOList } = BusinessCircleList.data.result;
        const { circleId } = businessCircleVOList[randomNumber(0, businessCircleVOList.length)];
        const joinBusinessCircleRes = await smtg_joinBusinessCircle(circleId);
        console.log(`随机加入商圈结果：${JSON.stringify(joinBusinessCircleRes)}`)
      }
    }
  } else {
    console.log(`访问商圈详情失败：${JSON.stringify(businessCirclePKDetailRes)}`);
  }
}
//我的货架
async function myProductList() {
  const shelfListRes = await smtg_shelfList();
  if (shelfListRes.data.bizCode === 0) {
    const { shelfList } = shelfListRes.data.result;
    console.log(`\n货架数量:${shelfList && shelfList.length}`)
    for (let item of shelfList) {
      console.log(`\nshelfId/name : ${item.shelfId}/${item.name}`);
      console.log(`货架等级 level ${item.level}/${item.maxLevel}`);
      console.log(`上架状态 groundStatus ${item.groundStatus}`);
      console.log(`解锁状态 unlockStatus ${item.unlockStatus}`);
      console.log(`升级状态 upgradeStatus ${item.upgradeStatus}`);
      if (item.unlockStatus === 0) {
        console.log(`${item.name}不可解锁`)
      } else if (item.unlockStatus === 1) {
        console.log(`${item.name}可解锁`);
        await smtg_unlockShelf(item.shelfId);
      } else if (item.unlockStatus === 2) {
        console.log(`${item.name}已经解锁`)
      }
      if (item.groundStatus === 1) {
        console.log(`${item.name}可上架`);
        const productListRes = await smtg_shelfProductList(item.shelfId);
        if (productListRes.data.bizCode === 0) {
          const { productList } = productListRes.data.result;
          if (productList && productList.length > 0) {
            // 此处限时商品未分配才会出现
            let limitTimeProduct = [];
            for (let item of productList) {
              if (item.productType === 2) {
                limitTimeProduct.push(item);
              }
            }
            if (limitTimeProduct && limitTimeProduct.length > 0) {
              //上架限时商品
              await smtg_ground(limitTimeProduct[0].productId, item.shelfId);
            } else {
              await smtg_ground(productList[productList.length - 1].productId, item.shelfId);
            }
          } else {
            console.log("无可上架产品");
            await unlockProductByCategory(item.shelfId.split('-')[item.shelfId.split('-').length - 1])
          }
        }
      } else if (item.groundStatus === 2 || item.groundStatus === 3) {
        if (item.productInfo.productType === 2) {
          console.log(`[${item.name}][限时商品]`)
        } else if (item.productInfo.productType === 1){
          console.log(`[${item.name}]`)
        } else {
          console.log(`[${item.name}][productType:${item.productInfo.productType}]`)
        }
      }
    }
  }
}
//根据类型解锁一个商品,货架可上架商品时调用
async function unlockProductByCategory(category) {
  const smtgProductListRes = await smtg_productList();
  if (smtgProductListRes.data.bizCode === 0) {
    let productListByCategory = [];
    const { productList } = smtgProductListRes.data.result;
    for (let item of productList) {
      if (item['unlockStatus'] === 1 && item['shelfCategory'].toString() === category) {
        productListByCategory.push(item);
      }
    }
    if (productListByCategory && productListByCategory.length > 0) {
      console.log(`待解锁的商品数量:${productListByCategory.length}`);
      await smtg_unlockProduct(productListByCategory[productListByCategory.length - 1]['productId']);
    } else {
      console.log("该类型商品暂时无法解锁");
    }
  }
}
//升级货架和商品
async function upgrade() {
  superMarketUpgrade = $.getdata('jdSuperMarketUpgrade') ? $.getdata('jdSuperMarketUpgrade') : superMarketUpgrade;
  if ($.isNode() && process.env.SUPERMARKET_UPGRADE) {
    superMarketUpgrade = process.env.SUPERMARKET_UPGRADE;
  }
  if (`${superMarketUpgrade}` === 'false') {
    console.log(`\n自动升级: 您设置的是关闭自动升级\n`);
    return
  }
  console.log(`\n*************开始检测升级商品，如遇到商品能解锁，则优先解锁***********`)
  console.log('目前没有平稳升级,只取倒数几个商品进行升级,普通货架取倒数4个商品,冰柜货架取倒数3个商品,水果货架取倒数2个商品')
  const smtgProductListRes = await smtg_productList();
  if (smtgProductListRes.data.bizCode === 0) {
    let productType1 = [], shelfCategory_1 = [], shelfCategory_2 = [], shelfCategory_3 = [];
    const { productList } = smtgProductListRes.data.result;
    for (let item of productList) {
      if (item['productType'] === 1) {
        productType1.push(item);
      }
    }
    for (let item2 of productType1) {
      if (item2['shelfCategory'] === 1) {
        shelfCategory_1.push(item2);
      }
      if (item2['shelfCategory'] === 2) {
        shelfCategory_2.push(item2);
      }
      if (item2['shelfCategory'] === 3) {
        shelfCategory_3.push(item2);
      }
    }
    shelfCategory_1 = shelfCategory_1.slice(-4);
    shelfCategory_2 = shelfCategory_2.slice(-3);
    shelfCategory_3 = shelfCategory_3.slice(-2);
    const shelfCategorys = shelfCategory_1.concat(shelfCategory_2).concat(shelfCategory_3);
    console.log(`\n商品名称       归属货架     目前等级    解锁状态    可升级状态`)
    for (let item of shelfCategorys) {
      console.log(`  ${item["name"].length<3?item["name"]+`\xa0`:item["name"]}       ${item['shelfCategory'] === 1 ? '普通货架' : item['shelfCategory'] === 2 ? '冰柜货架' : item['shelfCategory'] === 3 ? '水果货架':'未知货架'}       ${item["unlockStatus"] === 0 ? '---' : item["level"]+'级'}     ${item["unlockStatus"] === 0 ? '未解锁' : '已解锁'}      ${item["upgradeStatus"] === 1 ? '可以升级' : item["upgradeStatus"] === 0 ? '不可升级':item["upgradeStatus"]}`)
    }
    shelfCategorys.sort(sortSyData);
    for (let item of shelfCategorys) {
      if (item['unlockStatus'] === 1) {
        console.log(`\n开始解锁商品：${item['name']}`)
        await smtg_unlockProduct(item['productId']);
        break;
      }
      if (item['upgradeStatus'] === 1) {
        console.log(`\n开始升级商品：${item['name']}`)
        await smtg_upgradeProduct(item['productId']);
        break;
      }
    }
  }
  console.log('\n**********开始检查能否升级货架***********');
  const shelfListRes = await smtg_shelfList();
  if (shelfListRes.data.bizCode === 0) {
    const { shelfList } = shelfListRes.data.result;
    let shelfList_upgrade = [];
    for (let item of shelfList) {
      if (item['upgradeStatus'] === 1) {
        shelfList_upgrade.push(item);
      }
    }
    console.log(`待升级货架数量${shelfList_upgrade.length}个`);
    if (shelfList_upgrade && shelfList_upgrade.length > 0) {
      shelfList_upgrade.sort(sortSyData);
      console.log("\n可升级货架名         等级     升级所需金币");
      for (let item of shelfList_upgrade) {
        console.log(` [${item["name"]}]         ${item["level"]}/${item["maxLevel"]}         ${item["upgradeCostGold"]}`);
      }
      console.log(`开始升级[${shelfList_upgrade[0].name}]货架，当前等级${shelfList_upgrade[0].level}，所需金币${shelfList_upgrade[0].upgradeCostGold}\n`);
      await smtg_upgradeShelf(shelfList_upgrade[0].shelfId);
    }
  }
}
async function manageProduct() {
  console.log(`安排上货(单价最大商品)`);
  const shelfListRes = await smtg_shelfList();
  if (shelfListRes.data.bizCode === 0) {
    const { shelfList } = shelfListRes.data.result;
    console.log(`我的货架数量:${shelfList && shelfList.length}`);
    let shelfListUnlock = [];//可以上架的货架
    for (let item of shelfList) {
      if (item['groundStatus'] === 1 || item['groundStatus'] === 2) {
        shelfListUnlock.push(item);
      }
    }
    for (let item of shelfListUnlock) {
      const productListRes = await smtg_shelfProductList(item.shelfId);//查询该货架可以上架的商品
      if (productListRes.data.bizCode === 0) {
        const { productList } = productListRes.data.result;
        let productNow = [], productList2 = [];
        for (let item1 of productList) {
          if (item1['groundStatus'] === 2) {
            productNow.push(item1);
          }
          if (item1['productType'] === 1) {
            productList2.push(item1);
          }
        }
        // console.log(`productNow${JSON.stringify(productNow)}`)
        // console.log(`productList2${JSON.stringify(productList2)}`)
        if (productList2 && productList2.length > 0) {
          productList2.sort(sortTotalPriceGold);
          // console.log(productList2)
          if (productNow && productNow.length > 0) {
            if (productList2.slice(-1)[0]['productId'] === productNow[0]['productId']) {
              console.log(`货架[${item.shelfId}]${productNow[0]['name']}已上架\n`)
              continue;
            }
          }
          await smtg_ground(productList2.slice(-1)[0]['productId'], item['shelfId'])
        }
      }
    }
  }
}
async function limitTimeProduct() {
  const smtgProductListRes = await smtg_productList();
  if (smtgProductListRes.data.bizCode === 0) {
    const { productList } = smtgProductListRes.data.result;
    let productList2 = [];
    for (let item of productList) {
      if (item['productType'] === 2 && item['groundStatus'] === 1) {
        //未上架并且限时商品
        console.log(`出现限时商品[${item.name}]`)
        productList2.push(item);
      }
    }
    if (productList2 && productList2.length > 0) {
      for (let item2 of productList2) {
        const { shelfCategory } = item2;
        const shelfListRes = await smtg_shelfList();
        if (shelfListRes.data.bizCode === 0) {
          const { shelfList } = shelfListRes.data.result;
          let shelfList2 = [];
          for (let item3 of shelfList) {
            if (item3['shelfCategory'] === shelfCategory && (item3['groundStatus'] === 1 || item3['groundStatus'] === 2)) {
              shelfList2.push(item3['shelfId']);
            }
          }
          if (shelfList2 && shelfList2.length > 0) {
            const groundRes = await smtg_ground(item2['productId'], shelfList2.slice(-1)[0]);
            if (groundRes.data.bizCode === 0) {
              console.log(`限时商品上架成功`);
              message += `【限时商品】上架成功\n`;
            }
          }
        }
      }
    } else {
      console.log(`限时商品已经上架或暂无限时商品`);
    }
  }
}
//领取店铺升级的蓝币奖励
async function receiveUserUpgradeBlue() {
  $.receiveUserUpgradeBlue = 0;
  if ($.userUpgradeBlueVos && $.userUpgradeBlueVos.length > 0) {
    for (let item of $.userUpgradeBlueVos) {
      const receiveCoin = await smtgReceiveCoin({ "id": item.id, "type": 5 })
      // $.log(`\n${JSON.stringify(receiveCoin)}`)
      if (receiveCoin && receiveCoin.data['bizCode'] === 0) {
        $.receiveUserUpgradeBlue += receiveCoin.data.result['receivedBlue']
      }
    }
    $.log(`店铺升级奖励获取:${$.receiveUserUpgradeBlue}蓝币\n`)
  }
  const res = await smtgReceiveCoin({"type": 4, "channel": "18"})
  // $.log(`${JSON.stringify(res)}\n`)
  if (res && res.data['bizCode'] === 0) {
    console.log(`\n收取营业额：获得 ${res.data.result['receivedTurnover']}\n`);
  }
}
async function Home() {
  const homeRes = await smtgHome();
  if (homeRes && homeRes.data['bizCode'] === 0) {
    const { result } = homeRes.data;
    const { shopName, totalBlue } = result;
    subTitle = shopName;
    message += `【总蓝币】${totalBlue}个\n`;
  }
}
//=============================================脚本使用到的京东API=====================================

//===新版本

//查询有哪些货架
function smtg_shopIndex() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_shopIndex', { "channel": 1 }), async (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
          if (data && data.data['bizCode'] === 0) {
            const { shopId, shelfList, merchandiseList, level } = data.data['result'];
            message += `【店铺等级】${level}\n`;
            if (shelfList && shelfList.length > 0) {
              for (let item of shelfList) {
                //status: 2可解锁,1可升级,-1不可解锁
                if (item['status'] === 2) {
                  $.log(`${item['name']}可解锁\n`)
                  await smtg_shelfUnlock({ shopId, "shelfId": item['id'], "channel": 1 })
                } else if (item['status'] === 1) {
                  $.log(`${item['name']}可升级\n`)
                  await smtg_shelfUpgrade({ shopId, "shelfId": item['id'], "channel": 1, "targetLevel": item['level'] + 1 });
                } else if (item['status'] === -1) {
                  $.log(`[${item['name']}] 未解锁`)
                } else if (item['status'] === 0) {
                  $.log(`[${item['name']}] 已解锁，当前等级：${item['level']}级`)
                } else {
                  $.log(`未知店铺状态(status)：${item['status']}\n`)
                }
              }
            }
            if (data.data['result']['forSaleMerchandise']) {
              $.log(`\n限时商品${data.data['result']['forSaleMerchandise']['name']}已上架`)
            } else {
              if (merchandiseList && merchandiseList.length > 0) {
                for (let  item of merchandiseList) {
                  console.log(`发现限时商品${item.name}\n`);
                  await smtg_sellMerchandise({"shopId": shopId,"merchandiseId": item['id'],"channel":"18"})
                }
              }
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//解锁店铺
function smtg_shelfUnlock(body) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_shelfUnlock', body), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          $.log(`解锁店铺结果:${data}\n`)
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_shelfUpgrade(body) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_shelfUpgrade', body), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          $.log(`店铺升级结果:${data}\n`)
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//售卖限时商品API
function smtg_sellMerchandise(body) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_sellMerchandise', body), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          $.log(`限时商品售卖结果:${data}\n`)
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//新版东东超市
function updatePkActivityId(url = 'https://raw.githubusercontent.com/xxx/updateTeam/master/jd_updateTeam.json') {
  return new Promise(resolve => {
    $.get({url}, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          // console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          $.updatePkActivityIdRes = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function updatePkActivityIdCDN(url) {
  return new Promise(async resolve => {
    const headers = {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
    }
    $.get({ url, headers, timeout: 10000, }, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          $.updatePkActivityIdRes = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
    await $.wait(10000)
    resolve();
  })
}
function smtgDoShopTask(taskId, itemId) {
  return new Promise((resolve) => {
    const body = {
      "taskId": taskId,
      "channel": "18"
    }
    if (itemId) {
      body.itemId = itemId;
    }
    $.get(taskUrl('smtg_doShopTask', body), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtgObtainShopTaskPrize(taskId) {
  return new Promise((resolve) => {
    const body = {
      "taskId": taskId
    }
    $.get(taskUrl('smtg_obtainShopTaskPrize', body), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtgQueryShopTask() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_queryShopTask'), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtgSignList() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_signList', { "channel": "18" }), (err, resp, data) => {
      try {
        // console.log('ddd----ddd', data)
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//查询商圈任务列表
function smtgQueryPkTask() {
  return new Promise( (resolve) => {
    $.get(taskUrl('smtg_queryPkTask'), async (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
          if (data.code === 0) {
            if (data.data.bizCode === 0) {
              const { taskList } = data.data.result;
              console.log(`\n 商圈任务     状态`)
              for (let item of taskList) {
                if (item.taskStatus === 1) {
                  if (item.prizeStatus === 1) {
                    //任务已做完，但未领取奖励， 现在为您领取奖励
                    await smtgObtainPkTaskPrize(item.taskId);
                  } else if (item.prizeStatus === 0) {
                    console.log(`[${item.title}] 已做完 ${item.finishNum}/${item.targetNum}`);
                  }
                } else {
                  console.log(`[${item.title}] 未做完 ${item.finishNum}/${item.targetNum}`)
                  if (item.content) {
                    const { itemId } = item.content[item.type];
                    console.log('itemId', itemId)
                    await smtgDoPkTask(item.taskId, itemId);
                  }
                }
              }
            } else {
              console.log(`${data.data.bizMsg}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//PK邀请好友
function smtgDoAssistPkTask(code) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_doAssistPkTask', {"inviteCode": code}), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtgReceiveCoin(body) {
  $.goldCoinData = {};
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_receiveCoin', body), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//领取PK任务做完后的奖励
function smtgObtainPkTaskPrize(taskId) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_obtainPkTaskPrize', {"taskId": taskId}), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtgDoPkTask(taskId, itemId) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_doPkTask', {"taskId": taskId, "itemId": itemId}), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_joinPkTeam(teamId, inviteCode, sharePkActivityId) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_joinPkTeam', { teamId, inviteCode, "channel": "3", sharePkActivityId }), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_getTeamPkDetailInfo() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_getTeamPkDetailInfo'), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_businessCirclePKDetail() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_businessCirclePKDetail'), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_getBusinessCircleList() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_getBusinessCircleList'), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//加入商圈API
function smtg_joinBusinessCircle(circleId) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_joinBusinessCircle', { circleId }), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_businessCircleIndex() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_businessCircleIndex'), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_receivedPkTeamPrize() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_receivedPkTeamPrize', {"channel": "1"}), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//领取商圈PK奖励
function smtg_getPkPrize() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_getPkPrize'), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_quitBusinessCircle() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_quitBusinessCircle'), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//我的货架
function smtg_shelfList() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_shelfList'), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//检查某个货架可以上架的商品列表
function smtg_shelfProductList(shelfId) {
  return new Promise((resolve) => {
    console.log(`开始检查货架[${shelfId}] 可上架产品`)
    $.get(taskUrl('smtg_shelfProductList', { shelfId }), (err, resp, data) => {
      try {
        // console.log(`检查货架[${shelfId}] 可上架产品结果:${data}`)
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//升级商品
function smtg_upgradeProduct(productId) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_upgradeProduct', { productId }), (err, resp, data) => {
      try {
        // console.log(`升级商品productId[${productId}]结果:${data}`);
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          console.log(`升级商品结果\n${data}`);
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//解锁商品
function smtg_unlockProduct(productId) {
  return new Promise((resolve) => {
    console.log(`开始解锁商品`)
    $.get(taskUrl('smtg_unlockProduct', { productId }), (err, resp, data) => {
      try {
        // console.log(`解锁商品productId[${productId}]结果:${data}`);
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//升级货架
function smtg_upgradeShelf(shelfId) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_upgradeShelf', { shelfId }), (err, resp, data) => {
      try {
        // console.log(`升级货架shelfId[${shelfId}]结果:${data}`);
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          console.log(`升级货架结果\n${data}`)
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//解锁货架
function smtg_unlockShelf(shelfId) {
  return new Promise((resolve) => {
    console.log(`开始解锁货架`)
    $.get(taskUrl('smtg_unlockShelf', { shelfId }), (err, resp, data) => {
      try {
        // console.log(`解锁货架shelfId[${shelfId}]结果:${data}`);
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_ground(productId, shelfId) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_ground', { productId, shelfId }), (err, resp, data) => {
      try {
        // console.log(`上架商品结果:${data}`);
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_productList() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_productList'), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_lotteryIndex() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_lotteryIndex', {"costType":1,"channel":1}), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_drawLottery() {
  return new Promise(async (resolve) => {
    await $.wait(1000);
    $.get(taskUrl('smtg_drawLottery', {"costType":1,"channel":1}), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function sortSyData(a, b) {
  return a['upgradeCostGold'] - b['upgradeCostGold']
}
function sortTotalPriceGold(a, b) {
  return a['previewTotalPriceGold'] - b['previewTotalPriceGold']
}
//格式化助力码
function shareCodesFormat() {
  return new Promise(resolve => {
    console.log(`第${$.index}个京东账号的助力码:::${jdSuperMarketShareArr[$.index - 1]}`)
    if (jdSuperMarketShareArr[$.index - 1]) {
      newShareCodes = jdSuperMarketShareArr[$.index - 1].split('@');
    } else {
      console.log(`由于您未提供与京京东账号相对应的shareCode,下面助力将采纳本脚本自带的助力码\n`)
      const tempIndex = $.index > shareCodes.length ? (shareCodes.length - 1) : ($.index - 1);
      newShareCodes = shareCodes[tempIndex].split('@');
    }
    console.log(`格式化后第${$.index}个京东账号的助力码${JSON.stringify(newShareCodes)}`)
    resolve();
  })
}
function requireConfig() {
  return new Promise(resolve => {
    // console.log('\n开始获取东东超市配置文件\n')
    notify = $.isNode() ? require('./sendNotify') : '';
    //Node.js用户请在jdCookie.js处填写京东ck;
    const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
    //IOS等用户直接用NobyDa的jd cookie
    if ($.isNode()) {
      Object.keys(jdCookieNode).forEach((item) => {
        if (jdCookieNode[item]) {
          cookiesArr.push(jdCookieNode[item])
        }
      })
      if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
    } else {
      cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
    }
    console.log(`共${cookiesArr.length}个京东账号\n`);
    // console.log(`东东超市已改版,目前暂不用助力, 故无助力码`)
    // console.log(`\n东东超市商圈助力码::${JSON.stringify(jdSuperMarketShareArr)}`);
    // console.log(`您提供了${jdSuperMarketShareArr.length}个账号的助力码\n`);
    resolve()
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
function getTeam() {
  return new Promise(async resolve => {
    $.getTeams = [];
    $.get({url: `http://jd.turinglabs.net/api/v2/jd/supermarket/read/100000/`, timeout: 100000}, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} supermarket/read/ API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          $.getTeams = data && data['data'];
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
    await $.wait(10000);
    resolve()
  })
}

function taskUrl(function_id, body = {}) {
  return {
    url: `${JD_API_HOST}?appid=jdsupermarket&functionId=${function_id}&clientVersion=8.0.0&client=m&body=${encodeURIComponent(JSON.stringify(body))}&t=${Date.now()}`,
    headers: {
      "Host": "api.m.jd.com",
      "Accept": "application/json, text/plain, */*",
      "Origin": "https://jdsupermarket.jd.com",
      "Accept-Encoding": "gzip, deflate, br",
      "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      "Accept-Language": "zh-CN,zh-Hans;q=0.9",
      "Referer": "https://jdsupermarket.jd.com/",
      "Cookie": cookie
    }
  }
}
/**
 * 生成随机数字
 * @param {number} min 最小值（包含）
 * @param {number} max 最大值（不包含）
 */
function randomNumber(min = 0, max = 100) {
  return Math.min(Math.floor(min + Math.random() * (max - min)), max);
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
//==========================以下是给作者助力 免费拿,省钱大赢家等活动======================
async function helpAuthor() {
  await barGain();//免费拿
  await bigWinner();//省钱大赢家
}
async function barGain() {
  let res = await getAuthorShareCode2('https://raw.githubusercontent.com/Aaron-lv/updateTeam/master/shareCodes/jd_barGain.json')
  if (!res) {
    $.http.get({url: 'https://purge.jsdelivr.net/gh/Aaron-lv/updateTeam@master/shareCodes/jd_barGain.json'}).then((resp) => {}).catch((e) => $.log('刷新CDN异常', e));
    await $.wait(1000)
    res = await getAuthorShareCode2('https://cdn.jsdelivr.net/gh/Aaron-lv/updateTeam@master/shareCodes/jd_barGain.json')
  }
  $.inBargaining = [...(res && res['inBargaining'] || [])]
  $.inBargaining = getRandomArrayElements($.inBargaining, $.inBargaining.length > 3 ? 6 : $.inBargaining.length);
  for (let item of $.inBargaining) {
    if (!item['activityId']) continue;
    const options = {
      url: `https://api.m.jd.com/client.action`,
      headers: {
        'Host': 'api.m.jd.com',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://h5.m.jd.com',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cookie': cookie,
        'Connection': 'keep-alive',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'jdapp;iPhone;9.4.0;14.3;;network/wifi;ADID/;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone10,3;addressid/;supportBestPay/0;appBuild/167541;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
        'Referer': `https://h5.m.jd.com/babelDiy/Zeus/4ZK4ZpvoSreRB92RRo8bpJAQNoTq/index.html`,
        'Accept-Language': 'zh-cn',
      },
      body: `functionId=cutPriceByUser&body={"activityId": ${item['activityId']},"userName":"","followShop":1,"shopId": ${item['shopId']},"userPic":""}&client=wh5&clientVersion=1.0.0`
    };
    await $.post(options, (err, ersp, data) => {})
  }
}

async function bigWinner() {
  let res = await getAuthorShareCode2('https://raw.githubusercontent.com/Aaron-lv/updateTeam/master/shareCodes/bigWinner.json')
  if (!res) {
    $.http.get({url: 'https://purge.jsdelivr.net/gh/Aaron-lv/updateTeam@master/shareCodes/bigWinner.json'}).then((resp) => {}).catch((e) => $.log('刷新CDN异常', e));
    await $.wait(1000)
    res = await getAuthorShareCode2('https://cdn.jsdelivr.net/gh/Aaron-lv/updateTeam@master/shareCodes/bigWinner.json')
  }
  $.codeList = getRandomArrayElements([...(res || [])], [...(res || [])].length);
  for (let vo of $.codeList) {
    if (!vo['inviter']) continue
    await _618(vo['redEnvelopeId'], vo['inviter'], '1');
    await _618(vo['redEnvelopeId'],vo['inviter'], '2')
  }
}

function _618(redEnvelopeId, inviter, helpType = '1', linkId = 'PFbUR7wtwUcQ860Sn8WRfw') {
  return new Promise(resolve => {
    $.get({
      url: `https://api.m.jd.com/?functionId=openRedEnvelopeInteract&body={%22linkId%22:%22${linkId}%22,%22redEnvelopeId%22:%22${redEnvelopeId}%22,%22inviter%22:%22${inviter}%22,%22helpType%22:%22${helpType}%22}&t=${+new Date()}&appid=activities_platform&clientVersion=3.5.0`,
      headers: {
        'Host': 'api.m.jd.com',
        'accept': 'application/json, text/plain, */*',
        'origin': 'https://618redpacket.jd.com',
        'user-agent': 'jdltapp;iPhone;3.5.0;14.2;network/wifi;hasUPPay/0;pushNoticeIsOpen/0;lang/zh_CN;model/iPhone10,2;hasOCPay/0;appBuild/1066;supportBestPay/0;pv/7.0;apprpd/;Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
        'accept-language': 'zh-cn',
        'referer': `https://618redpacket.jd.com/?activityId=${linkId}&redEnvelopeId=${redEnvelopeId}&inviterId=${inviter}&helpType=1&lng=&lat=&sid=`,
        'Cookie': cookie
      }
    }, (err, resp, data) => {
      resolve()
    })
  })
}
function getAuthorShareCode2(url) {
  return new Promise(async resolve => {
    const options = {
      url: `${url}?${new Date()}`, "timeout": 10000, headers: {
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
    await $.wait(10000)
    resolve();
  })
}
function getRandomArrayElements(arr, count) {
  let shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(min);
}
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}