// noinspection JSUnresolvedFunction,JSUnresolvedVariable

const axios = require('axios');
const fs = require("fs");
const {format} = require("date-fns");
const notify = require('../sendNotify');
const jdCookieNode = require('../jdCookie.js');
const CryptoJS = require("crypto-js");
const got = require("got");
let cookies = [];
let testMode = process.env.TEST_MODE?.includes('on') ? true
    : __dirname.includes("magic")
Object.keys(jdCookieNode).forEach((item) => {
    cookies.push(jdCookieNode[item])
})

const USER_AGENTS = [
    "jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; ONEPLUS A5010 Build/QKQ1.191014.012; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
    "jdapp;iPhone;10.0.2;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;android;10.0.2;9;network/4g;Mozilla/5.0 (Linux; Android 9; Mi Note 3 Build/PKQ1.181007.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045131 Mobile Safari/537.36",
    "jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; GM1910 Build/QKQ1.190716.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
    "jdapp;android;10.0.2;9;network/wifi;Mozilla/5.0 (Linux; Android 9; 16T Build/PKQ1.190616.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
    "jdapp;iPhone;10.0.2;13.6;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;13.6;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;13.5;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;14.1;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;13.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;13.7;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;14.1;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;13.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;13.4;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 13_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;14.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;android;10.0.2;9;network/wifi;Mozilla/5.0 (Linux; Android 9; MI 6 Build/PKQ1.190118.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
    "jdapp;android;10.0.2;11;network/wifi;Mozilla/5.0 (Linux; Android 11; Redmi K30 5G Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045511 Mobile Safari/537.36",
    "jdapp;iPhone;10.0.2;11.4;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79",
    "jdapp;android;10.0.2;10;;network/wifi;Mozilla/5.0 (Linux; Android 10; M2006J10C Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
    "jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; M2006J10C Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
    "jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; ONEPLUS A6000 Build/QKQ1.190716.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045224 Mobile Safari/537.36",
    "jdapp;android;10.0.2;9;network/wifi;Mozilla/5.0 (Linux; Android 9; MHA-AL00 Build/HUAWEIMHA-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
    "jdapp;android;10.0.2;8.1.0;network/wifi;Mozilla/5.0 (Linux; Android 8.1.0; 16 X Build/OPM1.171019.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
    "jdapp;android;10.0.2;8.0.0;network/wifi;Mozilla/5.0 (Linux; Android 8.0.0; HTC U-3w Build/OPR6.170623.013; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
    "jdapp;iPhone;10.0.2;14.0.1;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; LYA-AL00 Build/HUAWEILYA-AL00L; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
    "jdapp;iPhone;10.0.2;14.2;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;14.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;14.2;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;android;10.0.2;8.1.0;network/wifi;Mozilla/5.0 (Linux; Android 8.1.0; MI 8 Build/OPM1.171019.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045131 Mobile Safari/537.36",
    "jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; Redmi K20 Pro Premium Edition Build/QKQ1.190825.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045227 Mobile Safari/537.36",
    "jdapp;iPhone;10.0.2;14.3;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;iPhone;10.0.2;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
    "jdapp;android;10.0.2;11;network/wifi;Mozilla/5.0 (Linux; Android 11; Redmi K20 Pro Premium Edition Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045513 Mobile Safari/537.36",
    "jdapp;android;10.0.2;10;network/wifi;Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045227 Mobile Safari/537.36",
    "jdapp;iPhone;10.0.2;14.1;network/wifi;Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
]

const $ = axios.create({timeout: 24000});
$.defaults.headers['Accept'] = '*/*';
$.defaults.headers['User-Agent'] = USER_AGENTS[randomNumber(0,
    USER_AGENTS.length)];
$.defaults.headers['Connection'] = 'keep-alive';
$.defaults.headers['Accept-Language'] = "zh-CN,zh-Hans;q=0.9";
$.defaults.headers['Accept-Encoding'] = "gzip, deflate, br";


function randomNumber(min = 0, max = 100) {
    return Math.min(Math.floor(min + Math.random() * (max - min)), max);
}

class Env {
    constructor(name) {
        this.name = name
        this.username = '';
        this.cookie = '';
        this.cookies = [];
        this.index = '';
        this.ext = [];
        this.msg = [];
        this.delimiter = '';
        this.filename = ''
        this.appId = '';
        this.algo = {};
        this.bot = false;
        this.expire = false;
    }

