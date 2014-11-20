/**
 * Created by Administrator on 14-11-19.
 */
var db = require('./conn'),
    async = require('async'),
    cheerio = require('cheerio'),
    http = require('http');

var KePrice = require('./models/price');

exports.craw = function () {
    var count = 0;
    async.whilst(
        function () {
            io.emit('crawing',count);
            return count < 2;
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

function handleSqlResult(results,cb) {
    if(results){
        async.mapLimit(results,5, function (item,callback) {
            var url = buildUrl(item.word,true);
            var data;
            http.get(url, function (res) {
                res.on('data',function(chunk){
                    data += chunk;
                });

                res.on('end',function(){
                    handleJson(item.word,data,callback);
                });
            });
        }, function (err, result) {
            cb();
        });
    }else{
        cb();
    }
}

function getKeywords(n,cb) {
//    var sql = "SELECT keyword as word FROM `ming_thesauri_shot` ORDER BY click_num DESC LIMIT ?,10000";
    var sql = "SELECT keyword as word FROM `ming_thesauri_shot` LIMIT ?,10";
    db.execQuery({
        sql:sql,
        args:[n],
        handler: function (results) {
            handleSqlResult(results,cb);
        }
    });
}

function crawTaobao(url,callback) {
    superAgent.get(url, function (res) {
        console.log(res.body);
        callback(res.error,res.text);
    });
}

function craw(url,callback) {
    superAgent.get(url, function (res) {
        callback(res.error,res);
    });
}

function handleHtml(text, cb) {
   var $ = cheerio.load(text);
    var divArray = $("");
    divArray.forEach(function (div) {
        
    });
}

function handleJson(keyword,jsonStr, cb) {
    try{
        if(jsonStr){
            var begin = jsonStr.indexOf('itemlist')+10,
                end = jsonStr.indexOf('lessrewritegrid')- 2,
                price,
                volume,
                sales,
                totalFee = 0,
                totalVolume = 0;

            jsonStr = jsonStr.substring(begin,end);
            var json = JSON.parse(jsonStr);
            var data = json['data'];
            if(data){
                var auctions = data['auctions'];
                if(auctions){
                    auctions.forEach(function (item) {
                        price = parseFloat(item['view_price']);
                        sales = item['view_sales'];
                        volume = parseInt(sales.substring(0,sales.indexOf('\\')));
                        totalFee += (volume * price);
                        totalVolume += volume;
                    });
                    if(totalVolume==0){
                        totalVolume++;
                    }
                    var p = new KePrice({
                        keyword:keyword,
                        taobaoPrice:totalFee/totalVolume
                    });

                    p.save(function () {
                        cb(null,null);
                    });
                }
            }
        }
    }catch(e) {
        cb(e,null);
    }
}

function crawPrice(word,callback) {
    async.parallel([
        function (cb) {
            craw(buildUrl(word,true),function(err,result){
                if(err){
                    throw Error(err);
                }
                console.log(word+" taobao 爬了。。。");
                handleJson(result.text,cb);
            });
        },
        function (cb) {
            craw(buildUrl(word,false),function(err,result){
                if(err){
                    throw Error(err);
                }
                console.log(word+" tmall 爬了。。。");
                handleJson(result.text,cb);
            });
        }
    ], function (err, results) {
        callback(err,results);
    });
}

function beginCraw(results,cb) {
    async.mapLimit(results,5, function (item,callback) {
        crawPrice(item.word,callback);
    }, function (err) {
        if(err){
            console.log("beginCraw error");
            throw err;
        }
        cb();
    })
}

function buildUrl(word,taobao) {
    if(taobao){
        return "http://s.taobao.com/search?data-key=s&data-value=44&ajax=true&_ksTS=1416393755219_1036&callback=jsonp1037&refpid=420462_1006&tab=all&q="+word+"&style=grid&p4poffset=4&source=tbsy&sort=renqi-desc&s=0";
    }else{
        return "http://s.taobao.com/search?data-key=s&data-value=88&ajax=true&_ksTS=1416469892072_1164&callback=jsonp1165&isprepay=1&initiative_id=staobaoz_20141120&tab=mall&q="+word+"&style=grid&stats_click=search_radio_tmall%253A1&sort=renqi-desc&s=44";
    }
}