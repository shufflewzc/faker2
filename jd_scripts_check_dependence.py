# -*- coding:utf-8 -*-
# 作者仓库:https://jihulab.com/spiritlhl/qinglong_auto_tools.git
# 觉得不错麻烦点个star谢谢
# 频道：https://t.me/qinglong_auto_tools


'''
cron: 1
new Env('单容器 二叉树修复脚本依赖文件');
'''

import os, requests
import os.path
import time

# from os import popen

# 版本号 2.10.9 ，其他环境自测
# 只修复依赖文件（jdCookie.js那种）！！不修复环境依赖（pip install aiohttp）！！
# 默认不做任何操作只查询依赖脚本存在与否，有需求请在配置文件中配置对应变量进行操作，更新不会增加缺失文件
# 如果你有发现更多的脚本依赖文件没有新增，欢迎提交issues到https://jihulab.com/spiritlhl/dependence_scripts
# 增加缺失依赖文件(推荐)
# export ec_fix_dep="true"
# 更新老旧依赖文件(慎填，默认的依赖我使用的魔改版本，非必要别选)
# export ec_ref_dep="true"

# 2021.11.27 支持新版本仓库拉取的脚本目录结构，针对各个仓库进行依赖检索

txtx = "青龙配置文件中的config中填写下列变量启用对应功能\n\n增加缺失依赖文件(推荐)\n填写export ec_fix_dep=\"true\"\n更新老旧依赖文件(日常使用别填，默认的依赖我使用的魔改版本，非必要别选)\n如果选择使用请使用对应code文件等相关文件：https://jihulab.com/spiritlhl/dependence_config \n填写export ec_ref_dep=\"true\"\n"
print(txtx)

try:
    if os.environ["ec_fix_dep"] == "true":
        print("已配置依赖文件缺失修复\n")
        fix = 1
    else:
        fix = 0
except:
    fix = 0
    print("#默认不修复缺失依赖文件，有需求")
    print("#请在配置文件中配置\nexport ec_fix_dep=\"true\" \n#开启脚本依赖文件缺失修复\n")

try:
    if os.environ["ec_ref_dep"] == "true":
        print("已配置依赖文件老旧更新\n")
        ref = 1
    else:
        ref = 0
except:
    ref = 0
    print("#默认不更新老旧依赖文件，有需求")
    print("#请在配置文件中配置\nexport ec_re_dep=\"true\" #开启脚本依赖文件更新\n")


def traversalDir_FirstDir(path):
    list = []
    if (os.path.exists(path)):
        files = os.listdir(path)
        for file in files:
            m = os.path.join(path, file)
            if (os.path.isdir(m)):
                h = os.path.split(m)
                list.append(h[1])
        print("文件夹名字有：")
        print(list)
        return list


