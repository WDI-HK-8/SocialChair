$(document).ready(function(){
  var authenticationData;
  var usersData;
  var myEventData;

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

  LoadData.prototype.loadEventsData = function() {
    $.ajax({
      method:   'GET',
      async:    false,
      url:      '/events',
      success:  function(response) {
        myEventData = response;
        console.log(myEventData);
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

  PrintData.prototype.uncomingEvents = function() {

  };

  PrintData.prototype.potentialEvents = function() {

  };



  var initialLoad = new LoadData();
  initialLoad.loadAuthenticationData();
  initialLoad.loadUsersData();
  initialLoad.loadEventsData();
  console.log(authenticationData);
  console.log(usersData);

  var initialPrint = new PrintData();
  initialPrint.shortProfile();

  $("#slowShowButton").click(function() {
    $("#slowShowList" ).slideToggle('slow');
  });

  $('#slowShowList').submit(function(e) {
    e.preventDefault();
    var key    = $('#accessKeyInput').val();
    var option = $('#accessKeyOptions').val();
    if (option === 'Organisation') {
      window.location.href = '/organisation/' + key;
    }else if (option === 'Event') {
      window.location.href = '/event/' + key;
    }
  });

});
