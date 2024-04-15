/*
cron "28 8,21 * * *" jd_bean_change.js, tag:资产变化强化版by-ccwav
 */

//详细说明参考 https://github.com/ccwav/QLScript2.

const $ = new Env('京东资产统计');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let NowHour = new Date().getHours();

//默认开启缓存模式
let checkbeanDetailMode = 1;
if ($.isNode() && process.env.BEANCHANGE_BEANDETAILMODE) {
    checkbeanDetailMode = process.env.BEANCHANGE_BEANDETAILMODE * 1;
}

const fs = require('fs');
const CR = require('crypto-js');
const moment = require("moment");
let matchtitle = "昨日";
let yesterday = "";
let TodayDate = "";
let startDate = "";
let endDate = "";
try {
    yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    TodayDate = moment().format("YYYY-MM-DD");
    startDate = moment().startOf("month").format("YYYY_MM");
    endDate = moment().endOf("month").format("YYYY-MM-DD");
} catch (e) {
    console.log("依赖缺失，请先安装依赖moment!");
    return
}

if (!fs.existsSync("./BeanCache")) {
    fs.mkdirSync("./BeanCache");
}

let strBeanCache = "./BeanCache/" + yesterday + ".json";
let strNewBeanCache = "./BeanCache/" + TodayDate + ".json";
let TodayCache = [];
let Fileexists = fs.existsSync(strBeanCache);
let TempBeanCache = [];
if (!Fileexists) {
    yesterday = TodayDate;
    strBeanCache = strNewBeanCache;
    Fileexists = fs.existsSync(strBeanCache);
    matchtitle = "今日";
}
if (Fileexists) {
    console.log("检测到资产变动缓存文件" + yesterday + ".json，载入...");
    TempBeanCache = fs.readFileSync(strBeanCache, 'utf-8');
    if (TempBeanCache) {
        TempBeanCache = TempBeanCache.toString();
        TempBeanCache = JSON.parse(TempBeanCache);
    }
}

Fileexists = fs.existsSync(strNewBeanCache);
if (Fileexists) {
    console.log("检测到资产变动缓存文件" + TodayDate + ".json，载入...");
    TodayCache = fs.readFileSync(strNewBeanCache, 'utf-8');
    if (TodayCache) {
        TodayCache = TodayCache.toString();
        TodayCache = JSON.parse(TodayCache);
    }
}


let allMessage = '';
let allMessage2 = '';
let allReceiveMessage = '';
let allWarnMessage = '';
let ReturnMessage = '';
let ReturnMessageMonth = '';
let allMessageMonth = '';

let MessageUserGp2 = '';
let ReceiveMessageGp2 = '';
let WarnMessageGp2 = '';
let allMessageGp2 = '';
let allMessage2Gp2 = '';
let allMessageMonthGp2 = '';
let IndexGp2 = 0;

let MessageUserGp3 = '';
let ReceiveMessageGp3 = '';
let WarnMessageGp3 = '';
let allMessageGp3 = '';
let allMessage2Gp3 = '';
let allMessageMonthGp3 = '';
let IndexGp3 = 0;

let MessageUserGp4 = '';
let ReceiveMessageGp4 = '';
let WarnMessageGp4 = '';
let allMessageGp4 = '';
let allMessageMonthGp4 = '';
let allMessage2Gp4 = '';
let IndexGp4 = 0;

let notifySkipList = "";
let IndexAll = 0;
let EnableMonth = "false";
let isSignError = false;
let ReturnMessageTitle = "";
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
const JD_API_HOST = 'https://api.m.jd.com/client.action';
let intPerSent = 0;
let i = 0;
let llShowMonth = false;
let Today = new Date();
let strAllNotify = "";
let strSubNotify = "";
let llPetError = false;
let strGuoqi = "";
let RemainMessage = '\n';
RemainMessage += "⭕提醒:⭕" + '\n';
RemainMessage += '【特价金币】特价版APP->我的->金币(可兑换无门槛红包)\n';
RemainMessage += '【话费积分】APP->充值中心-赚积分兑话费（180天效期）\n';
RemainMessage += '【礼品卡额】APP->我的->礼品卡（包含E卡，品牌类卡，超市卡）\n';
RemainMessage += '【超市卡】APP首页->京东超市->超市卡（超市商品可用）\n';
RemainMessage += '【老农场】APP->我的->东东农场->回旧版,完成可兑换无门槛红包,可用于任意商品\n';
RemainMessage += '【新农场】APP->我的->东东农场,完成可在记录里查看奖品\n';
RemainMessage += '【其他】不同类别红包不能叠加使用，自测';

let WP_APP_TOKEN_ONE = "";

let TempBaipiao = "";
let llgeterror = false;
let time = new Date().getHours();
if ($.isNode()) {
    if (process.env.WP_APP_TOKEN_ONE) {
        WP_APP_TOKEN_ONE = process.env.WP_APP_TOKEN_ONE;
    }
}
//if(WP_APP_TOKEN_ONE)
//console.log(`检测到已配置Wxpusher的Token，启用一对一推送...`);
//else
//console.log(`检测到未配置Wxpusher的Token，禁用一对一推送...`);

let jdSignUrl = 'https://api.nolanstore.cc/sign'
if (process.env.SIGNURL)
    jdSignUrl = process.env.SIGNURL;

let epsignurl = ""
if (process.env.epsignurl)
    epsignurl = process.env.epsignurl;

if ($.isNode() && process.env.BEANCHANGE_PERSENT) {
    intPerSent = parseInt(process.env.BEANCHANGE_PERSENT);
    console.log(`检测到设定了分段通知:` + intPerSent);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP2) {
    MessageUserGp2 = process.env.BEANCHANGE_USERGP2 ? process.env.BEANCHANGE_USERGP2.split('&') : [];
    intPerSent = 0; //分组推送，禁用账户拆分
    console.log(`检测到设定了分组推送2,将禁用分段通知`);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP3) {
    MessageUserGp3 = process.env.BEANCHANGE_USERGP3 ? process.env.BEANCHANGE_USERGP3.split('&') : [];
    intPerSent = 0; //分组推送，禁用账户拆分
    console.log(`检测到设定了分组推送3,将禁用分段通知`);
}

if ($.isNode() && process.env.BEANCHANGE_USERGP4) {
    MessageUserGp4 = process.env.BEANCHANGE_USERGP4 ? process.env.BEANCHANGE_USERGP4.split('&') : [];
    intPerSent = 0; //分组推送，禁用账户拆分
    console.log(`检测到设定了分组推送4,将禁用分段通知`);
}

//取消月结查询
//if ($.isNode() && process.env.BEANCHANGE_ENABLEMONTH) {
//EnableMonth = process.env.BEANCHANGE_ENABLEMONTH;
//}

if ($.isNode() && process.env.BEANCHANGE_SUBNOTIFY) {
    strSubNotify = process.env.BEANCHANGE_SUBNOTIFY;
    strSubNotify += "\n";
    console.log(`检测到预览置顶内容,将在一对一推送的预览显示...\n`);
}

if ($.isNode() && process.env.BEANCHANGE_ALLNOTIFY) {
    strAllNotify = process.env.BEANCHANGE_ALLNOTIFY;
    console.log(`检测到设定了公告,将在推送信息中置顶显示...`);
    strAllNotify = "✨✨✨✨✨✨✨公告✨✨✨✨✨✨✨\n" + strAllNotify;
    console.log(strAllNotify + "\n");
    strAllNotify += "\n🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏🎏\n"
}


if (EnableMonth == "true" && Today.getDate() == 1 && Today.getHours() > 17)
    llShowMonth = true;

let userIndex2 = -1;
let userIndex3 = -1;
let userIndex4 = -1;


if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false')
        console.log = () => { };
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

//查询开关
let strDisableList = "";
let DisableIndex = -1;
if ($.isNode()) {
    strDisableList = process.env.BEANCHANGE_DISABLELIST ? process.env.BEANCHANGE_DISABLELIST.split('&') : [];
}

//老农场
let EnableJdFruit = true;
DisableIndex = strDisableList.findIndex((item) => item === "老农场");
if (DisableIndex != -1) {
    console.log("检测到设定关闭老农场查询");
    EnableJdFruit = false;
}

//特价金币
let EnableJdSpeed = true;
DisableIndex = strDisableList.findIndex((item) => item === "极速金币");
if (DisableIndex != -1) {
    console.log("检测到设定关闭特价金币查询");
    EnableJdSpeed = false;
}

//领现金
let EnableCash = true;
DisableIndex = strDisableList.findIndex((item) => item === "领现金");
if (DisableIndex != -1) {
    console.log("检测到设定关闭领现金查询");
    EnableCash = false;
}

//7天过期京豆
let EnableOverBean = true;
DisableIndex = strDisableList.findIndex((item) => item === "过期京豆");
if (DisableIndex != -1) {
    console.log("检测到设定关闭过期京豆查询");
    EnableOverBean = false
}

//查优惠券
let EnableChaQuan = false;
DisableIndex = strDisableList.findIndex((item) => item === "查优惠券");
if (DisableIndex != -1) {
    console.log("检测到设定关闭优惠券查询");
    EnableChaQuan = false
}

DisableIndex = strDisableList.findIndex((item) => item === "活动攻略");
if (DisableIndex != -1) {
    console.log("检测到设定关闭活动攻略显示");
    RemainMessage = "";
}

//汪汪赛跑
let EnableJoyRun = true;
DisableIndex = strDisableList.findIndex((item) => item === "汪汪赛跑");
if (DisableIndex != -1) {
    console.log("检测到设定关闭汪汪赛跑查询");
    EnableJoyRun = false
}

//京豆收益查询
let EnableCheckBean = true;
DisableIndex = strDisableList.findIndex((item) => item === "京豆收益");
if (DisableIndex != -1) {
    console.log("检测到设定关闭京豆收益查询");
    EnableCheckBean = false
}



!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {
            "open-url": "https://bean.m.jd.com/bean/signIndex.action"
        });
        return;
    }
    for (i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            $.pt_pin = (cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
            $.CryptoJS = $.isNode() ? require('crypto-js') : CryptoJS;
            $.index = i + 1;
            $.beanCount = 0;
            $.incomeBean = 0;
            $.expenseBean = 0;
            $.todayIncomeBean = 0;
            $.todayOutcomeBean = 0;
            $.errorMsg = '';
            $.isLogin = true;
            $.nickName = '';
            $.levelName = '';
            $.message = '';
            $.balance = 0;
            $.expiredBalance = 0;
            $.JdFarmProdName = '';
            $.JdtreeEnergy = 0;
            $.JdtreeTotalEnergy = 0;
            $.treeState = 0;
            $.JdwaterTotalT = 0;
            $.JdwaterD = 0;
            $.JDwaterEveryDayT = 0;
            $.JDtotalcash = 0;
            $.jdCash = 0;
            $.isPlusVip = false;
            $.isRealNameAuth = false;
            $.JingXiang = "";
            $.allincomeBean = 0; //月收入
            $.allexpenseBean = 0; //月支出
            $.beanChangeXi = 0;
            $.YunFeiTitle = "";
            $.YunFeiQuan = 0;
            $.YunFeiQuanEndTime = "";
            $.YunFeiTitle2 = "";
            $.YunFeiQuan2 = 0;
            $.YunFeiQuanEndTime2 = "";
            $.JoyRunningAmount = "";
            $.ECardinfo = "";
            $.PlustotalScore = 0;
            $.CheckTime = "";
            $.beanCache = 0;
            $.fruitnewinfo = '';
            $.newfarm_info = '';
            TempBaipiao = "";
            strGuoqi = "";

            console.log(`******开始查询【京东账号${$.index}】${$.nickName || $.UserName}*********`);
            $.UA = require('./USER_AGENTS').UARAM();
            await getuserinfo_6dy();
            //await TotalBean2();
            if ($.beanCount == 0) {
                console.log("数据获取失败，等待30秒后重试....")
                await $.wait(30 * 1000);
                await TotalBean();
            }
            if ($.beanCount == 0) {
                console.log("疑似获取失败,等待10秒后用第二个接口试试....")
                await $.wait(10 * 1000);
                var userdata = await getuserinfo();
                if (userdata.code == 1) {
                    $.beanCount = userdata.content.jdBean;
                }
            }


            if (!$.isLogin) {
                await isLoginByX1a0He();
            }
            if (!$.isLogin) {
                $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {
                    "open-url": "https://bean.m.jd.com/bean/signIndex.action"
                });

                if ($.isNode()) {
                    await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                }
                continue
            }

            if (TempBeanCache) {
                for (let j = 0; j < TempBeanCache.length; j++) {
                    if (TempBeanCache[j].pt_pin == $.UserName) {
                        $.CheckTime = TempBeanCache[j].CheckTime;
                        $.beanCache = TempBeanCache[j].BeanNum;
                        break;
                    }
                }
            }

            var llfound = false;
            var timeString = "";
            var nowHour = new Date().getHours();
            var nowMinute = new Date().getMinutes();
            if (nowHour < 10)
                timeString += "0" + nowHour + ":";
            else
                timeString += nowHour + ":";

            if (nowMinute < 10)
                timeString += "0" + nowMinute;
            else
                timeString += nowMinute;

            if (TodayCache) {
                for (let j = 0; j < TodayCache.length; j++) {
                    if (TodayCache[j].pt_pin == $.UserName) {
                        TodayCache[j].CheckTime = timeString;
                        TodayCache[j].BeanNum = $.beanCount;
                        llfound = true;
                        break;
                    }
                }
            }
            if (!llfound) {

                var tempAddCache = {
                    "pt_pin": $.UserName,
                    "CheckTime": timeString,
                    "BeanNum": $.beanCount
                };
                TodayCache.push(tempAddCache);
            }

            await getjdfruitinfo(); //老农场
            await $.wait(1000);
            await fruitnew();
            await checkplus();
            await Promise.all([
                cash(), //特价金币
                bean(), //京豆查询
                //jdCash(), //领现金
                //GetJoyRuninginfo(), //汪汪赛跑
                queryScores(),
                getek(),
                newfarm_info()
            ])

            await showMsg();
            if (intPerSent > 0) {
                if ((i + 1) % intPerSent == 0) {
                    console.log("分段通知条件达成，处理发送通知....");
                    if ($.isNode() && allMessage) {
                        var TempMessage = allMessage;
                        if (strAllNotify)
                            allMessage = strAllNotify + `\n` + allMessage;

                        await notify.sendNotify(`${$.name}`, `${allMessage}`, {
                            url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
                        }, undefined, TempMessage)
                    }
                    if ($.isNode() && allMessageMonth) {
                        await notify.sendNotify(`京东月资产统计`, `${allMessageMonth}`, {
                            url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
                        })
                    }
                    allMessage = "";
                    allMessageMonth = "";
                }

            }
        }
    }

    var str = JSON.stringify(TodayCache, null, 2);
    fs.writeFile(strNewBeanCache, str, function (err) {
        if (err) {
            console.log(err);
            console.log("添加缓存" + TodayDate + ".json失败!");
        } else {
            console.log("添加缓存" + TodayDate + ".json成功!");
        }
    })

    //组1通知
    if (ReceiveMessageGp4) {
        allMessage2Gp4 = `【⏰商品白嫖清单⏰】\n` + ReceiveMessageGp4;
    }
    if (WarnMessageGp4) {
        if (allMessage2Gp4) {
            allMessage2Gp4 = `\n` + allMessage2Gp4;
        }
        allMessage2Gp4 = `【⏰商品白嫖活动任务提醒⏰】\n` + WarnMessageGp4 + allMessage2Gp4;
    }

    //组2通知
    if (ReceiveMessageGp2) {
        allMessage2Gp2 = `【⏰商品白嫖清单⏰】\n` + ReceiveMessageGp2;
    }
    if (WarnMessageGp2) {
        if (allMessage2Gp2) {
            allMessage2Gp2 = `\n` + allMessage2Gp2;
        }
        allMessage2Gp2 = `【⏰商品白嫖活动任务提醒⏰】\n` + WarnMessageGp2 + allMessage2Gp2;
    }

    //组3通知
    if (ReceiveMessageGp3) {
        allMessage2Gp3 = `【⏰商品白嫖清单⏰】\n` + ReceiveMessageGp3;
    }
    if (WarnMessageGp3) {
        if (allMessage2Gp3) {
            allMessage2Gp3 = `\n` + allMessage2Gp3;
        }
        allMessage2Gp3 = `【⏰商品白嫖活动任务提醒⏰】\n` + WarnMessageGp3 + allMessage2Gp3;
    }

    //其他通知
    if (allReceiveMessage) {
        allMessage2 = `【⏰商品白嫖清单⏰】\n` + allReceiveMessage;
    }
    if (allWarnMessage) {
        if (allMessage2) {
            allMessage2 = `\n` + allMessage2;
        }
        allMessage2 = `【⏰商品白嫖活动任务提醒⏰】\n` + allWarnMessage + allMessage2;
    }

    if (intPerSent > 0) {
        //console.log("分段通知还剩下" + cookiesArr.length % intPerSent + "个账号需要发送...");
        if (allMessage || allMessageMonth) {
            console.log("分段通知收尾，处理发送通知....");
            if ($.isNode() && allMessage) {
                var TempMessage = allMessage;
                if (strAllNotify)
                    allMessage = strAllNotify + `\n` + allMessage;

                await notify.sendNotify(`${$.name}`, `${allMessage}`, {
                    url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
                }, undefined, TempMessage)
            }
            if ($.isNode() && allMessageMonth) {
                await notify.sendNotify(`京东月资产统计`, `${allMessageMonth}`, {
                    url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
                })
            }
        }
    } else {

        if ($.isNode() && allMessageGp2) {
            var TempMessage = allMessageGp2;
            if (strAllNotify)
                allMessageGp2 = strAllNotify + `\n` + allMessageGp2;
            await notify.sendNotify(`${$.name}#2`, `${allMessageGp2}`, {
                url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
            }, undefined, TempMessage)
            await $.wait(10 * 1000);
        }
        if ($.isNode() && allMessageGp3) {
            var TempMessage = allMessageGp3;
            if (strAllNotify)
                allMessageGp3 = strAllNotify + `\n` + allMessageGp3;
            await notify.sendNotify(`${$.name}#3`, `${allMessageGp3}`, {
                url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
            }, undefined, TempMessage)
            await $.wait(10 * 1000);
        }
        if ($.isNode() && allMessageGp4) {
            var TempMessage = allMessageGp4;
            if (strAllNotify)
                allMessageGp4 = strAllNotify + `\n` + allMessageGp4;
            await notify.sendNotify(`${$.name}#4`, `${allMessageGp4}`, {
                url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
            }, undefined, TempMessage)
            await $.wait(10 * 1000);
        }
        if ($.isNode() && allMessage) {
            var TempMessage = allMessage;
            if (strAllNotify)
                allMessage = strAllNotify + `\n` + allMessage;

            await notify.sendNotify(`${$.name}`, `${allMessage}`, {
                url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
            }, undefined, TempMessage)
            await $.wait(10 * 1000);
        }

        if ($.isNode() && allMessageMonthGp2) {
            await notify.sendNotify(`京东月资产统计#2`, `${allMessageMonthGp2}`, {
                url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
            })
            await $.wait(10 * 1000);
        }
        if ($.isNode() && allMessageMonthGp3) {
            await notify.sendNotify(`京东月资产统计#3`, `${allMessageMonthGp3}`, {
                url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
            })
            await $.wait(10 * 1000);
        }
        if ($.isNode() && allMessageMonthGp4) {
            await notify.sendNotify(`京东月资产统计#4`, `${allMessageMonthGp4}`, {
                url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
            })
            await $.wait(10 * 1000);
        }
        if ($.isNode() && allMessageMonth) {
            await notify.sendNotify(`京东月资产统计`, `${allMessageMonth}`, {
                url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
            })
            await $.wait(10 * 1000);
        }
    }

    if ($.isNode() && allMessage2Gp2) {
        allMessage2Gp2 += RemainMessage;
        await notify.sendNotify("京东白嫖提醒#2", `${allMessage2Gp2}`, {
            url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
        })
        await $.wait(10 * 1000);
    }
    if ($.isNode() && allMessage2Gp3) {
        allMessage2Gp3 += RemainMessage;
        await notify.sendNotify("京东白嫖提醒#3", `${allMessage2Gp3}`, {
            url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
        })
        await $.wait(10 * 1000);
    }
    if ($.isNode() && allMessage2Gp4) {
        allMessage2Gp4 += RemainMessage;
        await notify.sendNotify("京东白嫖提醒#4", `${allMessage2Gp4}`, {
            url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
        })
        await $.wait(10 * 1000);
    }
    if ($.isNode() && allMessage2) {
        allMessage2 += RemainMessage;
        await notify.sendNotify("京东白嫖提醒", `${allMessage2}`, {
            url: `https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean`
        })
        await $.wait(10 * 1000);
    }

})()
    .catch((e) => {
        $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
        $.done();
    })
