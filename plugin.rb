# name: discourse-webmaker-persona
# about: webmaker-auth login provider
# version: 0.1
# author: Christopher De Cairos

gem 'omniauth-webmaker', '0.0.6', require_name: 'omniauth-webmaker'

class WebmakerAuthenticator < ::Auth::Authenticator
  def name
    "webmaker"
  end

  def after_authenticate( auth_token )
    result = Auth::Result.new
    puts auth_token[:info][:email]
    result.email = email = auth_token[:info][:email]
    result.email_valid = true

    result.user = User.find_by_email(email)
    result
  end

  def register_middleware(omniauth)
    omniauth.provider :webmaker,
      login_server_url: SiteSetting.webmaker_server_url
  end
end

auth_provider authenticator: WebmakerAuthenticator.new

register_asset "javascripts/webmaker.js"

register_css <<CSS

.btn-social.webmaker {
  background: #606060 !important;
}

.btn-social.webmaker:before {
  content: "]";
}

CSS
