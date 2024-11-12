/**
 * 京东试用， 只是一个DEMO
 */
const fs = require('fs').promises;
const path = require('path');
const qs = require('qs');
const axios = require('axios');
const { SmashUtils } = require('./utils/smashUtils');
const { setBaseCookie } = require('./utils/baseCookie');
const { getJsToken } = require('./utils/jsToken.js');
const cacheFilePath = path.join(__dirname, 'tokenCache.json');
const $ = new Env('京东试用');
const URL = 'https://api.m.jd.com/client.action';
let trialActivityIdList = [];
let trialActivityTitleList = [];
let notifyMsg = '';
let size = 1;
$.isPush = true;
$.isLimit = false;
$.isForbidden = false;
$.wrong = false;
$.giveupNum = 0;
$.successNum = 0;
$.completeNum = 0;
$.getNum = 0;
$.try = true;
$.sentNum = 0;
$.cookiesArr = [];
//默认的过滤关键词
$.innerKeyWords = [
  '幼儿园',
  '教程',
  '英语',
  '辅导',
  '培训',
  '孩子',
  '小学',
  '成人用品',
  '套套',
  '情趣',
  '自慰',
  '阳具',
  '飞机杯',
  '男士用品',
  '女士用品',
  '内衣',
  '高潮',
  '避孕',
  '乳腺',
  '肛塞',
  '肛门',
  '宝宝',
  '芭比',
  '娃娃',
  '男用',
  '女用',
  '神油',
  '足力健',
  '老年',
  '老人',
  '宠物',
  '饲料',
  '丝袜',
  '黑丝',
  '磨脚',
  '脚皮',
  '除臭',
  '性感',
  '内裤',
  '跳蛋',
  '安全套',
  '龟头',
  '阴道',
  '阴部',
  '手机卡',
  '电话卡',
  '流量卡',
  '习题',
  '试卷',
];
//下面很重要，遇到问题请把下面注释看一遍再来问
let args_xh = {
  h5st_server: process.env.H5ST_SERVER || '',
  /*
   * 控制一次最多跑几个号，默认10个
   */
  try_num: process.env.JD_TRY_NUM * 1 || 10,
  /*
   * 控制是否输出当前环境变量设置，默认为false
   * 环境变量名称：XH_TRY_ENV
   */
  env: process.env.XH_TRY_ENV === 'true' || false,
  /*
   * 跳过某个指定账号，默认为全部账号清空
   * 填写规则：例如当前Cookie1为pt_key=key; pt_pin=pin1;则环境变量填写pin1即可，此时pin1的购物车将不会被清空
   * 若有更多，则按照pin1@pin2@pin3进行填写
   * 环境变量名称：XH_TRY_EXCEPT
   */
  except: (process.env.XH_TRY_EXCEPT && process.env.XH_TRY_EXCEPT.split('@')) || [],
  /*
   * 由于每个账号每次获取的试用产品都不一样，所以为了保证每个账号都能试用到不同的商品，之前的脚本都不支持采用统一试用组的
   * 以下环境变量是用于指定是否采用统一试用组的
   * 例如当 JD_TRY_UNIFIED 为 true时，有3个账号，第一个账号跑脚本的时候，试用组是空的
   * 而当第一个账号跑完试用组后，第二个，第三个账号所采用的试用组默认采用的第一个账号的试用组
   * 优点：减少除第一个账号外的所有账号遍历，以减少每个账号的遍历时间
   * 缺点：A账号能申请的东西，B账号不一定有
   * 提示：想每个账号独立不同的试用产品的，请设置为false，想减少脚本运行时间的，请设置为true
   * 默认为false
   */
  unified: process.env.JD_TRY_UNIFIED === 'true' || false,
  /*
   * 商品原价，低于这个价格都不会试用，意思是
   * A商品原价49元，试用价1元，如果下面设置为50，那么A商品不会被加入到待提交的试用组
   * B商品原价99元，试用价0元，如果下面设置为50，那么B商品将会被加入到待提交的试用组
   * C商品原价99元，试用价1元，如果下面设置为50，那么C商品将会被加入到待提交的试用组
   * 默认为0
   * */
  jdPrice: process.env.JD_TRY_PRICE * 1 || 20,
  /*
   * 下面有一个function是可以获取tabId列表，名为try_tabList
   * 可设置环境变量：JD_TRY_TABID，用@进行分隔
   * tabId不定期会变,获取不到商品，自行获取并修改tabId
   * */
  tabId: (process.env.JD_TRY_TABID && process.env.JD_TRY_TABID.split('@').map(Number)) || [212, 221, 222, 223, 229, 225, 224, 226, 234, 227, 228],
  /*
   * 试用商品标题过滤，黑名单，当标题存在关键词时，则不加入试用组
   * 当白名单和黑名单共存时，黑名单会自动失效，优先匹配白名单，匹配完白名单后不会再匹配黑名单，望周知
   * 例如A商品的名称为『旺仔牛奶48瓶特价』，设置了匹配白名单，白名单关键词为『牛奶』，但黑名单关键词存在『旺仔』
   * 这时，A商品还是会被添加到待提交试用组，白名单优先于黑名单
   * 已内置对应的 成人类 幼儿类 宠物 老年人类关键词，请勿重复添加
   * 可设置环境变量：JD_TRY_TITLEFILTERS，关键词与关键词之间用@分隔
   * */
  titleFilters: (process.env.JD_TRY_TITLEFILTERS && process.env.JD_TRY_TITLEFILTERS.split('@')) || [],
  /*
   * 试用价格(中了要花多少钱)，高于这个价格都不会试用，小于等于才会试用，意思就是
   * A商品原价49元，现在试用价1元，如果下面设置为10，那A商品将会被添加到待提交试用组，因为1 < 10
   * B商品原价49元，现在试用价2元，如果下面设置为1，那B商品将不会被添加到待提交试用组，因为2 > 1
   * C商品原价49元，现在试用价1元，如果下面设置为1，那C商品也会被添加到带提交试用组，因为1 = 1
   * 可设置环境变量：JD_TRY_TRIALPRICE，默认为0
   * */
  trialPrice: process.env.JD_TRY_TRIALPRICE * 1 || 0,
  /*
   * 最小提供数量，例如试用商品只提供2份试用资格，当前设置为1，则会进行申请
   * 若只提供5分试用资格，当前设置为10，则不会申请
   * 可设置环境变量：JD_TRY_MINSUPPLYNUM
   * */
  minSupplyNum: process.env.JD_TRY_MINSUPPLYNUM * 1 || 1,
  /*
   * 过滤大于设定值的已申请人数，例如下面设置的10000，A商品已经有10001人申请了，则A商品不会进行申请，会被跳过
   * 可设置环境变量：JD_TRY_APPLYNUMFILTER
   * */
  applyNumFilter: process.env.JD_TRY_APPLYNUMFILTER * 1 || 10000,
  /*
   * 商品数组的最大长度，通俗来说就是即将申请的商品队列长度
   * 例如设置为20，当第一次获取后获得12件，过滤后剩下5件，将会进行第二次获取，过滤后加上第一次剩余件数
   * 例如是18件，将会进行第三次获取，直到过滤完毕后为20件才会停止，不建议设置太大
   * 可设置环境变量：JD_TRY_MAXLENGTH
   * */
  maxLength: process.env.JD_TRY_MAXLENGTH * 1 || 5,
  /*
   * 过滤种草官类试用，某些试用商品是专属官专属，考虑到部分账号不是种草官账号
   * 例如A商品是种草官专属试用商品，下面设置为true，而你又不是种草官账号，那A商品将不会被添加到待提交试用组
   * 例如B商品是种草官专属试用商品，下面设置为false，而你是种草官账号，那A商品将会被添加到待提交试用组
   * 例如B商品是种草官专属试用商品，下面设置为true，即使你是种草官账号，A商品也不会被添加到待提交试用组
   * 可设置环境变量：JD_TRY_PASSZC，默认为true
   * */
  passZhongCao: process.env.JD_TRY_PASSZC !== 'false',
  /*
   * 是否打印输出到日志，考虑到如果试用组长度过大，例如100以上，如果每个商品检测都打印一遍，日志长度会非常长
   * 打印的优点：清晰知道每个商品为什么会被过滤，哪个商品被添加到了待提交试用组
   * 打印的缺点：会使日志变得很长
   *
   * 不打印的优点：简短日志长度
   * 不打印的缺点：无法清晰知道每个商品为什么会被过滤，哪个商品被添加到了待提交试用组
   * 可设置环境变量：JD_TRY_PLOG，默认为true
   * */
  printLog: process.env.JD_TRY_PLOG !== 'false',
  /*
   * 白名单，是否打开，如果下面为true，那么黑名单会自动失效
   * 白名单和黑名单无法共存，白名单永远优先于黑名单
   * 可通过环境变量控制：JD_TRY_WHITELIST，默认为false
   * */
  whiteList: process.env.JD_TRY_WHITELIST === 'true' || false,
  /*
   * 白名单关键词，当标题存在关键词时，加入到试用组
   * 例如A商品的名字为『旺仔牛奶48瓶特价』，白名单其中一个关键词是『牛奶』，那么A将会直接被添加到待提交试用组，不再进行另外判断
   * 就算设置了黑名单也不会判断，希望这种写得那么清楚的脑瘫问题就别提issues了
   * 可通过环境变量控制：JD_TRY_WHITELIST，用@分隔
   * */
  whiteListKeywords: (process.env.JD_TRY_WHITELISTKEYWORDS && process.env.JD_TRY_WHITELISTKEYWORDS.split('@')) || [],
  /*
   * 每多少个账号发送一次通知，默认为4
   * 可通过环境变量控制 JD_TRY_SENDNUM
   * */
  sendNum: process.env.JD_TRY_SENDNUM * 1 || 4,
};
!(async () => {
  await $.wait(500);
  $.log('\n遇到问题请先看脚本内注释\n');
  if(!args_xh.h5st_server) {
    console.log('请先在环境变量中配置H5ST接口变量：export H5ST_SERVER="你的接口" 例子：export H5ST_SERVER="http://192.168.2.1:3111" (不要后面的/h5st)');
    return;
  }
  await requireConfig();
  if (!$.cookiesArr[0]) {
    console.log($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/');
    return;
  }
  $.cache = await readCache();
  args_xh.tabId = args_xh.tabId.sort(() => 0.5 - Math.random());
  for (let i = 0; i < args_xh.try_num; i++) {
    if ($.cookiesArr[i]) {
      $.cookie = $.cookiesArr[i];
      $.UserName = decodeURIComponent($.cookie.match(/pt_pin=(.+?);/) && $.cookie.match(/pt_pin=(.+?);/)[1]);
      $.index = i + 1;
      $.isLogin = true;
      $.userAgent = process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : 'Mozilla/5.0 (Linux; Android 13; 23054RA19C Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/122.0.6261.119 Mobile Safari/537.36',

      console.log(`\n开始【京东账号${$.index}】${$.UserName}\n`);
      await try_rafflecount();
      $.except = false;
      if (args_xh.except.includes($.UserName)) {
        // await try_MyTrials(1, 2); //申请成功的商品
        console.log(`跳过账号：${$.UserName}`);
        $.except = true;
        continue;
      }
      if (!$.isLogin) {
        console.log($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.UserName}`);
        await $.notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        continue;
      }

      await initSmashUtils();
      await initJsToken();

      $.totalTry = 0;
      $.totalSuccess = 0;
      $.nowTabIdIndex = 0;
      $.nowPage = 1;
      $.nowItem = 1;
      $.retrynum = 0;
      if (!args_xh.unified) {
        trialActivityIdList = [];
        trialActivityTitleList = [];
      }
      $.isLimit = false;
      $.isForbidden = false;
      $.wrong = false;
      size = 1;

      while (trialActivityIdList.length < args_xh.maxLength && $.retrynum < 3) {
        if ($.nowTabIdIndex === args_xh.tabId.length) {
          console.log(`tabId组已遍历完毕，不在获取商品\n`);
          break;
        } else {
          await try_feedsList(args_xh.tabId[$.nowTabIdIndex], $.nowPage); //获取对应tabId的试用页面
        }
        if (trialActivityIdList.length < args_xh.maxLength) {
          console.log(`间隔等待中，请等待5秒 \n`);
          await $.wait(5000);
        }
      }
      if ($.isForbidden === false && $.isLimit === false) {
        console.log(`稍后将执行试用申请，请等待 5 秒\n`);
        await $.wait(5000);
        for (let i = 0; i < trialActivityIdList.length && $.isLimit === false; i++) {
          if ($.isLimit) {
            console.log('试用上限');
            break;
          }
          if ($.isForbidden) {
            console.log('403了，跳出');
            break;
          }
          await try_apply(trialActivityTitleList[i], trialActivityIdList[i]);
          console.log(`间隔等待中，请等待15秒 \n`);
          await $.wait(15000);
        }
        console.log('试用申请执行完毕...');
        $.giveupNum = 0;
        $.successNum = 0;
        $.getNum = 0;
        $.completeNum = 0;
        // await try_MyTrials(1, 2); //申请成功的商品
        await showMsg();
      }
    }
    if ($.index % args_xh.sendNum === 0) {
      $.sentNum++;
      console.log(`正在进行第 ${$.sentNum} 次发送通知，发送数量：${args_xh.sendNum}`);
      await $.notify.sendNotify(`${$.name}`, `${notifyMsg}`);
      notifyMsg = '';
    }
  }
  if ($.except === false) {
    if ($.cookiesArr.length - $.sentNum * args_xh.sendNum < args_xh.sendNum && notifyMsg.length != 0) {
      console.log(`正在进行最后一次发送通知，发送数量：${$.cookiesArr.length - $.sentNum * args_xh.sendNum}`);
      await $.notify.sendNotify(`${$.name}`, `${notifyMsg}`);
      notifyMsg = '';
    }
  }
})()
  .catch((e) => {
    console.error(`❗️ ${$.name} 运行错误！\n${e}`);
  })
  .finally(() => $.done());

function requireConfig() {
  return new Promise((resolve) => {
    $.notify = require('./sendNotify');
    //获取 Cookies
    $.cookiesArr = [];
    //Node.js用户请在jdCookie.js处填写京东ck;
    const jdCookieNode = require('./jdCookie.js');
    Object.keys(jdCookieNode).forEach((item) => {
      if (jdCookieNode[item]) $.cookiesArr.push(jdCookieNode[item]);
    });
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};

    for (let keyWord of $.innerKeyWords) args_xh.titleFilters.push(keyWord);
    console.log(`共${$.cookiesArr.length}个京东账号\n`);
    if (args_xh.env) {
      console.log('=========环境变量配置如下=========');
      console.log(`env: ${typeof args_xh.env}, ${args_xh.env}`);
      console.log(`try_num: ${typeof args_xh.try_num}, ${args_xh.try_num}`);
      console.log(`except: ${typeof args_xh.except}, ${args_xh.except}`);
      console.log(`unified: ${typeof args_xh.unified}, ${args_xh.unified}`);
      console.log(`jdPrice: ${typeof args_xh.jdPrice}, ${args_xh.jdPrice}`);
      console.log(`tabId: ${typeof args_xh.tabId}, ${args_xh.tabId}`);
      console.log(`titleFilters: ${typeof args_xh.titleFilters}, ${args_xh.titleFilters}`);
      console.log(`trialPrice: ${typeof args_xh.trialPrice}, ${args_xh.trialPrice}`);
      console.log(`minSupplyNum: ${typeof args_xh.minSupplyNum}, ${args_xh.minSupplyNum}`);
      console.log(`applyNumFilter: ${typeof args_xh.applyNumFilter}, ${args_xh.applyNumFilter}`);
      console.log(`maxLength: ${typeof args_xh.maxLength}, ${args_xh.maxLength}`);
      console.log(`passZhongCao: ${typeof args_xh.passZhongCao}, ${args_xh.passZhongCao}`);
      console.log(`printLog: ${typeof args_xh.printLog}, ${args_xh.printLog}`);
      console.log(`whiteList: ${typeof args_xh.whiteList}, ${args_xh.whiteList}`);
      console.log(`whiteListKeywords: ${typeof args_xh.whiteListKeywords}, ${args_xh.whiteListKeywords}`);
      console.log('===============================');
    }
    resolve();
  });
}

async function try_apply(title, activityId) {
  console.log(`申请试用商品提交中...`);
  args_xh.printLog ? console.log(`商品：${title}`) : '';
  args_xh.printLog ? console.log(`id为：${activityId}`) : '';

  const sign = await h5stSign(
    {
      functionId: 'try_apply',
      appid: 'newtry',
      body: {
        activityId: Number(activityId),
      },
      'x-api-eid-token': $.jsToken,
    },
    '35fa0',
  );

  setBaseCookie();
  const joylog = await $.smashUtils.sign(
    {
      ...sign.body,
    },
    true,
  );

  try {
    const { data } = await api({
      method: 'POST',
      url: `https://api.m.jd.com/client.action`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        origin: 'https://pro.m.jd.com',
        Referer: 'https://pro.m.jd.com/mall/active/3mpGVQDhvLsMvKfZZumWPQyWt83L/index.html',
        'User-Agent': $.userAgent,
        'x-referer-page': 'https://pro.m.jd.com/mall/active/3mpGVQDhvLsMvKfZZumWPQyWt83L/index.html',
      },
      data: qs.stringify(joylog),
    });

    $.totalTry++;
    if (data.success && data.code === '1') {
      // 申请成功
      console.log('申请提交成功');
      $.totalSuccess++;
    } else if (data.code === '-106') {
      console.log(data.message); // 未在申请时间内！
    } else if (data.code === '-110') {
      console.log(data.message); // 您的申请已成功提交，请勿重复申请…
    } else if (data.code === '-120') {
      console.log(data.message); // 您还不是会员，本品只限会员申请试用，请注册会员后申请！
    } else if (data.code === '-167') {
      console.log(data.message); // 抱歉，此试用需为种草官才能申请。查看下方详情了解更多。
    } else if (data.code === '-131') {
      console.log(data.message); // 申请次数上限。
      $.isLimit = true;
    } else if (data.code === '-113') {
      console.log(data.message); // 操作不要太快哦！
    } else {
      console.log('申请失败', data);
    }
  } catch (e) {
    if (e.message === `Request failed with status code 403`) {
      $.isForbidden = true;
      console.log('账号被京东服务器风控，不再请求该帐号');
    } else {
      console.log(e.message);
      console.log(`${$.name} API请求失败，请检查网路重试`);
    }
  }
}

async function try_MyTrials(page, selected) {
  switch (selected) {
    case 1:
      console.log('正在获取已申请的商品...');
      break;
    case 2:
      console.log('正在获取申请成功的商品...');
      break;
    case 3:
      console.log('正在获取申请失败的商品...');
      break;
    default:
      console.log('selected错误');
  }

  const sign = await h5stSign(
    {
      functionId: 'try_MyTrials',
      appid: 'newtry',
      clientVersion: '13.6.1',
      client: 'wh5',
      body: { page: page, selected: selected, previewTime: '' },
    },
    '20241020190915983;agi39zmtagmaaap8;6d63a;tk02wc1d11c3f41lMisxeDIrM3F5zw3TlpVl9lTWqno08Vqtiq4GkXuDVANat5P5-_e_KEjjFRW7OrmT7wCN7nkBO0Eh;c86014a641551242004b4f25c80b56b3efd4405d6bf9899da355593a8710e73e;4.2;1729422555983;e9f6ec1bab0ebf8ad0759c5c9ae319e1e6e561685fd3cb857e7337eff91b61f556bf8a7d02fa529215a3be23a58fcfe0128cabd647573f2a59044ccdd081cca3b1b9334614e6d42db8e32b5c2a8dfe46c4fea05d438740136f73aba5a8b1673c119835af2c1f0459d5b259773ab0312e6aa38abdbe32772a6256aaa4674f4e2beee112716c526703a1e93306c7771b610617a98f88165f08f00444938cd695d29a2df1ac2ffa476c9505cd78864ba430ce5081edadba67198b13ca3fafc9739c053460325939c1342afae5b7963d4005dcc643d32e8f36bb97585d5a6e3210fbbb86eb075b3f9493926e7cefd59d542e06b0bbfbeb78d764025f6a2c1d51dc7cdc806118aa9ef83ee8a5992ba4945c0b6a541385d17bd302ea99572bd1999f7f8ec143e2f59287e8aa14b362eb36ef8a',
    '4.2.0',
  );

  const options = {
    method: 'POST',
    url: 'https://api.m.jd.com/client.action',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: $.cookie,
      Origin: 'https://prodev.m.jd.com',
      Referer: 'https://prodev.m.jd.com/mall/active/3C751WNneAUaZ8Lw8xYN7cbSE8gm/index.html',
      'User-Agent': $.userAgent,
    },
    data: sign.qs,
  };

  const { data } = await axios.request(options);
  console.log(data);
  if (data.success) {
    if (selected === 2) {
      if (data.data) {
        for (let item of data.data.list) {
          item.status === 4 || item.text.text.includes('试用资格已过期') ? ($.giveupNum += 1) : '';
          item.status === 2 && item.text.text.includes('试用资格将保留') ? ($.successNum += 1) : '';
          item.status === 2 && item.text.text.includes('请收货后尽快提交报告') ? ($.getNum += 1) : '';
          item.status === 2 && item.text.text.includes('试用已完成') ? ($.completeNum += 1) : '';
        }
        console.log(`待领取 | 已领取 | 已完成 | 已放弃：${$.successNum} | ${$.getNum} | ${$.completeNum} | ${$.giveupNum}`);
      } else {
        console.log(`获得成功列表失败: ${data.message}`);
      }
    }
  } else {
    console.error(`ERROR:try_MyTrials`);
  }
}

