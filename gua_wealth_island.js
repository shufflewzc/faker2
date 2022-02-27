/*
  https://st.jingxi.com/fortune_island/index2.html

  18 0-23/2 * * * https://raw.githubusercontent.com/smiek2121/scripts/master/gua_wealth_island.js 财富大陆

*/

const $ = new Env('财富大陆');
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
// const notify = $.isNode() ? require('./sendNotify') : '';
CryptoScripts()
$.CryptoJS = $.isNode() ? require('crypto-js') : CryptoJS;
let UA = `jdpingou;iPhone;5.2.2;14.3;${randomString(40)};network/wifi;model/iPhone12,1;appBuild/100630;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
function randomString(e) {
  e = e || 32;
  let t = "abcdef0123456789", a = t.length, n = "";
  for (i = 0; i < e; i++)
    n += t.charAt(Math.floor(Math.random() * a));
  return n
}
$.InviteList = []
$.innerInviteList = [];
const HelpAuthorFlag = true;//是否助力作者SH  true 助力，false 不助力

// 热气球接客 每次运行接客次数
let serviceNum = 10;// 每次运行接客次数
if ($.isNode() && process.env.gua_wealth_island_serviceNum) {
  serviceNum = Number(process.env.gua_wealth_island_serviceNum);
}

let cookiesArr = [], cookie = '';
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

$.appId = 10032;

!(async () => {
  if (!cookiesArr[0]) {
    $.msg('【京东账号一】宠汪汪积分兑换奖品失败', '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
    return
  }
  console.log(`\n
想要我的财富吗
我把它放在一个神奇的岛屿
去找吧
`)
  await requestAlgo();
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      $.cookie = cookiesArr[i] + '';
      $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.isLogin = true;
      console.log(`\n*****开始【京东账号${$.index}】${$.UserName}****\n`);
      UA = `jdpingou;iPhone;5.2.2;14.3;${randomString(40)};network/wifi;model/iPhone12,1;appBuild/100630;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/1;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
      await run();
    }
  }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  }).finally(() => {
    $.done();
  })
