$(document).ready(function(){
  var Submit = function(userData) {
    this.userData = userData;
  };

  Submit.prototype.signupPost = function(){
    var successCallBack = function(reply){
      $('.alert').hide();
      if (reply.userExist) {
        return $('#alertSignupExists').show();
      }
      if (reply.ok === 1) {
        return this.signinPost();
      }
    };

    var errorCallBack = function(error){
      $('.alert').hide();
      var x = error.responseJSON.validation.keys[0];
      switch (x) {
        case 'user.screen_name':
          return $('#alertSignupName').show();
        case 'user.username':
          return $('#alertSignupUsername').show();
        case 'user.password':
          return $('#alertSignupPassword').show();
        case 'user.email':
          return $('#alertSignupEmail').show();
      }
    };
    $.ajax({
      context: this,
      method:   'POST',
      data:     {user: this.userData},
      dataType: 'JSON',
      url:      '/users',
      success:  successCallBack,
      error:    errorCallBack
    });
  };

  Submit.prototype.signinPost = function() {
    var successCallBack = function(reply){
      $('.alert').hide();
      if (reply.authorized) {
        return window.location.reload();
      }
      return $('#alertSigninIncorrect').show();
    };
    $.ajax({
      method:   'POST',
      data:     {user: this.userData},
      dataType: 'JSON',
      url:      '/sessions',
      success:  successCallBack,
    });
  };



  $('#signupForm').submit(function(e){
    e.preventDefault();
    var signup = new Submit(
      { screen_name: $('#signupFullnameInput').val(),
        username: $('#signupUsernameInput').val(),
        password: $('#signupPasswordInput').val(),
        email: $('#signupEmailInput').val()
      });
    signup.signupPost();
  });

  $('#signinForm').submit(function(e){
    e.preventDefault();
    var signin = new Submit(
      { username: $('#signinUsernameInput').val(),
        password: $('#signinPasswordInput').val()
      });
    signin.signinPost();
  });


});
