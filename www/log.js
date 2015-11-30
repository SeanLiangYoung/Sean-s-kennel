// 为日志添加时间显示前缀
// 建立日志文件 /var/log/nodejs/应用名-YYYY-MM-DD.log
// Windows系统下日志文件位于当前磁盘的 \var\log\nodejs 目录

var ospath = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var moment = require('moment');
var sprintf = require("sprintf-js").sprintf;

const APP_NAME = ospath.basename(__dirname);
const LOG_PATH = '/var/log/nodejs';

moment.lang('zh-cn');
mkdirp.sync(LOG_PATH);

var colors = {log: 'grey', info:'white', warn:'yellow', error:'red'};
['log', 'info', 'warn', 'error'].forEach(function (fn) {
    console[fn] = function() {
        var now = moment();
        var prefix = (now.format('YYYY-MM-DD HH:mm:ss') + sprintf(' %-5s', this.level))[colors[this.level]];
        var args = Array.prototype.slice.call(arguments, 0);
        var result;
        if (undefined !== this.orig) {
            result = this.orig.apply(console, [prefix].concat(args));
        }
        var logfile = sprintf('%s/%s-%s.log', LOG_PATH, APP_NAME, now.format('YYYY-MM-DD'));
        var cmd = args.shift();
        for(var i =0; i < args.length; i++){
            if ('object' === typeof args[i]) {
                args[i] = JSON.stringify(args[i]);
            }
        }
        var text = sprintf('%s %s %s %s\n', prefix, this.level, cmd, args.join(' ')).replace(/\x1b\[\d+m/g, '');
        fs.appendFile(logfile, text, function (err) {
            if (err) {
                this.orig.call(console, prefix, ('can not write to logfile ' + logfile).bold.red);
            }
        });
        return result;
    }.bind({level: fn, orig: console[fn]});
});
