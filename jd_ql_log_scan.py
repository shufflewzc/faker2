import json
import os
import re
import time
import sys
import subprocess
import traceback
from depend import Depend

'''
cron: 30 23 * * *
new Env('青龙日志分析 && 自动补全依赖');
########环境变量设置#########

## (非必填) 脚本唯一性检测，请在此处填写你想运行的脚本的绝对路径，其他脚本检测到路径与此变量不符将会停止运行
QL_LOG_SCAN_SCRIPT_PATH=

## (非必填)指定日志目录: 默认自动识别青龙目录，出现错误才需要手动指定日志目录
export QL_LOG_PATH="/ql/data/log/"

## (非必填)指定不扫描目录：多个请用逗号隔开
export QL_LOG_BLACK_DIR=""

## (非必填)指定不扫描日志文件：多个请用逗号隔开
export QL_LOG_BLACK_FILE=""

## (非必填)需要被扫描的最近n天的日志，0就是只分析当天的日志(最近24小时的日志)
export QL_LOG_SCAN_DEEPIN=0

## (非必填)是否尝试自动补齐日志报错里提示的依赖
export QL_LOG_AUTO_INSTALL_DEPEND=False

## (非必填)强制指定npm包管理器，有些青龙使用了pnpm而不是npm，注意鉴别
export QL_LOG_NPM="npm"
'''


