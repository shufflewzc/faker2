const CryptoJS = require("crypto-js");
const {BaseUtils} = require("./baseUtils");
const os = require('os');

class BaseH5st {

    constructor(url, cookieStr, userAgent) {
        global.baseUtils || new BaseUtils();
        baseUtils.changeEnv(url, cookieStr, userAgent);

        this.ErrCodes = {
            UNSIGNABLE_PARAMS: 1, APPID_ABSENT: 2, TOKEN_EMPTY: 3, GENERATE_SIGNATURE_FAILED: 4, UNHANDLED_ERROR: -1
        };

        this._defaultAlgorithm = {};
        this._debug = false;

        this.settings = {
            debug: !1, preRequest: !1, timeout: 2,
        };
    }

    _log(log) {
        if (this._debug) {
            console.log('[sign]', log)
        }
    }

    getSync(t) {
        let item = window.localStorage.getItem(t);
        if (item) {
            let r = JSON.parse(item);
            if (!r || !r.t || !r.e || 0 === r.e || new Date - r.t >= 1e3 * r.e) {
                this.removeSync(t);
                return "";
            }
            return r.v
        }
        return ""
    }

    setSync(t, r, n, e) {
        let i = {
            v: r,
            t: (new Date).getTime(),
            e: "number" != typeof n.expire ? 0 : n.expire
        }
        window.localStorage.setItem(t, JSON.stringify(i));
    }

    removeSync(t) {
        window.localStorage.removeItem(t)
    }