async function showMsg() {
  let message = ``;
  message += `👤 京东账号${$.index} ${$.UserName}\n`;
  if ($.totalSuccess !== 0 && $.totalTry !== 0) {
    message += `🎉 本次提交申请：${$.totalSuccess}/${$.totalTry}个商品🛒\n`;
    message += `🎉 ${$.successNum}个商品待领取\n`;
    message += `🎉 ${$.getNum}个商品已领取\n`;
    message += `🎉 ${$.completeNum}个商品已完成\n`;
    message += `🗑 ${$.giveupNum}个商品已放弃\n\n`;
  } else {
    message += `⚠️ 本次执行没有申请试用商品\n`;
    message += `🎉 ${$.successNum}个商品待领取\n`;
    message += `🎉 ${$.getNum}个商品已领取\n`;
    message += `🎉 ${$.completeNum}个商品已完成\n`;
    message += `🗑 ${$.giveupNum}个商品已放弃\n\n`;
  }
  if (!args_xh.jdNotify || args_xh.jdNotify === 'false') {
    console.log($.name, message);
    notifyMsg += `${message}`;
  } else {
    console.log(message);
  }
}

/**
 * 获取账号剩余次数，目前每个账号只有5次
 */
async function try_rafflecount() {
  const options = {
    method: 'POST',
    url: 'https://api.m.jd.com/client.action',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: $.cookie,
      Origin: 'https://prodev.m.jd.com',
      Referer: 'https://prodev.m.jd.com/mall/active/3C751WNneAUaZ8Lw8xYN7cbSE8gm/index.html',
      'User-Agent': $.userAgent,
    },
    data: qs.stringify({
      appid: 'ysas-new',
      functionId: 'try_rafflecount',
      body: JSON.stringify({ previewTime: '' }),
    }),
  };

  try {
    const { data } = await axios.request(options);

    if (data.code !== '0') {
      $.isLogin = false;
      console.log(`${data.message}`);
      return;
    }
    console.log(`${data.data.promptDesc}${data.data.remainingNum}`);
    if (data.data.remainingNum === 0) {
      args_xh.except.push($.UserName);
    }
  } catch (e) {
    console.log(e);
  }
}

