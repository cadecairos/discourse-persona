(function (window) {

  function webmakerAuthClientDefinition(EventEmitter) {

    return function WebmakerAuthClient(options) {
      var self = this;

      options = options || {};
      options.paths = options.paths || {};

      // For handling events
      self.emitter = new EventEmitter();

      // Config
      self.host = options.host || '';
      self.paths = options.paths || {};
      self.paths.authenticate = options.paths.authenticate || '/authenticate';
      self.paths.create = options.paths.create || '/create';
      self.paths.verify = options.paths.verify || '/verify';
      self.paths.logout = options.paths.logout || '/logout';
      self.paths.checkUsername = options.paths.checkUsername || '/check-username';
      self.urls = {
        authenticate: self.host + self.paths.authenticate
      };
      self.audience = options.audience || (window.location.protocol + "//" + window.location.host);
      self.prefix = options.prefix || 'webmaker-';
      self.timeout = options.timeout || 10;
      self.localStorageKey = self.prefix + 'login';
      self.csrfToken = options.csrfToken;
      // Needed when cookie-issuing server is on a different port than the client
      self.withCredentials = options.withCredentials === false ? false : true;

      self.on = function (event, cb) {
        self.emitter.addListener(event, cb);
      };

      self.off = function (event, cb) {
        self.emitter.removeListener(event, cb);
      };

      self.login = function () {

        if (!window.navigator.id) {
          console.error('No persona found. Did you include include.js?');
        }

        window.removeEventListener('focus', self.verify, false);

        window.navigator.id.get(function (assertion) {

          if (!assertion) {
            self.emitter.emitEvent('error', [
              'No assertion was received'
            ]);
            return;
          }

          var http = new XMLHttpRequest();
          var body = JSON.stringify({
            audience: self.audience,
            assertion: assertion
          });

          if (self.timeout) {
            var timeoutInstance = setTimeout(function () {
              self.emitter.emitEvent('error', [
                'The request for a token timed out after ' + self.timeout + ' seconds'
              ]);
            }, self.timeout * 1000);
          }

          http.open('POST', self.urls.authenticate, true);
          http.withCredentials = self.withCredentials;
          http.setRequestHeader('Content-type', 'application/json');
          http.setRequestHeader('X-CSRF-Token', self.csrfToken);
          http.setRequestHeader('Accept', 'application/json');
          http.onreadystatechange = function () {

            // Clear the timeout
            if (self.timeout && timeoutInstance) {
              clearTimeout(timeoutInstance);
            }

            if (http.readyState === 4 && http.status === 200) {
              var data = JSON.parse(http.responseText);

              // There was an error
              if (data.error) {
                self.emitter.emitEvent('error', [data.error]);
                return;
              }

              self.emitter.emitEvent('login', [data]);
            }

            // Some other error
            else if (http.readyState === 4 && http.status && (http.status >= 400 || http.status < 200)) {
              self.emitter.emitEvent('error', [http.responseText]);
            }

            // No response
            else if (http.readyState === 4) {
              self.emitter.emitEvent('error', ['Looks like ' + self.urls.authenticate + ' is not responding...']);
            }

          };

          http.send(body);

        }, {
          backgroundColor: "#E3EAEE",
          privacyPolicy: "https://webmaker.org/privacy",
          siteLogo: "https://stuff.webmaker.org/persona-assets/logo-webmaker.png",
          siteName: "Mozilla Webmaker",
          termsOfService: "https://webmaker.org/terms"
        });
      };
    };
  }

  // AMD
  if (typeof define === 'function' && define.amd) {
    define(['eventEmitter/EventEmitter'], webmakerAuthClientDefinition);
  }

  // Global
  else {
    window.WebmakerAuthClient = webmakerAuthClientDefinition(window.EventEmitter);
  }

})(window);