async function run() {
  try{
    $.HomeInfo = ''
    $.LeadInfo = ''
    $.buildList = ''
    $.Fund = ''
    $.task = []
    $.Biztask = []
    $.Aggrtask = []
    $.Employtask = []
    
    await GetHomePageInfo()

    if($.HomeInfo){
      $.InviteList.push($.HomeInfo.strMyShareId)
      console.log(`等级:${$.HomeInfo.dwLandLvl} 当前金币:${$.HomeInfo.ddwCoinBalance} 当前财富:${$.HomeInfo.ddwRichBalance} 助力码:${$.HomeInfo.strMyShareId}`)
    }
    if($.LeadInfo && $.LeadInfo.dwLeadType == 2){
      await $.wait(2000)
      console.log(`\n新手引导`)
      await noviceTask()
      await GetHomePageInfo()
      await $.wait(1000)
    }
    // 寻宝
    await XBDetail()
    // 加速卡
    await GetProp()
    // 故事会
    await StoryInfo()
    // 建筑升级
    await buildList()
    // 签到 邀请奖励
    await sign()
    // 签到-小程序
    await signs()
    // 捡垃圾
    await pickshell(1)
    // 热气球接客
    // await service(serviceNum)
    // 倒垃圾
    await RubbishOper()
    // 导游
    await Guide()
    // 撸珍珠
    await Pearl()
    // 牛牛任务
    await ActTask()
    // 日常任务、成就任务
    await UserTask()

  }
  catch (e) {
    console.log(e);
  }
}
async function GetHomePageInfo() {
  let e = getJxAppToken()
  let additional= `&strPgtimestamp=${e.strPgtimestamp}&strPhoneID=${e.strPhoneID}&strPgUUNum=${e.strPgUUNum}&ddwTaskId=&strShareId=&strMarkList=guider_step%2Ccollect_coin_auth%2Cguider_medal%2Cguider_over_flag%2Cbuild_food_full%2Cbuild_sea_full%2Cbuild_shop_full%2Cbuild_fun_full%2Cmedal_guider_show%2Cguide_guider_show%2Cguide_receive_vistor%2Cdaily_task%2Cguider_daily_task%2Ccfd_has_show_selef_point`
  let stk= `_cfd_t,bizCode,ddwTaskId,dwEnv,ptag,source,strMarkList,strPgUUNum,strPgtimestamp,strPhoneID,strShareId,strVersion,strZone`
  $.HomeInfo = await taskGet(`user/QueryUserInfo`, stk, additional)
  if($.HomeInfo){
    $.Fund = $.HomeInfo.Fund || ''
    $.LeadInfo = $.HomeInfo.LeadInfo || ''
    $.buildInfo = $.HomeInfo.buildInfo || ''
    $.XbStatus = $.HomeInfo.XbStatus || []
    if($.buildInfo.buildList){
      $.buildList = $.buildInfo.buildList || ''
    }
  }
}
// 寻宝
async function XBDetail(){
  try{
    let XBDetail = $.XbStatus.XBDetail.filter((x) => x.dwRemainCnt !== 0 && x.ddwColdEndTm <= parseInt(Date.now()/1000,10))
    if(XBDetail.length > 0){
      console.log(`\n开始寻宝`)
      for(let k of XBDetail || []){
        if(k.ddwColdEndTm <= parseInt(Date.now()/1000,10)){
          await $.wait(2000)
          let res = await taskGet(`user/TreasureHunt`, '_cfd_t,bizCode,dwEnv,ptag,source,strIndex,strZone', `&strIndex=${k.strIndex}`)
          if(res && res.iRet == 0){
            if (res.AwardInfo.dwAwardType === 0) {
              console.log(`${res.strAwardDesc}，获得 ${res.AwardInfo.ddwValue} 金币`)
            } else if (res.AwardInfo.dwAwardType === 1) {
              console.log(`${res.strAwardDesc}，获得 ${res.AwardInfo.ddwValue} 财富`)
            } else {
              console.log("寻宝失败\n"+$.toObj(res,res))
            }
          }else if(res && res.sErrMsg){
            console.log(`寻宝失败 ${res.sErrMsg}`)
          }else{
            console.log("寻宝失败\n"+$.toObj(res,res))
          }
        }
      }
    }else{
      console.log('\n暂无宝物')
    }
  }catch (e) {
    $.logErr(e);
  }
}
// 加速卡任务
async function GetProp(){
  try{
    console.log('\n加速卡任务')
    await $.wait(2000)
    $.propTask = await taskGet(`story/GetPropTask`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone', '&ptag=')
    if($.propTask && $.propTask.Data && $.propTask.Data.TaskList){
      for(let t of $.propTask.Data.TaskList || []){
        let res = ''
        if(t.dwCompleteNum < t.dwTargetNum){
          if([9,11].includes(t.dwPointType)) continue
          res = await taskGet('DoTask2', '_cfd_t,bizCode,configExtra,dwEnv,ptag,source,strZone,taskId', `&ptag=&taskId=${t.ddwTaskId}&configExtra=`)
          if (res.ret === 0) {
            console.log(`[${t.strTaskName}]加速卡任务完成`)
          } else {
            console.log(`[${t.strTaskName}]加速卡任务失败`, $.toStr(res,res))
            await $.wait(2000)
            continue
          }
          await $.wait(2000)
        }
        if(t.dwAwardStatus == 2){
          res = await taskGet('Award2', '_cfd_t,bizCode,dwEnv,ptag,source,strZone,taskId', `&ptag=&taskId=${t.ddwTaskId}`)
          if (res.ret === 0) {
            console.log(`[${t.strTaskName}]加速卡领取成功`)
            if(res.data.prizeInfo){
              let task = $.toObj(res.data.prizeInfo,res.data.prizeInfo)
              let msg = []
              for(let card of task.CardInfo.CardList || []){
                msg.push(card.strCardName)
              }
              console.log(`获得[${msg.join(',')}]加速卡`)
            }
          } else {
            console.log(`[${t.strTaskName}]加速卡领取失败`, $.toStr(res,res))
            await $.wait(2000)
            continue
          }
          await $.wait(2000)
        }
      }
    }
    await $.wait(2000)
    $.propInfo = await taskGet(`user/GetPropCardCenterInfo`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone', '&ptag=')
    console.log('\n加速卡使用')
    if($.propInfo && $.propInfo.cardInfo){
      let flag = $.propInfo.cardInfo.dwWorkingType || 0
      let res = ''
      for (let card of $.propInfo.cardInfo.coincard || []) {
        if(card.ddwCardTargetTm > 0 ) console.log(`[金币卡]结束时间:${$.time('yyyy-MM-dd HH:mm:ss',card.ddwCardTargetTm*1000)}`)
        // if(flag == 1 || flag == 3) break
        if (card.dwCardNums !== 0 && (flag == 0 || flag == 2)) {
          res = await taskGet('user/UsePropCard', '_cfd_t,bizCode,dwCardType,dwEnv,ptag,source,strCardTypeIndex,strZone', `&ptag=&dwCardType=1&strCardTypeIndex=${encodeURIComponent(card.strCardTypeIndex)}`)
          if (res.iRet === 0) {
            console.log(`[${card.strCardName}]金币卡使用成功`)
            if(res.ddwCardTargetTm > 0 ) console.log(`[金币卡]结束时间:${$.time('yyyy-MM-dd HH:mm:ss',res.ddwCardTargetTm*1000)}`)
            flag += 1
          } else {
            console.log(`[${card.strCardName}]金币卡使用失败`, $.toStr(res,res))
          }
          await $.wait(2000)
        }
      }
      for (let card of $.propInfo.cardInfo.richcard || []) {
        if(card.ddwCardTargetTm > 0 ) console.log(`[财富卡]结束时间:${$.time('yyyy-MM-dd HH:mm:ss',card.ddwCardTargetTm*1000)}`)
        // if(flag == 2 || flag == 3) break
        if (card.dwCardNums !== 0 && (flag == 0 || flag == 1)) {
          res = await taskGet('user/UsePropCard', '_cfd_t,bizCode,dwCardType,dwEnv,ptag,source,strCardTypeIndex,strZone', `&ptag=&dwCardType=2&strCardTypeIndex=${encodeURIComponent(card.strCardTypeIndex)}`)
          if (res.iRet === 0) {
            console.log(`[${card.strCardName}]财富卡使用成功`)
            if(res.ddwCardTargetTm > 0 ) console.log(`[财富卡]结束时间:${$.time('yyyy-MM-dd HH:mm:ss',res.ddwCardTargetTm*1000)}`)
            flag += 2
          } else {
            console.log(`[${card.strCardName}]财富卡使用失败`, $.toStr(res,res))
          }
          await $.wait(2000)
        }
      }

    }
  }catch (e) {
    console.log(e);
  }
}
// 故事会
async function StoryInfo(){
  try{
    if($.HomeInfo.StoryInfo && $.HomeInfo.StoryInfo.StoryList){
      let additional = ``
      let stk = ``
      let type = ``
      let res = ``
      await $.wait(1000)
      // 点击故事
      if($.HomeInfo.StoryInfo.StoryList[0].dwStatus == 1){
        if($.HomeInfo.StoryInfo.StoryList[0].dwType == 4){
          console.log(`\n贩卖`)
          additional = `&ptag=&strStoryId=${$.HomeInfo.StoryInfo.StoryList[0].strStoryId}&dwType=2&ddwTriggerDay=${$.HomeInfo.StoryInfo.StoryList[0].ddwTriggerDay}`
          stk = `_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone`
          type = `CollectorOper`
          res = await taskGet(`story/${type}`, stk, additional)
          // console.log(JSON.stringify(res))
        }else if($.HomeInfo.StoryInfo.StoryList[0].dwType == 1){
          console.log(`\n故事会[${$.HomeInfo.StoryInfo.StoryList[0].Special.strName}]`)
          additional = `&ptag=&strStoryId=${$.HomeInfo.StoryInfo.StoryList[0].strStoryId}&dwType=2&triggerType=${$.HomeInfo.StoryInfo.StoryList[0].Special.dwTriggerType}&ddwTriggerDay=${$.HomeInfo.StoryInfo.StoryList[0].ddwTriggerDay}`
          stk = `_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone,triggerType`
          type = `SpecialUserOper`
          res = await taskGet(`story/${type}`, stk, additional)
          // console.log(JSON.stringify(res))
        }else if($.HomeInfo.StoryInfo.StoryList[0].dwType == 2){
          console.log(`\n美人鱼`)
          additional = `&ptag=&strStoryId=${$.HomeInfo.StoryInfo.StoryList[0].strStoryId}&dwType=1&ddwTriggerDay=${$.HomeInfo.StoryInfo.StoryList[0].ddwTriggerDay}`
          stk = `_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone`
          type = `MermaidOper`
          res = await taskGet(`story/${type}`, stk, additional)
          console.log(JSON.stringify(res))
        }
      }
      if($.HomeInfo.StoryInfo.StoryList[0].dwType == 4 && ( (res && res.iRet == 0) || res == '')){
        await pickshell(4)
        await $.wait(1000)
        console.log(`查询背包`)
        additional = `&ptag=`
        stk = `_cfd_t,bizCode,dwEnv,ptag,source,strZone`
        res = await taskGet(`story/querystorageroom`, stk, additional)
        let TypeCnt = []
        if(res.Data && res.Data.Office){
          for(let i of res.Data.Office){
            TypeCnt.push(`${i.dwType}:${i.dwCount}`)
          }
        }
        TypeCnt = TypeCnt.join(`|`)
        if(TypeCnt){
          console.log(`出售`)
          await $.wait(1000)
          additional = `&ptag=&strTypeCnt=${TypeCnt}&dwSceneId=2`
          stk = `_cfd_t,bizCode,dwEnv,dwSceneId,ptag,source,strTypeCnt,strZone`
          res = await taskGet(`story/sellgoods`, stk, additional)
          await printRes(res, '贩卖')
          additional = `&ptag=&strStoryId=${$.HomeInfo.StoryInfo.StoryList[0].strStoryId}&dwType=4&ddwTriggerDay=${$.HomeInfo.StoryInfo.StoryList[0].ddwTriggerDay}`
          stk = `_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone`
          type = `CollectorOper`
          res = await taskGet(`story/${type}`, stk, additional)
          // console.log(JSON.stringify(res))
        }
      }else if($.HomeInfo.StoryInfo.StoryList[0].dwType == 1 && ( (res && res.iRet == 0) || res == '')){
        if(res && res.iRet == 0 && res.Data && res.Data.Serve && res.Data.Serve.dwWaitTime){
          console.log(`等待 ${res.Data.Serve.dwWaitTime}秒`)
          await $.wait(res.Data.Serve.dwWaitTime * 1000)
          await $.wait(1000)
        }
        additional = `&ptag=&strStoryId=${$.HomeInfo.StoryInfo.StoryList[0].strStoryId}&dwType=3&triggerType=${$.HomeInfo.StoryInfo.StoryList[0].Special.dwTriggerType}&ddwTriggerDay=${$.HomeInfo.StoryInfo.StoryList[0].ddwTriggerDay}`
        stk = `_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone,triggerType`
        type = `SpecialUserOper`
        res = await taskGet(`story/${type}`, stk, additional)
        await printRes(res, `故事会[${$.HomeInfo.StoryInfo.StoryList[0].Special.strName}]`)
        // console.log(JSON.stringify(res))

      }else if($.HomeInfo.StoryInfo.StoryList[0].dwType == 2 && ( (res && res.iRet == 0) || res == '')){
        if($.HomeInfo.StoryInfo.StoryList[0].dwStatus == 4){
          additional = `&ptag=&strStoryId=${$.HomeInfo.StoryInfo.StoryList[0].strStoryId}&dwType=4&ddwTriggerDay=${$.HomeInfo.StoryInfo.StoryList[0].ddwTriggerDay}`
        }else{
          additional = `&ptag=&strStoryId=${$.HomeInfo.StoryInfo.StoryList[0].strStoryId}&dwType=2&ddwTriggerDay=${$.HomeInfo.StoryInfo.StoryList[0].ddwTriggerDay}`
        }
        await $.wait(5000)
        stk = `_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone`
        type = `MermaidOper`
        res = await taskGet(`story/${type}`, stk, additional)
        await printRes(res,'美人鱼')
        // console.log(JSON.stringify(res))
      }
    }
  }catch (e) {
    $.logErr(e);
  }
}
// 建筑升级
async function buildList(){
  try{
    await $.wait(2000)
    console.log(`\n升级房屋、收集金币`)
    if($.buildList){
      for(let i in $.buildList){
        let item = $.buildList[i]
        let title = '未识别'
        if(item.strBuildIndex == 'food'){
          title = '美食城'
        }else if(item.strBuildIndex == 'sea'){
          title = '旅馆'
        }else if(item.strBuildIndex == 'shop'){
          title = '商店'
        }else if(item.strBuildIndex == 'fun'){
          title = '游乐场'
        }
        let additional = `&strBuildIndex=${item.strBuildIndex}`
        let stk= `_cfd_t,bizCode,dwEnv,ptag,source,strBuildIndex,strZone`
        let GetBuildInfo = await taskGet(`user/GetBuildInfo`, stk, additional)
        let msg = `\n[${title}] 当前等级:${item.dwLvl} 接待收入:${item.ddwOneceVistorAddCoin}/人 座位人数:${item.dwContain}`
        if(GetBuildInfo) msg += `\n升级->需要金币:${GetBuildInfo.ddwNextLvlCostCoin} 获得财富:${GetBuildInfo.ddwLvlRich}`
        console.log(msg)
        await $.wait(1000)
        if(GetBuildInfo.dwCanLvlUp > 0){
          console.log(`${item.dwLvl == 0 && '开启' || '升级'}${title}`)
          if(item.dwLvl == 0){
            await taskGet(`user/createbuilding`, stk, additional)
          }else{
            if(GetBuildInfo){
              additional = `&strBuildIndex=${GetBuildInfo.strBuildIndex}&ddwCostCoin=${GetBuildInfo.ddwNextLvlCostCoin}`
              stk = `_cfd_t,bizCode,ddwCostCoin,dwEnv,ptag,source,strBuildIndex,strZone`
              let update = await taskGet(`user/BuildLvlUp`, stk, additional)
              if(update && update.story && update.story.strToken){
                await $.wait(Number(update.story.dwWaitTriTime) * 1000)
                await $.wait(1000)
                additional= `&strToken=${update.story.strToken}&ddwTriTime=${update.story.ddwTriTime}`
                stk = `_cfd_t,bizCode,dwEnv,ptag,source,strBuildIndex,strZone`
                // await taskGet(`story/QueryUserStory`, stk, additional)
              }
            }
          }
          await $.wait(2000)
        }
        additional = `&strBuildIndex=${GetBuildInfo.strBuildIndex}&dwType=1`
        stk = `_cfd_t,bizCode,dwEnv,dwType,ptag,source,strBuildIndex,strZone`
        let CollectCoin = await taskGet(`user/CollectCoin`, stk, additional)
        if(CollectCoin && CollectCoin.ddwCoinBalance){
          console.log(`收集金币:${CollectCoin.ddwCoin} 当前剩余:${CollectCoin.ddwCoinBalance}`)
          await $.wait(Number(CollectCoin.story.dwWaitTriTime) * 1000)
          additional= `&strToken=${CollectCoin.story.strToken}&ddwTriTime=${CollectCoin.story.ddwTriTime}`
          stk = `_cfd_t,bizCode,dwEnv,ptag,source,strBuildIndex,strZone`
          // await taskGet(`story/QueryUserStory`, stk, additional)
        }
        await $.wait(1000)
      }
      await GetHomePageInfo()
      await $.wait(1000)
    }
    if($.Fund && $.Fund.dwIsGetGift < $.Fund.dwIsShowFund){
      console.log(`\n领取开拓基金${Number($.Fund.strGiftName)}元`)
      let additional= ``
      let stk= `_cfd_t,bizCode,dwEnv,ptag,source,strZone`
      let drawpackprize = await taskGet(`user/drawpackprize`, stk, additional)
    }

  }catch (e) {
    $.logErr(e);
  }
}
// 签到 邀请奖励
async function sign(){
  try{
    // 签到
    await $.wait(2000)
    $.Aggrtask = await taskGet(`story/GetTakeAggrPage`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone', '&ptag=')
    if($.Aggrtask && $.Aggrtask.Data && $.Aggrtask.Data.Sign){
      if($.Aggrtask.Data.Sign.dwTodayStatus == 0) {
        console.log('\n签到')
        let flag = false
        let ddwCoin = 0
        let ddwMoney = 0
        let dwPrizeType = 0
        let strPrizePool = 0
        let dwPrizeLv = 0
        for(i of $.Aggrtask.Data.Sign.SignList){
          if(i.dwStatus == 0){
            flag = true
            ddwCoin = i.ddwCoin || 0
            ddwMoney = i.ddwMoney || 0
            dwPrizeType = i.dwPrizeType || 0
            strPrizePool = i.strPrizePool || 0
            dwPrizeLv = i.dwBingoLevel || 0
            break;
          }
        }
        if(flag){
          let e = getJxAppToken()
          let additional = `&ptag=&ddwCoin=${ddwCoin}&ddwMoney=${ddwMoney}&dwPrizeType=${dwPrizeType}&strPrizePool${strPrizePool && '='+strPrizePool ||''}&dwPrizeLv=${dwPrizeLv}&strPgtimestamp=${e.strPgtimestamp}&strPhoneID=${e.strPhoneID}&strPgUUNum=${e.strPgUUNum}`
          let stk= `_cfd_t,bizCode,ddwCoin,ddwMoney,dwEnv,dwPrizeLv,dwPrizeType,ptag,source,strPrizePool,strPgUUNum,strPgtimestamp,strPhoneID,strZone`
          let res = await taskGet(`story/RewardSign`, stk, additional)
          await printRes(res, '签到')
        }
      }
    }
    
    if($.Aggrtask && $.Aggrtask.Data && $.Aggrtask.Data.Employee && $.Aggrtask.Data.Employee.EmployeeList){
        if($.Aggrtask.Data && $.Aggrtask.Data.Employee && $.Aggrtask.Data.Employee.EmployeeList){
        console.log(`\n领取邀请奖励(${$.Aggrtask.Data.Employee.EmployeeList.length || 0}/${$.Aggrtask.Data.Employee.dwNeedTotalPeople || 0})`)
        for(let i of $.Aggrtask.Data.Employee.EmployeeList){
          if(i.dwStatus == 0){
            let res = await taskGet(`story/helpdraw`, '_cfd_t,bizCode,dwEnv,dwUserId,ptag,source,strZone', `&ptag=&dwUserId=${i.dwId}`)
            await printRes(res, '邀请奖励')
          }
        }
      }
    }
  }catch (e) {
    $.logErr(e);
  }
}
// 签到-小程序
async function signs(){
  try{
    // 签到-小程序
    await $.wait(2000)
    $.Aggrtask = await taskGet(`story/GetTakeAggrPages`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone', '&ptag=')
    if($.Aggrtask && $.Aggrtask.Data && $.Aggrtask.Data.Sign){
      if($.Aggrtask.Data.Sign.dwTodayStatus == 0) {
        console.log('\n签到-小程序')
        let flag = false
        let ddwCoin = 0
        let ddwMoney = 0
        let dwPrizeType = 0
        let strPrizePool = 0
        let dwPrizeLv = 0
        for(i of $.Aggrtask.Data.Sign.SignList){
          if(i.dwStatus == 0){
            flag = true
            ddwCoin = i.ddwCoin || 0
            ddwMoney = i.ddwMoney || 0
            dwPrizeType = i.dwPrizeType || 0
            strPrizePool = i.strPrizePool || 0
            dwPrizeLv = i.dwBingoLevel || 0
            break;
          }
        }
        if(flag){
          let e = getJxAppToken()
          let additional = `&ptag=&ddwCoin=${ddwCoin}&ddwMoney=${ddwMoney}&dwPrizeType=${dwPrizeType}&strPrizePool${strPrizePool && '='+strPrizePool ||''}&dwPrizeLv=${dwPrizeLv}&strPgtimestamp=${e.strPgtimestamp}&strPhoneID=${e.strPhoneID}&strPgUUNum=${e.strPgUUNum}`
          let stk= `_cfd_t,bizCode,ddwCoin,ddwMoney,dwEnv,dwPrizeLv,dwPrizeType,ptag,source,strPrizePool,strPgUUNum,strPgtimestamp,strPhoneID,strZone`
          let res = await taskGet(`story/RewardSigns`, stk, additional)
          await printRes(res, '签到-小程序')
        }
      }
    }
  }catch (e) {
    $.logErr(e);
  }
}
// 捡垃圾
async function pickshell(num = 1){
  return new Promise(async (resolve) => {
    try{
      console.log(`\n捡垃圾`)
      // pickshell dwType 1珍珠 2海螺 3大海螺  4海星 5小贝壳 6扇贝
      for(i=1;num--;i++){
        await $.wait(2000)
        $.queryshell = await taskGet(`story/queryshell`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone', `&ptag=`)
        let c = 6
        for(i=1;c--;i++){
          let o = 1
          let name = '珍珠'
          if(i == 2) name = '海螺'
          if(i == 3) name = '大海螺'
          if(i == 4) name = '海星'
          if(i == 5) name = '小贝壳'
          if(i == 6) name = '扇贝'
          do{
            console.log(`去捡${name}第${o}次`)
            o++;
            let res = await taskGet(`story/pickshell`, '_cfd_t,bizCode,dwEnv,dwType,ptag,source,strZone', `&ptag=&dwType=${i}`)
            await $.wait(200)
            if(!res || res.iRet != 0){
              break
            }
          }while (o < 20)
        }
      }
    }catch (e) {
      $.logErr(e);
    }
    finally {
      resolve();
    }
  })
}
// 热气球接客
async function service(num = 1){
  return new Promise(async (resolve) => {
    try{
      console.log(`\n热气球接客`)
      let arr = ['food','sea','shop','fun']
      for(i=1;num--;i++){
        let strBuildIndex = arr[Math.floor((Math.random()*arr.length))]
        console.log(`第${i}/${num+i}次:${strBuildIndex}`)
        let res = await taskGet(`user/SpeedUp`, '_cfd_t,bizCode,dwEnv,ptag,source,strBuildIndex,strZone', `&ptag=&strBuildIndex=${strBuildIndex}`)
        if(res && res.iRet == 0){
          console.log(`当前气球次数:${res.dwTodaySpeedPeople} 金币速度:${res.ddwSpeedCoin}`)
          // additional= `&strToken=${res.story.strToken}&ddwTriTime=${res.story.ddwTriTime}`
          // stk = `_cfd_t,bizCode,dwEnv,ptag,source,strBuildIndex,strZone`
          // await taskGet(`story/QueryUserStory`, stk, additional)
          await $.wait(1000)
        }
      }
    }catch (e) {
      $.logErr(e);
    }
    finally {
      resolve();
    }
  })
}
// 倒垃圾
async function RubbishOper(){
  try{
    // 倒垃圾
    await $.wait(2000)
    $.QueryRubbishInfo = await taskGet(`story/QueryRubbishInfo`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone', '&ptag=')
    if($.QueryRubbishInfo && $.QueryRubbishInfo.Data && $.QueryRubbishInfo.Data.StoryInfo.StoryList){
      for(let i of $.QueryRubbishInfo.Data.StoryInfo.StoryList){
        let res = ''
        if(i.strStoryId == 3){
          console.log(`\n倒垃圾`)
          $.RubbishOper = await taskGet(`story/RubbishOper`, '_cfd_t,bizCode,dwEnv,dwRewardType,dwType,ptag,source,strZone', '&ptag=&dwType=1&dwRewardType=0')
          if($.RubbishOper && $.RubbishOper.Data && $.RubbishOper.Data.ThrowRubbish && $.RubbishOper.Data.ThrowRubbish.Game && $.RubbishOper.Data.ThrowRubbish.Game.RubbishList){
            for(let j of $.RubbishOper.Data.ThrowRubbish.Game.RubbishList){
              console.log(`放置[${j.strName}]等待任务完成`)
              res = await taskGet(`story/RubbishOper`, '_cfd_t,bizCode,dwEnv,dwRewardType,dwRubbishId,dwType,ptag,source,strZone', `&ptag=&dwType=2&dwRewardType=0&dwRubbishId=${j.dwId}`)
              await $.wait(2000)
            }
            if(res && res.Data && res.Data.RubbishGame && res.Data.RubbishGame.AllRubbish && res.Data.RubbishGame.AllRubbish.dwIsGameOver && res.Data.RubbishGame.AllRubbish.dwIsGameOver == 1){
              console.log(`任务完成获得:${res.Data.RubbishGame.AllRubbish.ddwCoin && res.Data.RubbishGame.AllRubbish.ddwCoin+'金币' || ''}`)
            }else{
              console.log(JSON.stringify(res))
            }
          }
        }
      }
    }
  }catch (e) {
    $.logErr(e);
  }
}
// 雇佣导游
async function Guide(){
  try{
    await $.wait(2000)
    $.Employtask = await taskGet(`user/EmployTourGuideInfo`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone', '&ptag=')
    if($.Employtask && $.Employtask.TourGuideList){
      console.log(`\n雇佣导游`)
      let num = $.Employtask.dwRemainGuideCnt
      console.log(`当前可雇佣劳动人数:${num}`)
      let arr = [];
      for(let i in $.Employtask.TourGuideList){
      let item = $.Employtask.TourGuideList[i]
        let larr = [],res = true
        arr.forEach((x)=>{
          if(x.ddwProductCoin < item.ddwProductCoin && res == true){
            larr.push(item)
            res = false
          }
          larr.push(x)
        })
        if(res) larr.push(item)
        arr = larr
      }
      for(let i of arr){
        console.log(`${i.strGuideName} 收益:${i.ddwProductCoin} 支付成本:${i.ddwCostCoin} 剩余工作时长:${timeFn(Number(i.ddwRemainTm || 0) * 1000)}`)
        let dwIsFree = 0
        let ddwConsumeCoin = i.ddwCostCoin
        if(i.dwFreeMin != 0) dwIsFree = 1
        if(num > 0 && i.ddwRemainTm == 0){
          res = await taskGet(`user/EmployTourGuide`, '_cfd_t,bizCode,ddwConsumeCoin,dwEnv,dwIsFree,ptag,source,strBuildIndex,strZone', `&ptag=&strBuildIndex=${i.strBuildIndex}&dwIsFree=${dwIsFree}&ddwConsumeCoin=${ddwConsumeCoin}`)
          if(res.iRet == 0){
            console.log(`雇佣成功`)
            num--;
          }else{
            console.log(`雇佣失败:`, JSON.stringify(res))
          }
          await $.wait(3000)
        }
      }
    }
    
  }catch (e) {
    $.logErr(e);
  }
}
// 撸珍珠
async function Pearl(){
  try{
    await $.wait(2000)
    $.ComposeGameState = await taskGet(`user/ComposePearlState`, '', '&dwGetType=0')
    console.log(`\n当前有${$.ComposeGameState.dwCurProgress}个珍珠${$.ComposeGameState.ddwVirHb && ' '+$.ComposeGameState.ddwVirHb/100+"红包" || ''}`)
    if($.ComposeGameState.dayDrawInfo.dwIsDraw == 0){
      let res = ''
      res = await taskGet(`user/GetPearlDailyReward`, '__t,strZone', ``)
      if(res && res.iRet == 0 && res.strToken){
        res = await taskGet(`user/PearlDailyDraw`, '__t,ddwSeaonStart,strToken,strZone', `&ddwSeaonStart=${$.ComposeGameState.ddwSeasonStartTm}&strToken=${res.strToken}`)
        if(res && res.iRet == 0){
          if(res.strPrizeName){
            console.log(`抽奖获得:${res.strPrizeName || $.toObj(res,res)}`)
          }else{
            console.log(`抽奖获得:${$.toObj(res,res)}`)
          }
        }else{
          console.log("抽奖失败\n"+$.toObj(res,res))
        }
      }else{
        console.log($.toObj(res,res))
      }
    }
    if (($.ComposeGameState.dwCurProgress < 8 || true) && $.ComposeGameState.strDT) {
      let b = 1
      console.log(`合珍珠${b}次 `)
      // b = 8-$.ComposeGameState.dwCurProgress
      for(i=1;b--;i++){
        let n = Math.ceil(Math.random()*12+12)
        console.log(`上报次数${n}`)
        for(m=1;n--;m++){
          console.log(`上报第${m}次`)
          await $.wait(5000)
          await taskGet(`user/RealTmReport`, '', `&dwIdentityType=0&strBussKey=composegame&strMyShareId=${$.ComposeGameState.strMyShareId}&ddwCount=10`)
          let s = Math.floor((Math.random()*3))
          let n = 0
          if(s == 1) n = 1
          if(n === 1){
            let res = await taskGet(`user/ComposePearlAward`, '__t,size,strBT,strZone,type', `__t=${Date.now()}&type=4&size=1&strBT=${$.ComposeGameState.strDT}`)
            if(res && res.iRet == 0){
              console.log(`上报得红包:${res.ddwAwardHb && '获得'+res.ddwAwardHb/100+"红包" || ''}${res.ddwVirHb && ' 当前有'+res.ddwVirHb/100+"红包" || ''}`)
            }else{
              console.log($.toObj(res,res))
            }
          }
        }
        console.log("合成珍珠")
        let strLT = ($.ComposeGameState.oPT || [])[$.ComposeGameState.ddwCurTime % ($.ComposeGameState.oPT || []).length]
        let res = await taskGet(`user/ComposePearlAddProcess`, '__t,strBT,strLT,strZone', `&strBT=${$.ComposeGameState.strDT}&strLT=${strLT}`)
        if(res && res.iRet == 0){
          console.log(`合成成功:${res.ddwAwardHb && '获得'+res.ddwAwardHb/100+"红包 " || ''}当前有${res.dwCurProgress}个珍珠${res.ddwVirHb && ' '+res.ddwVirHb/100+"红包" || ''}`)
        }else{
          console.log(JSON.stringify(res))
        }
        $.ComposeGameState = await taskGet(`user/ComposePearlState`, '', '&dwGetType=0')
      }
    }
    for (let i of $.ComposeGameState.stagelist || []) {
      if (i.dwIsAward == 0 && $.ComposeGameState.dwCurProgress >= i.dwCurStageEndCnt) {
        await $.wait(2000)
        let res = await taskGet(`user/ComposeGameAward`, '__t,dwCurStageEndCnt,strZone', `&dwCurStageEndCnt=${i.dwCurStageEndCnt}`)
        await printRes(res,'珍珠领奖')
      }
    }
  }catch (e) {
    $.logErr(e);
  }
}
// 牛牛任务
async function ActTask(){
  try{
    let res = ''
    await $.wait(2000)
    $.Biztask = await taskGet(`story/GetActTask`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone', '&ptag=')
    if($.Biztask && $.Biztask.Data && $.Biztask.Data.dwStatus != 4){
      console.log(`\n牛牛任务`)
      if($.Biztask.Data.dwStatus == 3 && $.Biztask.Data.dwTotalTaskNum && $.Biztask.Data.dwCompleteTaskNum && $.Biztask.Data.dwTotalTaskNum == $.Biztask.Data.dwCompleteTaskNum){
        res = await taskGet(`story/ActTaskAward`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone', `&ptag=`)
        if(res.iRet == 0){
          console.log(`领取全部任务奖励:`, res.Data.ddwBigReward || '')
        }else{
          console.log(`领取全部任务奖励失败:`, JSON.stringify(res))
        }
      }
      for(let i in $.Biztask.Data.TaskList){
        let item = $.Biztask.Data.TaskList[i]
        if(item.dwAwardStatus != 2 && item.dwCompleteNum === item.dwTargetNum) continue
        console.log(`任务 ${item.strTaskName} ${item.dwCompleteNum}/${item.dwTargetNum}`)
        if (item.dwAwardStatus == 2 && item.dwCompleteNum === item.dwTargetNum) {
          res = await taskGet(`Award1`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone,taskId', `&ptag=&taskId=${item.ddwTaskId}`)
          if(res.ret == 0){
            if(res.data.prizeInfo){
              res.data.prizeInfo = $.toObj(res.data.prizeInfo)
            }
            if(res.data.prizeInfo.ddwCoin || res.data.prizeInfo.ddwMoney){
              console.log(`${item.strTaskName} 领取奖励:${res.data.prizeInfo.ddwCoin && res.data.prizeInfo.ddwCoin+'金币' || ''} ${res.data.prizeInfo.ddwMoney && res.data.prizeInfo.ddwMoney+'财富' || ''}`)
            }else{
              console.log(`${item.strTaskName} 领取奖励:`, JSON.stringify(res))
            }
          }else{
            console.log(`${item.strTaskName} 领取奖励失败:`, JSON.stringify(res))
          }
          await $.wait(1000)
        }
        if(item.dwAwardStatus == 2 && item.dwCompleteNum < item.dwTargetNum && [1,2].includes(item.dwOrderId)){
          await $.wait(1000)
          if(item.strTaskName.indexOf('热气球接待') > -1){
            let b = (item.dwTargetNum-item.dwCompleteNum)
            // 热气球接客
            await service(b)
            await $.wait((Number(item.dwLookTime) * 1000) || 1000)
          }else if(item.dwPointType == 301){
            await $.wait((Number(item.dwLookTime) * 1000) || 1000)
            res = await taskGet('DoTask1', '_cfd_t,bizCode,configExtra,dwEnv,ptag,source,strZone,taskId', `&ptag=&taskId=${item.ddwTaskId}&configExtra=`)
          }
          await $.wait(1000)
          res = await taskGet(`Award1`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone,taskId', `&ptag=&taskId=${item.ddwTaskId}`)
          if(res.ret == 0){
            if(res.data.prizeInfo){
              res.data.prizeInfo = $.toObj(res.data.prizeInfo)
            }
            if(res.data.prizeInfo.ddwCoin || res.data.prizeInfo.ddwMoney){
              console.log(`${item.strTaskName} 领取奖励:${res.data.prizeInfo.ddwCoin && res.data.prizeInfo.ddwCoin+'金币' || ''} ${res.data.prizeInfo.ddwMoney && res.data.prizeInfo.ddwMoney+'财富' || ''}`)
            }else{
              console.log(`${item.strTaskName} 领取奖励:`, JSON.stringify(res))
            }
          }else{
            console.log(`${item.strTaskName} 领取奖励失败:`, JSON.stringify(res))
          }
          await $.wait(1000)
        }
      }
    }

  }catch (e) {
    $.logErr(e);
  }
}
// 日常任务、成就任务
async function UserTask(){
  try{
    await $.wait(2000)
    let res = ''
    $.task = await taskGet(`GetUserTaskStatusList`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone,taskId', '&ptag=&taskId=0')
    if($.task && $.task.data && $.task.data.userTaskStatusList){
        console.log(`\n日常任务、成就任务`)
      for(let i in $.task.data.userTaskStatusList){
        let item = $.task.data.userTaskStatusList[i]
        if(item.awardStatus != 2 && item.completedTimes === item.targetTimes) continue
        console.log(`任务 ${item.taskName} (${item.completedTimes}/${item.targetTimes})`)
        if (item.awardStatus == 2 && item.completedTimes === item.targetTimes) {
          res = await taskGet(`Award`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone,taskId', `&ptag=&taskId=${item.taskId}`)
          if(res.ret == 0){
            if(res.data.prizeInfo){
              res.data.prizeInfo = $.toObj(res.data.prizeInfo)
            }
            if(res.data.prizeInfo.ddwCoin || res.data.prizeInfo.ddwMoney || res.data.prizeInfo.strPrizeName){
              console.log(`${item.taskName} 领取奖励:${res.data.prizeInfo.ddwCoin && ' '+res.data.prizeInfo.ddwCoin+'金币' || ''}${res.data.prizeInfo.ddwMoney && ' '+res.data.prizeInfo.ddwMoney+'财富' || ''}${res.data.prizeInfo.strPrizeName && ' '+res.data.prizeInfo.strPrizeName+'红包' || ''}`)
            }else{
              console.log(`${item.taskName} 领取奖励:`, JSON.stringify(res))
            }
          }else{
            console.log(`${item.taskName} 领取奖励失败:`, JSON.stringify(res))
          }
          await $.wait(1000)
        }
        if(item.dateType == 2){
          if(item.completedTimes < item.targetTimes && ![7,8,9,10].includes(item.orderId)){
            if(item.taskName.indexOf('捡贝壳') >-1 || item.taskName.indexOf('赚京币任务') >-1 || item.taskName.indexOf('升级') >-1) continue
            let b = (item.targetTimes-item.completedTimes)
            for(i=1;b--;i++){
              console.log(`第${i}次`)
              res = await taskGet('DoTask', '_cfd_t,bizCode,configExtra,dwEnv,ptag,source,strZone,taskId', `&ptag=&taskId=${item.taskId}&configExtra=`)
              await $.wait(5000)
            }
            res = await taskGet(`Award`, '_cfd_t,bizCode,dwEnv,ptag,source,strZone,taskId', `&ptag=&taskId=${item.taskId}`)
            if(res.ret == 0){
              if(res.data.prizeInfo){
                res.data.prizeInfo = $.toObj(res.data.prizeInfo)
              }
              if(res.data.prizeInfo.ddwCoin || res.data.prizeInfo.ddwMoney || res.data.prizeInfo.strPrizeName){
                console.log(`${item.taskName} 领取奖励:${res.data.prizeInfo.ddwCoin && ' '+res.data.prizeInfo.ddwCoin+'金币' || ''}${res.data.prizeInfo.ddwMoney && ' '+res.data.prizeInfo.ddwMoney+'财富' || ''}${res.data.prizeInfo.strPrizeName && ' '+res.data.prizeInfo.strPrizeName+'红包' || ''}`)
              }else{
                console.log(`${item.taskName} 领取奖励:`, JSON.stringify(res))
              }
            }else{
              console.log(`${item.taskName} 领取奖励失败:`, JSON.stringify(res))
            }
          }else if(item.awardStatus === 2 && [1].includes(item.orderId)){
          }
          await $.wait(1000)
        }else if(item.dateType == 1){
          // console.log('enensss')
        }
        // break
      }
    }

  }catch (e) {
    $.logErr(e);
  }
}

function printRes(res, msg=''){
  if(res.iRet == 0 && (res.Data || res.ddwCoin || res.ddwMoney || res.strPrizeName)){
    let result = res
    if(res.Data){
      result = res.Data
    }
    if(result.ddwCoin || result.ddwMoney || result.strPrizeName || result.StagePrizeInfo && result.StagePrizeInfo.strPrizeName){
      console.log(`${msg}获得:${result.ddwCoin && ' '+result.ddwCoin+'金币' || ''}${result.ddwMoney && ' '+result.ddwMoney+'财富' || ''}${result.strPrizeName && ' '+result.strPrizeName+'红包' || ''}${result.StagePrizeInfo && result.StagePrizeInfo.strPrizeName && ' '+result.StagePrizeInfo.strPrizeName || ''}`)
    }else if(result.Prize){
      console.log(`${msg}获得: ${result.Prize.strPrizeName && '优惠券 '+result.Prize.strPrizeName || ''}`)
    }else if(res && res.sErrMsg){
      console.log(res.sErrMsg)
    }else{
      console.log(`${msg}完成`, JSON.stringify(res))
      // console.log(`完成`)
    }
  }else if(res && res.sErrMsg){
    console.log(`${msg}失败:${res.sErrMsg}`)
  }else{
    console.log(`${msg}失败:${JSON.stringify(res)}`)
  }
}
function getJxAppToken(){
  function generateStr(e) {
    e = e || 32;
    let t = "abcdefghijklmnopqrstuvwxyz1234567890", a = t.length, n = "";
    for (i = 0; i < e; i++)
      n += t.charAt(Math.floor(Math.random() * a));
    return n
  }
  let phoneId = generateStr(40);
  let timestamp = Date.now().toString();
  let pgUUNum = $.CryptoJS.MD5('' + decodeURIComponent($.UserName || '') + timestamp + phoneId + 'tPOamqCuk9NLgVPAljUyIHcPRmKlVxDy').toString($.CryptoJS.enc.MD5);
  return {
    'strPgtimestamp': timestamp,
    'strPhoneID': phoneId,
    'strPgUUNum': pgUUNum
  }
}
async function noviceTask(){
  let additional= ``
  let stk= ``
  additional= ``
  stk= `_cfd_t,bizCode,dwEnv,ptag,source,strZone`
  await taskGet(`user/guideuser`, stk, additional)
  additional= `&strMark=guider_step&strValue=welcom&dwType=2`
  stk= `_cfd_t,bizCode,dwEnv,dwType,ptag,source,strMark,strValue,strZone`
  await taskGet(`user/SetMark`, stk, additional)
  additional= `&strMark=guider_over_flag&strValue=999&dwType=2`
  stk= `_cfd_t,bizCode,dwEnv,dwType,ptag,source,strMark,strValue,strZone`
  await taskGet(`user/SetMark`, stk, additional)
  additional= `&strMark=guider_step&strValue=999&dwType=2`
  stk= `_cfd_t,bizCode,dwEnv,dwType,ptag,source,strMark,strValue,strZone`
  await taskGet(`user/SetMark`, stk, additional)
  additional= `&strMark=guider_step&strValue=999&dwType=2`
  stk= `_cfd_t,bizCode,dwEnv,dwType,ptag,source,strMark,strValue,strZone`
  await taskGet(`user/SetMark`, stk, additional)
  additional= `&strMark=guider_over_flag&strValue=999&dwType=2`
  stk= `_cfd_t,bizCode,dwEnv,dwType,ptag,source,strMark,strValue,strZone`
  await taskGet(`user/SetMark`, stk, additional)
  additional= `&strMark=guider_step&strValue=gift_redpack&dwType=2`
  stk= `_cfd_t,bizCode,dwEnv,dwType,ptag,source,strMark,strValue,strZone`
  await taskGet(`user/SetMark`, stk, additional)
  additional= `&strMark=guider_step&strValue=none&dwType=2`
  stk= `_cfd_t,bizCode,dwEnv,dwType,ptag,source,strMark,strValue,strZone`
  await taskGet(`user/SetMark`, stk, additional)
}

function taskGet(type, stk, additional){
  return new Promise(async (resolve) => {
    let myRequest = getGetRequest(type, stk, additional)
    $.get(myRequest, async (err, resp, _data) => {
      let data = ''
      try {
        let contents = ''
        // console.log(_data)
        data = $.toObj(_data)
        if(data && data.iRet == 0){
          // console.log(_data)
        }else{
          // 1771|1771|5001|0|0,1771|75|1023|0|请刷新页面重试
          // console.log(_data)
        }
        contents = `1771|${opId(type)}|${data && data.iRet || 0}|0|${data && data.sErrMsg || 0}`
        await biz(contents)
      }
      catch (e) {
        $.logErr(e, resp);
      }
      finally {
        resolve(data);
      }
    });
  });
}
function getGetRequest(type, stk='', additional='') {
  let url = ``;
  let dwEnv = 7;
  let types = {
    'GetUserTaskStatusList':['GetUserTaskStatusList','jxbfd'],
    'Award':['Award','jxbfd'],
    'Award1':['Award','jxbfddch'],
    'Award2':['Award','jxbfdprop'],
    'DoTask':['DoTask','jxbfd'],
    'DoTask1':['DoTask','jxbfddch'],
    'DoTask2':['DoTask','jxbfdprop'],
  }
  if(type == 'user/ComposeGameState'){
    url = `https://m.jingxi.com/jxbfd/${type}?__t=${Date.now()}&strZone=jxbfd${additional}&_=${Date.now()}&sceneval=2`
  }else if(type == 'user/RealTmReport'){
    url = `https://m.jingxi.com/jxbfd/${type}?__t=${Date.now()}${additional}&_=${Date.now()}&sceneval=2`
  }else{
    let stks = ''
    if(stk) stks = `&_stk=${stk}`
    if(type == 'story/GetTakeAggrPages' || type == 'story/RewardSigns') dwEnv = 6
    if(type == 'story/GetTakeAggrPages') type = 'story/GetTakeAggrPage'
    if(type == 'story/RewardSigns') type = 'story/RewardSign'
    if(types[type]){
      url = `https://m.jingxi.com/newtasksys/newtasksys_front/${types[type][0]}?strZone=jxbfd&bizCode=${types[type][1]}&source=jxbfd&dwEnv=${dwEnv}&_cfd_t=${Date.now()}${additional}${stks}&_ste=1&_=${Date.now()}&sceneval=2&g_login_type=1`
    }else if(type == 'user/ComposeGameAddProcess' || type == 'user/ComposeGameAward'){
      url = `https://m.jingxi.com/jxbfd/${type}?strZone=jxbfd&__t=${Date.now()}${additional}${stks}&_=${Date.now()}&sceneval=2`;
    }else{
      url = `https://m.jingxi.com/jxbfd/${type}?strZone=jxbfd&bizCode=jxbfd&source=jxbfd&dwEnv=${dwEnv}&_cfd_t=${Date.now()}&ptag=${additional}${stks}&_=${Date.now()}&sceneval=2`;
    }
    url += `&h5st=${decrypt(Date.now(), stk, '', url)}`;
  }
  return {
    url,
    headers: {
      "Accept": "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      "Connection": "keep-alive",
      'Cookie': $.cookie,
      'Host': 'm.jingxi.com',
      "Referer": "https://st.jingxi.com/",
      "User-Agent": UA,

    }
  }
}

function biz(contents){
  return new Promise(async (resolve) => {
    let myRequest = {
      url:`https://m.jingxi.com/webmonitor/collect/biz.json?contents=${contents}&t=${Math.random()}&sceneval=2`,
      headers: {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Connection": "keep-alive",
        'Cookie': $.cookie,
        'Host': 'm.jingxi.com',
        "Referer": "https://st.jingxi.com/",
        "User-Agent": UA,
      }
    }
    $.get(myRequest, async (err, resp, _data) => {
      try {
        // console.log(_data)
      }
      catch (e) {
        $.logErr(e, resp);
      }
      finally {
        resolve();
      }
    });
  });
}

function opId(type){
  let jsonMap = {
    "user/QueryUserInfo": 1,
    "user/GetMgrAllConf": 3,
    "story/QueryUserStory": 5,
    "user/GetJdToken": 11,
    "story/CouponState": 13,
    "story/WelfareDraw": 15,
    "story/GetWelfarePage": 17,
    "story/SendWelfareMoney": 19,
    "user/SetMark": 23,
    "user/GetMark": 25,
    "user/guideuser": 27,
    "user/createbuilding": 29,
    "user/BuildLvlUp": 31,
    "user/CollectCoin": 33,
    "user/GetBuildInfo": 35,
    "user/SpeedUp": 37,
    "story/AddNoticeMsg": 39,
    "user/breakgoldenegg": 41,
    "user/closewindow": 43,
    "user/drawpackprize": 45,
    "user/GetMoneyDetail": 47,
    "user/EmployTourGuide": 49,
    "story/sellgoods": 51,
    "story/querystorageroom": 53,
    "user/queryuseraccount": 55,
    "user/EmployTourGuideInfo": 57,
    "consume/TreasureHunt": 59,
    "story/QueryAppSignList": 61,
    "story/AppRewardSign": 63,
    "story/queryshell": 65,
    "story/QueryRubbishInfo": 67,
    "story/pickshell": 69,
    "story/CollectorOper": 71,
    "story/MermaidOper": 73,
    "story/RubbishOper": 75,
    "story/SpecialUserOper": 77,
    "story/GetUserTaskStatusList": 79,
    "user/ExchangeState": 87,
    "user/ExchangePrize": 89,
    "user/GetRebateGoods": 91,
    "user/BuyGoods": 93,
    "user/UserCashOutState": 95,
    "user/CashOut": 97,
    "user/GetCashRecord": 99,
    "user/CashOutQuali": 101,
    "user/GetAwardList": 103,
    "story/QueryMailBox": 105,
    "story/MailBoxOper": 107,
    "story/UserMedal": 109,
    "story/QueryMedalList": 111,
    "story/GetTakeAggrPage": 113,
    "story/GetTaskRedDot": 115,
    "story/RewardSign": 117,
    "story/helpdraw": 119,
    "story/helpbystage": 121,
    "task/addCartSkuNotEnough": 123,
    "story/GetActTask": 125,
    "story/ActTaskAward": 127,
    "story/DelayBizReq": 131,
    "story/AddSuggest": 133,
  }
  let opId = jsonMap[type]
  if (opId!=undefined) return opId
  return 5001
}

async function requestAlgo() {
  $.fp = (getRandomIDPro({ size: 13 }) + Date.now()).slice(0, 16);
  const options = {
    "url": `https://cactus.jd.com/request_algo?g_ty=ajax`,
    headers: {
      'Authority': 'cactus.jd.com',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Origin': 'https://st.jingxi.com',
      'Sec-Fetch-Site': 'cross-site',
      'User-Agent': UA,
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Dest': 'empty',
      'Referer': 'https://st.jingxi.com/',
      'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7'
    },
    'body': JSON.stringify({
      "version": "1.0",
      "fp": $.fp,
      "appId": $.appId,
      "timestamp": Date.now(),
      "platform": "web",
      "expandParams": ""
    })
  }
  return new Promise(async resolve => {
    $.post(options, (err, resp, data) => {
      try {
        const { ret, msg, data: { result } = {} } = JSON.parse(data);
        $.token = result.tk;
        $.genKey = new Function(`return ${result.algo}`)();
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}

function getRandomIDPro() {
  var e,
    t,
    a = void 0 === (n = (t = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {}).size) ? 10 : n,
    n = void 0 === (n = t.dictType) ? 'number' : n,
    i = '';
  if ((t = t.customDict) && 'string' == typeof t) e = t;
  else
    switch (n) {
      case 'alphabet':
        e = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        break;
      case 'max':
        e = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
        break;
      case 'number':
      default:
        e = '0123456789';
    }

  for (; a--;) i += e[(Math.random() * e.length) | 0];
  return i;
}
function decrypt(time, stk, type, url) {
  stk = stk || (url ? getUrlQueryParams(url, '_stk') : '')
  if (stk) {
    const timestamp = format("yyyyMMddhhmmssSSS", time);
    const hash1 = $.genKey($.token, $.fp.toString(), timestamp.toString(), $.appId.toString(), $.CryptoJS).toString($.CryptoJS.enc.Hex);
    let st = '';
    stk.split(',').map((item, index) => {
      st += `${item}:${getUrlQueryParams(url, item)}${index === stk.split(',').length - 1 ? '' : '&'}`;
    })
    const hash2 = $.CryptoJS.HmacSHA256(st, hash1.toString()).toString($.CryptoJS.enc.Hex);
    return encodeURIComponent(["".concat(timestamp.toString()), "".concat($.fp.toString()), "".concat($.appId.toString()), "".concat($.token), "".concat(hash2)].join(";"))
  } else {
    return encodeURIComponent('20210713151140309;3329030085477162;10032;tk01we5431d52a8nbmxySnZya05SXBQSsarucS7aqQIUX98n+iAZjIzQFpu6+ZjRvOMzOaVvqHvQz9pOhDETNW7JmftM;3e219f9d420850cadd117e456d422e4ecd8ebfc34397273a5378a0edc70872b9')
  }
}

function format(a, time) {
  if (!a) a = 'yyyy-MM-dd';
  var t;
  if (!time) {
    t = Date.now();
  } else {
    t = new Date(time);
  }
  var e,
    n = new Date(t),
    d = a,
    l = {
      'M+': n.getMonth() + 1,
      'd+': n.getDate(),
      'D+': n.getDate(),
      'h+': n.getHours(),
      'H+': n.getHours(),
      'm+': n.getMinutes(),
      's+': n.getSeconds(),
      'w+': n.getDay(),
      'q+': Math.floor((n.getMonth() + 3) / 3),
      'S+': n.getMilliseconds(),
    };
  /(y+)/i.test(d) && (d = d.replace(RegExp.$1, ''.concat(n.getFullYear()).substr(4 - RegExp.$1.length)));
  Object.keys(l).forEach(e => {
    if (new RegExp('('.concat(e, ')')).test(d)) {
      var t,
        a = 'S+' === e ? '000' : '00';
      d = d.replace(RegExp.$1, 1 == RegExp.$1.length ? l[e] : ''.concat(a).concat(l[e]).substr(''.concat(l[e]).length));
    }
  });
  return d;
}

function getUrlQueryParams(url_string, param) {
  let reg = new RegExp("(^|&)" + param + "=([^&]*)(&|$)", "i");
  let r = url_string.split('?')[1].substr(0).match(reg);
  if (r != null) {
    return decodeURIComponent(r[2]);
  };
  return '';
}



function getAuthorShareCode(url) {
  return new Promise(async resolve => {
    const options = {
      "url": `${url}?${new Date()}`,
      "timeout": 10000,
      "headers": {
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
    let res = []
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
        } else {
          if (data) res = JSON.parse(data)
        }
      } catch (e) {
        // $.logErr(e, resp)
      } finally {
        resolve(res || []);
      }
    })
    await $.wait(10000)
    resolve(res);
  })
}

/**
 * 随机从一数组里面取
 * @param arr
 * @param count
 * @returns {Buffer}
 */
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


// 计算时间
function timeFn(dateBegin) {
  var hours = 0
  var minutes = 0
  var seconds = 0
  if(dateBegin != 0){
    //如果时间格式是正确的，那下面这一步转化时间格式就可以不用了
    var dateEnd = new Date();//获取当前时间
    var dateDiff = dateBegin - dateEnd.getTime();//时间差的毫秒数
    var leave1 = dateDiff % (24 * 3600 * 1000)    //计算天数后剩余的毫秒数
    hours = Math.floor(leave1 / (3600 * 1000))//计算出小时数
    //计算相差分钟数
    var leave2 = leave1 % (3600 * 1000)    //计算小时数后剩余的毫秒数
    minutes = Math.floor(leave2 / (60 * 1000))//计算相差分钟数
    //计算相差秒数
    var leave3 = leave2 % (60 * 1000)      //计算分钟数后剩余的毫秒数
    seconds = Math.round(leave3 / 1000)
  }
  hours = hours < 10 ? '0'+ hours : hours
  minutes = minutes < 10 ? '0'+ minutes : minutes
  seconds = seconds < 10 ? '0'+ seconds : seconds
  var timeFn = hours + ":" + minutes + ":" + seconds;
  return timeFn;
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

function CryptoScripts() {
  // prettier-ignore
  !function(t,e){"object"==typeof exports?module.exports=exports=e():"function"==typeof define&&define.amd?define([],e):t.CryptoJS=e()}(this,function(){var t,e,r,i,n,o,s,c,a,h,l,f,d,u,p,_,v,y,g,B,w,k,S,m,x,b,H,z,A,C,D,E,R,M,F,P,W,O,I,U,K,X,L,j,N,T,q,Z,V,G,J,$,Q,Y,tt,et,rt,it,nt,ot,st,ct,at,ht,lt,ft,dt,ut,pt,_t,vt,yt,gt,Bt,wt,kt,St,mt=mt||function(t){var e;if("undefined"!=typeof window&&window.crypto&&(e=window.crypto),!e&&"undefined"!=typeof window&&window.msCrypto&&(e=window.msCrypto),!e&&"undefined"!=typeof global&&global.crypto&&(e=global.crypto),!e&&"function"==typeof require)try{e=require("crypto")}catch(e){}function r(){if(e){if("function"==typeof e.getRandomValues)try{return e.getRandomValues(new Uint32Array(1))[0]}catch(t){}if("function"==typeof e.randomBytes)try{return e.randomBytes(4).readInt32LE()}catch(t){}}throw new Error("Native crypto module could not be used to get secure random number.")}var i=Object.create||function(t){var e;return n.prototype=t,e=new n,n.prototype=null,e};function n(){}var o={},s=o.lib={},c=s.Base={extend:function(t){var e=i(this);return t&&e.mixIn(t),e.hasOwnProperty("init")&&this.init!==e.init||(e.init=function(){e.$super.init.apply(this,arguments)}),(e.init.prototype=e).$super=this,e},create:function(){var t=this.extend();return t.init.apply(t,arguments),t},init:function(){},mixIn:function(t){for(var e in t)t.hasOwnProperty(e)&&(this[e]=t[e]);t.hasOwnProperty("toString")&&(this.toString=t.toString)},clone:function(){return this.init.prototype.extend(this)}},a=s.WordArray=c.extend({init:function(t,e){t=this.words=t||[],this.sigBytes=null!=e?e:4*t.length},toString:function(t){return(t||l).stringify(this)},concat:function(t){var e=this.words,r=t.words,i=this.sigBytes,n=t.sigBytes;if(this.clamp(),i%4)for(var o=0;o<n;o++){var s=r[o>>>2]>>>24-o%4*8&255;e[i+o>>>2]|=s<<24-(i+o)%4*8}else for(o=0;o<n;o+=4)e[i+o>>>2]=r[o>>>2];return this.sigBytes+=n,this},clamp:function(){var e=this.words,r=this.sigBytes;e[r>>>2]&=4294967295<<32-r%4*8,e.length=t.ceil(r/4)},clone:function(){var t=c.clone.call(this);return t.words=this.words.slice(0),t},random:function(t){for(var e=[],i=0;i<t;i+=4)e.push(r());return new a.init(e,t)}}),h=o.enc={},l=h.Hex={stringify:function(t){for(var e=t.words,r=t.sigBytes,i=[],n=0;n<r;n++){var o=e[n>>>2]>>>24-n%4*8&255;i.push((o>>>4).toString(16)),i.push((15&o).toString(16))}return i.join("")},parse:function(t){for(var e=t.length,r=[],i=0;i<e;i+=2)r[i>>>3]|=parseInt(t.substr(i,2),16)<<24-i%8*4;return new a.init(r,e/2)}},f=h.Latin1={stringify:function(t){for(var e=t.words,r=t.sigBytes,i=[],n=0;n<r;n++){var o=e[n>>>2]>>>24-n%4*8&255;i.push(String.fromCharCode(o))}return i.join("")},parse:function(t){for(var e=t.length,r=[],i=0;i<e;i++)r[i>>>2]|=(255&t.charCodeAt(i))<<24-i%4*8;return new a.init(r,e)}},d=h.Utf8={stringify:function(t){try{return decodeURIComponent(escape(f.stringify(t)))}catch(t){throw new Error("Malformed UTF-8 data")}},parse:function(t){return f.parse(unescape(encodeURIComponent(t)))}},u=s.BufferedBlockAlgorithm=c.extend({reset:function(){this._data=new a.init,this._nDataBytes=0},_append:function(t){"string"==typeof t&&(t=d.parse(t)),this._data.concat(t),this._nDataBytes+=t.sigBytes},_process:function(e){var r,i=this._data,n=i.words,o=i.sigBytes,s=this.blockSize,c=o/(4*s),h=(c=e?t.ceil(c):t.max((0|c)-this._minBufferSize,0))*s,l=t.min(4*h,o);if(h){for(var f=0;f<h;f+=s)this._doProcessBlock(n,f);r=n.splice(0,h),i.sigBytes-=l}return new a.init(r,l)},clone:function(){var t=c.clone.call(this);return t._data=this._data.clone(),t},_minBufferSize:0}),p=(s.Hasher=u.extend({cfg:c.extend(),init:function(t){this.cfg=this.cfg.extend(t),this.reset()},reset:function(){u.reset.call(this),this._doReset()},update:function(t){return this._append(t),this._process(),this},finalize:function(t){return t&&this._append(t),this._doFinalize()},blockSize:16,_createHelper:function(t){return function(e,r){return new t.init(r).finalize(e)}},_createHmacHelper:function(t){return function(e,r){return new p.HMAC.init(t,r).finalize(e)}}}),o.algo={});return o}(Math);function xt(t,e,r){return t^e^r}function bt(t,e,r){return t&e|~t&r}function Ht(t,e,r){return(t|~e)^r}function zt(t,e,r){return t&r|e&~r}function At(t,e,r){return t^(e|~r)}function Ct(t,e){return t<<e|t>>>32-e}function Dt(t,e,r,i){var n,o=this._iv;o?(n=o.slice(0),this._iv=void 0):n=this._prevBlock,i.encryptBlock(n,0);for(var s=0;s<r;s++)t[e+s]^=n[s]}function Et(t){if(255==(t>>24&255)){var e=t>>16&255,r=t>>8&255,i=255&t;255===e?(e=0,255===r?(r=0,255===i?i=0:++i):++r):++e,t=0,t+=e<<16,t+=r<<8,t+=i}else t+=1<<24;return t}function Rt(){for(var t=this._X,e=this._C,r=0;r<8;r++)ft[r]=e[r];for(e[0]=e[0]+1295307597+this._b|0,e[1]=e[1]+3545052371+(e[0]>>>0<ft[0]>>>0?1:0)|0,e[2]=e[2]+886263092+(e[1]>>>0<ft[1]>>>0?1:0)|0,e[3]=e[3]+1295307597+(e[2]>>>0<ft[2]>>>0?1:0)|0,e[4]=e[4]+3545052371+(e[3]>>>0<ft[3]>>>0?1:0)|0,e[5]=e[5]+886263092+(e[4]>>>0<ft[4]>>>0?1:0)|0,e[6]=e[6]+1295307597+(e[5]>>>0<ft[5]>>>0?1:0)|0,e[7]=e[7]+3545052371+(e[6]>>>0<ft[6]>>>0?1:0)|0,this._b=e[7]>>>0<ft[7]>>>0?1:0,r=0;r<8;r++){var i=t[r]+e[r],n=65535&i,o=i>>>16,s=((n*n>>>17)+n*o>>>15)+o*o,c=((4294901760&i)*i|0)+((65535&i)*i|0);dt[r]=s^c}t[0]=dt[0]+(dt[7]<<16|dt[7]>>>16)+(dt[6]<<16|dt[6]>>>16)|0,t[1]=dt[1]+(dt[0]<<8|dt[0]>>>24)+dt[7]|0,t[2]=dt[2]+(dt[1]<<16|dt[1]>>>16)+(dt[0]<<16|dt[0]>>>16)|0,t[3]=dt[3]+(dt[2]<<8|dt[2]>>>24)+dt[1]|0,t[4]=dt[4]+(dt[3]<<16|dt[3]>>>16)+(dt[2]<<16|dt[2]>>>16)|0,t[5]=dt[5]+(dt[4]<<8|dt[4]>>>24)+dt[3]|0,t[6]=dt[6]+(dt[5]<<16|dt[5]>>>16)+(dt[4]<<16|dt[4]>>>16)|0,t[7]=dt[7]+(dt[6]<<8|dt[6]>>>24)+dt[5]|0}function Mt(){for(var t=this._X,e=this._C,r=0;r<8;r++)wt[r]=e[r];for(e[0]=e[0]+1295307597+this._b|0,e[1]=e[1]+3545052371+(e[0]>>>0<wt[0]>>>0?1:0)|0,e[2]=e[2]+886263092+(e[1]>>>0<wt[1]>>>0?1:0)|0,e[3]=e[3]+1295307597+(e[2]>>>0<wt[2]>>>0?1:0)|0,e[4]=e[4]+3545052371+(e[3]>>>0<wt[3]>>>0?1:0)|0,e[5]=e[5]+886263092+(e[4]>>>0<wt[4]>>>0?1:0)|0,e[6]=e[6]+1295307597+(e[5]>>>0<wt[5]>>>0?1:0)|0,e[7]=e[7]+3545052371+(e[6]>>>0<wt[6]>>>0?1:0)|0,this._b=e[7]>>>0<wt[7]>>>0?1:0,r=0;r<8;r++){var i=t[r]+e[r],n=65535&i,o=i>>>16,s=((n*n>>>17)+n*o>>>15)+o*o,c=((4294901760&i)*i|0)+((65535&i)*i|0);kt[r]=s^c}t[0]=kt[0]+(kt[7]<<16|kt[7]>>>16)+(kt[6]<<16|kt[6]>>>16)|0,t[1]=kt[1]+(kt[0]<<8|kt[0]>>>24)+kt[7]|0,t[2]=kt[2]+(kt[1]<<16|kt[1]>>>16)+(kt[0]<<16|kt[0]>>>16)|0,t[3]=kt[3]+(kt[2]<<8|kt[2]>>>24)+kt[1]|0,t[4]=kt[4]+(kt[3]<<16|kt[3]>>>16)+(kt[2]<<16|kt[2]>>>16)|0,t[5]=kt[5]+(kt[4]<<8|kt[4]>>>24)+kt[3]|0,t[6]=kt[6]+(kt[5]<<16|kt[5]>>>16)+(kt[4]<<16|kt[4]>>>16)|0,t[7]=kt[7]+(kt[6]<<8|kt[6]>>>24)+kt[5]|0}return t=mt.lib.WordArray,mt.enc.Base64={stringify:function(t){var e=t.words,r=t.sigBytes,i=this._map;t.clamp();for(var n=[],o=0;o<r;o+=3)for(var s=(e[o>>>2]>>>24-o%4*8&255)<<16|(e[o+1>>>2]>>>24-(o+1)%4*8&255)<<8|e[o+2>>>2]>>>24-(o+2)%4*8&255,c=0;c<4&&o+.75*c<r;c++)n.push(i.charAt(s>>>6*(3-c)&63));var a=i.charAt(64);if(a)for(;n.length%4;)n.push(a);return n.join("")},parse:function(e){var r=e.length,i=this._map,n=this._reverseMap;if(!n){n=this._reverseMap=[];for(var o=0;o<i.length;o++)n[i.charCodeAt(o)]=o}var s=i.charAt(64);if(s){var c=e.indexOf(s);-1!==c&&(r=c)}return function(e,r,i){for(var n=[],o=0,s=0;s<r;s++)if(s%4){var c=i[e.charCodeAt(s-1)]<<s%4*2|i[e.charCodeAt(s)]>>>6-s%4*2;n[o>>>2]|=c<<24-o%4*8,o++}return t.create(n,o)}(e,r,n)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="},function(t){var e=mt,r=e.lib,i=r.WordArray,n=r.Hasher,o=e.algo,s=[];!function(){for(var e=0;e<64;e++)s[e]=4294967296*t.abs(t.sin(e+1))|0}();var c=o.MD5=n.extend({_doReset:function(){this._hash=new i.init([1732584193,4023233417,2562383102,271733878])},_doProcessBlock:function(t,e){for(var r=0;r<16;r++){var i=e+r,n=t[i];t[i]=16711935&(n<<8|n>>>24)|4278255360&(n<<24|n>>>8)}var o=this._hash.words,c=t[e+0],d=t[e+1],u=t[e+2],p=t[e+3],_=t[e+4],v=t[e+5],y=t[e+6],g=t[e+7],B=t[e+8],w=t[e+9],k=t[e+10],S=t[e+11],m=t[e+12],x=t[e+13],b=t[e+14],H=t[e+15],z=o[0],A=o[1],C=o[2],D=o[3];z=f(z=l(z=l(z=l(z=l(z=h(z=h(z=h(z=h(z=a(z=a(z=a(z=a(z,A,C,D,c,7,s[0]),A=a(A,C=a(C,D=a(D,z,A,C,d,12,s[1]),z,A,u,17,s[2]),D,z,p,22,s[3]),C,D,_,7,s[4]),A=a(A,C=a(C,D=a(D,z,A,C,v,12,s[5]),z,A,y,17,s[6]),D,z,g,22,s[7]),C,D,B,7,s[8]),A=a(A,C=a(C,D=a(D,z,A,C,w,12,s[9]),z,A,k,17,s[10]),D,z,S,22,s[11]),C,D,m,7,s[12]),A=a(A,C=a(C,D=a(D,z,A,C,x,12,s[13]),z,A,b,17,s[14]),D,z,H,22,s[15]),C,D,d,5,s[16]),A=h(A,C=h(C,D=h(D,z,A,C,y,9,s[17]),z,A,S,14,s[18]),D,z,c,20,s[19]),C,D,v,5,s[20]),A=h(A,C=h(C,D=h(D,z,A,C,k,9,s[21]),z,A,H,14,s[22]),D,z,_,20,s[23]),C,D,w,5,s[24]),A=h(A,C=h(C,D=h(D,z,A,C,b,9,s[25]),z,A,p,14,s[26]),D,z,B,20,s[27]),C,D,x,5,s[28]),A=h(A,C=h(C,D=h(D,z,A,C,u,9,s[29]),z,A,g,14,s[30]),D,z,m,20,s[31]),C,D,v,4,s[32]),A=l(A,C=l(C,D=l(D,z,A,C,B,11,s[33]),z,A,S,16,s[34]),D,z,b,23,s[35]),C,D,d,4,s[36]),A=l(A,C=l(C,D=l(D,z,A,C,_,11,s[37]),z,A,g,16,s[38]),D,z,k,23,s[39]),C,D,x,4,s[40]),A=l(A,C=l(C,D=l(D,z,A,C,c,11,s[41]),z,A,p,16,s[42]),D,z,y,23,s[43]),C,D,w,4,s[44]),A=l(A,C=l(C,D=l(D,z,A,C,m,11,s[45]),z,A,H,16,s[46]),D,z,u,23,s[47]),C,D,c,6,s[48]),A=f(A=f(A=f(A=f(A,C=f(C,D=f(D,z,A,C,g,10,s[49]),z,A,b,15,s[50]),D,z,v,21,s[51]),C=f(C,D=f(D,z=f(z,A,C,D,m,6,s[52]),A,C,p,10,s[53]),z,A,k,15,s[54]),D,z,d,21,s[55]),C=f(C,D=f(D,z=f(z,A,C,D,B,6,s[56]),A,C,H,10,s[57]),z,A,y,15,s[58]),D,z,x,21,s[59]),C=f(C,D=f(D,z=f(z,A,C,D,_,6,s[60]),A,C,S,10,s[61]),z,A,u,15,s[62]),D,z,w,21,s[63]),o[0]=o[0]+z|0,o[1]=o[1]+A|0,o[2]=o[2]+C|0,o[3]=o[3]+D|0},_doFinalize:function(){var e=this._data,r=e.words,i=8*this._nDataBytes,n=8*e.sigBytes;r[n>>>5]|=128<<24-n%32;var o=t.floor(i/4294967296),s=i;r[15+(64+n>>>9<<4)]=16711935&(o<<8|o>>>24)|4278255360&(o<<24|o>>>8),r[14+(64+n>>>9<<4)]=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8),e.sigBytes=4*(r.length+1),this._process();for(var c=this._hash,a=c.words,h=0;h<4;h++){var l=a[h];a[h]=16711935&(l<<8|l>>>24)|4278255360&(l<<24|l>>>8)}return c},clone:function(){var t=n.clone.call(this);return t._hash=this._hash.clone(),t}});function a(t,e,r,i,n,o,s){var c=t+(e&r|~e&i)+n+s;return(c<<o|c>>>32-o)+e}function h(t,e,r,i,n,o,s){var c=t+(e&i|r&~i)+n+s;return(c<<o|c>>>32-o)+e}function l(t,e,r,i,n,o,s){var c=t+(e^r^i)+n+s;return(c<<o|c>>>32-o)+e}function f(t,e,r,i,n,o,s){var c=t+(r^(e|~i))+n+s;return(c<<o|c>>>32-o)+e}e.MD5=n._createHelper(c),e.HmacMD5=n._createHmacHelper(c)}(Math),r=(e=mt).lib,i=r.WordArray,n=r.Hasher,o=e.algo,s=[],c=o.SHA1=n.extend({_doReset:function(){this._hash=new i.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(t,e){for(var r=this._hash.words,i=r[0],n=r[1],o=r[2],c=r[3],a=r[4],h=0;h<80;h++){if(h<16)s[h]=0|t[e+h];else{var l=s[h-3]^s[h-8]^s[h-14]^s[h-16];s[h]=l<<1|l>>>31}var f=(i<<5|i>>>27)+a+s[h];f+=h<20?1518500249+(n&o|~n&c):h<40?1859775393+(n^o^c):h<60?(n&o|n&c|o&c)-1894007588:(n^o^c)-899497514,a=c,c=o,o=n<<30|n>>>2,n=i,i=f}r[0]=r[0]+i|0,r[1]=r[1]+n|0,r[2]=r[2]+o|0,r[3]=r[3]+c|0,r[4]=r[4]+a|0},_doFinalize:function(){var t=this._data,e=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;return e[i>>>5]|=128<<24-i%32,e[14+(64+i>>>9<<4)]=Math.floor(r/4294967296),e[15+(64+i>>>9<<4)]=r,t.sigBytes=4*e.length,this._process(),this._hash},clone:function(){var t=n.clone.call(this);return t._hash=this._hash.clone(),t}}),e.SHA1=n._createHelper(c),e.HmacSHA1=n._createHmacHelper(c),function(t){var e=mt,r=e.lib,i=r.WordArray,n=r.Hasher,o=e.algo,s=[],c=[];!function(){function e(e){for(var r=t.sqrt(e),i=2;i<=r;i++)if(!(e%i))return;return 1}function r(t){return 4294967296*(t-(0|t))|0}for(var i=2,n=0;n<64;)e(i)&&(n<8&&(s[n]=r(t.pow(i,.5))),c[n]=r(t.pow(i,1/3)),n++),i++}();var a=[],h=o.SHA256=n.extend({_doReset:function(){this._hash=new i.init(s.slice(0))},_doProcessBlock:function(t,e){for(var r=this._hash.words,i=r[0],n=r[1],o=r[2],s=r[3],h=r[4],l=r[5],f=r[6],d=r[7],u=0;u<64;u++){if(u<16)a[u]=0|t[e+u];else{var p=a[u-15],_=(p<<25|p>>>7)^(p<<14|p>>>18)^p>>>3,v=a[u-2],y=(v<<15|v>>>17)^(v<<13|v>>>19)^v>>>10;a[u]=_+a[u-7]+y+a[u-16]}var g=i&n^i&o^n&o,B=(i<<30|i>>>2)^(i<<19|i>>>13)^(i<<10|i>>>22),w=d+((h<<26|h>>>6)^(h<<21|h>>>11)^(h<<7|h>>>25))+(h&l^~h&f)+c[u]+a[u];d=f,f=l,l=h,h=s+w|0,s=o,o=n,n=i,i=w+(B+g)|0}r[0]=r[0]+i|0,r[1]=r[1]+n|0,r[2]=r[2]+o|0,r[3]=r[3]+s|0,r[4]=r[4]+h|0,r[5]=r[5]+l|0,r[6]=r[6]+f|0,r[7]=r[7]+d|0},_doFinalize:function(){var e=this._data,r=e.words,i=8*this._nDataBytes,n=8*e.sigBytes;return r[n>>>5]|=128<<24-n%32,r[14+(64+n>>>9<<4)]=t.floor(i/4294967296),r[15+(64+n>>>9<<4)]=i,e.sigBytes=4*r.length,this._process(),this._hash},clone:function(){var t=n.clone.call(this);return t._hash=this._hash.clone(),t}});e.SHA256=n._createHelper(h),e.HmacSHA256=n._createHmacHelper(h)}(Math),function(){var t=mt.lib.WordArray,e=mt.enc;function r(t){return t<<8&4278255360|t>>>8&16711935}e.Utf16=e.Utf16BE={stringify:function(t){for(var e=t.words,r=t.sigBytes,i=[],n=0;n<r;n+=2){var o=e[n>>>2]>>>16-n%4*8&65535;i.push(String.fromCharCode(o))}return i.join("")},parse:function(e){for(var r=e.length,i=[],n=0;n<r;n++)i[n>>>1]|=e.charCodeAt(n)<<16-n%2*16;return t.create(i,2*r)}},e.Utf16LE={stringify:function(t){for(var e=t.words,i=t.sigBytes,n=[],o=0;o<i;o+=2){var s=r(e[o>>>2]>>>16-o%4*8&65535);n.push(String.fromCharCode(s))}return n.join("")},parse:function(e){for(var i=e.length,n=[],o=0;o<i;o++)n[o>>>1]|=r(e.charCodeAt(o)<<16-o%2*16);return t.create(n,2*i)}}}(),function(){if("function"==typeof ArrayBuffer){var t=mt.lib.WordArray,e=t.init;(t.init=function(t){if(t instanceof ArrayBuffer&&(t=new Uint8Array(t)),(t instanceof Int8Array||"undefined"!=typeof Uint8ClampedArray&&t instanceof Uint8ClampedArray||t instanceof Int16Array||t instanceof Uint16Array||t instanceof Int32Array||t instanceof Uint32Array||t instanceof Float32Array||t instanceof Float64Array)&&(t=new Uint8Array(t.buffer,t.byteOffset,t.byteLength)),t instanceof Uint8Array){for(var r=t.byteLength,i=[],n=0;n<r;n++)i[n>>>2]|=t[n]<<24-n%4*8;e.call(this,i,r)}else e.apply(this,arguments)}).prototype=t}}(),Math,h=(a=mt).lib,l=h.WordArray,f=h.Hasher,d=a.algo,u=l.create([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13]),p=l.create([5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11]),_=l.create([11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6]),v=l.create([8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11]),y=l.create([0,1518500249,1859775393,2400959708,2840853838]),g=l.create([1352829926,1548603684,1836072691,2053994217,0]),B=d.RIPEMD160=f.extend({_doReset:function(){this._hash=l.create([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(t,e){for(var r=0;r<16;r++){var i=e+r,n=t[i];t[i]=16711935&(n<<8|n>>>24)|4278255360&(n<<24|n>>>8)}var o,s,c,a,h,l,f,d,B,w,k,S=this._hash.words,m=y.words,x=g.words,b=u.words,H=p.words,z=_.words,A=v.words;for(l=o=S[0],f=s=S[1],d=c=S[2],B=a=S[3],w=h=S[4],r=0;r<80;r+=1)k=o+t[e+b[r]]|0,k+=r<16?xt(s,c,a)+m[0]:r<32?bt(s,c,a)+m[1]:r<48?Ht(s,c,a)+m[2]:r<64?zt(s,c,a)+m[3]:At(s,c,a)+m[4],k=(k=Ct(k|=0,z[r]))+h|0,o=h,h=a,a=Ct(c,10),c=s,s=k,k=l+t[e+H[r]]|0,k+=r<16?At(f,d,B)+x[0]:r<32?zt(f,d,B)+x[1]:r<48?Ht(f,d,B)+x[2]:r<64?bt(f,d,B)+x[3]:xt(f,d,B)+x[4],k=(k=Ct(k|=0,A[r]))+w|0,l=w,w=B,B=Ct(d,10),d=f,f=k;k=S[1]+c+B|0,S[1]=S[2]+a+w|0,S[2]=S[3]+h+l|0,S[3]=S[4]+o+f|0,S[4]=S[0]+s+d|0,S[0]=k},_doFinalize:function(){var t=this._data,e=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;e[i>>>5]|=128<<24-i%32,e[14+(64+i>>>9<<4)]=16711935&(r<<8|r>>>24)|4278255360&(r<<24|r>>>8),t.sigBytes=4*(e.length+1),this._process();for(var n=this._hash,o=n.words,s=0;s<5;s++){var c=o[s];o[s]=16711935&(c<<8|c>>>24)|4278255360&(c<<24|c>>>8)}return n},clone:function(){var t=f.clone.call(this);return t._hash=this._hash.clone(),t}}),a.RIPEMD160=f._createHelper(B),a.HmacRIPEMD160=f._createHmacHelper(B),w=mt.lib.Base,k=mt.enc.Utf8,mt.algo.HMAC=w.extend({init:function(t,e){t=this._hasher=new t.init,"string"==typeof e&&(e=k.parse(e));var r=t.blockSize,i=4*r;e.sigBytes>i&&(e=t.finalize(e)),e.clamp();for(var n=this._oKey=e.clone(),o=this._iKey=e.clone(),s=n.words,c=o.words,a=0;a<r;a++)s[a]^=1549556828,c[a]^=909522486;n.sigBytes=o.sigBytes=i,this.reset()},reset:function(){var t=this._hasher;t.reset(),t.update(this._iKey)},update:function(t){return this._hasher.update(t),this},finalize:function(t){var e=this._hasher,r=e.finalize(t);return e.reset(),e.finalize(this._oKey.clone().concat(r))}}),x=(m=(S=mt).lib).Base,b=m.WordArray,z=(H=S.algo).SHA1,A=H.HMAC,C=H.PBKDF2=x.extend({cfg:x.extend({keySize:4,hasher:z,iterations:1}),init:function(t){this.cfg=this.cfg.extend(t)},compute:function(t,e){for(var r=this.cfg,i=A.create(r.hasher,t),n=b.create(),o=b.create([1]),s=n.words,c=o.words,a=r.keySize,h=r.iterations;s.length<a;){var l=i.update(e).finalize(o);i.reset();for(var f=l.words,d=f.length,u=l,p=1;p<h;p++){u=i.finalize(u),i.reset();for(var _=u.words,v=0;v<d;v++)f[v]^=_[v]}n.concat(l),c[0]++}return n.sigBytes=4*a,n}}),S.PBKDF2=function(t,e,r){return C.create(r).compute(t,e)},R=(E=(D=mt).lib).Base,M=E.WordArray,P=(F=D.algo).MD5,W=F.EvpKDF=R.extend({cfg:R.extend({keySize:4,hasher:P,iterations:1}),init:function(t){this.cfg=this.cfg.extend(t)},compute:function(t,e){for(var r,i=this.cfg,n=i.hasher.create(),o=M.create(),s=o.words,c=i.keySize,a=i.iterations;s.length<c;){r&&n.update(r),r=n.update(t).finalize(e),n.reset();for(var h=1;h<a;h++)r=n.finalize(r),n.reset();o.concat(r)}return o.sigBytes=4*c,o}}),D.EvpKDF=function(t,e,r){return W.create(r).compute(t,e)},I=(O=mt).lib.WordArray,U=O.algo,K=U.SHA256,X=U.SHA224=K.extend({_doReset:function(){this._hash=new I.init([3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428])},_doFinalize:function(){var t=K._doFinalize.call(this);return t.sigBytes-=4,t}}),O.SHA224=K._createHelper(X),O.HmacSHA224=K._createHmacHelper(X),L=mt.lib,j=L.Base,N=L.WordArray,(T=mt.x64={}).Word=j.extend({init:function(t,e){this.high=t,this.low=e}}),T.WordArray=j.extend({init:function(t,e){t=this.words=t||[],this.sigBytes=null!=e?e:8*t.length},toX32:function(){for(var t=this.words,e=t.length,r=[],i=0;i<e;i++){var n=t[i];r.push(n.high),r.push(n.low)}return N.create(r,this.sigBytes)},clone:function(){for(var t=j.clone.call(this),e=t.words=this.words.slice(0),r=e.length,i=0;i<r;i++)e[i]=e[i].clone();return t}}),function(t){var e=mt,r=e.lib,i=r.WordArray,n=r.Hasher,o=e.x64.Word,s=e.algo,c=[],a=[],h=[];!function(){for(var t=1,e=0,r=0;r<24;r++){c[t+5*e]=(r+1)*(r+2)/2%64;var i=(2*t+3*e)%5;t=e%5,e=i}for(t=0;t<5;t++)for(e=0;e<5;e++)a[t+5*e]=e+(2*t+3*e)%5*5;for(var n=1,s=0;s<24;s++){for(var l=0,f=0,d=0;d<7;d++){if(1&n){var u=(1<<d)-1;u<32?f^=1<<u:l^=1<<u-32}128&n?n=n<<1^113:n<<=1}h[s]=o.create(l,f)}}();var l=[];!function(){for(var t=0;t<25;t++)l[t]=o.create()}();var f=s.SHA3=n.extend({cfg:n.cfg.extend({outputLength:512}),_doReset:function(){for(var t=this._state=[],e=0;e<25;e++)t[e]=new o.init;this.blockSize=(1600-2*this.cfg.outputLength)/32},_doProcessBlock:function(t,e){for(var r=this._state,i=this.blockSize/2,n=0;n<i;n++){var o=t[e+2*n],s=t[e+2*n+1];o=16711935&(o<<8|o>>>24)|4278255360&(o<<24|o>>>8),s=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8),(A=r[n]).high^=s,A.low^=o}for(var f=0;f<24;f++){for(var d=0;d<5;d++){for(var u=0,p=0,_=0;_<5;_++)u^=(A=r[d+5*_]).high,p^=A.low;var v=l[d];v.high=u,v.low=p}for(d=0;d<5;d++){var y=l[(d+4)%5],g=l[(d+1)%5],B=g.high,w=g.low;for(u=y.high^(B<<1|w>>>31),p=y.low^(w<<1|B>>>31),_=0;_<5;_++)(A=r[d+5*_]).high^=u,A.low^=p}for(var k=1;k<25;k++){var S=(A=r[k]).high,m=A.low,x=c[k];p=x<32?(u=S<<x|m>>>32-x,m<<x|S>>>32-x):(u=m<<x-32|S>>>64-x,S<<x-32|m>>>64-x);var b=l[a[k]];b.high=u,b.low=p}var H=l[0],z=r[0];for(H.high=z.high,H.low=z.low,d=0;d<5;d++)for(_=0;_<5;_++){var A=r[k=d+5*_],C=l[k],D=l[(d+1)%5+5*_],E=l[(d+2)%5+5*_];A.high=C.high^~D.high&E.high,A.low=C.low^~D.low&E.low}A=r[0];var R=h[f];A.high^=R.high,A.low^=R.low}},_doFinalize:function(){var e=this._data,r=e.words,n=(this._nDataBytes,8*e.sigBytes),o=32*this.blockSize;r[n>>>5]|=1<<24-n%32,r[(t.ceil((1+n)/o)*o>>>5)-1]|=128,e.sigBytes=4*r.length,this._process();for(var s=this._state,c=this.cfg.outputLength/8,a=c/8,h=[],l=0;l<a;l++){var f=s[l],d=f.high,u=f.low;d=16711935&(d<<8|d>>>24)|4278255360&(d<<24|d>>>8),u=16711935&(u<<8|u>>>24)|4278255360&(u<<24|u>>>8),h.push(u),h.push(d)}return new i.init(h,c)},clone:function(){for(var t=n.clone.call(this),e=t._state=this._state.slice(0),r=0;r<25;r++)e[r]=e[r].clone();return t}});e.SHA3=n._createHelper(f),e.HmacSHA3=n._createHmacHelper(f)}(Math),function(){var t=mt,e=t.lib.Hasher,r=t.x64,i=r.Word,n=r.WordArray,o=t.algo;function s(){return i.create.apply(i,arguments)}var c=[s(1116352408,3609767458),s(1899447441,602891725),s(3049323471,3964484399),s(3921009573,2173295548),s(961987163,4081628472),s(1508970993,3053834265),s(2453635748,2937671579),s(2870763221,3664609560),s(3624381080,2734883394),s(310598401,1164996542),s(607225278,1323610764),s(1426881987,3590304994),s(1925078388,4068182383),s(2162078206,991336113),s(2614888103,633803317),s(3248222580,3479774868),s(3835390401,2666613458),s(4022224774,944711139),s(264347078,2341262773),s(604807628,2007800933),s(770255983,1495990901),s(1249150122,1856431235),s(1555081692,3175218132),s(1996064986,2198950837),s(2554220882,3999719339),s(2821834349,766784016),s(2952996808,2566594879),s(3210313671,3203337956),s(3336571891,1034457026),s(3584528711,2466948901),s(113926993,3758326383),s(338241895,168717936),s(666307205,1188179964),s(773529912,1546045734),s(1294757372,1522805485),s(1396182291,2643833823),s(1695183700,2343527390),s(1986661051,1014477480),s(2177026350,1206759142),s(2456956037,344077627),s(2730485921,1290863460),s(2820302411,3158454273),s(3259730800,3505952657),s(3345764771,106217008),s(3516065817,3606008344),s(3600352804,1432725776),s(4094571909,1467031594),s(275423344,851169720),s(430227734,3100823752),s(506948616,1363258195),s(659060556,3750685593),s(883997877,3785050280),s(958139571,3318307427),s(1322822218,3812723403),s(1537002063,2003034995),s(1747873779,3602036899),s(1955562222,1575990012),s(2024104815,1125592928),s(2227730452,2716904306),s(2361852424,442776044),s(2428436474,593698344),s(2756734187,3733110249),s(3204031479,2999351573),s(3329325298,3815920427),s(3391569614,3928383900),s(3515267271,566280711),s(3940187606,3454069534),s(4118630271,4000239992),s(116418474,1914138554),s(174292421,2731055270),s(289380356,3203993006),s(460393269,320620315),s(685471733,587496836),s(852142971,1086792851),s(1017036298,365543100),s(1126000580,2618297676),s(1288033470,3409855158),s(1501505948,4234509866),s(1607167915,987167468),s(1816402316,1246189591)],a=[];!function(){for(var t=0;t<80;t++)a[t]=s()}();var h=o.SHA512=e.extend({_doReset:function(){this._hash=new n.init([new i.init(1779033703,4089235720),new i.init(3144134277,2227873595),new i.init(1013904242,4271175723),new i.init(2773480762,1595750129),new i.init(1359893119,2917565137),new i.init(2600822924,725511199),new i.init(528734635,4215389547),new i.init(1541459225,327033209)])},_doProcessBlock:function(t,e){for(var r=this._hash.words,i=r[0],n=r[1],o=r[2],s=r[3],h=r[4],l=r[5],f=r[6],d=r[7],u=i.high,p=i.low,_=n.high,v=n.low,y=o.high,g=o.low,B=s.high,w=s.low,k=h.high,S=h.low,m=l.high,x=l.low,b=f.high,H=f.low,z=d.high,A=d.low,C=u,D=p,E=_,R=v,M=y,F=g,P=B,W=w,O=k,I=S,U=m,K=x,X=b,L=H,j=z,N=A,T=0;T<80;T++){var q,Z,V=a[T];if(T<16)Z=V.high=0|t[e+2*T],q=V.low=0|t[e+2*T+1];else{var G=a[T-15],J=G.high,$=G.low,Q=(J>>>1|$<<31)^(J>>>8|$<<24)^J>>>7,Y=($>>>1|J<<31)^($>>>8|J<<24)^($>>>7|J<<25),tt=a[T-2],et=tt.high,rt=tt.low,it=(et>>>19|rt<<13)^(et<<3|rt>>>29)^et>>>6,nt=(rt>>>19|et<<13)^(rt<<3|et>>>29)^(rt>>>6|et<<26),ot=a[T-7],st=ot.high,ct=ot.low,at=a[T-16],ht=at.high,lt=at.low;Z=(Z=(Z=Q+st+((q=Y+ct)>>>0<Y>>>0?1:0))+it+((q+=nt)>>>0<nt>>>0?1:0))+ht+((q+=lt)>>>0<lt>>>0?1:0),V.high=Z,V.low=q}var ft,dt=O&U^~O&X,ut=I&K^~I&L,pt=C&E^C&M^E&M,_t=D&R^D&F^R&F,vt=(C>>>28|D<<4)^(C<<30|D>>>2)^(C<<25|D>>>7),yt=(D>>>28|C<<4)^(D<<30|C>>>2)^(D<<25|C>>>7),gt=(O>>>14|I<<18)^(O>>>18|I<<14)^(O<<23|I>>>9),Bt=(I>>>14|O<<18)^(I>>>18|O<<14)^(I<<23|O>>>9),wt=c[T],kt=wt.high,St=wt.low,mt=j+gt+((ft=N+Bt)>>>0<N>>>0?1:0),xt=yt+_t;j=X,N=L,X=U,L=K,U=O,K=I,O=P+(mt=(mt=(mt=mt+dt+((ft+=ut)>>>0<ut>>>0?1:0))+kt+((ft+=St)>>>0<St>>>0?1:0))+Z+((ft+=q)>>>0<q>>>0?1:0))+((I=W+ft|0)>>>0<W>>>0?1:0)|0,P=M,W=F,M=E,F=R,E=C,R=D,C=mt+(vt+pt+(xt>>>0<yt>>>0?1:0))+((D=ft+xt|0)>>>0<ft>>>0?1:0)|0}p=i.low=p+D,i.high=u+C+(p>>>0<D>>>0?1:0),v=n.low=v+R,n.high=_+E+(v>>>0<R>>>0?1:0),g=o.low=g+F,o.high=y+M+(g>>>0<F>>>0?1:0),w=s.low=w+W,s.high=B+P+(w>>>0<W>>>0?1:0),S=h.low=S+I,h.high=k+O+(S>>>0<I>>>0?1:0),x=l.low=x+K,l.high=m+U+(x>>>0<K>>>0?1:0),H=f.low=H+L,f.high=b+X+(H>>>0<L>>>0?1:0),A=d.low=A+N,d.high=z+j+(A>>>0<N>>>0?1:0)},_doFinalize:function(){var t=this._data,e=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;return e[i>>>5]|=128<<24-i%32,e[30+(128+i>>>10<<5)]=Math.floor(r/4294967296),e[31+(128+i>>>10<<5)]=r,t.sigBytes=4*e.length,this._process(),this._hash.toX32()},clone:function(){var t=e.clone.call(this);return t._hash=this._hash.clone(),t},blockSize:32});t.SHA512=e._createHelper(h),t.HmacSHA512=e._createHmacHelper(h)}(),Z=(q=mt).x64,V=Z.Word,G=Z.WordArray,J=q.algo,$=J.SHA512,Q=J.SHA384=$.extend({_doReset:function(){this._hash=new G.init([new V.init(3418070365,3238371032),new V.init(1654270250,914150663),new V.init(2438529370,812702999),new V.init(355462360,4144912697),new V.init(1731405415,4290775857),new V.init(2394180231,1750603025),new V.init(3675008525,1694076839),new V.init(1203062813,3204075428)])},_doFinalize:function(){var t=$._doFinalize.call(this);return t.sigBytes-=16,t}}),q.SHA384=$._createHelper(Q),q.HmacSHA384=$._createHmacHelper(Q),mt.lib.Cipher||function(){var t=mt,e=t.lib,r=e.Base,i=e.WordArray,n=e.BufferedBlockAlgorithm,o=t.enc,s=(o.Utf8,o.Base64),c=t.algo.EvpKDF,a=e.Cipher=n.extend({cfg:r.extend(),createEncryptor:function(t,e){return this.create(this._ENC_XFORM_MODE,t,e)},createDecryptor:function(t,e){return this.create(this._DEC_XFORM_MODE,t,e)},init:function(t,e,r){this.cfg=this.cfg.extend(r),this._xformMode=t,this._key=e,this.reset()},reset:function(){n.reset.call(this),this._doReset()},process:function(t){return this._append(t),this._process()},finalize:function(t){return t&&this._append(t),this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(t){return{encrypt:function(e,r,i){return h(r).encrypt(t,e,r,i)},decrypt:function(e,r,i){return h(r).decrypt(t,e,r,i)}}}});function h(t){return"string"==typeof t?w:g}e.StreamCipher=a.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var l,f=t.mode={},d=e.BlockCipherMode=r.extend({createEncryptor:function(t,e){return this.Encryptor.create(t,e)},createDecryptor:function(t,e){return this.Decryptor.create(t,e)},init:function(t,e){this._cipher=t,this._iv=e}}),u=f.CBC=((l=d.extend()).Encryptor=l.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize;p.call(this,t,e,i),r.encryptBlock(t,e),this._prevBlock=t.slice(e,e+i)}}),l.Decryptor=l.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize,n=t.slice(e,e+i);r.decryptBlock(t,e),p.call(this,t,e,i),this._prevBlock=n}}),l);function p(t,e,r){var i,n=this._iv;n?(i=n,this._iv=void 0):i=this._prevBlock;for(var o=0;o<r;o++)t[e+o]^=i[o]}var _=(t.pad={}).Pkcs7={pad:function(t,e){for(var r=4*e,n=r-t.sigBytes%r,o=n<<24|n<<16|n<<8|n,s=[],c=0;c<n;c+=4)s.push(o);var a=i.create(s,n);t.concat(a)},unpad:function(t){var e=255&t.words[t.sigBytes-1>>>2];t.sigBytes-=e}},v=(e.BlockCipher=a.extend({cfg:a.cfg.extend({mode:u,padding:_}),reset:function(){var t;a.reset.call(this);var e=this.cfg,r=e.iv,i=e.mode;this._xformMode==this._ENC_XFORM_MODE?t=i.createEncryptor:(t=i.createDecryptor,this._minBufferSize=1),this._mode&&this._mode.__creator==t?this._mode.init(this,r&&r.words):(this._mode=t.call(i,this,r&&r.words),this._mode.__creator=t)},_doProcessBlock:function(t,e){this._mode.processBlock(t,e)},_doFinalize:function(){var t,e=this.cfg.padding;return this._xformMode==this._ENC_XFORM_MODE?(e.pad(this._data,this.blockSize),t=this._process(!0)):(t=this._process(!0),e.unpad(t)),t},blockSize:4}),e.CipherParams=r.extend({init:function(t){this.mixIn(t)},toString:function(t){return(t||this.formatter).stringify(this)}})),y=(t.format={}).OpenSSL={stringify:function(t){var e=t.ciphertext,r=t.salt;return(r?i.create([1398893684,1701076831]).concat(r).concat(e):e).toString(s)},parse:function(t){var e,r=s.parse(t),n=r.words;return 1398893684==n[0]&&1701076831==n[1]&&(e=i.create(n.slice(2,4)),n.splice(0,4),r.sigBytes-=16),v.create({ciphertext:r,salt:e})}},g=e.SerializableCipher=r.extend({cfg:r.extend({format:y}),encrypt:function(t,e,r,i){i=this.cfg.extend(i);var n=t.createEncryptor(r,i),o=n.finalize(e),s=n.cfg;return v.create({ciphertext:o,key:r,iv:s.iv,algorithm:t,mode:s.mode,padding:s.padding,blockSize:t.blockSize,formatter:i.format})},decrypt:function(t,e,r,i){return i=this.cfg.extend(i),e=this._parse(e,i.format),t.createDecryptor(r,i).finalize(e.ciphertext)},_parse:function(t,e){return"string"==typeof t?e.parse(t,this):t}}),B=(t.kdf={}).OpenSSL={execute:function(t,e,r,n){n=n||i.random(8);var o=c.create({keySize:e+r}).compute(t,n),s=i.create(o.words.slice(e),4*r);return o.sigBytes=4*e,v.create({key:o,iv:s,salt:n})}},w=e.PasswordBasedCipher=g.extend({cfg:g.cfg.extend({kdf:B}),encrypt:function(t,e,r,i){var n=(i=this.cfg.extend(i)).kdf.execute(r,t.keySize,t.ivSize);i.iv=n.iv;var o=g.encrypt.call(this,t,e,n.key,i);return o.mixIn(n),o},decrypt:function(t,e,r,i){i=this.cfg.extend(i),e=this._parse(e,i.format);var n=i.kdf.execute(r,t.keySize,t.ivSize,e.salt);return i.iv=n.iv,g.decrypt.call(this,t,e,n.key,i)}})}(),mt.mode.CFB=((Y=mt.lib.BlockCipherMode.extend()).Encryptor=Y.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize;Dt.call(this,t,e,i,r),this._prevBlock=t.slice(e,e+i)}}),Y.Decryptor=Y.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize,n=t.slice(e,e+i);Dt.call(this,t,e,i,r),this._prevBlock=n}}),Y),mt.mode.ECB=((tt=mt.lib.BlockCipherMode.extend()).Encryptor=tt.extend({processBlock:function(t,e){this._cipher.encryptBlock(t,e)}}),tt.Decryptor=tt.extend({processBlock:function(t,e){this._cipher.decryptBlock(t,e)}}),tt),mt.pad.AnsiX923={pad:function(t,e){var r=t.sigBytes,i=4*e,n=i-r%i,o=r+n-1;t.clamp(),t.words[o>>>2]|=n<<24-o%4*8,t.sigBytes+=n},unpad:function(t){var e=255&t.words[t.sigBytes-1>>>2];t.sigBytes-=e}},mt.pad.Iso10126={pad:function(t,e){var r=4*e,i=r-t.sigBytes%r;t.concat(mt.lib.WordArray.random(i-1)).concat(mt.lib.WordArray.create([i<<24],1))},unpad:function(t){var e=255&t.words[t.sigBytes-1>>>2];t.sigBytes-=e}},mt.pad.Iso97971={pad:function(t,e){t.concat(mt.lib.WordArray.create([2147483648],1)),mt.pad.ZeroPadding.pad(t,e)},unpad:function(t){mt.pad.ZeroPadding.unpad(t),t.sigBytes--}},mt.mode.OFB=(rt=(et=mt.lib.BlockCipherMode.extend()).Encryptor=et.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize,n=this._iv,o=this._keystream;n&&(o=this._keystream=n.slice(0),this._iv=void 0),r.encryptBlock(o,0);for(var s=0;s<i;s++)t[e+s]^=o[s]}}),et.Decryptor=rt,et),mt.pad.NoPadding={pad:function(){},unpad:function(){}},it=mt.lib.CipherParams,nt=mt.enc.Hex,mt.format.Hex={stringify:function(t){return t.ciphertext.toString(nt)},parse:function(t){var e=nt.parse(t);return it.create({ciphertext:e})}},function(){var t=mt,e=t.lib.BlockCipher,r=t.algo,i=[],n=[],o=[],s=[],c=[],a=[],h=[],l=[],f=[],d=[];!function(){for(var t=[],e=0;e<256;e++)t[e]=e<128?e<<1:e<<1^283;var r=0,u=0;for(e=0;e<256;e++){var p=u^u<<1^u<<2^u<<3^u<<4;p=p>>>8^255&p^99,i[r]=p;var _=t[n[p]=r],v=t[_],y=t[v],g=257*t[p]^16843008*p;o[r]=g<<24|g>>>8,s[r]=g<<16|g>>>16,c[r]=g<<8|g>>>24,a[r]=g,g=16843009*y^65537*v^257*_^16843008*r,h[p]=g<<24|g>>>8,l[p]=g<<16|g>>>16,f[p]=g<<8|g>>>24,d[p]=g,r?(r=_^t[t[t[y^_]]],u^=t[t[u]]):r=u=1}}();var u=[0,1,2,4,8,16,32,64,128,27,54],p=r.AES=e.extend({_doReset:function(){if(!this._nRounds||this._keyPriorReset!==this._key){for(var t=this._keyPriorReset=this._key,e=t.words,r=t.sigBytes/4,n=4*(1+(this._nRounds=6+r)),o=this._keySchedule=[],s=0;s<n;s++)s<r?o[s]=e[s]:(p=o[s-1],s%r?6<r&&s%r==4&&(p=i[p>>>24]<<24|i[p>>>16&255]<<16|i[p>>>8&255]<<8|i[255&p]):(p=i[(p=p<<8|p>>>24)>>>24]<<24|i[p>>>16&255]<<16|i[p>>>8&255]<<8|i[255&p],p^=u[s/r|0]<<24),o[s]=o[s-r]^p);for(var c=this._invKeySchedule=[],a=0;a<n;a++){if(s=n-a,a%4)var p=o[s];else p=o[s-4];c[a]=a<4||s<=4?p:h[i[p>>>24]]^l[i[p>>>16&255]]^f[i[p>>>8&255]]^d[i[255&p]]}}},encryptBlock:function(t,e){this._doCryptBlock(t,e,this._keySchedule,o,s,c,a,i)},decryptBlock:function(t,e){var r=t[e+1];t[e+1]=t[e+3],t[e+3]=r,this._doCryptBlock(t,e,this._invKeySchedule,h,l,f,d,n),r=t[e+1],t[e+1]=t[e+3],t[e+3]=r},_doCryptBlock:function(t,e,r,i,n,o,s,c){for(var a=this._nRounds,h=t[e]^r[0],l=t[e+1]^r[1],f=t[e+2]^r[2],d=t[e+3]^r[3],u=4,p=1;p<a;p++){var _=i[h>>>24]^n[l>>>16&255]^o[f>>>8&255]^s[255&d]^r[u++],v=i[l>>>24]^n[f>>>16&255]^o[d>>>8&255]^s[255&h]^r[u++],y=i[f>>>24]^n[d>>>16&255]^o[h>>>8&255]^s[255&l]^r[u++],g=i[d>>>24]^n[h>>>16&255]^o[l>>>8&255]^s[255&f]^r[u++];h=_,l=v,f=y,d=g}_=(c[h>>>24]<<24|c[l>>>16&255]<<16|c[f>>>8&255]<<8|c[255&d])^r[u++],v=(c[l>>>24]<<24|c[f>>>16&255]<<16|c[d>>>8&255]<<8|c[255&h])^r[u++],y=(c[f>>>24]<<24|c[d>>>16&255]<<16|c[h>>>8&255]<<8|c[255&l])^r[u++],g=(c[d>>>24]<<24|c[h>>>16&255]<<16|c[l>>>8&255]<<8|c[255&f])^r[u++],t[e]=_,t[e+1]=v,t[e+2]=y,t[e+3]=g},keySize:8});t.AES=e._createHelper(p)}(),function(){var t=mt,e=t.lib,r=e.WordArray,i=e.BlockCipher,n=t.algo,o=[57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4],s=[14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32],c=[1,2,4,6,8,10,12,14,15,17,19,21,23,25,27,28],a=[{0:8421888,268435456:32768,536870912:8421378,805306368:2,1073741824:512,1342177280:8421890,1610612736:8389122,1879048192:8388608,2147483648:514,2415919104:8389120,2684354560:33280,2952790016:8421376,3221225472:32770,3489660928:8388610,3758096384:0,4026531840:33282,134217728:0,402653184:8421890,671088640:33282,939524096:32768,1207959552:8421888,1476395008:512,1744830464:8421378,2013265920:2,2281701376:8389120,2550136832:33280,2818572288:8421376,3087007744:8389122,3355443200:8388610,3623878656:32770,3892314112:514,4160749568:8388608,1:32768,268435457:2,536870913:8421888,805306369:8388608,1073741825:8421378,1342177281:33280,1610612737:512,1879048193:8389122,2147483649:8421890,2415919105:8421376,2684354561:8388610,2952790017:33282,3221225473:514,3489660929:8389120,3758096385:32770,4026531841:0,134217729:8421890,402653185:8421376,671088641:8388608,939524097:512,1207959553:32768,1476395009:8388610,1744830465:2,2013265921:33282,2281701377:32770,2550136833:8389122,2818572289:514,3087007745:8421888,3355443201:8389120,3623878657:0,3892314113:33280,4160749569:8421378},{0:1074282512,16777216:16384,33554432:524288,50331648:1074266128,67108864:1073741840,83886080:1074282496,100663296:1073758208,117440512:16,134217728:540672,150994944:1073758224,167772160:1073741824,184549376:540688,201326592:524304,218103808:0,234881024:16400,251658240:1074266112,8388608:1073758208,25165824:540688,41943040:16,58720256:1073758224,75497472:1074282512,92274688:1073741824,109051904:524288,125829120:1074266128,142606336:524304,159383552:0,176160768:16384,192937984:1074266112,209715200:1073741840,226492416:540672,243269632:1074282496,260046848:16400,268435456:0,285212672:1074266128,301989888:1073758224,318767104:1074282496,335544320:1074266112,352321536:16,369098752:540688,385875968:16384,402653184:16400,419430400:524288,436207616:524304,452984832:1073741840,469762048:540672,486539264:1073758208,503316480:1073741824,520093696:1074282512,276824064:540688,293601280:524288,310378496:1074266112,327155712:16384,343932928:1073758208,360710144:1074282512,377487360:16,394264576:1073741824,411041792:1074282496,427819008:1073741840,444596224:1073758224,461373440:524304,478150656:0,494927872:16400,511705088:1074266128,528482304:540672},{0:260,1048576:0,2097152:67109120,3145728:65796,4194304:65540,5242880:67108868,6291456:67174660,7340032:67174400,8388608:67108864,9437184:67174656,10485760:65792,11534336:67174404,12582912:67109124,13631488:65536,14680064:4,15728640:256,524288:67174656,1572864:67174404,2621440:0,3670016:67109120,4718592:67108868,5767168:65536,6815744:65540,7864320:260,8912896:4,9961472:256,11010048:67174400,12058624:65796,13107200:65792,14155776:67109124,15204352:67174660,16252928:67108864,16777216:67174656,17825792:65540,18874368:65536,19922944:67109120,20971520:256,22020096:67174660,23068672:67108868,24117248:0,25165824:67109124,26214400:67108864,27262976:4,28311552:65792,29360128:67174400,30408704:260,31457280:65796,32505856:67174404,17301504:67108864,18350080:260,19398656:67174656,20447232:0,21495808:65540,22544384:67109120,23592960:256,24641536:67174404,25690112:65536,26738688:67174660,27787264:65796,28835840:67108868,29884416:67109124,30932992:67174400,31981568:4,33030144:65792},{0:2151682048,65536:2147487808,131072:4198464,196608:2151677952,262144:0,327680:4198400,393216:2147483712,458752:4194368,524288:2147483648,589824:4194304,655360:64,720896:2147487744,786432:2151678016,851968:4160,917504:4096,983040:2151682112,32768:2147487808,98304:64,163840:2151678016,229376:2147487744,294912:4198400,360448:2151682112,425984:0,491520:2151677952,557056:4096,622592:2151682048,688128:4194304,753664:4160,819200:2147483648,884736:4194368,950272:4198464,1015808:2147483712,1048576:4194368,1114112:4198400,1179648:2147483712,1245184:0,1310720:4160,1376256:2151678016,1441792:2151682048,1507328:2147487808,1572864:2151682112,1638400:2147483648,1703936:2151677952,1769472:4198464,1835008:2147487744,1900544:4194304,1966080:64,2031616:4096,1081344:2151677952,1146880:2151682112,1212416:0,1277952:4198400,1343488:4194368,1409024:2147483648,1474560:2147487808,1540096:64,1605632:2147483712,1671168:4096,1736704:2147487744,1802240:2151678016,1867776:4160,1933312:2151682048,1998848:4194304,2064384:4198464},{0:128,4096:17039360,8192:262144,12288:536870912,16384:537133184,20480:16777344,24576:553648256,28672:262272,32768:16777216,36864:537133056,40960:536871040,45056:553910400,49152:553910272,53248:0,57344:17039488,61440:553648128,2048:17039488,6144:553648256,10240:128,14336:17039360,18432:262144,22528:537133184,26624:553910272,30720:536870912,34816:537133056,38912:0,43008:553910400,47104:16777344,51200:536871040,55296:553648128,59392:16777216,63488:262272,65536:262144,69632:128,73728:536870912,77824:553648256,81920:16777344,86016:553910272,90112:537133184,94208:16777216,98304:553910400,102400:553648128,106496:17039360,110592:537133056,114688:262272,118784:536871040,122880:0,126976:17039488,67584:553648256,71680:16777216,75776:17039360,79872:537133184,83968:536870912,88064:17039488,92160:128,96256:553910272,100352:262272,104448:553910400,108544:0,112640:553648128,116736:16777344,120832:262144,124928:537133056,129024:536871040},{0:268435464,256:8192,512:270532608,768:270540808,1024:268443648,1280:2097152,1536:2097160,1792:268435456,2048:0,2304:268443656,2560:2105344,2816:8,3072:270532616,3328:2105352,3584:8200,3840:270540800,128:270532608,384:270540808,640:8,896:2097152,1152:2105352,1408:268435464,1664:268443648,1920:8200,2176:2097160,2432:8192,2688:268443656,2944:270532616,3200:0,3456:270540800,3712:2105344,3968:268435456,4096:268443648,4352:270532616,4608:270540808,4864:8200,5120:2097152,5376:268435456,5632:268435464,5888:2105344,6144:2105352,6400:0,6656:8,6912:270532608,7168:8192,7424:268443656,7680:270540800,7936:2097160,4224:8,4480:2105344,4736:2097152,4992:268435464,5248:268443648,5504:8200,5760:270540808,6016:270532608,6272:270540800,6528:270532616,6784:8192,7040:2105352,7296:2097160,7552:0,7808:268435456,8064:268443656},{0:1048576,16:33555457,32:1024,48:1049601,64:34604033,80:0,96:1,112:34603009,128:33555456,144:1048577,160:33554433,176:34604032,192:34603008,208:1025,224:1049600,240:33554432,8:34603009,24:0,40:33555457,56:34604032,72:1048576,88:33554433,104:33554432,120:1025,136:1049601,152:33555456,168:34603008,184:1048577,200:1024,216:34604033,232:1,248:1049600,256:33554432,272:1048576,288:33555457,304:34603009,320:1048577,336:33555456,352:34604032,368:1049601,384:1025,400:34604033,416:1049600,432:1,448:0,464:34603008,480:33554433,496:1024,264:1049600,280:33555457,296:34603009,312:1,328:33554432,344:1048576,360:1025,376:34604032,392:33554433,408:34603008,424:0,440:34604033,456:1049601,472:1024,488:33555456,504:1048577},{0:134219808,1:131072,2:134217728,3:32,4:131104,5:134350880,6:134350848,7:2048,8:134348800,9:134219776,10:133120,11:134348832,12:2080,13:0,14:134217760,15:133152,2147483648:2048,2147483649:134350880,2147483650:134219808,2147483651:134217728,2147483652:134348800,2147483653:133120,2147483654:133152,2147483655:32,2147483656:134217760,2147483657:2080,2147483658:131104,2147483659:134350848,2147483660:0,2147483661:134348832,2147483662:134219776,2147483663:131072,16:133152,17:134350848,18:32,19:2048,20:134219776,21:134217760,22:134348832,23:131072,24:0,25:131104,26:134348800,27:134219808,28:134350880,29:133120,30:2080,31:134217728,2147483664:131072,2147483665:2048,2147483666:134348832,2147483667:133152,2147483668:32,2147483669:134348800,2147483670:134217728,2147483671:134219808,2147483672:134350880,2147483673:134217760,2147483674:134219776,2147483675:0,2147483676:133120,2147483677:2080,2147483678:131104,2147483679:134350848}],h=[4160749569,528482304,33030144,2064384,129024,8064,504,2147483679],l=n.DES=i.extend({_doReset:function(){for(var t=this._key.words,e=[],r=0;r<56;r++){var i=o[r]-1;e[r]=t[i>>>5]>>>31-i%32&1}for(var n=this._subKeys=[],a=0;a<16;a++){var h=n[a]=[],l=c[a];for(r=0;r<24;r++)h[r/6|0]|=e[(s[r]-1+l)%28]<<31-r%6,h[4+(r/6|0)]|=e[28+(s[r+24]-1+l)%28]<<31-r%6;for(h[0]=h[0]<<1|h[0]>>>31,r=1;r<7;r++)h[r]=h[r]>>>4*(r-1)+3;h[7]=h[7]<<5|h[7]>>>27}var f=this._invSubKeys=[];for(r=0;r<16;r++)f[r]=n[15-r]},encryptBlock:function(t,e){this._doCryptBlock(t,e,this._subKeys)},decryptBlock:function(t,e){this._doCryptBlock(t,e,this._invSubKeys)},_doCryptBlock:function(t,e,r){this._lBlock=t[e],this._rBlock=t[e+1],f.call(this,4,252645135),f.call(this,16,65535),d.call(this,2,858993459),d.call(this,8,16711935),f.call(this,1,1431655765);for(var i=0;i<16;i++){for(var n=r[i],o=this._lBlock,s=this._rBlock,c=0,l=0;l<8;l++)c|=a[l][((s^n[l])&h[l])>>>0];this._lBlock=s,this._rBlock=o^c}var u=this._lBlock;this._lBlock=this._rBlock,this._rBlock=u,f.call(this,1,1431655765),d.call(this,8,16711935),d.call(this,2,858993459),f.call(this,16,65535),f.call(this,4,252645135),t[e]=this._lBlock,t[e+1]=this._rBlock},keySize:2,ivSize:2,blockSize:2});function f(t,e){var r=(this._lBlock>>>t^this._rBlock)&e;this._rBlock^=r,this._lBlock^=r<<t}function d(t,e){var r=(this._rBlock>>>t^this._lBlock)&e;this._lBlock^=r,this._rBlock^=r<<t}t.DES=i._createHelper(l);var u=n.TripleDES=i.extend({_doReset:function(){var t=this._key.words;if(2!==t.length&&4!==t.length&&t.length<6)throw new Error("Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192.");var e=t.slice(0,2),i=t.length<4?t.slice(0,2):t.slice(2,4),n=t.length<6?t.slice(0,2):t.slice(4,6);this._des1=l.createEncryptor(r.create(e)),this._des2=l.createEncryptor(r.create(i)),this._des3=l.createEncryptor(r.create(n))},encryptBlock:function(t,e){this._des1.encryptBlock(t,e),this._des2.decryptBlock(t,e),this._des3.encryptBlock(t,e)},decryptBlock:function(t,e){this._des3.decryptBlock(t,e),this._des2.encryptBlock(t,e),this._des1.decryptBlock(t,e)},keySize:6,ivSize:2,blockSize:2});t.TripleDES=i._createHelper(u)}(),function(){var t=mt,e=t.lib.StreamCipher,r=t.algo,i=r.RC4=e.extend({_doReset:function(){for(var t=this._key,e=t.words,r=t.sigBytes,i=this._S=[],n=0;n<256;n++)i[n]=n;n=0;for(var o=0;n<256;n++){var s=n%r,c=e[s>>>2]>>>24-s%4*8&255;o=(o+i[n]+c)%256;var a=i[n];i[n]=i[o],i[o]=a}this._i=this._j=0},_doProcessBlock:function(t,e){t[e]^=n.call(this)},keySize:8,ivSize:0});function n(){for(var t=this._S,e=this._i,r=this._j,i=0,n=0;n<4;n++){r=(r+t[e=(e+1)%256])%256;var o=t[e];t[e]=t[r],t[r]=o,i|=t[(t[e]+t[r])%256]<<24-8*n}return this._i=e,this._j=r,i}t.RC4=e._createHelper(i);var o=r.RC4Drop=i.extend({cfg:i.cfg.extend({drop:192}),_doReset:function(){i._doReset.call(this);for(var t=this.cfg.drop;0<t;t--)n.call(this)}});t.RC4Drop=e._createHelper(o)}(),mt.mode.CTRGladman=(st=(ot=mt.lib.BlockCipherMode.extend()).Encryptor=ot.extend({processBlock:function(t,e){var r,i=this._cipher,n=i.blockSize,o=this._iv,s=this._counter;o&&(s=this._counter=o.slice(0),this._iv=void 0),0===((r=s)[0]=Et(r[0]))&&(r[1]=Et(r[1]));var c=s.slice(0);i.encryptBlock(c,0);for(var a=0;a<n;a++)t[e+a]^=c[a]}}),ot.Decryptor=st,ot),at=(ct=mt).lib.StreamCipher,ht=ct.algo,lt=[],ft=[],dt=[],ut=ht.Rabbit=at.extend({_doReset:function(){for(var t=this._key.words,e=this.cfg.iv,r=0;r<4;r++)t[r]=16711935&(t[r]<<8|t[r]>>>24)|4278255360&(t[r]<<24|t[r]>>>8);var i=this._X=[t[0],t[3]<<16|t[2]>>>16,t[1],t[0]<<16|t[3]>>>16,t[2],t[1]<<16|t[0]>>>16,t[3],t[2]<<16|t[1]>>>16],n=this._C=[t[2]<<16|t[2]>>>16,4294901760&t[0]|65535&t[1],t[3]<<16|t[3]>>>16,4294901760&t[1]|65535&t[2],t[0]<<16|t[0]>>>16,4294901760&t[2]|65535&t[3],t[1]<<16|t[1]>>>16,4294901760&t[3]|65535&t[0]];for(r=this._b=0;r<4;r++)Rt.call(this);for(r=0;r<8;r++)n[r]^=i[r+4&7];if(e){var o=e.words,s=o[0],c=o[1],a=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8),h=16711935&(c<<8|c>>>24)|4278255360&(c<<24|c>>>8),l=a>>>16|4294901760&h,f=h<<16|65535&a;for(n[0]^=a,n[1]^=l,n[2]^=h,n[3]^=f,n[4]^=a,n[5]^=l,n[6]^=h,n[7]^=f,r=0;r<4;r++)Rt.call(this)}},_doProcessBlock:function(t,e){var r=this._X;Rt.call(this),lt[0]=r[0]^r[5]>>>16^r[3]<<16,lt[1]=r[2]^r[7]>>>16^r[5]<<16,lt[2]=r[4]^r[1]>>>16^r[7]<<16,lt[3]=r[6]^r[3]>>>16^r[1]<<16;for(var i=0;i<4;i++)lt[i]=16711935&(lt[i]<<8|lt[i]>>>24)|4278255360&(lt[i]<<24|lt[i]>>>8),t[e+i]^=lt[i]},blockSize:4,ivSize:2}),ct.Rabbit=at._createHelper(ut),mt.mode.CTR=(_t=(pt=mt.lib.BlockCipherMode.extend()).Encryptor=pt.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize,n=this._iv,o=this._counter;n&&(o=this._counter=n.slice(0),this._iv=void 0);var s=o.slice(0);r.encryptBlock(s,0),o[i-1]=o[i-1]+1|0;for(var c=0;c<i;c++)t[e+c]^=s[c]}}),pt.Decryptor=_t,pt),yt=(vt=mt).lib.StreamCipher,gt=vt.algo,Bt=[],wt=[],kt=[],St=gt.RabbitLegacy=yt.extend({_doReset:function(){for(var t=this._key.words,e=this.cfg.iv,r=this._X=[t[0],t[3]<<16|t[2]>>>16,t[1],t[0]<<16|t[3]>>>16,t[2],t[1]<<16|t[0]>>>16,t[3],t[2]<<16|t[1]>>>16],i=this._C=[t[2]<<16|t[2]>>>16,4294901760&t[0]|65535&t[1],t[3]<<16|t[3]>>>16,4294901760&t[1]|65535&t[2],t[0]<<16|t[0]>>>16,4294901760&t[2]|65535&t[3],t[1]<<16|t[1]>>>16,4294901760&t[3]|65535&t[0]],n=this._b=0;n<4;n++)Mt.call(this);for(n=0;n<8;n++)i[n]^=r[n+4&7];if(e){var o=e.words,s=o[0],c=o[1],a=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8),h=16711935&(c<<8|c>>>24)|4278255360&(c<<24|c>>>8),l=a>>>16|4294901760&h,f=h<<16|65535&a;for(i[0]^=a,i[1]^=l,i[2]^=h,i[3]^=f,i[4]^=a,i[5]^=l,i[6]^=h,i[7]^=f,n=0;n<4;n++)Mt.call(this)}},_doProcessBlock:function(t,e){var r=this._X;Mt.call(this),Bt[0]=r[0]^r[5]>>>16^r[3]<<16,Bt[1]=r[2]^r[7]>>>16^r[5]<<16,Bt[2]=r[4]^r[1]>>>16^r[7]<<16,Bt[3]=r[6]^r[3]>>>16^r[1]<<16;for(var i=0;i<4;i++)Bt[i]=16711935&(Bt[i]<<8|Bt[i]>>>24)|4278255360&(Bt[i]<<24|Bt[i]>>>8),t[e+i]^=Bt[i]},blockSize:4,ivSize:2}),vt.RabbitLegacy=yt._createHelper(St),mt.pad.ZeroPadding={pad:function(t,e){var r=4*e;t.clamp(),t.sigBytes+=r-(t.sigBytes%r||r)},unpad:function(t){var e=t.words,r=t.sigBytes-1;for(r=t.sigBytes-1;0<=r;r--)if(e[r>>>2]>>>24-r%4*8&255){t.sigBytes=r+1;break}}},mt});
}


function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:i,...r}=t;this.got[s](i,r).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}put(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"put";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:i,...r}=t;this.got[s](i,r).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}