async function initSmashUtils() {
  try {
    $.smashUtils = new SmashUtils('https://prodev.m.jd.com/mall/active/3mpGVQDhvLsMvKfZZumWPQyWt83L/index.html?activityId=501742184&sku=10097544183544', $.cookie, $.userAgent);
    $.smashUtils['getLocalData']();
    $.smashUtils['getAppOs']();
    $.smashUtils.getBlog();
    $.smashUtils['getFpv']();
    await $.smashUtils.getInfo();
    $.smashUtils.setjoyyaCookie('init');
    $.smashUtils.getJrInfo();
  } catch (e) {
    $.smashUtils.getInterfaceData({
      funcName: 'other',
      real_msg: 'initial',
      error_msg: e && e.message,
    });
  }
  await $.smashUtils.initial({
    appId: '50170_',
    debug: !1,
    preRequest: !0,
    onSign: function (e) {
      e.code, e.message, e.data;
    },
    onRequestTokenRemotely: function (e) {
      e.code, e.message;
    },
    onRequestToken: function (e) {
      e.code, e.message;
    },
  });
}

async function initJsToken() {
  const currentTime = Date.now();

  if ($.cache[$.UserName] && $.cache[$.UserName].expiry > currentTime) {
    $.jsToken = $.cache[$.UserName].jsToken;
  } else {
    const jsTokenData = await getJsToken();
    $.jsToken = jsTokenData.token;

    // 更新缓存
    $.cache[$.UserName] = {
      jsToken: jsTokenData.token,
      expiry: currentTime + 604800000,
    };
    await writeCache();
  }
}

