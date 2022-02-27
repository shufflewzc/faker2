#Source::https://github.com/Hyper-Beast/JD_Scripts

"""
cron: 20 20 * * *
new Env('京东试用成功通知');
"""


import requests
import json
import time
import os
import re
import sys
import random
import string
import urllib



#以下部分参考Curtin的脚本：https://github.com/curtinlv/JD-Script

UserAgent = ''
uuid=''.join(random.sample(['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9','a','b','c','z'], 40))
addressid = ''.join(random.sample('1234567898647', 10))
iosVer = ''.join(random.sample(["14.5.1", "14.4", "14.3", "14.2", "14.1", "14.0.1", "13.7", "13.1.2", "13.1.1"], 1))
iosV = iosVer.replace('.', '_')
clientVersion=''.join(random.sample(["10.3.0", "10.2.7", "10.2.4", "10.2.2", "10.2.0", "10.1.6"], 1))
iPhone = ''.join(random.sample(["8", "9", "10", "11", "12", "13"], 1))
area=''.join(random.sample('0123456789', 2)) + '_' + ''.join(random.sample('0123456789', 4)) + '_' + ''.join(random.sample('0123456789', 5)) + '_' + ''.join(random.sample('0123456789', 4))
ADID = ''.join(random.sample('0987654321ABCDEF', 8)) + '-' + ''.join(random.sample('0987654321ABCDEF', 4)) + '-' + ''.join(random.sample('0987654321ABCDEF', 4)) + '-' + ''.join(random.sample('0987654321ABCDEF', 4)) + '-' + ''.join(random.sample('0987654321ABCDEF', 12))

def userAgent():
    """
    随机生成一个UA
    jdapp;iPhone;10.0.4;14.2;9fb54498b32e17dfc5717744b5eaecda8366223c;network/wifi;ADID/2CF597D0-10D8-4DF8-C5A2-61FD79AC8035;model/iPhone11,1;addressid/7785283669;appBuild/167707;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/null;supportJDSHWK/1
    :return: ua
    """
    if not UserAgent:
        return f'jdapp;iPhone;10.0.4;{iosVer};{uuid};network/wifi;ADID/{ADID};model/iPhone{iPhone},1;addressid/{addressid};appBuild/167707;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS {iosV} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/null;supportJDSHWK/1'
    else:
        return UserAgent

#以上部分参考Curtin的脚本：https://github.com/curtinlv/JD-Script

def load_send():
    global send
    cur_path = os.path.abspath(os.path.dirname(__file__))
    sys.path.append(cur_path)
    if os.path.exists(cur_path + "/sendNotify.py"):
        try:
            from sendNotify import send
        except:
            send=False
            print("加载通知服务失败~")
    else:
        send=False
        print("加载通知服务失败~")
load_send()


def printf(text):
    print(text)
    sys.stdout.flush()

def get_remarkinfo():
    url='http://127.0.0.1:5600/api/envs'
    try:
        with open('/ql/config/auth.json', 'r') as f:
            token=json.loads(f.read())['token']
        headers={
            'Accept':'application/json',
            'authorization':'Bearer '+token,
            }
        response=requests.get(url=url,headers=headers)

        for i in range(len(json.loads(response.text)['data'])):
            if json.loads(response.text)['data'][i]['name']=='JD_COOKIE':
                try:
                    if json.loads(response.text)['data'][i]['remarks'].find('@@')==-1:
                        remarkinfos[json.loads(response.text)['data'][i]['value'].split(';')[1].replace('pt_pin=','')]=json.loads(response.text)['data'][i]['remarks'].replace('remark=','')
                    else:
                        remarkinfos[json.loads(response.text)['data'][i]['value'].split(';')[1].replace('pt_pin=','')]=json.loads(response.text)['data'][i]['remarks'].split("@@")[0].replace('remark=','').replace(';','')
                except:
                    pass
    except:
        print('读取auth.json文件出错，跳过获取备注')

def get_succeedinfo(ck):
    url='https://api.m.jd.com/client.action'
    headers={
    'accept':'application/json, text/plain, */*',
    'content-type':'application/x-www-form-urlencoded',
    'origin':'https://prodev.m.jd.com',
    'content-length':'249',
    'accept-language':'zh-CN,zh-Hans;q=0.9',
    'User-Agent':userAgent(),
    'referer':'https://prodev.m.jd.com/',
    'accept-encoding':'gzip, deflate, br',
    'cookie':ck
	    }    
    data=f'appid=newtry&functionId=try_MyTrials&uuid={uuid}&clientVersion={clientVersion}&client=wh5&osVersion={iosVer}&area={area}&networkType=wifi&body=%7B%22page%22%3A1%2C%22selected%22%3A2%2C%22previewTime%22%3A%22%22%7D'
    response=requests.post(url=url,headers=headers,data=data)
    isnull=True
    try:
        for i in range(len(json.loads(response.text)['data']['list'])):
            if(json.loads(response.text)['data']['list'][i]['text']['text']).find('试用资格将保留')!=-1:
                print(json.loads(response.text)['data']['list'][i]['trialName'])
                try:
                    if remarkinfos[ptpin]!='':
                        send("京东试用待领取物品通知",'账号名称：'+remarkinfos[ptpin]+'\n'+'商品名称:'+json.loads(response.text)['data']['list'][i]['trialName']+"\n"+"商品链接:https://item.jd.com/"+json.loads(response.text)['data']['list'][i]['skuId']+".html")
                        isnull=False
                    else:
                        send("京东试用待领取物品通知",'账号名称：'+urllib.parse.unquote(ptpin)+'\n'+'商品名称:'+json.loads(response.text)['data']['list'][i]['trialName']+"\n"+"商品链接:https://item.jd.com/"+json.loads(response.text)['data']['list'][i]['skuId']+".html")
                        isnull=False 
                except Exception as e:
                    printf(str(e))
        if isnull==True:
            print("没有在有效期内待领取的试用品\n\n")
    except:
        print('获取信息出错，可能是账号已过期')
        pass
if __name__ == '__main__':
    remarkinfos={}
    try:
        get_remarkinfo()
    except:
        pass
    try:
        cks = os.environ["JD_COOKIE"].split("&")
    except:
        f = open("/jd/config/config.sh", "r", encoding='utf-8')
        cks = re.findall(r'Cookie[0-9]*="(pt_key=.*?;pt_pin=.*?;)"', f.read())
        f.close()
    for ck in cks:
        ck = ck.strip()
        if ck[-1] != ';':
            ck += ';'
        ptpin = re.findall(r"pt_pin=(.*?);", ck)[0]
        try:
            if remarkinfos[ptpin]!='':
                printf("--账号:" + remarkinfos[ptpin] + "--")
            else:
                printf("--无备注账号:" + urllib.parse.unquote(ptpin) + "--")
        except Exception as e:
            printf("--账号:" + urllib.parse.unquote(ptpin) + "--")
        get_succeedinfo(ck)