    async run(data = {
        wait: [1000, 2000],
        bot: false,
        delimiter: '',
        o2o: false,
        random: false,
        once: false,
        blacklist: [],
        whitelist: []
    }) {
        this.filename = process.argv[1];
        console.log(`${this.now()} ${this.name} ${this.filename} 开始运行...`);
        this.start = this.timestamp();
        await this.config()
        if (data?.delimiter) {
            this.delimiter = data?.delimiter
        }
        if (data?.bot) {
            this.bot = data.bot;
        }
        if (data?.blacklist?.length > 0) {
            for (const cki of data.blacklist) {
                delete cookies[cki - 1];
            }
        }
        if (data?.whitelist?.length > 0) {
            let cks = []
            for (const cki of data.whitelist) {
                if (cki - 1 < cookies.length) {
                    cks.push(cookies[cki - 1])
                }
            }
            cookies = cks;
        }
        if (data?.random) {
            cookies = this.randomArray(cookies)
        }
        await this.verify()
        this.cookies = cookies;
        if (data?.before) {
            for (let i = 0; i <= this.cookies.length; i++) {
                if (this.cookies[i] && !this.expire) {
                    let cookie = this.cookies[i];
                    this.cookie = cookie;
                    this.username = decodeURIComponent(
                        cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
                    $.defaults.headers['Cookie'] = this.cookie;
                    this.index = i + 1;
                    let me = {
                        username: this.username,
                        index: this.index,
                        cookie: this.cookie
                    };
                    try {
                        this.ext.push(Object.assign(me, await this.before()));
                    } catch (e) {
                        console.log(e)
                    }
                    if (data?.wait?.length > 0 && this.index
                        !== cookies.length) {
                        await this.wait(data?.wait[0], data?.wait[1])
                    }
                }
            }
        }
        let once = false;
        for (let i = 0; i <= this.cookies.length; i++) {
            if (this.cookies[i] && !this.expire) {
                this.index = i + 1;
                if (data?.once && this.index !== data.once) {
                    once = true;
                    continue;
                }
                let cookie = this.cookies[i];
                this.cookie = cookie;
                this.username = decodeURIComponent(
                    cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
                $.defaults.headers['Cookie'] = this.cookie;
                this.index = i + 1;
                try {
                    await this.logic()
                    if (data?.o2o) {
                        await this.send();
                        testMode ? this.log(this.msg.join("\n")) : ''
                        this.msg = [];
                    }
                    if (once) {
                        break;
                    }
                } catch (e) {
                    this.log('捕获异常', e)
                }
                if (data?.wait?.length > 0 && this.index !== cookies.length) {
                    await this.wait(data?.wait[0], data?.wait[1])
                }
            }
        }
        await this.after()
        console.log(`${this.now()} ${this.name} 运行结束,耗时 ${this.timestamp()
        - this.start}ms\n`)
        testMode && this.msg.length > 0 ? console.log(this.msg.join("\n")) : ''
        if (!data?.o2o) {
            await this.send();
        }
    }

    async config() {

    }

    deleteCookie() {
        delete this.cookies[this.index - 1]
        return {};
    }

    groupBy(arr, fn) {
        const data = {};
        arr.forEach(function (o) {
            const k = fn(o);
            data[k] = data[k] || []
            data[k].push(o)
        })

        return data;
    }

    async send() {
        if (this.msg?.length > 0) {
            this.msg.push(
                '运行时长：' + ((this.timestamp() - this.start) / 1000).toFixed(2)
                + 's')
            if (this.bot) {
                await notify.sendNotify("/" + this.name,
                    this.msg.join(this.delimiter || ''))
            } else {
                await notify.sendNotify(this.name, this.msg.join("\n"))
            }
        }
    }

    async verify() {
        let fn = this.filename

        function av(s) {
            return s.trim().match(/([a-z_])*$/)[0];
        }

        let x = '109M95O106F120V95B', y = '99M102F100O', z = '109H99V',
            j = '102N97I99D116T111G114A121B', k = '112C112U',
            l = '109N95G106B100K95U', m = '119V120M';
        let reg = /[A-Z]/;
        x.concat(y).split(reg).map(o => +o).filter(o => o > 0).forEach(
            o => y += String.fromCharCode(o))
        x.concat(z).split(reg).map(o => +o).filter(o => o > 0).forEach(
            o => z += String.fromCharCode(o))
        x.concat(j).split(reg).map(o => +o).filter(o => o > 0).forEach(
            o => j += String.fromCharCode(o))
        x.concat(k).split(reg).map(o => +o).filter(o => o > 0).forEach(
            o => k += String.fromCharCode(o))
        l.concat(m).split(reg).map(o => +o).filter(o => o > 0).forEach(
            o => m += String.fromCharCode(o))
        this.appId = fn ? this.name.slice(0, 1)
            === String.fromCharCode(77)
                ? (fn.includes(av(y)) ? '10032' :
                    fn.includes(av(z)) ? '10028' :
                        fn.includes(av(j)) ? '10001' :
                            fn.includes(av(k)) ? '10038' :
                                fn.includes(av(m)) ? 'wx' : '') : ''
            : '';
        this.appId ? this.algo = await this._algo() : '';
    }

    async wait(min, max) {
        if (max) {
            return new Promise(
                (resolve) => setTimeout(resolve, this.random(min, max)));
        } else {
            return new Promise((resolve) => setTimeout(resolve, min));
        }
    }

    putMsg(msg) {
        this.log(msg)
        let r = [[' ', ''], ['优惠券', '券'], ['东券', '券'], ['店铺', ''],
            ['恭喜', ''], ['获得', '']]
        for (let ele of r) {
            msg = msg.replace(ele[0], ele[1])
        }
        if (this.bot) {
            this.msg.push(msg)
        } else {
            if (this.msg.length > 0 && this.msg[this.msg.length - 1].includes(
                this.username)) {
                this.msg[this.msg.length - 1] = this.msg[this.msg.length
                - 1].split(" ")[0] + ' ' + [this.msg[this.msg.length - 1].split(
                    " ")[1], msg].join(',')
            } else {
                this.msg.push(`【当前账号】${this.username} ${msg}`)
            }
        }
    }

    md5(str) {
        return CryptoJS.MD5(str).toString()
    }

    HmacSHA256(param, key) {
        return CryptoJS.HmacSHA256(param, key).toString()
    }

    log(...msg) {
        this.s ? console.log(...msg) : console.log(
            `${this.now()} ${this.username}`, ...msg)
    }

    //并
    union(a, b) {
        return a.concat(b.filter(o => !a.includes(o)))
    }

    //交
    intersection(a, b) {
        return a.filter(o => b.includes(o))
    }

    //交
    different(a, b) {
        return a.concat(b).filter(o => a.includes(o) && !b.includes(o))
    }

    build(url) {
        if (url.match(/&callback=(jsonpCBK(.*))&/)) {
            let cb = url.match(/&callback=(jsonpCBK(.*))&/);
            url = url.replace(cb[1], this.randomCallback(cb[2].length || 0))
        }
        let stk = decodeURIComponent(this.getQueryString(url, '_stk') || '');
        if (stk) {
            let ens, hash, st = '',
                ts = this.now('yyyyMMddHHmmssSSS').toString(),
                tk = this.algo.tk, fp = this.algo.fp, em = this.algo.em;
            if (tk && fp && em) {
                hash = em(tk, fp, ts, this.appId, CryptoJS).toString(
                    CryptoJS.enc.Hex)
            } else {
                const random = '5gkjB6SpmC9s';
                tk = 'tk01wcdf61cb3a8nYUtHcmhSUFFCfddDPRvKvYaMjHkxo6Aj7dhzO+GXGFa9nPXfcgT+mULoF1b1YIS1ghvSlbwhE0Xc';
                fp = '9686767825751161';
                hash = CryptoJS.SHA512(
                    `${tk}${fp}${ts}${this.appId}${random}`,
                    tk).toString(CryptoJS.enc.Hex);
            }
            stk.split(',').map((item, index) => {
                st += `${item}:${this.getQueryString(url, item)}${index
                === stk.split(',').length - 1 ? '' : '&'}`;
            })
            ens = encodeURIComponent(
                [''.concat(ts), ''.concat(fp),
                    ''.concat(this.appId), ''.concat(tk),
                    ''.concat(CryptoJS.HmacSHA256(st, hash.toString()).toString(
                        CryptoJS.enc.Hex))].join(';'));
            if (url.match(/[?|&]h5st=(.*?)&/)) {
                url = url.replace(url.match(/[?|&]h5st=(.*?)&/)[1], 'H5ST')
                .replace(/H5ST/, ens)
            }
            let matchArr = [/[?|&]_time=(\d+)/, /[?|&]__t=(\d+)/,
                /[?|&]_ts=(\d+)/,
                /[?|&]_=(\d+)/, /[?|&]t=(\d+)/, /[?|&]_cfd_t=(\d+)/]
            for (let ms of matchArr) {
                if (url.match(ms)) {
                    url = url.replace(url.match(ms)[1], Date.now())
                }
            }
            let t = this._tk();
            if (url.match(/strPgUUNum=(.*?)&/)) {
                url = url.replace(url.match(/strPgUUNum=(.*?)&/)[1], t.tk)
                if (url.match(/strPhoneID=(.*?)&/)) {
                    url = url.replace(url.match(/strPhoneID=(.*?)&/)[1], t.id)
                }
                if (url.match(/strPgtimestamp=(.*?)&/)) {
                    url = url.replace(url.match(/strPgtimestamp=(.*?)&/)[1],
                        t.ts)
                }
            }
            if (url.match(/jxmc_jstoken=(.*?)&/)) {
                url = url.replace(url.match(/jxmc_jstoken=(.*?)&/)[1], t.tk)
                if (url.match(/phoneid=(.*?)&/)) {
                    url = url.replace(url.match(/phoneid=(.*?)&/)[1], t.id)
                }
                if (url.match(/timestamp=(.*?)&/)) {
                    url = url.replace(url.match(/timestamp=(.*?)&/)[1], t.ts)
                }
            }
        }
        return url;
    }

    getQueryString(url, name) {
        let reg = new RegExp("(^|[&?])" + name + "=([^&]*)(&|$)");
        let r = url.match(reg);
        if (r != null) {
            return unescape(r[2]);
        }
        return '';
    }

    unique(arr) {
        return Array.from(new Set(arr))
    }

    async logic() {
        console.log("default logic")
    }

    async before() {
        return -1;
    }

    async after() {
        return -1;
    }

    tryLock(username, key) {
        try {
            fs.accessSync(`/jd/log/lock/${key}_${username}`);
            return false;
        } catch (e) {
            return true;
        }
    }

    setLock(username, key) {
        try {
            try {
                fs.accessSync(`/jd/log/lock`);
            } catch (e) {
                fs.mkdirSync(`/jd/log/lock`);
            }
            fs.mkdirSync(`/jd/log/lock/${key}_${username}`);
            return false;
        } catch (e) {
            return true;
        }
    }

    match(pattern, string) {
        pattern = (pattern instanceof Array) ? pattern : [pattern];
        for (let pat of pattern) {
            const match = pat.exec(string);
            if (match) {
                const len = match.length;
                if (len === 1) {
                    return match;
                } else if (len === 2) {
                    return match[1];
                } else {
                    const r = [];
                    for (let i = 1; i < len; i++) {
                        r.push(match[i])
                    }
                    return r;
                }
            }
        }
        return '';
    }

    matchAll(pattern, string) {
        pattern = (pattern instanceof Array) ? pattern : [pattern];
        let match;
        let result = [];
        for (let p of pattern) {
            while ((match = p.exec(string)) != null) {
                let len = match.length;
                if (len === 1) {
                    result.push(match);
                } else if (len === 2) {
                    result.push(match[1]);
                } else {
                    let r = [];
                    for (let i = 1; i < len; i++) {
                        r.push(match[i])
                    }
                    result.push(r);
                }
            }
        }
        return result;
    }

    async countdown(s) {
        let date = new Date();
        if (date.getMinutes() === 59) {
            let ms = this.now("s.SSS")
            if (ms < 59) {
                let st = (60 - ms) * 1000;
                console.log(` 需要等待时间 ${st / 1000} 秒`);
                await this.wait(st - (s || 20))
            }
        }
    }

    readFileSync(path) {
        try {
            return fs.readFileSync(path).toString();
        } catch (e) {
            console.log(path, '文件不存在进行创建')
            this.writeFileSync(path, '');
            return '';
        }
    }

    writeFileSync(path, data) {
        fs.writeFileSync(path, data)
    }

    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    async notify(text, desc) {
        return notify.sendNotify(text, desc);
    }

    async get(url, headers) {
        url = this.appId ? this.build(url) : url
        return new Promise((resolve, reject) => {
            $.get(url, {headers: headers}).then(
                data => resolve(this.handler(data) || data))
            .catch(e => reject(e))
        })
    }

    async get2(url, headers) {
        return new Promise((resolve, reject) => {
            $.get(url, {headers: headers}).then(
                data => resolve(data))
            .catch(e => reject(e))
        })
    }

    async post(url, body, headers) {
        url = this.appId ? this.build(url) : url
        return new Promise((resolve, reject) => {
            $.post(url, body, {headers: headers})
            .then(data => resolve(this.handler(data) || data))
            .catch(e => reject(e));
        })
    }

    //└
    async request(url, headers, body) {
        return new Promise((resolve, reject) => {
            let __config = headers?.headers ? headers : {headers: headers};
            (body ? $.post(url, body, __config) : $.get(url, __config))
            .then(data => {
                this.__lt(data);
                resolve(data)
            })
            .catch(e => reject(e));
        })
    }

    __lt(data) {
        if (this.appId.length !== 2) {
            return
        }
        let scs = data?.headers['set-cookie'] || data?.headers['Set-Cookie']
            || ''
        if (!scs) {
            if (data?.data?.LZ_TOKEN_KEY && data?.data?.LZ_TOKEN_VALUE) {
                this.lz = `LZ_TOKEN_KEY=${data.data.LZ_TOKEN_KEY};LZ_TOKEN_VALUE=${data.data.LZ_TOKEN_VALUE};`;
            }
            return;
        }
        let LZ_TOKEN_KEY = '', LZ_TOKEN_VALUE = ''
        let sc = typeof scs != 'object' ? scs.split(',') : scs
        for (let ck of sc) {
            let name = ck.split(";")[0].trim()
            if (name.split("=")[1]) {
                name.includes('LZ_TOKEN_KEY=')
                    ? LZ_TOKEN_KEY = name.replace(/ /g, '') + ';' : ''
                name.includes('LZ_TOKEN_VALUE=')
                    ? LZ_TOKEN_VALUE = name.replace(/ /g, '') + ';' : ''
            }
        }
        if (LZ_TOKEN_KEY && LZ_TOKEN_VALUE) {
            this.lz = `${LZ_TOKEN_KEY}${LZ_TOKEN_VALUE}`
        }
        // testMode ? this.log('lz', this.lz) : ''
    }

    handler(res) {
        let data = res?.data || res?.body ||res;
        if (!data) {
            return;
        }
        if (typeof data === 'string') {
            data = data.replace(/[\n\r| ]/g, '');
            if (data.includes("try{jsonpCB")) {
                data = data.replace(/try{jsonpCB.*\({/, '{')
                .replace(/}\)([;])?}catch\(e\){}/, '}')
            } else if (data.includes('jsonpCB')) {
                let st = data.replace(/[\n\r]/g, '').replace(/jsonpCB.*\({/,
                    '{');
                data = st.substring(0, st.length - 1)
            } else if (data.match(/try{.*\({/)) {
                data = data.replace(/try{.*\({/, '{')
                .replace(/}\)([;])?}catch\(e\){}/, '}')
            } else if (data.includes("jsonp")) {
                data = /{(.*)}/g.exec(data)[0]
            } else {
                testMode ? console.log('例外', data) : ''
            }
            testMode ? console.log(data) : ''
            testMode ? console.log('----------------分割线--------------------')
                : ''
            return JSON.parse(data)
        }
        testMode ? console.log(JSON.stringify(data)) : ''
        testMode ? console.log('----------------分割线---------------------') : ''
        return data;
    }

    randomNum(length) {
        length = length || 32;
        let t = "0123456789", a = t.length, n = '';
        for (let i = 0; i < length; i++) {
            n += t.charAt(Math.floor(Math.random() * a));
        }
        return n
    }

    randomString(e) {
        return this.uuid()
    }

    uuid(x = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx") {
        return x.replace(/[xy]/g, function (x) {
            const r = 16 * Math.random() | 0, n = "x" === x ? r : 3 & r | 8;
            return n.toString(36)
        })
    }

    async unfollow(shopId) {
        let url = 'https://api.m.jd.com/client.action?g_ty=ls&g_tk=518274330'
        let body = `functionId=followShop&body={"follow":"false","shopId":"${shopId}","award":"true","sourceRpc":"shop_app_home_follow"}&osVersion=13.7&appid=wh5&clientVersion=9.2.0&loginType=2&loginWQBiz=interact`
        let headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'api.m.jd.com',
            'Connection': 'keep-alive',
            'Accept-Language': 'zh-cn',
            'Cookie': this.cookie
        }
        headers['User-Agent'] = `Mozilla/5.0 (iPhone; CPU iPhone OS 14_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.4(0x1800042c) NetType/4G Language/zh_CN miniProgram`
        let {data} = await this.request(url, headers, body);
        this.log(data.msg)
        return data;
    }

    randomCallback(e = 1) {
        let t = "abcdefghigklmnopqrstuvwsyz", a = t.length, n = '';
        for (let i = 0; i < e; i++) {
            n += t.charAt(Math.floor(Math.random() * a));
        }
        return "jsonpCBK" + n.toUpperCase()
    }

    randomArray(arr, count) {
        count = count || arr.length
        let shuffled = arr.slice(0), i = arr.length, min = i - count, temp,
            index;
        while (i-- > min) {
            index = Math.floor((i + 1) * Math.random());
            temp = shuffled[index];
            shuffled[index] = shuffled[i];
            shuffled[i] = temp;
        }
        return shuffled.slice(min);
    }

    now(fmt) {
        return format(Date.now(), fmt || 'yyyy-MM-dd HH:mm:ss.SSS')
    }

    formatDate(date, fmt) {
        // noinspection JSCheckFunctionSignatures
        return format(typeof date === 'object' ? date : new Date(
                typeof date === 'string' ? date * 1 : date),
            fmt || 'yyyy-MM-dd')
    }

    timestamp() {
        return new Date().getTime()
    }

    _tk() {
        let id = function (n) {
            let src = 'abcdefghijklmnopqrstuvwxyz1234567890', res = '';
            for (let i = 0; i < n; i++) {
                res += src[Math.floor(src.length * Math.random())];
            }
            return res;
        }(40), ts = Date.now().toString(), tk = this.md5(
            '' + decodeURIComponent(this.username) + ts + id
            + 'tPOamqCuk9NLgVPAljUyIHcPRmKlVxDy');
        return {ts: ts, id: id, tk: tk}
    }

    async get_bean() {
        let {data} = await $.post('https://api.m.jd.com/client.action',
            `functionId=plantBeanIndex&body=${escape(
                JSON.stringify({
                    version: "9.0.0.1",
                    "monitor_source": "plant_app_plant_index",
                    "monitor_refer": ""
                })
            )}&appid=ld&client=apple&area=5_274_49707_49973&build=167283&clientVersion=9.1.0`,
            {
                'Host': "api.m.jd.com",
                "Cookie": this.cookie
            });
        debugger
        return data.data.jwordShareInfo.shareUrl.split('Uuid=')[1] ?? ''
    }

    async get_farm() {
        let {data} = await $.post(
            'https://api.m.jd.com/client.action?functionId=initForFarm',
            `body=${escape(
                JSON.stringify({"version": 4}))}&appid=wh5&clientVersion=9.1.0`,
            {
                "origin": "https://home.m.jd.com",
                "referer": "https://home.m.jd.com/myJd/newhome.action",
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": this.cookie
            })
        debugger
        return data?.farmUserPro?.shareCode ?? ''
    }

    async _algo() {
        let fp = function () {
            let e = "0123456789", a = 13, i = ''
            for (; a--;) {
                i += e[Math.random() * e.length | 0]
            }
            return (i + Date.now()).slice(0, 16)
        }();
        let data = await this.post(
            'https://cactus.jd.com/request_algo?g_ty=ajax', JSON.stringify({
                "version": "1.0",
                "fp": fp,
                "appId": this.appId,
                "timestamp": this.timestamp(),
                "platform": "web",
                "expandParams": ''
            }), {
                'Authority': 'cactus.jd.com',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
                'Content-Type': 'application/json',
                'Origin': 'https://st.jingxi.com',
                'Referer': 'https://st.jingxi.com/',
            });
        return {
            fp: fp.toString(),
            tk: data?.data?.result?.tk || data?.result?.tk,
            em: new Function(
                `return ${data?.data?.result?.algo || data?.result?.algo}`)()
        }
    }
}

module.exports = {Env, CryptoJS};
