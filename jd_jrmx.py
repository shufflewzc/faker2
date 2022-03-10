# -*- coding:utf-8 -*-
#依赖管理-Python3-添加依赖PyExecJS
#依赖安装：进入容器执行：pip3 install PyExecJS
#想拿券的cookie环境变量JDJR_COOKIE，格式就是普通的cookie格式（pt_key=xxx;pt_pin=xxx）
#活动每天早上10点开始截止到这个月28号，建议corn 5 0 10 * * *

"""
cron: 5 0 10 * * *
new Env('京东金融分享助力');
"""

import execjs
import requests
import json
import time
import os
import re
import sys
import random
import string
import urllib
from urllib.parse import quote


#以下部分参考Curtin的脚本：https://github.com/curtinlv/JD-Script


def randomuserAgent():
    global uuid,addressid,iosVer,iosV,clientVersion,iPhone,ADID,area,lng,lat
    
    uuid=''.join(random.sample(['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9','a','b','c','z'], 40))
    addressid = ''.join(random.sample('1234567898647', 10))
    iosVer = ''.join(random.sample(["15.1.1","14.5.1", "14.4", "14.3", "14.2", "14.1", "14.0.1"], 1))
    iosV = iosVer.replace('.', '_')
    clientVersion=''.join(random.sample(["10.3.0", "10.2.7", "10.2.4"], 1))
    iPhone = ''.join(random.sample(["8", "9", "10", "11", "12", "13"], 1))
    ADID = ''.join(random.sample('0987654321ABCDEF', 8)) + '-' + ''.join(random.sample('0987654321ABCDEF', 4)) + '-' + ''.join(random.sample('0987654321ABCDEF', 4)) + '-' + ''.join(random.sample('0987654321ABCDEF', 4)) + '-' + ''.join(random.sample('0987654321ABCDEF', 12))
    
    
    area=''.join(random.sample('0123456789', 2)) + '_' + ''.join(random.sample('0123456789', 4)) + '_' + ''.join(random.sample('0123456789', 5)) + '_' + ''.join(random.sample('0123456789', 4))
    lng='119.31991256596'+str(random.randint(100,999))
    lat='26.1187118976'+str(random.randint(100,999))
    
    
    UserAgent=''
    if not UserAgent:
        return f'jdapp;iPhone;10.0.4;{iosVer};{uuid};network/wifi;ADID/{ADID};model/iPhone{iPhone},1;addressid/{addressid};appBuild/167707;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS {iosV} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/null;supportJDSHWK/1'
    else:
        return UserAgent

#以上部分参考Curtin的脚本：https://github.com/curtinlv/JD-Script


def printf(text):
    print(text+'\n')
    sys.stdout.flush()


def load_send():
    global send
    cur_path = os.path.abspath(os.path.dirname(__file__))
    sys.path.append(cur_path)
    if os.path.exists(cur_path + "/sendNotify.py"):
        try:
            from sendNotify import send
        except:
            send=False
            printf("加载通知服务失败~")
    else:
        send=False
        printf("加载通知服务失败~")
load_send()



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
        printf('读取auth.json文件出错，跳过获取备注')


def JDSignValidator(url):
    with open('JDJRSignValidator.js', 'r', encoding='utf-8') as f:
        jstext = f.read()
    ctx = execjs.compile(jstext)
    result = ctx.call('getBody', url)
    fp=result['fp']
    a=result['a']
    d=result['d']
    return fp,a,d


def geteid(a,d):
    url=f'https://gia.jd.com/fcf.html?a={a}'
    data=f'&d={d}'
    headers={
        'Host':'gia.jd.com',
        'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8',
        'Origin':'https://jrmkt.jd.com',
        'Accept-Encoding':'gzip, deflate, br',
        'Connection':'keep-alive',
        'Accept':'*/*',
        'User-Agent':UserAgent,
        'Referer':'https://jrmkt.jd.com/',
        'Content-Length':'376',
        'Accept-Language':'zh-CN,zh-Hans;q=0.9',
        }
    response=requests.post(url=url,headers=headers,data=data)
    return response.text



