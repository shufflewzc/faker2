/*
 * 2022-07-20 修复获取试用列表风控问题；  
 * 2022-08-06 修复申请试用时风控，需要token请到https://t.me/jd_api获取；
 * By https://github.com/6dylan6/jdpro/
 * 基于X1a0He版本修改
 * @Address: https://github.com/X1a0He/jd_scripts_fixed/blob/main/jd_try_xh.js


脚本是否耗时只看args_xh.maxLength的大小（申请数量），默认50个，申请100个差不多15分钟
上一作者说每天申请上限300个（自测，没有申请过上限），关注店铺上限500个
关注店铺满了就无法继续申请，可用批量取关店铺取消关注

部分环境变量说明，详细请参考62行往下：
export JD_TRY_PASSZC="false" #不过滤种草官类试用，默认true过滤
export JD_TRY_MAXLENGTH="50" #商品数组的最大长度，默认50个
export JD_TRY_PRICE="XX"#商品原价格，大于XX才申请，默认20
export JD_TRY_APPLYINTERVAL="6000" #商品试用之间和获取商品之间的间隔ms
export JD_TRY_APPLYNUMFILTER="10000" #过滤大于设定值的已申请人数
export JD_TRY_MINSUPPLYNUM="1" #最小提供数量
export JD_TRY_SENDNUM="10" #每隔多少账号发送一次通知，默认为4
export JD_TRY_UNIFIED="false" 默认采用不同试用组

定时自定义，能用多久随缘了！！！
 */
if (!process.env.APITOKEN){
    console.log('请到https://t.me/jd_api获取token，设置变量export APITOKEN=你的Token来运行')
    return;
}
const $ = new Env('京东试用')
const URL = 'https://api.m.jd.com/client.action'
let trialActivityIdList = []
let trialActivityTitleList = []
let notifyMsg = ''
let size = 1;
let APITOKEN = process.env.APITOKEN ||'';
$.isPush = true;
$.isLimit = false;
$.isForbidden = false;
$.wrong = false;
$.giveupNum = 0;
$.successNum = 0;
$.completeNum = 0;
$.getNum = 0;
$.try = true;
$.sentNum = 0;
$.cookiesArr = []
//默认的过滤关键词
$.innerKeyWords =
    [
        "幼儿园", "教程", "英语", "辅导", "培训",
        "孩子", "小学", "成人用品", "套套", "情趣",
        "自慰", "阳具", "飞机杯", "男士用品", "女士用品",
        "内衣", "高潮", "避孕", "乳腺", "肛塞", "肛门",
        "宝宝", "芭比", "娃娃", "男用",
        "女用", "神油", "足力健", "老年", "老人",
        "宠物", "饲料", "丝袜", "黑丝", "磨脚",
        "脚皮", "除臭", "性感", "内裤", "跳蛋",
        "安全套", "龟头", "阴道", "阴部", "手机卡", "电话卡", "流量卡",
        "习题", "试卷",
    ]
//下面很重要，遇到问题请把下面注释看一遍再来问
let args_xh = {
    /*
     * 控制是否输出当前环境变量设置，默认为false
     * 环境变量名称：XH_TRY_ENV
     */
    env: process.env.XH_TRY_ENV === 'true' || false,
    /*
     * 跳过某个指定账号，默认为全部账号清空
     * 填写规则：例如当前Cookie1为pt_key=key; pt_pin=pin1;则环境变量填写pin1即可，此时pin1的购物车将不会被清空
     * 若有更多，则按照pin1@pin2@pin3进行填写
     * 环境变量名称：XH_TRY_EXCEPT
     */
    except: process.env.XH_TRY_EXCEPT && process.env.XH_TRY_EXCEPT.split('@') || [],
    //以上环境变量新增于2022.01.30
    /*
     * 每个Tab页要便遍历的申请页数，由于京东试用又改了，获取不到每一个Tab页的总页数了(显示null)，所以特定增加一个环境变了以控制申请页数
     * 例如设置 JD_TRY_PRICE 为 30，假如现在正在遍历tab1，那tab1就会被遍历到30页，到31页就会跳到tab2，或下一个预设的tab页继续遍历到30页
     * 默认为20
     */
    totalPages: process.env.JD_TRY_TOTALPAGES * 1 || 20,
    /*
     * 由于每个账号每次获取的试用产品都不一样，所以为了保证每个账号都能试用到不同的商品，之前的脚本都不支持采用统一试用组的
     * 以下环境变量是用于指定是否采用统一试用组的
     * 例如当 JD_TRY_UNIFIED 为 true时，有3个账号，第一个账号跑脚本的时候，试用组是空的
     * 而当第一个账号跑完试用组后，第二个，第三个账号所采用的试用组默认采用的第一个账号的试用组
     * 优点：减少除第一个账号外的所有账号遍历，以减少每个账号的遍历时间
     * 缺点：A账号能申请的东西，B账号不一定有
     * 提示：想每个账号独立不同的试用产品的，请设置为false，想减少脚本运行时间的，请设置为true
     * 默认为false
     */
    unified: process.env.JD_TRY_UNIFIED === 'true' || false,
    //以上环境变量新增于2022.01.25
    /*
     * 商品原价，低于这个价格都不会试用，意思是
     * A商品原价49元，试用价1元，如果下面设置为50，那么A商品不会被加入到待提交的试用组
     * B商品原价99元，试用价0元，如果下面设置为50，那么B商品将会被加入到待提交的试用组
     * C商品原价99元，试用价1元，如果下面设置为50，那么C商品将会被加入到待提交的试用组
     * 默认为0
     * */
    jdPrice: process.env.JD_TRY_PRICE * 1 || 20,
    /*
     * 下面有一个function是可以获取tabId列表，名为try_tabList
     * 可设置环境变量：JD_TRY_TABID，用@进行分隔
     * tabId不定期会变,获取不到商品，自行获取并修改tabId
     * */
    tabId: process.env.JD_TRY_TABID && process.env.JD_TRY_TABID.split('@').map(Number) || [200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212],
    /*
     * 试用商品标题过滤，黑名单，当标题存在关键词时，则不加入试用组
     * 当白名单和黑名单共存时，黑名单会自动失效，优先匹配白名单，匹配完白名单后不会再匹配黑名单，望周知
     * 例如A商品的名称为『旺仔牛奶48瓶特价』，设置了匹配白名单，白名单关键词为『牛奶』，但黑名单关键词存在『旺仔』
     * 这时，A商品还是会被添加到待提交试用组，白名单优先于黑名单
     * 已内置对应的 成人类 幼儿类 宠物 老年人类关键词，请勿重复添加
     * 可设置环境变量：JD_TRY_TITLEFILTERS，关键词与关键词之间用@分隔
     * */
    titleFilters: process.env.JD_TRY_TITLEFILTERS && process.env.JD_TRY_TITLEFILTERS.split('@') || [],
    /*
     * 试用价格(中了要花多少钱)，高于这个价格都不会试用，小于等于才会试用，意思就是
     * A商品原价49元，现在试用价1元，如果下面设置为10，那A商品将会被添加到待提交试用组，因为1 < 10
     * B商品原价49元，现在试用价2元，如果下面设置为1，那B商品将不会被添加到待提交试用组，因为2 > 1
     * C商品原价49元，现在试用价1元，如果下面设置为1，那C商品也会被添加到带提交试用组，因为1 = 1
     * 可设置环境变量：JD_TRY_TRIALPRICE，默认为0
     * */
    trialPrice: process.env.JD_TRY_TRIALPRICE * 1 || 0,
    /*
     * 最小提供数量，例如试用商品只提供2份试用资格，当前设置为1，则会进行申请
     * 若只提供5分试用资格，当前设置为10，则不会申请
     * 可设置环境变量：JD_TRY_MINSUPPLYNUM
     * */
    minSupplyNum: process.env.JD_TRY_MINSUPPLYNUM * 1 || 1,
    /*
     * 过滤大于设定值的已申请人数，例如下面设置的10000，A商品已经有10001人申请了，则A商品不会进行申请，会被跳过
     * 可设置环境变量：JD_TRY_APPLYNUMFILTER
     * */
    applyNumFilter: process.env.JD_TRY_APPLYNUMFILTER * 1 || 10000,
    /*
     * 商品试用之间和获取商品之间的间隔, 单位：毫秒(1秒=1000毫秒)
     * 可设置环境变量：JD_TRY_APPLYINTERVAL
     * 默认为6000-9000随机
     * */
    applyInterval: process.env.JD_TRY_APPLYINTERVAL * 1 || 6000,
    /*
     * 商品数组的最大长度，通俗来说就是即将申请的商品队列长度
     * 例如设置为20，当第一次获取后获得12件，过滤后剩下5件，将会进行第二次获取，过滤后加上第一次剩余件数
     * 例如是18件，将会进行第三次获取，直到过滤完毕后为20件才会停止，不建议设置太大
     * 可设置环境变量：JD_TRY_MAXLENGTH
     * */
    maxLength: process.env.JD_TRY_MAXLENGTH * 1 || 50,
    /*
     * 过滤种草官类试用，某些试用商品是专属官专属，考虑到部分账号不是种草官账号
     * 例如A商品是种草官专属试用商品，下面设置为true，而你又不是种草官账号，那A商品将不会被添加到待提交试用组
     * 例如B商品是种草官专属试用商品，下面设置为false，而你是种草官账号，那A商品将会被添加到待提交试用组
     * 例如B商品是种草官专属试用商品，下面设置为true，即使你是种草官账号，A商品也不会被添加到待提交试用组
     * 可设置环境变量：JD_TRY_PASSZC，默认为true
     * */
    passZhongCao: process.env.JD_TRY_PASSZC === 'false' || true,
    /*
     * 是否打印输出到日志，考虑到如果试用组长度过大，例如100以上，如果每个商品检测都打印一遍，日志长度会非常长
     * 打印的优点：清晰知道每个商品为什么会被过滤，哪个商品被添加到了待提交试用组
     * 打印的缺点：会使日志变得很长
     *
     * 不打印的优点：简短日志长度
     * 不打印的缺点：无法清晰知道每个商品为什么会被过滤，哪个商品被添加到了待提交试用组
     * 可设置环境变量：JD_TRY_PLOG，默认为true
     * */
    printLog: process.env.JD_TRY_PLOG === 'false' || true,
    /*
     * 白名单，是否打开，如果下面为true，那么黑名单会自动失效
     * 白名单和黑名单无法共存，白名单永远优先于黑名单
     * 可通过环境变量控制：JD_TRY_WHITELIST，默认为false
     * */
    whiteList: process.env.JD_TRY_WHITELIST === 'true' || false,
    /*
     * 白名单关键词，当标题存在关键词时，加入到试用组
     * 例如A商品的名字为『旺仔牛奶48瓶特价』，白名单其中一个关键词是『牛奶』，那么A将会直接被添加到待提交试用组，不再进行另外判断
     * 就算设置了黑名单也不会判断，希望这种写得那么清楚的脑瘫问题就别提issues了
     * 可通过环境变量控制：JD_TRY_WHITELIST，用@分隔
     * */
    whiteListKeywords: process.env.JD_TRY_WHITELISTKEYWORDS && process.env.JD_TRY_WHITELISTKEYWORDS.split('@') || [],
    /*
     * 每多少个账号发送一次通知，默认为4
     * 可通过环境变量控制 JD_TRY_SENDNUM
     * */
    sendNum: process.env.JD_TRY_SENDNUM * 1 || 4,
}
//上面很重要，遇到问题请把上面注释看一遍再来问
!(async () => {
    await $.wait(500)
    // 如果你要运行京东试用这个脚本，麻烦你把环境变量 JD_TRY 设置为 true
    //if (process.env.JD_TRY && process.env.JD_TRY === 'true') {
        $.log('\n遇到问题请先看脚本内注释；解决不了可联系https://t.me/dylan_jdpro\n');
        await requireConfig()
        if (!$.cookiesArr[0]) {
            $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {
                "open-url": "https://bean.m.jd.com/"
            })
            return
        }
        args_xh.tabId = args_xh.tabId.sort(() => 0.5 - Math.random())
        for (let i = 0; i < $.cookiesArr.length; i++) {
            if ($.cookiesArr[i]) {
                $.cookie = $.cookiesArr[i];
                $.UserName = decodeURIComponent($.cookie.match(/pt_pin=(.+?);/) && $.cookie.match(/pt_pin=(.+?);/)[1])
                $.index = i + 1;
                $.isLogin = true;
                $.nickName = '';
                await totalBean();
                console.log(`\n开始【京东账号${$.index}】${$.nickName || $.UserName}\n`);
                $.except = false;
                if (args_xh.except.includes($.UserName)) {
                    console.log(`跳过账号：${$.nickName || $.UserName}`)
                    $.except = true;
                    continue
                }
                if (!$.isLogin) {
                    $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {
                        "open-url": "https://bean.m.jd.com/bean/signIndex.action"
                    });
                    await $.notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                    continue
                }
                $.totalTry = 0
                $.totalSuccess = 0
                $.nowTabIdIndex = 0;
                $.nowPage = 1;
                $.nowItem = 1;
                $.retrynum = 0
                $.jda = '__jda=' + _jda('1xxxxxxxx.164xxxxxxxxxxxxxxxxxxx.164xxxxxxx.165xxxxxx.165xxxxxx.1xx')
                if (!args_xh.unified) {
                    trialActivityIdList = []
                    trialActivityTitleList = []
                }
                $.isLimit = false;
                // 获取tabList的，不知道有哪些的把这里的注释解开跑一遍就行了
                //await try_tabList();
                // return;
                $.isForbidden = false
                $.wrong = false
                size = 1

                while (trialActivityIdList.length < args_xh.maxLength && $.retrynum < 3) {
                    if ($.nowTabIdIndex === args_xh.tabId.length) {
                        console.log(`tabId组已遍历完毕，不在获取商品\n`);
                        break;
                    } else {
                        await try_feedsList(args_xh.tabId[$.nowTabIdIndex], $.nowPage)  //获取对应tabId的试用页面
                    }
                    if (trialActivityIdList.length < args_xh.maxLength) {
                        console.log(`间隔等待中，请等待3秒 \n`)
                        await $.wait(3000);
                    }
                }
                if ($.isForbidden === false && $.isLimit === false) {
                    console.log(`稍后将执行试用申请，请等待 2 秒\n`)
                    await $.wait(2000);
                    for (let i = 0; i < trialActivityIdList.length && $.isLimit === false; i++) {
                        if ($.isLimit) {
                            console.log("试用上限")
                            break
                        }
                        if ($.isForbidden) { console.log('403了，跳出'); break }
                        await try_apply(trialActivityTitleList[i], trialActivityIdList[i])
                        //console.log(`间隔等待中，请等待 ${args_xh.applyInterval} ms\n`)
                        const waitTime = generateRandomInteger(args_xh.applyInterval, 9000);
                        console.log(`随机等待${waitTime}ms后继续`);
                        await $.wait(waitTime);
                    }
                    console.log("试用申请执行完毕...")
                    // await try_MyTrials(1, 1)    //申请中的商品
                    $.giveupNum = 0;
                    $.successNum = 0;
                    $.getNum = 0;
                    $.completeNum = 0;
                    await try_MyTrials(1, 2)    //申请成功的商品
                    // await try_MyTrials(1, 3)    //申请失败的商品
                    await showMsg()
                }
            }
            if ($.isNode()) {
                if ($.index % args_xh.sendNum === 0) {
                    $.sentNum++;
                    console.log(`正在进行第 ${$.sentNum} 次发送通知，发送数量：${args_xh.sendNum}`)
                    await $.notify.sendNotify(`${$.name}`, `${notifyMsg}`)
                    notifyMsg = "";
                }
            }
        }
        if ($.isNode() && $.except === false) {
            if (($.cookiesArr.length - ($.sentNum * args_xh.sendNum)) < args_xh.sendNum && notifyMsg.length != 0) {
                console.log(`正在进行最后一次发送通知，发送数量：${($.cookiesArr.length - ($.sentNum * args_xh.sendNum))}`)
                await $.notify.sendNotify(`${$.name}`, `${notifyMsg}`)
                notifyMsg = "";
            }
        }
    //} else {
        //console.log(`\n您未设置变量export JD_TRY="true"运行【京东试用】脚本, 结束运行！\n`)
   // }
})().catch((e) => {
    console.error(`❗️ ${$.name} 运行错误！\n${e}`)
}).finally(() => $.done())

