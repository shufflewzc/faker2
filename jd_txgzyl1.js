/*
更新时间：2022-7-12
皮卡车

# 变量
export PKC_TXGZYL=""

抓body方法：
添加重写，点击带有"特效"的关注有礼即可获取。能够实现：车头获取，全车跟上。（免sign、token）

圈x或v2p：
可在boxjs(皮卡车-TG推送)设置tg推送，获取变量自动给机器人发送，实现自助式监控。
boxjs订阅：https://git.metauniverse-cn.com/https://raw.githubusercontent.com/curtinlv/gd/main/dy/boxjs.json



兼容圈x、v2p
#【圈x】重写订阅地址: https://git.metauniverse-cn.com/https://raw.githubusercontent.com/curtinlv/gd/main/dy/cx.conf
#【v2p】重写订阅地址: https://git.metauniverse-cn.com/https://raw.githubusercontent.com/curtinlv/gd/main/dy/cx_v2p.json

[rewrite_remote]
https://git.metauniverse-cn.com/https://raw.githubusercontent.com/curtinlv/gd/main/dy/cx.conf, tag=订阅-Curtin, update-interval=172800, opt-parser=false, enabled=true

[task_local]
#获取body后执行
1 1 1 1 1 1 https://git.metauniverse-cn.com/https://raw.githubusercontent.com/curtinlv/gd/main/jk_script/pkc_txgzyl.js, tag=PKC-特效关注有礼, enabled=false


*/
const $ = new Env('PKC关注有礼-特效');
let cookiesArr = [], cookie = '',  notify,  allMessage = '' ;
const logs = 0; // 0为关闭日志，1为开启
$.message = '';
const timeout = 15000;//超时时间(单位毫秒)
sleeptime = 1500; //请求休眠时间(单位毫秒)


$.countBean={};
let isGetbody = typeof $request !== 'undefined';

!(async () => {
     if (isGetbody) {
         // Telegram 为监控准备，抓body自动发到tg监控bot设置变量
         TG_BOT_TOKEN = ($.getdata('TG_BOT_TOKEN') || '');
         TG_USER_ID = ($.getdata('TG_USER_ID') || '');
         TG_API_HOST = ($.getdata('TG_API_HOST') || 'api.telegram.org');
         TG_PROXY_HOST = ($.getdata('TG_PROXY_HOST') || '');
         TG_PROXY_PORT = ($.getdata('TG_PROXY_PORT') || '');
         TG_PROXY_AUTH = ($.getdata('TG_PROXY_AUTH') || '');
        await GetBody();
        $.done();
}
    await requireConfig();
    if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
    }

  for ( let b = 0; b < $.activityIdArr.length; b++){
    label = 0;
    for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      nickname = `${$.nickName || $.UserName}`;
      await TotalBean();
      console.log(`\n开始【京东账号${$.index}】${$.nickName || $.UserName}\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      activityId = $.activityIdArr[b];
      await isvObfuscator(sleeptime);
      await activity(sleeptime);
      await activityContent(sleeptime);
      if (label === 4){
          break
        }
        // await getSimpleActInfoVo();

       await getMyPing(sleeptime);
       await draw(sleeptime);
       if($.index != cookiesArr.length){
           // 每个账号间隔随机休眠几秒
          await $.wait(parseInt(Math.random() * 5000 + 100, 10));
      }
    }
  }

  }
     //count
  if($.countBean){
      $.message += '\n-----------【PKC特效关注有礼】-----------\n';
      for (var key in $.countBean){
          $.message += `【账号】${key} ${$.countBean[key]}\n`
      }
  }

  if ($.isNode()) {
      console.log(`${$.name}\n${$.message}`);
      await notify.sendNotify($.name, $.message);
  }else {
      $.msg($.name, ``, $.message);
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    });


async function GetBody() {
    if ($request && $request.url.indexOf("wxShopGift/draw") >= 0) {

        if (typeof $request.body !== 'undefined'){
             modifiedBody = $request.body;
            const gzylBodyVal = modifiedBody.match(/activityId=(.*?)&/)[1];;
            if (gzylBodyVal) $.setdata(gzylBodyVal, "PKC_TXGZYL");
            $.log(
                `[${$.name}] PKC特效关注有礼店铺id✅: 成功, export PKC_TXGZYL='${gzylBodyVal}'`
            );
            $.msg($.name, `获取特效关注有礼店铺id: 成功🎉`, `export PKC_TXGZYL="${gzylBodyVal}"`);
            await sendNotify(`#PKC皮卡车\nexport PKC_TXGZYL="${gzylBodyVal}" #PKC特效关注有礼店铺id`, ``)
        };
        $done();
    }
}

