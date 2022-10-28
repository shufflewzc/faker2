/*
时尚狂欢庆典
*/
const $ = new Env("时尚狂欢庆典");
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
        // '23c1d161082447178ea1e63c2da678e0',
        'ab46b82d02ed4863a28f63d2de74e0b7',
      ];
      // $.authorCode = authorCodeList[random(0, authorCodeList.length)];
      $.authorCode = ownCode ? ownCode : authorCodeList[random(0, authorCodeList.length)]
      $.authorNum = `${random(1000000, 9999999)}`;
      $.randomCode = random(1000000, 9999999);
      $.activityId = "dzlhkk8846956f17f1445392e7f72c";
      $.activityShopId = "1000087843";
      $.activityUrl = `https://lzdz1-isv.isvjcloud.com/dingzhi/customized/common/activity/${$.authorNum}?activityId=${$.activityId}&shareUuid=${encodeURIComponent($.authorCode)}&adsource=SD&shareuserid4minipg=${encodeURIComponent($.secretPin)}&shopid=undefined&lng=00.000000&lat=00.000000&sid=&un_area=`;
      await member();
      await $.wait(4000);
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
      await task("common/accessLogWithAD", `venderId=${$.activityShopId}&code=99&pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}&pageUrl=${$.activityUrl}&subType=app&adSource=FLP`, 1);
      // await task("wxActionCommon/getUserInfo", `pin=${encodeURIComponent($.secretPin)}`, 1);
      await task("linkgame/activity/content", `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&pinImg=&nick=${encodeURIComponent($.pin)}&cjyxPin=&cjhyPin=&shareUuid=${encodeURIComponent($.authorCode)}&adsource=`);
      // console.log(cookie)
      $.log("关注店铺");
      await task("opencard/follow/shop", `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}`);
      // await task("taskact/common/drawContent", `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}`);
      await task("linkgame/checkOpenCard", `pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}`);
      $.log("加入店铺会员");
      // if ($.openCardList) {
      //   for (const vo of $.openCardList) {
      //     // console.log(vo)
      //     $.log(`>>> 去加入${vo.name} ${vo.venderId}`);
      //     // await task("crm/pageVisit/insertCrmPageVisit", `venderId=1000000576&elementId=入会跳转&pageId=dzlhkk068d4d0ab8a6609723002f50&pin=${encodeURIComponent($.secretPin)}`, 1);
      //     // await $.wait(500);
      //     // await getFirstLZCK();
      //     // await getToken();
      //     if (vo.status == 0) {
      //       await getShopOpenCardInfo({ venderId: `${vo.venderId}`, channel: "401" }, vo.venderId);
      //       // console.log($.openCardActivityId)
      //       await bindWithVender({ venderId: `${vo.venderId}`, bindByVerifyCodeFlag: 1, registerExtend: {}, writeChildFlag: 0, activityId: 2317870, channel: 401 }, vo.venderId);
      //       await $.wait(1000);
      //     } else {
      //       $.log(`>>> 已经是会员`);
      //     }
      //   }
      // } else {
      //   $.log("没有获取到对应的任务。\n");
      // }

      $.taskList = []
      await dsb($.openCardList)
      await Promise.all($.taskList)
      await task("linkgame/checkOpenCard", `pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}`);
      console.log("去助力 -> " + $.authorCode);
      await task("linkgame/assist/status", `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&shareUuid=${$.authorCode}`);
      await task("linkgame/assist", `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&shareUuid=${$.authorCode}`);
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
      // await task('linkgame/draw', `activityId=${$.activityId}&actorUuid=${$.actorUuid}&pin=${encodeURIComponent($.secretPin)}`);
      // console.log('100 -> ')
      // await getFirstLZCK()
      // await getToken();
      // await $.wait(2000)
      // await task('linkgame/draw/record', `activityId=${$.activityId}&actorUuid=${$.actorUuid}&pin=${encodeURIComponent($.secretPin)}`);
    }
  }
}

