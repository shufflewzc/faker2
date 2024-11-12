function setBaseCookie() {
  var cookie = [];

  function genUuid() {
    return new Date().getTime() + '' + parseInt(2147483647 * Math.random());
  }

  function setCookie(e, t, i) {
    if (e) {
      var n = '';
      if (i) {
        var a = new Date();
        a.setTime(a.getTime() + i), (n = ';expires=' + a.toGMTString());
      }
      document.cookie = e + '=' + t + n + ';path=/;domain=jd.com;';
    }
  }

  function setJdv(e, t) {
    var i = isPrey(10) && (!e || e.length > 400) ? t + '|direct|-|none|-|' + new Date().getTime() : e;
    setCookie('__jdv', i, 1296000000);
  }

  function isPrey(e) {
    if (e >= 100) return !0;
    var t = uuid,
      r = t.substr(t.length - 2);
    return !!r && 1 * r < e;
  }

  var r = 122270672,
    i = genUuid(),
    s = parseInt(new Date().getTime() / 1e3);
  var uuid = i;

  setCookie('__jda', [r, i, s, s, s, 1].join('.'), 15552000000);
  setCookie('__jdb', [r, 1, i + '|' + 1, s].join('.'), 1800000);
  var j = encodeURIComponent([r, 'direct', '-', 'none', '-', new Date().getTime()].join('|'));
  setJdv(j, r);
  setCookie('__jdc', r);
  setCookie('mba_muid', encodeURI(i));

  return cookie.join('');
}

module.exports.setBaseCookie = setBaseCookie;
