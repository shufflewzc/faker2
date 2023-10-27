/**
优惠劵领卷
cron 2 6-22 * * * jd_coupon.js
*/
const $ = new Env('优惠劵领卷');
const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let cookiesArr = [], cookie = '';
var axios = require("axios")
// var cheerio = require("cheerio");
let JF_URL = process.env.JF_URL ?? '';
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {
  };
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
    return;
  }

  $.getCodeListerr = false
  console.log("获取优惠劵...")
  codeList = await getCodeList('https://raw.githubusercontent.com/shufflewzc/updatecode/main/coupon.json')
  if($.getCodeListerr === false){
    console.log("优惠劵失败...")
    return;
  }
  $.randomCode = random(10, 15);
  // console.log($.randomCode)
  // console.log(codeList.length)
  if (codeList[0] === "") {
    console.log("暂无优惠劵...")
    return;
  }
  if ($.randomCode === 10){
    console.log("优惠券地址: https://u.jd.com/"+codeList[0])

    $.jfurl = "https://u.jd.com/"+codeList[0]
    $.hrl = ''
    $.long = ''
    $.d_ = ''
    $.sku_ = ''
    $.q_ = ''
    console.log("---- 初始化 ----")
    await getShorttoLong()
    console.log("\n---- 执行 ----")
  
    cookiesArr = cookiesArr.sort(function() {
      return .5 - Math.random();
    });
    // let ckNum = cookiesArr.length > 1 ?  1 : cookiesArr.length;
    for (let i = 0; i < 1; i++) {
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
          $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, { "open-url": "https://bean.m.jd.com/bean/signIndex.action" });
          if ($.isNode()) {
            // await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
          }
          continue
        }
        $.UUID = getUUID("xxxxxxxxxxx");
  
        if ($.index == 1) {
          await main();
        }
        await mainTask();
        await $.wait(4000);
      }
    }
  }

})().catch((e) => { $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '') }).finally(() => { $.done(); })

async function main(){
  await getURL()
  await $.wait(1000);
  await getJDA()
  await $.wait(1000);
  await getLong()
  await $.wait(1000);
}

async function mainTask(){
  if ($.sku_ != '') {
    console.log("\n---- getUnionGiftCouponSKU ----\n")
    await getUnionGiftCouponSKUNew($.sku_, $.q_, $.d_)
    await $.wait(1000);
    // await mshopcart()
  } else if($.sku_ == ''){
    console.log("\n---- getUnionGiftCoupon ----\n")
    await getUnionGiftCouponNew($.q_)
    await $.wait(1000);
  }
}

