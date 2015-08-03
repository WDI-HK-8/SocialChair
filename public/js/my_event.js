$(document).ready(function(){
  var authenticationData;
  var usersData;

  var Signout = function() {
  };

  Signout.prototype.signoutDelete = function() {
    var successCallBack = function(reply) {
      window.location.reload();
    };
    $.ajax({
      method:   'DELETE',
      url:      '/sessions',
      success:  successCallBack
    });
  };

  $('#signoutButton').click(function(e){
    e.preventDefault();
    var signout = new Signout();
    signout.signoutDelete();
  });

  var LoadData = function() {
  };

  LoadData.prototype.loadAuthenticationData = function() {
    $.ajax({
      method:   'GET',
      async:    false,
      url:      '/authenticated',
      success:  function(response) {
        authenticationData = response;
      },
    });
  };

  LoadData.prototype.loadUsersData = function() {
    $.ajax({
      method:   'GET',
      async:    false,
      url:      '/users',
      success:  function(response) {
        usersData = response;
      },
    });
  };

  var PrintData = function() {
  };

  PrintData.prototype.shortProfile = function() {
    $("#myProfile").attr("href", '/profile/' + authenticationData.user_id + '');
    var screenName = usersData.filter(function(e){
      return (e._id === authenticationData.user_id) ? true:false;
    })[0].screen_name;
    console.log(screenName);
    $('#screenName').text(screenName);
  };

  var initialLoad = new LoadData();
  initialLoad.loadAuthenticationData();
  initialLoad.loadUsersData();
  console.log(authenticationData);
  console.log(usersData);

  var initialPrint = new PrintData();
  initialPrint.shortProfile();

  $("#slowShowButton").click(function() {
    $("#slowShowList" ).slideToggle('slow');
  });

});
