/*
cron "10 10 * * *" script-path=jx_products_detail.js,tag=京喜工厂商品列表详情
**/
const $ = new Env('京喜工厂商品列表详情');
const JD_API_HOST = 'https://m.jingxi.com/';
const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
$.cookieArr = [];
$.currentCookie = '';
let showMsg = '';
!(async () => {
    if (!getCookies()) return;
    for (let i = 0; i < $.cookieArr.length; i++) {
        $.currentCookie = $.cookieArr[i];
        $.index = i + 1;
        if ($.currentCookie) {
            const userName = decodeURIComponent(
                $.currentCookie.match(/pt_pin=(.+?);/) && $.currentCookie.match(/pt_pin=(.+?);/)[1],
            );
            $.log(`\n开始【京东账号${i + 1}】${userName}`);
            await getCommodityList();

            console.log(showMsg);

            //只发送给第一个号
            if (i ===0) {
                // 账号${$.index} - ${$.UserName}
                await notify.sendNotify(`${$.name}`, `${showMsg}`);
                break
            }

        }
    }
})()
    .catch(e => $.logErr(e))
    .finally(() => $.done());

function getCookies() {
    if ($.isNode()) {
        $.cookieArr = Object.values(jdCookieNode);
    } else {
        const CookiesJd = JSON.parse($.getdata("CookiesJD") || "[]").filter(x => !!x).map(x => x.cookie);
        $.cookieArr = [$.getdata("CookieJD") || "", $.getdata("CookieJD2") || "", ...CookiesJd].filter(x=>!!x);
    }
    if (!$.cookieArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {
            'open-url': 'https://bean.m.jd.com/',
        });
        return false;
    }
    return true;
}

function getCommodityList() {
    return new Promise(resolve => {
        $.get(taskUrl('diminfo/GetCommodityList', `flag=2&pageNo=1&pageSize=10000`), async (err, resp, data) => {
            try {
                const { ret, data: { commodityList = [] } = {}, msg } = JSON.parse(data);
                // $.log(`\n获取商品详情：${msg}\n${$.showLog ? data : ''}`);
                for (let index = 0; index < commodityList.length; index++) {
                    const { commodityId, stockNum } = commodityList[index];
                    await getCommodityDetail(commodityId, stockNum);
                    await $.wait(1000);
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}

function getCommodityDetail(commodityId, num) {
    return new Promise(async resolve => {
        $.get(
            taskUrl('diminfo/GetCommodityDetails', `commodityId=${commodityId}`),
            (err, resp, data) => {
                try {
                    const { ret, data: { commodityList = [] } = {}, msg } = JSON.parse(data);
                    // $.log(`\n获取商品详情：${msg}\n${$.showLog ? data : ''}`);
                    const { starLevel, name, price, productLimSeconds } = commodityList[0];
                        showMsg += `⭐️商品--${name}, 所需等级 ${starLevel}，所需电力: ${price / 100} 万，限时 ${
                            productLimSeconds / 60 / 60 / 24
                        } 天，📦库存：${num}，最短需要 ${(price / 864 / 2).toFixed(2)} \n`;
                    ;
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve();
                }
            },
        );
    });
}

function taskUrl(function_path, body) {
    return {
        url: `${JD_API_HOST}dreamfactory/${function_path}?${body}&zone=dream_factory&sceneval=2&g_login_type=1&_time=${Date.now()}&_=${Date.now()}`,
        headers: {
            Cookie: $.currentCookie,
            Accept: `*/*`,
            Connection: `keep-alive`,
            Referer: `https://st.jingxi.com/pingou/dream_factory/index.html`,
            'Accept-Encoding': `gzip, deflate, br`,
            Host: `m.jingxi.com`,
            'User-Agent': `jdpingou;android;3.6.6;10;9366134603335346-2356564626532336;network/wifi;model/PCCM00;addressid/2724627094;aid/9f1d035d2eedb52c;oaid/0990A8DEE8484D29A1F033DCEFB178E3e82dce91adda643738be64a5c1dbd373;osVer/29;appBuild/1830;psn/Y3zi9DfAnZ9m /CaT1 855ftH5Ommmjk|80;psq/17;adk/;ads/;pap/JA2020_3112531|3.6.6|ANDROID 10;osv/10;pv/58.17;installationId/64c27574699b447f9e83bb051482e0bc;jdv/0|androidapp|t_335139774|appshare|Wxfriends|1629270186766|1629270192;ref/HomeFragment;partner/oppo;apprpd/Home_Main;eufv/1;Mozilla/5.0 (Linux; Android 10; PCCM00 Build/QKQ1.191021.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045135 Mobile Safari/537.36`,
            'Accept-Language': `zh-cn`,
        },
    };
}

// prettier-ignore
function Env(t,s){return new class{constructor(t,s){this.name=t,this.data=null,this.dataFile="box.dat",this.logs=[],this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}getScript(t){return new Promise(s=>{$.get({url:t},(t,e,i)=>s(i))})}runScript(t,s){return new Promise(e=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=s&&s.timeout?s.timeout:o;const[h,a]=i.split("@"),r={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":h,Accept:"*/*"}};$.post(r,(t,s,i)=>e(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),o=JSON.stringify(this.data);e?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(s,o):this.fs.writeFileSync(t,o)}}lodash_get(t,s,e){const i=s.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return e;return o}lodash_set(t,s,e){return Object(t)!==t?t:(Array.isArray(s)||(s=s.toString().match(/[^.[\]]+/g)||[]),s.slice(0,-1).reduce((t,e,i)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(s[i+1])>>0==+s[i+1]?[]:{},t)[s[s.length-1]]=e,t)}getdata(t){let s=this.getval(t);if(/^@/.test(t)){const[,e,i]=/^@(.*?)\.(.*?)$/.exec(t),o=e?this.getval(e):"";if(o)try{const t=JSON.parse(o);s=t?this.lodash_get(t,i,""):s}catch(t){s=""}}return s}setdata(t,s){let e=!1;if(/^@/.test(s)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(s),h=this.getval(i),a=i?"null"===h?null:h||"{}":"{}";try{const s=JSON.parse(a);this.lodash_set(s,o,t),e=this.setval(JSON.stringify(s),i)}catch(s){const h={};this.lodash_set(h,o,t),e=this.setval(JSON.stringify(h),i)}}else e=$.setval(t,s);return e}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t));else if(this.isNode()){this.initGotEnv(t);const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t))}}time(t){let s={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in s)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?s[e]:("00"+s[e]).substr((""+s[e]).length)));return t}msg(s=t,e="",i="",o){const h=t=>!t||!this.isLoon()&&this.isSurge()?t:"string"==typeof t?this.isLoon()?t:this.isQuanX()?{"open-url":t}:void 0:"object"==typeof t&&(t["open-url"]||t["media-url"])?this.isLoon()?t["open-url"]:this.isQuanX()?t:void 0:void 0;this.isSurge()||this.isLoon()?$notification.post(s,e,i,h(o)):this.isQuanX()&&$notify(s,e,i,h(o)),this.logs.push("","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),this.logs.push(s),e&&this.logs.push(e),i&&this.logs.push(i)}log(...t){t.length>0?this.logs=[...this.logs,...t]:console.log(this.logs.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t={}){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}