async function getShort(short) {
  try {
      let { data } = await axios.get(short);
      if (data) {
          let jump = data.match(/hrl=\'(.*)\';var.ua/)[1];
          if (jump) {
              return await axios
                  .get(jump)
                  .then((res) => {
                      return res.request?._redirectable?._currentUrl;
                  })
                  .catch((err) => {
                      return err.request?._redirectable?._currentUrl;
                  });
          } else {
              return null;
          }
      } else {
          return null;
      }
  } catch (error) {
      return null;
  }
}

async function getShorttoLong() {
  return getShort($.jfurl).then(long=>{
      // console.log(long);
      $.long = long
      // console.log('\n');
      // console.log("d    " + $.jfurl.split('https://u.jd.com/')[1])
      // console.log("sku  " + long.split('&')[0].split('sku=')[1])
      // console.log("q    " + long.split('&')[1].split('q=')[1])
      $.d_ = $.jfurl.split('https://u.jd.com/')[1]
      $.sku_ = long.split('&')[0].split('sku=')[1]
      $.q_ = long.split('&')[1].split('q=')[1]

  })
}

function getURL(){
  $.now = Date.now();
  return new Promise(async resolve => {
    const options = {
      url: $.jfurl,
      headers: {
        'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        "User-Agent": 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
        "Cookie": cookie
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
        } else {
          if (data) {
            $.hrl = data.split('var hrl=')[1].split(';var ua=')[0].replaceAll("'","");
            // console.log("$.hrl " + $.hrl)
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

function getLong(){
  // console.log($.long)
  return new Promise(async resolve => {
    const options = {
      url: $.long,
      headers: {
        'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        "User-Agent": 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
        "Referer":'https://u.jd.com/',
        "Cookie": cookie
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
        } else {
          if (data) {
            // console.log("---> getLong 成功")
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

async function getJDA() {
  try {
    const config = {
        headers: {
          'accept-encoding': 'gzip, deflate, br',
          'user-agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
          'accept-language':'zh-CN,zh-Hans;q=0.9',
          'referer':$.jfurl,
          "cookie": cookie
        }
      }

      let { data } = await axios.get($.hrl,config)
      if (data) {
        // console.log('---> getJDA 成功')
      }

  } catch (error) {
      return null;
  }
}

async function getUnionGiftCouponSKU(sku, q, d){
  $.now = Date.now();
  $.actURL = `https://jingfen.jd.com/item.html?sku=${$.sku}&q=${$.q}&rid=11240&needRecommendFlag=2&uabt=154_530_1&d=${$.d}&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_1000236406_&utm_term=&sid=&un_area=`
  $.sku = sku
  $.q = q
  $.d = d
  const body = {
    sku: $.sku,
    q: $.q,
    d: $.d,
    platform: 2,
    giftInfo: "",
    wxtoken: "",
    eid: "",
    fp: "",
    shshshfp: "-1",
    shshshfpa: "-1",
    shshshfpb: "-1",
    childActivityUrl: `https://jingfen.jd.com/item.html?sku=${$.sku}&q=${$.q}≈&rid=11240&needRecommendFlag=1&uabt=154_530_1&d=${$.d}&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_1000236406_&utm_term=#/pages/common-coupon/common-coupon`,
    pageClickKey: "MJDAlliance_CheckDetail",
  };

  return new Promise(async resolve => {
    const options = {
      url: `https://api.m.jd.com/api?functionId=getUnionGiftCoupon&client=wh5&appid=u&clientVersion=1.0.0&body=${encodeURIComponent(JSON.stringify(body))}&loginType=2&_t=${$.now}`,
      headers: {
        'Accept':'*/*',
        'Origin':'https://jingfen.jd.com',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Cookie': cookie,
        'Referer': $.actURL,
        "User-Agent": 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
        } else {
          if (data) {
            // console.log(data)
            data = JSON.parse(data);
            if (data.data.commonCoupon.msg == '成功') {
              console.log(data.data.commonCoupon.msg)
              $.num = $.num + 1
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

async function getUnionGiftCouponSKUNew(sku, q, d){
  $.now = Date.now();
  $.sku = sku
  $.q = q
  $.d = d
  $.actURL = `https://jingfen.jd.com/item.html?sku=${$.sku}&q=${$.q}&rid=11240&needRecommendFlag=2&uabt=154_530_1&d=${$.d}&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_${$.now}_&utm_term=&sid=&un_area=`
	let opt = {
		url: `https://api.m.jd.com/api`,
		body: `functionId=getUnionGiftCoupon&client=wh5&appid=u&clientVersion=1.0.0&body={"sku":"${$.sku}","q":"${$.q}","d":"${$.d}","platform":2,"giftInfo":"","recommendCouponUrl":[],"wxtoken":"","pageClickKey":"MJDAlliance_CheckDetail","fp":""}&loginType=2&_t=${$.now}&x-api-eid-token=jdd03BASZZM4SINAOL45QDH27HCD2ZL7YYOYC2VMIXIQSOIEKW3LACD56NT43SYCHDFOCLACUWIYYOMCZ5LIZEF2XSNLK6AAAAAMIJRGCHMAAAAAACXTRTM63W77XLEX&h5st=`,
		headers: {
      'Accept':'*/*',
      'Origin':'https://jingfen.jd.com',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
      'Cookie': cookie,
      'Referer': $.actURL,
      "User-Agent": 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
		}
	}
	return new Promise(async (resolve) => {
		$.post(opt, async (err, resp, data) => {
			try {
				if (err) {
					console.log(`${JSON.stringify(err)}`)
					console.log(` API请求失败，请检查网路重试`)
				} else {
          console.log(data)
          data = JSON.parse(data);
          // if (data.data.commonCoupon.msg == '成功') {
          //   console.log(data.data.commonCoupon.msg)
          // }
				}
			} catch (e) {
				$.logErr(e, resp)
			} finally {
				resolve(data)
			}
		})
	})
}

async function getUnionGiftCoupon(q){
  $.now = Date.now();
  $.actURL = `https://jingfen.jd.com/item?u_act_p=coupon&q=${$.q}&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_1000236406_&utm_term=&sid=&un_area=`
  $.q = q
  const body = {
    sku: "",
    q: $.q,
    d: "",
    platform: 4,
    giftInfo: "",
    wxtoken: "",
    eid: "",
    fp: "",
    shshshfp: "-1",
    shshshfpa: "-1",
    shshshfpb: "-1",
    childActivityUrl: `https://jingfen.jd.com/item?u_act_p=coupon&q=${$.q}&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_1000236406_&utm_term=&sid=&un_area=#/pages/common-coupon/common-coupon`,
    pageClickKey: "MJDAlliance_CheckDetail",
  };
  return new Promise(async resolve => {
    const options = {
      url: `https://api.m.jd.com/api?functionId=getUnionGiftCoupon&client=wh5&appid=u&clientVersion=1.0.0&body=${encodeURIComponent(JSON.stringify(body))}&loginType=2&_t=${$.now}`,
      headers: {
        'Accept':'*/*',
        'Origin':'https://jingfen.jd.com',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Cookie': cookie,
        'Referer': $.actURL,
        "User-Agent": 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
        } else {
          if (data) {
            // console.log(data)
            data = JSON.parse(data);
            console.log(data.data.commonCoupon)
            if (data.data.commonCoupon.msg == '成功') {
              console.log(data.data.commonCoupon.msg)
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
async function getUnionGiftCouponNew(q){
  $.now = Date.now();
  $.q = q
  $.actURL = `https://jingfen.jd.com/item?u_act_p=coupon&q=${$.q}&cu=true&utm_source=kong&utm_medium=jingfen&utm_campaign=t_${$.now}_&utm_term=&sid=&un_area=`
	let opt = {
		url: `https://api.m.jd.com/api`,
		body: `functionId=getUnionGiftCoupon&client=wh5&appid=u&clientVersion=1.0.0&body={"sku":"","q":"${$.q}","d":"","platform":2,"giftInfo":"","recommendCouponUrl":[],"wxtoken":"","pageClickKey":"MJDAlliance_CheckDetail","fp":""}&loginType=2&_t=${$.now}&x-api-eid-token=jdd03BASZZM4SINAOL45QDH27HCD2ZL7YYOYC2VMIXIQSOIEKW3LACD56NT43SYCHDFOCLACUWIYYOMCZ5LIZEF2XSNLK6AAAAAMIJRGCHMAAAAAACXTRTM63W77XLEX&h5st=`,
		headers: {
      'Accept':'*/*',
      'Origin':'https://jingfen.jd.com',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
      'Cookie': cookie,
      'Referer': $.actURL,
      "User-Agent": 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
		}
	}
	return new Promise(async (resolve) => {
		$.post(opt, async (err, resp, data) => {
			try {
				if (err) {
					console.log(`${JSON.stringify(err)}`)
					console.log(` API请求失败，请检查网路重试`)
				} else {
          console.log(data)
          data = JSON.parse(data);
          // if (data.data.commonCoupon.msg == '成功') {
          //   console.log(data.data.commonCoupon.msg)
          // }
				}
			} catch (e) {
				$.logErr(e, resp)
			} finally {
				resolve(data)
			}
		})
	})
}
async function mshopcart(){
  const body = {
    "externalLoginType": 1,
    "callback": "addCartCB",
    "sceneval": "2",
    "reg": "1",
    "scene": "2",
    "type": "0",
    "commlist": `${$.sku_},,1,${$.sku_},1,0,0`,
    "locationid": "1-72-2819",
    "t": "0.3290234037204306",
    "tenantCode": "jgm",
    "bizModelCode": "0",
    "bizModeClientType": "M"
  };
  return new Promise(async resolve => {
    const options = {
      url: `https://api.m.jd.com/deal/mshopcart/addcmdy?loginType=2&appid=m_core&uuid=${random(70000000000000000, 8000000000000000)}&functionId=deal_mshopcart_addcmdy_m&jsonp=addCartCB&body=${encodeURIComponent(JSON.stringify(body))}&h5st=`,
      headers: {
        'Accept':'*/*',
        'Origin':'https://jingfen.jd.com',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Cookie': cookie,
        'Referer': 'https://item.m.jd.com/',
        "User-Agent": 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
        } else {
          if (data) {
            if (data.replace('addCartCB(','').replace(');','')) {
              data = data.replace('addCartCB(','').replace(');','')
              data = JSON.parse(data);
              if (data.errMsg) {
                console.log(data.errMsg)
              }
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
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Mobile/15E148 Safari/604.1"
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
function getUUID(x = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", t = 0) {
  return x.replace(/[xy]/g, function (x) {
    var r = (16 * Math.random()) | 0,
      n = "x" == x ? r : (3 & r) | 8;
    return (uuid = t ? n.toString(36).toUpperCase() : n.toString(36)), uuid;
  });
}
function random(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function getCodeList(url) {
  return new Promise(resolve => {
      const options = {
          url: `${url}?${new Date()}`, "timeout": 10000, headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
          }
      };
      $.get(options, async (err, resp, data) => {
          try {
              if (err) {
                  // $.log(err)
                  $.getCodeListerr = false
              } else {
              if (data) data = JSON.parse(data)
                  $.getCodeListerr = true
              }
          } catch (e) {
              $.logErr(e, resp)
              data = null;
          } finally {
              resolve(data);
          }
      })
  })
}
// prettier-ignore
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
