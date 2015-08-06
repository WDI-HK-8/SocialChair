$(document).ready(function(){
  var authenticationData;
  var usersData;
  var userID = window.location.href.split('/')[4];
  var userData;
  var organisationsData;
  var userOrganisationsData = [];
  var organisationsHTML = '<div class="row header blue"><div class="cell">Name</div><div class="cell fixWidth">Owner</div><div class="cell fixWidth">Members</div><div class="cell fixWidth">Join</div></div>';

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
        userData = usersData.filter(function(e){
              return (e._id === userID) ? true:false;})[0];
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


  var Post = function() {
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


  var PrintData = function() {
  };

  PrintData.prototype.shortProfile = function() {
    $("#myProfile").attr("href", '/profile/' + authenticationData.user_id + '');
    var screenName = usersData.filter(function(e){
      return (e._id === authenticationData.user_id) ? true:false;
    })[0].screen_name;
    $('#screenName').text(screenName);
    if (window.location.href.split('/')[4] === authenticationData.user_id) {
      $('#myProfile').addClass("active");
    }
  };

  PrintData.prototype.profileInfo = function() {
    $('#profileName').text(userData.screen_name);
    $('#screenNameInput').val(userData.screen_name);
    $('#firstNameInfo').text(userData.first_name);
    $('#firstNameInput').val(userData.first_name);
    $('#lastNameInfo').text(userData.last_name);
    $('#lastNameInput').val(userData.last_name);
    $('#emailInfo').text(userData.email);
    $('#emailInput').val(userData.email);
  };

  PrintData.prototype.organisationsData = function() {
    organisationsData.forEach(function(organisation){
      if (organisation.member_ids.indexOf(userID) !== -1) {
        userOrganisationsData.push(organisation);
      }
    });
    userOrganisationsData.forEach(function(organisation){
      var owner = usersData.filter(function(e){
        return (e._id === organisation.owner_id) ? true:false;
      })[0].screen_name;
      var joinHTML = (organisation.member_ids.indexOf(authenticationData.user_id) === -1) ? "<button type='button' class='btn btn-info joinOrganisationButton' data-id='" + organisation._id + "'>Join</button>":"Joined" ;
      organisationsHTML += "<div class='row'>";
      organisationsHTML += "  <div class='cell'>";
      organisationsHTML += "    <a href=" + "'/organisation/" + organisation._id + "'>" + organisation.name + "</a>";
      organisationsHTML += "  </div>";
      organisationsHTML += "  <div class='cell'>";
      organisationsHTML += "    <a href=" + "'/profile/" + organisation.owner_id + "'>" + owner + "</a>";
      organisationsHTML += "  </div>";
      organisationsHTML += "  <div class='cell'>";
      organisationsHTML +=      organisation.member_ids.length;
      organisationsHTML += "  </div>";
      organisationsHTML += "  <div class='cell'>";
      organisationsHTML +=      joinHTML;
      organisationsHTML += "  </div>";
      organisationsHTML += "</div>";
    });
    $('#organisationsTable').html(organisationsHTML);
  };

  PrintData.prototype.sectionsAndButtons = function() {
    if (authenticationData.user_id === userID) {
      $('#editProfileButton').show();
    }else {
      $('#organisationsInfo').show();
    }
  };

  var Put = function(){
  };

  Put.prototype.updateProfile = function(payload) {
    var successCallBack = function(reply){
      console.log(reply);
      $('#updateSuccess').show();
      $('#createForm').hide();
      $('.modalCloseButton').hide();
      $('.modalSubmitButton').hide();
      $('.modalDoneButton').show();
    };

    var errorCallBack = function(error){
      $('.alert').hide();
      var x = error.responseJSON.validation.keys[0];
      switch (x) {
        case 'user.screen_name':
          return $('#alertProfileName').show();
        case 'user.email':
          return $('#alertProfileEmail').show();
        case 'user.first_name':
          return $('#alertProfileFirstName').show();
        case 'user.last_name':
          return $('#alertProfileLastName').show();
      }
    };
    $.ajax({
      context: this,
      method:   'PUT',
      data:     payload,
      dataType: 'JSON',
      url:      '/users/' + userID,
      success:  successCallBack,
      error:    errorCallBack
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
  initialPrint.profileInfo();
  initialPrint.organisationsData();
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

  $('.joinOrganisationButton').click(function(){
    post.joinOrganisation($(this).data("id"));
  });

  var put = new Put();

  $('#profileSubmitButton').click(function() {
    $('.alert').hide();
    put.updateProfile({
      user: {
        screen_name:         $('#screenNameInput').val(),
        email:               $('#emailInput').val(),
        first_name:          $('#firstNameInput').val(),
        last_name:           $('#lastNameInput').val(),
      }
    });
  });

  $('.modalDoneButton').click(function(){
    window.location.reload();
  });

});
