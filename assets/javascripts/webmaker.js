Discourse.LoginView.reopen({
  didInsertElement: function() {
    this._super();
    var self = this;
    // Set a customLogin method on the persona login provider.
    Ember.get("Discourse.LoginMethod.all").forEach(function(loginMethod) {
      if (loginMethod.get("name") == "webmaker") {
        loginMethod.set("customLogin", function() {
          var webmakerAuthClient = new WebmakerAuthClient({
            paths: {
              authenticate: "/auth/webmaker/callback"
            }
          });
          webmakerAuthClient.on( "login", function(data) {
            Discourse.authenticationComplete(data);
          });
          webmakerAuthClient.on( "error", function(err) {
            Discourse.__container__.lookup("controller:login").flash(err, "error");
          });
          webmakerAuthClient.login();
        });
      }
    });
  }
});
