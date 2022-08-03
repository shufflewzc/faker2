/*
签到领现金
活动入口：京东APP搜索领现金进入
更新时间：2022-08-02
定时自定义，一天跑两次就行了
 */

const $ = new Env('签到领现金_Dylan');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let jdNotify = true;
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message;
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
const JD_API_HOST = 'https://api.m.jd.com/client.action';
let allMessage = '';

!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
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
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      await jdCash()
    }
  }
  if (allMessage) {
    if ($.isNode() && (process.env.CASH_NOTIFY_CONTROL ? process.env.CASH_NOTIFY_CONTROL === 'false' : !!1)) await notify.sendNotify($.name, allMessage);
    $.msg($.name, '', allMessage);
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
async function jdCash() {
  $.signMoney = 0;

  await appindex()
  await index()
  await appindex(true)
}

async function appindex(info=false) {
  let functionId = "cash_homePage"
  let sign = `body=%7B%7D&build=167968&client=apple&clientVersion=10.4.0&d_brand=apple&d_model=iPhone13%2C3&ef=1&eid=eidI25488122a6s9Uqq6qodtQx6rgQhFlHkaE1KqvCRbzRnPZgP/93P%2BzfeY8nyrCw1FMzlQ1pE4X9JdmFEYKWdd1VxutadX0iJ6xedL%2BVBrSHCeDGV1&ep=%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22screen%22%3A%22CJO3CMeyDJCy%22%2C%22osVersion%22%3A%22CJUkDK%3D%3D%22%2C%22openudid%22%3A%22CJSmCWU0DNYnYtS0DtGmCJY0YJcmDwCmYJC0DNHwZNc5ZQU2DJc3Zq%3D%3D%22%2C%22area%22%3A%22CJZpCJCmC180ENcnCv80ENc1EK%3D%3D%22%2C%22uuid%22%3A%22aQf1ZRdxb2r4ovZ1EJZhcxYlVNZSZz09%22%7D%2C%22ts%22%3A1648428189%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D&ext=%7B%22prstate%22%3A%220%22%2C%22pvcStu%22%3A%221%22%7D&isBackground=N&joycious=104&lang=zh_CN&networkType=3g&networklibtype=JDNetworkBaseAF&partner=apple&rfs=0000&scope=11&sign=98c0ea91318ef1313786d86d832f1d4d&st=1648428208392&sv=101&uemps=0-0&uts=0f31TVRjBSv7E8yLFU2g86XnPdLdKKyuazYDek9RnAdkKCbH50GbhlCSab3I2jwM04d75h5qDPiLMTl0I3dvlb3OFGnqX9NrfHUwDOpTEaxACTwWl6n//EOFSpqtKDhg%2BvlR1wAh0RSZ3J87iAf36Ce6nonmQvQAva7GoJM9Nbtdah0dgzXboUL2m5YqrJ1hWoxhCecLcrUWWbHTyAY3Rw%3D%3D`
  return new Promise((resolve) => {
    $.post(apptaskUrl(functionId, sign), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`appindex API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if(data.code===0 && data.data.result){
              if(info){
                if (message) {
                  message += `当前现金：${data.data.result.totalMoney}元`;
                  allMessage += `京东账号${$.index}${$.nickName}\n${message}${$.index !== cookiesArr.length ? '\n\n' : ''}`;
                }
                console.log(`\n\n当前现金：${data.data.result.totalMoney}元`);
                return
              }
              $.signMoney = data.data.result.totalMoney;
              // console.log(`您的助力码为${data.data.result.invitedCode}`)
              //console.log(`\n【京东账号${$.index}（${$.UserName}）的好友互助码】${data.data.result.invitedCode}\n`);
              let helpInfo = {
                'inviteCode': data.data.result.invitedCode,
                'shareDate': data.data.result.shareDate
              }
              $.shareDate = data.data.result.shareDate;
              // $.log(`shareDate: ${$.shareDate}`)
              // console.log(helpInfo)
              for (let task of data.data.result.taskInfos) {
                if (task.type === 4) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await appdoTask(task.type, task.jump.params.skuId)
                    await $.wait(5000)
                  }
                } else if (task.type === 2) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await appdoTask(task.type, task.jump.params.shopId)
                    await $.wait(5000)
                  }
                } else if (task.type === 30) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await appdoTask(task.type, task.jump.params.path)
                    await $.wait(5000)
                  }
                } else if (task.type === 16 || task.type===3 || task.type===5 || task.type===17 || task.type===35)  {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await appdoTask(task.type, task.jump.params.url)
                    await $.wait(5000)
                  }
                }else if (task.type === 7) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await appdoTask(task.type, 1)
                    await $.wait(5000)
                  }
                }
              }
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
function index() {
  return new Promise((resolve) => {
    $.get(taskUrl("cash_mob_home"), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`index API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0 && data.data.result) {
              for (let task of data.data.result.taskInfos) {
                if (task.type === 4) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await doTask(task.type, task.jump.params.skuId)
                    await $.wait(5000)
                  }
                } else if (task.type === 2) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await doTask(task.type, task.jump.params.shopId)
                    await $.wait(5000)
                  }
                } else if (task.type === 31) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await doTask(task.type, task.jump.params.path)
                    await $.wait(5000)
                  }
                } else if (task.type === 16 || task.type===3 || task.type===5 || task.type===17 || task.type===21) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await doTask(task.type, task.jump.params.url)
                    await $.wait(5000)
                  }
                }
              }
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

