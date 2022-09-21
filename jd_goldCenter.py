#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
File: jd_goldCenter.py(京东金榜签到)
Author: HarbourJ
Date: 2022/9/19 22:00
TG: https://t.me/HarbourToulu
TgChat: https://t.me/HarbourSailing
cron: 30 0 0 * * *
new Env('京东金榜签到');
ActivityEntry: https://u.jd.com/XwcRPWF
"""

import requests, sys, os, re, time
from datetime import datetime
from urllib.parse import quote_plus, unquote_plus
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

def randomString(e, flag=False):
    t = "0123456789abcdef"
    if flag: t = t.upper()
    n = [random.choice(t) for _ in range(e)]
    return ''.join(n)

def doTask(cookie):
    url = "https://api.m.jd.com/client.action"
    payload = f"functionId=goldCenterDoTask&body=%7B%22type%22%3A1%2C%22log%22%3A%221663608760605~1vIYistq46XMDFpdU1QRjAxMQ%3D%3D.WEN7Y3BZTXpldV1FeC4XMQF7aAxfLH1jOFhZe3xyRUczYjhYCzM%3D.3a9b2837~4%2C2~FAFBE710E8FEA122D0657597CB2CD59B1C29CEEB1CA2595AF7A141BC2B50DB3D~13sicf0~C~ShVFXRsCaBFUAhkHah15ABwIYHwfURhAExQTUwcdD2kffmAYBWgKHVYdRBsUEVcGGQJ%2FFHwGHQFgbR9SHEAWbBQTQ19dGwJoEVQBGQRwHXZ3HAxvZR9RGEATFBNTBh0McB9ydhgBa3QdVh1EGxQRVwEZAXkUcHAdBggIH0YcQBZsFBNQQ14bAgIfEkdHEwITBgcGCg4DCwcBBgkKCAQEAwAaHxFHUVATAhNDRURNTFVGVhYYE09UVhMKG15VR0RAQERZExsTQF1WEQlrBQUdCQQOAxwIFAsfARgBbBQTXVsSAwkfEVNHFgsaUwQHBFoNAwMDDFAFCQcCVAQIXVcHBlUAVFoEBFVVCF4RHxJaRBMCE15hWFZWVhEcFkATAgABBwMPCAsEBgQCAQ0dFVtbGwIRVlNRUQIPAFFSBQsBBgUCDARTXQlRVAABCAcKUlcAU1sDUwBVWApRBhIYFldIUxULElQLegVdGXpSaAJFa2BMX3t4Um5%2Fa1RgFR0SV04RCRJ1REFUVBdyX1RIRkdVRhgRcV9UHxIVGl1SRhYOEwkHDwMBCRofEUNXRhMCag8FBBULCgNtGBZDVxMNahJQaFtcXlEFAhQDFR0SUHdgERwWBQQWBBUdEggJHQIeABYdGgABCQIICBEfElFXVF0CAABWWg0BCgUCBgkIU1IJVlwICwMEDVZSDFNUA1QIXVIBUgEWHRpQFWwcG1FcUhIOFldeV1FXVk1MER8SVV4TAhNCExwbW1oRChZDAhYEGQESFRpQVW9CFgsaAQYTHBtaVxEKFkZQVlVYXA0ICQcFAQwCAxodFVxaGwJoABwHGAJlHRVTXFZfEQkSBQIHCwcHCQcMCwIAAEoFdVdYfWRBaQF2RH1wfmNdX0dlVVN5Sn1xCQkfYXRPfGl8QFtiW0xdYm97e2VJCUhjcAF4bXR1CHBjal56d3FncHwIaVdiQnVgCWFUcnFHRXBgekN0anFWVVpDYH5tBQN1dAlhcgF5B3llbXt4SAB0f1pAQGRlAXx3XXBFanwHVGoEW0N1dXpneFJfCmBYW3VhalZVfmVSdnVwRw1nWwhiZ1ZqdWxgX3xyZmRef0BwV3FSREt0cFNhcFt2en59XHx9VwR1YwhSQx8EAAFVUgANDE9OHQZPTkd6TWdyYmFpUGR5d2Z4fXRiZWJzSVt3ZXdXb29xQ3tyBUF%2BY3Z8Zn9qQGVhTGF%2FfWBmdnJ4W2V0ZWVyc39Zf3ZcTmBxRFRxcmNud3FgAG9%2BYUBibF9kbnVlZHZqVGlgckNxUGtZU2Z2CE9RdWVbCU8JBEcJWU5WER8SWUdWGgsVE00%3D~19vn3x1%22%2C%22random%22%3A%2211461862%22%2C%22sceneid%22%3A%22jdgoldenranking2022h5%22%7D&appid=content_ecology&clientVersion=11.1.4&client=wh5&d_model=iPhone13%2C2&build=168210&ext=%7B%22prstate%22%3A%220%22%7D&uuid={randomString(40)}&area=00_0000_0000_00000&joycious=56&rfs=0000"
    headers = {
        'Host': 'api.m.jd.com',
        'Accept': '*/*',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://h5.m.jd.com',
        'User-Agent': ua,
        'Connection': 'keep-alive',
        'Referer': 'https://h5.m.jd.com/',
        'request-from': 'native',
        'Cookie': cookie
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    res = response.json()
    if res['isSuccess']:
        result = res['result']
        if "任务已完成" == result['taskMsg']:
            print("已经领过了,明天再来")
        elif "响应成功" == result['taskMsg']:
            if "lotteryScore" in str(result):
                print(f"🎉获得{result['lotteryScore']}豆")
            else:
                print(f"获得💨💨💨")
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



