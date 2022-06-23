/**
 粉丝互动，尽量自己设置定时，在0点和1点抽奖，白天基本没水
 注意：脚本会加购，脚本会加购，脚本会加购
 cron "10 0 * * *" jd_fan.js
 * */
const $ = new Env('粉丝互动');
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const notify = $.isNode() ? require('./sendNotify') : '';
let cookiesArr = [];

const activityList = [
    {'id':'f1c859ad23124013a17cfd8e8791f160','endTime':1656626274000},//
]

if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
    cookiesArr = [
        $.getdata("CookieJD"),
        $.getdata("CookieJD2"),
        ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        return;
    }
    if(!activityList.length){
        console.log(`\n没有活动，退出！！！`);
        return;
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        await getUA();
        $.index = i + 1;
        $.cookie = cookiesArr[i];
        $.oldcookie = cookiesArr[i];
        $.isLogin = true;
        $.nickName = '';

        $.UserName = decodeURIComponent($.cookie.match(/pt_pin=([^; ]+)(?=;?)/) && $.cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
        console.log(`\n*****开始【京东账号${$.index}】${$.nickName || $.UserName}*****\n`);

        $.hotFlag = false;
        for (let j = 0; j < activityList.length && !$.hotFlag; j++) {
            $.activityInfo = activityList[j];
            $.activityID = $.activityInfo.id;
            console.log(`互动ID：${JSON.stringify($.activityInfo)}`);
            console.log(`活动地址：https://lzkjdz-isv.isvjcloud.com/wxFansInterActionActivity/activity/${$.activityID}?activityId=${$.activityID}`);
            if($.activityInfo.endTime && Date.now() > $.activityInfo.endTime){
                console.log(`活动已结束\n`);
                continue;
            }
            await main();
            await $.wait(2500);
            console.log('\n')
        }
    }
})().catch((e) => {$.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')}).finally(() => {$.done();});

async function main() {
    $.token = ``;
    await getToken();
    await $.wait(1500);
    if($.token === ``){
        console.log(`获取token失败`);return;
    }
    console.log(`token:${$.token}`);
    await $.wait(1000);
    await getActCk();
    await $.wait(1500);
    $.shopId = ``;
    await takePostRequest('getSimpleActInfoVo');
    if($.shopid === ``){
        console.log(`获取shopid失败`);return;
    }
    console.log(`shopid:${$.shopid}`)
    await $.wait(1000);
    $.pin = '';
    await takePostRequest('getMyPing');
    if($.pin === ``){
        $.hotFlag = true;
        console.log(`获取pin失败,该账号可能是黑号`);return;
    }
    $.cookie=$.cookie + `AUTH_C_USER=${$.pin}`;
    await $.wait(1000);
    await accessLogWithAD();
    $.cookie=$.cookie + `AUTH_C_USER=${$.pin}`;
    await $.wait(1000);
    $.activityData = {};
    $.actinfo = '';$.actorInfo='';$.nowUseValue = 0;
    await takePostRequest('activityContent');
    if(JSON.stringify($.activityData) === `{}`){
        console.log(`获取活动详情失败`);return;
    }
    let date = new Date($.activityData.actInfo.endTime)
    let endtime = date.getFullYear() + "-" + (date.getMonth() < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + "-" + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate())
    console.log(`${$.actinfo.actName},${$.actinfo.shopName},当前积分：${$.nowUseValue},结束时间：${endtime}，${$.activityData.actInfo.endTime}`);
    let gitList = [];
    let gitTypeList = ['One','Two','Three'];
    for (let i = 0; i < gitTypeList.length; i++) {
        let gitInfo = $.activityData.actInfo['giftLevel'+ gitTypeList[i]] || '';
        if(gitInfo){
            gitInfo = JSON.parse(gitInfo);
            gitList.push(gitInfo[0].name);
        }
    }
    console.log(`奖品列表：` + gitList.toString());
    if($.actorInfo.prizeOneStatus && $.actorInfo.prizeTwoStatus && $.actorInfo.prizeThreeStatus){
        console.log(`已抽过所有奖品`);return;
    }
    await $.wait(1000);
    $.memberInfo = {};
    await takePostRequest('getActMemberInfo');
    if($.memberInfo.actMemberStatus === 1 && !$.memberInfo.openCard){
        console.log(`\n====================该活动需要入会,如需执行，请先手动入会====================`);return ;
    }
    await $.wait(1000);
    $.upFlag = false;
    await doTask();
    await luckDraw();//抽奖
}

async function luckDraw(){
    if($.upFlag){
        await takePostRequest('activityContent');
        await $.wait(1000);
    }
    let nowUseValue = Number($.activityData.actorInfo.fansLoveValue) + Number($.activityData.actorInfo.energyValue) ;
    if (nowUseValue >= $.activityData.actConfig.prizeScoreOne && $.activityData.actorInfo.prizeOneStatus === false) {
        console.log(`开始第一次抽奖`);
        $.drawType = '01';
        await takePostRequest('startDraw');
        await $.wait(1000);
    }
    if (nowUseValue >= $.activityData.actConfig.prizeScoreTwo && $.activityData.actorInfo.prizeTwoStatus === false) {
        console.log(`开始第二次抽奖`);
        $.drawType = '02';
        await takePostRequest('startDraw');
        await $.wait(1000);
    }
    if (nowUseValue >= $.activityData.actConfig.prizeScoreThree && $.activityData.actorInfo.prizeThreeStatus === false) {
        console.log(`开始第三次抽奖`);
        $.drawType = '03';
        await takePostRequest('startDraw');
        await $.wait(1000);
    }
}
async function doTask(){
    $.runFalag = true;
    if($.activityData.actorInfo && !$.activityData.actorInfo.follow){
        console.log(`关注店铺`);
        await takePostRequest('followShop');
        await $.wait(2000);
        $.upFlag = true;
    }else{
        console.log('已关注')
    }
    if ($.activityData.task1Sign && $.activityData.task1Sign.finishedCount === 0 && $.runFalag) {
        console.log(`执行每日签到`);
        await takePostRequest('doSign');
        await $.wait(2000);
        $.upFlag = true;
    }else{
        console.log(`已签到`)
    }
    let needFinishNumber = 0;
    //浏览货品任务
    if ($.activityData.task2BrowGoods && $.runFalag) {
        if($.activityData.task2BrowGoods.finishedCount !== $.activityData.task2BrowGoods.upLimit){
            needFinishNumber = Number($.activityData.task2BrowGoods.upLimit) - Number($.activityData.task2BrowGoods.finishedCount);
            console.log(`开始做浏览商品任务`);
            $.upFlag = true;
            for (let i = 0; i < $.activityData.task2BrowGoods.taskGoodList.length && needFinishNumber > 0 && $.runFalag; i++) {
                $.oneGoodInfo = $.activityData.task2BrowGoods.taskGoodList[i];
                if ($.oneGoodInfo.finished === false) {
                    console.log(`浏览:${$.oneGoodInfo.skuName || ''}`)
                    await takePostRequest('doBrowGoodsTask');
                    await $.wait(2000);
                    needFinishNumber--;
                }
            }
        }else{
            console.log(`浏览商品任务已完成`)
        }
    }
    //加购商品任务
    if($.activityData.task3AddCart && $.runFalag){
        if($.activityData.task3AddCart.finishedCount !== $.activityData.task3AddCart.upLimit){
            needFinishNumber = Number($.activityData.task3AddCart.upLimit) - Number($.activityData.task3AddCart.finishedCount);
            console.log(`开始做加购商品任务`);
            $.upFlag = true;
            for (let i = 0; i < $.activityData.task3AddCart.taskGoodList.length && needFinishNumber > 0 && $.runFalag; i++) {
                $.oneGoodInfo = $.activityData.task3AddCart.taskGoodList[i];
                if ($.oneGoodInfo.finished === false) {
                    console.log(`加购:${$.oneGoodInfo.skuName || ''}`)
                    await takePostRequest('doAddGoodsTask');
                    await $.wait(5000);
                    needFinishNumber--;
                }
            }
        }else{
            console.log(`加购商品已完成`)
        }
    }
    //分享任务
    if ($.activityData.task4Share && $.runFalag) {
        if($.activityData.task4Share.finishedCount !== $.activityData.task4Share.upLimit){
            needFinishNumber = Number($.activityData.task4Share.upLimit) - Number($.activityData.task4Share.finishedCount);
            console.log(`开始做分享任务`);
            $.upFlag = true;
            for (let i = 0; i < needFinishNumber && $.runFalag; i++) {
                console.log(`执行第${i+1}次分享`);
                await takePostRequest('doShareTask');
                await $.wait(2000);
            }
        }else{
            console.log(`分享任务已完成`)
        }
    }
    //设置活动提醒
    if ($.activityData.task5Remind && $.runFalag) {
        if($.activityData.task5Remind.finishedCount !== $.activityData.task5Remind.upLimit){
            console.log(`执行设置活动提醒`);
            $.upFlag = true;
            await takePostRequest('doRemindTask');
            await $.wait(2000);
        }else{
            console.log(`设置活动提醒已完成`)
        }
    }
    //领取优惠券
    if ($.activityData.task6GetCoupon && $.runFalag) {
        if($.activityData.task6GetCoupon.finishedCount !== $.activityData.task6GetCoupon.upLimit){
            needFinishNumber = Number($.activityData.task6GetCoupon.upLimit) - Number($.activityData.task6GetCoupon.finishedCount);
            console.log(`开始做领取优惠券`);
            $.upFlag = true;
            for (let i = 0; i < $.activityData.task6GetCoupon.taskCouponInfoList.length && needFinishNumber > 0 && $.runFalag; i++) {
                $.oneCouponInfo = $.activityData.task6GetCoupon.taskCouponInfoList[i];
                if ($.oneCouponInfo.finished === false) {
                    await takePostRequest('doGetCouponTask');
                    await $.wait(2000);
                    needFinishNumber--;
                }
            }
        }else{
            console.log(`领取优惠券已完成`)
        }
    }
    //逛会场
    if ($.activityData.task7MeetPlaceVo && $.runFalag) {
        if($.activityData.task7MeetPlaceVo.finishedCount !== $.activityData.task7MeetPlaceVo.upLimit){
            console.log(`执行逛会场`);
            $.upFlag = true;
            await takePostRequest('doMeetingTask');
            await $.wait(2000);
        }else{
            console.log(`逛会场已完成`)
        }
    }

}

async function takePostRequest(type){
    let url = '';
    let body = ``;
    switch (type) {
        case 'getSimpleActInfoVo':
            url= 'https://lzkjdz-isv.isvjcloud.com/customer/getSimpleActInfoVo';
            body = `activityId=${$.activityID}`;
            break;
        case 'getMyPing':
            url= 'https://lzkjdz-isv.isvjcloud.com/customer/getMyPing';
            body = `userId=${$.shopid}&token=${encodeURIComponent($.token)}&fromType=APP`;
            break;
        case 'activityContent':
            url= 'https://lzkjdz-isv.isvjcloud.com/wxFansInterActionActivity/activityContent';
            body = `activityId=${$.activityID}&pin=${encodeURIComponent($.pin)}`;
            break;
        case 'getActMemberInfo':
            url= 'https://lzkjdz-isv.isvjcloud.com/wxCommonInfo/getActMemberInfo';
            body = `venderId=${$.shopid}&activityId=${$.activityID}&pin=${encodeURIComponent($.pin)}`;
            break;
        case 'doBrowGoodsTask':
        case 'doAddGoodsTask':
            url= `https://lzkjdz-isv.isvjcloud.com/wxFansInterActionActivity/${type}`;
            body = `activityId=${$.activityID}&uuid=${$.activityData.actorInfo.uuid}&skuId=${$.oneGoodInfo.skuId}`;
            break;
        case 'doSign':
        case 'followShop':
        case 'doShareTask':
        case 'doRemindTask':
        case 'doMeetingTask':
            url= `https://lzkjdz-isv.isvjcloud.com/wxFansInterActionActivity/${type}`;
            body = `activityId=${$.activityID}&uuid=${$.activityData.actorInfo.uuid}`;
            break;
        case 'doGetCouponTask':
            url= `https://lzkjdz-isv.isvjcloud.com/wxFansInterActionActivity/${type}`;
            body= `activityId=${$.activityID}&uuid=${$.activityData.actorInfo.uuid}&couponId=${$.oneCouponInfo.couponInfo.couponId}`;
            break;
        case 'startDraw':
            url= `https://lzkjdz-isv.isvjcloud.com/wxFansInterActionActivity/${type}`;
            body= `activityId=${$.activityID}&uuid=${$.activityData.actorInfo.uuid}&drawType=${$.drawType}`;
            break;
        default:
            console.log(`错误${type}`);
    }
    let myRequest = getPostRequest(url,body);
    await $.wait(2500);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dealReturn(type, data);
            } catch (e) {
                console.log(data);
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function dealReturn(type, data) {
    try {
        if (safeGet(data)) {
            data = JSON.parse(data);
        }else {
            data = '';
        }
    }catch (e) {
        console.log(`执行任务异常`);
        console.log(data);
        $.runFalag = false;
    }
    switch (type) {
        case 'getSimpleActInfoVo':
            if (data.result) {
                $.shopid = data.data.venderId;
            }
            break;
        case 'getMyPing':
            if (data.data && data.data.secretPin) {
                $.pin = data.data.secretPin
                $.nickname = data.data.nickname
            }else{
                console.log(JSON.stringify(data));
            }
            break;
        case 'activityContent':
            if (data.data && data.result && data.count === 0) {
                $.activityData = data.data;
                $.actinfo = $.activityData.actInfo
                $.actorInfo = $.activityData.actorInfo
                $.nowUseValue = Number($.actorInfo.fansLoveValue) + Number($.actorInfo.energyValue) ;
            } else {
                console.log(JSON.stringify(data));
            }
            break;
        case 'getActMemberInfo':
            if (data.data && data.result && data.count === 0) {
                $.memberInfo = data.data;
            }
            break;
        case 'doSign':
            if (data.result === true) {
                console.log('签到成功')
            } else {
                console.log(data.errorMessage)
            }
            break;
        case 'followShop':
        case 'doBrowGoodsTask':
        case 'doAddGoodsTask':
        case 'doShareTask':
        case 'doRemindTask':
        case 'doGetCouponTask':
        case 'doMeetingTask':
            if (data.result === true) {
                console.log('执行成功');
            } else {
                console.log(data.errorMessage)
            }
            break;
        case 'startDraw':
            if(data.result && data.data){
                if(data.data.drawInfoType === 6){
                    console.log(`抽奖获得：${data.data.name || ''}`);
                }else if(data.data.drawInfoType === 0){
                    console.log(`未抽中`);
                }else{
                    console.log(`抽奖结果：${data.data.name || ''}`);
                }
            }
            console.log(JSON.stringify(data));
            break;
        default:
            console.log(JSON.stringify(data));
    }
}

function getPostRequest(url,body) {
    let headers =  {
        'Host': 'lzkjdz-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://lzkjdz-isv.isvjcloud.com/wxFansInterActionActivity/activity/' + $.activityID + '?activityId=' + $.activityID + '&shareuserid4minipg=jd_4806fb66e0f3e&shopid=undefined',
        'user-agent': $.UA,
        'content-type': 'application/x-www-form-urlencoded',
        'Cookie': $.cookie,
    }
    return  {url: url, method: `POST`, headers: headers, body: body};
}
function accessLogWithAD() {
    let config = {
        url: `https://lzkjdz-isv.isvjcloud.com/common/accessLogWithAD`,
        headers: {
            'Host': 'lzkjdz-isv.isvjcloud.com',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'user-agent': $.UA,
            'Referer': 'https://lzkjdz-isv.isvjcloud.com/wxFansInterActionActivity/activity/' + $.activityID + '?activityId=' + $.activityID + '&shareuserid4minipg=jd_4806fb66e0f3e&shopid=undefined',
            'content-type': 'application/x-www-form-urlencoded',
            'Cookie': $.cookie,
        },
        body:`venderId=${$.shopid}&code=69&pin=${encodeURIComponent($.pin)}&activityId=${$.activityID}&pageUrl=https://lzkjdz-isv.isvjcloud.com/wxFansInterActionActivity/activity/${$.activityID}?activityId=${$.activityID}&shareuserid4minipg=&shopid=undefined&subType=app&adSource=`
    }
    return new Promise(resolve => {
        $.post(config, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    $.cookie =  $.oldcookie;
                    if ($.isNode())
                        for (let ck of resp['headers']['set-cookie']) {
                            $.cookie = `${$.cookie}${ck.split(";")[0]};`
                        }
                    else {
                        for (let ck of resp['headers']['Set-Cookie'].split(',')) {
                            $.cookie = `${$.cookie}${ck.split(";")[0]};`
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
function getActCk() {
    let config = {
        url: `https://lzkjdz-isv.isvjcloud.com/wxFansInterActionActivity/activity/${$.activityID}?activityId=${$.activityID}&shareuserid4minipg=jd_4806fb66e0f3e&shopid=undefined`,
        headers: {
            'Host': 'lzkjdz-isv.isvjcloud.com',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'https://lzkjdz-isv.isvjcloud.com/wxFansInterActionActivity/activity/' + $.activityID + '?activityId=' + $.activityID + '&shareuserid4minipg=jd_4806fb66e0f3e&shopid=undefined',
            'user-agent': $.UA,
            'content-type': 'application/x-www-form-urlencoded',
            'Cookie': $.cookie,
        }
    }
    return new Promise(resolve => {
        $.get(config, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    $.cookie =  $.oldcookie;
                    if ($.isNode())
                        for (let ck of resp['headers']['set-cookie']) {
                            $.cookie = `${$.cookie}${ck.split(";")[0]};`
                        }
                    else {
                        for (let ck of resp['headers']['Set-Cookie'].split(',')) {
                            $.cookie = `${$.cookie}${ck.split(";")[0]};`
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
function getToken() {
    let config = {
        url: 'https://api.m.jd.com/client.action?functionId=isvObfuscator&clientVersion=10.0.6&build=88852&client=android&d_brand=Xiaomi&d_model=RedmiK30&osVersion=11&screen=2175*1080&partner=xiaomi001&oaid=b30cf82cacfa8972&openudid=290955c2782e1c44&eid=eidAef5f8122a0sf2tNlFbi9TV+3rtJ+jl5UptrTZo/Aq5MKUEaXcdTZC6RfEBt5Jt3Gtml2hS+ZvrWoDvkVv4HybKpJJVMdRUkzX7rGPOis1TRFRUdU&sdkVersion=30&lang=zh_CN&uuid=290955c2782e1c44&aid=290955c2782e1c44&area=1_2803_2829_0&networkType=wifi&wifiBssid=unknown&uts=0f31TVRjBSsSbxrSGoN9DgdOSm6pBw5mcERcSRBBxns2PPMfI6n6ccc3sDC5tvqojX6KE6uHJtCmbQzfS%2B6T0ggVk1TfVMHdFhgxdB8xiJq%2BUJPVGAaS5duja15lBdKzCeU4J31903%2BQn8mkzlfNoAvZI7hmcbV%2FZBnR1VdoiUChwWlAxuEh75t18FqkjuqQHvhONIbhrfofUoFzbcriHw%3D%3D&uemps=0-0&harmonyOs=0&st=1625157308996&sign=e5ef32369adb2e4b7024cff612395a72&sv=110',
        body: 'body=%7B%22id%22%3A%22%22%2C%22url%22%3A%22https%3A%2F%2Flzkjdz-isv.isvjcloud.com%22%7D&',
        headers: {
            'Host': 'api.m.jd.com',
            'accept': '*/*',
            'user-agent': 'JD4iPhone/167490 (iPhone; iOS 14.2; Scale/3.00)',
            'accept-language': 'zh-Hans-JP;q=1, en-JP;q=0.9, zh-Hant-TW;q=0.8, ja-JP;q=0.7, en-US;q=0.6',
            'content-type': 'application/x-www-form-urlencoded',
            'Cookie': $.cookie
        }
    }
    return new Promise(resolve => {
        $.post(config, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    $.token = data['token']
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function safeGet(data) {
    try {
        if (typeof JSON.parse(data) == "object") {
            return true;
        }
    } catch (e) {
        console.log(e);
        console.log(`服务器访问数据为空，请检查自身设备网络情况`);
        return false;
    }
}

async function getUA(){
    $.UA = `jdapp;iPhone;10.0.10;14.3;${randomString(40)};network/wifi;model/iPhone12,1;addressid/3364463029;appBuild/167764;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`
}
function randomString(e) {
    e = e || 32;
    let t = "abcdef0123456789", a = t.length, n = "";
    for (i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
}

function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}