def check_dependence(file_path):
    try:
        res = requests.get("https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/contents.json").json()
    except:
        print("网络波动，稍后尝试")
        time.sleep(5)
        try:
            res = requests.get("https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/contents.json").json()
        except:
            print("网络问题无法获取仓库文件列表，终止检索")
            return

    dependence_scripts_name = []
    for i in res:
        dependence_scripts_name.append(i["name"])

    if "db" in os.listdir("../"):
        dir_list = os.listdir(file_path)
    else:
        dir_list = os.listdir("." + file_path)

    # 查询
    for i in dependence_scripts_name:
        if i not in dir_list and i != "utils" and i != "function":
            print("缺失文件 {}{}".format(file_path, i))
            # 修补
            try:
                if fix == 1:
                    print("增加文件 {}{}".format(file_path, i))
                    r = requests.get(
                        "https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/" + i).text
                    if "db" in os.listdir("../"):
                        with open(file_path + i, "w", encoding="utf-8") as fe:
                            fe.write(r)
                    else:
                        with open("." + file_path + i, "w", encoding="utf-8") as fe:
                            fe.write(r)
            except:
                temp = 1

    try:
        if temp == 1:
            print("未配置ec_fix_dep，默认不修复增加缺失的依赖文件")
    except:
        pass

    # 更新
    try:
        if ref == 1:
            for i in dependence_scripts_name:
                if i != "utils" and i != "function":
                    if "db" in os.listdir("../"):
                        with open(i, "r", encoding="utf-8") as f:
                            r = requests.get(
                                "https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/" + i).text
                            d = f.read()
                            if r == d:
                                print("无需修改 {}".format(i))
                            else:
                                print("更新文件 {}".format(i))
                                with open(file_path + i, "w", encoding="utf-8") as fe:
                                    fe.write(r)
                    else:
                        with open(i, "r", encoding="utf-8") as f:
                            r = requests.get(
                                "https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/" + i).text
                            d = f.read()
                            if r == d:
                                print("无需修改 {}".format(i))
                            else:
                                print("更新文件 {}".format(i))
                                with open("." + file_path + i, "w", encoding="utf-8") as fe:
                                    fe.write(r)

    except:
        print("未配置ec_ref_dep，默认不更新依赖文件")

    #########################################################################################################

    # utils

    try:
        res = requests.get("https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/utils.json").json()
    except:
        print("网络波动，稍后尝试")
        time.sleep(5)
        try:
            res = requests.get("https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/utils.json").json()
        except:
            print("网络问题无法获取仓库文件列表，终止检索")
            return

    dependence_scripts_utils = []
    for i in res:
        dependence_scripts_utils.append(i["name"])

    try:
        if "db" in os.listdir("../"):
            utils_list = os.listdir(file_path + "utils")
        else:
            utils_list = os.listdir("." + file_path + "utils")
    except:
        if "db" in os.listdir("../"):
            os.makedirs(file_path + "utils")
            utils_list = os.listdir(file_path + "utils")
        else:
            os.makedirs("." + file_path + "utils")
            utils_list = os.listdir("." + file_path + "utils")

    # 查询
    for i in dependence_scripts_utils:
        if i not in utils_list and i != "utils" and i != "function":
            print("缺失文件 {}utils/{}".format(file_path, i))
            # 修补
            try:
                if fix == 1:
                    print("增加文件 {}utils/{}".format(file_path, i))
                    r = requests.get(
                        "https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/utils/" + i).text
                    if "db" in os.listdir("../"):
                        with open(file_path + "utils/" + i, "w", encoding="utf-8") as fe:
                            fe.write(r)
                    else:
                        with open("." + file_path + "utils/" + i, "w", encoding="utf-8") as fe:
                            fe.write(r)
            except:
                temp = 1

    try:
        if temp == 1:
            print("未配置ec_fix_dep，默认不修复增加缺失的依赖文件")
    except:
        pass

    # 更新
    try:
        if ref == 1:
            for i in dependence_scripts_utils:
                if i != "utils" and i != "function":
                    if "db" in os.listdir("../"):
                        with open(file_path + "utils/" + i, "r", encoding="utf-8") as f:
                            r = requests.get(
                                "https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/utils/" + i).text
                            d = f.read()
                            if r == d:
                                print("已存在文件 {}utils/{}".format(file_path, i))
                            else:
                                print("更新文件 {}utils/{}".format(file_path, i))
                                with open(file_path + "utils/" + i, "w", encoding="utf-8") as fe:
                                    fe.write(r)
                    else:
                        with open("." + file_path + "utils/" + i, "r", encoding="utf-8") as f:
                            r = requests.get(
                                "https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/utils/" + i).text
                            d = f.read()
                            if r == d:
                                print("已存在文件 {}utils/{}".format(file_path, i))
                            else:
                                print("更新文件 {}utils/{}".format(file_path, i))
                                with open("." + file_path + "utils/" + i, "w", encoding="utf-8") as fe:
                                    fe.write(r)
    except:
        print("未配置ec_ref_dep，默认不更新依赖文件")

    ####################################################################################################

    # function

    try:
        res = requests.get("https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/function.json").json()
    except:
        print("网络波动，稍后尝试")
        time.sleep(5)
        try:
            res = requests.get("https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/function.json").json()
        except:
            print("网络问题无法获取仓库文件列表，终止检索")
            return

    dependence_scripts_function = []
    for i in res:
        dependence_scripts_function.append(i["name"])

    try:
        if "db" in os.listdir("../"):
            function_list = os.listdir(file_path + "function")
        else:
            function_list = os.listdir("." + file_path + "function")
    except:
        if "db" in os.listdir("../"):
            os.makedirs(file_path + "function")
            function_list = os.listdir(file_path + "function")
        else:
            os.makedirs("." + file_path + "function")
            function_list = os.listdir("." + file_path + "function")

    # 查询
    for i in dependence_scripts_function:
        if i not in function_list and i != "utils" and i != "function":
            print("缺失文件 {}function/{}".format(file_path, i))
            # 修补
            try:
                if fix == 1:
                    print("增加文件 {}function/{}".format(file_path, i))
                    r = requests.get(
                        "https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/function/" + i).text
                    if "db" in os.listdir("../"):
                        with open(file_path + "function/" + i, "w", encoding="utf-8") as fe:
                            fe.write(r)
                    else:
                        with open("." + file_path + "function/" + i, "w", encoding="utf-8") as fe:
                            fe.write(r)
            except:
                temp = 1

    try:
        if temp == 1:
            print("未配置ec_fix_dep，默认不修复增加缺失的依赖文件")
    except:
        pass

    # 更新
    try:
        if ref == 1:
            for i in dependence_scripts_function:
                if i != "utils" and i != "function":
                    if "db" in os.listdir("../"):
                        with open(file_path + "function/" + i, "r", encoding="utf-8") as f:
                            r = requests.get(
                                "https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/function/" + i).text
                            d = f.read()
                            if r == d:
                                print("已存在文件 {}function/{}".format(file_path, i))
                            else:
                                print("更新文件 {}function/{}".format(file_path, i))
                                with open(file_path + "function/" + i, "w", encoding="utf-8") as fe:
                                    fe.write(r)
                    else:
                        with open("." + file_path + "function/" + i, "r", encoding="utf-8") as f:
                            r = requests.get(
                                "https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/function/" + i).text
                            d = f.read()
                            if r == d:
                                print("已存在文件 {}function/{}".format(file_path, i))
                            else:
                                print("更新文件 {}function/{}".format(file_path, i))
                                with open('.' + file_path + "function/" + i, "w", encoding="utf-8") as fe:
                                    fe.write(r)

    except:
        print("未配置ec_ref_dep，默认不更新依赖文件")