def gettoken():
    url='https://gia.jd.com/m.html'
    headers={'User-Agent':UserAgent}
    response=requests.get(url=url,headers=headers)
    return response.text.split(';')[0].replace('var jd_risk_token_id = \'','').replace('\'','')


def getsharetasklist(ck,eid,fp,token):
    url='https://ms.jr.jd.com/gw/generic/bt/h5/m/getShareTaskList'
    data='reqData='+quote('{"extMap":{"eid":"%s","fp":"%s","sdkToken":"","token":"%s","appType":"1","pageUrl":"https://btfront.jd.com/release/shareCouponRedemption/helpList/?channelId=17&channelName=pdy&jrcontainer=h5&jrlogin=true&jrcloseweb=false"},"channelId":"17","bizGroup":18}'%(eid,fp,token))
    headers={
        'Host':'ms.jr.jd.com',
        'Content-Type':'application/x-www-form-urlencoded',
        'Origin':'https://btfront.jd.com',
        'Accept-Encoding':'gzip, deflate, br',
        'Cookie':ck,
        'Connection':'keep-alive',
        'Accept':'application/json, text/plain, */*',
        'User-Agent':UserAgent,
        'Referer':'https://btfront.jd.com/',
        'Content-Length':str(len(data)),
        'Accept-Language':'zh-CN,zh-Hans;q=0.9'
        }
    try:
        response=requests.post(url=url,headers=headers,data=data)
        for i in range(len(json.loads(response.text)['resultData']['data'])):
            if json.loads(response.text)['resultData']['data'][i]['couponBigWord']=='12' and json.loads(response.text)['resultData']['data'][i]['couponSmallWord']=='期':
                printf('12期免息券活动id:'+str(json.loads(response.text)['resultData']['data'][i]['activityId']))
                return json.loads(response.text)['resultData']['data'][i]['activityId']
                break
    except:
        printf('获取任务信息出错，程序即将退出！')
        os._exit(0)



def obtainsharetask(ck,eid,fp,token,activityid): 
    url='https://ms.jr.jd.com/gw/generic/bt/h5/m/obtainShareTask'
    data='reqData='+quote('{"extMap":{"eid":"%s","fp":"%s","sdkToken":"","token":"%s","appType":"1","pageUrl":"https://btfront.jd.com/release/shareCouponRedemption/helpList/?channelId=17&channelName=pdy&jrcontainer=h5&jrlogin=true&jrcloseweb=false"},"activityId":%s}'%(eid,fp,token,activityid))
    headers={
        'Host':'ms.jr.jd.com',
        'Content-Type':'application/x-www-form-urlencoded',
        'Origin':'https://btfront.jd.com',
        'Accept-Encoding':'gzip, deflate, br',
        'Cookie':ck,
        'Connection':'keep-alive',
        'Accept':'application/json, text/plain, */*',
        'User-Agent':UserAgent,
        'Referer':'https://btfront.jd.com/',
        'Content-Length':str(len(data)),
        'Accept-Language':'zh-CN,zh-Hans;q=0.9'
        }
    try:
        response=requests.post(url=url,headers=headers,data=data)
        printf('obtainActivityId:'+json.loads(response.text)['resultData']['data']['obtainActivityId'])
        printf('inviteCode:'+json.loads(response.text)['resultData']['data']['inviteCode'])
        return json.loads(response.text)['resultData']['data']['obtainActivityId']+'@'+json.loads(response.text)['resultData']['data']['inviteCode']
    except:
        printf('开启任务出错，程序即将退出！')
        os._exit(0)
    
    
