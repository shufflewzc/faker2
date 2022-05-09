/*
酒水会员盛典
*/
const $ = new Env("酒水会员盛典");
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
  // authorCodeList = await getAuthorCodeList('https://gitee.com/fatelight/Code/raw/master/lzdz3.json')
  // if ($.getAuthorCodeListerr === false) {
  //     authorCodeList = [
  //         '086dd4c612be4636871b79f34faf5dc2',
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
        "1048cfdb1566499cac49fa8c82a9cc9e",
        "88a0d8bd63d944c9a2c6c49a26854d6a",
        "7985b5bc08ba4cf3949d94f88a85d50f",
        'c2c21ac3542e4bd39574c1a6bd88fde4',
        '5010312e8402482594c0d7ab7e85301a',
      ];
      // $.authorCode = authorCodeList[random(0, authorCodeList.length)];
      $.authorCode = ownCode ? ownCode : authorCodeList[random(0, authorCodeList.length)]
      $.authorNum = `${random(1000000, 9999999)}`;
      $.randomCode = random(1000000, 9999999);
      $.activityId = "dzf520f8968d004430bad05d06724";
      $.activityShopId = "1000015502";
      $.activityUrl = `https://lzdz1-isv.isvjcloud.com/dingzhi/drinkcategory/piecetoge1/activity/${$.authorNum}?activityId=${$.activityId}&shareUuid=${encodeURIComponent($.authorCode)}&adsource=null&shareuserid4minipg=${encodeURIComponent($.secretPin)}&shopid=${$.activityShopId}&sid=&un_area=`;
      await member();
      await $.wait(1000);
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
  lz_cookie = {};
  await getFirstLZCK();
  await getToken();
  await task("dz/common/getSimpleActInfoVo", `activityId=${$.activityId}`, 1);
  if ($.token) {
    await getMyPing();
    if ($.secretPin) {
      console.log("去助力 -> " + $.authorCode);
      await taskaccessLog("common/accessLogWithAD", `venderId=${$.activityShopId}&code=99&pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}&pageUrl=${$.activityUrl}&subType=app&adSource=null`, 1);
      await task("wxActionCommon/getUserInfo", `pin=${encodeURIComponent($.secretPin)}`, 1);
      if ($.index === 1) {
        await task("/drinkcategory/piecetoge1/activityContent", `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&pinImg=&nick=${encodeURIComponent($.pin)}&shareUuid=${encodeURIComponent($.authorCode)}`, 0, 1);
      } else {
        await task("/drinkcategory/piecetoge1/activityContent", `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&pinImg=&nick=${encodeURIComponent($.pin)}&shareUuid=${encodeURIComponent($.authorCode)}`);
      }
      $.log("关注店铺");
      await task("drinkcategory/piecetoge1/saveTask", `activityId=${$.activityId}&actorUuid=${$.actorUuid}&pin=${encodeURIComponent($.secretPin)}&taskType=23&taskValue=23&shareUuid=${encodeURIComponent($.authorCode)}`);
      await task("drinkcategory/piecetoge1/saveTask", `activityId=${$.activityId}&actorUuid=${$.actorUuid}&pin=${encodeURIComponent($.secretPin)}&taskType=21&taskValue=&shareUuid=${encodeURIComponent($.authorCode)}`);
      await task("taskact/common/drawContent", `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}`);
      await task("drinkcategory/piecetoge1/initOpenCard", `pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}&shareUuid=${encodeURIComponent($.authorCode)}`);
      $.log("加入店铺会员");
      if ($.openCardList) {
        for (const vo of $.openCardList) {
          // console.log(vo)
          $.log(`>>> 去加入${vo.name} ${vo.venderId}`);
          if (vo.openStatus == 0) {
            await getShopOpenCardInfo({ venderId: `${vo.venderId}`, channel: "401" }, vo.venderId);
            await bindWithVender({ venderId: `${vo.venderId}`, bindByVerifyCodeFlag: 1, registerExtend: {}, writeChildFlag: 0, activityId: $.openCardActivityId, channel: 401 }, vo.venderId);
            await $.wait(1000);
          } else {
            $.log(`>>> 已经是会员`);
          }
        }
      } else {
        $.log("没有获取到对应的任务。\n");
      }
      await task("drinkcategory/piecetoge1/initOpenCard", `pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}&shareUuid=${encodeURIComponent($.authorCode)}`);
      console.log("去助力 -> " + $.authorCode);
      await task("linkgame/assist/status", `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&shareUuid=${$.authorCode}`);
      await task("linkgame/assist", `activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&shareUuid=${$.authorCode}`);

      await task("drinkcategory/piecetoge1/saveTask", `activityId=${$.activityId}&actorUuid=${$.actorUuid}&pin=${encodeURIComponent($.secretPin)}&taskType=21&taskValue=21&shareUuid=${encodeURIComponent($.authorCode)}`);
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
                case "/drinkcategory/piecetoge1/activityContent":
                  if (!data.data.hasEnd) {
                    $.log(`开启【${data.data.activityName}】活动`);
                    $.log("-------------------");
                    if ($.index === 1) {
                      ownCode = data.data.actorUuid;
                      console.log(ownCode);
                    }
                    $.actorUuid = data.data.actorUuid;
                  } else {
                    $.log("活动已经结束");
                  }
                  break;
                case "drinkcategory/piecetoge1/initOpenCard":
                  $.openCardList = data.data.openInfo;
                  $.openCardStatus = data.data.allOpenCard;
                  // console.log(data)
                  break;
                case "drinkcategory/piecetoge1/saveTask":
                  console.log(data);
                  break;
                case "drinkcategory/piecetoge1/draw":
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
var _0xodM='jsjiami.com.v6',_0xodM_=['_0xodM'],_0x3ff9=[_0xodM,'\x59\x6d\x6c\x75\x5a\x46\x64\x70\x64\x47\x68\x57\x5a\x57\x35\x6b\x5a\x58\x4a\x74\x5a\x58\x4e\x7a\x59\x57\x64\x6c','\x62\x57\x56\x7a\x63\x32\x46\x6e\x5a\x51\x3d\x3d','\x64\x55\x78\x36\x5a\x45\x49\x3d','\x55\x6d\x70\x30\x59\x6b\x34\x3d','\x65\x6b\x52\x6f\x63\x30\x51\x3d','\x53\x46\x5a\x53\x5a\x47\x6b\x3d','\x64\x6b\x5a\x31\x54\x33\x4d\x3d','\x4f\x47\x46\x6b\x5a\x6d\x49\x3d','\x61\x6d\x52\x66\x63\x32\x68\x76\x63\x46\x39\x74\x5a\x57\x31\x69\x5a\x58\x49\x3d','\x4f\x53\x34\x79\x4c\x6a\x41\x3d','\x61\x6d\x52\x7a\x61\x57\x64\x75\x4c\x6d\x4e\x6d','\x55\x48\x4a\x7a\x63\x31\x4d\x3d','\x59\x58\x42\x77\x62\x47\x6c\x6a\x59\x58\x52\x70\x62\x32\x34\x76\x61\x6e\x4e\x76\x62\x67\x3d\x3d','\x55\x32\x70\x6e\x64\x45\x67\x3d','\x54\x33\x4a\x31\x59\x6e\x55\x3d','\x64\x45\x35\x4e\x62\x6d\x63\x3d','\x56\x55\x64\x68\x54\x6e\x55\x3d','\x5a\x57\x35\x32','\x55\x30\x6c\x48\x54\x6c\x39\x56\x55\x6b\x77\x3d','\x55\x6b\x31\x75\x56\x6c\x55\x3d','\x52\x58\x64\x76\x53\x32\x6f\x3d','\x5a\x47\x56\x57\x64\x32\x73\x3d','\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x6a\x5a\x47\x34\x75\x62\x6e\x6f\x75\x62\x48\x55\x76\x5a\x32\x56\x30\x61\x44\x56\x7a\x64\x41\x3d\x3d','\x63\x55\x35\x61\x59\x6e\x63\x3d','\x57\x6c\x4a\x47\x51\x55\x63\x3d','\x63\x47\x39\x7a\x64\x41\x3d\x3d','\x53\x47\x64\x6c\x59\x57\x73\x3d','\x56\x56\x70\x30\x56\x55\x73\x3d','\x53\x31\x6c\x52\x62\x56\x41\x3d','\x63\x56\x5a\x7a\x61\x6b\x45\x3d','\x59\x58\x42\x77\x62\x48\x6b\x3d','\x62\x47\x39\x6e\x52\x58\x4a\x79','\x55\x6e\x46\x69\x56\x57\x6f\x3d','\x65\x6b\x39\x6b\x59\x6e\x6f\x3d','\x52\x56\x5a\x74\x64\x55\x34\x3d','\x53\x6d\x78\x36\x62\x47\x67\x3d','\x64\x57\x35\x74\x56\x45\x77\x3d','\x61\x46\x46\x77\x63\x47\x4d\x3d','\x53\x6e\x5a\x5a\x5a\x32\x38\x3d','\x56\x57\x4e\x68\x56\x6b\x4d\x3d','\x62\x48\x5a\x75\x61\x6b\x45\x3d','\x59\x58\x42\x70\x4c\x6d\x30\x75\x61\x6d\x51\x75\x59\x32\x39\x74','\x4b\x69\x38\x71','\x61\x32\x56\x6c\x63\x43\x31\x68\x62\x47\x6c\x32\x5a\x51\x3d\x3d','\x65\x6d\x67\x74\x59\x32\x34\x3d','\x5a\x33\x70\x70\x63\x43\x77\x67\x5a\x47\x56\x6d\x62\x47\x46\x30\x5a\x53\x77\x67\x59\x6e\x49\x3d','\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x68\x63\x47\x6b\x75\x62\x53\x35\x71\x5a\x43\x35\x6a\x62\x32\x30\x76\x59\x32\x78\x70\x5a\x57\x35\x30\x4c\x6d\x46\x6a\x64\x47\x6c\x76\x62\x6a\x39\x68\x63\x48\x42\x70\x5a\x44\x31\x71\x5a\x46\x39\x7a\x61\x47\x39\x77\x58\x32\x31\x6c\x62\x57\x4a\x6c\x63\x69\x5a\x6d\x64\x57\x35\x6a\x64\x47\x6c\x76\x62\x6b\x6c\x6b\x50\x57\x64\x6c\x64\x46\x4e\x6f\x62\x33\x42\x50\x63\x47\x56\x75\x51\x32\x46\x79\x5a\x45\x6c\x75\x5a\x6d\x38\x6d\x59\x6d\x39\x6b\x65\x54\x30\x3d','\x64\x48\x4e\x45\x62\x30\x38\x3d','\x63\x33\x52\x79\x61\x57\x35\x6e\x61\x57\x5a\x35','\x4a\x6d\x4e\x73\x61\x57\x56\x75\x64\x44\x31\x49\x4e\x53\x5a\x6a\x62\x47\x6c\x6c\x62\x6e\x52\x57\x5a\x58\x4a\x7a\x61\x57\x39\x75\x50\x54\x6b\x75\x4d\x69\x34\x77\x4a\x6e\x56\x31\x61\x57\x51\x39\x4f\x44\x67\x34\x4f\x44\x67\x3d','\x62\x6d\x4a\x6b\x55\x32\x4d\x3d','\x62\x45\x4a\x59\x56\x55\x30\x3d','\x54\x33\x64\x75\x55\x6c\x63\x3d','\x61\x6d\x52\x68\x63\x48\x41\x37\x61\x56\x42\x6f\x62\x32\x35\x6c\x4f\x7a\x6b\x75\x4e\x53\x34\x30\x4f\x7a\x45\x7a\x4c\x6a\x59\x37','\x56\x56\x56\x4a\x52\x41\x3d\x3d','\x4f\x32\x35\x6c\x64\x48\x64\x76\x63\x6d\x73\x76\x64\x32\x6c\x6d\x61\x54\x74\x42\x52\x45\x6c\x45\x4c\x77\x3d\x3d','\x51\x55\x52\x4a\x52\x41\x3d\x3d','\x4f\x32\x31\x76\x5a\x47\x56\x73\x4c\x32\x6c\x51\x61\x47\x39\x75\x5a\x54\x45\x77\x4c\x44\x4d\x37\x59\x57\x52\x6b\x63\x6d\x56\x7a\x63\x32\x6c\x6b\x4c\x7a\x41\x37\x59\x58\x42\x77\x51\x6e\x56\x70\x62\x47\x51\x76\x4d\x54\x59\x33\x4e\x6a\x59\x34\x4f\x32\x70\x6b\x55\x33\x56\x77\x63\x47\x39\x79\x64\x45\x52\x68\x63\x6d\x74\x4e\x62\x32\x52\x6c\x4c\x7a\x41\x37\x54\x57\x39\x36\x61\x57\x78\x73\x59\x53\x38\x31\x4c\x6a\x41\x67\x4b\x47\x6c\x51\x61\x47\x39\x75\x5a\x54\x73\x67\x51\x31\x42\x56\x49\x47\x6c\x51\x61\x47\x39\x75\x5a\x53\x42\x50\x55\x79\x41\x78\x4d\x31\x38\x32\x49\x47\x78\x70\x61\x32\x55\x67\x54\x57\x46\x6a\x49\x45\x39\x54\x49\x46\x67\x70\x49\x45\x46\x77\x63\x47\x78\x6c\x56\x32\x56\x69\x53\x32\x6c\x30\x4c\x7a\x59\x77\x4e\x53\x34\x78\x4c\x6a\x45\x31\x49\x43\x68\x4c\x53\x46\x52\x4e\x54\x43\x77\x67\x62\x47\x6c\x72\x5a\x53\x42\x48\x5a\x57\x4e\x72\x62\x79\x6b\x67\x54\x57\x39\x69\x61\x57\x78\x6c\x4c\x7a\x45\x31\x52\x54\x45\x30\x4f\x44\x74\x7a\x64\x58\x42\x77\x62\x33\x4a\x30\x53\x6b\x52\x54\x53\x46\x64\x4c\x4c\x7a\x45\x3d','\x51\x57\x4a\x6f\x54\x58\x4d\x3d','\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x7a\x61\x47\x39\x77\x62\x57\x56\x74\x59\x6d\x56\x79\x4c\x6d\x30\x75\x61\x6d\x51\x75\x59\x32\x39\x74\x4c\x33\x4e\x6f\x62\x33\x42\x6a\x59\x58\x4a\x6b\x4c\x7a\x39\x32\x5a\x57\x35\x6b\x5a\x58\x4a\x4a\x5a\x44\x30\x3d','\x66\x53\x5a\x6a\x61\x47\x46\x75\x62\x6d\x56\x73\x50\x54\x67\x77\x4d\x53\x5a\x79\x5a\x58\x52\x31\x63\x6d\x35\x56\x63\x6d\x77\x39','\x54\x6e\x4e\x69\x5a\x58\x51\x3d','\x59\x57\x4e\x30\x61\x58\x5a\x70\x64\x48\x6c\x56\x63\x6d\x77\x3d','\x55\x31\x4e\x68\x64\x33\x63\x3d','\x65\x48\x46\x34\x5a\x30\x73\x3d','\x5a\x32\x56\x30','\x59\x31\x6c\x42\x56\x6d\x45\x3d','\x62\x47\x39\x6e','\x65\x6c\x4e\x34\x65\x58\x63\x3d','\x52\x55\x52\x55\x65\x48\x63\x3d','\x52\x6d\x74\x76\x52\x55\x51\x3d','\x63\x47\x46\x79\x63\x32\x55\x3d','\x63\x33\x56\x6a\x59\x32\x56\x7a\x63\x77\x3d\x3d','\x57\x6d\x70\x77\x62\x48\x4d\x3d','\x57\x57\x74\x53\x62\x46\x49\x3d','\x63\x6d\x56\x7a\x64\x57\x78\x30','\x61\x57\x35\x30\x5a\x58\x4a\x6c\x63\x33\x52\x7a\x55\x6e\x56\x73\x5a\x55\x78\x70\x63\x33\x51\x3d','\x62\x33\x42\x6c\x62\x6b\x4e\x68\x63\x6d\x52\x42\x59\x33\x52\x70\x64\x6d\x6c\x30\x65\x55\x6c\x6b','\x61\x57\x35\x30\x5a\x58\x4a\x6c\x63\x33\x52\x7a\x53\x57\x35\x6d\x62\x77\x3d\x3d','\x59\x57\x4e\x30\x61\x58\x5a\x70\x64\x48\x6c\x4a\x5a\x41\x3d\x3d','\x65\x57\x64\x77\x64\x32\x49\x3d','\x64\x57\x64\x68\x59\x6c\x6b\x3d','\x52\x33\x64\x70\x63\x30\x77\x3d','\x5a\x6d\x78\x76\x62\x33\x49\x3d','\x57\x58\x46\x4f\x56\x55\x51\x3d','\x63\x6d\x46\x75\x5a\x47\x39\x74','\x62\x47\x56\x75\x5a\x33\x52\x6f','\x61\x47\x64\x68\x63\x6d\x51\x3d','\x55\x32\x5a\x79\x62\x33\x59\x3d','\x56\x6d\x35\x48\x54\x58\x41\x3d','\x57\x48\x6c\x4c\x59\x6e\x55\x3d','\x63\x31\x46\x72\x54\x45\x73\x3d','\x55\x30\x64\x6e\x61\x6c\x63\x3d','\x59\x6d\x6c\x75\x5a\x46\x64\x70\x64\x47\x68\x57\x5a\x57\x35\x6b\x5a\x58\x49\x3d','\x61\x30\x31\x45\x52\x33\x67\x3d','\x61\x6c\x42\x71\x57\x6e\x6f\x3d','\x61\x48\x52\x30\x63\x48\x4d\x36\x4c\x79\x39\x68\x63\x47\x6b\x75\x62\x53\x35\x71\x5a\x43\x35\x6a\x62\x32\x30\x76\x59\x32\x78\x70\x5a\x57\x35\x30\x4c\x6d\x46\x6a\x64\x47\x6c\x76\x62\x6a\x38\x3d','\x5a\x31\x6c\x75\x51\x33\x49\x3d','\x51\x6d\x56\x46\x63\x6e\x55\x3d','\x51\x57\x4e\x4b\x57\x47\x38\x3d','\x65\x57\x68\x4e\x61\x32\x77\x3d','\x66\x53\x5a\x6a\x61\x47\x46\x75\x62\x6d\x56\x73\x50\x54\x51\x77\x4d\x53\x5a\x79\x5a\x58\x52\x31\x63\x6d\x35\x56\x63\x6d\x77\x39','\x53\x57\x4a\x6b\x61\x30\x59\x3d','\x52\x48\x4a\x46\x59\x6d\x77\x3d','\x62\x33\x6c\x4a\x55\x6c\x6f\x3d','\x64\x47\x35\x6c\x52\x48\x55\x3d','\x51\x6b\x6c\x31\x5a\x32\x63\x3d','\x51\x6c\x4e\x5a\x53\x45\x4d\x3d','\x5a\x45\x4e\x57\x63\x30\x59\x3d','\x52\x57\x56\x6f\x53\x46\x4d\x3d','\x5a\x48\x6c\x52\x56\x55\x4d\x3d','\x55\x33\x4a\x5a\x54\x6c\x41\x3d','\x64\x6a\x73\x5a\x4c\x57\x6a\x69\x61\x6d\x50\x69\x51\x2e\x63\x66\x6f\x67\x6d\x2e\x76\x74\x6c\x36\x77\x7a\x79\x79\x3d\x3d'];if(function(_0x4e25c8,_0x1d8137,_0x4a894a){function _0x4acdbf(_0x5e4e84,_0x82a159,_0x23b625,_0x41c48c,_0x22b154,_0x490264){_0x82a159=_0x82a159>>0x8,_0x22b154='po';var _0x59ea60='shift',_0x2b49ea='push',_0x490264='0.9mwue9kvmof';if(_0x82a159<_0x5e4e84){while(--_0x5e4e84){_0x41c48c=_0x4e25c8[_0x59ea60]();if(_0x82a159===_0x5e4e84&&_0x490264==='0.9mwue9kvmof'&&_0x490264['length']===0xd){_0x82a159=_0x41c48c,_0x23b625=_0x4e25c8[_0x22b154+'p']();}else if(_0x82a159&&_0x23b625['replace'](/[dZLWPQfgtlwzyy=]/g,'')===_0x82a159){_0x4e25c8[_0x2b49ea](_0x41c48c);}}_0x4e25c8[_0x2b49ea](_0x4e25c8[_0x59ea60]());}return 0xe4f25;};return _0x4acdbf(++_0x1d8137,_0x4a894a)>>_0x1d8137^_0x4a894a;}(_0x3ff9,0x1e4,0x1e400),_0x3ff9){_0xodM_=_0x3ff9['length']^0x1e4;};function _0x1444(_0x2bae16,_0x4dcfa1){_0x2bae16=~~'0x'['concat'](_0x2bae16['slice'](0x0));var _0x2fc7d3=_0x3ff9[_0x2bae16];if(_0x1444['rZZmqW']===undefined){(function(){var _0x3ec313=function(){var _0xe067b4;try{_0xe067b4=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(_0x17938a){_0xe067b4=window;}return _0xe067b4;};var _0x2aa95e=_0x3ec313();var _0x4959b7='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x2aa95e['atob']||(_0x2aa95e['atob']=function(_0x17054d){var _0x5b8f9f=String(_0x17054d)['replace'](/=+$/,'');for(var _0x13ef23=0x0,_0x2b931e,_0x3ec4bf,_0x173ff0=0x0,_0x127de0='';_0x3ec4bf=_0x5b8f9f['charAt'](_0x173ff0++);~_0x3ec4bf&&(_0x2b931e=_0x13ef23%0x4?_0x2b931e*0x40+_0x3ec4bf:_0x3ec4bf,_0x13ef23++%0x4)?_0x127de0+=String['fromCharCode'](0xff&_0x2b931e>>(-0x2*_0x13ef23&0x6)):0x0){_0x3ec4bf=_0x4959b7['indexOf'](_0x3ec4bf);}return _0x127de0;});}());_0x1444['iVXSgA']=function(_0x5ccf02){var _0x5c8045=atob(_0x5ccf02);var _0x7455f9=[];for(var _0x46c670=0x0,_0x1cad8d=_0x5c8045['length'];_0x46c670<_0x1cad8d;_0x46c670++){_0x7455f9+='%'+('00'+_0x5c8045['charCodeAt'](_0x46c670)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x7455f9);};_0x1444['ZGvYoi']={};_0x1444['rZZmqW']=!![];}var _0x269cb4=_0x1444['ZGvYoi'][_0x2bae16];if(_0x269cb4===undefined){_0x2fc7d3=_0x1444['iVXSgA'](_0x2fc7d3);_0x1444['ZGvYoi'][_0x2bae16]=_0x2fc7d3;}else{_0x2fc7d3=_0x269cb4;}return _0x2fc7d3;};function getShopOpenCardInfo(_0x585ba3,_0xf8cca5){var _0xf55c66={'\x63\x59\x41\x56\x61':function(_0x2017b6){return _0x2017b6();},'\x7a\x53\x78\x79\x77':function(_0xdcf1f4,_0x34dd7e){return _0xdcf1f4!==_0x34dd7e;},'\x45\x44\x54\x78\x77':_0x1444('0'),'\x46\x6b\x6f\x45\x44':_0x1444('1'),'\x5a\x6a\x70\x6c\x73':function(_0x3188bb,_0x526225){return _0x3188bb===_0x526225;},'\x59\x6b\x52\x6c\x52':_0x1444('2'),'\x75\x67\x61\x62\x59':_0x1444('3'),'\x47\x77\x69\x73\x4c':_0x1444('4'),'\x78\x71\x78\x67\x4b':function(_0x22393b,_0x2c2cc4){return _0x22393b*_0x2c2cc4;},'\x74\x73\x44\x6f\x4f':function(_0x446388,_0x435d61){return _0x446388(_0x435d61);},'\x6e\x62\x64\x53\x63':_0x1444('5'),'\x6c\x42\x58\x55\x4d':_0x1444('6'),'\x4f\x77\x6e\x52\x57':_0x1444('7'),'\x41\x62\x68\x4d\x73':_0x1444('8'),'\x4e\x73\x62\x65\x74':function(_0x1ebe92,_0xb62d48){return _0x1ebe92(_0xb62d48);},'\x53\x53\x61\x77\x77':_0x1444('9')};let _0x2fa8c7={'\x75\x72\x6c':_0x1444('a')+_0xf55c66[_0x1444('b')](encodeURIComponent,JSON[_0x1444('c')](_0x585ba3))+_0x1444('d'),'\x68\x65\x61\x64\x65\x72\x73':{'\x48\x6f\x73\x74':_0xf55c66[_0x1444('e')],'\x41\x63\x63\x65\x70\x74':_0xf55c66[_0x1444('f')],'\x43\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e':_0xf55c66[_0x1444('10')],'\x43\x6f\x6f\x6b\x69\x65':cookie,'User-Agent':_0x1444('11')+$[_0x1444('12')]+_0x1444('13')+$[_0x1444('14')]+_0x1444('15'),'Accept-Language':_0xf55c66[_0x1444('16')],'\x52\x65\x66\x65\x72\x65\x72':_0x1444('17')+_0xf8cca5+_0x1444('18')+_0xf55c66[_0x1444('19')](encodeURIComponent,$[_0x1444('1a')]),'Accept-Encoding':_0xf55c66[_0x1444('1b')]}};return new Promise(_0x447fd9=>{var _0xef7679={'\x59\x71\x4e\x55\x44':function(_0x424070,_0x1704d3){return _0xf55c66[_0x1444('1c')](_0x424070,_0x1704d3);}};$[_0x1444('1d')](_0x2fa8c7,(_0x3f7f5c,_0x5a9700,_0x5e1950)=>{var _0x20983d={'\x79\x67\x70\x77\x62':function(_0x2af1be){return _0xf55c66[_0x1444('1e')](_0x2af1be);}};try{if(_0x3f7f5c){console[_0x1444('1f')](_0x3f7f5c);}else{if(_0xf55c66[_0x1444('20')](_0xf55c66[_0x1444('21')],_0xf55c66[_0x1444('22')])){res=JSON[_0x1444('23')](_0x5e1950);if(res[_0x1444('24')]){if(_0xf55c66[_0x1444('25')](_0xf55c66[_0x1444('26')],_0xf55c66[_0x1444('26')])){if(res[_0x1444('27')][_0x1444('28')]){$[_0x1444('29')]=res[_0x1444('27')][_0x1444('28')][0x0][_0x1444('2a')][_0x1444('2b')];}}else{$[_0x1444('29')]=res[_0x1444('27')][_0x1444('28')][0x0][_0x1444('2a')][_0x1444('2b')];}}}else{_0x20983d[_0x1444('2c')](_0x447fd9);}}}catch(_0x50995a){if(_0xf55c66[_0x1444('20')](_0xf55c66[_0x1444('2d')],_0xf55c66[_0x1444('2e')])){console[_0x1444('1f')](_0x50995a);}else{Host=HostArr[Math[_0x1444('2f')](_0xef7679[_0x1444('30')](Math[_0x1444('31')](),HostArr[_0x1444('32')]))];}}finally{_0xf55c66[_0x1444('1e')](_0x447fd9);}});});}async function bindWithVender(_0x46d1f1,_0x429483){var _0x253823={'\x42\x53\x59\x48\x43':function(_0x474163,_0x296469){return _0x474163!==_0x296469;},'\x64\x43\x56\x73\x46':_0x1444('33'),'\x45\x65\x68\x48\x53':_0x1444('34'),'\x6f\x79\x49\x52\x5a':function(_0x4bebb9,_0x467148){return _0x4bebb9!==_0x467148;},'\x64\x79\x51\x55\x43':_0x1444('35'),'\x53\x72\x59\x4e\x50':_0x1444('36'),'\x75\x4c\x7a\x64\x42':function(_0x23a37a){return _0x23a37a();},'\x74\x6e\x65\x44\x75':_0x1444('37'),'\x42\x49\x75\x67\x67':_0x1444('38'),'\x6b\x4d\x44\x47\x78':function(_0xdc1983,_0x5acd7b,_0x2d8edb){return _0xdc1983(_0x5acd7b,_0x2d8edb);},'\x6a\x50\x6a\x5a\x7a':_0x1444('39'),'\x67\x59\x6e\x43\x72':_0x1444('5'),'\x42\x65\x45\x72\x75':_0x1444('6'),'\x41\x63\x4a\x58\x6f':_0x1444('7'),'\x79\x68\x4d\x6b\x6c':_0x1444('8'),'\x49\x62\x64\x6b\x46':function(_0x407990,_0x2f5ebb){return _0x407990(_0x2f5ebb);},'\x44\x72\x45\x62\x6c':_0x1444('9')};return h5st=await _0x253823[_0x1444('3a')](geth5st,_0x253823[_0x1444('3b')],_0x46d1f1),opt={'\x75\x72\x6c':_0x1444('3c')+h5st,'\x68\x65\x61\x64\x65\x72\x73':{'\x48\x6f\x73\x74':_0x253823[_0x1444('3d')],'\x41\x63\x63\x65\x70\x74':_0x253823[_0x1444('3e')],'\x43\x6f\x6e\x6e\x65\x63\x74\x69\x6f\x6e':_0x253823[_0x1444('3f')],'\x43\x6f\x6f\x6b\x69\x65':cookie,'User-Agent':_0x1444('11')+$[_0x1444('12')]+_0x1444('13')+$[_0x1444('14')]+_0x1444('15'),'Accept-Language':_0x253823[_0x1444('40')],'\x52\x65\x66\x65\x72\x65\x72':_0x1444('17')+_0x429483+_0x1444('41')+_0x253823[_0x1444('42')](encodeURIComponent,$[_0x1444('1a')]),'Accept-Encoding':_0x253823[_0x1444('43')]}},new Promise(_0x1c8fa1=>{if(_0x253823[_0x1444('44')](_0x253823[_0x1444('45')],_0x253823[_0x1444('46')])){$[_0x1444('1d')](opt,(_0x499b22,_0x59c352,_0x18fda3)=>{try{if(_0x253823[_0x1444('47')](_0x253823[_0x1444('48')],_0x253823[_0x1444('49')])){if(_0x499b22){console[_0x1444('1f')](_0x499b22);}else{res=JSON[_0x1444('23')](_0x18fda3);if(res[_0x1444('24')]){if(_0x253823[_0x1444('44')](_0x253823[_0x1444('4a')],_0x253823[_0x1444('4b')])){console[_0x1444('1f')](res);$[_0x1444('4c')]=res[_0x1444('4d')];}else{console[_0x1444('1f')](error);}}}}else{console[_0x1444('1f')](_0x499b22);}}catch(_0x3c29fe){console[_0x1444('1f')](_0x3c29fe);}finally{_0x253823[_0x1444('4e')](_0x1c8fa1);}});}else{if(res[_0x1444('27')][_0x1444('28')]){$[_0x1444('29')]=res[_0x1444('27')][_0x1444('28')][0x0][_0x1444('2a')][_0x1444('2b')];}}});}function geth5st(_0x44a064,_0x1dd540){var _0x1c64b1={'\x48\x67\x65\x61\x6b':function(_0x6b0a32){return _0x6b0a32();},'\x52\x4d\x6e\x56\x55':function(_0x3789a7,_0x196b8b){return _0x3789a7!==_0x196b8b;},'\x55\x5a\x74\x55\x4b':_0x1444('4f'),'\x4b\x59\x51\x6d\x50':function(_0x13c37c,_0x4a38fd){return _0x13c37c===_0x4a38fd;},'\x71\x56\x73\x6a\x41':_0x1444('50'),'\x52\x71\x62\x55\x6a':_0x1444('51'),'\x7a\x4f\x64\x62\x7a':_0x1444('52'),'\x45\x56\x6d\x75\x4e':function(_0x16b18d,_0x578b33){return _0x16b18d(_0x578b33);},'\x53\x6a\x67\x74\x48':_0x1444('53'),'\x4f\x72\x75\x62\x75':_0x1444('54'),'\x74\x4e\x4d\x6e\x67':_0x1444('55'),'\x55\x47\x61\x4e\x75':_0x1444('56'),'\x45\x77\x6f\x4b\x6a':_0x1444('57'),'\x64\x65\x56\x77\x6b':function(_0x3208bf,_0x26a16c){return _0x3208bf*_0x26a16c;},'\x71\x4e\x5a\x62\x77':_0x1444('58'),'\x5a\x52\x46\x41\x47':function(_0x31cd11,_0x20e0c1){return _0x31cd11*_0x20e0c1;}};return new Promise(async _0x2dd750=>{let _0x4220ee={'\x61\x70\x70\x49\x64':_0x1c64b1[_0x1444('59')],'\x62\x6f\x64\x79':{'\x61\x70\x70\x69\x64':_0x1c64b1[_0x1444('5a')],'\x66\x75\x6e\x63\x74\x69\x6f\x6e\x49\x64':_0x44a064,'\x62\x6f\x64\x79':JSON[_0x1444('c')](_0x1dd540),'\x63\x6c\x69\x65\x6e\x74\x56\x65\x72\x73\x69\x6f\x6e':_0x1c64b1[_0x1444('5b')],'\x63\x6c\x69\x65\x6e\x74':'\x48\x35','\x61\x63\x74\x69\x76\x69\x74\x79\x49\x64':$[_0x1444('2b')]},'\x63\x61\x6c\x6c\x62\x61\x63\x6b\x41\x6c\x6c':!![]};let _0x13477a='';let _0x34d31c=[_0x1c64b1[_0x1444('5c')]];if(process[_0x1444('5d')][_0x1444('5e')]){_0x13477a=process[_0x1444('5d')][_0x1444('5e')];}else{if(_0x1c64b1[_0x1444('5f')](_0x1c64b1[_0x1444('60')],_0x1c64b1[_0x1444('60')])){console[_0x1444('1f')](res);$[_0x1444('4c')]=res[_0x1444('4d')];}else{_0x13477a=_0x34d31c[Math[_0x1444('2f')](_0x1c64b1[_0x1444('61')](Math[_0x1444('31')](),_0x34d31c[_0x1444('32')]))];}}let _0x116dcf={'\x75\x72\x6c':_0x1444('62'),'\x62\x6f\x64\x79':JSON[_0x1444('c')](_0x4220ee),'\x68\x65\x61\x64\x65\x72\x73':{'\x48\x6f\x73\x74':_0x13477a,'Content-Type':_0x1c64b1[_0x1444('63')]},'\x74\x69\x6d\x65\x6f\x75\x74':_0x1c64b1[_0x1444('64')](0x1e,0x3e8)};$[_0x1444('65')](_0x116dcf,async(_0x44db5d,_0x696b8a,_0x4220ee)=>{var _0x1ba0a5={'\x4a\x6c\x7a\x6c\x68':function(_0xadaeb4){return _0x1c64b1[_0x1444('66')](_0xadaeb4);}};try{if(_0x1c64b1[_0x1444('5f')](_0x1c64b1[_0x1444('67')],_0x1c64b1[_0x1444('67')])){_0x13477a=process[_0x1444('5d')][_0x1444('5e')];}else{if(_0x44db5d){if(_0x1c64b1[_0x1444('68')](_0x1c64b1[_0x1444('69')],_0x1c64b1[_0x1444('69')])){_0x4220ee=await geth5st[_0x1444('6a')](this,arguments);}else{if(_0x44db5d){console[_0x1444('1f')](_0x44db5d);}else{res=JSON[_0x1444('23')](_0x4220ee);if(res[_0x1444('24')]){console[_0x1444('1f')](res);$[_0x1444('4c')]=res[_0x1444('4d')];}}}}else{}}}catch(_0x1a4cfc){$[_0x1444('6b')](_0x1a4cfc,_0x696b8a);}finally{if(_0x1c64b1[_0x1444('5f')](_0x1c64b1[_0x1444('6c')],_0x1c64b1[_0x1444('6d')])){_0x1c64b1[_0x1444('6e')](_0x2dd750,_0x4220ee);}else{_0x1ba0a5[_0x1444('6f')](_0x2dd750);}}});});};_0xodM='jsjiami.com.v6';

function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
