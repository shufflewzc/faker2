/*
一键获取我仓库所有需要互助类脚本的互助码(邀请码)(其中京东赚赚jd_jdzz.js如果今天达到5人助力则不能提取互助码)
没必要设置(cron)定时执行，需要的时候，自己手动执行一次即可
注：临时活动的互助码不添加到此处，如有需要请手动运行对应临时活动脚本
更新地址：jd_get_share_code.js
已支持IOS双京东账号, Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, 小火箭，JSBox, Node.js
============Quantumultx===============
[task_local]
#获取互助码
20 13 * * 6 jd_get_share_code.js, tag=获取互助码, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true

================Loon==============
[Script]
cron "20 13 * * 6" script-path=jd_get_share_code.js, tag=获取互助码

===============Surge=================
获取互助码 = type=cron,cronexp="20 13 * * 6",wake-system=1,timeout=3600,script-path=jd_get_share_code.js

============小火箭=========
获取互助码 = type=cron,script-path=jd_get_share_code.js, cronexpr="20 13 * * 6", timeout=3600, enable=true
 */
const $ = new Env("获取互助码");
const JD_API_HOST = "https://api.m.jd.com/client.action";
let cookiesArr = [], cookie = '', message;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
!function(n){"use strict";function r(n,r){var t=(65535&n)+(65535&r);return(n>>16)+(r>>16)+(t>>16)<<16|65535&t}function t(n,r){return n<<r|n>>>32-r}function u(n,u,e,o,c,f){return r(t(r(r(u,n),r(o,f)),c),e)}function e(n,r,t,e,o,c,f){return u(r&t|~r&e,n,r,o,c,f)}function o(n,r,t,e,o,c,f){return u(r&e|t&~e,n,r,o,c,f)}function c(n,r,t,e,o,c,f){return u(r^t^e,n,r,o,c,f)}function f(n,r,t,e,o,c,f){return u(t^(r|~e),n,r,o,c,f)}function i(n,t){n[t>>5]|=128<<t%32,n[14+(t+64>>>9<<4)]=t;var u,i,a,h,g,l=1732584193,d=-271733879,v=-1732584194,C=271733878;for(u=0;u<n.length;u+=16)i=l,a=d,h=v,g=C,d=f(d=f(d=f(d=f(d=c(d=c(d=c(d=c(d=o(d=o(d=o(d=o(d=e(d=e(d=e(d=e(d,v=e(v,C=e(C,l=e(l,d,v,C,n[u],7,-680876936),d,v,n[u+1],12,-389564586),l,d,n[u+2],17,606105819),C,l,n[u+3],22,-1044525330),v=e(v,C=e(C,l=e(l,d,v,C,n[u+4],7,-176418897),d,v,n[u+5],12,1200080426),l,d,n[u+6],17,-1473231341),C,l,n[u+7],22,-45705983),v=e(v,C=e(C,l=e(l,d,v,C,n[u+8],7,1770035416),d,v,n[u+9],12,-1958414417),l,d,n[u+10],17,-42063),C,l,n[u+11],22,-1990404162),v=e(v,C=e(C,l=e(l,d,v,C,n[u+12],7,1804603682),d,v,n[u+13],12,-40341101),l,d,n[u+14],17,-1502002290),C,l,n[u+15],22,1236535329),v=o(v,C=o(C,l=o(l,d,v,C,n[u+1],5,-165796510),d,v,n[u+6],9,-1069501632),l,d,n[u+11],14,643717713),C,l,n[u],20,-373897302),v=o(v,C=o(C,l=o(l,d,v,C,n[u+5],5,-701558691),d,v,n[u+10],9,38016083),l,d,n[u+15],14,-660478335),C,l,n[u+4],20,-405537848),v=o(v,C=o(C,l=o(l,d,v,C,n[u+9],5,568446438),d,v,n[u+14],9,-1019803690),l,d,n[u+3],14,-187363961),C,l,n[u+8],20,1163531501),v=o(v,C=o(C,l=o(l,d,v,C,n[u+13],5,-1444681467),d,v,n[u+2],9,-51403784),l,d,n[u+7],14,1735328473),C,l,n[u+12],20,-1926607734),v=c(v,C=c(C,l=c(l,d,v,C,n[u+5],4,-378558),d,v,n[u+8],11,-2022574463),l,d,n[u+11],16,1839030562),C,l,n[u+14],23,-35309556),v=c(v,C=c(C,l=c(l,d,v,C,n[u+1],4,-1530992060),d,v,n[u+4],11,1272893353),l,d,n[u+7],16,-155497632),C,l,n[u+10],23,-1094730640),v=c(v,C=c(C,l=c(l,d,v,C,n[u+13],4,681279174),d,v,n[u],11,-358537222),l,d,n[u+3],16,-722521979),C,l,n[u+6],23,76029189),v=c(v,C=c(C,l=c(l,d,v,C,n[u+9],4,-640364487),d,v,n[u+12],11,-421815835),l,d,n[u+15],16,530742520),C,l,n[u+2],23,-995338651),v=f(v,C=f(C,l=f(l,d,v,C,n[u],6,-198630844),d,v,n[u+7],10,1126891415),l,d,n[u+14],15,-1416354905),C,l,n[u+5],21,-57434055),v=f(v,C=f(C,l=f(l,d,v,C,n[u+12],6,1700485571),d,v,n[u+3],10,-1894986606),l,d,n[u+10],15,-1051523),C,l,n[u+1],21,-2054922799),v=f(v,C=f(C,l=f(l,d,v,C,n[u+8],6,1873313359),d,v,n[u+15],10,-30611744),l,d,n[u+6],15,-1560198380),C,l,n[u+13],21,1309151649),v=f(v,C=f(C,l=f(l,d,v,C,n[u+4],6,-145523070),d,v,n[u+11],10,-1120210379),l,d,n[u+2],15,718787259),C,l,n[u+9],21,-343485551),l=r(l,i),d=r(d,a),v=r(v,h),C=r(C,g);return[l,d,v,C]}function a(n){var r,t="",u=32*n.length;for(r=0;r<u;r+=8)t+=String.fromCharCode(n[r>>5]>>>r%32&255);return t}function h(n){var r,t=[];for(t[(n.length>>2)-1]=void 0,r=0;r<t.length;r+=1)t[r]=0;var u=8*n.length;for(r=0;r<u;r+=8)t[r>>5]|=(255&n.charCodeAt(r/8))<<r%32;return t}function g(n){return a(i(h(n),8*n.length))}function l(n,r){var t,u,e=h(n),o=[],c=[];for(o[15]=c[15]=void 0,e.length>16&&(e=i(e,8*n.length)),t=0;t<16;t+=1)o[t]=909522486^e[t],c[t]=1549556828^e[t];return u=i(o.concat(h(r)),512+8*r.length),a(i(c.concat(u),640))}function d(n){var r,t,u="";for(t=0;t<n.length;t+=1)r=n.charCodeAt(t),u+="0123456789abcdef".charAt(r>>>4&15)+"0123456789abcdef".charAt(15&r);return u}function v(n){return unescape(encodeURIComponent(n))}function C(n){return g(v(n))}function A(n){return d(C(n))}function m(n,r){return l(v(n),v(r))}function s(n,r){return d(m(n,r))}function b(n,r,t){return r?t?m(r,n):s(r,n):t?C(n):A(n)}$.md5=b}();
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  $.log('\n注：临时活动的互助码不添加到此处，如有需要请手动运行对应临时活动脚本\n')
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      message = '';
      await TotalBean();
      if (!$.isLogin) {
        continue
      }
      await getShareCode()
    }
  }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })
  $.UA = require('./USER_AGENTS').UARAM();
