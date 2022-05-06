//问题反馈:https://t.me/Wall_E_Channel
/*
7 7 7 7 7 m_jd_wx_luckDraw.js
*/
let mode = __dirname.includes('magic')
const {Env} = mode ? require('./magic') : require('./magic')
const $ = new Env('M幸运抽奖');
$.activityUrl = process.env.M_WX_LUCK_DRAW_URL
    ? process.env.M_WX_LUCK_DRAW_URL
    : '';
$.notLuckDrawList = process.env.M_WX_NOT_LUCK_DRAW_LIST
    ? process.env.M_WX_NOT_LUCK_DRAW_LIST.split('@')
    : 'test'.split('@');
if (mode) {
    $.activityUrl = 'https://lzkj-isv.isvjcloud.com/lzclient/1648724528320/cjwx/common/entry.html?activityId=9cf424654f2d4821a229f73043987968&gameType=wxTurnTable&shopid=11743182'
}
$.activityUrl = $.match(
    /(https?:\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|])/,
    $.activityUrl)
$.domain = $.match(/https?:\/\/([^/]+)/, $.activityUrl)
$.activityId = $.getQueryString($.activityUrl, 'activityId')
let shopInfo = ''
$.logic = async function () {
    if (!$.activityId || !$.activityUrl) {
        $.expire = true;
        $.putMsg(`activityId|activityUrl不存在`, $.activityUrl, $.activityId);
        return
    }
    $.log(`活动id: ${$.activityId}`, `活动url: ${$.activityUrl}`)
    $.UA = $.ua();

    let token = await $.isvObfuscator();
    if (token.code !== '0') {
        $.putMsg(`获取Token失败`);
        return
    }
    $.Token = token?.token
    if ($.domain.includes("gzsl")) {
        let activityContent = await $.api(
            `wuxian/user/getLottery/${$.activityId}`,
            {'id': $.activityId, 'token': $.Token, 'source': "01"});
        $.log(activityContent)
        if (activityContent.status !== '1') {
            $.putMsg(`获取活动信息失败`);
            return;
        }
        $.shopName = activityContent.activity.shopName
        $.activityType = activityContent.activity.activityType
        $.shopId = activityContent.activity.shopId;
        $.content = activityContent.activity.prizes
        if (activityContent.leftTime === 0) {
            $.putMsg("抽奖次数为0")
        }
        while (activityContent.leftTime-- > 0) {
            await $.wait(3000, 5000)
            let data = await $.api(
                `wuxian/user/draw/${$.activityId}`,
                {'id': $.activityId, 'token': $.Token, 'source': "01"});
            if (data.status !== "1") {
                if (data.status === "-14") {
                    $.putMsg("开卡入会后参与活动")
                    break;
                }
                if (data.status === "-2") {
                    $.putMsg("已结束")
                    $.expire = true;
                    break;
                }
                $.putMsg(data.msg)
                continue
            }
            if (data?.winId) {
                if (data.data.source === "0") {
                    activityContent.leftTime++
                }
                $.putMsg(data.data.name)
            } else {
                $.putMsg("空气")
            }
        }
    } else {
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

        shopInfo = await $.api('wxDrawActivity/shopInfo',
            `activityId=${$.activityId}`);
        if (!shopInfo.result) {
            $.putMsg('获取不到店铺信息,结束运行')
            return
        }
        $.shopName = shopInfo?.data?.shopName

        for (let ele of $.notLuckDrawList) {
            if ($.shopName.includes(ele)) {
                $.expire = true
                $.putMsg('已屏蔽')
                return
            }
        }
        await $.api(
            `common/${$.domain.includes('cjhy') ? 'accessLog'
                : 'accessLogWithAD'}`,
            `venderId=${$.venderId}&code=${$.activityType}&pin=${$.Pin}&activityId=${$.activityId}&pageUrl=${encodeURIComponent(
                $.activityUrl)}&subType=app&adSource=`);
        let activityContent = await $.api(
            `${$.activityType === 26 ? 'wxPointDrawActivity'
                : 'wxDrawActivity'}/activityContent`,
            `activityId=${$.activityId}&pin=${$.Pin}`);
        if (!activityContent.result || !activityContent.data) {
            $.putMsg(activityContent.errorMessage || '活动可能已结束')
            return
        }
        debugger
        $.hasFollow = activityContent.data.hasFollow || ''
        $.needFollow = activityContent.data.needFollow || false
        $.canDrawTimes = activityContent.data.canDrawTimes || 1
        $.content = activityContent.data.content || []
        $.drawConsume = activityContent.data.drawConsume || 0
        $.canDrawTimes === 0 ? $.canDrawTimes = 1 : ''
        debugger
        let memberInfo = await $.api($.domain.includes('cjhy')
            ? 'mc/new/brandCard/common/shopAndBrand/getOpenCardInfo'
            : 'wxCommonInfo/getActMemberInfo',
            $.domain.includes('cjhy')
                ? `venderId=${$.venderId}&buyerPin=${$.Pin}&activityType=${$.activityType}`
                :
                `venderId=${$.venderId}&activityId=${$.activityId}&pin=${$.Pin}`);
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

        if ($.needFollow && !$.hasFollow) {
            let followShop = await $.api($.domain.includes('cjhy')
                ? 'wxActionCommon/newFollowShop'
                : 'wxActionCommon/followShop',
                $.domain.includes('cjhy')
                    ? `venderId=${$.venderId}&activityId=${$.activityId}&buyerPin=${$.Pin}&activityType=${$.activityType}`
                    : `userId=${$.venderId}&activityId=${$.activityId}&buyerNick=${$.Pin}&activityType=${$.activityType}`);
            if (!followShop.result) {
                $.putMsg(followShop.errorMessage)
                return;
            }
            await $.wait(1000);
        }
        for (let m = 1; $.canDrawTimes--; m++) {
            let prize = await $.api(
                `${$.activityType === 26 ? 'wxPointDrawActivity'
                    : 'wxDrawActivity'}/start`,
                $.domain.includes('cjhy')
                    ? `activityId=${$.activityId}&pin=${$.Pin}`
                    : `activityId=${$.activityId}&pin=${$.Pin}`);
            if (prize.result) {
                $.canDrawTimes = prize.data.canDrawTimes
                let msg = prize.data.drawOk ? prize.data.name
                    : prize.data.errorMessage || '空气';
                $.putMsg(msg)
            } else {
                if (prize.errorMessage) {
                    $.putMsg(`${prize.errorMessage}`);
                    if (prize.errorMessage.includes('来晚了')
                        || prize.errorMessage.includes('已发完')
                        || prize.errorMessage.includes('活动已结束')) {
                        $.expire = true;
                    }
                }
                break
            }
            await $.wait(parseInt(Math.random() * 500 + 1500, 10));
        }
    }
    await $.unfollow($.shopId)
}
let kv = {
    3: '幸运九宫格',
    4: '转盘抽奖',
    11: '扭蛋抽奖',
    12: '九宫格抽奖',
    13: '转盘抽奖',
    26: '积分抽奖'
}
let kv2 = {'0': '再来一次', '1': '京豆', '2': '券', '3': '实物', '4': '积分'}

$.after = async function () {
    let message = `\n${$.shopName || ''} ${kv[$.activityType]
    || $.activityType}\n`;
    for (let ele of $.content || []) {
        if (ele.name.includes('谢谢') || ele.name.includes('再来')) {
            continue;
        }
        if ($.domain.includes('lzkj') || $.domain.includes('cjhy')) {
            message += `\n    ${ele.name} ${ele?.type === 8 ? '专享价' : ''}`
        } else {
            message += `    ${ele.name} ${kv2[ele?.source]
            || ele?.source}\n`
        }
    }
    $.msg.push(message)
    $.msg.push($.activityUrl);
}
$.run({whitelist: ['1-5'], wait: [3000, 5000]}).catch(
    reason => $.log(reason));

