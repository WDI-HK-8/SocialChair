$(document).ready(function(){
  var authenticationData;
  var usersData;
  var eventID = window.location.href.split('/')[4];
  var eventData;
  var organisationData;
  var eventGoingMinHTML = '<div class="row header blue"><div class="cell">Name</div><div class="cell fixWidth">Permission</div></div>';
  var eventGoingMaxHTML = '<div class="row header blue"><div class="cell">Name</div><div class="cell fixWidth">Permission</div><div class="cell fixWidth">Make admin</div><div class="cell fixWidth">Ownership</div></div>';

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

  LoadData.prototype.loadEventData = function() {
    $.ajax({
      method:   'GET',
      async:    false,
      url:      '/events/' + eventID,
      success:  function(response) {
        eventData = response;
      },
    });
  };

  LoadData.prototype.loadOrganisationData = function() {
    $.ajax({
      method:   'GET',
      async:    false,
      url:      '/organisations/' + eventData.organisation_id,
      success:  function(response) {
        organisationData = response;
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

  PrintData.prototype.eventInfo = function() {
    var organisationName = usersData.filter(function(e){
      return (e._id === authenticationData.user_id) ? true:false;
    })[0].screen_name;
    $('#eventName').text(eventData.name);
    $('#descriptionInfo').text(eventData.description);
    $('#startTimeInfo').text(eventData.start);
    $('#endTimeInfo').text(eventData.end);
    $('#locationInfo').text(eventData.location);
    $('#organisationNameInfo').html("<a href=" + "'/organisation/" + eventData.organisation_id + "'>" + organisationData.name + "</a>");
    $('#likesInfo').text(eventData.like_ids.length);
    $('#idInfo').text(eventData._id);
  };

  PrintData.prototype.eventGoing = function() {
    eventData.going_ids.forEach(function(member){
      var permission;
      var makeAdminHTML;
      var chownHTML;
      if (eventData.owner_id === member) {
        permission = 'Owner';
        makeAdminHTML = '--';
        chownHTML = '--';
      }else if (eventData.admin_ids.indexOf(member) === -1) {
        permission = '--';
        makeAdminHTML = "<button type='button' class='btn btn-info makeAdminButton' data-id='" + member + "'>Make Admin</button>";
        chownHTML = '--';
      }else {
        permission = 'Admin';
        makeAdminHTML = "<button type='button' class='btn btn-info makeAdminButton' data-id='" + member + "'>Dismiss Admin</button>";
        chownHTML = "<button type='button' class='btn btn-info chownButton' data-id='" + member + "'>Transfer ownership</button>";
      }
      var name = usersData.filter(function(e){
        return (e._id === member) ? true:false;
      })[0].screen_name;
      eventGoingMaxHTML += "<div class='row'>";
      eventGoingMaxHTML += "  <div class='cell'>";
      eventGoingMaxHTML +=     "<a href=" + "'/profile/" + member + "'>" + name + "</a>";
      eventGoingMaxHTML += "  </div>";
      eventGoingMaxHTML += "  <div class='cell'>";
      eventGoingMaxHTML +=     permission;
      eventGoingMaxHTML += "  </div>";
      eventGoingMaxHTML += "  <div class='cell'>";
      eventGoingMaxHTML +=     makeAdminHTML;
      eventGoingMaxHTML += "  </div>";
      eventGoingMaxHTML += "  <div class='cell'>";
      eventGoingMaxHTML +=     chownHTML;
      eventGoingMaxHTML += "  </div>";
      eventGoingMaxHTML += "</div>";

      eventGoingMinHTML += "<div class='row'>";
      eventGoingMinHTML += "  <div class='cell'>";
      eventGoingMinHTML +=     "<a href=" + "'/profile/" + member + "'>" + name + "</a>";
      eventGoingMinHTML += "  </div>";
      eventGoingMinHTML += "  <div class='cell'>";
      eventGoingMinHTML +=     permission;
      eventGoingMinHTML += "  </div>";
      eventGoingMinHTML += "</div>";
    });
    return (eventData.owner_id === authenticationData.user_id) ?  $('#eventGoingTable').html(eventGoingMaxHTML) : $('#eventGoingTable').html(eventGoingMinHTML);
  };

  PrintData.prototype.sectionsAndButtons = function() {
    if (eventData.like_ids.indexOf(authenticationData.user_id) !== -1) {
      $('#unlikeEventButton').show();
    }else {
      $('#likeEventButton').show();
    }
    if (authenticationData.user_id === eventData.owner_id) {
      $('#editEventButton').show();
      $('#deleteEventButton').show();
    }else if (eventData.admin_ids.indexOf(authenticationData.user_id) !== -1) {
      $('#editEventButton').show();
      $('#withdrawEventButton').show();
    }else if (eventData.going_ids.indexOf(authenticationData.user_id) !== -1) {
      $('#withdrawEventButton').show();
    }else {
      $('#joinEventButton').show();
    }
  };

  var Post = function() {
  };

  Post.prototype.joinEvent = function() {
    $.ajax({
      context: this,
      method:   'POST',
      url:      '/events/' + eventID + '/join',
      success:  function(reply){
        console.log(reply);
        window.location.reload();
      },
    });
  };

  Post.prototype.likeEvent = function() {
    $.ajax({
      context: this,
      method:   'POST',
      url:      '/events/' + eventID + '/like',
      success:  function(reply){
        console.log(reply);
        window.location.reload();
      },
    });
  };

  Post.prototype.makeAdmin = function(id, payload) {
    $.ajax({
      context:  this,
      method:   'POST',
      data:     payload,
      url:      '/events/' + id + '/admin',
      success:  function(reply){
        console.log(reply);
        window.location.reload();
      },
    });
  };

  Post.prototype.chown = function(id, payload) {
    $.ajax({
      context:  this,
      method:   'POST',
      data:     payload,
      url:      '/events/' + id + '/chown',
      success:  function(reply){
        console.log(reply);
        window.location.reload();
      },
    });
  };


  var initialLoad = new LoadData();
  initialLoad.loadAuthenticationData();
  initialLoad.loadUsersData();
  initialLoad.loadEventData();
  initialLoad.loadOrganisationData();


  var initialPrint = new PrintData();
  initialPrint.shortProfile();
  initialPrint.eventInfo();
  initialPrint.eventGoing();
  initialPrint.sectionsAndButtons();

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

  $('#joinEventButton').click(function(){
    post.joinEvent();
  });

  $('#withdrawEventButton').click(function(){
    post.joinEvent();
  });

  $('#likeEventButton').click(function(){
    post.likeEvent();
  });

  $('#unlikeEventButton').click(function(){
    post.likeEvent();
  });

  $('.makeAdminButton').click(function(){
    post.makeAdmin(eventID, {
      eventData: {
        memberID: $(this).data("id")
      }
    });
  });

  $('.chownButton').click(function(){
    post.chown(eventID, {
      eventData: {
        adminID: $(this).data("id")
      }
    });
  });

});
