const { google } = require("googleapis");

const getOne = (list) => {
  if (list) {
    if (list.length > 0) {
      return list[0];
    }
    return null;
  }
  return null;
};

const getOauth2Client = (redirect_uri = null) => {
  const redirectUrl = redirect_uri ? redirect_uri : (
    process.env.STAGE === "dev"
      ? `${process.env.SERVER_DOMAIN}/auth/google/services/callback`
      : `${process.env.SERVER_DOMAIN}/api/auth/google/services/callback`);

  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUrl
  );
};

module.exports = { getOne, getOauth2Client };
