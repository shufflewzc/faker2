/*
“七”待已久，“夕”望你来
*/
const $ = new Env("“七”待已久，“夕”望你来");
const jdCookieNode = $.isNode() ? require("./jdCookie.js") : "";
const notify = $.isNode() ? require("./sendNotify") : "";
let cookiesArr = [], cookie = "", message = "";
let ownCode = null;
let authorCodeList = [];
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item]);
  });
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === "false") console.log = () => {};
} else {
  let cookiesData = $.getdata("CookiesJD") || "[]";
  cookiesData = JSON.parse(cookiesData);
  cookiesArr = cookiesData.map((item) => item.cookie);
  cookiesArr.reverse();
  cookiesArr.push(...[$.getdata("CookieJD2"), $.getdata("CookieJD")]);
  cookiesArr.reverse();
  cookiesArr = cookiesArr.filter((item) => !!item);
}
!(async () => {
  $.getAuthorCodeListerr = false;
  if (!cookiesArr[0]) {
    $.msg($.name, "【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取", "https://bean.m.jd.com/bean/signIndex.action", { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
    return;
  }
  // authorCodeList = await getAuthorCodeList('https://gitee.com/fatelight/code/raw/master/lzdz112.json')
  // if ($.getAuthorCodeListerr === false) {
  //     authorCodeList = [
  //         '917746a95cae46618c8f6b0ff55dfbc2',
  //     ]
  // }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      originCookie = cookiesArr[i];
      newCookie = "";
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1]);
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = "";
      await checkCookie();
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
        // if ($.isNode()) {
        //     await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        // }
        continue;
      }
      $.bean = 0;
      $.ADID = getUUID("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", 1);
      $.UUID = getUUID("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
      authorCodeList = [
        'a944fc3b436741718bda3115f7a81e7f',
        // '60ec3454bd4e44c6b39431f602161729',
        // '99a10aa547ae425f8245479a3f6cc680',
      ];
      // $.authorCode = authorCodeList[random(0, authorCodeList.length)];
      $.authorCode = ownCode ? ownCode : authorCodeList[random(0, authorCodeList.length)]
      $.authorNum = `${random(1000000, 9999999)}`;
      $.randomCode = random(1000000, 9999999);
      $.activityId = "e6fc50c7dcc34c99bf5cca76c8c6468e";
      $.activityShopId = "1000164941";
      $.activityUrl = `https://lzdz1-isv.isvjcloud.com/dingzhi/joinCommon/activity/${$.authorNum}?activityId=${$.activityId}&shareUuid=${encodeURIComponent($.authorCode)}&adsource=&shareuserid4minipg=${encodeURIComponent($.secretPin)}&shopid=1000004065&lng=00.000000&lat=00.000000&sid=&un_area=`;
      await member();
      // await $.wait(1000);
      if ($.bean > 0) {
        message += `\n【京东账号${$.index}】${$.nickName || $.UserName} \n       └ 获得 ${$.bean} 京豆。`;
      }
    }
  }
  if (message !== "") {
    if ($.isNode()) {
      await notify.sendNotify($.name, message, "", `\n`);
    } else {
      $.msg($.name, "有点儿收获", message);
    }
  }
})()
  .catch((e) => {
    $.log("", `❌ ${$.name}, 失败! 原因: ${e}!`, "");
  })
  .finally(() => {
    $.done();
  });

async function member() {
  $.token = null;
  $.secretPin = null;
  $.openCardActivityId = null;
  $.addScore = 1
  lz_cookie = {};
  await getFirstLZCK();
  await getToken();
  await task("dz/common/getSimpleActInfoVo", `activityId=${$.activityId}`, 1);
  if ($.token) {
    await getMyPing();
    if ($.secretPin) {
      console.log("去助力 -> " + $.authorCode);
      // console.log(cookie)
      await task("common/accessLogWithAD", `venderId=${$.activityShopId}&code=99&pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}&pageUrl=${$.activityUrl}&subType=app&adSource=`, 1);
      // await task("wxActionCommon/getUserInfo", `pin=${encodeURIComponent($.secretPin)}`, 1);
      if ($.index === 1) {
        await task("joinCommon/activityContent", `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&pinImg=&nick=${encodeURIComponent($.pin)}&cjyxPin=&cjhyPin=&shareUuid=${encodeURIComponent($.authorCode)}`, 0, 1);
      } else {
        await task("joinCommon/activityContent", `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&pinImg=&nick=${encodeURIComponent($.pin)}&cjyxPin=&cjhyPin=&shareUuid=${encodeURIComponent($.authorCode)}`);
      }
      $.log("关注店铺");
      await task("joinCommon/doTask", `activityId=${$.activityId}&uuid=${$.actorUuid}&pin=${encodeURIComponent($.secretPin)}&taskType=20&taskValue=`);
      await $.wait(500);
      await task("joinCommon/doTask", `activityId=${$.activityId}&uuid=${$.actorUuid}&pin=${encodeURIComponent($.secretPin)}&taskType=23&taskValue=`);
      await $.wait(500);
      await task("joinCommon/taskInfo", `pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}`);
      $.log("加入店铺会员");
      if ($.openCardList) {
        for (const vo of $.openCardList) {
          // console.log(vo)
          $.log(`>>> 去加入${vo.name} ${vo.value}`);
          // await task("crm/pageVisit/insertCrmPageVisit", `venderId=1000000576&elementId=入会跳转&pageId=dzlhkk068d4d0ab8a6609723002f50&pin=${encodeURIComponent($.secretPin)}`, 1);
          // await $.wait(500);
          // await getFirstLZCK();
          // await getToken();
          await getShopOpenCardInfo({ venderId: `${vo.value}`, channel: "401" }, vo.value);
          // console.log($.openCardActivityId)
          await bindWithVender({ venderId: `${vo.value}`, bindByVerifyCodeFlag: 1, registerExtend: {}, writeChildFlag: 0, activityId: 2329491, channel: 401 }, vo.value);
          // await $.wait(500);
        }
      } else {
        $.log("没有获取到对应的任务。\n");
      }
      // await task("joinCommon/taskInfo", `pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}`);
      // await task("joinCommon/activityContent", `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&pinImg=&nick=${encodeURIComponent($.pin)}&cjyxPin=&cjhyPin=&shareUuid=${encodeURIComponent($.authorCode)}`, 0, 1);
      console.log("去助力 -> " + $.authorCode);
      // // await task("joinCommon/assist/status", `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&uuid=${$.actorUuid}&shareUuid=${$.authorCode}`);
      await task("joinCommon/assist", `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&uuid=${$.actorUuid}&shareUuid=${$.authorCode}`);
      // await task('linkgame/help/list', `pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}`)

      // await task('linkgame/task/info', `pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}`)
      // console.log('任务 -> ')
      // await $.wait(2000)
      // await task('opencard/addCart', `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}`);
      // await $.wait(2000)
      // await task('linkgame/sendAllCoupon', `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}`);
      // await getFirstLZCK()
      // await getToken();
      // console.log('抽奖 -> ')
      // await $.wait(2000)
      await task('joinCommon/startDraw', `activityId=${$.activityId}&uuid=${$.actorUuid}&pin=${encodeURIComponent($.secretPin)}`);
      // console.log('100 -> ')
      // await getFirstLZCK()
      // await getToken();
      // await $.wait(2000)
      // await task('linkgame/draw/record', `activityId=${$.activityId}&actorUuid=${$.actorUuid}&pin=${encodeURIComponent($.secretPin)}`);
    }
  }
}

