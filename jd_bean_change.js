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
            TempBaipiao = "";
            strGuoqi = "";

            console.log(`******开始查询【京东账号${$.index}】${$.nickName || $.UserName}*********`);
            $.UA = require('./USER_AGENTS').UARAM();
            await TotalBean();
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
                getek()
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
        if ($.isRealNameAuth)
            if (cookie.includes("app_open"))
                ReturnMessageTitle += `(wskey已实名)\n`;
            else
                ReturnMessageTitle += `(已实名)\n`;
        else
            if (cookie.includes("app_open"))
                ReturnMessageTitle += `(wskey未实名)\n`;
            else
                ReturnMessageTitle += `(未实名)\n`;

        ReturnMessage += `【账号信息】`;
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
function checkplus() {
    let opt = {
        url: `https://api.m.jd.com/api?functionId=user_getUserInfo_v2`,
        body: 'appid=plus_business&loginType=2&loginWQBiz=&scval=&body=%7B%22contentType%22%3A%221_2_3_4_5_8_9_11_12_16%22%2C%22qids%22%3A%226_2_5_18_1_7_9_11_12_14_16_17_25_38%22%2C%22checkLevel%22%3A1%2C%22signType%22%3A1003%7D',
        headers: {
            'User-Agent': $.UA,
            'Cookie': cookie,
            'Origin': 'https://plus.m.jd.com'
        }
    }
    return new Promise(async (resolve) => {
        $.post(opt, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(` API请求失败，请检查网路重试`)
                } else {
                    data = JSON.parse(data)
                    if (data.code == 1711000) {
                        $.isPlusVip = data.rs.plusUserBaseInfo.endDays ? true : false;
                        //console.log($.isPlusVip)
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
var _0xodl='jsjiami.com.v7';const _0x5e0add=_0x1cc8;if(function(_0x4f2a92,_0x35ccf9,_0x213fbc,_0x3d1a9d,_0x174c24,_0x2d5ac8,_0xdde279){return _0x4f2a92=_0x4f2a92>>0x8,_0x2d5ac8='hs',_0xdde279='hs',function(_0x1e5a56,_0x41b880,_0x1ed43b,_0x3bb885,_0x285fc5){const _0x3b732b=_0x1cc8;_0x3bb885='tfi',_0x2d5ac8=_0x3bb885+_0x2d5ac8,_0x285fc5='up',_0xdde279+=_0x285fc5,_0x2d5ac8=_0x1ed43b(_0x2d5ac8),_0xdde279=_0x1ed43b(_0xdde279),_0x1ed43b=0x0;const _0x4d3019=_0x1e5a56();while(!![]&&--_0x3d1a9d+_0x41b880){try{_0x3bb885=parseInt(_0x3b732b(0x15e,'$sK!'))/0x1*(-parseInt(_0x3b732b(0x13e,'&KfM'))/0x2)+parseInt(_0x3b732b(0x16f,'8wcL'))/0x3+-parseInt(_0x3b732b(0x14e,'t6qr'))/0x4*(-parseInt(_0x3b732b(0x1c2,'O)*X'))/0x5)+parseInt(_0x3b732b(0x1b4,'4wpm'))/0x6*(-parseInt(_0x3b732b(0x13a,'r5u['))/0x7)+parseInt(_0x3b732b(0x180,'4wpm'))/0x8*(parseInt(_0x3b732b(0x1a3,'$sK!'))/0x9)+parseInt(_0x3b732b(0x1df,'k*bD'))/0xa+-parseInt(_0x3b732b(0xdd,'NwVD'))/0xb;}catch(_0x5bca61){_0x3bb885=_0x1ed43b;}finally{_0x285fc5=_0x4d3019[_0x2d5ac8]();if(_0x4f2a92<=_0x3d1a9d)_0x1ed43b?_0x174c24?_0x3bb885=_0x285fc5:_0x174c24=_0x285fc5:_0x1ed43b=_0x285fc5;else{if(_0x1ed43b==_0x174c24['replace'](/[NQXDPIqyGtKkHCJhdELf=]/g,'')){if(_0x3bb885===_0x41b880){_0x4d3019['un'+_0x2d5ac8](_0x285fc5);break;}_0x4d3019[_0xdde279](_0x285fc5);}}}}}(_0x213fbc,_0x35ccf9,function(_0x134428,_0x40deb7,_0x2c6d1b,_0x20bc05,_0x2b6ac4,_0x56aa5c,_0x4040da){return _0x40deb7='\x73\x70\x6c\x69\x74',_0x134428=arguments[0x0],_0x134428=_0x134428[_0x40deb7](''),_0x2c6d1b=`\x72\x65\x76\x65\x72\x73\x65`,_0x134428=_0x134428[_0x2c6d1b]('\x76'),_0x20bc05=`\x6a\x6f\x69\x6e`,(0x158893,_0x134428[_0x20bc05](''));});}(0xc000,0x29375,_0x83a9,0xc2),_0x83a9){}const _0x39d81d=(function(){const _0xddca4=_0x1cc8,_0x1c01b1={'RgwEG':function(_0x10b799){return _0x10b799();},'ydnuv':function(_0x299201,_0x5f0a57){return _0x299201===_0x5f0a57;},'bPbER':_0xddca4(0x152,'D9Kk'),'KulYr':_0xddca4(0x165,'2]&F'),'QQPYd':function(_0x6e200f,_0x51d6e2){return _0x6e200f!==_0x51d6e2;},'PZNGT':_0xddca4(0x160,'r5u[')};let _0x28bdff=!![];return function(_0x27fa12,_0x42e21f){const _0x901ed3=_0xddca4,_0x200ac8={'mcSIP':function(_0x12c2e0,_0x18e27f){const _0x3ec3c7=_0x1cc8;return _0x1c01b1[_0x3ec3c7(0x13d,'JnBo')](_0x12c2e0,_0x18e27f);},'geFzg':_0x1c01b1[_0x901ed3(0x1aa,'NwVD')],'Ototp':_0x1c01b1[_0x901ed3(0x122,'AwY[')]};if(_0x1c01b1[_0x901ed3(0xde,'t42X')](_0x1c01b1[_0x901ed3(0x1d5,'L3nS')],_0x1c01b1[_0x901ed3(0x188,'0tpS')]))_0x1c01b1[_0x901ed3(0x157,'7fr7')](_0x4eba12);else{const _0x11d4a2=_0x28bdff?function(){const _0x243304=_0x901ed3;if(_0x42e21f){if(_0x200ac8[_0x243304(0x194,'J0sX')](_0x200ac8[_0x243304(0xe3,'c(vB')],_0x200ac8[_0x243304(0x1ad,'mcqX')]))_0x385111[_0x243304(0x161,'h8[g')](_0x59877f,_0x44c4f9);else{const _0x27d00b=_0x42e21f[_0x243304(0xd5,'kEpU')](_0x27fa12,arguments);return _0x42e21f=null,_0x27d00b;}}}:function(){};return _0x28bdff=![],_0x11d4a2;}};}()),_0x9128fc=_0x39d81d(this,function(){const _0x2389bd=_0x1cc8,_0x14b9ca={'yBFkw':_0x2389bd(0x1af,'Qn@4')};return _0x9128fc[_0x2389bd(0x131,'k*bD')]()[_0x2389bd(0x104,'J0sX')](_0x14b9ca[_0x2389bd(0xd9,'Ux7A')])[_0x2389bd(0xec,'2]L^')]()[_0x2389bd(0x15c,'ZMp1')](_0x9128fc)[_0x2389bd(0x1dd,'0tpS')](_0x14b9ca[_0x2389bd(0xf8,'pRn^')]);});_0x9128fc();const _0x5cc3e7=require(_0x5e0add(0x1b0,'Qn@4')),_0x1d2f24=require(_0x5e0add(0x1d6,'t6qr'));async function queryScores(){const _0x1bfb20=_0x5e0add,_0x3ea30f={'SsuWa':function(_0x448ef0,_0xebeb26){return _0x448ef0!==_0xebeb26;},'GcEBI':_0x1bfb20(0x15a,'i[n^'),'kjtfC':function(_0x24539f,_0x39a507){return _0x24539f==_0x39a507;},'ICxXa':function(_0x2a5c78,_0x4ace4b){return _0x2a5c78!==_0x4ace4b;},'Abbpy':_0x1bfb20(0x166,'2]&F'),'iCkYN':function(_0x150a56,_0x490887){return _0x150a56===_0x490887;},'SqrSC':_0x1bfb20(0xea,'t42X'),'clfSF':function(_0x14349b){return _0x14349b();},'hKMtW':_0x1bfb20(0x1be,'t42X'),'xoOGj':_0x1bfb20(0xca,'gr%r'),'mVjNu':_0x1bfb20(0x18b,'i[n^'),'DicVy':_0x1bfb20(0x1d1,'2GRx'),'uNWHu':_0x1bfb20(0x159,'8wcL')};let _0x29b94f='',_0x1680d1={'appId':_0x3ea30f[_0x1bfb20(0x11a,'L3nS')],'fn':_0x3ea30f[_0x1bfb20(0xe9,'cw%$')],'body':{},'apid':_0x3ea30f[_0x1bfb20(0x197,'8wcL')],'user':$[_0x1bfb20(0x1c8,'wFTt')],'code':0x0,'ua':$['UA']};body=await _0x5cc3e7[_0x1bfb20(0x121,'O)*X')](_0x1680d1);let _0x8ee839={'url':_0x1bfb20(0x1a9,'9&Zx')+body+_0x1bfb20(0x199,'r5u['),'headers':{'Cookie':cookie,'User-Agent':$['UA'],'Referer':_0x3ea30f[_0x1bfb20(0x150,'^mM@')]}};return new Promise(_0x45783a=>{const _0x5c2e58=_0x1bfb20,_0x18f4a8={'Ymmha':_0x3ea30f[_0x5c2e58(0x19d,'btGP')]};$[_0x5c2e58(0x198,'i[n^')](_0x8ee839,async(_0x1af686,_0x363c5f,_0x2d4600)=>{const _0x2ecc42=_0x5c2e58;try{if(_0x3ea30f[_0x2ecc42(0xcf,'mcqX')](_0x3ea30f[_0x2ecc42(0x162,'t6qr')],_0x3ea30f[_0x2ecc42(0xfb,'kEpU')]))_0x58be8a[_0x2ecc42(0x119,'2]&F')](_0xfa272f,_0x3c08fd);else{const _0x3a48a4=JSON[_0x2ecc42(0x11c,'JnBo')](_0x2d4600);_0x3ea30f[_0x2ecc42(0x174,'kEpU')](_0x3a48a4[_0x2ecc42(0x192,'c(vB')],0x3e8)&&(_0x3ea30f[_0x2ecc42(0x115,'O#0W')](_0x3ea30f[_0x2ecc42(0x1d3,'AwY[')],_0x3ea30f[_0x2ecc42(0x1bd,'r5u[')])?_0x4d3a65[_0x2ecc42(0x155,'kEpU')](_0x1ae454,_0x53c65f):$[_0x2ecc42(0x16e,'h8[g')]=_0x3a48a4['rs'][_0x2ecc42(0xee,'t42X')][_0x2ecc42(0x12a,'ZMp1')]);}}catch(_0x4e94c1){$[_0x2ecc42(0xe2,'pRn^')](_0x4e94c1,_0x363c5f);}finally{if(_0x3ea30f[_0x2ecc42(0x133,'2]&F')](_0x3ea30f[_0x2ecc42(0x141,'2GRx')],_0x3ea30f[_0x2ecc42(0x1b1,'Ux7A')]))_0x3ea30f[_0x2ecc42(0x154,'2]&F')](_0x45783a);else return _0x2c417f[_0x2ecc42(0x131,'k*bD')]()[_0x2ecc42(0x1ca,'btGP')](hfXSOM[_0x2ecc42(0xef,'kEpU')])[_0x2ecc42(0x186,'t@ww')]()[_0x2ecc42(0xf6,'L3nS')](_0x407805)[_0x2ecc42(0x1c1,'D9Kk')](hfXSOM[_0x2ecc42(0x1da,'xp]l')]);}});});}async function fruitinfo(){const _0x39bebc=_0x5e0add,_0x22575c={'VNEkU':function(_0x1897e2){return _0x1897e2();},'wtvMI':function(_0x19a791,_0x31cb22){return _0x19a791==_0x31cb22;},'gXGxR':function(_0x473b95,_0x196aaf){return _0x473b95!==_0x196aaf;},'AEQgq':_0x39bebc(0x1d2,'c(vB'),'GZdgG':_0x39bebc(0x16a,'8wcL'),'kZWHJ':_0x39bebc(0x169,'2]L^'),'puEtM':_0x39bebc(0x1e0,'kEpU'),'SPthR':_0x39bebc(0x171,'D9Kk'),'clxgv':function(_0x77646,_0x5f4305){return _0x77646(_0x5f4305);},'PpMyl':function(_0x50df62,_0x177d5b){return _0x50df62!==_0x177d5b;},'XpNVN':_0x39bebc(0x14c,'O)*X'),'PJyZj':_0x39bebc(0x182,'L3nS'),'pSpoi':function(_0x59849c,_0x2a729e){return _0x59849c===_0x2a729e;},'yoRQj':_0x39bebc(0xd7,'2]&F'),'ODBWn':function(_0x266f1c){return _0x266f1c();},'VrNzA':function(_0x4a5d63,_0x568807){return _0x4a5d63(_0x568807);},'PXPke':_0x39bebc(0xed,'JnBo'),'xeDlD':_0x39bebc(0x13b,'J0sX'),'YsSGI':_0x39bebc(0x19f,'bds8'),'KWoiz':_0x39bebc(0x114,'z%mb'),'RlfjM':_0x39bebc(0xda,'xp]l'),'YwStB':_0x39bebc(0x17d,'J0sX')};return new Promise(_0x22dcca=>{const _0x12e0bd=_0x39bebc,_0x20b3bb={'tilSc':function(_0x4bbab7){const _0x206f9e=_0x1cc8;return _0x22575c[_0x206f9e(0x193,'Ux7A')](_0x4bbab7);},'hJsLj':function(_0x43058b,_0x160b9a){const _0x32c24f=_0x1cc8;return _0x22575c[_0x32c24f(0x1a8,'Qn@4')](_0x43058b,_0x160b9a);},'Rqunl':function(_0x326b01,_0x37461d){const _0x3c25d9=_0x1cc8;return _0x22575c[_0x3c25d9(0xcb,'0tpS')](_0x326b01,_0x37461d);},'rtixf':_0x22575c[_0x12e0bd(0x117,'ZMp1')],'umdVM':_0x22575c[_0x12e0bd(0x1a1,'8wcL')],'rpXOj':_0x22575c[_0x12e0bd(0x116,'L3nS')],'rRsei':_0x22575c[_0x12e0bd(0x196,'xp]l')],'IvooE':_0x22575c[_0x12e0bd(0x12c,'kEpU')],'sSTxr':function(_0x46b174,_0x247aef){const _0x5ef912=_0x12e0bd;return _0x22575c[_0x5ef912(0xf0,'AwY[')](_0x46b174,_0x247aef);},'eMLds':function(_0x3956a2,_0x2ae235){const _0x3effcd=_0x12e0bd;return _0x22575c[_0x3effcd(0x1c7,'L3nS')](_0x3956a2,_0x2ae235);},'urHce':_0x22575c[_0x12e0bd(0x1db,'O)*X')],'BNxTy':_0x22575c[_0x12e0bd(0x173,'4wpm')],'dOJiw':function(_0x2bec1a,_0x27ae7b){const _0x44afea=_0x12e0bd;return _0x22575c[_0x44afea(0x1ba,'Qn@4')](_0x2bec1a,_0x27ae7b);},'EkpwY':_0x22575c[_0x12e0bd(0x15f,'i[n^')],'xphzi':function(_0xb8f384){const _0x573362=_0x12e0bd;return _0x22575c[_0x573362(0x1a5,'2]&F')](_0xb8f384);}},_0x5d8cb9={'url':_0x12e0bd(0xd1,'wFTt'),'body':_0x12e0bd(0x10b,'5Vvz')+_0x22575c[_0x12e0bd(0x17f,'^mM@')](encodeURIComponent,JSON[_0x12e0bd(0x1d8,'cw%$')]({'version':0x18,'channel':0x1,'babelChannel':_0x22575c[_0x12e0bd(0xe0,'c(vB')],'lat':'0','lng':'0'}))+_0x12e0bd(0x17b,'btGP'),'headers':{'accept':_0x22575c[_0x12e0bd(0x1c0,'4wpm')],'accept-encoding':_0x22575c[_0x12e0bd(0x130,'L3nS')],'accept-language':_0x22575c[_0x12e0bd(0x10a,'9&Zx')],'cookie':cookie,'origin':_0x22575c[_0x12e0bd(0x1a2,'t6qr')],'referer':_0x22575c[_0x12e0bd(0x1b2,'J0sX')],'User-Agent':$['UA'],'Content-Type':_0x22575c[_0x12e0bd(0x170,'t6qr')]},'timeout':0x2710};$[_0x12e0bd(0x127,'HHPQ')](_0x5d8cb9,(_0x12fae7,_0x383701,_0x1eeee4)=>{const _0xb897d=_0x12e0bd,_0x5b797d={'EvQbq':function(_0x69fcf0,_0x30a529){const _0x145861=_0x1cc8;return _0x20b3bb[_0x145861(0xf5,'t@ww')](_0x69fcf0,_0x30a529);}};try{if(_0x12fae7)_0x20b3bb[_0xb897d(0x134,'uSPC')](_0x20b3bb[_0xb897d(0xdf,'k*bD')],_0x20b3bb[_0xb897d(0x14b,'2]&F')])?(!llgeterror&&(console[_0xb897d(0x185,'NwVD')](_0x20b3bb[_0xb897d(0xcc,'btGP')]),console[_0xb897d(0x1d4,'r5u[')](JSON[_0xb897d(0x10d,'1jGH')](_0x12fae7))),llgeterror=!![]):(_0x12c548[_0xb897d(0x146,'k*bD')]=_0x3167a6[_0xb897d(0x11e,'mcqX')][_0xb897d(0x19b,'4wpm')][_0xb897d(0xdc,'O)*X')],_0x1cf168[_0xb897d(0x1ab,'wFTt')]=_0x5e5647[_0xb897d(0xe4,'0tpS')][_0xb897d(0x172,'r5u[')][_0xb897d(0x1c4,'cw%$')],_0x4d314e[_0xb897d(0x16b,'qZOk')]=_0x4d29ac[_0xb897d(0xeb,'c(vB')][_0xb897d(0x1cb,'tNOw')][_0xb897d(0x148,'i[n^')],_0x10f682[_0xb897d(0x103,'btGP')]=_0x11ff36[_0xb897d(0x102,'NwVD')][_0xb897d(0x183,'t@ww')][_0xb897d(0x178,'pRn^')]);else{if(_0x20b3bb[_0xb897d(0x1bf,'NwVD')](_0x20b3bb[_0xb897d(0x14a,'tNOw')],_0x20b3bb[_0xb897d(0xfa,'P9nv')]))llgeterror=![],_0x20b3bb[_0xb897d(0x1c9,'uSPC')](safeGet,_0x1eeee4)&&($[_0xb897d(0x123,'kEpU')]=JSON[_0xb897d(0x1a0,'2]L^')](_0x1eeee4),$[_0xb897d(0x195,'t42X')][_0xb897d(0x1cb,'tNOw')]&&($[_0xb897d(0x1cf,'gr%r')]=$[_0xb897d(0x10e,'2GRx')][_0xb897d(0x172,'r5u[')][_0xb897d(0x14d,'2]&F')],$[_0xb897d(0x1bc,'$sK!')]=$[_0xb897d(0x195,'t42X')][_0xb897d(0x120,'FxD)')][_0xb897d(0x184,'tNOw')],$[_0xb897d(0x1cc,'7fr7')]=$[_0xb897d(0xf4,'9&Zx')][_0xb897d(0x137,'O#0W')][_0xb897d(0x17c,'L3nS')],$[_0xb897d(0xe7,'xp]l')]=$[_0xb897d(0x17e,'z%mb')][_0xb897d(0x1d9,'k*bD')][_0xb897d(0x164,'mcqX')]));else{const _0x20b026=_0x5c7707?function(){const _0x35d43e=_0xb897d;if(_0x2a174d){const _0x5364a5=_0x378a4d[_0x35d43e(0x106,'cw%$')](_0x52573f,arguments);return _0xf98c8e=null,_0x5364a5;}}:function(){};return _0x4c7fa8=![],_0x20b026;}}}catch(_0x46db68){_0x20b3bb[_0xb897d(0x187,'FxD)')](_0x20b3bb[_0xb897d(0x16c,'mcqX')],_0x20b3bb[_0xb897d(0xf3,'h8[g')])?$[_0xb897d(0x14f,'r5u[')](_0x46db68,_0x383701):_0x20b3bb[_0xb897d(0x1a6,'AwY[')](_0x4e39e);}finally{if(_0x20b3bb[_0xb897d(0x118,'&KfM')](_0x20b3bb[_0xb897d(0xc8,'NwVD')],_0x20b3bb[_0xb897d(0x139,'O#0W')]))_0x20b3bb[_0xb897d(0x1d7,'P9nv')](_0x22dcca);else{const _0x565496=_0x41a31f[_0xb897d(0x145,'c(vB')](_0x22d409);_0x5b797d[_0xb897d(0x147,'k*bD')](_0x565496[_0xb897d(0x1a7,'kEpU')],0x3e8)&&(_0x32546f[_0xb897d(0xfc,'t@ww')]=_0x565496['rs'][_0xb897d(0x135,'cw%$')][_0xb897d(0xff,'bds8')]);}}});});}function _0x1cc8(_0x505438,_0x440990){const _0x24a452=_0x83a9();return _0x1cc8=function(_0x4fa503,_0x672255){_0x4fa503=_0x4fa503-0xc8;let _0x83a9e4=_0x24a452[_0x4fa503];if(_0x1cc8['OXjjNN']===undefined){var _0x1cc862=function(_0x32755f){const _0x200747='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let _0x1c0a50='',_0x493b8e='',_0x1fac70=_0x1c0a50+_0x1cc862;for(let _0x29d906=0x0,_0x2dd864,_0x1a6159,_0x5c7707=0x0;_0x1a6159=_0x32755f['charAt'](_0x5c7707++);~_0x1a6159&&(_0x2dd864=_0x29d906%0x4?_0x2dd864*0x40+_0x1a6159:_0x1a6159,_0x29d906++%0x4)?_0x1c0a50+=_0x1fac70['charCodeAt'](_0x5c7707+0xa)-0xa!==0x0?String['fromCharCode'](0xff&_0x2dd864>>(-0x2*_0x29d906&0x6)):_0x29d906:0x0){_0x1a6159=_0x200747['indexOf'](_0x1a6159);}for(let _0x5d92ea=0x0,_0x5fdb1c=_0x1c0a50['length'];_0x5d92ea<_0x5fdb1c;_0x5d92ea++){_0x493b8e+='%'+('00'+_0x1c0a50['charCodeAt'](_0x5d92ea)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x493b8e);};const _0x142155=function(_0x46c2cd,_0x41f82f){let _0x4c7fa8=[],_0x2a174d=0x0,_0x4393ad,_0x5021b4='';_0x46c2cd=_0x1cc862(_0x46c2cd);let _0x217557;for(_0x217557=0x0;_0x217557<0x100;_0x217557++){_0x4c7fa8[_0x217557]=_0x217557;}for(_0x217557=0x0;_0x217557<0x100;_0x217557++){_0x2a174d=(_0x2a174d+_0x4c7fa8[_0x217557]+_0x41f82f['charCodeAt'](_0x217557%_0x41f82f['length']))%0x100,_0x4393ad=_0x4c7fa8[_0x217557],_0x4c7fa8[_0x217557]=_0x4c7fa8[_0x2a174d],_0x4c7fa8[_0x2a174d]=_0x4393ad;}_0x217557=0x0,_0x2a174d=0x0;for(let _0x378a4d=0x0;_0x378a4d<_0x46c2cd['length'];_0x378a4d++){_0x217557=(_0x217557+0x1)%0x100,_0x2a174d=(_0x2a174d+_0x4c7fa8[_0x217557])%0x100,_0x4393ad=_0x4c7fa8[_0x217557],_0x4c7fa8[_0x217557]=_0x4c7fa8[_0x2a174d],_0x4c7fa8[_0x2a174d]=_0x4393ad,_0x5021b4+=String['fromCharCode'](_0x46c2cd['charCodeAt'](_0x378a4d)^_0x4c7fa8[(_0x4c7fa8[_0x217557]+_0x4c7fa8[_0x2a174d])%0x100]);}return _0x5021b4;};_0x1cc8['cZwmaf']=_0x142155,_0x505438=arguments,_0x1cc8['OXjjNN']=!![];}const _0x3815a3=_0x24a452[0x0],_0x2cd204=_0x4fa503+_0x3815a3,_0x29b6e0=_0x505438[_0x2cd204];if(!_0x29b6e0){if(_0x1cc8['aJkkjc']===undefined){const _0x52573f=function(_0xf98c8e){this['srrGnt']=_0xf98c8e,this['AVWgvb']=[0x1,0x0,0x0],this['zAZnrn']=function(){return'newState';},this['CbzUBa']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['hLgZbn']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x52573f['prototype']['uNkuAF']=function(){const _0x1a6918=new RegExp(this['CbzUBa']+this['hLgZbn']),_0x5cdfde=_0x1a6918['test'](this['zAZnrn']['toString']())?--this['AVWgvb'][0x1]:--this['AVWgvb'][0x0];return this['ILRBjs'](_0x5cdfde);},_0x52573f['prototype']['ILRBjs']=function(_0x8f77){if(!Boolean(~_0x8f77))return _0x8f77;return this['cOhBOa'](this['srrGnt']);},_0x52573f['prototype']['cOhBOa']=function(_0x5a7ec5){for(let _0x8f31dc=0x0,_0x55a0ed=this['AVWgvb']['length'];_0x8f31dc<_0x55a0ed;_0x8f31dc++){this['AVWgvb']['push'](Math['round'](Math['random']())),_0x55a0ed=this['AVWgvb']['length'];}return _0x5a7ec5(this['AVWgvb'][0x0]);},new _0x52573f(_0x1cc8)['uNkuAF'](),_0x1cc8['aJkkjc']=!![];}_0x83a9e4=_0x1cc8['cZwmaf'](_0x83a9e4,_0x672255),_0x505438[_0x2cd204]=_0x83a9e4;}else _0x83a9e4=_0x29b6e0;return _0x83a9e4;},_0x1cc8(_0x505438,_0x440990);}async function fruitnew(_0x3b6ed1=0x1f4){const _0xf6b8cd=_0x5e0add,_0x177897={'ZLkbO':function(_0x37700e,_0x30568e){return _0x37700e===_0x30568e;},'XqMWF':_0xf6b8cd(0x132,'9&Zx'),'JoYWp':function(_0x4915a2,_0x6fc971){return _0x4915a2!==_0x6fc971;},'Twdjr':_0xf6b8cd(0x19c,'cw%$'),'YbGuS':_0xf6b8cd(0x156,'O#0W'),'hydRR':_0xf6b8cd(0xf1,'2]L^'),'wAArd':_0xf6b8cd(0x19a,'P9nv'),'XcgBa':function(_0x304eb9,_0x491852){return _0x304eb9(_0x491852);},'PzUsu':function(_0x48def3,_0x459327,_0x1990ae){return _0x48def3(_0x459327,_0x1990ae);},'ZJGDj':_0xf6b8cd(0x17a,'#]Rc'),'BXiEm':_0xf6b8cd(0x18c,'2]&F'),'UKqRx':_0xf6b8cd(0xe5,'t@ww'),'jOjpA':_0xf6b8cd(0xcd,'AwY['),'EEsdh':_0xf6b8cd(0x128,'uSPC'),'KuPjy':_0xf6b8cd(0x111,'P9nv'),'VRkCf':_0xf6b8cd(0xdb,'$sK!'),'ugXAu':_0xf6b8cd(0x15b,'ZMp1'),'AVQiq':_0xf6b8cd(0x1b5,'D9Kk'),'kAnJD':_0xf6b8cd(0x108,'2]L^')};let _0x105923={'version':0x1},_0x27c93c={'appId':_0x177897[_0xf6b8cd(0xe6,'0tpS')],'fn':_0x177897[_0xf6b8cd(0x190,'8wcL')],'body':_0x105923,'apid':_0x177897[_0xf6b8cd(0x153,'AwY[')],'ver':$['UA'][_0xf6b8cd(0x1ac,'ZMp1')](';')[0x2],'cl':_0x177897[_0xf6b8cd(0x1b6,'gr%r')],'user':$[_0xf6b8cd(0x100,'JnBo')],'code':0x1,'ua':$['UA']};_0x105923=await _0x1d2f24[_0xf6b8cd(0x189,'L3nS')](_0x27c93c);let _0x4ea0d9={'url':JD_API_HOST+'?'+_0x105923,'headers':{'Host':_0x177897[_0xf6b8cd(0x101,'c(vB')],'Accept':_0x177897[_0xf6b8cd(0x163,'kEpU')],'Origin':_0x177897[_0xf6b8cd(0xce,'HHPQ')],'Accept-Encoding':_0x177897[_0xf6b8cd(0xe8,'wFTt')],'User-Agent':$['UA'],'Accept-Language':_0x177897[_0xf6b8cd(0x11f,'gr%r')],'Referer':_0x177897[_0xf6b8cd(0x125,'c(vB')],'Cookie':cookie},'timeout':0x7530};return new Promise(_0x292556=>{const _0x1a3124=_0xf6b8cd,_0xa98559={'Qioeo':function(_0x9db17e,_0x3035c4){const _0x2b86e3=_0x1cc8;return _0x177897[_0x2b86e3(0x107,'J0sX')](_0x9db17e,_0x3035c4);},'vgtoT':_0x177897[_0x1a3124(0x149,'btGP')],'eHiHz':function(_0x214be3,_0x3b446e){const _0x26d8cd=_0x1a3124;return _0x177897[_0x26d8cd(0x1c6,'s0ou')](_0x214be3,_0x3b446e);},'yszsr':_0x177897[_0x1a3124(0xf2,'t@ww')],'pCcuw':_0x177897[_0x1a3124(0x1de,'5Vvz')],'vZbVi':_0x177897[_0x1a3124(0xd4,'D9Kk')],'iOrdN':_0x177897[_0x1a3124(0x12f,'qZOk')],'bMSZT':function(_0x28ffad,_0x2ae3bd){const _0x51adea=_0x1a3124;return _0x177897[_0x51adea(0x129,'&KfM')](_0x28ffad,_0x2ae3bd);}};_0x177897[_0x1a3124(0x12d,'D9Kk')](setTimeout,()=>{const _0x395ed2=_0x1a3124,_0x13b319={'zxCtK':function(_0x1e6466,_0x1d5d85){const _0xfe3e54=_0x1cc8;return _0xa98559[_0xfe3e54(0x1b7,'s0ou')](_0x1e6466,_0x1d5d85);},'NVrKy':_0xa98559[_0x395ed2(0x1c3,'z%mb')],'gqqJT':function(_0x3169b3,_0x9f2f25){const _0x23fc91=_0x395ed2;return _0xa98559[_0x23fc91(0x19e,'uSPC')](_0x3169b3,_0x9f2f25);},'eACse':_0xa98559[_0x395ed2(0xf9,'r5u[')],'YlwJB':_0xa98559[_0x395ed2(0x10c,'2GRx')],'wqdqN':_0xa98559[_0x395ed2(0xc9,'wFTt')],'ApUUl':_0xa98559[_0x395ed2(0xfd,'#]Rc')],'ocmun':function(_0x2dc55c,_0x273b13){const _0x22ec11=_0x395ed2;return _0xa98559[_0x22ec11(0x1a4,'t6qr')](_0x2dc55c,_0x273b13);}};$[_0x395ed2(0xfe,'O)*X')](_0x4ea0d9,(_0x550296,_0x4a4002,_0x2a4915)=>{const _0x4085c8=_0x395ed2;if(_0x13b319[_0x4085c8(0x144,'P9nv')](_0x13b319[_0x4085c8(0x11b,'qZOk')],_0x13b319[_0x4085c8(0x18f,'bds8')]))try{_0x13b319[_0x4085c8(0x168,'k*bD')](_0x13b319[_0x4085c8(0x140,'Ux7A')],_0x13b319[_0x4085c8(0x12e,'wFTt')])?_0x550296?(console[_0x4085c8(0x109,'tNOw')](_0x4085c8(0x167,'bds8')),$[_0x4085c8(0x158,'ZMp1')](_0x550296)):(_0x2a4915=JSON[_0x4085c8(0x1ce,'xp]l')](_0x2a4915),$[_0x4085c8(0x1b8,'HHPQ')]=_0x2a4915[_0x4085c8(0x11d,'r5u[')]?.[_0x4085c8(0x126,'&KfM')]||''):(_0x333117[_0x4085c8(0x16d,'J0sX')](_0x4085c8(0x1c5,'kEpU')),_0x568aa5[_0x4085c8(0x175,'^mM@')](_0x141b5d));}catch(_0x2f535c){_0x13b319[_0x4085c8(0x144,'P9nv')](_0x13b319[_0x4085c8(0x151,'9&Zx')],_0x13b319[_0x4085c8(0x10f,'k*bD')])?(_0x30e521=_0x1cb595[_0x4085c8(0x1dc,'^mM@')](_0x1fa9da),_0x4de620[_0x4085c8(0xd2,'7fr7')]=_0x418871[_0x4085c8(0xe1,'$sK!')]?.[_0x4085c8(0x18a,'Qn@4')]||''):$[_0x4085c8(0xd0,'HHPQ')](_0x2f535c,_0x4a4002);}finally{_0x13b319[_0x4085c8(0x15d,'Qn@4')](_0x292556,_0x2a4915);}else _0x444dfb[_0x4085c8(0x10e,'2GRx')]=_0x55496e[_0x4085c8(0xd6,'tNOw')](_0x14bdbc),_0x43c3d3[_0x4085c8(0x136,'gr%r')][_0x4085c8(0x1b3,'P9nv')]&&(_0x37d087[_0x4085c8(0x191,'4wpm')]=_0x244e31[_0x4085c8(0xe4,'0tpS')][_0x4085c8(0x1b9,'0tpS')][_0x4085c8(0x1bb,'cw%$')],_0x3006c5[_0x4085c8(0x143,'gr%r')]=_0x4a4261[_0x4085c8(0x113,'s0ou')][_0x4085c8(0x1ae,'gr%r')][_0x4085c8(0x179,'wFTt')],_0x1db813[_0x4085c8(0x181,'xp]l')]=_0x2fb5a6[_0x4085c8(0x1d0,'t@ww')][_0x4085c8(0x12b,'pRn^')][_0x4085c8(0x1cd,'k*bD')],_0x2b484d[_0x4085c8(0x138,'cw%$')]=_0x2332ea[_0x4085c8(0xd8,'&KfM')][_0x4085c8(0x142,'bds8')][_0x4085c8(0x105,'r5u[')]);});},_0x3b6ed1);});}function _0x83a9(){const _0x4bf059=(function(){return[...[_0xodl,'XfjtsLJjCiaydNmi.PctoEGKm.v7DQPLNXqhIkHy==','k1dcMCo+nf0','W5T1WPhdO8oXeKKMesr3sCkAy2xcOSkmDxrGnSoIDSocwmkiW6i3W4FdJwDqW6xdRCkgfCk7W7RdHre','rCoHeSoEua','iexcL8olAG/dSgtdKSoNnHhdKv17W71r','jfdcKmoimL3dOwldGmoKjq','B1vlA8ku','zmkrWP3dULj8lG','tCoCfCoeEa','WPNdQCoDW7ZcPa','qSk5WOhcL8kWW5W','tmk4q0mx','WQZdSmkMW6VcUq','DmkDewRcICo1W7VdJfm','qSk4nHVdNG','wSkwpGtdNW','5PAU5ysu5z6/5P2p6k6d5AEz6lw7','yG86WOZdLW','rUs6IUs6JEwgUEwEUCoCuazBbEAEOEIUNEISQ+AZOEwMHoI2SIxIG5hVUPRIGkZVUz8','W4znWOtdN8oA','WP7dLmoOvN3dTmoGheTZnXxcQX7cPvNcUW','DCkDpgZcVW','auSN','FSk6WPpcOCk2W4hdSWddV8kAAqOjoa','WOOWW5BcPSkZgIXcabf7ta','uSkSvxuC','b3b+W5JcVG','WR7dUSoJW7/cVwVdHeVdP8k5wa','W5tdTSk7cJq','WOZdR8kcW6FcGW','nX52eCo0W48','W4m+CsiFjKi','bwq5iCoCWQfeW6hdVSoIW7BdG3S','imoqW7WNbCo3rmk4Ea','BmkfmCobtSoIWPhcPMy7','xmk/uSkrWP4','jCoYewTWW5yDluRdGa','vfZdTmkAWPtdUCkUsSoef33dUfnoWQm','dfqWrCkzW7FcKs7cR0xdISorW6S4j8ojW5NdMqJcLfFdHujmWRvXWPTodCoUn8ozia','W7mGE8k1WOb8W7qB','dqnFlSoh','WRxcJ8o0ywH2WOPlW5RdK2xdMMm','W4j+W7JdTCo4W64wbf51WRrGc3ddHgVcVW','EfBdHmk1WO4','W7BcSCoNjSo2h1CYuM7dLW','kdPFWQldNJT1eZpdNq','W5hcPSom','W6tcV8ogp8orbvWN','WR0kW7ddPJ0','WRpdUXDkWR8','r0VdPCkDWQ/dSSkJ','CLnvA8kwWPS','q8oAkCoXuCocBSopWQNcUCobbSkYmSosW7XFrrvOgCkYgSkRWQa','umkyfs7dMCk/W5y9W68','WRjFW4K5WPxcN0BcTfz2AmoO','ageXkCoyWQabW7NdNCoDW6ddKq','umoEW7FdOrG','W7fzWOZdLSoV','W47dMmkemsWQW6XdW7hdMgldKeVcHG','W4VcJdZcVG','W4BcHZzNFG','aeCtymkG','WRS0W6pdOMbacCoC','W7HVW4NdS8oq','W7DOWOBdHCo7','rmoCnmoH','W77dT8o+W7xcGxBdTuddH8kUcSocz1uoWP5LoeTIn0/cNSo9','WOKcDtGj','W6ldNCkWpqS0W5LdW47dJKm','luZdKCkNAW','A8oylg9o','WPfybbBdRa','ECoYW6ZdMK3dIdOaW57cLhKXWRZdQSoiWR17','pmo3W6nwW6y','W7rBWOhdTmof','wCk3ygSt','BSkvWQtdOfDXja','ACkwvvSk','ECk9jrtdQa','W78hWPzFW4C','WOtdQSksW6q','D0jqu8kZ','xHX8WQ9/oCkOi3X0r3jlW43cQ8kfFSo3bCk7iqhdRHac','W5/cMCojt8oV','uSktimowBSoPWRhcUMqWEWy','ne/cKSosmG','t8kBg3VcQG','wWishCoxWPu1WOfOW7qO','kb4ommorW4zBhhJdMCk/WRm','lHLaA8kuWOWexdZcNSk7W7pdPSoLdmknW6y','W4pcUafFAa','p0GMq8k9','WPWkuICLehriv0NcMa','WR3cJ8oZy2D/W6PqW7ldT1/dNq'],...(function(){return[...['euW9W7tcPHFcMbBcHmkTWQ4ZiK7dPSoYWQBcO8oG','vYWkamod','WQ9mC8oPW6G','WOipWQ7cV8o3mSo3bmkWW6XSFW','WOxdGcTGWR7cNmkvW7HSWQtdHa','CgvwCCkt','iMVdT8kT','hCkKWOhdUL1rmSkvrGddUYW','WPNdUCoZW6lcKq','W7v9WRNcOqihrmkAfH7cGZm','W6/cUmoEzmor','W7ZdMCkgpbO','gefXW4xcI1m','W4hdUKX9FJ3dMWhdQ8oEWPLGyq','W6mMFCk3WP0','ohJdV8kTxgmJCCk7da','5Pwx5ysz5z+m5P2K6kYI5AAM6ls3','WRrkrCoBW7C','Cf7dNmkgWQW','tCkemCowrCoTWPNcSq','WODdosBdPa','Cmo2agL6W5O','oILiWQRdJIz1eWtdLSob','Fdj8ySknW7uNW77dI8ozW7ZdGu/cMmkQomkT','CqWUWQpdL8o9hXbEx3GbW6nBW7S','W7H7W77dTmo4','DWCMeCoWWOSaWOfxW6ijWOrRWOW','W7BcSCoNjSoQaLqV','pmobW6pcPhymrSosWQ5xv8kZWO0','W4tcJa/cKmkj','W4OmWPH8W50','WRtdTmo2','ChtdN8k4WPq','jCo0yhqWWR3cPJtcGZzTEKldGCo2W4eB','WOiBsdaz','p37dQmkHD2OVzCkL','yX85WQVdLSoHdGnIAhK','W5f3W6hdR8o8','WQJcVdiCcq','kXbJj8oJ','WPddHdH/WOJcHW','m0pdLSofWPm','m0LYW7/cS8kIgrLqF2yX','WO3dQmkKW7hcOq','W7JcOSoBFCoK','BSkTnSoYyG','x1vtfSoK','WOtdUr51WRK','CCoJovrZ','W6ibWOK','WRiVWRdcLCoL','u8kCavJcUW','WOGsWRZcK8oXlG','CmkdimouEmk2W5VdU2aYDvefWQnCW7ZcR8ofWRRcQmoZhmkvffzdWP7cJCoNWRjJA2/dJCoZymkOWPFcKdWGfmkggsrOWRNcHMLpjmkgzW','ucr9ECkCW74wW6BdLSowW7BdQW','WQiyx8kxWP5NW7C','a110W6xcUG','WOBdTCkgW63cUq','lcLiWRtdVG','yCkshqNdOG','W6yWWRm9gCkqWR/dHW','W6NcIZvNxa','W6bUW7JdT8oUWRfTreL1WQPxhdVdMYlcRmksySo3gvhdRG','p8k0WOhdUeSowmous0FcSJGoW6pdVw3cQmkREG','WP7cRreV','WO7dU8kAo8kjx8k7WPhcOSkPW53cRaK','WOWeW4hdLK0','DWOIWR7dPq','W7JcUWJcSmkC','m8kHWOhdQq','omonW74hjmoX','W4/cHH7cOCkE','WOxdGcTGWQlcGCkwW6u','W6pcUCoYjCogcg03AIK','WRNdQX5jWOe','W7XOW6NdOSooW78Jh08','BCkqdmoLFG','ivZdSmkgBa','WPWZW4JdTvK','W47cGIRcTSkWW4pdQCkF','omo5W4jrW7hcJX4G','c8kIW6S','WQGMW7tdVxPxaCohvvldM37cNu7dMCkzpa/dHW','WR7dQmkBW6NcOq','W6GcWOjRW5i','i8ooW5TVW4S','W4tcP8oXiCor','BmkyWP7cHSk7','uaL6WRjfBCoHyW','W7JcMSoMb8oj','q0hdV8kmWRtdPmkVsmoCpwe','F1VdSSk6C0uF','lCoGW58Piq','WQhdQmoRW6hcMG','WRmDtYu1'],...(function(){return['WQddPSkZW4pcIq','W4dcVmoGomoxa0yHBK/dM8kDzua','vSoff8ktW6y','WPFcQqG','ASoNW7hdIW3cUZ0kW4RcNq','B8oJWR88W6/dGZ3cUq','W63cPIVcV8kr','W5VcQmozz8o0amoQWO4','D8oHbh5kW4zblKC','hKeHw8ktW7W','WQZdQCo0W7FcU2ZdGe3dKG','lxRdQSkKya','n2GRs8k/','jmoIW6vvW7ddNf9Oy3LQeSoYW4NdKCk5zSkcW7G/','mcDD','Ft9NWRz2','ce7dTCojW70','pmoUW7xcOL4','W4BdNZJcT0eHW4upEq','kSomW6tcUMaavCoo','ra4EWPpdRW','crSzoSoUWRuX','W5becG','dSk8umocWPNdVwlcNd9TW70b','WPHeBSoHW44WWQtdQW','W68PjmkBWOC+W6GCW77cKNvSWQJcMG','y8oiWQyiWQq','s3tdHSk3WOO','bNRcR8oCnW','W6qEWOS5jW','wSkwaaBdTmkL','wehdNSk4WQO','WPRdPSoUB2e','sSoXWQG9W4q','WRZdUSoLW7m','zSkobMlcK8oVW7ZdLW','FduXgCoZ','WR4MW47dRXSEfgpdLhxdSW','WPFcQqGOkgJcKG','W4aBWPzvW5y','WOhdPmkeW6ZcICo5Dmk0','W5RcKMG+W5ldL8kMW6TqWP3dMhq','W4pcOJBcKCk9','W7i0WRiLpmkk','WPqsWQJcOG','WPvGbhddU8owqSkXW7hdRbzN','W5GYWQysmq','m1dcISoAkNZdT27dHSoU','mSodW6SVa8oWqmk+tCkdW40','WRtdLCkcW6NcKG','o15fW4tcNq','qCkBi8oUsq','WQpdSCoDvNW','Ev3dGSk4WOK','CreyWRldSCo7bry','qW9qWQ1D','x8k6dbRdIa','WQzHgdddUG','oxNdV8k6sNqOD8k0ehnEW6eFWQlcHmogW5zm','wWishColWOG2WPW','tmoQWQW9WPdcKHpdRmk7yMe','ohJdV8kTsNKND8k5','B8oGWQ4NWPW','W6/dGSohW53cV23dHa','rWTQ','BxSmW7BcRwqMgXddI8oNW5jC','q8o0WRq7W5C','WRfNW7rLyCogWRFdQwtcRYad','W6NcRCkHWQxdKsNcKv7dTmkDzSkbdq','W7xcIdb/tG','h8oCW6tcHgO','EmoPW7FdHZtcMZSxW6JcINC','DWCuaSoNWOmvWP1DW7qGWPW','WOatyZ47','W5JcGIRcQmkC','tXOnWQFdSCo/oWnDFLGfW7Xz','qaGAWQtdSG','qmobiSoWrSocDmoAWRFcK8odpmkXimoo','w8oIleXF','lHPjWQldSG','q8kuaXxdIW','WRZcIZecdq','wmkycIy','p8kJF0SYWO3cSW','WRtdTmo2W5FcMMO','lJ9ghmoZ','qrLSWQ5c','eMTvW6xcRq','W54LWOTEW5W','vCkvarddGa','WOVdQSkrW4tcSSoL','r8ogWOScWOa','zdf/vCkV'];}())];}())];}());_0x83a9=function(){return _0x4bf059;};return _0x83a9();};var version_ = 'jsjiami.com.v7';
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