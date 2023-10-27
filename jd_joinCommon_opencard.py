#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
File: jd_joinCommon_opencard.py(通用开卡-joinCommon系列)
Author: HarbourJ
Date: 2022/8/12 20:37
TG: https://t.me/HarbourToulu
TgChat: https://t.me/HarbourSailing
cron: 1 1 1 1 1 1
new Env('通用开卡-joinCommon系列');
ActivityEntry: https://lzdz1-isv.isvjcloud.com/dingzhi/joinCommon/activity?activityId=2b870a1a74504c45995a5d5119487f3a
Description: dingzhi/joinCommon系列通用开卡脚本(通常情况下,开一张卡10豆，邀请成功获得20豆)。
            本地sign算法+redis缓存Token+代理ip(自行配置，实测可行)
            变量: export jd_joinCommonId="2b870a1a7450xxxxxxxxxxxxx&1000000904" 变量值需要传入活动id&shopId
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
    sys.exit()
try:
    from jdCookie import get_cookies
    getCk = get_cookies()
except:
    print("请先下载依赖脚本，\n下载链接: https://raw.githubusercontent.com/HarbourJ/HarbourToulu/main/jdCookie.py")
    sys.exit(3)

redis_url = os.environ.get("redis_url") if os.environ.get("redis_url") else "172.17.0.1"
redis_port = os.environ.get("redis_port") if os.environ.get("redis_port") else "6379"
redis_pwd = os.environ.get("redis_pwd") if os.environ.get("redis_pwd") else ""
jd_joinCommonId = os.environ.get("jd_joinCommonId") if os.environ.get("jd_joinCommonId") else ""
inviterUuid = os.environ.get("jd_joinCommon_uuid") if os.environ.get("jd_joinCommon_uuid") else ""

if not jd_joinCommonId:
    print("⚠️未发现有效活动变量,退出程序!")
    sys.exit()
# 获取远程remote-redis活动ID
if "lzdz1_remote" in jd_joinCommonId:
    jd_joinCommonId_remote = remote_redis(jd_joinCommonId)
    jd_joinCommonId = jd_joinCommonId_remote
else:
    if "&" not in jd_joinCommonId:
        print("⚠️活动变量错误,退出程序!")
        sys.exit()

activityId = jd_joinCommonId.split('&')[0]
shopId = jd_joinCommonId.split('&')[1]
activity_url = f"https://lzdz1-isv.isvjcloud.com/dingzhi/joinCommon/activity/5929859?activityId={activityId}&shareUuid={inviterUuid}&adsource=null&shareuserid4minipg=null&lng=00.000000&lat=00.000000&sid=&un_area=&&shopid={shopId}"
print(f"【🛳活动入口】https://lzdz1-isv.isvjcloud.com/dingzhi/joinCommon/activity/5929859?activityId={activityId}")

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
        pt_pin = unquote_plus(re.compile(r'pt_pin=(.*?);').findall(ck)[0])
    except:
        pt_pin = ck[:15]
    try:
        try:
            Token = r.get(f'{activityUrl.split("https://")[1].split("-")[0]}_{pt_pin}')
        except Exception as e:
            # print(f"redis get error: {str(e)}")
            Token = None
        if Token is not None:
            print(f"♻️获取缓存Token")
            return Token
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
            sign({"url": f"{host}", "id": ""}, 'isvObfuscator')
            f = s.post('https://api.m.jd.com/client.action', verify=False, timeout=30)
            if f.status_code != 200:
                print(f.status_code)
                return
            else:
                if "参数异常" in f.text:
                    print(f.text)
                    return
            Token_new = f.json()['token']
            try:
                if r.set(f'{activityUrl.split("https://")[1].split("-")[0]}_{pt_pin}', Token_new, ex=1800):
                    print("✅Token缓存成功")
                else:
                    print("❌Token缓存失败")
            except Exception as e:
                # print(f"redis set error: {str(e)}")
                print(f"✅获取实时Token")
            return Token_new
    except Exception as e:
        print(f"Get Token Error: {str(e)}")
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
        'Host': 'lzdz1-isv.isvjcloud.com',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': ua,
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
    }

    response = requests.request("GET", url, headers=headers)
    if response.status_code == 200:
        if response.cookies:
            cookies = response.cookies.get_dict()
            set_cookies = [(set_cookie + "=" + cookies[set_cookie]) for set_cookie in cookies]
            set_cookie = ''.join(sorted([(set_cookie + ";") for set_cookie in set_cookies]))
        return set_cookie
    else:
        print(response.status_code, "⚠️ip疑似黑了,休息一会再来撸~")
        sys.exit()

