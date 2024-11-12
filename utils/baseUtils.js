const CryptoJS = require('crypto-js');
const { JSDOM, ResourceLoader } = require('jsdom');
const { CookieJar } = require('tough-cookie');
const axios = require('axios');
const { HttpCookieAgent, HttpsCookieAgent } = require('http-cookie-agent/http');
const crc32 = require('crc').crc32;

class BaseUtils {
  constructor() {
    global.baseUtils = this;
  }

  requestUrl = {
    gettoken: 'https://rjsb-token-m.jd.com/gettoken',
    bypass: 'https://blackhole.m.jd.com/bypass',
    getInfo: 'https://blackhole.m.jd.com/getinfo',
  };

  webview = {
    unionwsws_param: {
      iOS: {
        routerURL: 'router://JDUnionFingerprintModule/getUnionFingerprintForH5',
        callBackName: 'fingerPrintCallback',
      },
      android: {
        businessType: 'unionFingerPrint',
        callBackName: 'fingerPrintCallback',
      },
    },
    getStorage: (e) => {
      return JSON.parse(localStorage.getItem(e));
    },
    setStorage: (e, t) => {
      localStorage.setItem(e, JSON.stringify(t));
    },
    getIosFingerprint: function () {
      console.log('不支持获取IOS指纹');
      // if (0 === navigator.userAgent.indexOf("jdapp")) {
      //     if (-1 !== navigator.userAgent.indexOf("supportJDSHWK/1") || window._is_jdsh_wkwebview == 1) {
      //         window.webkit.messageHandlers.JDAppUnite.postMessage({
      //             method: "callSyncRouterModuleWithParams",
      //             params: JSON.stringify(this.unionwsws_param.iOS)
      //         })
      //     } else {
      //         window.JDAppUnite.callRouterModuleWithParams(JSON.stringify(this.unionwsws_param.iOS))
      //     }
      // }
    },
    getAndroidFingerprint: () => {
      // TODO
      console.log('Android 获取指纹待实现');
      // if (this.isWKWebView()) {
      //     window.webkit.messageHandlers.JDAppUnite.postMessage({
      //         method: "notifyMessageToNative",
      //         params: JSON.stringify(this.unionwsws_param.android)
      //     });
      // } else if (window.JdAndroid) {
      //     window.JdAndroid.notifyMessageToNative(JSON.stringify(this.unionwsws_param.android));
      // }
    },
    getAppFingerprint: () => {
      try {
        var o = navigator.userAgent.toLowerCase();

        if (/iphone|ipad|ios|ipod/.test(o)) {
          this.webview.getIosFingerprint();
        } else if (/android/.test(o)) {
          this.webview.getAndroidFingerprint();
        }
      } catch (e) {
        console.log(e);
      }

      return JSON.stringify(this.webview.getStorage('unionwsws'));
    },
    isWKWebView: () => {
      return navigator.userAgent.match(/supportJDSHWK/i) || 1 === window._is_jdsh_wkwebview;
    },
  };

  changeEnv(url, cookieStr, userAgent) {
    let ptPin = this.extractPtPin(cookieStr);
    if (ptPin && global.document) {
      let localPtPin = this.extractPtPin(document.cookie);
      if (localPtPin === ptPin) {
        return;
      }
    }

    let jar = new CookieJar();

    global.api = axios.create({
      httpAgent: new HttpCookieAgent({
        cookies: { jar },
      }),
      httpsAgent: new HttpsCookieAgent({
        cookies: { jar },
        ciphers: 'TLS_AES_256_GCM_SHA384',
      }),
    });

    const resourceLoader = new ResourceLoader({
      userAgent,
    });

    let dom = new JSDOM(``, {
      url,
      resources: resourceLoader,
      cookieJar: jar,
    });

    global.window = dom.window;
    global.document = window.document;

    global.location = {
      ...window.location,
    };

    global.navigation = {
      ...window.navigation,
    };

    global.screen = {
      availHeight: 1032,
      availLeft: 0,
      availTop: 0,
      availWidth: 1920,
      colorDepth: 24,
      height: 1080,
      isExtended: false,
      onchange: null,
      orientation: {
        ScreenOrientation: { angle: 0, type: 'landscape-primary', onchange: null },
      },
      pixelDepth: 24,
      width: 1920,
    };
    window.screen = screen;
    window.navigation = navigation;
    global.navigator = window.navigator;

    global.localStorage = window.localStorage;
    global.history = window.history;

    if (cookieStr) {
      const cookies = cookieStr.split(';');
      cookies.forEach((cookieString) => {
        if (cookieString) {
          global.document.cookie = cookieString.concat(';domain=.jd.com;path=/;expires=2099-04-16T07:09:14.000Z');
        }
      });
    }
  }

  // 解析cookie字符串，提取pt_pin
  extractPtPin(cookies) {
    const regex = /pt_pin=([^;]+)/;
    const match = cookies.match(regex);
    const ptPinValue = match && match[1];
    return ptPinValue || '';
  }

