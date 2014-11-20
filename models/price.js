/**
 * Created by Administrator on 14-11-20.
 */
module.exports = function KePrice(p) {
    this.keyword = p.keyword;
    this.taobaoPrice = p.taobaoPrice;
    this.tmallPrice = p.tmallPrice;
};

KePrice.prototype.save = function (handler) {
    var sql = "insert into ming_word_for_price(word,taobaoPrice,tmallPrice,updateTime)values(?,?,?,now()) on duplicate key update updateTime=now() ";
    if(this.taobaoPrice){
        sql += ",taobaoPrice=?";
    }
    if(this.tmallPrice){
        sql += ",tmallPrice=?";
    }

    var params = [];
    params.push(this.keyword);
    params.push(this.taobaoPrice);
    params.push(this.tmallPrice);

    db.execQuery({
        sql: sql,
        args:args,
        handler:handler
    });
};