async function showMsg() {
    //if ($.errorMsg)
    //return
    ReturnMessageTitle = "";
    ReturnMessage = "";
    var strsummary = "";
    if (MessageUserGp2) {
        userIndex2 = MessageUserGp2.findIndex((item) => item === $.pt_pin);
    }
    if (MessageUserGp3) {
        userIndex3 = MessageUserGp3.findIndex((item) => item === $.pt_pin);
    }
    if (MessageUserGp4) {
        userIndex4 = MessageUserGp4.findIndex((item) => item === $.pt_pin);
    }

    if (userIndex2 != -1) {
        IndexGp2 += 1;
        ReturnMessageTitle = `【账号${IndexGp2}🆔】${$.nickName || $.UserName}`;
    }
    if (userIndex3 != -1) {
        IndexGp3 += 1;
        ReturnMessageTitle = `【账号${IndexGp3}🆔】${$.nickName || $.UserName}`;
    }
    if (userIndex4 != -1) {
        IndexGp4 += 1;
        ReturnMessageTitle = `【账号${IndexGp4}🆔】${$.nickName || $.UserName}`;
    }
    if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
        IndexAll += 1;
        ReturnMessageTitle = `【账号${IndexAll}🆔】${$.nickName || $.UserName}`;
    }


    if ($.JingXiang) {
        // if ($.isRealNameAuth)
        //     if (cookie.includes("app_open"))
        //         ReturnMessageTitle += `(wskey已实名)\n`;
        //     else
        //         ReturnMessageTitle += `(已实名)\n`;
        // else
        //     if (cookie.includes("app_open"))
        //         ReturnMessageTitle += `(wskey未实名)\n`;
        //     else
        //         ReturnMessageTitle += `(未实名)\n`;

        ReturnMessage += `\n【账号信息】`;
        if ($.isPlusVip) {
            ReturnMessage += `Plus会员`;
        } else {
            ReturnMessage += `普通会员`;
        }
        if ($.PlustotalScore)
            ReturnMessage += `(${$.PlustotalScore}分)`

        ReturnMessage += `,京享值${$.JingXiang}\n`;
    } else {
        ReturnMessageTitle += `\n`;
    }
    if (llShowMonth) {
        ReturnMessageMonth = ReturnMessage;
        ReturnMessageMonth += `\n【上月收入】：${$.allincomeBean}京豆 🐶\n`;
        ReturnMessageMonth += `【上月支出】：${$.allexpenseBean}京豆 🐶\n`;

        console.log(ReturnMessageMonth);

        if (userIndex2 != -1) {
            allMessageMonthGp2 += ReturnMessageMonth + `\n`;
        }
        if (userIndex3 != -1) {
            allMessageMonthGp3 += ReturnMessageMonth + `\n`;
        }
        if (userIndex4 != -1) {
            allMessageMonthGp4 += ReturnMessageMonth + `\n`;
        }
        if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
            allMessageMonth += ReturnMessageMonth + `\n`;
        }
        if ($.isNode() && WP_APP_TOKEN_ONE) {
            try {
                await notify.sendNotifybyWxPucher("京东月资产统计", `${ReturnMessageMonth}`, `${$.UserName}`);
            } catch {
                $.log(`一对一推送异常，请拷贝库里的sendnotify.js文件到deps目录下，在拉库重试！！！\n`);
            }
        }

    }
    if (EnableCheckBean) {
        if (checkbeanDetailMode == 0) {
            ReturnMessage += `【今日京豆】收${$.todayIncomeBean}豆`;
            strsummary += `收${$.todayIncomeBean}豆,`;
            if ($.todayOutcomeBean != 0) {
                ReturnMessage += `,支${$.todayOutcomeBean}豆`;
            }
            ReturnMessage += `\n`;
            ReturnMessage += `【昨日京豆】收${$.incomeBean}豆`;

            if ($.expenseBean != 0) {
                ReturnMessage += `,支${$.expenseBean}豆`;
            }
            ReturnMessage += `\n`;
        } else {
            if (TempBeanCache) {
                ReturnMessage += `【京豆变动】${$.beanCount - $.beanCache}豆(与${matchtitle}${$.CheckTime}比较)`;
                strsummary += `变动${$.beanCount - $.beanCache}豆,`;
                ReturnMessage += `\n`;
            }
            else {
                ReturnMessage += `【京豆变动】未找到缓存,下次出结果统计`;
                ReturnMessage += `\n`;
            }
        }
    }


    if ($.beanCount) {
        ReturnMessage += `【当前京豆】${$.beanCount - $.beanChangeXi}豆(≈${(($.beanCount - $.beanChangeXi) / 100).toFixed(2)}元)\n`;
    } else {
        if ($.levelName || $.JingXiang)
            ReturnMessage += `【当前京豆】获取失败,接口返回空数据\n`;
        else {
            ReturnMessage += `【当前京豆】${$.beanCount - $.beanChangeXi}豆(≈${(($.beanCount - $.beanChangeXi) / 100).toFixed(2)}元)\n`;
        }
    }

    if ($.JDtotalcash) {
        ReturnMessage += `【特价金币】${$.JDtotalcash}币(≈${($.JDtotalcash / 10000).toFixed(2)}元)\n`;
    }
    if ($.ECardinfo)
        ReturnMessage += `【礼品卡额】${$.ECardinfo}元\n`;

    if ($.JoyRunningAmount)
        ReturnMessage += `【汪汪赛跑】${$.JoyRunningAmount}元\n`;

    if ($.JdFarmProdName != "") {
        if ($.JdtreeEnergy != 0) {
            if ($.treeState === 2 || $.treeState === 3) {
                ReturnMessage += `【老农场】${$.JdFarmProdName} 可以兑换了!\n`;
                TempBaipiao += `【老农场】${$.JdFarmProdName} 可以兑换了!\n`;
                if (userIndex2 != -1) {
                    ReceiveMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】${$.JdFarmProdName} (老农场)\n`;
                }
                if (userIndex3 != -1) {
                    ReceiveMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】${$.JdFarmProdName} (老农场)\n`;
                }
                if (userIndex4 != -1) {
                    ReceiveMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】${$.JdFarmProdName} (老农场)\n`;
                }
                if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
                    allReceiveMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】${$.JdFarmProdName} (老农场)\n`;
                }
            } else {
                //if ($.JdwaterD != 'Infinity' && $.JdwaterD != '-Infinity') {
                //ReturnMessage += `【老农场】${$.JdFarmProdName}(${(($.JdtreeEnergy / $.JdtreeTotalEnergy) * 100).toFixed(0)}%,${$.JdwaterD}天)\n`;
                //} else {
                ReturnMessage += `【老农场】${$.JdFarmProdName}(${(($.JdtreeEnergy / $.JdtreeTotalEnergy) * 100).toFixed(0)}%)\n`;

                //}
            }
        } else {
            if ($.treeState === 0) {
                TempBaipiao += `【老农场】水果领取后未重新种植!\n`;

                if (userIndex2 != -1) {
                    WarnMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】水果领取后未重新种植! (老农场)\n`;
                }
                if (userIndex3 != -1) {
                    WarnMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】水果领取后未重新种植! (老农场)\n`;
                }
                if (userIndex4 != -1) {
                    WarnMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】水果领取后未重新种植! (老农场)\n`;
                }
                if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
                    allWarnMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】水果领取后未重新种植! (老农场)\n`;
                }

            } else if ($.treeState === 1) {
                ReturnMessage += `【老农场】${$.JdFarmProdName}种植中...\n`;
            } else {
                TempBaipiao += `【老农场】状态异常!\n`;
                if (userIndex2 != -1) {
                    WarnMessageGp2 += `【账号${IndexGp2} ${$.nickName || $.UserName}】状态异常! (老农场)\n`;
                }
                if (userIndex3 != -1) {
                    WarnMessageGp3 += `【账号${IndexGp3} ${$.nickName || $.UserName}】状态异常! (老农场)\n`;
                }
                if (userIndex4 != -1) {
                    WarnMessageGp4 += `【账号${IndexGp4} ${$.nickName || $.UserName}】状态异常! (老农场)\n`;
                }
                if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
                    allWarnMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】状态异常! (老农场)\n`;
                }
                //ReturnMessage += `【老农场】${$.JdFarmProdName}状态异常${$.treeState}...\n`;
            }
        }
    }
    if ($.fruitnewinfo){
        //ReturnMessage += `【新农场】种植进度${$.fruitnewinfo}\n`;
        if ($.fruitnewinfo.skuName && $.fruitnewinfo.treeFullStage == 5 ){
            ReturnMessage += `【新农场】种植完成!\n`;
            TempBaipiao += `【新农场】种植完成!\n`;
            allReceiveMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】种植完成，去领取吧 (新农场)\n`;
        } else if ($.fruitnewinfo.skuName && $.fruitnewinfo.treeCurrentState === 0){
            ReturnMessage += '【新农场】种植进度' + $.fruitnewinfo.treeFullStage +'/5(' + $.fruitnewinfo.currentProcess+'%)\n';
        } else if ($.fruitnewinfo.treeFullStage === 0){
            ReturnMessage += `【新农场】未种植!\n`;
            //TempBaipiao += `【新农场】未种植!\n`;
            //allWarnMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】未种植，快去种植吧! (新农场)\n`;
        } else {
            ReturnMessage += '【新农场】可能枯萎了，请重新种植！\n';
        }
    } 
    if ($.newfarm_info){
            //ReturnMessage += `【新农场】奖品未兑换!\n`;
            TempBaipiao += `【新农场】奖品未兑换!\n`;
            allReceiveMessage += `【账号${IndexAll} ${$.nickName || $.UserName}】\n ${$.newfarm_info}\n 快去兑换吧 (新农场)\n`;        
    }

    let dwscore = await dwappinfo();
    if (dwscore) {
        let dwappex = await dwappexpire();
        ReturnMessage += `【话费积分】${dwscore}`;
        if (dwappex) {
            ReturnMessage += `(近7日将过期${dwappex})`;
        }
        ReturnMessage += `\n`;
    }
    let marketcard = await marketCard();
    if (marketcard && marketcard.balance != '0.00' ) {
        ReturnMessage += `【超市卡】${marketcard.balance}元`;
        if (marketcard.expirationGiftAmountDes) {
            ReturnMessage += `(${marketcard.expirationGiftAmountDes})`;
        }
        ReturnMessage += `\n`;
    }

    if ($.jdCash) {
        ReturnMessage += `【其他信息】`;

        if ($.jdCash) {
            ReturnMessage += `领现金:${$.jdCash}元`;
        }

        ReturnMessage += `\n`;

    }

    if (strGuoqi) {
        ReturnMessage += `💸💸💸临期京豆明细💸💸💸\n`;
        ReturnMessage += `${strGuoqi}`;
    }

    ReturnMessage += `🧧🧧🧧红包明细🧧🧧🧧\n`;
    ReturnMessage += `${$.message}`;
    strsummary += `红包${$.balance}元`
    if ($.YunFeiQuan) {
        var strTempYF = "【免运费券】" + $.YunFeiQuan + "张";
        if ($.YunFeiQuanEndTime)
            strTempYF += "(有效期至" + $.YunFeiQuanEndTime + ")";
        strTempYF += "\n";
        ReturnMessage += strTempYF
    }
    if ($.YunFeiQuan2) {
        var strTempYF2 = "【免运费券】" + $.YunFeiQuan2 + "张";
        if ($.YunFeiQuanEndTime2)
            strTempYF += "(有效期至" + $.YunFeiQuanEndTime2 + ")";
        strTempYF2 += "\n";
        ReturnMessage += strTempYF2
    }

    if (userIndex2 != -1) {
        allMessageGp2 += ReturnMessageTitle + ReturnMessage + `\n`;
    }
    if (userIndex3 != -1) {
        allMessageGp3 += ReturnMessageTitle + ReturnMessage + `\n`;
    }
    if (userIndex4 != -1) {
        allMessageGp4 += ReturnMessageTitle + ReturnMessage + `\n`;
    }
    if (userIndex2 == -1 && userIndex3 == -1 && userIndex4 == -1) {
        allMessage += ReturnMessageTitle + ReturnMessage + `\n------\n`;
    }

    console.log(`${ReturnMessageTitle + ReturnMessage}`);

    if ($.isNode() && WP_APP_TOKEN_ONE) {
        var strTitle = "京东资产统计";
        if ($.JingXiang) {
            if ($.isRealNameAuth)
                if (cookie.includes("app_open"))
                    ReturnMessage = `【账号名称】${$.nickName || $.UserName}(wskey已实名)\n` + ReturnMessage;
                else
                    ReturnMessage = `【账号名称】${$.nickName || $.UserName}(已实名)\n` + ReturnMessage;
            else
                if (cookie.includes("app_open"))
                    ReturnMessage = `【账号名称】${$.nickName || $.UserName}(wskey未实名)\n` + ReturnMessage;
                else
                    ReturnMessage = `【账号名称】${$.nickName || $.UserName}(未实名)\n` + ReturnMessage;

        } else {
            ReturnMessage = `【账号名称】${$.nickName || $.UserName}\n` + ReturnMessage;
        }
        if (TempBaipiao) {
            TempBaipiao = `【⏰商品白嫖活动提醒⏰】\n` + TempBaipiao;
            ReturnMessage = TempBaipiao + `\n` + ReturnMessage;
        }

        ReturnMessage += RemainMessage;

        if (strAllNotify)
            ReturnMessage = strAllNotify + `\n` + ReturnMessage;
        try {
            await notify.sendNotifybyWxPucher(strTitle, `${ReturnMessage}`, `${$.UserName}`, undefined, strsummary);
        } catch {
            $.log(`一对一推送异常，请拷贝库里的sendnotify.js文件到deps目录下，在拉库重试！！！\n`);
        }
    }

    //$.msg($.name, '', ReturnMessage , {"open-url": "https://bean.m.jd.com/beanDetail/index.action?resourceValue=bean"});
}
async function bean() {

    if (EnableCheckBean && checkbeanDetailMode == 0) {

        // console.log(`北京时间零点时间戳:${parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000}`);
        // console.log(`北京时间2020-10-28 06:16:05::${new Date("2020/10/28 06:16:05+08:00").getTime()}`)
        // 不管哪个时区。得到都是当前时刻北京时间的时间戳 new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000

        //前一天的0:0:0时间戳
        const tm = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000 - (24 * 60 * 60 * 1000);
        // 今天0:0:0时间戳
        const tm1 = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000;
        let page = 1,
            t = 0,
            yesterdayArr = [],
            todayArr = [];
        do {
            let response = await getJingBeanBalanceDetail(page);
            await $.wait(1000);
            // console.log(`第${page}页: ${JSON.stringify(response)}`);
            if (response && response.code === "0") {
                page++;
                let detailList = response.jingDetailList;
                if (detailList && detailList.length > 0) {
                    for (let item of detailList) {
                        const date = item.date.replace(/-/g, '/') + "+08:00";
                        if (new Date(date).getTime() >= tm1 && (!item['eventMassage'].includes("退还") && !item['eventMassage'].includes("物流") && !item['eventMassage'].includes('扣赠'))) {
                            todayArr.push(item);
                        } else if (tm <= new Date(date).getTime() && new Date(date).getTime() < tm1 && (!item['eventMassage'].includes("退还") && !item['eventMassage'].includes("物流") && !item['eventMassage'].includes('扣赠'))) {
                            //昨日的
                            yesterdayArr.push(item);
                        } else if (tm > new Date(date).getTime()) {
                            //前天的
                            t = 1;
                            break;
                        }
                    }
                } else {
                    $.errorMsg = `数据异常`;
                    $.msg($.name, ``, `账号${$.index}：${$.nickName}\n${$.errorMsg}`);
                    t = 1;
                }
            } else if (response && response.code === "3") {
                console.log(`cookie已过期，或者填写不规范，跳出`)
                t = 1;
            } else {
                console.log(`未知情况：${JSON.stringify(response)}`);
                console.log(`未知情况，跳出`)
                t = 1;
            }
        } while (t === 0);
        for (let item of yesterdayArr) {
            if (Number(item.amount) > 0) {
                $.incomeBean += Number(item.amount);
            } else if (Number(item.amount) < 0) {
                $.expenseBean += Number(item.amount);
            }
        }
        for (let item of todayArr) {
            if (Number(item.amount) > 0) {
                $.todayIncomeBean += Number(item.amount);
            } else if (Number(item.amount) < 0) {
                $.todayOutcomeBean += Number(item.amount);
            }
        }
        $.todayOutcomeBean = -$.todayOutcomeBean;
        $.expenseBean = -$.expenseBean;
    }

    if (EnableOverBean) {
        await jingBeanDetail(); //过期京豆	    
    }
    await redPacket();
    if (EnableChaQuan)
        await getCoupon();
}

