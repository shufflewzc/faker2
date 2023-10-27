let common = require("./function/common");
let jsdom = require("jsdom");
let $ = new common.env('京东保价');
let min = 1,
    help = $.config[$.filename(__filename)] || Math.min(min, $.config.JdMain) || min;
$.setOptions({
    headers: {
        'content-type': 'application/json',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0',
        'referer': 'https://msitepp-fm.jd.com/rest/priceprophone/priceProPhoneMenu?sid=0b5a9d5564059f36ed16a8967c37e24w',
    }
});
$.readme = `
48 */8 * * * task ${$.runfile}
export ${$.runfile}=1  #输出购买订单保价内容,没什么用
`
eval(common.eval.mainEval($));
async function prepare() {}
async function main(id) {
    try {
        await jstoken()
        // 一键保价
        p = {
            'url': `https://api.m.jd.com/api?appid=siteppM&functionId=siteppM_skuOnceApply&forcebot=&t=${$.timestamp}`,
            "form": {
                "body": JSON.stringify({
                    sid: '',
                    type: 3,
                    forcebot: '',
                    token: $.token,
                    feSt: 's'
                })
            }
        };
        h = await $.curl(p)
        console.log(h)
        console.log("等待20s获取保价信息")
        await $.wait(20000)
        // 获取保价信息
        let p2 = {
            'url': `https://api.m.jd.com/api?appid=siteppM&functionId=siteppM_appliedSuccAmount&forcebot=&t=${$.timestamp}`,
            // 'form': {
            //     'body': `"{\"sid\":\"\",\"type\":\"3\",\"forcebot\":\"\"}"`
            // }
            'form': 'body={"sid":"","type":"3","forcebot":"","num":15}'
        }
        await $.curl(p2)
        if ($.source.flag) {
            text = `本次保价金额: ${$.source.succAmount}`
        } else {
            text = "本次无保价订单"
        }
        console.log(text)
        $.notice(text)
        if ($.config[$.runfile]) {
            // 单个商品检测,没什么用处
            console.log("\n手动保价前25个订单")
            html = ''
            for (let i = 1; i < 6; i++) {
                await jstoken()
                p3 = {
                    'url': `https://api.m.jd.com/api?appid=siteppM&functionId=siteppM_priceskusPull&forcebot=&t=${$.timestamp}`,
                    'form': {
                        'body': JSON.stringify({
                            "page": i,
                            "pageSize": 5,
                            "keyWords": "",
                            "sid": "",
                            "type": "3",
                            "forcebot": "",
                            "token": $.token,
                            "feSt": "s"
                        })
                    }
                }
                html += await $.curl(p3)
            }
            amount = $.matchall(/class="name"\>\s*([^\<]+).*?orderId="(\d+)"\s*skuId="(\d+)"/g, html.replace(/\n/g, ''))
            for (let i of amount) {
                // 获取有无申请按钮
                p4 = {
                    'url': `https://api.m.jd.com/api?appid=siteppM&functionId=siteppM_skuProResultPin&forcebot=&t=${$.timestamp}`,
                    'form': {
                        'body': JSON.stringify({
                            "orderId": i[1],
                            "skuId": i[2],
                            "sequence": "1",
                            "sid": "",
                            "type": "3",
                            "forcebot": ""
                        })
                    }
                }
                h = await $.curl(p4)
                if (h.includes("hidden")) {
                    console.log(`商品: ${i[0]} 不支持保价或无降价`)
                } else {
                    await jstoken()
                    // 申请请求
                    p5 = {
                        'url': `https://api.m.jd.com/api?appid=siteppM&functionId=siteppM_proApply&forcebot=&t=${$.timestamp}`,
                        'form': {
                            'body': JSON.stringify({
                                "orderId": i[1],
                                "orderCategory": "Others",
                                "skuId": i[2],
                                "sid": "",
                                "type": "3",
                                "refundtype": "1",
                                "forcebot": "",
                                "token": $.token,
                                "feSt": "s"
                            })
                        }
                    }
                    await $.curl(p5)
                    if ($.source.proSkuApplyId) {
                        // 申请结果
                        p6 = {
                            'url': `https://api.m.jd.com/api?appid=siteppM&functionId=siteppM_moreApplyResult&forcebot=&t=${$.timestamp}`,
                            'form': `body={"proSkuApplyIds":"${$.source.proSkuApplyId[0]}","type":"3"}`
                        }
                        await $.curl(p6)
                        console.log(`商品: ${i[0]} `, $.haskey($.source, 'applyResults.0.applyResultVo.failTypeStr'))
                    } else {
                        console.log(`商品: ${i[0]} ${$.source.errorMessage}`)
                    }
                }
            }
        }
    } catch (e) {}
}
async function jstoken() {
    let {
        JSDOM
    } = jsdom;
    let resourceLoader = new jsdom.ResourceLoader({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0',
        referrer: "https://msitepp-fm.jd.com/rest/priceprophone/priceProPhoneMenu?sid=0b5a9d5564059f36ed16a8967c37e24w",
    });
    let virtualConsole = new jsdom.VirtualConsole();
    var options = {
        referrer: "https://msitepp-fm.jd.com/rest/priceprophone/priceProPhoneMenu?sid=0b5a9d5564059f36ed16a8967c37e24w",
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0',
        runScripts: "dangerously",
        resources: resourceLoader,
        //  cookieJar,
        includeNodeLocations: true,
        storageQuota: 10000000,
        pretendToBeVisual: true,
        virtualConsole
    };
    $.dom = new JSDOM(`<body><script src="https://js-nocaptcha.jd.com/statics/js/main.min.js"></script></body>`, options);
    await $.wait(1000)
    try {
        feSt = 's'
        jab = new $.dom.window.JAB({
            bizId: 'jdjiabao',
            initCaptcha: false
        })
        $.token = jab.getToken()
    } catch (e) {}
}
