function getBaseCookie(userAgent, url) {
    var cookie = "";

    function genUuid() {
        return new Date().getTime() + "" + parseInt(2147483647 * Math.random());
    }

    function setCookie(e, t) {
        if (e) {
            cookie += " " + e + "=" + t + ";";
        }
    }

    function setJdv(e, t) {
        var i = isPrey(10) && (!e || e.length > 400) ? t + "|direct|-|none|-|" + new Date().getTime() : e;
        setCookie("__jdv", i);
    }

    function isPrey(e) {
        if (e >= 100) return !0;
        var t = uuid, r = t.substr(t.length - 2);
        return !!r && 1 * r < e;
    }

    function isEmbedded() {
        var e = userAgent || "";
        return /^(jdapp|jdltapp|jdpingou|jdmini|yhdapp);/.test(e) || isJdLog();
    }

    function isJdLog() {
        return (userAgent || "").indexOf(";jdlog;") > -1;
    }

    var r = 122270672, i = genUuid(), s = parseInt(new Date().getTime() / 1e3);
    uuid = i;

    var C, P = url && url.split("/")[2], A = !1;

    setCookie("__jda", [r, i, s, s, s, 1].join("."));
    setCookie("__jdb", [r, 1, i + "|" + 1, s].join("."));
    var j = encodeURIComponent([r, "direct", "-", "none", "-", new Date().getTime()].join("|"));
    setJdv(j, r);
    setCookie("__jdc", r);
    setCookie("mba_muid", encodeURI(uuid));

    return cookie;
}

module.exports.getBaseCookie = getBaseCookie
