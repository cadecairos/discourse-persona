# name: discourse-webmaker-persona
# about: webmaker-auth login provider
# version: 0.1
# author: Christopher De Cairos

gem "omniauth-webmaker", "0.0.7", require_name: "omniauth-webmaker"

class WebmakerAuthenticator < ::Auth::Authenticator
  def name
    "webmaker"
  end

  def after_authenticate( auth_token )
    result = Auth::Result.new

    result.email = email = auth_token[:info][:email]
    result.email_valid = true
    result.user = User.find_by_email(email)

    result
  end

  def register_middleware(omniauth)
    omniauth.provider :webmaker,
      login_server_url: SiteSetting.webmaker_server_url

    omniauth.on_failure do |env|
      message_key = env["omniauth.error.type"]
      Rack::Response.new(["{\"error\": \"#{message_key}\"}"], 200, "Content-Type" => "application/json").finish
    end
  end
end

auth_provider authenticator: WebmakerAuthenticator.new

register_asset "javascripts/persona-include.js"
register_asset "javascripts/eventEmitter.js"
register_asset "javascripts/webmaker-auth-client.js"
register_asset "javascripts/webmaker.js"

register_css <<CSS

.btn-social.webmaker {
  background: #3FB58E !important;
}

.btn-social.webmaker:before {
  content: url("https://webmaker.org/img/favicon.ico");
  position: relative;
  top: 2px;
}

CSS
