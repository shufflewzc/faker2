![Docker Pulls](https://img.shields.io/docker/pulls/lxk0301/jd_scripts?style=for-the-badge)
### Usage
```diff
+ 2021-03-21更新 增加bot交互，spnode指令，功能是否开启自动根据你的配置判断，详见 https://gitee.com/lxk0301/jd_docker/pulls/18
 **bot交互启动前置条件为 配置telegram通知，并且未使用自己代理的 TG_API_HOST** 
 **spnode使用前置条件未启动bot交互**   _（后续可能去掉该限制_ 
 使用bot交互+spnode后 后续用户的cookie维护更新只需要更新logs/cookies.conf即可
 使用bot交互+spnode后 后续执行脚本命令请使用spnode否者无法使用logs/cookies.conf的cookies执行脚本，定时任务也将自动替换为spnode命令执行
 发送/spnode给bot获取可执行脚本的列表，选择对应的按钮执行。(拓展使用：运行指定路径脚本，例：/spnode /scripts/jd_818.js)
 spnode功能概述示例
 spnode conc /scripts/jd_bean_change.js 为每个cookie单独执行jd_bean_change脚本（伪并发
 spnode 1 /scripts/jd_bean_change.js 为logs/cookies.conf文件里面第一行cookie账户单独执行jd_bean_change脚本
 spnode jd_XXXX /scripts/jd_bean_change.js 为logs/cookies.conf文件里面pt_pin=jd_XXXX的cookie账户单独执行jd_bean_change脚本
 spnode /scripts/jd_bean_change.js 为logs/cookies.conf所有cookies账户一起执行jd_bean_change脚本

**请仔细阅读并理解上面的内容，使用bot交互默认开启spnode指令功能功能。** 
+ 2021-03-9更新 新版docker单容器多账号自动互助
+开启方式：docker-compose.yml 中添加环境变量 - ENABLE_AUTO_HELP=true 
+助力原则：不考虑需要被助力次数与提供助力次数  假设有3个账号，则生成： ”助力码1@助力码2@助力码3&助力码1@助力码2@助力码3&助力码1@助力码2@助力码3“
+原理说明：1、定时调用 /scripts/docker/auto_help.sh collect 收集各个活动的助力码，整理、去重、排序、保存到 /scripts/logs/sharecodeCollection.log;
        2、（由于linux进程限制，父进程无法获取子进程环境变量）在每次脚本运行前，在当前进程先调用 /scripts/docker/auto_help.sh export 把助力码注入到环境变量

+ 2021-02-21更新 https://gitee.com/lxk0301/jd_scripts仓库被迫私有，老用户重新更新一下镜像：https://hub.docker.com/r/lxk0301/jd_scripts)(docker-compose.yml的REPO_URL记得修改)后续可同步更新jd_script仓库最新脚本
+ 2021-02-10更新 docker-compose里面,填写环境变量 SHARE_CODE_FILE=/scripts/logs/sharecode.log, 多账号可实现自己互助(只限sharecode.log日志里面几个活动),注:已停用,请使用2021-03-9更新
+ 2021-01-22更新 CUSTOM_LIST_FILE 参数支持远程定时任务列表 (⚠️务必确认列表中的任务在仓库里存在)
+ 例1:配置远程crontab_list.sh, 此处借用 shylocks 大佬的定时任务列表, 本仓库不包含列表中的任务代码, 仅作示范
+ CUSTOM_LIST_FILE=https://raw.githubusercontent.com/shylocks/Loon/main/docker/crontab_list.sh
+
+ 例2:配置docker挂载本地定时任务列表, 用法不变, 注意volumes挂载
+ volumes:
+   - ./my_crontab_list.sh:/scripts/docker/my_crontab_list.sh
+ environment:
+   - CUSTOM_LIST_FILE=my_crontab_list.sh


+ 2021-01-21更新 增加 DO_NOT_RUN_SCRIPTS 参数配置不执行的脚本
+ 例:DO_NOT_RUN_SCRIPTS=jd_family.js&jd_dreamFactory.js&jd_jxnc.js
建议填写完整文件名,不完整的文件名可能导致其他脚本被禁用。
例如：“jd_joy”会匹配到“jd_joy_feedPets”、“jd_joy_reward”、“jd_joy_steal”

+ 2021-01-03更新 增加 CUSTOM_SHELL_FILE 参数配置执行自定义shell脚本
+ 例1:配置远程shell脚本, 我自己写了一个shell脚本https://raw.githubusercontent.com/iouAkira/someDockerfile/master/jd_scripts/shell_script_mod.sh 内容很简单下载惊喜农场并添加定时任务
+ CUSTOM_SHELL_FILE=https://raw.githubusercontent.com/iouAkira/someDockerfile/master/jd_scripts/shell_script_mod.sh
+
+ 例2:配置docker挂载本地自定义shell脚本,/scripts/docker/shell_script_mod.sh 为你在docker-compose.yml里面挂载到容器里面绝对路径
+ CUSTOM_SHELL_FILE=/scripts/docker/shell_script_mod.sh
+
+ tip：如果使用远程自定义，请保证网络畅通或者选择合适的国内仓库，例如有部分人的容器里面就下载不到github的raw文件，那就可以把自己的自定义shell写在gitee上，或者换本地挂载
+      如果是 docker 挂载本地，请保证文件挂载进去了，并且配置的是绝对路径。
+      自定义 shell 脚本里面如果要加 crontab 任务请使用 echo 追加到 /scripts/docker/merged_list_file.sh 里面否则不生效
+ 注⚠️ 建议无shell能力的不要轻易使用，当然你可以找别人写好适配了这个docker镜像的脚本直接远程配置
+     上面写了这么多如果还看不懂，不建议使用该变量功能。
_____
! ⚠️⚠️⚠️2020-12-11更新镜像启动方式，虽然兼容旧版的运行启动方式，但是强烈建议更新镜像和配置后使用
! 更新后`command:`指令配置不再需要
! 更新后可以使用自定义任务文件追加在默任务文件之后，比以前的完全覆盖多一个选择
! - 新的自定两个环境变量为 `CUSTOM_LIST_MERGE_TYPE`:自定文件的生效方式可选值为`append`，`overwrite`默认为`append` ; `CUSTOM_LIST_FILE`: 自定义文件的名字
! 更新镜像增减镜像更新通知，以后镜像如果更新之后，会通知用户更新
```
> 推荐使用`docker-compose`所以这里只介绍`docker-compose`使用方式



Docker安装 

- 国内一键安装 `sudo curl -sSL https://get.daocloud.io/docker | sh`
- 国外一键安装 `sudo curl -sSL get.docker.com | sh`
- 北京外国语大学开源软件镜像站 `https://mirrors.bfsu.edu.cn/help/docker-ce/`


docker-compose 安装（群晖`nas docker`自带安装了`docker-compose`）

```
sudo curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```
`Ubuntu`用户快速安装`docker-compose`
```
sudo apt-get update && sudo apt-get install -y python3-pip curl vim git moreutils
pip3 install --upgrade pip
pip install docker-compose
```

### win10用户下载安装[docker desktop](https://www.docker.com/products/docker-desktop)

通过`docker-compose version`查看`docker-compose`版本，确认是否安装成功。


### 如果需要使用 docker 多个账户独立并发执行定时任务，[参考这里](./example/docker%E5%A4%9A%E8%B4%A6%E6%88%B7%E4%BD%BF%E7%94%A8%E7%8B%AC%E7%AB%8B%E5%AE%B9%E5%99%A8%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E.md#%E4%BD%BF%E7%94%A8%E6%AD%A4%E6%96%B9%E5%BC%8F%E8%AF%B7%E5%85%88%E7%90%86%E8%A7%A3%E5%AD%A6%E4%BC%9A%E4%BD%BF%E7%94%A8docker%E5%8A%9E%E6%B3%95%E4%B8%80%E7%9A%84%E4%BD%BF%E7%94%A8%E6%96%B9%E5%BC%8F)  

> 注⚠️：前提先理解学会使用这下面的教程
### 创建一个目录`jd_scripts`用于存放备份配置等数据，迁移重装的时候只需要备份整个jd_scripts目录即可
需要新建的目录文件结构参考如下:
```
jd_scripts
├── logs
│   ├── XXXX.log
│   └── XXXX.log
├── my_crontab_list.sh
└── docker-compose.yml
```
- `jd_scripts/logs`建一个空文件夹就行
- `jd_scripts/docker-compose.yml` 参考内容如下(自己动手能力不行搞不定请使用默认配置)：
- - [使用默认配置用这个](./example/default.yml)
- - [使用自定义任务追加到默认任务之后用这个](./example/custom-append.yml)
- - [使用自定义任务覆盖默认任务用这个](./example/custom-overwrite.yml)
- - [一次启动多容器并发用这个](./example/multi.yml)
- - [使用群晖默认配置用这个](./example/jd_scripts.syno.json)
- - [使用群晖自定义任务追加到默认任务之后用这个](./example/jd_scripts.custom-append.syno.json)
- - [使用群晖自定义任务覆盖默认任务用这个](./example/jd_scripts.custom-overwrite.syno.json)
- `jd_scripts/docker-compose.yml`里面的环境变量(`environment:`)配置[参考这里](../githubAction.md#互助码类环境变量) 和[本文末尾](../docker/Readme.md#docker专属环境变量)


- `jd_scripts/my_crontab_list.sh` 参考内容如下,自己根据需要调整增加删除，不熟悉用户推荐使用[默认配置](./crontab_list.sh)里面的内容：

```shell
# 每3天的23:50分清理一次日志(互助码不清理，proc_file.sh对该文件进行了去重)
50 23 */3 * * find /scripts/logs -name '*.log' | grep -v 'sharecode' | xargs rm -rf

##############短期活动##############
# 小鸽有礼2(活动时间：2021年1月28日～2021年2月28日)
34 9 * * * node /scripts/jd_xgyl.js >> /scripts/logs/jd_jd_xgyl.log 2>&1

#女装盲盒 活动时间：2021-2-19至2021-2-25
5 7,23 19-25 2 * node /scripts/jd_nzmh.js >> /scripts/logs/jd_nzmh.log 2>&1

#京东极速版天天领红包 活动时间：2021-1-18至2021-3-3
5 0,23 * * * node /scripts/jd_speed_redpocke.js >> /scripts/logs/jd_speed_redpocke.log 2>&1
##############长期活动##############
# 签到
3 0,18 * * * cd /scripts && node jd_bean_sign.js >> /scripts/logs/jd_bean_sign.log 2>&1
# 东东超市兑换奖品
0,30 0 * * * node /scripts/jd_blueCoin.js >> /scripts/logs/jd_blueCoin.log 2>&1
# 摇京豆
0 0 * * * node /scripts/jd_club_lottery.js >> /scripts/logs/jd_club_lottery.log 2>&1
# 东东农场
5 6-18/6 * * * node /scripts/jd_fruit.js >> /scripts/logs/jd_fruit.log 2>&1
# 宠汪汪
15 */2 * * * node /scripts/jd_joy.js >> /scripts/logs/jd_joy.log 2>&1
# 宠汪汪喂食
15 */1 * * * node /scripts/jd_joy_feedPets.js >> /scripts/logs/jd_joy_feedPets.log 2>&1
# 宠汪汪偷好友积分与狗粮
13 0-21/3 * * * node /scripts/jd_joy_steal.js >> /scripts/logs/jd_joy_steal.log 2>&1
# 摇钱树
0 */2 * * * node /scripts/jd_moneyTree.js >> /scripts/logs/jd_moneyTree.log 2>&1
# 东东萌宠
5 6-18/6 * * * node /scripts/jd_pet.js >> /scripts/logs/jd_pet.log 2>&1
# 京东种豆得豆
0 7-22/1 * * * node /scripts/jd_plantBean.js >> /scripts/logs/jd_plantBean.log 2>&1
# 京东全民开红包
1 1 * * * node /scripts/jd_redPacket.js >> /scripts/logs/jd_redPacket.log 2>&1
# 进店领豆
10 0 * * * node /scripts/jd_shop.js >> /scripts/logs/jd_shop.log 2>&1
# 京东天天加速
8 */3 * * * node /scripts/jd_speed.js >> /scripts/logs/jd_speed.log 2>&1
# 东东超市
11 1-23/5 * * * node /scripts/jd_superMarket.js >> /scripts/logs/jd_superMarket.log 2>&1
# 取关京东店铺商品
55 23 * * * node /scripts/jd_unsubscribe.js >> /scripts/logs/jd_unsubscribe.log 2>&1
# 京豆变动通知
0 10 * * * node /scripts/jd_bean_change.js >> /scripts/logs/jd_bean_change.log 2>&1
# 京东抽奖机
11 1 * * * node /scripts/jd_lotteryMachine.js >> /scripts/logs/jd_lotteryMachine.log 2>&1
# 京东排行榜
11 9 * * * node /scripts/jd_rankingList.js >> /scripts/logs/jd_rankingList.log 2>&1
# 天天提鹅
18 * * * * node /scripts/jd_daily_egg.js >> /scripts/logs/jd_daily_egg.log 2>&1
# 金融养猪
12 * * * * node /scripts/jd_pigPet.js >> /scripts/logs/jd_pigPet.log 2>&1
# 点点券
20 0,20 * * * node /scripts/jd_necklace.js >> /scripts/logs/jd_necklace.log 2>&1
# 京喜工厂
20 * * * * node /scripts/jd_dreamFactory.js >> /scripts/logs/jd_dreamFactory.log 2>&1
# 东东小窝
16 6,23 * * * node /scripts/jd_small_home.js >> /scripts/logs/jd_small_home.log 2>&1
# 东东工厂
36 * * * * node /scripts/jd_jdfactory.js >> /scripts/logs/jd_jdfactory.log 2>&1
# 十元街
36 8,18 * * * node /scripts/jd_syj.js >> /scripts/logs/jd_syj.log 2>&1
# 京东快递签到
23 1 * * * node /scripts/jd_kd.js >> /scripts/logs/jd_kd.log 2>&1
# 京东汽车(签到满500赛点可兑换500京豆)
0 0 * * * node /scripts/jd_car.js >> /scripts/logs/jd_car.log 2>&1
# 领京豆额外奖励(每日可获得3京豆)
33 4 * * * node /scripts/jd_bean_home.js >> /scripts/logs/jd_bean_home.log 2>&1
# 微信小程序京东赚赚
10 11 * * * node /scripts/jd_jdzz.js >> /scripts/logs/jd_jdzz.log 2>&1
# 宠汪汪邀请助力
10 9-20/2 * * * node /scripts/jd_joy_run.js >> /scripts/logs/jd_joy_run.log 2>&1
# crazyJoy自动每日任务
10 7 * * * node /scripts/jd_crazy_joy.js >> /scripts/logs/jd_crazy_joy.log 2>&1
# 京东汽车旅程赛点兑换金豆
0 0 * * * node /scripts/jd_car_exchange.js >> /scripts/logs/jd_car_exchange.log 2>&1
# 导到所有互助码
47 7 * * * node /scripts/jd_get_share_code.js >> /scripts/logs/jd_get_share_code.log 2>&1
# 口袋书店
7 8,12,18 * * * node /scripts/jd_bookshop.js >> /scripts/logs/jd_bookshop.log 2>&1
# 京喜农场
0 9,12,18 * * * node /scripts/jd_jxnc.js >> /scripts/logs/jd_jxnc.log 2>&1
# 签到领现金
27 */4 * * * node /scripts/jd_cash.js >> /scripts/logs/jd_cash.log 2>&1
# 京喜app签到
39 7 * * * node /scripts/jx_sign.js >> /scripts/logs/jx_sign.log 2>&1
# 京东家庭号(暂不知最佳cron)
# */20 * * * * node /scripts/jd_family.js >> /scripts/logs/jd_family.log 2>&1
# 闪购盲盒
27 8 * * * node /scripts/jd_sgmh.js >> /scripts/logs/jd_sgmh.log 2>&1
# 京东秒秒币
10 7 * * * node /scripts/jd_ms.js >> /scripts/logs/jd_ms.log 2>&1
#美丽研究院
1 7,12,19 * * * node /scripts/jd_beauty.js >> /scripts/logs/jd_beauty.log 2>&1
#京东保价
1 0,23 * * * node /scripts/jd_price.js >> /scripts/logs/jd_price.log 2>&1
#京东极速版签到+赚现金任务
1 1,6 * * * node /scripts/jd_speed_sign.js >> /scripts/logs/jd_speed_sign.log 2>&1
# 删除优惠券(默认注释，如需要自己开启，如有误删，已删除的券可以在回收站中还原，慎用)
#20 9 * * 6 node /scripts/jd_delCoupon.js >> /scripts/logs/jd_delCoupon.log 2>&1
```
> 定时任务命之后，也就是 `>>` 符号之前加上 `|ts` 可在日志每一行前面显示时间，如下图:
> ![image](https://user-images.githubusercontent.com/6993269/99031839-09e04b00-25b3-11eb-8e47-0b6515a282bb.png)
- 目录文件配置好之后在 `jd_scripts`目录执行。  
 `docker-compose up -d` 启动（修改docker-compose.yml后需要使用此命令使更改生效）；  
 `docker-compose logs` 打印日志；  
 `docker-compose logs -f` 打印日志，-f表示跟随日志；  
 `docker logs -f jd_scripts` 和上面两条相比可以显示汉字；  
 `docker-compose pull` 更新镜像；多容器用户推荐使用`docker pull lxk0301/jd_scripts`；  
 `docker-compose stop` 停止容器；  
 `docker-compose restart` 重启容器；  
 `docker-compose down` 停止并删除容器；  

- 你可能会用到的命令
  
   `docker exec -it jd_scripts /bin/sh -c ". /scripts/docker/auto_help.sh export > /scripts/logs/auto_help_export.log && node  /scripts/xxxx.js |ts >> /scripts/logs/xxxx.log 2>&1"`  手动运行一脚本（有自动助力）
   
   `docker exec -it jd_scripts /bin/sh -c "node  /scripts/xxxx.js |ts >> /scripts/logs/xxxx.log 2>&1"`  手动运行一脚本（无自动助力）
   
   `docker exec -it jd_scripts /bin/sh -c 'env'`  查看设置的环境变量
   
   `docker exec -it jd_scripts /bin/sh -c 'crontab -l'`  查看已生效的crontab_list定时器任务
   
   `docker exec -it jd_scripts sh -c "git pull"` 手动更新jd_scripts仓库最新脚本（默认已有每天拉取两次的定时任务，不推荐使用）
   
   `docker exec -it jd_scripts /bin/sh` 仅进入容器命令
   
   `rm -rf  logs/*.log` 删除logs文件夹里面所有的日志文件（linux）

   `docker exec -it jd_scripts /bin/sh -c ' ls jd_*.js | grep -v jd_crazy_joy_coin.js |xargs -i node {}'` 执行所有定时任务

- 如果是群晖用户，在docker注册表搜`jd_scripts`，双击下载映像。
不需要`docker-compose.yml`，只需建个logs/目录，调整`jd_scripts.syno.json`里面对应的配置值，然后导入json配置新建容器。
若要自定义`my_crontab_list.sh`，再建个`my_crontab_list.sh`文件，配置参考`jd_scripts.my_crontab_list.syno.json`。
![image](../icon/qh1.png)

![image](../icon/qh2.png)

![image](../icon/qh3.png)

### DOCKER专属环境变量

|        Name       |      归属      |  属性  | 说明                                                         |
| :---------------: | :------------: | :----: | ------------------------------------------------------------ |
| `CRZAY_JOY_COIN_ENABLE` | 是否jd_crazy_joy_coin挂机 | 非必须 | `docker-compose.yml`文件下填写`CRZAY_JOY_COIN_ENABLE=Y`表示挂机,`CRZAY_JOY_COIN_ENABLE=N`表不挂机 |
| `DO_NOT_RUN_SCRIPTS` | 不执行的脚本 | 非必须 | 例:`docker-compose.yml`文件里面填写`DO_NOT_RUN_SCRIPTS=jd_family.js&jd_dreamFactory.js&jd_jxnc.js`, 建议填写完整脚本名,不完整的文件名可能导致其他脚本被禁用 |
| `ENABLE_AUTO_HELP` | 单容器多账号自动互助 | 非必须 | 例:`docker-compose.yml`文件里面填写`ENABLE_AUTO_HELP=true` |
