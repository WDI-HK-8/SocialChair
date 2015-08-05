var Auth = require('./auth');


exports.register = function(server, options, next) {

  server.route([
    {
      method: 'POST',
      path: '/events/{id}/join',
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
              return reply({eventExist: false });
            }
            var going = eventData.going_ids.some(function (going) {
              return going.equals(result.user_id.toString());
            });
            if (eventData.owner_id.equals(result.user_id)){
              return reply({owner: true}); //Owner cannot quit an event, see /chown
            }
            if (going){
              db.collection('events').update(
                {_id: ObjectId(event_id)},
                {$pull: {
                  admin_ids:  result.user_id,
                  going_ids:  result.user_id
                  }
                },
                function(err, writeResult){
                  if (err) {
                    return reply ("Internal MongoDB error", err);
                  }
                  return reply(writeResult);
                }
              );
            }else{
              db.collection('events').update(
                {_id: ObjectId(event_id)},
                {$push: {
                  going_ids: result.user_id
                  }
                },
                function(err, writeResult){
                  if (err) {
                    return reply ("Internal MongoDB error", err);
                  }
                  return reply(writeResult);
                }
              );
            }
          });
        });
      }
    },
    {
      method: 'POST',
      path: '/events/{id}/admin',
      handler: function(request, reply){
        Auth.authenticated(request, function(result){
          if (!result.authenticated) {
            return reply(result);
          }
          var db = request.server.plugins['hapi-mongodb'].db;
          var event_id = encodeURIComponent(request.params.id);
          var ObjectId = request.server.plugins['hapi-mongodb'].ObjectID;
          var memberID = ObjectId(request.payload.eventData.memberID);
          if (memberID.equals(result.user_id)) {
            return reply({suicide: true}); //Owner cannot remove himself from admin group
          }
          db.collection('events').findOne({_id: ObjectId(event_id)}, function(err, eventData){
            if (err) { return reply('Internal MongoDB error', err);}
            if (eventData === null) {
              return reply({eventExist: false });
            }
            if (!eventData.owner_id.equals(result.user_id)){
              return reply({owner: false}); //Check if this user is an owner
            }
            var going = eventData.going_ids.some(function (going) {
              return going.equals(memberID.toString());
            });
            if (!going){
              return reply({going: false}); //Check if the given userID is already going
            }
            var admin = eventData.admin_ids.some(function (admin) {
              return admin.equals(memberID.toString()); //Check if the given userID is an admin
            });
            if (admin){
              db.collection('events').update(
                {_id: ObjectId(event_id)},
                {$pull: {
                  admin_ids:  memberID
                  }
                },
                function(err, writeResult){
                  if (err) {
                    return reply ("Internal MongoDB error", err);
                  }
                  return reply(writeResult);
                }
              );
            }else{
              db.collection('events').update(
                {_id: ObjectId(event_id)},
                {$push: {
                  admin_ids: memberID
                  }
                },
                function(err, writeResult){
                  if (err) {
                    return reply ("Internal MongoDB error", err);
                  }
                  return reply(writeResult);
                }
              );
            }
          });
        });
      }
    },
    {
      method: 'POST',
      path: '/events/{id}/chown',
      handler: function(request, reply){
        Auth.authenticated(request, function(result){
          if (!result.authenticated) {
            return reply(result);
          }
          var db = request.server.plugins['hapi-mongodb'].db;
          var event_id = encodeURIComponent(request.params.id);
          var ObjectId = request.server.plugins['hapi-mongodb'].ObjectID;
          var adminID = ObjectId(request.payload.eventData.adminID);
          if (adminID.equals(result.user_id)) {
            return reply({suicide: true}); //Owner cannot transfer ownership to himself
          }
          db.collection('events').findOne({_id: ObjectId(event_id)}, function(err, eventData){
            if (err) { return reply('Internal MongoDB error', err);}
            if (eventData === null) {
              return reply({organisationExist: false });
            }
            if (!eventData.owner_id.equals(result.user_id)){
              return reply({owner: false}); //Check if this user is an owner
            }
            var admin = eventData.admin_ids.some(function (admin) {
              return admin.equals(adminID.toString()); //Check if the given userID is an admin
            });
            if (admin){
              db.collection('events').update(
                {_id: ObjectId(event_id)},
                {$set : {
                  owner_id:   adminID,
                  }
                },
                function(err, writeResult){
                  if (err) {
                    return reply ("Internal MongoDB error", err);
                  }
                  return reply(writeResult);
                }
              );
            }else{
              return reply({admin: false});
            }
          });
        });
      }
    },
    {
      method: 'POST',
      path: '/events/{id}/like',
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
              return reply({eventExist: false });
            }
            var liked = eventData.like_ids.some(function (liked) {
              return liked.equals(result.user_id.toString());
            });
            if (liked){
              db.collection('events').update(
                {_id: ObjectId(event_id)},
                {$pull: {
                  like_ids:  result.user_id,
                  }
                },
                function(err, writeResult){
                  if (err) {
                    return reply ("Internal MongoDB error", err);
                  }
                  return reply(writeResult);
                }
              );
            }else{
              db.collection('events').update(
                {_id: ObjectId(event_id)},
                {$push: {
                  like_ids: result.user_id
                  }
                },
                function(err, writeResult){
                  if (err) {
                    return reply ("Internal MongoDB error", err);
                  }
                  return reply(writeResult);
                }
              );
            }
          });
        });
      }
    }
  ]);
  next(); //important
};

//Defining the description of the plugin
exports.register.attributes = {
  name: 'event-memberships-routes',
  version: '0.0.1'
};