function getJdFactory() {
  return new Promise(resolve => {
    $.post(
      taskPostUrl("jdfactory_getTaskDetail", {}, "jdfactory_getTaskDetail"),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`);
            console.log(`$东东工厂 API请求失败，请检查网路重试`);
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data.data.bizCode === 0) {
                $.taskVos = data.data.result.taskVos; //任务列表
                $.taskVos.map((item) => {
                  if (item.taskType === 14) {
                    console.log(
                      `【京东账号${$.index}（${$.UserName}）东东工厂】${item.assistTaskDetailVo.taskToken}`
                    );
                  }
                });
              }
            }
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve();
        }
      }
    );
  })
}
function getJxFactory(){
  const JX_API_HOST = "https://m.jingxi.com";

  function JXGC_taskurl(functionId, body = "") {
    return {
      url: `${JX_API_HOST}/dreamfactory/${functionId}?zone=dream_factory&${body}&sceneval=2&g_login_type=1&_time=${Date.now()}&_=${Date.now()}`,
      headers: {
        Cookie: cookie,
        Host: "m.jingxi.com",
        Accept: "*/*",
        Connection: "keep-alive",
        "User-Agent": $.UA,
        "Accept-Language": "zh-cn",
        Referer: "https://wqsd.jd.com/pingou/dream_factory/index.html",
        "Accept-Encoding": "gzip, deflate, br",
      },
    };
  }

  return new Promise(resolve => {
    $.get(
      JXGC_taskurl(
        "userinfo/GetUserInfo",
        `pin=&sharePin=&shareType=&materialTuanPin=&materialTuanId=`
      ),
      async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`);
            console.log(`京喜工厂 API请求失败，请检查网路重试`);
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data["ret"] === 0) {
                data = data["data"];
                $.unActive = true; //标记是否开启了京喜活动或者选购了商品进行生产
                $.encryptPin = "";
                $.shelvesList = [];
                if (data.factoryList && data.productionList) {
                  const production = data.productionList[0];
                  const factory = data.factoryList[0];
                  const productionStage = data.productionStage;
                  $.factoryId = factory.factoryId; //工厂ID
                  $.productionId = production.productionId; //商品ID
                  $.commodityDimId = production.commodityDimId;
                  $.encryptPin = data.user.encryptPin;
                  // subTitle = data.user.pin;
                  console.log(`【京东账号${$.index}（${$.UserName}）京喜工厂】${data.user.encryptPin}`);
                }
              } else {
                $.unActive = false; //标记是否开启了京喜活动或者选购了商品进行生产
                if (!data.factoryList) {
                  console.log(
                    `【提示】京东账号${$.index}[${$.nickName}]京喜工厂活动未开始请手动去京东APP->游戏与互动->查看更多->京喜工厂 开启活动`
                  );
                } else if (data.factoryList && !data.productionList) {
                  console.log(
                    `【提示】京东账号${$.index}[${$.nickName}]京喜工厂未选购商品请手动去京东APP->游戏与互动->查看更多->京喜工厂 选购`
                  );
                }
              }
            } else {
              console.log(`GetUserInfo异常：${JSON.stringify(data)}`);
            }
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve()
        }
      }
    );
  })
}

