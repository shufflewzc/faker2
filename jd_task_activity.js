const Template = require('../../template');

class Main extends Template {
    constructor() {
        super()
        this.title = "京东热爱奇旅游"
        this.cron = "12 0,13 * * *"
        this.help = 2
        this.import = ['jdLog618', 'jdUrl']
    }

    async prepare() {
        this.risk = new this.modules.jdLog618()
        this.funcName = 'promote'
        await this.risk.init({
            type: 3,
            "sceneid": 'RAhomePageh5',
        })
    }

    async main(p) {
        let cookie = p.cookie;
        let main = await this.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=promote_getMainMsgPopUp&client=m&clientVersion=-1&appid=signed_wh5&body={"channel":"1"}`,
                cookie,

            }
        )
        let getHomeData = await this.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=${this.funcName}_getHomeData&client=m&clientVersion=-1&appid=signed_wh5&body={}`,
                cookie,

            }
        )
        let secretp = this.haskey(getHomeData, 'data.result.homeMainInfo.secretp')
        let sign = await this.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=${this.funcName}_sign&client=m&clientVersion=-1&appid=signed_wh5&body=${this.dumps(await this.risk.body({secretp}))}`,
                cookie,

            }
        )
        if (this.dumps(sign).includes('火爆')) {
            console.log("账户脸黑");
            return
        }
        console.log(`签到:`, this.haskey(sign, 'data.success') || this.haskey(sign, 'data.bizMsg'))
        let collect = await this.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=${this.funcName}_collectAutoScore&client=m&clientVersion=-1&appid=signed_wh5&body=${this.dumps(await this.risk.body({secretp}))}`,
                cookie,

            }
        )
        console.log(`收取金币:`, this.haskey(collect, 'data.result.produceScore'))
        for (let appSign of [1, 2, 1]) {
            appSign == 1 ? console.log(p.index, "正在做App任务") : console.log(p.index, "正在做小程序任务")
            var getTaskDetail = await this.curl({
                'url': `https://api.m.jd.com/client.action`,
                'form': `functionId=${this.funcName}_getTaskDetail&client=m&clientVersion=-1&appid=signed_wh5&body=${this.dumps(await this.risk.body({
                    secretp,
                    appSign
                }))}`,
                cookie,

            })
            for (let i of this.haskey(getTaskDetail, 'data.result.taskVos') || []) {
                if (i.status == 1 || i.status == 3) {
                    //  console.log(i.subTitleName,2342342342423);
                    // console.log(i);
                    let vos = i.browseShopVo || i.shoppingActivityVos || i.productInfoVos || i.followShopVo || i.brandMemberVos || []
                    if (vos.length>0) {
                        console.log(p.index, `正在做${i.subTitleName}=========`)
                    }
                    else {
                        if (i.subTitleName.includes("浏览并加购") || i.taskName.includes("甄选") || i.taskName.includes("口碑") || i.taskName.includes("优选") || i.taskName.includes("精选") || i.taskName.includes("品质")) {
                            let getFeedDetail = await this.curl({
                                'url': `https://api.m.jd.com/client.action`,
                                'form': `functionId=${this.funcName}_getFeedDetail&client=m&clientVersion=-1&appid=signed_wh5&body={"taskId":"${i.taskId}"}`,
                                cookie,

                            })
                            if (this.haskey(getFeedDetail, 'data.result.addProductVos')) {
                                for (let y of getFeedDetail.data.result.addProductVos[0].productInfoVos.splice(0, 5)) {
                                    let collectScore = await this.curl({
                                        url: `https://api.m.jd.com/client.action`,
                                        form: `functionId=${this.funcName}_collectScore&client=m&clientVersion=-1&appid=signed_wh5&body=${this.dumps(await this.risk.body({
                                            'taskId': i.taskId,
                                            'taskToken': y.taskToken,
                                            'actionType': 0, secretp
                                        }))}`,
                                        cookie,

                                    })
                                    if (this.haskey(collectScore, 'data.result.acquiredScore')) {
                                        console.log(p.index, "加购获得:", this.haskey(collectScore, 'data.result.acquiredScore'))
                                        break
                                    }
                                }
                            }
                        }
                        else if (i.taskName.includes("种草")) {
                            let s = await this.curl({
                                'url': `https://api.m.jd.com/client.action`,
                                'form': `functionId=${this.funcName}_getFeedDetail&client=m&clientVersion=-1&appid=signed_wh5&body={"taskId":"${i.taskId}"}`,
                                cookie,

                            })
                            if (this.haskey(s, 'data.result.taskVos')) {
                                for (let j of s.data.result.taskVos[0].browseShopVo.splice(0, 5)) {
                                    let collectScore = await this.curl({
                                        url: `https://api.m.jd.com/client.action`,
                                        form: `functionId=${this.funcName}_collectScore&client=m&clientVersion=-1&appid=signed_wh5&body=${this.dumps(await this.risk.body({
                                            "taskId": i.taskId,
                                            "taskToken": j.taskToken, secretp
                                        }))}`,
                                        cookie,

                                    })
                                    if (console.log(p.index, "加购获得:", this.haskey(collectScore, 'data.result.acquiredScore'))) {
                                        console.log(p.index, "种草获得:", this.haskey(collectScore, 'data.result.acquiredScore'))
                                        break
                                    }
                                }
                            }
                        }
                        else if (i.simpleRecordInfoVo) {
                            if (i.taskName.includes("下单")) {
                                continue
                            }
                            let collectScore = await this.curl({
                                url: `https://api.m.jd.com/client.action`,
                                form: `functionId=${this.funcName}_collectScore&client=m&clientVersion=-1&appid=signed_wh5&body=${this.dumps(await this.risk.body({
                                    "taskId": i.taskId,
                                    "taskToken": i.simpleRecordInfoVo.taskToken,
                                    secretp
                                }))}`,
                                cookie,

                            })
                            console.log(p.index, `获得:`, this.haskey(collectScore, 'data.result.acquiredScore'));
                        }
                        // else {
                        //     // console.log(i);
                        // }
                    }
                    for (let j of vos.splice(0, i.maxTimes - i.times)) {
                        let taskName = j.shopName || j.title || j.skuName
                        console.log(p.index, `正在做: ${taskName}`)
                        let collectScore = await this.curl({
                            url: `https://api.m.jd.com/client.action`,
                            form: `functionId=${this.funcName}_collectScore&client=m&clientVersion=-1&appid=signed_wh5&body=${this.dumps(await this.risk.body({
                                'taskId': i.taskId,
                                'taskToken': j.taskToken,
                                'actionType': 1,
                                secretp
                            }))}`,
                            cookie,

                        })
                        this.haskey(collectScore, 'data.result.taskToken') ? console.log(p.index, "获取任务:", collectScore.data.result.taskToken) : console.log(p.index, "获得奖励", this.haskey(collectScore, 'data.result.score'))
                        j.url ? await this.curl(j.url) : ''
                        j.copy1 ? await this.curl(j.copy1) : ''
                        if (i.waitDuration) {
                            console.log(p.index, `正在等待:`, i.waitDuration)
                            await this.wait(i.waitDuration * 1000)
                            // let pp = this.modules.jdUrl.app('qryViewkitCallbackResult', {
                            //     "dataSource": "newshortAward",
                            //     "method": "getTaskAward",
                            //     "reqParams": "{\"taskToken\":\"" + j.taskToken + "\"}"
                            // })
                            // pp.cookie = cookie
                            // pp.ua = `jdltapp;iPhone;3.1.0;${this.uuid(40, 'lc')}.${this.uuid(40, 'lc')}.${this.uuid(16)}`
                            // let qryViewkitCallbackResult = await this.curl(pp)
                            // console.log(p.index, qryViewkitCallbackResult.toast.subTitle)
                            let collectScore = await this.curl({
                                url: `https://api.m.jd.com/client.action`,
                                form: `functionId=${this.funcName}_collectScore&client=m&clientVersion=-1&appid=signed_wh5&body=${this.dumps(await this.risk.body({
                                    'taskId': i.taskId,
                                    'taskToken': j.taskToken,
                                    'actionType': 0,
                                    secretp
                                }))}`,
                                cookie,

                            })
                            console.log(p.index, "获得奖励", this.haskey(collectScore, 'data.result.score'))
                        }
                    }
                }
                else {
                    console.log(p.index, `${i.subTitleName}任务已完成`)
                }
            }
        }
        if (new Date().getHours() == 13) {
            let qry = await this.curl({
                    'url': `https://api.m.jd.com/client.action?functionId=qryCompositeMaterials`,
                    'form': `functionId=qryCompositeMaterials&client=wh5&clientVersion=1.0.0&body={"qryParam":"[{\\"type\\":\\"advertGroup\\",\\"id\\":\\"06306989\\",\\"mapTo\\":\\"homeNaming\\"},{\\"type\\":\\"advertGroup\\",\\"mapTo\\":\\"homeMsgs\\",\\"id\\":\\"05863713\\"},{\\"type\\":\\"advertGroup\\",\\"mapTo\\":\\"homeBtnDrawNotFirsts\\",\\"id\\":\\"06306976\\"},{\\"type\\":\\"advertGroup\\",\\"id\\":\\"06306959\\",\\"mapTo\\":\\"homePullDowner\\"},{\\"type\\":\\"advertGroup\\",\\"id\\":\\"06306983\\",\\"mapTo\\":\\"homeTitle\\"},{\\"type\\":\\"advertGroup\\",\\"id\\":\\"06341465\\",\\"mapTo\\":\\"homePopupSecondEveryday\\"},{\\"type\\":\\"advertGroup\\",\\"id\\":\\"05863725\\",\\"mapTo\\":\\"homeBtnBranch\\"},{\\"type\\":\\"advertGroup\\",\\"id\\":\\"05863757\\",\\"mapTo\\":\\"homeBtnMain\\"},{\\"type\\":\\"advertGroup\\",\\"id\\":\\"05863748\\",\\"mapTo\\":\\"homeBtnTask\\"}]","activityId":"2fUope8TDN3dUJfNzQswkBLc7uE8","pageId":"","reqSrc":"","applyKey":"jd_star"}&uuid=434e858e755c9b1ec6e6d6abc0348d9b6d985300`,
                    cookie,

                }
            )
            for (let i of this.haskey(qry, 'data.homeBtnDrawNotFirsts.list')) {
                let actId = this.query(i.extension.diyText3, '&', 1).activityId
                console.log(p.index, actId)
                let factory = await this.curl({
                        'url': `https://api.m.jd.com/`,
                        'form': `appid=wh5&clientVersion=1.0.0&functionId=factory_getStaticConfig&body={"encryptActivityId":"${actId}","channelId":1}`,
                        cookie,

                    }
                )
                if (this.haskey(factory, 'data.result.appId')) {
                    let appId = factory.data.result.appId
                    let tl = await this.curl({
                            'url': `https://api.m.jd.com/`,
                            'form': `appid=wh5&clientVersion=1.0.0&functionId=template_mongo_getHomeData&body={"taskToken":"","appId":"${appId}","actId":"${actId}","channelId":1}`,
                            cookie,

                        }
                    )
                    for (let i of this.haskey(tl, 'data.result.taskVos')) {
                        if (i.status == 1) {
                            let vos = i.browseShopVo || i.shoppingActivityVos || i.productInfoVos || i.followShopVo || []
                            if (vos.length>0) {
                                console.log(p.index, `正在做${i.subTitleName}=========`)
                            }
                            else if (i.simpleRecordInfoVo) {
                                let body = await this.risk.body({
                                    'taskId': 1,
                                    'taskToken': i.simpleRecordInfoVo.taskToken,
                                    'actionType': 0, "appId": appId
                                })
                                body.safeStr = this.loads(body.ss).extraData
                                let bdCollectScore = await this.curl({
                                    'url': 'https://api.m.jd.com/client.action',
                                    'form': `appid=wh5&clientVersion=1.0.0&functionId=template_mongo_collectScore&body=${JSON.stringify(body)}`,
                                    cookie,

                                })
                                console.log(p.index, "签到获得奖励:", this.haskey(bdCollectScore, 'data.result.acquiredScore'))
                            }
                            for (let j of vos.splice(0, i.maxTimes - i.times)) {
                                let body = await this.risk.body({
                                    'taskId': i.taskId,
                                    'taskToken': j.taskToken,
                                    'actionType': 0, "appId": appId
                                })
                                body.safeStr = this.loads(body.ss).extraData
                                let bdCollectScore = await this.curl({
                                    'url': 'https://api.m.jd.com/client.action',
                                    'form': `appid=wh5&clientVersion=1.0.0&functionId=template_mongo_collectScore&body=${JSON.stringify(body)}`,
                                    cookie,

                                })
                                console.log(p.index, "签到浏览奖励:", this.haskey(bdCollectScore, 'data.result.acquiredScore'))
                            }
                        }
                    }
                    for (let nn = 1; nn<7; nn++) {
                        let s = await this.curl({
                            'url': 'https://api.m.jd.com/',
                            'form': `appid=wh5&clientVersion=1.0.0&functionId=template_mongo_lottery&body={"appId":"${appId}","fragmentId":${nn}`,
                            cookie,

                        })
                        if (this.haskey(s, 'data.bizMsg', '抽奖次数已用完')) {
                            console.log(p.index, s.data.bizMsg)
                            break
                        }
                        console.log(p.index, "抽奖:", this.haskey(s, 'data.result.userAwardDto'));
                    }
                }
            }
        }
        let rasie = await this.curl({
                url: `https://api.m.jd.com/client.action`,
                'form': `functionId=${this.funcName}_raise&client=m&clientVersion=-1&appid=signed_wh5&body=${this.dumps(await this.risk.body({
                    secretp, scenceId: 1
                }))}`,
                cookie,
            }
        )
        // console.log(this.haskey(rasie, 'data.result'))
        for (let i of this.haskey(getTaskDetail, 'data.result.lotteryTaskVos.0.badgeAwardVos')) {
            if (i.status != 4) {
                let s = await this.curl({
                    'url': `https://api.m.jd.com/client.action`,
                    'form': `functionId=${this.funcName}_getBadgeAward&client=m&clientVersion=-1&appid=signed_wh5&body={"awardToken":"${i.awardToken}"}`,
                    cookie,

                })
                console.log('累计任务奖励:', this.haskey(s, 'data.result'));
            }
        }
    }
}

module.exports = Main;
