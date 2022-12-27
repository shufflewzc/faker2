//问题反馈:https://t.me/Wall_E_Channel
let mode = __dirname.includes('magic')
const {Env} = mode ? require('./magic') : require('./magic')
const $ = new Env('M集卡抽奖');
$.activityUrl = process.env.M_WX_COLLECT_CARD_URL
    ? process.env.M_WX_COLLECT_CARD_URL
    : '';
//最多几个集卡的，其余只助力
let leaders = process.env.M_WX_COLLECT_CARD_LEADERS
    ? process.env.M_WX_COLLECT_CARD_LEADERS * 1
    : 5;
if (mode) {
    $.activityUrl = 'https://lzkjdz-isv.isvjcloud.com/wxCollectCard/activity/1193422?activityId=cb4d9c7ca992427db5a52ec1c0bcc42e'
    $.activityUrl = 'https://lzkjdz-isv.isvjcloud.com/wxCollectCard/activity/3839759?activityId=2a47604ff73b47b5b432a06dc2226b70'
}

$.activityUrl = $.match(
    /(https?:\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|])/,
    $.activityUrl)
$.domain = $.match(/https?:\/\/([^/]+)/, $.activityUrl)
$.activityId = $.getQueryString($.activityUrl, 'activityId')
$.shareUuid = ''
let stop = false;
let shopInfo = ''
const all = new Set();

