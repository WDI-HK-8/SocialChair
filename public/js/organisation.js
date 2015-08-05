$(document).ready(function(){
  var authenticationData;
  var usersData;
  var organisationID = window.location.href.split('/')[4];
  var organisationData;
  var eventsData;
  var organisationEvents = [];
  var organisationEventsHTML = '<div class="row header blue"><div class="cell">Name</div><div class="cell fixWidth">Owner</div><div class="cell fixWidth">Going</div><div class="cell fixWidth">Likes</div><div class="cell fixWidth">Join</div></div>';
  var organisationMembersMinHTML = '<div class="row header blue"><div class="cell">Name</div><div class="cell fixWidth">Permission</div></div>';
  var organisationMembersMaxHTML = '<div class="row header blue"><div class="cell">Name</div><div class="cell fixWidth">Permission</div><div class="cell fixWidth">Make admin</div><div class="cell fixWidth">Ownership</div></div>';


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

  LoadData.prototype.loadOrganisationData = function() {
    $.ajax({
      method:   'GET',
      async:    false,
      url:      '/organisations/' + organisationID,
      success:  function(response) {
        organisationData = response;
      },
    });
  };

  LoadData.prototype.loadEventsData = function() {
    $.ajax({
      method:   'GET',
      async:    false,
      url:      '/events',
      success:  function(response) {
        eventsData = response;
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

  PrintData.prototype.organisationEvent = function() {
    eventsData.forEach(function(eventData) {
      if (eventData.organisation_id === organisationID) {
        organisationEvents.push(eventData);
      }
    });
    organisationEvents.forEach(function(eventData) {
      var owner = usersData.filter(function(e){
        return (e._id === eventData.owner_id) ? true:false;
      })[0].screen_name;
      var joinHTML = (eventData.going_ids.indexOf(authenticationData.user_id) === -1) ? "<button type='button' class='btn btn-info joinEventButton' data-id='" + eventData._id + "'>Join</button>":"Joined" ;
      organisationEventsHTML += "<div class='row'>";
      organisationEventsHTML += "  <div class='cell'>";
      organisationEventsHTML +=     "<a href=" + "'/event/" + eventData._id + "'>" + eventData.name + "</a>";
      organisationEventsHTML += "  </div>";
      organisationEventsHTML += "  <div class='cell'>";
      organisationEventsHTML += "    <a href=" + "'/profile/" + eventData.owner_id + "'>" + owner + "</a>";
      organisationEventsHTML += "  </div>";
      organisationEventsHTML += "  <div class='cell'>";
      organisationEventsHTML +=     eventData.going_ids.length;
      organisationEventsHTML += "  </div>";
      organisationEventsHTML += "  <div class='cell'>";
      organisationEventsHTML +=     eventData.like_ids.length;
      organisationEventsHTML += "  </div>";
      organisationEventsHTML += "  <div class='cell'>";
      organisationEventsHTML +=     joinHTML;
      organisationEventsHTML += "  </div>";
      organisationEventsHTML += "</div>";
    });
    $('#organisationEventsTable').html(organisationEventsHTML);
  };

  PrintData.prototype.organisationInfo = function() {
    $('#organisationName').text(organisationData.name);
    $('#descriptionInfo').text(organisationData.description);
    $('#locationInfo').text(organisationData.location);
    $('#memberInfo').text(organisationData.member_ids.length);
    $('#idInfo').text(organisationData._id);
    $('#privateInfo').text((organisationData.private)? "private":"public");
  };

  PrintData.prototype.organisationMembers = function() {
    organisationData.member_ids.forEach(function(member){
      var permission;
      var makeAdminHTML;
      var chownHTML;
      if (organisationData.owner_id === member) {
        permission = 'Owner';
        makeAdminHTML = '--';
        chownHTML = '--';
      }else if (organisationData.admin_ids.indexOf(member) === -1) {
        permission = 'Member';
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
      organisationMembersMaxHTML += "<div class='row'>";
      organisationMembersMaxHTML += "  <div class='cell'>";
      organisationMembersMaxHTML +=     "<a href=" + "'/profile/" + member + "'>" + name + "</a>";
      organisationMembersMaxHTML += "  </div>";
      organisationMembersMaxHTML += "  <div class='cell'>";
      organisationMembersMaxHTML +=     permission;
      organisationMembersMaxHTML += "  </div>";
      organisationMembersMaxHTML += "  <div class='cell'>";
      organisationMembersMaxHTML +=     makeAdminHTML;
      organisationMembersMaxHTML += "  </div>";
      organisationMembersMaxHTML += "  <div class='cell'>";
      organisationMembersMaxHTML +=     chownHTML;
      organisationMembersMaxHTML += "  </div>";
      organisationMembersMaxHTML += "</div>";

      organisationMembersMinHTML += "<div class='row'>";
      organisationMembersMinHTML += "  <div class='cell'>";
      organisationMembersMinHTML +=     "<a href=" + "'/profile/" + member + "'>" + name + "</a>";
      organisationMembersMinHTML += "  </div>";
      organisationMembersMinHTML += "  <div class='cell'>";
      organisationMembersMinHTML +=     permission;
      organisationMembersMinHTML += "  </div>";
      organisationMembersMinHTML += "</div>";
    });
    return (organisationData.owner_id === authenticationData.user_id) ?  $('#organisationMembersTable').html(organisationMembersMaxHTML) : $('#organisationMembersTable').html(organisationMembersMinHTML);

  };

  PrintData.prototype.sectionsAndButtons = function() {
    if (authenticationData.user_id === organisationData.owner_id) {
      $('#organisationEvents').show();
      $('#editOrganisationButton').show();
    }else if (organisationData.admin_ids.indexOf(authenticationData.user_id) !== -1) {
      $('#organisationEvents').show();
      $('#editOrganisationButton').show();
      $('#quitOrganisationButton').show();
    }else if (organisationData.member_ids.indexOf(authenticationData.user_id) !== -1) {
      $('#organisationEvents').show();
      $('#quitOrganisationButton').show();
    }else {
      $('#joinOrganisationButton').show();
    }
  };

  var Post = function() {
  };

  Post.prototype.createEvent = function(payload) {
    var successCallBack = function(reply){
      console.log(reply);
      $('#eventID').text(reply.event_id);
      $('#createSuccess').show();
      $('#createForm').hide();
      $('#modalCloseButton').hide();
      $('#modalSubmitButton').hide();
      $('#modalDoneButton').show();
    };

    var errorCallBack = function(error){
      $('.alert').hide();
      var x = error.responseJSON.validation.keys[0];
      switch (x) {
        case 'eventData.name':
          return $('#alertEventName').show();
        case 'eventData.description':
          return $('#alertEventDescription').show();
        case 'eventData.location':
          return $('#alertEventLocation').show();
        case 'eventData.start':
          return $('#alertEventStart').show();
        case 'eventData.end':
          return $('#alertEventEnd').show();
      }
    };
    $.ajax({
      context: this,
      method:   'POST',
      data:     payload,
      dataType: 'JSON',
      url:      '/events',
      success:  successCallBack,
      error:    errorCallBack
    });
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

  Post.prototype.joinOrganisation = function(id) {
    $.ajax({
      context: this,
      method:   'POST',
      url:      '/organisations/' + id + '/join',
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
      url:      '/organisations/' + id + '/admin',
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
      url:      '/organisations/' + id + '/chown',
      success:  function(reply){
        console.log(reply);
        window.location.reload();
      },
    });
  };














  var initialLoad = new LoadData();
  initialLoad.loadAuthenticationData();
  initialLoad.loadUsersData();
  initialLoad.loadOrganisationData();
  initialLoad.loadEventsData();
  console.log(authenticationData);
  console.log(usersData);
  console.log(organisationData);
  console.log(eventsData);

  var initialPrint = new PrintData();
  initialPrint.shortProfile();
  initialPrint.organisationEvent();
  initialPrint.organisationInfo();
  initialPrint.organisationMembers();
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

  $('.default_datetimepicker').datetimepicker({
  	formatTime:'H:i',
  	formatDate:'d.m.Y',
  	//defaultDate:'8.12.1986', // it's my birthday
  	defaultDate:'+03.01.1970', // it's my birthday
  	defaultTime:'10:00',
  	timepickerScrollbar:false
  });

  var post = new Post();

  $('#modalDoneButton').click(function(){
    window.location.reload();
  });

  $('#modalSubmitButton').click(function() {
    $('.alert').hide();
    post.createEvent({
      eventData: {
        organisation_id:   organisationID,
        name:              $('#eventNameInput').val(),
        description:       $('#eventDescriptionInput').val(),
        location:          $('#eventLocationInput').val(),
        start:             $('#eventStartInput').val(),
        end:               $('#eventEndInput').val(),
      }
    });
  });

  $('.joinEventButton').click(function(){
    post.joinEvent($(this).data("id"));
  });

  $('#joinOrganisationButton').click(function(){
    post.joinOrganisation(organisationID);
  });

  $('#quitOrganisationButton').click(function(){
    post.joinOrganisation(organisationID);
  });

  $('.makeAdminButton').click(function(){
    post.makeAdmin(organisationID, {
      organisation: {
        memberID: $(this).data("id")
      }
    });
  });

  $('.chownButton').click(function(){
    post.chown(organisationID, {
      organisation: {
        adminID: $(this).data("id")
      }
    });
  });

});
