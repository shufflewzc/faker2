#!/usr/bin/env python3
# -*- coding: utf-8 -*
'''
项目名称: JD-Script / USER_AGENTS
活动名称: User-agent
Author: SheYu09
'''
# from uuid import uuid4
from string import hexdigits
from time import time, sleep, localtime, strftime
from random import random, sample, randint, uniform

def uuid(e=40):
	return ((e == 0) and '0') or (uuid(e - 1).lstrip('0') + sample(hexdigits[:-6], 1)[0])

def userAgent():
	e = {
		'11.0.2': '168095',
		'10.5.4': '168074',
		'10.5.2': '168069',
		'10.5.0': '168052',
		'10.4.6': '168014',
		'10.4.5': '168001',
		'10.4.4': '167991',
		'10.4.0': '167968',
		'10.3.4': '167945'
	}
	v = ''.join(sample(e.keys(), 1))
	i = ''.join(sample(['14,5', '14,4', '14,3', '14,2', '13,4', '13,3', '13,2', '13,1', '12.5'], 1))
	iv = ''.join(sample(['15.5', '15.4.1', '15.4', '15.3.1', '15.3', '15.2.1', '15.2', '15.1.1', '15.1'], 1))
	return f"jdapp;iPhone;{v};{iv};{uuid()};network/{''.join(sample(['3g', '4g', 'wifi'], 1))};model/iPhone{i};addressid/;appBuild/{e[v]};jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS {iv.replace('.', '_')} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"

