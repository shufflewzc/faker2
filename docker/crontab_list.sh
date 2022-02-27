# 每3天的23:50分清理一次日志(互助码不清理，proc_file.sh对该文件进行了去重)
50 23 */3 * * find /scripts/logs -name '*.log' | grep -v 'sharecodeCollection' | xargs rm -rf
#收集助力码
30 * * * * sh +x /scripts/docker/auto_help.sh collect >> /scripts/logs/auto_help_collect.log 2>&1

##############活动##############

#宠汪汪
35 0-23/2 * * * node /scripts/jd_joy.js >> /scripts/logs/jd_joy.log 2>&1
#宠汪汪兑换
59 7,15,23 * * * node /scripts/jd_joy_reward.js >> /scripts/logs/jd_joy_reward.log 2>&1
#点点券
#10 6,20 * * * node /scripts/jd_necklace.js >> /scripts/logs/jd_necklace.log 2>&1
#惊喜签到
0 3,8 * * * node /scripts/jd_jxsign.js >> /scripts/logs/jd_jxsign.log 2>&1
#东东超市兑换奖品
59 23 * * * node /scripts/jd_blueCoin.js >> /scripts/logs/jd_blueCoin.log 2>&1
#财富岛
35 * * * * node /scripts/jd_cfd.js >> /scripts/logs/jd_cfd.log 2>&1
#京东汽车
10 4,20 * * * node /scripts/jd_car.js >> /scripts/logs/jd_car.log 2>&1
#金榜创造营
13 5,19 * * * node /scripts/jd_gold_creator.js >> /scripts/logs/jd_gold_creator.log 2>&1
#京东多合一签到
0 4,14 * * * node /scripts/jd_bean_sign.js >> /scripts/logs/jd_bean_sign.log 2>&1
#半点京豆雨
30 0-23/1 * * * node /scripts/jd_half_redrain.js >> /scripts/logs/jd_half_redrain.log 2>&1
#东东超市
39 * * * * node /scripts/jd_superMarket.js >> /scripts/logs/jd_superMarket.log 2>&1
#京东极速版红包
20 2,12 * * * node /scripts/jd_speed_redpocke.js >> /scripts/logs/jd_speed_redpocke.log 2>&1
#领京豆额外奖励
10 3,9 * * * node /scripts/jd_bean_home.js >> /scripts/logs/jd_bean_home.log 2>&1
#京东资产变动通知
0 12 * * * node /scripts/jd_bean_change.js >> /scripts/logs/jd_bean_change.log 2>&1
#京东极速版
0 1,7 * * * node /scripts/jd_speed_sign.js >> /scripts/logs/jd_speed_sign.log 2>&1
#我是大老板
35 0-23/1 * * * node /scripts/jd_wsdlb.js >> /scripts/logs/jd_wsdlb.log 2>&1
#
5 3,19 * * * node /scripts/jd_unsubscribe.js >> /scripts/logs/jd_unsubscribe.log 2>&1
#东东萌宠
45 6-18/6 * * * node /scripts/jd_pet.js >> /scripts/logs/jd_pet.log 2>&1
#挑一挑
1 3,9,18 * * * node /scripts/jd_jump.js >> /scripts/logs/jd_jump.log 2>&1
#
36 0,1-23/3 * * * node /scripts/jd_mohe.js >> /scripts/logs/jd_mohe.log 2>&1
#种豆得豆
44 0-23/6 * * * node /scripts/jd_plantBean.js >> /scripts/logs/jd_plantBean.log 2>&1
#东东农场
35 6-18/6 * * * node /scripts/jd_fruit.js >> /scripts/logs/jd_fruit.log 2>&1
#删除优惠券
0 3,20 * * * node /scripts/jd_delCoupon.js >> /scripts/logs/jd_delCoupon.log 2>&1
#
5 2,19 * * * node /scripts/jd_club_lottery.js >> /scripts/logs/jd_club_lottery.log 2>&1
#
40 * * * * node /scripts/jd_jdfactory.js >> /scripts/logs/jd_jdfactory.log 2>&1
#
0 0-23/1 * * * node /scripts/jd_super_redrain.js >> /scripts/logs/jd_super_redrain.log 2>&1
#领金贴
10 1 * * * node /scripts/jd_jin_tie.js >> /scripts/logs/jd_jin_tie.log 2>&1
#健康社区
13 2,5,20 * * * node /scripts/jd_health.js >> /scripts/logs/jd_health.log 2>&1
#秒秒币
10 2 * * * node /scripts/jd_ms.js >> /scripts/logs/jd_ms.log 2>&1
#
1 2,15,19 * * * node /scripts/jd_daily_lottery.js >> /scripts/logs/jd_daily_lottery.log 2>&1
#
9 0-23/3 * * * node /scripts/jd_ddnc_farmpark.js >> /scripts/logs/jd_ddnc_farmpark.log 2>&1
#京喜工厂
39 * * * * node /scripts/jd_dreamFactory.js >> /scripts/logs/jd_dreamFactory.log 2>&1
#闪购盲盒
20 4,16,19 * * * node /scripts/jd_sgmh.js >> /scripts/logs/jd_sgmh.log 2>&1
#
0 0 * * * node /scripts/jd_bean_change1.js >> /scripts/logs/jd_bean_change1.log 2>&1
#
1 0 * * *  node /scripts/jd_shop.js >> /scripts/logs/jd_shop.log 2>&1
#摇钱树
23 0-23/2 * * * node /scripts/jd_moneyTree.js >> /scripts/logs/jd_moneyTree.log 2>&1
#排行榜
37 2 * * * node /scripts/jd_rankingList.js >> /scripts/logs/jd_rankingList.log 2>&1
#
32 0-23/6 * * * node /scripts/jd_pigPet.js >> /scripts/logs/jd_pigPet.log 2>&1
#
10-20/5 12 * * * node /scripts/jd_live.js >> /scripts/logs/jd_live.log 2>&1
#京东快递
40 0 * * * node /scripts/jd_kd.js >> /scripts/logs/jd_kd.log 2>&1
#美丽研究院
16 9,15,17 * * * node /scripts/jd_beauty.js >> /scripts/logs/jd_beauty.log 2>&1
#京喜牧场
48 0-23/3 * * * node /scripts/jd_jxmc.js >> /scripts/logs/jd_jxmc.log 2>&1
#京东试用
30 10 * * * node /scripts/jd_try.js >> /scripts/logs/jd_try.log 2>&1
#领现金
42 0-23/6 * * * node /scripts/jd_cash.js >> /scripts/logs/jd_cash.log 2>&1
#赚金币
0 8 * * * node /scripts/jd_zjb.js >> /scripts/logs/jd_zjb.log 2>&1
#
# 0 6 * * * node /scripts/getJDCookie.js >> /scripts/logs/getJDCookie.log 2>&1
#京东赚赚
10 0 * * * node /scripts/jd_jdzz.js >> /scripts/logs/jd_jdzz.log 2>&1
#获取互助码
20 13 * * 6 node /scripts/jd_get_share_code.js >> /scripts/logs/jd_get_share_code.log 2>&1
#
15-55/20 * * * * node /scripts/jd_health_collect.js >> /scripts/logs/jd_health_collect.log 2>&1
#京东到家果园
10 0,8,11,17 * * * node /scripts/jd_jddj_fruit.js >> /scripts/logs/jd_jddj_fruit.log 2>&1
#京东到家
5 0,6,12 * * * node /scripts/jd_jddj_bean.js >> /scripts/logs/jd_jddj_bean.log 2>&1
#京东到家收水滴
10 * * * * node /scripts/jd_jddj_collectWater.js >> /scripts/logs/jd_jddj_collectWater.log 2>&1
#京东到家
5-40/5 * * * * node /scripts/jd_jddj_getPoints.js >> /scripts/logs/jd_jddj_getPoints.log 2>&1
#京东到家
20 */4 * * * node /scripts/jd_jddj_plantBeans.js >> /scripts/logs/jd_jddj_plantBeans.log 2>&1
#
13 3 * * * node /scripts/jd_drawEntrance.js >> /scripts/logs/jd_drawEntrance.log 2>&1
#特务
1,10 0 * * * node /scripts/jd_superBrand.js >> /scripts/logs/jd_superBrand.log 2>&1
#送豆得豆
5 0,12 * * * node /scripts/jd_SendBean.js >> /scripts/logs/jd_SendBean.log 2>&1
#
20 0,2 * * * node /scripts/jd_wish.js >> /scripts/logs/jd_wish.log 2>&1
#财富岛气球
5 * * * * node /scripts/jd_cfd_loop.js >> /scripts/logs/jd_cfd_loop.log 2>&1
#宠汪汪偷狗粮
40 0-21/3 * * * node /scripts/jd_joy_steal.js >> /scripts/logs/jd_joy_steal.log 2>&1
#京小鸽
18 4,11 * * * node /scripts/jd_jxg.js >> /scripts/logs/jd_jxg.log 2>&1
#
20 6,7 * * * node /scripts/jd_morningSc.js >> /scripts/logs/jd_morningSc.log 2>&1
#领现金兑换
0 0 * * * node /scripts/jd_cash_exchange.js >> /scripts/logs/jd_cash_exchange.log 2>&1
#快手水果
33 1,8,12,19 * * * node /scripts/jd_ks_fruit.js >> /scripts/logs/jd_ks_fruit.log 2>&1
#宠汪汪喂食
15 0-23/1 * * * node /scripts/jd_joy_feedPets.js >> /scripts/logs/jd_joy_feedPets.log 2>&1
#宠汪汪赛跑
15 10,12 * * * node /scripts/jd_joy_run.js >> /scripts/logs/jd_joy_run.log 2>&1
#领京豆
38 8,13 * * * node /scripts/jd_mdou.js >> /scripts/logs/jd_mdou.log 2>&1
#
0 1 * * * node /scripts/jd_cleancart.js >> /scripts/logs/jd_cleancart.log 2>&1
#店铺签到
2 2 * * * node /scripts/jd_dpqd.js >> /scripts/logs/jd_dpqd.log 2>&1
#推一推
2 12 * * * node /scripts/jd_tyt.js >> /scripts/logs/jd_tyt.log 2>&1
#
55 6 * * * node /scripts/jd_unsubscriLive.js >> /scripts/logs/jd_unsubscriLive.log 2>&1
#女装盲盒
45 2,20 * * * node /scripts/jd_nzmh.js >> /scripts/logs/jd_nzmh.log 2>&1
#开卡74
47 3 25-30,1 11,12 * node /scripts/jd_opencard74.js >> /scripts/logs/jd_opencard74.log 2>&1
#开卡75
47 2 1-15 12 * node /scripts/jd_opencard75.js >> /scripts/logs/jd_opencard75.log 2>&1
#开卡76
47 3 3-12 12 * node /scripts/jd_opencard76.js >> /scripts/logs/jd_opencard76.log 2>&1
#积分换话费
43 5,17 * * * node /scripts/jd_dwapp.js >> /scripts/logs/jd_dwapp.log 2>&1
# 领券中心签到
5 0 * * * node /scripts/jd_ccSign.js >> /scripts/logs/jd_ccSign.log 2>&1
#邀请有礼
20 9 * * * node /scripts/jd_yqyl.js >> /scripts/logs/jd_yqyl.log 2>&1
#
20 3,6,9 * * * node /scripts/jd_dreamfactory_tuan.js >> /scripts/logs/jd_dreamfactory_tuan.log 2>&1
#京喜领红包
23 0,6,12,21 * * * node /scripts/jd_jxlhb.js >> /scripts/logs/jd_jxlhb.log 2>&1
#超级直播间盲盒抽京豆
1 18,20 * * * node /scripts/jd_super_mh.js >> /scripts/logs/jd_super_mh.log 2>&1
# 内容鉴赏官
5 2,5,16 * * * node /scripts/jd_connoisseur.js >> /scripts/logs/jd_connoisseur.log 2>&1
# 京喜财富岛月饼
5 * * * * node /scripts/jd_cfd_mooncake.js >> /scripts/logs/jd_cfd_mooncake.log 2>&1
# 东东世界
15 3,16 * * * node /scripts/jd_ddworld.js >> /scripts/logs/jd_ddworld.log 2>&1
# 小魔方
31 2,8 * * * node /scripts/jd_mf.js >> /scripts/logs/jd_mf.log 2>&1
# 魔方
11 7,19 * * * node /scripts/jd_mofang.js >> /scripts/logs/jd_mofang.log 2>&1
# 芥么签到
11 0,9 * * * node /scripts/jd_jmsign.js >> /scripts/logs/jd_jmsign.log 2>&1
# 芥么赚豪礼
37 0,11 * * * node /scripts/jd_jmzhl.js >> /scripts/logs/jd_jmzhl.log 2>&1
# 幸运扭蛋
24 9 * 10-11 * node /scripts/jd_lucky_egg.js >> /scripts/logs/jd_lucky_egg.log 2>&1
# 东东世界兑换
0 0 * * * node /scripts/jd_ddworld_exchange.js >> /scripts/logs/jd_ddworld_exchange.log 2>&1
# 天天提鹅
20 * * * * node /scripts/jd_daily_egg.js >> /scripts/logs/jd_daily_egg.log 2>&1
# 发财大赢家
1 2,10 * * * node /scripts/jd_fcdyj.js >> /scripts/logs/jd_fcdyj.log 2>&1
# 翻翻乐
20 * * * * node /scripts/jd_big_winner.js >> /scripts/logs/jd_big_winner.log 2>&1
# 京东极速版签到免单
18 8,12,20 * * * node /scripts/jd_speed_signfree.js >> /scripts/logs/jd_speed_signfree.log 2>&1
# 牛牛福利
1 9,19 * * * node /scripts/jd_nnfl.js >> /scripts/logs/jd_nnfl.log 2>&1
#赚京豆
10,40 0,1 * * * node /scripts/jd_syj.js >> /scripts/logs/jd_syj.log 2>&1
#搞基大神-饭粒
46 1,19 * * * node /scripts/jd_fanli.js >> /scripts/logs/jd_fanli.log 2>&1
#农场集勋章
16 7,16 * * * node /scripts/jd_medal.js >> /scripts/logs/jd_medal.log 2>&1
#京东签到翻牌
10 8,18 * * * node /scripts/jd_sign_graphics.js >> /scripts/logs/jd_sign_graphics.log 2>&1
#京喜财富岛合成生鲜
45 * * * * node /scripts/jd_cfd_fresh.js >> /scripts/logs/jd_cfd_fresh.log 2>&1
#财富岛珍珠兑换
59 0-23/1 * * * node /scripts/jd_cfd_pearl_ex.js >> /scripts/logs/jd_cfd_pearl_ex.log 2>&1
#美丽研究院--兑换
1 7,12,19 * * * node /scripts/jd_beauty_ex.js >> /scripts/logs/jd_beauty_ex.log 2>&1
#锦鲤
5 0 * * * node /scripts/jd_angryKoi.js >> /scripts/logs/jd_angryKoi.log 2>&1
#京东赚京豆一分钱抽奖
10 0 * * * node /scripts/jd_lottery_drew.js >> /scripts/logs/jd_lottery_drew.log 2>&1
#京东保价
41 23 * * * node /scripts/jd_price.js >> /scripts/logs/jd_price.log 2>&1
#金榜年终奖
10 0,2 * * * node /scripts/jd_split.js >> /scripts/logs/jd_split.log 2>&1
#京东小魔方--收集兑换
10 7 * * * node /scripts/jd_mofang_ex.js >> /scripts/logs/jd_mofang_ex.log 2>&1
#骁龙
10 9,17 * * * node /scripts/jd_xiaolong.js >> /scripts/logs/jd_xiaolong.log 2>&1
#京东我的理想家
10 7 * * * node /scripts/jd_lxLottery.js >> /scripts/logs/jd_lxLottery.log 2>&1
#京豆兑换为喜豆
33 9 * * * node /scripts/jd_exchangejxbeans.js >> /scripts/logs/jd_exchangejxbeans.log 2>&1
#早起签到
1 6,7 * * * python3 /jd/scripts/jd_zqfl.py >> /jd/log/jd_zqfl.log 2>&1
