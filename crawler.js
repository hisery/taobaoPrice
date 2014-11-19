/**
 * Created by Administrator on 14-11-19.
 */
var db = require('./conn');
var async = require('async');

exports.craw = function () {
    var count = 0;
    async.whilst(
        function () {
            io.emit('crawing',count);
            return count < 5;
        },
        function (cb) {
            getKeywords(count++,cb);
        },
        function (err) {
            if(err){
                console.log("craw error"+err);
            }
        });
};

function getKeywords(n,cb) {
//    var sql = "SELECT keyword as word FROM `ming_thesauri_shot` ORDER BY click_num DESC LIMIT ?,10000";
    var sql = "SELECT keyword as word FROM `ming_thesauri_shot` LIMIT ?,10";
    db.execQuery({
        sql:sql,
        args:[n],
        handler: function (results) {
            beginCraw(results,cb);
        }
    });
}

function beginCraw(results,cb) {
    var url;
    console.log("begin craw");
    async.mapLimit(results,5, function (word,callback) {
        console.log("crawing "+word+" now...");
        url = buildUrl(word);
        craw(url,callback);
    }, function (err) {
        if(err){
            console.log("craw error");
            throw err;
        }
        cb();
    })
}

function buildUrl(word) {
    return "http://s.taobao.com/search?data-key=s&data-value=44&ajax=true&_ksTS=1416393755219_1036&callback=jsonp1037&refpid=420462_1006&tab=all&q="+word+"&style=grid&p4poffset=4&source=tbsy&sort=renqi-desc&s=0";
//    return "http://s.taobao.com/search?data-key=s&data-value=44&ajax=true&_ksTS=1416393755219_1036&callback=jsonp1037&refpid=420462_1006&tab=all&q=%B6%CC%D1%A5&style=grid&p4poffset=4&source=tbsy&sort=renqi-desc&s=0";
}

function craw(url,callback) {
    
}