/**
 * 获取商品列表并且过滤
 */
async function try_feedsList(tabId, page) {
  const sign = await h5stSign(
    {
      functionId: 'try_SpecFeedList',
      appid: 'newtry',
      body: {
        tabId: String(tabId),
        page: Number(page),
        version: 2,
        source: 'default',
        client: 'outer',
      },
      'x-api-eid-token': $.jsToken,
    },
    '35fa0',
  );

  try {
    const { data } = await api({
      method: 'POST',
      url: `https://api.m.jd.com/client.action`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        origin: 'https://prodev.m.jd.com',
        Referer: 'https://prodev.m.jd.com/mall/active/3C751WNneAUaZ8Lw8xYN7cbSE8gm/index.html',
        'User-Agent': $.userAgent,
        'x-referer-page': 'https://prodev.m.jd.com/mall/active/3C751WNneAUaZ8Lw8xYN7cbSE8gm/index.html',
        'x-rp-client': 'h5_1.0.0',
      },
      data: sign.qs,
    });

    let tempKeyword = ``;
    if (data.code === '0') {
      console.log(`第 ${size++} 次获取试用商品成功，tabId:${args_xh.tabId[$.nowTabIdIndex]} 的 第 ${page} 页`);
      console.log(`获取到商品 ${data.data.feedList.length} 条`);
      for (let item of data.data.feedList) {
        if (item.applyNum === null) {
          args_xh.printLog ? console.log(`商品未到申请时间：${item.skuTitle}\n`) : '';
          continue;
        }
        if (trialActivityIdList.length >= args_xh.maxLength) {
          console.log('商品列表长度已满.结束获取');
          break;
        }
        if (item.applyState === 1) {
          args_xh.printLog ? console.log(`商品已申请试用：${item.skuTitle}\n`) : '';
          continue;
        }
        if (item.applyState !== null) {
          args_xh.printLog ? console.log(`商品状态异常，未找到skuTitle\n`) : '';
          continue;
        }
        if (args_xh.passZhongCao) {
          $.isPush = true;
          if (item.tagList.length !== 0) {
            for (let itemTag of item.tagList) {
              if (itemTag.tagType === 3) {
                args_xh.printLog ? console.log('商品被过滤，该商品是种草官专属') : '';
                $.isPush = false;
                break;
              } else if (itemTag.tagType === 5) {
                args_xh.printLog ? console.log('商品被跳过，该商品是付费试用！') : '';
                $.isPush = false;
                break;
              }
            }
          }
        }
        if (item.skuTitle && $.isPush) {
          args_xh.printLog ? console.log(`检测 tabId:${args_xh.tabId[$.nowTabIdIndex]} 的 第 ${page} 页 第 ${$.nowItem++ + 1} 个商品\n${item.skuTitle}`) : '';
          if (args_xh.whiteList) {
            if (args_xh.whiteListKeywords.some((fileter_word) => item.skuTitle.includes(fileter_word))) {
              args_xh.printLog ? console.log(`商品白名单通过，将加入试用组，trialActivityId为${item.trialActivityId}\n`) : '';
              trialActivityIdList.push(item.trialActivityId);
              trialActivityTitleList.push(item.skuTitle);
            }
          } else {
            tempKeyword = ``;
            if (parseFloat(item.jdPrice) <= args_xh.jdPrice) {
              args_xh.printLog ? console.log(`商品被过滤，商品价格 ${item.jdPrice} < ${args_xh.jdPrice} \n`) : '';
            } else if (parseFloat(item.supplyNum) < args_xh.minSupplyNum && item.supplyNum !== null) {
              args_xh.printLog ? console.log(`商品被过滤，提供申请的份数小于预设申请的份数 \n`) : '';
            } else if (parseFloat(item.applyNum) > args_xh.applyNumFilter && item.applyNum !== null) {
              args_xh.printLog ? console.log(`商品被过滤，已申请人数大于预设的${args_xh.applyNumFilter}人 \n`) : '';
            } else if (item.jdPrice === null) {
              args_xh.printLog ? console.log(`商品被过滤，商品无价，不能申请 \n`) : '';
            } else if (parseFloat(item.trialPrice) > args_xh.trialPrice) {
              args_xh.printLog ? console.log(`商品被过滤，商品试用价大于预设试用价 \n`) : '';
            } else if (args_xh.titleFilters.some((fileter_word) => (item.skuTitle.includes(fileter_word) ? (tempKeyword = fileter_word) : ''))) {
              args_xh.printLog ? console.log(`商品被过滤，含有关键词 ${tempKeyword}\n`) : '';
            } else {
              args_xh.printLog ? console.log(`商品通过，加入试用组，trialActivityId为${item.trialActivityId}\n`) : '';
              if (trialActivityIdList.indexOf(item.trialActivityId) === -1) {
                trialActivityIdList.push(item.trialActivityId);
                trialActivityTitleList.push(item.skuTitle);
              }
            }
          }
        } else if ($.isPush !== false) {
          console.error('skuTitle解析异常');
          return;
        }
      }
      console.log(`当前试用组长度为：${trialActivityIdList.length}`);
      console.log(`下一页状态:${data.data.hasNext}`);
      if (data.data.hasNext === false) {
        if ($.nowTabIdIndex < args_xh.tabId.length) {
          $.nowTabIdIndex++;
          $.nowPage = 1;
          $.nowItem = 1;
          $.retrynum = 0;
        } else {
          // 这下是真的没了
          $.retrynum = 999;
        }
      } else {
        $.nowPage++;
        $.retrynum = 0;
      }
    } else {
      console.log(`💩 获得试用列表失败: ${data.message}`);
    }
  } catch (e) {
    if (e.message === `Request failed with status code 403`) {
      $.retrynum++;
      if ($.retrynum === 4) {
        $.isForbidden = true;
        $.log('多次尝试失败，换个时间再试！');
      } else {
        console.log(`403，第 ${$.retrynum} 次重试`);
      }
    } else {
      console.log(e.message);
      console.log(`${$.name} API请求失败，请检查网路重试`);
    }
  }
}

