let common = require("./function/common");
let $ = new common.env('京喜工厂助力');
let min = 3,
    help = $.config[$.filename(__filename)] || Math.min(min, $.config.JdMain) || min;
$.setOptions({
    headers: {
        'content-type': 'application/json',
        'user-agent': 'jdpingou;iPhone;4.8.2;13.7;a3b4e844090b28d5c38e7529af8115172079be4d;network/wifi;model/iPhone8,1;appBuild/100546;ADID/00000000-0000-0000-0000-000000000000;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;hasOCPay/0;supportBestPay/0;session/374;pap/JA2019_3111789;brand/apple;supportJDSHWK/1;Mozilla/5.0 (iPhone; CPU iPhone OS 13_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
        'referer': 'https://st.jingxi.com/pingou/dream_factory/divide.html?activeId=laD7IwPwDF1-Te-MvbW9Iw==&_close=1&jxsid=16232028831911667857',
    }
});
$.readme = `
44 */6 * * * task ${$.runfile}
export ${$.runfile}=2  #如需增加被助力账号,在这边修改人数
`
eval(common.eval.mainEval($));
async function prepare() {
    let deramUrl = 'https://st.jingxi.com/pingou/dream_factory/index.html?ptag=7155.9.46'
    let html = await $.curl(deramUrl)
    try {
        ary = $.matchall(/activeId=([^\&\,]+)","bgImg".+?"start":"([^\"]+)"/g, html)
        dicts = {}
        for (let i of ary) {
            dicts[new Date(i[1]).getTime()] = i[0]
        }
        max = Math.max(...Object.keys(dicts).filter(d => parseInt(d) < $.timestamp))
        $.activeId = dicts[max]
    } catch (e) {
        $.activeId = 'yNtpovqFehHByNrt_lmb3g=='
    }
    console.log("开团ID:", $.activeId)
    let url = `https://m.jingxi.com/dreamfactory/tuan/QueryActiveConfig?activeId=${$.activeId}&tuanId=&_time=1623214804148&_stk=_time%2CactiveId%2CtuanId&_ste=1&sceneval=2&g_login_type=1&callback=jsonpCBKA&g_ty=ls`
    let dec = await jxAlgo.dec(url)
    for (let j of cookies['help']) {
        $.setCookie(j);
        await $.curl(dec.url)
        try {
            if ($.source.data.userTuanInfo.tuanId) {
                $.sharecode.push($.compact($.source.data.userTuanInfo, ['activeId', 'tuanId']))
            } else {}
        } catch (e) {}
    }
}
async function main(id) {
    common.assert(id.activeId, '没有开团ID')
    let url = `https://m.jingxi.com/dreamfactory/tuan/JoinTuan?activeId=${id.activeId}&tuanId=${id.tuanId}&_time=1623214617107&_stk=_time%2CactiveId%2CtuanId&_ste=1&sceneval=2&g_login_type=1&g_ty=ls`
    let dec = await jxAlgo.dec(url)
    let params = {
        'url': dec.url,
        'cookie': id.cookie
    }
    await $.curl(params)
    console.log($.source)
}
async function extra() {
    for (let j of cookies['help']) {
        $.setCookie(j);
        let url = `https://m.jingxi.com/dreamfactory/tuan/QueryActiveConfig?activeId=${$.activeId}&tuanId=&_time=1623214804148&_stk=_time%2CactiveId%2CtuanId&_ste=1&sceneval=2&g_login_type=1&callback=jsonpCBKA&g_ty=ls`
        let dec = await jxAlgo.dec(url)
        await $.curl(dec.url)
        url = `https://m.jingxi.com/dreamfactory/tuan/Award?activeId=${$.source.data.userTuanInfo.activeId}&tuanId=${$.source.data.userTuanInfo.tuanId}&_time=1623518911051&_stk=_time%2CactiveId%2CtuanId&_ste=1&_=1623518911082&sceneval=2&g_login_type=1&callback=jsonpCBKF&g_ty=ls`
        dec = await jxAlgo.dec(url)
        await $.curl(dec.url)
        console.log($.source)
        if ($.source.msg != '您还没有成团') {
            url = `https://m.jingxi.com/dreamfactory/tuan/CreateTuan?activeId=${$.activeId}&isOpenApp=1&_time=1624120758151&_stk=_time%2CactiveId%2CisOpenApp&_ste=1`
            dec = await jxAlgo.dec(url)
            await $.curl(dec.url)
            console.log($.source)
        }
    }
}