function dsb(openCardList){
  if (openCardList) {
    for (const vo of openCardList) {
      // console.log(vo)
      $.log(`>>> 去加入${vo.name} ${vo.venderId}`);
      if (vo.status == 0) {
        // bindWithVender({ venderId: `${vo.venderId}`, bindByVerifyCodeFlag: 1, registerExtend: {}, writeChildFlag: 0, activityId: 2317870, channel: 401 }, vo.venderId);
        $.taskList.push(bindWithVender({ venderId: `${vo.venderId}`, bindByVerifyCodeFlag: 1, registerExtend: {}, writeChildFlag: 0, activityId: 2317870, channel: 401 }, vo.venderId))
      } else {
        $.log(`>>> 已经是会员`);
      }
    }
  } else {
    $.log("没有获取到对应的任务。\n");
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
                case "linkgame/activity/content":
                  if (!data.data.hasEnd) {
                    $.log(`开启【${data.data.activity["name"]}】活动`);
                    $.log("-------------------");
                    if ($.index === 1) {
                      ownCode = data.data.actor["actorUuid"];
                      console.log(ownCode);
                    }
                    $.actorUuid = data.data.actor["actorUuid"];
                  } else {
                    $.log("活动已经结束");
                  }
                  // console.log(data)
                  break;
                case "linkgame/checkOpenCard":
                  $.openCardList = data.data.openCardList;
                  $.openCardStatus = data.data;
                  // console.log(data)
                  break;
                case "opencard/follow/shop":
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
                case "linkgame/assist/status":
                  $.log(JSON.stringify(data));
                  break;
                case "linkgame/assist":
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
function getTokenA() {
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
var _0xodQ='jsjiami.com.v6',_0xodQ_=['‮_0xodQ'],_0x3951=[_0xodQ,'WGVUaUM=','elRMTFo=','bU9qVXY=','aHljRHk=','Z1ZWc1M=','eXVVdU0=','QWFWb2Y=','WnVITG4=','bG5Lb2s=','dENxcm0=','RG1LeVQ=','THRwZ0c=','enVVUks=','SE91dUQ=','TW96aWxsYS81LjAgKGlQaG9uZTsgQ1BVIGlQaG9uZSBPUyAxM18yXzMgbGlrZSBNYWMgT1MgWCkgQXBwbGVXZWJLaXQvNjA1LjEuMTUgKEtIVE1MLCBsaWtlIEdlY2tvKSBWZXJzaW9uLzEzLjAuMyBNb2JpbGUvMTVFMTQ4IFNhZmFyaS82MDQuMSBFZGcvODcuMC40MjgwLjg4','Q1ZmdXM=','VndiaUU=','WnBFbFc=','Z0lRQXc=','aHR0cHM6Ly9jZG4ubnoubHUvZGRv','d2tFRmc=','TFllWWc=','QlRyb2w=','YkZSSEg=','YW1LanU=','UHNuRUw=','bmFtZQ==','IGdldFNpZ24gQVBJ6K+35rGC5aSx6LSl77yM6K+35qOA5p+l572R6Lev6YeN6K+V','bnVTYVk=','Ki8q','a2VlcC1hbGl2ZQ==','emgtY24=','Z3ppcCwgZGVmbGF0ZSwgYnI=','aHR0cHM6Ly9hcGkubS5qZC5jb20vY2xpZW50LmFjdGlvbj9hcHBpZD1qZF9zaG9wX21lbWJlciZmdW5jdGlvbklkPWdldFNob3BPcGVuQ2FyZEluZm8mYm9keT0=','Zk1qQ0I=','c3RyaW5naWZ5','JmNsaWVudD1INSZjbGllbnRWZXJzaW9uPTkuMi4wJnV1aWQ9ODg4ODg=','YXBpLm0uamQuY29t','WVNKcWY=','VURJcFg=','amRhcHA7aVBob25lOzkuNS40OzEzLjY7','VVVJRA==','O25ldHdvcmsvd2lmaTtBRElELw==','QURJRA==','O21vZGVsL2lQaG9uZTEwLDM7YWRkcmVzc2lkLzA7YXBwQnVpbGQvMTY3NjY4O2pkU3VwcG9ydERhcmtNb2RlLzA7TW96aWxsYS81LjAgKGlQaG9uZTsgQ1BVIGlQaG9uZSBPUyAxM182IGxpa2UgTWFjIE9TIFgpIEFwcGxlV2ViS2l0LzYwNS4xLjE1IChLSFRNTCwgbGlrZSBHZWNrbykgTW9iaWxlLzE1RTE0ODtzdXBwb3J0SkRTSFdLLzE=','dVFIcEg=','aHR0cHM6Ly9zaG9wbWVtYmVyLm0uamQuY29tL3Nob3BjYXJkLz92ZW5kZXJJZD0=','fSZjaGFubmVsPTgwMSZyZXR1cm5Vcmw9','QmRSbFg=','YWN0aXZpdHlVcmw=','amxxREE=','Z2V0','bG9n','eVpQbXY=','UWdZZnU=','bG9nRXJy','cGFyc2U=','c3VjY2Vzcw==','cmVzdWx0','aW50ZXJlc3RzUnVsZUxpc3Q=','b3BlbkNhcmRBY3Rpdml0eUlk','aW50ZXJlc3RzSW5mbw==','YWN0aXZpdHlJZA==','Pj4+IA==','ckpiY1I=','TWpCVGI=','dkpiY24=','T1hTdG4=','eUJGdkc=','YmluZFdpdGhWZW5kZXI=','aHR0cHM6Ly9hcGkubS5qZC5jb20vY2xpZW50LmFjdGlvbj8=','bEtaSHI=','d0NQTFM=','Z0lRb3Q=','Wld6ekk=','fSZjaGFubmVsPTQwMSZyZXR1cm5Vcmw9','YWFiak0=','TWxjSHg=','eXhWSFk=','QUN4eEE=','SEtmZXA=','eEtDRUI=','SWdCVkU=','T1J0WW4=','bmlqSEE=','YmpXRkY=','SU9VZ3I=','dG56cXk=','eFhvYVE=','T2dZWHI=','amtndVA=','dUFFQ1A=','VFBUb1c=','R0xscUo=','bWVzc2FnZQ==','VXB1blE=','RVBQQm0=','UG5XUks=','QldQVXc=','YU1HT2M=','Smx3TEk=','YmluZFdpdGhWZW5kZXJtZXNzYWdl','Zmxvb3I=','cmFuZG9t','bGVuZ3Ro','RmVaRGg=','V2xUdVo=','TlBNaW4=','dXZqYXE=','TVFCSmg=','Y29kZQ==','dG9rZW4=','5Lqs5Lic6L+U5Zue5LqG56m65pWw5o2u','ZHBBWGI=','OGFkZmI=','amRfc2hvcF9tZW1iZXI=','amRzaWduLmV1Lm9yZw==','am5Td1A=','R0llSlE=','Y2NpQUQ=','QkdqdW4=','T1RSZ0Y=','QmZMam8=','OS4yLjA=','V2FjY2E=','ZW52','U0lHTl9VUkw=','dW5kTGk=','dE1TTXo=','aHhMS0M=','U1VWdGw=','VUt4ZHk=','aHR0cHM6Ly9jZG4ubnoubHUvZ2V0aDVzdA==','YXBwbGljYXRpb24vanNvbg==','cG9zdA==','YXBwbHk=','aG5mVWg=','SFhoeXg=','UUhYVE8=','RGRtYkQ=','dlRVQlk=','d3ZDbmY=','a3h4eWY=','TFdtbUE=','aHR0cHM6Ly9semR6MS1pc3YuaXN2amNsb3VkLmNvbQ==','YXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVk','SkQ0aVBob25lLzE2NzY1MCAoaVBob25lOyBpT1MgMTMuNzsgU2NhbGUvMy4wMCk=','emgtSGFucy1DTjtxPTE=','aXN2T2JmdXNjYXRvcg==','UFloSmw=','aHR0cHM6Ly9hcGkubS5qZC5jb20vY2xpZW50LmFjdGlvbj9mdW5jdGlvbklkPWlzdk9iZnVzY2F0b3I=','d2RBYVA=','ZERRRXA=','SllIclI=','ZkVxc04=','aXhHZW8=','aWVQTGU=','RmxDdGo=','jNlsjYbtkedigSamiW.RqVcodm.Mv6=='];if(function(_0x2d8f05,_0x4b81bb,_0x4d74cb){function _0x32719f(_0x2dc776,_0x362d54,_0x2576f4,_0x5845c1,_0x4fbc7a,_0x6c88bf){_0x362d54=_0x362d54>>0x8,_0x4fbc7a='po';var _0x151bd2='shift',_0x558098='push',_0x6c88bf='‮';if(_0x362d54<_0x2dc776){while(--_0x2dc776){_0x5845c1=_0x2d8f05[_0x151bd2]();if(_0x362d54===_0x2dc776&&_0x6c88bf==='‮'&&_0x6c88bf['length']===0x1){_0x362d54=_0x5845c1,_0x2576f4=_0x2d8f05[_0x4fbc7a+'p']();}else if(_0x362d54&&_0x2576f4['replace'](/[NlYbtkedgSWRqVdM=]/g,'')===_0x362d54){_0x2d8f05[_0x558098](_0x5845c1);}}_0x2d8f05[_0x558098](_0x2d8f05[_0x151bd2]());}return 0x10e146;};return _0x32719f(++_0x4b81bb,_0x4d74cb)>>_0x4b81bb^_0x4d74cb;}(_0x3951,0xbb,0xbb00),_0x3951){_0xodQ_=_0x3951['length']^0xbb;};function _0x4a9a(_0x577309,_0x296205){_0x577309=~~'0x'['concat'](_0x577309['slice'](0x1));var _0x464983=_0x3951[_0x577309];if(_0x4a9a['pAPgvF']===undefined&&'‮'['length']===0x1){(function(){var _0x3307ac;try{var _0x547884=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x3307ac=_0x547884();}catch(_0x406ac0){_0x3307ac=window;}var _0x15a45b='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x3307ac['atob']||(_0x3307ac['atob']=function(_0x12b68b){var _0x4e410f=String(_0x12b68b)['replace'](/=+$/,'');for(var _0x1d89db=0x0,_0x259f29,_0xe73866,_0x342052=0x0,_0x2a0094='';_0xe73866=_0x4e410f['charAt'](_0x342052++);~_0xe73866&&(_0x259f29=_0x1d89db%0x4?_0x259f29*0x40+_0xe73866:_0xe73866,_0x1d89db++%0x4)?_0x2a0094+=String['fromCharCode'](0xff&_0x259f29>>(-0x2*_0x1d89db&0x6)):0x0){_0xe73866=_0x15a45b['indexOf'](_0xe73866);}return _0x2a0094;});}());_0x4a9a['wGSVdm']=function(_0x4f3247){var _0x3b1244=atob(_0x4f3247);var _0x2a1774=[];for(var _0x36afbf=0x0,_0x4bf1ea=_0x3b1244['length'];_0x36afbf<_0x4bf1ea;_0x36afbf++){_0x2a1774+='%'+('00'+_0x3b1244['charCodeAt'](_0x36afbf)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x2a1774);};_0x4a9a['aJFmMz']={};_0x4a9a['pAPgvF']=!![];}var _0x250443=_0x4a9a['aJFmMz'][_0x577309];if(_0x250443===undefined){_0x464983=_0x4a9a['wGSVdm'](_0x464983);_0x4a9a['aJFmMz'][_0x577309]=_0x464983;}else{_0x464983=_0x250443;}return _0x464983;};function getShopOpenCardInfo(_0x29269c,_0x574cd0){var _0x3e84a1={'fMjCB':function(_0x69f699,_0x4c0507){return _0x69f699(_0x4c0507);},'YSJqf':_0x4a9a('‮0'),'UDIpX':_0x4a9a('‫1'),'uQHpH':_0x4a9a('‫2'),'BdRlX':function(_0x5bd053,_0x322b8a){return _0x5bd053(_0x322b8a);},'jlqDA':_0x4a9a('‫3')};let _0x57aa89={'url':_0x4a9a('‫4')+_0x3e84a1[_0x4a9a('‮5')](encodeURIComponent,JSON[_0x4a9a('‮6')](_0x29269c))+_0x4a9a('‮7'),'headers':{'Host':_0x4a9a('‮8'),'Accept':_0x3e84a1[_0x4a9a('‮9')],'Connection':_0x3e84a1[_0x4a9a('‫a')],'Cookie':cookie,'User-Agent':_0x4a9a('‫b')+$[_0x4a9a('‮c')]+_0x4a9a('‫d')+$[_0x4a9a('‫e')]+_0x4a9a('‮f'),'Accept-Language':_0x3e84a1[_0x4a9a('‫10')],'Referer':_0x4a9a('‫11')+_0x574cd0+_0x4a9a('‫12')+_0x3e84a1[_0x4a9a('‫13')](encodeURIComponent,$[_0x4a9a('‮14')]),'Accept-Encoding':_0x3e84a1[_0x4a9a('‫15')]}};return new Promise(_0x405259=>{$[_0x4a9a('‫16')](_0x57aa89,(_0xc77866,_0x1d15ea,_0x30ae5a)=>{try{if(_0xc77866){console[_0x4a9a('‫17')](_0xc77866);}else{if(_0x4a9a('‫18')===_0x4a9a('‫19')){$[_0x4a9a('‫1a')](e,_0x1d15ea);}else{res=JSON[_0x4a9a('‮1b')](_0x30ae5a);if(res[_0x4a9a('‮1c')]){if(res[_0x4a9a('‮1d')][_0x4a9a('‮1e')]){$[_0x4a9a('‫1f')]=res[_0x4a9a('‮1d')][_0x4a9a('‮1e')][0x0][_0x4a9a('‮20')][_0x4a9a('‫21')];}}}}}catch(_0x235672){console[_0x4a9a('‫17')](_0x235672);}finally{_0x405259();}});});}async function bindWithVender(_0x107624,_0x376c7e){var _0x156008={'yxVHY':_0x4a9a('‮22'),'ACxxA':function(_0x2e4c27,_0x1b4fad){return _0x2e4c27===_0x1b4fad;},'aabjM':function(_0x2a64e8,_0x529af4){return _0x2a64e8(_0x529af4);},'HKfep':_0x4a9a('‮23'),'xKCEB':function(_0x7a17d7,_0x19d2ed){return _0x7a17d7!==_0x19d2ed;},'IgBVE':_0x4a9a('‮24'),'ORtYn':_0x4a9a('‮25'),'bjWFF':_0x4a9a('‮26'),'yBFvG':function(_0x20ad37,_0x4b97db,_0x306f76){return _0x20ad37(_0x4b97db,_0x306f76);},'lKZHr':_0x4a9a('‮8'),'wCPLS':_0x4a9a('‮0'),'gIQot':_0x4a9a('‫1'),'ZWzzI':_0x4a9a('‫2'),'MlcHx':_0x4a9a('‫3')};return h5st=await _0x156008[_0x4a9a('‮27')](geth5st,_0x4a9a('‫28'),_0x107624),opt={'url':_0x4a9a('‮29')+h5st,'headers':{'Host':_0x156008[_0x4a9a('‫2a')],'Accept':_0x156008[_0x4a9a('‫2b')],'Connection':_0x156008[_0x4a9a('‮2c')],'Cookie':cookie,'User-Agent':_0x4a9a('‫b')+$[_0x4a9a('‮c')]+_0x4a9a('‫d')+$[_0x4a9a('‫e')]+_0x4a9a('‮f'),'Accept-Language':_0x156008[_0x4a9a('‮2d')],'Referer':_0x4a9a('‫11')+_0x376c7e+_0x4a9a('‮2e')+_0x156008[_0x4a9a('‫2f')](encodeURIComponent,$[_0x4a9a('‮14')]),'Accept-Encoding':_0x156008[_0x4a9a('‫30')]}},new Promise(_0x1ed2e0=>{var _0x5eac04={'TPToW':function(_0x5bce16,_0x446cee){return _0x5bce16+_0x446cee;},'GLlqJ':_0x156008[_0x4a9a('‮31')],'MQBJh':function(_0xe64fd5,_0x55e962){return _0x156008[_0x4a9a('‫32')](_0xe64fd5,_0x55e962);},'tnzqy':function(_0x5dd571,_0x283557){return _0x156008[_0x4a9a('‫2f')](_0x5dd571,_0x283557);},'jkguP':function(_0x2ffdf2,_0xe8e89e){return _0x2ffdf2!==_0xe8e89e;},'uAECP':_0x156008[_0x4a9a('‫33')],'UpunQ':function(_0x33a2d9,_0x15a98e){return _0x156008[_0x4a9a('‮34')](_0x33a2d9,_0x15a98e);},'BWPUw':_0x156008[_0x4a9a('‫35')],'aMGOc':_0x156008[_0x4a9a('‫36')],'JlwLI':_0x4a9a('‮37'),'WlTuZ':function(_0x1f0132,_0x2c777d){return _0x1f0132===_0x2c777d;},'NPMin':_0x156008[_0x4a9a('‫38')],'uvjaq':_0x4a9a('‫39'),'dpAXb':function(_0x2b1d34){return _0x2b1d34();}};$[_0x4a9a('‫16')](opt,(_0x52456f,_0x3af82f,_0x1811f5)=>{var _0x348b02={'OgYXr':function(_0x4af190,_0x22d852){return _0x5eac04[_0x4a9a('‫3a')](_0x4af190,_0x22d852);},'FeZDh':function(_0x57ff12,_0x5f3fe3){return _0x57ff12+_0x5f3fe3;}};if(_0x4a9a('‮3b')!==_0x4a9a('‮3b')){_0x348b02[_0x4a9a('‫3c')](_0x1ed2e0,_0x1811f5);}else{try{if(_0x5eac04[_0x4a9a('‮3d')](_0x5eac04[_0x4a9a('‮3e')],_0x5eac04[_0x4a9a('‮3e')])){console[_0x4a9a('‫17')](_0x5eac04[_0x4a9a('‫3f')](_0x5eac04[_0x4a9a('‮40')],res[_0x4a9a('‮41')]));}else{if(_0x52456f){console[_0x4a9a('‫17')](_0x52456f);}else{if(_0x5eac04[_0x4a9a('‫42')](_0x4a9a('‫43'),_0x4a9a('‮44'))){res=JSON[_0x4a9a('‮1b')](_0x1811f5);if(res[_0x4a9a('‮1c')]){if(_0x5eac04[_0x4a9a('‮45')]===_0x5eac04[_0x4a9a('‮45')]){if(res[_0x4a9a('‮41')]){if(_0x5eac04[_0x4a9a('‫42')](_0x5eac04[_0x4a9a('‮46')],_0x5eac04[_0x4a9a('‮47')])){console[_0x4a9a('‫17')](_0x4a9a('‮22')+res[_0x4a9a('‮41')]);}else{console[_0x4a9a('‫17')](error);}}$[_0x4a9a('‮48')]=res[_0x4a9a('‮41')];}else{Host=HostArr[Math[_0x4a9a('‮49')](Math[_0x4a9a('‫4a')]()*HostArr[_0x4a9a('‫4b')])];}}}else{res=JSON[_0x4a9a('‮1b')](_0x1811f5);if(res[_0x4a9a('‮1c')]){if(res[_0x4a9a('‮41')]){console[_0x4a9a('‫17')](_0x348b02[_0x4a9a('‫4c')](_0x4a9a('‮22'),res[_0x4a9a('‮41')]));}$[_0x4a9a('‮48')]=res[_0x4a9a('‮41')];}}}}}catch(_0x1ed6aa){if(_0x5eac04[_0x4a9a('‮4d')](_0x5eac04[_0x4a9a('‫4e')],_0x5eac04[_0x4a9a('‫4f')])){if(_0x1811f5){_0x1811f5=JSON[_0x4a9a('‮1b')](_0x1811f5);if(_0x5eac04[_0x4a9a('‮50')](_0x1811f5[_0x4a9a('‫51')],'0')){$[_0x4a9a('‮52')]=_0x1811f5[_0x4a9a('‮52')];}}else{$[_0x4a9a('‫17')](_0x4a9a('‫53'));}}else{console[_0x4a9a('‫17')](_0x1ed6aa);}}finally{_0x5eac04[_0x4a9a('‮54')](_0x1ed2e0);}}});});}function geth5st(_0x404827,_0x35bf9f){var _0x299472={'hnfUh':function(_0x12ce55,_0x4a355e){return _0x12ce55===_0x4a355e;},'vTUBY':function(_0x2e56e8,_0x1d9682){return _0x2e56e8(_0x1d9682);},'BGjun':_0x4a9a('‮22'),'OTRgF':_0x4a9a('‫55'),'BfLjo':_0x4a9a('‫56'),'Wacca':_0x4a9a('‮57'),'undLi':function(_0x117c4c,_0x350095){return _0x117c4c===_0x350095;},'tMSMz':_0x4a9a('‫58'),'hxLKC':function(_0x1f1dc1,_0xa75e6a){return _0x1f1dc1===_0xa75e6a;},'SUVtl':_0x4a9a('‮59'),'UKxdy':_0x4a9a('‫5a')};return new Promise(async _0x249d72=>{var _0x78a303={'DdmbD':_0x299472[_0x4a9a('‫5b')]};let _0x3fa85b={'appId':_0x299472[_0x4a9a('‮5c')],'body':{'appid':_0x299472[_0x4a9a('‮5d')],'functionId':_0x404827,'body':JSON[_0x4a9a('‮6')](_0x35bf9f),'clientVersion':_0x4a9a('‮5e'),'client':'H5','activityId':$[_0x4a9a('‫21')]},'callbackAll':!![]};let _0x495508='';let _0x1bd8a0=[_0x299472[_0x4a9a('‮5f')]];if(process[_0x4a9a('‫60')][_0x4a9a('‮61')]){if(_0x299472[_0x4a9a('‮62')](_0x299472[_0x4a9a('‫63')],_0x299472[_0x4a9a('‫63')])){_0x495508=process[_0x4a9a('‫60')][_0x4a9a('‮61')];}else{console[_0x4a9a('‫17')](error);}}else{if(_0x299472[_0x4a9a('‫64')](_0x299472[_0x4a9a('‫65')],_0x299472[_0x4a9a('‫66')])){console[_0x4a9a('‫17')](err);}else{_0x495508=_0x1bd8a0[Math[_0x4a9a('‮49')](Math[_0x4a9a('‫4a')]()*_0x1bd8a0[_0x4a9a('‫4b')])];}}let _0x36aaef={'url':_0x4a9a('‮67'),'body':JSON[_0x4a9a('‮6')](_0x3fa85b),'headers':{'Host':_0x495508,'Content-Type':_0x4a9a('‮68')},'timeout':0x1e*0x3e8};$[_0x4a9a('‫69')](_0x36aaef,async(_0x5f47b6,_0x435d2d,_0x3fa85b)=>{try{if(_0x5f47b6){_0x3fa85b=await geth5st[_0x4a9a('‫6a')](this,arguments);}else{}}catch(_0x375a5a){$[_0x4a9a('‫1a')](_0x375a5a,_0x435d2d);}finally{if(_0x299472[_0x4a9a('‮6b')](_0x4a9a('‮6c'),_0x4a9a('‮6d'))){if(res[_0x4a9a('‮41')]){console[_0x4a9a('‫17')](_0x78a303[_0x4a9a('‮6e')]+res[_0x4a9a('‮41')]);}$[_0x4a9a('‮48')]=res[_0x4a9a('‮41')];}else{_0x299472[_0x4a9a('‫6f')](_0x249d72,_0x3fa85b);}}});});}async function getToken(){var _0x40d49f={'FlCtj':function(_0x3ea6d5,_0x266503){return _0x3ea6d5===_0x266503;},'XeTiC':_0x4a9a('‫70'),'mOjUv':function(_0x1079e7,_0x2e68bd){return _0x1079e7===_0x2e68bd;},'hycDy':function(_0x461c08,_0x5dda0d){return _0x461c08!==_0x5dda0d;},'gVVsS':_0x4a9a('‫71'),'AaVof':_0x4a9a('‫72'),'PYhJl':_0x4a9a('‮73'),'wdAaP':_0x4a9a('‮74'),'dDQEp':_0x4a9a('‮0'),'JYHrR':_0x4a9a('‫1'),'fEqsN':_0x4a9a('‮75'),'ixGeo':_0x4a9a('‮76'),'iePLe':_0x4a9a('‫3')};let _0x32791f=await getSign(_0x4a9a('‫77'),{'id':'','url':_0x40d49f[_0x4a9a('‫78')]});let _0x5a5840={'url':_0x4a9a('‮79'),'headers':{'Host':_0x4a9a('‮8'),'Content-Type':_0x40d49f[_0x4a9a('‫7a')],'Accept':_0x40d49f[_0x4a9a('‮7b')],'Connection':_0x40d49f[_0x4a9a('‫7c')],'Cookie':cookie,'User-Agent':_0x40d49f[_0x4a9a('‮7d')],'Accept-Language':_0x40d49f[_0x4a9a('‮7e')],'Accept-Encoding':_0x40d49f[_0x4a9a('‫7f')]},'body':_0x32791f};return new Promise(_0x3f7fec=>{var _0x5dfd32={'yuUuM':function(_0x1a2eb4){return _0x1a2eb4();}};$[_0x4a9a('‫69')](_0x5a5840,(_0xf9ab8a,_0x57b433,_0x416f3a)=>{var _0x1af44c={'ZuHLn':function(_0x33542a,_0x1467e2){return _0x40d49f[_0x4a9a('‫80')](_0x33542a,_0x1467e2);}};if(_0x40d49f[_0x4a9a('‫81')]===_0x4a9a('‮82')){_0x3f7fec();}else{try{if(_0xf9ab8a){$[_0x4a9a('‫17')](_0xf9ab8a);}else{if(_0x416f3a){_0x416f3a=JSON[_0x4a9a('‮1b')](_0x416f3a);if(_0x40d49f[_0x4a9a('‫83')](_0x416f3a[_0x4a9a('‫51')],'0')){if(_0x40d49f[_0x4a9a('‮84')](_0x40d49f[_0x4a9a('‫85')],_0x4a9a('‫71'))){_0x5dfd32[_0x4a9a('‮86')](_0x3f7fec);}else{$[_0x4a9a('‮52')]=_0x416f3a[_0x4a9a('‮52')];}}}else{if(_0x40d49f[_0x4a9a('‫83')](_0x4a9a('‫72'),_0x40d49f[_0x4a9a('‫87')])){$[_0x4a9a('‫17')](_0x4a9a('‫53'));}else{_0x416f3a=JSON[_0x4a9a('‮1b')](_0x416f3a);if(_0x1af44c[_0x4a9a('‫88')](_0x416f3a[_0x4a9a('‫51')],'0')){$[_0x4a9a('‮52')]=_0x416f3a[_0x4a9a('‮52')];}}}}}catch(_0x5bb4da){$[_0x4a9a('‫17')](_0x5bb4da);}finally{_0x3f7fec();}}});});}function getSign(_0x5d2167,_0x387e0e){var _0x1eb4c8={'LYeYg':function(_0x2c1337,_0x1f76ed){return _0x2c1337===_0x1f76ed;},'BTrol':_0x4a9a('‮89'),'bFRHH':function(_0x2de601,_0x393b94){return _0x2de601!==_0x393b94;},'amKju':_0x4a9a('‮8a'),'PsnEL':_0x4a9a('‮8b'),'nuSaY':_0x4a9a('‫8c'),'CVfus':function(_0x21351f,_0x591504){return _0x21351f!==_0x591504;},'VwbiE':_0x4a9a('‫8d'),'ZpElW':_0x4a9a('‫8e'),'gIQAw':function(_0x361480,_0x1a7b2e){return _0x361480*_0x1a7b2e;},'wkEFg':_0x4a9a('‫8f')};return new Promise(async _0x2330a2=>{if(_0x1eb4c8[_0x4a9a('‮90')](_0x1eb4c8[_0x4a9a('‫91')],_0x1eb4c8[_0x4a9a('‮92')])){let _0x1b2414={'functionId':_0x5d2167,'body':JSON[_0x4a9a('‮6')](_0x387e0e),'activityId':$[_0x4a9a('‫21')]};let _0x29abf1='';let _0x165d11=[_0x4a9a('‮57')];if(process[_0x4a9a('‫60')][_0x4a9a('‮61')]){_0x29abf1=process[_0x4a9a('‫60')][_0x4a9a('‮61')];}else{_0x29abf1=_0x165d11[Math[_0x4a9a('‮49')](_0x1eb4c8[_0x4a9a('‫93')](Math[_0x4a9a('‫4a')](),_0x165d11[_0x4a9a('‫4b')]))];}let _0x475549={'url':_0x4a9a('‫94'),'body':JSON[_0x4a9a('‮6')](_0x1b2414),'headers':{'Host':_0x29abf1,'User-Agent':_0x1eb4c8[_0x4a9a('‮95')]},'timeout':0x1e*0x3e8};$[_0x4a9a('‫69')](_0x475549,(_0x388669,_0x11e1c2,_0x1b2414)=>{if(_0x1eb4c8[_0x4a9a('‫96')](_0x4a9a('‮89'),_0x1eb4c8[_0x4a9a('‫97')])){try{if(_0x388669){if(_0x1eb4c8[_0x4a9a('‫98')](_0x1eb4c8[_0x4a9a('‮99')],_0x1eb4c8[_0x4a9a('‮9a')])){console[_0x4a9a('‫17')](''+JSON[_0x4a9a('‮6')](_0x388669));console[_0x4a9a('‫17')]($[_0x4a9a('‫9b')]+_0x4a9a('‮9c'));}else{$[_0x4a9a('‫1f')]=res[_0x4a9a('‮1d')][_0x4a9a('‮1e')][0x0][_0x4a9a('‮20')][_0x4a9a('‫21')];}}else{}}catch(_0x44d4bb){if(_0x1eb4c8[_0x4a9a('‫98')](_0x1eb4c8[_0x4a9a('‮9d')],_0x1eb4c8[_0x4a9a('‮9d')])){_0x2330a2();}else{$[_0x4a9a('‫1a')](_0x44d4bb,_0x11e1c2);}}finally{_0x2330a2(_0x1b2414);}}else{console[_0x4a9a('‫17')](_0x388669);}});}else{_0x2330a2(data);}});};_0xodQ='jsjiami.com.v6';
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
