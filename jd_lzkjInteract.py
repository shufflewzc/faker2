#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
File: jd_lzkjInteract.py(jd_lzkjInteract邀请有礼)
Author: HarbourJ
Date: 2022/11/24 10:00
TG: https://t.me/HarbourToulu
TgChat: https://t.me/HarbourChat
cron: 1 1 1 1 1 1
new Env('jd_lzkjInteract邀请有礼');
ActivityEntry: https://lzkj-isv.isvjcloud.com/prod/cc/interactsaas/index?activityType=10006&activityId=1595256546199793665&templateId=20201228083300yqrhyl011&nodeId=101001005&prd=cjwx

Description: 邀请xx人xx豆,自动助力,自动领奖
"""

import time, requests, sys, re, os, json, random
from datetime import datetime
from urllib.parse import quote_plus, unquote_plus
from functools import partial
from sendNotify import *
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
jd_lzkjInteractUrl = os.environ.get("jd_lzkjInteractUrl") if os.environ.get("jd_lzkjInteractUrl") else ""
share_userId = os.environ.get("jd_lzkjInteractUserId") if os.environ.get("jd_lzkjInteractUserId") else ""

if "lzkj-isv.isvjcloud.com/prod/cc/interactsaas" not in jd_lzkjInteractUrl:
    print("⛈暂不支持变量设置的活动类型,请检查后重试！仅支持interactsaas类型活动")
    sys.exit()
templateId = re.findall(r"templateId=(.*?)&", jd_lzkjInteractUrl+"&")[0]
activityId = re.findall(r"activityId=(.*?)&", jd_lzkjInteractUrl+"&")[0]
activityType = re.findall(r"activityType=(.*?)&", jd_lzkjInteractUrl+"&")[0]

activity_url = f"https://lzkj-isv.isvjcloud.com/prod/cc/interactsaas/index?activityType={activityType}&activityId={activityId}&shareUserId={share_userId}&templateId={templateId}&prd=null&sid=c77e8b335974724742827d7c42f951cw&un_area=12_1212_11111_22222"

print(f"【🛳活动入口】https://lzkj-isv.isvjcloud.com/prod/cc/interactsaas/index?activityType={activityType}&templateId={templateId}&activityId={activityId}")

def redis_conn():
    try:
        import redis
        try:
            pool = redis.ConnectionPool(host=redis_url, port=6379, decode_responses=True, socket_connect_timeout=5, password=redis_pwd)
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
    jdTime = int(round(time.time() * 1000))
    return jdTime

def randomString(e, flag=False):
    t = "0123456789abcdef"
    if flag: t = t.upper()
    n = [random.choice(t) for _ in range(e)]
    return ''.join(n)

def check(ck):
    try:
        url = 'https://me-api.jd.com/user_new/info/GetJDUserInfoUnion'
        header = {
            "Host": "me-api.jd.com",
            "Accept": "*/*",
            "Connection": "keep-alive",
            "Cookie": ck,
            "User-Agent": ua,
            "Accept-Language": "zh-cn",
            "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
            "Accept-Encoding": "gzip, deflate",
        }
        result = requests.get(url=url, headers=header).text
        codestate = json.loads(result)
        if codestate['retcode'] == '1001':
            msg = "当前ck已失效，请检查"
            return {'code': 1001, 'data': msg}
        elif codestate['retcode'] == '0' and 'userInfo' in codestate['data']:
            nickName = codestate['data']['userInfo']['baseInfo']['nickname']
            return {'code': 200, 'name': nickName, 'ck': cookie}
    except Exception as e:
        return {'code': 0, 'data': e}

def getActivity():
    url = activityUrl
    headers = {
        'Host': 'lzkj-isv.isvjcloud.com',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': ua,
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
    }
    response = requests.request("GET", url, headers=headers)
    if response.status_code != 200:
        print(response.status_code, "⚠️ip疑似黑了,休息一会再来撸~")
        sys.exit()

def followShop(Token):
    url = "https://lzkj-isv.isvjcloud.com/prod/cc/interactsaas/api/task/followShop/follow"
    body = {}
    headers = {
        'Host': 'lzkj-isv.isvjcloud.com',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'token': Token,
        'Content-Type': 'application/json;charset=UTF-8',
        'Origin': 'https://lzkj-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl
    }
    response = requests.post(url, headers=headers, data=json.dumps(body))
    try:
        return response.json()
    except:
        return False

def getUserInfo(shareUserId):
    url = "https://lzkj-isv.isvjcloud.com/prod/cc/interactsaas/api/user-info/login"
    body = {
        "status": "0",
        "activityId": activityId,
        "source": "01",
        "tokenPin": token,
        "shareUserId": shareUserId
    }
    headers = {
        'Host': 'lzkj-isv.isvjcloud.com',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'token': '',
        'Content-Type': 'application/json;charset=UTF-8',
        'Origin': 'https://lzkj-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl,
        'Cookie': f'IsvToken={token};'
    }
    response = requests.request("POST", url, headers=headers, data=json.dumps(body))
    if response.status_code == 200:
        res = response.json()
        if res['data']:
            return res['data']
        else:
            print(res)
    else:
        print(response.status_code, "⚠️ip疑似黑了,休息一会再来撸~")
        sys.exit()

def guestMyself(Token, shareUserId):
    url = "https://lzkj-isv.isvjcloud.com/prod/cc/interactsaas/api/task/bargain/guest/myself"
    body = {
        "shareUserId": shareUserId
    }
    headers = {
        'Host': 'lzkj-isv.isvjcloud.com',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'token': Token,
        'Content-Type': 'application/json;charset=UTF-8',
        'Origin': 'https://lzkj-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl
    }
    requests.post(url, headers=headers, data=json.dumps(body))

def getMember(Token, shareUserId):
    url = "https://lzkj-isv.isvjcloud.com/prod/cc/interactsaas/api/task/member/getMember"
    body = {
        "shareUserId": shareUserId
    }
    headers = {
        'Host': 'lzkj-isv.isvjcloud.com',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'token': Token,
        'Content-Type': 'application/json;charset=UTF-8',
        'Origin': 'https://lzkj-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl
    }
    response = requests.post(url, headers=headers, data=json.dumps(body))
    try:
        res = response.json()
        inviteNum = res['data']['shareUser']
        return inviteNum
    except Exception as e:
        print(str(e))
        return False

def prizeList(Token):
    url = "https://lzkj-isv.isvjcloud.com/prod/cc/interactsaas/api/task/member/prizeList"
    body = {}
    headers = {
        'Host': 'lzkj-isv.isvjcloud.com',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'token': Token,
        'Content-Type': 'application/json;charset=UTF-8',
        'Origin': 'https://lzkj-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl
    }
    response = requests.post(url, headers=headers, data=json.dumps(body))
    try:
        return response.json()
    except:
        return False

def joinCheck(Token):
    url = "https://lzkj-isv.isvjcloud.com/prod/cc/interactsaas/api/join/check"
    body = {
        "status": "0"
    }
    headers = {
        'Host': 'lzkj-isv.isvjcloud.com',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'token': Token,
        'Content-Type': 'application/json;charset=UTF-8',
        'Origin': 'https://lzkj-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl
    }
    response = requests.post(url, headers=headers, data=json.dumps(body))
    try:
        return response.json()
    except:
        return False

def getUserId(Token):
    url = "https://lzkj-isv.isvjcloud.com/prod/cc/interactsaas/api/task/share/getUserId"
    body = {}
    headers = {
        'Host': 'lzkj-isv.isvjcloud.com',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'token': Token,
        'Content-Type': 'application/json;charset=UTF-8',
        'Origin': 'https://lzkj-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl
    }
    response = requests.post(url, headers=headers, data=json.dumps(body))
    try:
        return response.json()['data']['shareUserId']
    except Exception as e:
        print(str(e))

def receiveAcquire(Token, id):
    url = "https://lzkj-isv.isvjcloud.com/prod/cc/interactsaas/api/prize/receive/acquire"
    body = {
        "prizeInfoId": id,
        "status": 1
    }
    headers = {
        'Host': 'lzkj-isv.isvjcloud.com',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'token': Token,
        'Content-Type': 'application/json;charset=UTF-8',
        'Origin': 'https://lzkj-isv.isvjcloud.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': activityUrl
    }
    response = requests.post(url, headers=headers, data=json.dumps(body))
    try:
        return response.json()['resp_code']
    except:
        print(response.text)
        return False

def bindWithVender(cookie, shopId, venderId):
    try:
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
                'shopId': shopId,
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
        body = {"venderId": str(venderId), "channel": "8019006"}
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
            openCardStatus = res['result']['userInfo']['openCardStatus']
            return venderCardName, openCardStatus
        else:
            return False, 1
    except:
        return False, 1


if __name__ == '__main__':
    r = redis_conn()
    try:
        cks = getCk
        if not cks:
            sys.exit()
    except:
        print("未获取到有效COOKIE,退出程序！")
        sys.exit()
    global shareUserId, inviteSuccNum, activityUrl, firstCk, MSG
    inviteSuccNum = 0
    MSG = ''
    title = "🗣消息提醒：lzkjInteract邀请有礼"
    if len(cks) == 1:
        shareUserId = share_userId
        activityUrl = activity_url
    else:
        try:
            shareUserId = remote_redis(f"lzkj_{activityId}", 2)
            shareUserId = shareUserId if shareUserId else ""
        except:
            shareUserId = ""
        activityUrl = f"https://lzkj-isv.isvjcloud.com/prod/cc/interactsaas/index?activityType={activityType}&templateId={templateId}&activityId={activityId}&shareUserId={shareUserId}&prd=null&sid=c77e8b335974724742827d7c42f951cw&un_area=12_1212_11111_22222"
    num = 0
    for cookie in cks[:]:
        num += 1
        if num == 1:
            firstCk = cookie
        if num % 5 == 0:
            print("⏰等待5s,休息一下")
            time.sleep(5)
        global ua, token
        ua = userAgent()
        try:
            pt_pin = re.compile(r'pt_pin=(.*?);').findall(cookie)[0]
            pt_pin = unquote_plus(pt_pin)
        except IndexError:
            pt_pin = f'用户{num}'
        print(f'\n******开始【京东账号{num}】{pt_pin} *********\n')
        print(datetime.now())

        result = check(cookie)
        if result['code'] != 200:
            if num == 1:
                print("⚠️车头CK失效,退出程序！")
                sys.exit()
            print(f"⚠️当前CK失效！跳过")
            continue
        token = getToken(cookie, r)
        if token is None:
            if num == 1:
                print(f"⚠️车头获取Token失败,退出本程序！")
                sys.exit()
            print(f"⚠️获取Token失败！⏰等待3s")
            time.sleep(3)
            continue
        time.sleep(0.5)
        getActivity()
        time.sleep(0.5)
        userInfo = getUserInfo(shareUserId)
        if not userInfo:
            if num == 1:
                print('⚠️无法获取userInfo，退出本程序！')
                sys.exit()
            time.sleep(2)
            continue
        shopId = userInfo['shopId']
        openCardUrl = userInfo['joinInfo']['openCardUrl']
        venderId = re.findall(r"venderId=(\w+)", openCardUrl)
        venderId = venderId[0] if venderId else ""
        Token = userInfo['token']
        shopName = userInfo['shopName']
        actName = userInfo['actName']
        joinCodeInfo = userInfo['joinInfo']['joinCodeInfo']
        customerId = userInfo['customerId']
        time.sleep(0.3)
        followShop(Token)
        time.sleep(0.3)
        guestMyself(Token, shareUserId)
        time.sleep(0.3)

        if num == 1:
            print(f"✅ 开启【{actName}】活动")
            print(f"店铺名称：{shopName} {shopId}")
            MSG += f'✅账号[{pt_pin}] 开启{actName}活动\n📝活动地址 {activityUrl.split("&shareUserId=")[0]}\n'
            if shareUserId:
                print(f"CK1准备助力【{shareUserId}】")
            else:
                print(f"未填写助力码,CK1准备助力💨")
            if "不是会员无法参加" not in joinCodeInfo['joinDes']:
                print("已经是会员,助力失败！")
                joinCheck(Token)
                time.sleep(0.2)
                inviteNum = getMember(Token, shareUserId)
                time.sleep(0.2)
                inviteSuccNum = inviteNum  # 接口显示已邀请人数
                print(f"🧑‍🤝‍🧑 CK1已邀请{inviteNum}人\n")
                time.sleep(0.2)
                prizeListResponse = prizeList(Token)
                prizeListRecord = []
                prizeNameList = []
                index = 0
                try:
                    for prizeitem in prizeListResponse['data']['prizeInfo']:
                        index += 1
                        print(f"🎁 奖品: {prizeitem['prizeName']}, 助力人数: {prizeitem['days']}, 总数：{prizeitem['allNum']}, 剩余：{prizeitem['leftNum']}, ID: {prizeitem['id']}")
                        prizeNameList.append(f"🎁奖品:{prizeitem['prizeName']},助力人数:{prizeitem['days']},总数:{prizeitem['allNum']},剩余:{prizeitem['leftNum']}\n")
                        if prizeitem['leftNum'] > 0:
                            prizeListRecord.append((prizeitem['prizeName'], prizeitem['days'], prizeitem['id']))
                    MSG += f"🎁当前活动奖品如下: \n{str(''.join(prizeNameList))}\n"
                except:
                    print('⚠️无法获取奖品列表, 退出本程序！')
                    sys.exit()
                if prizeListRecord == []:
                    print('⚠️无奖品可领,退出本程序！')
                    sys.exit()
                for prizeinfo in prizeListRecord:
                    if inviteSuccNum >= prizeinfo[1]:
                        print(f'已达到领取条件,开始领取 {prizeinfo[0]}')
                        receive_result = receiveAcquire(Token, prizeinfo[2])
                        if receive_result == 0:
                            print(f'🎉🎉 领取奖励成功')
                            MSG += f"🎉成功领取 {prizeinfo[0]}\n"
                        elif receive_result == 60002:
                            print(f'🎉🎉 奖励已经领取过')
                            MSG += f"🎉已经领取过 {prizeinfo[0]}\n"
                        elif receive_result == 60009:
                            print(f'🎉🎉 奖励已经领取过其他奖励或未达到领取标准建议手动领取！')
                            MSG += f"🎉奖励已经领取过其他奖励或未达到领取标准建议手动领取 {prizeinfo[0]}\n"
                        else:
                            print(f'💥💥 领取奖励失败')
                            MSG += f"💥💥 领取奖励失败 {prizeinfo[0]}\n"
                    time.sleep(1.5)
                if inviteSuccNum >= prizeListRecord[-1][1]:
                    print("奖励已领完")
                    MSG += f"🤖奖励已领完\n"
                    if len(cks) > 1:
                        send(title, MSG)
                    sys.exit()
                actorUuid = getUserId(Token)
                time.sleep(0.3)
                if not actorUuid:
                    if num == 1:
                        print(f'⚠️ 无法获取车头邀请码, 退出本程序！')
                        sys.exit()
                print(f"\n后面账号全部助力 {actorUuid}")
                shareUserId = actorUuid
                activityUrl = f"https://lzkj-isv.isvjcloud.com/prod/cc/interactsaas/index?activityType={activityType}&templateId={templateId}&activityId={activityId}&shareUserId={shareUserId}&prd=null&sid=c77e8b335974724742827d7c42f951cw&un_area=12_1212_11111_22222"
                continue
            else:
                inviteSuccNum = 0

        if "不是会员无法参加" in joinCodeInfo['joinDes']:
            print(f"未开卡 现在去开卡")
            open_result = bindWithVender(cookie, shopId, venderId)
            if open_result is not None:
                if "火爆" in open_result or "失败" in open_result or "解绑" in open_result:
                    print(f"\t💥💥 {open_result}\n‼️助力失败")
                    continue
                else:
                    print(f"\t🎉🎉 {open_result}")
                    if num != 1:
                        inviteSuccNum += 1
                        print(f"🛳已经邀请{inviteSuccNum}人")
                    time.sleep(0.3)
                    joinCheck(Token)
                    time.sleep(0.3)
                    getMember(Token, shareUserId)
                    time.sleep(0.3)
                    prizeListResponse = prizeList(Token)
                    prizeListRecord = []
                    prizeNameList = []
                    index = 0
                    try:
                        for prizeitem in prizeListResponse['data']['prizeInfo']:
                            index += 1
                            if num == 1:
                                print(f"🎁 奖品: {prizeitem['prizeName']}, 助力人数: {prizeitem['days']}, 总数：{prizeitem['allNum']}, 剩余：{prizeitem['leftNum']}, ID: {prizeitem['id']}")
                                prizeNameList.append(f"🎁奖品:{prizeitem['prizeName']},助力人数:{prizeitem['days']},总数:{prizeitem['allNum']},剩余:{prizeitem['leftNum']}\n")
                            if prizeitem['leftNum'] > 0:
                                prizeListRecord.append((prizeitem['prizeName'], prizeitem['days'], prizeitem['id']))
                        if prizeNameList:
                            MSG += f"🎁当前活动奖品如下: \n{str(''.join(prizeNameList))}\n"
                            print(f"‼️该活动部分有且仅能领取一次奖励,默认自动领最高档豆🎁,或者手动领取\n")
                    except:
                        print('⚠️无法获取奖品列表, 退出本程序！')
                        sys.exit()
                    if prizeListRecord == []:
                        print('⚠️无奖品可领, 退出本程序！')
                        sys.exit()
                    for prizeinfo in prizeListRecord[:]:
                        if inviteSuccNum == prizeinfo[1]:
                            print(f'CK1已达到领取条件, 开始领取 {prizeinfo[0]}')
                            time.sleep(0.2)
                            token = getToken(firstCk, r)
                            time.sleep(0.2)
                            getActivity()
                            time.sleep(0.2)
                            Token0 = getUserInfo(shareUserId)['token']
                            receive_result = receiveAcquire(Token0, prizeinfo[2])
                            if receive_result == 0:
                                print(f'🎉🎉 领取奖励成功')
                                MSG += f"🎉成功领取 {prizeinfo[0]}\n"
                            elif receive_result == 60002:
                                print(f'🎉🎉 奖励已经领取过')
                                MSG += f"🎉已经领取过 {prizeinfo[0]}\n"
                            elif receive_result == 60009:
                                print(f'🎉🎉 奖励已经领取过其他奖励或未达到领取标准建议手动领取！')
                                MSG += f"🎉奖励已经领取过其他奖励或未达到领取标准建议手动领取 {prizeinfo[0]}\n"
                            else:
                                print(f'💥💥 领取奖励失败')
                                MSG += f"💥💥 领取奖励失败 {prizeinfo[0]}\n"
                            time.sleep(1.5)
                    if inviteSuccNum >= prizeListRecord[-1][1]:
                        print("🤖奖励已领完")
                        MSG += f"🤖奖励已领完\n"
                        if len(cks) > 1:
                            send(title, MSG)
                        sys.exit()
                    time.sleep(0.3)
                    if num == 1:
                        actorUuid = getUserId(Token)
                        if not actorUuid:
                            print(f'⚠️无法获取车头邀请码, 退出本程序！')
                            sys.exit()
                        print(f"后面账号全部助力 {actorUuid}")
                        shareUserId = actorUuid
                        activityUrl = f"https://lzkj-isv.isvjcloud.com/prod/cc/interactsaas/index?activityType={activityType}&templateId={templateId}&activityId={activityId}&shareUserId={shareUserId}&prd=null&sid=c77e8b335974724742827d7c42f951cw&un_area=12_1212_11111_22222"
        else:
            print(f"⛈已开卡,无法完成助力")

        time.sleep(2)