async function Monthbean() {
    let time = new Date();
    let year = time.getFullYear();
    let month = parseInt(time.getMonth()); //取上个月
    if (month == 0) {
        //一月份，取去年12月，所以月份=12，年份减1
        month = 12;
        year -= 1;
    }

    //开始时间 时间戳
    let start = new Date(year + "-" + month + "-01 00:00:00").getTime();
    console.log(`计算月京豆起始日期:` + GetDateTime(new Date(year + "-" + month + "-01 00:00:00")));

    //结束时间 时间戳
    if (month == 12) {
        //取去年12月，进1个月，所以月份=1，年份加1
        month = 1;
        year += 1;
    }
    let end = new Date(year + "-" + (month + 1) + "-01 00:00:00").getTime();
    console.log(`计算月京豆结束日期:` + GetDateTime(new Date(year + "-" + (month + 1) + "-01 00:00:00")));

    let allpage = 1,
        allt = 0,
        allyesterdayArr = [];
    do {
        let response = await getJingBeanBalanceDetail(allpage);
        await $.wait(1000);
        // console.log(`第${allpage}页: ${JSON.stringify(response)}`);
        if (response && response.code === "0") {
            allpage++;
            let detailList = response.jingDetailList;
            if (detailList && detailList.length > 0) {
                for (let item of detailList) {
                    const date = item.date.replace(/-/g, '/') + "+08:00";
                    if (start <= new Date(date).getTime() && new Date(date).getTime() < end) {
                        //日期区间内的京豆记录
                        allyesterdayArr.push(item);
                    } else if (start > new Date(date).getTime()) {
                        //前天的
                        allt = 1;
                        break;
                    }
                }
            } else {
                $.errorMsg = `数据异常`;
                $.msg($.name, ``, `账号${$.index}：${$.nickName}\n${$.errorMsg}`);
                allt = 1;
            }
        } else if (response && response.code === "3") {
            console.log(`cookie已过期，或者填写不规范，跳出`)
            allt = 1;
        } else {
            console.log(`未知情况：${JSON.stringify(response)}`);
            console.log(`未知情况，跳出`)
            allt = 1;
        }
    } while (allt === 0);

    for (let item of allyesterdayArr) {
        if (Number(item.amount) > 0) {
            $.allincomeBean += Number(item.amount);
        } else if (Number(item.amount) < 0) {
            $.allexpenseBean += Number(item.amount);
        }
    }

}

async function jdCash() {
    if (!EnableCash)
        return;
    let opt = {
        url: `https://api.m.jd.com`,
        body: `functionId=cash_exchange_center&body={"version":"1","channel":"app"}&appid=signed_wh5&client=android&clientVersion=11.8.0&t=${Date.now()}`,
        headers: {
            'Host': 'api.m.jd.com',
            'Origin': 'https://h5.m.jd.com',
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': $.UA,
            'Cookie': cookie
        }
    }
    return new Promise((resolve) => {
        $.post(opt, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`jdCash API请求失败，请检查网路重试`)
                } else {
                    if (safeGet(data)) {
                        data = JSON.parse(data)
                        if (data.code == 0) {
                            if (data.data.bizCode == 0) {
                                $.jdCash = data.data.result.userMoney;
                            } else {
                                //console.log(data.data.bizMsg);
                            }
                        } else {
                            //console.log(data.msg)
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            }
            finally {
                resolve(data);
            }
        })
    })
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
        },
        timeout: 10000
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
                            //$.isPlusVip=data['isPlusVip'];
                            $.isRealNameAuth = data['isRealNameAuth'];
                            $.beanCount = (data['base'] && data['base'].jdNum) || 0;
                            $.JingXiang = (data['base'] && data['base'].jvalue) || 0;
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

function TotalBean2() {
    return new Promise(async (resolve) => {
        const options = {
            url: `https://wxapp.m.jd.com/kwxhome/myJd/home.json?&useGuideModule=0&bizId=&brandId=&fromType=wxapp&timestamp=${Date.now()}`,
            headers: {
                Cookie: cookie,
                'content-type': `application/x-www-form-urlencoded`,
                Connection: `keep-alive`,
                'Accept-Encoding': `gzip,compress,br,deflate`,
                Referer: `https://servicewechat.com/wxa5bf5ee667d91626/161/page-frame.html`,
                Host: `wxapp.m.jd.com`,
                'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.10(0x18000a2a) NetType/WIFI Language/zh_CN`,
            },
            timeout: 10000
        };
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    $.logErr(err);
                } else {
                    if (data) {
                        data = JSON.parse(data);

                        if (!data.user) {
                            return;
                        }
                        const userInfo = data.user;
                        if (userInfo) {
                            if (!$.nickName)
                                $.nickName = userInfo.petName;
                            if ($.beanCount == 0) {
                                $.beanCount = userInfo.jingBean;
                            }
                            $.JingXiang = userInfo.uclass;
                        }
                    } else {
                        $.log('京东服务器返回空数据');
                    }
                }
            } catch (e) {
                $.logErr(e);
            }
            finally {
                resolve();
            }
        });
    });
}

function isLoginByX1a0He() {
    return new Promise((resolve) => {
        const options = {
            url: 'https://plogin.m.jd.com/cgi-bin/ml/islogin',
            headers: {
                "Cookie": cookie,
                "referer": "https://h5.m.jd.com/",
                "User-Agent": "jdapp;iPhone;10.1.2;15.0;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
            },
            timeout: 10000
        }
        $.get(options, (err, resp, data) => {
            try {
                if (data) {
                    data = JSON.parse(data);
                    if (data.islogin === "1") {
                        console.log(`使用X1a0He写的接口加强检测: Cookie有效\n`)
                    } else if (data.islogin === "0") {
                        $.isLogin = false;
                        console.log(`使用X1a0He写的接口加强检测: Cookie无效\n`)
                    } else {
                        console.log(`使用X1a0He写的接口加强检测: 未知返回，不作变更...\n`)
                        $.error = `${$.nickName} :` + `使用X1a0He写的接口加强检测: 未知返回...\n`
                    }
                }
            } catch (e) {
                console.log(e);
            }
            finally {
                resolve();
            }
        });
    });
}

function getJingBeanBalanceDetail(page) {
    return new Promise(async resolve => {
        const options = {
            "url": `https://bean.m.jd.com/beanDetail/detail.json?page=${page}`,
            "body": `body=${escape(JSON.stringify({ "pageSize": "20", "page": page.toString() }))}&appid=ld`,
            "headers": {
                'User-Agent': $.UA,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookie,
            }
        }
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`getJingBeanBalanceDetail API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        // console.log(data)
                    } else {
                        // console.log(`京东服务器返回空数据`)
                    }
                }
            } catch (e) {
                // $.logErr(e, resp)
            } finally {
                resolve(data);
            }
        })
    })
}

function jingBeanDetail() {
    return new Promise(async resolve => {
        setTimeout(async () => {
            var strsign = "";
            if (epsignurl) {
                strsign = await getepsign('jingBeanDetail', { "pageSize": "20", "page": "1" });
                strsign = strsign.body;
            }
            else
                strsign = await getSignfromNolan('jingBeanDetail', { "pageSize": "20", "page": "1" });

            const options = {
                "url": `https://api.m.jd.com/client.action?functionId=jingBeanDetail`,
                "body": strsign,
                "headers": {
                    'User-Agent': $.UA,
                    'Host': 'api.m.jd.com',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': cookie,
                }
            }
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log(`${JSON.stringify(err)}`)
                        console.log(`${$.name} jingBeanDetail API请求失败，请检查网路重试`)
                    } else {
                        if (data) {
                            data = JSON.parse(data);
                            if (data?.others?.jingBeanExpiringInfo?.detailList) {
                                const { detailList = [] } = data?.others?.jingBeanExpiringInfo;
                                detailList.map(item => {
                                    strGuoqi += `【${(item['eventMassage']).replace("即将过期京豆", "").replace("年", "-").replace("月", "-").replace("日", "")}】过期${item['amount']}豆\n`;
                                })
                            }
                        } else {
                            console.log(`jingBeanDetail 京东服务器返回空数据`)
                        }
                    }
                } catch (e) {
                    if (epsignurl)
                        $.logErr(e, resp)
                    else
                        console.log("因为没有指定带ep的Sign,获取过期豆子信息次数多了就会失败.")
                } finally {
                    resolve(data);
                }
            })
        }, 0 * 1000);
    })
}

function getepsign(n, o, t = "sign") {
    let e = {
        url: epsignurl,
        form: {
            functionId: n, body: $.toStr(o),
        }, headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    };
    return new Promise(n => {
        $.post(e, async (o, t, e) => {
            try {
                o ? console.log(o) : e = JSON.parse(e)
                if (e.code === 200 && e.data) {
                    n({ body: e.data.convertUrlNew })
                }
            } catch (n) {
                $.logErr(n, t)
            } finally {
                n({ body: e.convertUrlNew })
            }
        })
    })
}

