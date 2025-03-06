const express = require("express");
const passport = require("passport");
const Router = express.Router();
const jwt = require("jsonwebtoken");
const { userService } = require("../dependencies");
const { getOauth2Client } = require("../utils/helper");

Router.get(
  "/google/signin",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

Router.get("/anonymous/signin", async (req, res) => {
  const { user_id, token, username } = req.query;
  console.log(username)
  try {
    const response = await fetch("https://api.hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: process.env.HCAPTCHA_SECRET_KEY, response: token }),
    });

    const data = await response.json();
    console.log(data);
    const {isNew, user} = await userService.getOrCreateAnonymousUser(user_id, username);
    // TODO: IMP, do sth for new user login, like redirect to some introduction url rather than /chat/new
    const { id, email, name, pfp_url, user_name, provider } = user;
    const jwtToken = jwt.sign(
      { id, email, name, pfp_url, user_name, provider },
      process.env.JWT_SECRET,
      { expiresIn: "125h" }
    );
    
    console.log(jwtToken);
    // Set the token as a cookie
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 450000000,
    });
    res.redirect(`${process.env.FRONT_END_DOMAIN}/chat/new/`);

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error });
  }
});
Router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/google/signin",
  }),
  (req, res) => {
    // Generate JWT token
    const { id, email, name, pfp_url, user_name, provider } = req.user;
    const token = jwt.sign(
      { id, email, name, pfp_url, user_name, provider },
      process.env.JWT_SECRET,
      { expiresIn: "125h" }
    );
    // Set the token as a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 450000000,
    });
    res.redirect(`${process.env.FRONT_END_DOMAIN}/app/welcome`);
  }
);

Router.get("/google/services/callback", async (req, res) => {
  const { code, state } = req.query;
  if (!state) {
    res.send("Something went wrong, please try again...");
  }
  console.log(code);
  const { frontEndRedirectUrl, user_id } = JSON.parse(state); // Decode the original URL from the state

  const oauth2Client = getOauth2Client();
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log(res);
    console.log("TOKENS", tokens);
    console.log(await userService.upsertAuthTokens(user_id, tokens));
    res.redirect(frontEndRedirectUrl);
  } catch (error) {
    console.log("Error fetching token", error);
    res.redirect(frontEndRedirectUrl);
  }
});

// Step 3: Incremental Authorization for Calendar
Router.get("/google/services/calendar", (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const frontEndRedirectPath = req.query.redirect_path || "/app/welcome"; // Fallback to a default route
  const frontEndRedirectUrl = `${process.env.FRONT_END_DOMAIN}${frontEndRedirectPath}`;

  const oauth2Client = getOauth2Client();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar"],
    include_granted_scopes: true,
    redirect_uri: redirectUrl,
    state: JSON.stringify({ frontEndRedirectUrl, user_id }),
  });
  res.redirect(authUrl);
});

Router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

module.exports = Router;
