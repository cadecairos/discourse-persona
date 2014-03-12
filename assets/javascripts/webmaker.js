Discourse.LoginView.reopen({
  didInsertElement: function() {
    this._super();
    // Set a customLogin method on the persona login provider.
    Ember.get("Discourse.LoginMethod.all").forEach(function(loginMethod) {
      if (loginMethod.get("name") == "webmaker") {
        loginMethod.set("customLogin", function() {
          var webmakerAuthClient = new WebmakerAuthClient({
            discourse: true,
            paths: {
              authenticate: "/auth/webmaker/callback"
            }
          });
          webmakerAuthClient.on( "login", function(data) {
            Discourse.authenticationComplete(data);
          });
          webmakerAuthClient.login();
        });
      }
    });
  }
});

// TODO:
// configurable script locations && better script loading!!!!
$.getScript("https://login.persona.org/include.js", function() {
  $.getScript("http://localhost:7777/bower/webmaker-auth-client/dist/webmaker-auth-client.min.js");
});
