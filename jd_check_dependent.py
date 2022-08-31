#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
File: jd_check_dependent.py(Harbour库依赖一键检测安装(不可禁用)每小时检测一次)
Author: HarbourJ
Date: 2022/8/12 20:37
TG: https://t.me/HarbourToulu
TgChat: https://t.me/HarbourSailing
cron: 7 7 7 7 7
new Env('Faker库本地Sign依赖检测');
Description:1.Faker库jd_sign本地算法依赖一键检测安装脚本;
            2.自动识别机器系统/架构,拉取最新依赖文件;
            3.本地sign算法已编译支持Windows(amd64)、Linux(amd64/arm64/arm)、Macos(x86_64)系统/架构;
            4.默认支持python3版本为3.8-3.9,过高或过低可能会报错;
            5.若本一键配置脚本无法安装所需jd_sign依赖文件,请前往https://github.com/HarbourJ/HarbourToulu/releases自行下载系统对应的jd_sign依赖压缩文件,解压并放置/scripts/HarbourJ_HarbourToulu_main文件夹内即可。
"""
import sys

import requests, os, platform
from functools import partial
print = partial(print, flush=True)


def updateDependent():
    """
    更新依赖的主函数
    """
    system = platform.system().lower()
    if system == "windows":
        print("识别本机设备为Windows amd64")
        rtu = repoTreeUpdate()
        if rtu == 9:
            sys.exit()
        if rtu:
            removeOldSign()
            if download("jd_sign-win-amd64.zip"):
                import zipfile
                f = zipfile.ZipFile("jd_sign-win-amd64.zip", 'r')
                for file in f.namelist():
                    f.extract(file, os.getcwd())
                f.close()
                return True
    elif system == "darwin":
        print("识别本机设备为MacOS x86_64")
        rtu = repoTreeUpdate()
        if rtu == 9:
            sys.exit()
        if rtu:
            removeOldSign()
            if download("jd_sign-darwin-x86_64.tar.gz"):
                os.system('tar xvf jd_sign-darwin-x86_64.tar.gz')
                os.system('rm -rf jd_sign-darwin-x86_64.tar.gz')
                return True
    else:
        print("识别本机设备为Linux")
        rtu = repoTreeUpdate()
        if rtu == 9:
            sys.exit()
        if rtu:
            removeOldSign()
            framework = os.uname().machine
            if framework == "x86_64":
                if download("jd_sign-linux-amd64.tar.gz"):
                    os.system('tar xvf jd_sign-linux-amd64.tar.gz')
                    os.system('rm -rf jd_sign-linux-amd64.tar.gz')
                    return True
            elif framework == "aarch64" or framework == "arm64":
                check_ld_libc()
                if download("jd_sign-linux-arm64.tar.gz"):
                    os.system('tar xvf jd_sign-linux-arm64.tar.gz')
                    os.system('rm -rf jd_sign-linux-arm64.tar.gz')
                    return True
            elif framework == "armv7l":
                check_ld_libc()
                if download("jd_sign-linux-arm.tar.gz"):
                    os.system('tar xvf jd_sign-linux-arm.tar.gz')
                    os.system('rm -rf jd_sign-linux-arm.tar.gz')
                    return True
            else:
                if download("jd_sign-linux-amd64.tar.gz"):
                    os.system('tar xvf jd_sign-linux-amd64.tar.gz')
                    os.system('rm -rf jd_sign-linux-amd64.tar.gz')
                    return True

def check_ld_libc():
    """
    检测是否存在ld-linux-aarch64.so.1、libc.musl-aarch64.so.1动态依赖文件
    """
    if "ld-linux-aarch64.so.1" in (os.listdir('/lib')):
        print("已存在arm64-ld依赖")
        pass
    else:
        if download("ld-linux-aarch64.tar.gz"):
            os.system('tar xvf ld-linux-aarch64.tar.gz')
            os.system('cp ld-linux-aarch64.so.1 /lib')
            if "ld-linux-aarch64.so.1" in (os.listdir('/lib')):
                print("arm64-ld依赖安装完成~")
                os.system('rm -rf ld-linux-aarch64.tar.gz')
                os.system('rm -rf ld-linux-aarch64.so.1')
            else:
                print("arm64-ld依赖安装失败,网络连接失败，请按依赖教程自行下载依赖文件")
    if "libc.musl-aarch64.so.1" in (os.listdir('/lib')):
        print("已存在arm64-libc依赖")
        pass
    else:
        if download("libc.musl-aarch64.tar.gz"):
            os.system('tar xvf libc.musl-aarch64.tar.gz')
            os.system('cp libc.musl-aarch64.so.1 /lib')
            if "libc.musl-aarch64.so.1" in (os.listdir('/lib')):
                print("arm64-libc依赖安装完成~")
                os.system('rm -rf libc.musl-aarch64.tar.gz')
                os.system('rm -rf libc.musl-aarch64.so.1')
            else:
                print("arm64-libc依赖安装失败,网络连接失败，请按依赖教程自行下载依赖文件")

def download(systemFile):
    raw_url = f"https://git.metauniverse-cn.com/https://raw.githubusercontent.com/shufflewzc/faker2/main/utils/{systemFile}"
    try:
        fileList = os.listdir()
        if systemFile in fileList:
            os.remove(systemFile)
    except:
        print(f"删除{fileList}失败")
    try:
        try:
            import wget
        except ImportError as e:
            print(e)
            if "No module" in str(e):
                os.system("pip install wget")
            import wget
        wget.download(raw_url)
        print(f"{systemFile}下载成功")
        return True
    except Exception as e:
        print(e)
        print(f"{systemFile}下载失败")
        return False

def removeOldSign():
    fileList = os.listdir()
    if "jd_sign.so" in fileList:
        try:
            os.remove("jd_sign.so")
            print("成功删除历史jd_sign依赖文件")
        except:
            pass
    elif "jd_sign_x86.so" in fileList:
        try:
            os.remove("jd_sign_x86.so")
            print("成功删除历史jd_sign依赖文件")
        except:
            pass
    elif "jd_sign_arm64.so" in fileList:
        try:
            os.remove("jd_sign_arm64.so")
            print("成功删除历史jd_sign依赖文件")
        except:
            pass

def repoTreeUpdate():
    """
    判断utils内的主要文件是否更新(sha值是否变化)
    """
    GitAPI = 'https://api.github.com/repos/shufflewzc/faker2/git/trees/main'
    try:
        session = requests.session()
        headers = {"Content-Type": "application/json"}
        res = session.get(url=GitAPI, headers=headers, timeout=20)
        if res.status_code == 200:
            for x in res.json()["tree"]:
                if "utils" == x["path"]:
                    new_sha = x["sha"]
                    print(new_sha)
            # 获取上一次检查所记录的sha值
            try:
                with open('repoUpdate.log', "r") as f0:
                    last_sha = f0.read()
            except Exception as e:
                # print(e)
                # 以log格式写入文件
                with open("repoUpdate.log", "w") as f1:
                    f1.write('')
            with open("repoUpdate.log", "w") as f2:
                f2.write(new_sha)
            if new_sha != last_sha:
                print("检测到依赖版本有更新,自动更新...")
                print("*" * 30)
                return True
            else:
                print("检测到依赖版本无更新")
                try:
                    from jd_sign import remote_redis
                    result = remote_redis(export_name="Test01", db_index=15)
                    print(result)
                    print("依赖正常,退出程序")
                    return 9
                except:
                    print("依赖不正常,自动修复中...")
                    print("*" * 30)
                    return True
        else:
            print(f'请求失败：{GitAPI}')
            if "message" in res.json():
                print(f'错误信息：{res.json()["message"]}')
            return False
    except:
        print(f'请求URL失败：{GitAPI}')
        return False

def main():
    updateDependent()
    try:
        from jd_sign import remote_redis
        result = remote_redis(export_name="Test01", db_index=15)
        print(result)
        if result:
            print("依赖安装/更新完成")
    except:
        print("依赖安装/更新失败,网络连接失败，请按依赖教程自行下载依赖文件")

if __name__ == '__main__':
    main()


