const CryptoJS = require('crypto-js');
const { BaseUtils } = require('./baseUtils');

class SmashUtils {
  constructor(url, cookieStr, userAgent) {
    global.baseUtils || new BaseUtils();
    baseUtils.changeEnv(url, cookieStr, userAgent);

    this.P = {};

    this.B = {
      q: '',
      appid: '',
      etid: '1,2,3,4,5,6,7,8,9,A,B,C,D',
      cf_v: '00',
      encrypt_id: '1,3,*,1',
      openMonitor: '1',
      openPre: '0',
      collectStatus: '1',
      collect_vote: '100',
      collect_rate: '60',
      joyytokem: '',
      default_encrypt_id: '1,3,*,1',
      default_cf_v: '00',
      openTraffic: '0',
    };
    this.T = 0;
    this.L = !1;
    this.I = [];
    this.M = [];
    this.z = {};
    this.R = 0;
    this.U = !0;
    this.q = null;
    this.W = 0;
    this.K = 0;
    this.J = 0;
    this.F = 0;
    this.V = 0;
    this.G = 0;
    this.X = 0;
    this.Y = 0;
    this.Z = !1;
    this.Q = 0;
    this.$ = baseUtils.getTouchSession();
    this.ee = 'w4.0.7';
    this.te = baseUtils['isMobile']();
    this.ne = this.te ? 'touchstart' : 'mousedown';
    this.re = this.te ? 'touchend' : 'mouseup';
    this.oe = this.te ? 'touchmove' : 'mousemove';
    this.ie = baseUtils['getCookieJdu']();
    this.ae = ['click', 'mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend'];
    this.ue = [];
    this.ce = [];
    this.se = [0, 0, 0];
    this.fe = baseUtils.getCurrentTime();
    this.le = !1;
    this.pe = 'a';
    this.de = 'a';
    this.he = 'a';
    this.ve = 'a';
    this.me = 'a';
    this.ge = 'a';
    this.ye = 'a';
    this.we = 'a';
    this.be = 'a';
    this.xe = 'a';
    this._e = 'a';
    this.Se = 'a';
    this.Ae = baseUtils['getDefaultArr'](7);
    this.Ne = baseUtils['getDefaultArr'](4);
    this.Ce = 'a';
    this.Ee = 'a';
    this.Oe = 'a';
    this.je = 1;
    this.ke = 0;
    this.Pe = !1;
    this.De = 'e6LP9bkdiSwa';
    this.Be = 'a';
    this.Te = 'a';
    this.Le = 'a';
    this.Ie = 'a';
    this.Me = 'a';
    this.ze = 0;
    this.Re = '';
    this.Ue = 'a';
    this.qe = baseUtils['getDefaultArr'](7);
    this.He = new Array(7).fill('a');
    this.We = new Array(7).fill('f');
    this.Ke = 864e9;
    this.Je = '2022/01/31 18:00:00';
    this.Fe = '2022/02/01 02:00:00';
    this.Ve = null;
    this.Ge = !1;
    this.Xe = !1;
    this.Ye = {};

    baseUtils.rewriteToString(this);
  }

  // window = {
  //     fingerPrintCallback: (e) => {
  //         try {
  //             e = JSON.parse(e);
  //             if (e.status === 0) {
  //                 baseUtils.webview.setStorage("unionwsws", e.data);
  //             }
  //         } catch (e) {
  //         }
  //     }
  // }

  setParam(e, t, n) {
    n && (e[t] = n);
  }

  clearjoyytoken(e, t) {
    try {
      var u = baseUtils.getTokem('joyytokem', e).joyytokenVal;
      if (!u || u.indexOf(e) !== 0 || (t && 1 === this.Q) || /^undefined/.test(u)) {
        document.cookie = 'joyytokem=;domain=.jd.com;path=/;expires=' + new Date(new Date().getTime() + 864e9).toGMTString();
        baseUtils.clearTokem('joyytokem', e);
        this.B.encrypt_id = this.B.default_encrypt_id;
        this.B.cf_v = this.B.default_cf_v;
      }
    } catch (e) {
      this.getInterfaceData({
        funcName: 'cookie',
        real_msg: 'cookie储存异常',
        error_msg: e && e.message,
      });
    }
  }

  async getjoyytoken(e, t) {
    try {
      var u = baseUtils.getTokem('joyytokem', e).joyytokenVal;
      if (!u || u.indexOf(e) !== 0 || (t && this.Q === 1) || /^undefined/.test(u)) {
        await this.getSwitch(e);
      }
    } catch (e) {
      this.getInterfaceData({
        funcName: 'other',
        real_msg: 'inner.getjoyytoken',
        error_msg: e && e.message,
      });
    }
  }

  decryptJoyToken(e) {
    if ('' === e || !e) return this.B;
    try {
      if (this.P.appid && this.P.appid !== 'undefined') {
        var c = {};
        c = this.decipherJoyToken(e, this.P.appid);
        this.Le = c.jjt || 'a';
        var s = c.encrypt_id || this.B.encrypt_id;
        var u = {};
        u.encrypt_id = s;
        return Object.assign(Object.assign({}, this.B), {}, u);
      }
      return this.B;
    } catch (e) {
      this.getInterfaceData({
        funcName: 'other',
        real_msg: 'inner.decryptJoyToken',
        error_msg: e && e.message,
      });
      return this.B;
    }
  }

