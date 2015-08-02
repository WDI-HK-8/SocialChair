var Auth = require('./auth');
var Joi = require('joi');

exports.register = function(server, options, next) {
  server.route([

  ]);
  next();
};

exports.register.attributes = {
  name: 'events-route',
  version: '0.0.1'
};
