import json
import re
import sys
import os


class Depend:
    @staticmethod
    def get_ql_path():
        if re.search('/ql/data/', sys.path[0]):
            return '/ql/data/'
        else:
            return '/ql/'

    @staticmethod
    def get_env(env, default=None):
        """
            青龙环境变量读取，支持将整数，bool类型变量转化为正常的值
            Args:
                env: 字符串，被读取的青龙环境变量
                default: 字符串，如果找不到这个环境变量，返回的默认变量
            Returns:
                result  被格式化的变量
            """
        if env in os.environ and os.environ[env]:
            if os.environ[env] in ["True", "False"]:
                return False if os.environ[env] == "False" else True
            elif os.environ[env].isdigit():
                return int(os.environ[env])
            else:
                return os.environ[env]
        else:
            if default:
                if default in ["True", "False"]:
                    return False if default == "False" else True
                elif default.isdigit():
                    return int(default)
                else:
                    return default
            else:
                return None

    @staticmethod
    def str2list(string):
        if string and string != "":
            if re.search(",", string):
                return string.split(",")
            else:
                return [string]
        else:
            return []

    @staticmethod
    def not2append(addlist, appended):
        for i in addlist:
            if i not in appended:
                appended.append(i)
        return appended

    @staticmethod
    def re_filter_list(string, filter_list):
        for i in filter_list:
            if re.search(i, string):
                return True
        return False

    def only_check(self, pyname, pyabspath,osenv=None):
        only_path = self.get_ql_path() + pyname + '_by_keven1024'
        result = "☺当前脚本目录为: " + str(pyabspath) + "\n"
        j_data = {
            "py_path": None
        }
        if osenv and self.get_env(osenv):
            result += "😏检测到环境变量：" + str(osenv) + " = " + self.get_env(osenv) + " 将按照该路径为准\n"
            pyabspath = self.get_env(osenv)
        if os.path.exists(only_path):
            with open(only_path, 'r+') as f:
                py_data = f.read(2097152)
                if py_data == pyabspath:
                    # 对旧版转换为json格式
                    j_data["py_path"] = pyabspath
                    f.seek(0, os.SEEK_SET)
                    result += "😏检测到旧版检测文件，自动转换新版\n"
                    f.writelines(json.dumps(j_data))
                try:
                    j_data = json.loads(py_data)
                except:
                    pass
                if j_data["py_path"] and j_data["py_path"] == pyabspath:
                    result += "😁脚本唯一性检测通过，继续运行!\n"
                else:
                    result += "🙄检测到其他同类型的青龙日志分析脚本存在，拒绝运行!\n"
                    load_send()
                    send(pyname, result)
                    exit(0)
        else:
            with open(only_path, "w") as f:
                j_data["py_path"] = pyabspath
                f.writelines(json.dumps(j_data))
                result += "🙄检测到第一次运行，已写入唯一性检测文件，如无特殊情况请勿删除\n"
        return result


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