function task(function_id, body, isCommon = 0, own = 0) {
  return new Promise((resolve) => {
    $.post(taskUrl(function_id, body, isCommon), async (err, resp, data) => {
      try {
        if (err) {
          $.log(err);
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data.result) {
              switch (function_id) {
                case "dz/common/getSimpleActInfoVo":
                  $.jdActivityId = data.data.jdActivityId;
                  $.venderId = data.data.venderId;
                  $.activityType = data.data.activityType;
                  // console.log($.venderId)
                  break;
                case "wxActionCommon/getUserInfo":
                  break;
                case "joinCommon/activityContent":
                  if (!data.data.hasEnd) {
                    $.log(`开启【${data.data.activityName}】活动`);
                    $.log("-------------------");
                    if ($.index === 1) {
                      ownCode = data.data.actorInfo["uuid"];
                      console.log(ownCode);
                    }
                    $.actorUuid = data.data.actorInfo["uuid"];
                  } else {
                    $.log("活动已经结束");
                  }
                  break;
                case "joinCommon/taskInfo":
                  $.openCardList = data.data['1']['settingInfo'];
                  $.openCardStatus = data.data;
                  // console.log($.openCardList)
                  break;
                case "joinCommon/startDraw":
                  console.log(data);
                  if (data.data) {
                    $.addScore = data.data.addScore 
                  }
                  break;
                case "linkgame/sign":
                  console.log(data);
                  break;
                case "opencard/addCart":
                  if (data.data) {
                    console.log(data.data);
                  }
                  break;
                case "linkgame/sendAllCoupon":
                  if (data.data) {
                    console.log(data.data);
                  }

                  break;
                case "interaction/write/writePersonInfo":
                  console.log(data);
                  break;
                case "linkgame/draw":
                  console.log(data);
                  break;
                case "linkgame/draw/record":
                  console.log(data.data);
                  break;
                case "joinCommon/assist/status":
                  $.log(JSON.stringify(data));
                  break;
                case "joinCommon/assist":
                  $.log(JSON.stringify(data));
                  break;
                case "opencard/help/list":
                  $.log(JSON.stringify(data));
                  break;
                default:
                  // $.log(JSON.stringify(data))
                  break;
              }
            } else {
              // $.log(JSON.stringify(data))
            }
          } else {
            // $.log("京东没有返回数据")
          }
        }
      } catch (error) {
        $.log(error);
      } finally {
        resolve();
      }
    });
  });
}
function taskaccessLog(function_id, body, isCommon = 0) {
  return new Promise((resolve) => {
    $.post(taskUrl(function_id, body, isCommon), async (err, resp, data) => {
      try {
        if (err) {
          $.log(err);
        } else {
          // console.log(resp);
          if (resp["headers"]["set-cookie"]) {
            cookie = `${originCookie};`;
            for (let sk of resp["headers"]["set-cookie"]) {
              lz_cookie[sk.split(";")[0].substr(0, sk.split(";")[0].indexOf("="))] = sk.split(";")[0].substr(sk.split(";")[0].indexOf("=") + 1);
            }
            for (const vo of Object.keys(lz_cookie)) {
              cookie += vo + "=" + lz_cookie[vo] + ";";
            }
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        resolve();
      }
    });
  });
}

function getAuthorCodeList(url) {
  return new Promise((resolve) => {
    const options = {
      url: `${url}?${new Date()}`,
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88",
      },
    };
    $.get(options, async (err, resp, data) => {
      try {
        if (err) {
          // $.log(err)
          $.getAuthorCodeListerr = false;
        } else {
          if (data) data = JSON.parse(data);
          $.getAuthorCodeListerr = true;
        }
      } catch (e) {
        $.logErr(e, resp);
        data = null;
      } finally {
        resolve(data);
      }
    });
  });
}

function taskUrl(function_id, body, isCommon) {
  return {
    url: isCommon ? `https://lzdz1-isv.isvjcloud.com/${function_id}` : `https://lzdz1-isv.isvjcloud.com/dingzhi/${function_id}`,
    headers: {
      Host: "lzdz1-isv.isvjcloud.com",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "Accept-Language": "zh-cn",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: "https://lzdz1-isv.isvjcloud.com",
      "User-Agent": `jdapp;iPhone;9.5.4;13.6;${$.UUID};network/wifi;ADID/${$.ADID};model/iPhone10,3;addressid/0;appBuild/167668;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
      Connection: "keep-alive",
      Referer: $.activityUrl,
      Cookie: cookie,
    },
    body: body,
  };
}

function getMyPing() {
  let opt = {
    url: `https://lzdz1-isv.isvjcloud.com/customer/getMyPing`,
    headers: {
      Host: "lzdz1-isv.isvjcloud.com",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "Accept-Language": "zh-cn",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: "https://lzdz1-isv.isvjcloud.com",
      "User-Agent": `jdapp;iPhone;9.5.4;13.6;${$.UUID};network/wifi;ADID/${$.ADID};model/iPhone10,3;addressid/0;appBuild/167668;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
      Connection: "keep-alive",
      Referer: $.activityUrl,
      Cookie: cookie,
    },
    body: `userId=${$.activityShopId}&token=${$.token}&fromType=APP&riskType=1`,
  };
  return new Promise((resolve) => {
    $.post(opt, (err, resp, data) => {
      try {
        if (err) {
          $.log(err);
        } else {
          if (resp["headers"]["set-cookie"]) {
            cookie = `${originCookie}`;
            if ($.isNode()) {
              for (let sk of resp["headers"]["set-cookie"]) {
                cookie = `${cookie}${sk.split(";")[0]};`;
              }
            } else {
              for (let ck of resp["headers"]["Set-Cookie"].split(",")) {
                cookie = `${cookie}${ck.split(";")[0]};`;
              }
            }
          }
          if (resp["headers"]["Set-Cookie"]) {
            cookie = `${originCookie}`;
            if ($.isNode()) {
              for (let sk of resp["headers"]["set-cookie"]) {
                cookie = `${cookie}${sk.split(";")[0]};`;
              }
            } else {
              for (let ck of resp["headers"]["Set-Cookie"].split(",")) {
                cookie = `${cookie}${ck.split(";")[0]};`;
              }
            }
          }
          if (data) {
            data = JSON.parse(data);
            if (data.result) {
              $.log(`你好：${data.data.nickname}`);
              $.pin = data.data.nickname;
              $.secretPin = data.data.secretPin;
              cookie = `${cookie};AUTH_C_USER=${data.data.secretPin}`;
            } else {
              $.log(data.errorMessage);
            }
          } else {
            $.log("京东返回了空数据");
          }
        }
      } catch (error) {
        $.log(error);
      } finally {
        resolve();
      }
    });
  });
}
function getFirstLZCK() {
  return new Promise((resolve) => {
    $.get(
      {
        url: $.activityUrl,
        headers: {
          "user-agent": $.isNode() ? process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : require("./USER_AGENTS").USER_AGENT : $.getdata("JDUA") ? $.getdata("JDUA") : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
        },
      },
      (err, resp, data) => {
        try {
          if (err) {
            console.log(err);
          } else {
            if (resp["headers"]["set-cookie"]) {
              cookie = `${originCookie}`;
              if ($.isNode()) {
                for (let sk of resp["headers"]["set-cookie"]) {
                  cookie = `${cookie}${sk.split(";")[0]};`;
                }
              } else {
                for (let ck of resp["headers"]["Set-Cookie"].split(",")) {
                  cookie = `${cookie}${ck.split(";")[0]};`;
                }
              }
            }
            if (resp["headers"]["Set-Cookie"]) {
              cookie = `${originCookie}`;
              if ($.isNode()) {
                for (let sk of resp["headers"]["set-cookie"]) {
                  cookie = `${cookie}${sk.split(";")[0]};`;
                }
              } else {
                for (let ck of resp["headers"]["Set-Cookie"].split(",")) {
                  cookie = `${cookie}${ck.split(";")[0]};`;
                }
              }
            }
            $.cookie = cookie
          }
        } catch (error) {
          console.log(error);
        } finally {
          resolve();
        }
      }
    );
  });
}
function getToken() {
  let opt = {
    url: `https://api.m.jd.com/client.action?functionId=isvObfuscator`,
    headers: {
      Host: "api.m.jd.com",
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "*/*",
      Connection: "keep-alive",
      Cookie: cookie,
      "User-Agent": "JD4iPhone/167650 (iPhone; iOS 13.7; Scale/3.00)",
      "Accept-Language": "zh-Hans-CN;q=1",
      "Accept-Encoding": "gzip, deflate, br",
    },
    body: `body=%7B%22url%22%3A%20%22https%3A//lzkj-isv.isvjcloud.com%22%2C%20%22id%22%3A%20%22%22%7D&uuid=hjudwgohxzVu96krv&client=apple&clientVersion=9.4.0&st=1620476162000&sv=111&sign=f9d1b7e3b943b6a136d54fe4f892af05`,
  };
  return new Promise((resolve) => {
    $.post(opt, (err, resp, data) => {
      try {
        if (err) {
          $.log(err);
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data.code === "0") {
              $.token = data.token;
            }
          } else {
            $.log("京东返回了空数据");
          }
        }
      } catch (error) {
        $.log(error);
      } finally {
        resolve();
      }
    });
  });
}
function random(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function getUUID(format = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", UpperCase = 0) {
  return format.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    if (UpperCase) {
      uuid = v.toString(36).toUpperCase();
    } else {
      uuid = v.toString(36);
    }
    return uuid;
  });
}
function checkCookie() {
  const options = {
    url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
    headers: {
      Host: "me-api.jd.com",
      Accept: "*/*",
      Connection: "keep-alive",
      Cookie: cookie,
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Mobile/15E148 Safari/604.1",
      "Accept-Language": "zh-cn",
      Referer: "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
      "Accept-Encoding": "gzip, deflate, br",
    },
  };
  return new Promise((resolve) => {
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          $.logErr(err);
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data.retcode === "1001") {
              $.isLogin = false; //cookie过期
              return;
            }
            if (data.retcode === "0" && data.data.hasOwnProperty("userInfo")) {
              $.nickName = data.data.userInfo.baseInfo.nickname;
            }
          } else {
            $.log("京东返回了空数据");
          }
        }
      } catch (e) {
        $.logErr(e);
      } finally {
        resolve();
      }
    });
  });
}
// prettier-ignore
var _0xod7='jsjiami.com.v6',_0xod7_=['‮_0xod7'],_0x1acd=[_0xod7,'\x53\x33\x4a\x54\x56\x32\x4d\x3d','\x54\x47\x4e\x4c\x62\x6e\x6b\x3d','\x62\x47\x39\x6e','\x63\x47\x46\x79\x63\x32\x55\x3d','\x63\x33\x56\x6a\x59\x32\x56\x7a\x63\x77\x3d\x3d','\x63\x6d\x56\x7a\x64\x57\x78\x30','\x61\x57\x35\x30\x5a\x58\x4a\x6c\x63\x33\x52\x7a\x55\x6e\x56\x73\x5a\x55\x78\x70\x63\x33\x51\x3d','\x62\x33\x42\x6c\x62\x6b\x4e\x68\x63\x6d\x52\x42\x59\x33\x52\x70\x64\x6d\x6c\x30\x65\x55\x6c\x6b','\x61\x57\x35\x30\x5a\x58\x4a\x6c\x63\x33\x52\x7a\x53\x57\x35\x6d\x62\x77\x3d\x3d','\x59\x57\x4e\x30\x61\x58\x5a\x70\x64\x48\x6c\x4a\x5a\x41\x3d\x3d','\x56\x45\x56\x4a\x59\x57\x38\x3d','\x55\x6d\x78\x6d\x59\x32\x4d\x3d','\x63\x45\x39\x31\x52\x6b\x4d\x3d','\x64\x6e\x5a\x75\x57\x45\x4d\x3d','\x62\x33\x64\x32\x5a\x47\x55\x3d','\x59\x33\x70\x4b\x62\x47\x67\x3d','\x51\x55\x64\x59\x59\x30\x6b\x3d','\x54\x30\x4a\x58\x55\x45\x59\x3d','\x56\x57\x6c\x55\x51\x33\x63\x3d','\x59\x6d\x6c\x75\x5a\x46\x64\x70\x64\x47\x68\x57\x5a\x57\x35\x6b\x5a\x58\x49\x3d','\x52\x57\x52\x36\x62\x57\x67\x3d','\x55\x48\x56\x58\x62\x6b\x59\x3d','\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x68\x63\x47\x6b\x75\x62\x53\x35\x71\x5a\x43\x35\x6a\x62\x32\x30\x76\x59\x32\x78\x70\x5a\x57\x35\x30\x4c\x6d\x46\x6a\x64\x47\x6c\x76\x62\x6a\x38\x3d','\x52\x33\x5a\x75\x55\x6c\x55\x3d','\x52\x6c\x5a\x71\x53\x30\x55\x3d','\x56\x47\x35\x69\x63\x30\x73\x3d','\x61\x6e\x6c\x47\x54\x31\x41\x3d','\x66\x53\x5a\x6a\x61\x47\x46\x75\x62\x6d\x56\x73\x50\x54\x51\x77\x4d\x53\x5a\x79\x5a\x58\x52\x31\x63\x6d\x35\x56\x63\x6d\x77\x39','\x59\x55\x78\x36\x61\x31\x63\x3d','\x56\x6d\x74\x75\x62\x33\x51\x3d','\x54\x56\x6c\x6f\x54\x45\x4d\x3d','\x62\x58\x64\x34\x52\x47\x30\x3d','\x65\x6c\x5a\x70\x59\x57\x34\x3d','\x52\x55\x46\x4a\x51\x6b\x45\x3d','\x53\x57\x70\x7a\x59\x6b\x6f\x3d','\x56\x55\x74\x79\x61\x46\x55\x3d','\x56\x32\x74\x69\x53\x45\x77\x3d','\x54\x46\x4a\x49\x61\x6b\x77\x3d','\x54\x30\x4e\x44\x54\x6e\x63\x3d','\x56\x31\x70\x7a\x57\x56\x6f\x3d','\x56\x33\x4e\x72\x63\x48\x67\x3d','\x61\x56\x42\x6b\x5a\x58\x67\x3d','\x51\x6e\x64\x6c\x55\x31\x63\x3d','\x65\x57\x35\x5a\x63\x58\x49\x3d','\x63\x47\x74\x50\x64\x58\x4d\x3d','\x57\x6d\x56\x5a\x62\x6c\x67\x3d','\x61\x56\x68\x4e\x54\x33\x6b\x3d','\x62\x56\x5a\x33\x65\x56\x67\x3d','\x55\x47\x4a\x50\x51\x55\x49\x3d','\x54\x33\x68\x74\x56\x57\x59\x3d','\x62\x55\x31\x52\x61\x33\x59\x3d','\x53\x57\x4a\x45\x62\x56\x45\x3d','\x59\x6d\x6c\x75\x5a\x46\x64\x70\x64\x47\x68\x57\x5a\x57\x35\x6b\x5a\x58\x4a\x74\x5a\x58\x4e\x7a\x59\x57\x64\x6c','\x62\x57\x56\x7a\x63\x32\x46\x6e\x5a\x51\x3d\x3d','\x5a\x57\x35\x32','\x55\x30\x6c\x48\x54\x6c\x39\x56\x55\x6b\x77\x3d','\x59\x6d\x52\x6e\x63\x30\x30\x3d','\x57\x6b\x74\x34\x53\x6b\x34\x3d','\x59\x30\x56\x51\x63\x6d\x4d\x3d','\x65\x45\x64\x72\x54\x47\x38\x3d','\x5a\x45\x74\x57\x64\x6d\x67\x3d','\x51\x58\x68\x73\x63\x6d\x6f\x3d','\x4f\x47\x46\x6b\x5a\x6d\x49\x3d','\x61\x6d\x52\x66\x63\x32\x68\x76\x63\x46\x39\x74\x5a\x57\x31\x69\x5a\x58\x49\x3d','\x4f\x53\x34\x79\x4c\x6a\x41\x3d','\x61\x6d\x52\x7a\x61\x57\x64\x75\x4c\x6d\x4e\x6d','\x59\x58\x42\x77\x62\x47\x6c\x6a\x59\x58\x52\x70\x62\x32\x34\x76\x61\x6e\x4e\x76\x62\x67\x3d\x3d','\x64\x6c\x6c\x43\x5a\x45\x67\x3d','\x51\x6b\x31\x47\x61\x33\x6b\x3d','\x61\x58\x56\x36\x61\x31\x45\x3d','\x5a\x30\x68\x33\x52\x58\x6f\x3d','\x55\x32\x56\x4d\x52\x6e\x45\x3d','\x52\x57\x35\x59\x65\x6c\x6b\x3d','\x55\x48\x70\x34\x63\x55\x67\x3d','\x54\x6c\x52\x42\x55\x56\x41\x3d','\x61\x30\x56\x78\x65\x6e\x45\x3d','\x61\x6c\x5a\x59\x63\x48\x45\x3d','\x51\x57\x31\x4f\x63\x6b\x6b\x3d','\x63\x57\x6c\x43\x64\x32\x63\x3d','\x5a\x6d\x78\x76\x62\x33\x49\x3d','\x62\x46\x6c\x57\x65\x47\x73\x3d','\x63\x6d\x46\x75\x5a\x47\x39\x74','\x62\x47\x56\x75\x5a\x33\x52\x6f','\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x6a\x5a\x47\x34\x75\x62\x6e\x6f\x75\x62\x48\x55\x76\x5a\x32\x56\x30\x61\x44\x56\x7a\x64\x41\x3d\x3d','\x52\x47\x5a\x61\x62\x32\x67\x3d','\x57\x45\x4e\x36\x62\x6e\x59\x3d','\x63\x47\x39\x7a\x64\x41\x3d\x3d','\x53\x6b\x64\x4a\x53\x6b\x6f\x3d','\x59\x30\x78\x31\x57\x56\x63\x3d','\x53\x6d\x56\x74\x64\x6b\x67\x3d','\x56\x46\x4e\x6c\x59\x55\x59\x3d','\x5a\x6c\x64\x6d\x54\x31\x51\x3d','\x59\x58\x42\x77\x62\x48\x6b\x3d','\x65\x6b\x39\x49\x64\x45\x67\x3d','\x56\x46\x70\x75\x51\x6d\x6f\x3d','\x62\x47\x39\x6e\x52\x58\x4a\x79','\x61\x30\x64\x42\x55\x55\x51\x3d','\x56\x46\x6c\x48\x57\x48\x6f\x3d','\x59\x58\x42\x70\x4c\x6d\x30\x75\x61\x6d\x51\x75\x59\x32\x39\x74','\x4b\x69\x38\x71','\x61\x32\x56\x6c\x63\x43\x31\x68\x62\x47\x6c\x32\x5a\x51\x3d\x3d','\x65\x6d\x67\x74\x59\x32\x34\x3d','\x5a\x33\x70\x70\x63\x43\x77\x67\x5a\x47\x56\x6d\x62\x47\x46\x30\x5a\x53\x77\x67\x59\x6e\x49\x3d','\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x68\x63\x47\x6b\x75\x62\x53\x35\x71\x5a\x43\x35\x6a\x62\x32\x30\x76\x59\x32\x78\x70\x5a\x57\x35\x30\x4c\x6d\x46\x6a\x64\x47\x6c\x76\x62\x6a\x39\x68\x63\x48\x42\x70\x5a\x44\x31\x71\x5a\x46\x39\x7a\x61\x47\x39\x77\x58\x32\x31\x6c\x62\x57\x4a\x6c\x63\x69\x5a\x6d\x64\x57\x35\x6a\x64\x47\x6c\x76\x62\x6b\x6c\x6b\x50\x57\x64\x6c\x64\x46\x4e\x6f\x62\x33\x42\x50\x63\x47\x56\x75\x51\x32\x46\x79\x5a\x45\x6c\x75\x5a\x6d\x38\x6d\x59\x6d\x39\x6b\x65\x54\x30\x3d','\x65\x47\x52\x75\x51\x6c\x49\x3d','\x63\x33\x52\x79\x61\x57\x35\x6e\x61\x57\x5a\x35','\x4a\x6d\x4e\x73\x61\x57\x56\x75\x64\x44\x31\x49\x4e\x53\x5a\x6a\x62\x47\x6c\x6c\x62\x6e\x52\x57\x5a\x58\x4a\x7a\x61\x57\x39\x75\x50\x54\x6b\x75\x4d\x69\x34\x77\x4a\x6e\x56\x31\x61\x57\x51\x39\x4f\x44\x67\x34\x4f\x44\x67\x3d','\x55\x6b\x70\x46\x55\x33\x6f\x3d','\x62\x48\x5a\x6c\x64\x6e\x67\x3d','\x59\x31\x68\x71\x63\x6e\x41\x3d','\x61\x6d\x52\x68\x63\x48\x41\x37\x61\x56\x42\x6f\x62\x32\x35\x6c\x4f\x7a\x6b\x75\x4e\x53\x34\x30\x4f\x7a\x45\x7a\x4c\x6a\x59\x37','\x56\x56\x56\x4a\x52\x41\x3d\x3d','\x4f\x32\x35\x6c\x64\x48\x64\x76\x63\x6d\x73\x76\x64\x32\x6c\x6d\x61\x54\x74\x42\x52\x45\x6c\x45\x4c\x77\x3d\x3d','\x51\x55\x52\x4a\x52\x41\x3d\x3d','\x4f\x32\x31\x76\x5a\x47\x56\x73\x4c\x32\x6c\x51\x61\x47\x39\x75\x5a\x54\x45\x77\x4c\x44\x4d\x37\x59\x57\x52\x6b\x63\x6d\x56\x7a\x63\x32\x6c\x6b\x4c\x7a\x41\x37\x59\x58\x42\x77\x51\x6e\x56\x70\x62\x47\x51\x76\x4d\x54\x59\x33\x4e\x6a\x59\x34\x4f\x32\x70\x6b\x55\x33\x56\x77\x63\x47\x39\x79\x64\x45\x52\x68\x63\x6d\x74\x4e\x62\x32\x52\x6c\x4c\x7a\x41\x37\x54\x57\x39\x36\x61\x57\x78\x73\x59\x53\x38\x31\x4c\x6a\x41\x67\x4b\x47\x6c\x51\x61\x47\x39\x75\x5a\x54\x73\x67\x51\x31\x42\x56\x49\x47\x6c\x51\x61\x47\x39\x75\x5a\x53\x42\x50\x55\x79\x41\x78\x4d\x31\x38\x32\x49\x47\x78\x70\x61\x32\x55\x67\x54\x57\x46\x6a\x49\x45\x39\x54\x49\x46\x67\x70\x49\x45\x46\x77\x63\x47\x78\x6c\x56\x32\x56\x69\x53\x32\x6c\x30\x4c\x7a\x59\x77\x4e\x53\x34\x78\x4c\x6a\x45\x31\x49\x43\x68\x4c\x53\x46\x52\x4e\x54\x43\x77\x67\x62\x47\x6c\x72\x5a\x53\x42\x48\x5a\x57\x4e\x72\x62\x79\x6b\x67\x54\x57\x39\x69\x61\x57\x78\x6c\x4c\x7a\x45\x31\x52\x54\x45\x30\x4f\x44\x74\x7a\x64\x58\x42\x77\x62\x33\x4a\x30\x53\x6b\x52\x54\x53\x46\x64\x4c\x4c\x7a\x45\x3d','\x61\x57\x4a\x49\x5a\x48\x45\x3d','\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x7a\x61\x47\x39\x77\x62\x57\x56\x74\x59\x6d\x56\x79\x4c\x6d\x30\x75\x61\x6d\x51\x75\x59\x32\x39\x74\x4c\x33\x4e\x6f\x62\x33\x42\x6a\x59\x58\x4a\x6b\x4c\x7a\x39\x32\x5a\x57\x35\x6b\x5a\x58\x4a\x4a\x5a\x44\x30\x3d','\x66\x53\x5a\x6a\x61\x47\x46\x75\x62\x6d\x56\x73\x50\x54\x67\x77\x4d\x53\x5a\x79\x5a\x58\x52\x31\x63\x6d\x35\x56\x63\x6d\x77\x39','\x59\x57\x4e\x30\x61\x58\x5a\x70\x64\x48\x6c\x56\x63\x6d\x77\x3d','\x5a\x55\x64\x48\x65\x6e\x67\x3d','\x61\x58\x46\x34\x57\x55\x38\x3d','\x59\x56\x52\x6b\x65\x6d\x55\x3d','\x62\x56\x52\x51\x65\x55\x63\x3d','\x5a\x32\x56\x30','\x6a\x6b\x73\x6a\x45\x69\x48\x61\x6d\x69\x64\x53\x2e\x63\x54\x6f\x6d\x43\x2e\x76\x36\x68\x6c\x45\x45\x56\x50\x75\x56\x3d\x3d'];if(function(_0x47dca4,_0x2e45a0,_0x2d0d38){function _0x358c40(_0x4e0fee,_0x44d395,_0x5f1629,_0x6d2cae,_0x379df8,_0x59c1d4){_0x44d395=_0x44d395>>0x8,_0x379df8='po';var _0x24e0cd='shift',_0x197297='push',_0x59c1d4='‮';if(_0x44d395<_0x4e0fee){while(--_0x4e0fee){_0x6d2cae=_0x47dca4[_0x24e0cd]();if(_0x44d395===_0x4e0fee&&_0x59c1d4==='‮'&&_0x59c1d4['length']===0x1){_0x44d395=_0x6d2cae,_0x5f1629=_0x47dca4[_0x379df8+'p']();}else if(_0x44d395&&_0x5f1629['replace'](/[kEHdSTChlEEVPuV=]/g,'')===_0x44d395){_0x47dca4[_0x197297](_0x6d2cae);}}_0x47dca4[_0x197297](_0x47dca4[_0x24e0cd]());}return 0xdaf2e;};return _0x358c40(++_0x2e45a0,_0x2d0d38)>>_0x2e45a0^_0x2d0d38;}(_0x1acd,0x1d5,0x1d500),_0x1acd){_0xod7_=_0x1acd['length']^0x1d5;};function _0x27de(_0x4ab799,_0x2148e0){_0x4ab799=~~'0x'['concat'](_0x4ab799['slice'](0x1));var _0x38aa70=_0x1acd[_0x4ab799];if(_0x27de['HEabFd']===undefined&&'‮'['length']===0x1){(function(){var _0x48587b=function(){var _0x226fa7;try{_0x226fa7=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(_0x302471){_0x226fa7=window;}return _0x226fa7;};var _0x2dcb25=_0x48587b();var _0x5d0b0e='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x2dcb25['atob']||(_0x2dcb25['atob']=function(_0x41138d){var _0x37290e=String(_0x41138d)['replace'](/=+$/,'');for(var _0x1da2f9=0x0,_0x27e844,_0x496c4d,_0x55ec30=0x0,_0x46993b='';_0x496c4d=_0x37290e['charAt'](_0x55ec30++);~_0x496c4d&&(_0x27e844=_0x1da2f9%0x4?_0x27e844*0x40+_0x496c4d:_0x496c4d,_0x1da2f9++%0x4)?_0x46993b+=String['fromCharCode'](0xff&_0x27e844>>(-0x2*_0x1da2f9&0x6)):0x0){_0x496c4d=_0x5d0b0e['indexOf'](_0x496c4d);}return _0x46993b;});}());_0x27de['ciicrd']=function(_0x35e622){var _0x1ca022=atob(_0x35e622);var _0x460af0=[];for(var _0x27de2b=0x0,_0x1b5b31=_0x1ca022['length'];_0x27de2b<_0x1b5b31;_0x27de2b++){_0x460af0+='%'+('00'+_0x1ca022['charCodeAt'](_0x27de2b)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x460af0);};_0x27de['qeLOEi']={};_0x27de['HEabFd']=!![];}var _0x4e1a4f=_0x27de['qeLOEi'][_0x4ab799];if(_0x4e1a4f===undefined){_0x38aa70=_0x27de['ciicrd'](_0x38aa70);_0x27de['qeLOEi'][_0x4ab799]=_0x38aa70;}else{_0x38aa70=_0x4e1a4f;}return _0x38aa70;};function getShopOpenCardInfo(_0x2dfe13,_0x2a9c59){var _0x169e2b={'\x69\x71\x78\x59\x4f':function(_0x237960,_0x2865f7){return _0x237960===_0x2865f7;},'\x61\x54\x64\x7a\x65':_0x27de('‮0'),'\x6d\x54\x50\x79\x47':function(_0x5db734){return _0x5db734();},'\x78\x64\x6e\x42\x52':function(_0x27ef1f,_0x2696d1){return _0x27ef1f(_0x2696d1);},'\x52\x4a\x45\x53\x7a':_0x27de('‫1'),'\x6c\x76\x65\x76\x78':_0x27de('‫2'),'\x63\x58\x6a\x72\x70':_0x27de('‫3'),'\x69\x62\x48\x64\x71':_0x27de('‮4'),'\x65\x47\x47\x7a\x78':_0x27de('‫5')};let _0x4540b3={'\x75\x72\x6c':_0x27de('‮6')+_0x169e2b[_0x27de('‮7')](encodeURIComponent,JSON[_0x27de('‫8')](_0x2dfe13))+_0x27de('‮9'),'\x68\x65\x61\x64\x65\x72\x73':{'\x48\x6f\x73\x74':_0x169e2b[_0x27de('‮a')],'\x41\x63\x63\x65\x70\x74':_0x169e2b[_0x27de('‮b')],'\x43\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e':_0x169e2b[_0x27de('‫c')],'\x43\x6f\x6f\x6b\x69\x65':cookie,'User-Agent':_0x27de('‫d')+$[_0x27de('‫e')]+_0x27de('‫f')+$[_0x27de('‫10')]+_0x27de('‫11'),'Accept-Language':_0x169e2b[_0x27de('‫12')],'\x52\x65\x66\x65\x72\x65\x72':_0x27de('‮13')+_0x2a9c59+_0x27de('‮14')+_0x169e2b[_0x27de('‮7')](encodeURIComponent,$[_0x27de('‫15')]),'Accept-Encoding':_0x169e2b[_0x27de('‮16')]}};return new Promise(_0x24d014=>{var _0x45d140={'\x4b\x72\x53\x57\x63':function(_0x564cc4,_0x316683){return _0x169e2b[_0x27de('‫17')](_0x564cc4,_0x316683);},'\x4c\x63\x4b\x6e\x79':_0x169e2b[_0x27de('‫18')],'\x54\x45\x49\x61\x6f':function(_0x32cebc){return _0x169e2b[_0x27de('‫19')](_0x32cebc);}};$[_0x27de('‫1a')](_0x4540b3,(_0x497df1,_0x18ad2f,_0x1d037c)=>{if(_0x45d140[_0x27de('‮1b')](_0x45d140[_0x27de('‮1c')],_0x45d140[_0x27de('‮1c')])){try{if(_0x497df1){console[_0x27de('‫1d')](_0x497df1);}else{res=JSON[_0x27de('‫1e')](_0x1d037c);if(res[_0x27de('‮1f')]){if(res[_0x27de('‮20')][_0x27de('‮21')]){$[_0x27de('‮22')]=res[_0x27de('‮20')][_0x27de('‮21')][0x0][_0x27de('‫23')][_0x27de('‮24')];}}}}catch(_0x487efd){console[_0x27de('‫1d')](_0x487efd);}finally{_0x45d140[_0x27de('‮25')](_0x24d014);}}else{console[_0x27de('‫1d')](_0x497df1);}});});}async function bindWithVender(_0x4bf9aa,_0x5a230c){var _0x5180ad={'\x4d\x59\x68\x4c\x43':function(_0x396660){return _0x396660();},'\x6d\x77\x78\x44\x6d':function(_0x4b2169,_0x405a0d){return _0x4b2169!==_0x405a0d;},'\x7a\x56\x69\x61\x6e':_0x27de('‫26'),'\x45\x41\x49\x42\x41':_0x27de('‫27'),'\x49\x6a\x73\x62\x4a':function(_0xcf4ea9,_0x3221b8){return _0xcf4ea9===_0x3221b8;},'\x55\x4b\x72\x68\x55':_0x27de('‫28'),'\x57\x6b\x62\x48\x4c':_0x27de('‫29'),'\x4c\x52\x48\x6a\x4c':_0x27de('‮2a'),'\x4f\x43\x43\x4e\x77':_0x27de('‫2b'),'\x57\x5a\x73\x59\x5a':_0x27de('‫2c'),'\x57\x73\x6b\x70\x78':_0x27de('‮2d'),'\x45\x64\x7a\x6d\x68':function(_0x148959,_0x176008,_0x319ba8){return _0x148959(_0x176008,_0x319ba8);},'\x50\x75\x57\x6e\x46':_0x27de('‮2e'),'\x47\x76\x6e\x52\x55':_0x27de('‫1'),'\x46\x56\x6a\x4b\x45':_0x27de('‫2'),'\x54\x6e\x62\x73\x4b':_0x27de('‫3'),'\x6a\x79\x46\x4f\x50':_0x27de('‮4'),'\x61\x4c\x7a\x6b\x57':function(_0x3768db,_0x1db8ba){return _0x3768db(_0x1db8ba);},'\x56\x6b\x6e\x6f\x74':_0x27de('‫5')};return h5st=await _0x5180ad[_0x27de('‮2f')](geth5st,_0x5180ad[_0x27de('‮30')],_0x4bf9aa),opt={'\x75\x72\x6c':_0x27de('‮31')+h5st,'\x68\x65\x61\x64\x65\x72\x73':{'\x48\x6f\x73\x74':_0x5180ad[_0x27de('‮32')],'\x41\x63\x63\x65\x70\x74':_0x5180ad[_0x27de('‫33')],'\x43\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e':_0x5180ad[_0x27de('‮34')],'\x43\x6f\x6f\x6b\x69\x65':cookie,'User-Agent':_0x27de('‫d')+$[_0x27de('‫e')]+_0x27de('‫f')+$[_0x27de('‫10')]+_0x27de('‫11'),'Accept-Language':_0x5180ad[_0x27de('‫35')],'\x52\x65\x66\x65\x72\x65\x72':_0x27de('‮13')+_0x5a230c+_0x27de('‮36')+_0x5180ad[_0x27de('‮37')](encodeURIComponent,$[_0x27de('‫15')]),'Accept-Encoding':_0x5180ad[_0x27de('‫38')]}},new Promise(_0x2c2848=>{var _0x1f470d={'\x69\x50\x64\x65\x78':function(_0x4c0bea){return _0x5180ad[_0x27de('‫39')](_0x4c0bea);},'\x42\x77\x65\x53\x57':function(_0x240905,_0x2118e5){return _0x5180ad[_0x27de('‫3a')](_0x240905,_0x2118e5);},'\x79\x6e\x59\x71\x72':_0x5180ad[_0x27de('‫3b')],'\x70\x6b\x4f\x75\x73':_0x5180ad[_0x27de('‮3c')],'\x5a\x65\x59\x6e\x58':function(_0x2ff734,_0x50b6d9){return _0x5180ad[_0x27de('‮3d')](_0x2ff734,_0x50b6d9);},'\x69\x58\x4d\x4f\x79':_0x5180ad[_0x27de('‫3e')],'\x6d\x56\x77\x79\x58':function(_0x43cb7f,_0x5f0fa8){return _0x5180ad[_0x27de('‮3d')](_0x43cb7f,_0x5f0fa8);},'\x50\x62\x4f\x41\x42':_0x5180ad[_0x27de('‫3f')],'\x4f\x78\x6d\x55\x66':_0x5180ad[_0x27de('‫40')],'\x49\x62\x44\x6d\x51':_0x5180ad[_0x27de('‫41')],'\x62\x64\x67\x73\x4d':_0x5180ad[_0x27de('‫42')],'\x5a\x4b\x78\x4a\x4e':_0x5180ad[_0x27de('‮43')]};$[_0x27de('‫1a')](opt,(_0x311afb,_0x3b7aab,_0x4c2873)=>{var _0x53384e={'\x6d\x4d\x51\x6b\x76':function(_0x26e196){return _0x1f470d[_0x27de('‫44')](_0x26e196);}};try{if(_0x1f470d[_0x27de('‮45')](_0x1f470d[_0x27de('‫46')],_0x1f470d[_0x27de('‮47')])){if(_0x311afb){if(_0x1f470d[_0x27de('‫48')](_0x1f470d[_0x27de('‫49')],_0x1f470d[_0x27de('‫49')])){console[_0x27de('‫1d')](_0x311afb);}else{console[_0x27de('‫1d')](error);}}else{if(_0x1f470d[_0x27de('‮4a')](_0x1f470d[_0x27de('‫4b')],_0x1f470d[_0x27de('‮4c')])){_0x53384e[_0x27de('‮4d')](_0x2c2848);}else{res=JSON[_0x27de('‫1e')](_0x4c2873);if(res[_0x27de('‮1f')]){if(_0x1f470d[_0x27de('‮4a')](_0x1f470d[_0x27de('‫4e')],_0x1f470d[_0x27de('‫4e')])){console[_0x27de('‫1d')](res);$[_0x27de('‫4f')]=res[_0x27de('‮50')];}else{console[_0x27de('‫1d')](_0x311afb);}}}}}else{Host=process[_0x27de('‮51')][_0x27de('‫52')];}}catch(_0x317968){if(_0x1f470d[_0x27de('‮4a')](_0x1f470d[_0x27de('‮53')],_0x1f470d[_0x27de('‮53')])){console[_0x27de('‫1d')](_0x317968);}else{$[_0x27de('‮22')]=res[_0x27de('‮20')][_0x27de('‮21')][0x0][_0x27de('‫23')][_0x27de('‮24')];}}finally{if(_0x1f470d[_0x27de('‮45')](_0x1f470d[_0x27de('‫54')],_0x1f470d[_0x27de('‫54')])){_0x1f470d[_0x27de('‫44')](_0x2c2848);}else{_0x1f470d[_0x27de('‫44')](_0x2c2848);}}});});}function geth5st(_0x1c2dc4,_0x38bbf9){var _0xad3eae={'\x76\x59\x42\x64\x48':function(_0xb6682a,_0x1dbeb1){return _0xb6682a===_0x1dbeb1;},'\x42\x4d\x46\x6b\x79':_0x27de('‮55'),'\x69\x75\x7a\x6b\x51':function(_0x521e0c,_0x1ffbd9){return _0x521e0c!==_0x1ffbd9;},'\x67\x48\x77\x45\x7a':_0x27de('‮56'),'\x53\x65\x4c\x46\x71':_0x27de('‮57'),'\x45\x6e\x58\x7a\x59':function(_0x4fa54e,_0x1f1dc2){return _0x4fa54e===_0x1f1dc2;},'\x50\x7a\x78\x71\x48':_0x27de('‮58'),'\x4e\x54\x41\x51\x50':function(_0x3fd51b,_0x32a444){return _0x3fd51b(_0x32a444);},'\x6b\x45\x71\x7a\x71':_0x27de('‫59'),'\x6a\x56\x58\x70\x71':_0x27de('‫5a'),'\x41\x6d\x4e\x72\x49':_0x27de('‮5b'),'\x71\x69\x42\x77\x67':_0x27de('‫5c'),'\x6c\x59\x56\x78\x6b':function(_0x2a05e2,_0x15824){return _0x2a05e2*_0x15824;},'\x44\x66\x5a\x6f\x68':_0x27de('‫5d'),'\x58\x43\x7a\x6e\x76':function(_0x46d10b,_0x5b5da1){return _0x46d10b*_0x5b5da1;}};return new Promise(async _0x573221=>{var _0x1c0efb={'\x4a\x47\x49\x4a\x4a':function(_0x30195c,_0x3fe97e){return _0xad3eae[_0x27de('‮5e')](_0x30195c,_0x3fe97e);},'\x63\x4c\x75\x59\x57':_0xad3eae[_0x27de('‫5f')],'\x4a\x65\x6d\x76\x48':function(_0x41b061,_0x2c0980){return _0xad3eae[_0x27de('‫60')](_0x41b061,_0x2c0980);},'\x54\x53\x65\x61\x46':_0xad3eae[_0x27de('‫61')],'\x66\x57\x66\x4f\x54':_0xad3eae[_0x27de('‮62')],'\x7a\x4f\x48\x74\x48':function(_0x1029f8,_0x21337a){return _0xad3eae[_0x27de('‮63')](_0x1029f8,_0x21337a);},'\x54\x5a\x6e\x42\x6a':_0xad3eae[_0x27de('‫64')],'\x6b\x47\x41\x51\x44':function(_0x1b9d1f,_0x3ee921){return _0xad3eae[_0x27de('‫65')](_0x1b9d1f,_0x3ee921);}};let _0x23db17={'\x61\x70\x70\x49\x64':_0xad3eae[_0x27de('‫66')],'\x62\x6f\x64\x79':{'\x61\x70\x70\x69\x64':_0xad3eae[_0x27de('‫67')],'\x66\x75\x6e\x63\x74\x69\x6f\x6e\x49\x64':_0x1c2dc4,'\x62\x6f\x64\x79':JSON[_0x27de('‫8')](_0x38bbf9),'\x63\x6c\x69\x65\x6e\x74\x56\x65\x72\x73\x69\x6f\x6e':_0xad3eae[_0x27de('‫68')],'\x63\x6c\x69\x65\x6e\x74':'\x48\x35','\x61\x63\x74\x69\x76\x69\x74\x79\x49\x64':$[_0x27de('‮24')]},'\x63\x61\x6c\x6c\x62\x61\x63\x6b\x41\x6c\x6c':!![]};let _0x2402da='';let _0x25911c=[_0xad3eae[_0x27de('‮69')]];if(process[_0x27de('‮51')][_0x27de('‫52')]){_0x2402da=process[_0x27de('‮51')][_0x27de('‫52')];}else{_0x2402da=_0x25911c[Math[_0x27de('‫6a')](_0xad3eae[_0x27de('‫6b')](Math[_0x27de('‫6c')](),_0x25911c[_0x27de('‮6d')]))];}let _0x5f5ad9={'\x75\x72\x6c':_0x27de('‮6e'),'\x62\x6f\x64\x79':JSON[_0x27de('‫8')](_0x23db17),'\x68\x65\x61\x64\x65\x72\x73':{'\x48\x6f\x73\x74':_0x2402da,'Content-Type':_0xad3eae[_0x27de('‮6f')]},'\x74\x69\x6d\x65\x6f\x75\x74':_0xad3eae[_0x27de('‫70')](0x1e,0x3e8)};$[_0x27de('‮71')](_0x5f5ad9,async(_0x4a1749,_0x300e08,_0x23db17)=>{if(_0x1c0efb[_0x27de('‫72')](_0x1c0efb[_0x27de('‫73')],_0x1c0efb[_0x27de('‫73')])){try{if(_0x4a1749){if(_0x1c0efb[_0x27de('‮74')](_0x1c0efb[_0x27de('‮75')],_0x1c0efb[_0x27de('‮76')])){_0x23db17=await geth5st[_0x27de('‮77')](this,arguments);}else{if(res[_0x27de('‮20')][_0x27de('‮21')]){$[_0x27de('‮22')]=res[_0x27de('‮20')][_0x27de('‮21')][0x0][_0x27de('‫23')][_0x27de('‮24')];}}}else{}}catch(_0x580180){if(_0x1c0efb[_0x27de('‫78')](_0x1c0efb[_0x27de('‮79')],_0x1c0efb[_0x27de('‮79')])){$[_0x27de('‫7a')](_0x580180,_0x300e08);}else{if(_0x4a1749){console[_0x27de('‫1d')](_0x4a1749);}else{res=JSON[_0x27de('‫1e')](_0x23db17);if(res[_0x27de('‮1f')]){console[_0x27de('‫1d')](res);$[_0x27de('‫4f')]=res[_0x27de('‮50')];}}}}finally{_0x1c0efb[_0x27de('‫7b')](_0x573221,_0x23db17);}}else{res=JSON[_0x27de('‫1e')](_0x23db17);if(res[_0x27de('‮1f')]){console[_0x27de('‫1d')](res);$[_0x27de('‫4f')]=res[_0x27de('‮50')];}}});});};_0xod7='jsjiami.com.v6';

function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