async function h5stSign(body, appId, version = '4.9.2') {
  const options = {
    method: 'POST',
    url: `${args_xh.h5st_server}/h5st`,
    headers: { 'content-type': 'application/json' },
    data: {
      version: version,
      pin: $.UserName,
      ua: $.userAgent,
      body,
      appId,
    },
  };
  const { data } = await axios.request(options);
  return data.body;
}

async function readCache() {
  try {
    const data = await fs.readFile(cacheFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

async function writeCache() {
  await fs.writeFile(cacheFilePath, JSON.stringify($.cache, null, 2), 'utf8');
}

function Env(name, opts) {
  class Http {
    constructor(env) {
      this.env = env;
    }

    send(opts, method = 'GET') {
      opts =
        typeof opts === 'string'
          ? {
              url: opts,
            }
          : opts;
      let sender = this.get;
      if (method === 'POST') {
        sender = this.post;
      }
      return new Promise((resolve, reject) => {
        sender.call(this, opts, (err, resp, body) => {
          if (err) reject(err);
          else resolve(resp);
        });
      });
    }

    get(opts) {
      return this.send.call(this.env, opts);
    }

    post(opts) {
      return this.send.call(this.env, opts, 'POST');
    }
  }

  return new (class {
    constructor(name, opts) {
      this.name = name;
      this.http = new Http(this);
      this.data = null;
      this.dataFile = 'box.dat';
      this.logs = [];
      this.isMute = false;
      this.isNeedRewrite = false;
      this.logSeparator = '\n';
      this.startTime = new Date().getTime();
      Object.assign(this, opts);
      this.log('', `🔔${this.name}, 开始!`);
    }

    initAxios() {
      if (!this.axios) {
        this.axios = axios.create();
      }
    }

    restApi(opts, callback = () => {}) {
      this.initAxios();
      this.axios(opts).then(
        (resp) => {
          const { status, headers, data } = resp;
          callback(
            null,
            {
              status,
              headers,
              data,
            },
            data,
          );
        },
        (err) => {
          const { message: error, response: resp } = err;
          callback(error, resp, resp && resp.data);
        },
      );
    }

    log(...logs) {
      if (logs.length > 0) {
        this.logs = [...this.logs, ...logs];
      }
      console.log(logs.join(this.logSeparator));
    }

    wait(time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }

    done() {
      const endTime = new Date().getTime();
      const costTime = (endTime - this.startTime) / 1000;
      this.log('', `🔔${this.name}, 结束! 🕛 ${costTime} 秒`);
    }
  })(name, opts);
}
