var Hapi = require('hapi');
var Path = require('path');

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
        });
    }
});