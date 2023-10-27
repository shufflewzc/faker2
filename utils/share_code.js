var allShareCodes = [];
var removedShareCodes = [];
var chetou_number = process.env.CHETOU_NUMBER ? process.env.CHETOU_NUMBER : 0
var fair_mode = process.env.FAIR_MODE ? true : false
var precode_mode = process.env.PRECODE_MODE ? false : true

exports.ModCK = function(cks) {
    console.log(`您${fair_mode ? "有" : "没有"}设置雨露均沾模式。`)
    console.log(`您设置了${chetou_number}个车头。`)
    if (cks.length <= chetou_number || !fair_mode) {
        return cks
    }
    var sck = []
    var eck = []
    for (var i = 0; i < cks.length; i++) {
        if (i <= chetou_number - 1) {
            sck.push(cks[i])
        } else {
            eck.push(cks[i])
        }
    }
    eck.sort(function() {
        return Math.random() - 0.5;
    })
    console.log(`已对${eck.length}个ck做了随机处理。`)
    for (var i = 0; i < eck.length; i++) {
        sck.push(eck[i])
    }
    if (!precode_mode) {
        if (sck.length >= 2) {
            sck.push(sck[0])
        }
        if (sck.length >= 3) {
            sck.push(sck[1])
        }
        if (sck.length >= 4) {
            sck.push(sck[2])
        }
        if (sck.length >= 5) {
            sck.push(sck[3])
        }
        if (sck.length >= 6) {
            sck.push(sck[4])
        }
    }
    return sck
}




exports.setDefaultShareCodes = function(str) {
    if (!str) {
        return
    }
    var shareCodes = str.split("@")
    console.log(`您提供了${shareCodes.length}个账号的助力码\n`);
    if (shareCodes && shareCodes.length) {
        for (var shareCode of shareCodes) {
            if (shareCode && shareCode != "undefined" && allShareCodes.indexOf(shareCode) == -1) {
                allShareCodes.push(shareCode)
            }
        }
    }
}

exports.addShareCode = function(shareCode) {
    if (shareCode && allShareCodes.indexOf(shareCode) == -1) {
        allShareCodes.push(shareCode)
    }
}

exports.removeShareCode = function(shareCode) {
    removedShareCodes.push(shareCode)
}

exports.forEachShareCode = function(func) {
    for (var shareCode of allShareCodes) {
        if (removedShareCodes.indexOf(shareCode) == -1) {
            if (func(shareCode)) {
                break
            }
        }
    }
}

exports.getShareCodes = function() {
    var shareCodes = []
    for (var shareCode of allShareCodes) {
        if (removedShareCodes.indexOf(shareCode) == -1) {
            shareCodes.push(shareCode)
        }
    }
    return shareCodes
}

exports.getAllShareCodes = function() {
    return allShareCodes
}