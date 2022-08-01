/*

[task_local]
入口 极速版 赚金币 种水果
#极速版我是大老板农场
export dlbtz="true" //通知打开

export dlbtz="false" //通知关闭

5 0-23/6 * * * jd_wsdlb.js, tag=极速版我是大老板农场, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true
*/


const $ = new Env('极速版我是大老板农场');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';

//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message;
let allMessage = '';
let dlbtz = false; //通知开关
if (process.env.dlbtz) {
  dlbtz = process.env.dlbtz;
}
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
const JD_API_HOST = 'https://api.m.jd.com/client.action';

!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }

  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      ck2 = cookiesArr[Math.round(Math.random()*5)];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      message = '';
      //await TotalBean();
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }

      
      await jdFruit()
     
      

    }
  }
if ($.isNode() && allMessage) {
        await notify.sendNotify(`${$.name}`, `${allMessage}` )
    }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })

async function jdFruit() {
  
  await info()
  await dolist()
  await apCollectWater()
if ($.info.data.firstJoinFlag === true) {
 $.log("您忘了种植新的水果，快打开极速版种植吧")
if(dlbtz == true){
 allMessage += `京东账号${$.index}-${$.nickName || $.UserName}\n您忘了种植新的水果,内侧入口为：\n极速版-百元生活费-赚金币-下拉-水果免费领${$.index !== cookiesArr.length ? '\n\n' : '\n\n'}`;}
}else if ($.info.data.firstJoinFlag === false) {
    
        console.log(`\n当前种植水果：${$.info.data.plantInfo[0].cropName}\n当前阶段: ${$.info.data.plantInfo[0].nowStep}\n当前下一阶段还需要浇水：${$.info.data.plantInfo[0].upgradeWateringNum}次`)
       if($.info.data.plantInfo[0].nowStep == 4){
       allMessage += `京东账号${$.index}-${$.nickName || $.UserName}\n当前种植水果可以收取了${$.index !== cookiesArr.length ? '\n\n' : '\n\n'}`;
       }
  await help($.info.data.encPin)
        if(dlbtz == true){
        allMessage += `京东账号${$.index}-${$.nickName || $.UserName}\n当前种植水果：${$.info.data.plantInfo[0].cropName}\n当前阶段: ${$.info.data.plantInfo[0].nowStep}\n当前下一阶段还需要浇水：${$.info.data.plantInfo[0].upgradeWateringNum}次${$.index !== cookiesArr.length ? '\n\n' : '\n\n'}`;}
                if (getwat.code === 0 ){
        $.log(`\n领取定时水滴：${getwat.data.collectWaterNumber}`)
                    
                }
        
       if($.info.data.plantInfo[0].status == 0){
         $.log(`无需除草`)
       }else 
       if($.info.data.plantInfo[0].status == 1){
         $.log(`需要除草`)
         await chucao($.info.data.earthInfo[0].nowPlantId,$.info.data.encPin)
         if(cc.errMsg == "success"){
         $.log(`除草成功`)
         }else 
         if(cc.success == false){
             $.log(cc.errMsg)
             //break
             
         }
       }
        
        
        if ($.do.code === 0){       
 let taskList = $.do.data
       for (let i = 0 ; i < taskList.length; i++){
       taskType = taskList[i].taskType
       id = taskList[i].id
       taskSourceUrl = taskList[i].taskSourceUrl
                        
        await dotask(taskType,id,taskSourceUrl)
        await dotask(taskType,id,"70511671722")
             
        if ($.qd.code === 2005 ){
             $.log(`\n${$.qd.errMsg}`)
             
     }
     }
 }

     await jiaoshui($.info.data.earthInfo[0].nowPlantId)
    
     if (watering.success === true ){
          $.log(parseInt(watering.data.property * 0.1))
       cs = parseInt(watering.data.property * 0.1)
     if (cs > 0 ){
    for (let i = 0 ; i < cs; i++){
        await $.wait(3000)
        await jiaoshui($.info.data.earthInfo[0].nowPlantId)
    if (watering.code === 20004 ){
        $.log(`\n浇水水滴不足，快去做任务吧`)
          //break 
        }

        if (watering.code === 0 ){
        $.log(`\n${watering.data.speedFarmPlantInfo.cropName}:\n还需水滴：${watering.data.speedFarmPlantInfo.nowStepNeedWater}\n还需浇水：${watering.data.speedFarmPlantInfo.upgradeWateringNum}`)
        
        }

}
    
}  
}



     
}


 
}

