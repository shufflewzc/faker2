#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
File: jd_wdz.py(微定制组队瓜分-监控脚本)
Author: HarbourJ
Date: 2022/8/12 20:37
TG: https://t.me/HarbourToulu
TgChat: https://t.me/HarbourSailing
cron: 1 1 1 1 1 1
new Env('微定制组队瓜分-JK');
ActivityEntry: https://cjhydz-isv.isvjcloud.com/microDz/invite/activity/wx/view/index?activityId=eb24d792fdcf4732be29030f9fc8e007
Description: 微定制组队通用脚本
            本地sign算法+redis缓存Token+代理ip(自行配置，实测可行)
            变量: export jd_wdz_activityId="eb24d792fdcf4732be29030f9fc8e007"
Update: 2022/11/01 更新入会算法，内置船新入会本地算法
"""

import time, requests, sys, re, os, json, random
from datetime import datetime
from urllib.parse import quote_plus, unquote_plus
from functools import partial
print = partial(print, flush=True)
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
try:
    from jd_sign import *
except ImportError as e:
    print(e)
    if "No module" in str(e):
        print("请先运行Faker库依赖一键安装脚本(jd_check_dependent.py)，安装jd_sign.so依赖")
try:
    from jdCookie import get_cookies
    getCk = get_cookies()
except:
    print("请先下载依赖脚本，\n下载链接: https://raw.githubusercontent.com/HarbourJ/HarbourToulu/main/jdCookie.py")
    sys.exit(3)

redis_url = os.environ.get("redis_url") if os.environ.get("redis_url") else "172.17.0.1"
redis_port = os.environ.get("redis_port") if os.environ.get("redis_port") else "6379"
redis_pwd = os.environ.get("redis_pwd") if os.environ.get("redis_pwd") else ""
jd_wdz_activityId = os.environ.get("jd_wdz_activityId") if os.environ.get("jd_wdz_activityId") else ""

if not jd_wdz_activityId:
    print("⚠️未发现有效活动变量,退出程序!")
    sys.exit()
# 获取远程remote-redis活动ID
if "wdz_remote" in jd_wdz_activityId:
    jd_wdzId_remote = remote_redis(jd_wdz_activityId)
    jd_wdz_activityId = jd_wdzId_remote
activityId = jd_wdz_activityId
activity_url = f"https://cjhy-isv.isvjcloud.com/microDz/invite/activity/wx/view/index/3499100?activityId={activityId}"
print(f"【🛳活动入口】{activity_url}")

def redis_conn():
    try:
        import redis
        try:
            pool = redis.ConnectionPool(host=redis_url, port=redis_port, decode_responses=True, socket_connect_timeout=5, password=redis_pwd)
            r = redis.Redis(connection_pool=pool)
            r.get('conn_test')
            print('✅redis连接成功')
            return r
        except:
            print("⚠️redis连接异常")
    except:
        print("⚠️缺少redis依赖，请运行pip3 install redis")
        sys.exit()

def getToken(ck, r=None):
    host = f'{activityUrl.split("com/")[0]}com'
    try:
        # redis缓存Token 活动域名+pt_pin
        pt_pin = unquote_plus(re.compile(r'pt_pin=(.*?);').findall(ck)[0])
    except:
        # redis缓存Token 活动域名+ck前7位(获取pin失败)
        pt_pin = ck[:15]
    try:
        if r is not None:
            Token = r.get(f'{activityUrl.split("https://")[1].split("-")[0]}_{pt_pin}')
            # print("Token过期时间", r.ttl(f'{activityUrl.split("https://")[1].split("-")[0]}_{pt_pin}'))
            if Token is not None:
                print(f"♻️获取缓存Token")
                return Token
            else:
                # print("🈳去设置Token缓存")
                s.headers = {
                    'Connection': 'keep-alive',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'User-Agent': '',
                    'Cookie': ck,
                    'Host': 'api.m.jd.com',
                    'Referer': '',
                    'Accept-Language': 'zh-Hans-CN;q=1 en-CN;q=0.9',
                    'Accept': '*/*'
                }
                sign_txt = sign({"url": f"{host}", "id": ""}, 'isvObfuscator')
                # print(sign_txt)
                f = s.post('https://api.m.jd.com/client.action', verify=False, timeout=30)
                if f.status_code != 200:
                    print(f.status_code)
                    return
                else:
                    if "参数异常" in f.text:
                        return
                Token_new = f.json()['token']
                # print(f"Token->: {Token_new}")
                if r.set(f'{activityUrl.split("https://")[1].split("-")[0]}_{pt_pin}', Token_new, ex=1800):
                    print("✅Token缓存成功")
                else:
                    print("❌Token缓存失败")
                return Token_new
        else:
            s.headers = {
                'Connection': 'keep-alive',
                'Accept-Encoding': 'gzip, deflate, br',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'User-Agent': '',
                'Cookie': ck,
                'Host': 'api.m.jd.com',
                'Referer': '',
                'Accept-Language': 'zh-Hans-CN;q=1 en-CN;q=0.9',
                'Accept': '*/*'
            }
            sign_txt = sign({"url": f"{host}", "id": ""}, 'isvObfuscator')
            # print(sign_txt)
            f = s.post('https://api.m.jd.com/client.action', verify=False, timeout=30)
            if f.status_code != 200:
                print(f.status_code)
                return
            else:
                if "参数异常" in f.text:
                    return
            Token = f.json()['token']
            print(f"✅获取实时Token")
            return Token
    except:
        return

def getJdTime():
    jdTime = int(round(time.time() * 1000))
    return jdTime

def randomString(e, flag=False):
    t = "0123456789abcdef"
    if flag: t = t.upper()
    n = [random.choice(t) for _ in range(e)]
    return ''.join(n)

def refresh_cookies(res):
    if res.cookies:
        cookies = res.cookies.get_dict()
        set_cookie = [(set_cookie + "=" + cookies[set_cookie]) for set_cookie in cookies]
        global activityCookie
        activityCookieMid = [i for i in activityCookie.split(';') if i != '']
        for i in activityCookieMid:
            for x in set_cookie:
                if i.split('=')[0] == x.split('=')[0]:
                    if i.split('=')[1] != x.split('=')[1]:
                        activityCookieMid.remove(i)
        activityCookie = ''.join(sorted([(set_cookie + ";") for set_cookie in list(set(activityCookieMid + set_cookie))]))

def getActivity():
    url = activityUrl
    headers = {
        'Host': 'cjhy-isv.isvjcloud.com',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': ua,
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
    }
    try:
        response = requests.request("GET", url, headers=headers)
        if "活动未开始" in response.text:
            print("⚠活动未开始,晚点再来~")
            sys.exit()
        if response.status_code == 493:
            print(response.status_code, "⚠️ip疑似黑了,休息一会再来撸~")
            sys.exit()
        if response.cookies:
            cookies = response.cookies.get_dict()
            set_cookies = [(set_cookie + "=" + cookies[set_cookie]) for set_cookie in cookies]
            set_cookie = ''.join(sorted([(set_cookie + ";") for set_cookie in set_cookies]))
        return set_cookie
    except:
        print("⚠️ip疑似黑了,休息一会再来撸~")
        sys.exit()

def getSystemConfigForNew():
    url = "https://cjhy-isv.isvjcloud.com/wxCommonInfo/getSystemConfigForNew"
    payload = f'activityId={activityId}&activityType=99'
    headers = {
        'Host': 'cjhy-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://cjhy-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)

def getMyPing(index):
    url = "https://cjhy-isv.isvjcloud.com/customer/getMyPing"
    payload = f"userId=599119&token={token}&fromType=APP&riskType=1"
    headers = {
        'Host': 'cjhy-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://cjhy-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    print(response.status_code)
    refresh_cookies(response)
    res = response.json()
    if res['result']:
        return res['data']['nickname'], res['data']['secretPin'], res['data']['yunMidImageUrl']
    else:
        print(f"⚠️{res['errorMessage']}")
        if index == 1 and "火爆" in res['errorMessage']:
            print(f"\t⛈车头黑,退出本程序！")
            sys.exit()

def getSimpleActInfoVo():
    url = "https://cjhy-isv.isvjcloud.com/microDz/invite/activity/wx/getActivityInfo"
    payload = f"activityId={activityId}"
    headers = {
        'Host': 'cjhy-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://cjhy-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    # refresh_cookies(response)
    res = response.json()
    if res['result']:
        return res['data']['beansResidueByDay'], res['data']['residualPercentage'], res['data']['maxGroup'], res['data']['venderIds'], res['data']['actRule']
    else:
        print(res['errorMessage'])

def accessLog(pin):
    url = "https://cjhy-isv.isvjcloud.com/common/accessLog"
    payload = f"venderId=1&code=99&pin={quote_plus(quote_plus(pin))}&activityId={activityId}&pageUrl={quote_plus(activityUrl)}&subType=app"
    headers = {
        'Host': 'cjhy-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://cjhy-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)

def getUserInfo(pin):
    url = "https://cjhy-isv.isvjcloud.com/wxActionCommon/getUserInfo"
    payload = f"pin={quote_plus(quote_plus(pin))}"
    headers = {
        'Host': 'cjhy-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://cjhy-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)
    res = response.json()
    if res['result']:
        return res['data']['nickname'], res['data']['yunMidImageUrl'], res['data']['pin']
    else:
        print(res['errorMessage'])

def getOpenCardAllStatuesNew(pin, again=1):
    url = "https://cjhy-isv.isvjcloud.com/microDz/invite/activity/wx/getOpenCardAllStatuesNew"
    payload = f"activityId={activityId}&pin={quote_plus(quote_plus(pin))}&isInvited=1"
    headers = {
        'Host': 'cjhy-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://cjhy-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    # refresh_cookies(response)
    res = response.json()
    if res['result']:
        if not res['data']['list']:
            print(f"第{again}次重试")
            if again <= 3:
                time.sleep(2)
                again += 1
                return getOpenCardAllStatuesNew(pin, again=again)
        return res['data']['isCanJoin'], res['data']['reward'], res['data']['list']
    else:
        print(res['errorMessage'])

def isInvited(pin):
    url = "https://cjhy-isv.isvjcloud.com/microDz/invite/activity/wx/isInvited"
    payload = f"activityId={activityId}&pin={quote_plus(quote_plus(pin))}"
    headers = {
        'Host': 'cjhy-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://cjhy-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    # refresh_cookies(response)
    res = response.json()
    if res['result']:
        return res['data']
    else:
        print(res['errorMessage'])

def acceptInvite(inviterNick, inviterPin, inviterImg, pin, nickName, inviteeImg):
    url = "https://cjhy-isv.isvjcloud.com/microDz/invite/activity/wx/acceptInvite"
    try:
        inviteeImg = quote_plus(inviteeImg)
    except:
        inviteeImg = quote_plus("https://img10.360buyimg.com/imgzone/jfs/t1/21383/2/6633/3879/5c5138d8E0967ccf2/91da57c5e2166005.jpg")
    payload = f"activityId={activityId}&inviter={quote_plus(quote_plus(inviterPin))}&inviterImg={inviterImg}&inviterNick={quote_plus(inviterNick)}&invitee={quote_plus(quote_plus(pin))}&inviteeImg={inviteeImg}&inviteeNick={quote_plus(nickName)}"
    headers = {
        'Host': 'cjhy-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://cjhy-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    # refresh_cookies(response)
    res = response.json()
    if res['result']:
        return res['data']
    else:
        print(res['errorMessage'])

def bindWithVender(cookie, venderId):
    try:
        s.headers = {
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent': ua,
            'Cookie': cookie,
            'Host': 'api.m.jd.com',
            'Referer': f'https://shopmember.m.jd.com/shopcard/?venderId={venderId}&returnUrl={quote_plus(activityUrl)}',
            'Accept-Language': 'zh-Hans-CN;q=1 en-CN;q=0.9',
            'Accept': '*/*'
        }
        s.params = {
            'appid': 'jd_shop_member',
            'functionId': 'bindWithVender',
            'body': json.dumps({
                'venderId': venderId,
                'shopId': venderId,
                'bindByVerifyCodeFlag': 1
            }, separators=(',', ':'))
        }
        res = s.post('https://api.m.jd.com/', verify=False, timeout=30).json()
        if res['success']:
            return res['message']
    except Exception as e:
        print(e)

def getShopOpenCardInfo(cookie, venderId):
    shopcard_url = f"https://shopmember.m.jd.com/shopcard/?venderId={venderId}&channel=401&returnUrl={quote_plus(activityUrl)}"
    try:
        body = {"venderId": str(venderId), "channel": "401"}
        url = f'https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=getShopOpenCardInfo&body={json.dumps(body)}&client=H5&clientVersion=9.2.0&uuid=88888'
        headers = {
            'Host': 'api.m.jd.com',
            'Accept': '*/*',
            'Connection': 'keep-alive',
            'Cookie': cookie,
            'User-Agent': ua,
            'Accept-Language': 'zh-cn',
            'Referer': shopcard_url,
            'Accept-Encoding': 'gzip, deflate'
        }
        response = requests.get(url=url, headers=headers, timeout=5).text
        res = json.loads(response)
        if res['success']:
            venderCardName = res['result']['shopMemberCardInfo']['venderCardName']
            return venderCardName
        else:
            return venderId
    except:
        return venderId


if __name__ == '__main__':
    r = redis_conn()
    try:
        cks = getCk
        if not cks:
            sys.exit()
    except:
        print("未获取到有效COOKIE,退出程序！")
        sys.exit()
    global inviterNick, inviterPin, inviterImg, inviteSuccNum, activityUrl, firstCk
    inviteSuccNum = 0
    try:
        UUID = remote_redis(f"wdz_{activityId}", 3)
        inviterPin = UUID.split('&')[0]
        inviterNick = UUID.split('&')[1]
    except:
        inviterPin = ""
        inviterNick = ""
    inviterImg = "https://img10.360buyimg.com/imgzone/jfs/t1/21383/2/6633/3879/5c5138d8E0967ccf2/91da57c5e2166005.jpg"
    activityUrl = f"https://cjhy-isv.isvjcloud.com/microDz/invite/activity/wx/view/index/3499100?activityId={activityId}&inviter={inviterPin}&inviterImg=https://img10.360buyimg.com/imgzone/jfs/t1/21383/2/6633/3879/5c5138d8E0967ccf2/91da57c5e2166005.jpg&inviterNickName={quote_plus(inviterNick)}"

    num = 0
    for cookie in cks[:]:
        num += 1
        if num == 1:
            firstCk = cookie
        if num % 9 == 0:
            print("⏰等待10s,休息一下")
            time.sleep(10)
        global ua, activityCookie, token
        ua = userAgent()
        try:
            pt_pin = re.compile(r'pt_pin=(.*?);').findall(cookie)[0]
            pt_pin = unquote_plus(pt_pin)
        except IndexError:
            pt_pin = f'用户{num}'
        print(f'\n******开始【京东账号{num}】{pt_pin} *********\n')
        print(datetime.now())

        token = getToken(cookie, r)
        if token is None:
            if num == 1:
                print(f"⚠️车头获取Token失败,退出本程序！")
                sys.exit()
            print(f"⚠️获取Token失败！⏰等待3s")
            time.sleep(3)
            continue
        time.sleep(0.5)
        activityCookie = getActivity()
        time.sleep(0.5)
        getSimAct = getSimpleActInfoVo()
        beansResidueByDay = getSimAct[0]
        residualPercentage = getSimAct[1]
        maxGroup = getSimAct[2]
        venderIds = getSimAct[3]
        actRule = getSimAct[4]
        actRule0 = actRule.replace("\n", "").split("</br>4")[0].split("</br>3)")[1]
        try:
            maxGroups = int(actRule0.split("最多可组队")[1].split("次")[0])
        except:
            maxGroups = 5
        if num == 1:
            print(f"【活动规则】{actRule0}")
        print(f"【剩余京豆】{beansResidueByDay}")
        print(f"【豆池进度】{residualPercentage}%")
        if int(beansResidueByDay) == 0 or residualPercentage == 0:
            print("豆池已空💨💨💨,下次早点来~")
            sys.exit()
        time.sleep(0.2)
        getPin = getMyPing(num)
        if getPin:
            nickName = getPin[0]
            secretPin = getPin[1]
            yunMidImageUrl = getPin[2]
            time.sleep(0.5)
            accessLog(secretPin)
            time.sleep(0.5)
            getOpenAllStat = getOpenCardAllStatuesNew(secretPin)
            if getOpenAllStat:
                isCanJoin = getOpenAllStat[0]
                reward = getOpenAllStat[1]
                shopList = getOpenAllStat[2]
                venderIds = venderIds.split(',')
                unOpenCardLists = [(venderIds[i], val['shopName']) for i, val in enumerate(shopList) if not val['statue']]
                errorShopCard = 0
                if unOpenCardLists:
                    print(f"未开卡店铺 {len(unOpenCardLists)}个")
                    for shop in unOpenCardLists:
                        print(f"去开卡 {shop[0]}")
                        venderId = shop[0]
                        venderCardName = shop[1]
                        getShopOpenCardInfo(cookie, venderId)
                        open_result = bindWithVender(cookie, venderId)
                        if open_result is not None:
                            if "火爆" in open_result or "失败" in open_result:
                                time.sleep(1.2)
                                print("\t尝试重新入会 第1次")
                                open_result = bindWithVender(cookie, venderId)
                                if "火爆" in open_result or "失败" in open_result:
                                    time.sleep(1.2)
                                    print("\t尝试重新入会 第2次")
                                    open_result = bindWithVender(cookie, venderId)
                            if "火爆" in open_result or "失败" in open_result:
                                print(f"\t⛈⛈{venderCardName} {open_result}")
                                errorShopCard += 1
                            else:
                                print(f"\t🎉🎉{venderCardName} {open_result}")
                                if "已经" in open_result or "绑定" in open_result:
                                    errorShopCard += 1
                        time.sleep(1.5)
                isInvi = isInvited(secretPin)
                if isInvi['isInvited']:
                    print(f"已加入队伍信息: {isInvi['nickName']}, {isInvi['inviter']}")
                if not isInvi['isInvited'] and isCanJoin:
                    acceptInvite(inviterNick, inviterPin, inviterImg, secretPin, nickName, yunMidImageUrl)
                    getSimpleActInfoVo()
                    getOpenCardAllStatuesNew(secretPin)
                    isInvi = isInvited(secretPin)
                    if isInvi['isInvited']:
                        if errorShopCard > 0:
                            print("⛈加入队伍成功,被邀请者账号未全部开卡")
                        else:
                            print(f"🎉加入{isInvi['nickName']}队伍成功")
                            inviteSuccNum += 1
                            print(f"本次车头已邀请{inviteSuccNum}人")
                            if inviteSuccNum >= maxGroup * maxGroups:
                                print(f"已达到{maxGroups}组好友,退出程序~")
                                sys.exit()
                    else:
                        print("😐加入队伍失败")
            if num == 1:
                inviterPin = secretPin
                inviterImg = yunMidImageUrl
                if not inviterImg:
                    inviterImg = "https://img10.360buyimg.com/imgzone/jfs/t1/21383/2/6633/3879/5c5138d8E0967ccf2/91da57c5e2166005.jpg"
                inviterNick = nickName
                activityUrl = f"https://cjhy-isv.isvjcloud.com/microDz/invite/activity/wx/view/index/3499100?activityId={activityId}&inviter={quote_plus(quote_plus(inviterPin))}&inviterImg={quote_plus(inviterImg)}&inviterNickName={quote_plus(inviterNick)}"

        time.sleep(3)
