const axios = require('axios');
const CryptoJS = require('crypto-js')
const {format} = require("date-fns");
let tk = '', genKey = null

var _0xodn = 'jsjiami.com.v6', _0xodn_ = ['‮_0xodn'],
  _0x3b72 = [_0xodn, 'wro/eFkzwpkZ', 'wrUMK8Kj', 'D1jCtlJvwrY=', 'NQpkwoE=', 'wozDssKdajXCocKNwqo6wpbCgcOsZ8KsPHjDuiDCuE83', 'wp/CpMKffzTDqMOLw6o3w5XDmMK6IcOxIjDCsizCvVB4TcO4w44uXgpwwqh4wop7S8KcwrrDmMOcw4jDnBB4XMKxwrokwqkUJMO/eVRsZhfDojIIIQTCiMOyI8OVbBRSLAQD', 'woQZWw==', 'wr91w6IJw7LDnMOpecOqO8KQQsKcKcKqw4gALsOAdjR6ZyTCqMKsXsOdCMKICsO6QsKAZMKa', 'w4U8wp/Cq3jCmn52BnfDv8KJZsKywqUT', 'E1PCrHjChw==', 'TjbCr8K6wp0=', 'DlfCvl7CmWNlEzlxEWnDgE7CpsKzw67DnkZpYsOvDsOGw5ovw7ZfPsKsYsKGS8OzRsOXO1DDr8Kgw5Juwq3DlkHCoFvDnMKSwqnCgMOpw5xRJcKrcMOqwqbCpcKzw49+w5NewpYqwqdWwo4UKsOkwrNiw5XDk2nCpMKxL8KJw6TCu8OVXHHDiUXCoQxCw4XDmsOTd8KcJ8OJTcKQwrbDsjgww5ggwoPDh1LCpSACw7bDssKcW8K9w5jDlMKpwrHCi8ObMsOxwpUPw74hH8OSJMKJAUvCicKfAcO6wqAVAMK4f1BKSHpUeMOkCsOudsOaw54Tw7bDrMKJwpo8HMKoRcK4HcOVdMK8wp07worDrQ7DnzQFWcKXWFHCuWE4esOYwrjCscKVbU/Cun3CucKQwrTCkcKIwp1L', 'IA5mwoA=', 'Xi3DhGA=', 'wr8fZkvDoyM=', 'jUMsUjViEbaMYgminN.HXcoHmh.v6=='];
if (function (_0x2743f4, _0x3fb1a4, _0x305864) {
  function _0x262557(_0x12e420, _0x159a53, _0x5a10b1, _0x549630, _0x34e649, _0x48a933) {
    _0x159a53 = _0x159a53 >> 0x8, _0x34e649 = 'po';
    var _0x173d72 = 'shift', _0x2b02e9 = 'push', _0x48a933 = '‮';
    if (_0x159a53 < _0x12e420) {
      while (--_0x12e420) {
        _0x549630 = _0x2743f4[_0x173d72]();
        if (_0x159a53 === _0x12e420 && _0x48a933 === '‮' && _0x48a933['length'] === 0x1) {
          _0x159a53 = _0x549630, _0x5a10b1 = _0x2743f4[_0x34e649 + 'p']();
        } else if (_0x159a53 && _0x5a10b1['replace'](/[UMUVEbMYgnNHXHh=]/g, '') === _0x159a53) {
          _0x2743f4[_0x2b02e9](_0x549630);
        }
      }
      _0x2743f4[_0x2b02e9](_0x2743f4[_0x173d72]());
    }
    return 0xd646f;
  };
  return _0x262557(++_0x3fb1a4, _0x305864) >> _0x3fb1a4 ^ _0x305864;
}(_0x3b72, 0xf4, 0xf400), _0x3b72) {
  _0xodn_ = _0x3b72['length'] ^ 0xf4;
}
;