  getDefaultVal(e) {
    const t = {
      undefined: 'u',
      false: 'f',
      true: 't',
    };
    return t[e] || e;
  }

  arrayLength(e, t, n) {
    if (n) {
      t.push(n);
      t.length > e && t.shift();
    }
  }

  atobFunc(e) {
    try {
      // this.atobPolyfill();
      return window.atob(e);
    } catch (e) {
      return '';
    }
  }

  baseConverter(e, t) {
    let c = [],
      s = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      l = e,
      f,
      p = '';
    if (t < 2 || t > 36) return '';

    for (; l > 0; ) {
      f = Math.floor(l % t);
      c.push(f);
      l = Math.floor(l / t);
    }

    for (; c.length; ) p += s[c.pop()];

    return p;
  }

  isFirefox() {
    return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  }

  getCallStack() {
    var t = this.getCallStackUnencrypted();
    return CryptoJS.MD5(t).toString();
  }

  md5Str(e) {
    return CryptoJS.MD5(e).toString();
  }

  getCallStackUnencrypted() {
    var n = this,
      r;

    try {
      throw new Error('call_stack');
    } catch (a) {
      try {
        var i = (function (t) {
          if (t.indexOf('@') > -1) {
            var a = t.split('\n'),
              u = '';
            if (a.length > 1) {
              a.pop();
              a.forEach(function (t) {
                var a,
                  c = t.split('@');

                if (c.length >= 2) {
                  var s = c[1],
                    f = s.indexOf('?'),
                    l = s.slice(0, f).split(':');
                  if (l.length > 2) {
                    l.pop();
                    l.pop();
                  }
                  var p = l.join(':');
                  a = ''.concat(c[0], '=').concat(p);
                } else {
                  var d = t.indexOf(':');
                  a = ''.concat(d === -1 ? t : t.slice(0, d), "=''");
                }

                u += ''.concat('' === u ? '' : '&').concat(a);
              });
            }
            return n.removal(u);
          }

          var c = t.split('at '),
            s = '';
          if (c.length > 1) {
            c.shift();
            c.forEach(function (e) {
              var t,
                n = e.split(' ');
              if (n.length >= 2) {
                var m = n[1];
                var v = m.indexOf('(');
                var d = m.indexOf('?');
                var g = m.indexOf(')');
                var l = v === -1 ? '' : m.slice(v + 1, d === -1 ? g : d);
                var p = l.split(':');
                if (p.length > 2) {
                  p.pop();
                  p.pop();
                }
                var h = p.join(':');
                t = ''.concat(n[0], '=').concat(h);
              } else {
                var y = e.indexOf(':');
                t = ''.concat(y === -1 ? e : e.slice(0, y), "=''");
              }
              s += ''.concat('' === s ? '' : '&').concat(t);
            });
          }
          return n.removal(s);
        })(a.stack.toString());
        if (i.length < 11) {
          r = a.stack.toString().substring(0, 200);
        } else {
          r = i;
        }
      } catch (e) {
        r = e.toString();
      }
    }

    return r;
  }

  removal(e) {
    var n = e.split('&'),
      r = new Map(),
      o = [];
    n.forEach(function (e) {
      var i = e.split('=');

      if (r.has(i[1])) {
        r.set(i[1], !0);
      } else {
        r.set(i[1], !1);
        o.push(e);
      }
    });
    return o.join('&');
  }

  getUa() {
    return navigator.userAgent;
  }