class QlLogScan(Depend):
    def __init__(self):
        self.pyname = os.path.basename(__file__).replace(".py", "")
        print(self.only_check(self.pyname, os.path.abspath(__file__),"QL_LOG_SCAN_SCRIPT_PATH"))
        self.ql_log_path = self.get_env("QL_LOG_PATH", self.get_ql_path() + "log/")
        self.filter_dir_list = self.not2append(["^\.tmp$", "^update$", self.pyname + "$"],
                                               self.str2list(self.get_env("QL_LOG_BLACK_DIR")))
        self.filter_log_list = self.not2append(['task_error\.log', 'start\.log'],
                                               self.str2list(self.get_env("QL_LOG_BLACK_FILE")))
        self.history_scan_deepin = self.get_env("QL_LOG_SCAN_DEEPIN", "0")
        self.auto_install_depend = self.get_env("QL_LOG_AUTO_INSTALL_DEPEND", False)
        self.npm = self.get_env("QL_LOG_NPM", "npm")
        self.log_stat = {
            "all": 0,
            "nodejs_err": 0,
            "python_err": 0,
            "err_dict": {},
            "nodejs_depend": [],
            "python_depend": [],
            "readlog_err" :[]
        }
        self.LogNameHeadList = self.generateLogNameHeadList()
        self.analysisLog()
        self.showAnalysisLog()
        if self.auto_install_depend:
            self.auto_depend()

    def generateLogNameHeadList(self):
        scan_list = []
        for i in range((self.history_scan_deepin + 1) * 24):
            scan_list.append(time.strftime("%Y-%m-%d-%H", time.localtime((int(time.time()) - (3600 * i)))))
        return scan_list

    def analysisLog(self):
        for path, dir_list, file_list in os.walk(self.ql_log_path):
            dir_name = path.replace(self.ql_log_path, "")
            if not self.re_filter_list(dir_name, self.filter_dir_list):
                for file_name in file_list:
                    if not self.re_filter_list(file_name, self.filter_log_list) and re.search(r"(.*?).log$",
                                                                                              file_name) and file_name[
                                                                                                             :13] in self.LogNameHeadList:
                        # 读取日志
                        log_file = open(os.path.join(path, file_name), "r")
                        try:
                            log_text = log_file.read(2097152)
                            log_file.close()
                            # 分析日志
                            nodejs_err_list = re.findall(r"Error\:(.*\s?)Require stack\:", log_text)
                            python_err_list = re.findall(
                                r"Traceback \(most recent call last\):([\n\s]+File[\s\S]*?, line [\d]+, in[\s\S]*?["
                                r"\s\S]*?\n[\s\S]*?\n)+(.*?)\n",
                            log_text)
                            if nodejs_err_list:
                                self.log_stat["nodejs_err"] += len(nodejs_err_list)
                                self.log_stat["err_dict"][dir_name] = []
                                for i in nodejs_err_list:
                                    v = i.strip()
                                    self.log_stat["err_dict"][dir_name].append({"type": "NodeJs", "log": v})
                                    # 依赖缺失判断
                                    miss_depend = re.search(r"Cannot find module '([a-zA-Z\d_-]+)'", v)
                                    if miss_depend and miss_depend.group(1) not in self.log_stat["nodejs_depend"]:
                                        self.log_stat["nodejs_depend"].append(miss_depend.group(1))
                            elif python_err_list:
                                self.log_stat["python_err"] += len(python_err_list)
                                self.log_stat["err_dict"][dir_name] = []
                                for i in python_err_list:
                                    v = i[-1].strip()
                                    self.log_stat["err_dict"][dir_name].append({"type": "Python", "log": v})
                                    # 依赖缺失判断
                                    miss_depend = re.search(r"ModuleNotFoundError: No module named \'([a-zA-Z0-9_-]+)\'", v)
                                    if miss_depend and miss_depend.group(1) not in self.log_stat["python_depend"]:
                                        self.log_stat["python_depend"].append(miss_depend.group(1))
                            self.log_stat["all"] += 1
                        except Exception as e:
                            err_log = "读取日志" + str(os.path.join(path, file_name)) + "出现异常: " + str(e) + "\n"
                            self.log_stat["readlog_err"].append(err_log)
                            print(err_log)


    @staticmethod
    def format_log_date(text):
        text = text.split("-")
        return text[0] + "年" + text[1] + "月" + text[2] + "日" + text[3] + "时"

    def showAnalysisLog(self):
        len_nodejs_depend = len(self.log_stat["nodejs_depend"])
        len_python_depend = len(self.log_stat["python_depend"])
        # 展示分析结果
        result = "📆分析 " + (
            self.format_log_date(self.LogNameHeadList[0]) + " ~ " + self.format_log_date(
                self.LogNameHeadList[-1]) if len(self.LogNameHeadList) != 1 else
            self.LogNameHeadList[
                0]) + " 的日志报告：\n"
        if len(self.log_stat["readlog_err"]) != 0:
            result += "🔍脚本在读取日志过程中，出现了" + str(len(self.log_stat["readlog_err"])) + "个异常，详细信息将在最后展示\n"
        result += "✅正常运行脚本：" + str(self.log_stat["all"]) + " 次\n"
        if self.log_stat["all"] != 0:
            result += "⛔异常运行脚本：" + str(self.log_stat["nodejs_err"] + self.log_stat["python_err"]) + " 次，占比 " + str(
                round(
                    (float(self.log_stat["nodejs_err"] + self.log_stat["python_err"]) / float(
                        self.log_stat["all"]) * 100),
                    2)) + " %\n"
            result += "🧐其中:\n"
            result += "    🕵️‍♂️Nodejs异常：" + str(self.log_stat["nodejs_err"]) + " 次，占比 " + str(
                round((float(self.log_stat["nodejs_err"]) / float(self.log_stat["all"]) * 100), 2)) + " %\n"
            result += "    🕵️‍♂️Python异常：" + str(self.log_stat["python_err"]) + " 次，占比 " + str(
                round((float(self.log_stat["python_err"]) / float(self.log_stat["all"]) * 100), 2)) + " %\n"
        if len_nodejs_depend > 0 or len_python_depend > 0:
            result += "👮‍♂️依赖检测: " + (
                "☢已开启自动补全依赖,将执行shell命令,请小心恶意脚本👿" if self.auto_install_depend else "❎未开启自动补全依赖，请手动补齐以下依赖🤗") + "\n"
            if len_nodejs_depend > 0:
                result += "👮‍♂️检测到缺失NodeJs依赖:\n"
                result += str(self.log_stat["nodejs_depend"]) + "\n"
            if len_python_depend > 0:
                result += "👮‍♂️检测到缺失Python依赖:\n"
                result += str(self.log_stat["python_depend"]) + "\n"
        result += "💂‍♂️详细错误日志：\n\n"

        for k, v in self.log_stat["err_dict"].items():
            if v:
                result += "🛑脚本：" + k + "：\n"
                for i in v:
                    result += "- ⚠" + i["type"] + "错误：" + i["log"] + " \n\n\n"
        if len(self.log_stat["readlog_err"]) != 0:
            result += "👷‍♀️读取日志异常日志：\n\n"
            for i in self.log_stat["readlog_err"]:
                result += "⚠" + i + "\n"
        send("🐲青龙日志分析", result)
        return result

    def auto_depend(self):
        len_nodejs_depend = len(self.log_stat["nodejs_depend"])
        len_python_depend = len(self.log_stat["python_depend"])
        len_all_depend = len_nodejs_depend + len_python_depend
        if len_nodejs_depend > 0:
            for i in range(len_nodejs_depend):
                shell_log = "🤖检测是否安装NodeJs依赖: " + self.log_stat["nodejs_depend"][i] + "\n"
                check_result = self.check_depend(self.log_stat["nodejs_depend"][i], "nodejs")
                if check_result:
                    shell_log += "📦" + str(check_result) + "已安装, 跳过安装\n"
                else:
                    shell_log += "⚙当前正在自动安装NodeJs依赖: " + self.log_stat["nodejs_depend"][i] + "\n"
                    install_result = self.install_depend(self.log_stat["nodejs_depend"][i], "nodejs")
                    shell_log += "🔨执行命令: " + install_result[0] + "\n"
                    if install_result[2] != '':
                        shell_log += "⛔出错了: \n" + install_result[2] + "\n\n"
                    elif install_result[1] != '':
                        shell_log += "✅执行完成: \n" + install_result[1] + "\n\n"
                    send("🐲青龙自动安装依赖(" + str(i + 1) + "/" + str(len_all_depend) + ")", shell_log)
        if len_python_depend > 0:
            for i in range(len_python_depend):
                shell_log = "🤖检测是否安装Python依赖: " + self.log_stat["python_depend"][i] + "\n"
                check_result = self.check_depend(self.log_stat["python_depend"][i], "python")
                if check_result:
                    shell_log += "📦" + str(check_result) + "已安装, 跳过安装\n"
                else:
                    shell_log += "⚙当前正在自动安装Python依赖: " + self.log_stat["python_depend"][i] + "\n"
                    install_result = self.install_depend(self.log_stat["python_depend"][i], "python")
                    shell_log += "🔨执行命令: " + install_result[0] + "\n"
                    if install_result[2] != '':
                        shell_log += "⛔出错了: \n" + install_result[2] + "\n\n"
                    elif install_result[1] != '':
                        shell_log += "✅执行完成: \n" + install_result[1] + "\n\n"
                    send("🐲青龙自动安装依赖(" + str(i + 1 + len_nodejs_depend) + "/" + str(len_all_depend) + ")", shell_log)

    def install_depend(self, package, package_type):
        package = package.replace("+", "\+")
        if package_type == "nodejs":
            install_exec = 'cd /ql/ && ' + self.npm + ' install ' + package
        elif package_type == "python":
            install_exec = 'pip3 install ' + package
        elif package_type == "docker":
            install_exec = 'apk update && apk add ' + package

        if install_exec:
            install = subprocess.run(install_exec, shell=True, capture_output=True, text=True)
            install_log = install.stdout
            install_err = install.stderr
            return install_exec, install_log, install_err
        else:
            return None

    def check_depend(self, package, package_type):
        package = package.replace("+", "\+")
        if package_type == "nodejs":
            list_exec = 'cd /ql/ && ' + self.npm + ' list|grep ' + package
            list_log = subprocess.run(list_exec, shell=True, capture_output=True, text=True).stdout
            npm_re = re.search(r"[\s]" + package + "@[\d.]+", list_log)
            pnpm_re = re.search(r"^" + package + " [\d.]+", list_log)
            if npm_re:
                return npm_re.group()
            elif pnpm_re:
                return pnpm_re.group()
            else:
                return None
        elif package_type == "python":
            list_exec = 'pip3 list|grep ' + package
            list_log = subprocess.run(list_exec, shell=True, capture_output=True, text=True).stdout
            pip_re = re.search(package + "[ ]+[\d.]+", list_log)
            if pip_re:
                return pip_re.group()
            else:
                return None
        elif package_type == "docker":
            list_exec = 'apk list|grep ' + package
            list_log = subprocess.run(list_exec, shell=True, capture_output=True, text=True).stdout
            docker_re = re.search(package + "-[\d.]+", list_log)
            if docker_re:
                return docker_re.group()
            else:
                return None
        else:
            return None


def load_send():
    global send
    cur_path = os.path.abspath(os.path.dirname(__file__))
    sys.path.append(cur_path)
    if os.path.exists(cur_path + "/notify.py"):
        try:
            from notify import send
        except:
            send = False
            print("加载通知服务失败~")
    else:
        send = False
        print("加载通知服务失败~")


if __name__ == '__main__':
    load_send()
    ql = QlLogScan()
