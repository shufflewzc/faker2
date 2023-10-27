const {Env} = require('./magic');
const $ = new Env('MTest');

$.logic = async function () {
    let activityContent = {
        "result": true,
        "data": {
            "id": "173f89d8cc6d413e81a357b07137d56d",
            "userId": 197936,
            "venderType": 0,
            "endTime": 1649381820000,
            "list": [{
                "type": "dq",
                "takeNum": null,
                "discount": "20",
                "quota": "499"
            }],
            "hasFollow": false,
            "openCard": false,
            "shopMember": false,
            "shopgiftActivity": null
        },
        "count": 0,
        "errorMessage": ""
    }
    $.content = activityContent.data.list
    let ts = $.content.filter(o => ['jd', 'jf'].includes(o.type));
    if (ts.length === 0) {
        $.putMsg(`不是豆子或积分不跑`);
    }

};
$.run({whitelist: [1]})
.catch(reason => $.log(reason));