function info() {
    return new Promise(async (resolve) => {

                let options = {
    url: `https://api.m.jd.com/?functionId=apHomePage&client=android&clientVersion=10&networkType=4g&eid=eidAdbfb812246s5r1OGwmiSQMahMl6K44kkna9TiDxOncOh%2BPHjHGH7f5BaezwPsv86FnJD2KTOGF5GjpLohc8Y3tfQqJw%2F3GbroYtSX%2BYNIOYuwm4w&fp=-1&uuid=7303439343432346-7356431353233321&osVersion=10&d_brand=OPPO&d_model=PCAM00&referer=-1&agent=-1&pageClickKey=-1&screen=360*780&lang=zh_CN&eu=7303439343432346&fv=7356431353233323&body=%7B%22linkId%22%3A%22fzf6tK4xMfE2ICK4-T_iUw%22%2C%22antiToken%22%3A%22oyv0oh46u0hbqqbh2pe16232308899736l86~NmZeSyVEbFNSd3V%2BdlJdC3lwAApjRHpTBiUjb35DFm5vLUROOBEzLUF7G28iAAFBKBgVFA1EPwIVKDclGENXbm8iVlQiAwpTTx1lKSsTCG5vfmsaDUR6LUEnG29%2BPU9UdSYHAGlWYEJXc3F7c1VUCit8UVplX2UQUSR%2FendVWwE3JVRkc0oKUwoyKhFmWzEQOTZCXQ1Eei1BKTQ5GENXbm8wX10zDzETDDI0Yy4FQ1EiKWsafTp0AQ0dZXcYQ0Jub2hrGiESClNZHWUlMBUdQXcYFRQNRCYYP2N9EWZQVR5%2BaA4UYUpmXVJwcRFmHE8ebyFTXCIBdEtBK3AhMkNBEC43FQJzVDkVBSUvLDITBVk9dg9MPQsySVYoL3gyERlAeyxNDSgDPkIEY2tvJ0NXEDQhQUs%2FUDNFDiAmdHYZFQorIgYJZ1RlQ1Bxf3V9WFoAPj1bWXNKdBUQL2V3ZhEMVzUoAV1gRHpTCjJld2ZQTx5vLl5bc1x0SFp4fm85%7C~1623230944818~1~20201218~eyJ2aXdlIjoiMCIsImJhaW4iOnt9fQ%3D%3D~1~504~gpli%7Cdoei%3A%2C1%2C0%2C0%2C0%2C0%2C1000%2C-1000%2C1000%2C-1000%3Bdmei%3A%2C1%2C0%2C0%2C1000%2C-1000%2C1000%2C-1000%2C1000%2C-1000%3Bemc%3A%3Bemmm%3A%3Bemcf%3A%3Bivli%3A%3Biivl%3A%3Bivcvj%3A%3Bscvje%3A%3Bewhi%3A%3B1623230944718%2C1623230944817%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C0%3B88yh%22%2C%22frontendInitStatus%22%3A%22s%22%2C%22platform%22%3A1%7D&appid=activities_platform&t=1623230951258`,

headers: {
"Origin": "https://thebigboss.jd.com",
"Host": "api.m.jd.com",
      "User-Agent": "jdltapp;android;3.5.0;10;7303439343432346-7356431353233323;network/4g;model/PCAM00;addressid/4228801336;aid/7049442d7e415232;oaid/;osVer/29;appBuild/1587;psn/J7DoQdnbd16144pyXDtYAH6c3B9Rkr60|87;psq/7;adk/;ads/;pap/JA2020_3112531|3.5.0|ANDROID 10;osv/10;pv/16.58;jdv/;ref/com.jd.jdlite.lib.mission.allowance.AllowanceFragment;partner/oppo;apprpd/Allowance_Registered;eufv/1;Mozilla/5.0 (Linux; Android 10; PCAM00 Build/QKQ1.190918.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045140 Mobile Safari/537.36",
      "Cookie": cookie,
      }
                }
      
        $.get(options, async (err, resp, data) => {
            try {

                  $.info = JSON.parse(data);

                  
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}



function dotask(taskType,taskId,itemId) {
    return new Promise(async (resolve) => {

                let options = {
    url: `https://api.m.jd.com/?functionId=apDoTask&client=android&clientVersion=10&networkType=4g&eid=eidAdbfb812246s5r1OGwmiSQMahMl6K44kkna9TiDxOncOh+PHjHGH7f5BaezwPsv86FnJD2KTOGF5GjpLohc8Y3tfQqJw/3GbroYtSX+YNIOYuwm4w&fp=-1&uuid=7303439343432346-7356431353233321&osVersion=10&d_brand=OPPO&d_model=PCAM00&referer=-1&agent=-1&pageClickKey=-1&screen=360*780&lang=zh_CN&eu=7303439343432346&fv=7356431353233323&body={"linkId":"fzf6tK4xMfE2ICK4-T_iUw","taskType":"${taskType}","taskId":${taskId},"channel":4,"itemId":"${itemId}","antiToken":"oyv0oh46u0hbqqbh2pe16232308899736l86~NmZeSyVEbFNSd3V+dlJdC3lwAApjRHpTBiUjb35DFm5vLUROOBEzLUF7G28iAAFBKBgVFA1EPwIVKDclGENXbm8iVlQiAwpTTx1lKSsTCG5vfmsaDUR6LUEnG29+PU9UdSYHAGlWYEJXc3F7c1VUCit8UVplX2UQUSR/endVWwE3JVRkc0oKUwoyKhFmWzEQOTZCXQ1Eei1BKTQ5GENXbm8wX10zDzETDDI0Yy4FQ1EiKWsafTp0AQ0dZXcYQ0Jub2hrGiESClNZHWUlMBUdQXcYFRQNRCYYP2N9EWZQVR5+aA4UYUpmXVJwcRFmHE8ebyFTXCIBdEtBK3AhMkNBEC43FQJzVDkVBSUvLDITBVk9dg9MPQsySVYoL3gyERlAeyxNDSgDPkIEY2tvJ0NXEDQhQUs/UDNFDiAmdHYZFQorIgYJZ1RlQ1Bxf3V9WFoAPj1bWXNKdBUQL2V3ZhEMVzUoAV1gRHpTCjJld2ZQTx5vLl5bc1x0SFp4fm85|~1623230944818~1~20201218~eyJ2aXdlIjoiMCIsImJhaW4iOnt9fQ==~1~504~gpli|doei:,1,0,0,0,0,1000,-1000,1000,-1000;dmei:,1,0,0,1000,-1000,1000,-1000,1000,-1000;emc:;emmm:;emcf:;ivli:;iivl:;ivcvj:;scvje:;ewhi:;1623230944718,1623230944817,0,0,0,0,0,0,0,0,0;88yh","frontendInitStatus":"s","platform":1}&appid=activities_platform&t=1623236252762`,

headers: {
"Origin": "https://thebigboss.jd.com",
"Host": "api.m.jd.com",
      "User-Agent": "jdltapp;android;3.5.0;10;7303439343432346-7356431353233323;network/4g;model/PCAM00;addressid/4228801336;aid/7049442d7e415232;oaid/;osVer/29;appBuild/1587;psn/J7DoQdnbd16144pyXDtYAH6c3B9Rkr60|87;psq/7;adk/;ads/;pap/JA2020_3112531|3.5.0|ANDROID 10;osv/10;pv/16.58;jdv/;ref/com.jd.jdlite.lib.mission.allowance.AllowanceFragment;partner/oppo;apprpd/Allowance_Registered;eufv/1;Mozilla/5.0 (Linux; Android 10; PCAM00 Build/QKQ1.190918.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045140 Mobile Safari/537.36",
      "Cookie": cookie,
      }
                }
      
        $.get(options, async (err, resp, data) => {
            try {

                  $.qd = JSON.parse(data);

                  
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}


function dolist() {
    return new Promise(async (resolve) => {

                let options = {
    url: `https://api.m.jd.com/?functionId=apTaskList&client=android&clientVersion=10&networkType=4g&eid=eidAdbfb812246s5r1OGwmiSQMahMl6K44kkna9TiDxOncOh%2BPHjHGH7f5BaezwPsv86FnJD2KTOGF5GjpLohc8Y3tfQqJw%2F3GbroYtSX%2BYNIOYuwm4w&fp=-1&uuid=7303439343432346-7356431353233321&osVersion=10&d_brand=OPPO&d_model=PCAM00&referer=-1&agent=-1&pageClickKey=-1&screen=360*780&lang=zh_CN&eu=7303439343432346&fv=7356431353233323&body=%7B%22linkId%22%3A%22fzf6tK4xMfE2ICK4-T_iUw%22%2C%22antiToken%22%3A%22oyv0oh46u0hbqqbh2pe16232308899736l86~NmZeSyVEbFNSd3V%2BdlJdC3lwAApjRHpTBiUjb35DFm5vLUROOBEzLUF7G28iAAFBKBgVFA1EPwIVKDclGENXbm8iVlQiAwpTTx1lKSsTCG5vfmsaDUR6LUEnG29%2BPU9UdSYHAGlWYEJXc3F7c1VUCit8UVplX2UQUSR%2FendVWwE3JVRkc0oKUwoyKhFmWzEQOTZCXQ1Eei1BKTQ5GENXbm8wX10zDzETDDI0Yy4FQ1EiKWsafTp0AQ0dZXcYQ0Jub2hrGiESClNZHWUlMBUdQXcYFRQNRCYYP2N9EWZQVR5%2BaA4UYUpmXVJwcRFmHE8ebyFTXCIBdEtBK3AhMkNBEC43FQJzVDkVBSUvLDITBVk9dg9MPQsySVYoL3gyERlAeyxNDSgDPkIEY2tvJ0NXEDQhQUs%2FUDNFDiAmdHYZFQorIgYJZ1RlQ1Bxf3V9WFoAPj1bWXNKdBUQL2V3ZhEMVzUoAV1gRHpTCjJld2ZQTx5vLl5bc1x0SFp4fm85%7C~1623230944818~1~20201218~eyJ2aXdlIjoiMCIsImJhaW4iOnt9fQ%3D%3D~1~504~gpli%7Cdoei%3A%2C1%2C0%2C0%2C0%2C0%2C1000%2C-1000%2C1000%2C-1000%3Bdmei%3A%2C1%2C0%2C0%2C1000%2C-1000%2C1000%2C-1000%2C1000%2C-1000%3Bemc%3A%3Bemmm%3A%3Bemcf%3A%3Bivli%3A%3Biivl%3A%3Bivcvj%3A%3Bscvje%3A%3Bewhi%3A%3B1623230944718%2C1623230944817%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C0%2C0%3B88yh%22%2C%22frontendInitStatus%22%3A%22s%22%2C%22platform%22%3A1%7D&appid=activities_platform&t=1623236246485`,

headers: {
"Origin": "https://thebigboss.jd.com",
"Host": "api.m.jd.com",
      "User-Agent": "jdltapp;android;3.5.0;10;7303439343432346-7356431353233323;network/4g;model/PCAM00;addressid/4228801336;aid/7049442d7e415232;oaid/;osVer/29;appBuild/1587;psn/J7DoQdnbd16144pyXDtYAH6c3B9Rkr60|87;psq/7;adk/;ads/;pap/JA2020_3112531|3.5.0|ANDROID 10;osv/10;pv/16.58;jdv/;ref/com.jd.jdlite.lib.mission.allowance.AllowanceFragment;partner/oppo;apprpd/Allowance_Registered;eufv/1;Mozilla/5.0 (Linux; Android 10; PCAM00 Build/QKQ1.190918.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045140 Mobile Safari/537.36",
      "Cookie": cookie,
      }
                }
      
        $.get(options, async (err, resp, data) => {
            try {

                  $.do = JSON.parse(data);

                  
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

function jiaoshui(plantId) {
    return new Promise(async (resolve) => {

                let options = {
    url: `https://api.m.jd.com/?functionId=watering&client=android&clientVersion=10&networkType=4g&eid=eidAdbfb812246s5r1OGwmiSQMahMl6K44kkna9TiDxOncOh+PHjHGH7f5BaezwPsv86FnJD2KTOGF5GjpLohc8Y3tfQqJw/3GbroYtSX+YNIOYuwm4w&fp=-1&uuid=7303439343432346-7356431353233321&osVersion=10&d_brand=OPPO&d_model=PCAM00&referer=-1&agent=-1&pageClickKey=-1&screen=360*780&lang=zh_CN&eu=7303439343432346&fv=7356431353233323&body={"linkId":"fzf6tK4xMfE2ICK4-T_iUw","plantId":"${plantId}","antiToken":"oyv0oh46u0hbqqbh2pe16232308899736l86~NmZeSyVEbFNSd3V+dlJdC3lwAApjRHpTBiUjb35DFm5vLUROOBEzLUF7G28iAAFBKBgVFA1EPwIVKDclGENXbm8iVlQiAwpTTx1lKSsTCG5vfmsaDUR6LUEnG29+PU9UdSYHAGlWYEJXc3F7c1VUCit8UVplX2UQUSR/endVWwE3JVRkc0oKUwoyKhFmWzEQOTZCXQ1Eei1BKTQ5GENXbm8wX10zDzETDDI0Yy4FQ1EiKWsafTp0AQ0dZXcYQ0Jub2hrGiESClNZHWUlMBUdQXcYFRQNRCYYP2N9EWZQVR5+aA4UYUpmXVJwcRFmHE8ebyFTXCIBdEtBK3AhMkNBEC43FQJzVDkVBSUvLDITBVk9dg9MPQsySVYoL3gyERlAeyxNDSgDPkIEY2tvJ0NXEDQhQUs/UDNFDiAmdHYZFQorIgYJZ1RlQ1Bxf3V9WFoAPj1bWXNKdBUQL2V3ZhEMVzUoAV1gRHpTCjJld2ZQTx5vLl5bc1x0SFp4fm85|~1623230944818~1~20201218~eyJ2aXdlIjoiMCIsImJhaW4iOnt9fQ==~1~504~gpli|doei:,1,0,0,0,0,1000,-1000,1000,-1000;dmei:,1,0,0,1000,-1000,1000,-1000,1000,-1000;emc:;emmm:;emcf:;ivli:;iivl:;ivcvj:;scvje:;ewhi:;1623230944718,1623230944817,0,0,0,0,0,0,0,0,0;88yh","frontendInitStatus":"s","platform":1}&appid=activities_platform&t=1623237544296`,

headers: {
"Origin": "https://thebigboss.jd.com",
"Host": "api.m.jd.com",
      "User-Agent": "jdltapp;android;3.5.0;10;7303439343432346-7356431353233323;network/4g;model/PCAM00;addressid/4228801336;aid/7049442d7e415232;oaid/;osVer/29;appBuild/1587;psn/J7DoQdnbd16144pyXDtYAH6c3B9Rkr60|87;psq/7;adk/;ads/;pap/JA2020_3112531|3.5.0|ANDROID 10;osv/10;pv/16.58;jdv/;ref/com.jd.jdlite.lib.mission.allowance.AllowanceFragment;partner/oppo;apprpd/Allowance_Registered;eufv/1;Mozilla/5.0 (Linux; Android 10; PCAM00 Build/QKQ1.190918.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045140 Mobile Safari/537.36",
      "Cookie": cookie,
      }
                }
      
        $.get(options, async (err, resp, data) => {
            try {

                  watering = JSON.parse(data);

                  
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

function apCollectWater() {
    return new Promise(async (resolve) => {

                let options = {
    url: `https://api.m.jd.com/ `,
body: `functionId=apCollectWater&client=ios&clientVersion=14.3&networkType=wifi&eid=eidIc2ff812158s1ARLLPvIBQjyII7trmiE3BQESzLTXqSC9s3TX28oQv3zQuaY+15FedjhWtgYfTsUSkl9FEDNBP8LQRrRx5GwEA93H4jSPYNJ1OvNs&fp=-1&uuid=75aeceef3046d8ce11d354ff89af9517a2e4aa11&osVersion=14.3&d_brand=iPhone&d_model=iPhone9,2&referer=-1&agent=-1&pageClickKey=-1&screen=414*736&lang=zh_CN&body={"linkId":"fzf6tK4xMfE2ICK4-T_iUw","antiToken":"80yyw6qzqeyzl42ape51623285354539awsu~NmZeSyVEbFNSd3V+dlhYBHl0Dg9iRHpTBiUjb35DFm5vLUROOBEzLUF7G28iAAFBKBgVFA1EPwIVKDclGENXbm8iVlQiAwpTTx1lKSsTCG5vfmsaDUR6LUEnG29+PU8DfnIOXTJXZElScyErdFZVCn11DgEyXjVAASIjLidVXQV+Klxkc0oKUwoyKhFmWzEQOTZCXQ1Eei1BKTQ5GENXbm8wX10zDzETDDI0Yy4FQ1EiKWsafTp0AQ0dZXcYQ0Jub2hrGiESClNZHWUlMBUdQXcYFRQNRCYYP2N9EWZQVR5+aA4UYUpmXVJydBFmHE8ebyFTXCIBdEtBKyQhdUNBEC43FQJzUyMJUTAtI31SAkd+KwFaMg0zFlAsMz89Ul1CKXJNQD9RIQQFY2tvJ0NXECp1AFIzED9DBnRxIT0bCVo8K1UJZ1RlQ1t0dHhwVF4KfHYGQnNKdBUQL2V3ZgUDBjUrDl1nRHpTCjJld2ZQTx5vLl5bc1x0SFp4fm85|~1623295641032~1~20201218~eyJ2aXdlIjoiMCIsImJhaW4iOnt9fQ==~1~~9lwr|doei:,1,0,0,0,0,1000,-1000,1000,-1000;dmei:,1,0,0,1000,-1000,1000,-1000,1000,-1000;emc:;emmm:;emcf:;ivli:;iivl:;ivcvj:;scvje:;ewhi:;1623295640969,1623295641031,0,0,0,0,0,0,0,0,0;88ys","frontendInitStatus":"s","platform":1}&appid=activities_platform&t=1623295724488`,
headers: {
"Origin": "https://thebigboss.jd.com",
"Host": "api.m.jd.com",
      "User-Agent": "jdltapp;android;3.5.0;10;7303439343432346-7356431353233323;network/4g;model/PCAM00;addressid/4228801336;aid/7049442d7e415232;oaid/;osVer/29;appBuild/1587;psn/J7DoQdnbd16144pyXDtYAH6c3B9Rkr60|87;psq/7;adk/;ads/;pap/JA2020_3112531|3.5.0|ANDROID 10;osv/10;pv/16.58;jdv/;ref/com.jd.jdlite.lib.mission.allowance.AllowanceFragment;partner/oppo;apprpd/Allowance_Registered;eufv/1;Mozilla/5.0 (Linux; Android 10; PCAM00 Build/QKQ1.190918.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045140 Mobile Safari/537.36",
      "Cookie": cookie,
      }
                }
      
        $.post(options, async (err, resp, data) => {
            try {

                  getwat = JSON.parse(data);

                  
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}


function chucao(plantId,encryptUid) {
    return new Promise(async (resolve) => {

                let options = {
    url: `https://api.m.jd.com/?functionId=weeding&client=ios&clientVersion=14.3&networkType=4g&eid=eidIc2ff812158s1ARLLPvIBQjyII7trmiE3BQESzLTXqSC9s3TX28oQv3zQuaY+15FedjhWtgYfTsUSkl9FEDNBP8LQRrRx5GwEA93H4jSPYNJ1OvNs&fp=-1&uuid=75aeceef3046d8ce11d354ff89af9517a2e4aa18&osVersion=14.3&d_brand=iPhone&d_model=iPhone9,2&referer=-1&agent=-1&pageClickKey=-1&screen=414*736&lang=zh_CN&body={"linkId":"fzf6tK4xMfE2ICK4-T_iUw","plantId":"${plantId}","encryptUid":"${encryptUid}","antiToken":"g4utdunnt5ja7wazyp81624112440743frl8~NmZeSyVEbFNSd3V5dVBfBnl0AAtoRHpTBiUjb35DFm5vLUROOBEzLUF7G28iAAFBKBgVFA1EPwIVKDclGENXbm8iVlQiAwpTTx1lKSsTCG5vfmsaDUR6LUEnG29+PU9QLyFTADIAMkdXICZ4cFhbBXV8BF4yX25HV3h0dSdYVVMucQRkc0oKUwoyKhFmWzEQOTZCXQ1Eei1BKTQ5GENXbm8wX10zDzETDDI0Yy4FQ1EiKWsafTp0AQ0dZXcYQ0Jub2hrGiESClNZHWUlMBUdQXcYFRQNRCYYP2N9EWZQVR5+aA4UYUpmXVJychFmHE8ebyFTXCIBdEtBKzAhNUNBEC43FQJzB29EBHQsdT4GWAB8cFYOZ1M0AgEkMywqGRpCOzJCDGlXIRpaY2tvJ0NXECsnWVsnU2UBFCcjeDcDAVkpPUQJZ1RiQFJzc3l0VlkBIikEAHNKdBUQL2V3ZhlaAjU0RV0nRHpTCjJld2ZQTx5vLl5bc1x0SFp4fm85|~1624112440842~1~20201218~eyJ2aXdlIjoiMCIsImJhaW4iOnt9fQ==~1~~xlwr|doei:,1,0,0,0,0,1000,-1000,1000,-1000;dmei:,1,0,0,1000,-1000,1000,-1000,1000,-1000;emc:;emmm:;emcf:;ivli:;iivl:;ivcvj:;scvje:;ewhi:;1624112440733,1624112440839,0,0,0,0,0,0,0,0,0;88yu","frontendInitStatus":"s","platform":1}&appid=activities_platform&t=1624112445417 `,

headers: {
"Origin": "https://thebigboss.jd.com",
"Host": "api.m.jd.com",
      "User-Agent": "jdltapp;android;3.5.0;10;7303439343432346-7356431353233323;network/4g;model/PCAM00;addressid/4228801336;aid/7049442d7e415232;oaid/;osVer/29;appBuild/1587;psn/J7DoQdnbd16144pyXDtYAH6c3B9Rkr60|87;psq/7;adk/;ads/;pap/JA2020_3112531|3.5.0|ANDROID 10;osv/10;pv/16.58;jdv/;ref/com.jd.jdlite.lib.mission.allowance.AllowanceFragment;partner/oppo;apprpd/Allowance_Registered;eufv/1;Mozilla/5.0 (Linux; Android 10; PCAM00 Build/QKQ1.190918.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045140 Mobile Safari/537.36",
      "Cookie": ck2,
      }
                }
      
        $.get(options, async (err, resp, data) => {
            try {

                  cc = JSON.parse(data);

                  
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

















function help(userpin) {
    return new Promise(async (resolve) => {

                let options = {
    url: `https://thebigboss.jd.com/?id=fzf6tK4xMfE2ICK4-T_iUw&enter=share&userpin=${userpin}&task=92&ad_od=share&utm_source=androidapp&utm_medium=appshare&utm_campaign=t_335139774&utm_term=Wxfriends`,

headers: {
"Origin": "https://thebigboss.jd.com",
"Host": "thebigboss.jd.com",
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.5(0x18000528) NetType/WIFI Language/zh_CN",
      "Cookie": cookie,
      }
                }
      
        $.get(options, async (err, resp, data) => {
            try {

                  //$.helpinfo = JSON.parse(data);

                  
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}



async function taskPostUrl(functionId,body) {
  return {
    url: `${JD_API_HOST}`,
    body: `functionId=${functionId}&body=${escape(JSON.stringify(body))}&client=wh5&clientVersion=1.0.0&appid=content_ecology&uuid=6898c30638c55142969304c8e2167997fa59eb54&t=1622588448365`,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Connection': 'keep-alive',
      'Content-Type': 'application/x-www-form-urlencoded',
      "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      'Accept-Language': 'zh-cn',
      'Accept-Encoding': 'gzip, deflate, br',
    }
  }
}


async function TotalBean() {
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
            if (data["retcode"] === 13) {
              $.isLogin = false; //cookie过期
              return;
            }
            if (data["retcode"] === 0) {
              $.nickName = (data["base"] && data["base"].nickname) || $.UserName;
            } else {
              $.nickName = $.UserName;
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
async function safeGet(data) {
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
