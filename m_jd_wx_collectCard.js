/*
cron:1 1 1 1 1 1
*/
let mode = __dirname.includes('magic')
const {Env} = mode ? require('./magic') : require('./magic')
const $ = new Env('M集卡抽奖');
$.lz = 'LZ_TOKEN_KEY=lztokef1eb8494b0af868bd18bdaf8;LZ_TOKEN_VALUE=Aa5RE8RuY4X3zA==;';

$.activityUrl = process.env.M_WX_COLLECT_CARD_URL
    ? process.env.M_WX_COLLECT_CARD_URL
    : '';
if (mode) {
    $.activityUrl = 'https://lzkjdz-isv.isvjcloud.com/wxCollectCard/activity/2149304?activityId=84a8b50d3a0c48f9bc7804be9da5deac'
    $.activityUrl = 'https://lzkjdz-isv.isvjcloud.com/wxCollectCard/activity/1193422?activityId=cb4d9c7ca992427db5a52ec1c0bcc42e'
}

let stop = false;
$.s = 1
const all = new Set();
$.logic = async function () {
    if (stop) {
        return;
    }
    $.activityUrl = $.activityUrl.replace("#","&")
    $.activityId = $.getQueryString($.activityUrl, 'activityId')
    if (!$.activityId || !$.activityUrl) {
        $.log(`活动id不存在`);
        return
    }
    $.log(`活动id: ${$.activityId}`, `活动url: ${$.activityUrl}`)
    $.domain = $.activityUrl.match(/https?:\/\/([^/]+)/) && $.activityUrl.match(
        /https?:\/\/([^/]+)/)[1] || ''
    $.UA = `jdapp;iPhone;10.2.2;13.1.2;${$.uuid()};M/5.0;network/wifi;ADID/;model/iPhone8,1;addressid/2308460611;appBuild/167863;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;`
   await getLzToken()

    $.domain.includes('lzkj-isv.isvjcloud.com') ? await api(
        'wxCommonInfo/initActInfo', `activityId=${$.activityId}`) : ''
    let token = await getToken();
    if (token.code !== '0') {
        $.putMsg(`获取Token失败`);
        return
    }
    $.Token = token?.token

    let actInfo = await api('customer/getSimpleActInfoVo',
        `activityId=${$.activityId}`);
    if (!actInfo.result || !actInfo.data) {
        $.log(`获取活动信息失败`);
        return
    }
    $.venderId = actInfo.data.venderId;
    $.shopId = actInfo.data.shopId;
    $.activityType = actInfo.data.activityType;

    let myPing = await api('customer/getMyPing',
        `userId=${$.venderId}&token=${$.Token}&fromType=APP`)
    if (!myPing.result) {
        $.putMsg(`获取pin失败`);
        return
    }
    $.Pin = myPing.data.secretPin;

    shopInfo = await api(`wxCollectCard/shopInfo`,
        `activityId=${$.activityId}`);
    if (!shopInfo.result) {
        $.putMsg('获取不到店铺信息,结束运行')
        return
    }
    $.shopName = shopInfo?.data?.shopName

    await api(
        `common/${$.domain.includes('cjhy') ? 'accessLog' : 'accessLogWithAD'}`,
        `venderId=${$.venderId}&code=${$.activityType}&pin=${encodeURIComponent(
            $.Pin)}&activityId=${$.activityId}&pageUrl=${$.activityUrl}&subType=app&adSource=`);

    $.index > 1 ? $.log(`去助力${$.shareUuid}`) : ''
    let activityContent = await api(
        'wxCollectCard/activityContent',
        `activityId=${$.activityId}&pin=${encodeURIComponent(
            $.Pin)}&uuid=${$.shareUuid}`);
    if (!activityContent.result && !activityContent.data) {
        $.putMsg(activityContent.errorMessage || '活动可能已结束')
        return
    }

    let drawCount = $.match(/每人每天可获得(\d+)次/, activityContent.data.rule)
        && $.match(/每人每天可获得(\d+)次/, activityContent.data.rule) * 1 || 5
    console.log('openCard', activityContent.data.openCard);
    $.shareUuid = $.shareUuid || activityContent.data.uuid

    let drawContent = await api('wxCollectCard/drawContent',
        `activityId=${$.activityId}`);
    if (drawContent.result && drawContent.data) {
        $.content = drawContent.data.content || []
    }

    debugger
    $.shareUuid = $.shareUuid || activityContent.data.uuid
    let userInfo = await api('wxActionCommon/getUserInfo',
        `pin=${encodeURIComponent($.Pin)}`);
    if (!userInfo.result || !userInfo.data) {
        $.putMsg(`获取getUserInfo失败`);
        return
    }
    $.nickname = userInfo.data.nickname;
    $.attrTouXiang = userInfo.data.yunMidImageUrl
        || 'https://img10.360buyimg.com/imgzone/jfs/t1/21383/2/6633/3879/5c5138d8E0967ccf2/91da57c5e2166005.jpg'

    await api('crm/pageVisit/insertCrmPageVisit',
        `venderId=${$.venderId}&elementId=${encodeURIComponent(
            '邀请')}&pageId=${$.activityId}&pin=${encodeURIComponent($.Pin)}`);
    let saveSource = await api('wxCollectCard/saveSource',
        `activityId=${$.activityId}&pinImg=${encodeURIComponent(
            $.attrTouXiang)}&pin=${encodeURIComponent(
            $.Pin)}&jdNick=${encodeURIComponent($.nickname)}`);
    if (!saveSource.result || !saveSource.data) {
        $.putMsg(`初始化shareuuid失败`);
        return
    }
    $.shareUuid = $.shareUuid || saveSource.data
    for (let i = 0; i < drawCount; i++) {
        let prize = await api(`wxCollectCard/drawCard`,
            `sourceId=${saveSource.data}&activityId=${$.activityId}&type=0`);
        $.log(JSON.stringify(prize))
        if (prize.result) {
            $.putMsg(prize.data.reward.cardName);
        } else {
            if (prize.errorMessage.includes('上限')) {
                $.putMsg('上限');
                break;
            } else if (prize.errorMessage.includes('来晚了')
                || prize.errorMessage.includes('已发完')
                || prize.errorMessage.includes('活动已结束')) {
                stop = true;
                break
            }
            $.log(`${prize}`);
        }
        await api('crm/pageVisit/insertCrmPageVisit',
            `venderId=${$.venderId}&elementId=${encodeURIComponent(
                '抽卡')}&pageId=${$.activityId}&pin=${encodeURIComponent(
                $.Pin)}`);
        await $.wait(1000,2000)
    }
    activityContent = await api(
        'wxCollectCard/activityContent',
        `activityId=${$.activityId}&pin=${encodeURIComponent(
            $.Pin)}&uuid=${$.shareUuid}`);
    if (!activityContent.result && !activityContent.data) {
        $.putMsg(activityContent.errorMessage || '活动可能已结束')
        return
    }

    if (activityContent.data.canDraw) {
        let prize = await api(`wxCollectCard/getPrize`,
            `activityId=${$.activityId}&pin=${encodeURIComponent($.Pin)}`);
        $.log(JSON.stringify(prize))
        if (!prize.result) {
            let msg = prize.data.drawOk ? prize.data.name
                : prize.data.errorMessage || '空气';
            $.log(msg);
        } else {
            $.putMsg(`${prize.errorMessage}`);
            if (prize.errorMessage.includes('来晚了')
                || prize.errorMessage.includes('已发完')
                || prize.errorMessage.includes('活动已结束')) {
                stop = true;
            }
        }
    } else {
        activityContent = await api(
            'wxCollectCard/activityContent',
            `activityId=${$.activityId}&pin=${encodeURIComponent(
                $.Pin)}&uuid=${$.shareUuid}`);
        if (!activityContent.result && !activityContent.data) {
            $.putMsg(activityContent.errorMessage || '活动可能已结束')
            return
        }
        const has = new Set();
        for (const ele of activityContent.data.cardList) {
            all.add(ele.cardName)
            ele.count >0 ? has.add(ele.cardName) : ''
        }
        $.putMsg(Array.from(has).join(','))
    }

}
$.after = async function () {
    if ($.msg.length > 0) {
        let message = `\n${$.shopName || ''}\n`;
        message += `\n${Array.from(all).join(",")}\n`;
        for (let ele of $.content || []) {
            if (ele.name.includes('谢谢') || ele.name.includes('再来')) {
                continue;
            }
            message += `    ${ele.name}${ele?.type === 8 ? '专享价' : ''}\n`
        }
        $.msg.push(message)
        $.msg.push($.activityUrl);
    }
}
$.run().catch(reason => $.log(reason));