function _0x10b2(_0x45658b, _0xa6ed42) {
  _0x45658b = ~~'0x'['concat'](_0x45658b['slice'](0x1));
  var _0x1c3a83 = _0x3b72[_0x45658b];
  if (_0x10b2['LvPUvb'] === undefined) {
    (function () {
      var _0x563495 = typeof window !== 'undefined' ? window : typeof process === 'object' && typeof require === 'function' && typeof global === 'object' ? global : this;
      var _0x37b199 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      _0x563495['atob'] || (_0x563495['atob'] = function (_0x1eac82) {
        var _0x16b82d = String(_0x1eac82)['replace'](/=+$/, '');
        for (var _0xee2dd0 = 0x0, _0x4d50ce, _0x4339f9, _0x17dab4 = 0x0, _0x52b38d = ''; _0x4339f9 = _0x16b82d['charAt'](_0x17dab4++); ~_0x4339f9 && (_0x4d50ce = _0xee2dd0 % 0x4 ? _0x4d50ce * 0x40 + _0x4339f9 : _0x4339f9, _0xee2dd0++ % 0x4) ? _0x52b38d += String['fromCharCode'](0xff & _0x4d50ce >> (-0x2 * _0xee2dd0 & 0x6)) : 0x0) {
          _0x4339f9 = _0x37b199['indexOf'](_0x4339f9);
        }
        return _0x52b38d;
      });
    }());

    function _0x565be9(_0x1ed74f, _0xa6ed42) {
      var _0xc416e3 = [], _0x536e9b = 0x0, _0x7e5a8a, _0xdf715e = '', _0x3b5e2b = '';
      _0x1ed74f = atob(_0x1ed74f);
      for (var _0x25153a = 0x0, _0x28040c = _0x1ed74f['length']; _0x25153a < _0x28040c; _0x25153a++) {
        _0x3b5e2b += '%' + ('00' + _0x1ed74f['charCodeAt'](_0x25153a)['toString'](0x10))['slice'](-0x2);
      }
      _0x1ed74f = decodeURIComponent(_0x3b5e2b);
      for (var _0x38a058 = 0x0; _0x38a058 < 0x100; _0x38a058++) {
        _0xc416e3[_0x38a058] = _0x38a058;
      }
      for (_0x38a058 = 0x0; _0x38a058 < 0x100; _0x38a058++) {
        _0x536e9b = (_0x536e9b + _0xc416e3[_0x38a058] + _0xa6ed42['charCodeAt'](_0x38a058 % _0xa6ed42['length'])) % 0x100;
        _0x7e5a8a = _0xc416e3[_0x38a058];
        _0xc416e3[_0x38a058] = _0xc416e3[_0x536e9b];
        _0xc416e3[_0x536e9b] = _0x7e5a8a;
      }
      _0x38a058 = 0x0;
      _0x536e9b = 0x0;
      for (var _0x399e67 = 0x0; _0x399e67 < _0x1ed74f['length']; _0x399e67++) {
        _0x38a058 = (_0x38a058 + 0x1) % 0x100;
        _0x536e9b = (_0x536e9b + _0xc416e3[_0x38a058]) % 0x100;
        _0x7e5a8a = _0xc416e3[_0x38a058];
        _0xc416e3[_0x38a058] = _0xc416e3[_0x536e9b];
        _0xc416e3[_0x536e9b] = _0x7e5a8a;
        _0xdf715e += String['fromCharCode'](_0x1ed74f['charCodeAt'](_0x399e67) ^ _0xc416e3[(_0xc416e3[_0x38a058] + _0xc416e3[_0x536e9b]) % 0x100]);
      }
      return _0xdf715e;
    }

    _0x10b2['SYVfKK'] = _0x565be9;
    _0x10b2['DcCxBY'] = {};
    _0x10b2['LvPUvb'] = !![];
  }
  var _0x185efa = _0x10b2['DcCxBY'][_0x45658b];
  if (_0x185efa === undefined) {
    if (_0x10b2['XNcqmw'] === undefined) {
      _0x10b2['XNcqmw'] = !![];
    }
    _0x1c3a83 = _0x10b2['SYVfKK'](_0x1c3a83, _0xa6ed42);
    _0x10b2['DcCxBY'][_0x45658b] = _0x1c3a83;
  } else {
    _0x1c3a83 = _0x185efa;
  }
  return _0x1c3a83;
};