function requireConfig() {
    return new Promise(resolve => {
        $.notify = $.isNode() ? require('./sendNotify') : { sendNotify: async () => { } }
        //获取 Cookies
        $.cookiesArr = []
        if ($.isNode()) {
            //Node.js用户请在jdCookie.js处填写京东ck;
            const jdCookieNode = require('./jdCookie.js');
            Object.keys(jdCookieNode).forEach((item) => {
                if (jdCookieNode[item]) $.cookiesArr.push(jdCookieNode[item])
            })
            if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
        } else {
            //IOS等用户直接用NobyDa的jd $.cookie
            $.cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
        }
        for (let keyWord of $.innerKeyWords) args_xh.titleFilters.push(keyWord)
        console.log(`共${$.cookiesArr.length}个京东账号\n`)
        if (args_xh.env) {
            console.log('=========环境变量配置如下=========')
            console.log(`env: ${typeof args_xh.env}, ${args_xh.env}`)
            console.log(`except: ${typeof args_xh.except}, ${args_xh.except}`)
            console.log(`totalPages: ${typeof args_xh.totalPages}, ${args_xh.totalPages}`)
            console.log(`unified: ${typeof args_xh.unified}, ${args_xh.unified}`)
            console.log(`jdPrice: ${typeof args_xh.jdPrice}, ${args_xh.jdPrice}`)
            console.log(`tabId: ${typeof args_xh.tabId}, ${args_xh.tabId}`)
            console.log(`titleFilters: ${typeof args_xh.titleFilters}, ${args_xh.titleFilters}`)
            console.log(`trialPrice: ${typeof args_xh.trialPrice}, ${args_xh.trialPrice}`)
            console.log(`minSupplyNum: ${typeof args_xh.minSupplyNum}, ${args_xh.minSupplyNum}`)
            console.log(`applyNumFilter: ${typeof args_xh.applyNumFilter}, ${args_xh.applyNumFilter}`)
            console.log(`applyInterval: ${typeof args_xh.applyInterval}, ${args_xh.applyInterval}`)
            console.log(`maxLength: ${typeof args_xh.maxLength}, ${args_xh.maxLength}`)
            console.log(`passZhongCao: ${typeof args_xh.passZhongCao}, ${args_xh.passZhongCao}`)
            console.log(`printLog: ${typeof args_xh.printLog}, ${args_xh.printLog}`)
            console.log(`whiteList: ${typeof args_xh.whiteList}, ${args_xh.whiteList}`)
            console.log(`whiteListKeywords: ${typeof args_xh.whiteListKeywords}, ${args_xh.whiteListKeywords}`)
            console.log('===============================')
        }
        resolve()
    })
}

//获取tabList的，如果不知道tabList有哪些，跑一遍这个function就行了
function try_tabList() {
    return new Promise((resolve, reject) => {
        console.log(`获取tabList中...`)
        const body = JSON.stringify({
            "version": 2,
            "previewTime": ""
        });
        let option = taskurl_xh('newtry', 'try_tabList', body)
        $.post(option, (err, resp, data) => {
            try {
                if (err) {
                    if (JSON.stringify(err) === `\"Response code 403 (Forbidden)\"`) {
                        $.isForbidden = true
                        console.log('账号被京东服务器风控，不再请求该帐号')
                    } else {
                        console.log(JSON.stringify(err))
                        console.log(`${$.name} API请求失败，请检查网路重试`)
                    }
                } else {
                    data = JSON.parse(data)
                    if (data.success) {
                        for (let tabId of data.data.tabList) console.log(`${tabId.tabName} - ${tabId.tabId}`)
                    } else {
                        console.log("获取失败", data)
                    }
                }
            } catch (e) {
                reject(`⚠️ ${arguments.callee.name.toString()} API返回结果解析出错\n${e}\n${JSON.stringify(data)}`)
            } finally {
                resolve()
            }
        })
    })
}

//获取商品列表并且过滤 By X1a0He
function try_feedsList(tabId, page) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            "tabId": `${tabId}`,
            "page": page,
            "version": 2,
            "source": "default",
            "client": "app",
            //"previewTime": ""
        });
        let option = taskurl_xh('newtry', 'try_feedsList', body)
        $.post(option, (err, resp, data) => {
            try {
                if (err) {
                    if (JSON.stringify(err) === `\"Response code 403 (Forbidden)\"`) {
                        console.log(`请求失败，第 ${$.retrynum + 1} 次重试`)
                        $.retrynum++
                        if ($.retrynum === 3) { $.isForbidden = true; $.log('多次尝试失败，换个时间再试！') }
                    } else {
                        console.log(JSON.stringify(err))
                        console.log(`${$.name} API请求失败，请检查网路重试`)
                    }
                } else {
                    data = JSON.parse(data)
                    let tempKeyword = ``;
                    if (data.data) {
                        $.nowPage === args_xh.totalPages ? $.nowPage = 1 : $.nowPage++;
                        console.log(`第 ${size++} 次获取试用商品成功，tabId:${args_xh.tabId[$.nowTabIdIndex]} 的 第 ${page}/${args_xh.totalPages} 页`)
                        console.log(`获取到商品 ${data.data.feedList.length} 条`)
                        for (let item of data.data.feedList) {
                            if (item.applyNum === null) {
                                args_xh.printLog ? console.log(`商品未到申请时间：${item.skuTitle}\n`) : ''
                                continue
                            }
                            if (trialActivityIdList.length >= args_xh.maxLength) {
                                console.log('商品列表长度已满.结束获取')
                                break
                            }
                            if (item.applyState === 1) {
                                args_xh.printLog ? console.log(`商品已申请试用：${item.skuTitle}\n`) : ''
                                continue
                            }
                            if (item.applyState !== null) {
                                args_xh.printLog ? console.log(`商品状态异常，未找到skuTitle\n`) : ''
                                continue
                            }
                            if (args_xh.passZhongCao) {
                                $.isPush = true;
                                if (item.tagList.length !== 0) {
                                    for (let itemTag of item.tagList) {
                                        if (itemTag.tagType === 3) {
                                            args_xh.printLog ? console.log('商品被过滤，该商品是种草官专属') : ''
                                            $.isPush = false;
                                            break;
                                        } else if (itemTag.tagType === 5) {
                                            args_xh.printLog ? console.log('商品被跳过，该商品是付费试用！') : ''
                                            $.isPush = false;
                                            break;
                                        }
                                    }
                                }
                            }
                            if (item.skuTitle && $.isPush) {
                                args_xh.printLog ? console.log(`检测 tabId:${args_xh.tabId[$.nowTabIdIndex]} 的 第 ${page}/${args_xh.totalPages} 页 第 ${$.nowItem++ + 1} 个商品\n${item.skuTitle}`) : ''
                                if (args_xh.whiteList) {
                                    if (args_xh.whiteListKeywords.some(fileter_word => item.skuTitle.includes(fileter_word))) {
                                        args_xh.printLog ? console.log(`商品白名单通过，将加入试用组，trialActivityId为${item.trialActivityId}\n`) : ''
                                        trialActivityIdList.push(item.trialActivityId)
                                        trialActivityTitleList.push(item.skuTitle)
                                    }
                                } else {
                                    tempKeyword = ``;
                                    if (parseFloat(item.jdPrice) <= args_xh.jdPrice) {
                                        args_xh.printLog ? console.log(`商品被过滤，商品价格 ${item.jdPrice} < ${args_xh.jdPrice} \n`) : ''
                                    } else if (parseFloat(item.supplyNum) < args_xh.minSupplyNum && item.supplyNum !== null) {
                                        args_xh.printLog ? console.log(`商品被过滤，提供申请的份数小于预设申请的份数 \n`) : ''
                                    } else if (parseFloat(item.applyNum) > args_xh.applyNumFilter && item.applyNum !== null) {
                                        args_xh.printLog ? console.log(`商品被过滤，已申请人数大于预设的${args_xh.applyNumFilter}人 \n`) : ''
                                    } else if (item.jdPrice === null) {
                                        args_xh.printLog ? console.log(`商品被过滤，商品无价，不能申请 \n`) : ''
                                    } else if (parseFloat(item.trialPrice) > args_xh.trialPrice) {
                                        args_xh.printLog ? console.log(`商品被过滤，商品试用价大于预设试用价 \n`) : ''
                                    } else if (args_xh.titleFilters.some(fileter_word => item.skuTitle.includes(fileter_word) ? tempKeyword = fileter_word : '')) {
                                        args_xh.printLog ? console.log(`商品被过滤，含有关键词 ${tempKeyword}\n`) : ''
                                    } else {
                                        args_xh.printLog ? console.log(`商品通过，加入试用组，trialActivityId为${item.trialActivityId}\n`) : ''
                                        if (trialActivityIdList.indexOf(item.trialActivityId) === -1) {
                                            trialActivityIdList.push(item.trialActivityId)
                                            trialActivityTitleList.push(item.skuTitle)
                                        }
                                    }
                                }
                            } else if ($.isPush !== false) {
                                console.error('skuTitle解析异常')
                                return
                            }
                        }
                        console.log(`当前试用组长度为：${trialActivityIdList.length}`)
                        //args_xh.printLog ? console.log(`${trialActivityIdList}`) : ''
                        if (page >= args_xh.totalPages && $.nowTabIdIndex < args_xh.tabId.length) {
                            //这个是因为每一个tab都会有对应的页数，获取完如果还不够的话，就获取下一个tab
                            $.nowTabIdIndex++;
                            $.nowPage = 1;
                            $.nowItem = 1;
                        }
                        $.retrynum = 0
                    } else {
                        console.log(`💩 获得试用列表失败: ${data.message}`)
                    }
                }
            } catch (e) {
                reject(`⚠️ ${arguments.callee.name.toString()} API返回结果解析出错\n${e}\n${JSON.stringify(data)}`)
            } finally {
                resolve()
            }
        })
    })
}

