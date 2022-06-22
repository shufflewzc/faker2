#!/usr/bin/env python3
# -*- coding: utf-8 -*
'''
项目名称: JdScript / jdCookie
活动名称: 读取COOKIE / WSKEY
Author: SheYu09
'''
import requests
s = requests.session()
s.keep_alive = False
from os import environ
from inspect import stack
from USER_AGENTS import *
from re import compile, findall, split

def Name():
	try:
		if len(environ["Name"]):
			Name = environ["Name"].split('&')
			print("已获取并使用Env环境 Name:", Name, "\n")
			return Name
	except:
		print("自行添加环境变量：Name, 不同好友中间用&符号隔开\n")
		exit()

def re_pin(r):
	try: return compile(r'pin=(.*?);wskey=.*?;').findall(r)[0] if 'wskey=' in r else compile(r'pt_key=.*?;pt_pin=(.*?);').findall(r)[0]
	except: print(r, '\nck格式不正确，请检查\n')

def re_key(r, e):
	try: return compile(rf'{r}').findall(e) if 'pin=' in r else compile(rf'{r}').findall(e)[0]
	except: pass

def JD_API_HOST(C):
	try:
		if len(environ[f'JD_{C}']):
			print(f"   ****** 已获取并使用Env环境 {C} ******\n")
			return environ[f'JD_{C}']
	except:
		print(f"   ****** 获取Env环境 {C} 失败 ******")
		print(f"自行添加环境变量：JD_{C}\n")
		return 

def COOKIE():
	global ptkeyList, ptpinList
	ck = JD_API_HOST(stack()[0][3])
	ptkeyList = re_key('pt_key=.*?;pt_pin=.*?;', ck)
	ptpinList = re_key('pt_pin=(.*?);', ck)

def WSKEY():
	global wskeyList, wspinList
	ck = JD_API_HOST(stack()[0][3])
	wskeyList = re_key('pin=.*?;wskey=.*?;', ck)
	wspinList = re_key('pin=(.*?);', ck)

def jdCookie():
	COOKIE(); WSKEY()
	wskeyList and wspinList and [ptkeyList.remove(i) for i in [c for c in ptkeyList if re_pin(c) in wspinList]]
	cookiesList = (ptkeyList and wskeyList and [wskeyList + ptkeyList] or ptkeyList and not wskeyList and [ptkeyList] or not ptkeyList and wskeyList and [wskeyList])[0]
	print(f"====================共{len(cookiesList)}个京东账号Cookie=====================\n")
	print(f"==================脚本执行- 北京时间(UTC+8)：{strftime('%Y-%m-%d %H:%M:%S', localtime())}==================\n")
	cookiesList or exit()
	return cookiesList
