
"""
15 2 * * * jd_pullfix.py
new Env('拉库修复');
"""
#!/usr/bin/env python3
# coding: utf-8

import os

def pullfix():
    print('\n对拉库失败、拉库成功但更新不出任务等问题修复\n')
    print('\n开始执行。。。\n')
    dir_path = os.path.dirname(os.path.abspath(__file__))
    if 'main' not in dir_path:
        if os.path.isdir('/ql/repo/shufflewzc_faker2'):
            os.system('rm -rf /ql/repo/shufflewzc_faker2')
        elif os.path.isdir('/ql/data/repo/shufflewzc_faker2'):
            os.system('rm -rf /ql/data/repo/shufflewzc_faker2')
        else:
            print('无需修复，拉不动可能是代理问题')
            # os.system('find /ql -maxdepth 2 -type d')
            return False
    else:
        if os.path.isdir('/ql/repo/shufflewzc_faker2_main'):
            os.system('rm -rf /ql/repo/shufflewzc_faker2_main')
        elif os.path.isdir('/ql/data/repo/shufflewzc_faker2_main'):
            os.system('rm -rf /ql/data/repo/shufflewzc_faker2_main')
        else:
            print('无需修复，拉不动可能是代理问题\n')
            # os.system('find /ql -maxdepth 2 -type d')
            return False
    return True

if pullfix():
    print('修复完成，请重试拉库，如果还是拉库失败请在群内反馈！')