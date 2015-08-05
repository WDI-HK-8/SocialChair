var Auth = require('./auth');
var Joi = require('joi');

exports.register = function(server, options, next) {
  server.route([
    {
      method: 'POST',
      path: '/events',
      config: {
        handler: function(request, reply) {
          Auth.authenticated(request, function(result){
            if (!result.authenticated) {
              return reply(result);
            }
            var db = request.server.plugins['hapi-mongodb'].db;
            var eventData = request.payload.eventData;
            var ObjectId = request.server.plugins['hapi-mongodb'].ObjectID;
            eventData.organisation_id = ObjectId(eventData.organisation_id);
            db.collection('organisations').findOne({_id: eventData.organisation_id}, function(err, organisation){
              if (organisation === null) {
                return reply({organisationExist: false});
              }
              var member = organisation.member_ids.some(function (member) {
                  return member.equals(result.user_id.toString());
              });
              if (!member) {
                return reply({writePermission: false});
              }
              eventData.owner_id      =   result.user_id;
              eventData.admin_ids     =   [result.user_id];
              eventData.time_created  =   new Date();
              eventData.open          =   true;
              eventData.going_ids     =   [result.user_id];
              eventData.like_ids      =   [];
              db.collection('events').insert(eventData, function(err, writeResult){
                if (err) {
                  return reply ("Internal MongoDB error", err);
                }
                return reply({'event_id': eventData._id});
              });
            });
          });
        },
        validate: {
          payload: {
            eventData: {
              organisation_id:  Joi.string().required(),                    //NEED TO IMPROVE
              name:             Joi.string().min(3).max(50).required(),
              location:         Joi.string().max(200).required(),
              start:            Joi.string().max(20).required(),            //NEED TO IMPROVE
              end:              Joi.string().max(20).required(),             //NEED TO IMPROVE
              description:      Joi.string().max(2000).required()
            }
          }
        }
      }
    },
    {
      method: 'PUT', //By id
      path: '/events/{id}',
      config: {
        handler: function(request, reply) {
          Auth.authenticated(request, function(result) {
            if (!result.authenticated) {
              return reply(result);
            }
            var  event_id = encodeURIComponent(request.params.id);
            var db = request.server.plugins['hapi-mongodb'].db;
            var ObjectId = request.server.plugins['hapi-mongodb'].ObjectID;
            var eventData = request.payload.eventData;
            db.collection('events').findOne({_id: ObjectId(event_id)}, function(err, Event){
              if (err) { return reply('Internal MongoDB error', err);}
              if (Event === null) {
                return reply({eventExist: false });
              }
              var admin = Event.admin_ids.some(function (admin) {
                  return admin.equals(result.user_id.toString());
              });
              if (!admin){
                return reply({writePermission: false});
              }
              db.collection('events').update(
                {_id: ObjectId(event_id)},
                {$set : {
                  name:        eventData.name,
                  description: eventData.description,
                  location:    eventData.location,
                  date:        eventData.date,
                  time:        eventData.time,
                  open:        eventData.open
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
            eventData: {
              name:         Joi.string().min(3).max(1000).required(),
              description:  Joi.string().max(1000).required(),
              location:     Joi.string().max(20).required(),
              date:         Joi.string().max(20).required(),  //Need fix
              time:         Joi.string().max(20).required(),
              open:         Joi.boolean().required()
            }
          }
        }
      }
    },
    {
      method: 'GET', //all events under users organisation
      path: '/events',
      handler: function(request, reply){
        Auth.authenticated(request, function(result) {
          if (!result.authenticated) {
            return reply(result);
          }
          var ObjectId = request.server.plugins['hapi-mongodb'].ObjectID;
          var db = request.server.plugins['hapi-mongodb'].db;
          db.collection('organisations').distinct("_id", {member_ids:result.user_id}, function(err, organisationsArray){
            if (err) { return reply('Internal MongoDB error', err);}
            db.collection('events').find({organisation_id: {$in: organisationsArray}}).toArray(function(err, eventData){
              if (err) { return reply('Internal MongoDB error', err);}
              return reply(eventData);
            });
          });
        });
      }
    },
    {
      method: 'GET', //By id
      path: '/events/{id}',
      handler: function(request, reply){
        Auth.authenticated(request, function(result) {
          if (!result.authenticated) {
            return reply(result);
          }
          var event_id = encodeURIComponent(request.params.id);
          var db = request.server.plugins['hapi-mongodb'].db;
          var ObjectId = request.server.plugins['hapi-mongodb'].ObjectID;
          db.collection('events').findOne({"_id": ObjectId(event_id)}, function(err, eventData){
          if (err) { return reply('Internal MongoDB error', err);}
          return reply(eventData);
        });
        });
      }
    },
    {
      method: 'DELETE',
      path: '/events/{id}',
      handler: function(request, reply){
        Auth.authenticated(request, function(result){
          if (!result.authenticated) {
            return reply(result);
          }
          var db = request.server.plugins['hapi-mongodb'].db;
          var event_id = encodeURIComponent(request.params.id);
          var ObjectId = request.server.plugins['hapi-mongodb'].ObjectID;
          db.collection('events').findOne({_id: ObjectId(event_id)}, function(err, eventData){
            if (err) { return reply('Internal MongoDB error', err);}
            if (eventData === null) {
              return reply({organisationExist: false });
            }
            if (!eventData.owner_id.equals(result.user_id)){
              return reply({owner: false}); //Check if this user is an owner
            }
            db.collection('events').remove(
              {_id: ObjectId(event_id)},
              function(err, writeResult){
                if (err) {
                  return reply ("Internal MongoDB error", err);
                }
                return reply(writeResult);
              }
            );
          });
        });
      }
    }
  ]);
  next();
};

exports.register.attributes = {
  name: 'events-route',
  version: '0.0.1'
};
