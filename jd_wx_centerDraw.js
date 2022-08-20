/*
7 7 7 7 7 jd_wx_centerDraw.js
*/
let mode = __dirname.includes('magic')
const {Env} = mode ? require('./magic') : require('./magic')
const $ = new Env('M老虎机抽奖');
$.lz = 'LZ_TOKEN_KEY=lztokef1eb8494b0af868bd18bdaf8;LZ_TOKEN_VALUE=Aa5RE8RuY4X3zA==;';
$.activityUrl = process.env.M_WX_CENTER_DRAW_URL
    ? process.env.M_WX_CENTER_DRAW_URL
    : '';
if (mode) {
    $.activityUrl = 'https://lzkj-isv.isvjcloud.com/lzclient/8e5f3ebaf6e545959aa6311d14be5dfa/cjwx/common/entry.html?activityId=8e5f3ebaf6e545959aa6311d14be5dfa&gameType=wxTurnTable'
    // $.activityUrl = 'https://lzkj-isv.isvjcloud.com/wxDrawActivity/activity?activityId=37c4c35255a84522bc944974edeef960'
    // $.activityUrl = 'https://lzkj-isv.isvjcloud.com/wxDrawActivity/activity?activityId=1155ac7d4ec74a8ba31238d846866599'
    $.activityUrl = 'https://lzkj-isv.isvjcloud.com/wxDrawActivity/activity?activityId=a5b7b7b8196e4dc192c4ffd3221a7866'
    $.activityUrl = 'https://lzkj-isv.isvjcloud.com/drawCenter/activity/75f5617c3c844163b8ccb1b410eb23e8?activityId=75f5617c3c844163b8ccb1b410eb23e8'
    $.activityUrl = 'https://lzkj-isv.isvjcloud.com/drawCenter/activity?activityId=7113c86ee0b94fbbb803a76c8bda6065'
}
$.activityUrl = $.match(
    /(https?:\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|])/,
    $.activityUrl)
