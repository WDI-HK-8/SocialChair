var Hapi = require('hapi');
var Path = require('path');
var server = new Hapi.Server();

server.connection({
  host: '0.0.0.0',
  port: process.env.PORT || '3000',
  routes: {
    cors: {
      headers: ["Access-Control-Allow-Credentials"],
      credentials: true
    }
  }
});

server.views({
  engines: {
    html: require('handlebars')
  },
  path: Path.join(__dirname, 'templates')
});

var plugins = [
  { register: require('./routes/users.js')},
  { register: require('./routes/static-pages.js')},
  { register: require('./routes/sessions.js')},
  { register: require('./routes/organisations.js')},
  { register: require('./routes/events.js')},
  { register: require('./routes/organisation-memberships.js')},
  {
    register: require('yar'),
    options: {
      cookieOptions: {
        password: '2me*gQJO,W4BYcu',
        isSecure: false
      }
    }
  },
  {
    register:require('hapi-mongodb'),
    options: {
      url: process.env.MONGOLAB_URI || 'mongodb://localhost:27017/social_chair',
      settings: {
        db: {
          native_parser: false
        }
      }
    }
  }
];

server.register(plugins, function(err){
  //  check error
  if (err) {
    throw err;
  }
  server.start(function(){
    console.log('info', 'server running at: ' + server.info.uri);
  });
});
