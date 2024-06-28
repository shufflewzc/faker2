const CryptoJS = require("crypto-js");
const ADLER32 = require("adler-32");
const {BaseH5st} = require("./baseH5st");
const qs = require("qs");

class H5st extends BaseH5st {
    constructor(url, cookieStr, userAgent, config) {
        super(url, cookieStr, userAgent);

        if (url) {
            try {
                this.url = url;
            } catch (e) {
                console.log('url传递错误')
            }
        }

        if (url) {
            try {
                this.url = url;
            } catch (e) {
                console.log("url传递错误");
            }
        }

        this.childElementCount = 0;
        this.v = "v_lite_f_4.4.0"

        this._storageFpKey = 'WQ_lite_vk1';
        this._defaultToken = "";
        this._appId = "";
        this._defaultAlgorithm = {
            local_key_1: CryptoJS.MD5, local_key_2: CryptoJS.SHA256, local_key_3: CryptoJS.HmacSHA256
        };
        this._version = '4.4';
        this._fingerprint = "";
        this.settings = {
            debug: !1
        };
        this.ErrCodes = {
            UNSIGNABLE_PARAMS: 1, APPID_ABSENT: 2, TOKEN_EMPTY: 3, GENERATE_SIGNATURE_FAILED: 4, UNHANDLED_ERROR: -1
        };
        this.__iniConfig(Object.assign({}, this.settings, config));
    }

    __iniConfig(t) {
        if (!("string" === typeof t.appId && t.appId)) {
            console.error('settings.appId must be a non-empty string')
        }
        this._appId = t.appId || "";
        if (this._appId) {
            this._storageFpKey = this._storageFpKey + "_" + this._appId + "_" + this._version
        }
        this._debug = Boolean(t.debug);
        this._onSign = "function" === typeof t.onSign ? t.onSign : function () {
        };
        this._log(`create instance with appId=${this._appId}`)
    }

    __genDefaultKey(t, r, n, e) {
        return super.__genDefaultKey(t, `${t}${r}${n}${e}qV!+A!`);
    }

    __genSignParams(t, e, r, n) {
        return ["" + r, "" + this._fingerprint, "" + this._appId, "" + this._defaultToken, "" + t, "" + this._version, "" + e, "" + n].join(";")
    }

    __genSign(t, e) {
        const i = baseUtils.getDefaultMethod(e, 'map').call(e, (function (t) {
            return t.key + ":" + t.value
        })).join("&");
        const a = CryptoJS.MD5(t + i + t).toString(CryptoJS.enc.Hex);
        this._log(`__genSign, paramsStr:${i}, signedStr:${a}`)
        return a
    }

    async __requestDeps() {
        this._fingerprint = this.getSync(this._storageFpKey);
        if (!this._fingerprint) {
            this._fingerprint = this.generateVisitKey();
            this.setSync(this._storageFpKey, this._fingerprint, {expire: 3600 * 24 * 365});
        }
        this._log('__requestDeps, fp:' + this._fingerprint);
    }

    __makeSign(t, e) {
        function format() {
            let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : Date.now(),
                e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "yyyy-MM-dd", n = new Date(t),
                r = e, o = {
                    "M+": n.getMonth() + 1,
                    "d+": n.getDate(),
                    "D+": n.getDate(),
                    "h+": n.getHours(),
                    "H+": n.getHours(),
                    "m+": n.getMinutes(),
                    "s+": n.getSeconds(),
                    "w+": n.getDay(),
                    "q+": Math.floor((n.getMonth() + 3) / 3),
                    "S+": n.getMilliseconds(),
                };
            return (/(y+)/i.test(r) && (r = r.replace(RegExp.$1, "".concat(n.getFullYear()).substr(4 - RegExp.$1.length))), Object.keys(o).forEach(function (t) {
                if (new RegExp("(".concat(t, ")")).test(r)) {
                    var e = "S+" === t ? "000" : "00";
                    r = r.replace(RegExp.$1, 1 == RegExp.$1.length ? o[t] : "".concat(e).concat(o[t]).substr("".concat(o[t]).length));
                }
            }), r);
        }

        let i = Date.now(), a = format(i, 'yyyyMMddhhmmssSSS'), u = a + "88";
        this._defaultToken = this.genLocalTK(this._fingerprint);
        let o = this.__genDefaultKey(this._defaultToken, this._fingerprint, u, this._appId)
        if (!o) {
            if (this._defaultToken) {
                this._onSign({code: this.ErrCodes.GENERATE_SIGNATURE_FAILED, message: 'generate key failed'})
            } else {
                this._onSign({code: this.ErrCodes.TOKEN_EMPTY, message: 'token is empty'})
            }
            return {};
        }

        const f = this.__genSign(o, t);
        const l = baseUtils.getDefaultMethod(t, 'map').call(t, (function (t) {
            return t.key
        })).join(",");
        const h = 1;
        const p = this.__genSignParams(f, i, a, e);
        this._log(`__makeSign, result:${JSON.stringify({
            key: o, signStr: f, _stk: l, _ste: h, h5st: p
        })}`)
        this._onSign({code: 0, message: 'success'})
        return {_stk: l, _ste: h, h5st: p};
    }

