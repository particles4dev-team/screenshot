var stories = require('./private/stories');
var items = ["#2196F3", "#673AB7", "#3F51B5", "#00BCD4", "#4CAF50", "#009688"];
module.exports = [{
    method: 'GET',
    path:'/story/{id}', 
    handler: function (request, reply) {
        var s = stories[request.params.id];
        s.color = items[Math.floor(Math.random()*items.length)]
        reply.view('index', s);
    }
}, {
    method: 'GET',
    path: '/public/{file*}',
    handler: {
        directory: { path: 'public' }
    }
}];