async function appdoTask(type,taskInfo) {
  let functionId = 'cash_doTask'
  let body = {"type":type,"taskInfo":taskInfo}
  for (let i=0; i<3; i++){
  var sign = await _0x5f5391(functionId, body)
  if(sign) break;
  await $.wait(5000)
  } 
  if(sign){
    return new Promise((resolve) => {
      $.post(apptaskUrl(functionId, sign), (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`appdoTask API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if(data.code === 0) {
                console.log(`任务完成成功`)
              } else {
                console.log(JSON.stringify(data))
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
}
function doTask(type,taskInfo) {
  return new Promise((resolve) => {
    $.get(taskUrl("cash_doTask",{"type":type,"taskInfo":taskInfo}), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`doTask API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if( data.code === 0){
              console.log(`任务完成成功`)
              // console.log(data.data.result.taskInfos)
            }else{
              console.log(data)
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
;var encode_version = 'jsjiami.com.v5', onjan = '__0xe74ef',  __0xe74ef=['\x77\x6f\x48\x44\x72\x52\x64\x50\x54\x41\x3d\x3d','\x77\x72\x73\x56\x77\x6f\x49\x75\x77\x37\x63\x3d','\x77\x36\x7a\x44\x70\x43\x46\x6f\x42\x51\x3d\x3d','\x77\x71\x66\x43\x76\x4d\x4f\x30\x77\x72\x63\x43','\x77\x37\x49\x37\x77\x70\x44\x43\x6a\x73\x4b\x52','\x77\x36\x50\x43\x6d\x57\x51\x6f\x77\x71\x6f\x3d','\x77\x6f\x44\x44\x69\x67\x64\x4d\x59\x41\x3d\x3d','\x65\x6a\x78\x4d\x77\x36\x76\x43\x6f\x63\x4b\x34','\x4f\x4d\x4b\x71\x77\x70\x51\x31\x4a\x77\x3d\x3d','\x64\x73\x4f\x61\x77\x36\x6b\x3d','\x4b\x73\x4f\x38\x77\x6f\x6e\x44\x67\x6b\x4d\x3d','\x77\x35\x50\x43\x6f\x6c\x2f\x44\x68\x51\x3d\x3d','\x49\x63\x4f\x6d\x77\x72\x62\x44\x71\x67\x3d\x3d','\x77\x72\x62\x44\x6f\x42\x68\x32\x52\x77\x3d\x3d','\x44\x55\x59\x52\x45\x67\x6b\x3d','\x77\x37\x6a\x44\x75\x33\x62\x44\x75\x38\x4b\x63','\x41\x38\x4f\x50\x77\x35\x63\x3d','\x77\x6f\x6b\x78\x77\x71\x51\x4a\x77\x36\x62\x44\x74\x73\x4f\x64\x57\x56\x55\x3d','\x77\x71\x54\x44\x6d\x44\x70\x70\x62\x38\x4b\x49\x77\x71\x51\x45\x77\x70\x44\x43\x72\x38\x4f\x36\x77\x35\x6b\x78\x65\x77\x3d\x3d','\x45\x30\x55\x4e','\x77\x35\x30\x59\x77\x6f\x51\x3d','\x35\x34\x6d\x74\x35\x70\x36\x2b\x35\x59\x79\x6a\x37\x37\x36\x68\x4a\x4d\x4b\x66\x35\x4c\x32\x65\x35\x61\x36\x49\x35\x70\x2b\x42\x35\x62\x2b\x50\x35\x36\x75\x55\x37\x37\x79\x50\x36\x4c\x79\x54\x36\x4b\x36\x64\x35\x70\x53\x58\x35\x6f\x2b\x61\x35\x6f\x69\x79\x35\x4c\x75\x48\x35\x35\x6d\x64\x35\x62\x65\x4f\x35\x4c\x2b\x4d','\x45\x38\x4b\x6d\x77\x35\x44\x44\x6b\x7a\x38\x3d','\x43\x63\x4b\x4d\x77\x34\x41\x61\x59\x41\x3d\x3d','\x4f\x4d\x4b\x39\x77\x35\x62\x44\x68\x53\x4d\x3d','\x77\x37\x39\x6f\x77\x6f\x58\x43\x67\x38\x4f\x7a','\x58\x6a\x37\x44\x75\x73\x4f\x79\x46\x77\x3d\x3d','\x4d\x63\x4f\x38\x77\x36\x62\x43\x6b\x6b\x6f\x3d','\x49\x63\x4f\x35\x77\x6f\x78\x71\x46\x77\x3d\x3d','\x4c\x6d\x45\x63\x48\x7a\x45\x3d','\x77\x36\x7a\x44\x74\x6b\x4e\x72\x44\x67\x3d\x3d','\x4c\x73\x4f\x7a\x77\x35\x35\x4c\x62\x51\x3d\x3d','\x77\x71\x33\x43\x6d\x7a\x6e\x43\x75\x6b\x30\x3d','\x4f\x6e\x4c\x44\x73\x4d\x4b\x6c\x47\x67\x3d\x3d','\x77\x35\x41\x2f\x77\x6f\x33\x44\x6a\x56\x41\x3d','\x4a\x58\x41\x2f\x43\x73\x4f\x67','\x77\x35\x72\x44\x6b\x44\x4c\x44\x6f\x6c\x41\x3d','\x47\x4d\x4b\x61\x49\x43\x54\x44\x70\x51\x3d\x3d','\x59\x38\x4f\x57\x50\x57\x6f\x44','\x46\x73\x4f\x4c\x77\x72\x48\x44\x6f\x63\x4f\x34','\x48\x68\x72\x43\x6f\x63\x4f\x7a\x44\x73\x4b\x65\x77\x37\x63\x32\x77\x71\x46\x34\x59\x41\x3d\x3d','\x77\x34\x62\x43\x76\x38\x4b\x67\x42\x67\x34\x6f','\x45\x6d\x37\x44\x76\x73\x4b\x38\x45\x67\x3d\x3d','\x77\x34\x6f\x66\x77\x72\x33\x44\x72\x6c\x2f\x43\x67\x4d\x4f\x35\x77\x71\x7a\x44\x6c\x67\x3d\x3d','\x77\x37\x33\x43\x67\x45\x6f\x3d','\x77\x34\x62\x43\x72\x31\x51\x74\x77\x72\x51\x79\x56\x52\x76\x43\x6d\x63\x4b\x6d\x41\x73\x4b\x62\x77\x6f\x5a\x72\x77\x71\x4c\x43\x74\x7a\x42\x57\x77\x72\x4c\x43\x74\x58\x41\x44\x5a\x4d\x4f\x6d\x77\x6f\x70\x4a\x77\x72\x50\x43\x74\x38\x4b\x71\x57\x73\x4b\x61\x77\x71\x6a\x44\x73\x38\x4b\x37\x77\x35\x55\x3d','\x46\x63\x4b\x66\x49\x69\x66\x44\x67\x38\x4b\x30\x77\x6f\x59\x49\x50\x6b\x6f\x75\x77\x35\x6b\x67\x77\x71\x74\x76\x57\x38\x4b\x70\x77\x37\x54\x44\x76\x6a\x2f\x43\x69\x63\x4f\x37\x77\x37\x59\x37\x77\x34\x4d\x34\x77\x71\x49\x6a\x77\x71\x67\x31\x41\x55\x6c\x57','\x36\x4c\x2b\x49\x35\x6f\x2b\x32\x62\x38\x4f\x33\x35\x70\x2b\x65\x35\x59\x6d\x72\x35\x6f\x6d\x6b\x35\x59\x75\x67','\x35\x36\x32\x56\x35\x5a\x4f\x31\x36\x49\x36\x78\x35\x59\x2b\x6d\x35\x61\x57\x56\x36\x4c\x65\x76\x43\x65\x61\x4d\x76\x65\x53\x35\x75\x75\x61\x56\x68\x75\x6d\x57\x6e\x75\x57\x48\x6e\x4f\x69\x75\x70\x63\x4b\x55','\x77\x34\x56\x78\x77\x35\x63\x69\x77\x71\x34\x3d','\x77\x36\x48\x44\x73\x47\x50\x43\x74\x38\x4b\x6c','\x77\x35\x6e\x44\x70\x69\x4c\x44\x73\x56\x4d\x3d','\x47\x38\x4f\x74\x61\x68\x6b\x52','\x5a\x73\x4f\x6a\x47\x63\x4b\x4b\x4f\x41\x3d\x3d','\x77\x70\x44\x43\x73\x73\x4b\x38\x46\x67\x3d\x3d','\x58\x4d\x4f\x46\x43\x67\x3d\x3d','\x65\x4d\x4b\x4d\x59\x51\x3d\x3d','\x55\x53\x76\x44\x6f\x51\x3d\x3d','\x77\x37\x62\x43\x6c\x6e\x51\x3d','\x36\x4c\x2b\x70\x35\x6f\x2b\x50\x77\x37\x7a\x44\x6f\x65\x61\x64\x75\x2b\x57\x4b\x72\x4f\x61\x4c\x74\x75\x57\x4c\x75\x77\x3d\x3d','\x77\x36\x54\x44\x67\x4d\x4b\x54','\x4d\x73\x4f\x6e\x77\x34\x49\x3d','\x44\x63\x4f\x31\x77\x71\x55\x3d','\x77\x35\x66\x44\x70\x47\x49\x3d','\x35\x34\x75\x78\x35\x70\x32\x48\x35\x59\x79\x34\x37\x37\x36\x4c\x57\x38\x4b\x55\x35\x4c\x36\x4b\x35\x61\x32\x51\x35\x70\x36\x77\x35\x62\x32\x65\x35\x36\x75\x78\x37\x37\x32\x61\x36\x4c\x79\x75\x36\x4b\x36\x6a\x35\x70\x53\x35\x35\x6f\x36\x53\x35\x6f\x69\x4c\x35\x4c\x71\x53\x35\x35\x6d\x4f\x35\x62\x53\x6a\x35\x4c\x79\x71','\x77\x37\x54\x44\x6a\x73\x4b\x5a','\x36\x4c\x32\x44\x35\x6f\x79\x79\x36\x4c\x79\x6d\x35\x6f\x32\x6d\x48\x57\x2f\x6d\x6e\x59\x2f\x6c\x69\x36\x50\x6c\x70\x61\x66\x6f\x74\x6f\x33\x76\x76\x49\x2f\x70\x68\x71\x62\x6f\x72\x49\x62\x6a\x67\x61\x76\x6a\x67\x71\x58\x6a\x67\x71\x73\x3d','\x54\x73\x4b\x4b\x63\x67\x3d\x3d','\x77\x34\x77\x46\x77\x71\x76\x44\x6f\x6c\x66\x43\x6a\x73\x4f\x2b\x77\x71\x2f\x44\x69\x77\x3d\x3d','\x58\x52\x6e\x44\x6b\x73\x4f\x52\x46\x32\x44\x43\x6a\x30\x70\x65\x5a\x44\x38\x6b\x77\x37\x6a\x43\x6e\x67\x3d\x3d','\x35\x59\x69\x4c\x36\x5a\x71\x63\x35\x34\x6d\x4f\x35\x70\x79\x63\x35\x59\x36\x54\x37\x37\x2b\x47\x54\x79\x7a\x6b\x76\x59\x72\x6c\x72\x4b\x72\x6d\x6e\x62\x58\x6c\x76\x61\x6a\x6e\x71\x36\x63\x3d','\x77\x34\x58\x44\x68\x53\x42\x48\x42\x51\x3d\x3d','\x41\x4d\x4b\x37\x77\x72\x51\x44\x43\x51\x3d\x3d','\x77\x35\x2f\x44\x76\x38\x4b\x63\x77\x72\x59\x56','\x57\x38\x4b\x5a\x64\x45\x4d\x42','\x4d\x38\x4f\x70\x77\x71\x35\x2b\x49\x77\x3d\x3d','\x62\x38\x4f\x2b\x4c\x58\x63\x3d','\x66\x63\x4f\x55\x43\x38\x4b\x35\x42\x77\x3d\x3d','\x46\x4d\x4b\x4c\x77\x71\x51\x48\x50\x51\x3d\x3d','\x48\x38\x4f\x6f\x77\x36\x33\x43\x74\x55\x51\x3d','\x47\x33\x73\x4a\x45\x68\x41\x3d','\x77\x36\x4a\x70\x77\x36\x41\x3d','\x47\x73\x4b\x47\x77\x37\x34\x6a\x65\x67\x3d\x3d','\x77\x36\x6e\x44\x69\x42\x5a\x6b','\x51\x52\x50\x44\x6f\x6c\x67\x3d','\x4f\x73\x4f\x52\x52\x44\x49\x6f','\x77\x36\x41\x55\x77\x70\x6a\x43\x6b\x63\x4b\x54','\x66\x4d\x4f\x48\x77\x36\x51\x43\x56\x67\x3d\x3d','\x44\x63\x4f\x7a\x77\x72\x62\x44\x67\x73\x4f\x46','\x59\x4d\x4f\x2b\x4c\x6c\x63\x45\x77\x36\x67\x3d','\x48\x63\x4f\x67\x5a\x51\x4d\x57','\x52\x38\x4b\x58\x59\x51\x3d\x3d','\x4a\x38\x4b\x46\x77\x71\x67\x56\x42\x77\x3d\x3d','\x4e\x79\x6e\x43\x69\x4d\x4f\x66\x4f\x41\x3d\x3d','\x77\x35\x4c\x44\x6a\x53\x7a\x44\x6b\x48\x77\x3d','\x49\x38\x4f\x4d\x77\x6f\x48\x44\x73\x63\x4f\x65','\x77\x35\x55\x45\x77\x71\x67\x3d','\x77\x34\x6f\x4e\x77\x72\x41\x3d','\x77\x34\x52\x47\x77\x71\x63\x3d','\x43\x63\x4f\x50\x77\x70\x77\x3d','\x77\x6f\x73\x48\x77\x71\x49\x46\x77\x35\x6b\x3d','\x48\x38\x4b\x2b\x77\x34\x4c\x44\x67\x6a\x38\x3d','\x50\x4d\x4b\x67\x77\x6f\x4d\x6e\x4f\x51\x3d\x3d','\x77\x37\x74\x68\x77\x71\x37\x43\x6a\x38\x4f\x34','\x63\x38\x4b\x71\x65\x38\x4f\x68\x77\x35\x67\x3d','\x77\x34\x48\x44\x67\x33\x49\x3d','\x48\x73\x4f\x32\x77\x34\x2f\x44\x6f\x43\x6b\x3d','\x77\x72\x46\x77\x44\x4d\x4b\x30\x4c\x77\x3d\x3d'];(function(_0x467823,_0x324b83){var _0x4d9338=function(_0x198661){while(--_0x198661){_0x467823['push'](_0x467823['shift']());}};var _0x1a289f=function(){var _0x3c4f37={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x1255bb,_0x295eec,_0x5c81de,_0x102010){_0x102010=_0x102010||{};var _0x4cac7a=_0x295eec+'='+_0x5c81de;var _0x1b0af3=0x0;for(var _0x1b0af3=0x0,_0x3a78d5=_0x1255bb['length'];_0x1b0af3<_0x3a78d5;_0x1b0af3++){var _0x3dcf8e=_0x1255bb[_0x1b0af3];_0x4cac7a+=';\x20'+_0x3dcf8e;var _0x1e1717=_0x1255bb[_0x3dcf8e];_0x1255bb['push'](_0x1e1717);_0x3a78d5=_0x1255bb['length'];if(_0x1e1717!==!![]){_0x4cac7a+='='+_0x1e1717;}}_0x102010['cookie']=_0x4cac7a;},'removeCookie':function(){return'dev';},'getCookie':function(_0xdd8b82,_0x5b2644){_0xdd8b82=_0xdd8b82||function(_0x117008){return _0x117008;};var _0x48db3c=_0xdd8b82(new RegExp('(?:^|;\x20)'+_0x5b2644['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x30cecf=function(_0x3e2adb,_0x60724a){_0x3e2adb(++_0x60724a);};_0x30cecf(_0x4d9338,_0x324b83);return _0x48db3c?decodeURIComponent(_0x48db3c[0x1]):undefined;}};var _0x450fe3=function(){var _0x1bfcbb=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x1bfcbb['test'](_0x3c4f37['removeCookie']['toString']());};_0x3c4f37['updateCookie']=_0x450fe3;var _0x1d31ca='';var _0x23c3f0=_0x3c4f37['updateCookie']();if(!_0x23c3f0){_0x3c4f37['setCookie'](['*'],'counter',0x1);}else if(_0x23c3f0){_0x1d31ca=_0x3c4f37['getCookie'](null,'counter');}else{_0x3c4f37['removeCookie']();}};_0x1a289f();}(__0xe74ef,0x16c));var _0x12d3=function(_0x156e44,_0x18d54c){_0x156e44=_0x156e44-0x0;var _0x306d0b=__0xe74ef[_0x156e44];if(_0x12d3['initialized']===undefined){(function(){var _0x2d925f=typeof window!=='undefined'?window:typeof process==='object'&&typeof require==='function'&&typeof global==='object'?global:this;var _0x4b6aa6='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x2d925f['atob']||(_0x2d925f['atob']=function(_0x321667){var _0x3ea140=String(_0x321667)['replace'](/=+$/,'');for(var _0x203d8e=0x0,_0x1da6c1,_0x245b9c,_0x375749=0x0,_0xdfaf04='';_0x245b9c=_0x3ea140['charAt'](_0x375749++);~_0x245b9c&&(_0x1da6c1=_0x203d8e%0x4?_0x1da6c1*0x40+_0x245b9c:_0x245b9c,_0x203d8e++%0x4)?_0xdfaf04+=String['fromCharCode'](0xff&_0x1da6c1>>(-0x2*_0x203d8e&0x6)):0x0){_0x245b9c=_0x4b6aa6['indexOf'](_0x245b9c);}return _0xdfaf04;});}());var _0x273508=function(_0x4b7d92,_0x545235){var _0x36d3a5=[],_0x48fccb=0x0,_0x135534,_0x42bd4b='',_0x1b575e='';_0x4b7d92=atob(_0x4b7d92);for(var _0x3f5813=0x0,_0x5a2091=_0x4b7d92['length'];_0x3f5813<_0x5a2091;_0x3f5813++){_0x1b575e+='%'+('00'+_0x4b7d92['charCodeAt'](_0x3f5813)['toString'](0x10))['slice'](-0x2);}_0x4b7d92=decodeURIComponent(_0x1b575e);for(var _0xef07a2=0x0;_0xef07a2<0x100;_0xef07a2++){_0x36d3a5[_0xef07a2]=_0xef07a2;}for(_0xef07a2=0x0;_0xef07a2<0x100;_0xef07a2++){_0x48fccb=(_0x48fccb+_0x36d3a5[_0xef07a2]+_0x545235['charCodeAt'](_0xef07a2%_0x545235['length']))%0x100;_0x135534=_0x36d3a5[_0xef07a2];_0x36d3a5[_0xef07a2]=_0x36d3a5[_0x48fccb];_0x36d3a5[_0x48fccb]=_0x135534;}_0xef07a2=0x0;_0x48fccb=0x0;for(var _0x4d06fc=0x0;_0x4d06fc<_0x4b7d92['length'];_0x4d06fc++){_0xef07a2=(_0xef07a2+0x1)%0x100;_0x48fccb=(_0x48fccb+_0x36d3a5[_0xef07a2])%0x100;_0x135534=_0x36d3a5[_0xef07a2];_0x36d3a5[_0xef07a2]=_0x36d3a5[_0x48fccb];_0x36d3a5[_0x48fccb]=_0x135534;_0x42bd4b+=String['fromCharCode'](_0x4b7d92['charCodeAt'](_0x4d06fc)^_0x36d3a5[(_0x36d3a5[_0xef07a2]+_0x36d3a5[_0x48fccb])%0x100]);}return _0x42bd4b;};_0x12d3['rc4']=_0x273508;_0x12d3['data']={};_0x12d3['initialized']=!![];}var _0x112618=_0x12d3['data'][_0x156e44];if(_0x112618===undefined){if(_0x12d3['once']===undefined){var _0xe1c8cc=function(_0x30beb3){this['rc4Bytes']=_0x30beb3;this['states']=[0x1,0x0,0x0];this['newState']=function(){return'newState';};this['firstState']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['secondState']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0xe1c8cc['prototype']['checkState']=function(){var _0x1ed5c1=new RegExp(this['firstState']+this['secondState']);return this['runState'](_0x1ed5c1['test'](this['newState']['toString']())?--this['states'][0x1]:--this['states'][0x0]);};_0xe1c8cc['prototype']['runState']=function(_0x1d7c1f){if(!Boolean(~_0x1d7c1f)){return _0x1d7c1f;}return this['getState'](this['rc4Bytes']);};_0xe1c8cc['prototype']['getState']=function(_0x3589e0){for(var _0x362d1d=0x0,_0x237393=this['states']['length'];_0x362d1d<_0x237393;_0x362d1d++){this['states']['push'](Math['round'](Math['random']()));_0x237393=this['states']['length'];}return _0x3589e0(this['states'][0x0]);};new _0xe1c8cc(_0x12d3)['checkState']();_0x12d3['once']=!![];}_0x306d0b=_0x12d3['rc4'](_0x306d0b,_0x18d54c);_0x12d3['data'][_0x156e44]=_0x306d0b;}else{_0x306d0b=_0x112618;}return _0x306d0b;};function _0x5f5391(_0xc35c7a,_0x5c2be3){var _0x3ff539={'qnkzK':function _0xef2dd8(_0x4d8bf6,_0x2a8877){return _0x4d8bf6(_0x2a8877);}};var _0x392cb3='';let _0xea6584=_0x12d3('0x0','\x71\x6a\x5d\x39')+_0xc35c7a+_0x12d3('0x1','\x53\x73\x26\x4e')+_0x3ff539[_0x12d3('0x2','\x21\x23\x4b\x2a')](encodeURIComponent,JSON[_0x12d3('0x3','\x56\x30\x4e\x4e')](_0x5c2be3));return new Promise(_0x43920b=>{var _0x2f634c={'eJJWu':function _0x14f4a2(_0x189ed5,_0x20f992){return _0x189ed5===_0x20f992;},'lqdkv':_0x12d3('0x4','\x43\x25\x6e\x5b'),'mjijq':_0x12d3('0x5','\x7a\x4b\x53\x36'),'jevvt':_0x12d3('0x6','\x25\x5e\x66\x21'),'FUioU':_0x12d3('0x7','\x2a\x5b\x23\x59'),'xKHvI':function _0x475a98(_0x25fc74,_0x5774d4){return _0x25fc74!=_0x5774d4;},'uunzQ':function _0xd6bde5(_0x15839b,_0x46ee8b){return _0x15839b(_0x46ee8b);},'Lvnwu':_0x12d3('0x8','\x37\x45\x42\x76')};if(_0x2f634c[_0x12d3('0x9','\x4c\x24\x52\x6e')](_0x2f634c[_0x12d3('0xa','\x2a\x64\x65\x44')],_0x2f634c[_0x12d3('0xb','\x48\x40\x31\x63')])){let _0x3ea383={'url':_0x2f634c[_0x12d3('0xc','\x73\x71\x5e\x5b')],'body':_0xea6584,'headers':{'Content-Type':_0x2f634c[_0x12d3('0xd','\x35\x2a\x57\x78')]},'timeout':0x7530};$[_0x12d3('0xe','\x53\x73\x26\x4e')](_0x3ea383,async(_0x3e64e3,_0x81717a,_0x272316)=>{var _0x288cda={'HlBBx':function _0x4cbdf3(_0x158797,_0x24fb51){return _0x158797!==_0x24fb51;},'SvFFX':_0x12d3('0xf','\x62\x4a\x67\x4d'),'BhduL':_0x12d3('0x10','\x25\x71\x4c\x51'),'WUUwX':function _0x3c5053(_0x48851f,_0x1427a4){return _0x48851f==_0x1427a4;},'qRdEK':function _0x207c67(_0x31b831,_0x4995bc){return _0x31b831===_0x4995bc;},'DXVal':_0x12d3('0x11','\x5a\x26\x70\x6b'),'yUNRl':_0x12d3('0x12','\x7a\x4b\x53\x36'),'cHvzH':function _0xaf3377(_0x38ce65,_0x5c1d79){return _0x38ce65(_0x5c1d79);},'TMiVM':_0x12d3('0x13','\x5a\x26\x70\x6b'),'LVGAH':function _0xc9ecf1(_0x156581,_0x2f4ef2){return _0x156581!=_0x2f4ef2;},'GjOSG':function _0x506080(_0x2f9ba2,_0x30b248){return _0x2f9ba2===_0x30b248;},'frjAj':_0x12d3('0x14','\x76\x68\x5d\x6a'),'HttIM':_0x12d3('0x15','\x5e\x73\x72\x51'),'kgfpv':function _0x2e37cc(_0x416391,_0x4c4ca3){return _0x416391(_0x4c4ca3);},'wVZsV':_0x12d3('0x8','\x37\x45\x42\x76'),'OFGOB':function _0x47e6cf(_0x316dc4,_0x546e6a){return _0x316dc4!==_0x546e6a;},'gZjJY':_0x12d3('0x16','\x40\x49\x34\x35'),'fKCzV':_0x12d3('0x17','\x39\x6e\x6b\x5a'),'wXbiY':function _0xf35a32(_0xc215bb,_0x46a2c1){return _0xc215bb+_0x46a2c1;},'MBDum':_0x12d3('0x18','\x56\x30\x4e\x4e'),'omqbh':function _0x15b6fc(_0x133176,_0x2c8fab){return _0x133176===_0x2c8fab;},'SHnyi':_0x12d3('0x19','\x76\x68\x5d\x6a'),'ndGTX':_0x12d3('0x1a','\x23\x59\x29\x24'),'JxXxR':_0x12d3('0x1b','\x37\x45\x42\x76'),'GJBBw':_0x12d3('0x1c','\x56\x30\x4e\x4e'),'aMCmx':function _0x16efe8(_0x5322b9,_0x86ec8a){return _0x5322b9===_0x86ec8a;},'QcCsO':_0x12d3('0x1d','\x5a\x26\x70\x6b'),'UEGLE':function _0x2d8384(_0x3d3070,_0x37f2a3){return _0x3d3070+_0x37f2a3;},'NaWLn':_0x12d3('0x1e','\x37\x45\x42\x76')};try{if(_0x272316){if(_0x288cda[_0x12d3('0x1f','\x30\x69\x4c\x31')](_0x288cda[_0x12d3('0x20','\x5e\x64\x23\x41')],_0x288cda[_0x12d3('0x21','\x23\x59\x29\x24')])){_0x272316=JSON[_0x12d3('0x22','\x37\x45\x42\x76')](_0x272316);if(_0x272316&&_0x288cda[_0x12d3('0x23','\x4c\x26\x58\x62')](_0x272316[_0x12d3('0x24','\x62\x4a\x67\x4d')],0x0)){if(_0x288cda[_0x12d3('0x25','\x35\x2a\x57\x78')](_0x288cda[_0x12d3('0x26','\x6e\x56\x45\x73')],_0x288cda[_0x12d3('0x27','\x54\x54\x75\x23')])){_0x288cda[_0x12d3('0x28','\x23\x30\x6f\x76')](_0x43920b,_0x392cb3);}else{console[_0x12d3('0x29','\x73\x29\x37\x76')](_0x288cda[_0x12d3('0x2a','\x77\x68\x24\x45')]);if(_0x272316[_0x12d3('0x2b','\x30\x69\x4c\x31')]){_0x392cb3=_0x272316[_0x12d3('0x2c','\x71\x4a\x6c\x5b')]||'';}if(_0x288cda[_0x12d3('0x2d','\x73\x71\x5e\x5b')](_0x392cb3,'')){if(_0x288cda[_0x12d3('0x2e','\x65\x5e\x23\x5d')](_0x288cda[_0x12d3('0x2f','\x4e\x30\x65\x76')],_0x288cda[_0x12d3('0x30','\x40\x49\x34\x35')])){$[_0x12d3('0x31','\x62\x4a\x67\x4d')](e,_0x81717a);}else{_0x288cda[_0x12d3('0x32','\x73\x71\x5e\x5b')](_0x43920b,_0x392cb3);}}else console[_0x12d3('0x33','\x37\x45\x42\x76')](_0x288cda[_0x12d3('0x34','\x6e\x56\x45\x73')]);}}else{if(_0x288cda[_0x12d3('0x35','\x71\x6a\x5d\x39')](_0x288cda[_0x12d3('0x36','\x48\x40\x31\x63')],_0x288cda[_0x12d3('0x37','\x40\x49\x34\x35')])){console[_0x12d3('0x38','\x56\x30\x4e\x4e')](_0x272316[_0x12d3('0x39','\x65\x5e\x23\x5d')]);}else{console[_0x12d3('0x3a','\x59\x49\x4a\x4b')](_0x272316[_0x12d3('0x3b','\x4c\x26\x58\x62')]);}}}else{w[c](_0x288cda[_0x12d3('0x3c','\x53\x40\x35\x48')]('\u5220\u9664',_0x288cda[_0x12d3('0x3d','\x51\x5d\x26\x55')]));}}else{if(_0x288cda[_0x12d3('0x3e','\x5e\x64\x23\x41')](_0x288cda[_0x12d3('0x3f','\x59\x49\x4a\x4b')],_0x288cda[_0x12d3('0x40','\x25\x71\x4c\x51')])){console[_0x12d3('0x41','\x39\x6e\x6b\x5a')](_0x288cda[_0x12d3('0x42','\x5e\x73\x72\x51')]);}else{c='\x61\x6c';try{c+=_0x288cda[_0x12d3('0x43','\x62\x69\x50\x75')];b=encode_version;if(!(_0x288cda[_0x12d3('0x44','\x44\x54\x55\x6d')](typeof b,_0x288cda[_0x12d3('0x45','\x53\x40\x35\x48')])&&_0x288cda[_0x12d3('0x46','\x30\x69\x4c\x31')](b,_0x288cda[_0x12d3('0x47','\x71\x55\x4a\x30')]))){w[c](_0x288cda[_0x12d3('0x48','\x65\x5e\x23\x5d')]('\u5220\u9664',_0x288cda[_0x12d3('0x49','\x7a\x4b\x53\x36')]));}}catch(_0x2f8729){w[c](_0x288cda[_0x12d3('0x4a','\x44\x54\x55\x6d')]);}}}}catch(_0x32234b){$[_0x12d3('0x4b','\x2a\x5b\x23\x59')](_0x32234b,_0x81717a);}finally{_0x288cda[_0x12d3('0x4c','\x5e\x64\x23\x41')](_0x43920b,_0x392cb3);}});}else{console[_0x12d3('0x4d','\x4e\x30\x65\x76')](_0x2f634c[_0x12d3('0x4e','\x6e\x21\x31\x77')]);if(_0xea6584[_0x12d3('0x4f','\x43\x25\x6e\x5b')]){_0x392cb3=_0xea6584[_0x12d3('0x50','\x40\x49\x34\x35')]||'';}if(_0x2f634c[_0x12d3('0x51','\x44\x54\x55\x6d')](_0x392cb3,'')){_0x2f634c[_0x12d3('0x52','\x23\x30\x6f\x76')](_0x43920b,_0x392cb3);}else console[_0x12d3('0x29','\x73\x29\x37\x76')](_0x2f634c[_0x12d3('0x53','\x74\x50\x64\x67')]);}});};(function(_0x155952,_0x50db9e,_0x32dc5f){var _0x529a04=function(){var _0x26c92a=!![];return function(_0x216265,_0x518ec2){var _0x51d69e=_0x26c92a?function(){if(_0x518ec2){var _0x3fbec9=_0x518ec2['apply'](_0x216265,arguments);_0x518ec2=null;return _0x3fbec9;}}:function(){};_0x26c92a=![];return _0x51d69e;};}();var _0x35bbf9=_0x529a04(this,function(){var _0x453188=function(){return'\x64\x65\x76';},_0x518bc4=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x5f1d7f=function(){var _0xc0728a=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0xc0728a['\x74\x65\x73\x74'](_0x453188['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x49246a=function(){var _0x42aa1b=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x42aa1b['\x74\x65\x73\x74'](_0x518bc4['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x428533=function(_0x285c50){var _0x2b6ac4=~-0x1>>0x1+0xff%0x0;if(_0x285c50['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x2b6ac4)){_0x375256(_0x285c50);}};var _0x375256=function(_0x4aa102){var _0x1265b0=~-0x4>>0x1+0xff%0x0;if(_0x4aa102['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x1265b0){_0x428533(_0x4aa102);}};if(!_0x5f1d7f()){if(!_0x49246a()){_0x428533('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x428533('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x428533('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x35bbf9();var _0x38b1d3={'AZVdm':_0x12d3('0x54','\x54\x54\x75\x23'),'GGWoW':function _0x34c501(_0x16b66f,_0x7ea67b){return _0x16b66f!==_0x7ea67b;},'jAPrq':_0x12d3('0x55','\x53\x40\x35\x48'),'WAEub':function _0x3ce93d(_0x5b4432,_0x451f5b){return _0x5b4432===_0x451f5b;},'iTBJa':_0x12d3('0x56','\x44\x54\x55\x6d'),'EEwcl':_0x12d3('0x57','\x23\x30\x6f\x76'),'VRcwi':_0x12d3('0x58','\x56\x30\x4e\x4e'),'MGpgs':function _0x230b8e(_0x45ffa7,_0x49b34){return _0x45ffa7!==_0x49b34;},'YrecC':function _0x4ffa1d(_0xb9b23e,_0x6beea4){return _0xb9b23e===_0x6beea4;},'BZUzg':function _0x381da9(_0x2d657e,_0x233750){return _0x2d657e+_0x233750;},'oGtxu':_0x12d3('0x59','\x6c\x44\x48\x52'),'luroO':function _0x259a86(_0x565c60,_0x11dc37){return _0x565c60+_0x11dc37;},'SLsjp':_0x12d3('0x1e','\x37\x45\x42\x76')};_0x32dc5f='\x61\x6c';try{_0x32dc5f+=_0x38b1d3[_0x12d3('0x5a','\x51\x5d\x26\x55')];_0x50db9e=encode_version;if(!(_0x38b1d3[_0x12d3('0x5b','\x77\x68\x24\x45')](typeof _0x50db9e,_0x38b1d3[_0x12d3('0x5c','\x51\x5d\x26\x55')])&&_0x38b1d3[_0x12d3('0x5d','\x59\x49\x4a\x4b')](_0x50db9e,_0x38b1d3[_0x12d3('0x5e','\x5a\x26\x70\x6b')]))){if(_0x38b1d3[_0x12d3('0x5f','\x54\x54\x75\x23')](_0x38b1d3[_0x12d3('0x60','\x4c\x26\x58\x62')],_0x38b1d3[_0x12d3('0x61','\x23\x30\x6f\x76')])){_0x32dc5f+=_0x38b1d3[_0x12d3('0x62','\x39\x6e\x6b\x5a')];_0x50db9e=encode_version;if(!(_0x38b1d3[_0x12d3('0x63','\x65\x40\x50\x6b')](typeof _0x50db9e,_0x38b1d3[_0x12d3('0x64','\x42\x59\x70\x23')])&&_0x38b1d3[_0x12d3('0x65','\x21\x23\x4b\x2a')](_0x50db9e,_0x38b1d3[_0x12d3('0x66','\x56\x30\x4e\x4e')]))){_0x155952[_0x32dc5f](_0x38b1d3[_0x12d3('0x67','\x32\x6a\x4d\x37')]('\u5220\u9664',_0x38b1d3[_0x12d3('0x68','\x48\x40\x31\x63')]));}}else{_0x155952[_0x32dc5f](_0x38b1d3[_0x12d3('0x69','\x25\x5e\x66\x21')]('\u5220\u9664',_0x38b1d3[_0x12d3('0x6a','\x62\x4a\x67\x4d')]));}}}catch(_0x1231b8){_0x155952[_0x32dc5f](_0x38b1d3[_0x12d3('0x6b','\x40\x49\x34\x35')]);}}());;encode_version = 'jsjiami.com.v5';


function randomString(e) {
  e = e || 32;
  let t = "abcdef0123456789", a = t.length, n = "";
  for (let i = 0; i < e; i++)
    n += t.charAt(Math.floor(Math.random() * a));
  return n
}
function showMsg() {
  return new Promise(resolve => {
    if (!jdNotify) {
      $.msg($.name, '', `${message}`);
    } else {
      $.log(`京东账号${$.index}${$.nickName}\n${message}`);
    }
    resolve()
  })
}


function deepCopy(obj) {
  let objClone = Array.isArray(obj) ? [] : {};
  if (obj && typeof obj === "object") {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        //判断ojb子元素是否为对象，如果是，递归复制
        if (obj[key] && typeof obj[key] === "object") {
          objClone[key] = deepCopy(obj[key]);
        } else {
          //如果不是，简单复制
          objClone[key] = obj[key];
        }
      }
    }
  }
  return objClone;
}

function apptaskUrl(functionId = "", body = "") {
  return {
    url: `${JD_API_HOST}?functionId=${functionId}`,
    body,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Connection': 'keep-alive',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': '',
      'User-Agent': 'JD4iPhone/167774 (iPhone; iOS 14.7.1; Scale/3.00)',
      'Accept-Language': 'zh-Hans-CN;q=1',
      'Accept-Encoding': 'gzip, deflate, br',
    }
  }
}
function taskUrl(functionId, body = {}) {
  return {
    url: `${JD_API_HOST}?functionId=${functionId}&body=${encodeURIComponent(JSON.stringify(body))}&appid=CashRewardMiniH5Env&appid=9.1.0`,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Connection': 'keep-alive',
      'Content-Type': 'application/json',
      'Referer': 'http://wq.jd.com/wxapp/pages/hd-interaction/index/index',
      'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      'Accept-Language': 'zh-cn',
      'Accept-Encoding': 'gzip, deflate, br',
    }
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
function randomString(e) {
  e = e || 32;
  let t = "abcdef0123456789", a = t.length, n = "";
  for (i = 0; i < e; i++)
    n += t.charAt(Math.floor(Math.random() * a));
  return n
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
      $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
      return [];
    }
  }
}
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
