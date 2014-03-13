Discourse.LoginView.reopen({
  didInsertElement: function() {
    this._super();
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
          webmakerAuthClient.on( "error", function() {
            // TODO: figure out how to display an error in discourse
          })
          webmakerAuthClient.login();
        });
      }
    });
  }
});
