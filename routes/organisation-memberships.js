var Auth = require('./auth');


exports.register = function(server, options, next) {

  server.route([
    {
      method: 'POST',
      path: '/organisations/{id}/join',
      handler: function(request, reply){
        Auth.authenticated(request, function(result){
          if (!result.authenticated) {
            return reply(result);
          }
          var db = request.server.plugins['hapi-mongodb'].db;
          var organisation_id = encodeURIComponent(request.params.id);
          var ObjectId = request.server.plugins['hapi-mongodb'].ObjectID;
          db.collection('organisations').findOne({_id: ObjectId(organisation_id)}, function(err, organisation){
            if (err) { return reply('Internal MongoDB error', err);}
            if (organisation === null) {
              return reply({organisationExist: false });
            }
            var member = organisation.member_ids.some(function (member) {
              return member.equals(result.user_id.toString());
            });
            if (organisation.owner_id.equals(result.user_id)){
              return reply({owner: true}); //Owner cannot quit an organisation, see chown
            }
            if (member){
              db.collection('organisations').update(
                {_id: ObjectId(organisation_id)},
                {$pull: {
                  admin_ids:  result.user_id,
                  member_ids: result.user_id
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
              db.collection('organisations').update(
                {_id: ObjectId(organisation_id)},
                {$push: {
                  member_ids: result.user_id
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
      path: '/organisations/{id}/admin',
      handler: function(request, reply){
        Auth.authenticated(request, function(result){
          if (!result.authenticated) {
            return reply(result);
          }
          var db = request.server.plugins['hapi-mongodb'].db;
          var organisation_id = encodeURIComponent(request.params.id);
          var ObjectId = request.server.plugins['hapi-mongodb'].ObjectID;
          var memberID = ObjectId(request.payload.organisation.memberID);
          if (memberID.equals(result.user_id)) {
            return reply({suicide: true}); //Owner cannot remove himself from admin group
          }
          db.collection('organisations').findOne({_id: ObjectId(organisation_id)}, function(err, organisation){
            if (err) { return reply('Internal MongoDB error', err);}
            if (organisation === null) {
              return reply({organisationExist: false });
            }
            if (!organisation.owner_id.equals(result.user_id)){
              return reply({owner: false}); //Check if this user is an owner
            }
            var member = organisation.member_ids.some(function (member) {
              return member.equals(memberID.toString());
            });
            if (!member){
              return reply({member: false}); //Check if the given userID is a member
            }
            var admin = organisation.admin_ids.some(function (admin) {
              return admin.equals(memberID.toString()); //Check if the given userID is an admin
            });
            if (admin){
              db.collection('organisations').update(
                {_id: ObjectId(organisation_id)},
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
              db.collection('organisations').update(
                {_id: ObjectId(organisation_id)},
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
      path: '/organisations/{id}/chown',
      handler: function(request, reply){
        Auth.authenticated(request, function(result){
          if (!result.authenticated) {
            return reply(result);
          }
          var db = request.server.plugins['hapi-mongodb'].db;
          var organisation_id = encodeURIComponent(request.params.id);
          var ObjectId = request.server.plugins['hapi-mongodb'].ObjectID;
          var adminID = ObjectId(request.payload.organisation.adminID);
          if (adminID.equals(result.user_id)) {
            return reply({suicide: true}); //Owner cannot transfer ownership to himself
          }
          db.collection('organisations').findOne({_id: ObjectId(organisation_id)}, function(err, organisation){
            if (err) { return reply('Internal MongoDB error', err);}
            if (organisation === null) {
              return reply({organisationExist: false });
            }
            if (!organisation.owner_id.equals(result.user_id)){
              return reply({owner: false}); //Check if this user is an owner
            }
            var admin = organisation.admin_ids.some(function (admin) {
              return admin.equals(adminID.toString()); //Check if the given userID is an admin
            });
            if (admin){
              db.collection('organisations').update(
                {_id: ObjectId(organisation_id)},
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
    }
  ]);
  next(); //important
};

//Defining the description of the plugin
exports.register.attributes = {
  name: 'organisation-memberships-routes',
  version: '0.0.1'
};
