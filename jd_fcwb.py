#!/usr/bin/env python3
# -*- coding: utf-8 -*-
'''
cron: 11 11 10 11 * jd_fcwb.py
new Env('发财挖宝');
活动入口: 京东极速版 > 我的 > 发财挖宝
最高可得总和为10元的微信零钱和红包
脚本功能为: 挖宝，提现，没有助力功能，当血量剩余 1 时停止挖宝，领取奖励并提现 

目前需要完成逛一逛任务并且下单任务才能通关，不做的话大概可得1.5～2块的微信零钱
'''
import os,json,random,time,re,string,functools,asyncio
import sys
sys.path.append('../../tmp')
print('\n运行本脚本之前请手动进入游戏点击一个方块\n')
print('\n挖的如果都是0.01红包就是黑了，别挣扎了！\n')
print('\n默认关闭自动领取奖励，开启请在主函数最后调用的函数前面删除#号注释即可\n')
try:
    import requests
except Exception as e:
    print(str(e) + "\n缺少requests模块, 请执行命令：pip3 install requests\n")
requests.packages.urllib3.disable_warnings()


linkId="pTTvJeSTrpthgk9ASBVGsw"


# 获取pin
cookie_findall=re.compile(r'pt_pin=(.+?);')
def get_pin(cookie):
    try:
        return cookie_findall.findall(cookie)[0]
    except:
        print('ck格式不正确，请检查')

# 读取环境变量
def get_env(env):
    try:
        if env in os.environ:
            a=os.environ[env]
        elif '/ql' in os.path.abspath(os.path.dirname(__file__)):
            try:
                a=v4_env(env,'/ql/config/config.sh')
            except:
                a=eval(env)
        elif '/jd' in os.path.abspath(os.path.dirname(__file__)):
            try:
                a=v4_env(env,'/jd/config/config.sh')
            except:
                a=eval(env)
        else:
            a=eval(env)
    except:
        a=''
    return a

# v4
def v4_env(env,paths):
    b=re.compile(r'(?:export )?'+env+r' ?= ?[\"\'](.*?)[\"\']', re.I)
    with open(paths, 'r') as f:
        for line in f.readlines():
            try:
                c=b.match(line).group(1)
                break
            except:
                pass
    return c 


# 随机ua
def ua():
    sys.path.append(os.path.abspath('.'))
    try:
        from jdEnv import USER_AGENTS as a
    except:
        a = 'jdltapp;iPhone;3.8.18;;;M/5.0;hasUPPay/0;pushNoticeIsOpen/0;lang/zh_CN;hasOCPay/0;appBuild/1157;supportBestPay/0;jdSupportDarkMode/0;ef/1;ep/%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22ud%22%3A%22D2PtYzKmY2S5ENY0ZJqmDNTrDtrtZtrsCWPuDtSzY2DvYzq3Y2GzDm%3D%3D%22%2C%22sv%22%3A%22CJCkDm%3D%3D%22%2C%22iad%22%3A%22%22%7D%2C%22ts%22%3A1660017794%2C%22hdid%22%3A%22TQXsGHnakmmgYnwstgBuo1lumKk2DznsrnZM56ldiQM%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.jd.jdmobilelite%22%2C%22ridx%22%3A1%7D;Mozilla/5.0 (iPhone; CPU iPhone OS 13_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;'
    return a

# 13位时间戳
def gettimestamp():
    return str(int(time.time() * 1000))

## 获取cooie
class Judge_env(object):
    def main_run(self):
        if '/jd' in os.path.abspath(os.path.dirname(__file__)):
            cookie_list=self.v4_cookie()
        else:
            cookie_list=os.environ["JD_COOKIE"].split('&')       # 获取cookie_list的合集
        if len(cookie_list)<1:
            print('请填写环境变量JD_COOKIE\n')    
        return cookie_list

    def v4_cookie(self):
        a=[]
        b=re.compile(r'Cookie'+'.*?=\"(.*?)\"', re.I)
        with open('/jd/config/config.sh', 'r') as f:
            for line in f.readlines():
                try:
                    regular=b.match(line).group(1)
                    a.append(regular)
                except:
                    pass
        return a


cookie_list = Judge_env().main_run()
async def taskGetUrl(functionId, body, cookie):
    url = f'https://api.m.jd.com/?functionId={functionId}&body={json.dumps(body)}&t={gettimestamp()}&appid=activities_platform&client=H5&clientVersion=1.0.0'
    headers = {
        'Cookie': cookie,
        'Host': 'api.m.jd.com',
        'Connection': 'keep-alive',
        'origin': 'https://bnzf.jd.com',
        'Content-Type': 'application/x-www-form-urlencoded',
        'accept': 'application/json, text/plain, */*',
        "User-Agent": ua(),
        'Accept-Language': 'zh-cn',
        'Accept-Encoding': 'gzip, deflate, br',
    }
    for n in range(5):
        time.sleep(1)
        try:
            res = requests.get(url, headers=headers, timeout=30).json()
            return res
        except Exception as e:
            # errorMsg = f"❌ 第{e.__traceback__.tb_lineno}行：{e}"
            # print(errorMsg)
            if n == 4:
                print('API请求失败，请检查网路重试❗\n')


