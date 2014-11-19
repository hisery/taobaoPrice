/**
 * Created by Administrator on 14-11-19.
 */
var mysql = require('mysql');
var config = require('./config');

var pool = mysql.createPool(config.db);

/**
 * 释放数据库连接
 */
exports.release = function(connection) {
    connection.end(function(error) {
        console.log('Connection closed');
    });
};

exports.execQuery = function (options) {
    pool.getConnection(function (err, conn) {
        if(err){
            console.log('DB-获取数据库连接异常！');
            throw err;
        }

        /*
         * connection.query('USE ' + config.db, function(error, results) { if(error) { console.log('DB-选择数据库异常！'); connection.end(); throw error; } });
         */
        // 查询参数
        var sql = options['sql'];
        var args = options['args'];
        var handler = options['handler'];

        if(!args){
            var query = conn.query(sql, function (error, results) {
                if(error){
                    console.log('DB-执行查询语句异常！');
                    throw error;
                }
                // 处理结果
                handler(results);
            });
            console.log(query.sql);
        }else{
            var query = conn.query(sql, args, function(error, results) {
                if(error) {
                    console.log('DB-执行查询语句异常！');
                    throw error;
                }

                // 处理结果
                handler(results);
            });
            console.log(query.sql);
        }
        // 返回连接池
        conn.release(function (error) {
            if(error) {
                console.log('DB-关闭数据库连接异常！');
                throw error;
            }
        });
    });
};


