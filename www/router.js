var tinycolor = require('tinycolor');
var sprintf = require("sprintf-js").sprintf;

// 日志显示的时候，传入传出的数据字段最多显示多少
const MAX_CONTENT = 128;

// io对象(manager对象)的路由是用默认房间的路由实现的
var Manager = require('socket.io').Manager;
Manager.prototype.route = function (keyword, handlers) {
    this.of('').route(keyword, handlers);
    return this;
};

// 实现房间的route函数，此函数用于添加路由表
var SocketNamespace = require('./node_modules/socket.io/lib/namespace');
SocketNamespace.prototype.route = function (keyword, handlers) {
    var t = typeof handlers;
    if (t === 'function') {
        add_route(this, keyword, handlers);
    } else if (t === 'object') {
        for (var action in handlers) {
            add_route(this, keyword + '.' + action, handlers[action]);
        }
    }
    return this;
};

// 添加路由表，路由事件在连接建立之后设置
function add_route(room, keyword, user_callback) {
    var display_cmd = room.name + '.' + keyword;
    if (undefined === room.router) {
        room.router = {};
    }
    if (undefined !== room.router[keyword]) {
        console.warn(('duplicate route ' + display_cmd).bold.yellow);
    }
    room.router[keyword] = user_callback;
}

// 连接时为房间动态添加路由
var of_org = Manager.prototype.of;
Manager.prototype.of = function (room_id) {
    if (undefined === room_id) {
        room_id = '';
    }
    if (room_id !== '') {
        // 改良of，使之支持不以/开头的房间名
        if ('/' !== room_id.charAt(0)) {
            room_id = '/' + room_id;
        }
    }
    var room = of_org.call(this, room_id);
    room.on('connection', function (socket) {
        hook_socket(socket, room.router);
    });
    return room;
}

function hook_socket(socket, router) {
    if (undefined === router)
        return;
    if (socket.hooked)
        return;
    socket.hooked = true;

    for (var keyword in router) {
        if ('' === keyword)
            continue;
        socket.on(keyword, event_handler.bind({socket: socket, name: keyword, event: router[keyword]}));
    }
}

function event_handler() {
    // console.log('on ' + this.socket.namespace.name.substring(1) + ': ' + this.name);
    var len = arguments.length;
    var req = {
        name: this.name,
        room: this.socket.namespace.name.substring(1),
        socket: this.socket
    };

    var respond = function (json){
        console[this.callback ? 'log': 'warn'](
            sprintf('%s < ', getIP(this.req.socket)).grey,
            stringify(json).substring(0, MAX_CONTENT).green,
            (this.callback ? '' : sprintf('(droped, no callback for %s#%s)', this.req.room, this.req.name).bold.yellow)
        );
        if (this.callback)
            this.callback(json);
    };

    if (0 === len) {
        req.respond = respond.bind({req: req, callback: undefined});
        return this.event(req);
    }

    req.data = Array.prototype.slice.call(arguments, 0);
    if ('function' === typeof req.data[len-1]) {
        req.respond = respond.bind({req: req, callback: req.data.pop()});
    } else {
        req.respond = respond.bind({req: req, callback: undefined});
    }
    return this.event(req);
}

// 匹配任何路由 match any emit
var onClientMessage_org = Manager.prototype.onClientMessage;
Manager.prototype.onClientMessage = function (client_id, req) {
    var sockets = of_org.call(this, req.endpoint);
    var socket = sockets.socket(client_id, true);
    var router = sockets.router;

    // 打印日志
    // console.log(stringify(req));
    if (undefined !== req.name && undefined !== router) {
        req.match = (undefined !== router[req.name]);
        console[req.match ? 'log': 'warn'](
            sprintf('%s =>', getIP(socket)).grey,
            sprintf('%s#%s: %s', req.endpoint.substring(1), req.name, getArgs(req.args)).white,
            req.match ? '' : '(droped)'.bold.yellow
        );
        var handler = router[''];       // '' 匹配任何路由
        if (undefined !== handler) {
            handler.call({socket: socket, request: req});
        }
    }

    return onClientMessage_org.call(this, client_id, req);
};

// 拦截从服务器发出的网络命令，打印日志
var Socket = require('./node_modules/socket.io/lib/socket');
var orig_emit = Socket.prototype.emit;
Socket.prototype.emit = function () {
    if (this.muteEmit) {
        this.muteEmit = false;
    } else {
        var args = getArgs(arguments, 1);
        console.log(
            sprintf('%s <=', getIP(this)).grey,
            sprintf('%s#%s:', this.namespace.name.substring(1), arguments[0]).green,
            args.green
        );
    }
    return orig_emit.apply(this, arguments);
};


function getIP(socket) {
    var client = socket.handshake.address;
    //return sprintf('%15s:%-5d', client.address, client.port);
    return sprintf('%-13s', client.address);
}

function getArgs (args, start) {
    var param = [];
    for (var i = start || 0; i < 3; i++) {
        if (args[i] && 'function' !== typeof args[i])
            param.push(stringify(args[i]));
    }
    var str =  param.join(', ');
    return str.substring(0, MAX_CONTENT);
}

function stringify(o){
    var cache = [];
    return JSON.stringify(o, function(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    });
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}