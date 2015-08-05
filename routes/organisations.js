var Auth = require('./auth');
var Joi = require('joi');

exports.register = function(server, options, next) {
  server.route([
    {
      method: 'POST',
      path: '/organisations',
      config: {
        handler: function(request, reply) {
          Auth.authenticated(request, function(result){
            if (!result.authenticated) {
              return reply(result);
            }
            var db = request.server.plugins['hapi-mongodb'].db;
            var organisation = request.payload.organisation;
            organisation.owner_id =   result.user_id;
            organisation.admin_ids =  [result.user_id];
            organisation.member_ids = [result.user_id];
            db.collection('organisations').insert(organisation, function(err, writeResult){
              if (err) {
                return reply ("Internal MongoDB error", err);
              }
              return reply({'organisation_id': organisation._id});
            });
          });
        },
        validate: {
          payload: {
            organisation: {
              name: Joi.string().min(3).max(50).required(),
              description: Joi.string().max(2000).required(),
              location: Joi.string().max(200).required(),
              private: Joi.boolean().required()
            }
          }
        }
      }
    },
    {
      method: 'GET', //Joined + public
      path: '/organisations',
      handler: function(request, reply){
        Auth.authenticated(request, function(result) {
          if (!result.authenticated) {
            return reply(result);
          }
          var db = request.server.plugins['hapi-mongodb'].db;
          var publicAndJoinedQuery = {
            $or: [
              {private:     false},
              {admin_ids:   result.user_id},
              {member_ids:  result.user_id}
            ]
          };
          db.collection('organisations').find(publicAndJoinedQuery).toArray(function(err, organisations){
            if (err) { return reply('Internal MongoDB errer', err);}
            return reply(organisations);
          });
        });
      }
    },
    {
      method: 'GET', //By id
      path: '/organisations/{id}',
      handler: function(request, reply){
        Auth.authenticated(request, function(result) {
          if (!result.authenticated) {
            return reply(result);
          }
          var  organisation_id = encodeURIComponent(request.params.id);
          var db = request.server.plugins['hapi-mongodb'].db;
          var ObjectId = request.server.plugins['hapi-mongodb'].ObjectID;
          db.collection('organisations').findOne({"_id": ObjectId(organisation_id)}, function(err, organisation){
          if (err) { return reply('Internal MongoDB error', err);}
          return reply(organisation);
        });
        });
      }
    },
    {
      method: 'DELETE', //By id
      path: '/organisations/{id}',
      handler: function(request, reply){
        Auth.authenticated(request, function(result) {
          if (!result.authenticated) {
            return reply(result);
          }
          var  organisation_id = encodeURIComponent(request.params.id);
          var db = request.server.plugins['hapi-mongodb'].db;
          var ObjectId = request.server.plugins['hapi-mongodb'].ObjectID;
          db.collection('organisations').findOne({_id: ObjectId(organisation_id)}, function(err, organisation){
            if (err) { return reply('Internal MongoDB error', err);}
            if (organisation === null) {
              return reply({organisationExist: false });
            }
            if (organisation.owner_id.toString() !== result.user_id.toString()){
              return reply({writePermission: false});
            }
            db.collection('organisations').remove({_id: ObjectId(organisation_id)}, function(err, writeResult){
              if (err) { return reply('Internal MongoDB error', err);}
              return reply(writeResult);
            });
          });
        });
      }
    },
    {
      method: 'PUT', //By id
      path: '/organisations/{id}',
      config: {
        handler: function(request, reply) {
          Auth.authenticated(request, function(result) {
            if (!result.authenticated) {
              return reply(result);
            }
            var  organisation_id = encodeURIComponent(request.params.id);
            var db = request.server.plugins['hapi-mongodb'].db;
            var ObjectId = request.server.plugins['hapi-mongodb'].ObjectID;
            var data = request.payload.organisation;
            db.collection('organisations').findOne({_id: ObjectId(organisation_id)}, function(err, organisation){
              if (err) { return reply('Internal MongoDB error', err);}
              if (organisation === null) {
                return reply({organisationExist: false });
              }
              var admin = organisation.admin_ids.some(function (admin) {
                return admin.equals(result.user_id.toString());
              });
              if (!admin){
                return reply({writePermission: false});
              }
              db.collection('organisations').update(
                {_id: ObjectId(organisation_id)},
                {$set : {
                  name:        data.name,
                  description: data.description,
                  location:    data.location,
                  private:     data.private
                }
                },{},
                function(err, writeResult){
                  if (err) {
                    return reply ("Internal MongoDB error", err);
                  }
                  return reply(writeResult);
                }
              );
            });
          });
        },
        validate: {
          payload: {
            organisation: {
              name: Joi.string().min(3).max(1000).required(),
              description: Joi.string().max(1000).required(),
              location: Joi.string().max(20).required(),
              private: Joi.boolean().required()
            }
          }
        }
      }
    }
  ]);
  next();
};

exports.register.attributes = {
  name: 'organisations-route',
  version: '0.0.1'
};