    __genDefaultKey(t, z) {
        let A = "";
        let S = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(baseUtils.decodeBase64URL(this.__parseToken(t, 16, 28)))),
            B = S.match(/^[123]([x+][123])+/);
        if (B) {
            var j = B[0]["split"](""),
                M = "";
            j.forEach((r) => {
                if (isNaN(r)) {
                    if (["+", "x"].includes(r)) M = r;
                } else {
                    var a = `local_key_${r}`;
                    if (this._defaultAlgorithm[a]) {
                        switch (M) {
                            case "+":
                                A = `${A}${this.__algorithm(a, z, t)}`;
                                break;
                            case "x":
                                A = this.__algorithm(a, A, t);
                                break;
                            default:
                                A = this.__algorithm(a, z, t);
                        }
                    }
                }
            })
        }
        this._log(`__genDefaultKey input=${z},express=${S},key=${A}`)
        return A;
    }

    __algorithm(t, r, n) {
        return t === "local_key_3" ? this._defaultAlgorithm[t](r, n).toString(CryptoJS.enc.Hex) : this._defaultAlgorithm[t](r).toString(CryptoJS.enc.Hex);
    }

    __parseToken(t, r, n) {
        if (t) return baseUtils.getDefaultMethod(t, 'slice').call(t, r, n);
        return "";
    }

    __parseAlgorithm(t, r) {
        this["_token"] = t || "";
        this.__genKey = r && new Function(`return ${r}`)() || null;
        return !(!this["_token"] || !this.__genKey);
    }

    __genSign(t, r) {
        var y = baseUtils.getDefaultMethod(r, 'map')["call"](r, function (t) {
            return t["key"] + ":" + t.value;
        })["join"]("&");
        var d = CryptoJS.HmacSHA256(y, t).toString(CryptoJS.enc.Hex);
        this._log(`__genSign, paramsStr:${y}, signedStr:${d}`);
        return d;
    }

    async __requestAlgorithmOnce() {
        await this.__requestAlgorithm();
    }

    async __requestAlgorithm() {
        this._log("__requestAlgorithm start.");
        var r = this.envCollect(0);
        r.ai = this._appId;
        r.fp = this._fingerprint;
        var n = JSON.stringify(r, null, 2);
        this._log(`__requestAlgorithm envCollect=${n}`);
        var e = this.aes(n , 'wm0!@w-s#ll1flo(', "0102030405060708");
        var dt = {
            fingerprint: this._fingerprint, appId: this._appId, version: this._version, env: e, debug: this._debug,
        };

        try {
            var {data} = await api({
                url: "https://cactus.jd.com/request_algo",
                method: "post",
                data: {
                    version: dt.version,
                    fp: dt.fingerprint,
                    appId: dt.appId,
                    timestamp: Date.now(),
                    platform: "web",
                    expandParams: dt.env,
                    fv: this.v,
                },
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                    Origin: "https://cactus.jd.com",
                    Host: "cactus.jd.com",
                    accept: "*/*",
                    "User-Agent": navigation.userAgent,
                },
            });

            if (data && data.status === 200 && data.data && data.data.result) {
                var c = data.data.result;
                if (c.algo && c.tk && c.fp) {
                    var l = c.fp === this._fingerprint,
                        p = l ? this.getSync(this._storageFpKey, 1) : "",
                        d = p && c.fp === p;
                    if (d) {
                        var z = this.__parseToken(c.tk, 13, 15);
                        var x = parseInt(z, 16);
                        var w = x * 60 * 60;
                        this.setSync(this._storagetokenKey, CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(c.tk)), {
                            expire: w,
                        });
                        this.setSync(this._storageAlgnKey, CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(c.algo)), {
                            expire: w,
                        });
                    }
                    this._log(`__requestAlgorithm request success!, check memory fp:${l}, check storage fp:${d}, token:${c.tk}, storageFp:${p}, fp:${c.fp}`);
                } else {
                    throw new Error("data.result format error.");
                }
            } else {
                throw new Error("request params error.");
            }
        } catch (error) {
            throw new Error(`request error, ${error.code}, ${error.message}`);
        }
        this._log(this._debug, "__requestAlgorithm end.");
    }

    __checkParams(t) {
        let u = null;
        if (!this._appId) {
            u = {
                code: this.ErrCodes.APPID_ABSENT, message: "appId is required"
            }
        }
        if (!baseUtils.isPlainObject(t)) {
            u = {
                code: this.ErrCodes.UNSIGNABLE_PARAMS, message: 'params is not a plain object'
            }
        }
        if (baseUtils.isEmpty(t)) {
            u = {
                code: this.ErrCodes.UNSIGNABLE_PARAMS, message: 'params is empty'
            }
        }
        if (baseUtils.containsReservedParamName(t)) {
            u = {
                code: this.ErrCodes.UNSIGNABLE_PARAMS, message: 'params contains reserved param name.'
            }
        }
        if (u) {
            this._onSign(u);
            return null;
        }
        let o, e, r, n;
        o = baseUtils.getDefaultMethod(e = baseUtils.getDefaultMethod(r = baseUtils.getDefaultMethod(n = Object.keys(t), 'sort').call(n), 'map').call(r, (function (e) {
            return {key: e, value: t[e]}
        })), 'filter').call(e, (function (t) {
            return baseUtils.isSafeParamValue(t.value)
        }))

        if (o.length === 0) {
            this._onSign({
                code: this.ErrCodes.UNSIGNABLE_PARAMS, message: 'params is empty after excluding "unsafe" params',
            });
            return null;
        }
        return o;
    }

    __collect() {
        var n = this.envCollect(1);
        n.fp = this._fingerprint;
        var e = JSON.stringify(n, null, 2);
        this._log(`__collect envCollect=${e}`);
        return this.aes(e, this.collectSecret, "0102030405060708");
    }

    async sign(params) {
        try {
            var Ot = Date.now();
            var e = ["functionId", "appid", "client", "body", "clientVersion", "sign", "t", "jsonp"].reduce((function (e, r) {
                var n = params[r];
                return n && ("body" === r && (n = CryptoJS.SHA256(n).toString()), e[r] = n), e
            }), {});

            var o = this.__checkParams(e);
            if (o == null) {
                return e;
            }
            await this.__requestDeps();
            let i = this.__collect();
            let a = this.__makeSign(o, i);
            this._log(`sign elapsed time!${Date.now() - Ot}ms`);
            return Object.assign({}, e, a);
        } catch (error) {
            this._onSign({
                code: this.ErrCodes.UNHANDLED_ERROR, message: 'unknown error'
            })
            this._log(`unknown error!${error.message}`);
            return params;
        }
    }

    envCollect(e) {
        let info = {
            pp: (() => {
                let ptPin = baseUtils.extractPtPin(document.cookie);
                if (ptPin) {
                    return {
                        "p1": ptPin,
                        "p2": ptPin
                    }
                }
                return {}
            })(),
            extend: {
                bu1: this.bu1,
                bu2: 0,
                bu3: document.head.childElementCount,
                bu4: 0,
                bu5: 0,
                l: 0,
                ls: 0,
                wd: 0,
                wk: 0,
            },
            random: baseUtils.getRandomIDPro({size: 12, dictType: 'max', customDict: null}),
            sua: (() => {
                var regex = new RegExp("Mozilla/5.0 \\((.*?)\\)");
                var matches = window.navigator.userAgent.match(regex);
                return matches && matches[1] ? matches[1] : "";
            })()
        }

        if (this.v) {
            info.v = this.v
        }

        if (e == 0) {
            Object.assign(info, {
                "wc": /Chrome/.test(window.navigator.userAgent) && !window.chrome ? 1 : 0,
                "wd": 0,
                "l": navigator.language,
                "ls": navigator.languages.join(","),
                "ml": navigator.mimeTypes.length,
                "pl": navigator.plugins.length,
                "av": (() => {
                    let av = window.navigator.userAgent.match(/(?<=\/)[0-9]\.0[^'"\n]+/g);
                    return av.length > 0 ? av[0] : "";
                })(),
                "ua": window.navigator.userAgent,
                "w": window.screen.width,
                "h": window.screen.height,
                "ow": window.outerWidth,
                "oh": window.outerHeight,
                "url": location.href,
                "og": location.origin,
                // "pf": os.platform(),
                // "bu2": "    at https://storage.360buyimg.com/webcontainer/js_security_v3_0.1.5.js:3833:21",
                // "canvas": "07d433e77178ffb3c4358a1a92f3233f",
                // "webglFp": "d714752d3e7330bcd7e2b332e7cbcb56",
                "ccn": navigator.hardwareConcurrency,
                "ai": this._appId,
                "pr": 1,
                "re": document.referrer,
                "referer": (() => {
                    var i = new RegExp("[^?]*"),
                        u = document.referrer.match(i);
                    if (!u || !u[0]) return "";
                    return u[0];
                })(),
                "pp1": {
                },
            })
        }

        return info;
    }

    aes(message, key, iv) {
        return CryptoJS.AES.encrypt(message, CryptoJS.enc.Utf8.parse(key), {
            iv: CryptoJS.enc.Utf8.parse(iv),
        }).ciphertext.toString();
    }
}

module.exports.BaseH5st = BaseH5st