module.exports = {};

module.exports.authenticated = function(request, callback){
  var cookie = request.session.get('social_chair_session');
  if (!cookie) {
    return callback({authenticated: false});
  }
  var session_id = cookie.session_id;
  var db = request.server.plugins['hapi-mongodb'].db;
  db.collection("sessions").findOne({session_id: session_id}, function(err, session){
    if (!session) {
      return callback({ authenticated: false});
    }
    callback({ authenticated: true, user_id: session.user_id});
  });
};