//获取LZ_TOKEN_KEY
async function activity(timeout = 500) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let url = {
                url: `https://lzkj-isv.isvjcloud.com/wxShopGift/activity?activityId=${activityId}&sid=${randomString(32,'xx')}&un_area=${randomString(2,'int')}_${randomString(4,'int')}_${randomString(4,'int')}_${randomString(5,'int')}`,

                headers:{
                    'Accept-Encoding' : `gzip, deflate, br`,
                    'Cookie' : '',
                    'Connection' : `keep-alive`,
                    'Accept' : `text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8`,
                    'Host' : `lzkj-isv.isvjcloud.com`,
                    'User-Agent' : $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.18(0x18001236) NetType/WIFI Language/zh_CN"),
                    'Accept-Language' : `zh-CN,zh-Hans;q=0.9`
                    },

                body: ``
            };
            // console.log(JSON.stringify(url));
            $.post(url, async (err, resp, data) => {
                try {
                    //  $.resp = JSON.parse(resp);
                    rep_cookies = resp.headers['set-cookie'];
                    // console.log(rep_cookies);
                    r_cookie='';
                    for(var c in rep_cookies){
                        r_cookie += rep_cookies[c].split(" ")[0];
                    }
                    // console.log(r_cookie);

                     // // $.data = JSON.parse(data);
                     //  $.log(`测试activity🚩resp: ${JSON.stringify(resp, null ,'\t')}`);
                     //  console.log(JSON.stringify($.data,null, '\t'));
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve()
                }
            })
        }, timeout)
    })
}
//获取LZ_TOKEN_KEY
async function getSimpleActInfoVo(timeout = 500) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let url = {
                url: `https://lzkj-isv.isvjcloud.com/customer/getSimpleActInfoVo`,

                headers: {
                        'X-Requested-With' : `XMLHttpRequest`,
                        'Connection' : `keep-alive`,
                        'Accept-Encoding' : `gzip, deflate, br`,
                        'Content-Type' : `application/x-www-form-urlencoded`,
                        'Origin' : `https://lzkj-isv.isvjcloud.com`,
                        'User-Agent' : $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.18(0x18001236) NetType/WIFI Language/zh_CN"),
                        'Cookie' :`IsvToken=${token};`+ cookie + r_cookie ,
                        'Host' : `lzkj-isv.isvjcloud.com`,
                        'Referer' : `https://lzkj-isv.isvjcloud.com/wxShopGift/activity?activityId=${activityId}&sid=${randomString(32,'xx')}w&un_area=${randomString(2,'int')}_${randomString(4,'int')}_${randomString(4,'int')}_${randomString(5,'int')}`,
                        'Accept-Language' : `zh-CN,zh-Hans;q=0.9`,
                        'Accept' : `application/json`
                },

                body: `activityId=${activityId}`
            };
            // console.log(JSON.stringify(url));
            $.post(url, async (err, resp, data) => {
                try {
                    //  $.resp = JSON.parse(resp);
                    $.data = JSON.parse(data);
                    rep_cookies = resp.headers['set-cookie'];
                    // console.log(rep_cookies);
                    r_cookie='';
                    for(var c in rep_cookies){
                        r_cookie += rep_cookies[c].split(" ")[0];
                    }
                    if($.data.result){
                        jdActivityId=$.data.data.jdActivityId;
                        venderId=$.data.data.venderId;
                        shopId=$.data.data.shopId;
                    }
                    console.log(r_cookie);
                    console.log(jdActivityId);
                    console.log(venderId);
                    console.log(shopId);
                    // return
                     // // $.data = JSON.parse(data);
                     //  $.log(`测试activity🚩resp: ${JSON.stringify(resp, null ,'\t')}`);
                     //  console.log(JSON.stringify($.data,null, '\t'));
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve()
                }
            })
        }, timeout)
    })
}
// 获取userid
async function activityContent(timeout = 500) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let url = {
                url: `https://lzkj-isv.isvjcloud.com/wxShopGift/activityContent`,

                headers: {
                        'X-Requested-With' : `XMLHttpRequest`,
                        'Connection' : `keep-alive`,
                        'Accept-Encoding' : `gzip, deflate, br`,
                        'Content-Type' : `application/x-www-form-urlencoded`,
                        'Origin' : `https://lzkj-isv.isvjcloud.com`,
                        'User-Agent' : $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.18(0x18001236) NetType/WIFI Language/zh_CN"),
                        'Cookie' : cookie,
                        'Host' : `lzkj-isv.isvjcloud.com`,
                        'Referer' : ``,
                        'Accept-Language' : `zh-CN,zh-Hans;q=0.9`,
                        'Accept' : `application/json`
                },

                body: `activityId=${activityId}&buyerPin=${randomString(64)}`

            };
            // console.log(`${JSON.stringify(url)}`);
            userId = '';
            $.post(url, async (err, resp, data) => {
                try {
                    $.data = JSON.parse(data);
                      // console.log(`activityContent🚩${JSON.stringify($.data, null, '\t')}`);
                      if($.data.result){
                            userId=$.data.data.userId;
                            endTime=$.data.data.endTime;
                            list=$.data.data.list;
                            lp = '';
                            for (var k in list){
                                lp += list[k]['takeNum'] + list[k]['type']+ ' '
                            }
                            if(lp){
                                lp_list = lp.replace('jd', '京豆').replace('jf','积分').replace('dq','东券')
                                console.log(`${$.nickName || $.UserName} 哇！快看，特效真美美美，biubiu~`)
                            }
                            if(Math.round(new Date().getTime())>endTime){
                                console.log(`活动已结束`);
                                label = 4
                            }
                            if(list.length === 0){
                                console.log(`礼品已领完`);
                                label = 4
                            }

                      }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve()
                }
            })
        }, timeout)
    })
}
// 获取token
async function isvObfuscator(timeout = 500) {
    return new Promise((resolve) => {
        setTimeout(() => {
            body = `body=%7B%22url%22%3A%22https%3A%5C/%5C/lzkj-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&build=167874&client=apple&clientVersion=10.2.4&d_brand=apple&d_model=iPhone14%2C3&ef=1&eid=${randomString(116)}&ep=%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22screen%22%3A%22CJS4DMeyDzc4%22%2C%22wifiBssid%22%3A%22${randomString(43)}%3D%22%2C%22osVersion%22%3A%22CJUkDK%3D%3D%22%2C%22area%22%3A%22${randomString(24)}%22%2C%22openudid%22%3A%22DtVwZtvvZJcmZwPtDtc5DJSmCtZvDzLsCzK2DJG2DtU1EWG5Dzc2ZK%3D%3D%22%2C%22uuid%22%3A%22${randomString(32,'xx')}%22%7D%2C%22ts%22%3A${get_times('ss')}%2C%22hdid%22%3A%22${randomString(43)}%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D&ext=%7B%22prstate%22%3A%220%22%7D&isBackground=N&joycious=98&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&partner=apple&rfs=0000&scope=10&sign=ece45b391fb4abf4e4590c7da6eeacc5&st=1649150743509&sv=101&uemps=0-0&uts=${randomString(64)}`;
            let url = {
                url: `https://api.m.jd.com/client.action?functionId=isvObfuscator`,

                headers : {
                     'Connection' : `keep-alive`,
                     'Accept-Encoding' : `gzip, deflate, br`,
                     'Content-Type' : `application/x-www-form-urlencoded`,
                     'User-Agent' : `JD4iPhone/167874%20(iPhone;%20iOS;%20Scale/3.00)`,
                     'Cookie' : cookie,
                     'Host' : `api.m.jd.com`,
                     'Referer' : ``,
                     'Accept-Language' : `zh-Hans-CN;q=1, en-CN;q=0.9`,
                     'Accept' : `*/*`
                     },
                body: body
            };
            // console.log(JSON.stringify(url));
            $.post(url, async (err, resp, data) => {
                try {
                    $.data = JSON.parse(data);
                    //     $.log(`测试🚩: ${data}`)
                    //   $.log(`请求token测试🚩resp: ${JSON.stringify(resp, null ,'\t')}`);
                    //   console.log(JSON.stringify($.data,null, '\t'));
                      if($.data.errcode === 0){
                          token = $.data.token
                          // console.log(`Toekn: ${token}`)
                      }else {
                          token = '';
                          console.log(`token获取失败 ${$.data.message}`);
                      }
                } catch (e) {
                    $.logErr(e, resp);
                    token = '';
                } finally {
                    resolve()
                }
            })
        }, timeout)
    })
}
// getMyPing
async function getMyPing(timeout = 500) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let url = {
                url: `https://lzkj-isv.isvjcloud.com/customer/getMyPing`,

                headers: {
                        'X-Requested-With' : `XMLHttpRequest`,
                        'Connection' : `keep-alive`,
                        'Accept-Encoding' : `gzip, deflate, br`,
                        'Content-Type' : `application/x-www-form-urlencoded`,
                        'Origin' : `https://lzkj-isv.isvjcloud.com`,
                        'User-Agent' : $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.18(0x18001236) NetType/WIFI Language/zh_CN"),
                        'Cookie' :`IsvToken=${token};`+ cookie + r_cookie ,
                        'Host' : `lzkj-isv.isvjcloud.com`,
                        'Referer' : `https://lzkj-isv.isvjcloud.com/wxShopGift/activity?activityId=${activityId}&sid=${randomString(32,'xx')}w&un_area=${randomString(2,'int')}_${randomString(4,'int')}_${randomString(4,'int')}_${randomString(5,'int')}`,
                        'Accept-Language' : `zh-CN,zh-Hans;q=0.9`,
                        'Accept' : `application/json`
                },
                body: `userId=${userId}&token=${token}&fromType=APP_shopGift`

            };
            username=nickname;
            pin='';
            // console.log(`getMyPing URL = ${JSON.stringify(url)}`);
            $.post(url, async (err, resp, data) => {
                try {
                    // $.data = JSON.parse(data);
                     if(err){
                         $.log(`${JSON.stringify(err)}`);
                     }else {
                         $.data = JSON.parse(data);
                         rep_cookies = resp.headers['set-cookie'];
                         // console.log(JSON.stringify($.data,null, '\t'));
                         r_cookie='';
                         for(var c in rep_cookies){
                             r_cookie += rep_cookies[c].split(" ")[0];
                         }
                         if($.data.result){
                              username=$.data.data.nickname;
                              pin=encodeURIComponent($.data.data.secretPin);

                          }else {
                              console.log(`${$.data.errorMessage}`)
                          }
                     }

                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve()
                }
            })
        }, timeout)
    })
}