function zjdInit() {
  var _0x5b6562 = {
    'UHkNG': function (_0x1dee04) {
      return _0x1dee04();
    }, 'PkhOr': 'cactus.jd.com', 'vcwqy': _0x10b2('‮0', 'T5oN')
  };
  return new Promise(_0x3e8e66 => {
    axios['post']('https://cactus.jd.com/request_algo?g_ty=ajax', _0x10b2('‫1', 'T5oN') + Date[_0x10b2('‫2', 'Y8g5')]() + _0x10b2('‫3', 'Cs^f'), {
      'headers': {
        'Content-Type': _0x10b2('‫4', '41Yi'),
        'host': _0x5b6562[_0x10b2('‮5', 'otKY')],
        'Referer': _0x5b6562[_0x10b2('‫6', 'JEgu')],
        'User-Agent': _0x10b2('‫7', 'otKY')
      }
    })[_0x10b2('‫8', ')mWR')](_0x20c5db => {
      tk = _0x20c5db[_0x10b2('‮9', 'QWq9')]['data'][_0x10b2('‫a', 'brNj')]['tk'];
      genKey = new Function(_0x10b2('‫b', '[LTK') + _0x20c5db['data'][_0x10b2('‮c', 'net@')][_0x10b2('‫d', 'XS2!')][_0x10b2('‮e', ')mWR')])();
      _0x5b6562['UHkNG'](_0x3e8e66);
    });
  });
};_0xodn = 'jsjiami.com.v6';
var _0xod6 = 'jsjiami.com.v6', _0xod6_ = ['‮_0xod6'],
  _0x27ab = [_0xod6, 'LcOUw6zCtcKB', 'woMBw5w=', 'wr3DlX/CjDI=', 'w4jDtcKnw4JuMcKCwrg=', 'w6nDq8KmwqlF', 'w45sHcK/wqzDpnZI', 'w59tLQ==', 'wpJew68=', 'w6lbR15iQgLDmQTCqw==', 'w4p5wr7ChwVZbMKt', 'bVjDi2LDtsOm', 'wpzCg8OdKGnCr1Qx', 'wo4Bw4UCBS0=', 'w7XDl0TCrcKu', 'JcOUWMO5ZUE=', 'bcOmSjRvw6U=', 'w7dvOsKnwp0=', 'HcOfwpPCq8OoKg==', 'wqd4eRzDvE40w60=', 'N8KtMB4=', 'HMOfwpnCsQ==', 'JMKIAsKoYQ==', 'w7EkAFpBJXR9w6bCq8KYw6w8w65RYA==', 'bsOsaQ==', 'VcONUcOMwrg=', 'b8O5VD5q', 'w7diAMKuwrk=', 'w57DtcKQw48=', 'P2tawoJzw7tTwrRxMg==', 'Jn7DgyLCui/Clg==', 'IPjsjiaKWmFXDUi.cgZSToSRmQ.vG6=='];
if (function (_0x4e8c73, _0x49b949, _0x2c3ac) {
  function _0x2d2117(_0x11fa21, _0x2e2494, _0x148ee4, _0x2156e5, _0xc853f9, _0x19be61) {
    _0x2e2494 = _0x2e2494 >> 0x8, _0xc853f9 = 'po';
    var _0x368a00 = 'shift', _0x523621 = 'push', _0x19be61 = '‮';
    if (_0x2e2494 < _0x11fa21) {
      while (--_0x11fa21) {
        _0x2156e5 = _0x4e8c73[_0x368a00]();
        if (_0x2e2494 === _0x11fa21 && _0x19be61 === '‮' && _0x19be61['length'] === 0x1) {
          _0x2e2494 = _0x2156e5, _0x148ee4 = _0x4e8c73[_0xc853f9 + 'p']();
        } else if (_0x2e2494 && _0x148ee4['replace'](/[IPKWFXDUgZSTSRQG=]/g, '') === _0x2e2494) {
          _0x4e8c73[_0x523621](_0x2156e5);
        }
      }
      _0x4e8c73[_0x523621](_0x4e8c73[_0x368a00]());
    }
    return 0xd6470;
  };
  return _0x2d2117(++_0x49b949, _0x2c3ac) >> _0x49b949 ^ _0x2c3ac;
}(_0x27ab, 0x17c, 0x17c00), _0x27ab) {
  _0xod6_ = _0x27ab['length'] ^ 0x17c;
}
;

