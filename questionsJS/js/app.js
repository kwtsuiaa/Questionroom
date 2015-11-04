/*global angular */
/*jshint unused:false */
'use strict';

/**
* The main TodoMVC app module
* ngSanitize added
*
* @type {angular.Module}
*/
var todomvc = angular.module('todomvc', ['firebase', 'ngStorage', 'ngSanitize', 'ui.bootstrap', 'angular-smilies'])

.run(function($rootScope, Facebook) {

  $rootScope.Facebook = Facebook;

})

.factory('Facebook', function() {

    var self = this;
    this.auth = null;

    return {

      getAuth: function() {
        return self.auth;
      },

      login: function() {
        FB.login(function(response) {
          if (response.authResponse) {
            self.auth = response.authResponse;
          } else {
            console.log('Facebook login failed', response);
          }
        })
      },

      logout: function() {
        FB.logout(function(response) {
          if (response) {
            self.auth = null;
          } else {
            console.log('Facebook logout failed.', response);
          }
        })
      }
    
    }
  })

window.fbAsyncInit = function() {
  FB.init({
  	appId  : '1074795829199506',
    status : true, 
    cookie : true, 
    xfbml  : true,
    version: 'v2.5'
  });

  FB.ui({
  method: 'share',
  href: 'https://developers.facebook.com/docs/',
  }, function(response){});

};

// Load the SDK Asynchronously
(function(d){
    var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement('script'); js.id = id; js.async = true;
    js.src = "//connect.facebook.net/en_US/all.js";
    ref.parentNode.insertBefore(js, ref);
}(document));