$.logic = async function () {
    if (stop) {
        return;
    }
    if (!$.activityId || !$.activityUrl) {
        stop = true;
        $.putMsg(`activityId|activityUrl不存在`);
        return
    }
    $.log(`活动url: ${$.activityUrl} ${await $._algo() || ""}`)
    $.UA = $.ua();
    let token = await $.isvObfuscator();
    if (token.code !== '0') {
        $.putMsg(`获取Token失败`);
        return
    }
    $.Token = token?.token

    let actInfo = await $.api('customer/getSimpleActInfoVo',
        `activityId=${$.activityId}`);
    if (!actInfo.result || !actInfo.data) {
        $.log(`获取活动信息失败`);
        return
    }
    $.venderId = actInfo.data.venderId;
    $.shopId = actInfo.data.shopId;
    $.activityType = actInfo.data.activityType;

    let myPing = await $.api('customer/getMyPing',
        `userId=${$.venderId}&token=${$.Token}&fromType=APP`)
    if (!myPing.result) {
        $.putMsg(`获取pin失败`);
        return
    }
    $.Pin = $.domain.includes('cjhy') ? encodeURIComponent(
        encodeURIComponent(myPing.data.secretPin)) : encodeURIComponent(
        myPing.data.secretPin);

    shopInfo = await $.api(`wxCollectCard/shopInfo`,
        `activityId=${$.activityId}`);
    if (!shopInfo.result) {
        $.putMsg('获取不到店铺信息,结束运行')
        return
    }
    $.shopName = shopInfo?.data?.shopName

    await $.api(
        `common/${$.domain.includes('cjhy') ? 'accessLog' : 'accessLogWithAD'}`,
        `venderId=${$.venderId}&code=${$.activityType}&pin=${
            $.Pin}&activityId=${$.activityId}&pageUrl=${encodeURIComponent(
            $.activityUrl)}&subType=app&adSource=`);

    $.index > 1 ? $.log(`去助力${$.shareUuid}`) : ''
    let activityContent = await $.api(
        'wxCollectCard/activityContent',
        `activityId=${$.activityId}&pin=${
            $.Pin}&uuid=${$.shareUuid}`);
    if (!activityContent.result && !activityContent.data) {
        $.putMsg(activityContent.errorMessage || '活动可能已结束')
        return
    }

    let drawCount = $.match(/每人每天可获得(\d+)次/, activityContent.data.rule)
        && $.match(/每人每天可获得(\d+)次/, activityContent.data.rule) * 1 || 5
    console.log('openCard', activityContent.data.openCard);
    $.shareUuid = $.shareUuid || activityContent.data.uuid
    if ($.index % 5 === 0) {
        $.log('执行可持续发展之道')
        await $.wait(1000, 6000)
    }
    let drawContent = await $.api('wxCollectCard/drawContent',
        `activityId=${$.activityId}`);
    if (drawContent.result && drawContent.data) {
        $.content = drawContent.data.content || []
    }
    let memberInfo = await $.api($.domain.includes('cjhy')
        ? 'mc/new/brandCard/common/shopAndBrand/getOpenCardInfo'
        : 'wxCommonInfo/getActMemberInfo',
        $.domain.includes('cjhy')
            ? `venderId=${$.venderId}&buyerPin=${$.Pin}&activityType=${$.activityType}`
            :
            `venderId=${$.venderId}&activityId=${$.activityId}&pin=${
                $.Pin}`);
    //没开卡 需要开卡
    if ($.domain.includes('cjhy')) {
        //没开卡 需要开卡
        if (memberInfo.result && !memberInfo.data?.openCard
            && memberInfo.data?.openCardLink) {
            $.putMsg('需要开卡，跳过')
            return
        }
    } else {
        if (memberInfo.result && !memberInfo.data?.openCard
            && memberInfo.data?.actMemberStatus === 1) {
            $.putMsg('需要开卡，跳过')
            return
        }
    }
    $.shareUuid = $.shareUuid || activityContent.data.uuid
    let userInfo = await $.api('wxActionCommon/getUserInfo',
        `pin=${$.Pin}`);
    if (!userInfo.result || !userInfo.data) {
        $.putMsg(`获取getUserInfo失败`);
        return
    }
    $.nickname = userInfo.data.nickname;
    $.attrTouXiang = userInfo.data.yunMidImageUrl
        || 'https://img10.360buyimg.com/imgzone/jfs/t1/21383/2/6633/3879/5c5138d8E0967ccf2/91da57c5e2166005.jpg'

    await $.api('crm/pageVisit/insertCrmPageVisit',
        `venderId=${$.venderId}&elementId=${encodeURIComponent(
            '邀请')}&pageId=${$.activityId}&pin=${$.Pin}`);

    await $.api('wxCollectCard/drawCard',
        `sourceId=${$.shareUuid}&activityId=${$.activityId}&type=1&pinImg=${encodeURIComponent(
            $.attrTouXiang)}&pin=${$.Pin}&jdNick=${encodeURIComponent(
            $.nickname)}`);
    if ($.index > leaders) {
        return
    }
    let saveSource = await $.api('wxCollectCard/saveSource',
        `activityId=${$.activityId}&pinImg=${encodeURIComponent(
            $.attrTouXiang)}&pin=${
            $.Pin}&jdNick=${encodeURIComponent($.nickname)}`);
    if (!saveSource.result || !saveSource.data) {
        $.putMsg(`初始化shareuuid失败`);
        return
    }
    $.shareUuid = $.shareUuid || saveSource.data

    for (let i = 0; i < drawCount; i++) {
        let prize = await $.api(`wxCollectCard/drawCard`,
            `sourceId=${saveSource.data}&activityId=${$.activityId}&type=0`);
        $.log(JSON.stringify(prize))
        if (prize.result) {
            // $.putMsg(prize.data.reward.cardName);
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
        await $.api('crm/pageVisit/insertCrmPageVisit',
            `venderId=${$.venderId}&elementId=${encodeURIComponent(
                '抽卡')}&pageId=${$.activityId}&pin=${
                $.Pin}`);
        await $.wait(1000, 2000)
    }
    activityContent = await $.api(
        'wxCollectCard/activityContent',
        `activityId=${$.activityId}&pin=${
            $.Pin}&uuid=${$.shareUuid}`);
    if (!activityContent.result || !activityContent.data) {
        $.putMsg(activityContent.errorMessage || '活动可能已结束')
        return
    }

    if (activityContent.data.canDraw) {
        let prize = await $.api(`wxCollectCard/getPrize`,
            `activityId=${$.activityId}&pin=${$.Pin}`);
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
        activityContent = await $.api(
            'wxCollectCard/activityContent',
            `activityId=${$.activityId}&pin=${
                $.Pin}&uuid=${$.shareUuid}`);
        if (!activityContent.result || !activityContent.data) {
            $.putMsg(activityContent.errorMessage || '活动可能已结束')
            return
        }
        const has = new Set();
        for (const ele of activityContent.data.cardList) {
            all.add(ele.cardName)
            ele.count > 0 ? has.add(ele.cardName) : ''
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
$.run({whitelist: ['1-5'], wait: [1000, 3000]}).catch(
    reason => $.log(reason));
