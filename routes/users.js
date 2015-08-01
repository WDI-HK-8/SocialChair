var Bcrypt = require('bcrypt');
var Joi = require('joi');
var Auth = require('./auth');


exports.register = function(server, options, next) {

  server.route([
    {
      method: 'GET',
      path: '/users',
      handler: function(request, reply){
        var callbackFunction = function(result) {
          if (!result.authenticated) {
            return reply(result);
          }
          var db = request.server.plugins['hapi-mongodb'].db;
          db.collection('users').find().toArray(function(err, users){
            if (err) { return reply('Internal MongoDB errer', err);}
            reply(users);
          });
        };
        Auth.authenticated(request, callbackFunction);
      }
    },
    {
      method: 'POST',
      path: '/users',
      config: {
        handler: function(request, reply) {
          var db = request.server.plugins['hapi-mongodb'].db;
          var user = request.payload.user;
          var uniqueUserQuery = {
            $or: [
              {username: user.username},
              {email: user.email}
            ]
          };
          db.collection('users').count(uniqueUserQuery, function(err, userExist){
            if (userExist) {
            return reply({userExist: true});
            }
            user.first_name =   '';
            user.last_name =    '';
            user.profile_picture =   '';
            var access_keys =   ['public'];
            user.access_keys =  access_keys;

            Bcrypt.genSalt(10, function(err, salt){
              Bcrypt.hash(user.password, salt, function(err, encrypted){
                user.password = encrypted;
                db.collection('users').insert(user, function(err, writeResult){
                  if (err) {
                    return reply ("Internal MongoDB error", err);
                  }
                  reply(writeResult);
                });
              });
            });
          });
        },
        validate: {
          payload: {
            user: {
              screen_name: Joi.string().min(3).max(20).required(),
              username: Joi.string().min(3).max(20).required(),
              password: Joi.string().min(6).max(20).required(),
              email: Joi.string().email().max(50).required()
            }
          }
        }
      }
    },
    {
      method: 'PUT',
      path: '/users/{id}',
      config: {
        handler: function(request, reply) {
          var user_id = encodeURIComponent(request.params.id);
          Auth.authenticated(request, function(result){
            if (!result.authenticated || user_id != result.user_id) {
              return reply({write_permission: false});
            }
            var db = request.server.plugins['hapi-mongodb'].db;
            var user = request.payload.user;

            return db.collection('users').update(
              {_id: result.user_id},
              {
                name:        user.screen_name,
                email:       user.email,
                first_name:  user.first_name,
                last_name:   user.last_name
              },{},
              function(err, writeResult){
                if (err) {
                  return reply ("Internal MongoDB error", err);
                }
                reply(writeResult);
              }
            );
          });


        },
        validate: {
          payload: {
            user: {
              screen_name: Joi.string().min(3).max(20).required(),
              email: Joi.string().email().max(50).required(),
              first_name: Joi.string().min(3).max(20).required(),
              last_name: Joi.string().min(3).max(20).required()
            }
          }
        }
      }
    }
  ]);
  next(); //important
};

//Defining the description of the plugin
exports.register.attributes = {
  name: 'users-routes',
  version: '0.0.1'
};