async function draw(timeout = 500) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let url = {
                url: `https://lzkj-isv.isvjcloud.com/wxShopGift/draw`,

                headers: {
                        'X-Requested-With' : `XMLHttpRequest`,
                        'Connection' : `keep-alive`,
                        'Accept-Encoding' : `gzip, deflate, br`,
                        'Content-Type' : `application/x-www-form-urlencoded`,
                        'Origin' : `https://lzkj-isv.isvjcloud.com`,
                        'User-Agent' : $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.18(0x18001236) NetType/WIFI Language/zh_CN"),
                        'Cookie' :`IsvToken=${token};`+ cookie + r_cookie ,
                        'Host' : `lzkj-isv.isvjcloud.com`,
                        'Referer' : `https://lzkj-isv.isvjcloud.com/wxShopGift/activity?activityId=${activityId}&sid=${randomString(32,'xx')}w&un_area=${randomString(2,'int')}_${randomString(4,'int')}_${randomString(4,'int')}_${randomString(5,'int')}`,
                        'Accept-Language' : `zh-CN,zh-Hans;q=0.9`,
                        'Accept' : `application/json`
                },
                body: `activityId=${activityId}&buyerPin=${pin}&hasFollow=false&accessType=app`

            };

            // console.log(`getMyPing URL = ${JSON.stringify(url)}`);
            $.post(url, async (err, resp, data) => {
                try {
                    // $.data = JSON.parse(data);
                     if(err){
                         $.log(`${JSON.stringify(err)}`);
                     }else {
                         $.data = JSON.parse(data);
                         // console.log(JSON.stringify($.data,null, '\t'));
                          if($.data.result){
                              console.log(`\tYes, 关注成功领取 ${lp_list}`);
                              getlp = lp_list
                          }else {
                              console.log(`\t${$.data.errorMessage}`);
                              getlp = $.data.errorMessage
                          }

                          if($.countBean[username]){
                                $.countBean[username] += getlp;
                            }else {
                                $.countBean[username] = getlp;
                           }
                     }
                     console.log("*****************************************")

                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve()
                }
            })
        }, timeout)
    })
}