# 剩余血量
async def xueliang(cookie):
    body = {"linkId": linkId}
    res = await taskGetUrl("happyDigHome", body, cookie)
    if not res:
        return
    if res['code'] == 0:
        if res['success']:
            curRound = res['data']['curRound']                        # 未知
            blood = res['data']['blood']                              # 剩余血量
            return blood


async def jinge(cookie, i):
    body = {"linkId": linkId}
    res = await taskGetUrl("happyDigHome", body, cookie)
    if not res:
        return
    if res['code'] == 0:
        if res['success']:
            curRound = res['data']['curRound']                        # 未知
            blood = res['data']['blood']                              # 剩余血量
            roundList = res['data']['roundList']                      # 3个总池子
            roundList_n = roundList[0]
            redAmount = roundList_n['redAmount']                  # 当前池已得京东红包
            cashAmount = roundList_n['cashAmount']                # 当前池已得微信红包

            return [blood, redAmount, cashAmount]

# 页面数据
async def happyDigHome(cookie):
    body = {"linkId": linkId}
    res = await taskGetUrl("happyDigHome", body, cookie)
    exit_flag = "false"
    if not res:
        return
    if res['code'] == 0:
        if res['success']:
            curRound = res['data']['curRound']                        # 未知
            incep_blood = res['data']['blood']                        # 剩余血量
            roundList = res['data']['roundList']                      # 3个总池子
            for e, roundList_n in enumerate(roundList):               # 迭代每个池子
                roundid = roundList_n['round']                        # 池序号
                state = roundList_n['state']
                # 池规模，rows*rows
                rows = roundList_n['rows']
                # 当前池已得京东红包
                redAmount = roundList_n['redAmount']
                # 当前池已得微信红包
                cashAmount = roundList_n['cashAmount']
                leftAmount = roundList_n['leftAmount']                # 剩余红包？
                # 当前池详情list
                chunks = roundList_n['chunks']
                a = await jinge(cookie, roundid)
                if roundid == 1:
                    print(f'\n开始进行 "入门" 难度关卡，剩余血量 {a[0]}🩸\n')
                elif roundid == 2:
                    print(f'\n开始进行 "挑战" 难度关卡，剩余血量 {a[0]}🩸\n')
                elif roundid == 3:
                    print(f'\n开始进行 "终极" 难度关卡，剩余血量 {a[0]}🩸\n')
                ## print(f'当前池已得京东红包 {a[2]}\n当前池已得微信红包 {a[1]}\n')
                _blood = await xueliang(cookie)
                if _blood > 1:
                    # await happyDigDo(cookie, roundid, 0, 0)
                    if e == 0 or e == 1:
                        roundid_n = 4
                    else:
                        roundid_n = 5
                    for n in range(roundid_n):
                        for i in range(roundid_n):
                            _blood = await xueliang(cookie)
                            if _blood > 1:
                                ## print(f'当前血量为 {_blood}')
                                await happyDigDo(cookie, roundid, n, i)
                            else:
                                a = await jinge(cookie, roundid)
                                print(f'没血了，溜了溜了\n')
                                exit_flag = "true"
                                ## print(f'当前池已得京东红包 {a[2]}\n当前池已得微信红包 {a[1]}\n')
                                break

                        if exit_flag == "true":
                            break
                if exit_flag == "true":
                    break
        else:
            print(f'获取数据失败\n{res}\n')
    else:
        print(f'获取数据失败\n{res}\n')


# 玩一玩
async def apDoTask(cookie):
    print('开始做玩一玩任务')
    body={"linkId":linkId,"taskType":"BROWSE_CHANNEL","taskId":962,"channel":4,"itemId":"https%3A%2F%2Fwqs.jd.com%2Fsns%2F202210%2F20%2Fmake-money-shop%2Findex.html%3FactiveId%3D63526d8f5fe613a6adb48f03","checkVersion":False}
    res = await taskGetUrl('apDoTask', body, cookie)
    if not res:
        return
    try:
        if res['success']:
            print('玩好了')
        else:
            print(f"{res['errMsg']}")
    except:
        print(f"错误\n{res}")


# 挖宝
async def happyDigDo(cookie, roundid, rowIdx, colIdx):
    body = {"round": roundid, "rowIdx": rowIdx,
            "colIdx": colIdx, "linkId": linkId}
    res = await taskGetUrl("happyDigDo", body, cookie)

    a = rowIdx + 1
    b = colIdx + 1
    coordinateText = f"坐标({a},{b}) ➜  "
    if not res:
        return
    if res['code'] == 0:
        if res['success']:
            typeid = res['data']['chunk']['type']
            if typeid == 2:
                print(coordinateText + f"🧧  {res['data']['chunk']['value']}元极速版红包")
            elif typeid == 3:
                print(coordinateText + f"💰  {res['data']['chunk']['value']}元微信现金")
            elif typeid == 4:
                print(coordinateText + f"💣  炸弹")
            elif typeid == 1:
                print(coordinateText + f"🎟️  优惠券")
            else:
                print(f'未知内容')
        else:
            print(coordinateText + f'挖宝失败（{res["errCode"]}）')
    else:
        print(coordinateText + f'挖宝失败（{res["errMsg"]}）')


