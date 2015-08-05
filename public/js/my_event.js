$(document).ready(function(){
  var authenticationData;
  var usersData;
  var myEventData;
  var organisationsData;
  var upcomingEventsHTML = '<div class="row header blue"><div class="cell">Event</div><div class="cell fixWidth">Date</div><div class="cell fixWidth">Time</div><div class="cell fixWidth">Organisation</div></div>';
  var potentialEventsHTML = '<div class="row header blue"><div class="cell">Event</div><div class="cell fixWidth">Date</div><div class="cell fixWidth">Time</div><div class="cell fixWidth">Organisation</div><div class="cell fixWidth">Join</div></div>';

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

  LoadData.prototype.loadOrganisationsData = function() {
    $.ajax({
      method:   'GET',
      async:    false,
      url:      '/organisations',
      success:  function(response) {
        organisationsData = response;
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

  PrintData.prototype.eventsTable = function() {
    var potentialEventsData = [];
    var upcomingEventsData = [];
    myEventData.forEach(function(eventData){
      if (eventData.going_ids.indexOf(authenticationData.user_id) === -1) {
        potentialEventsData.push(eventData);
      }else {
        upcomingEventsData.push(eventData);
      }
    });
    potentialEventsData.forEach(function(eventData){
      var organisationName = organisationsData.filter(function(e){
            return (e._id === eventData.organisation_id) ? true:false;
          })[0].name;
      potentialEventsHTML += "<div class='row'>";
      potentialEventsHTML += "  <div class='cell'>";
      potentialEventsHTML +=     "<a href=" + "'/event/" + eventData._id + "'>" + eventData.name + "</a>";
      potentialEventsHTML += "  </div>";
      potentialEventsHTML += "  <div class='cell'>";
      potentialEventsHTML +=     eventData.start.split(" ")[0];
      potentialEventsHTML += "  </div>";
      potentialEventsHTML += "  <div class='cell'>";
      potentialEventsHTML +=     eventData.start.split(" ")[1];
      potentialEventsHTML += "  </div>";
      potentialEventsHTML += "  <div class='cell'>";
      potentialEventsHTML +=     "<a href=" + "'/organisation/" + eventData.organisation_id + "'>" + organisationName + "</a>";
      potentialEventsHTML += "  </div>";
      potentialEventsHTML += "  <div class='cell'>";
      potentialEventsHTML += "    <button type='button' class='btn btn-info joinButton' data-id='" + eventData._id + "'>Join</button>";
      potentialEventsHTML += "  </div>";
      potentialEventsHTML += "</div>";
    });
    upcomingEventsData.forEach(function(eventData){
      var organisationName = organisationsData.filter(function(e){
            return (e._id === eventData.organisation_id) ? true:false;
          })[0].name;
      upcomingEventsHTML += "<div class='row'>";
      upcomingEventsHTML += "  <div class='cell'>";
      upcomingEventsHTML +=     "<a href=" + "'/event/" + eventData._id + "'>" + eventData.name + "</a>";
      upcomingEventsHTML += "  </div>";
      upcomingEventsHTML += "  <div class='cell'>";
      upcomingEventsHTML +=     eventData.start.split(" ")[0];
      upcomingEventsHTML += "  </div>";
      upcomingEventsHTML += "  <div class='cell'>";
      upcomingEventsHTML +=     eventData.start.split(" ")[1];
      upcomingEventsHTML += "  </div>";
      upcomingEventsHTML += "  <div class='cell'>";
      upcomingEventsHTML +=     "<a href=" + "'/organisation/" + eventData.organisation_id + "'>" + organisationName + "</a>";
      upcomingEventsHTML += "  </div>";
      upcomingEventsHTML += "</div>";
    });
    $('#upcomingEventsTable').html(upcomingEventsHTML);
    $('#potentialEventsTable').html(potentialEventsHTML);
  };

  var Post = function() {
  };

  Post.prototype.joinEvent = function(id) {
    $.ajax({
      context: this,
      method:   'POST',
      url:      '/events/' + id + '/join',
      success:  function(reply){
        console.log(reply);
        window.location.reload();
      },
    });
  };





  var initialLoad = new LoadData();
  initialLoad.loadAuthenticationData();
  initialLoad.loadUsersData();
  initialLoad.loadEventsData();
  initialLoad.loadOrganisationsData();
  console.log(authenticationData);
  console.log(usersData);

  var initialPrint = new PrintData();
  initialPrint.shortProfile();
  initialPrint.eventsTable();

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

  var post = new Post();

  $('.joinButton').click(function(){
    post.joinEvent($(this).data("id"));
  });
});