function randomString(len, lx='hh') {
　　len = len || 32;
     if(lx==='hh'){
         var $chars = 'ABCDEFGHJKMNPQRSTWXYZoOLlabcde9gqfhijkmnVvprstwxyz234Uu5I1678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
     }
     else if(lx === 'xx') {
         var $chars = 'abcdefhijkmnprstwxyzolgqvu0192345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
     }
     else if(lx ==='dx'){
         var $chars = 'ABCDEFGHJKMNPQRSTWXYZUVILO0192345678';
     }
     else if(lx ==='int'){
         var $chars = '0192345678';
     }
  　　var maxPos = $chars.length;
  　　var pwd = '';
  　　for (i = 0; i < len; i++) {
  　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  　　}
 　　return pwd;
 };
function get_times(lx='ms') {
     let timeInMS = Math.round(new Date().getTime());
     let timeInSecond = Math.floor(timeInMS/1000);
     // var times = ''
     if(lx==='ms'){
         return timeInMS
     }else if(lx==='ss'){
         return timeInSecond
     }else {
         return ''
     }
}

function tgBotNotify(text, desp) {
  return  new Promise(resolve => {
    if (TG_BOT_TOKEN && TG_USER_ID) {
        var bodys = {"chat_id": TG_USER_ID, "text": text+"\n"+desp, "disable_web_page_preview": true};
        const options = {
        url: `https://${TG_API_HOST}/bot${TG_BOT_TOKEN}/sendMessage`,
        body: JSON.stringify(bodys),
        headers: {
          'Content-Type': 'application/json'
        },
        timeout
      }
      // console.log(JSON.stringify(options, null, "\t"));
      if (TG_PROXY_HOST && TG_PROXY_PORT) {
        const tunnel = require("tunnel");
        const agent = {
          https: tunnel.httpsOverHttp({
            proxy: {
              host: TG_PROXY_HOST,
              port: TG_PROXY_PORT * 1,
              proxyAuth: TG_PROXY_AUTH
            }
          })
        }
        Object.assign(options, { agent })
      }
      $.post(options, (err, resp, data) => {
        try {
          if (err) {
            console.log('telegram发送通知消息失败！！\n');
            console.log(err);
          } else {
            data = JSON.parse(data);
            if (data.ok) {
                console.log('Telegram发送通知消息成功🎉。\n')
                $.msg(`【PKC提示】`, `[${$.name}]变量已推送到监控群组【${data.result.chat.title}】\n`);
            } else if (data.error_code === 400) {
              console.log('请主动给bot发送一条消息并检查接收用户ID是否正确。\n')
            } else if (data.error_code === 401){
              console.log('Telegram bot token 填写错误。\n')
            }
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve(data);
        }
      })
    } else {
      console.log('可提供TG机器人推送变量到监控\nboxjs订阅：https://gitee.com/curtinlv/Curtin/raw/master/Boxjs/curtin.boxjs.json\n');
      $.msg(`【PKC提示】`, '可提供TG机器人推送变量到指定监控群组\nboxjs订阅：https://gitee.com/curtinlv/Curtin/raw/master/Boxjs/curtin.boxjs.json\n');
      resolve()
    }
  })
}

async function sendNotify(text, desp) {
    // text = text.match(/.*?(?=\s?-)/g) ? text.match(/.*?(?=\s?-)/g)[0] : text;
    await Promise.all([
        tgBotNotify(text, desp),//telegram 机器人

  ])
}

function requireConfig() {
  return new Promise(resolve => {
    notify = $.isNode() ? require('./sendNotify') : '';
    //Node.js用户请在jdCookie.js处填写京东ck;
    const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
    const activityIdArrNode = $.isNode() ? process.env.PKC_TXGZYL.split('@') : [];

    // IOS等用户直接用NobyDa的jd cookie
    if ($.isNode()) {
      Object.keys(jdCookieNode).forEach((item) => {
        if (jdCookieNode[item]) {
          cookiesArr.push(jdCookieNode[item])
        }
      });
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};

    } else {
      cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
    }
    console.log(`共${cookiesArr.length}个京东账号\n`)
    $.activityIdArr = [];
    if ($.isNode()) {
      Object.keys(activityIdArrNode).forEach((item) => {
        if (activityIdArrNode[item]) {
          $.activityIdArr.push(activityIdArrNode[item])
        }
      })
    } else {
      if ($.getdata('pkc_txgzyl')) $.activityIdArr = $.getdata('pkc_txgzyl').split('@').filter(item => !!item);
      // console.log(`\nBoxJs设置的${$.name}关注有礼body:${$.getdata('gzylbody') ? $.getdata('gzylbody') : '暂无'}\n`);
    }

    console.log(`您提供了${$.activityIdArr.length}个的特效关注有礼店铺活动\n`);
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
            if (data['retcode'] === 0 && data.base && data.base.nickname) {
              $.nickName = data.base.nickname;
            }
          } else {
            console.log(`京东服务器返回空数据`)
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


// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got/dist/source/index"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t, e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t, s, i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
