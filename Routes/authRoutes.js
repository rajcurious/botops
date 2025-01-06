const express = require("express");
const { loginController, signUpController } = require("../controllers/auth");
const passport = require("passport");
const Router = express.Router();
const jwt = require('jsonwebtoken');

Router.get(
  "/google/signin",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
Router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/google/signin",
  }),
  (req, res) => {
    // Generate JWT token
    const {id, email, name, pfp_url, user_name, provider} = req.user;
    const token = jwt.sign({id, email, name, pfp_url, user_name, provider}, process.env.JWT_SECRET, { expiresIn: '11h' });
    // Set the token as a cookie
    res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'strict', maxAge:45000000 });
    res.redirect(`${process.env.FRONT_END_DOMAIN}/app/welcome`);
  }
);
Router.post("/login", loginController);
Router.post("/register", signUpController);
Router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

module.exports = Router;