# 领取奖励
async def happyDigExchange(cookie):
    for n in range(1, 4):
        await xueliang(cookie)
        # print(f"\n开始领取第{n}场的奖励")
        body = {"round": n, "linkId": linkId}
        res = await taskGetUrl("happyDigExchange", body, cookie)
        if not res:
            return
        # if res['code'] == 0:
        #     if res['success']:
        #         try:
        #             print(f"已领取极速版红包 {res['data']['redValue']} 🧧")
        #         except:
        #             print('')
        #         if res['data']['wxValue'] != "0":
        #             try:
        #                 print(f"待提现微信现金 {res['data']['wxValue']} 💰")
        #             except:
        #                 pass
            # else:
                # print(res['errMsg'])


# 微信现金id
async def spring_reward_list(cookie):
    await happyDigExchange(cookie)
    await xueliang(cookie)

    body = {"linkId": linkId, "pageNum": 1, "pageSize": 6}
    res = await taskGetUrl("spring_reward_list", body, cookie)

    if res['code'] == 0:
        if res['success']:
            items = res['data']['items']
            for _items in items:
                amount = _items['amount']         # 金额
                prizeDesc = _items['prizeDesc']   # 奖品描述
                prizeType = _items['prizeType']   # 奖品类型（1券，2红包，4微信零钱）
                amountid = _items['id']           # 金额id
                poolBaseId = _items['poolBaseId']
                prizeGroupId = _items['prizeGroupId']
                prizeBaseId = _items['prizeBaseId']
                if prizeType == 4:
                    print(f'开始提现 {amount} 微信现金💰')
                    for n in range(1, 3):
                        result = await WeChat(cookie, amountid, poolBaseId, prizeGroupId, prizeBaseId)
                        time.sleep(10) ## 上一比金额提现完才可以提现下一笔
                        if (result): break
                else:
                    continue
        else:
            print(f'获取数据失败\n{res}\n')
    else:
        print(f'获取数据失败\n{res}\n')

# 微信提现


async def WeChat(cookie, amountid, poolBaseId, prizeGroupId, prizeBaseId):
    await xueliang(cookie)

    url = 'https://api.m.jd.com'
    headers = {
        'Cookie': cookie,
        'Host': 'api.m.jd.com',
        'Connection': 'keep-alive',
        'origin': 'https://bnzf.jd.com',
        'Content-Type': 'application/x-www-form-urlencoded',
        "User-Agent": ua(),
        'Accept-Language': 'zh-cn',
        'Accept-Encoding': 'gzip, deflate, br',
    }
    body = {"businessSource": "happyDiggerH5Cash", "base": {"id": amountid, "business": "happyDigger", "poolBaseId": poolBaseId, "prizeGroupId": prizeGroupId, "prizeBaseId": prizeBaseId, "prizeType": 4}, "linkId": linkId}
    data = f"functionId=apCashWithDraw&body={json.dumps(body)}&t={gettimestamp()}&appid=activities_platform&client=H5&clientVersion=1.0.0"
    for n in range(3):
        try:
            res = requests.post(url, headers=headers, data=data, timeout=30).json()
            break
        except:
            if n == 2:
                print('API请求失败，请检查网路重试❗\n')
    try:
        if res['code'] == 0:
            if res['success']:
                print(res['data']['message']+'')
                return True
    except:
        print(res)
        return False


async def main():
    print('🔔发财挖宝 - 挖宝，开始！\n')

    # print('获取助力码\n')
    # global inviteCode_1_list,inviteCode_2_list
    # inviteCode_1_list=list()
    # inviteCode_2_list=list()
    # for cookie in cookie_list:
    #    inviteCode(cookie)

    # print('互助\n')
    # inviteCode_2_list=inviteCode_2_list[:2]
    # for e,fcwbinviter in enumerate(inviteCode_2_list):
    #     fcwbinviteCode=inviteCode_1_list[e]
    #     for cookie in cookie_list:
    #         happyDigHelp(cookie,fcwbinviter,fcwbinviteCode)

    print(f'================= 共{len(cookie_list)}个京东账号Cookie =================\n')

    for e, cookie in enumerate(cookie_list, start=1):
        print(f'******开始【京东账号{e}】{get_pin(cookie)}******\n')
        await apDoTask(cookie)
        await happyDigHome(cookie)
        #await spring_reward_list(cookie)


if __name__ == '__main__':
    asyncio.run(main())