    __collect() {
        let n = this.envCollect(1);
        n.fp = this._fingerprint;
        if (0 === n['extend']['bu2']) {
            n['extend']['bu2'] = -1
        }
        let o = JSON.stringify(n, null, 2)
        this._log(`__collect envCollect=${o}`)
        let i = CryptoJS.AES.encrypt(o, CryptoJS.enc.Utf8.parse('r1T.6Vinpb.k+/a)'), {iv: CryptoJS.enc.Utf8.parse("0102030405060708")});
        return i.ciphertext.toString()
    }

    genLocalTK(t) {
        const that = this;

        function b(t) {
            function w(t) {
                return baseUtils.getDefaultMethod(Array.prototype, 'map').call(t, (function (t) {
                    var e;
                    return baseUtils.getDefaultMethod(e = "00" + (255 & t).toString(16), 'slice').call(e, -2)
                })).join("")
            }

            function _(t) {
                var e = new Uint8Array(t.length);
                return baseUtils.getDefaultMethod(Array.prototype, 'forEach').call(e, (function (e, r, n) {
                    n[r] = t.charCodeAt(r)
                })), w(e)
            }

            function x(t) {
                var o = function () {
                    var t = new ArrayBuffer(2);
                    new DataView(t).setInt16(0, 256, !0);
                    return 256 === new Int16Array(t)[0];
                }();
                var i = Math.floor(t / Math.pow(2, 32));
                var a = t % Math.pow(2, 32);
                var u = new ArrayBuffer(8);
                var c = new DataView(u);
                o ? (c.setUint32(0, a, o), c.setUint32(4, i, o)) : (c.setUint32(0, i, o), c.setUint32(4, a, o))
                return new Uint8Array(u)
            }

            var n = "", o = Date.now(), u = 'HiO81-Ei89DH', v = function (t, e, r, n) {
                var i = new Uint8Array(16);
                baseUtils.getDefaultMethod(Array.prototype, 'forEach').call(i, (function (e, r, n) {
                    n[r] = t.charCodeAt(r)
                }));
                var u = x(e), c = new Uint8Array(2);
                baseUtils.getDefaultMethod(Array.prototype, 'forEach').call(c, (function (t, e, n) {
                    n[e] = r.charCodeAt(e)
                }));
                var f = new Uint8Array(12);
                baseUtils.getDefaultMethod(Array.prototype, 'forEach').call(f, (function (t, e, r) {
                    r[e] = n.charCodeAt(e)
                }));
                var s = new Uint8Array(38);
                s.set(c), s.set(f, 2), s.set(u, 14), s.set(i, 22);
                var l = ADLER32.buf(s);
                l >>>= 0;
                var h = '00000000' + l.toString(16);
                return h.substr(h.length - 8)
            }(t, o, "(>", u);
            n += _(v), n += _("(>"), n += _(u), n += function (t) {
                return w(x(t))
            }(o), n += _(t);
            var g = CryptoJS.enc.Hex.parse(n), b = CryptoJS.AES.encrypt(g, CryptoJS.enc.Utf8.parse('eHL4|FW#Chc3#q?0'), {iv: CryptoJS.enc.Utf8.parse('0102030405060708')});
            return that.fromBase64(CryptoJS.enc.Base64.stringify(b.ciphertext))
        }

        var r = {magic: "tk", version: "02", platform: "w", expires: "41", producer: "l"};
        r.expr = function () {
            for (var r = that.getRandomIDPro({
                size: 32, dictType: 'max', customDict: null
            }), n = ["1", "2", "3"], o = ["+", "x"], i = (2 + Math.floor(4 * Math.random())), a = "", u = 0; u < i; u++) a += n[Math.floor((Math.random() * 3))], (u < i - 1) && (a += o[Math.floor((Math.random() * 2))]);
            (a.length < 9) && (a += r.substr(0, (9 - a.length)));
            var f = CryptoJS.enc.Utf8.parse(a), s = CryptoJS.enc.Base64.stringify(f);
            return that.fromBase64(s)
        }();
        r.cipher = b(t);
        r.adler32 = function (t) {
            var r = ADLER32.str(t);
            r >>>= 0;
            var n = '00000000' + r.toString(16);
            return n.substr(n.length - 8)
        }(r.magic + r.version + r.platform + r.expires + r.producer + r.expr + r.cipher);
        return r.magic + r.version + r.platform + r.adler32 + r.expires + r.producer + r.expr + r.cipher
    }