  isMobile() {
    return this.getUa().match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i);
  }

  ajax(e) {
    return api({
      method: e.type,
      url: e.url,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'user-agent': window.navigator.userAgent,
      },
      data: e.data,
    });
  }

  getCurrentDate() {
    return new Date();
  }

  getCurrentTime() {
    try {
      return this.getCurrentDate().getTime();
    } catch (e) {
      return 0;
    }
  }

  isDevtoolOpen() {
    return false;
  }

  toTimestamp() {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
    if (typeof t === 'number') return t;

    if (typeof t == 'string') {
      var o = t.match(/^(\d+(?:\.\d+)?)([smhd])$/);

      if (o) {
        var i;

        switch (o[2]) {
          case 'm':
            i = o[1] * 60 * 1000;
            break;

          case 'h':
            i = 60 * o[1] * 60 * 1000;
            break;

          case 'd':
            i = o[1] * 24 * 60 * 60 * 1000;
            break;

          default:
            i = o[1] * 1000;
        }

        return Date.now() + Math.round(i);
      }

      t = t.replace(/[.-]/g, '/');
      var a = new Date(t).getTime();
      if (!isNaN(a)) return a;
    }

    return -1;
  }

  clearTokem(e, t) {
    try {
      var o = window.localStorage.getItem(e);

      if (o) {
        var i = JSON.parse(o);
        if (i[t]) {
          delete i[t];
          window.localStorage.setItem(e, JSON.stringify(i));
        }
      }
    } catch (e) {}
  }

  getTokem(e, t) {
    var i = '';
    var u = '';

    try {
      var c = window.localStorage.getItem(e);

      if (c) {
        var s = JSON.parse(c);

        if (s[t]) {
          var f = s[t];
          var l = f.data;
          var p = f.expires;
          var d = f.xcd;
          var v;

          if (d === void 0) {
            v = '';
          } else {
            v = d;
          }

          if (this.toTimestamp(p) > Date.now()) {
            i = l;
            u = this.getDecode(v || '');
            document.cookie = ''.concat(e, '=').concat(l, ';domain=.jd.com;path=/;expires=').concat(p);
          } else {
            delete s[t];
            window.localStorage.setItem(e, JSON.stringify(s));
          }
        }
      }

      return {
        joyytokenVal: i,
        xcdVal: u,
      };
    } catch (e) {
      return {
        joyytokenVal: i,
        xcdVal: u,
      };
    }
  }

  encodeSearchKey(e) {
    var n = {
      code: '%',
      encode: '%25',
    };
    var o = {
      code: '?',
      encode: '%3F',
    };
    var i = {
      code: '#',
      encode: '%23',
    };
    var a = {
      code: '&',
      encode: '%26',
    };
    var c = [n, o, i, a];
    const that = this;
    return e.replace(/[%?#&]/g, function (e, n, o) {
      var a,
        u = that.createIterable(c);

      try {
        for (u.s(); !(a = u.n()).done; ) {
          var f = a.value;
          if (f.code === e) return f.encode;
        }
      } catch (e) {
        u.e(e);
      } finally {
        u.f();
      }
    });
  }

  getCookie(e) {
    try {
      var o = new RegExp('(^| )' + e + '=([^;]*)(;|$)');
      var i = document.cookie.match(o);

      if (i) {
        if (i.length > 2 && i[2]) {
          if (-1 !== i[2].indexOf('%u')) return unescape(i[2]);

          if (/.*[\u4e00-\u9fa5]+.*$/.test(i[2])) {
            var a = this.encodeSearchKey(i[2]);
            return decodeURIComponent(a);
          }
          return decodeURIComponent(i[2]);
        }

        return '';
      }

      return '';
    } catch (e) {
      return '';
    }
  }

  getRandomInt() {
    var u = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
    var a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 9;

    u = Math.ceil(u);
    a = Math.floor(a);
    return Math.floor(Math.random() * (a - u + 1)) + u;
  }

  getRandomWord(e, t) {
    for (var a = '', u = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', c = 0; c < e; c++) {
      var s = u;
      0 === c && t && (s = u.slice(1));
      var f = Math.round(Math.random() * (s.length - 1));
      a += s.substring(f, f + 1);
    }

    return a;
  }

  getNumberInString(e) {
    return Number(e.replace(/[^0-9]/gi, ''));
  }

  getSpecialPosition(e) {
    var s = !(arguments.length > 1) || !(arguments[1] !== void 0) || arguments[1];
    e = String(e);
    var u = s ? 1 : 0;
    var c = '';

    for (var a = 0; a < e.length; a++) {
      a % 2 === u && (c += e[a]);
    }
    return c;
  }

  getLastAscii(e) {
    var o = e.charCodeAt(0).toString();
    return o[o.length - 1];
  }

  toAscii(e) {
    var i = '';

    for (var a in e) {
      var u = e[a];
      var c = /[a-zA-Z]/.test(u);

      if (e.hasOwnProperty(a)) {
        i += c ? this.getLastAscii(u) : u;
      }
    }
    return i;
  }

  add0(e, t) {
    return (Array(t).join('0') + e).slice(-t);
  }

  minusByByte(e, t) {
    var o = e.length,
      i = t.length;
    var u = Math.max(o, i),
      c = this.toAscii(e),
      s = this.toAscii(t),
      f = '',
      l = 0;

    if (o !== i) {
      c = this.add0(c, u);
      s = this.add0(s, u);
    }
    for (; l < u; l++) {
      f += Math.abs(c[l] - s[l]);
    }

    return f;
  }

  getLoginStatus() {
    var o = this.isMobile() ? 'pt_key' : 'thor';
    return this.getCookie(o);
  }

  getCookiePin() {
    var o = this.getCookie('pwdt_id') || this.getCookie('pin') || '';
    return CryptoJS.MD5(o).toString().toLowerCase();
  }

  RecursiveSorting() {
    var o = this,
      i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {},
      a = {},
      u = i;

    if (Object.prototype.toString.call(u) === '[object Object]') {
      var c = Object.keys(u).sort(function (e, n) {
        return e < n ? -1 : e > n ? 1 : 0;
      });
      c.forEach(function (e) {
        var l = u[e];

        if (Object.prototype.toString.call(l) === '[object Object]') {
          a[e] = o.RecursiveSorting(l);
        } else if (Object.prototype.toString.call(l) === '[object Array]') {
          for (var d = [], h = 0; h < l.length; h++) {
            var v = l[h];

            if (Object.prototype.toString.call(v) === '[object Object]') {
              d[h] = o.RecursiveSorting(v);
            } else {
              d[h] = v;
            }
          }

          a[e] = d;
        } else {
          a[e] = l;
        }
      });
    } else {
      a = i;
    }

    return a;
  }

  objToString2() {
    var n = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};

    var r = '';
    Object.keys(n).forEach(function (e) {
      var u = n[e];
      if (u != null) {
        if (u instanceof Object || u instanceof Array) {
          r += ''
            .concat(r === '' ? '' : '&')
            .concat(e, '=')
            .concat(JSON.stringify(u));
        } else {
          r += ''
            .concat(r === '' ? '' : '&')
            .concat(e, '=')
            .concat(u);
        }
      }
    });
    return r;
  }

  objToString() {
    var u = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};

    var a = '';
    Object.keys(u)
      .sort(function (e, n) {
        return e < n ? -1 : e > n ? 1 : 0;
      })
      .forEach(function (e) {
        var n = u[e];
        if (n != null) {
          a += ''
            .concat(a === '' ? '' : '&')
            .concat(e, '=')
            .concat(n);
        }
      });
    return a;
  }

  getCookieJdu() {
    return '' === this.getCookie('__jdu') ? (this.getCookie('__jda') === '' ? '' : this.getCookie('__jda').split('.')[1]) : this.getCookie('__jdu');
  }

  getTouchSession() {
    var e = new Date().getTime();
    var t = this.getRandomInt(1000, 9999);
    return String(e) + String(t);
  }

  collectVoteFilter() {
    var u = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : '0';
    var a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : '100';
    var i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [];
    var s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : '';
    try {
      if ('1' === u) {
        return i.filter(function (t) {
          var r = t[s].substring(t[s].length - 2);
          if (r[0] === '0') {
            r = r.substring(1);
          }
          if (Number(r) < Number(a)) {
            return !0;
          }
        });
      }
      return i;
    } catch (e) {
      return i;
    }
  }

  getPluginsNum() {
    var t;
    try {
      t = window.navigator.plugins.length;
    } catch (e) {
      t = 'c';
    }
    return t;
  }

  getGPUMes() {
    window.localStorage.gpuAll = '{"gpuServiceProvider":"ARM","gpuBrand":"Mali-G610 MC6"}';
    return ['ARM', 'Mali-G610 MC6'];
  }

  getLangNum() {
    var t = '';

    try {
      t = window.navigator.languages.length;
    } catch (e) {}

    return t;
  }

  getChromeAttribute() {
    return '';
  }

  getConfigurable_Enumerable() {
    return ['11', '11', '11', '11'];
  }

  getBatteryStatus() {
    return ['t', Infinity, Infinity, 0.77];
  }

  encrypt1(e, t) {
    for (var i = e.length, a = t.toString(), u = [], c = '', s = '', f = 0, l = 0; l < a.length; l++) {
      if (f >= i) f = f % i;
      c = a.charCodeAt(l) ^ e.charCodeAt(f);
      s = c % 10;
      u.push(s);
      f = f + 1;
    }

    return u.join().replace(/,/g, '');
  }

  len_Fun(e, t) {
    return ''.concat(e.substring(t, e.length)) + ''.concat(e.substring(0, t));
  }

  encrypt2(e, t) {
    var i = t.toString(),
      a = t.toString().length,
      u = parseInt((a + e.length) / 3);
    var s = '',
      f = '';

    if (a > e.length) {
      s = this.len_Fun(i, u);
      f = this.encrypt1(e, s);
    } else {
      s = this.len_Fun(e, u);
      f = this.encrypt1(i, s);
    }

    return f;
  }

  addZeroFront(e) {
    return e && e.length >= 5 ? e : ('00000' + String(e)).substr(-5);
  }

  addZeroBack(e) {
    return e && e.length >= 5 ? e : (String(e) + '00000').substr(0, 5);
  }

  encrypt3(e, t) {
    var s = this.addZeroBack(t).toString().substring(0, 5);
    var u = this.addZeroFront(e).substring(e.length - 5);

    var l = s.length;
    var f = [];

    for (let i = 0; i < l; i++) {
      f.push(Math.abs(s.charCodeAt(i) - u.charCodeAt(i)));
    }
    return f.join().replace(/,/g, '');
  }

  encrypt7(e, t) {
    try {
      var h = e.split('').reverse().join('');
      var p = (String(t) + '000000').slice(0, 13);
      var v = p.slice(9, 12);
      var l = ''.concat(h).concat(v);
      var d = [];
      var c = '';
      for (var s = 0; s < p.length; s++) {
        var f = (p.charCodeAt(s) & l.charCodeAt(s)).toString(16);
        d.push(f);
      }
      c = d.join('');
      return c;
    } catch (e) {
      return null;
    }
  }

  encrypt8(e, t) {
    try {
      let a = t.toString(),
        u = a.substr(0, 1),
        c = a.substr(1) + u,
        s = e.substr(-1),
        f = (s + e.substr(0, e.length - 1)).split('').reverse().join(''),
        l = a.slice(-3),
        p = ''.concat(f).concat(l),
        d = [],
        h = 0;
      for (; h < c.length; h++) {
        var v = (c.charCodeAt(h) ^ p.charCodeAt(h)).toString(16);
        d.push(v);
      }

      return d.join('');
    } catch (e) {
      return null;
    }
  }

  encrypt9(e, t) {
    try {
      let i = t.toString(),
        a = e.split('').reverse().join('').slice(0, 5),
        u = (String(t) + '000000').slice(0, 13).slice(-5),
        c = '',
        s = 0;
      for (; s < a.length; s++) {
        c += ''.concat(a.charAt(s)).concat(u.charAt(s));
      }

      c += c.slice(0, i.length - c.length);

      for (var f = [], l = 0; l < i.length; l++) {
        var p = (i.charCodeAt(l) ^ c.charCodeAt(l)).toString(16);
        f.push(p);
      }

      return f.join('');
    } catch (e) {
      return null;
    }
  }

  encryptA(e, t) {
    try {
      var a = t.toString(),
        u = e.split('').reverse().join('');
      u += u.slice(0, a.length - u.length);

      for (var c = [], s = 0; s < a.length; s++) {
        var f = a.charCodeAt(s) | u.charCodeAt(s);
        var l = (f % 15).toString(16);
        c.push(l);
      }

      for (var p = c.join(''), d = '', h = '', v = 0; v < p.length; v++) {
        if (v % 2 === 0) {
          d += p.charAt(v);
        } else {
          h += p.charAt(v);
        }
      }

      return ''.concat(d).concat(h);
    } catch (e) {
      return null;
    }
  }

  encryptB(e, t) {
    try {
      var d = t.toString();
      var s = e.toString();
      var c = d + s;
      var v = (s + d).split('').reverse().join('');
      var h = [];
      for (var f = 0; f < c.length; f++) {
        var l = c.charCodeAt(f) ^ v.charCodeAt(f),
          p = (l % 15).toString(16);
        h.push(p);
      }
      return h.join('');
    } catch (e) {
      return null;
    }
  }

  encryptC(e, t) {
    try {
      var a,
        u = t.toString(),
        c = e.toString(),
        s = u.split(''),
        f = c.split(''),
        l = [],
        p = [];
      if (s.length > f.length) {
        a = f.length;
        p = s;
      } else {
        a = s.length;
        p = f;
      }

      for (var d = 0; d < a; d++) {
        l.push(s[d]);
        l.push(f[d]);
      }

      for (var h = l.concat(p.slice(a)).join(''), v = (c + u).split('').reverse().join(''), m = [], g = 0; g < h.length; g++) {
        var y = h.charCodeAt(g) ^ v.charCodeAt(g);
        var w = (y % 15).toString(16);
        m.push(w);
      }

      return m.join('');
    } catch (e) {
      return null;
    }
  }

  encryptD(e, t) {
    try {
      var c = t.toString();
      var l = c.slice(-5);
      var b = e.toString();
      var d = l.split('');
      var m = b.split('');
      var f = [];
      for (var y = 0; y < d.length; y++) {
        var w = d[y] % m.length;
        f.push(m[w]);
      }
      var _ = [];
      for (var g = 0; g < m.length; g++) {
        if (g % 2 !== 0) {
          f.push(m[g]);
        } else {
          _.push(m[g]);
        }
      }
      f = f.reverse().join('');
      var x = d.reverse();
      var s = _.concat(x);
      s = s.join('');
      var p = [];
      for (var h = 0; h < f.length; h++) {
        var v = ((f.charCodeAt(h) ^ s.charCodeAt(h)) % 15).toString(16);
        p.push(v);
      }
      return p.join('');
    } catch (e) {
      return null;
    }
  }

  getDefaultArr(e) {
    return new Array(e).fill('a');
  }

  getExceptArr(e) {
    return new Array(e).fill('c');
  }

  getUndefinedArr(e) {
    return new Array(e).fill('u');
  }

  getFailedArr(e) {
    return new Array(e).fill('f');
  }

  ArrayFillPolyfill() {}

  getExceptData(e) {
    try {
      return e();
    } catch (e) {
      return 'c';
    }
  }

  getNaviParam(e) {
    return this.getExceptData(function () {
      return navigator[e] || 'u';
    });
  }

  getCookieEnabled() {
    return 't';
  }

  getSessionStorage() {
    return 't';
  }

  getLocalStorage() {
    return 't';
  }

  getIsMobileOne() {
    return 't';
  }

  getIsMobileTwo() {
    return 't';
  }

  getIsNodeEnv() {
    return 'f';
  }

  getHasNodeVM2() {
    return 'f';
  }

  getExistWebdriver() {
    return 'f';
  }

  getDetectPhantomjs() {
    return 'f';
  }

  getPageDomNum() {
    var o;

    try {
      o = [
        document.querySelectorAll('script').length,
        document.querySelectorAll('div').length,
        document.querySelectorAll('link').length,
        document.querySelectorAll('meta').length,
        history.length,
        navigator.maxTouchPoints,
      ];
    } catch (e) {
      o = this.getExceptArr(6);
    }

    return o;
  }

  getJdKey() {
    var e = this;
    return this.getExceptData(function () {
      var r = {
        jdkey: 'a',
      };
      return (e.webview.getStorage('unionwsws') || r).jdkey;
    });
  }

  getAppBuild() {
    return this.getExceptData(function () {
      return navigator.userAgent.match(/appBuild\/([\d]+)/i)[1];
    });
  }

  getAppVersion() {
    var n = navigator.userAgent;
    return (n && n.indexOf('jdapp') === 0 && n.split(';')[2]) || null;
  }

  getNaviConnection() {
    var t;
    try {
      t = [navigator.connection.downlink || 'u', navigator.connection.effectiveType || 'u'];
    } catch (r) {
      t = this.getExceptArr(2);
    }
    return t;
  }

  getScreen() {
    var e;
    try {
      var n = window.screen;
      e = [n.height, n.width];
    } catch (n) {
      e = this.getExceptArr(6);
    }
    return e;
  }

  getIosAppDetail() {
    let s = '';
    // console.log('不支持获取IOS应用信息');
    // var u = this.getDefaultVal(typeof $request != "undefined");
    // var h = this.getDefaultVal((typeof $httpClient != "undefined"));
    // var p = this.getDefaultVal(typeof $task != "undefined");
    // var l = this.getDefaultVal((typeof $loon != "undefined"));
    // var f = this.getDefaultVal((typeof $app != "undefined") && (typeof $http != "undefined"));
    // var a = this.getDefaultVal(("function" == "function") && !f);
    // var d = this.getDefaultVal(typeof window != "undefined");
    // var c = this.getDefaultVal(typeof navigator != "undefined");
    // s = "" + u + h + p + l + f + a + d + c;
    return s;
  }

  getAutoJs() {
    return 'u';
  }

  getExistMiniblink() {
    return 'u';
  }

  getCrcCode(e) {
    var r = '0000000',
      o = '';

    try {
      o = crc32(e).toString(36);
      r = this.addZeroToSeven(o);
    } catch (e) {}

    return r;
  }

  addZeroToSeven(e) {
    return e && e.length >= 7 ? e : ('0000000' + String(e)).substr(-7);
  }

  xorEncrypt(e, t) {
    var l = this.getCurrentTime();
    var f = t.length;
    var h = '';
    for (var p = 0; p < e.length; p++) {
      h += String.fromCharCode(e[p].charCodeAt() ^ t[p % f].charCodeAt());
    }
    var c = this.getCurrentTime();
    var s = c - l;
    return {
      xorEncrypted: h,
      totalTime: s,
    };
  }

  utoa(e) {
    // this.btoaPolyfill();
    return window.btoa(unescape(encodeURIComponent(e)));
  }

  // btoaPolyfill() {
  //     var t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  //
  //     window.btoa = window.btoa || function (o) {
  //         for (var u, c, s, f, l = "", p = 0, d = (o = String(o)).length % 3; p < o.length;) {
  //             if ((c = o.charCodeAt(p++)) > 255 || (s = o.charCodeAt(p++) > 255) || (f = o.charCodeAt(p++) > 255)) {
  //                 throw new TypeError("Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range.");
  //             }
  //             u = c << 16 | s << 8 | f;
  //             l += t.charAt(u >> 18 & 63) + t.charAt(u >> 12 & 63) + t.charAt(u >> 6 & 63) + t.charAt(63 & u);
  //         }
  //
  //         return d ? l.slice(0, d - 3) + "===".substring(d) : l;
  //     };
  // }

  inArr(e) {
    return !(Number(e) in [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  }

  getInRange(e, t, n) {
    var l = n;
    var f = t;
    this.inArr(n) && (l = String(n).charCodeAt(0));
    this.inArr(t) && (f = String(t).charCodeAt(0));
    var c = [];
    const that = this;
    e.map(function (e) {
      var n = e;
      that.inArr(e) && (n = String(e).charCodeAt(0));
      n >= f && n <= l && c.push(e);
    });
    return c;
  }

  isApp(e) {
    var i = navigator.userAgent;
    return e === 'jd' ? /^jdapp/i.test(i) : e === 'jdjr' && /JDJR-App/i.test(i);
  }

  isAndroid() {
    var o = navigator.userAgent;
    return o.indexOf('Android') > -1 || o.indexOf('Linux') > -1;
  }

  isIOS() {
    return !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
  }

  versionCompare(e, t) {
    if (e === t) return 0;
    e = e.split('.');
    t = t.split('.');
    var s = e.length - t.length;
    var l = [];
    for (var c = 0; c < Math.abs(s); c++) l.push(0);
    if (s > 0) {
      t = t.concat(l);
    } else {
      s < 0 && (e = e.concat(l));
    }
    for (var f = 0; f < e.length; f++) {
      if (((e[f] = parseInt(e[f], 10)), (t[f] = parseInt(t[f], 10)), e[f] > t[f])) return 1;
      if (e[f] < t[f]) return -1;
    }
    return 0;
  }

  isDuringDate(e, t) {
    try {
      var n = new Date(),
        r = new Date(e),
        o = new Date(t);
      return n >= r && n <= o;
    } catch (e) {
      return !1;
    }
  }

  isNotEmptyString(e) {
    return typeof e === 'string' && e !== '' && e.trim() !== '' && e !== 'null' && e !== 'undefined';
  }

  urlSafeBase64Decode(e) {
    return e ? e.replace(/-/g, '+').replace(/_/g, '/') : '';
  }

  getDecode(e) {
    try {
      e = this.urlSafeBase64Decode(e);
      return decodeURIComponent(
        this.atobFunc(e)
          .split('')
          .map(function (e) {
            return '%' + ('00' + e.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(''),
      );
    } catch (e) {
      return '';
    }
  }

  stringToByte(e) {
    var u = [];
    var s;
    var f;
    s = e.length;

    for (var c = 0; c < s; c++) {
      f = e.charCodeAt(c);

      if (f >= 65536 && f <= 1114111) {
        u.push((7 & (f >> 18)) | 240);
        u.push(((f >> 12) & 63) | 128);
        u.push(((f >> 6) & 63) | 128);
        u.push((f & 63) | 128);
      } else {
        if (f >= 2048 && f <= 65535) {
          u.push((15 & (f >> 12)) | 224);
          u.push(((f >> 6) & 63) | 128);
          u.push(128 | (f & 63));
        } else {
          if (f >= 128 && f <= 2047) {
            u.push(((f >> 6) & 31) | 192);
            u.push((f & 63) | 128);
          } else {
            u.push(f & 255);
          }
        }
      }
    }

    return u;
  }

  BKDRHash(e) {
    try {
      var s = 31;
      var u = 0;
      e = this.stringToByte(e);
      if (!e || e.length < 1) return '';
      for (var c = 0; c < e.length; c++) {
        u = u * s + e[c];
        u = u >>> 0;
      }
      var f = u & 2147483647;
      return f.toString(16).toUpperCase();
    } catch (e) {
      return '';
    }
  }

  rewriteToString(e) {
    // e && Object.keys(e).forEach(function (t) {
    //     e[t].toString = function () {
    //         return "";
    //     };
    // });
  }

  createIterable(e, t) {
    var r = (typeof Symbol !== 'undefined' && e[Symbol.iterator]) || e['@@iterator'];

    if (!r) {
      if (Array.isArray(e) || (r = this.convertToIterable(e)) || (t && e && typeof e.length === 'number')) {
        r && (e = r);

        var s = 0,
          f = function () {},
          l = {
            s: f,
            n: function () {
              var t = {};
              if (((t.done = !0), s >= e.length)) return t;
              var r = {};
              r.done = !1;
              r.value = e[s++];
              return r;
            },
            e: function (e) {
              throw e;
            },
            f: f,
          };

        return l;
      }

      throw new TypeError('Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.');
    }

    var d,
      h = !0,
      v = !1;
    return {
      s: function () {
        r = r.call(e);
      },
      n: function () {
        var e = r.next();
        h = e.done;
        return e;
      },
      e: function (e) {
        v = !0;
        d = e;
      },
      f: function () {
        try {
          !h && r.return != null && r.return();
        } finally {
          if (v) throw d;
        }
      },
    };
  }

  convertToIterable(e, t) {
    if (!e) return;
    if (typeof e === 'string') return this.sliceToArray(e, t);
    var c = Object.prototype.toString.call(e).slice(8, -1);
    c === 'Object' && e.constructor && (c = e.constructor.name);
    if (c === 'Map' || c === 'Set') return Array.from(e);
    if (c === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(c)) return this.sliceToArray(e, t);
  }

  sliceToArray(e, t) {
    (t == null || t > e.length) && (t = e.length);

    for (var o = 0, i = new Array(t); o < t; o++) i[o] = e[o];

    return i;
  }

  encrypt(e, t, n) {
    const that = this;
    return {
      1: function () {
        var e = that.getNumberInString(t);
        var u = that.getSpecialPosition(n);
        return Math.abs(e - u);
      },
      2: function () {
        var r = that.getSpecialPosition(t, !1);
        var a = that.getSpecialPosition(n);
        return that.minusByByte(r, a);
      },
      3: function () {
        var e = t.slice(0, 5),
          r = String(n).slice(-5);
        return that.minusByByte(e, r);
      },
      4: function () {
        return that.encrypt1(t, n);
      },
      5: function () {
        return that.encrypt2(t, n);
      },
      6: function () {
        return that.encrypt3(t, n);
      },
      7: function () {
        return that.encrypt7(t, n);
      },
      8: function () {
        return that.encrypt8(t, n);
      },
      9: function () {
        return that.encrypt9(t, n);
      },
      A: function () {
        return that.encryptA(t, n);
      },
      B: function () {
        return that.encryptB(t, n);
      },
      C: function () {
        return that.encryptC(t, n);
      },
      D: function () {
        return that.encryptD(t, n);
      },
    }[e]();
  }

  isFunction(t) {
    return 'function' == typeof t;
  }

  emptyFunction() {}

  decodeBase64URL(encodedString) {
    return (encodedString + '===')
      .slice(0, encodedString.length + 3 - ((encodedString.length + 3) % 4))
      .replace(/-/g, '+')
      .replace(/_/g, '/');
  }

  getDefaultMethod(obj, methodName) {
    const e = obj[methodName];
    return obj === Array.prototype || (Array.prototype.isPrototypeOf(obj) && e === Array.prototype[methodName]) ? Array.prototype[methodName] : e;
  }

  getRandomIDPro() {
    var t,
      e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
      r = e.size,
      n = void 0 === r ? 10 : r,
      o = e.dictType,
      i = void 0 === o ? 'number' : o,
      a = e.customDict,
      u = '';
    if (a && 'string' == typeof a) t = a;
    else
      switch (i) {
        case 'alphabet':
          t = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
          break;
        case 'max':
          t = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
          break;
        default:
          t = '0123456789';
      }
    for (; n--; ) u += t[(Math.random() * t.length) | 0];
    return u;
  }

  fromBase64(t) {
    return t.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  toBase64(t) {
    return (t + this.getDefaultMethod('===', 'slice').call('===', (t.length + 3) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  }

  isPlainObject(t) {
    return '[object Object]' === Object.prototype.toString.call(t);
  }

  isEmpty(t) {
    return !!this.isPlainObject(t) && !Object.keys(t).length;
  }

  containsReservedParamName(t) {
    const PS = ['h5st', '_stk', '_ste'];
    for (var e = Object.keys(t), r = 0; r < e.length; r++) {
      var n = e[r];
      if (this.getDefaultMethod(PS, 'indexOf').call(PS, n) >= 0) return !0;
    }
    return !1;
  }

  isSafeParamValue(t) {
    let Bp =
      'function' == typeof Object.Symbol && 'symbol' == typeof Object.f('iterator')
        ? function (t) {
            return typeof t;
          }
        : function (t) {
            return t && 'function' == typeof Object.Symbol && t.constructor === Object.Symbol && t !== Object.Symbol.prototype ? 'symbol' : typeof t;
          };
    let e = Bp(t);
    return ('number' === e && !isNaN(t)) || 'string' === e || 'boolean' === e;
  }

  formatDate() {
    let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : Date.now(),
      e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 'yyyy-MM-dd',
      n = new Date(t),
      r = e,
      o = {
        'M+': n.getMonth() + 1,
        'd+': n.getDate(),
        'D+': n.getDate(),
        'h+': n.getHours(),
        'H+': n.getHours(),
        'm+': n.getMinutes(),
        's+': n.getSeconds(),
        'w+': n.getDay(),
        'q+': Math.floor((n.getMonth() + 3) / 3),
        'S+': n.getMilliseconds(),
      };
    return (
      /(y+)/i.test(r) && (r = r.replace(RegExp.$1, ''.concat(n.getFullYear()).substr(4 - RegExp.$1.length))),
      Object.keys(o).forEach(function (t) {
        if (new RegExp('('.concat(t, ')')).test(r)) {
          var e = 'S+' === t ? '000' : '00';
          r = r.replace(RegExp.$1, 1 == RegExp.$1.length ? o[t] : ''.concat(e).concat(o[t]).substr(''.concat(o[t]).length));
        }
      }),
      r
    );
  }

  getRandomIDPro(e = {}) {
    var t,
      r = e.size,
      n = void 0 === r ? 10 : r,
      o = e.dictType,
      i = void 0 === o ? 'number' : o,
      a = e.customDict,
      u = '';
    if (a && 'string' == typeof a) t = a;
    else
      switch (i) {
        case 'alphabet':
          t = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
          break;
        case 'max':
          t = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
          break;
        default:
          t = '0123456789';
      }
    for (; n--; ) u += t[(Math.random() * t.length) | 0];
    return u;
  }
}

module.exports.BaseUtils = BaseUtils;
