var Hapi = require('hapi');
var Path = require('path');
var _    = require('lodash');

// Create a server with a host and port
var server = new Hapi.Server();
server.connection({ 
    host: 'localhost', 
    port: 3000 
});

// Add the route
server.route(require('./routes'));

server.views({
    engines: {
        html: require('handlebars')
    },
    path: 'views',
    helpersPath: 'views/helpers',
    layoutPath: 'views/layout',
    layout: 'default'
});

// Start the server
server.register({
    register: require('good'),
    options: {
        reporters: [{
            reporter: require('good-console'),
            events: {
                log: '*',
                error: '*'
            }
        }]
    }
}, function (err) {
    if (err) {
        throw err;
    }

    if (!module.parent) {
        server.start(function () {
            server.log('info', 'Server running at: ' + server.info.uri);
            screenshot();
        });
    }
});


Pipeline = (function(){
    return function () {
        var self = this;
        /**
         * Pipeline
         *
         *
         */
        var _pipeline = [];
        var length = 0;
        /**
         * @description It is true if we are in flushing function now
         * @type {boolean}
         */
        var inFlush = false;
        /**
         * @description It true if a flushing function is scheduled, or if we are in flushing now
         * @type {boolean}
         */
        var willFlush = false;
        self.push = function(func /** param1, param2 ... */){
            var args = Array.prototype.slice.call(arguments, 1);
            if(!_.isFunction(func))
                throw new Error("param must be type of function");
            func = _.bind.apply(_, [func, null].concat(args));
            _pipeline.push(func);

            return this;
        };
        self.unshift = function(func /** param1, param2 ... */){
            var args = Array.prototype.slice.call(arguments, 1);
            if(!_.isFunction(func))
                throw new Error("param must be type of function");
            func = _.bind.apply(_, [func, null].concat(args));
            _pipeline.unshift(func);

            return this;
        };
        self.flushing = function(num){
            var tmp = null;
            inFlush = true;
            length = _.isNumber(num) ? num : _pipeline.length;
            for (var i = 0; i < length; i++) {
                tmp = _pipeline.shift();
                if(_.isFunction(tmp))
                    tmp();
            }

            //reset
            //_pipeline = [];
            length = 0;
            willFlush = false;
            inFlush = false;
            return this;
        };
        // set
        self.willFlush = function( p ){
            willFlush = !!p;
            return this;
        };
        self.inFlush = function( p ){
            inFlush = !!p;
            return this;
        };
        // get
        self.isWillFlush = function(){
            return willFlush;
        };
        self.isInFlush = function(){
            return inFlush;
        };
        self.requireFlush = function (num, second) {
            if (! willFlush) {
                var args = Array.prototype.slice.call(arguments, 0);
                willFlush = true;
                second = _.isUndefined(second) ? 0 : second;
                setTimeout(function () {
                    var func = _.bind.apply(self, [self.flushing, null].concat(args));
                    func();
                }, second);
            }
            return this;
        };
        self.reset = function () {
            _pipeline = [];
            length = 0;
            willFlush = false;
            inFlush = false;
            return this;
        };
        self.sequenceFlush = function (option) {
            if(self.isSequenceFlush)
                return;
            self._sequenceFlush(option);
        };
        self._sequenceFlush = function (option) {
            self.isSequenceFlush = true;
            self.requireFlush(1);
            setTimeout(function () {
                if(_pipeline.length > 0)
                    self._sequenceFlush(option);
                else
                    self.isSequenceFlush = false;
            }, option.duration);
        };
        self.getLength = function () {
            return _pipeline.length;
        };
    };
})();

var child_process   = require('child_process');
var fs   = require('fs');
// how long to let phantomjs run before we kill it
var REQUEST_TIMEOUT = 15*1000;
// maximum size of result HTML. node's default is 200k which is too
// small for our docs.
var MAX_BUFFER = 5*1024*1024; // 5MB
PHANTOM_SCRIPT = fs.readFileSync("./bin/screenshot.js", "utf8");
function screenshotTask (num) {
    console.log('http://localhost:3000/story/' + num + '"');
    var pt = 'var url = "http://localhost:3000/story/' + num + '"; var urls = url.split("/");' + PHANTOM_SCRIPT;
    child_process.execFile('/bin/bash', [
        '-c',
        // https://groups.google.com/forum/#!msg/meteor-talk/dPLss2idrJg/Dd4qL9O9d6AJ
        // https://groups.google.com/d/msg/meteor-talk/dPLss2idrJg/rUmD8Ak9Ln8J
        // --ssl-protocol=tlsv1
        // https://groups.google.com/d/msg/meteor-talk/dPLss2idrJg/Dd4qL9O9d6AJ
        // --ignore-ssl-errors=yes
        ("exec phantomjs --ignore-ssl-errors=yes --ssl-protocol=tlsv1 --load-images=yes /dev/stdin <<'END'\n" + pt + "END\n")],
        {
            timeout: REQUEST_TIMEOUT,
            maxBuffer: MAX_BUFFER
        }, function(error, stdout, stderr) {
        // phantomjs failed. Don't send the error, instead send the
        // normal page.
        if(error){
            if (error.code === 127)
                console.log("phantomjs: phantomjs not installed. Download and install from http://phantomjs.org/");
            else {
                console.log("phantomjs: phantomjs failed:", error, "\nstderr:", stderr);
            }
        }
        else
            console.log("done: ");
    });
}
var stories = require('./private/stories');

function screenshot (num) {
    var a = new Pipeline();
    for (var i = stories.length - 1; i >= 0; i--) {
        a.push(screenshotTask.bind(null, i));
    };
    a.sequenceFlush({
        duration: 1500 //ms
    });
}