    getRandomIDPro() {
        var t, e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, r = e.size,
            n = void 0 === r ? 10 : r, o = e.dictType, i = void 0 === o ? "number" : o, a = e.customDict, u = "";
        if (a && "string" == typeof a) t = a; else switch (i) {
            case"alphabet":
                t = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
                break;
            case"max":
                t = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-";
                break;
            default:
                t = "0123456789"
        }
        for (; n--;) u += t[Math.random() * t.length | 0];
        return u
    }

    fromBase64(t) {
        return t.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
    }

    generateVisitKey() {
        const that = this;

        function d(t, e) {
            var r, f = [], s = t.length, l = hh(t);
            try {
                for (l.s(); !(r = l.n()).done;) {
                    var p = r.value;
                    if (Math.random() * s < e && (f.push(p), 0 == --e)) {
                        break;
                    }
                    s--
                }
            } catch (t) {
                l.e(t)
            } finally {
                l.f()
            }
            for (var d = "", g = 0; g < f.length; g++) {
                var y = (Math.random() * (f.length - g) | 0);
                d += f[y], f[y] = f[((f.length - g) - 1)]
            }
            return d
        }

        function hh(t, u) {
            function p(t, e) {
                (null == e || e > t.length) && (e = t.length);
                for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
                return n
            }

            var c = void 0 !== o && i(t) || t["@@iterator"];
            if (!c) {
                if (Array.isArray(t) || (c = function (t, e) {
                    var o;
                    if (!t) return;
                    if ("string" == typeof t) return p(t, e);
                    var i = baseUtils.getDefaultMethod(o = Object.prototype.toString.call(t), 'slice').call(o, 8, -1);
                    "Object" === i && t.constructor && (i = t.constructor.name);
                    if ("Map" === i || "Set" === i) return n(t);
                    if ("Arguments" === i || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i)) return p(t, e)
                }(t)) || u && t && "number" == typeof t.length) {
                    c && (t = c);
                    var f = 0, s = function () {
                    };
                    return {
                        s: s, n: function () {
                            return f >= t.length ? {done: !0} : {done: !1, value: t[f++]}
                        }, e: function (t) {
                            throw t
                        }, f: s
                    }
                }
                throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
            }
            var l, h = !0, d = !1;
            return {
                s: function () {
                    c = c.call(t)
                }, n: function () {
                    var t = c.next();
                    return h = t.done, t
                }, e: function (t) {
                    for (var r = e, n = [], o = 0; ;) switch (r[o++]) {
                        case 11:
                            n.push(!0);
                            break;
                        case 18:
                            l = n[n.length - 1];
                            break;
                        case 33:
                            n.push(t);
                            break;
                        case 74:
                            d = n[n.length - 1];
                            break;
                        case 95:
                            return;
                        case 99:
                            n.pop()
                    }
                }, f: function () {
                    try {
                        h || null == c.return || c.return()
                    } finally {
                        if (d) throw l
                    }
                }
            }
        }

        function y(t, e) {
            for (var r = 0; r < e.length; r++) {
                -1 !== baseUtils.getDefaultMethod(t, 'indexOf').call(t, e[r]) && (t = t.replace(e[r], ""))
            }
            return t
        }

