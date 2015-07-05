var stories = require('./private/stories');
module.exports = [{
    method: 'GET',
    path:'/story/{id}', 
    handler: function (request, reply) {
       reply.view('index', stories[request.params.id]);
    }
}, {
    method: 'GET',
    path: '/public/{file*}',
    handler: {
        directory: { path: 'public' }
    }
}];