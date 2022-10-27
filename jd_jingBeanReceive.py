#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
File: jd_jingBeanReceive.py(plus专属礼-天天领福利)
Author: HarbourJ
Date: 2022/9/19 22:00
TG: https://t.me/HarbourToulu
TgChat: https://t.me/HarbourSailing
cron: 30 0 0 * * *
new Env('plus专属礼-天天领福利');
"""

import requests, sys, os, re, time
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

def randomString(e, flag=False):
    t = "0123456789abcdef"
    if flag: t = t.upper()
    n = [random.choice(t) for _ in range(e)]
    return ''.join(n)

def doTask(cookie):
    url = "https://api.m.jd.com/client.action?functionId=jingBeanReceive"
    payload = "avifSupport=1&body=%7B%22encryptAssignmentId%22%3A%226bzcu8ZNPHFhuWZC55MhLgJCPiW%22%2C%22firstType%22%3A1%7D&build=168311&client=apple&clientVersion=11.2.7&d_brand=apple&d_model=iPhone10%2C3&ef=1&eid=eidI21de81220cs4zwVxJDcwTxubBP9xskb8as8Fcpw827kSwFhxTs/xaamHiBAVj7C/YnZR%2BmODl1OUeH7f5I4xm/mIct00P8O2cmBrp3PIKEq208Zs&ep=%7B%22ciphertype%22%3A5%2C%22cipher%22%3A%7B%22screen%22%3A%22CJOyDIeyDNC2%22%2C%22wifiBssid%22%3A%22YtPwC2VrZWPrCJKmZNO4CNS3ENUnZWUzYJSmCwDuCNS%3D%22%2C%22osVersion%22%3A%22CJUkCy4n%22%2C%22area%22%3A%22CJvpCJYmCV8zDtCzXzYzCtUy%22%2C%22openudid%22%3A%22DwO2Czu5YJY1DQC2EJYmCzLvYJu5DJZrDNq1ZNDsZJPvDJVuDzO0ZG%3D%3D%22%2C%22uuid%22%3A%22aQf1ZRdxb2r4ovZ1EJZhcxYlVNZSZz09%22%7D%2C%22ts%22%3A1664322556%2C%22hdid%22%3A%22JM9F1ywUPwflvMIpYPok0tt5k9kW4ArJEU3lfLhxBqw%3D%22%2C%22version%22%3A%221.0.3%22%2C%22appname%22%3A%22com.360buy.jdmobile%22%2C%22ridx%22%3A-1%7D&ext=%7B%22prstate%22%3A%220%22%2C%22pvcStu%22%3A%221%22%7D&isBackground=N&joycious=90&lang=zh_CN&networkType=wifi&networklibtype=JDNetworkBaseAF&partner=apple&rfs=0000&scope=11&sign=1068e427417088f66b6662841e9188b3&st=1664322629327&sv=111&uemps=0-0&uts=0f31TVRjBSsM4O1yK5LGrapaX3BEwS6R%2BmwPNn9dovB4gt4APFjVvh%2BoNgcWzJXrDASiBpSRQ3pc9ekEO5KCoTMPhPrXYRqXLR8bzfr3d%2B2gW/%2BNqeVTOVl22fjzmPi2glE4SD40Tb4WoZL4BC1v4ZOyc0E4NuLooRD0h6AO3RS64giA6YOFQa7z6Lnnnb8DCffGL0/zm0UQEfnIKCK8SA%3D%3D"
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie,
        'Host': 'api.m.jd.com',
        'User-Agent': ua
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    try:
        res = response.json()
        if res['isSuccess']:
            print(f"🎉 {res['data']['windowsContent']}")
        else:
            print(f"⛈ {res['message']}")
    except:
        print(response.text)

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
        doTask(cookie)
        time.sleep(2)



