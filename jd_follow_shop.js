/*
7 7 7 7 7 m_jd_follow_shop.js
*/
let mode = __dirname.includes('magic')
const {Env} = mode ? require('./magic') : require('./magic')
const $ = new Env('M关注有礼');
$.followShopArgv = process.env.M_FOLLOW_SHOP_ARGV
    ? process.env.M_FOLLOW_SHOP_ARGV
    : '';
if (mode) {
    $.followShopArgv = '1000104168_1000104168'
}
$.logic = async function () {
    let argv = $?.followShopArgv?.split('_');
    $.shopId = argv?.[0];
    $.venderId = argv?.[1];
    if (!$.shopId || !$.venderId) {
        $.log(`无效的参数${$.followShopArgv}`)
        $.expire = true;
        return
    }
    let actInfo = await getShopHomeActivityInfo();
    if (actInfo?.code !== '0') {
        $.log(JSON.stringify(actInfo))
        if (actInfo?.message.includes('不匹配')) {
            $.expire = true;
        }
        return
    }
    let actInfoData = actInfo?.result;

    if (actInfoData?.shopGifts?.filter(o => o.rearWord.includes('京豆')).length
        > 0) {
        $.activityId = actInfoData?.activityId?.toString();
        let gift = await drawShopGift();
        if (gift?.code !== '0') {
            $.log(JSON.stringify(gift))
            return
        }
        let giftData = gift?.result;
        $.log(giftData)
        for (let ele of
        giftData?.alreadyReceivedGifts?.filter(o => o.prizeType === 4) || []) {
            $.putMsg(`${ele.redWord}${ele.rearWord}`);
        }
    } else {
        $.putMsg(`没有豆子`);
    }
};
let kv = {'jd': '京豆', 'jf': '积分', 'dq': 'q券'}
$.after = async function () {
    $.msg.push(`\n${(await $.getShopInfo()).shopName}`);
    if ($?.content) {
        let message = `\n`;
        for (let ele of $.content || []) {
            message += `    ${ele.takeNum || ele.discount} ${kv[ele?.type]}\n`
        }
        $.msg.push(message)
        $.msg.push($.activityUrl);
    }
}
$.run({whitelist: ['1-5'], wait: [1000, 3000]}).catch(reason => $.log(reason))

async function drawShopGift() {
    $.log('店铺信息', $.shopId, $.venderId, $.activityId)
    let sb = {
        "follow": 0,
        "shopId": $.shopId,
        "activityId": $.activityId,
        "sourceRpc": "shop_app_home_window",
        "venderId": $.venderId
    };
    let newVar = await $.sign('drawShopGift', sb);

    let headers = {
        'J-E-H': '',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Host': 'api.m.jd.com',
        'Referer': '',
        'J-E-C': '',
        'Accept-Language': 'zh-Hans-CN;q=1, en-CN;q=0.9',
        'Accept': '*/*',
        'User-Agent': 'JD4iPhone/167841 (iPhone; iOS; Scale/3.00)'
    }
    // noinspection DuplicatedCode
    headers['Cookie'] = $.cookie
    let url = `https://api.m.jd.com/client.action?functionId=` + newVar.fn
    let {status, data} = await $.request(url, headers, newVar.sign);
    return data;
}

async function getShopHomeActivityInfo() {
    let sb = {
        "shopId": $.shopId,
        "source": "app-shop",
        "latWs": "0",
        "lngWs": "0",
        "displayWidth": "1098.000000",
        "sourceRpc": "shop_app_home_home",
        "lng": "0",
        "lat": "0",
        "venderId": $.venderId
    }
    let newVar = await $.sign('getShopHomeActivityInfo', sb);
    let headers = {
        'J-E-H': '',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Host': 'api.m.jd.com',
        'Referer': '',
        'J-E-C': '',
        'Accept-Language': 'zh-Hans-CN;q=1, en-CN;q=0.9',
        'Accept': '*/*',
        'User-Agent': 'JD4iPhone/167841 (iPhone; iOS; Scale/3.00)'
    }
    // noinspection DuplicatedCode
    headers['Cookie'] = $.cookie
    let url = `https://api.m.jd.com/client.action?functionId=` + newVar.fn
    let {status, data} = await $.request(url, headers, newVar.sign);
    return data;
}

