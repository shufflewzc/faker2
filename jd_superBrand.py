#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
File: jd_superBrand.py(超级品牌日12豆)
Author: HarbourJ
Date: 2023/1/15 08:00
TG: https://t.me/HarbourToulu
cron: 1 1 1 1 1 *
new Env('超级品牌日12豆');
ActivityEntry: APP搜索"超级品牌日"
"""

import time, requests, sys, os, json, random, re
from datetime import datetime
from functools import partial
print = partial(print, flush=True)
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
from jd_sign import *
try:
    from jdCookie import get_cookies
    getCk = get_cookies()
except:
    print("请先下载依赖脚本，\n下载链接: https://raw.githubusercontent.com/HarbourJ/HarbourToulu/main/jdCookie.py")
    sys.exit(3)

def getJdTime():
    jdTime = int(round(time.time() * 1000))
    return jdTime

def superBrandTask(ua, ck):
    url = f"https://api.m.jd.com/?client=wh5&appid=ProductZ4Brand&functionId=superBrandTaskList&t={getJdTime()}&body=%7B%22source%22%3A%22hall_1111%22%2C%22activityId%22%3A1012353%7D"
    headers = {
    'User-Agent': ua,
    'Cookie': ck,
    'Host': 'api.m.jd.com',
    'Accept': 'application/json, text/plain, */*',
    'Origin': 'https://prodev.m.jd.com'
    }
    response = requests.request("POST", url, headers=headers)
    res = json.loads(response.text)
    return res

def superBrandDoTask(ua, ck):
    url = f"https://api.m.jd.com/?client=wh5&appid=ProductZ4Brand&functionId=superBrandDoTask&t={getJdTime()}&body=%7B%22source%22%3A%22hall_1111%22%2C%22activityId%22%3A1012353%2C%22completionFlag%22%3A1%2C%22encryptProjectId%22%3A%22mCqqcvGW1LKeAWqJtc6NwHGXK2u%22%2C%22encryptAssignmentId%22%3A%22H8VttZkAwM83dpETucHznqaNGAc%22%2C%22assignmentType%22%3A0%2C%22actionType%22%3A0%7D"
    headers = {
        'User-Agent': ua,
        'Cookie': ck,
        'Host': 'api.m.jd.com',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://prodev.m.jd.com'
    }
    response = requests.request("POST", url, headers=headers)
    res = json.loads(response.text)
    if res['data']['success']:
        if res['data']['bizMsg'] == "success":
            rewards = res['data']['result']['rewards']
            if rewards:
                beanNum = ",".join([f"{reward['awardName']}{reward['beanNum']}个" for reward in rewards])
                print(f"🎁{beanNum}")
            else:
                print(f"💨💨💨")
        else:
            print(f"🤖{res['data']['bizMsg']}")
    else:
        print(res)

if __name__ == '__main__':
    try:
        cks = getCk
        if not cks:
            sys.exit()
    except:
        print("未获取到有效COOKIE,退出程序！")
        sys.exit()

    num = 0
    for cookie in cks:
        num += 1
        if num % 10 == 0:
            print("⏰等待5s,休息一下")
            time.sleep(5)
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
            superBrandDoTask(ua, cookie)
        except Exception as e:
            print(e)

        time.sleep(2.1)
