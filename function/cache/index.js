let DS = require('ds')
try {
    if (DS.toString() === '[object Object]') {
        DS = DS.DS
    }
} catch {}
function Cache(ttl = 0, save_file = null) {
    let me = this
    me.now = function () {
        return new Date().getTime()
    }
    me.ttl = ttl || 0
    if (save_file) {
        me.data = new DS(save_file)
    } else {
        me.data = new DS()
    }
    let save = function () {
        if (save_file) me.data.save(save_file)
        return me
    }
    let nuke = function (key) {
        delete me.data[key]
        save()
        return me
    }
    me.get = function (key, cb) {
        let val = null
        let obj = me.data[key]
        if (obj) {
            if (obj.expires == 0 || me.now() < obj.expires) {
                val = obj.val
            } else {
                val = null
                nuke(key)
            }
        }
        if (cb) cb(val)
        return val
    }
    me.del = function (key, cb) {
        let oldval = me.get(key)
        nuke(key)
        if (cb) cb(oldval)
        return oldval
    }
    me.put = function (key, val = null, ttl = 0, cb) {
        if (ttl == 0) ttl = me.ttl
        let expires = ttl == 0 ? 0 : me.now() + ttl
        var oldval = me.del(key)
        if (val !== null) {
            me.data[key] = {
                expires,
                val,
            }
            save()
        }
        if (cb) cb(oldval)
        return oldval
    }
}
module.exports = Cache
