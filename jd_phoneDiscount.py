#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
File: jd_phoneDiscount.py(手机折上折抽奖)
Author: HarbourJ
Date: 2022/12/29 20:00
TG: https://t.me/HarbourToulu
cron: 1 1 1 1 1 1
new Env('手机折上折抽奖');
活动入口: https://sjtx-dz.isvjcloud.com/phone_discount/?invite_id=63ad1171068bd98098&source=test&baseInfo=LM6HIKdH%2Cbrand_two
"""


import time, requests, sys, re, os, json, random
import warnings

warnings.filterwarnings("ignore", category=DeprecationWarning)
from functools import partial
print = partial(print, flush=True)

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
baseInfo = os.environ.get("baseInfo") if os.environ.get("baseInfo") else ""

if not baseInfo:
    print('未设置export baseInfo="品牌编号",默认运行第九个任务brand_ten')
    baseInfo = "8AHIKfsi%2Cbrand_ten"
else:
    if baseInfo == "1":
        baseInfo = "HXu94GdF%2Cbrand_one"
    elif baseInfo == "2":
        baseInfo = "LM6HIKdH%2Cbrand_two"
    elif baseInfo == "3":
        baseInfo = "KmwM4N4L%2Cbrand_three"
    elif baseInfo == "4":
        baseInfo = "8pTg6fXi%2Cbrand_four"
    elif baseInfo == "5":
        baseInfo = "Sr5zisvb%2Cbrand_five"
    elif baseInfo == "6":
        baseInfo = "B0cRJYyC%2Cbrand_six"
    elif baseInfo == "7":
        baseInfo = "ZRco56US%2Cbrand_seven"
    elif baseInfo == "8":
        baseInfo = "4tqyLzac%2Cbrand_eight"
    elif baseInfo == "9":
        baseInfo = "PIZ1W0ap%2Cbrand_nine"
    elif baseInfo == "10":
        baseInfo = "8AHIKfsi%2Cbrand_ten"
    else:
        print('export baseInfo="品牌编号"设置有误,默认运行第九个任务brand_ten')
        baseInfo = "8AHIKfsi%2Cbrand_ten"
appKey = baseInfo.split('%2C')[0]
brand = baseInfo.split('%2C')[1]

activity_url = f"https://sjtx-dz.isvjcloud.com/phone_discount/?invite_id=63ad1171068bd98098&source=test&baseInfo={baseInfo}"
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
        pt_pin = unquote_plus(re.compile(r'pt_pin=(.*?);').findall(ck)[0])
    except:
        pt_pin = ck[:15]
    try:
        try:
            Token = r.get(f'{activityUrl.split("https://")[1].split("-")[0]}_{pt_pin}')
        except Exception as e:
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
                print(f"✅获取实时Token")
            return Token_new
    except Exception as e:
        print(f"Token error: {str(e)}")
        return

def getJdTime():
    url = "http://api.m.jd.com/client.action?functionId=queryMaterialProducts&client=wh5"
    headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Host': 'api.m.jd.com',
        'Proxy-Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
    }
    try:
        response = requests.request("GET", url, headers=headers, timeout=2)
        if response.status_code == 200:
            res = response.json()
            jdTime = res['currentTime2']
    except:
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
        activityCookie = ''.join(
            sorted([(set_cookie + ";") for set_cookie in list(set(activityCookieMid + set_cookie))]))
        # print("刷新cookie", activityCookie)

def getActivity():
    url = activityUrl
    headers = {
        'Host': 'sjtx-dz.isvjcloud.com',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': ua,
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': f'IsvToen={token}'
    }
    response = requests.request("GET", url, headers=headers)
    if response.status_code == 200:
        return
    else:
        print(response.status_code)
        print("⚠️疑似ip黑了")
        sys.exit()

def getAuth():
    url = f"https://sjtx-dz.isvjcloud.com/auth/jos?token={token}&jd_source=01&source=test&is_share=1"
    headers = {
        'Host': 'sjtx-dz.isvjcloud.com',
        'Accept': 'application/json, text/plain, */*',
        'App-Key': appKey,
        'brand': brand,
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json',
        'Origin': 'https://sjtx-dz.isvjcloud.com',
        'User-Agent': ua,
        'Referer': activityUrl,
        'Connection': 'keep-alive'
    }
    response = requests.request("POST", url, headers=headers)
    res = response.json()
    if res['status'] == 0:
        return res['body']['access_token']
    else:
        print(f"⚠️{res}")

def getUserInfo(authToken):
    url = "https://sjtx-dz.isvjcloud.com/phone-discount-api/get_user_info?source=test&is_share=1"
    headers = {
        'Host': 'sjtx-dz.isvjcloud.com',
        'Accept': 'application/json, text/plain, */*',
        'App-Key': appKey,
        'Authorization': f'Bearer {authToken}',
        'brand': brand,
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json',
        'User-Agent': ua,
        'Referer': activityUrl,
        'Connection': 'keep-alive'
    }
    response = requests.request("GET", url, headers=headers)
    res = response.json()
    try:
        code = res['code']
        is_acvite_complete = res['is_acvite_complete']
        user_click_invite = res['user_click_invite']
        is_invite_complete = res['is_invite_complete']
        user_new = res['user_new']
        return code, is_acvite_complete, user_click_invite, is_invite_complete, user_new
    except:
        print(res)

def getFriendList(authToken):
    url = "https://sjtx-dz.isvjcloud.com/phone-discount-api/get_friend_list?source=test&is_share=1"
    headers = {
        'Host': 'sjtx-dz.isvjcloud.com',
        'Accept': 'application/json, text/plain, */*',
        'App-Key': appKey,
        'Authorization': f'Bearer {authToken}',
        'brand': brand,
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json',
        'User-Agent': ua,
        'Referer': activityUrl,
        'Connection': 'keep-alive'
    }
    response = requests.request("GET", url, headers=headers)
    res = response.json()
    # print("getFriendList:", res)
    try:
        friendList = res['friend_list']
    except Exception as e:
        print(f"getFriendList Error: {str(e)}")
        friendList = []
    return friendList

def inviteFriend(inviter_id, authToken):
    url = "https://sjtx-dz.isvjcloud.com/phone-discount-api/invite_friend?source=test&is_share=1"
    payload = '{"inviter_id":"' + inviter_id + '","channel":2}'
    headers = {
        'Host': 'sjtx-dz.isvjcloud.com',
        'Accept': 'application/json, text/plain, */*',
        'App-Key': appKey,
        'Authorization': f'Bearer {authToken}',
        'brand': brand,
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json',
        'Origin': 'https://sjtx-dz.isvjcloud.com',
        'User-Agent': ua,
        'Referer': activityUrl,
        'Connection': 'keep-alive'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    res = response.json()
    return res

def invite(authToken):
    url = f"https://sjtx-dz.isvjcloud.com/burying/stat?action=invite&source=test&is_share=1"
    headers = {
        'Host': 'sjtx-dz.isvjcloud.com',
        'Accept': 'application/json, text/plain, */*',
        'App-Key': appKey,
        'Authorization': f'Bearer {authToken}',
        'brand': brand,
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json',
        'Origin': 'https://sjtx-dz.isvjcloud.com',
        'User-Agent': ua,
        'Referer': activityUrl,
        'Connection': 'keep-alive'
    }
    response = requests.request("POST", url, headers=headers)
    res = response.json()
    return res

def inviteFriendNew(inviter_id, authToken):
    url = "https://sjtx-dz.isvjcloud.com/phone-discount-api/invite_friend_new?source=test&is_share=1"
    payload = '{"inviter_id":"' + inviter_id + '","channel":2}'
    headers = {
        'Host': 'sjtx-dz.isvjcloud.com',
        'Accept': 'application/json, text/plain, */*',
        'App-Key': appKey,
        'Authorization': f'Bearer {authToken}',
        'brand': brand,
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json',
        'Origin': 'https://sjtx-dz.isvjcloud.com',
        'User-Agent': ua,
        'Referer': activityUrl,
        'Connection': 'keep-alive'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    res = response.json()
    return res

def clickHomeGetPrize(authToken):
    url = f"https://sjtx-dz.isvjcloud.com/burying/stat?action=click_home_get_prize&source=test&is_share=1"
    headers = {
        'Host': 'sjtx-dz.isvjcloud.com',
        'Accept': 'application/json, text/plain, */*',
        'App-Key': appKey,
        'Authorization': f'Bearer {authToken}',
        'brand': brand,
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json',
        'Origin': 'https://sjtx-dz.isvjcloud.com',
        'User-Agent': ua,
        'Referer': activityUrl,
        'Connection': 'keep-alive'
    }
    response = requests.request("POST", url, headers=headers)
    res = response.json()
    return res

def clickEffectGetPrize(authToken):
    url = f"https://sjtx-dz.isvjcloud.com/burying/stat?action=click_effect_get_prize&source=test&is_share=1"
    headers = {
        'Host': 'sjtx-dz.isvjcloud.com',
        'Accept': 'application/json, text/plain, */*',
        'App-Key': appKey,
        'Authorization': f'Bearer {authToken}',
        'brand': brand,
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json',
        'Origin': 'https://sjtx-dz.isvjcloud.com',
        'User-Agent': ua,
        'Referer': activityUrl,
        'Connection': 'keep-alive'
    }
    response = requests.request("POST", url, headers=headers)
    res = response.json()
    return res

def homeSendPrizes(authToken):
    url = f"https://sjtx-dz.isvjcloud.com/phone-discount-api/home_send_prizes?source=test&is_share=1"
    headers = {
        'Host': 'sjtx-dz.isvjcloud.com',
        'Accept': 'application/json, text/plain, */*',
        'App-Key': appKey,
        'Authorization': f'Bearer {authToken}',
        'brand': brand,
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json',
        'Origin': 'https://sjtx-dz.isvjcloud.com',
        'User-Agent': ua,
        'Referer': activityUrl,
        'Connection': 'keep-alive'
    }
    response = requests.request("POST", url, headers=headers)
    res = response.json()
    return res

def clickCouponSenPrize(authToken):
    url = f"https://sjtx-dz.isvjcloud.com/burying/stat?action=click_coupon_send_prize&source=test&is_share=1"
    headers = {
        'Host': 'sjtx-dz.isvjcloud.com',
        'Accept': 'application/json, text/plain, */*',
        'App-Key': appKey,
        'Authorization': f'Bearer {authToken}',
        'brand': brand,
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json',
        'Origin': 'https://sjtx-dz.isvjcloud.com',
        'User-Agent': ua,
        'Referer': activityUrl,
        'Connection': 'keep-alive'
    }
    response = requests.request("POST", url, headers=headers)
    res = response.json()
    return res

def userClickInvite(authToken):
    url = f"https://sjtx-dz.isvjcloud.com/phone-discount-api/user_click_invite?source=test&is_share=1"
    headers = {
        'Host': 'sjtx-dz.isvjcloud.com',
        'Accept': 'application/json, text/plain, */*',
        'App-Key': appKey,
        'Authorization': f'Bearer {authToken}',
        'brand': brand,
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json',
        'Origin': 'https://sjtx-dz.isvjcloud.com',
        'User-Agent': ua,
        'Referer': activityUrl,
        'Connection': 'keep-alive'
    }
    requests.request("POST", url, headers=headers)

def inviteDrawPrize(invite_type, authToken):
    url = "https://sjtx-dz.isvjcloud.com/phone-discount-api/invite_draw_prize?source=test&is_share=1"
    payload = '{"invite_type":' + invite_type + '}'
    headers = {
        'Host': 'sjtx-dz.isvjcloud.com',
        'Accept': 'application/json, text/plain, */*',
        'App-Key': appKey,
        'Authorization': f'Bearer {authToken}',
        'brand': brand,
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json',
        'Origin': 'https://sjtx-dz.isvjcloud.com',
        'User-Agent': ua,
        'Referer': activityUrl,
        'Connection': 'keep-alive'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    res = response.json()
    return res


if __name__ == '__main__':
    r = redis_conn()
    try:
        cks = getCk
        if not cks:
            sys.exit()
    except:
        print("未获取到有效COOKIE,退出程序！")
        sys.exit()
    global shareUuid, inviteSuccNum, activityUrl, firstCk, allCookies
    inviteSuccNum = 0
    try:
        shareUuid = remote_redis(brand, 1)
        if not shareUuid:
            shareUuid = "63ad1171068bd98098"
    except:
        shareUuid = "63ad1171068bd98098"
    activityUrl = f"https://sjtx-dz.isvjcloud.com/phone_discount/?invite_id={shareUuid}&source=test&baseInfo={baseInfo}"
    allCookies = cks

    num = 0
    for cookie in allCookies:
        num += 1
        if num == 1:
            firstCk = cookie
        if num % 6 == 0:
            print("⏰等待3s,休息一下")
            time.sleep(3)
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
        token = None
        token = getToken(cookie, r)
        if token is None:
            if num == 1:
                print(f"⚠️车头获取Token失败,退出本程序！")
                sys.exit()
            print(f"⚠️获取Token失败！⏰等待3s")
            time.sleep(3)
            continue
        time.sleep(0.3)
        getActivity()
        time.sleep(0.2)
        authToken = getAuth()
        if not authToken:
            if num == 1:
                print("‼️车头为火爆号,换车头重新运行！")
                sys.exit()
            else:
                print("📝移除火爆账号")
                allCKs.remove()
                time.sleep(1.5)
                continue
        time.sleep(0.2)
        userInfo = getUserInfo(authToken)
        if not userInfo:
            if num == 1:
                sys.exit()
            else:
                time.sleep(1.5)
                continue
        shareUuid1 = userInfo[0]
        print(f"🤖助力码: {shareUuid1}")
        is_acvite_complete = userInfo[1]
        user_new = userInfo[4]
        time.sleep(0.2)
        if num == 1:
            inviteSuccNum = len(getFriendList(authToken))
            print(f"🧑‍🤝‍🧑CK1已邀请{inviteSuccNum}人")
            if inviteSuccNum >= 10:
                for i in range(2):
                    invite_type = i + 1
                    print(f"开始第{invite_type}次抽奖")
                    drawPrize = inviteDrawPrize(str(invite_type), authToken)
                    try:
                        if "prize_info" not in drawPrize:
                            print(drawPrize['message'])
                        else:
                            prize_info = f"{drawPrize['prize_info']['user_prize']['prize_name']} {drawPrize['prize_info']['user_prize']['prize_info']['quota']}"
                            print(f"🎁抽奖获得:{prize_info}")
                    except:
                        print(f"抽奖结果: {drawPrize}")
                sys.exit()
        time.sleep(0.2)
        if user_new == 1: # 新用户
            invite(authToken)
            time.sleep(0.2)
            inviteNewInfo = inviteFriendNew(shareUuid, authToken)
            if "prize_info" in inviteNewInfo:
                prize_info = [f"{x['user_prize']['prize_name']}{x['user_prize']['prize_info']['quota']}个" for x in inviteNewInfo['prize_info']]
                if prize_info:
                    print(f"🎁获得{','.join(prize_info)}")
                else:
                    print("来晚了没水了💨💨💨")
                inviteSuccNum += 1
                print(f"🎉助力成功！已邀请{inviteSuccNum}人")
            else:
                print(inviteNewInfo['message'])
                clickHomeGetPrize(authToken)
                time.sleep(0.2)
                clickEffectGetPrize(authToken)
                time.sleep(0.2)
                homePrizes = homeSendPrizes(authToken)
                if "prize_info" in homePrizes:
                    prize_info = [f"{x['user_prize']['prize_name']}{x['user_prize']['prize_info']['quota']}个" for x in homePrizes['prize_info']]
                    print(f"🎁获得{','.join(prize_info)}")
                else:
                    print(homePrizes)
            time.sleep(0.2)
            userClickInvite(authToken)

            if inviteSuccNum >= 10:
                token = getToken(firstCk, r)
                time.sleep(0.2)
                getActivity()
                time.sleep(0.2)
                authToken0 = getAuth()
                time.sleep(0.2)
                getUserInfo(authToken0)
                time.sleep(0.2)
                for i in range(2):
                    invite_type = i + 1
                    print(f"开始第{invite_type}次抽奖")
                    drawPrize0 = inviteDrawPrize(str(invite_type), authToken0)
                    try:
                        if "prize_info" not in drawPrize0:
                            print(drawPrize0['message'])
                        else:
                            prize_info = f"{drawPrize0['prize_info']['user_prize']['prize_name']}{drawPrize0['prize_info']['user_prize']['prize_info']['quota']}"
                            print(f"🎁抽奖获得:{prize_info}")
                    except:
                        print(drawPrize0)
                sys.exit()
        else:
            inviteInfo = inviteFriend(shareUuid, authToken)
            if "prize_info" not in inviteInfo:
                print(inviteInfo['message'])
                if "已达到好友邀请上限" in inviteInfo['message']:
                    if num == 1:
                        shareUuid = shareUuid1
                        activityUrl = f"https://sjtx-dz.isvjcloud.com/phone_discount/?invite_id={shareUuid}&source=test&baseInfo={baseInfo}"
                        print(f"🤖后面的号全部助力: {shareUuid}")
                        continue
                    else:
                        token = getToken(firstCk, r)
                        time.sleep(0.2)
                        getActivity()
                        time.sleep(0.2)
                        authToken0 = getAuth()
                        time.sleep(0.2)
                        getUserInfo(authToken0)
                        time.sleep(0.2)
                        for i in range(2):
                            invite_type = i + 1
                            print(f"开始第{invite_type}次抽奖")
                            drawPrize0 = inviteDrawPrize(str(invite_type), authToken0)
                            try:
                                if "prize_info" not in drawPrize0:
                                    print(drawPrize0['message'])
                                else:
                                    prize_info = f"{drawPrize0['prize_info']['user_prize']['prize_name']}{drawPrize0['prize_info']['user_prize']['prize_info']['quota']}"
                                    print(f"🎁抽奖获得:{prize_info}")
                            except:
                                print(drawPrize0)
                        sys.exit()
            else:
                inviteSuccNum += 1
                print(f"🎉助力成功！已邀请{inviteSuccNum}人")
                prize_info = [f"{x['user_prize']['prize_name']}{x['user_prize']['prize_info']['quota']}个" for x in inviteInfo['prize_info']]
                print(f"🎁获得{','.join(prize_info)}")
                if inviteSuccNum >= 10:
                    token = getToken(firstCk, r)
                    time.sleep(0.2)
                    getActivity()
                    time.sleep(0.2)
                    authToken0 = getAuth()
                    time.sleep(0.2)
                    getUserInfo(authToken0)
                    time.sleep(0.2)
                    for i in range(2):
                        invite_type = i + 1
                        print(f"开始第{invite_type}次抽奖")
                        drawPrize0 = inviteDrawPrize(str(invite_type), authToken0)
                        try:
                            if "prize_info" not in drawPrize0:
                                print(drawPrize0['message'])
                            else:
                                prize_info = f"{drawPrize0['prize_info']['user_prize']['prize_name']}{drawPrize0['prize_info']['user_prize']['prize_info']['quota']}"
                                print(f"🎁抽奖获得:{prize_info}")
                        except:
                            print(drawPrize0)
                    sys.exit()
        if num == 1:
            shareUuid = shareUuid1
            activityUrl = f"https://sjtx-dz.isvjcloud.com/phone_discount/?invite_id={shareUuid}&source=test&baseInfo={baseInfo}"
            print(f"🤖后面的号全部助力: {shareUuid}")

        time.sleep(2)