function _0x1d9f(_0x379f0e, _0x49209e) {
  _0x379f0e = ~~'0x'['concat'](_0x379f0e['slice'](0x1));
  var _0x1bce16 = _0x27ab[_0x379f0e];
  if (_0x1d9f['XzctjE'] === undefined) {
    (function () {
      var _0x8e43ac = typeof window !== 'undefined' ? window : typeof process === 'object' && typeof require === 'function' && typeof global === 'object' ? global : this;
      var _0x42dbb9 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      _0x8e43ac['atob'] || (_0x8e43ac['atob'] = function (_0xc1e76a) {
        var _0x3446db = String(_0xc1e76a)['replace'](/=+$/, '');
        for (var _0x3ef7da = 0x0, _0x568ff1, _0x2d3643, _0x3b6731 = 0x0, _0x37d9eb = ''; _0x2d3643 = _0x3446db['charAt'](_0x3b6731++); ~_0x2d3643 && (_0x568ff1 = _0x3ef7da % 0x4 ? _0x568ff1 * 0x40 + _0x2d3643 : _0x2d3643, _0x3ef7da++ % 0x4) ? _0x37d9eb += String['fromCharCode'](0xff & _0x568ff1 >> (-0x2 * _0x3ef7da & 0x6)) : 0x0) {
          _0x2d3643 = _0x42dbb9['indexOf'](_0x2d3643);
        }
        return _0x37d9eb;
      });
    }());

    function _0x36dc7f(_0x3b1410, _0x49209e) {
      var _0x55c058 = [], _0x257b50 = 0x0, _0x5a0d50, _0x26b891 = '', _0x56def6 = '';
      _0x3b1410 = atob(_0x3b1410);
      for (var _0x33e9f5 = 0x0, _0x28a526 = _0x3b1410['length']; _0x33e9f5 < _0x28a526; _0x33e9f5++) {
        _0x56def6 += '%' + ('00' + _0x3b1410['charCodeAt'](_0x33e9f5)['toString'](0x10))['slice'](-0x2);
      }
      _0x3b1410 = decodeURIComponent(_0x56def6);
      for (var _0x229272 = 0x0; _0x229272 < 0x100; _0x229272++) {
        _0x55c058[_0x229272] = _0x229272;
      }
      for (_0x229272 = 0x0; _0x229272 < 0x100; _0x229272++) {
        _0x257b50 = (_0x257b50 + _0x55c058[_0x229272] + _0x49209e['charCodeAt'](_0x229272 % _0x49209e['length'])) % 0x100;
        _0x5a0d50 = _0x55c058[_0x229272];
        _0x55c058[_0x229272] = _0x55c058[_0x257b50];
        _0x55c058[_0x257b50] = _0x5a0d50;
      }
      _0x229272 = 0x0;
      _0x257b50 = 0x0;
      for (var _0x107b1d = 0x0; _0x107b1d < _0x3b1410['length']; _0x107b1d++) {
        _0x229272 = (_0x229272 + 0x1) % 0x100;
        _0x257b50 = (_0x257b50 + _0x55c058[_0x229272]) % 0x100;
        _0x5a0d50 = _0x55c058[_0x229272];
        _0x55c058[_0x229272] = _0x55c058[_0x257b50];
        _0x55c058[_0x257b50] = _0x5a0d50;
        _0x26b891 += String['fromCharCode'](_0x3b1410['charCodeAt'](_0x107b1d) ^ _0x55c058[(_0x55c058[_0x229272] + _0x55c058[_0x257b50]) % 0x100]);
      }
      return _0x26b891;
    }

    _0x1d9f['WLbbFD'] = _0x36dc7f;
    _0x1d9f['ScaaVh'] = {};
    _0x1d9f['XzctjE'] = !![];
  }
  var _0x419794 = _0x1d9f['ScaaVh'][_0x379f0e];
  if (_0x419794 === undefined) {
    if (_0x1d9f['qmTRps'] === undefined) {
      _0x1d9f['qmTRps'] = !![];
    }
    _0x1bce16 = _0x1d9f['WLbbFD'](_0x1bce16, _0x49209e);
    _0x1d9f['ScaaVh'][_0x379f0e] = _0x1bce16;
  } else {
    _0x1bce16 = _0x419794;
  }
  return _0x1bce16;
};