$.domain = $.match(/https?:\/\/([^/]+)/, $.activityUrl)
$.activityId = $.getQueryString($.activityUrl, 'activityId')
let shopInfo = ''
$.uid = ''//全都助力1号
$.logic = async function () {
    if (!$.activityId || !$.activityUrl) {
        $.expire = true;
        $.putMsg(`activityId|activityUrl不存在`);
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

    await $.api(
        `common/${$.domain.includes('cjhy') ? 'accessLog' : 'accessLogWithAD'}`,
        `venderId=${$.venderId}&code=${$.activityType}&pin=${
            $.Pin}&activityId=${$.activityId}&pageUrl=${encodeURIComponent($.activityUrl)}&subType=app&adSource=`);

    let userInfo = await $.api('wxActionCommon/getUserInfo',
        `pin=${$.Pin}`);
    if (!userInfo.result) {
        $.putMsg('获取用户信息,结束运行')
        return
    }
    $.nickname = userInfo.data.nickname;

    //助力暂且不弄
    let activityContent = await $.api(
        'drawCenter/activityContent',
        `activityId=${$.activityId}&pin=${
            $.Pin}&nick=${$.nickname}&pinImg=${encodeURIComponent(
            'https://img10.360buyimg.com/imgzone/jfs/t1/21383/2/6633/3879/5c5138d8E0967ccf2/91da57c5e2166005.jpg')}&shareUuid=${$.uid}`,
        true);
    if (!activityContent.result || !activityContent.data) {
        $.putMsg(activityContent.errorMessage || '活动可能已结束')
        return
    }
    if (!$.uid) {
        $.uid = activityContent.data.uid//大概率助力码
    }
    let prizeList = await $.api('drawCenter/getPrizeList',
        `activityId=${$.activityId}&activityType=${$.activityType}&venderId=${$.venderId}`);
    if (prizeList.result) {
        $.content = prizeList.data;
    }
    let myInfo = await $.api('drawCenter/myInfo',
        `activityId=${$.activityId}&pin=${$.Pin}`);

    if (!myInfo.result) {
        $.putMsg('获取任务列表失败')
        return
    }
    for (let ele of myInfo?.data?.taskList || []) {
        if (ele.curNum >= ele.maxNeed) {
            //完成了
            continue;
        }
        let count = ele.maxNeed - ele.curNum;
        if (ele.taskId === 'followsku') {
            $.log('followsku')
            let products = await $.api('drawCenter/getProduct',
                `activityId=${$.activityId}&pin=${
                    $.Pin}&type=3`);
            for (let pd of products?.data.filter(o => !o.taskDone)) {
                if (count <= 0) {
                    break;
                }
                await $.api('drawCenter/doTask',
                    `activityId=${$.activityId}&pin=${
                        $.Pin}&taskId=followsku&param=${pd.skuId}`)
                await $.wait(200, 500)
                count--
            }
        }
        if (ele.taskId === 'add2cart') {
            $.log('add2cart')
            let products = await $.api('drawCenter/getProduct',
                `activityId=${$.activityId}&pin=${
                    $.Pin}&type=1`);
            for (let pd of products?.data.filter(o => !o.taskDone)) {
                if (count <= 0) {
                    break;
                }
                await $.api('drawCenter/doTask',
                    `activityId=${$.activityId}&pin=${
                        $.Pin}&taskId=add2cart&param=${pd.skuId}`)
                await $.wait(200, 500)
                count--
            }
        }
        if (ele.taskId === 'scansku') {
            $.log('scansku')
            let products = await $.api('drawCenter/getProduct',
                `activityId=${$.activityId}&pin=${
                    $.Pin}&type=2`);
            for (let pd of products?.data.filter(o => !o.taskDone)) {
                if (count <= 0) {
                    break;
                }
                await $.api('drawCenter/doTask',
                    `activityId=${$.activityId}&pin=${
                        $.Pin}&taskId=scansku&param=${pd.skuId}`)
                await $.wait(200, 500)
                count--
            }
        }
        if (ele.taskId === 'followshop') {
            $.log('followshop')
            await $.api('drawCenter/doTask',
                `activityId=${$.activityId}&pin=${
                    $.Pin}&taskId=followshop&param=`)
        }
        if (ele.taskId === 'joinvip') {
            $.log('joinvip')
            await $.api('drawCenter/doTask',
                `activityId=${$.activityId}&pin=${
                    $.Pin}&taskId=joinvip&param=`)
        }
    }
    activityContent = await $.api(
        'drawCenter/activityContent',
        `activityId=${$.activityId}&pin=${
            $.Pin}&nick=${$.nickname}&pinImg=${encodeURIComponent(
            'https://img10.360buyimg.com/imgzone/jfs/t1/21383/2/6633/3879/5c5138d8E0967ccf2/91da57c5e2166005.jpg')}&shareUuid=${$.uid}`,
        true);
    if (!activityContent.result) {
        $.putMsg('获取不到活动信息,结束运行')
        return
    }
    $.canDrawTimes = activityContent.data.chance || 0
    if ($.canDrawTimes === 0) {
        $.putMsg(`抽奖次数 ${$.canDrawTimes}`)
        return
    }
    for (let i = 0; i < $.canDrawTimes; i++) {
        let prize = await $.api('/drawCenter/draw/luckyDraw',
            `activityId=${$.activityId}&pin=${$.Pin}`);
        if (prize.result) {
            let msg = prize.data.drawOk ? prize.data.name
                : prize.data.errorMessage || '空气';
            $.putMsg(msg)
        } else {
            if (prize.errorMessage) {
                await $.wxStop(prize.errorMessage) ? $.expire = true : ''
                $.putMsg(`${prize.errorMessage}`);

            }
            break
        }
    }
}
$.after = async function () {
    if ($.msg.length > 0) {
        let message = `\n${(await $.getShopInfo()).shopName || ''}\n`;
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
$.run({whitelist: ['1-5'], wait: [1000, 3000]}).catch(reason => $.log(reason));