def check_root():
    try:
        res = requests.get("https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/contents.json").json()
    except:
        print("网络波动，稍后尝试")
        time.sleep(5)
        try:
            res = requests.get("https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/contents.json").json()
        except:
            print("网络问题无法获取仓库文件列表，终止检索")
            return

    dependence_scripts_name = []
    for i in res:
        dependence_scripts_name.append(i["name"])

    if "db" in os.listdir("../"):
        dir_list = os.listdir("./")
    else:
        dir_list = os.listdir("../")

    # 查询
    for i in dependence_scripts_name:
        if i not in dir_list and i != "utils" and i != "function":
            print("缺失文件 {}".format(i))
            # 修补
            try:
                if fix == 1:
                    print("增加文件 {}".format(i))
                    r = requests.get(
                        "https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/" + i).text
                    if "db" in os.listdir("../"):
                        with open(i, "w", encoding="utf-8") as fe:
                            fe.write(r)
                    else:
                        with open("../" + i, "w", encoding="utf-8") as fe:
                            fe.write(r)
            except:
                temp = 1

    try:
        if temp == 1:
            print("未配置ec_fix_dep，默认不修复增加缺失的依赖文件")
    except:
        pass

    # 更新
    try:
        if ref == 1:
            for i in dependence_scripts_name:
                if i != "utils" and i != "function":
                    if "db" in os.listdir("../"):
                        with open(i, "r", encoding="utf-8") as f:
                            r = requests.get(
                                "https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/" + i).text
                            d = f.read()
                            if r == d:
                                print("无需修改 {}".format(i))
                            else:
                                print("更新文件 {}".format(i))
                                with open(i, "w", encoding="utf-8") as fe:
                                    fe.write(r)
                    else:
                        with open("../" + i, "r", encoding="utf-8") as f:
                            r = requests.get(
                                "https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/" + i).text
                            d = f.read()
                            if r == d:
                                print("无需修改 {}".format(i))
                            else:
                                print("更新文件 {}".format(i))
                                with open("../" + i, "w", encoding="utf-8") as fe:
                                    fe.write(r)

    except:
        print("未配置ec_ref_dep，默认不更新依赖文件")

    #########################################################################################################

    # utils

    try:
        res = requests.get("https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/utils.json").json()
    except:
        print("网络波动，稍后尝试")
        time.sleep(5)
        try:
            res = requests.get("https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/utils.json").json()
        except:
            print("网络问题无法获取仓库文件列表，终止检索")
            return

    dependence_scripts_utils = []
    for i in res:
        dependence_scripts_utils.append(i["name"])

    try:
        if "db" in os.listdir("../"):
            utils_list = os.listdir("./utils")
        else:
            utils_list = os.listdir("../utils")
    except:
        if "db" in os.listdir("../"):
            os.makedirs("utils")
            utils_list = os.listdir("./utils")
        else:
            os.makedirs("../utils")
            utils_list = os.listdir("../utils")

    # 查询
    for i in dependence_scripts_utils:
        if i not in utils_list and i != "utils" and i != "function":
            print("缺失文件 utils/{}".format(i))
            # 修补
            try:
                if fix == 1:
                    print("增加文件 utils/{}".format(i))
                    r = requests.get(
                        "https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/utils/" + i).text
                    if "db" in os.listdir("../"):
                        with open("./utils/" + i, "w", encoding="utf-8") as fe:
                            fe.write(r)
                    else:
                        with open("../utils/" + i, "w", encoding="utf-8") as fe:
                            fe.write(r)
            except:
                temp = 1

    try:
        if temp == 1:
            print("未配置ec_fix_dep，默认不修复增加缺失的依赖文件")
    except:
        pass

    # 更新
    try:
        if ref == 1:
            for i in dependence_scripts_utils:
                if i != "utils" and i != "function":
                    if "db" in os.listdir("../"):
                        with open("./utils/" + i, "r", encoding="utf-8") as f:
                            r = requests.get(
                                "https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/utils/" + i).text
                            d = f.read()
                            if r == d:
                                print("已存在文件 utils/{}".format(i))
                            else:
                                print("更新文件 utils/{}".format(i))
                                with open("./utils/" + i, "w", encoding="utf-8") as fe:
                                    fe.write(r)
                    else:
                        with open("../utils/" + i, "r", encoding="utf-8") as f:
                            r = requests.get(
                                "https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/utils/" + i).text
                            d = f.read()
                            if r == d:
                                print("已存在文件 utils/{}".format(i))
                            else:
                                print("更新文件 utils/{}".format(i))
                                with open("../utils/" + i, "w", encoding="utf-8") as fe:
                                    fe.write(r)
    except:
        print("未配置ec_ref_dep，默认不更新依赖文件")

    ####################################################################################################

    # function

    try:
        res = requests.get("https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/function.json").json()
    except:
        print("网络波动，稍后尝试")
        time.sleep(5)
        try:
            res = requests.get("https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/function.json").json()
        except:
            print("网络问题无法获取仓库文件列表，终止检索")
            return

    dependence_scripts_function = []
    for i in res:
        dependence_scripts_function.append(i["name"])

    try:
        if "db" in os.listdir("../"):
            function_list = os.listdir("./function")
        else:
            function_list = os.listdir("../function")
    except:
        if "db" in os.listdir("../"):
            os.makedirs("function")
            function_list = os.listdir("./function")
        else:
            os.makedirs("../function")
            function_list = os.listdir("../function")

    # 查询
    for i in dependence_scripts_function:
        if i not in function_list and i != "utils" and i != "function":
            print("缺失文件 function/{}".format(i))
            # 修补
            try:
                if fix == 1:
                    print("增加文件 function/{}".format(i))
                    r = requests.get(
                        "https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/function/" + i).text
                    if "db" in os.listdir("../"):
                        with open("./function/" + i, "w", encoding="utf-8") as fe:
                            fe.write(r)
                    else:
                        with open("../function/" + i, "w", encoding="utf-8") as fe:
                            fe.write(r)
            except:
                temp = 1

    try:
        if temp == 1:
            print("未配置ec_fix_dep，默认不修复增加缺失的依赖文件")
    except:
        pass

    # 更新
    try:
        if ref == 1:
            for i in dependence_scripts_function:
                if i != "utils" and i != "function":
                    if "db" in os.listdir("../"):
                        with open("./function/" + i, "r", encoding="utf-8") as f:
                            r = requests.get(
                                "https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/function/" + i).text
                            d = f.read()
                            if r == d:
                                print("已存在文件 function/{}".format(i))
                            else:
                                print("更新文件 function/{}".format(i))
                                with open("./function/" + i, "w", encoding="utf-8") as fe:
                                    fe.write(r)
                    else:
                        with open("../function/" + i, "r", encoding="utf-8") as f:
                            r = requests.get(
                                "https://jihulab.com/spiritlhl/dependence_scripts/-/raw/master/function/" + i).text
                            d = f.read()
                            if r == d:
                                print("已存在文件 function/{}".format(i))
                            else:
                                print("更新文件 function/{}".format(i))
                                with open("../function/" + i, "w", encoding="utf-8") as fe:
                                    fe.write(r)

    except:
        print("未配置ec_ref_dep，默认不更新依赖文件")


