var Auth = require('./auth');

exports.register = function(server, options, next) {
  server.route([
    {
      method: 'GET',
      path: '/',
      handler: function(request, reply){
        Auth.authenticated(request, function(result){
          if (!result.authenticated) {
            return reply.view("index");
          }
          return reply.view("my_event");
        });
      }
    },
    {
      method: 'GET',
      path: '/my_event',
      handler: function(request, reply){
        Auth.authenticated(request, function(result){
          if (!result.authenticated) {
            return reply.view("index");
          }
          return reply.view("my_event");
        });
      }
    },
    {
      method: 'GET',
      path: '/my_organisation',
      handler: function(request, reply){
        Auth.authenticated(request, function(result){
          if (!result.authenticated) {
            return reply.view("index");
          }
          return reply.view("my_organisation");
        });
      }
    },
    {
      method: 'GET',
      path: '/profile/{id?}',
      handler: function(request, reply){
        Auth.authenticated(request, function(result){
          if (!result.authenticated) {
            return reply.view("index");
          }
          return reply.view("profile");
        });
      }
    },
    {
      method: 'GET',
      path: '/organisation/{id?}',
      handler: function(request, reply){
        Auth.authenticated(request, function(result){
          if (!result.authenticated) {
            return reply.view("index");
          }
          return reply.view("organisation");
        });
      }
    },
    {
      method: 'GET',
      path: '/event/{id?}',
      handler: function(request, reply){
        Auth.authenticated(request, function(result){
          if (!result.authenticated) {
            return reply.view("index");
          }
          return reply.view("event");
        });
      }
    },
    {
      method: 'GET',
      path: '/public/{path*}',
      handler: {
        directory: {
          path: 'public'
        }
      }
    }
  ]);
  next();
};

exports.register.attributes = {
  name: 'static-pages-route',
  version: '0.0.1'
};
