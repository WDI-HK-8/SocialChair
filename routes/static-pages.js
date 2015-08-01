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
          return reply.view("home");
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