function try_apply(title, activityId) {
    return new Promise(async (resolve, reject) => {
        console.log(`申请试用商品提交中...`)
        args_xh.printLog ? console.log(`商品：${title}`) : ''
        args_xh.printLog ? console.log(`id为：${activityId}`) : ''
        const body = JSON.stringify({
            "activityId": activityId,
            "previewTime": ""
        });
        $.h5st = await _0x101939(body);
        let option = taskurl_xh('newtry', 'try_apply', body)
        $.get(option, (err, resp, data) => {
            try {
                if (err) {
                    if (JSON.stringify(err) === `\"Response code 403 (Forbidden)\"`) {
                        $.isForbidden = true
                        console.log('账号被京东服务器风控，不再请求该帐号')
                    } else {
                        console.log(JSON.stringify(err))
                        console.log(`${$.name} API请求失败，请检查网路重试`)
                    }
                } else {
                    $.totalTry++
                    data = JSON.parse(data)
                    if (data.success && data.code === "1") {  // 申请成功
                        console.log("申请提交成功")
                        $.totalSuccess++
                    } else if (data.code === "-106") {
                        console.log(data.message)   // 未在申请时间内！
                    } else if (data.code === "-110") {
                        console.log(data.message)   // 您的申请已成功提交，请勿重复申请…
                    } else if (data.code === "-120") {
                        console.log(data.message)   // 您还不是会员，本品只限会员申请试用，请注册会员后申请！
                    } else if (data.code === "-167") {
                        console.log(data.message)   // 抱歉，此试用需为种草官才能申请。查看下方详情了解更多。
                    } else if (data.code === "-131") {
                        console.log(data.message)   // 申请次数上限。
                        $.isLimit = true;
                    } else if (data.code === "-113") {
                        console.log(data.message)   // 操作不要太快哦！
                    } else {
                        console.log("申请失败", data)
                    }
                }
            } catch (e) {
                reject(`⚠️ ${arguments.callee.name.toString()} API返回结果解析出错\n${e}\n${JSON.stringify(data)}`)
            } finally {
                resolve()
            }
        })
    })
}