if __name__ == '__main__':

    # 针对青龙拉取仓库后单个仓库单个文件夹的情况对每个文件夹进行检测，不需要可以注释掉  开始到结束的部分

    ### 开始
    if "db" in os.listdir("../"):
        dirs_ls = traversalDir_FirstDir("./")
    else:
        dirs_ls = traversalDir_FirstDir("../")

    # script根目录默认存在的文件夹，放入其中的文件夹不再检索其内依赖完整性
    or_list = ['node_modules', '__pycache__', 'utils', '.pnpm-store', 'function', 'tools', 'backUp', '.git', '.idea', '.github']

    print()
    for i in dirs_ls:
        if i not in or_list:
            file_path = "./" + i + "/"
            print("检测依赖文件是否完整路径  {}".format(file_path))
            check_dependence(file_path)
            print()

    ### 结束

    # 检测根目录，不需要可以注释掉下面这行，旧版本只需要保留下面这行
    check_root()

    print("检测完毕")

    if fix == 1:
        print("修复完毕后脚本无法运行，显示缺依赖文件，大概率库里没有或者依赖文件同名但内容不一样，请另寻他法\n")
        print("修复完毕后缺依赖环境导致的脚本无法运行，这种无法修复，请自行在依赖管理中添加\n")
        print("前者缺文件(如 Error: Cannot find module './utils/magic')，后者缺依赖(如 Error: Cannot find module 'date-fns' )，本脚本只修复前一种")
