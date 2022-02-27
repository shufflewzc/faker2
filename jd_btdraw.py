# -*- coding:utf-8 -*-
#pip install PyExecJS


"""
cron: 23 10 * * *
new Env('京东金融天天试手气');
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

try:
    import execjs
except:
    print('缺少依赖文件PyExecJS,请先去Python3安装PyExecJS后再执行')
    sys.exit(0)

def printf(text):
    print(text)
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

def randomuserAgent():
    global uuid,addressid,iosVer,iosV,clientVersion,iPhone,area,ADID,lng,lat
    uuid=''.join(random.sample(['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9','a','b','c','z'], 40))
    addressid = ''.join(random.sample('1234567898647', 10))
    iosVer = ''.join(random.sample(["15.1.1","14.5.1", "14.4", "14.3", "14.2", "14.1", "14.0.1"], 1))
    iosV = iosVer.replace('.', '_')
    clientVersion=''.join(random.sample(["10.3.0", "10.2.7", "10.2.4"], 1))
    iPhone = ''.join(random.sample(["8", "9", "10", "11", "12", "13"], 1))
    area=''.join(random.sample('0123456789', 2)) + '_' + ''.join(random.sample('0123456789', 4)) + '_' + ''.join(random.sample('0123456789', 5)) + '_' + ''.join(random.sample('0123456789', 4))
    ADID = ''.join(random.sample('0987654321ABCDEF', 8)) + '-' + ''.join(random.sample('0987654321ABCDEF', 4)) + '-' + ''.join(random.sample('0987654321ABCDEF', 4)) + '-' + ''.join(random.sample('0987654321ABCDEF', 4)) + '-' + ''.join(random.sample('0987654321ABCDEF', 12))
    lng='119.31991256596'+str(random.randint(100,999))
    lat='26.1187118976'+str(random.randint(100,999))
    UserAgent=''
    if not UserAgent:
        return f'jdapp;iPhone;10.0.4;{iosVer};{uuid};network/wifi;ADID/{ADID};model/iPhone{iPhone},1;addressid/{addressid};appBuild/167707;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS {iosV} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/null;supportJDSHWK/1'
    else:
        return UserAgent

def JDSignValidator(url):
    with open('JDSignValidator.js', 'r', encoding='utf-8') as f:
        jstext = f.read()
    js = execjs.compile(jstext)
    result = js.call('getBody', url)
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

def draw(activityid,eid,fp):
    global sendNotifyflag
    global prizeAward
    sendNotifyflag=False
    prizeAward=0
    url='https://jrmkt.jd.com/activity/newPageTake/takePrize'
    data=f'activityId={activityid}&eid={eid}&fp={fp}'
    headers={
        'Host':'jrmkt.jd.com',
        'Accept':'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With':'XMLHttpRequest',
        'Accept-Language':'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding':'gzip, deflate, br',
        'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin':'https://jrmkt.jd.com',
        'User-Agent':UserAgent,
        'Connection':'keep-alive',
        'Referer':'https://jrmkt.jd.com/ptp/wl/vouchers.html?activityId=Q029794F612c2E2O1D2a0N161v0Z2i2s9nJ&jrcontainer=h5&jrlogin=true&jrcloseweb=false',
        'Content-Length':str(len(data)),
        'Cookie':ck
        }
    response=requests.post(url=url,headers=headers,data=data)
    try:
        if json.loads(response.text)['prizeModels'][0]['prizeAward'].find('元')!=-1:
            printf('获得'+json.loads(response.text)['prizeModels'][0]['useLimit']+'的'+json.loads(response.text)['prizeModels'][0]['prizeName']+'\n金额:'+json.loads(response.text)['prizeModels'][0]['prizeAward']+'\n有效期:'+json.loads(response.text)['prizeModels'][0]['validTime']+'\n\n')
            if int((json.loads(response.text)['prizeModels'][0]['prizeAward']).replace('.00元',''))>=5:
                prizeAward=json.loads(response.text)['prizeModels'][0]['prizeAward']
                sendNotifyflag=True
        if json.loads(response.text)['prizeModels'][0]['prizeAward'].find('期')!=-1:
            printf(response.text)
            send('抽到白条分期券','去看日志')
    except:
        printf('出错啦，出错原因为:'+json.loads(response.text)['failDesc']+'\n\n')
    
    time.sleep(5)
    
if __name__ == '__main__':
    printf('游戏入口:京东金融-白条-天天试手气\n')
    remarkinfos={}
    get_remarkinfo()
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
        info=JDSignValidator('https://prodev.m.jd.com/mall/active/498THTs5KGNqK5nEaingGsKEi6Ao/index.html')
        eid=json.loads(geteid(info[1],info[2]).split('_*')[1])['eid']
        fp=info[0]
        draw('Q72966994128142102X259KS',eid,fp)
        if sendNotifyflag:
            send('京东白条抽奖通知',username+'抽到'+str(prizeAward)+'的优惠券了，速去京东金融-白条-天天试手气查看')