function try_MyTrials(page, selected) {

    return new Promise((resolve, reject) => {
        switch (selected) {
            case 1:
                console.log('正在获取已申请的商品...')
                break;
            case 2:
                console.log('正在获取申请成功的商品...')
                break;
            case 3:
                console.log('正在获取申请失败的商品...')
                break;
            default:
                console.log('selected错误')
        }
        let options = {
            url: URL,
            body: `appid=newtry&functionId=try_MyTrials&clientVersion=10.3.4&client=wh5&body=%7B%22page%22%3A${page}%2C%22selected%22%3A${selected}%2C%22previewTime%22%3A%22%22%7D`,
            headers: {
                'origin': 'https://prodev.m.jd.com',
                'User-Agent': 'jdapp;iPhone;10.3.4;;;M/5.0;appBuild/167945;jdSupportDarkMode/1;;;Mozilla/5.0 (iPhone; CPU iPhone OS 15_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;',
                'referer': 'https://prodev.m.jd.com/',
                'cookie': $.cookie + $.jda
            },
        }
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`🚫 ${arguments.callee.name.toString()} API请求失败，请检查网路\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data)
                    if (data.success) {
                        //temp adjustment
                        if (selected === 2) {
                            if (data.success && data.data) {
                                for (let item of data.data.list) {
                                    item.status === 4 || item.text.text.includes('试用资格已过期') ? $.giveupNum += 1 : ''
                                    item.status === 2 && item.text.text.includes('试用资格将保留') ? $.successNum += 1 : ''
                                    item.status === 2 && item.text.text.includes('请收货后尽快提交报告') ? $.getNum += 1 : ''
                                    item.status === 2 && item.text.text.includes('试用已完成') ? $.completeNum += 1 : ''
                                }
                                console.log(`待领取 | 已领取 | 已完成 | 已放弃：${$.successNum} | ${$.getNum} | ${$.completeNum} | ${$.giveupNum}`)
                            } else {
                                console.log(`获得成功列表失败: ${data.message}`)
                            }
                        }
                    } else {
                        console.error(`ERROR:try_MyTrials`)
                    }
                }
            } catch (e) {
                reject(`⚠️ ${arguments.callee.name.toString()} API返回结果解析出错\n${e}\n${JSON.stringify(data)}`)
            } finally {
                resolve()
            }
        })
    })
}

function taskurl_xh(appid, functionId, body = JSON.stringify({})) {

    return {
        "url": `${URL}?appid=${appid}&functionId=${functionId}&clientVersion=11.0.2&client=wh5&body=${encodeURIComponent(body)}&h5st=${$.h5st}`,
        'headers': {
            'Cookie': $.cookie + $.jda,
            'user-agent': 'jdapp;iPhone;10.1.2;15.0;ff2caa92a8529e4788a34b3d8d4df66d9573f499;network/wifi;model/iPhone13,4;addressid/2074196292;appBuild/167802;jdSupportDarkMode/1;Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'Referer': 'https://prodev.m.jd.com/',
            'origin': 'https://prodev.m.jd.com/',
            'Accept': 'application/json,text/plain,*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-cn',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    }

}

async function showMsg() {
    let message = ``;
    message += `👤 京东账号${$.index} ${$.nickName || $.UserName}\n`;
    if ($.totalSuccess !== 0 && $.totalTry !== 0) {
        message += `🎉 本次提交申请：${$.totalSuccess}/${$.totalTry}个商品🛒\n`;
        message += `🎉 ${$.successNum}个商品待领取\n`;
        message += `🎉 ${$.getNum}个商品已领取\n`;
        message += `🎉 ${$.completeNum}个商品已完成\n`;
        message += `🗑 ${$.giveupNum}个商品已放弃\n\n`;
    } else {
        message += `⚠️ 本次执行没有申请试用商品\n`;
        message += `🎉 ${$.successNum}个商品待领取\n`;
        message += `🎉 ${$.getNum}个商品已领取\n`;
        message += `🎉 ${$.completeNum}个商品已完成\n`;
        message += `🗑 ${$.giveupNum}个商品已放弃\n\n`;
    }
    if (!args_xh.jdNotify || args_xh.jdNotify === 'false') {
        $.msg($.name, ``, message, {
            "open-url": 'https://try.m.jd.com/user'
        })
        if ($.isNode())
            notifyMsg += `${message}`
    } else {
        console.log(message)
    }
}

function totalBean() {
    return new Promise(async resolve => {
        const options = {
            "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
            "headers": {
                "Accept": "application/json,text/plain, */*",
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-cn",
                "Connection": "keep-alive",
                "Cookie": $.cookie,
                "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
                "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
            },
            "timeout": 10000,
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

function _jda(format = 'xxxxxxxxxxxxxxxxxxxx') {
    return format.replace(/[xy]/g, function (c) {
        var r = Math.random() * 10 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        jdaid = v.toString()
        return jdaid;
    });
}
const generateRandomInteger = (min, max = 0) => {
    if (min > max) {
        let temp = min;
        min = max;
        max = temp;
    }
    var Range = max - min;
    var Rand = Math.random();
    return min + Math.round(Rand * Range);
};

function getExtract(array) {
    const random = (min, max) => Math.floor(Math.random() * (max - min) + min);
    let index = random(0, array.length);
    return array.splice(index, 1);
}

;var encode_version = 'jsjiami.com.v5', phelg = '__0xe827e',  __0xe827e=['\x41\x69\x42\x62','\x50\x47\x37\x44\x75\x51\x3d\x3d','\x35\x4c\x69\x2f\x36\x4c\x47\x61\x77\x72\x64\x4c\x58\x2b\x69\x2b\x72\x4f\x57\x5a\x6f\x4f\x61\x58\x6a\x65\x61\x4f\x67\x4f\x53\x37\x6d\x2b\x65\x71\x72\x65\x2b\x39\x72\x75\x69\x74\x67\x2b\x61\x69\x74\x2b\x61\x63\x75\x65\x69\x45\x6e\x65\x69\x34\x6b\x2b\x57\x50\x76\x4f\x57\x61\x73\x51\x3d\x3d','\x55\x31\x54\x43\x74\x4d\x4f\x6a\x64\x42\x6f\x3d','\x77\x71\x30\x30\x48\x38\x4f\x71\x53\x67\x3d\x3d','\x66\x63\x4f\x4b\x77\x36\x6b\x4b\x77\x37\x45\x3d','\x77\x70\x76\x44\x6f\x73\x4f\x6c\x77\x37\x4d\x51','\x63\x4d\x4b\x43\x77\x35\x6c\x71\x64\x41\x3d\x3d','\x45\x4d\x4b\x42\x54\x73\x4b\x76\x77\x71\x67\x3d','\x5a\x77\x59\x34','\x35\x4c\x71\x30\x36\x4c\x4b\x75\x77\x35\x4a\x33\x66\x4f\x69\x38\x67\x75\x57\x62\x73\x65\x61\x56\x74\x75\x61\x4f\x71\x4f\x53\x35\x6e\x4f\x65\x71\x73\x2b\x2b\x2f\x69\x4f\x69\x76\x71\x75\x61\x6a\x76\x65\x61\x66\x71\x75\x69\x46\x6e\x4f\x69\x35\x6f\x65\x57\x4f\x6c\x2b\x57\x61\x6a\x77\x3d\x3d','\x51\x32\x54\x43\x6a\x79\x30\x61\x63\x77\x3d\x3d','\x61\x38\x4f\x76\x46\x53\x73\x3d','\x5a\x38\x4b\x58\x77\x6f\x73\x3d','\x52\x4d\x4b\x53\x54\x51\x3d\x3d','\x66\x73\x4b\x58\x56\x51\x3d\x3d','\x50\x6d\x50\x43\x72\x41\x3d\x3d','\x35\x59\x69\x6a\x35\x4c\x2b\x4d\x35\x36\x53\x6e\x35\x59\x6d\x48\x37\x37\x79\x4a','\x36\x49\x79\x55\x35\x59\x2b\x64\x35\x61\x65\x34\x36\x4c\x53\x66','\x46\x57\x54\x44\x75\x51\x3d\x3d','\x77\x71\x6b\x76\x77\x71\x72\x43\x70\x46\x34\x3d','\x53\x63\x4f\x35\x4a\x7a\x7a\x44\x68\x51\x3d\x3d','\x77\x72\x6e\x44\x74\x69\x49\x6a\x77\x37\x45\x3d','\x77\x71\x46\x36\x4c\x38\x4f\x56\x77\x70\x45\x3d','\x5a\x30\x50\x43\x76\x73\x4f\x70\x77\x34\x77\x3d','\x51\x4d\x4b\x5a\x52\x79\x74\x67','\x77\x6f\x66\x44\x6f\x41\x51\x3d','\x4f\x38\x4f\x32\x77\x71\x58\x43\x75\x30\x64\x34\x77\x36\x73\x66\x48\x51\x3d\x3d','\x77\x6f\x58\x44\x74\x4d\x4f\x62\x77\x37\x55\x58','\x77\x36\x44\x43\x68\x63\x4b\x2b\x77\x70\x42\x44','\x41\x4d\x4f\x48\x77\x70\x67\x72\x56\x67\x3d\x3d','\x77\x36\x48\x44\x71\x38\x4b\x38','\x77\x36\x5a\x2b\x4e\x4d\x4b\x57\x45\x41\x3d\x3d','\x77\x70\x54\x43\x71\x4d\x4b\x72','\x77\x36\x5a\x57\x77\x72\x4e\x5a\x54\x77\x3d\x3d','\x77\x71\x64\x45\x42\x63\x4f\x50\x77\x71\x4d\x3d','\x77\x70\x44\x44\x73\x73\x4b\x2f\x61\x41\x3d\x3d','\x77\x35\x56\x49\x5a\x77\x3d\x3d','\x4f\x73\x4f\x46\x77\x71\x54\x43\x6b\x6d\x73\x3d','\x46\x33\x58\x43\x70\x54\x66\x43\x6b\x51\x3d\x3d','\x41\x58\x33\x43\x68\x51\x3d\x3d','\x54\x46\x76\x43\x6d\x43\x41\x66','\x49\x4d\x4b\x54\x54\x63\x4b\x54\x77\x71\x63\x3d','\x77\x37\x39\x78\x49\x73\x4b\x41\x44\x53\x76\x44\x6f\x77\x3d\x3d','\x77\x72\x78\x4a\x77\x34\x4e\x69\x77\x71\x45\x3d','\x77\x37\x68\x42\x43\x58\x35\x38','\x4c\x67\x39\x53\x77\x34\x6e\x43\x69\x67\x3d\x3d','\x77\x37\x74\x51\x46\x32\x52\x74','\x51\x48\x72\x43\x6e\x41\x3d\x3d','\x77\x36\x64\x65\x41\x67\x3d\x3d','\x35\x4c\x71\x36\x36\x4c\x47\x50\x77\x70\x76\x44\x73\x38\x4f\x6d\x36\x4c\x36\x51\x35\x5a\x69\x53\x35\x70\x65\x56\x35\x6f\x2b\x36\x35\x4c\x75\x41\x35\x36\x75\x7a\x37\x37\x32\x31\x36\x4b\x36\x46\x35\x71\x4b\x79\x35\x70\x79\x4a\x36\x49\x57\x78\x36\x4c\x71\x32\x35\x59\x2b\x72\x35\x5a\x69\x6d','\x4c\x73\x4b\x64\x77\x37\x77\x3d','\x66\x67\x63\x37\x45\x4d\x4b\x39\x77\x70\x6a\x43\x6b\x42\x58\x43\x68\x77\x3d\x3d','\x77\x70\x39\x38\x77\x34\x52\x70\x77\x72\x62\x44\x67\x45\x62\x43\x67\x4d\x4b\x73\x65\x4d\x4f\x55\x77\x37\x39\x58\x58\x51\x3d\x3d','\x35\x34\x6d\x35\x35\x70\x2b\x2f\x35\x59\x2b\x30\x37\x37\x32\x4e\x53\x63\x4f\x41\x35\x4c\x36\x49\x35\x61\x32\x53\x35\x70\x36\x76\x35\x62\x36\x4a\x35\x36\x6d\x4e\x37\x37\x79\x4a\x36\x4c\x36\x6b\x36\x4b\x32\x46\x35\x70\x61\x42\x35\x6f\x2b\x31\x35\x6f\x71\x44\x35\x4c\x69\x4a\x35\x35\x69\x56\x35\x62\x61\x67\x35\x4c\x2b\x41','\x35\x59\x75\x56\x36\x5a\x6d\x72\x35\x34\x75\x6d\x35\x70\x79\x73\x35\x59\x79\x67\x37\x37\x36\x68\x52\x63\x4f\x64\x35\x4c\x2b\x56\x35\x61\x36\x4e\x35\x70\x36\x6d\x35\x62\x2b\x6f\x35\x36\x71\x32','\x77\x6f\x35\x6e\x4c\x38\x4f\x55\x77\x6f\x77\x3d','\x77\x71\x58\x43\x69\x38\x4b\x77\x61\x48\x51\x3d','\x77\x72\x37\x43\x69\x38\x4b\x43\x58\x58\x67\x3d','\x41\x30\x37\x44\x68\x31\x51\x4f','\x41\x38\x4b\x48\x64\x73\x4b\x57\x77\x6f\x38\x3d','\x58\x73\x4f\x44\x49\x43\x76\x44\x68\x67\x3d\x3d','\x42\x4d\x4b\x58\x77\x37\x68\x54\x77\x35\x6b\x3d','\x4b\x55\x54\x44\x69\x47\x51\x72','\x77\x72\x76\x43\x76\x4d\x4f\x73\x50\x38\x4f\x63\x77\x36\x38\x4d\x51\x63\x4b\x65\x77\x34\x58\x44\x72\x51\x6e\x43\x69\x55\x7a\x44\x6d\x68\x5a\x38\x50\x73\x4f\x33\x58\x38\x4b\x54\x4c\x43\x44\x44\x6f\x79\x48\x44\x6e\x6e\x67\x78\x77\x36\x6f\x4d\x49\x63\x4b\x63\x77\x37\x4e\x35\x64\x73\x4f\x68\x65\x73\x4f\x6a\x77\x35\x41\x65\x77\x34\x62\x43\x75\x63\x4f\x59\x77\x71\x66\x44\x69\x38\x4b\x54\x42\x68\x68\x54\x55\x46\x6b\x46\x64\x73\x4b\x51\x77\x36\x56\x74\x4a\x63\x4f\x6f\x77\x34\x74\x68\x4c\x57\x6f\x3d','\x4a\x58\x66\x43\x6d\x67\x3d\x3d','\x77\x35\x6c\x30\x77\x37\x62\x43\x75\x6b\x77\x3d','\x77\x36\x56\x55\x45\x6d\x4e\x36\x50\x67\x3d\x3d','\x77\x35\x64\x35\x77\x72\x41\x3d','\x4a\x32\x6e\x43\x71\x77\x3d\x3d','\x77\x6f\x55\x59\x48\x4d\x4f\x64\x77\x37\x7a\x43\x6b\x67\x3d\x3d','\x77\x37\x6a\x43\x6c\x63\x4b\x32\x56\x41\x45\x48\x77\x35\x45\x58\x77\x71\x6a\x43\x74\x48\x67\x36\x77\x37\x46\x50\x65\x73\x4b\x39\x77\x35\x6a\x44\x70\x73\x4b\x49\x77\x6f\x35\x6e\x53\x4d\x4f\x7a\x77\x6f\x4c\x44\x6d\x4d\x4b\x4e\x77\x71\x50\x44\x68\x63\x4f\x32\x77\x37\x73\x42\x77\x36\x72\x44\x76\x55\x45\x63\x77\x36\x66\x44\x71\x73\x4b\x77\x43\x43\x6b\x5a\x55\x4d\x4b\x7a\x77\x35\x66\x43\x74\x6e\x5a\x56\x77\x71\x59\x77\x4c\x48\x7a\x43\x6b\x47\x58\x43\x72\x4d\x4b\x2b\x57\x33\x42\x4f\x49\x38\x4f\x30\x77\x34\x58\x44\x6a\x69\x66\x44\x74\x38\x4f\x42\x77\x70\x4c\x43\x76\x43\x6e\x44\x71\x52\x68\x4b\x49\x42\x51\x75\x77\x6f\x37\x44\x6e\x78\x33\x43\x70\x6c\x33\x44\x6f\x79\x73\x68\x42\x73\x4b\x70\x47\x73\x4b\x7a\x58\x30\x4d\x6a\x77\x34\x45\x6f\x77\x6f\x55\x64\x77\x36\x76\x43\x6b\x4d\x4f\x6b\x77\x6f\x6e\x44\x6a\x63\x4b\x70\x77\x36\x70\x2b\x64\x54\x73\x54\x57\x69\x4a\x68\x77\x6f\x58\x44\x6c\x63\x4b\x4f\x4b\x63\x4b\x47\x77\x37\x5a\x75\x4b\x56\x54\x44\x6f\x52\x34\x55\x46\x73\x4f\x35\x77\x6f\x6e\x44\x6f\x4d\x4f\x4d\x5a\x6d\x50\x44\x6c\x53\x67\x44\x77\x70\x78\x4b\x63\x57\x30\x30\x5a\x52\x6f\x46\x61\x73\x4f\x59\x77\x35\x45\x59\x4a\x38\x4f\x74\x77\x37\x37\x43\x76\x6a\x4e\x32\x77\x6f\x37\x44\x74\x38\x4f\x37\x59\x38\x4b\x73\x77\x6f\x63\x5a\x77\x36\x35\x6e\x4d\x73\x4b\x34\x49\x68\x2f\x43\x76\x4d\x4f\x4b\x47\x73\x4b\x57\x54\x43\x48\x43\x6b\x79\x54\x44\x70\x63\x4b\x4f\x77\x71\x30\x35\x4d\x78\x6a\x43\x69\x73\x4b\x73\x64\x41\x2f\x43\x75\x52\x6f\x69\x77\x36\x72\x43\x68\x73\x4b\x69\x77\x6f\x48\x44\x6d\x6d\x37\x44\x6a\x77\x77\x67\x77\x35\x5a\x4f\x42\x4d\x4b\x56\x46\x32\x49\x45\x42\x73\x4f\x41\x77\x72\x72\x43\x68\x42\x4c\x44\x69\x38\x4b\x56\x64\x31\x6e\x44\x69\x38\x4f\x4f\x77\x34\x54\x43\x6f\x38\x4b\x42\x77\x72\x76\x44\x69\x7a\x30\x63\x77\x36\x4c\x43\x67\x4d\x4f\x4f\x54\x63\x4f\x57\x77\x35\x2f\x44\x71\x31\x62\x44\x67\x38\x4f\x4a\x53\x73\x4f\x2f\x77\x35\x4c\x43\x75\x73\x4b\x30\x42\x79\x59\x7a\x4f\x56\x63\x73\x77\x71\x34\x6f\x46\x43\x50\x43\x74\x63\x4b\x32\x46\x63\x4b\x4d\x55\x6c\x34\x32\x65\x6d\x62\x43\x72\x73\x4b\x33\x77\x36\x44\x44\x76\x78\x31\x44\x77\x70\x38\x64\x77\x36\x6a\x44\x6e\x38\x4f\x35\x77\x35\x5a\x72\x77\x37\x4a\x48\x77\x36\x72\x44\x71\x6d\x34\x52\x4f\x4d\x4f\x6f\x66\x6b\x66\x44\x6e\x54\x44\x43\x71\x31\x62\x43\x6e\x73\x4b\x6f','\x77\x37\x78\x37\x47\x63\x4b\x52\x45\x42\x66\x44\x73\x53\x37\x44\x75\x4d\x4f\x71','\x77\x72\x48\x44\x6c\x38\x4b\x36\x77\x34\x38\x51\x77\x36\x4e\x79\x77\x34\x54\x44\x6c\x55\x6f\x38\x77\x71\x4e\x76\x4a\x4d\x4f\x32\x4b\x41\x3d\x3d','\x77\x37\x50\x44\x69\x63\x4b\x32\x51\x42\x51\x3d','\x55\x57\x48\x43\x67\x63\x4f\x32\x77\x35\x50\x44\x76\x63\x4b\x57\x45\x45\x30\x3d','\x65\x73\x4f\x6a\x45\x6a\x62\x44\x6d\x44\x58\x44\x72\x73\x4b\x53\x77\x71\x2f\x43\x68\x4d\x4f\x51\x4f\x78\x76\x43\x71\x44\x50\x43\x69\x31\x49\x37\x77\x6f\x51\x3d','\x77\x72\x7a\x43\x74\x63\x4f\x31\x4f\x38\x4f\x46\x77\x36\x6b\x3d','\x63\x73\x4b\x4d\x77\x36\x78\x7a\x63\x4d\x4b\x6c\x57\x77\x3d\x3d','\x47\x38\x4b\x42\x77\x70\x2f\x44\x70\x41\x3d\x3d','\x4b\x6e\x6a\x44\x70\x6d\x73\x6b','\x77\x35\x70\x33\x77\x6f\x78\x38\x63\x51\x3d\x3d','\x77\x35\x64\x6b\x77\x70\x70\x4f\x65\x46\x77\x72\x77\x35\x38\x3d','\x47\x6d\x66\x43\x6c\x38\x4f\x43\x77\x35\x66\x44\x6f\x38\x4f\x62','\x65\x38\x4f\x49\x77\x70\x6c\x6b\x51\x67\x3d\x3d','\x45\x7a\x42\x34\x77\x36\x58\x43\x74\x51\x3d\x3d','\x77\x6f\x4c\x44\x6f\x63\x4f\x57','\x49\x55\x37\x44\x75\x58\x59\x34','\x48\x4d\x4b\x4f\x77\x36\x62\x44\x75\x4d\x4b\x6e','\x77\x72\x37\x44\x67\x73\x4b\x71\x77\x37\x34\x7a','\x77\x36\x64\x47\x43\x73\x4b\x4f\x50\x77\x3d\x3d','\x63\x6c\x72\x43\x6c\x73\x4f\x4a\x56\x51\x3d\x3d','\x77\x6f\x52\x4f\x77\x36\x6c\x42\x77\x72\x38\x3d','\x65\x63\x4b\x47\x77\x34\x4e\x4f\x77\x34\x54\x43\x74\x43\x45\x3d','\x77\x71\x6a\x44\x72\x38\x4b\x4e\x77\x34\x55\x71\x55\x44\x72\x44\x6a\x38\x4b\x31','\x41\x38\x4f\x57\x77\x72\x4c\x43\x75\x32\x55\x3d','\x77\x6f\x6c\x77\x77\x35\x37\x43\x6a\x6d\x4d\x3d','\x77\x70\x2f\x43\x6b\x38\x4b\x79','\x77\x35\x4a\x57\x49\x38\x4b\x53\x4a\x67\x3d\x3d','\x77\x34\x52\x39\x77\x72\x68\x7a\x57\x41\x3d\x3d','\x77\x35\x74\x75\x77\x70\x4a\x75\x54\x77\x3d\x3d','\x56\x45\x72\x43\x74\x4d\x4f\x43\x77\x37\x67\x3d','\x56\x48\x55\x2f\x77\x35\x6e\x43\x6a\x41\x3d\x3d','\x77\x70\x52\x52\x77\x36\x72\x44\x70\x4d\x4f\x51','\x45\x38\x4f\x73\x77\x71\x41\x3d','\x48\x73\x4f\x64\x77\x6f\x63\x69\x57\x67\x3d\x3d','\x77\x72\x45\x39\x4c\x38\x4f\x66\x66\x51\x3d\x3d','\x77\x6f\x59\x36\x77\x70\x50\x43\x67\x6b\x67\x3d','\x77\x36\x52\x48\x41\x67\x3d\x3d','\x44\x31\x50\x43\x70\x41\x3d\x3d','\x77\x6f\x67\x67\x77\x72\x4d\x3d','\x77\x70\x42\x2b\x77\x34\x6e\x44\x67\x4d\x4f\x65\x55\x55\x68\x6a\x57\x67\x3d\x3d','\x4c\x38\x4b\x6d\x54\x4d\x4b\x33\x77\x71\x44\x44\x70\x6d\x41\x50\x4f\x73\x4f\x56\x77\x6f\x38\x4b\x77\x37\x56\x37','\x35\x34\x69\x44\x35\x70\x2b\x44\x35\x59\x32\x2f\x37\x37\x36\x38\x77\x71\x50\x43\x6a\x75\x53\x38\x6c\x2b\x57\x75\x73\x75\x61\x64\x6b\x75\x57\x2f\x69\x4f\x65\x6f\x6a\x75\x2b\x38\x74\x4f\x69\x2b\x6c\x4f\x69\x73\x68\x4f\x61\x55\x74\x4f\x61\x50\x6b\x75\x61\x49\x6d\x4f\x53\x34\x67\x4f\x65\x59\x74\x75\x57\x30\x73\x4f\x53\x2b\x6b\x77\x3d\x3d','\x77\x35\x30\x4e\x52\x67\x3d\x3d','\x52\x73\x4f\x35\x77\x72\x6b\x3d','\x77\x37\x64\x30\x64\x41\x3d\x3d','\x77\x37\x31\x51\x43\x51\x3d\x3d','\x65\x45\x7a\x43\x74\x41\x3d\x3d','\x77\x34\x4a\x37\x77\x72\x6c\x57\x59\x31\x59\x6b\x77\x34\x77\x57\x59\x6b\x33\x43\x72\x4d\x4f\x33\x4c\x56\x6c\x34\x77\x35\x66\x44\x71\x4d\x4b\x75\x77\x72\x49\x62\x77\x72\x6a\x43\x70\x55\x50\x43\x6a\x58\x6a\x43\x6e\x38\x4f\x2f\x77\x72\x44\x43\x71\x44\x54\x43\x72\x73\x4f\x38\x77\x71\x4c\x44\x69\x32\x76\x43\x6a\x4d\x4b\x2b\x77\x34\x74\x33\x77\x35\x76\x44\x76\x63\x4b\x43\x52\x33\x49\x79\x77\x71\x77\x3d','\x77\x37\x6e\x43\x67\x63\x4f\x38\x50\x38\x4f\x49\x46\x41\x66\x44\x6f\x4d\x4b\x75\x66\x58\x68\x2b\x55\x38\x4b\x59\x77\x35\x4a\x74\x4c\x6b\x48\x44\x75\x73\x4f\x4e\x43\x63\x4b\x73\x56\x31\x7a\x44\x6e\x32\x62\x44\x75\x38\x4f\x6d\x77\x72\x72\x44\x76\x41\x3d\x3d','\x56\x38\x4f\x65\x77\x70\x42\x70\x65\x51\x3d\x3d','\x4f\x73\x4f\x36\x77\x72\x73\x31','\x56\x32\x2f\x43\x67\x43\x55\x34','\x57\x6d\x50\x43\x6f\x73\x4f\x6f\x66\x77\x3d\x3d','\x49\x38\x4b\x71\x77\x35\x31\x72\x77\x35\x67\x3d','\x53\x6d\x2f\x44\x6d\x46\x76\x43\x70\x67\x3d\x3d','\x77\x6f\x77\x42\x77\x6f\x4c\x43\x75\x33\x6f\x3d','\x77\x6f\x52\x55\x42\x38\x4f\x4b\x77\x72\x55\x3d','\x4a\x73\x4b\x6c\x64\x4d\x4b\x71\x77\x6f\x38\x3d','\x77\x71\x44\x44\x69\x77\x51\x54\x77\x37\x77\x3d','\x4d\x4d\x4b\x64\x77\x37\x5a\x6a\x77\x34\x38\x3d','\x77\x37\x4e\x56\x44\x56\x70\x59','\x42\x69\x64\x54\x77\x36\x44\x43\x68\x67\x3d\x3d','\x41\x4d\x4f\x4d\x77\x6f\x59\x54\x52\x77\x3d\x3d','\x66\x56\x49\x47\x77\x34\x76\x43\x76\x41\x3d\x3d','\x77\x72\x7a\x44\x69\x4d\x4b\x74','\x77\x36\x50\x44\x70\x63\x4b\x32\x62\x67\x3d\x3d','\x44\x2b\x65\x5a\x73\x4f\x57\x2b\x76\x56\x4a\x49\x51\x44\x2f\x44\x74\x4f\x61\x66\x6f\x75\x69\x73\x71\x2b\x69\x75\x6a\x75\x61\x79\x6b\x75\x57\x6b\x69\x2b\x69\x33\x70\x63\x4f\x75\x34\x6f\x4f\x6c\x37\x37\x75\x6a\x34\x6f\x4b\x44\x37\x37\x69\x34','\x58\x57\x45\x55\x77\x37\x66\x43\x6b\x67\x3d\x3d','\x77\x70\x34\x38\x43\x4d\x4f\x4f\x51\x73\x4b\x7a\x59\x51\x3d\x3d','\x77\x34\x31\x4b\x52\x73\x4b\x38\x77\x72\x73\x3d','\x4f\x38\x4f\x79\x77\x72\x76\x43\x75\x31\x30\x3d','\x4c\x56\x54\x43\x73\x6a\x54\x43\x6c\x77\x3d\x3d','\x55\x30\x2f\x44\x6a\x58\x7a\x43\x71\x67\x3d\x3d','\x77\x6f\x42\x35\x77\x34\x6b\x3d','\x77\x70\x31\x30\x77\x34\x58\x44\x71\x4d\x4f\x6f','\x4a\x33\x62\x44\x6e\x45\x51\x78','\x77\x71\x67\x30\x77\x6f\x72\x43\x70\x48\x6f\x3d','\x41\x38\x4b\x54\x5a\x38\x4f\x68\x77\x34\x4d\x3d','\x77\x71\x6e\x44\x68\x63\x4b\x2b\x77\x37\x49\x51','\x4a\x46\x66\x43\x74\x42\x62\x43\x6d\x77\x3d\x3d'];(function(_0x3d85ad,_0x531840){var _0x2a59a9=function(_0x4dc97a){while(--_0x4dc97a){_0x3d85ad['push'](_0x3d85ad['shift']());}};var _0x5897dc=function(){var _0x4c7f4f={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x305807,_0x1ee48c,_0x424494,_0x5e4e60){_0x5e4e60=_0x5e4e60||{};var _0x2645a1=_0x1ee48c+'='+_0x424494;var _0x1cdae3=0x0;for(var _0x1cdae3=0x0,_0x2f211e=_0x305807['length'];_0x1cdae3<_0x2f211e;_0x1cdae3++){var _0x4aa4e0=_0x305807[_0x1cdae3];_0x2645a1+=';\x20'+_0x4aa4e0;var _0x26f3e5=_0x305807[_0x4aa4e0];_0x305807['push'](_0x26f3e5);_0x2f211e=_0x305807['length'];if(_0x26f3e5!==!![]){_0x2645a1+='='+_0x26f3e5;}}_0x5e4e60['cookie']=_0x2645a1;},'removeCookie':function(){return'dev';},'getCookie':function(_0x255e1f,_0x16a5a1){_0x255e1f=_0x255e1f||function(_0x2f61f0){return _0x2f61f0;};var _0x44c373=_0x255e1f(new RegExp('(?:^|;\x20)'+_0x16a5a1['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x358c2f=function(_0xd68089,_0x3428b4){_0xd68089(++_0x3428b4);};_0x358c2f(_0x2a59a9,_0x531840);return _0x44c373?decodeURIComponent(_0x44c373[0x1]):undefined;}};var _0x25aedb=function(){var _0x2117ef=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x2117ef['test'](_0x4c7f4f['removeCookie']['toString']());};_0x4c7f4f['updateCookie']=_0x25aedb;var _0x4bfb70='';var _0x44b2f9=_0x4c7f4f['updateCookie']();if(!_0x44b2f9){_0x4c7f4f['setCookie'](['*'],'counter',0x1);}else if(_0x44b2f9){_0x4bfb70=_0x4c7f4f['getCookie'](null,'counter');}else{_0x4c7f4f['removeCookie']();}};_0x5897dc();}(__0xe827e,0xd8));var _0xe618=function(_0x3cb596,_0x1c563f){_0x3cb596=_0x3cb596-0x0;var _0x10c8ab=__0xe827e[_0x3cb596];if(_0xe618['initialized']===undefined){(function(){var _0x29f7bc=typeof window!=='undefined'?window:typeof process==='object'&&typeof require==='function'&&typeof global==='object'?global:this;var _0x88700b='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x29f7bc['atob']||(_0x29f7bc['atob']=function(_0x53499b){var _0x4e111c=String(_0x53499b)['replace'](/=+$/,'');for(var _0x3ca86b=0x0,_0x1a556c,_0x3cf8bb,_0x3611ad=0x0,_0x5c8ebd='';_0x3cf8bb=_0x4e111c['charAt'](_0x3611ad++);~_0x3cf8bb&&(_0x1a556c=_0x3ca86b%0x4?_0x1a556c*0x40+_0x3cf8bb:_0x3cf8bb,_0x3ca86b++%0x4)?_0x5c8ebd+=String['fromCharCode'](0xff&_0x1a556c>>(-0x2*_0x3ca86b&0x6)):0x0){_0x3cf8bb=_0x88700b['indexOf'](_0x3cf8bb);}return _0x5c8ebd;});}());var _0x5d9037=function(_0x4092bf,_0x5127c9){var _0x461e52=[],_0x186e44=0x0,_0x186ba7,_0x469508='',_0x163c26='';_0x4092bf=atob(_0x4092bf);for(var _0x1ef0ba=0x0,_0x4c3889=_0x4092bf['length'];_0x1ef0ba<_0x4c3889;_0x1ef0ba++){_0x163c26+='%'+('00'+_0x4092bf['charCodeAt'](_0x1ef0ba)['toString'](0x10))['slice'](-0x2);}_0x4092bf=decodeURIComponent(_0x163c26);for(var _0x190f21=0x0;_0x190f21<0x100;_0x190f21++){_0x461e52[_0x190f21]=_0x190f21;}for(_0x190f21=0x0;_0x190f21<0x100;_0x190f21++){_0x186e44=(_0x186e44+_0x461e52[_0x190f21]+_0x5127c9['charCodeAt'](_0x190f21%_0x5127c9['length']))%0x100;_0x186ba7=_0x461e52[_0x190f21];_0x461e52[_0x190f21]=_0x461e52[_0x186e44];_0x461e52[_0x186e44]=_0x186ba7;}_0x190f21=0x0;_0x186e44=0x0;for(var _0xdbb66b=0x0;_0xdbb66b<_0x4092bf['length'];_0xdbb66b++){_0x190f21=(_0x190f21+0x1)%0x100;_0x186e44=(_0x186e44+_0x461e52[_0x190f21])%0x100;_0x186ba7=_0x461e52[_0x190f21];_0x461e52[_0x190f21]=_0x461e52[_0x186e44];_0x461e52[_0x186e44]=_0x186ba7;_0x469508+=String['fromCharCode'](_0x4092bf['charCodeAt'](_0xdbb66b)^_0x461e52[(_0x461e52[_0x190f21]+_0x461e52[_0x186e44])%0x100]);}return _0x469508;};_0xe618['rc4']=_0x5d9037;_0xe618['data']={};_0xe618['initialized']=!![];}var _0x486359=_0xe618['data'][_0x3cb596];if(_0x486359===undefined){if(_0xe618['once']===undefined){var _0x418d59=function(_0x1deba5){this['rc4Bytes']=_0x1deba5;this['states']=[0x1,0x0,0x0];this['newState']=function(){return'newState';};this['firstState']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['secondState']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x418d59['prototype']['checkState']=function(){var _0x572749=new RegExp(this['firstState']+this['secondState']);return this['runState'](_0x572749['test'](this['newState']['toString']())?--this['states'][0x1]:--this['states'][0x0]);};_0x418d59['prototype']['runState']=function(_0x561a0d){if(!Boolean(~_0x561a0d)){return _0x561a0d;}return this['getState'](this['rc4Bytes']);};_0x418d59['prototype']['getState']=function(_0x30c8c4){for(var _0x1cbc78=0x0,_0x4308d5=this['states']['length'];_0x1cbc78<_0x4308d5;_0x1cbc78++){this['states']['push'](Math['round'](Math['random']()));_0x4308d5=this['states']['length'];}return _0x30c8c4(this['states'][0x0]);};new _0x418d59(_0xe618)['checkState']();_0xe618['once']=!![];}_0x10c8ab=_0xe618['rc4'](_0x10c8ab,_0x1c563f);_0xe618['data'][_0x3cb596]=_0x10c8ab;}else{_0x10c8ab=_0x486359;}return _0x10c8ab;};function _0x101939(_0x209f86){var _0x524c97={'zyxWY':_0xe618('0x0','\x4a\x43\x46\x34'),'IkZGG':_0xe618('0x1','\x61\x54\x59\x4d'),'uaotv':_0xe618('0x2','\x23\x25\x57\x37'),'tyGNI':_0xe618('0x3','\x26\x75\x4b\x2a'),'qOgJE':_0xe618('0x4','\x77\x62\x68\x66'),'WanHn':_0xe618('0x5','\x47\x58\x61\x32'),'eYURw':_0xe618('0x6','\x69\x46\x65\x42'),'qYLkJ':_0xe618('0x7','\x28\x62\x76\x42'),'MaEoS':_0xe618('0x8','\x53\x25\x59\x48'),'qAGAh':_0xe618('0x9','\x6b\x46\x68\x26'),'KTeiL':_0xe618('0xa','\x28\x62\x76\x42'),'ioIWD':_0xe618('0xb','\x48\x29\x39\x48'),'DIewS':_0xe618('0xc','\x41\x5e\x52\x23'),'HrDUy':_0xe618('0xd','\x4a\x43\x46\x34'),'sDAjt':_0xe618('0xe','\x70\x58\x61\x7a')};let _0x54d613=Buffer[_0xe618('0xf','\x37\x67\x76\x23')](_0x524c97[_0xe618('0x10','\x47\x58\x61\x32')],_0x524c97[_0xe618('0x11','\x66\x57\x68\x70')])[_0xe618('0x12','\x77\x62\x68\x66')]();var _0x1e674b={'url':_0x54d613+_0xe618('0x13','\x48\x29\x39\x48')+APITOKEN,'body':{'appId':_0x524c97[_0xe618('0x14','\x23\x6f\x5d\x54')],'body':{'functionId':_0x524c97[_0xe618('0x15','\x6b\x75\x5b\x4a')],'body':_0x209f86,'t':Date[_0xe618('0x16','\x51\x76\x6e\x75')](),'appid':_0x524c97[_0xe618('0x17','\x47\x58\x61\x32')],'client':_0x524c97[_0xe618('0x18','\x36\x40\x50\x79')],'clientVersion':_0x524c97[_0xe618('0x19','\x32\x46\x49\x5d')]},'callbackAll':![],'ua':_0x524c97[_0xe618('0x1a','\x53\x25\x59\x48')],'pin':_0x524c97[_0xe618('0x1b','\x7a\x5a\x53\x4e')]},'headers':{'Content-Type':_0x524c97[_0xe618('0x1c','\x55\x79\x52\x31')]}};let _0x370b1b={'url':_0x54d613+_0xe618('0x1d','\x73\x35\x76\x33')+APITOKEN,'body':JSON[_0xe618('0x1e','\x32\x46\x49\x5d')]({'appId':_0x524c97[_0xe618('0x1f','\x6c\x51\x58\x36')],'body':{'functionId':_0x524c97[_0xe618('0x20','\x23\x25\x57\x37')],'body':_0x209f86,'t':Date[_0xe618('0x21','\x6c\x42\x28\x7a')](),'appid':_0x524c97[_0xe618('0x22','\x53\x25\x59\x48')],'client':_0x524c97[_0xe618('0x23','\x66\x57\x68\x70')],'clientVersion':_0x524c97[_0xe618('0x24','\x66\x57\x68\x70')]},'callbackAll':![],'ua':_0x524c97[_0xe618('0x25','\x48\x29\x39\x48')],'pin':_0x524c97[_0xe618('0x26','\x38\x49\x6a\x6e')]}),'headers':{'Content-Type':_0x524c97[_0xe618('0x27','\x55\x6f\x57\x40')]}};function _0x37f410(_0x2d233e){var _0x4c37bc={'THOcI':function _0x527bcc(_0x3064c0,_0x18bd8d){return _0x3064c0===_0x18bd8d;},'FoCtG':_0xe618('0x28','\x54\x74\x42\x71')};if(_0x4c37bc[_0xe618('0x29','\x26\x4a\x34\x41')](_0x4c37bc[_0xe618('0x2a','\x58\x48\x5b\x61')],_0x4c37bc[_0xe618('0x2b','\x4c\x4d\x46\x66')])){return new Promise(_0x40bfe7=>{var _0x57360a={'xdhMP':function _0x22a108(_0x6c9b7d,_0x338ad5){return _0x6c9b7d===_0x338ad5;},'eXqNy':_0xe618('0x2c','\x26\x75\x4b\x2a'),'iAgTi':function _0xfe1591(_0x44aea1,_0x23a474){return _0x44aea1!==_0x23a474;},'LTRMu':_0xe618('0x2d','\x61\x54\x59\x4d'),'cpRtN':_0xe618('0x2e','\x4f\x71\x44\x50'),'KDgSf':function _0x6f3af3(_0x36d0ba,_0xc3f230){return _0x36d0ba!==_0xc3f230;},'voZFn':_0xe618('0x2f','\x55\x6f\x57\x40'),'anlKz':_0xe618('0x30','\x6c\x41\x65\x6a'),'JYNRT':function _0x3c87b1(_0x2684c6,_0xd16402){return _0x2684c6+_0xd16402;},'ZcxxD':_0xe618('0x31','\x36\x40\x50\x79'),'zPjDj':function _0x27782f(_0x452b7d,_0x4c1b43){return _0x452b7d>_0x4c1b43;},'ybtQi':_0xe618('0x32','\x58\x48\x5b\x61'),'wwBxL':_0xe618('0x33','\x23\x6f\x5d\x54'),'haZRu':_0xe618('0x34','\x54\x5e\x38\x50'),'ZfsAp':function _0x4a590f(_0x5bd202,_0x41dceb){return _0x5bd202!==_0x41dceb;},'VXcjq':_0xe618('0x35','\x53\x25\x59\x48'),'wlDTV':_0xe618('0x36','\x7a\x5a\x53\x4e'),'hjjma':function _0x400f71(_0xee957b,_0x4a64d5){return _0xee957b(_0x4a64d5);},'UThqi':function _0x5d2dfe(_0x23b072,_0x129ab3){return _0x23b072(_0x129ab3);},'YwfyM':_0xe618('0x37','\x77\x62\x68\x66')};const _0x3c9ed1={'url':_0xe618('0x38','\x6a\x2a\x56\x56')+_0x2d233e['\x61'],'body':'\x64\x3d'+_0x2d233e['\x64'],'headers':{'Content-Type':_0x57360a[_0xe618('0x39','\x23\x6f\x5d\x54')],'User-Agent':$['\x55\x41']}};$[_0xe618('0x3a','\x26\x4a\x34\x41')](_0x3c9ed1,async(_0x2415fd,_0x4ea3c5,_0x1b781e)=>{if(_0x57360a[_0xe618('0x3b','\x49\x26\x46\x41')](_0x57360a[_0xe618('0x3c','\x7a\x5a\x53\x4e')],_0x57360a[_0xe618('0x3d','\x73\x35\x76\x33')])){try{if(_0x2415fd){if(_0x57360a[_0xe618('0x3e','\x41\x38\x24\x4e')](_0x57360a[_0xe618('0x3f','\x4c\x4d\x46\x66')],_0x57360a[_0xe618('0x40','\x29\x4d\x72\x28')])){c+=_0x57360a[_0xe618('0x41','\x6c\x41\x65\x6a')];b=encode_version;if(!(_0x57360a[_0xe618('0x42','\x56\x25\x36\x58')](typeof b,_0x57360a[_0xe618('0x43','\x73\x35\x76\x33')])&&_0x57360a[_0xe618('0x44','\x26\x75\x4b\x2a')](b,_0x57360a[_0xe618('0x45','\x6b\x75\x5b\x4a')]))){w[c](_0x57360a[_0xe618('0x46','\x26\x4a\x34\x41')]('\u5220\u9664',_0x57360a[_0xe618('0x47','\x38\x49\x6a\x6e')]));}}else{console[_0xe618('0x48','\x6b\x46\x68\x26')]('\x0a'+turnTableId[i][_0xe618('0x49','\x4a\x43\x46\x34')]+_0xe618('0x4a','\x49\x26\x46\x41'));throw new Error(_0x2415fd);}}else{if(_0x57360a[_0xe618('0x4b','\x38\x49\x6a\x6e')](_0x1b781e[_0xe618('0x4c','\x58\x48\x5b\x61')](_0x57360a[_0xe618('0x4d','\x69\x46\x65\x42')]),0x0)){_0x1b781e=_0x1b781e[_0xe618('0x4e','\x6c\x51\x58\x36')](_0x57360a[_0xe618('0x4f','\x4d\x6b\x48\x4b')],0x2);_0x1b781e=JSON[_0xe618('0x50','\x41\x38\x24\x4e')](_0x1b781e[0x1]);eid=_0x1b781e[_0xe618('0x51','\x55\x6f\x57\x40')];}else{if(_0x57360a[_0xe618('0x52','\x55\x6f\x57\x40')](_0x57360a[_0xe618('0x53','\x47\x58\x61\x32')],_0x57360a[_0xe618('0x54','\x4c\x4d\x46\x66')])){_0x1b781e=_0x1b781e[_0xe618('0x55','\x23\x51\x71\x6a')](_0x57360a[_0xe618('0x56','\x6b\x46\x68\x26')],0x2);_0x1b781e=JSON[_0xe618('0x57','\x4d\x6b\x48\x4b')](_0x1b781e[0x1]);eid=_0x1b781e[_0xe618('0x58','\x6b\x75\x5b\x4a')];}else{console[_0xe618('0x59','\x47\x58\x61\x32')](_0xe618('0x5a','\x66\x57\x68\x70'));}}}}catch(_0x51e383){$[_0xe618('0x5b','\x7a\x5a\x53\x4e')](_0x51e383,_0x4ea3c5);}finally{if(_0x57360a[_0xe618('0x5c','\x58\x48\x5b\x61')](_0x57360a[_0xe618('0x5d','\x4f\x56\x24\x6b')],_0x57360a[_0xe618('0x5e','\x51\x76\x6e\x75')])){_0x57360a[_0xe618('0x5f','\x70\x58\x61\x7a')](_0x40bfe7,_0x1b781e);}else{_0x57360a[_0xe618('0x60','\x6c\x41\x65\x6a')](_0x40bfe7,_0x1b781e);}}}else{console[_0xe618('0x61','\x52\x46\x5b\x39')](_0xe618('0x62','\x70\x58\x61\x7a'));}});});}else{$[_0xe618('0x63','\x49\x26\x46\x41')](e,resp);}}return new Promise(_0x2ebc26=>{$[_0xe618('0x64','\x41\x5e\x52\x23')](_0x370b1b,(_0x5a8890,_0x2b3847,_0x5632f0)=>{var _0x128353={'izzRQ':function _0x4fcae2(_0x244d2c,_0x5b19fb){return _0x244d2c===_0x5b19fb;},'RyAck':_0xe618('0x65','\x47\x25\x54\x75'),'qJDjC':_0xe618('0x66','\x26\x4b\x63\x7a'),'HkTOJ':_0xe618('0x67','\x26\x4b\x63\x7a'),'JRPjE':_0xe618('0x68','\x4d\x6b\x48\x4b'),'uJeby':function _0x1e6c24(_0x593b45,_0x5504bd){return _0x593b45+_0x5504bd;},'oDPHc':_0xe618('0x69','\x26\x4a\x34\x41'),'jqgtC':_0xe618('0x6a','\x77\x62\x68\x66'),'CCcRo':function _0x1f431b(_0x559528,_0x381631){return _0x559528(_0x381631);},'cPpHw':function _0x4bc6f8(_0x879cfb,_0x363957){return _0x879cfb(_0x363957);},'eFkMf':function _0x5e4ac7(_0x10ad29,_0x281500){return _0x10ad29>_0x281500;},'IFmbv':_0xe618('0x6b','\x7a\x5a\x53\x4e')};if(_0x128353[_0xe618('0x6c','\x4c\x4d\x46\x66')](_0x128353[_0xe618('0x6d','\x41\x5e\x52\x23')],_0x128353[_0xe618('0x6e','\x56\x25\x36\x58')])){try{if(_0x128353[_0xe618('0x6f','\x29\x4d\x72\x28')](_0x128353[_0xe618('0x70','\x33\x74\x23\x5b')],_0x128353[_0xe618('0x71','\x26\x4b\x63\x7a')])){if(_0x5a8890){console[_0xe618('0x72','\x56\x25\x36\x58')](JSON[_0xe618('0x73','\x6c\x51\x58\x36')](_0x5a8890));}else{if(_0x128353[_0xe618('0x74','\x51\x76\x6e\x75')](_0x128353[_0xe618('0x75','\x36\x32\x36\x2a')],_0x128353[_0xe618('0x76','\x26\x4a\x34\x41')])){console[_0xe618('0x77','\x4a\x43\x46\x34')](e,_0x2b3847);}else{if(_0x5632f0){_0x5632f0=JSON[_0xe618('0x78','\x53\x25\x59\x48')](_0x5632f0);console[_0xe618('0x79','\x29\x6e\x31\x75')](_0x128353[_0xe618('0x7a','\x66\x57\x68\x70')](_0x128353[_0xe618('0x7b','\x29\x4d\x72\x28')],_0x5632f0['\x6a\x66']));_0x5632f0=_0x5632f0[_0xe618('0x7c','\x29\x6e\x31\x75')];}else{$[_0xe618('0x7d','\x54\x5e\x38\x50')](_0x128353[_0xe618('0x7e','\x54\x74\x42\x71')]);}}}}else{_0x128353[_0xe618('0x7f','\x4d\x6b\x48\x4b')](_0x2ebc26,_0x5632f0);}}catch(_0x23b13a){console[_0xe618('0x80','\x61\x54\x59\x4d')](_0x23b13a,_0x2b3847);}finally{_0x128353[_0xe618('0x81','\x49\x26\x46\x41')](_0x2ebc26,_0x5632f0);}}else{if(_0x128353[_0xe618('0x82','\x6c\x41\x65\x6a')](_0x5632f0[_0xe618('0x83','\x53\x25\x59\x48')](_0x128353[_0xe618('0x84','\x55\x79\x52\x31')]),0x0)){_0x5632f0=_0x5632f0[_0xe618('0x85','\x26\x75\x4b\x2a')](_0x128353[_0xe618('0x86','\x6b\x75\x5b\x4a')],0x2);_0x5632f0=JSON[_0xe618('0x87','\x26\x75\x4b\x2a')](_0x5632f0[0x1]);eid=_0x5632f0[_0xe618('0x88','\x48\x29\x39\x48')];}else{console[_0xe618('0x89','\x26\x75\x4b\x2a')](_0xe618('0x8a','\x33\x74\x23\x5b'));}}});});};(function(_0x27cd2d,_0x3dffa1,_0x1c1967){var _0x4f0273=function(){var _0x1f0fa0=!![];return function(_0x1a7da9,_0x39140f){var _0x236331=_0x1f0fa0?function(){if(_0x39140f){var _0x1b8536=_0x39140f['apply'](_0x1a7da9,arguments);_0x39140f=null;return _0x1b8536;}}:function(){};_0x1f0fa0=![];return _0x236331;};}();var _0x4b7a97=_0x4f0273(this,function(){var _0x12a08e=function(){return'\x64\x65\x76';},_0x3ccdec=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x294787=function(){var _0x1e1e36=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x1e1e36['\x74\x65\x73\x74'](_0x12a08e['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x57d523=function(){var _0x1733ef=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x1733ef['\x74\x65\x73\x74'](_0x3ccdec['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x4452f2=function(_0x302798){var _0xd665d0=~-0x1>>0x1+0xff%0x0;if(_0x302798['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0xd665d0)){_0x5c28b6(_0x302798);}};var _0x5c28b6=function(_0x31f4ed){var _0x507a29=~-0x4>>0x1+0xff%0x0;if(_0x31f4ed['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x507a29){_0x4452f2(_0x31f4ed);}};if(!_0x294787()){if(!_0x57d523()){_0x4452f2('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x4452f2('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x4452f2('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x4b7a97();var _0x584f73={'FgzSL':_0xe618('0x8b','\x36\x40\x50\x79'),'Twuwa':function _0x325fde(_0x2cac27,_0x54ef63){return _0x2cac27!==_0x54ef63;},'OwGBm':_0xe618('0x8c','\x52\x46\x5b\x39'),'SOYhs':function _0x158ff6(_0x52a4d2,_0x57b010){return _0x52a4d2===_0x57b010;},'FRPHN':_0xe618('0x8d','\x55\x79\x52\x31'),'ECFth':function _0x172639(_0x465dd9,_0x535b67){return _0x465dd9+_0x535b67;},'BeTvx':_0xe618('0x8e','\x26\x4b\x63\x7a'),'yEVXV':_0xe618('0x8f','\x55\x79\x52\x31')};_0x1c1967='\x61\x6c';try{_0x1c1967+=_0x584f73[_0xe618('0x90','\x29\x4d\x72\x28')];_0x3dffa1=encode_version;if(!(_0x584f73[_0xe618('0x91','\x6c\x42\x28\x7a')](typeof _0x3dffa1,_0x584f73[_0xe618('0x92','\x6c\x42\x28\x7a')])&&_0x584f73[_0xe618('0x93','\x47\x58\x61\x32')](_0x3dffa1,_0x584f73[_0xe618('0x94','\x6c\x41\x65\x6a')]))){_0x27cd2d[_0x1c1967](_0x584f73[_0xe618('0x95','\x41\x5e\x52\x23')]('\u5220\u9664',_0x584f73[_0xe618('0x96','\x73\x35\x76\x33')]));}}catch(_0x22e79e){_0x27cd2d[_0x1c1967](_0x584f73[_0xe618('0x97','\x47\x58\x61\x32')]);}}());;encode_version = 'jsjiami.com.v5';
function Env(name, opts) {
    class Http {
        constructor(env) {
            this.env = env
        }

        send(opts, method = 'GET') {
            opts = typeof opts === 'string' ? {
                url: opts
            } : opts
            let sender = this.get
            if (method === 'POST') {
                sender = this.post
            }
            return new Promise((resolve, reject) => {
                sender.call(this, opts, (err, resp, body) => {
                    if (err) reject(err)
                    else resolve(resp)
                })
            })
        }

        get(opts) {
            return this.send.call(this.env, opts)
        }

        post(opts) {
            return this.send.call(this.env, opts, 'POST')
        }
    }

    return new (class {
        constructor(name, opts) {
            this.name = name
            this.http = new Http(this)
            this.data = null
            this.dataFile = 'box.dat'
            this.logs = []
            this.isMute = false
            this.isNeedRewrite = false
            this.logSeparator = '\n'
            this.startTime = new Date().getTime()
            Object.assign(this, opts)
            this.log('', `🔔${this.name}, 开始!`)
        }

        isNode() {
            return 'undefined' !== typeof module && !!module.exports
        }

        isQuanX() {
            return 'undefined' !== typeof $task
        }

        isSurge() {
            return 'undefined' !== typeof $httpClient && 'undefined' === typeof $loon
        }

        isLoon() {
            return 'undefined' !== typeof $loon
        }

        toObj(str, defaultValue = null) {
            try {
                return JSON.parse(str)
            } catch {
                return defaultValue
            }
        }

        toStr(obj, defaultValue = null) {
            try {
                return JSON.stringify(obj)
            } catch {
                return defaultValue
            }
        }

        getjson(key, defaultValue) {
            let json = defaultValue
            const val = this.getdata(key)
            if (val) {
                try {
                    json = JSON.parse(this.getdata(key))
                } catch { }
            }
            return json
        }

        setjson(val, key) {
            try {
                return this.setdata(JSON.stringify(val), key)
            } catch {
                return false
            }
        }

        getScript(url) {
            return new Promise((resolve) => {
                this.get({
                    url
                }, (err, resp, body) => resolve(body))
            })
        }

        runScript(script, runOpts) {
            return new Promise((resolve) => {
                let httpapi = this.getdata('@chavy_boxjs_userCfgs.httpapi')
                httpapi = httpapi ? httpapi.replace(/\n/g, '').trim() : httpapi
                let httpapi_timeout = this.getdata('@chavy_boxjs_userCfgs.httpapi_timeout')
                httpapi_timeout = httpapi_timeout ? httpapi_timeout * 1 : 20
                httpapi_timeout = runOpts && runOpts.timeout ? runOpts.timeout : httpapi_timeout
                const [key, addr] = httpapi.split('@')
                const opts = {
                    url: `http://${addr}/v1/scripting/evaluate`,
                    body: {
                        script_text: script,
                        mock_type: 'cron',
                        timeout: httpapi_timeout
                    },
                    headers: {
                        'X-Key': key,
                        'Accept': '*/*'
                    }
                }
                this.post(opts, (err, resp, body) => resolve(body))
            }).catch((e) => this.logErr(e))
        }

        loaddata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require('fs')
                this.path = this.path ? this.path : require('path')
                const curDirDataFilePath = this.path.resolve(this.dataFile)
                const rootDirDataFilePath = this.path.resolve(process.cwd(), this.dataFile)
                const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath)
                const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath)
                if (isCurDirDataFile || isRootDirDataFile) {
                    const datPath = isCurDirDataFile ? curDirDataFilePath : rootDirDataFilePath
                    try {
                        return JSON.parse(this.fs.readFileSync(datPath))
                    } catch (e) {
                        return {}
                    }
                } else return {}
            } else return {}
        }

        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require('fs')
                this.path = this.path ? this.path : require('path')
                const curDirDataFilePath = this.path.resolve(this.dataFile)
                const rootDirDataFilePath = this.path.resolve(process.cwd(), this.dataFile)
                const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath)
                const isRootDirDataFile = !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath)
                const jsondata = JSON.stringify(this.data)
                if (isCurDirDataFile) {
                    this.fs.writeFileSync(curDirDataFilePath, jsondata)
                } else if (isRootDirDataFile) {
                    this.fs.writeFileSync(rootDirDataFilePath, jsondata)
                } else {
                    this.fs.writeFileSync(curDirDataFilePath, jsondata)
                }
            }
        }

        lodash_get(source, path, defaultValue = undefined) {
            const paths = path.replace(/\[(\d+)\]/g, '.$1').split('.')
            let result = source
            for (const p of paths) {
                result = Object(result)[p]
                if (result === undefined) {
                    return defaultValue
                }
            }
            return result
        }

        lodash_set(obj, path, value) {
            if (Object(obj) !== obj) return obj
            if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || []
            path.slice(0, -1).reduce((a, c, i) => (Object(a[c]) === a[c] ? a[c] : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {})), obj)[
                path[path.length - 1]
            ] = value
            return obj
        }

        getdata(key) {
            let val = this.getval(key)
            // 如果以 @
            if (/^@/.test(key)) {
                const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key)
                const objval = objkey ? this.getval(objkey) : ''
                if (objval) {
                    try {
                        const objedval = JSON.parse(objval)
                        val = objedval ? this.lodash_get(objedval, paths, '') : val
                    } catch (e) {
                        val = ''
                    }
                }
            }
            return val
        }

        setdata(val, key) {
            let issuc = false
            if (/^@/.test(key)) {
                const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(key)
                const objdat = this.getval(objkey)
                const objval = objkey ? (objdat === 'null' ? null : objdat || '{}') : '{}'
                try {
                    const objedval = JSON.parse(objval)
                    this.lodash_set(objedval, paths, val)
                    issuc = this.setval(JSON.stringify(objedval), objkey)
                } catch (e) {
                    const objedval = {}
                    this.lodash_set(objedval, paths, val)
                    issuc = this.setval(JSON.stringify(objedval), objkey)
                }
            } else {
                issuc = this.setval(val, key)
            }
            return issuc
        }

        getval(key) {
            if (this.isSurge() || this.isLoon()) {
                return $persistentStore.read(key)
            } else if (this.isQuanX()) {
                return $prefs.valueForKey(key)
            } else if (this.isNode()) {
                this.data = this.loaddata()
                return this.data[key]
            } else {
                return (this.data && this.data[key]) || null
            }
        }

        setval(val, key) {
            if (this.isSurge() || this.isLoon()) {
                return $persistentStore.write(val, key)
            } else if (this.isQuanX()) {
                return $prefs.setValueForKey(val, key)
            } else if (this.isNode()) {
                this.data = this.loaddata()
                this.data[key] = val
                this.writedata()
                return true
            } else {
                return (this.data && this.data[key]) || null
            }
        }

        initGotEnv(opts) {
            this.got = this.got ? this.got : require('got')
            this.cktough = this.cktough ? this.cktough : require('tough-cookie')
            this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()
            if (opts) {
                opts.headers = opts.headers ? opts.headers : {}
                if (undefined === opts.headers.Cookie && undefined === opts.cookieJar) {
                    opts.cookieJar = this.ckjar
                }
            }
        }

        get(opts, callback = () => { }) {
            if (opts.headers) {
                delete opts.headers['Content-Type']
                delete opts.headers['Content-Length']
            }
            if (this.isSurge() || this.isLoon()) {
                if (this.isSurge() && this.isNeedRewrite) {
                    opts.headers = opts.headers || {}
                    Object.assign(opts.headers, {
                        'X-Surge-Skip-Scripting': false
                    })
                }
                $httpClient.get(opts, (err, resp, body) => {
                    if (!err && resp) {
                        resp.body = body
                        resp.statusCode = resp.status
                    }
                    callback(err, resp, body)
                })
            } else if (this.isQuanX()) {
                if (this.isNeedRewrite) {
                    opts.opts = opts.opts || {}
                    Object.assign(opts.opts, {
                        hints: false
                    })
                }
                $task.fetch(opts).then(
                    (resp) => {
                        const {
                            statusCode: status,
                            statusCode,
                            headers,
                            body
                        } = resp
                        callback(null, {
                            status,
                            statusCode,
                            headers,
                            body
                        }, body)
                    },
                    (err) => callback(err)
                )
            } else if (this.isNode()) {
                this.initGotEnv(opts)
                this.got(opts).on('redirect', (resp, nextOpts) => {
                    try {
                        if (resp.headers['set-cookie']) {
                            const ck = resp.headers['set-cookie'].map(this.cktough.Cookie.parse).toString()
                            if (ck) {
                                this.ckjar.setCookieSync(ck, null)
                            }
                            nextOpts.cookieJar = this.ckjar
                        }
                    } catch (e) {
                        this.logErr(e)
                    }
                    // this.ckjar.setCookieSync(resp.headers['set-cookie'].map(Cookie.parse).toString())
                }).then(
                    (resp) => {
                        const {
                            statusCode: status,
                            statusCode,
                            headers,
                            body
                        } = resp
                        callback(null, {
                            status,
                            statusCode,
                            headers,
                            body
                        }, body)
                    },
                    (err) => {
                        const {
                            message: error,
                            response: resp
                        } = err
                        callback(error, resp, resp && resp.body)
                    }
                )
            }
        }

        post(opts, callback = () => { }) {
            // 如果指定了请求体, 但没指定`Content-Type`, 则自动生成
            if (opts.body && opts.headers && !opts.headers['Content-Type']) {
                opts.headers['Content-Type'] = 'application/x-www-form-urlencoded'
            }
            if (opts.headers) delete opts.headers['Content-Length']
            if (this.isSurge() || this.isLoon()) {
                if (this.isSurge() && this.isNeedRewrite) {
                    opts.headers = opts.headers || {}
                    Object.assign(opts.headers, {
                        'X-Surge-Skip-Scripting': false
                    })
                }
                $httpClient.post(opts, (err, resp, body) => {
                    if (!err && resp) {
                        resp.body = body
                        resp.statusCode = resp.status
                    }
                    callback(err, resp, body)
                })
            } else if (this.isQuanX()) {
                opts.method = 'POST'
                if (this.isNeedRewrite) {
                    opts.opts = opts.opts || {}
                    Object.assign(opts.opts, {
                        hints: false
                    })
                }
                $task.fetch(opts).then(
                    (resp) => {
                        const {
                            statusCode: status,
                            statusCode,
                            headers,
                            body
                        } = resp
                        callback(null, {
                            status,
                            statusCode,
                            headers,
                            body
                        }, body)
                    },
                    (err) => callback(err)
                )
            } else if (this.isNode()) {
                this.initGotEnv(opts)
                const {
                    url,
                    ..._opts
                } = opts
                this.got.post(url, _opts).then(
                    (resp) => {
                        const {
                            statusCode: status,
                            statusCode,
                            headers,
                            body
                        } = resp
                        callback(null, {
                            status,
                            statusCode,
                            headers,
                            body
                        }, body)
                    },
                    (err) => {
                        const {
                            message: error,
                            response: resp
                        } = err
                        callback(error, resp, resp && resp.body)
                    }
                )
            }
        }

        /**
         *
         * 示例:$.time('yyyy-MM-dd qq HH:mm:ss.S')
         *    :$.time('yyyyMMddHHmmssS')
         *    y:年 M:月 d:日 q:季 H:时 m:分 s:秒 S:毫秒
         *    其中y可选0-4位占位符、S可选0-1位占位符，其余可选0-2位占位符
         * @param {*} fmt 格式化参数
         *
         */
        time(fmt) {
            let o = {
                'M+': new Date().getMonth() + 1,
                'd+': new Date().getDate(),
                'H+': new Date().getHours(),
                'm+': new Date().getMinutes(),
                's+': new Date().getSeconds(),
                'q+': Math.floor((new Date().getMonth() + 3) / 3),
                'S': new Date().getMilliseconds()
            }
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (new Date().getFullYear() + '').substr(4 - RegExp.$1.length))
            for (let k in o)
                if (new RegExp('(' + k + ')').test(fmt))
                    fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
            return fmt
        }

        /**
         * 系统通知
         *
         * > 通知参数: 同时支持 QuanX 和 Loon 两种格式, EnvJs根据运行环境自动转换, Surge 环境不支持多媒体通知
         *
         * 示例:
         * $.msg(title, subt, desc, 'twitter://')
         * $.msg(title, subt, desc, { 'open-url': 'twitter://', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
         * $.msg(title, subt, desc, { 'open-url': 'https://bing.com', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
         *
         * @param {*} title 标题
         * @param {*} subt 副标题
         * @param {*} desc 通知详情
         * @param {*} opts 通知参数
         *
         */
        msg(title = name, subt = '', desc = '', opts) {
            const toEnvOpts = (rawopts) => {
                if (!rawopts) return rawopts
                if (typeof rawopts === 'string') {
                    if (this.isLoon()) return rawopts
                    else if (this.isQuanX()) return {
                        'open-url': rawopts
                    }
                    else if (this.isSurge()) return {
                        url: rawopts
                    }
                    else return undefined
                } else if (typeof rawopts === 'object') {
                    if (this.isLoon()) {
                        let openUrl = rawopts.openUrl || rawopts.url || rawopts['open-url']
                        let mediaUrl = rawopts.mediaUrl || rawopts['media-url']
                        return {
                            openUrl,
                            mediaUrl
                        }
                    } else if (this.isQuanX()) {
                        let openUrl = rawopts['open-url'] || rawopts.url || rawopts.openUrl
                        let mediaUrl = rawopts['media-url'] || rawopts.mediaUrl
                        return {
                            'open-url': openUrl,
                            'media-url': mediaUrl
                        }
                    } else if (this.isSurge()) {
                        let openUrl = rawopts.url || rawopts.openUrl || rawopts['open-url']
                        return {
                            url: openUrl
                        }
                    }
                } else {
                    return undefined
                }
            }
            if (!this.isMute) {
                if (this.isSurge() || this.isLoon()) {
                    $notification.post(title, subt, desc, toEnvOpts(opts))
                } else if (this.isQuanX()) {
                    $notify(title, subt, desc, toEnvOpts(opts))
                }
            }
            if (!this.isMuteLog) {
                let logs = ['', '==============📣系统通知📣==============']
                logs.push(title)
                subt ? logs.push(subt) : ''
                desc ? logs.push(desc) : ''
                console.log(logs.join('\n'))
                this.logs = this.logs.concat(logs)
            }
        }

        log(...logs) {
            if (logs.length > 0) {
                this.logs = [...this.logs, ...logs]
            }
            console.log(logs.join(this.logSeparator))
        }

        logErr(err, msg) {
            const isPrintSack = !this.isSurge() && !this.isQuanX() && !this.isLoon()
            if (!isPrintSack) {
                this.log('', `❗️${this.name}, 错误!`, err)
            } else {
                this.log('', `❗️${this.name}, 错误!`, err.stack)
            }
        }

        wait(time) {
            return new Promise((resolve) => setTimeout(resolve, time))
        }

        done(val = {}) {
            const endTime = new Date().getTime()
            const costTime = (endTime - this.startTime) / 1000
            this.log('', `🔔${this.name}, 结束! 🕛 ${costTime} 秒`)
            this.log()
            if (this.isSurge() || this.isQuanX() || this.isLoon()) {
                $done(val)
            }
        }
    })(name, opts)
}
