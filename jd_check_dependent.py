#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
File: jd_check_sign.py(Harbour库依赖一键检测安装)
Author: HarbourJ
Date: 2022/8/12 20:37
TG: https://t.me/HarbourToulu
cron: 1 1 1 1 1 *
new Env('Faker库依赖一键安装');
Description:1.HarbourToulu库jd_sign本地算法依赖一键检测安装脚本;
            2.自动识别机器系统/架构,拉取最新依赖文件;
            3.本地sign算法已编译支持Windows(amd64)、Linux(amd64/arm64/arm)、Macos(x86_64)系统/架构;
            4.默认支持python3版本为3.8-3.10,过低可能会报错;
            5.若本一键配置脚本无法安装所需jd_sign依赖文件,请前往https://github.com/HarbourJ/HarbourToulu/releases自行下载系统对应的jd_sign依赖压缩文件,解压并放置/scripts/HarbourJ_HarbourToulu_main文件夹内即可。
            6.‼️‼️‼️初次拉库必须先运行本脚本‼️‼️‼️
"""
import sys, time
import requests, os, platform
from functools import partial
print = partial(print, flush=True)


def updateDependent():
    """
    更新依赖的主函数
    """
    system = platform.system().lower()
    PyVersion_ = platform.python_version()
    PyVersion = ''.join(PyVersion_.split('.')[:2])
    if int(PyVersion) > 310:
        print(f"✅识别本机设备Py版本为{PyVersion_},版本太高暂不支持,可退回青龙2.11.3版本!\n")
        sys.exit()
    if system == "windows":
        fileName = f"jd_sign-win-amd64-py{PyVersion}.zip"
        print(f"✅识别本机设备为Windows amd64,Py版本为{PyVersion_}\n")
        rtu = signReleaseUpdate()
        if rtu == 9:
            sys.exit()
        if rtu:
            removeOldSign()
            if download(rtu, fileName):
                import zipfile
                f = zipfile.ZipFile(fileName, 'r')
                for file in f.namelist():
                    f.extract(file, os.getcwd())
                f.close()
                return True
    elif system == "darwin":
        fileName = f"jd_sign-darwin-x86_64-py{PyVersion}.tar.gz"
        print(f"✅识别本机设备为MacOS x86_64,Py版本为{PyVersion_}\n")
        rtu = signReleaseUpdate()
        if rtu == 9:
            sys.exit()
        if rtu:
            removeOldSign()
            if download(rtu, fileName):
                os.system(f'tar xvf {fileName}')
                os.system(f'rm -rf {fileName}')
                return True
    else:
        rtu = signReleaseUpdate()
        if rtu == 9:
            sys.exit()
        if rtu:
            removeOldSign()
            framework = os.uname().machine
            if framework == "x86_64":
                fileName = f"jd_sign-linux-amd64-py{PyVersion}.tar.gz"
                print(f"✅识别本机设备为Linux {framework},Py版本为{PyVersion_}\n")
                if download(rtu, fileName):
                    os.system(f'tar xvf {fileName}')
                    os.system(f'rm -rf {fileName}')
                    return True
            elif framework == "aarch64" or framework == "arm64":
                fileName = f"jd_sign-linux-arm64-py{PyVersion}.tar.gz"
                print(f"✅识别本机设备为Linux {framework},Py版本为{PyVersion_}\n")
                check_ld_libc(rtu)
                if download(rtu, fileName):
                    os.system(f'tar xvf {fileName}')
                    os.system(f'rm -rf {fileName}')
                    return True
            elif framework == "armv7l":
                fileName = f"jd_sign-linux-arm-py{PyVersion}.tar.gz"
                print(f"✅识别本机设备为Linux {framework},Py版本为{PyVersion_}\n")
                check_ld_libc(rtu)
                if download(rtu, fileName):
                    os.system(f'tar xvf {fileName}')
                    os.system(f'rm -rf {fileName}')
                    return True
            else:
                fileName = f"jd_sign-linux-amd64-py{PyVersion}.tar.gz"
                print(f"⚠️无法识别本机设备操作系统,默认本机设备为Linux x86_64,Py版本为{PyVersion_}\n")
                if download(rtu, fileName):
                    os.system(f'tar xvf {fileName}')
                    os.system(f'rm -rf {fileName}')
                    return True

def check_ld_libc(version):
    """
    检测是否存在ld-linux-aarch64.so.1、libc.musl-aarch64.so.1动态依赖文件
    """
    if "ld-linux-aarch64.so.1" in (os.listdir('/lib')):
        print("🗣已存在arm64-ld依赖\n")
        pass
    else:
        if download(version, "ld-linux-aarch64.tar.gz"):
            os.system('tar xvf ld-linux-aarch64.tar.gz')
            os.system('cp ld-linux-aarch64.so.1 /lib')
            if "ld-linux-aarch64.so.1" in (os.listdir('/lib')):
                print("✅arm64-ld依赖安装完成~\n")
                os.system('rm -rf ld-linux-aarch64.tar.gz')
                os.system('rm -rf ld-linux-aarch64.so.1')
            else:
                print("❌arm64-ld依赖安装失败,请前往Faker TG群查看安装教程\n")
    if "libc.musl-aarch64.so.1" in (os.listdir('/lib')):
        print("🗣已存在arm64-libc依赖\n")
        pass
    else:
        if download(version, "libc.musl-aarch64.tar.gz"):
            os.system('tar xvf libc.musl-aarch64.tar.gz')
            os.system('cp libc.musl-aarch64.so.1 /lib')
            if "libc.musl-aarch64.so.1" in (os.listdir('/lib')):
                print("✅arm64-libc依赖安装完成~\n")
                os.system('rm -rf libc.musl-aarch64.tar.gz')
                os.system('rm -rf libc.musl-aarch64.so.1')
            else:
                print("❌arm64-libc依赖安装失败,请前往Faker TG群查看安装教程\n")

def download(version, systemFile, gitproxy="", again=1):
    raw_url = f"{gitproxy}https://github.com/HarbourJ/HarbourToulu/releases/download/{version}/{systemFile}"
    try:
        fileList = os.listdir()
        if systemFile in fileList:
            os.remove(systemFile)
    except:
        print(f"❌删除{fileList}失败\n")
    try:
        try:
            import wget
        except ImportError as e:
            print(e)
            if "No module" in str(e):
                os.system("pip install wget")
            import wget
        wget.download(raw_url)
        print(f"✅{systemFile}下载成功\n")
        return True
    except Exception as e:
        print(f"‼️download Error: {str(e)}")
        if again > 5:
            print(f"❌{systemFile}下载失败\n")
            return False
        else:
            print(f"开始第{again}次重试获取{systemFile}")
            again = again + 1
            if again == 2:
                gitproxy = "https://ghproxy.com/"
            elif again == 3:
                gitproxy = "https://kgithub.com/"
            elif again == 4:
                gitproxy = "https://hub.gitmirror.com/"
            time.sleep(1)
            return download(version, systemFile, gitproxy=gitproxy, again=again)

def removeOldSign():
    fileList = os.listdir()
    if "jd_sign.so" in fileList:
        try:
            os.remove("jd_sign.so")
            print("✅成功删除历史jd_sign依赖文件\n")
        except:
            pass
    elif "jd_sign_x86.so" in fileList:
        try:
            os.remove("jd_sign_x86.so")
            print("✅成功删除历史jd_sign依赖文件\n")
        except:
            pass
    elif "jd_sign_arm64.so" in fileList:
        try:
            os.remove("jd_sign_arm64.so")
            print("✅成功删除历史jd_sign依赖文件\n")
        except:
            pass

def signReleaseUpdate(rawproxy="https://raw.githubusercontent.com/", again=1):
    """
    判断Release内的主要文件是否更新(判断utils内版本更新log文件-signUpdateLog.log)
    """
    GitAPI = f"{rawproxy}HarbourJ/HarbourToulu/main/utils/signUpdateLog.log"
    try:
        headers = {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'zh-CN,zh;q=0.9',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
        }
        response = requests.request("GET", url=GitAPI, headers=headers, timeout=20)
    except Exception as e:
        print(f"‼️signReleaseUpdate Error: {str(e)}")
        if again > 5:
            print(f"❌{GitAPI}请求失败\n")
            return False
        else:
            print(f"开始第{again}次重试获取signUpdateLog.log")
            again = again + 1
            if again == 2:
                rawproxy = "https://raw.iqiq.io/"
            elif again == 3:
                rawproxy = "https://raw.kgithub.com/"
            elif again == 4:
                rawproxy = "https://github.moeyy.xyz/https://raw.githubusercontent.com/"
            time.sleep(1)
            return signReleaseUpdate(rawproxy=rawproxy, again=again)
    if response.status_code == 200:
        res = response.text.split('\n')
        print(f'📝最新sign为 {res[-1]}版本\n')
        new_version = res[-1].split(' v')[-1]
        # 获取上一次检查所记录的version值
        try:
            with open('signUpdate.log', "r") as f0:
                last_version = f0.read()
        except Exception as e:
            # print(e)
            # 以log格式写入文件
            with open("signUpdate.log", "w") as f1:
                f1.write('')
                last_version = ''
        with open("signUpdate.log", "w") as f2:
            f2.write(new_version)
        if new_version != last_version:
            print("⏰检测到依赖版本有更新,自动更新...\n")
            return new_version
        else:
            print("📝检测到依赖版本无更新\n")
            try:
                from jd_sign import remote_redis
                result = remote_redis(export_name="Test01", db_index=15)
                print(f'🎉{result}\n')
                print("✅依赖正常,退出程序")
                return 9
            except:
                print("⏰依赖不正常,自动修复中...\n")
                return new_version
    else:
        print(f'❌请求失败：{GitAPI}\n')
        print(f'❌错误信息：{response.txt}\n')
        return False

def main():
    print("🤖开始运行Faker库依赖一键检测安装脚本\n")
    updateDependent()
    try:
        from jd_sign import remote_redis
        result = remote_redis(export_name="Test01", db_index=15)
        print(f'🎉{result}\n')
        if result:
            print("✅依赖安装/更新完成")
    except:
        print("‼️依赖安装/更新失败,请前往Faker TG群查看安装教程")

if __name__ == '__main__':
    main()


