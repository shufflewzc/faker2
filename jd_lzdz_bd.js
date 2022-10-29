/*
11.11拼出精彩 拼出惊喜
*/
const $ = new Env("11.11拼出精彩 拼出惊喜");
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
    $.msg(
      $.name,
      "【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取",
      "https://bean.m.jd.com/bean/signIndex.action",
      { "open-url": "https://bean.m.jd.com/bean/signIndex.action" }
    );
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      originCookie = cookiesArr[i];
      newCookie = "";
      $.UserName = decodeURIComponent(
        cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1]
      );
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = "";
      await checkCookie();
      console.log(
        `\n******开始【京东账号${$.index}】${
          $.nickName || $.UserName
        }*********\n`
      );
      if (!$.isLogin) {
        $.msg(
          $.name,`【提示】cookie已失效`,`京东账号${$.index} ${
            $.nickName || $.UserName
          }\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`,
          { "open-url": "https://bean.m.jd.com/bean/signIndex.action" }
        );
        // if ($.isNode()) {
        //     await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        // }
        continue;
      }
      $.bean = 0;
      $.ADID = getUUID("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", 1);
      $.UUID = getUUID("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
      authorCodeList = [
        "276679b4180542ebb3bb4e2716ee931c",
        // '3d49aaaf206f43918db9285e09c20b54',
        // '4d67eec71b684cb8a49f37e4cabeefa0',
      ];
      // $.authorCode = authorCodeList[random(0, authorCodeList.length)];
      $.authorCode = ownCode ? ownCode : authorCodeList[random(0, authorCodeList.length)]
      $.authorNum = `${random(1000000, 9999999)}`;
      $.randomCode = random(1000000, 9999999);
      $.activityId = "90522102702";
      $.activityShopId = "1000010410";
      $.activityUrl = `https://lzdz-isv.isvjcloud.com/dingzhi/bd/common/activity/${$.authorNum}?activityId=${$.activityId}&shareUuid=${encodeURIComponent($.authorCode)}&adsource=null&shareuserid4minipg=${encodeURIComponent($.secretPin)}&shopid=undefined&from=kouling&sid=&un_area=`;
      await member();
      await $.wait(5000);
      if ($.bean > 0) {
        message += `\n【京东账号${$.index}】${
          $.nickName || $.UserName
        } \n       └ 获得 ${$.bean} 京豆。`;
      }
    }
  }
  if (message !== "") {
    if ($.isNode()) {
      console.log(message);
      // await notify.sendNotify($.name, message, "", `\n`);
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
  $.venderList = []
  $.vip = []
  await getFirstLZCK();
  await getToken();
  await task("dz/common/getSimpleActInfoVo", `activityId=${$.activityId}`, 1);
  if ($.token) {
    await getMyPing();
    if ($.secretPin) {
      console.log("去助力 -> " + $.authorCode);
      await task("common/accessLogWithAD",`venderId=${$.activityShopId}&code=99&pin=${encodeURIComponent($.secretPin)}&activityId=${$.activityId}&pageUrl=${$.activityUrl}&subType=app&adSource=`,1);
      await $.wait(1000);
      await task("wxActionCommon/getUserInfo",`pin=${encodeURIComponent($.secretPin)}`,1);
      await task("union/picpuzzle/activityContent",`activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&pinImg=${encodeURIComponent('http://storage.360buyimg.com/i.imageUpload/6a645f3739323935653866636434313531363631333330373036343535_mid.jpg')}&nick=${encodeURIComponent($.pin)}&cjyxPin=&cjhyPin=&shareUuid=${encodeURIComponent($.authorCode)}&adSource=null`,0);
      console.log($.actorUuid);
      $.log("获取任务");
      $.myInfo = Date.now();
      await task(`union/picpuzzle/myInfo?_=${$.myInfo}`,`activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&uid=${$.actorUuid}`,0);
      $.log("开始任务");
      $.doTask = Date.now();
      await $.wait(1000);
      await task(`union/picpuzzle/doTask?_=${$.doTask}`,`taskId=followshop&param=&activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&uid=${encodeURIComponent($.actorUuid)}`,0);
      $.log("加入店铺会员");

      
      if ($.openCardList) {
        for (const vo of $.openCardList) {
          $.log(`>>> 去加入 ${vo}`);
          $.log(`>>> 准备加入会员`);
              await bindWithVender({ venderId: vo, bindByVerifyCodeFlag: 1, registerExtend: {}, writeChildFlag: 0, activityId: 2317870, channel: 401 }, vo)
              await $.wait(5000);
        }
      } else {
        $.log("没有获取到对应的任务。\n");
      }
      await $.wait(1000);
      $.log("helpFriend");
      await task("union/picpuzzle/activityContent",`activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&pinImg=${encodeURIComponent('http://storage.360buyimg.com/i.imageUpload/6a645f3739323935653866636434313531363631333330373036343535_mid.jpg')}&nick=${encodeURIComponent($.pin)}&cjyxPin=&cjhyPin=&shareUuid=${encodeURIComponent($.authorCode)}&adSource=null`,0);
      await $.wait(1000);
      $.helpFriend = Date.now();
      await task(`union/picpuzzle/helpFriend?_=${$.helpFriend}`,`activityId=${$.activityId}&pin=${encodeURIComponent($.secretPin)}&shareUuid=${$.authorCode}&uid=${encodeURIComponent($.actorUuid)}`,0);
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
            // console.log(resp);
            if (data.result) {
              switch (function_id) {
                case "dz/common/getSimpleActInfoVo":
                  $.jdActivityId = data.data.jdActivityId;
                  $.venderId = data.data.venderId;
                  $.activityType = data.data.activityType;
                  console.log($.venderId )
                  break;
                case "wxActionCommon/getUserInfo":
                  // console.log(data)
                  break;
                case "union/picpuzzle/activityContent":
                  if (!data.data.hasEnd) {
                    $.log(`开启【${data.data.activityName}】活动`);
                    $.log("-------------------");
                    if ($.index === 1) {
                      ownCode = data.data.userInfo.uid;
                      console.log(ownCode);
                    }
                    console.log(data.data.userInfo);
                    $.actorUuid = data.data.userInfo.uid;
                  } else {
                    $.log("活动已经结束");
                  }
                  break;
                case `union/picpuzzle/myInfo?_=${$.myInfo}`:
                  for (const vo of data.data.venderList) {
                    $.venderList.push(vo.venderId)
                  }
                  // console.log($.venderList)
                  for (const vo of data.data.vip) {
                    $.vip.push(vo.venderId)
                  }
                  // console.log($.vip)
                  $.openCardList = $.venderList.filter(function(v){ return $.vip.indexOf(v) == -1 })
                  console.log($.openCardList)
                  break;
                case `union/picpuzzle/doTask?_=${$.doTask}`:
                  console.log(data);
                  break;
                case `union/picpuzzle/helpFriend?_=${$.helpFriend}`:
                  console.log(data);
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
              lz_cookie[
                sk.split(";")[0].substr(0, sk.split(";")[0].indexOf("="))
              ] = sk.split(";")[0].substr(sk.split(";")[0].indexOf("=") + 1);
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

function taskUrl(function_id, body, isCommon) {
  if (function_id === `union/picpuzzle/doTask?_=${$.followshop}`) {
    console.log({
      url: isCommon
        ? `https://lzdz-isv.isvjcloud.com/${function_id}`
        : `https://lzdz-isv.isvjcloud.com/dingzhi/${function_id}`,
      body: body,
    });
  }
  return {
    url: isCommon
      ? `https://lzdz-isv.isvjcloud.com/${function_id}`
      : `https://lzdz-isv.isvjcloud.com/dingzhi/${function_id}`,
    headers: {
      Host: "lzdz-isv.isvjcloud.com",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "Accept-Language": "zh-cn",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: "https://lzdz-isv.isvjcloud.com",
      "User-Agent": `jdapp;iPhone;9.5.4;13.6;${$.UUID};network/wifi;ADID/${$.ADID};model/iPhone10,3;addressid/0;appBuild/167668;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
      Connection: "keep-alive",
      Referer: $.activityUrl,
      Cookie: $.cookie,
    },
    body: body,
  };
}

function getMyPing() {
  let opt = {
    url: `https://lzdz-isv.isvjcloud.com/dingzhi/bd/common/getMyPing`,
    headers: {
      Host: "lzdz-isv.isvjcloud.com",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "Accept-Language": "zh-cn",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: "https://lzdz-isv.isvjcloud.com",
      "User-Agent": `jdapp;iPhone;9.5.4;13.6;${$.UUID};network/wifi;ADID/${$.ADID};model/iPhone10,3;addressid/0;appBuild/167668;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`,
      Connection: "keep-alive",
      Referer: $.activityUrl,
      Cookie: cookie,
    },
    body: `userId=${$.activityShopId}&token=${$.token}&fromType=APP&activityId=${$.activityId}`,
  };
  return new Promise((resolve) => {
    $.post(opt, (err, resp, data) => {
      try {
        if (err) {
          $.log(err);
        } else {
          if (resp["headers"]["set-cookie"]) {
            cookie = `${originCookie}`;
            // console.log(resp["headers"])
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
              cookie = `${cookie}AUTH_C_USER=${data.data.secretPin}`;
            } else {
              $.log(data.errorMessage);
            }
          } else {
            $.log("京东返回了空数据");
          }
          // console.log(cookie)
          $.cookie = cookie
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
          "user-agent":
            "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
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

function random(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function getUUID(
  format = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  UpperCase = 0
) {
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
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Mobile/15E148 Safari/604.1",
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
var _0xodY='jsjiami.com.v6',_0xodY_=['‮_0xodY'],_0x5960=[_0xodY,'R1Bld1I=','cVRGWE4=','enFpaWM=','WkRzaEY=','YnJlTWU=','bmZCaUw=','SFpFY2E=','YUhnVHE=','R1hyUEQ=','WWhJUmk=','YXBpLm0uamQuY29t','Ki8q','a2VlcC1hbGl2ZQ==','emgtY24=','aHR0cHM6Ly9hcGkubS5qZC5jb20vY2xpZW50LmFjdGlvbj9hcHBpZD1qZF9zaG9wX21lbWJlciZmdW5jdGlvbklkPWdldFNob3BPcGVuQ2FyZEluZm8mYm9keT0=','c3RyaW5naWZ5','JmNsaWVudD1INSZjbGllbnRWZXJzaW9uPTkuMi4wJnV1aWQ9ODg4ODg=','Q3loalA=','aGtLTHI=','VkxaZlU=','amRhcHA7aVBob25lOzkuNS40OzEzLjY7','VVVJRA==','O25ldHdvcmsvd2lmaTtBRElELw==','QURJRA==','O21vZGVsL2lQaG9uZTEwLDM7YWRkcmVzc2lkLzA7YXBwQnVpbGQvMTY3NjY4O2pkU3VwcG9ydERhcmtNb2RlLzA7TW96aWxsYS81LjAgKGlQaG9uZTsgQ1BVIGlQaG9uZSBPUyAxM182IGxpa2UgTWFjIE9TIFgpIEFwcGxlV2ViS2l0LzYwNS4xLjE1IChLSFRNTCwgbGlrZSBHZWNrbykgTW9iaWxlLzE1RTE0ODtzdXBwb3J0SkRTSFdLLzE=','dWJ2QmE=','aHR0cHM6Ly9zaG9wbWVtYmVyLm0uamQuY29tL3Nob3BjYXJkLz92ZW5kZXJJZD0=','fSZjaGFubmVsPTgwMSZyZXR1cm5Vcmw9','TWdKYk0=','YWN0aXZpdHlVcmw=','Z3ppcCwgZGVmbGF0ZSwgYnI=','Z2V0','THlRWUM=','Z052Wk8=','bG9n','VWp3ZWE=','bmx1Vm8=','cGFyc2U=','c3VjY2Vzcw==','cmVzdWx0','aW50ZXJlc3RzUnVsZUxpc3Q=','b3BlbkNhcmRBY3Rpdml0eUlk','aW50ZXJlc3RzSW5mbw==','YWN0aXZpdHlJZA==','bmFtZQ==','IGdldFNpZ24gQVBJ6K+35rGC5aSx6LSl77yM6K+35qOA5p+l572R6Lev6YeN6K+V','TVlERFU=','Sk1Gb3Y=','Pj4+IA==','aEh5YXQ=','aW1RWWg=','YmluZFdpdGhWZW5kZXI=','aHR0cHM6Ly9hcGkubS5qZC5jb20vY2xpZW50LmFjdGlvbj8=','Y0RRcnQ=','cmdrcUE=','fSZjaGFubmVsPTQwMSZyZXR1cm5Vcmw9','Smt3d1c=','Q3FVaVM=','d0ZHeFU=','Zmxvb3I=','cmFuZG9t','bGVuZ3Ro','bWVzc2FnZQ==','V3NRaWM=','amlvdUs=','bXdPSW0=','WE1PTEw=','YmluZFdpdGhWZW5kZXJtZXNzYWdl','ZGliU1M=','SVFHbWY=','bG9nRXJy','YldHQVU=','SG5Bcno=','amRfc2hvcF9tZW1iZXI=','OS4yLjA=','amRzaWduLmV1Lm9yZw==','REtTelE=','cHVERnQ=','YXBwbGljYXRpb24vanNvbg==','blVaVlU=','QXpSclA=','VXRvU0c=','OGFkZmI=','SkVPdW4=','TnBLcEg=','WEdCTUE=','ZW52','U0lHTl9VUkw=','TlJCZFQ=','bW91WnA=','Z0Vpc3U=','THZWdEI=','RW1MakE=','aHR0cHM6Ly9jZG4ubnoubHUvZ2V0aDVzdA==','VkVvU2c=','Q1FnZkE=','cG9zdA==','YXBwbHk=','Y1FpamU=','cG5ZVUk=','SW5odE4=','WXhyaUQ=','bWtZdHM=','5Lqs5Lic6L+U5Zue5LqG56m65pWw5o2u','ZHhBbnU=','aXN2T2JmdXNjYXRvcg==','aHR0cHM6Ly9semR6MS1pc3YuaXN2amNsb3VkLmNvbQ==','YXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVk','SkQ0aVBob25lLzE2NzY1MCAoaVBob25lOyBpT1MgMTMuNzsgU2NhbGUvMy4wMCk=','emgtSGFucy1DTjtxPTE=','SXNybXE=','R0VVcHo=','T0dkTkg=','aHR0cHM6Ly9hcGkubS5qZC5jb20vY2xpZW50LmFjdGlvbj9mdW5jdGlvbklkPWlzdk9iZnVzY2F0b3I=','dllPWlA=','bnlSbFQ=','ZHFqQmg=','aldYYk4=','SXZjdks=','Y2tHcHo=','RGZuelU=','dnZOenA=','cWlybnA=','dWJZWm4=','Y29kZQ==','VmNPT28=','ZFBLZnM=','dG9rZW4=','T1ZhS0g=','ZERGU00=','TE5mWGo=','S1ppTHQ=','RlhFSEI=','cmtqaUY=','S0dOR3Y=','aEtlRkc=','RU1WeWs=','aWV5d1k=','c2JnQWI=','TW96aWxsYS81LjAgKGlQaG9uZTsgQ1BVIGlQaG9uZSBPUyAxM18yXzMgbGlrZSBNYWMgT1MgWCkgQXBwbGVXZWJLaXQvNjA1LjEuMTUgKEtIVE1MLCBsaWtlIEdlY2tvKSBWZXJzaW9uLzEzLjAuMyBNb2JpbGUvMTVFMTQ4IFNhZmFyaS82MDQuMSBFZGcvODcuMC40MjgwLjg4','R0ljcVM=','enJRSW8=','V3Zaa0o=','Ymdta04=','d2VrVW8=','cHZEbUY=','RnZLb1U=','eHZTWVM=','WFNPVmI=','WmF0bk8=','a055VmY=','cmpseEU=','QXJ6eks=','aHR0cHM6Ly9jZG4ubnoubHUvZGRv','aVN3T0Y=','jgsAWjdXiFbaCmi.gcOunoDm.lv6O=='];if(function(_0x5b28c8,_0x3e963c,_0x51985a){function _0x461a1f(_0x4b5c77,_0x33a5af,_0x9dab72,_0x45558d,_0x43b0f3,_0x4eb217){_0x33a5af=_0x33a5af>>0x8,_0x43b0f3='po';var _0x17f72f='shift',_0x3586d5='push',_0x4eb217='‮';if(_0x33a5af<_0x4b5c77){while(--_0x4b5c77){_0x45558d=_0x5b28c8[_0x17f72f]();if(_0x33a5af===_0x4b5c77&&_0x4eb217==='‮'&&_0x4eb217['length']===0x1){_0x33a5af=_0x45558d,_0x9dab72=_0x5b28c8[_0x43b0f3+'p']();}else if(_0x33a5af&&_0x9dab72['replace'](/[gAWdXFbCgOunDlO=]/g,'')===_0x33a5af){_0x5b28c8[_0x3586d5](_0x45558d);}}_0x5b28c8[_0x3586d5](_0x5b28c8[_0x17f72f]());}return 0x10e686;};return _0x461a1f(++_0x3e963c,_0x51985a)>>_0x3e963c^_0x51985a;}(_0x5960,0x1d9,0x1d900),_0x5960){_0xodY_=_0x5960['length']^0x1d9;};function _0x2b92(_0x5ae9fc,_0xb11279){_0x5ae9fc=~~'0x'['concat'](_0x5ae9fc['slice'](0x1));var _0x137400=_0x5960[_0x5ae9fc];if(_0x2b92['NLrDTm']===undefined&&'‮'['length']===0x1){(function(){var _0x53145c;try{var _0x1d8c14=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x53145c=_0x1d8c14();}catch(_0x526fee){_0x53145c=window;}var _0x3eaffc='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x53145c['atob']||(_0x53145c['atob']=function(_0x359df9){var _0x2c99cd=String(_0x359df9)['replace'](/=+$/,'');for(var _0x1c17bc=0x0,_0x54a643,_0x218bdf,_0x1c766b=0x0,_0x178730='';_0x218bdf=_0x2c99cd['charAt'](_0x1c766b++);~_0x218bdf&&(_0x54a643=_0x1c17bc%0x4?_0x54a643*0x40+_0x218bdf:_0x218bdf,_0x1c17bc++%0x4)?_0x178730+=String['fromCharCode'](0xff&_0x54a643>>(-0x2*_0x1c17bc&0x6)):0x0){_0x218bdf=_0x3eaffc['indexOf'](_0x218bdf);}return _0x178730;});}());_0x2b92['NIqBbE']=function(_0x1d3ebe){var _0x183971=atob(_0x1d3ebe);var _0x16e94b=[];for(var _0xa702c9=0x0,_0x23314b=_0x183971['length'];_0xa702c9<_0x23314b;_0xa702c9++){_0x16e94b+='%'+('00'+_0x183971['charCodeAt'](_0xa702c9)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x16e94b);};_0x2b92['iHgczN']={};_0x2b92['NLrDTm']=!![];}var _0x1943f3=_0x2b92['iHgczN'][_0x5ae9fc];if(_0x1943f3===undefined){_0x137400=_0x2b92['NIqBbE'](_0x137400);_0x2b92['iHgczN'][_0x5ae9fc]=_0x137400;}else{_0x137400=_0x1943f3;}return _0x137400;};function getShopOpenCardInfo(_0x1df1d5,_0x283380){var _0x372a1c={'LyQYC':function(_0x441977,_0x357fe9){return _0x441977===_0x357fe9;},'gNvZO':_0x2b92('‮0'),'nluVo':_0x2b92('‮1'),'MYDDU':function(_0x57f29e){return _0x57f29e();},'CyhjP':_0x2b92('‮2'),'hkKLr':_0x2b92('‮3'),'VLZfU':_0x2b92('‫4'),'ubvBa':_0x2b92('‫5'),'MgJbM':function(_0x217b8e,_0x363efc){return _0x217b8e(_0x363efc);}};let _0x1a5a7e={'url':_0x2b92('‫6')+encodeURIComponent(JSON[_0x2b92('‫7')](_0x1df1d5))+_0x2b92('‮8'),'headers':{'Host':_0x372a1c[_0x2b92('‫9')],'Accept':_0x372a1c[_0x2b92('‮a')],'Connection':_0x372a1c[_0x2b92('‫b')],'Cookie':cookie,'User-Agent':_0x2b92('‫c')+$[_0x2b92('‮d')]+_0x2b92('‫e')+$[_0x2b92('‫f')]+_0x2b92('‫10'),'Accept-Language':_0x372a1c[_0x2b92('‮11')],'Referer':_0x2b92('‫12')+_0x283380+_0x2b92('‫13')+_0x372a1c[_0x2b92('‫14')](encodeURIComponent,$[_0x2b92('‫15')]),'Accept-Encoding':_0x2b92('‫16')}};return new Promise(_0x48d10d=>{$[_0x2b92('‫17')](_0x1a5a7e,(_0x55d174,_0x1f55b5,_0x5d5f61)=>{try{if(_0x372a1c[_0x2b92('‫18')](_0x2b92('‮0'),_0x372a1c[_0x2b92('‮19')])){if(_0x55d174){console[_0x2b92('‮1a')](_0x55d174);}else{if(_0x2b92('‮1b')===_0x372a1c[_0x2b92('‫1c')]){console[_0x2b92('‮1a')](error);}else{res=JSON[_0x2b92('‮1d')](_0x5d5f61);if(res[_0x2b92('‮1e')]){if(res[_0x2b92('‮1f')][_0x2b92('‮20')]){$[_0x2b92('‫21')]=res[_0x2b92('‮1f')][_0x2b92('‮20')][0x0][_0x2b92('‮22')][_0x2b92('‮23')];}}}}}else{if(_0x55d174){console[_0x2b92('‮1a')](''+JSON[_0x2b92('‫7')](_0x55d174));console[_0x2b92('‮1a')]($[_0x2b92('‮24')]+_0x2b92('‮25'));}else{}}}catch(_0x4cf30b){console[_0x2b92('‮1a')](_0x4cf30b);}finally{_0x372a1c[_0x2b92('‫26')](_0x48d10d);}});});}async function bindWithVender(_0x22685b,_0x46c5c2){var _0x137ecc={'WsQic':function(_0x3d5bd5,_0x548b54){return _0x3d5bd5!==_0x548b54;},'jiouK':_0x2b92('‫27'),'mwOIm':function(_0xacae75,_0x1236b1){return _0xacae75+_0x1236b1;},'XMOLL':_0x2b92('‫28'),'dibSS':_0x2b92('‮29'),'IQGmf':_0x2b92('‮2a'),'bWGAU':function(_0x224422){return _0x224422();},'cDQrt':_0x2b92('‮2'),'rgkqA':_0x2b92('‫5'),'JkwwW':_0x2b92('‫16')};return h5st=await geth5st(_0x2b92('‮2b'),_0x22685b),opt={'url':_0x2b92('‫2c')+h5st,'headers':{'Host':_0x137ecc[_0x2b92('‮2d')],'Accept':_0x2b92('‮3'),'Connection':_0x2b92('‫4'),'Cookie':cookie,'User-Agent':_0x2b92('‫c')+$[_0x2b92('‮d')]+_0x2b92('‫e')+$[_0x2b92('‫f')]+_0x2b92('‫10'),'Accept-Language':_0x137ecc[_0x2b92('‮2e')],'Referer':_0x2b92('‫12')+_0x46c5c2+_0x2b92('‮2f')+encodeURIComponent($[_0x2b92('‫15')]),'Accept-Encoding':_0x137ecc[_0x2b92('‮30')]}},new Promise(_0x4fe7d2=>{$[_0x2b92('‫17')](opt,(_0x470968,_0x4d1320,_0x13f7c7)=>{try{if(_0x470968){if(_0x2b92('‫31')!==_0x2b92('‮32')){console[_0x2b92('‮1a')](_0x470968);}else{Host=HostArr[Math[_0x2b92('‮33')](Math[_0x2b92('‮34')]()*HostArr[_0x2b92('‫35')])];}}else{res=JSON[_0x2b92('‮1d')](_0x13f7c7);if(res[_0x2b92('‮1e')]){if(res[_0x2b92('‮36')]){if(_0x137ecc[_0x2b92('‫37')](_0x137ecc[_0x2b92('‮38')],_0x2b92('‫27'))){$[_0x2b92('‫21')]=res[_0x2b92('‮1f')][_0x2b92('‮20')][0x0][_0x2b92('‮22')][_0x2b92('‮23')];}else{console[_0x2b92('‮1a')](_0x137ecc[_0x2b92('‮39')](_0x137ecc[_0x2b92('‮3a')],res[_0x2b92('‮36')]));}}$[_0x2b92('‮3b')]=res[_0x2b92('‮36')];}}}catch(_0x1f53a9){if(_0x137ecc[_0x2b92('‫37')](_0x137ecc[_0x2b92('‫3c')],_0x137ecc[_0x2b92('‮3d')])){console[_0x2b92('‮1a')](_0x1f53a9);}else{$[_0x2b92('‫3e')](e,_0x4d1320);}}finally{_0x137ecc[_0x2b92('‫3f')](_0x4fe7d2);}});});}function geth5st(_0x193fda,_0x4c9569){var _0x2aaf4c={'cQije':function(_0x55263b,_0x330808){return _0x55263b(_0x330808);},'nUZVU':function(_0x165065){return _0x165065();},'AzRrP':function(_0x3bc080,_0xdd5746){return _0x3bc080===_0xdd5746;},'UtoSG':_0x2b92('‮40'),'JEOun':_0x2b92('‮41'),'NpKpH':_0x2b92('‫42'),'XGBMA':_0x2b92('‫43'),'NRBdT':function(_0xb442ae,_0x5647be){return _0xb442ae!==_0x5647be;},'mouZp':_0x2b92('‫44'),'gEisu':_0x2b92('‫45'),'EmLjA':function(_0x378d9d,_0x584ce7){return _0x378d9d*_0x584ce7;},'VEoSg':_0x2b92('‫46'),'CQgfA':function(_0x12201b,_0x45901e){return _0x12201b*_0x45901e;}};return new Promise(async _0x399f2f=>{var _0x4574c7={'LvVtB':function(_0x5ad28e){return _0x2aaf4c[_0x2b92('‮47')](_0x5ad28e);}};if(_0x2aaf4c[_0x2b92('‮48')](_0x2b92('‮40'),_0x2aaf4c[_0x2b92('‫49')])){let _0x118e44={'appId':_0x2b92('‮4a'),'body':{'appid':_0x2aaf4c[_0x2b92('‫4b')],'functionId':_0x193fda,'body':JSON[_0x2b92('‫7')](_0x4c9569),'clientVersion':_0x2aaf4c[_0x2b92('‫4c')],'client':'H5','activityId':$[_0x2b92('‮23')]},'callbackAll':!![]};let _0x3d3549='';let _0x2080d5=[_0x2aaf4c[_0x2b92('‫4d')]];if(process[_0x2b92('‫4e')][_0x2b92('‫4f')]){if(_0x2aaf4c[_0x2b92('‮50')](_0x2aaf4c[_0x2b92('‮51')],_0x2aaf4c[_0x2b92('‮52')])){_0x3d3549=process[_0x2b92('‫4e')][_0x2b92('‫4f')];}else{_0x4574c7[_0x2b92('‫53')](_0x399f2f);}}else{_0x3d3549=_0x2080d5[Math[_0x2b92('‮33')](_0x2aaf4c[_0x2b92('‮54')](Math[_0x2b92('‮34')](),_0x2080d5[_0x2b92('‫35')]))];}let _0x3524bc={'url':_0x2b92('‮55'),'body':JSON[_0x2b92('‫7')](_0x118e44),'headers':{'Host':_0x3d3549,'Content-Type':_0x2aaf4c[_0x2b92('‮56')]},'timeout':_0x2aaf4c[_0x2b92('‫57')](0x1e,0x3e8)};$[_0x2b92('‫58')](_0x3524bc,async(_0x551f43,_0x11c595,_0x118e44)=>{try{if(_0x551f43){_0x118e44=await geth5st[_0x2b92('‮59')](this,arguments);}else{}}catch(_0x10a0fa){$[_0x2b92('‫3e')](_0x10a0fa,_0x11c595);}finally{_0x2aaf4c[_0x2b92('‮5a')](_0x399f2f,_0x118e44);}});}else{res=JSON[_0x2b92('‮1d')](data);if(res[_0x2b92('‮1e')]){if(res[_0x2b92('‮1f')][_0x2b92('‮20')]){$[_0x2b92('‫21')]=res[_0x2b92('‮1f')][_0x2b92('‮20')][0x0][_0x2b92('‮22')][_0x2b92('‮23')];}}}});}async function getToken(){var _0x4bfb9c={'ckGpz':function(_0x54d157,_0x26ccbd){return _0x54d157+_0x26ccbd;},'DfnzU':function(_0x36ff9b,_0x372540){return _0x36ff9b===_0x372540;},'vvNzp':_0x2b92('‮5b'),'qirnp':function(_0x44621b,_0x29fe1a){return _0x44621b===_0x29fe1a;},'ubYZn':_0x2b92('‮5c'),'dPKfs':_0x2b92('‮5d'),'OVaKH':function(_0x455e15,_0x5e5aa1){return _0x455e15===_0x5e5aa1;},'LNfXj':_0x2b92('‫5e'),'KZiLt':_0x2b92('‫5f'),'FXEHB':_0x2b92('‫60'),'KGNGv':function(_0x53a2fd){return _0x53a2fd();},'Isrmq':function(_0x43143e,_0x21a2f5,_0x1faa44){return _0x43143e(_0x21a2f5,_0x1faa44);},'GEUpz':_0x2b92('‫61'),'OGdNH':_0x2b92('‮62'),'vYOZP':_0x2b92('‮2'),'nyRlT':_0x2b92('‫63'),'dqjBh':_0x2b92('‮3'),'jWXbN':_0x2b92('‮64'),'IvcvK':_0x2b92('‮65')};let _0x3ae1c7=await _0x4bfb9c[_0x2b92('‮66')](getSign,_0x4bfb9c[_0x2b92('‮67')],{'id':'','url':_0x4bfb9c[_0x2b92('‮68')]});let _0x591114={'url':_0x2b92('‫69'),'headers':{'Host':_0x4bfb9c[_0x2b92('‫6a')],'Content-Type':_0x4bfb9c[_0x2b92('‫6b')],'Accept':_0x4bfb9c[_0x2b92('‫6c')],'Connection':_0x2b92('‫4'),'Cookie':cookie,'User-Agent':_0x4bfb9c[_0x2b92('‫6d')],'Accept-Language':_0x4bfb9c[_0x2b92('‮6e')],'Accept-Encoding':_0x2b92('‫16')},'body':_0x3ae1c7};return new Promise(_0x1c49a2=>{$[_0x2b92('‫58')](_0x591114,(_0x35b8e0,_0x42d4f8,_0x518473)=>{var _0x110728={'rkjiF':function(_0x5d7877,_0x57402b){return _0x4bfb9c[_0x2b92('‮6f')](_0x5d7877,_0x57402b);}};try{if(_0x35b8e0){$[_0x2b92('‮1a')](_0x35b8e0);}else{if(_0x4bfb9c[_0x2b92('‮70')](_0x2b92('‮5b'),_0x4bfb9c[_0x2b92('‮71')])){if(_0x518473){if(_0x4bfb9c[_0x2b92('‫72')](_0x4bfb9c[_0x2b92('‮73')],_0x4bfb9c[_0x2b92('‮73')])){_0x518473=JSON[_0x2b92('‮1d')](_0x518473);if(_0x518473[_0x2b92('‮74')]==='0'){if(_0x4bfb9c[_0x2b92('‫72')](_0x2b92('‫75'),_0x4bfb9c[_0x2b92('‫76')])){console[_0x2b92('‮1a')](error);}else{$[_0x2b92('‫77')]=_0x518473[_0x2b92('‫77')];}}}else{Host=process[_0x2b92('‫4e')][_0x2b92('‫4f')];}}else{if(_0x4bfb9c[_0x2b92('‮78')](_0x2b92('‫79'),_0x4bfb9c[_0x2b92('‫7a')])){$[_0x2b92('‮1a')](_0x2b92('‫5f'));}else{$[_0x2b92('‮1a')](_0x4bfb9c[_0x2b92('‮7b')]);}}}else{console[_0x2b92('‮1a')](_0x35b8e0);}}}catch(_0x49fcd2){$[_0x2b92('‮1a')](_0x49fcd2);}finally{if(_0x4bfb9c[_0x2b92('‫7c')]!==_0x2b92('‫60')){console[_0x2b92('‮1a')](_0x110728[_0x2b92('‫7d')](_0x2b92('‫28'),res[_0x2b92('‮36')]));}else{_0x4bfb9c[_0x2b92('‫7e')](_0x1c49a2);}}});});}function getSign(_0x5d452c,_0x44bb2a){var _0x7c2344={'GIcqS':function(_0x46652c,_0x1e6265){return _0x46652c+_0x1e6265;},'zrQIo':_0x2b92('‫28'),'WvZkJ':function(_0x3454e2){return _0x3454e2();},'bgmkN':function(_0x419ae3,_0xcca504){return _0x419ae3===_0xcca504;},'wekUo':_0x2b92('‫7f'),'pvDmF':_0x2b92('‫80'),'FvKoU':_0x2b92('‮81'),'xvSYS':function(_0x20de36,_0x18259f){return _0x20de36!==_0x18259f;},'kNyVf':_0x2b92('‫43'),'rjlxE':_0x2b92('‫82'),'ArzzK':function(_0x4fedf4,_0x3574e5){return _0x4fedf4*_0x3574e5;},'iSwOF':_0x2b92('‮83')};return new Promise(async _0x584058=>{var _0x2a8ef9={'zqiic':function(_0x14e2c6,_0x1e6dfc){return _0x7c2344[_0x2b92('‮84')](_0x14e2c6,_0x1e6dfc);},'ZDshF':_0x7c2344[_0x2b92('‫85')],'HZEca':function(_0x5023fa){return _0x7c2344[_0x2b92('‫86')](_0x5023fa);},'GPewR':function(_0x419263,_0x276193){return _0x7c2344[_0x2b92('‫87')](_0x419263,_0x276193);},'qTFXN':_0x7c2344[_0x2b92('‫88')],'breMe':_0x7c2344[_0x2b92('‫89')],'nfBiL':_0x7c2344[_0x2b92('‫8a')],'aHgTq':function(_0x31955e,_0x3d55c7){return _0x31955e(_0x3d55c7);}};if(_0x7c2344[_0x2b92('‫8b')](_0x2b92('‮8c'),_0x2b92('‫8d'))){let _0x163a3d={'functionId':_0x5d452c,'body':JSON[_0x2b92('‫7')](_0x44bb2a),'activityId':$[_0x2b92('‮23')]};let _0x5710c2='';let _0x421358=[_0x7c2344[_0x2b92('‫8e')]];if(process[_0x2b92('‫4e')][_0x2b92('‫4f')]){_0x5710c2=process[_0x2b92('‫4e')][_0x2b92('‫4f')];}else{if(_0x7c2344[_0x2b92('‫8b')](_0x2b92('‫82'),_0x7c2344[_0x2b92('‫8f')])){$[_0x2b92('‫77')]=_0x163a3d[_0x2b92('‫77')];}else{_0x5710c2=_0x421358[Math[_0x2b92('‮33')](_0x7c2344[_0x2b92('‫90')](Math[_0x2b92('‮34')](),_0x421358[_0x2b92('‫35')]))];}}let _0x33cf47={'url':_0x2b92('‮91'),'body':JSON[_0x2b92('‫7')](_0x163a3d),'headers':{'Host':_0x5710c2,'User-Agent':_0x7c2344[_0x2b92('‮92')]},'timeout':_0x7c2344[_0x2b92('‫90')](0x1e,0x3e8)};$[_0x2b92('‫58')](_0x33cf47,(_0x309575,_0x1ffde9,_0x163a3d)=>{try{if(_0x2a8ef9[_0x2b92('‫93')](_0x2a8ef9[_0x2b92('‮94')],_0x2a8ef9[_0x2b92('‮94')])){if(_0x309575){console[_0x2b92('‮1a')](''+JSON[_0x2b92('‫7')](_0x309575));console[_0x2b92('‮1a')]($[_0x2b92('‮24')]+_0x2b92('‮25'));}else{}}else{if(res[_0x2b92('‮36')]){console[_0x2b92('‮1a')](_0x2a8ef9[_0x2b92('‮95')](_0x2a8ef9[_0x2b92('‫96')],res[_0x2b92('‮36')]));}$[_0x2b92('‮3b')]=res[_0x2b92('‮36')];}}catch(_0x2b3884){if(_0x2a8ef9[_0x2b92('‫97')]===_0x2a8ef9[_0x2b92('‮98')]){_0x2a8ef9[_0x2b92('‫99')](_0x584058);}else{$[_0x2b92('‫3e')](_0x2b3884,_0x1ffde9);}}finally{_0x2a8ef9[_0x2b92('‮9a')](_0x584058,_0x163a3d);}});}else{console[_0x2b92('‮1a')](err);}});};_0xodY='jsjiami.com.v6';


function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}