        function g(t) {
            for (var e = t.size, n = t.num, o = ""; e--;) o += n[0 | (Math.random() * n.length)];
            return o
        }

        var r = '1uct6d0jhq';
        var n = d(r, 4);
        var o = 10 * Math.random() | 0;
        var i = y(r, n);
        var a = ((g({size: o, num: i}) + n + g({size: 12 - o - 1, num: i})) + o).split("");
        var u = baseUtils.getDefaultMethod(a, 'slice').call(a, 0, 8);
        var l = baseUtils.getDefaultMethod(a, 'slice').call(a, 8);
        var h = [];
        for (; u.length > 0;) {
            h.push((35 - parseInt(u.pop(), 36)).toString(36))
        }
        return (h = baseUtils.getDefaultMethod(h, 'concat').call(h, l)).join("")
    }
}

async function test(cookieStr, userAgent) {
    var h5stObj = new H5st("https://prodev.m.jd.com/mall/active/3C751WNneAUaZ8Lw8xYN7cbSE8gm/index.html?ids=501730512%2C501676150&navh=49&stath=37&tttparams=wUQ86eyJhZGRyZXNzSWQiOjAsImRMYXQiOjAsImRMbmciOjAsImdMYXQiOiIzOS45NDQwOTMiLCJnTG5nIjoiMTE2LjQ4MjI3NiIsImdwc19hcmVhIjoiMF8wXzBfMCIsImxhdCI6MCwibG5nIjowLCJtb2RlbCI6IlJlZG1pIE5vdGUgMTJUIFBybyIsInBvc0xhdCI6IjM5Ljk0NDA5MyIsInBvc0xuZyI6IjExNi40ODIyNzYiLCJwcnN0YXRlIjoiMCIsInVlbXBzIjoiMC0wLTAiLCJ1bl9hcmVhIjoiMV83Ml81NTY3NF8wIn50%3D&preventPV=1&forceCurrentView=1", cookieStr, userAgent, {
        debug: true,
        appId: "35fa0",
    });

    var a = await h5stObj.sign({
        functionId: "try_SpecFeedList",
        appid: "newtry",
        body: JSON.stringify({"tabId":"212","page":1,"version":2,"source":"default","client":"outer","tryIds":["501730512","501676150"]})
    });
    console.log(a);

    let params = qs.stringify({
        functionId: "try_SpecFeedList",
        appid: "newtry",
        body: JSON.stringify({"tabId":"212","page":1,"version":2,"source":"default","client":"outer","tryIds":["501730512","501676150"]}),
        'h5st': a.h5st
    });
    console.log(params);

    try {
        const {data} = await api({
            method: "POST",
            url: `https://api.m.jd.com/client.action`,
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                origin: "https://prodev.m.jd.com",
                Referer: "https://prodev.m.jd.com/mall/active/3C751WNneAUaZ8Lw8xYN7cbSE8gm/index.html?ids=501730512%2C501676150&navh=49&stath=37&tttparams=wUQ86eyJhZGRyZXNzSWQiOjAsImRMYXQiOjAsImRMbmciOjAsImdMYXQiOiIzOS45NDQwOTMiLCJnTG5nIjoiMTE2LjQ4MjI3NiIsImdwc19hcmVhIjoiMF8wXzBfMCIsImxhdCI6MCwibG5nIjowLCJtb2RlbCI6IlJlZG1pIE5vdGUgMTJUIFBybyIsInBvc0xhdCI6IjM5Ljk0NDA5MyIsInBvc0xuZyI6IjExNi40ODIyNzYiLCJwcnN0YXRlIjoiMCIsInVlbXBzIjoiMC0wLTAiLCJ1bl9hcmVhIjoiMV83Ml81NTY3NF8wIn50%3D&preventPV=1&forceCurrentView=1",
                "User-Agent": userAgent,
                "x-referer-page": "https://prodev.m.jd.com/mall/active/3C751WNneAUaZ8Lw8xYN7cbSE8gm/index.html"
            },
            data: params
        });
        console.log(data);
    } catch (e) {
        console.log(e.message)
    }
}

module.exports = {
    H5st,
    test
}