  decipherJoyToken(e, t) {
    var u = {
      jjt: 'a',
      expire: baseUtils.getCurrentTime(),
      outtime: 3,
      time_correction: !1,
    };
    const that = this;
    try {
      var s = e.indexOf(t) + t.length,
        f = e.length;
      let c = e
        .slice(s, f)
        .split('.')
        .map(function (e) {
          return baseUtils.atobFunc(e);
        });
      if (c[1] && c[0] && c[2]) {
        var l = c[0].slice(2, 7),
          p = c[0].slice(7, 9),
          d = baseUtils.xorEncrypt(c[1] || '', l).xorEncrypted.split('~');
        (u.outtime = d[3] - 0), (u.encrypt_id = d[2]), (u.jjt = 't');
        var h = d[0] - 0 || 0;
        if (h && typeof h === 'number') {
          u.time_correction = !0;
          u.expire = h;
        }
        var m = h - baseUtils.getCurrentTime() || 0;
        u.q = m;
        u.cf_v = p;
        return u;
      }
      return u;
    } catch (e) {
      this.getInterfaceData({
        funcName: 'joytoken',
        real_msg: 'joytoken解密错误',
        error_msg: e.name + e.message,
      });

      return u;
    }
  }

  exeCode(e) {
    try {
      if (e) {
        var i = new Function(e);
        this.Ue = i();
      }
    } catch (e) {
      this.Ue = 'default';
      this.getInterfaceData({
        funcName: 'other',
        real_msg: 'inner.exeCode',
        error_msg: e.name + e.message,
      });
    }
  }

  getInterfaceData(e) {
    // console.debug(`getInterfaceData -> ${JSON.stringify(e)}`);
  }

  setIdData(e, t) {
    var i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : '';
    this.z[e] ? (this.z[e][t] = i) : (this.z[e] = Object.assign({}, t, i));
  }

  async getSwitch(e) {
    if (!baseUtils.isDuringDate(this.Je, this.Fe)) {
      var a = encodeURIComponent(e),
        u = baseUtils.getJdKey(),
        c = baseUtils.getCookie('pwdt_id') || baseUtils.getCookie('pin') || '',
        s = baseUtils.BKDRHash(c) || '';

      try {
        let { data: t } = await baseUtils.ajax({
          type: 'POST',
          url: baseUtils.requestUrl.gettoken,
          credential: !0,
          data: 'content='.concat(
            JSON.stringify({
              appname: a,
              whwswswws: baseUtils.getCookie('shshshfpb'),
              jdkey: u,
              body: {
                platform: '1',
                sceneid: this.P.sceneid || '',
                hs: s,
                version: this.ee,
              },
            }),
          ),
        });
        if (t.code) {
          this.getInterfaceData({
            funcName: 'joytoken',
            real_msg: 'joytoken请求code异常',
            error_msg: JSON.stringify(t),
          });
        } else {
          if (t.joyytoken && this.P.appid && this.P.appid !== 'undefined') {
            var l = this.P.appid + t.joyytoken,
              f = this.decipherJoyToken(l, this.P.appid),
              p = f.expire,
              v = f.outtime;

            this.Le = f.jjt || 'a';
            this.L = f.time_correction || !1;
            this.B = Object.assign(
              Object.assign({}, this.B),
              {},
              {
                q: f.q || 0,
                cf_v: f.cf_v || this.B.cf_v,
              },
            );

            try {
              document.cookie = 'joyytokem=' + this.P.appid + t.joyytoken + ';domain=.jd.com;path=/;expires=' + new Date(p + v * 60 * 60 * 1e3).toGMTString();
              var y = window.localStorage.getItem('joyytokem'),
                w = {};
              if (y) {
                var b = JSON.parse(y),
                  x = Object.entries(b).sort(function (e, t) {
                    return e[1].n - t[1].n;
                  });
                if (x.length > 4) {
                  x = x.slice(x.length - 4);
                }
                x.forEach(function (e, t) {
                  e[1].n = t;
                  w[e[0]] = e[1];
                });
              }
              w[e] = {
                n: Object.keys(w).length,
                data: this.P.appid + t.joyytoken,
                xcd: t.xcd || '',
                expires: new Date(p + 60 * v * 60 * 1e3).toGMTString(),
              };
              window.localStorage.setItem('joyytokem', JSON.stringify(w));
            } catch (e) {
              this.getInterfaceData({
                funcName: 'cookie',
                real_msg: 'cookie或storage储存异常',
                error_msg: e.message,
              });
            }
          }
          if (t.collect_rate && t.collect_rate !== this.B.collect_rate) {
            this.B.collect_rate = t.collect_rate;
            await this.reportData();
            await this.reportInterfaceData();
          }
          Object.assign(this.B, t);
          if (this.M && this.M.length > 0) {
            const that = this;
            this.M.forEach(function (e) {
              if (e.functionid === 'init' || '1' === e.f_name) {
                e.cf_v = that.B.cf_v;
              }
            });
          }
        }
      } catch (e) {
        this.getInterfaceData({
          funcName: 'joytoken',
          real_msg: 'joytoken网络请求异常',
          error_msg: e.message,
        });
      }
    }
  }

  async reportInterfaceData() {
    try {
      this.setjoyyaCookie();
      if (baseUtils.isDuringDate(this.Je, this.Fe)) return;
      var a = this.B.openMonitor,
        u = this.B.collectStatus,
        c = this.B.collect_vote;
      if (a === '0') return;
      var s = baseUtils.collectVoteFilter(u, c, this.M, 'session_c');
      if (!s || s.length === 0) return;
      var f = baseUtils.getCurrentTime();
      s.forEach(function (t) {
        t.createdate = ''.concat(f);
      });
      if (this.P.appid && this.P.appid !== 'undefined') {
        this.clearjoyytoken(this.P.appid);
        await this.getjoyytoken(this.P.appid);
      }
      try {
        await baseUtils.ajax({
          type: 'POST',
          url: baseUtils.requestUrl.bypass,
          data: 'content='.concat(
            JSON.stringify({
              appname: 'interfaceInvoke',
              whwswswws: baseUtils.getCookie('shshshfpb'),
              jdkey: '',
              body: s,
            }),
          ),
        });
        this.M = [];
      } catch (e) {}
    } catch (e) {}
  }

