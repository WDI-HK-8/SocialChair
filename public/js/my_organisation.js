$(document).ready(function(){
  var authenticationData;
  var usersData;
  var organisationsData;
  var yourOrganisationData = [];
  var publicOrganisationData = [];
  var yourOrganisationsHTML   = '<div class="row header blue"><div class="cell">Name</div><div class="cell fixWidth">Permission</div><div class="cell fixWidth">Member</div><div class="cell fixWidth">Status</div></div>';
  var publicOrganisationsHTML = '<div class="row header blue"><div class="cell">Name</div><div class="cell fixWidth">Owner</div><div class="cell fixWidth">Member</div><div class="cell fixWidth">Join</div></div>';

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

  PrintData.prototype.organisations = function() {
    organisationsData.forEach(function(organisation){
      if (organisation.member_ids.indexOf(authenticationData.user_id) === -1) {
        publicOrganisationData.push(organisation);
      }else {
        yourOrganisationData.push(organisation);
      }
    });
    console.log(yourOrganisationData);
    console.log(publicOrganisationData);
    yourOrganisationData.forEach(function(organisation){
      var permission;
      var status;
      if (organisation.owner_id === authenticationData.user_id) {
        permission = 'Owner';
      }else if (organisation.admin_ids.indexOf(authenticationData.user_id) === -1) {
        permission = 'Member';
      }else {
        permission = 'Admin';
      }
      if (organisation.private) {
        status = 'Private';
      }else {
        status = 'Public';
      }
      yourOrganisationsHTML += "<div class='row'>";
      yourOrganisationsHTML += "  <div class='cell'>";
      yourOrganisationsHTML +=     "<a href=" + "'/organisation/" + organisation._id + "'>" + organisation.name + "</a>";
      yourOrganisationsHTML += "  </div>";
      yourOrganisationsHTML += "  <div class='cell'>";
      yourOrganisationsHTML +=     permission;
      yourOrganisationsHTML += "  </div>";
      yourOrganisationsHTML += "  <div class='cell'>";
      yourOrganisationsHTML +=      organisation.member_ids.length;
      yourOrganisationsHTML += "  </div>";
      yourOrganisationsHTML += "  <div class='cell'>";
      yourOrganisationsHTML +=     status;
      yourOrganisationsHTML += "  </div>";
      yourOrganisationsHTML += "</div>";
      $('#yourOrganisationsTable').html(yourOrganisationsHTML);
    });
    publicOrganisationData.forEach(function(organisation){
      var owner = usersData.filter(function(e){
        return (e._id === organisation.owner_id) ? true:false;
      })[0].screen_name;
      publicOrganisationsHTML += "<div class='row'>";
      publicOrganisationsHTML += "  <div class='cell'>";
      publicOrganisationsHTML += "    <a href=" + "'/organisation/" + organisation._id + "'>" + organisation.name + "</a>";
      publicOrganisationsHTML += "  </div>";
      publicOrganisationsHTML += "  <div class='cell'>";
      publicOrganisationsHTML += "    <a href=" + "'/profile/" + organisation.owner_id + "'>" + owner + "</a>";
      publicOrganisationsHTML += "  </div>";
      publicOrganisationsHTML += "  <div class='cell'>";
      publicOrganisationsHTML +=      organisation.member_ids.length;
      publicOrganisationsHTML += "  </div>";
      publicOrganisationsHTML += "  <div class='cell'>";
      publicOrganisationsHTML += "    <button type='button' class='btn btn-info joinButton' data-id='" + organisation._id + "'>Join</button>";
      publicOrganisationsHTML += "  </div>";
      publicOrganisationsHTML += "</div>";
      $('#publicOrganisationsTable').html(publicOrganisationsHTML);
    });
  };


  var Post = function() {
  };

  Post.prototype.createOrganisation = function(payload) {
    var successCallBack = function(reply){
      $('#organisationID').text(reply.organisation_id);
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
        case 'organisation.name':
          return $('#alertOrganisationName').show();
        case 'organisation.location':
          return $('#alertOrganisationLocation').show();
        case 'organisation.description':
          return $('#alertOrganisationDescription').show();
      }
    };
    $.ajax({
      context: this,
      method:   'POST',
      data:     payload,
      dataType: 'JSON',
      url:      '/organisations',
      success:  successCallBack,
      error:    errorCallBack
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


















  var initialLoad = new LoadData();
  initialLoad.loadAuthenticationData();
  initialLoad.loadUsersData();
  initialLoad.loadOrganisationsData();
  console.log(authenticationData);
  console.log(usersData);
  console.log(organisationsData);

  var initialPrint = new PrintData();
  initialPrint.shortProfile();
  initialPrint.organisations();

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

  $('#modalDoneButton').click(function(){
    window.location.reload();
  });

  $('#modalSubmitButton').click(function() {
    $('.alert').hide();
    post.createOrganisation({
      organisation: {
        name:         $('#organisationNameInput').val(),
        description:  $('#organisationDescriptionInput').val(),
        location:     $('#organisationLocationInput').val(),
        private:      $('#privateCheckbox').is(':checked')
      }
    });
  });

  $('.joinButton').click(function(){
    post.joinOrganisation($(this).data("id"));
  });
});
