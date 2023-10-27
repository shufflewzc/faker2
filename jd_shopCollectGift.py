#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
File: jd_shopCollectGift.py(店铺会员礼包-监控脚本)
Author: HarbourJ
Date: 2022/9/2 12:00
TG: https://t.me/HarbourToulu
TgChat: https://t.me/HarbourSailing
cron: 1 1 1 1 1 1
new Env('店铺会员礼包-JK');
ActivityEntry: https://shop.m.jd.com/shop/home?shopId=1000003443
Description: 部分账号开卡后无法自动领取开卡奖励,不自动开卡,仅领取已开卡的会员礼包
             变量export jd_shopCollectGiftId="1000003443" 变量为店铺venderId
"""

import requests, sys, os, re, time
from datetime import datetime
from functools import partial
print = partial(print, flush=True)
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
from urllib.parse import quote_plus, unquote_plus
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

venderId = os.environ.get("jd_shopCollectGiftId") if os.environ.get("jd_shopCollectGiftId") else ""

if not venderId:
    print("⚠️未发现有效活动变量,退出程序!")
    sys.exit()

def collectGift(venderId, activityId, activityType, cookie):
    url = f"https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=collectGift&body=%7B%22venderId%22%3A%22{venderId}%22%2C%22activityId%22%3A{activityId}%2C%22activityType%22%3A{activityType}%7D&clientVersion=9.2.0&client=H5&uuid=88888"
    headers = {
        'Host': 'api.m.jd.com',
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Cookie': cookie,
        'User-Agent': ua,
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Referer': 'https://shopmember.m.jd.com/',
        'Accept-Encoding': 'gzip, deflate, br'
    }
    response = requests.request("GET", url, headers=headers)
    res = response.json()
    if res['success']:
        return res['message']
    else:
        print(res)

def getFansDetail(venderId, cookie):
    url = f"https://api.m.jd.com/client.action?appid=jd_shop_member&functionId=getFansFuseMemberDetail&clientVersion=9.2.0&client=H5&uuid=88888&body=%7B%22venderId%22%3A%22{venderId}%22%2C%22channel%22%3A406%2C%22queryVersion%22%3A%2210.5.2%22%7D"
    headers = {
        'Host': 'api.m.jd.com',
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Cookie': cookie,
        'User-Agent': ua,
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Referer': 'https://shopmember.m.jd.com/',
        'Accept-Encoding': 'gzip, deflate, br'
    }
    response = requests.request("GET", url, headers=headers)
    res = response.json()
    if res['success']:
        brandName = res['data'][0]['cardInfo']['brandName']
        if 'newGiftList' in str(res) and res['data'][0]['newGiftList']:
            activityId = res['data'][0]['newGiftList'][0]['activityId']
            activityType = res['data'][0]['newGiftList'][0]['activityType']
            prizeTypeName = res['data'][0]['newGiftList'][0]['prizeTypeName']
            discount = res['data'][0]['newGiftList'][0]['discount']
            return activityId, activityType, discount, prizeTypeName, brandName
        else:
            print(f"{brandName} 未发现店铺礼包💨")

if __name__ == '__main__':
    try:
        cks = getCk
        if not cks:
            sys.exit()
    except:
        print("未获取到有效COOKIE,退出程序！")
        sys.exit()
    num = 0
    for cookie in cks[:]:
        num += 1
        global ua
        ua = userAgent()
        try:
            pt_pin = re.compile(r'pt_pin=(.*?);').findall(cookie)[0]
            pt_pin = unquote_plus(pt_pin)
        except IndexError:
            pt_pin = f'用户{num}'
        print(f'\n******开始【京东账号{num}】{pt_pin} *********\n')
        print(datetime.now())

        try:
            getFD = getFansDetail(venderId, cookie)
            if getFD:
                activityId = getFD[0]
                activityType = getFD[1]
                discount = getFD[2]
                prizeTypeName = getFD[3]
                brandName = getFD[4]
                cg = collectGift(venderId, activityId, activityType, cookie)
                if cg:
                    if "领取成功" in cg:
                        print(f"🎉🎉🎉{brandName} {discount}{prizeTypeName} {cg}")
                    else:
                        print(brandName, cg)
        except:
            continue
        time.sleep(0.5)