function getSignfromNolan(functionId, body) {
    var strsign = '';
    let data = {
        "fn": functionId,
        "body": body
    }
    return new Promise((resolve) => {
        let url = {
            url: jdSignUrl,
            body: JSON.stringify(data),
            followRedirect: false,
            headers: {
                'Accept': '*/*',
                "accept-encoding": "gzip, deflate, br",
                'Content-Type': 'application/json'
            },
            timeout: 30000
        }
        $.post(url, async (err, resp, data) => {
            try {
                data = JSON.parse(data);
                if (data && data.body) {
                    if (data.body)
                        strsign = data.body || '';
                    if (strsign != '')
                        resolve(strsign);
                    else
                        console.log("签名获取失败.");
                } else {
                    console.log("签名获取失败.");
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(strsign);
            }
        })
    })
}


function redPacket() {
    return new Promise(async resolve => {
        const options = {
            "url": `https://api.m.jd.com/client.action?functionId=myhongbao_getUsableHongBaoList&body=%7B%22appId%22%3A%22appHongBao%22%2C%22appToken%22%3A%22apphongbao_token%22%2C%22platformId%22%3A%22appHongBao%22%2C%22platformToken%22%3A%22apphongbao_token%22%2C%22platform%22%3A%221%22%2C%22orgType%22%3A%222%22%2C%22country%22%3A%22cn%22%2C%22childActivityId%22%3A%22-1%22%2C%22childActiveName%22%3A%22-1%22%2C%22childActivityTime%22%3A%22-1%22%2C%22childActivityUrl%22%3A%22-1%22%2C%22openId%22%3A%22-1%22%2C%22activityArea%22%3A%22-1%22%2C%22applicantErp%22%3A%22-1%22%2C%22eid%22%3A%22-1%22%2C%22fp%22%3A%22-1%22%2C%22shshshfp%22%3A%22-1%22%2C%22shshshfpa%22%3A%22-1%22%2C%22shshshfpb%22%3A%22-1%22%2C%22jda%22%3A%22-1%22%2C%22activityType%22%3A%221%22%2C%22isRvc%22%3A%22-1%22%2C%22pageClickKey%22%3A%22-1%22%2C%22extend%22%3A%22-1%22%2C%22organization%22%3A%22JD%22%7D&appid=JDReactMyRedEnvelope&client=apple&clientVersion=7.0.0`,
            "headers": {
                'Host': 'api.m.jd.com',
                'Accept': '*/*',
                'Connection': 'keep-alive',
                'Accept-Language': 'zh-cn',
                'Referer': 'https://h5.m.jd.com/',
                'Accept-Encoding': 'gzip, deflate, br',
                "Cookie": cookie,
                'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
            }
        }
        $.get(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`redPacket API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        $.jxRed = 0,
                            $.jsRed = 0,
                            $.jdRed = 0,
                            $.jdhRed = 0,
                            $.jdwxRed = 0,
                            $.jdGeneralRed = 0,
                            $.jxRedExpire = 0,
                            $.jsRedExpire = 0,
                            $.jdRedExpire = 0,
                            $.jdhRedExpire = 0;
                        $.jdwxRedExpire = 0,
                            $.jdGeneralRedExpire = 0

                        let t = new Date();
                        t.setDate(t.getDate() + 1);
                        t.setHours(0, 0, 0, 0);
                        t = parseInt((t - 1) / 1000) * 1000;

                        for (let vo of data.hongBaoList || []) {
                            if (vo.orgLimitStr) {
                                if (vo.orgLimitStr.includes("京喜") && !vo.orgLimitStr.includes("特价")) {
                                    $.jxRed += parseFloat(vo.balance)
                                    if (vo['endTime'] === t) {
                                        $.jxRedExpire += parseFloat(vo.balance)
                                    }
                                    continue;
                                } else if (vo.orgLimitStr.includes("购物小程序")) {
                                    $.jdwxRed += parseFloat(vo.balance)
                                    if (vo['endTime'] === t) {
                                        $.jdwxRedExpire += parseFloat(vo.balance)
                                    }
                                    continue;
                                } else if (vo.orgLimitStr.includes("京东商城")) {
                                    $.jdRed += parseFloat(vo.balance)
                                    if (vo['endTime'] === t) {
                                        $.jdRedExpire += parseFloat(vo.balance)
                                    }
                                    continue;
                                } else if (vo.orgLimitStr.includes("极速") || vo.orgLimitStr.includes("京东特价") || vo.orgLimitStr.includes("京喜特价")) {
                                    $.jsRed += parseFloat(vo.balance)
                                    if (vo['endTime'] === t) {
                                        $.jsRedExpire += parseFloat(vo.balance)
                                    }
                                    continue;
                                } else if (vo.orgLimitStr && vo.orgLimitStr.includes("京东健康")) {
                                    $.jdhRed += parseFloat(vo.balance)
                                    if (vo['endTime'] === t) {
                                        $.jdhRedExpire += parseFloat(vo.balance)
                                    }
                                    continue;
                                }
                            }
                            $.jdGeneralRed += parseFloat(vo.balance)
                            if (vo['endTime'] === t) {
                                $.jdGeneralRedExpire += parseFloat(vo.balance)
                            }
                        }

                        $.balance = ($.jxRed + $.jsRed + $.jdRed + $.jdhRed + $.jdwxRed + $.jdGeneralRed).toFixed(2);
                        $.jxRed = $.jxRed.toFixed(2);
                        $.jsRed = $.jsRed.toFixed(2);
                        $.jdRed = $.jdRed.toFixed(2);
                        $.jdhRed = $.jdhRed.toFixed(2);
                        $.jdwxRed = $.jdwxRed.toFixed(2);
                        $.jdGeneralRed = $.jdGeneralRed.toFixed(2);
                        $.expiredBalance = ($.jxRedExpire + $.jsRedExpire + $.jdRedExpire + $.jdhRedExpire + $.jdwxRedExpire + $.jdGeneralRedExpire).toFixed(2);
                        $.message += `【红包总额】${$.balance}(总过期${$.expiredBalance})元 \n`;
                        if ($.jxRed > 0) {
                            if ($.jxRedExpire > 0)
                                $.message += `【京喜红包】${$.jxRed}(将过期${$.jxRedExpire.toFixed(2)})元 \n`;
                            else
                                $.message += `【京喜红包】${$.jxRed}元 \n`;
                        }

                        if ($.jsRed > 0) {
                            if ($.jsRedExpire > 0)
                                $.message += `【京喜特价】${$.jsRed}(将过期${$.jsRedExpire.toFixed(2)})元 \n`;
                            else
                                $.message += `【京喜特价】${$.jsRed}元 \n`;
                        }

                        if ($.jdRed > 0) {
                            if ($.jdRedExpire > 0)
                                $.message += `【京东红包】${$.jdRed}(将过期${$.jdRedExpire.toFixed(2)})元 \n`;
                            else
                                $.message += `【京东红包】${$.jdRed}元 \n`;
                        }

                        if ($.jdhRed > 0) {
                            if ($.jdhRedExpire > 0)
                                $.message += `【健康红包】${$.jdhRed}(将过期${$.jdhRedExpire.toFixed(2)})元 \n`;
                            else
                                $.message += `【健康红包】${$.jdhRed}元 \n`;
                        }

                        if ($.jdwxRed > 0) {
                            if ($.jdwxRedExpire > 0)
                                $.message += `【微信小程序】${$.jdwxRed}(将过期${$.jdwxRedExpire.toFixed(2)})元 \n`;
                            else
                                $.message += `【微信小程序】${$.jdwxRed}元 \n`;
                        }

                        if ($.jdGeneralRed > 0) {
                            if ($.jdGeneralRedExpire > 0)
                                $.message += `【全平台通用】${$.jdGeneralRed}(将过期${$.jdGeneralRedExpire.toFixed(2)})元 \n`;
                            else
                                $.message += `【全平台通用】${$.jdGeneralRed}元 \n`;

                        }

                    } else {
                        console.log(`京东服务器返回空数据`)
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            }
            finally {
                resolve(data);
            }
        })
    })
}

function getCoupon() {
    return new Promise(resolve => {
        let options = {
            url: `https://wq.jd.com/activeapi/queryjdcouponlistwithfinance?state=1&wxadd=1&filterswitch=1&_=${Date.now()}&sceneval=2&g_login_type=1&callback=jsonpCBKB&g_ty=ls`,
            headers: {
                'authority': 'wq.jd.com',
                "User-Agent": $.UA,
                'accept': '*/*',
                'referer': 'https://wqs.jd.com/',
                'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'cookie': cookie
            },
            timeout: 10000
        }
        $.get(options, async (err, resp, data) => {
            try {
                data = JSON.parse(data.match(new RegExp(/jsonpCBK.?\((.*);*/))[1]);
                let couponTitle = '';
                let couponId = '';
                // 删除可使用且非超市、生鲜、京贴;
                let useable = data.coupon.useable;
                $.todayEndTime = new Date(new Date(new Date().getTime()).setHours(23, 59, 59, 999)).getTime();
                $.tomorrowEndTime = new Date(new Date(new Date().getTime() + 24 * 60 * 60 * 1000).setHours(23, 59, 59, 999)).getTime();
                $.platFormInfo = "";
                for (let i = 0; i < useable.length; i++) {
                    //console.log(useable[i]);
                    if (useable[i].limitStr.indexOf('全品类') > -1) {
                        $.beginTime = useable[i].beginTime;
                        if ($.beginTime < new Date().getTime() && useable[i].quota <= 100 && useable[i].coupontype === 1) {
                            //$.couponEndTime = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
                            $.couponName = useable[i].limitStr;
                            if (useable[i].platFormInfo)
                                $.platFormInfo = useable[i].platFormInfo;

                            var decquota = parseFloat(useable[i].quota).toFixed(2);
                            var decdisc = parseFloat(useable[i].discount).toFixed(2);
                            if (useable[i].quota > useable[i].discount + 5 && useable[i].discount < 2)
                                continue
                            $.message += `【全品类券】满${decquota}减${decdisc}元`;

                            if (useable[i].endTime < $.todayEndTime) {
                                $.message += `(今日过期,${$.platFormInfo})\n`;
                            } else if (useable[i].endTime < $.tomorrowEndTime) {
                                $.message += `(明日将过期,${$.platFormInfo})\n`;
                            } else {
                                $.message += `(${$.platFormInfo})\n`;
                            }

                        }
                    }
                    if (useable[i].couponTitle.indexOf('运费券') > -1 && useable[i].limitStr.indexOf('自营商品运费') > -1) {
                        if (!$.YunFeiTitle) {
                            $.YunFeiTitle = useable[i].couponTitle;
                            $.YunFeiQuanEndTime = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
                            $.YunFeiQuan += 1;
                        } else {
                            if ($.YunFeiTitle == useable[i].couponTitle) {
                                $.YunFeiQuanEndTime = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
                                $.YunFeiQuan += 1;
                            } else {
                                if (!$.YunFeiTitle2)
                                    $.YunFeiTitle2 = useable[i].couponTitle;

                                if ($.YunFeiTitle2 == useable[i].couponTitle) {
                                    $.YunFeiQuanEndTime2 = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');
                                    $.YunFeiQuan2 += 1;
                                }
                            }

                        }

                    }
                    if (useable[i].couponTitle.indexOf('特价版APP活动') > -1 && useable[i].limitStr == '仅可购买活动商品') {
                        $.beginTime = useable[i].beginTime;
                        if ($.beginTime < new Date().getTime() && useable[i].coupontype === 1) {
                            if (useable[i].platFormInfo)
                                $.platFormInfo = useable[i].platFormInfo;
                            var decquota = parseFloat(useable[i].quota).toFixed(2);
                            var decdisc = parseFloat(useable[i].discount).toFixed(2);

                            $.message += `【特价版券】满${decquota}减${decdisc}元`;

                            if (useable[i].endTime < $.todayEndTime) {
                                $.message += `(今日过期,${$.platFormInfo})\n`;
                            } else if (useable[i].endTime < $.tomorrowEndTime) {
                                $.message += `(明日将过期,${$.platFormInfo})\n`;
                            } else {
                                $.message += `(${$.platFormInfo})\n`;
                            }

                        }

                    }
                    //8是支付券， 7是白条券
                    if (useable[i].couponStyle == 7 || useable[i].couponStyle == 8) {
                        $.beginTime = useable[i].beginTime;
                        if ($.beginTime > new Date().getTime() || useable[i].quota > 50 || useable[i].coupontype != 1) {
                            continue;
                        }

                        if (useable[i].couponStyle == 8) {
                            $.couponType = "支付立减";
                        } else {
                            $.couponType = "白条优惠";
                        }
                        if (useable[i].discount < useable[i].quota)
                            $.message += `【${$.couponType}】满${useable[i].quota}减${useable[i].discount}元`;
                        else
                            $.message += `【${$.couponType}】立减${useable[i].discount}元`;
                        if (useable[i].platFormInfo)
                            $.platFormInfo = useable[i].platFormInfo;

                        //$.couponEndTime = new Date(parseInt(useable[i].endTime)).Format('yyyy-MM-dd');

                        if (useable[i].endTime < $.todayEndTime) {
                            $.message += `(今日过期,${$.platFormInfo})\n`;
                        } else if (useable[i].endTime < $.tomorrowEndTime) {
                            $.message += `(明日将过期,${$.platFormInfo})\n`;
                        } else {
                            $.message += `(${$.platFormInfo})\n`;
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            }
            finally {
                resolve();
            }
        })
    })
}

function jdfruitRequest(function_id, body = {}, timeout = 1000) {
    return new Promise(resolve => {
        setTimeout(() => {
            $.get(taskfruitUrl(function_id, body), (err, resp, data) => {
                try {
                    if (err) {
                        console.log('\n老农场: API查询请求失败 ‼️‼️')
                        console.log(JSON.stringify(err));
                        console.log(`function_id:${function_id}`)
                        $.logErr(err);
                    } else {
                        if (safeGet(data)) {
                            data = JSON.parse(data);
                            if (data.code == "400") {
                                console.log('老农场: ' + data.message);
                                llgeterror = true;
                            }
                            else
                                $.JDwaterEveryDayT = data.firstWaterInit.totalWaterTimes;
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                }
                finally {
                    resolve(data);
                }
            })
        }, timeout)
    })
}

async function getjdfruitinfo() {
    if (EnableJdFruit) {
        llgeterror = false;

        //await jdfruitRequest('taskInitForFarm', {
        //    "version": 14,
        //    "channel": 1,
        //    "babelChannel": "120"
        //});
        //
        //if (llgeterror)
        //	return
        //
        await fruitinfo();
        if (llgeterror) {
            console.log(`老农场API查询失败,等待10秒后再次尝试...`)
            await $.wait(10 * 1000);
            await fruitinfo();
        }
        if (llgeterror) {
            console.log(`老农场API查询失败,有空重启路由器换个IP吧.`)
        }

    }
    return;
}

async function getjdfruit() {
    return new Promise(resolve => {
        const option = {
            url: `${JD_API_HOST}?functionId=initForFarm`,
            body: `body=${escape(JSON.stringify({ "version": 4 }))}&appid=wh5&clientVersion=9.1.0`,
            headers: {
                "accept": "*/*",
                "accept-encoding": "gzip, deflate, br",
                "accept-language": "zh-CN,zh;q=0.9",
                "cache-control": "no-cache",
                "cookie": cookie,
                "origin": "https://home.m.jd.com",
                "pragma": "no-cache",
                "referer": "https://home.m.jd.com/myJd/newhome.action",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
                "Content-Type": "application/x-www-form-urlencoded"
            },
            timeout: 10000
        };
        $.post(option, (err, resp, data) => {
            try {
                if (err) {
                    if (!llgeterror) {
                        console.log('\n老农场: API查询请求失败 ‼️‼️');
                        console.log(JSON.stringify(err));
                    }
                    llgeterror = true;
                } else {
                    llgeterror = false;
                    if (safeGet(data)) {
                        $.farmInfo = JSON.parse(data)
                        if ($.farmInfo.farmUserPro) {
                            $.JdFarmProdName = $.farmInfo.farmUserPro.name;
                            $.JdtreeEnergy = $.farmInfo.farmUserPro.treeEnergy;
                            $.JdtreeTotalEnergy = $.farmInfo.farmUserPro.treeTotalEnergy;
                            $.treeState = $.farmInfo.treeState;
                            let waterEveryDayT = $.JDwaterEveryDayT;
                            let waterTotalT = ($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy) / 10; //一共还需浇多少次水
                            let waterD = Math.ceil(waterTotalT / waterEveryDayT);

                            $.JdwaterTotalT = waterTotalT;
                            $.JdwaterD = waterD;
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            }
            finally {
                resolve();
            }
        })
    })
}

function taskfruitUrl(function_id, body = {}) {
    return {
        url: `${JD_API_HOST}?functionId=${function_id}&body=${encodeURIComponent(JSON.stringify(body))}&appid=wh5`,
        headers: {
            "Host": "api.m.jd.com",
            "Accept": "*/*",
            "Origin": "https://carry.m.jd.com",
            "Accept-Encoding": "gzip, deflate, br",
            "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
            "Referer": "https://carry.m.jd.com/",
            "Cookie": cookie
        },
        timeout: 10000
    }
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

function cash() {
    if (!EnableJdSpeed)
        return;
    return new Promise(resolve => {
        $.get(taskcashUrl('MyAssetsService.execute', {
            "method": "userCashRecord",
            "data": {
                "channel": 1,
                "pageNum": 1,
                "pageSize": 20
            }
        }),
            async (err, resp, data) => {
                try {
                    if (err) {
                        console.log(`${JSON.stringify(err)}`)
                        console.log(`cash API请求失败，请检查网路重试`)
                    } else {
                        if (safeGet(data)) {
                            data = JSON.parse(data);
                            if (data.data.goldBalance)
                                $.JDtotalcash = data.data.goldBalance;
                            else
                                console.log(`领现金查询失败，服务器没有返回具体值.`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp)
                }
                finally {
                    resolve(data);
                }
            })
    })
}

function taskcashUrl(functionId, body = {}) {
    const struuid = randomString(16);
    let nowTime = Date.now();
    let _0x7683x5 = `${"lite-android&"}${JSON["stringify"](body)}${"&android&3.1.0&"}${functionId}&${nowTime}&${struuid}`;
    let _0x7683x6 = "12aea658f76e453faf803d15c40a72e0";
    const _0x7683x7 = $["isNode"]() ? require("crypto-js") : CryptoJS;
    let sign = _0x7683x7.HmacSHA256(_0x7683x5, _0x7683x6).toString();
    let strurl = JD_API_HOST + "api?functionId=" + functionId + "&body=" + `${escape(JSON["stringify"](body))}&appid=lite-android&client=android&uuid=` + struuid + `&clientVersion=3.1.0&t=${nowTime}&sign=${sign}`;
    return {
        url: strurl,
        headers: {
            'Host': "api.m.jd.com",
            'accept': "*/*",
            'kernelplatform': "RN",
            'user-agent': "JDMobileLite/3.1.0 (iPad; iOS 14.4; Scale/2.00)",
            'accept-language': "zh-Hans-CN;q=1, ja-CN;q=0.9",
            'Cookie': cookie
        },
        timeout: 10000
    }
}

function GetJoyRuninginfo() {
    if (!EnableJoyRun)
        return;

    const headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        "Connection": "keep-alive",
        "Content-Length": "376",
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": cookie,
        "Host": "api.m.jd.com",
        "Origin": "https://h5platform.jd.com",
        "Referer": "https://h5platform.jd.com/",
        "User-Agent": `jdpingou;iPhone;4.13.0;14.4.2;${randomString(40)};network/wifi;model/iPhone10,2;appBuild/100609;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/1;hasOCPay/0;supportBestPay/0;session/${Math.random * 98 + 1};pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
    }
    var DateToday = new Date();
    const body = {
        'linkId': 'L-sOanK_5RJCz7I314FpnQ',
        'isFromJoyPark': true,
        'joyLinkId': 'LsQNxL7iWDlXUs6cFl-AAg'
    };
    const options = {
        url: `https://api.m.jd.com/?functionId=runningPageHome&body=${encodeURIComponent(JSON.stringify(body))}&t=${DateToday.getTime()}&appid=activities_platform&client=ios&clientVersion=3.9.2`,
        headers,
    }
    return new Promise(resolve => {
        $.get(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`GetJoyRuninginfo API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        //console.log(data);
                        data = JSON.parse(data);
                        if (data.data.runningHomeInfo.prizeValue) {
                            $.JoyRunningAmount = data.data.runningHomeInfo.prizeValue * 1;
                        }
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            }
            finally {
                resolve(data)
            }
        })
    })
}

function randomString(e) {
    e = e || 32;
    let t = "0123456789abcdef",
        a = t.length,
        n = "";
    for (let i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
}

Date.prototype.Format = function (fmt) {
    var e,
        n = this,
        d = fmt,
        l = {
            "M+": n.getMonth() + 1,
            "d+": n.getDate(),
            "D+": n.getDate(),
            "h+": n.getHours(),
            "H+": n.getHours(),
            "m+": n.getMinutes(),
            "s+": n.getSeconds(),
            "w+": n.getDay(),
            "q+": Math.floor((n.getMonth() + 3) / 3),
            "S+": n.getMilliseconds()
        };
    /(y+)/i.test(d) && (d = d.replace(RegExp.$1, "".concat(n.getFullYear()).substr(4 - RegExp.$1.length)));
    for (var k in l) {
        if (new RegExp("(".concat(k, ")")).test(d)) {
            var t,
                a = "S+" === k ? "000" : "00";
            d = d.replace(RegExp.$1, 1 == RegExp.$1.length ? l[k] : ("".concat(a) + l[k]).substr("".concat(l[k]).length))
        }
    }
    return d;
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
function timeFormat(time) {
    let date;
    if (time) {
        date = new Date(time)
    } else {
        date = new Date();
    }
    return date.getFullYear() + '-' + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + (date.getDate() >= 10 ? date.getDate() : '0' + date.getDate());
}


function GetDateTime(date) {

    var timeString = "";

    var timeString = date.getFullYear() + "-";
    if ((date.getMonth() + 1) < 10)
        timeString += "0" + (date.getMonth() + 1) + "-";
    else
        timeString += (date.getMonth() + 1) + "-";

    if ((date.getDate()) < 10)
        timeString += "0" + date.getDate() + " ";
    else
        timeString += date.getDate() + " ";

    if ((date.getHours()) < 10)
        timeString += "0" + date.getHours() + ":";
    else
        timeString += date.getHours() + ":";

    if ((date.getMinutes()) < 10)
        timeString += "0" + date.getMinutes() + ":";
    else
        timeString += date.getMinutes() + ":";

    if ((date.getSeconds()) < 10)
        timeString += "0" + date.getSeconds();
    else
        timeString += date.getSeconds();

    return timeString;
}

async function getuserinfo() {
    var body = [{ "pin": "$cooMrdGatewayUid$" }];
    var ua = `jdapp;iPhone;${random(["11.1.0", "10.5.0", "10.3.6"])};${random(["13.5", "14.0", "15.0"])};${uuidRandom()};network/wifi;supportApplePay/0;hasUPPay/0;hasOCPay/0;model/iPhone11,6;addressid/7565095847;supportBestPay/0;appBuild/167541;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1`;

    let config = {
        url: 'https://lop-proxy.jd.com/JingIntegralApi/userAccount',
        body: JSON.stringify(body),
        headers: {
            "host": "lop-proxy.jd.com",
            "jexpress-report-time": Date.now().toString(),
            "access": "H5",
            "source-client": "2",
            "accept": "application/json, text/plain, */*",
            "d_model": "iPhone11,6",
            "accept-encoding": "gzip",
            "lop-dn": "jingcai.jd.com",
            "user-agent": ua,
            "partner": "",
            "screen": "375*812",
            "cookie": cookie,
            "x-requested-with": "XMLHttpRequest",
            "version": "1.0.0",
            "uuid": randomNumber(10),
            "clientinfo": "{\"appName\":\"jingcai\",\"client\":\"m\"}",
            "d_brand": "iPhone",
            "appparams": "{\"appid\":158,\"ticket_type\":\"m\"}",
            "sdkversion": "1.0.7",
            "area": area(),
            "client": "iOS",
            "referer": "https://jingcai-h5.jd.com/",
            "eid": "",
            "osversion": random(["13.5", "14.0", "15.0"]),
            "networktype": "wifi",
            "jexpress-trace-id": uuid(),
            "origin": "https://jingcai-h5.jd.com",
            "app-key": "jexpress",
            "event-id": uuid(),
            "clientversion": random(["11.1.0", "10.5.0", "10.3.6"]),
            "content-type": "application/json;charset=utf-8",
            "build": "167541",
            "biz-type": "service-monitor",
            "forcebot": "0"
        }
    }
    return new Promise(resolve => {
        $.post(config, async (err, resp, data) => {
            try {
                //console.log(data)
                if (err) {
                    console.log(err)
                } else {
                    data = JSON.parse(data);
                }
            } catch (e) {
                $.logErr(e, resp)
            }
            finally {
                resolve(data || '');
            }
        })
    })
}
function dwappinfo() {
    let ts = Date.now();
    let opt = {
        url: `https://dwapp.jd.com/user/dwSignInfo`,
        body: JSON.stringify({ "t": ts, "channelSource": "txzs", "encStr": CR.MD5(ts + 'e9c398ffcb2d4824b4d0a703e38yffdd').toString() }),
        headers: {
            'Origin': 'https://txsm-m.jd.com',
            'Content-Type': 'application/json',
            'User-Agent': $.UA,
            'Cookie': cookie
        }
    }
    return new Promise(async (resolve) => {
        $.post(opt, async (err, resp, data) => {
            let ccc = '';
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`dwappinfo 请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data);
                    if (data.code == 200) {
                        ccc = data.data.balanceNum;
                    } else {
                        console.log(data.msg);
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(ccc);
            }
        })
    })
}
function dwappexpire() {
    let opt = {
        url: `https://api.m.jd.com/api?functionId=DATAWALLET_USER_QUERY_EXPIRED_SCORE&appid=h5-sep&body=%7B%22expireDayNum%22%3A7%7D&client=m&clientVersion=6.0.0`,
        headers: {
			'Origin':'https://prodev.m.jd.com',
            'User-Agent': $.UA,
            'Cookie': cookie
        }
    }
    return new Promise(async (resolve) => {
        $.post(opt, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`dwappexpire 请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data)
                    if (data.code == 200) {
                        data = data.data.expireNum;
						
                    } else {
                        //console.log(data.msg);
                        data = '';
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(data);
            }
        })
    })
}

function getek() {
    let opt = {
        url: `https://mygiftcard.jd.com/giftcard/queryChannelUserCard`,
        //body: `appid=wh5&clientVersion=1.0.0&functionId=wanrentuan_superise_send&body={"channel":2}&area=2_2813_61130_0`,
        headers: {
            //'Host': 'api.m.jd.com',
            'Origin': 'https://o.jd.com',
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': $.UA,
            'Cookie': cookie
        }
    }
    return new Promise(async (resolve) => {
        $.get(opt, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`getek请求失败!!!!`)
                } else {
                    data = JSON.parse(data)
                    if (data.code == 000000) {
                        $.ECardinfo = Number(data.data.totalAmount);
                    } else {
                        console.log(data.msg)
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve(data)
            }
        })
    })
}
function marketCard() {
    let opt = {
        url: `https://api.m.jd.com/atop_channel_marketCard_cardInfo`,
        body: `appid=jd-super-market&t=${Date.now()}&functionId=atop_channel_marketCard_cardInfo&client=m&uuid=&body=%7B%22babelChannel%22%3A%22ttt9%22%2C%22isJdApp%22%3A%221%22%2C%22isWx%22%3A%220%22%7D`,
        headers: {
            'Origin': 'https://pro.m.jd.com',
            'User-Agent': $.UA,
            'Cookie': cookie
        }
    }
    let carddata = '';
    return new Promise(async (resolve) => {
        $.post(opt, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`marketCard 请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data)
                    if (data.success) {
                        carddata = data.data?.floorData?.items ? data.data?.floorData?.items[0].marketCardVO : '';
                    } else {
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(carddata);
            }
        })
    })
}
function newfarm_info() {
    let opt = {
        url: `https://api.m.jd.com/client.action`,
        body: `appid=signed_wh5&client=android&clientVersion=12.4.2&screen=393*0&wqDefault=false&build=99108&osVersion=12&t=${Date.now()}&body={"version":1,"type":1}&functionId=farm_award_detail`,
        headers: {
            'Origin': 'https://h5.m.jd.com',
            'User-Agent': $.UA,
            'Cookie': cookie
        }
    }
    return new Promise(async (resolve) => {
        $.post(opt, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`newfarm_info 请求失败，请检查网路重试`)
                } else {
                    
                    data = JSON.parse(data);
                    if (data.data.success) {
                        if (data.data.result.plantAwards && data.data.result.plantAwards.length > 0){
                            for (let i of  data.data.result.plantAwards ){
                                if (i.awardStatus == 1){
                                    $.newfarm_info = `${i.skuName} -> ${i.exchangeRemind}`;
                                }
                            }
                        }
                    } else {
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}

function area() {
    let i = getRand(1, 30)
    let o = getRand(70, 3000)
    let x = getRand(900, 60000)
    let g = getRand(600, 30000)
    let a = i + '_' + o + '_' + x + '_' + g;
    return a
};
function getRand(min, max) {
    return parseInt(Math.random() * (max - min)) + min;
};
function uuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = "-";
    var uuid = s.join("");
    return uuid;
};
function uuidRandom() {
    return Math.random().toString(16).slice(2, 10) +
        Math.random().toString(16).slice(2, 10) +
        Math.random().toString(16).slice(2, 10) +
        Math.random().toString(16).slice(2, 10) +
        Math.random().toString(16).slice(2, 10);
}
function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function randomNumber(len) {
    let chars = '0123456789';
    let maxPos = chars.length;
    let str = '';
    for (let i = 0; i < len; i++) {
        str += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return Date.now() + str;
}
function fuck_0x24de(){const _0x27a799=['W5jmWONdMN4','W7/dPgbGWPO','WQ5eW63dImks','WPxcRZToEa','WP04WRBdSqi','lCkkW57dNSo6','W67cJgj7W5O','WOTbDfn1','WOi5WRJdIt0','sSkgW6ZcKKa','WO3dT0BdVh4','WRBcRXjzzW','WRrmW7i6WR8','W5DBjmkhW64','WQ8do8kPWQJdQLj9D8kqW7ddHW','ENlcTCkftbldMmkh','lSkiWP/dI13dUG','WQVcSCoAamoA','qmkZtmoNimovW5tcQa','pmkTWOJcGHBcPsZdOsJdUCkX','aCkmfmoMsf0','cSojB23cHa','WRRcVJ/dRCoN','WR3cLCoPf8o5','WQJdTeZdQ1K','zCkgtSougW','W5nNkI8m','hCkGWRrzla','rCkQFfVdSa','W4nyvmoKW6q','W4zHmdSs','WRdcMZb9xa','WQ9kWQWpW5G','W5PMn8ozBa','imo6WQpdMdi','j1/cHSo7WQK','kKdcKq','5PAn5yw85zY85P+o6k2G5Asi6lsd','pSoDAsdcVbK','kmo/AwRcPq','WQddHSoXy8oUW7KdW4ZcTmo6iCoe','WP3cH8oAfq','l8kiWO3dJfldPG','WRS8WPyJtG','xCobW7tdMaxcIwddONrDENRdMCkjW5JdQG','W5KNdmoyWORcTgjajd7dOK4BW4NdKCobWQJcL8o5qmoUj8o8WPdcHq4UWRBcJ8kncCoNWRFcUW','WOTbW4ZdTa','WRzuW6m/WQG','FCkNWQ9VW5e','F8kOCupdTW','W47cQvL7W44','W7aQuwJcQa','D8kzWPPaWQ4','W6JcJhrTza','W5bBymoaW4C','WQtdJqNdGmoa','gmkbW5ZdQa','zSk7WPzmWQ8','WO3cG8oDaa','z8kzvL3dIW','W6fCvCoxW4q','dSkdWQ/cOcu','W6qaWPNdLmo2WOqXW5HZW5OtsSorumkgW6lcGW','FmkDAbdcOaJdTmkAvveCWPxcJrJcPmkKW4e','oSoMWRLVW4VcUmkzW5BcUCkJb8oSWQ0LrCoAW54','W6ldGgT1WPO','dCoGWQFdPqy','A8oHW6JdIbG','WP8TWOzOW73cRq','W7RdOeXHW5HWWRZcHdTj','W4HzESoGW6RcRq','WOjfCe9/WRJcR8ozW6jfWPJdQbK8W6BdPCkqkcSvWPxcOx7dHq','WRpcPaDFz8oUWOy','WQ/dIZRdMCoaF8kRWRZcTNpcVmkmcHq/DmkEW5JcUI8opuqaW5W','W4/cUKL5jePiW7X9WQf0eCoWEr3dPSoRWRPHW6HSWO8JWRCFW5SGsmopW7u2WRiW','WQtcGsVdVSoHWP4zaI8MW4HHFmk+W7tcIGNcQmo9BsfbqLNdMCkBW5yIW61KlmoLpmoCsmkIsCosW4ZcRv7cUSkwv8kde0lcQtJcR8kxDSkiWRiUW6nozu7cUCon','WQNdKdK','omkJWPbJWOmStbn0W73dK1CaW6NcJGW6WQFcQCk+zmoKlaCVcmkZj8k1sWpdHCoFWRZcV8oYnZFcSLXujmkPW6pcGGpdTwZdG8oli8o0W6BdJeJdJSoXW54/oaDAyLZcJ37dMHddLrRcSCksWPtdTSkAW5SZWPanWORcVxTjWRDuzL88mSoxseZdGSkUWPpdVSkgmCkDd8kRWPRdQqL/WOtdQZTyW7FcKmkQWO4JW4FdLSk2W5O/WRLUWPhcTSkeW6RdQxWnc8kgWOy9W6ZcP8k/kSkLW4NdMZOYW67dRmomW7PydLbwu8kmo8kKW5tcGSk/fSkUrmoSfdqOzSo8zmkdWPhdJeRdICo6WOiPsSkMWPPoW5NcTmoRfmoIWRBcUc/cH27cVaRdNCk6W7LuW7ZdR8o4sGlcR3KSvSkiaSoFWQiYz8kbACofBmotAmkBFCoRWQRdRmkFsZmbygpdTSouWQJcGLfnawVcPKtdJCk6DmkjumkNWRVcLa5XCCo/fZLjz8kHW5xdP03cTf97o1pdS3H/W5xcRfJcPmo9W60cW5ZdNrxcSmk0gaL/tstdS3LRWPpdMuHRW73dQ8k6v8oyC8ktx1JcTCociSk/WQpdSSomW4CjWOZcS8kfvvCkgLNdRbSNy1ffWO/dPmkbW7FdRXSildyEWQTxW4CiWO8crWdcL0WOiSkiCSogv8o4W5Tra0FdPc8pzSkSW7pcGIi','W7xcS1PVW4W','WRXaWQZdMmon','e8ohWRhdVZG','zCkhl2JcVq','e8oUA3VcMq','jSo0tW3cTa','tSkcs03dGW','WRhcLGJdU8ou','l8kTWPxcHq','lCk7WRBdLLS','mCoCWPVdMY4','WPK3WP7dTGO','W6NcMwrFW77dIN3dTSkXtN9K','FSkqW5hcGa','W7voymoYW6/cTW','aSkvWPO','aCkDb8o9rvjojxi','wmkZEa','WP4MxuhdOSk4WPXKW7VcJSk4mXGsWO7ORj3MSyVLPjdOTA3VVkNORRtMOzFMNkFNVkBOTPJPHO/ORju','WQHlWQaSW6y','W4a4yxdcVG','W49LpSkuW7ldTYSrEq','p8otEGBcPG','WRr6WQWAW5W','WQxdMI/dH8oWkSoXW73cQG','WReJWP1GW7W','W5rcWQNdTuq','CmkMWPXVWQqJDq8','y3ZcKSksvG','W6HTjmkqW4i','W5b/nCkbW6tdVYCA','y1VdICoXW5KIW4/cKsG','iSoEEXBcMXJdPCkbEf5aWPtcVrRcO8kL','W6RcHxvYW6VdNwS','W47cV0f/W68','omoCWPxdKXO','W55fWQtdGwi','W6pcHhzZW7JdLG','W6LJnW','WOdKUlxKUyBLHi7LNiCOW4jJDMlMNPpOR6hOROpMSBFLPQtOTRHa4Oo277Qa4OkO77Qs','amklW4G','WQziW7a/WQJcOwHjWRa','WQJcSdHtta','aapcGmk6jG','WPpdLGddNmoC','W5XfeSoFBW','d8kYWPjopq','y8kGWRf+W6BcTmkdW4VcPmkIrmoxWQu8qCogW4HqgMLJWQjpwSoD','W47cVhbvW7G','zmkLWQPPW7RcUCkyW4ZcV8kJtCo7WQC','W67cM2f/W64','WQxcIx3dJ8ov','be7cLCoCWR0','W4xcOvLW','dCkuW4BdUa','WOf0nCkXWQ8','WR9CWPRdKW','W4zzoJW','j0JcOvy6WOr/','WReqWP0rzCk6','WP7dKeFdUWzidgDfvG','pmkFWPTzbmk5W6u','Fmk9WQTQW5BdOCocWPdcPSkHxCo7W7OKcSoEW5uTgML8W6HIrCklWQ50W49DW6qevCkqfCkOW5LsWPGHWRe','ACkNbq','lLVcGSoNWQnEWRxcSezjkCkkW5Gxu8o5WOTJg8krW7FdLmk9amoz','WOhcOLjUDWSZW6r9WQ1NtSo4FXBcR8oHWRTBWPznWOOWW68','DSkQWP5GWO8WAW','WPjaW5BdTa','WQrMCKvH','W7bcuuBdVq','W69er8olW4O','WOe5WRJdIsy','x8kmW7pcLCoz','W4dcJvrEtW','WRztW6yZ','W49LBN3dR8oiWQT2WQq1WQ1Vzmog','B8kcW4dcK3WpimkWW4xcP8kbW7ldHKldT8o2mYFcPW','nelcOvu5WRnLf8oinG','nmoXFa','B8kHg0/cL8kUAcWc','W4pdVe4','W4jUW7xdIEIST+AYJ+wNQoI2Q++9IUISQ+AGV+ADR+E9JUI0K+MgNEITMW','W6LJn8k2W5JdRa','dmo3vwZcRW','W7VdUMDMWPO','WOnFW5xdRmk5','weNcKCk8vq','W4HbWRRdVuG','WRyziG','WQddHsFdMCkFzCoGW7BcUgRcTmkbgLLXomkb','WPOlWOykF8oLW6HKW7pcJLBcH8o0gq1zWRtdJSo7qYeAW44','m8ocFGNcPWJdOCkhu1bDW57cJfNcSSk9W4aouSohW4u5u8kPW5xdKuBdPYnDkb7dQq','eSo4A37cRq','CCkZa2lcSa','WO/KUjdKUyZLHA/LNPdcPgO+tIZMNABOROhORPBMS4RLP43OTR7dL+kcJ++6Q+kaP++7Kq','lmkXWOhcNcW','W6zGcCk6W4m','WROxWPXNW5y','W5rzpt8m','CSkOWQ13W6ZcTCklW5a','W69OAx3dVG','ie7cHmo6WPKkW7ZdSa','ie7cHmo6WOuxW7/dRxDllW','fCkMWQdcKbdcUGNdSdpdSSknFqK9','gSkgWQP5baxcLmkP','WOXqDLjzW7hdPCkeW5PcWP4','pmotyWa','WPn/WQWlW5fSjez/usNdGG','xCovW6JdLJJcJMNdOW','AhZcLmkCAWJdK8ksW4tdHmoo','WRBcHIddUmoqWPKthGe7','WPyMWP1XW7hcRCkZqmowdmoguWn9W7v4W4y','w8kbDeBdL0PdEW7dGYa','WRrrmCk3WOKUfMxdK8khWPG1EmoCFq','WQ1PWR0CW6D9afX/','W4NdSLT+WRXFWR3cJG','cSkfW53dSCoHsmonhCoMWRH3','WO0XtfhdGSkPWO95W7a','W5NdTLTGWPXEWRu','d8kmW47dSSoAxSoe','W4DxpdWmWOebcfuFW7n9','WQGPWOf1W4W','WPxcH8oA','yNpcGq','W4rvptWqWRy','rmovW5C','W4BcRv5SBHfkW7HJWQS1gmk3Fr4','eCkHWPZcTda','WPJcHConeCoUW55aFhldU1iiwCoQWRa','hsJdHmkUoufRoCoKW7a2W5pcVSoY','v8kZCmo4o8oz','pCoazWlcPWu','W6NcM3PXxq','dSkcWR5XpW7cGa','WQjBWOVdKCoRW51QWP5/W5voxmoreSkkWQlcNSk2DmosFXlcUG','WQZcLColbSkZW6SkDx3dOq','WOxdM8oQFSo/W7KsWPBcICoTn8oo','WQldTLddG0O','WONcTrvkzSkXW5VdHSkoWR0dW4WAWR/cKCoAW6DaW57cICk+AH9rdbzqW4xcSheOW5VdVYaOuNRdIwddUSoaDdtcQt0idtFdOSoNrCk+DW','i8oLWRFdJxy','WRnxjSk7WRmMc2ldHG','oSk0gvBcKmkTpd0tW4G','BSkGWOXW','WR5AW6SXWO4','pCk+W7VdNq','vgFcV8kjAW','W4bAxmoZW6i','W49trSoHW6y','ECkEW4VcKLSeo8kNW5NcRCka','cmkbW43dQq','WQfjWPBdHSoq','tSkDW7hcISof','W6X9ENRdVSoOWR19WQ0fWRO','W6pcHhy','ySk0v8oDaq','zKFdVG','WQPVWQOqW5PUce5J','l8oAWQldRsK','W59cWQ/dU2uCWOWd','l8kJWPtcGGC','sCkmW7pcI8o1F8ksCW','W4hcR09KsXycW69DWRO1','nSkdWP51pWBcOSk0FmoZBCkKpCk5','W6nTiSkEW7/dRs8ntHFdRa','WQJdLCoPBW','WQbvCe1PW6FdHCkyW69cWPBdQa','W7LOAwpdKSojWRL4','W7LOAwpdJSouWRPLWPGuWQe','W41rWRJdS2KCWO8ExvW','emk9W6RdNCkiWOyDhNSEsIrIFHDWeW','WROJWPTUW4hcU8kcxCoYh8of','sCksy07dLLzsAdldTchcJSonFhK','W41rWRJdS38gWOSyxW','ESk0g0VcSmkNzYu','WQtcLtFdSmoaWOqthJyWWPO','WPzDW4ddPCktWRNcUmo6iW','WRLtW6utWRtcTa','WOhdIfhdSeq','WQOyWQpdLru','WRmPBL3dNW','bCklW5W','wmogxW','WRq2WP1ZW6FdSSoiamokwmkeE0nYW6mXW5ZdISkaWOO','WO8Mw0FdUmkYWOa','F8oGxKddJW','WPqEWOaxu8k3WQGMW7u','h8knW4JdSSorx8o3gmoEW78','lmkYWORcMby','Amkxm0RcSW','ESkEW6tcLmoYCmkzEq','W6boz8oLW6ZcPWa','WOHmj8kM','WR0YWOaTW7NdPSkns8kmdSofEW','W6BcRv5SBHe','W4PcesGA','WPzPWReEW51N','u8oaW67dIWldMIdcOZXccd/dL8ojW6ddRt4kW78','WORdGehdRfT9rKDfqs3cSuzoFG','jSoWWRRdHgDBWOXrlSo5lmkmiSowW4hdMSoD','mJpcJmkFwIX2nmkXW7u','m8kkfSoXw0ekd2OEW6ldJMFdOSku','peFdM8ouWP5iW6ddTWPXiCokW4ycsmkGWPuUtq','we3dV8o4W540W6S','cG/cRCkbaq','WOJdJe3dOKjS','WOZcLmoc','fmkcWRLWkbNcGq','WRldNCoPB8o1W6is','W4Ksy0VcHa','W5DJnSkyW7S','WRhdQxddNfW','WP7cRSoEaSoP','W6rpnCkQW5i','pCktW4VdICkR','amkmW6JdTSk4','WOJdKSoSzSo7','j0JcOq','WRDHW6ZdHCkA','s8kfW73cSvu','WRurWQHxW7O','kSk4W6ZdNmki','WR8TWO1M','vmktvKFdT0PWyc4','lCkbWOVdIMVdOCoskhGNW6SIWO7dK2f9','WQ9bWPVdPCo5WP42','WRJcRXrjrW','rLFcGSk/sG','fCkNWPRdT0O','WOzEyW','5PET5ywX5z+e5P2C6k+C5AAJ6lAs','W50hFMdcNNS','WRPoWO3dKSo9','W59rWQJdV1GCWO8Bu0VdIsi','pSk4W6RdJG','W4mnALdcGh0','lmkEWPPEiG','WRG1t1JdNW','WPxdRSo1r8o0','CSkGWPHbWPGW','W41cFCoGW5VcQHG6oW','W4HxkJOi','WODqCfXK','WQHkWP7dJ8oBWOGWW59O','WOq3WPJdPGC','k07cGSo0WRG','keBcLCo8WP4fW7FdUG','h8kiaCo3qW','WQVdLCoWACoY','W5jyDSo1W43cOHqX','WRiHWQvKW74','W4LncmkcW7W','k8kGhSowzG','WQfGBgH1','BCknxCoCfG','WPldIMddGgi','k8kMWOjxnW','q8k2r8olggOthd4VWRpdPd7dMSoiW4/cVCkGzZtdKW','ECk5W6NcLuq','W7RdVbtdLHXwuG','WQ3dNSojxSoV','WOpdT1jCCW','WO1wWRikW4q','B8kcW4dcK3ark8kWW7JcSCkxW6NdTuNdGSo6aYpdSa','pCkjWQTHbW','WPPDCuXtW6ddTCkfW6nEWPtdOH8','WRnXW5q/WQS','bSkoWOLmbCoMWRJcVIOWW7r/WPtdQYLHhCoiW5RdGhq','dCkvWPnie8kYW6pdHsmSW6q','WQ4cC3FdQW','dCkoWRXN','WQLNWRpdLCoZ','pmkQWOpcKGNcMZZdTdNdUG','WQpcHdxdLmoX','D8k/jhlcJa','ACkTBfJdSG','W4DzoIa','iv3cVfa','b8kAemoM','b8obAXFcGaRdRCkw','pmkTWOlcLa','WOvkW5hdOSkVWQNcOa','fv7cSez4WQfHhCoujW','WOtdKchdGSoAia','CSksB0ZdQ1C','WQddUCosy8o3','lSkcWR5XpW7cGa','mSkTW6RdN8kEW5LMxN8tuXiIDKT9dSocqSoJpmkq','W7b+pa','bSkoWOLmbCoMWRJcVJSSW6GIW5FcQg1Vv8kfW5BdGJBdS8kKWPiUmbxdJCkhq3JcSmkAW5VcHJTmWQWOa8kXECoLqmo0CghdP8oVa8oJWR9xDSkz','WQtdM8oGCW','WOPkW4tdPmkLWR/cQG','WQvtW7eI','mGRcOCkcfG','WR4+WQOlwG','WP5TW6ObWR8','DSkKW6RcPmoX','WRLtW6u','W6X9AwFdTCoaWRzXWRe','hSkgeG','tSk7WQ116k6b5RkE5AAM6lA0772w6k6R5Qgb5P+P57+R6lwP6yEk6k+E','WQ0hWO5PW7e','nCk1W63dK8oW','W7/cIMnfW68','kmo5WOpdMd4iWR5Doa','WOKVxeFdHmkUWOT/W5FcICkKcwCyWPhcHq','WODbW4hdHmkHWRtcQG','W4zzmcOuWRaCcK8EW6q','WPvhW4ZdRmkLW63dSCo6nmkPWPRcOZ/cHY0','W755A2ldOG','WQLaWORdJ8oSWOi3','WQZcRmoMg8o/','o8kyWPddMKRdU8oynbPSW4rVW6FcL1S7','WPFcIh7cOGSJqZ0rEspdUfvHnmkkWO3dG8oErmkqWQZdVHf1WPZdUvOUWQD4W4yetq','kmoKWRRdGa','k8kNWPxcHq','W6TUWPZdKMC','W6rdCSoUW60','WR/dHLhdVq','WQHxWRddUmoE','WOJcRXfpyq','WOBdPfFdRxO','yNlcGCk0taK','c8oXF3hcMG','ACkNWPzOWO9Imb52W63cI0WgW77cNa','wmoBW6/dLqxcHx0','W50nD0lcMge','WQpdMIZdNa','W5HVWOVdRN8','WQhdIIddISohlmoRW73dVIZcICoDx18nCW','WQVcMIZdQq','xutdR8ooW4G','kSkTWQZcHHi','WOnHhSk/WPe','WPhcMYhdTCop','W6hcVevVW40','EmkMWRHFW5FcQq','EvZdQ8o0W4i2','WQnmoSkHWQKZf2FdI8kTWOq','iw/cPvyE','F8k/WO9OWPm','ECkkW7pcGmoe','WOjqW7qfWQi','W5jnFSoxW4q','WRTPq0vP','WQVcOXzJrG','oCk1WOxcSHm','lu7cGSopWQe','WPiIxwZdOa','WRhdTItdV8oa','bSoYW4lcHmonW4LHtJuKr0X2wKHnnCoiFmoxyCksWQffWOzuAmkMeCkRnsJdQSk0','t8kskK7cLG','W4FdH31LWRG','WQ1+WQSn','W5j6pCo3AG','dCksWPXvga','WQGNWPP3','W65fy8oYW7C','W6arC0hcQa','D8kMWRfPW5hcQCkyW5ZcOSkIwG','d8kvWOHbaG','tCkYW6lcPg0','WQ1iWPRdKW','WPOIrvG','xmkdCKldRvC','i0lcU0CHWPjZg8oopai','D8kfWRf1W5m','W6fPmSkg','WQxcKYddRW','W6r8imkFW5m','WRJdL0pdVu5gcwHoqty','W4HIhb0y','WQddJ03dM2y','W6Xagmk1W5a'];fuck_0x24de=function(){return _0x27a799;};return fuck_0x24de();}const fuck_0x3da277=fuck_0x49a1,fuck_0x1100b5=(function(){const _0x269f11=fuck_0x49a1,_0x4faf71={};_0x4faf71[_0x269f11('0x0','tTV!')]=function(_0x5f533f,_0x223f4e){return _0x5f533f===_0x223f4e;},_0x4faf71[_0x269f11('0x1','CKRE')]=_0x269f11('0x2','q$Fh'),_0x4faf71[_0x269f11('0x3','yfp7')]=function(_0x463e60,_0x584eea){return _0x463e60===_0x584eea;};const _0x10a3ac=_0x4faf71;let _0x32d110=!![];return function(_0x430aeb,_0x5147d6){const _0x2e6c9b=fuck_0x49a1;if(_0x10a3ac[_0x2e6c9b('0x4','GoEz')](_0x2e6c9b('0x5','^V8Z'),_0x2e6c9b('0x6','oNUX'))){const _0x297e02=_0x263d22[_0x2e6c9b('0x7','!5Gr')](_0x5e5beb,arguments);return _0x1335e3=null,_0x297e02;}else{const _0x5b892b=_0x32d110?function(){const _0x59efce=fuck_0x49a1,_0x3574fd={'Wnscr':function(_0x66f843){return _0x66f843();}};if(_0x10a3ac[_0x59efce('0x8','GoEz')](_0x10a3ac[_0x59efce('0x9','b$BC')],_0x59efce('0xa','na4F')))_0x3574fd[_0x59efce('0xb','yfp7')](_0x1bd416);else{if(_0x5147d6){const _0x3b6b58=_0x5147d6[_0x59efce('0xc','n!jH')](_0x430aeb,arguments);return _0x5147d6=null,_0x3b6b58;}}}:function(){};return _0x32d110=![],_0x5b892b;}};}()),fuck_0x592103=fuck_0x1100b5(this,function(){const _0x4347bd=fuck_0x49a1,_0x5e3251={};_0x5e3251[_0x4347bd('0xd','W*bZ')]=_0x4347bd('0xe','itIl');const _0x3f2bca=_0x5e3251;return fuck_0x592103[_0x4347bd('0xf','xo8H')]()[_0x4347bd('0x10','[0l!')](_0x3f2bca[_0x4347bd('0x11','C@uq')])[_0x4347bd('0x12','OyA@')]()[_0x4347bd('0x13','y$bb')](fuck_0x592103)[_0x4347bd('0x14','hvwC')](_0x3f2bca[_0x4347bd('0x15','Naso')]);});fuck_0x592103();const fuck_0x2bdde5=(function(){const _0x7e9fe1=fuck_0x49a1,_0x510ace={};_0x510ace[_0x7e9fe1('0x16','eKhh')]=function(_0x3f587,_0x173606){return _0x3f587===_0x173606;},_0x510ace[_0x7e9fe1('0x17','C@uq')]=_0x7e9fe1('0x18','na4F'),_0x510ace[_0x7e9fe1('0x19','OyA@')]=function(_0x2335c4,_0xa58cec){return _0x2335c4!==_0xa58cec;},_0x510ace[_0x7e9fe1('0x1a','$Z]e')]=_0x7e9fe1('0x1b','3&uC');const _0x15a09e=_0x510ace;let _0x5bc03a=!![];return function(_0x3ac40d,_0x4c0bbb){const _0x3d96f3=_0x5bc03a?function(){const _0x3f9963=fuck_0x49a1;if(_0x15a09e[_0x3f9963('0x1c','A*f#')](_0x15a09e[_0x3f9963('0x1d','itIl')],_0x3f9963('0x1e','$Z]e'))){if(_0x4c0bbb){if(_0x15a09e[_0x3f9963('0x1f','yfp7')](_0x15a09e[_0x3f9963('0x20','W1cG')],_0x3f9963('0x21','yu6s'))){const _0x5b0896=_0x4c0bbb[_0x3f9963('0x22','#MH4')](_0x3ac40d,arguments);return _0x4c0bbb=null,_0x5b0896;}else{const _0x232a78=_0x336b0f?function(){const _0x4fa82e=fuck_0x49a1;if(_0x148269){const _0x33a82c=_0x513e17[_0x4fa82e('0x23','xvTU')](_0xac707a,arguments);return _0x214ca4=null,_0x33a82c;}}:function(){};return _0x5920f4=![],_0x232a78;}}}else _0x494230?(_0xe4d87e[_0x3f9963('0x24','xvTU')](_0x3f9963('0x25','A*f#')),_0x3fdb62[_0x3f9963('0x26','RhJP')](_0x634234)):(_0xe65169=_0xfa3aa1[_0x3f9963('0x27','Naso')](_0x3c5a91),_0x49660e[_0x3f9963('0x28','eHwr')]=_0x31021e[_0x3f9963('0x29','C@uq')]?.[_0x3f9963('0x2a','[0l!')]||'');}:function(){};return _0x5bc03a=![],_0x3d96f3;};}());(function(){const _0x29640d=fuck_0x49a1,_0x152195={'iVeDD':function(_0x2902ec,_0x50cee3){return _0x2902ec(_0x50cee3);},'ABHMD':_0x29640d('0x2b','8NEE'),'OBIdz':_0x29640d('0x2c','7&Di'),'WpsGD':_0x29640d('0x2d','W*bZ'),'crGis':_0x29640d('0x2e','q$Fh'),'xtiHE':_0x29640d('0x2f','n!jH'),'ZyPvI':function(_0x36b1ee,_0x482db0){return _0x36b1ee+_0x482db0;},'fwFPG':_0x29640d('0x30','HNc8'),'QAIQG':function(_0x4f6e28){return _0x4f6e28();},'BHwhu':function(_0x4e677c,_0x333876,_0x48c72c){return _0x4e677c(_0x333876,_0x48c72c);}};_0x152195[_0x29640d('0x31','A*f#')](fuck_0x2bdde5,this,function(){const _0x2f1176=fuck_0x49a1;if(_0x152195[_0x2f1176('0x32','oNUX')]!==_0x152195[_0x2f1176('0x33','FLRN')])_0x152195[_0x2f1176('0x34','BKyv')](_0x18c1cd,'0');else{const _0x24a055=new RegExp(_0x152195[_0x2f1176('0x35','sHSp')]),_0x590e42=new RegExp(_0x152195[_0x2f1176('0x36','itIl')],'i'),_0x4fbe24=fuck_0x299f12(_0x152195[_0x2f1176('0x37','&LEr')]);!_0x24a055[_0x2f1176('0x38','^V8Z')](_0x4fbe24+_0x152195[_0x2f1176('0x39','BKyv')])||!_0x590e42[_0x2f1176('0x3a','C@uq')](_0x152195[_0x2f1176('0x3b','A*f#')](_0x4fbe24,_0x152195[_0x2f1176('0x3c','itIl')]))?_0x4fbe24('0'):_0x152195[_0x2f1176('0x3d','y$bb')](fuck_0x299f12);}})();}());const fuck_0x31a9ef=require(fuck_0x3da277('0x3e','ia1U')),fuck_0x3c4767=require(fuck_0x3da277('0x3f','RhJP')),fuck_0x3fbe60=require(fuck_0x3da277('0x40','HNc8'));async function getuserinfo_6dy(){const _0x540baf=fuck_0x49a1,_0x3e33ab={'zXKYF':_0x540baf('0x41','CKRE'),'voSyU':_0x540baf('0x42','#MH4'),'RMbKs':function(_0x433dc3,_0x3e2b55){return _0x433dc3!==_0x3e2b55;},'yRFND':_0x540baf('0x43','7&Di'),'tFAhz':function(_0x51599f){return _0x51599f();}},_0xad5e30={};_0xad5e30[_0x540baf('0x44','#9i5')]=cookie,_0xad5e30[_0x540baf('0x45','CKRE')]=$['UA'],_0xad5e30[_0x540baf('0x46','itIl')]=_0x540baf('0x47','!5Gr'),_0xad5e30[_0x540baf('0x48','yfp7')]=_0x540baf('0x49','&LEr');let _0xe7d8e8={'url':_0x540baf('0x4a','sHSp'),'body':_0x540baf('0x4b','eKhh')+Date[_0x540baf('0x4c','&LEr')]()+_0x540baf('0x4d','BKyv'),'headers':_0xad5e30};return new Promise(_0x3532b2=>{const _0x4f5275=fuck_0x49a1,_0x191986={'pVHoe':_0x3e33ab[_0x4f5275('0x4e','oNUX')],'qPxUR':_0x3e33ab[_0x4f5275('0x4f','ia1U')],'ATPIe':function(_0x2a92bf,_0x363347){const _0x2c3b07=fuck_0x49a1;return _0x3e33ab[_0x2c3b07('0x50','#MH4')](_0x2a92bf,_0x363347);},'yVFgQ':_0x3e33ab[_0x4f5275('0x51','[hlL')],'gfyWN':_0x4f5275('0x52','Naso'),'IqYiY':function(_0x6e985a){const _0x357a14=fuck_0x49a1;return _0x3e33ab[_0x357a14('0x53','RhJP')](_0x6e985a);}};_0x4f5275('0x54','A*f#')===_0x4f5275('0x55','eKhh')?$[_0x4f5275('0x56','y$bb')](_0xe7d8e8,async(_0x149c55,_0x1a7385,_0xebca83)=>{const _0x4bf9f3=fuck_0x49a1;if(_0x191986[_0x4bf9f3('0x57','[0l!')]!==_0x191986[_0x4bf9f3('0x58','#MH4')])_0x4a0794=_0xe96d56[_0x4bf9f3('0x59','GoEz')](_0xa0bc5f),_0x382ccf[_0x4bf9f3('0x5a','oNUX')]=_0xd57105[_0x4bf9f3('0x5b','b$BC')]?.[_0x4bf9f3('0x5c','itIl')]||'';else try{_0x149c55?(console[_0x4bf9f3('0x5d','3&uC')](''+JSON[_0x4bf9f3('0x5e','hvwC')](_0x149c55)),console[_0x4bf9f3('0x5f','OyA@')](_0x4bf9f3('0x60','0]PI'))):_0x191986[_0x4bf9f3('0x61','W1cG')]===_0x191986[_0x4bf9f3('0x62','FLRN')]?($[_0x4bf9f3('0x63','W*bZ')]=_0xebca83[_0x4bf9f3('0x64','RhJP')](/"score":(\d+)/)?_0xebca83[_0x4bf9f3('0x65','W1cG')](/"score":(\d+)/)[0x18f9+0x2f*-0x42+-0xcda]:-0x902+-0x8*-0x2+0x8f2,$[_0x4bf9f3('0x66','&LEr')]=_0xebca83[_0x4bf9f3('0x67','#9i5')](/"currentBeanNum":(\d+)/)?_0xebca83[_0x4bf9f3('0x68','tTV!')](/"currentBeanNum":(\d+)/)[0x26d*-0x1+0x1*-0xc82+0x3bc*0x4]:0x1*-0x1687+-0x1396+-0x2a1d*-0x1,$[_0x4bf9f3('0x69','BKyv')]=_0xebca83[_0x4bf9f3('0x6a','xo8H')](/"showName":"(.*?)"/)?_0xebca83[_0x4bf9f3('0x6b','W*bZ')](/"showName":"(.*?)"/)[0x43f*0x3+0x2*0x1fb+0x2*-0x859]:$[_0x4bf9f3('0x6c','W*bZ')]):_0x5d2e83[_0x4bf9f3('0x6d','3o2R')]=_0x17e75e['rs'][_0x4bf9f3('0x6e','RhJP')][_0x4bf9f3('0x6f','oNUX')]?!![]:![];}catch(_0x456dc9){_0x191986[_0x4bf9f3('0x70','oNUX')](_0x191986[_0x4bf9f3('0x71','#MH4')],_0x191986[_0x4bf9f3('0x72','tTV!')])?$[_0x4bf9f3('0x73','oNUX')](_0x456dc9,_0x1a7385):(!_0x1d2665&&(_0x34a534[_0x4bf9f3('0x74','W*bZ')](_0x4bf9f3('0x75','yu6s')),_0x2f51fb[_0x4bf9f3('0x76','^V8Z')](_0x269a09[_0x4bf9f3('0x77','n!jH')](_0x22c00f))),_0x29a15e=!![]);}finally{_0x3532b2();}}):_0x191986[_0x4f5275('0x78','yfp7')](_0x57d0ac);});}async function queryScores(){const _0x1c36a6=fuck_0x49a1,_0x1a9b3f={};_0x1a9b3f[_0x1c36a6('0x79','%C*N')]=function(_0x2dd6e4,_0x595286){return _0x2dd6e4==_0x595286;},_0x1a9b3f[_0x1c36a6('0x7a','&LEr')]=_0x1c36a6('0x7b','yu6s'),_0x1a9b3f[_0x1c36a6('0x7c','3&uC')]=_0x1c36a6('0x7d','HNc8'),_0x1a9b3f[_0x1c36a6('0x7e','oNUX')]=_0x1c36a6('0x7f','HNc8');const _0x55ac32=_0x1a9b3f;let _0x2ada68='';const _0x1cd2b9={};_0x1cd2b9[_0x1c36a6('0x80','oNUX')]=_0x1c36a6('0x81','&LEr'),_0x1cd2b9['fn']=_0x55ac32[_0x1c36a6('0x82','x2cU')],_0x1cd2b9[_0x1c36a6('0x83','sHSp')]={},_0x1cd2b9[_0x1c36a6('0x84','^V8Z')]=_0x55ac32[_0x1c36a6('0x85','mXnq')],_0x1cd2b9[_0x1c36a6('0x86','ia1U')]=$[_0x1c36a6('0x6c','W*bZ')],_0x1cd2b9[_0x1c36a6('0x87','$Z]e')]=0x0,_0x1cd2b9['ua']=$['UA'];let _0xc3e878=_0x1cd2b9;body=await fuck_0x31a9ef[_0x1c36a6('0x88','^3mT')](_0xc3e878);const _0x333129={};_0x333129[_0x1c36a6('0x89','8NEE')]=cookie,_0x333129[_0x1c36a6('0x8a','na4F')]=$['UA'],_0x333129[_0x1c36a6('0x8b','3&uC')]=_0x1c36a6('0x8c','HNc8');const _0x1768a9={};_0x1768a9[_0x1c36a6('0x8d','[hlL')]=_0x1c36a6('0x8e','xvTU')+body+_0x1c36a6('0x8f','sHSp'),_0x1768a9[_0x1c36a6('0x90','BKyv')]=_0x333129;let _0x1fe839=_0x1768a9;return new Promise(_0x2051dd=>{const _0x82c4c6=fuck_0x49a1;$[_0x82c4c6('0x91','q$Fh')](_0x1fe839,async(_0x2c8689,_0x3738e4,_0x2656c4)=>{const _0x5d7fff=fuck_0x49a1;if(_0x5d7fff('0x92','!5Gr')!==_0x5d7fff('0x93','7HGx'))try{if(_0x5d7fff('0x94','itIl')===_0x5d7fff('0x95','GoEz')){const _0x58cfb8=JSON[_0x5d7fff('0x96','W4@3')](_0x2656c4);_0x55ac32[_0x5d7fff('0x97','sHSp')](_0x58cfb8[_0x5d7fff('0x98','n!jH')],-0x1574+-0x443*0x3+0x2625)&&($[_0x5d7fff('0x99','7HGx')]=_0x58cfb8['rs'][_0x5d7fff('0x9a','b$BC')][_0x5d7fff('0x9b','^3mT')]);}else _0x36beca[_0x5d7fff('0x9c','Naso')](''+_0x13d6e2[_0x5d7fff('0x9d','[hlL')](_0x3bb51e)),_0x5ef93a[_0x5d7fff('0x9e','CKRE')](_0x5d7fff('0x9f','q$Fh'));}catch(_0xaeaaef){$[_0x5d7fff('0xa0','W*bZ')](_0xaeaaef,_0x3738e4);}finally{if(_0x55ac32[_0x5d7fff('0xa1','Naso')]!==_0x55ac32[_0x5d7fff('0xa2','CKRE')]){const _0x1d5694=_0xeb0aa2[_0x5d7fff('0xa3','q$Fh')](_0x3b4e1c,arguments);return _0x11a65c=null,_0x1d5694;}else _0x2051dd();}else _0x27b953(-0x197d+-0x6a6+0x2023);});});}async function fruitinfo(){const _0x2f2ccb=fuck_0x49a1,_0x51415e={'ssgmN':function(_0x278aeb){return _0x278aeb();},'clYIi':function(_0x55d9a8,_0x245f20){return _0x55d9a8===_0x245f20;},'fUudB':_0x2f2ccb('0xa4','xo8H'),'qocfl':_0x2f2ccb('0xa5','tTV!'),'tkhvX':_0x2f2ccb('0xa6','itIl'),'NczER':_0x2f2ccb('0xa7','&LEr'),'NUGxC':_0x2f2ccb('0xa8','8NEE'),'iUrJa':_0x2f2ccb('0xa9','RhJP')};return new Promise(_0x3fa195=>{const _0x30665d=fuck_0x49a1,_0x275438={'ZzYxU':function(_0x117328,_0x232cf4){return _0x117328===_0x232cf4;},'GqOta':_0x30665d('0xaa','Naso'),'HxUfe':_0x30665d('0xab','[hlL'),'VhHNS':_0x30665d('0xac','W*bZ'),'nPqYb':function(_0x9008aa,_0x1d2d39){return _0x9008aa(_0x1d2d39);},'Jksyo':function(_0x4c4171){const _0x568332=fuck_0x49a1;return _0x51415e[_0x568332('0xad','y$bb')](_0x4c4171);}};if(_0x51415e[_0x30665d('0xae','W*bZ')](_0x51415e[_0x30665d('0xaf','#9i5')],_0x51415e[_0x30665d('0xb0','$Z]e')]))_0x4ee01b[_0x30665d('0xb1','HNc8')]=_0x115987[_0x30665d('0xb2','7HGx')](_0x55a42e),_0x3492df[_0x30665d('0xb3','xvTU')][_0x30665d('0xb4','xvTU')]&&(_0x5f319e[_0x30665d('0xb5','y$bb')]=_0x228020[_0x30665d('0xb6','P8(3')][_0x30665d('0xb7','!5Gr')][_0x30665d('0xb8','RhJP')],_0x16a869[_0x30665d('0xb9','W1cG')]=_0x30f55a[_0x30665d('0xba','7&Di')][_0x30665d('0xbb','xo8H')][_0x30665d('0xbc','eKhh')],_0x44e9ad[_0x30665d('0xbd','#9i5')]=_0x4ae61b[_0x30665d('0xb1','HNc8')][_0x30665d('0xbe','A*f#')][_0x30665d('0xbf','mXnq')],_0x3519ff[_0x30665d('0xc0','W1cG')]=_0x21b638[_0x30665d('0xc1','CKRE')][_0x30665d('0xc2','^V8Z')][_0x30665d('0xc3','0]PI')]);else{const _0x3bf071={};_0x3bf071[_0x30665d('0xc4','CKRE')]=0x18,_0x3bf071[_0x30665d('0xc5','^V8Z')]=0x1,_0x3bf071[_0x30665d('0xc6','$Z]e')]=_0x51415e[_0x30665d('0xc7','#9i5')],_0x3bf071[_0x30665d('0xc8','C@uq')]='0',_0x3bf071[_0x30665d('0xc9','xo8H')]='0';const _0x5df9db={};_0x5df9db[_0x30665d('0xca','$Z]e')]=_0x30665d('0xcb','3&uC'),_0x5df9db[_0x30665d('0xcc','sHSp')]=_0x51415e[_0x30665d('0xcd','y$bb')],_0x5df9db[_0x30665d('0xce','C@uq')]=_0x30665d('0xcf','%C*N'),_0x5df9db[_0x30665d('0xd0','OyA@')]=cookie,_0x5df9db[_0x30665d('0xd1','RhJP')]=_0x51415e[_0x30665d('0xd2','sHSp')],_0x5df9db[_0x30665d('0xd3','P8(3')]=_0x30665d('0xd4','ia1U'),_0x5df9db[_0x30665d('0xd5','C@uq')]=$['UA'],_0x5df9db[_0x30665d('0xd6','eHwr')]=_0x51415e[_0x30665d('0xd7','na4F')];const _0x3b3e3c={'url':_0x30665d('0xd8','yfp7'),'body':_0x30665d('0xd9','#MH4')+encodeURIComponent(JSON[_0x30665d('0xda','mXnq')](_0x3bf071))+_0x30665d('0xdb','[hlL'),'headers':_0x5df9db,'timeout':0x2710};$[_0x30665d('0xdc','BKyv')](_0x3b3e3c,(_0x4ab09c,_0x1075ee,_0x2909e9)=>{const _0x181723=fuck_0x49a1,_0x1a1638={};_0x1a1638[_0x181723('0xdd','n!jH')]=_0x181723('0xde','@Um^');const _0x338575=_0x1a1638;try{_0x4ab09c?(!llgeterror&&(_0x275438[_0x181723('0xdf','xo8H')](_0x275438[_0x181723('0xe0','itIl')],_0x275438[_0x181723('0xe1','itIl')])?function(){return![];}[_0x181723('0xe2','b$BC')](_0x181723('0xe3','^V8Z')+CzXQuL[_0x181723('0xe4','ia1U')])[_0x181723('0xe5','W4@3')](_0x181723('0xe6','7HGx')):(console[_0x181723('0xe7','oNUX')](_0x275438[_0x181723('0xe8','OyA@')]),console[_0x181723('0xe9','3o2R')](JSON[_0x181723('0xea','W1cG')](_0x4ab09c)))),llgeterror=!![]):(llgeterror=![],_0x275438[_0x181723('0xeb','#MH4')](safeGet,_0x2909e9)&&($[_0x181723('0xec','tTV!')]=JSON[_0x181723('0xed','y$bb')](_0x2909e9),$[_0x181723('0xee','W4@3')][_0x181723('0xef','sHSp')]&&($[_0x181723('0xf0','P8(3')]=$[_0x181723('0xba','7&Di')][_0x181723('0xf1','W*bZ')][_0x181723('0xf2','eHwr')],$[_0x181723('0xf3','!5Gr')]=$[_0x181723('0xf4','7HGx')][_0x181723('0xf5','7HGx')][_0x181723('0xf6','tTV!')],$[_0x181723('0xf7','@Um^')]=$[_0x181723('0xb1','HNc8')][_0x181723('0xf8','#9i5')][_0x181723('0xf9','A*f#')],$[_0x181723('0xfa','tTV!')]=$[_0x181723('0xfb','[hlL')][_0x181723('0xfc','eKhh')][_0x181723('0xfd','q$Fh')])));}catch(_0x6f2aac){$[_0x181723('0xfe','n!jH')](_0x6f2aac,_0x1075ee);}finally{_0x275438[_0x181723('0xff','na4F')](_0x3fa195);}});}});}async function fruitnew(_0x22e13b=-0x1*0xd21+0xc4*0x2+0x1*0xd8d){const _0x55adc0=fuck_0x49a1,_0x2e4427={'xzznh':_0x55adc0('0x100','GoEz'),'RofkQ':_0x55adc0('0x101','0]PI'),'zJRUw':function(_0x34a923,_0x5498ec){return _0x34a923===_0x5498ec;},'aCeYx':function(_0x579f68,_0x3b1bc9){return _0x579f68(_0x3b1bc9);},'gJUfF':function(_0xe6d697){return _0xe6d697();},'ZUvYU':function(_0x2d12b1,_0x224251,_0x89bb5d){return _0x2d12b1(_0x224251,_0x89bb5d);},'tBZlJ':_0x55adc0('0x102','^V8Z'),'otOqz':_0x55adc0('0x103','hvwC'),'mODlv':_0x55adc0('0x104','#9i5')},_0xd30546={};_0xd30546[_0x55adc0('0x105','0]PI')]=0x1;let _0x34b12d=_0xd30546,_0x1307ce={'appId':_0x55adc0('0x106','[hlL'),'fn':_0x55adc0('0x107','8NEE'),'body':_0x34b12d,'apid':_0x55adc0('0x108','^V8Z'),'ver':$['UA'][_0x55adc0('0x109','y$bb')](';')[0x1*-0x1db3+0x2492+-0x6dd],'cl':_0x2e4427[_0x55adc0('0x10a','[hlL')],'user':$[_0x55adc0('0x10b','W4@3')],'code':0x1,'ua':$['UA']};_0x34b12d=await fuck_0x3c4767[_0x55adc0('0x10c','itIl')](_0x1307ce);const _0x29ab0f={};_0x29ab0f[_0x55adc0('0x10d','mXnq')]=_0x55adc0('0x10e','#9i5'),_0x29ab0f[_0x55adc0('0x10f','sHSp')]=_0x2e4427[_0x55adc0('0x110','$Z]e')],_0x29ab0f[_0x55adc0('0x111','W1cG')]=_0x55adc0('0x112','7&Di'),_0x29ab0f[_0x55adc0('0x113','na4F')]=_0x55adc0('0x114','#MH4'),_0x29ab0f[_0x55adc0('0x115','%C*N')]=$['UA'],_0x29ab0f[_0x55adc0('0x116','hvwC')]=_0x55adc0('0x117','xvTU'),_0x29ab0f[_0x55adc0('0x118','3o2R')]=_0x2e4427[_0x55adc0('0x119','%C*N')],_0x29ab0f[_0x55adc0('0x11a','na4F')]=cookie;const _0x3913c0={};_0x3913c0[_0x55adc0('0x11b','C@uq')]=JD_API_HOST+'?'+_0x34b12d,_0x3913c0[_0x55adc0('0x11c','P8(3')]=_0x29ab0f,_0x3913c0[_0x55adc0('0x11d','eHwr')]=0x7530;let _0x538f77=_0x3913c0;return new Promise(_0x17d1d2=>{const _0x2112f5=fuck_0x49a1,_0x328994={'UNIEZ':function(_0x4f9e0d,_0x1122e3){return _0x4f9e0d===_0x1122e3;},'QtXPz':_0x2e4427[_0x2112f5('0x11e','FLRN')],'iSATn':_0x2e4427[_0x2112f5('0x11f','W*bZ')],'YnusR':function(_0x48979d,_0x5cd94f){const _0x23f4d2=fuck_0x49a1;return _0x2e4427[_0x23f4d2('0x120','na4F')](_0x48979d,_0x5cd94f);},'HJdNt':_0x2112f5('0x121','C@uq'),'ncLgj':function(_0x191c3d,_0x31d168){const _0x2d23f7=fuck_0x49a1;return _0x2e4427[_0x2d23f7('0x122','W*bZ')](_0x191c3d,_0x31d168);},'Nfhla':function(_0x3f93be){const _0x996634=fuck_0x49a1;return _0x2e4427[_0x996634('0x123','@Um^')](_0x3f93be);}};_0x2e4427[_0x2112f5('0x124','@Um^')](setTimeout,()=>{const _0xc90318=fuck_0x49a1,_0x5afaf6={'PyBJo':function(_0x584321){const _0x523394=fuck_0x49a1;return _0x328994[_0x523394('0x125','eHwr')](_0x584321);}};$[_0xc90318('0x126','^3mT')](_0x538f77,(_0xdade5e,_0x38b0bc,_0x4d3fda)=>{const _0x38caca=fuck_0x49a1;if(_0x328994[_0x38caca('0x127','q$Fh')](_0x328994[_0x38caca('0x128','b$BC')],_0x328994[_0x38caca('0x129','#9i5')])){_0x25d42d=_0x24c9d4[_0x38caca('0x12a','@Um^')](_0xd000e);if(_0x74b147[_0x38caca('0x12b','#9i5')]==-0x4*0x788a1+-0x143d01+0x3*0x197e5f)_0x3c8642[_0x38caca('0x12c','A*f#')]=_0x3fa634['rs'][_0x38caca('0x12d','[0l!')][_0x38caca('0x12e','ia1U')]?!![]:![];else{}}else try{_0x328994[_0x38caca('0x12f','yfp7')](_0x328994[_0x38caca('0x130','xo8H')],_0x328994[_0x38caca('0x131','[0l!')])?_0xdade5e?(console[_0x38caca('0x132','!5Gr')](_0x38caca('0x133','[0l!')),$[_0x38caca('0x134','FLRN')](_0xdade5e)):(_0x4d3fda=JSON[_0x38caca('0x135','ia1U')](_0x4d3fda),$[_0x38caca('0x136','tTV!')]=_0x4d3fda[_0x38caca('0x137','@Um^')]?.[_0x38caca('0x138','FLRN')]||''):GCusrI[_0x38caca('0x139','P8(3')](_0x1f0e13);}catch(_0x30c8f4){_0x38caca('0x13a','0]PI')!==_0x38caca('0x13b','eHwr')?$[_0x38caca('0x13c','BKyv')](_0x30c8f4,_0x38b0bc):(_0x21c51d[_0x38caca('0x13d','itIl')]=_0x2b0391[_0x38caca('0x13e','$Z]e')](/"score":(\d+)/)?_0x10810e[_0x38caca('0x13f','!5Gr')](/"score":(\d+)/)[0xf+-0x4*0x13b+0x26f*0x2]:0x89*0x41+-0x1*-0x2578+-0x4841,_0x3a099b[_0x38caca('0x140','ia1U')]=_0x446759[_0x38caca('0x141','GoEz')](/"currentBeanNum":(\d+)/)?_0x1a9cc9[_0x38caca('0x142','xvTU')](/"currentBeanNum":(\d+)/)[-0x111f+0x8e+0x7*0x25e]:-0x7cd*0x2+0x26a5+-0x170b,_0x23fad1[_0x38caca('0x143','xvTU')]=_0x2a143e[_0x38caca('0x144','hvwC')](/"showName":"(.*?)"/)?_0x262413[_0x38caca('0x145','eHwr')](/"showName":"(.*?)"/)[0x2*-0xa36+0x10c1+0x3ac]:_0x2fe60d[_0x38caca('0x146','itIl')]);}finally{_0x328994[_0x38caca('0x147','#9i5')](_0x17d1d2,_0x4d3fda);}});},_0x22e13b);});}async function checkplus(){const _0x29d507=fuck_0x49a1,_0x206fb8={};_0x206fb8[_0x29d507('0x148','W*bZ')]=function(_0x2f6fba,_0x1fa820){return _0x2f6fba===_0x1fa820;},_0x206fb8[_0x29d507('0x149','hvwC')]=_0x29d507('0x14a','!5Gr'),_0x206fb8[_0x29d507('0x14b','OyA@')]=_0x29d507('0x14c','na4F'),_0x206fb8[_0x29d507('0x14d','P8(3')]=_0x29d507('0x14e','hvwC'),_0x206fb8[_0x29d507('0x14f','b$BC')]=_0x29d507('0x150','na4F'),_0x206fb8[_0x29d507('0x151','eHwr')]=_0x29d507('0x152','yfp7'),_0x206fb8[_0x29d507('0x153','W1cG')]=_0x29d507('0x154','b$BC'),_0x206fb8[_0x29d507('0x155','P8(3')]=_0x29d507('0x156','!5Gr'),_0x206fb8[_0x29d507('0x157','n!jH')]=_0x29d507('0x158','3&uC');const _0x1e4e7a=_0x206fb8,_0x302c84={};_0x302c84[_0x29d507('0x159','3&uC')]=_0x1e4e7a[_0x29d507('0x15a','0]PI')],_0x302c84[_0x29d507('0x15b','P8(3')]=_0x1e4e7a[_0x29d507('0x15c','ia1U')],_0x302c84[_0x29d507('0x15d','y$bb')]=0x1;let _0x47f3a9=_0x302c84;const _0x1b4e7a={};_0x1b4e7a[_0x29d507('0x15e','eKhh')]=_0x1e4e7a[_0x29d507('0x15f','[hlL')],_0x1b4e7a['fn']=_0x1e4e7a[_0x29d507('0x160','A*f#')],_0x1b4e7a[_0x29d507('0x161','$Z]e')]=_0x47f3a9,_0x1b4e7a[_0x29d507('0x162','^3mT')]=_0x1e4e7a[_0x29d507('0x155','P8(3')],_0x1b4e7a[_0x29d507('0x163','hvwC')]=$[_0x29d507('0x164','RhJP')],_0x1b4e7a[_0x29d507('0x165','y$bb')]=0x1,_0x1b4e7a['ua']=$['UA'];let _0x58542e=_0x1b4e7a;_0x47f3a9=await fuck_0x3fbe60[_0x29d507('0x166','q$Fh')](_0x58542e);const _0x29b275={};_0x29b275[_0x29d507('0x167','^3mT')]=$['UA'],_0x29b275[_0x29d507('0x168','&LEr')]=cookie,_0x29b275[_0x29d507('0x169','A*f#')]=_0x1e4e7a[_0x29d507('0x16a','eHwr')],_0x29b275[_0x29d507('0x16b','P8(3')]=_0x29d507('0x16c','@Um^');const _0x34d2f2={};_0x34d2f2[_0x29d507('0x16d','W*bZ')]=_0x29d507('0x16e','3&uC'),_0x34d2f2[_0x29d507('0x16f','eHwr')]=_0x47f3a9,_0x34d2f2[_0x29d507('0x170','q$Fh')]=_0x29b275;let _0x23dbe7=_0x34d2f2;return new Promise(async _0x3a8d79=>{const _0x5cbf64=fuck_0x49a1;$[_0x5cbf64('0x171','n!jH')](_0x23dbe7,async(_0x2a4f44,_0x21d8d6,_0x145f90)=>{const _0x3ce309=fuck_0x49a1,_0x1b8e0b={};_0x1b8e0b[_0x3ce309('0x172','%C*N')]=function(_0x231bfd,_0x21cf1a){return _0x231bfd+_0x21cf1a;};const _0x180582=_0x1b8e0b;try{if(_0x1e4e7a[_0x3ce309('0x173','8NEE')](_0x3ce309('0x174','n!jH'),_0x1e4e7a[_0x3ce309('0x175','W4@3')])){if(_0x2a4f44)console[_0x3ce309('0x176','n!jH')](''+JSON[_0x3ce309('0x177','7HGx')](_0x2a4f44)),console[_0x3ce309('0x178','hvwC')](_0x3ce309('0x179','3&uC'));else{if(_0x3ce309('0x17a','#9i5')!==_0x1e4e7a[_0x3ce309('0x17b','^V8Z')]){_0x145f90=JSON[_0x3ce309('0x17c','oNUX')](_0x145f90);if(_0x145f90[_0x3ce309('0x98','n!jH')]==-0x4*-0xc944f+0x11d123+-0x2a06c7)$[_0x3ce309('0x17d','#MH4')]=_0x145f90['rs'][_0x3ce309('0x17e','0]PI')][_0x3ce309('0x17f','q$Fh')]?!![]:![];else{}}else return function(_0x17aaaf){}[_0x3ce309('0x180','$Z]e')](_0x3ce309('0x181','q$Fh'))[_0x3ce309('0x182','7HGx')](_0x3ce309('0x183','ia1U'));}}else{const _0x19fafd={'RMADK':function(_0x5f174b,_0x2d1ed9){return _0x5f174b+_0x2d1ed9;},'bxOYF':function(_0x578728,_0x39664d){const _0x46d2b4=fuck_0x49a1;return aphpgC[_0x46d2b4('0x184','C@uq')](_0x578728,_0x39664d);},'MGudQ':function(_0x6662bf){return _0x6662bf();}};_0x203caf(this,function(){const _0x11f842=fuck_0x49a1,_0x542d39=new _0x5e2b86(_0x11f842('0x185','[0l!')),_0x777493=new _0x19df8c(_0x11f842('0x186','na4F'),'i'),_0xf5bf43=_0x45fd76(_0x11f842('0x187','#MH4'));!_0x542d39[_0x11f842('0x188','y$bb')](_0x19fafd[_0x11f842('0x189','tTV!')](_0xf5bf43,_0x11f842('0x18a','itIl')))||!_0x777493[_0x11f842('0x18b','na4F')](_0x19fafd[_0x11f842('0x18c','ia1U')](_0xf5bf43,_0x11f842('0x18d','yfp7')))?_0xf5bf43('0'):_0x19fafd[_0x11f842('0x18e','na4F')](_0x3b51e6);})();}}catch(_0x24c7a7){$[_0x3ce309('0x18f','xo8H')](_0x24c7a7,_0x21d8d6);}finally{_0x3a8d79();}});});}function fuck_0x49a1(_0x382f85,_0x2f6d1b){const _0x1d14ea=fuck_0x24de();return fuck_0x49a1=function(_0x162eef,_0x234dc0){_0x162eef=_0x162eef-(0x6*-0x5ff+-0x3b*-0x7b+0x7a1);let _0x492040=_0x1d14ea[_0x162eef];if(fuck_0x49a1['XxurpV']===undefined){var _0x1a71e2=function(_0x58f92a){const _0x29a15e='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let _0x34a534='',_0x2f51fb='',_0x269a09=_0x34a534+_0x1a71e2;for(let _0x22c00f=0x1*0x1541+0x227b+-0x37bc,_0x56807f,_0x13598e,_0x29f919=-0xeb5+0xa59+-0x4*-0x117;_0x13598e=_0x58f92a['charAt'](_0x29f919++);~_0x13598e&&(_0x56807f=_0x22c00f%(-0x2*0xe3e+0x1e01*0x1+-0x181)?_0x56807f*(-0x9d2+0x31d+0x6f5)+_0x13598e:_0x13598e,_0x22c00f++%(-0xa3a+0xace+-0xc*0xc))?_0x34a534+=_0x269a09['charCodeAt'](_0x29f919+(-0x1aaa+0x247f*-0x1+0x3f33))-(0x2078+0x1880+0x411*-0xe)!==-0x26cb*0x1+-0x7be+0x13*0x273?String['fromCharCode'](-0xe98*0x1+-0x18f6+0x288d&_0x56807f>>(-(0x35*-0x52+-0xce4+0x1de0)*_0x22c00f&-0x855+-0x1*-0x21f4+-0x1999)):_0x22c00f:0x1b7e+-0x1e3e+0x2c0*0x1){_0x13598e=_0x29a15e['indexOf'](_0x13598e);}for(let _0x2eecdc=-0xb61*-0x2+0x7f3+0x1*-0x1eb5,_0x12529f=_0x34a534['length'];_0x2eecdc<_0x12529f;_0x2eecdc++){_0x2f51fb+='%'+('00'+_0x34a534['charCodeAt'](_0x2eecdc)['toString'](0x21*0xb4+0x1fbc+-0x4*0xdb8))['slice'](-(-0x1b09+-0x1*-0x985+0x8c3*0x2));}return decodeURIComponent(_0x2f51fb);};const _0x3a2ecd=function(_0x458a22,_0x412529){let _0x11c51e=[],_0x4a2c60=-0x12fa+-0x2460+0x375a,_0x5234fe,_0xbd0315='';_0x458a22=_0x1a71e2(_0x458a22);let _0x3f7c55;for(_0x3f7c55=-0x3*-0xa85+-0x21a*0x10+0x211*0x1;_0x3f7c55<-0x1*-0x4a2+0x132f+-0x16d1;_0x3f7c55++){_0x11c51e[_0x3f7c55]=_0x3f7c55;}for(_0x3f7c55=-0x11cb*0x2+0x896*-0x3+0x3d58;_0x3f7c55<0xce8+-0x4*0x493+0x664;_0x3f7c55++){_0x4a2c60=(_0x4a2c60+_0x11c51e[_0x3f7c55]+_0x412529['charCodeAt'](_0x3f7c55%_0x412529['length']))%(0x109c+0x41*0x20+-0x17bc),_0x5234fe=_0x11c51e[_0x3f7c55],_0x11c51e[_0x3f7c55]=_0x11c51e[_0x4a2c60],_0x11c51e[_0x4a2c60]=_0x5234fe;}_0x3f7c55=-0xc9a*0x1+-0xcb0+0xf9*0x1a,_0x4a2c60=0x22c1+0x15cb+0x1*-0x388c;for(let _0x14b077=0x1afe+-0x2237*-0x1+-0x3*0x1467;_0x14b077<_0x458a22['length'];_0x14b077++){_0x3f7c55=(_0x3f7c55+(-0x6*-0xe9+-0x5da+0x65))%(-0x1fff+-0x80f+0x290e),_0x4a2c60=(_0x4a2c60+_0x11c51e[_0x3f7c55])%(-0x1e9d+-0x268c+0x4629),_0x5234fe=_0x11c51e[_0x3f7c55],_0x11c51e[_0x3f7c55]=_0x11c51e[_0x4a2c60],_0x11c51e[_0x4a2c60]=_0x5234fe,_0xbd0315+=String['fromCharCode'](_0x458a22['charCodeAt'](_0x14b077)^_0x11c51e[(_0x11c51e[_0x3f7c55]+_0x11c51e[_0x4a2c60])%(-0xb*-0x17f+0x7*-0x49d+0x10d6)]);}return _0xbd0315;};fuck_0x49a1['hNZPkm']=_0x3a2ecd,_0x382f85=arguments,fuck_0x49a1['XxurpV']=!![];}const _0x1d2665=_0x1d14ea[0x581*-0x2+-0x82*0x14+0x2b*0x7e],_0x13b1e1=_0x162eef+_0x1d2665,_0x6113f1=_0x382f85[_0x13b1e1];if(!_0x6113f1){if(fuck_0x49a1['mYDWRj']===undefined){const _0x30dbf3=function(_0x124926){this['whwpbh']=_0x124926,this['tsWqYh']=[-0x1*0x1345+-0x1485+0x27cb,-0x2a*0xe9+0x87b+0x1dbf,-0x7d3+-0x2c*-0x1+0x7a7],this['DYvQVK']=function(){return'newState';},this['fLjukt']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['iwKphN']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x30dbf3['prototype']['nbQGtf']=function(){const _0x29c66b=new RegExp(this['fLjukt']+this['iwKphN']),_0x90de1d=_0x29c66b['test'](this['DYvQVK']['toString']())?--this['tsWqYh'][-0x1a1c+-0x1c4d+-0xa*-0x571]:--this['tsWqYh'][0x11e3+-0x2*0x39a+-0x5*0x223];return this['gOehaL'](_0x90de1d);},_0x30dbf3['prototype']['gOehaL']=function(_0x2ffd5d){if(!Boolean(~_0x2ffd5d))return _0x2ffd5d;return this['TLBzKt'](this['whwpbh']);},_0x30dbf3['prototype']['TLBzKt']=function(_0x48a07e){for(let _0x2e5910=-0x1145+0xaf2+0x653,_0x588e3a=this['tsWqYh']['length'];_0x2e5910<_0x588e3a;_0x2e5910++){this['tsWqYh']['push'](Math['round'](Math['random']())),_0x588e3a=this['tsWqYh']['length'];}return _0x48a07e(this['tsWqYh'][-0xa57+0xea3+-0x44c]);},new _0x30dbf3(fuck_0x49a1)['nbQGtf'](),fuck_0x49a1['mYDWRj']=!![];}_0x492040=fuck_0x49a1['hNZPkm'](_0x492040,_0x234dc0),_0x382f85[_0x13b1e1]=_0x492040;}else _0x492040=_0x6113f1;return _0x492040;},fuck_0x49a1(_0x382f85,_0x2f6d1b);}function fuck_0x299f12(_0x374108){const _0x478faf=fuck_0x49a1,_0x5b008c={'WlvSd':function(_0x587b14,_0x488f72){return _0x587b14+_0x488f72;},'uoJwp':function(_0x54b3fd){return _0x54b3fd();},'CBJmL':function(_0x48d4c9,_0x57d3e0){return _0x48d4c9!==_0x57d3e0;},'nWTYG':_0x478faf('0x190','Naso'),'aBpbK':_0x478faf('0x191','BKyv'),'Vgrfx':_0x478faf('0x192','7&Di'),'UfmPG':function(_0x5518d5,_0x149134){return _0x5518d5/_0x149134;},'QXGze':_0x478faf('0x193','FLRN'),'JbwYS':function(_0xa47f82,_0x32636e){return _0xa47f82===_0x32636e;},'srPUO':function(_0xb27502,_0x56295e){return _0xb27502+_0x56295e;},'WCGEB':_0x478faf('0x194','&LEr'),'cLnov':function(_0x31a559,_0x205708){return _0x31a559+_0x205708;},'mTBDx':function(_0x16d59c,_0x2ce0b6){return _0x16d59c===_0x2ce0b6;},'iLHFz':_0x478faf('0x195','tTV!')};function _0x1cff6d(_0x4572da){const _0x146ef0=fuck_0x49a1,_0x4dc763={'vIjVs':_0x146ef0('0x196','&LEr'),'SGCho':function(_0x2bbf60,_0x552759){return _0x2bbf60(_0x552759);},'hTTvM':_0x146ef0('0x197','eKhh'),'XSgeW':function(_0x521cf3,_0x341bbe){const _0x14800d=fuck_0x49a1;return _0x5b008c[_0x14800d('0x198','3o2R')](_0x521cf3,_0x341bbe);},'QyjdD':function(_0x5afbf7){const _0x1a3f93=fuck_0x49a1;return _0x5b008c[_0x1a3f93('0x199','y$bb')](_0x5afbf7);},'fwcCq':function(_0x1163e2,_0x7d01f1){const _0x2c4324=fuck_0x49a1;return _0x5b008c[_0x2c4324('0x19a','mXnq')](_0x1163e2,_0x7d01f1);}};if(_0x146ef0('0x19b','eKhh')!==_0x5b008c[_0x146ef0('0x19c','oNUX')])_0x418dc8[_0x146ef0('0x19d','HNc8')](_0x35b01b,_0x1b80e2);else{if(typeof _0x4572da===_0x146ef0('0x19e','3o2R'))return function(_0x5fc6a1){}[_0x146ef0('0x19f','mXnq')](_0x5b008c[_0x146ef0('0x1a0','^3mT')])[_0x146ef0('0x1a1','BKyv')](_0x5b008c[_0x146ef0('0x1a2','W4@3')]);else _0x5b008c[_0x146ef0('0x1a3','n!jH')]('',_0x5b008c[_0x146ef0('0x1a4','itIl')](_0x4572da,_0x4572da))[_0x5b008c[_0x146ef0('0x1a5','!5Gr')]]!==0xb13+-0x24be+0x19ac||_0x5b008c[_0x146ef0('0x1a6','yfp7')](_0x4572da%(-0x1315+-0x1*0x215e+0x3487),-0x14d*-0xd+-0x24fc+0x1413)?function(){const _0x45d5af=fuck_0x49a1;if(_0x4dc763[_0x45d5af('0x1a7','y$bb')](_0x45d5af('0x1a8','xvTU'),_0x45d5af('0x1a9','0]PI'))){const _0x5aff65=new _0x440f54(_0x4dc763[_0x45d5af('0x1aa','&LEr')]),_0x2de9e0=new _0x103fac(_0x45d5af('0x1ab','@Um^'),'i'),_0x234e03=_0x4dc763[_0x45d5af('0x1ac','[hlL')](_0x4b639f,_0x4dc763[_0x45d5af('0x1ad','CKRE')]);!_0x5aff65[_0x45d5af('0x1ae','W1cG')](_0x4dc763[_0x45d5af('0x1af','yu6s')](_0x234e03,_0x45d5af('0x1b0','3&uC')))||!_0x2de9e0[_0x45d5af('0x1b1','#9i5')](_0x234e03+_0x45d5af('0x1b2','itIl'))?_0x234e03('0'):_0x4dc763[_0x45d5af('0x1b3','FLRN')](_0x3d9ca8);}else return!![];}[_0x146ef0('0x1b4','HNc8')](_0x5b008c[_0x146ef0('0x1b5','P8(3')](_0x5b008c[_0x146ef0('0x1b6','b$BC')],_0x146ef0('0x1b7','ia1U')))[_0x146ef0('0x1b8','0]PI')](_0x146ef0('0x1b9','A*f#')):function(){return![];}[_0x146ef0('0x1ba','^3mT')](_0x5b008c[_0x146ef0('0x1bb','HNc8')](_0x146ef0('0x1bc','W*bZ'),_0x146ef0('0x1bd','eKhh')))[_0x146ef0('0x1be','W*bZ')](_0x146ef0('0x1bf','na4F'));_0x1cff6d(++_0x4572da);}}try{if(_0x374108)return _0x1cff6d;else _0x5b008c[_0x478faf('0x1c0','$Z]e')](_0x478faf('0x1c1','na4F'),_0x5b008c[_0x478faf('0x1c2','W*bZ')])?_0x382f85():_0x1cff6d(0x2510+0x236b*-0x1+-0x1a5*0x1);}catch(_0xec274a){}}
function Env(t, e) {
    "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
    class s {
        constructor(t) {
            this.env = t
        }
        send(t, e = "GET") {
            t = "string" == typeof t ? {
                url: t
            }
                : t;
            let s = this.get;
            return "POST" === e && (s = this.post),
                new Promise((e, i) => {
                    s.call(this, t, (t, s, r) => {
                        t ? i(t) : e(s)
                    })
                })
        }
        get(t) {
            return this.send.call(this.env, t)
        }
        post(t) {
            return this.send.call(this.env, t, "POST")
        }
    }
    return new class {
        constructor(t, e) {
            this.name = t,
                this.http = new s(this),
                this.data = null,
                this.dataFile = "box.dat",
                this.logs = [],
                this.isMute = !1,
                this.isNeedRewrite = !1,
                this.logSeparator = "\n",
                this.startTime = (new Date).getTime(),
                Object.assign(this, e),
                this.log("", `🔔${this.name}, 开始!`)
        }
        isNode() {
            return "undefined" != typeof module && !!module.exports
        }
        isQuanX() {
            return "undefined" != typeof $task
        }
        isSurge() {
            return "undefined" != typeof $httpClient && "undefined" == typeof $loon
        }
        isLoon() {
            return "undefined" != typeof $loon
        }
        toObj(t, e = null) {
            try {
                return JSON.parse(t)
            } catch {
                return e
            }
        }
        toStr(t, e = null) {
            try {
                return JSON.stringify(t)
            } catch {
                return e
            }
        }
        getjson(t, e) {
            let s = e;
            const i = this.getdata(t);
            if (i)
                try {
                    s = JSON.parse(this.getdata(t))
                } catch { }
            return s
        }
        setjson(t, e) {
            try {
                return this.setdata(JSON.stringify(t), e)
            } catch {
                return !1
            }
        }
        getScript(t) {
            return new Promise(e => {
                this.get({
                    url: t
                }, (t, s, i) => e(i))
            })
        }
        runScript(t, e) {
            return new Promise(s => {
                let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
                i = i ? i.replace(/\n/g, "").trim() : i;
                let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
                r = r ? 1 * r : 20,
                    r = e && e.timeout ? e.timeout : r;
                const [o, h] = i.split("@"),
                    n = {
                        url: `http://${h}/v1/scripting/evaluate`,
                        body: {
                            script_text: t,
                            mock_type: "cron",
                            timeout: r
                        },
                        headers: {
                            "X-Key": o,
                            Accept: "*/*"
                        }
                    };
                this.post(n, (t, e, i) => s(i))
            }).catch(t => this.logErr(t))
        }
        loaddata() {
            if (!this.isNode())
                return {}; {
                this.fs = this.fs ? this.fs : require("fs"),
                    this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t),
                    i = !s && this.fs.existsSync(e);
                if (!s && !i)
                    return {}; {
                    const i = s ? t : e;
                    try {
                        return JSON.parse(this.fs.readFileSync(i))
                    } catch (t) {
                        return {}
                    }
                }
            }
        }
        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require("fs"),
                    this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t),
                    i = !s && this.fs.existsSync(e),
                    r = JSON.stringify(this.data);
                s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
            }
        }
        lodash_get(t, e, s) {
            const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
            let r = t;
            for (const t of i)
                if (r = Object(r)[t], void 0 === r)
                    return s;
            return r
        }
        lodash_set(t, e, s) {
            return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
        }
        getdata(t) {
            let e = this.getval(t);
            if (/^@/.test(t)) {
                const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t),
                    r = s ? this.getval(s) : "";
                if (r)
                    try {
                        const t = JSON.parse(r);
                        e = t ? this.lodash_get(t, i, "") : e
                    } catch (t) {
                        e = ""
                    }
            }
            return e
        }
        setdata(t, e) {
            let s = !1;
            if (/^@/.test(e)) {
                const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e),
                    o = this.getval(i),
                    h = i ? "null" === o ? null : o || "{}" : "{}";
                try {
                    const e = JSON.parse(h);
                    this.lodash_set(e, r, t),
                        s = this.setval(JSON.stringify(e), i)
                } catch (e) {
                    const o = {};
                    this.lodash_set(o, r, t),
                        s = this.setval(JSON.stringify(o), i)
                }
            } else
                s = this.setval(t, e);
            return s
        }
        getval(t) {
            return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
        }
        setval(t, e) {
            return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
        }
        initGotEnv(t) {
            this.got = this.got ? this.got : require("got"),
                this.cktough = this.cktough ? this.cktough : require("tough-cookie"),
                this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar,
                t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
        }
        get(t, e = (() => { })) {
            t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]),
                this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
                    "X-Surge-Skip-Scripting": !1
                })), $httpClient.get(t, (t, s, i) => {
                    !t && s && (s.body = i, s.statusCode = s.status),
                        e(t, s, i)
                })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
                    hints: !1
                })), $task.fetch(t).then(t => {
                    const {
                        statusCode: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    } = t;
                    e(null, {
                        status: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    }, o)
                }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
                    try {
                        if (t.headers["set-cookie"]) {
                            const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                            s && this.ckjar.setCookieSync(s, null),
                                e.cookieJar = this.ckjar
                        }
                    } catch (t) {
                        this.logErr(t)
                    }
                }).then(t => {
                    const {
                        statusCode: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    } = t;
                    e(null, {
                        status: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    }, o)
                }, t => {
                    const {
                        message: s,
                        response: i
                    } = t;
                    e(s, i, i && i.body)
                }))
        }
        post(t, e = (() => { })) {
            if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon())
                this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
                    "X-Surge-Skip-Scripting": !1
                })), $httpClient.post(t, (t, s, i) => {
                    !t && s && (s.body = i, s.statusCode = s.status),
                        e(t, s, i)
                });
            else if (this.isQuanX())
                t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
                    hints: !1
                })), $task.fetch(t).then(t => {
                    const {
                        statusCode: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    } = t;
                    e(null, {
                        status: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    }, o)
                }, t => e(t));
            else if (this.isNode()) {
                this.initGotEnv(t);
                const {
                    url: s,
                    ...i
                } = t;
                this.got.post(s, i).then(t => {
                    const {
                        statusCode: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    } = t;
                    e(null, {
                        status: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    }, o)
                }, t => {
                    const {
                        message: s,
                        response: i
                    } = t;
                    e(s, i, i && i.body)
                })
            }
        }
        time(t, e = null) {
            const s = e ? new Date(e) : new Date;
            let i = {
                "M+": s.getMonth() + 1,
                "d+": s.getDate(),
                "H+": s.getHours(),
                "m+": s.getMinutes(),
                "s+": s.getSeconds(),
                "q+": Math.floor((s.getMonth() + 3) / 3),
                S: s.getMilliseconds()
            };
            /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length)));
            for (let e in i)
                new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length)));
            return t
        }
        msg(e = t, s = "", i = "", r) {
            const o = t => {
                if (!t)
                    return t;
                if ("string" == typeof t)
                    return this.isLoon() ? t : this.isQuanX() ? {
                        "open-url": t
                    }
                        : this.isSurge() ? {
                            url: t
                        }
                            : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        let e = t.openUrl || t.url || t["open-url"],
                            s = t.mediaUrl || t["media-url"];
                        return {
                            openUrl: e,
                            mediaUrl: s
                        }
                    }
                    if (this.isQuanX()) {
                        let e = t["open-url"] || t.url || t.openUrl,
                            s = t["media-url"] || t.mediaUrl;
                        return {
                            "open-url": e,
                            "media-url": s
                        }
                    }
                    if (this.isSurge()) {
                        let e = t.url || t.openUrl || t["open-url"];
                        return {
                            url: e
                        }
                    }
                }
            };
            if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) {
                let t = ["", "==============📣系统通知📣=============="];
                t.push(e),
                    s && t.push(s),
                    i && t.push(i),
                    console.log(t.join("\n")),
                    this.logs = this.logs.concat(t)
            }
        }
        log(...t) {
            t.length > 0 && (this.logs = [...this.logs, ...t]),
                console.log(t.join(this.logSeparator))
        }
        logErr(t, e) {
            const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t)
        }
        wait(t) {
            return new Promise(e => setTimeout(e, t))
        }
        done(t = {}) {
            const e = (new Date).getTime(),
                s = (e - this.startTime) / 1e3;
            this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`),
                this.log(),
                (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
        }
    }
        (t, e)
}