  async reportData() {
    var i = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];
    try {
      this.setjoyyaCookie();
      var h = baseUtils.isDuringDate(this.Je, this.Fe);
      if (h) return;
      var s = this.B.openMonitor,
        f = this.B.collectStatus,
        l = this.B.collect_vote;
      if ('0' === s) return;
      var v;
      v = i ? this.I : baseUtils.collectVoteFilter(f, l, this.I, 'session');
      if (!v || v.length === 0) return;
      var p = baseUtils.getCurrentTime();
      v.forEach(function (e) {
        e.createdate = ''.concat(p);
      });

      try {
        await baseUtils.ajax({
          type: 'POST',
          url: baseUtils.requestUrl.bypass,
          data: 'content='.concat(
            JSON.stringify({
              appname: 'stouchmodeH5',
              whwswswws: baseUtils.getCookie('shshshfpb'),
              jdkey: '',
              body: v,
            }),
          ),
        });
        this.I = [];
      } catch (e) {}
    } catch (e) {}
  }

  getid(e) {
    return e.currentTarget.id || 'document';
  }

  clickCb(e) {
    try {
      this.Be = 't';
      if (!this.Z) return;
      var u = this.getid(e);
      var p = baseUtils.webview.getStorage('unionwsws') || {
        jmafinger: '',
      };

      var J = {
        appid: this.P.appid || '',
        sceneid: this.P.sceneid || '',
        uid: this.P.uid || '',
        url: encodeURIComponent(location.href),
        ua: encodeURIComponent(baseUtils.getUa()),
        type_d: this.je,
        shshshfpa: baseUtils.getCookie('shshshfpa'),
        shshshfpb: baseUtils.getCookie('shshshfpb'),
        cookie_pin: baseUtils.getCookiePin(),
        client_version: this.ee,
        npt: this.ge,
        nps: this.ye,
        nan: this.we,
        nvs: this.xe,
      };

      var K = this.z[u] || {};
      var q = baseUtils.getCurrentTime();
      var v = K.start_time || '',
        g = K.end_time || '',
        b = K.click_time || '';
      this.le = e.isTrusted;
      var a = baseUtils.getGPUMes();

      var oe = {
        buttonid: u,
        client_time: q,
        devtools_open: baseUtils.isDevtoolOpen(),
        touchtime: g - v,
        touch_is_trust: e.isTrusted,
        screenx: e.screenX,
        screeny: e.screenY,
        clientx: e.clientX,
        clienty: e.clientY,
        radiusx: K.radiusX,
        radiusy: K.radiusY,
        force: baseUtils.getDefaultVal(K.force),
        click_id: e.target.id || '',
        pagex: e.pageX,
        last_page_down_time: q - this.R,
        last_click_time: q - b,
        pagey: e.pageY,
        call_stack: baseUtils.getCallStack(),
        call_stack_source: baseUtils.getCallStackUnencrypted(),
        data: K.data || '',
        jdu: this.ie,
        session: this.$,
        time_correction: this.L,
        jdkey: baseUtils.getJdKey(),
        jmafinger: p.jmafinger,
        numOfNavigatorPlugins: baseUtils.getPluginsNum(),
        gpuServiceProvider: a[0],
        gpuBrand: a[1],
        numOfNavigatorLanguages: baseUtils.getLangNum() || '',
        numOfChromeAttribute: baseUtils.getChromeAttribute() || '',
        configurableEnumerable: baseUtils.getConfigurable_Enumerable(),
        azimuth: '',
        accelerometer: '',
        ncn: baseUtils.getNaviConnection(),
        bty: baseUtils.getBatteryStatus(),
      };

      this.setIdData(u, 'click_time', q);
      var W = Object.assign({}, J, oe);
      for (var M in W) {
        var U = W[M];
        W[M] = String(U);
      }
      this.I.push(W);
      baseUtils.arrayLength(3, this.ce, this.getCurrnetData(e));
    } catch (e) {}
  }

  getCurrnetData(e, t) {
    try {
      var u = (this.z[t] || {}).force,
        c = typeof baseUtils.getDefaultVal(u) == 'number' ? u.toFixed(3) : baseUtils.getDefaultVal(u),
        s = baseUtils.getCurrentTime() - this.fe,
        f = e.clientX,
        l = e.clientY;

      if (e.touches && e.touches.length > 0) {
        f = e.touches[0].clientX;
        l = e.touches[0].clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        f = e.changedTouches[0].clientX;
        l = e.changedTouches[0].clientY;
      }

      return (
        'd' +
        (this.ae.indexOf(e.type) + 1) +
        '-' +
        baseUtils.baseConverter(f, 36) +
        ',' +
        baseUtils.baseConverter(l, 36) +
        ',' +
        baseUtils.baseConverter(s, 36) +
        ',' +
        c +
        ',' +
        baseUtils.getDefaultVal(e.isTrusted)
      );
    } catch (e) {
      return '';
    }
  }

  moveCb(e) {
    this.Be = 't';
    if (!this.Z) return;
    if (this.ke) {
      this.ue = [];
      this.se[2] = 0;
      this.ke = 0;
    }
    var c = this.getid(e);
    baseUtils.arrayLength(5, this.ue, this.getCurrnetData(e, c));
    this.se[2] = this.se[2] + 1;
    this.se[1] = this.se[1] > this.se[2] ? this.se[1] : this.se[2];
  }

  endCb(e) {
    this.Be = 't';
    if (!this.Z) return;
    var c = this.getid(e);
    this.setIdData(c, 'end_time', baseUtils.getCurrentTime());
    this.setIdData(c, 'is_trust', e.isTrusted);
    baseUtils.arrayLength(3, this.ce, this.getCurrnetData(e, c));
  }

  startCb(e) {
    this.Be = 't';
    if (!this.Z) return;
    this.ke = 1;
    this.se[0] = this.se[0] + 1;
    let c = e.touches,
      s = void 0 === c ? [] : c;
    let l = s[0] || {};
    let f = this.getid(e);
    this.setIdData(f, 'session', this.$);
    l.start_time = baseUtils.getCurrentTime();
    const that = this[('radiusX', 'radiusY', 'force', 'start_time')].forEach(function (e) {
      that.setIdData(f, e, l[e] ? l[e] : 'a');
    });
    baseUtils.arrayLength(3, this.ce, this.getCurrnetData(e, f));
  }

  addListener() {
    this.addEvent();
  }

  addEvent() {
    document.addEventListener(this.ne, this.startCb);
    document.addEventListener(this.re, this.endCb);
    document.addEventListener(this.oe, this.moveCb);
    document.addEventListener('click', this.clickCb);
  }

  getBlog() {
    try {
      let r = baseUtils.getAppVersion();
      window.checkVersion = function (r) {
        try {
          if (r && r !== 'a') {
            let a = '9.5.2'.split('.'),
              u = r.split('.');
            if (
              Number(u[0]) > Number(a[0]) ||
              (Number(u[0]) === Number(a[0]) && Number(u[1]) > Number(a[1])) ||
              (Number(u[0]) === Number(a[0]) && Number(u[1]) === Number(a[1]) && Number(u[2]) >= Number(a[2]))
            ) {
              return !0;
            }
          }
          return !1;
        } catch (e) {
          return !1;
        }
      };

      if (window.checkVersion(r)) {
        const that = this;
        window.callBackNameSmash = function (r) {
          var a = JSON.parse(r || '{}');
          if (a.data) {
            that.Ee = a.data.blog;
            that.Oe = a.data.msg;
            if (that.Oe === void 0) {
              that.Oe = 'f';
            }
            if (!that.Ee) {
              if (that.Ee === void 0) {
                that.Ee = 'f';
              }
              that.getInterfaceData({
                funcName: 'blog',
                real_msg: 'blog为空',
              });
            }
          } else {
            that.Ee = 'f';
            that.Oe = 'f';
            that.getInterfaceData({
              funcName: 'blog',
              real_msg: 'blog取值异常',
            });
          }
        };
        let a = {
          callBackName: 'callBackNameSmash',
          callBackId: 'smash',
        };
        try {
          if (baseUtils.isIOS()) {
            a.routerURL = 'router://jdjmamodule/gethcb';
            a.routerParam = {};
            window.webkit &&
              window.webkit.messageHandlers.JDAppUnite.postMessage({
                method: 'callsyncroutermodulewithparams',
                params: JSON.stringify(a),
              });
          }
          if (baseUtils.isAndroid()) {
            a.routerURL = 'router://com.jingdong.app.mall.jma.jsjmamanager/getblog';
            window.JDAppUnite && window.JDAppUnite.callSyncRouterModuleWithParams(JSON.stringify(a));
          }
        } catch (r) {
          this.Ee = 'f';
          this.Oe = 'f';
          this.getInterfaceData({
            funcName: 'blog',
            real_msg: 'blog桥接失败',
          });
        }
      } else {
        this.getInterfaceData({
          funcName: 'blog',
          real_msg: '客户端版本不满足条件',
        });
      }
    } catch (r) {
      this.getInterfaceData({
        funcName: 'other',
        real_msg: 'inner.getBlog',
        error_msg: r && r.message,
      });
    }
  }

  getFpv() {
    try {
      var i = baseUtils.isApp('jd'),
        a = baseUtils.getAppVersion(),
        u = !1;
      if (i) {
        u = (baseUtils.isIOS() && baseUtils.versionCompare(a, '10.1.6') > -1) || (baseUtils.isAndroid() && baseUtils.versionCompare(a, '10.2.0') > -1);
      }
      if (u) {
        window.getSoftFingerprintBack = function (e) {
          var a = JSON.parse(e || '{}').data || '';
          document.cookie = 'shshshfpv='.concat(a, ';domain=.jd.com;path=/;expires=').concat(new Date(new Date().getTime() + 864e9).toGMTString());
        };
        var c = {
          callBackName: 'getSoftFingerprintBack',
          callBackId: new Date().getTime(),
        };
        try {
          if (baseUtils.isIOS()) {
            c.routerURL = 'router://JDJMAModule/getwhwswswws';
            c.routerParam = {};
            window.webkit &&
              window.webkit.messageHandlers.JDAppUnite.postMessage({
                method: 'callSyncRouterModuleWithParams',
                params: JSON.stringify(c),
              });
          }
          if (baseUtils.isAndroid()) {
            c.routerURL = 'router://com.jingdong.app.mall.jma.JSJMAManager/getSoftFingerprint';
            window.JDAppUnite && window.JDAppUnite.callRouterModuleWithParams(JSON.stringify(c));
          }
        } catch (e) {
          document.cookie = 'shshshfpv=;domain=.jd.com;path=/;expires='.concat(new Date(new Date().getTime() + 864e9).toGMTString());
        }
      }
    } catch (e) {
      this.getInterfaceData({
        funcName: 'other',
        real_msg: 'inner.getFpv',
        error_msg: e && e.message,
      });
    }
  }

  async getInfo() {
    if (!baseUtils.isDuringDate(this.Je, this.Fe)) {
      try {
        try {
          let { data: t } = await baseUtils.ajax({
            type: 'POST',
            url: baseUtils.requestUrl.getInfo,
            data: 'content='.concat(
              JSON.stringify({
                appname: 'smashH5pv',
                whwswswws: baseUtils.getCookie('shshshfpb'),
                jdkey: '',
                body: {},
              }),
            ),
          });

          if (t.code) {
            this.getInterfaceData({
              funcName: 'info',
              real_msg: 'info请求code异常',
              error_msg: JSON.stringify(t),
            });
          } else {
            var c = t.whwswswws || '';
            document.cookie = 'shshshfpb='.concat(c, ';domain=.jd.com;path=/;expires=').concat(new Date(new Date().getTime() + 864e9).toGMTString());
          }
        } catch (t) {
          document.cookie = 'shshshfpb=;domain=.jd.com;path=/;expires='.concat(new Date(new Date().getTime() + 864e9).toGMTString());
          this.getInterfaceData({
            funcName: 'other',
            real_msg: 'inner.getInfo.catch',
            error_msg: t && t.message,
          });
        }
      } catch (t) {
        this.getInterfaceData({
          funcName: 'other',
          real_msg: 'inner.getInfo',
          error_msg: t && t.message,
        });
      }
    }
  }

  getAppOs() {
    try {
      const that = this;
      window.getAppOsInformation = function (t) {
        try {
          var a = JSON.parse(t);
          if (a.status === '0') {
            var s = a.data,
              l = s.model || 'a',
              d = s.systemName || 'a',
              v = s.systemVersion || 'a',
              g = s.appVersion || 'a',
              w = s.appBuild || 'a',
              _ = s.uuid || 'a',
              A = s.eufv || 'a',
              C = s.aid || 'a',
              O = s.idfa || 'a';
            var j;
            try {
              j = d.match(/[A-Za-z0-9]+/g).join('');
            } catch (e) {
              j = 'a';
              that.getInterfaceData({
                funcName: 'other',
                real_msg: 'inner.getAppOs.systemName',
                error_msg: 'systemName='.concat(d, ';').concat(e && e.message),
              });
            }
            that.Ae = [l, j, v, g, w, _, A];
            baseUtils.isIOS() ? (that.Ce = O) : baseUtils.isAndroid() && (that.Ce = C);
          }
        } catch (e) {
          that.getInterfaceData({
            funcName: 'other',
            real_msg: 'inner.getAppOs.getAppOsInformation',
            error_msg: e && e.message,
          });
        }
      };

      this.Te = 'u';
      if (baseUtils.isAndroid()) {
        if (window.JDAppUnite) {
          this.Te = 't';
          window.JDAppUnite.getPhoneBasicInfo('getAppOsInformation');
        }
        this.je = 2;
      }
      if (baseUtils.isIOS()) {
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.JDAppUnite) {
          this.Te = 't';
          var o = {
            method: 'getPhoneBasicInfo',
            params: 'getAppOsInformation',
          };
          window.webkit.messageHandlers.JDAppUnite.postMessage(o);
        }
        this.je = 2;
      }
    } catch (t) {
      this.Ce = 'f';
      this.Ae = baseUtils.getFailedArr(7);
      this.getInterfaceData({
        funcName: 'other',
        real_msg: 'inner.getAppOs',
        error_msg: t && t.message,
      });
    }
  }

  handlerJrInfo(e) {
    var i = typeof e == 'object' ? e : JSON.parse(e);
    if (i.errorCode) {
      this.qe = baseUtils.getFailedArr(7);
      this.getInterfaceData({
        funcName: 'other',
        real_msg: 'getJrAppOs.errorCode',
        error_msg: ''.concat(i.errorCode, ',').concat(i.errorMsg),
      });
    } else {
      var u = i.deviceInfo,
        s = u.deviceType || 'a',
        l = u.osPlatform || 'a',
        h = u.osVersion || 'a',
        m = u.clientVersion || 'a',
        y = u.resolution || 'a',
        _ = u.deviceId || 'a',
        A = u.eufv || 'a',
        C = u.channelInfo || 'a',
        E = baseUtils.md5Str(_).slice(-16);
      this.qe = [s, l, h, m, y, E, A];
      var O = C;
      if (C && C.indexOf('#') > -1) {
        O = C.slice(0, C.indexOf('#'));
      }
      O = baseUtils.md5Str(O + E);
      this.Re = O.slice(-16);
      var k = {
        fbInfo: this.qe,
        jrStackInfo: this.Re,
      };
      if (!this.arrayEquals(this.qe, this.He) && window.localStorage) {
        window.localStorage.setItem('jrInfo', JSON.stringify(k));
      }
      this.getInterfaceData({
        funcName: 'other',
        real_msg: 'inner.handlerJrInfo',
        error_msg: JSON.stringify(k) || '',
      });
    }
  }

  getJrInfo() {
    if (baseUtils.isApp('jdjr')) {
      if (window.JrBridge) {
        this.Me = 't';
        this.ze = 1;
        try {
          const that = this;
          JrBridge.getDeviceInfo(function (t) {
            that.handlerJrInfo(t);
          });
        } catch (t) {
          this.qe = baseUtils.getFailedArr(7);
          this.getInterfaceData({
            funcName: 'other',
            real_msg: 'JrBridge.getDeviceInfo',
            error_msg: t && t.message,
          });
        }
      } else {
        this.getJrAppOs();
      }
    }
  }

  getJrAppOs() {
    try {
      if (!window.jsBridgeV3) {
        this.Me = 'u';
        return;
      }
      if (!window.defer) {
        window.defer = jsBridgeV3.onReady();
      }
      if (window.defer) {
        if (baseUtils.isApp('jdjr')) {
          this.Me = 't';
        }
        this.ze = 1;
        const that = this;
        defer.then(function (t) {
          var n = {
            type: 9,
            isLocation: !1,
            data: '',
          };
          t.jsToGetResp(function (e) {
            that.handlerJrInfo(e);
          }, n);
        });
      } else {
        this.Me = 'f';
      }
    } catch (t) {
      this.Me = 'u';
      this.qe = baseUtils.getFailedArr(7);
      this.getInterfaceData({
        funcName: 'other',
        real_msg: 'inner.getJrAppOs',
        error_msg: t && t.message,
      });
    }
  }

  getFbStorage(e) {
    try {
      if (this.arrayEquals(e, this.He) || this.arrayEquals(e, this.We)) {
        let a = window.localStorage && window.localStorage.getItem('jrInfo');
        if (a) {
          let u = JSON.parse(a);
          this.qe = u.fbInfo || '';
          this.Re = u.jrStackInfo || '';
          this.getInterfaceData({
            funcName: 'other',
            real_msg: 'inner.getFbStorage',
            error_msg: JSON.stringify(u.fbInfo) || '',
          });
        }
      }
    } catch (e) {}
  }

  arrayEquals(e, t) {
    return (
      e.length === t.length &&
      e.every(function (e, n) {
        return e === t[n];
      })
    );
  }

  getLocalData() {
    try {
      this.pe =
        '' +
        baseUtils.getCookieEnabled() +
        baseUtils.getSessionStorage() +
        baseUtils.getLocalStorage() +
        baseUtils.getIsMobileOne() +
        baseUtils.getIsMobileTwo() +
        baseUtils.getIsNodeEnv() +
        baseUtils.getHasNodeVM2();
      this.de = baseUtils.getExistWebdriver();
      this.he = baseUtils.getDetectPhantomjs();
      this.ve = this.reportInterfaceData && typeof this.reportInterfaceData == 'function' ? 't' : 'f';
      this.me = baseUtils.getNaviParam('platform');
      this.ge = baseUtils.getNaviParam('product');
      this.ye = baseUtils.getNaviParam('productSub');
      this.we = baseUtils.getNaviParam('appName');
      this.be = baseUtils.getNaviParam('vendor');
      this.xe = baseUtils.getNaviParam('vendorSub');
      this._e = baseUtils.getAppBuild();
      this.Se = baseUtils.getScreen();
      this.Ie = baseUtils.getExistMiniblink();
    } catch (t) {
      this.getInterfaceData({
        funcName: 'other',
        real_msg: 'inner.getLocalData',
        error_msg: t && t.message,
      });
    }
  }

  async getLoadData() {
    try {
      this.Pe = !0;
      this.R = baseUtils.getCurrentTime();
      this.Z = !0;
      await this.reportData();
      await this.reportInterfaceData();
    } catch (e) {
      this.getInterfaceData({
        funcName: 'other',
        real_msg: 'inner.getLoadData',
        error_msg: e && e.message,
      });
    }
  }

  handleCsVal(t) {
    var i = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : '';

    try {
      var d = '';
      d += '1';
      d += '0';
      try {
        var s = typeof window != 'undefined' && typeof window.JDAppUnite != 'undefined',
          f = window && window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.JDAppUnite;
        d += s || f ? '1' : '0';
      } catch (e) {
        d += '0';
      }
      d += '0';
      d = parseInt(d, 2);
      var h = d.toString(16);
      var p = ''.concat(t);
      var v = p.slice(p.length - 1);
      var m = (Number(d) + Number(v)) % 16;
      var l = i.split('');
      l[14] = m.toString(16);
      l[15] = h;
      return l.join('');
    } catch (e) {
      return i;
    }
  }

  getFillVal() {
    try {
      var r = 'u',
        i = navigator.userAgent.toLowerCase(),
        a = String(navigator.platform).toLowerCase().indexOf('linux') > -1,
        u = navigator.platform == 'Win32',
        c = navigator.platform == 'MacIntel';
      a ? (r = 'l') : u ? (r = 'w') : c ? (r = 'i') : /iphone|ipad|ipod/.test(i) && (r = 'm');
      var s = '';
      s += '0';
      try {
        s += window ? '1' : '0';
      } catch (e) {
        s += '0';
      }
      i && i.indexOf('jdapp') === 0 ? (s += '1') : (s += '0');
      s = parseInt(s, 2);
      return ''.concat(r).concat(s);
    } catch (r) {
      this.getInterfaceData({
        funcName: 'other',
        real_msg: 'inner.getFillVal',
        error_msg: r && r.message,
      });
      return '';
    }
  }

  setjoyyaCookie(e) {
    try {
      var w = Date.parse(new Date()).toString();
      w = w.slice(0, 10);
      var c = document.cookie.split('; ');
      var b = this.getFillVal();
      if (e) {
        var s = ''.concat(w, '.0.').concat(c.length),
          f = baseUtils.getCrcCode(s),
          l = ''.concat(s, '.').concat(f).concat(b);
        document.cookie = 'joyya='.concat(l, ';domain=.jd.com;path=/;expires=').concat(new Date(new Date().getTime() + 864e9).toGMTString());
      } else {
        var y = baseUtils.getCookie('joyya');
        var g = 0;
        y && (g = y.split('.')[0]);
        var v = ''.concat(g, '.').concat(w, '.').concat(c.length);
        var h = baseUtils.getCrcCode(v);
        var m = ''.concat(v, '.').concat(h).concat(b);
        document.cookie = 'joyya='.concat(m, ';domain=.jd.com;path=/;expires=').concat(new Date(new Date().getTime() + 864e9).toGMTString());
      }
    } catch (e) {
      this.getInterfaceData({
        funcName: 'other',
        real_msg: 'inner.setjoyyaCookie',
        error_msg: e && e.message,
      });
    }
  }

  async initial() {
    var n = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    try {
      var h = n.appId,
        v = n.preRequest,
        m = n.debug,
        g = n.onSign,
        y = n.onRequestTokenRemotely,
        w = n.onRequestToken;
      if (!baseUtils.isNotEmptyString(h)) {
        this.getInterfaceData({
          funcName: 'initial',
          real_msg: '参数appid不能为空',
          error_msg: h,
        });
        return;
      }
      if (!g) {
        this.getInterfaceData({
          funcName: 'initial',
          real_msg: '参数onsign不能为空',
        });
        return;
      }
      if (!y) {
        this.getInterfaceData({
          funcName: 'initial',
          real_msg: '参数onrequesttokenremotely不能为空',
        });
        return;
      }
      if (h.indexOf('_') === -1) {
        this.getInterfaceData({
          funcName: 'initial',
          real_msg: '参数appid格式不合法',
          error_msg: h,
        });
        return;
      }
      var s = h.split('_'),
        f = s[0],
        l = s[1];
      if (f) {
        this.Ge = !0;
        await this.init({
          appid: f,
          uid: baseUtils.getCookiePin(),
        });
      }
      if (l && !this.Xe) {
        this.Xe = !0;
        var p = {
          appId: l,
          debug: m,
          preRequest: v,
          onSign: g,
          onRequestTokenRemotely: y,
          onRequestToken: w,
        };
        // TODO 这好像是一个H5ST算法
        this.Ve = new N['default'](p);
      }
    } catch (e) {}
  }

  async init() {
    var i = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    try {
      !this.Pe && (await this.getLoadData());
      this.Q = this.Q + 1;
      this.clearjoyytoken(i.appid, !0);
      this.$ = this.$ || baseUtils.getTouchSession();
      this.P = {
        ids: [],
      };
      var f = {
        status: 0,
        msg: '',
      };
      var m = i.appid || '';
      if (!m) {
        this.getInterfaceData({
          funcName: 'init',
          real_msg: '参数错误',
        });
        f = {
          status: 1,
          msg: '参数错误',
        };
        return f;
      }
      Object.assign(this.P, i);
      await this.getjoyytoken(i.appid, !0);
      // TODO
      this.addListener();
      this.getInterfaceData({
        funcName: 'init',
      });
      return f;
    } catch (e) {
      this.getInterfaceData({
        funcName: 'init',
        real_msg: '初始化代码错误',
        error_msg: ''.concat(e.name, ',').concat(e.message),
      });
    }
  }

  async sign() {
    var r = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
      i = arguments.length > 1 ? arguments[1] : void 0;
    try {
      var u = {},
        c = '',
        s = '';
      if (i) {
        var p = r.functionId,
          h = r.appid,
          v = r.clientVersion,
          m = r.client,
          g = r.t,
          y = r.sign,
          b = r.body,
          _ = r.jsonp;
        s = h + m + v + p + g;
        c = b;
        if (typeof b === 'object') {
          c = JSON.stringify(b);
        }
        this.setParam(u, 'functionId', p);
        this.setParam(u, 'appid', h);
        this.setParam(u, 'clientVersion', v);
        this.setParam(u, 'client', m);
        this.setParam(u, 't', g);
        this.setParam(u, 'sign', y);
        this.setParam(u, 'jsonp', _);
        u.body = CryptoJS.SHA256(c).toString();
      } else {
        c = r;
      }
      if (typeof r === 'object') {
        c = JSON.stringify(r);
      }
      u = r;
      if (this.Ge) {
        var S = this.B.openTraffic;
        this.getInterfaceData({
          funcName: 'other',
          real_msg: 'inSmash',
          error_msg: S,
        });
        if (S === '1') {
          r.joylog = '';
        } else {
          var C = baseUtils.md5Str(c + s),
            O = {
              data: {
                random: C,
              },
            };
          var j = await this.get_risk_result(O);
          r.joylog = ''.concat(C, '*').concat(j.log);
        }
      }
      if (this.Ve) {
        this.getInterfaceData({
          funcName: 'other',
          real_msg: 'inPSign',
        });
        try {
          let e = await this.Ve.sign(u);
          this.getInterfaceData({
            funcName: 'other',
            real_msg: 'psign.sign加签成功',
            error_msg: JSON.stringify(u),
          });
          return e;
        } catch (e) {
          this.getInterfaceData({
            funcName: 'other',
            real_msg: 'PSign.sign加签失败，返回无签名参数',
            error_msg: JSON.stringify(u),
          });
          return r;
        }
      } else {
        this.getInterfaceData({
          funcName: 'other',
          real_msg: '不走签名，返回无签名参数',
        });
        return r;
      }
    } catch (e) {
      this.getInterfaceData({
        funcName: 'other',
        real_msg: '人机或签名失败，返回接口原入参',
        error_msg: e && e.message,
      });
      return r;
    }
  }

  async get_risk_result(e) {
    var i = e.id;
    var u = e.data || {};

    this.T += 1;
    var y = baseUtils.getCurrentTime(),
      b = {},
      N = '',
      E = '',
      O = '',
      k = 'a',
      D = 'a';

    var s, f, l, p, h, v, m, g;

    try {
      var M = this.P.ids || [],
        q = this.P.appid || '';
      this.clearjoyytoken(q);
      var W = '',
        K = baseUtils.getTokem('joyytokem', q),
        J = K.joyytokenVal,
        F = K.xcdVal;
      if (q && q !== 'undefined' && J) {
        l = J.slice(q.length);
        W = J;
      } else {
        l = baseUtils.getCookiePin();
        this.B.encrypt_id = this.B.default_encrypt_id;
        this.B.cf_v = this.B.default_cf_v;
      }
      var V = this.decryptJoyToken(W),
        G = V.openPre,
        X = V.q,
        Y = V.etid,
        Z = V.cf_v,
        ne = V.encrypt_id || '1,3,*,1';
      this.exeCode(F);
      ne = ne.replace(/\s*/g, '');
      var re = this.z[i],
        oe = '';
      !this.Q && (oe = 6);
      i === void 0 && (oe = 2);
      M.indexOf(i) === -1 && (oe = 3);
      this.ze === 0 && ((this.ze = 1), this.getJrInfo());
      y = baseUtils.getCurrentTime() + X;
      g = re && re.is_trust === !1 ? 0 : 1;
      g = G === '1' ? g : 1;
      f = baseUtils.getRandomWord(10);
      var ie,
        ae = Y.split(','),
        le = ne.split(','),
        ge = [le[2], le[3]],
        ye = baseUtils.objToString2(baseUtils.RecursiveSorting(u)),
        we = '',
        xe = !1,
        je = baseUtils.getInRange(ae, le[0], le[1]);
      ie = le[2];
      for (var ke = 0; ke < ie.length; ke++) {
        var He = ie[ke] === '*' ? je[baseUtils.getRandomInt(0, je.length - 1)] : ie[ke];
        we += He;
        var Pe = baseUtils.encrypt(He, f, y);

        if (Pe == null || (typeof Pe == 'number' && isNaN(Pe))) {
          xe = true;
          break;
        }
        O += Pe;
      }
      E = O && !xe ? 'C' : 'L';
      ge[0] = we;
      N = ge.toString();
      s = `${ye}&token=${l}&time=${y}&nonce_str=${f}&key=${O || this.De}&is_trust=${g}`;

      var We = le[3];
      p = We == '1' ? CryptoJS.SHA1(s).toString().toUpperCase() : CryptoJS.SHA256(s).toString().toUpperCase();
      this.setIdData(i, 'data', ye);
      h = baseUtils.getCrcCode(p);
      var Ke = baseUtils.getCallStack(),
        Je = baseUtils.md5Str(this.Ce),
        Fe = Ke.slice(16) + Je.slice(16);
      this.Me == 't' && (this.getFbStorage(this.qe), !this.Re && (this.Re = baseUtils.md5Str('').slice(-16)), (Fe = Fe.slice(0, -16) + this.Re));
      Fe = this['handleCsVal'](y, Fe);

      b = {
        tm: JSON.parse(JSON.stringify(this.ue)),
        tnm: JSON.parse(JSON.stringify(this.ce)),
        grn: this.T,
        ss: this.$ || 'a',
        wed: this.pe,
        wea: '' + this.de + this.he + this.ve + this.Be + this.Te + this.Le + this.Ie + 'a' + this.Me,
        pdn: baseUtils['getPageDomNum'](),
        jj: oe,
        cs: Fe || 'a',
        np: this.me,
        t: y,
        jk: baseUtils.getJdKey(),
        fpb: baseUtils.getCookie('shshshfpb'),
        nv: this.be,
        nav: this._e,
        scr: this.Se,
        ro: this.Ae,
        ioa: baseUtils['getIosAppDetail'](),
        aj: baseUtils['getAutoJs'](),
        ci: this.ee,
        cf_v: Z,
        bd: ye,
        mj: this.se,
        blog: this.Ee,
        msg: this.Oe,
        xcr: this.Ue,
      };

      't' === this.Me && (b.fb = this.qe);
      try {
        var Ye = baseUtils['xorEncrypt'](JSON.stringify(b), O || this.De);
        k = Ye.xorEncrypted.length;
        D = Ye['totalTime'];
        v = baseUtils['utoa'](Ye.xorEncrypted);
        m = baseUtils.getCrcCode(v);
      } catch (e) {
        k = 'c';
        D = 'c';
      }
      this.getInterfaceData({
        funcName: 'get_risk_result',
        key: O,
        is_trust: !!g,
        dataString: ye,
        buttonid: i,
        hl: k,
        ht: D,
      });
      this.ue = [];
      this.ce = [];
      this.$ = baseUtils.getTouchSession();
      this.fe = baseUtils.getCurrentTime();
      this.se = [0, 0, 0];
      await this.getjoyytoken(q);
      var tt = ''
        .concat(y, '|abcdefg|')
        .concat(g)
        .concat(f)
        .concat(l, '|abcdefg|')
        .concat(N, '|abcdefg|')
        .concat(p, '|abcdefg|')
        .concat(h, '|abcdefg|')
        .concat(E, '|abcdefg|')
        .concat(v, '|abcdefg|')
        .concat(m);
      tt = tt['replace'](/\|abcdefg\|/g, '~');
      this.U && (await this['reportData'](!0), this.reportInterfaceData(), (this.U = !1));
      return {
        result: 1,
        status: 0,
        log: tt,
      };
    } catch (e) {
      var it = ''.concat(e.name, ',').concat(e.message);
      b.jj = 5;
      b.ci = this.ee;
      !O && (E = 'L');
      N == '' && ((E = 'L'), (O = ''));
      try {
        var st = baseUtils['xorEncrypt'](JSON.stringify(b), O || this.De),
          ft = st.xorEncrypted,
          lt = st.totalTime;
        k = ft.length;
        D = lt;
        v = baseUtils.utoa(ft);
        m = baseUtils.getCrcCode(v);
      } catch (e) {
        (k = 'c'), (D = 'c');
      }
      var dt = ''
        .concat(y, '|abcdefg|')
        .concat(g)
        .concat(f)
        .concat(l, '|abcdefg|')
        .concat(N, '|abcdefg|')
        .concat(p, '|abcdefg|')
        .concat(h, '|abcdefg|')
        .concat(E, '|abcdefg|')
        .concat(v, '|abcdefg|')
        .concat(m);
      dt = dt['replace'](/\|abcdefg\|/g, '~');
      var at = {};
      (at.funcName = 'get_risk_result'), (at.real_msg = 'get_risk_result代码错误'), (at.error_msg = it), (at.hl = k), (at.ht = D), this.getInterfaceData(at);
      this.U && (await this['reportData'](!0), this.reportInterfaceData(), (this.U = !1));
      var pt = {};
      return (pt['result'] = 1), (pt.log = dt), pt;
    }
  }

  getRandom(e) {
    try {
      if (typeof e !== 'number' || isNaN(e) || !Number.isInteger(e) || e < 1) {
        this.getInterfaceData({
          funcName: 'other',
          real_msg: 'getRandom参数错误',
          error_msg: 'type:'.concat(JSON.stringify(e), ', value: ').concat(e),
        });
        return '';
      }
      return baseUtils.getRandomWord(Math.min(15, e), !0);
    } catch (e) {
      this.getInterfaceData({
        funcName: 'other',
        real_msg: 'getRandom异常',
        error_msg: e && e.message,
      });
      return '';
    }
  }

  getHash(e) {
    try {
      if (typeof e === 'string') {
        return baseUtils.md5Str(e).slice(8, -8);
      } else {
        this.getInterfaceData({
          funcName: 'other',
          real_msg: 'getHash参数错误',
          error_msg: 'type:'.concat(JSON.stringify(e), ', value: ').concat(e),
        });
        return '';
      }
    } catch (e) {
      this.getInterfaceData({
        funcName: 'other',
        real_msg: 'getHash异常',
        error_msg: e && e.message,
      });
      return '';
    }
  }
}

module.exports.SmashUtils = SmashUtils;