def assist(ck,eid,fp,token,obtainActivityid,invitecode):
    url='https://ms.jr.jd.com/gw/generic/bt/h5/m/helpFriend'
    data='reqData='+quote('{"extMap":{"eid":"%s","fp":"%s","sdkToken":"","token":"%s","appType":"10","pageUrl":"https://btfront.jd.com/release/shareCouponRedemption/sharePage/?obtainActivityId=%s&channelId=17&channelName=pdy&jrcontainer=h5&jrcloseweb=false&jrlogin=true&inviteCode=%s"},"obtainActivityId":"%s","inviteCode":"%s"}'%(eid,fp,token,obtainActivityid,invitecode,obtainActivityid,invitecode))
    headers={
        'Host':'ms.jr.jd.com',
        'Content-Type':'application/x-www-form-urlencoded',
        'Origin':'https://btfront.jd.com',
        'Accept-Encoding':'gzip, deflate, br',
        'Cookie':ck,
        'Connection':'keep-alive',
        'Accept':'application/json, text/plain, */*',
        'User-Agent':UserAgent,
        'Referer':'https://btfront.jd.com/',
        'Content-Length':str(len(data)),
        'Accept-Language':'zh-CN,zh-Hans;q=0.9'
        }
    try:
        response=requests.post(url=url,headers=headers,data=data)
        if response.text.find('本次助力活动已完成')!=-1:
            send('京东白条12期免息优惠券助力完成','去京东金融-白条-我的-我的优惠券看看吧')
            printf('助力完成，程序即将退出！')
            os._exit(0)
        else:
            if json.loads(response.text)['resultData']['result']['code']=='0000':
                printf('助力成功')
            elif json.loads(response.text)['resultData']['result']['code']=='M1003':
                printf('该用户未开启白条，助力失败!')
            elif json.loads(response.text)['resultData']['result']['code']=='U0002':
                printf('该用户白条账户异常，助力失败!')
            elif json.loads(response.text)['resultData']['result']['code']=='E0004':
                printf('该活动仅限受邀用户参与，助力失败!')
            else:
                print(response.text)
    except:
        try:
            print(response.text) 
        except:
            printf('助力出错，可能是cookie过期了')



if __name__ == '__main__':
    remarkinfos={}
    get_remarkinfo()
    
    
    jdjrcookie=os.environ["JDJR_COOKIE"]
    
    UserAgent=randomuserAgent()
    info=JDSignValidator('https://jrmfp.jr.jd.com/')
    eid=json.loads(geteid(info[1],info[2]).split('_*')[1])['eid']
    fp=info[0]
    token=gettoken()
    activityid=getsharetasklist(jdjrcookie,eid,fp,token)
    inviteinfo=obtainsharetask(jdjrcookie,eid,fp,token,activityid)
    
    
    try:
        cks = os.environ["JD_COOKIE"].split("&")
    except:
        f = open("/jd/config/config.sh", "r", encoding='utf-8')
        cks = re.findall(r'Cookie[0-9]*="(pt_key=.*?;pt_pin=.*?;)"', f.read())
        f.close()
    for ck in cks:
        ptpin = re.findall(r"pt_pin=(.*?);", ck)[0]
        try:
            if remarkinfos[ptpin]!='':
                printf("--账号:" + remarkinfos[ptpin] + "--")
                username=remarkinfos[ptpin]
            else:
                printf("--无备注账号:" + urllib.parse.unquote(ptpin) + "--")
                username=urllib.parse.unquote(ptpin)
        except:
            printf("--账号:" + urllib.parse.unquote(ptpin) + "--")
            username=urllib.parse.unquote(ptpin) 
        UserAgent=randomuserAgent()
        info=JDSignValidator('https://jrmfp.jr.jd.com/')
        eid=json.loads(geteid(info[1],info[2]).split('_*')[1])['eid']
        fp=info[0]
        token=gettoken()
        assist(ck,eid,fp,token,inviteinfo.split('@')[0],inviteinfo.split('@')[1])