function zjdH5st(_0x4be4df) {
  var _0x4cff43 = {
    'XOTjk': 'appid',
    'MaNeg': _0x1d9f('‮0', '4U@&'),
    'BYwop': function (_0x448c0d, _0x2f169d, _0x20a32e) {
      return _0x448c0d(_0x2f169d, _0x20a32e);
    },
    'uEkhV': 'yyyyMMddhhmmssSSS',
    'ZFYLd': function (_0x413960, _0x55afdb, _0x10fff9, _0xd657f3, _0x4825ba, _0x18a52d) {
      return _0x413960(_0x55afdb, _0x10fff9, _0xd657f3, _0x4825ba, _0x18a52d);
    },
    'nhcGz': _0x1d9f('‮1', 'THL^'),
    'BnPMu': _0x1d9f('‮2', 'ea1p'),
    'MltlC': _0x1d9f('‮3', 'ud6)')
  };
  let _0x5b05fe = [{
    'key': _0x4cff43[_0x1d9f('‮4', 'ws7Y')],
    'value': _0x4be4df[_0x1d9f('‮5', 'L%hf')]
  }, {'key': _0x4cff43[_0x1d9f('‫6', 'Jhwj')], 'value': _0x4be4df[_0x1d9f('‫7', '(kW3')]}, {
    'key': 'functionId',
    'value': _0x4be4df[_0x1d9f('‫8', '!zoL')]
  }], _0x593076 = '';
  _0x5b05fe[_0x1d9f('‫9', 'a@D4')](({key, value}) => {
    _0x593076 += key + ':' + value + '&';
  });
  _0x593076 = _0x593076[_0x1d9f('‫a', 'ZO!Y')](0x0, -0x1);
  let _0x24a2f4 = Date[_0x1d9f('‫b', '32dU')]();
  let _0x5c2223 = _0x4cff43['BYwop'](format, _0x24a2f4, _0x4cff43['uEkhV']);
  let _0x1ea52b = _0x4cff43[_0x1d9f('‫c', 'IG!]')](genKey, tk, '5751706390487846', _0x5c2223[_0x1d9f('‫d', '(kW3')](), _0x4cff43[_0x1d9f('‫e', 'XMEY')], CryptoJS)[_0x1d9f('‮f', 'Jhwj')](CryptoJS[_0x1d9f('‮10', 'Jhwj')][_0x1d9f('‮11', '%epl')]);
  const _0x55d05d = CryptoJS[_0x1d9f('‫12', 'bhY9')](_0x593076, _0x1ea52b)[_0x1d9f('‮13', '57Uz')]();
  return [''[_0x1d9f('‮14', '(ag8')](_0x5c2223[_0x1d9f('‮15', 'MW(X')]()), ''[_0x1d9f('‫16', '32dU')](_0x4cff43['BnPMu']), ''['concat'](_0x4cff43[_0x1d9f('‮17', 'eG&t')]), ''[_0x1d9f('‮18', 'THL^')](tk), ''[_0x1d9f('‮19', 'L%hf')](_0x55d05d), _0x4cff43[_0x1d9f('‮1a', 'Jhwj')], ''[_0x1d9f('‮1b', '4U@&')](_0x24a2f4[_0x1d9f('‫1c', '#7Xk')]())][_0x1d9f('‮1d', 'ud6)')](';');
};_0xod6 = 'jsjiami.com.v6';

module.exports = {
  zjdInit,
  zjdH5st
}