function getJdPet(){
  const JDPet_API_HOST = "https://api.m.jd.com/client.action";

  function jdPet_Url(function_id, body = {}) {
    body["version"] = 2;
    body["channel"] = "app";
    return {
      url: `${JDPet_API_HOST}?functionId=${function_id}`,
      body: `body=${escape(
        JSON.stringify(body)
      )}&appid=wh5&loginWQBiz=pet-town&clientVersion=9.0.4`,
      headers: {
        Cookie: cookie,
        "User-Agent": $.UA,
        Host: "api.m.jd.com",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
  }
  return new Promise(resolve => {
    $.post(jdPet_Url("initPetTown"), async (err, resp, data) => {
      try {
        if (err) {
          console.log("东东萌宠: API查询请求失败 ‼️‼️");
          console.log(JSON.stringify(err));
          $.logErr(err);
        } else {
          data = JSON.parse(data);

          const initPetTownRes = data;

          message = `【京东账号${$.index}】${$.nickName}`;
          if (
            initPetTownRes.code === "0" &&
            initPetTownRes.resultCode === "0" &&
            initPetTownRes.message === "success"
          ) {
            $.petInfo = initPetTownRes.result;
            if ($.petInfo.userStatus === 0) {
              /*console.log(
                `【提示】京东账号${$.index}${$.nickName}萌宠活动未开启请手动去京东APP开启活动入口：我的->游戏与互动->查看更多开启`
              );*/
              return;
            }

            console.log(
              `【京东账号${$.index}（${$.UserName}）京东萌宠】${$.petInfo.shareCode}`
            );

          } else if (initPetTownRes.code === "0") {
            console.log(`初始化萌宠失败:  ${initPetTownRes.message}`);
          } else {
            console.log("shit");
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    });
  })
}
async function getJdZZ() {
  const JDZZ_API_HOST = "https://api.m.jd.com/client.action";
  function getTaskList() {
    return new Promise(resolve => {
      $.get(taskZZUrl("interactTaskIndex"), async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              $.taskList = data.data.taskDetailResList;
              if ($.taskList.filter(item => !!item && item['taskId']=== 3) && $.taskList.filter(item => !!item && item['taskId']=== 3).length) {
                console.log(`【京东账号${$.index}（${$.UserName}）的京东赚赚好友互助码】${$.taskList.filter(item => !!item && item['taskId']=== 3)[0]['itemId']}`);
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

  function taskZZUrl(functionId, body = {}) {
    return {
      url: `${JDZZ_API_HOST}?functionId=${functionId}&body=${escape(JSON.stringify(body))}&client=wh5&clientVersion=9.1.0`,
      headers: {
        'Cookie': cookie,
        'Host': 'api.m.jd.com',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Referer': 'http://wq.jd.com/wxapp/pages/hd-interaction/index/index',
        'User-Agent': $.UA,
        'Accept-Language': 'zh-cn',
        'Accept-Encoding': 'gzip, deflate, br',
      }
    }
  }

  await getTaskList()
}
async function getPlantBean() {
  const JDplant_API_HOST = "https://api.m.jd.com/client.action";

  async function plantBeanIndex() {
    $.plantBeanIndexResult = await plant_request("plantBeanIndex"); //plantBeanIndexBody
  }

  function plant_request(function_id, body = {}) {
    return new Promise(async (resolve) => {
      $.post(plant_taskUrl(function_id, body), (err, resp, data) => {
        try {
          if (err) {
            console.log("种豆得豆: API查询请求失败 ‼️‼️");
            console.log(`function_id:${function_id}`);
            $.logErr(err);
          } else {
            data = JSON.parse(data);
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve(data);
        }
      });
    });
  }

  function plant_taskUrl(function_id, body) {
    body["version"] = "9.0.0.1";
    body["monitor_source"] = "plant_app_plant_index";
    body["monitor_refer"] = "";
    return {
      url: JDplant_API_HOST,
      body: `functionId=${function_id}&body=${escape(
        JSON.stringify(body)
      )}&appid=ld&client=apple&area=5_274_49707_49973&build=167283&clientVersion=9.1.0`,
      headers: {
        Cookie: cookie,
        Host: "api.m.jd.com",
        Accept: "*/*",
        Connection: "keep-alive",
        "User-Agent": $.UA,
        "Accept-Language": "zh-Hans-CN;q=1,en-CN;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
  }

  function getParam(url, name) {
    const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    const r = url.match(reg);
    if (r != null) return unescape(r[2]);
    return null;
  }

  async function jdPlantBean() {
    await plantBeanIndex();
    // console.log(plantBeanIndexResult.data.taskList);
    if ($.plantBeanIndexResult.code === "0") {
      const shareUrl = $.plantBeanIndexResult.data.jwordShareInfo.shareUrl;
      $.myPlantUuid = getParam(shareUrl, "plantUuid");
      console.log(`【京东账号${$.index}（${$.UserName}）种豆得豆】${$.myPlantUuid}`);

    } else {
      console.log(
        `种豆得豆-初始失败:  ${JSON.stringify($.plantBeanIndexResult)}`
      );
    }
  }

  await jdPlantBean();
}
async function getJDFruit() {
  async function initForFarm() {
    return new Promise((resolve) => {
      const option = {
        url: `${JD_API_HOST}?functionId=initForFarm`,
        body: `body=${escape(
          JSON.stringify({version: 4})
        )}&appid=wh5&clientVersion=9.1.0`,
        headers: {
          accept: "*/*",
          "accept-encoding": "gzip, deflate, br",
          "accept-language": "zh-CN,zh;q=0.9",
          "cache-control": "no-cache",
          cookie: cookie,
          origin: "https://home.m.jd.com",
          pragma: "no-cache",
          referer: "https://home.m.jd.com/myJd/newhome.action",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "User-Agent": $.UA,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };
      $.post(option, (err, resp, data) => {
        try {
          if (err) {
            console.log("东东农场: API查询请求失败 ‼️‼️");
            console.log(JSON.stringify(err));
            $.logErr(err);
          } else {
            if (safeGet(data)) {
              $.farmInfo = JSON.parse(data);
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

  async function jdFruit() {
    await initForFarm();
    if ($.farmInfo.farmUserPro) {
      console.log(
        `【京东账号${$.index}（${$.UserName}）京东农场】${$.farmInfo.farmUserPro.shareCode}`
      );

    } else {
      /*console.log(
        `初始化农场数据异常, 请登录京东 app查看农场0元水果功能是否正常,农场初始化数据: ${JSON.stringify(
          $.farmInfo
        )}`
      );*/
    }
  }

  await jdFruit();
}
async function getJoy(){
  function taskUrl(functionId, body = '') {
    let t = Date.now().toString().substr(0, 10)
    let e = body || ""
    e = $.md5("aDvScBv$gGQvrXfva8dG!ZC@DA70Y%lX" + e + t)
    e = e + Number(t).toString(16)
    return {
      url: `${JD_API_HOST}?uts=${e}&appid=crazy_joy&functionId=${functionId}&body=${escape(body)}&t=${t}`,
      headers: {
        'Cookie': cookie,
        'Host': 'api.m.jd.com',
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'User-Agent': $.UA,
        'Accept-Language': 'zh-cn',
        'Referer': 'https://crazy-joy.jd.com/',
        'origin': 'https://crazy-joy.jd.com',
        'Accept-Encoding': 'gzip, deflate, br',
      }
    }
  }
  let body = {"paramData": {}}
  return new Promise(async resolve => {
    $.get(taskUrl('crazyJoy_user_gameState', JSON.stringify(body)), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.success && data.data && data.data.userInviteCode) {
              console.log(`【京东账号${$.index}（${$.UserName}）crazyJoy】${data.data.userInviteCode}`)
            }
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
//闪购盲盒
async function getSgmh(timeout = 0) {
  return new Promise((resolve) => {
    setTimeout( ()=>{
      let url = {
        url : `https://api.m.jd.com/client.action`,
        headers : {
          'Origin' : `https://h5.m.jd.com`,
          'Cookie' : cookie,
          'Connection' : `keep-alive`,
          'Accept' : `application/json, text/plain, */*`,
          'Referer' : `https://h5.m.jd.com/babelDiy/Zeus/2WBcKYkn8viyxv7MoKKgfzmu7Dss/index.html`,
          'Host' : `api.m.jd.com`,
          'Accept-Encoding' : `gzip, deflate, br`,
          'Accept-Language' : `zh-cn`
        },
        body : `functionId=interact_template_getHomeData&body={"appId":"1EFRXxg","taskToken":""}&client=wh5&clientVersion=1.0.0`
      }
      $.post(url, async (err, resp, data) => {
        try {
          data = JSON.parse(data);
          if (data.data.bizCode === 0) {
            const invites  = data.data.result.taskVos.filter(item => item['taskName'] === '邀请好友助力');
            console.log(`【京东账号${$.index}（${$.UserName}）闪购盲盒】${invites && invites[0]['assistTaskDetailVo']['taskToken']}`)
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
//财富岛
function getCFD(showInvite = true) {
  function taskUrl(function_path, body) {
    return {
      url: `https://m.jingxi.com/jxcfd/${function_path}?strZone=jxcfd&bizCode=jxcfd&source=jxcfd&dwEnv=7&_cfd_t=${Date.now()}&ptag=138631.26.55&${body}&_ste=1&_=${Date.now()}&sceneval=2&g_login_type=1&g_ty=ls`,
      headers: {
        Cookie: cookie,
        Accept: "*/*",
        Connection: "keep-alive",
        Referer:"https://st.jingxi.com/fortune_island/index.html?ptag=138631.26.55",
        "Accept-Encoding": "gzip, deflate, br",
        Host: "m.jingxi.com",
        "User-Agent": $.UA,
        "Accept-Language": "zh-cn",
      },
    };
  }
  return new Promise(async (resolve) => {
    $.get(taskUrl(`user/QueryUserInfo`), (err, resp, data) => {
      try {
        const {
          iret,
          SceneList = {},
          XbStatus: { XBDetail = [], dwXBRemainCnt } = {},
          ddwMoney,
          dwIsNewUser,
          sErrMsg,
          strMyShareId,
          strPin,
        } = JSON.parse(data);
        console.log(`【京东账号${$.index}（${$.UserName}）财富岛】${strMyShareId}`)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}
//领现金
function getJdCash() {
  function taskUrl(functionId, body = {}) {
    return {
      url: `https://api.m.jd.com/client.action?functionId=${functionId}&body=${escape(JSON.stringify(body))}&appid=CashRewardMiniH5Env&appid=9.1.0`,
      headers: {
        'Cookie': cookie,
        'Host': 'api.m.jd.com',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Referer': 'http://wq.jd.com/wxapp/pages/hd-interaction/index/index',
        'User-Agent': $.UA,
        'Accept-Language': 'zh-cn',
        'Accept-Encoding': 'gzip, deflate, br',
      }
    }
  }
  return new Promise((resolve) => {
    $.get(taskUrl("cash_mob_home",), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if(data.code===0 && data.data.result){
              console.log(`【京东账号${$.index}（${$.UserName}）签到领现金】${data.data.result.inviteCode}`);
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
async function getShareCode() {
  console.log(`======账号${$.index}开始======`)
  try {
    await getJDFruit()
    //await getJdPet()
    await getPlantBean()
    //await getJdFactory()
    //await getJxFactory()
    //await getJdZZ()
    //await getJoy()
    await getSgmh()
    //await getCFD()
    //await getJdCash()
  } catch (e) {
    console.log(e)
  }
  console.log(`======账号${$.index}结束======\n`)
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
        "User-Agent": $.UA
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
function taskPostUrl(function_id, body = {}, function_id2) {
  let url = `${JD_API_HOST}`;
  if (function_id2) {
    url += `?functionId=${function_id2}`;
  }
  return {
    url,
    body: `functionId=${function_id}&body=${escape(
      JSON.stringify(body)
    )}&client=wh5&clientVersion=9.1.0`,
    headers: {
      Cookie: cookie,
      origin: "https://h5.m.jd.com",
      referer: "https://h5.m.jd.com/",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": $.UA
    },
  };
}
function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg($.name, '', '不要在BoxJS手动复制粘贴修改cookie')
      return [];
    }
  }
}
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