def getSystemConfigForNew():
    url = "https://lzdz1-isv.isvjcloud.com/wxCommonInfo/getSystemConfigForNew"
    payload = f'activityId={activityId}&activityType=99'
    headers = {
        'Host': 'lzdz1-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://lzdz1-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)

def getSimpleActInfoVo():
    url = "https://lzdz1-isv.isvjcloud.com/dz/common/getSimpleActInfoVo"
    payload = f"activityId={activityId}"
    headers = {
        'Host': 'lzdz1-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://lzdz1-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)
    res = response.json()
    if res['result']:
        return res['data']
    else:
        print(res['errorMessage'])

def getMyPing(index, venderId):
    url = "https://lzdz1-isv.isvjcloud.com/customer/getMyPing"
    payload = f"userId={venderId}&token={token}&fromType=APP"
    headers = {
        'Host': 'lzdz1-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://lzdz1-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)
    res = response.json()
    if res['result']:
        return res['data']['nickname'], res['data']['secretPin']
    else:
        print(f"⚠️{res['errorMessage']}")
        if index == 1 and "火爆" in res['errorMessage']:
            print(f"\t⛈车头黑,退出本程序！")
            sys.exit()

def accessLogWithAD(venderId, pin):
    url = "https://lzdz1-isv.isvjcloud.com/common/accessLogWithAD"
    payload = f"venderId={venderId}&code=99&pin={quote_plus(pin)}&activityId={activityId}&pageUrl={quote_plus(activityUrl)}&subType=app&adSource=null"
    headers = {
        'Host': 'lzdz1-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://lzdz1-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)

def getSystime():
    url = "https://lzdz1-isv.isvjcloud.com/common/getSystime"
    headers = {
        'Host': 'lzdz1-isv.isvjcloud.com',
        'Origin': 'https://lzdz1-isv.isvjcloud.com',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cookie': activityCookie,
        'Content-Length': '0',
        'Connection': 'keep-alive',
        'Accept': 'application/json',
        'User-Agent': ua,
        'Referer': activityUrl,
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'X-Requested-With': 'XMLHttpRequest'
    }
    response = requests.request("POST", url, headers=headers)
    refresh_cookies(response)

def getUserInfo(pin):
    url = "https://lzdz1-isv.isvjcloud.com/wxActionCommon/getUserInfo"
    payload = f"pin={quote_plus(pin)}"
    headers = {
        'Host': 'lzdz1-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://lzdz1-isv.isvjcloud.com',
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

def activityContent(pin, pinImg, nickname):
    url = "https://lzdz1-isv.isvjcloud.com/dingzhi/joinCommon/activityContent"
    try:
        yunMidImageUrl = quote_plus(pinImg)
    except:
        yunMidImageUrl = quote_plus("https://img10.360buyimg.com/imgzone/jfs/t1/21383/2/6633/3879/5c5138d8E0967ccf2/91da57c5e2166005.jpg")
    payload = f"activityId={activityId}&pin={quote_plus(pin)}&pinImg={yunMidImageUrl}&nick={quote_plus(nickname)}&cjyxPin=&cjhyPin=&shareUuid={shareUuid}"
    headers = {
        'Host': 'lzdz1-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://lzdz1-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': f'IsvToken={token};{activityCookie}'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)
    res = response.json()
    if res['result']:
        return res['data']
    else:
        print(res['errorMessage'])
        if "活动已结束" in res['errorMessage']:
            sys.exit()

def shareRecord(pin, actorUuid):
    url = "https://lzdz1-isv.isvjcloud.com/dingzhi/joinCommon/shareRecord"
    payload = f"activityId={activityId}&pin={quote_plus(pin)}&uuid={actorUuid}&num=30"
    headers = {
        'Host': 'lzdz1-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://lzdz1-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)

def taskRecord(pin, actorUuid):
    url = "https://lzdz1-isv.isvjcloud.com/dingzhi/joinCommon/taskRecord"
    payload = f"activityId={activityId}&pin={quote_plus(pin)}&uuid={actorUuid}&taskType="
    headers = {
        'Host': 'lzdz1-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://lzdz1-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    refresh_cookies(response)

def drawContent(actorUuid, pin):
    url = "https://lzdz1-isv.isvjcloud.com/dingzhi/taskact/common/drawContent"
    payload = f"activityId={actorUuid}&pin={quote_plus(pin)}"
    headers = {
        'Host': 'lzdz1-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://lzdz1-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    requests.request("POST", url, headers=headers, data=payload)

def taskInfo(pin):
    url = "https://lzdz1-isv.isvjcloud.com/dingzhi/joinCommon/taskInfo"
    payload = f"activityId={activityId}&pin={quote_plus(pin)}"
    headers = {
        'Host': 'lzdz1-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://lzdz1-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie':  activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    res = response.json()
    if res['result']:
        return res['data']
    else:
        print(res['errorMessage'])

def assist(pin, uuid):
    url = "https://lzdz1-isv.isvjcloud.com/dingzhi/joinCommon/assist"
    payload = f"activityId={activityId}&pin={quote_plus(pin)}&uuid={uuid}&shareUuid={shareUuid}"
    headers = {
        'Host': 'lzdz1-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://lzdz1-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    res = response.json()
    if res['result']:
        return res['data']
    else:
        print(res['errorMessage'])

def doTask(actorUuid, pin, taskType):
    url = "https://lzdz1-isv.isvjcloud.com/dingzhi/joinCommon/doTask"
    payload = f"activityId={activityId}&uuid={actorUuid}&pin={quote_plus(pin)}&taskType={taskType}&taskValue="
    headers = {
        'Host': 'lzdz1-isv.isvjcloud.com',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://lzdz1-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': activityCookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    res = response.json()
    print('doTask', res)
    if res['result']:
        data = res['data']
        if data['score'] == 0:
            print("\t获得 💨💨💨")
        else:
            print(f"\t🎉获得{data['score']}积分")
    else:
        print(res['errorMessage'])

def bindWithVender(cookie, venderId):
    try:
        shopcard_url0 = f"https://lzdz1-isv.isvjcloud.com/dingzhi/joinCommon/activity/7854908?activityId={activityId}&shareUuid={shareUuid}"
        shopcard_url = f"https://shopmember.m.jd.com/shopcard/?venderId={venderId}&channel=401&returnUrl={quote_plus(shopcard_url0)}"
        s.headers = {
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent': ua,
            'Cookie': cookie,
            'Host': 'api.m.jd.com',
            'Referer': 'https://shopmember.m.jd.com/',
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
            'Referer': 'https://shopmember.m.jd.com/',
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
    global shareUuid, inviteSuccNum, activityUrl, firstCk
    inviteSuccNum = 0
    if len(cks) == 1:
        shareUuid = inviterUuid
        activityUrl = activity_url
    else:
        shareUuid = remote_redis(f"lzdz1_{activityId}", 2)
        activityUrl = f"https://lzdz1-isv.isvjcloud.com/dingzhi/joinCommon/activity/5929859?activityId={activityId}&shareUuid={shareUuid}&adsource=null&shareuserid4minipg=null&lng=00.000000&lat=00.000000&sid=&un_area=&&shopid={shopId}"
    num = 0
    for cookie in cks[:]:
        num += 1
        if num == 1:
            firstCk = cookie
        if num % 8 == 0:
            print("⏰等待10s,休息一下")
            time.sleep(10)
        global ua, activityCookie, token
        ua = userAgent()
        try:
            pt_pin = re.compile(r'pt_pin=(.*?);').findall(cookie)[0]
            pt_pin = unquote_plus(pt_pin)
        except IndexError:
            pt_pin = re.compile(r'pin=(.*?);').findall(cookie)[0]
            pt_pin = unquote_plus(pt_pin)
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
        getSystemConfigForNew()
        time.sleep(0.3)
        getSimAct = getSimpleActInfoVo()
        if getSimAct:
            venderId = getSimAct['venderId']
        else:
            venderId = shopId
        time.sleep(0.2)
        getPin = getMyPing(num, venderId)
        if getPin is not None:
            nickname = getPin[0]
            secretPin = getPin[1]
            time.sleep(0.5)
            accessLogWithAD(venderId, secretPin)
            time.sleep(0.5)
            userInfo = getUserInfo(secretPin)
            time.sleep(0.8)
            nickname = userInfo[0]
            yunMidImageUrl = userInfo[1]
            pin = userInfo[2]
            actContent = activityContent(pin, yunMidImageUrl, nickname)
            if not actContent:
                if num == 1:
                    print("⚠️无法获取车头邀请码,退出本程序！")
                    sys.exit()
                continue
            hasEnd = actContent['hasEnd']
            if hasEnd:
                print("活动已结束，下次早点来~")
                sys.exit()
            print(f"✅开启【{actContent['activityName']}】活动\n")
            if num == 1:
                print(f"🛳 已邀请{actContent['actorInfo']['totalAssistCount']}, 有效助力{actContent['actorInfo']['assistCount']}")
            actorUuid = actContent['actorInfo']['uuid']
            taskType = actContent['taskType']
            print(f"邀请码->: {actorUuid}")
            print(f"准备助力->: {shareUuid}")
            time.sleep(0.5)
            shareRecord(pin, actorUuid)
            time.sleep(0.5)
            taskRecord(pin, actorUuid)
            time.sleep(0.5)
            print("现在去一键关注店铺")
            doTask(actorUuid, pin, 20)
            time.sleep(1)
            doTask(actorUuid, pin, 23)
            time.sleep(1)
            ass0 = assist(pin, actorUuid)
            assistState0 = ass0['assistState']
            openAll0 = ass0['openCardInfo']['openAll']
            openVenderId0 = ass0['openCardInfo']['openVenderId']
            assStat = False
            if openAll0:
                print("已完成全部开卡任务")
                if assistState0 == 0:
                    print("无法助力自己~")
                elif assistState0 == 3:
                    print("已助力过其他好友~")
                elif assistState0 == 1:
                    print("已完成开卡关注任务,未助力过好友~")
                    assStat = True
                else:
                    # print('assistStatus:', assistState0)
                    assStat = True
            else:
                print("现在去开卡")
                task_info0 = taskInfo(pin)
                openCardList = task_info0['1']['settingInfo']
                openCardLists = [(int(i['value']), i['name']) for i in openCardList]
                unOpenCardLists = [i for i in openCardLists if i[0] not in openVenderId0]
                for shop in unOpenCardLists:
                    print(f"去开卡 {shop[1]} {shop[0]}")
                    venderId = shop[0]
                    venderCardName = shop[1]
                    getShopOpenCardInfo(cookie, venderId)
                    open_result = bindWithVender(cookie, venderId)
                    if open_result is not None:
                        if "火爆" in open_result or "失败" in open_result or "解绑" in open_result:
                            print(f"\t⛈⛈{venderCardName} {open_result}")
                            assStat = False
                            break
                        else:
                            print(f"\t🎉🎉{venderCardName} {open_result}")
                            assStat = True
                    time.sleep(1.5)
            activityContent(pin, yunMidImageUrl, nickname)
            shareRecord(pin, actorUuid)
            time.sleep(0.5)
            taskRecord(pin, actorUuid)
            time.sleep(0.5)
            ass1 = assist(pin, actorUuid)
            assistState1 = ass1['assistState']
            if assStat and assistState1 == 1:
                print("🎉🎉🎉助力成功~")
                if num != 1:
                    inviteSuccNum += 1
                    print(f"本次车头已邀请{inviteSuccNum}人")
            elif assStat and assistState0 == 1:
                print("🎉🎉🎉助力成功~")
                if num != 1:
                    inviteSuccNum += 1
                    print(f"本次车头已邀请{inviteSuccNum}人")

            if num == 1:
                print(f"后面账号全部助力 {actorUuid}")
                shareUuid = actorUuid
                activityUrl = f"https://lzdz1-isv.isvjcloud.com/dingzhi/joinCommon/activity/5929859?activityId={activityId}&shareUuid={shareUuid}&adsource=null&shareuserid4minipg=null&lng=00.000000&lat=00.000000&sid=&un_area=&&shopid={shopId}"

        time.sleep(3)