async function api(fn, body, isv) {
    let url = `https://${$.domain}/${fn}`
    let ck = $.lz + ($.Pin && "AUTH_C_USER=" + $.Pin + ";" || "")
    ck = isv ? `IsvToken=${$.Token};` + ck : ck;
    let headers = {
        "Host": $.domain,
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": `https://${$.domain}`,
        "Cookie": ck,
        "Referer": `${$.activityUrl}`,
        "User-Agent": $.UA
    }
    let {data} = await $.request(url, headers, body)
    $.log(JSON.stringify(data))
    await $.wait(200, 300)
    return data;
}

async function getToken() {
    let url = `https://api.m.jd.com/client.action?functionId=isvObfuscator`
    let body = ''
    switch ($.domain) {
        case 'cjhy-isv.isvjcloud.com':
            body = 'body=%7B%22url%22%3A%22https%3A//cjhy-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&uuid=920cd9b12a1e621d91ca2c066f6348bb5d4b586b&client=apple&clientVersion=10.1.4&st=1633916729623&sv=102&sign=9eee1d69b69daf9e66659a049ffe075b'
            break
        case 'lzkj-isv.isvjcloud.com':
            body = 'body=%7B%22url%22%3A%22https%3A//lzkj-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&uuid=925ce6441339525429252488722251fff6b10499&client=apple&clientVersion=10.1.4&st=1633777078141&sv=111&sign=00ed6b6f929625c69f367f1a0e5ad7c7'
            break
        case 'cjhydz-isv.isvjcloud.com':
            body = 'adid=7B411CD9-D62C-425B-B083-9AFC49B94228&area=16_1332_42932_43102&body=%7B%22url%22%3A%22https%3A%5C/%5C/cjhydz-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&build=167541&client=apple&clientVersion=9.4.0&d_brand=apple&d_model=iPhone8%2C1&eid=eidId10b812191seBCFGmtbeTX2vXF3lbgDAVwQhSA8wKqj6OA9J4foPQm3UzRwrrLdO23B3E2wCUY/bODH01VnxiEnAUvoM6SiEnmP3IPqRuO%2By/%2BZo&isBackground=N&joycious=48&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&openudid=2f7578cb634065f9beae94d013f172e197d62283&osVersion=13.1.2&partner=apple&rfs=0000&scope=11&screen=750%2A1334&sign=60bde51b4b7f7ff6e1bc1f473ecf3d41&st=1613720203903&sv=110&uts=0f31TVRjBStG9NoZJdXLGd939Wv4AlsWNAeL1nxafUsZqiV4NLsVElz6AjC4L7tsnZ1loeT2A8Z5/KfI/YoJAUfJzTd8kCedfnLG522ydI0p40oi8hT2p2sNZiIIRYCfjIr7IAL%2BFkLsrWdSiPZP5QLptc8Cy4Od6/cdYidClR0NwPMd58K5J9narz78y9ocGe8uTfyBIoA9aCd/X3Muxw%3D%3D&uuid=hjudwgohxzVu96krv/T6Hg%3D%3D&wifiBssid=9cf90c586c4468e00678545b16176ed2'
            break
        default:
            body = 'adid=7B411CD9-D62C-425B-B083-9AFC49B94228&area=16_1332_42932_43102&body=%7B%22url%22%3A%22https%3A%5C/%5C/cjhydz-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&build=167541&client=apple&clientVersion=9.4.0&d_brand=apple&d_model=iPhone8%2C1&eid=eidId10b812191seBCFGmtbeTX2vXF3lbgDAVwQhSA8wKqj6OA9J4foPQm3UzRwrrLdO23B3E2wCUY/bODH01VnxiEnAUvoM6SiEnmP3IPqRuO%2By/%2BZo&isBackground=N&joycious=48&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&openudid=2f7578cb634065f9beae94d013f172e197d62283&osVersion=13.1.2&partner=apple&rfs=0000&scope=11&screen=750%2A1334&sign=60bde51b4b7f7ff6e1bc1f473ecf3d41&st=1613720203903&sv=110&uts=0f31TVRjBStG9NoZJdXLGd939Wv4AlsWNAeL1nxafUsZqiV4NLsVElz6AjC4L7tsnZ1loeT2A8Z5/KfI/YoJAUfJzTd8kCedfnLG522ydI0p40oi8hT2p2sNZiIIRYCfjIr7IAL%2BFkLsrWdSiPZP5QLptc8Cy4Od6/cdYidClR0NwPMd58K5J9narz78y9ocGe8uTfyBIoA9aCd/X3Muxw%3D%3D&uuid=hjudwgohxzVu96krv/T6Hg%3D%3D&wifiBssid=9cf90c586c4468e00678545b16176ed2'
    }
    let headers = {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Content-Type": "application/x-www-form-urlencoded",
        "Host": "api.m.jd.com",
        "Cookie": $.cookie,
        "User-Agent": $.UA,
    }
    let {data} = await $.request(url, headers, body)
    return data;
}

async function getLzToken() {
    let url = `https://${$.domain}/wxTeam/activity?activityId=${$.activityId}`
    return await $.request(url, {
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Mobile/15E148 Safari/604.1",
        'Accept-Language': 'zh-cn',
        'Cookie': $.cookie
    });
}
